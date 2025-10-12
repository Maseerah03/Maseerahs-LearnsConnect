-- Fix the enrollment to use the correct student ID
-- This will correct the self-enrollment issue

-- 1. Show the current problematic enrollment
SELECT 
    'BEFORE FIX' as status,
    ce.id as enrollment_id,
    ce.course_id,
    ce.student_id as current_student_id,
    ce.status,
    ce.enrolled_at,
    ic.title as course_title,
    ic.institution_id,
    'This is a self-enrollment (student_id = institution_id)' as issue
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ce.id = '98cebbfb-2467-4b97-af3e-250d0a7a8b05';

-- 2. Update the enrollment to use the correct student ID
-- Tanmay P Gharat's student ID: 434a8441-b853-4ef1-b521-d31069615bb4
UPDATE course_enrollments 
SET 
    student_id = '434a8441-b853-4ef1-b521-d31069615bb4',
    updated_at = NOW()
WHERE id = '98cebbfb-2467-4b97-af3e-250d0a7a8b05';

-- 3. Verify the fix
SELECT 
    'AFTER FIX' as status,
    ce.id as enrollment_id,
    ce.course_id,
    ce.student_id as corrected_student_id,
    ce.status,
    ce.enrolled_at,
    ic.title as course_title,
    ic.institution_id,
    p.full_name as student_name,
    p.role as student_role,
    'Now this is a proper student enrollment' as result
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN profiles p ON ce.student_id = p.id
WHERE ce.id = '98cebbfb-2467-4b97-af3e-250d0a7a8b05';

-- 4. Show all enrollments after the fix
SELECT 
    'ALL_ENROLLMENTS_AFTER_FIX' as status,
    ce.id as enrollment_id,
    ce.course_id,
    ce.student_id,
    ce.status,
    ce.enrolled_at,
    COALESCE(ic.title, c.title) as course_title,
    COALESCE(ic.institution_id, c.tutor_id) as course_owner_id,
    p.full_name as student_name,
    p.role as student_role,
    CASE 
        WHEN ce.student_id = COALESCE(ic.institution_id, c.tutor_id) THEN 'SELF-ENROLLMENT'
        ELSE 'VALID-ENROLLMENT'
    END as enrollment_type
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN courses c ON ce.course_id = c.id
LEFT JOIN profiles p ON ce.student_id = p.id
ORDER BY ce.enrolled_at DESC;
