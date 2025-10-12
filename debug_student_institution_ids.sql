-- Debug SQL: Investigate why student and institution IDs are the same
-- Run this in your Supabase SQL Editor

-- 1. Check all course enrollments with their details
SELECT 
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    ce.enrolled_at,
    ic.title as course_title,
    ic.institution_id,
    ip.institution_name,
    p.full_name as student_name,
    p.email as student_email,
    p.role as student_role
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN institution_profiles ip ON ic.institution_id = ip.user_id
LEFT JOIN profiles p ON ce.student_id = p.id
ORDER BY ce.enrolled_at DESC;

-- 2. Check for self-enrollments (student_id = institution_id)
SELECT 
    'SELF-ENROLLMENT DETECTED' as issue_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ic.institution_id,
    ic.title as course_title,
    ip.institution_name,
    p.full_name as student_name,
    p.role as student_role,
    CASE 
        WHEN ce.student_id = ic.institution_id THEN 'YES - Institution enrolled in own course'
        ELSE 'NO'
    END as is_self_enrollment
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN institution_profiles ip ON ic.institution_id = ip.user_id
LEFT JOIN profiles p ON ce.student_id = p.id
WHERE ce.student_id = ic.institution_id;

-- 3. Check all profiles and their roles
SELECT 
    id,
    full_name,
    email,
    role,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- 4. Check institution profiles
SELECT 
    user_id,
    institution_name,
    created_at
FROM institution_profiles
ORDER BY created_at DESC;

-- 5. Cross-reference: Find users who appear in both profiles and institution_profiles
SELECT 
    'DUPLICATE USER' as issue_type,
    p.id as profile_id,
    p.full_name,
    p.email,
    p.role as profile_role,
    ip.user_id as institution_id,
    ip.institution_name,
    ip.created_at as institution_created_at
FROM profiles p
INNER JOIN institution_profiles ip ON p.id = ip.user_id;

-- 6. Check course enrollments by institution
SELECT 
    ic.institution_id,
    ip.institution_name,
    COUNT(ce.id) as total_enrollments,
    COUNT(CASE WHEN ce.student_id = ic.institution_id THEN 1 END) as self_enrollments,
    COUNT(CASE WHEN ce.student_id != ic.institution_id THEN 1 END) as real_student_enrollments
FROM institution_courses ic
LEFT JOIN institution_profiles ip ON ic.institution_id = ip.user_id
LEFT JOIN course_enrollments ce ON ic.id = ce.course_id
GROUP BY ic.institution_id, ip.institution_name
ORDER BY total_enrollments DESC;

-- 7. Detailed analysis of each enrollment
SELECT 
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    ce.enrolled_at,
    ic.title as course_title,
    ic.institution_id as course_institution_id,
    ip.institution_name,
    p.full_name as student_name,
    p.email as student_email,
    p.role as student_role,
    CASE 
        WHEN ce.student_id = ic.institution_id THEN 'SELF-ENROLLMENT'
        WHEN p.role = 'institution' THEN 'INSTITUTION-ROLE-STUDENT'
        WHEN p.role = 'student' THEN 'REAL-STUDENT'
        ELSE 'UNKNOWN-ROLE'
    END as enrollment_type
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN institution_profiles ip ON ic.institution_id = ip.user_id
LEFT JOIN profiles p ON ce.student_id = p.id
ORDER BY ce.enrolled_at DESC;
