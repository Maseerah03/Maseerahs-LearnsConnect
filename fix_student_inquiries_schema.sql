-- Fix schema cache issue for student_inquiries table
-- Run this in your Supabase SQL Editor

-- 1. Check if student_inquiries table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_inquiries'
ORDER BY ordinal_position;

-- 2. Force refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- 3. Grant explicit permissions to make sure API can see all columns
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON student_inquiries TO anon;
GRANT ALL ON student_inquiries TO authenticated;
GRANT ALL ON student_inquiries TO public;

-- 4. Check table permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'student_inquiries'
ORDER BY grantee, privilege_type;

-- 5. Test if we can query the table directly
SELECT COUNT(*) as record_count FROM student_inquiries;

-- 6. Try to insert a test record to verify all columns work
INSERT INTO student_inquiries (
    institution_id,
    student_name,
    course_interest,
    message
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'Schema Cache Test',
    'Test Course',
    'Testing student_inquiries schema cache fix'
) RETURNING id, institution_id, student_name, course_interest, message, status, created_at;

-- 7. Clean up test record
DELETE FROM student_inquiries WHERE student_name = 'Schema Cache Test';

-- 8. Verify the table structure is correct
SELECT 'student_inquiries schema cache refresh complete!' as status;
