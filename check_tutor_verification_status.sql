-- Check verification status of all tutors
SELECT 
    user_id,
    full_name,
    verified,
    is_verified,
    is_active,
    created_at
FROM tutor_profiles 
ORDER BY created_at DESC;
