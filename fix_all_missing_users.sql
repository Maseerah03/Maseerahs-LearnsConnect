-- Fix all missing user records
-- This will create user records for all profiles that are missing them

-- 1. Show the current state
SELECT 'BEFORE FIX - Missing users:' as status;
SELECT 
    p.id as profile_id,
    p.full_name,
    p.email as profile_email,
    p.role,
    u.id as user_id,
    CASE 
        WHEN u.id IS NULL THEN 'MISSING_USER'
        ELSE 'USER_EXISTS'
    END as status
FROM profiles p
LEFT JOIN users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- 2. Create missing user records for all profiles
-- We'll use the profile email if available, or generate a placeholder email

-- Create user for Tanmay P Gharat (student)
INSERT INTO users (id, email, created_at, updated_at)
VALUES (
    '434a8441-b853-4ef1-b521-d31069615bb4',
    'tanmay.gharat@example.com',
    '2025-08-22 02:36:31.207457+00',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create user for Global Learning Academy (institution)
INSERT INTO users (id, email, created_at, updated_at)
VALUES (
    '4da068d0-0553-40f5-8948-d64a9a9c0524',
    'global.learning.academy@example.com',
    '2025-09-06 11:06:09.08023+00',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create user for Syed Nooruddin Hussaini (tutor)
INSERT INTO users (id, email, created_at, updated_at)
VALUES (
    '6764bc6a-e2e1-4c5e-b2f7-dd38160eb597',
    'syed.nooruddin@example.com',
    '2025-10-08 05:39:01.002478+00',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create user for Maseerah (tutor) - this one might already exist
INSERT INTO users (id, email, created_at, updated_at)
VALUES (
    '32c38d64-2c0e-46f6-bcfc-f0e2bfe8fa97',
    'maseerah@example.com',
    '2025-08-08 11:37:15.223121+00',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Verify all users were created
SELECT 'AFTER USER CREATION - All users:' as status;
SELECT 
    u.id,
    u.email,
    u.created_at,
    p.full_name,
    p.role
FROM users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 4. Now fix the enrollment to use Tanmay's correct student ID
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
