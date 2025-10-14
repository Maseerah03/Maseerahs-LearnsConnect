-- =====================================================
-- DIAGNOSE MESSAGES FOREIGN KEY ERROR
-- =====================================================
-- This script helps identify why the messages table
-- foreign key constraint is failing
-- =====================================================

-- STEP 1: Check messages table structure
SELECT '=== MESSAGES TABLE STRUCTURE ===' as status;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- STEP 2: Check foreign key constraints on messages table
SELECT '=== FOREIGN KEY CONSTRAINTS ===' as status;

SELECT 
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
    AND tc.table_name = 'messages';

-- STEP 3: Check what users exist in auth.users
SELECT '=== AUTH.USERS DATA ===' as status;

SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at;

-- STEP 4: Check what users exist in profiles
SELECT '=== PROFILES DATA ===' as status;

SELECT 
    user_id,
    full_name,
    email,
    role::text
FROM profiles
ORDER BY created_at;

-- STEP 5: Check for mismatched user IDs
SELECT '=== USER ID MISMATCH ANALYSIS ===' as status;

-- Users in profiles but not in auth.users
SELECT 
    'Missing in auth.users' as issue,
    p.user_id,
    p.full_name,
    p.email
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE au.id IS NULL;

-- Users in auth.users but not in profiles
SELECT 
    'Missing in profiles' as issue,
    au.id,
    au.email
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;

-- STEP 6: Check existing messages (if any)
SELECT '=== EXISTING MESSAGES ===' as status;

SELECT 
    COUNT(*) as total_messages,
    COUNT(DISTINCT sender_id) as unique_senders,
    COUNT(DISTINCT receiver_id) as unique_receivers
FROM messages;

-- Check for invalid sender_id or receiver_id in existing messages
SELECT 
    'Invalid sender_id' as issue,
    sender_id,
    COUNT(*) as count
FROM messages
WHERE sender_id NOT IN (SELECT id FROM auth.users)
GROUP BY sender_id;

SELECT 
    'Invalid receiver_id' as issue,
    receiver_id,
    COUNT(*) as count
FROM messages
WHERE receiver_id NOT IN (SELECT id FROM auth.users)
GROUP BY receiver_id;

-- STEP 7: Check tutor_profiles for user_id consistency
SELECT '=== TUTOR PROFILES USER_ID CHECK ===' as status;

SELECT 
    'Tutor profiles with invalid user_id' as issue,
    tp.user_id,
    tp.full_name,
    COUNT(*) as count
FROM tutor_profiles tp
LEFT JOIN auth.users au ON tp.user_id = au.id
WHERE au.id IS NULL
GROUP BY tp.user_id, tp.full_name;

-- STEP 8: Check student_profiles for user_id consistency
SELECT '=== STUDENT PROFILES USER_ID CHECK ===' as status;

SELECT 
    'Student profiles with invalid user_id' as issue,
    sp.user_id,
    sp.full_name,
    COUNT(*) as count
FROM student_profiles sp
LEFT JOIN auth.users au ON sp.user_id = au.id
WHERE au.id IS NULL
GROUP BY sp.user_id, sp.full_name;

-- STEP 9: Summary and recommendations
SELECT '=== SUMMARY AND RECOMMENDATIONS ===' as status;

SELECT 
    'Total auth.users' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total profiles' as metric,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
    'Total messages' as metric,
    COUNT(*) as count
FROM messages
UNION ALL
SELECT 
    'Total tutor_profiles' as metric,
    COUNT(*) as count
FROM tutor_profiles
UNION ALL
SELECT 
    'Total student_profiles' as metric,
    COUNT(*) as count
FROM student_profiles;
