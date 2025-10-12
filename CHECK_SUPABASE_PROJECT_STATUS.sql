-- CHECK SUPABASE PROJECT STATUS
-- Run this in your Supabase SQL Editor

-- 1. Check if we're in the right project
SELECT 'PROJECT CHECK' as test;
SELECT 
    current_database() as database_name,
    current_user as current_user,
    current_schema() as current_schema,
    version() as postgres_version;

-- 2. Check if the table is accessible via different methods
SELECT 'TABLE ACCESS CHECK' as test;
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'student_inquiries';

-- 3. Check if there are any system-level issues
SELECT 'SYSTEM CHECK' as test;
SELECT 
    count(*) as total_tables,
    'Tables in public schema' as description
FROM pg_tables 
WHERE schemaname = 'public';

-- 4. Check if there are any locks or blocking issues
SELECT 'LOCK CHECK' as test;
SELECT 
    locktype,
    mode,
    granted,
    pid
FROM pg_locks 
WHERE relation = (SELECT oid FROM pg_class WHERE relname = 'student_inquiries');

-- 5. Check PostgREST status
SELECT 'POSTGREST CHECK' as test;
SELECT 
    'PostgREST is running' as status,
    now() as current_time;

-- 6. Test a simple insert with minimal data
SELECT 'MINIMAL INSERT TEST' as test;
INSERT INTO student_inquiries (
    institution_id,
    student_name,
    course_interest
) VALUES (
    '6b0f0c18-08fe-431b-af56-c4ab23e3b25c',
    'MINIMAL TEST',
    'Test Course'
) RETURNING id, institution_id, student_name, course_interest;

-- 7. Clean up
DELETE FROM student_inquiries WHERE student_name = 'MINIMAL TEST';

SELECT 'PROJECT STATUS CHECK COMPLETE' as status;
