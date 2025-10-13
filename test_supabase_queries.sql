-- Test queries to verify Supabase data access
-- Run these to check if the admin can access the data

-- 1. Test basic profiles access
SELECT COUNT(*) as total_profiles FROM profiles;

-- 2. Test role-specific profile access
SELECT 
    role,
    COUNT(*) as count
FROM profiles 
GROUP BY role;

-- 3. Test tutor profiles access
SELECT COUNT(*) as total_tutor_profiles FROM tutor_profiles;

-- 4. Test institution profiles access
SELECT COUNT(*) as total_institution_profiles FROM institution_profiles;

-- 5. Test student profiles access
SELECT COUNT(*) as total_student_profiles FROM student_profiles;

-- 6. Test join query (this is what the frontend should use)
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.role,
    p.phone,
    p.bio,
    p.location,
    p.verification_status,
    p.profile_completion,
    p.created_at,
    p.updated_at
FROM profiles p
ORDER BY p.created_at DESC
LIMIT 3;

-- 7. Test with role-specific data (simplified version)
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.role,
    p.phone,
    p.bio,
    p.location,
    p.verification_status,
    p.profile_completion,
    p.created_at,
    p.updated_at,
    tp.experience,
    tp.qualifications,
    tp.subjects,
    tp.hourly_rate
FROM profiles p
LEFT JOIN tutor_profiles tp ON p.user_id = tp.user_id
WHERE p.role = 'tutor'
LIMIT 3;

-- 8. Check if verification_status column exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'verification_status';

-- 9. Check if profile_completion column exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'profile_completion';

-- 10. Sample data with all fields
SELECT 
    user_id,
    full_name,
    email,
    role,
    phone,
    bio,
    location,
    verification_status,
    profile_completion,
    created_at,
    updated_at
FROM profiles 
WHERE user_id IN (
    SELECT user_id FROM profiles LIMIT 3
);
