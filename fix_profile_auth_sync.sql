-- Fix the profile-auth synchronization issue
-- This will update profiles to use the correct auth user IDs

-- 1. Show the current mismatch
SELECT 'BEFORE FIX - Profile/Auth Mismatch:' as status;
SELECT 
    p.id as current_profile_id,
    p.full_name,
    p.role,
    au.id as correct_auth_id,
    au.email as auth_email,
    'Profile ID does not match Auth ID' as issue
FROM profiles p
CROSS JOIN auth.users au
WHERE (
    (p.full_name = 'Tanmay P Gharat' AND au.email = 'isml.intern1@gmail.com') OR
    (p.full_name = 'Global Learning Academy' AND au.email = 'maseerah2003@gmail.com') OR
    (p.full_name = 'Syed Nooruddin Hussaini' AND au.email = 'snhpowe12@gmail.com') OR
    (p.full_name = 'Maseerah' AND au.email = 'maseerah.research@gmail.com')
);

-- 2. Update profiles to use correct auth user IDs
-- Tanmay P Gharat -> isml.intern1@gmail.com (4136968b-f971-4b9c-82ed-bbc0c4d82171)
UPDATE profiles 
SET id = '4136968b-f971-4b9c-82ed-bbc0c4d82171'
WHERE full_name = 'Tanmay P Gharat' AND role = 'student';

-- Global Learning Academy -> maseerah2003@gmail.com (6b0f0c18-08fe-431b-af56-c4ab23e3b25c)
UPDATE profiles 
SET id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
WHERE full_name = 'Global Learning Academy' AND role = 'institution';

-- Syed Nooruddin Hussaini -> snhpowe12@gmail.com (835232f6-a782-4e46-a713-dc0d267e26b5)
UPDATE profiles 
SET id = '835232f6-a782-4e46-a713-dc0d267e26b5'
WHERE full_name = 'Syed Nooruddin Hussaini' AND role = 'tutor';

-- Maseerah -> maseerah.research@gmail.com (f7783d23-b9f4-42ca-acc4-4847876b0c82)
UPDATE profiles 
SET id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82'
WHERE full_name = 'Maseerah' AND role = 'tutor';

-- 3. Create profile for the remaining auth user (nooretafseer@gmail.com)
INSERT INTO profiles (id, full_name, email, role, created_at)
VALUES (
    '06f397ba-5535-4732-8733-ada02a477214',
    'Noore Tafseer',
    'nooretafseer@gmail.com',
    'student',
    '2025-09-06 02:52:04.42279+00'
);

-- 4. Verify the sync is now correct
SELECT 'AFTER FIX - Profile/Auth Sync:' as status;
SELECT 
    p.id as profile_id,
    p.full_name,
    p.email as profile_email,
    p.role,
    au.id as auth_id,
    au.email as auth_email,
    CASE 
        WHEN p.id = au.id THEN 'SYNCED'
        ELSE 'NOT_SYNCED'
    END as sync_status
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;

-- 5. Now fix the enrollment to use Tanmay's correct student ID
UPDATE course_enrollments 
SET 
    student_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171', -- Tanmay's correct auth ID
    updated_at = NOW()
WHERE id = '98cebbfb-2467-4b97-af3e-250d0a7a8b05';

-- 6. Verify the enrollment fix
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
    au.email as student_email,
    CASE 
        WHEN ce.student_id = ic.institution_id THEN 'STILL_SELF_ENROLLMENT'
        ELSE 'FIXED_VALID_ENROLLMENT'
    END as enrollment_status
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN profiles p ON ce.student_id = p.id
LEFT JOIN auth.users au ON ce.student_id = au.id
WHERE ce.id = '98cebbfb-2467-4b97-af3e-250d0a7a8b05';

-- 7. Show all enrollments after the fix
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
    au.email as student_email,
    CASE 
        WHEN ce.student_id = COALESCE(ic.institution_id, c.tutor_id) THEN 'SELF-ENROLLMENT'
        ELSE 'VALID-ENROLLMENT'
    END as enrollment_type
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN courses c ON ce.course_id = c.id
LEFT JOIN profiles p ON ce.student_id = p.id
LEFT JOIN auth.users au ON ce.student_id = au.id
ORDER BY ce.enrolled_at DESC;
