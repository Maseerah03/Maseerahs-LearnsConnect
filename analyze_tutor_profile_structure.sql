-- Script to analyze tutor profile structure in Supabase
-- This will help understand the exact schema for creating dummy tutor profiles

-- 1. Check the main profiles table structure
SELECT 'PROFILES TABLE STRUCTURE' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check the tutor_profiles table structure
SELECT 'TUTOR_PROFILES TABLE STRUCTURE' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'tutor_profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if there are any other related tables
SELECT 'ALL TABLES WITH TUTOR IN NAME' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name LIKE '%tutor%' 
    AND table_schema = 'public'
ORDER BY table_name;

-- 4. Check foreign key relationships
SELECT 'FOREIGN KEY RELATIONSHIPS' as info;
SELECT
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
    AND (tc.table_name = 'profiles' OR tc.table_name = 'tutor_profiles')
ORDER BY tc.table_name, kcu.column_name;

-- 5. Check existing data to understand current structure
SELECT 'SAMPLE PROFILES DATA' as info;
SELECT 
    user_id,
    full_name,
    email,
    role,
    phone,
    bio,
    city,
    area,
    created_at
FROM profiles 
WHERE role = 'tutor' 
LIMIT 3;

-- 6. Check sample tutor_profiles data
SELECT 'SAMPLE TUTOR_PROFILES DATA' as info;
SELECT 
    user_id,
    full_name,
    subjects,
    hourly_rate,
    experience_years,
    education,
    teaching_mode,
    verified,
    status
FROM tutor_profiles 
LIMIT 3;

-- 7. Check data types for JSON/ARRAY columns
SELECT 'JSON/ARRAY COLUMN DETAILS' as info;
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'tutor_profiles' 
    AND table_schema = 'public'
    AND (data_type LIKE '%json%' OR data_type LIKE '%array%' OR udt_name LIKE '%json%' OR udt_name LIKE '%array%')
ORDER BY column_name;

-- 8. Check constraints and indexes
SELECT 'TABLE CONSTRAINTS' as info;
SELECT
    tc.constraint_name,
    tc.table_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND (tc.table_name = 'profiles' OR tc.table_name = 'tutor_profiles')
ORDER BY tc.table_name, tc.constraint_type;

-- 9. Check if there are any enums or custom types
SELECT 'CUSTOM TYPES AND ENUMS' as info;
SELECT 
    t.typname as type_name,
    t.typtype as type_type,
    e.enumlabel as enum_value
FROM pg_type t
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND (t.typname LIKE '%role%' OR t.typname LIKE '%status%' OR t.typname LIKE '%tutor%')
ORDER BY t.typname, e.enumsortorder;

-- 10. Get row counts to understand data volume
SELECT 'TABLE ROW COUNTS' as info;
SELECT 
    'profiles' as table_name,
    COUNT(*) as row_count
FROM profiles
WHERE role = 'tutor'
UNION ALL
SELECT 
    'tutor_profiles' as table_name,
    COUNT(*) as row_count
FROM tutor_profiles;
