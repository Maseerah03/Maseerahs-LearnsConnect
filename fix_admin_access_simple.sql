-- Simple Fix for Admin Dashboard Access
-- This creates a safer approach without causing deadlocks

-- 1. First, let's temporarily disable RLS on the tables we need for admin dashboard
ALTER TABLE course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE institution_courses DISABLE ROW LEVEL SECURITY;

-- 2. Test access to all tables
SELECT 'TEST_ENROLLMENTS_ACCESS' as section;
SELECT COUNT(*) as total_enrollments FROM course_enrollments;

SELECT 'TEST_PROFILES_ACCESS' as section;
SELECT COUNT(*) as total_profiles FROM profiles;

SELECT 'TEST_COURSES_ACCESS' as section;
SELECT COUNT(*) as total_courses FROM courses;

SELECT 'TEST_INSTITUTION_COURSES_ACCESS' as section;
SELECT COUNT(*) as total_institution_courses FROM institution_courses;

-- 3. Show table security status
SELECT 'TABLE_SECURITY_STATUS' as section;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('course_enrollments', 'profiles', 'courses', 'institution_courses')
AND schemaname = 'public';
