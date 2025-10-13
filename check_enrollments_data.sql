-- Check Course Enrollments Data
-- Run this to see what's in the course_enrollments table

-- 1. Check if course_enrollments table has any data
SELECT 'COURSE_ENROLLMENTS_COUNT' as section;
SELECT COUNT(*) as total_enrollments FROM course_enrollments;

-- 2. Show sample data from course_enrollments (if any exists)
SELECT 'COURSE_ENROLLMENTS_SAMPLE' as section;
SELECT 
    id,
    course_id,
    student_id,
    status,
    enrolled_at,
    created_at
FROM course_enrollments
LIMIT 5;

-- 3. Check the structure of course_enrollments table
SELECT 'COURSE_ENROLLMENTS_STRUCTURE' as section;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'course_enrollments'
ORDER BY ordinal_position;

-- 4. Check if there are any courses that could have enrollments
SELECT 'AVAILABLE_COURSES' as section;
SELECT 
    'tutor_courses' as course_type,
    COUNT(*) as count
FROM courses
UNION ALL
SELECT 
    'institution_courses' as course_type,
    COUNT(*) as count
FROM institution_courses;

-- 5. Show sample courses (if any exist)
SELECT 'SAMPLE_COURSES' as section;
SELECT 
    'tutor_course' as type,
    id,
    title,
    tutor_id
FROM courses
LIMIT 3
UNION ALL
SELECT 
    'institution_course' as type,
    id,
    title,
    institution_id
FROM institution_courses
LIMIT 3;

-- 6. Check if there are any students in profiles that could enroll
SELECT 'AVAILABLE_STUDENTS' as section;
SELECT 
    user_id,
    full_name,
    email,
    role
FROM profiles
WHERE role = 'student'
LIMIT 5;
