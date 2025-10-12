-- CREATE STUDENT_INQUIRIES TABLE IN YOUR CORRECT PROJECT
-- Run this in your Supabase SQL Editor (kumlliwulkwljbrlremp project)

-- 1. Drop table if exists
DROP TABLE IF EXISTS student_inquiries CASCADE;

-- 2. Create student_inquiries table
CREATE TABLE student_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    course_interest TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add foreign key constraint
ALTER TABLE student_inquiries 
ADD CONSTRAINT student_inquiries_institution_id_fkey 
FOREIGN KEY (institution_id) REFERENCES institution_profiles(user_id);

-- 4. Grant ALL permissions
GRANT ALL ON student_inquiries TO anon;
GRANT ALL ON student_inquiries TO authenticated;
GRANT ALL ON student_inquiries TO public;
GRANT ALL ON student_inquiries TO postgres;
GRANT ALL ON student_inquiries TO service_role;

-- 5. Enable RLS
ALTER TABLE student_inquiries ENABLE ROW LEVEL SECURITY;

-- 6. Create permissive RLS policy
CREATE POLICY "Allow all operations" ON student_inquiries
    FOR ALL USING (true) WITH CHECK (true);

-- 7. Test insert
INSERT INTO student_inquiries (
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'CORRECT PROJECT TEST',
    'test@correct.com',
    'Test Course',
    'Testing in correct project',
    'new'
) RETURNING id, institution_id, student_name, student_email, course_interest, message, status;

-- 8. Clean up
DELETE FROM student_inquiries WHERE student_name = 'CORRECT PROJECT TEST';

SELECT 'STUDENT_INQUIRIES TABLE CREATED IN CORRECT PROJECT!' as status;
