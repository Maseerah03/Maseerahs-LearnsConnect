-- Create Admin Profile - Simple Approach
-- This creates an admin profile for the admin user

-- 1. Show all users in auth.users to find the admin
SELECT 'ALL_AUTH_USERS' as section;
SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at;

-- 2. Show all existing profiles
SELECT 'EXISTING_PROFILES' as section;
SELECT 
    user_id,
    full_name,
    email,
    role
FROM profiles
ORDER BY role;

-- 3. Find users in auth.users who don't have profiles
SELECT 'USERS_WITHOUT_PROFILES' as section;
SELECT 
    au.id,
    au.email,
    au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;

-- 4. Create admin profile for the first user without a profile
-- (This is likely the admin user since they haven't created a profile through normal signup)
INSERT INTO profiles (user_id, full_name, email, role, phone, bio)
SELECT 
    au.id,
    'Admin User',
    au.email,
    'admin',
    '0000000000',
    'System Administrator'
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
LIMIT 1;

-- 5. Verify the admin profile was created
SELECT 'VERIFY_ADMIN_PROFILE' as section;
SELECT 
    user_id,
    full_name,
    email,
    role,
    created_at
FROM profiles
WHERE role = 'admin';

-- 6. Test enrollments access
SELECT 'TEST_ENROLLMENTS_ACCESS' as section;
SELECT COUNT(*) as total_enrollments FROM course_enrollments;

-- 7. Show all profiles after creating admin profile
SELECT 'ALL_PROFILES_AFTER' as section;
SELECT 
    user_id,
    full_name,
    email,
    role,
    created_at
FROM profiles
ORDER BY role, created_at;
