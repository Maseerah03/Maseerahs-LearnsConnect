-- Diagnose RLS policies for institution_student_enquiries table
-- Run this in your Supabase SQL editor

-- 1. Check RLS status (corrected query)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'institution_student_enquiries';

-- 2. Check existing RLS policies
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

-- 3. Check table permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'institution_student_enquiries';

-- 4. Test basic access (this should work if RLS allows it)
SELECT COUNT(*) as total_records FROM institution_student_enquiries;

-- 5. Check current user context
SELECT 
    current_user,
    session_user,
    current_database(),
    current_schema();

-- 6. Test insert capability (this is what's failing in your app)
-- This will show us if the issue is with INSERT permissions
SELECT 'Testing insert permissions...' as test_status;
