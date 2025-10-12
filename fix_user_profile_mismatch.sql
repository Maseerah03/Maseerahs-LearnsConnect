-- Fix the user/profile mismatch issue
-- This will resolve the foreign key constraint problem

-- 1. First, let's see what we're dealing with
SELECT 'BEFORE FIX - Current state:' as status;

-- Check if Tanmay's profile exists but no corresponding user
SELECT 
    'PROFILE_CHECK' as check_type,
    p.id,
    p.full_name,
    p.email as profile_email,
    p.role,
    u.id as user_id,
    u.email as user_email,
    CASE 
        WHEN u.id IS NULL THEN 'MISSING_USER_RECORD'
        ELSE 'USER_EXISTS'
    END as status
FROM profiles p
LEFT JOIN users u ON p.id = u.id
WHERE p.id = '434a8441-b853-4ef1-b521-d31069615bb4';

-- 2. Option 1: Create the missing user record for Tanmay
-- This is the safest approach - create the user record that matches the profile
INSERT INTO users (id, email, created_at, updated_at)
VALUES (
    '434a8441-b853-4ef1-b521-d31069615bb4',
    'tanmay@example.com', -- You can update this with the real email
    '2025-08-22 02:36:31.207457+00',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Verify the user was created
SELECT 
    'AFTER USER CREATION' as status,
    u.id,
    u.email,
    u.created_at,
    p.full_name,
    p.role
FROM users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.id = '434a8441-b853-4ef1-b521-d31069615bb4';

-- 4. Now try to fix the enrollment
UPDATE course_enrollments 
SET 
    student_id = '434a8441-b853-4ef1-b521-d31069615bb4',
    updated_at = NOW()
WHERE id = '98cebbfb-2467-4b97-af3e-250d0a7a8b05';

-- 5. Verify the enrollment fix
SELECT 
    'ENROLLMENT_FIXED' as status,
    ce.id as enrollment_id,
    ce.course_id,
    ce.student_id,
    ce.status,
    ce.enrolled_at,
    ic.title as course_title,
    ic.institution_id,
    p.full_name as student_name,
    p.role as student_role,
    CASE 
        WHEN ce.student_id = ic.institution_id THEN 'STILL_SELF_ENROLLMENT'
        ELSE 'FIXED_VALID_ENROLLMENT'
    END as enrollment_status
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN profiles p ON ce.student_id = p.id
WHERE ce.id = '98cebbfb-2467-4b97-af3e-250d0a7a8b05';

-- 6. Show all enrollments after the fix
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
