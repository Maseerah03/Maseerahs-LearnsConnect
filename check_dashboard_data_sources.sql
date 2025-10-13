-- Admin Dashboard Data Sources Check
-- Run this script in your Supabase SQL Editor to identify the correct data sources

-- ==========================================
-- STEP 1: CHECK ALL TABLE EXISTENCE
-- ==========================================
SELECT 'TABLE_EXISTENCE_CHECK' as section;

SELECT 
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.table_name) 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as status
FROM (VALUES 
    ('users'),
    ('public_users'),
    ('profiles'),
    ('tutor_profiles'),
    ('student_profiles'),
    ('institution_profiles'),
    ('courses'),
    ('institution_courses'),
    ('course_enrollments'),
    ('auth.users')
) AS t(table_name)
ORDER BY table_name;

-- ==========================================
-- STEP 2: CHECK RECORD COUNTS FOR EXISTING TABLES
-- ==========================================
SELECT 'RECORD_COUNTS' as section;

-- Check users table (if exists)
SELECT 
    'users' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
    COUNT(CASE WHEN role = 'tutor' THEN 1 END) as tutors,
    COUNT(CASE WHEN role = 'institution' THEN 1 END) as institutions
FROM users
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users');

-- Check public_users table (if exists)
SELECT 
    'public_users' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
    COUNT(CASE WHEN role = 'tutor' THEN 1 END) as tutors,
    COUNT(CASE WHEN role = 'institution' THEN 1 END) as institutions
FROM public_users
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'public_users');

-- Check profiles table (if exists)
SELECT 
    'profiles' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
    COUNT(CASE WHEN role = 'tutor' THEN 1 END) as tutors,
    COUNT(CASE WHEN role = 'institution' THEN 1 END) as institutions
FROM profiles
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles');

-- Check courses table (if exists)
SELECT 
    'courses' as table_name,
    COUNT(*) as total_records
FROM courses
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses');

-- Check institution_courses table (if exists)
SELECT 
    'institution_courses' as table_name,
    COUNT(*) as total_records
FROM institution_courses
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'institution_courses');

-- Check course_enrollments table (if exists)
SELECT 
    'course_enrollments' as table_name,
    COUNT(*) as total_records
FROM course_enrollments
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_enrollments');

-- ==========================================
-- STEP 3: CHECK TABLE STRUCTURES
-- ==========================================
SELECT 'TABLE_STRUCTURES' as section;

-- Check users table structure (if exists)
SELECT 
    'users' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check public_users table structure (if exists)
SELECT 
    'public_users' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'public_users'
ORDER BY ordinal_position;

-- Check profiles table structure (if exists)
SELECT 
    'profiles' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ==========================================
-- STEP 4: SAMPLE DATA FROM EXISTING TABLES
-- ==========================================
SELECT 'SAMPLE_DATA' as section;

-- Sample from users table (if exists)
SELECT 
    'users_sample' as source,
    id,
    email,
    role,
    created_at
FROM users
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
LIMIT 3;

-- Sample from public_users table (if exists)
SELECT 
    'public_users_sample' as source,
    id,
    email,
    role,
    created_at
FROM public_users
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'public_users')
LIMIT 3;

-- Sample from profiles table (if exists)
SELECT 
    'profiles_sample' as source,
    user_id,
    full_name,
    email,
    role,
    created_at
FROM profiles
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
LIMIT 3;

-- Sample from courses table (if exists)
SELECT 
    'courses_sample' as source,
    id,
    title,
    tutor_id,
    created_at
FROM courses
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses')
LIMIT 3;

-- Sample from institution_courses table (if exists)
SELECT 
    'institution_courses_sample' as source,
    id,
    title,
    institution_id,
    created_at
FROM institution_courses
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'institution_courses')
LIMIT 3;

-- Sample from course_enrollments table (if exists)
SELECT 
    'course_enrollments_sample' as source,
    id,
    course_id,
    student_id,
    status,
    enrolled_at
FROM course_enrollments
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_enrollments')
LIMIT 3;

-- ==========================================
-- STEP 5: CHECK AUTH.USERS (SUPABASE AUTH)
-- ==========================================
SELECT 'AUTH_USERS_CHECK' as section;

-- Check if we can access auth.users (this might be restricted)
SELECT 
    'auth_users' as table_name,
    COUNT(*) as total_records
FROM auth.users;

-- ==========================================
-- STEP 6: SUMMARY FOR DASHBOARD IMPLEMENTATION
-- ==========================================
SELECT 'DASHBOARD_IMPLEMENTATION_SUMMARY' as section;

-- This will show us exactly what we need to implement
SELECT 
    'SUMMARY' as info,
    'Run this script and provide the output to implement the dashboard correctly' as instruction;
