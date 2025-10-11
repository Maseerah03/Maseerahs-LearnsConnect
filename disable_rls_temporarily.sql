-- Temporarily disable RLS on institution_profiles for testing
-- Run this in your Supabase SQL editor

-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'institution_profiles';

-- Disable RLS temporarily
ALTER TABLE institution_profiles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'institution_profiles';

-- Test query to see all institutions
SELECT 
    id,
    institution_name,
    verified,
    status,
    user_id,
    created_at
FROM institution_profiles;

-- Success message
SELECT 'RLS disabled temporarily. You can now test the ContactInstitutions section!' as status;

-- IMPORTANT: Remember to re-enable RLS after testing:
-- ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;
