-- Debug script to check the real tutor (f7783d23) data
-- This will help us understand why it's showing as "Tutor f7783d23" instead of the actual name

-- 1. Check the tutor_profiles table for this user
SELECT 
    user_id,
    full_name,
    bio,
    experience_years,
    teaching_mode,
    subjects,
    created_at
FROM tutor_profiles 
WHERE user_id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82';

-- 2. Check the profiles table for this user
SELECT 
    user_id,
    full_name,
    email,
    role,
    city,
    area,
    profile_photo_url,
    created_at
FROM profiles 
WHERE user_id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82';

-- 3. Check the auth.users table for this user
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82';

-- 4. Check if there are any other entries with similar user_id
SELECT 
    user_id,
    full_name,
    'tutor_profiles' as table_name
FROM tutor_profiles 
WHERE user_id LIKE '%f7783d23%'
UNION ALL
SELECT 
    user_id,
    full_name,
    'profiles' as table_name
FROM profiles 
WHERE user_id LIKE '%f7783d23%';

-- 5. Count total tutors vs dummy tutors
SELECT 
    'Total tutor_profiles' as description,
    COUNT(*) as count
FROM tutor_profiles
UNION ALL
SELECT 
    'Tutors with full_name' as description,
    COUNT(*) as count
FROM tutor_profiles 
WHERE full_name IS NOT NULL AND full_name != ''
UNION ALL
SELECT 
    'Tutors without full_name' as description,
    COUNT(*) as count
FROM tutor_profiles 
WHERE full_name IS NULL OR full_name = '';

-- 6. Show sample of tutors with and without full_name
SELECT 
    'Tutors WITH full_name (first 5)' as sample_type,
    user_id,
    full_name,
    subjects
FROM tutor_profiles 
WHERE full_name IS NOT NULL AND full_name != ''
LIMIT 5
UNION ALL
SELECT 
    'Tutors WITHOUT full_name (first 5)' as sample_type,
    user_id,
    COALESCE(full_name, 'NULL') as full_name,
    subjects
FROM tutor_profiles 
WHERE full_name IS NULL OR full_name = ''
LIMIT 5;
