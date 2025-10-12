-- Update profile emails with correct email addresses from auth.users
-- This will fix the placeholder emails in the My Students section

-- 1. Show current profile emails (should be null or placeholder)
SELECT 
    'BEFORE UPDATE' as status,
    p.id,
    p.full_name,
    p.email as current_profile_email,
    au.email as auth_email,
    p.role
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;

-- 2. Update Tanmay P Gharat's email
UPDATE profiles 
SET email = 'isml.intern1@gmail.com'
WHERE id = '4136968b-f971-4b9c-82ed-bbc0c4d82171' 
AND full_name = 'Tanmay P Gharat';

-- 3. Update Global Learning Academy's email
UPDATE profiles 
SET email = 'maseerah2003@gmail.com'
WHERE id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c' 
AND full_name = 'Global Learning Academy';

-- 4. Update Syed Nooruddin Hussaini's email
UPDATE profiles 
SET email = 'snhpowe12@gmail.com'
WHERE id = '835232f6-a782-4e46-a713-dc0d267e26b5' 
AND full_name = 'Syed Nooruddin Hussaini';

-- 5. Update Maseerah's email
UPDATE profiles 
SET email = 'maseerah.research@gmail.com'
WHERE id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82' 
AND full_name = 'Maseerah';

-- 6. Update Noore Tafseer's email (if this profile exists)
UPDATE profiles 
SET email = 'nooretafseer@gmail.com'
WHERE id = '06f397ba-5535-4732-8733-ada02a477214';

-- 7. Verify the updates
SELECT 
    'AFTER UPDATE' as status,
    p.id,
    p.full_name,
    p.email as updated_profile_email,
    au.email as auth_email,
    p.role,
    CASE 
        WHEN p.email = au.email THEN 'EMAIL_SYNCED'
        ELSE 'EMAIL_MISMATCH'
    END as sync_status
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;

-- 8. Test the enrollment data that will be displayed
SELECT 
    'ENROLLMENT_DISPLAY_TEST' as test_type,
    ce.id as enrollment_id,
    ce.student_id,
    p.full_name as student_name,
    p.email as student_email,
    ic.title as course_title,
    ce.status,
    ce.enrolled_at
FROM course_enrollments ce
LEFT JOIN profiles p ON ce.student_id = p.id
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
WHERE ce.student_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';
