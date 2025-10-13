-- Create Admin Profile for the Missing User
-- This creates an admin profile for the user without a profile

-- 1. Create admin profile for the user without a profile
INSERT INTO profiles (user_id, full_name, email, role, phone, bio)
VALUES (
    '06f397ba-5535-4732-8733-ada02a477214',
    'Admin User',
    'nooretafseer@gmail.com',
    'admin',
    '0000000000',
    'System Administrator'
);

-- 2. Verify the admin profile was created
SELECT 'VERIFY_ADMIN_PROFILE_CREATED' as section;
SELECT 
    user_id,
    full_name,
    email,
    role,
    created_at
FROM profiles
WHERE role = 'admin';

-- 3. Test enrollments access
SELECT 'TEST_ENROLLMENTS_ACCESS' as section;
SELECT COUNT(*) as total_enrollments FROM course_enrollments;

-- 4. Show all profiles after creating admin profile
SELECT 'ALL_PROFILES_AFTER_ADMIN_CREATION' as section;
SELECT 
    user_id,
    full_name,
    email,
    role,
    created_at
FROM profiles
ORDER BY role, created_at;
