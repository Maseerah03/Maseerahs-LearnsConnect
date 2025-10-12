-- Get real user data from Supabase auth system
-- This will help us create the missing user records with correct details

-- 1. Check what's in the auth.users table (this is the real Supabase auth data)
SELECT 
    'AUTH_USERS' as source,
    id,
    email,
    created_at,
    updated_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check what's in the public.users table (this might be a custom table)
SELECT 
    'PUBLIC_USERS' as source,
    id,
    email,
    created_at,
    updated_at
FROM public.users
ORDER BY created_at DESC;

-- 3. Cross-reference profiles with auth.users to find matches
SELECT 
    'PROFILE_AUTH_MATCH' as analysis_type,
    p.id as profile_id,
    p.full_name,
    p.email as profile_email,
    p.role,
    au.id as auth_user_id,
    au.email as auth_email,
    au.created_at as auth_created_at,
    CASE 
        WHEN au.id IS NULL THEN 'NO_AUTH_USER'
        ELSE 'AUTH_USER_EXISTS'
    END as status
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;

-- 4. Check if there are any auth.users that don't have profiles
SELECT 
    'AUTH_WITHOUT_PROFILE' as analysis_type,
    au.id as auth_user_id,
    au.email as auth_email,
    au.created_at as auth_created_at,
    p.id as profile_id,
    p.full_name,
    p.role,
    CASE 
        WHEN p.id IS NULL THEN 'NO_PROFILE'
        ELSE 'PROFILE_EXISTS'
    END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- 5. Check the foreign key constraint to see what table it references
SELECT 
    'FOREIGN_KEY_ANALYSIS' as analysis_type,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema as foreign_schema,
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

-- 6. Check if the foreign key references auth.users or public.users
SELECT 
    'CONSTRAINT_TARGET' as analysis_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'course_enrollments' 
            AND kcu.column_name = 'student_id'
            AND ccu.table_name = 'users'
            AND ccu.table_schema = 'auth'
        ) THEN 'REFERENCES_AUTH_USERS'
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'course_enrollments' 
            AND kcu.column_name = 'student_id'
            AND ccu.table_name = 'users'
            AND ccu.table_schema = 'public'
        ) THEN 'REFERENCES_PUBLIC_USERS'
        ELSE 'UNKNOWN_REFERENCE'
    END as foreign_key_target;
