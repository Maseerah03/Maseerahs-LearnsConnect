-- Fix schema cache issue for institution_student_enquiries
-- Run this in your Supabase SQL Editor

-- 1. First, let's check what tables actually exist that are similar
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name LIKE '%enquir%' OR table_name LIKE '%inquir%'
ORDER BY table_name;

-- 2. Check if there's a student_inquiries table (as suggested by the error)
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'student_inquiries';

-- 3. Force refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- 4. Check if the table is visible to the API
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'institution_student_enquiries';

-- 5. Grant explicit permissions to make sure API can see it
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON institution_student_enquiries TO anon;
GRANT ALL ON institution_student_enquiries TO authenticated;
GRANT ALL ON institution_student_enquiries TO public;

-- 6. Check table permissions again
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'institution_student_enquiries'
ORDER BY grantee, privilege_type;

-- 7. Test if we can query the table directly
SELECT COUNT(*) as record_count FROM institution_student_enquiries;

-- 8. Try to insert a test record
INSERT INTO institution_student_enquiries (
    institution_id,
    student_name,
    course_interest,
    message
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'Schema Cache Test',
    'Test Course',
    'Testing schema cache fix'
) RETURNING id;

-- 9. Clean up test record
DELETE FROM institution_student_enquiries WHERE student_name = 'Schema Cache Test';

SELECT 'Schema cache refresh and permissions update complete!' as status;
