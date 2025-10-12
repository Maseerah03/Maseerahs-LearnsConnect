-- CHECK CURRENT USER IN SUPABASE
-- Run this in your Supabase SQL Editor

-- 1. Check what user is currently logged in
SELECT 'CURRENT USER INFO' as check_type;
SELECT 
    current_user,
    current_database(),
    current_schema();

-- 2. Check all users in the auth.users table
SELECT 'ALL AUTH USERS' as check_type;
SELECT 
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Check all institution profiles with their user_ids
SELECT 'INSTITUTION PROFILES' as check_type;
SELECT 
    id,
    user_id,
    institution_name,
    created_at
FROM institution_profiles 
ORDER BY created_at DESC;

SELECT 'USER CHECK COMPLETE' as status;
