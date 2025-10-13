-- Check Admin Profile and Fix Admin Access
-- This script checks if the admin user has a profile and creates one if needed

-- 1. Check if there's an admin profile in the profiles table
SELECT 'ADMIN_PROFILE_CHECK' as section;
SELECT 
    user_id,
    full_name,
    email,
    role,
    created_at
FROM profiles
WHERE role = 'admin';

-- 2. Check what profiles exist
SELECT 'ALL_PROFILES' as section;
SELECT 
    user_id,
    full_name,
    email,
    role,
    created_at
FROM profiles
ORDER BY role, created_at;

-- 3. Check if we can access auth.users to see admin user
SELECT 'AUTH_USERS_CHECK' as section;
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'admin@learnsconnect.com'
LIMIT 1;

-- 4. If no admin profile exists, we need to create one
-- First, let's see what the admin user ID is
SELECT 'ADMIN_USER_ID' as section;
SELECT 
    id as admin_user_id,
    email
FROM auth.users
WHERE email = 'admin@learnsconnect.com';

-- 5. Create admin profile if it doesn't exist
-- (Run this only if no admin profile was found in step 1)
INSERT INTO profiles (user_id, full_name, email, role, phone, bio)
SELECT 
    id,
    'Admin User',
    'admin@learnsconnect.com',
    'admin',
    '0000000000',
    'System Administrator'
FROM auth.users
WHERE email = 'admin@learnsconnect.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.users.id
);

-- 6. Verify admin profile was created
SELECT 'VERIFY_ADMIN_PROFILE' as section;
SELECT 
    user_id,
    full_name,
    email,
    role,
    created_at
FROM profiles
WHERE role = 'admin';

-- 7. Test enrollments access again
SELECT 'TEST_ENROLLMENTS_AFTER_ADMIN_PROFILE' as section;
SELECT COUNT(*) as total_enrollments FROM course_enrollments;
