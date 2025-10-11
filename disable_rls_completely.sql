-- Completely disable RLS on institution_profiles for testing
-- Run this in your Supabase SQL editor

-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'institution_profiles';

-- Disable RLS completely
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

-- Count total institutions
SELECT COUNT(*) as total_institutions FROM institution_profiles;

-- Success message
SELECT 'RLS completely disabled! The ContactInstitutions section should now work.' as status;

-- IMPORTANT: After testing, re-enable RLS with:
-- ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;
-- Then recreate the permissive policy:
-- CREATE POLICY "Allow all public access" ON institution_profiles FOR ALL USING (true) WITH CHECK (true);
