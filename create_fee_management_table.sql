-- Create Fee Management Table
-- This table integrates with existing institution_courses, course_enrollments, and profiles tables

-- 1. Create student_fees table
CREATE TABLE IF NOT EXISTS student_fees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES institution_courses(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Fee details
    total_amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
    currency TEXT NOT NULL DEFAULT 'INR',
    
    -- Payment status
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
    due_date DATE NOT NULL,
    paid_date TIMESTAMP WITH TIME ZONE,
    
    -- Additional details
    fee_type TEXT DEFAULT 'tuition',
    payment_method TEXT,
    transaction_id TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one fee record per enrollment
    UNIQUE(enrollment_id)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_course_id ON student_fees(course_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_institution_id ON student_fees(institution_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_payment_status ON student_fees(payment_status);
CREATE INDEX IF NOT EXISTS idx_student_fees_due_date ON student_fees(due_date);

-- 3. Enable Row Level Security
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Institutions can view their student fees" ON student_fees;
DROP POLICY IF EXISTS "Students can view their own fees" ON student_fees;
DROP POLICY IF EXISTS "Institutions can manage their student fees" ON student_fees;

-- Institutions can view fees for their courses
CREATE POLICY "Institutions can view their student fees" ON student_fees
    FOR SELECT USING (auth.uid() = institution_id);

-- Students can view their own fees
CREATE POLICY "Students can view their own fees" ON student_fees
    FOR SELECT USING (auth.uid() = student_id);

-- Institutions can manage fees for their courses
CREATE POLICY "Institutions can manage their student fees" ON student_fees
    FOR ALL USING (auth.uid() = institution_id);

-- 5. Create function to update payment status automatically
CREATE OR REPLACE FUNCTION update_fee_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update payment status based on amount paid
    IF NEW.amount_paid = 0 THEN
        NEW.payment_status = 'pending';
    ELSIF NEW.amount_paid < NEW.total_amount THEN
        NEW.payment_status = 'partial';
    ELSIF NEW.amount_paid >= NEW.total_amount THEN
        NEW.payment_status = 'paid';
        NEW.paid_date = NOW();
    END IF;
    
    -- Check if overdue
    IF NEW.payment_status != 'paid' AND NEW.due_date < CURRENT_DATE THEN
        NEW.payment_status = 'overdue';
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to automatically update payment status
CREATE TRIGGER update_fee_payment_status_trigger
    BEFORE UPDATE ON student_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_fee_payment_status();

-- 7. Create function to generate fees for new enrollments
CREATE OR REPLACE FUNCTION create_fee_for_enrollment()
RETURNS TRIGGER AS $$
DECLARE
    course_fee_structure JSONB;
    course_fee_amount DECIMAL(10,2);
    course_currency TEXT;
    institution_user_id UUID;
BEGIN
    -- Get course fee structure and institution ID
    SELECT ic.fee_structure, ic.institution_id
    INTO course_fee_structure, institution_user_id
    FROM institution_courses ic
    WHERE ic.id = NEW.course_id;
    
    -- Extract fee amount and currency
    course_fee_amount := (course_fee_structure->>'amount')::DECIMAL(10,2);
    course_currency := COALESCE(course_fee_structure->>'currency', 'INR');
    
    -- Only create fee if amount is greater than 0
    IF course_fee_amount > 0 THEN
        INSERT INTO student_fees (
            enrollment_id,
            student_id,
            course_id,
            institution_id,
            total_amount,
            currency,
            due_date,
            fee_type
        ) VALUES (
            NEW.id,
            NEW.student_id,
            NEW.course_id,
            institution_user_id,
            course_fee_amount,
            course_currency,
            NEW.enrolled_at::DATE + INTERVAL '30 days', -- Due 30 days after enrollment
            'tuition'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to automatically create fees for new enrollments
CREATE TRIGGER create_fee_for_enrollment_trigger
    AFTER INSERT ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION create_fee_for_enrollment();

-- 9. Insert sample fee data for existing enrollments (if any)
INSERT INTO student_fees (
    enrollment_id,
    student_id,
    course_id,
    institution_id,
    total_amount,
    currency,
    due_date,
    fee_type,
    payment_status
)
SELECT 
    ce.id,
    ce.student_id,
    ce.course_id,
    ic.institution_id,
    COALESCE((ic.fee_structure->>'amount')::DECIMAL(10,2), 1000),
    COALESCE(ic.fee_structure->>'currency', 'INR'),
    ce.enrolled_at::DATE + INTERVAL '30 days',
    'tuition',
    CASE 
        WHEN RANDOM() > 0.7 THEN 'paid'
        WHEN RANDOM() > 0.5 THEN 'partial'
        ELSE 'pending'
    END
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
WHERE NOT EXISTS (
    SELECT 1 FROM student_fees sf 
    WHERE sf.enrollment_id = ce.id
);

-- 10. Update some sample fees with payment amounts
UPDATE student_fees 
SET amount_paid = CASE 
    WHEN payment_status = 'paid' THEN total_amount
    WHEN payment_status = 'partial' THEN total_amount * 0.5
    ELSE 0
END
WHERE payment_status IN ('paid', 'partial');

-- 11. Verify table creation
SELECT 'student_fees table created successfully' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_fees' 
AND table_schema = 'public';
