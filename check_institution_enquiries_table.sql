-- Check if institution_student_enquiries table exists and its structure
-- Run this in your Supabase SQL editor

-- 1. Check if the table exists
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name = 'institution_student_enquiries';

-- 2. If table exists, show its structure
SELECT 
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
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'institution_student_enquiries';

-- 4. Check existing policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'institution_student_enquiries'
ORDER BY policyname;

-- 5. Test query (if table exists)
SELECT COUNT(*) as total_enquiries FROM institution_student_enquiries;

-- Result message
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'institution_student_enquiries') 
        THEN 'Table exists! Check the structure above.'
        ELSE 'Table does not exist. Run create_institution_student_enquiries_table.sql to create it.'
    END as status;
