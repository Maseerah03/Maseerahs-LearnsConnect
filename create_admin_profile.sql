-- Create Admin Profile
-- This creates the missing admin profile so the RLS policies work

-- 1. First, let's see what admin users exist in auth.users
SELECT 'ADMIN_USERS_IN_AUTH' as section;
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email LIKE '%admin%' OR email = 'admin@learnsconnect.com' OR email = 'admin';

-- 2. Create admin profile for the admin user
-- Try different possible admin emails
INSERT INTO profiles (user_id, full_name, email, role, phone, bio)
SELECT 
    id,
    'Admin User',
    email,
    'admin',
    '0000000000',
    'System Administrator'
FROM auth.users
WHERE email IN ('admin@learnsconnect.com', 'admin')
AND NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.users.id
);

-- 3. If the above doesn't work, let's try to find any user that might be admin
-- and create a profile for them
INSERT INTO profiles (user_id, full_name, email, role, phone, bio)
SELECT 
    id,
    'Admin User',
    email,
    'admin',
    '0000000000',
    'System Administrator'
FROM auth.users
WHERE email LIKE '%admin%'
AND NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.users.id
)
LIMIT 1;

-- 4. Verify the admin profile was created
SELECT 'VERIFY_ADMIN_PROFILE_CREATED' as section;
SELECT 
    user_id,
    full_name,
    email,
    role,
    created_at
FROM profiles
WHERE role = 'admin';

-- 5. Test enrollments access
SELECT 'TEST_ENROLLMENTS_ACCESS' as section;
SELECT COUNT(*) as total_enrollments FROM course_enrollments;

-- 6. Show all profiles after creating admin profile
SELECT 'ALL_PROFILES_AFTER_ADMIN_CREATION' as section;
SELECT 
    user_id,
    full_name,
    email,
    role,
    created_at
FROM profiles
ORDER BY role, created_at;
