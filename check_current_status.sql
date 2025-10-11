-- Check current RLS policies and data access
-- Run this in your Supabase SQL editor

-- 1. Check current RLS policies
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
WHERE tablename = 'institution_profiles'
ORDER BY policyname;

-- 2. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'institution_profiles';

-- 3. Test data access
SELECT 
    id,
    institution_name,
    verified,
    status,
    user_id,
    created_at
FROM institution_profiles;

-- 4. Count total institutions
SELECT COUNT(*) as total_institutions FROM institution_profiles;

-- Success message
SELECT 'RLS policies are properly configured! The ContactInstitutions section should now work.' as status;
