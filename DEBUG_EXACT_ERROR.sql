-- DEBUG EXACT ERROR - Let's see what Supabase is actually seeing
-- Run this in your Supabase SQL Editor

-- 1. Check if the table is visible to PostgREST
SELECT 'POSTGREST TABLE VISIBILITY' as test;
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'student_inquiries';

-- 2. Check if the columns are visible to PostgREST
SELECT 'POSTGREST COLUMN VISIBILITY' as test;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_inquiries' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check PostgREST schema cache directly
SELECT 'POSTGREST SCHEMA CACHE' as test;
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'student_inquiries';

-- 4. Force immediate schema refresh
NOTIFY pgrst, 'reload schema';

-- 5. Test the exact insert your code is trying to do
SELECT 'TESTING EXACT INSERT' as test;
INSERT INTO student_inquiries (
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'DEBUG TEST',
    'debug@test.com',
    'Debug Course',
    'Testing exact insert from code',
    'new'
) RETURNING id, institution_id, student_name, student_email, course_interest, message, status;

-- 6. Clean up
DELETE FROM student_inquiries WHERE student_name = 'DEBUG TEST';

-- 7. Check if there are any hidden characters or encoding issues
SELECT 'CHECKING FOR HIDDEN ISSUES' as test;
SELECT 
    length(tablename) as table_name_length,
    tablename,
    ascii(substring(tablename, 1, 1)) as first_char_ascii,
    ascii(substring(tablename, -1, 1)) as last_char_ascii
FROM pg_tables 
WHERE tablename LIKE '%inquir%';

SELECT 'DEBUG COMPLETE - CHECK RESULTS ABOVE' as status;
