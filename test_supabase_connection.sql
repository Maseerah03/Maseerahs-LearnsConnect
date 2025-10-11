-- Test Supabase connection and basic queries
-- Run this in your Supabase SQL editor

-- Test 1: Basic table access
SELECT 'Test 1: Basic table access' as test_name;
SELECT COUNT(*) as total_institutions FROM institution_profiles;

-- Test 2: Specific institution query
SELECT 'Test 2: Specific institution query' as test_name;
SELECT 
    id,
    institution_name,
    verified,
    status
FROM institution_profiles 
WHERE institution_name = 'Global Learning Academy';

-- Test 3: All institutions query
SELECT 'Test 3: All institutions query' as test_name;
SELECT 
    id,
    institution_name,
    verified,
    status,
    user_id
FROM institution_profiles
ORDER BY created_at DESC;

-- Test 4: Check RLS status
SELECT 'Test 4: RLS status check' as test_name;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'institution_profiles';

-- Test 5: Check current policies
SELECT 'Test 5: Current policies' as test_name;
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'institution_profiles';

-- Final result
SELECT 'All tests completed - check results above' as final_status;
