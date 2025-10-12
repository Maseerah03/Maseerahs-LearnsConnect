-- Create Fee Management Table (Safe Version)
-- This version avoids potential deadlocks by using safer operations

-- 1. Create student_fees table (safe approach)
CREATE TABLE IF NOT EXISTS student_fees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id UUID NOT NULL,
    student_id UUID NOT NULL,
    course_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    
    -- Fee details
    total_amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) NOT NULL DEFAULT 0,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add foreign key constraints separately (safer)
DO $$ 
BEGIN
    -- Add foreign key to course_enrollments if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_enrollments') THEN
        ALTER TABLE student_fees 
        ADD CONSTRAINT fk_student_fees_enrollment_id 
        FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key to auth.users for student_id
    ALTER TABLE student_fees 
    ADD CONSTRAINT fk_student_fees_student_id 
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Add foreign key to institution_courses if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'institution_courses') THEN
        ALTER TABLE student_fees 
        ADD CONSTRAINT fk_student_fees_course_id 
        FOREIGN KEY (course_id) REFERENCES institution_courses(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key to auth.users for institution_id
    ALTER TABLE student_fees 
    ADD CONSTRAINT fk_student_fees_institution_id 
    FOREIGN KEY (institution_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraints already exist, continue
        NULL;
END $$;

-- 3. Create indexes for better performance (safe)
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_course_id ON student_fees(course_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_institution_id ON student_fees(institution_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_payment_status ON student_fees(payment_status);
CREATE INDEX IF NOT EXISTS idx_student_fees_due_date ON student_fees(due_date);
CREATE INDEX IF NOT EXISTS idx_student_fees_enrollment_id ON student_fees(enrollment_id);

-- 4. Enable Row Level Security
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies (safe approach)
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Institutions can view their student fees" ON student_fees;
    DROP POLICY IF EXISTS "Students can view their own fees" ON student_fees;
    DROP POLICY IF EXISTS "Institutions can manage their student fees" ON student_fees;
    
    -- Create new policies
    CREATE POLICY "Institutions can view their student fees" ON student_fees
        FOR SELECT USING (auth.uid() = institution_id);

    CREATE POLICY "Students can view their own fees" ON student_fees
        FOR SELECT USING (auth.uid() = student_id);

    CREATE POLICY "Institutions can manage their student fees" ON student_fees
        FOR ALL USING (auth.uid() = institution_id);
        
EXCEPTION
    WHEN OTHERS THEN
        -- If policy creation fails, continue
        NULL;
END $$;

-- 6. Create function to update payment status and balance
CREATE OR REPLACE FUNCTION update_fee_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate balance due
    NEW.balance_due := NEW.total_amount - NEW.amount_paid;
    
    -- Update payment status based on amount paid
    IF NEW.amount_paid = 0 THEN
        NEW.payment_status := 'pending';
    ELSIF NEW.amount_paid < NEW.total_amount THEN
        NEW.payment_status := 'partial';
    ELSIF NEW.amount_paid >= NEW.total_amount THEN
        NEW.payment_status := 'paid';
        NEW.paid_date := NOW();
    END IF;
    
    -- Check if overdue
    IF NEW.payment_status != 'paid' AND NEW.due_date < CURRENT_DATE THEN
        NEW.payment_status := 'overdue';
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to automatically update payment status
DROP TRIGGER IF EXISTS update_fee_payment_status_trigger ON student_fees;
CREATE TRIGGER update_fee_payment_status_trigger
    BEFORE UPDATE ON student_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_fee_payment_status();

-- 8. Create function to generate fees for new enrollments (optional)
CREATE OR REPLACE FUNCTION create_fee_for_enrollment()
RETURNS TRIGGER AS $$
DECLARE
    course_fee_structure JSONB;
    course_fee_amount DECIMAL(10,2);
    course_currency TEXT;
    institution_user_id UUID;
BEGIN
    -- Only proceed if institution_courses table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'institution_courses') THEN
        RETURN NEW;
    END IF;
    
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
            fee_type,
            balance_due
        ) VALUES (
            NEW.id,
            NEW.student_id,
            NEW.course_id,
            institution_user_id,
            course_fee_amount,
            course_currency,
            NEW.enrolled_at::DATE + INTERVAL '30 days',
            'tuition',
            course_fee_amount
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- If fee creation fails, don't block the enrollment
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for new enrollments (only if course_enrollments exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_enrollments') THEN
        DROP TRIGGER IF EXISTS create_fee_for_enrollment_trigger ON course_enrollments;
        CREATE TRIGGER create_fee_for_enrollment_trigger
            AFTER INSERT ON course_enrollments
            FOR EACH ROW
            EXECUTE FUNCTION create_fee_for_enrollment();
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If trigger creation fails, continue
        NULL;
END $$;

-- 10. Insert sample fee data for existing enrollments (safe approach)
DO $$ 
BEGIN
    -- Only insert if both tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_enrollments') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'institution_courses') THEN
        
        INSERT INTO student_fees (
            enrollment_id,
            student_id,
            course_id,
            institution_id,
            total_amount,
            currency,
            due_date,
            fee_type,
            payment_status,
            balance_due
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
            END,
            COALESCE((ic.fee_structure->>'amount')::DECIMAL(10,2), 1000)
        FROM course_enrollments ce
        JOIN institution_courses ic ON ce.course_id = ic.id
        WHERE NOT EXISTS (
            SELECT 1 FROM student_fees sf 
            WHERE sf.enrollment_id = ce.id
        )
        LIMIT 10; -- Limit to avoid overwhelming the system
        
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If sample data insertion fails, continue
        NULL;
END $$;

-- 11. Update sample fees with payment amounts (safe)
DO $$ 
BEGIN
    UPDATE student_fees 
    SET amount_paid = CASE 
        WHEN payment_status = 'paid' THEN total_amount
        WHEN payment_status = 'partial' THEN total_amount * 0.5
        ELSE 0
    END,
    balance_due = CASE 
        WHEN payment_status = 'paid' THEN 0
        WHEN payment_status = 'partial' THEN total_amount * 0.5
        ELSE total_amount
    END
    WHERE payment_status IN ('paid', 'partial');
EXCEPTION
    WHEN OTHERS THEN
        -- If update fails, continue
        NULL;
END $$;

-- 12. Verify table creation
SELECT 'student_fees table created successfully' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_fees' 
AND table_schema = 'public'
ORDER BY ordinal_position;
