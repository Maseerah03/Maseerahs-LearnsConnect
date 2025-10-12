-- Find the correct student ID for Tanmay
-- This will help us identify the right student profile

-- 1. Check all profiles to find Tanmay's student profile
SELECT 
    'ALL_PROFILES' as profile_type,
    id,
    full_name,
    email,
    role,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- 2. Check if there are any student profiles
SELECT 
    'STUDENT_PROFILES' as profile_type,
    id,
    full_name,
    email,
    role,
    created_at
FROM profiles
WHERE role = 'student'
ORDER BY created_at DESC;

-- 3. Check the current enrollment and what it should be
SELECT 
    'CURRENT_ENROLLMENT_ANALYSIS' as analysis_type,
    ce.id as enrollment_id,
    ce.course_id,
    ce.student_id as current_student_id,
    ce.status,
    ce.enrolled_at,
    ic.title as course_title,
    ic.institution_id,
    ip.institution_name,
    'This enrollment shows student_id = institution_id (WRONG!)' as issue
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN institution_profiles ip ON ic.institution_id = ip.user_id
WHERE ce.id = '98cebbfb-2467-4b97-af3e-250d0a7a8b05';

-- 4. Check what the correct student_id should be
-- Based on the profiles, Tanmay P Gharat (id: 434a8441-b853-4ef1-b521-d31069615bb4) should be the student
SELECT 
    'CORRECT_STUDENT_ANALYSIS' as analysis_type,
    '434a8441-b853-4ef1-b521-d31069615bb4' as correct_student_id,
    'Tanmay P Gharat' as student_name,
    'student' as student_role,
    'This should be the student_id in the enrollment' as note;

-- 5. Show what the enrollment should look like
SELECT 
    'CORRECTED_ENROLLMENT' as analysis_type,
    ce.id as enrollment_id,
    ce.course_id,
    '434a8441-b853-4ef1-b521-d31069615bb4' as correct_student_id,
    '6b0f0c18-08fe-431b-af56-c4ab23e3b25c' as current_wrong_student_id,
    ce.status,
    ce.enrolled_at,
    ic.title as course_title,
    ic.institution_id,
    'The enrollment should use Tanmay''s student ID, not the institution ID' as correction_needed
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ce.id = '98cebbfb-2467-4b97-af3e-250d0a7a8b05';
