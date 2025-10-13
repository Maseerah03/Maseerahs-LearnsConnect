-- Debug script to check user profile data structure and content
-- Run these queries in Supabase SQL Editor to understand the data

-- 1. Check all available tables related to profiles
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename LIKE '%profile%' 
   OR tablename LIKE '%user%'
   OR tablename = 'profiles'
ORDER BY tablename;

-- 2. Check profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check tutor_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tutor_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check institution_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institution_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check student_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check sample data from profiles table
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
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Check sample data from tutor_profiles table
SELECT 
    user_id,
    experience,
    qualifications,
    subjects,
    teaching_mode,
    hourly_rate,
    availability,
    languages,
    achievements,
    rating,
    reviews_count,
    created_at,
    updated_at
FROM tutor_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Check sample data from institution_profiles table
SELECT 
    user_id,
    experience,
    qualifications,
    subjects,
    languages,
    rating,
    reviews_count,
    created_at,
    updated_at
FROM institution_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 9. Check sample data from student_profiles table
SELECT 
    user_id,
    grade_level,
    learning_goals,
    subjects,
    created_at,
    updated_at
FROM student_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 10. Check relationships between profiles and role-specific tables
SELECT 
    p.user_id,
    p.full_name,
    p.role,
    CASE 
        WHEN p.role = 'tutor' THEN (SELECT COUNT(*) FROM tutor_profiles tp WHERE tp.user_id = p.user_id)
        WHEN p.role = 'institution' THEN (SELECT COUNT(*) FROM institution_profiles ip WHERE ip.user_id = p.user_id)
        WHEN p.role = 'student' THEN (SELECT COUNT(*) FROM student_profiles sp WHERE sp.user_id = p.user_id)
        ELSE 0
    END as role_profile_count
FROM profiles p
ORDER BY p.created_at DESC;
