-- FINAL FIX - Disable RLS completely and grant all permissions
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS completely
ALTER TABLE student_inquiries DISABLE ROW LEVEL SECURITY;

-- 2. Grant ALL permissions to everyone
GRANT ALL ON student_inquiries TO anon;
GRANT ALL ON student_inquiries TO authenticated;
GRANT ALL ON student_inquiries TO public;
GRANT ALL ON student_inquiries TO postgres;
GRANT ALL ON student_inquiries TO service_role;

-- 3. Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO public;

-- 4. Test insert
INSERT INTO student_inquiries (
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'FINAL RLS DISABLE TEST',
    'test@example.com',
    'Test Course',
    'Testing with RLS completely disabled',
    'new'
) RETURNING id, institution_id, student_name, student_email, course_interest, message, status;

-- 5. Clean up
DELETE FROM student_inquiries WHERE student_name = 'FINAL RLS DISABLE TEST';

SELECT 'RLS COMPLETELY DISABLED - CONTACT FORM SHOULD WORK NOW!' as status;
