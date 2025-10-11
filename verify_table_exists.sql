-- Verify institution_student_enquiries table exists and show its structure
-- Run this in your Supabase SQL editor and share the results

-- 1. Check if the table exists
SELECT 
    'Table Exists Check' as check_type,
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name = 'institution_student_enquiries';

-- 2. Show table structure
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'institution_student_enquiries'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 
    'RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'institution_student_enquiries';

-- 4. Check existing policies
SELECT 
    'RLS Policies' as check_type,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'institution_student_enquiries'
ORDER BY policyname;

-- 5. Test basic query
SELECT 
    'Test Query' as check_type,
    COUNT(*) as total_records
FROM institution_student_enquiries;

-- 6. Show sample data (if any exists)
SELECT 
    'Sample Data' as check_type,
    id,
    institution_id,
    student_name,
    student_email,
    course_interest,
    status,
    created_at
FROM institution_student_enquiries
LIMIT 3;

-- 7. Check foreign key constraints
SELECT 
    'Foreign Keys' as check_type,
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
    AND tc.table_name = 'institution_student_enquiries';

-- Final summary
SELECT 
    'SUMMARY' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'institution_student_enquiries') 
        THEN 'Table EXISTS - Check results above for details'
        ELSE 'Table DOES NOT EXIST'
    END as result;
