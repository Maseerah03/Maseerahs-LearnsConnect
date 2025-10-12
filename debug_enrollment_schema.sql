-- Debug Enrollment Schema Issues
-- This will help us understand the database structure mismatch

-- 1. Check the current course_enrollments table structure
SELECT 
    'COURSE_ENROLLMENTS_TABLE' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'course_enrollments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check foreign key constraints on course_enrollments
SELECT 
    'FOREIGN_KEYS' as constraint_type,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'course_enrollments';

-- 3. Check what courses exist in both tables
SELECT 
    'COURSES_TABLE' as source,
    id,
    title,
    tutor_id as owner_id,
    'tutor' as course_type
FROM courses
UNION ALL
SELECT 
    'INSTITUTION_COURSES_TABLE' as source,
    id,
    title,
    institution_id as owner_id,
    'institution' as course_type
FROM institution_courses
ORDER BY course_type, title;

-- 4. Check current enrollments and their course references
SELECT 
    'ENROLLMENT_ANALYSIS' as analysis_type,
    ce.id as enrollment_id,
    ce.course_id,
    ce.student_id,
    ce.status,
    ce.enrolled_at,
    CASE 
        WHEN EXISTS (SELECT 1 FROM courses WHERE id = ce.course_id) THEN 'EXISTS_IN_COURSES'
        WHEN EXISTS (SELECT 1 FROM institution_courses WHERE id = ce.course_id) THEN 'EXISTS_IN_INSTITUTION_COURSES'
        ELSE 'COURSE_NOT_FOUND'
    END as course_exists_in,
    ic.title as institution_course_title,
    ic.institution_id,
    c.title as tutor_course_title,
    c.tutor_id
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN courses c ON ce.course_id = c.id
ORDER BY ce.enrolled_at DESC;

-- 5. Check if there are any constraint violations
SELECT 
    'CONSTRAINT_CHECK' as check_type,
    COUNT(*) as total_enrollments,
    COUNT(CASE WHEN EXISTS (SELECT 1 FROM courses WHERE id = course_id) THEN 1 END) as valid_tutor_course_enrollments,
    COUNT(CASE WHEN EXISTS (SELECT 1 FROM institution_courses WHERE id = course_id) THEN 1 END) as valid_institution_course_enrollments,
    COUNT(CASE WHEN NOT EXISTS (SELECT 1 FROM courses WHERE id = course_id) 
               AND NOT EXISTS (SELECT 1 FROM institution_courses WHERE id = course_id) THEN 1 END) as invalid_enrollments
FROM course_enrollments;
