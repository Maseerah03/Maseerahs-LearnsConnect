-- Create student_inquiries table as alternative (as suggested by the error)
-- Run this in your Supabase SQL Editor if the above doesn't work

-- 1. Check if student_inquiries table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'student_inquiries';

-- 2. Create student_inquiries table with same structure
CREATE TABLE IF NOT EXISTS student_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    course_interest TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add foreign key constraint
ALTER TABLE student_inquiries 
ADD CONSTRAINT student_inquiries_institution_id_fkey 
FOREIGN KEY (institution_id) REFERENCES institution_profiles(user_id) ON DELETE CASCADE;

-- 4. Enable RLS
ALTER TABLE student_inquiries ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Allow anyone to create inquiries" ON student_inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Institutions can view their inquiries" ON student_inquiries
    FOR SELECT USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Institutions can update their inquiries" ON student_inquiries
    FOR UPDATE USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 6. Grant permissions
GRANT ALL ON student_inquiries TO anon;
GRANT ALL ON student_inquiries TO authenticated;
GRANT ALL ON student_inquiries TO public;

-- 7. Verify table was created
SELECT 'student_inquiries table created successfully!' as status;
