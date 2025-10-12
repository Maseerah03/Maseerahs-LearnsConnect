-- FINAL DEBUG APPROACH - Let's check everything systematically
-- Run this in your Supabase SQL Editor

-- 1. Check if we're in the right project
SELECT 'PROJECT CHECK' as test;
SELECT current_database(), current_user, current_schema();

-- 2. Check if the table actually exists in this project
SELECT 'TABLE EXISTENCE' as test;
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'student_inquiries';

-- 3. Check if there are any other similar tables
SELECT 'SIMILAR TABLES' as test;
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename LIKE '%inquir%' OR tablename LIKE '%enquir%';

-- 4. Check the exact table structure
SELECT 'TABLE STRUCTURE' as test;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_inquiries' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check if there are any RLS policies blocking access
SELECT 'RLS POLICIES' as test;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'student_inquiries';

-- 6. Check permissions
SELECT 'PERMISSIONS' as test;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'student_inquiries' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 7. Try to insert directly (this should work if table exists)
SELECT 'DIRECT INSERT TEST' as test;
INSERT INTO student_inquiries (
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'FINAL DEBUG TEST',
    'debug@test.com',
    'Debug Course',
    'Testing direct insert',
    'new'
) RETURNING id, institution_id, student_name, student_email, course_interest, message, status;

-- 8. Clean up
DELETE FROM student_inquiries WHERE student_name = 'FINAL DEBUG TEST';

SELECT 'DEBUG COMPLETE - CHECK ALL RESULTS ABOVE' as status;
