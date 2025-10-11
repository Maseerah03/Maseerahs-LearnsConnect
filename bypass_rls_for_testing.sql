-- Temporarily bypass RLS for testing ContactInstitutions
-- Run this in your Supabase SQL editor

-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'institution_profiles';

-- Temporarily disable RLS for testing
ALTER TABLE institution_profiles DISABLE ROW LEVEL SECURITY;

-- Test query to see all institutions
SELECT 
    id,
    institution_name,
    verified,
    status,
    created_at
FROM institution_profiles;

-- Re-enable RLS after testing
-- ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS temporarily disabled for testing. Remember to re-enable it after testing!' as status;
