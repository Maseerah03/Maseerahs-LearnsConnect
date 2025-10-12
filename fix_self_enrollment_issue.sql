-- Fix Self-Enrollment Issue
-- This script will clean up the data integrity problem

-- 1. First, let's see what we're dealing with
SELECT 
    'BEFORE CLEANUP' as status,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ic.title as course_title,
    ic.institution_id,
    ip.institution_name,
    CASE 
        WHEN ce.student_id = ic.institution_id THEN 'SELF-ENROLLMENT'
        ELSE 'VALID-ENROLLMENT'
    END as enrollment_type
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN institution_profiles ip ON ic.institution_id = ip.user_id;

-- 2. Delete the self-enrollment (institution enrolling in own course)
DELETE FROM course_enrollments 
WHERE id = '98cebbfb-2467-4b97-af3e-250d0a7a8b05'
AND student_id = (
    SELECT ic.institution_id 
    FROM institution_courses ic 
    WHERE ic.id = course_enrollments.course_id
);

-- 3. Verify the cleanup
SELECT 
    'AFTER CLEANUP' as status,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ic.title as course_title,
    ic.institution_id,
    ip.institution_name,
    CASE 
        WHEN ce.student_id = ic.institution_id THEN 'SELF-ENROLLMENT'
        ELSE 'VALID-ENROLLMENT'
    END as enrollment_type
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN institution_profiles ip ON ic.institution_id = ip.user_id;

-- 4. Check remaining enrollments
SELECT 
    'REMAINING ENROLLMENTS' as status,
    COUNT(*) as total_enrollments,
    COUNT(CASE WHEN ce.student_id = ic.institution_id THEN 1 END) as self_enrollments,
    COUNT(CASE WHEN ce.student_id != ic.institution_id THEN 1 END) as valid_enrollments
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id;

-- 5. If you want to create a test student enrollment instead, use this:
-- (Uncomment and modify as needed)

/*
-- Create a test student profile first
INSERT INTO profiles (id, full_name, email, role, created_at)
VALUES (
    '4136968b-f971-4b9c-82ed-bbc0c4d82171', -- Use existing student ID from your data
    'Test Student',
    'test.student@example.com',
    'student',
    NOW()
);

-- Then create a valid enrollment
INSERT INTO course_enrollments (id, student_id, course_id, status, enrolled_at, created_at)
VALUES (
    gen_random_uuid(),
    '4136968b-f971-4b9c-82ed-bbc0c4d82171', -- Test student ID
    'c88956fc-d21d-4bd5-9351-00026ed7f7ac', -- Your course ID
    'enrolled',
    NOW(),
    NOW()
);
*/
