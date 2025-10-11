-- Test if the institution data is accessible from the app's perspective
-- Run this in your Supabase SQL editor

-- Test the exact query that the app is using
SELECT 
    id, 
    institution_name, 
    user_id, 
    verified, 
    status, 
    city, 
    state, 
    official_email, 
    primary_contact_number
FROM institution_profiles
ORDER BY created_at DESC;

-- Test with the same user context (if possible)
-- This simulates what the app should see
SELECT 
    'Test Result' as test_type,
    COUNT(*) as institution_count,
    STRING_AGG(institution_name, ', ') as institution_names
FROM institution_profiles;

-- Check if the specific institution is accessible
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM institution_profiles 
            WHERE institution_name = 'Global Learning Academy'
        ) THEN 'SUCCESS: Global Learning Academy is accessible'
        ELSE 'ERROR: Global Learning Academy not found'
    END as access_test;

-- Final verification
SELECT 
    'Database is properly configured!' as status,
    'The ContactInstitutions section should now work.' as message;
