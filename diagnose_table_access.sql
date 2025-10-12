-- Diagnose institution_student_enquiries table access issues
-- Run this in your Supabase SQL editor

-- 1. Check if table exists and its basic info
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name = 'institution_student_enquiries';

-- 2. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institution_student_enquiries'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls
FROM pg_tables 
WHERE tablename = 'institution_student_enquiries';

-- 4. Check existing RLS policies
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'institution_student_enquiries'
ORDER BY policyname;

-- 5. Check table permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'institution_student_enquiries';

-- 6. Test basic access (this should work if RLS allows it)
SELECT COUNT(*) as total_records FROM institution_student_enquiries;

-- 7. Check if we can insert a test record
INSERT INTO institution_student_enquiries (
    institution_id,
    student_name,
    course_interest,
    message
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'Test Student',
    'Test Course',
    'Test message'
) RETURNING id;

-- 8. Clean up test record
DELETE FROM institution_student_enquiries WHERE student_name = 'Test Student';

-- 9. Check current user context
SELECT 
    current_user,
    session_user,
    current_database(),
    current_schema();

-- 10. Check if table is accessible via API
SELECT 'Table access diagnostic complete' as status;
