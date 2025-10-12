-- Check the users table and fix the foreign key constraint issue

-- 1. Check what's in the users table
SELECT 
    'USERS_TABLE' as table_name,
    id,
    email,
    created_at
FROM users
ORDER BY created_at DESC;

-- 2. Check what's in the profiles table
SELECT 
    'PROFILES_TABLE' as table_name,
    id,
    full_name,
    email,
    role,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- 3. Find the mismatch - profiles that don't have corresponding users
SELECT 
    'MISSING_USERS' as issue_type,
    p.id as profile_id,
    p.full_name,
    p.email as profile_email,
    p.role,
    u.id as user_id,
    u.email as user_email,
    CASE 
        WHEN u.id IS NULL THEN 'PROFILE_EXISTS_BUT_NO_USER'
        ELSE 'USER_EXISTS'
    END as status
FROM profiles p
LEFT JOIN users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- 4. Check the foreign key constraint on course_enrollments
SELECT 
    'FOREIGN_KEY_CONSTRAINTS' as constraint_type,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'course_enrollments'
AND kcu.column_name = 'student_id';
