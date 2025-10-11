-- Verify institution data is accessible
-- Run this in your Supabase SQL editor

-- Check all institution data
SELECT 
    id,
    institution_name,
    verified,
    status,
    user_id,
    city,
    state,
    official_email,
    primary_contact_number,
    created_at
FROM institution_profiles
ORDER BY created_at DESC;

-- Check if the specific institution exists
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'Global Learning Academy found!'
        ELSE 'Global Learning Academy not found'
    END as institution_status
FROM institution_profiles 
WHERE institution_name = 'Global Learning Academy';

-- Check verification status
SELECT 
    institution_name,
    verified,
    status,
    CASE 
        WHEN verified = true THEN 'This institution is verified and should be visible'
        ELSE 'This institution is not verified but should still be visible due to RLS policy'
    END as visibility_status
FROM institution_profiles 
WHERE institution_name = 'Global Learning Academy';

-- Success message
SELECT 'Institution data verification complete!' as status;
