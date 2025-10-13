-- Create Admin User Account
-- This creates the actual admin user in auth.users and profiles

-- 1. First, let's create the admin user in auth.users
-- We'll use Supabase's auth.admin_create_user function
SELECT auth.admin_create_user(
    '{
        "email": "admin@learnsconnect.com",
        "password": "LearnsConnect2024!",
        "email_confirm": true,
        "user_metadata": {
            "full_name": "Admin User",
            "role": "admin"
        }
    }'::jsonb
);

-- 2. Get the admin user ID that was just created
SELECT 'ADMIN_USER_CREATED' as section;
SELECT 
    id,
    email,
    created_at,
    user_metadata
FROM auth.users
WHERE email = 'admin@learnsconnect.com';

-- 3. Create admin profile for the newly created user
INSERT INTO profiles (user_id, full_name, email, role, phone, bio)
SELECT 
    id,
    'Admin User',
    'admin@learnsconnect.com',
    'admin',
    '0000000000',
    'System Administrator'
FROM auth.users
WHERE email = 'admin@learnsconnect.com';

-- 4. Verify the admin profile was created
SELECT 'VERIFY_ADMIN_PROFILE' as section;
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
