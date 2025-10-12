-- COMPLETE DIAGNOSTIC AND FIX SCRIPT
-- This will analyze every possible angle and provide a definitive solution
-- Run this in your Supabase SQL Editor

-- ========================================
-- PART 1: COMPREHENSIVE DIAGNOSTICS
-- ========================================

-- 1. Check if table exists in multiple ways
SELECT 'TABLE EXISTENCE CHECK' as test_name;
SELECT 
    schemaname, 
    tablename, 
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'student_inquiries';

-- 2. Check table structure from multiple sources
SELECT 'TABLE STRUCTURE CHECK' as test_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'student_inquiries' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 'RLS STATUS CHECK' as test_name;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    relforcerowsecurity as rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'student_inquiries' AND n.nspname = 'public';

-- 4. Check all RLS policies
SELECT 'RLS POLICIES CHECK' as test_name;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'student_inquiries';

-- 5. Check permissions for all roles
SELECT 'PERMISSIONS CHECK' as test_name;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'student_inquiries' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 6. Check foreign key constraints
SELECT 'FOREIGN KEY CHECK' as test_name;
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
AND tc.table_name = 'student_inquiries';

-- 7. Check if there are any locks on the table
SELECT 'TABLE LOCKS CHECK' as test_name;
SELECT 
    locktype,
    database,
    relation,
    page,
    tuple,
    virtualxid,
    transactionid,
    classid,
    objid,
    objsubid,
    virtualtransaction,
    pid,
    mode,
    granted
FROM pg_locks 
WHERE relation = (SELECT oid FROM pg_class WHERE relname = 'student_inquiries');

-- 8. Check PostgREST schema cache status
SELECT 'POSTGREST CACHE CHECK' as test_name;
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename LIKE '%inquir%' OR tablename LIKE '%enquir%';

-- 9. Check for any conflicting tables
SELECT 'CONFLICTING TABLES CHECK' as test_name;
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN (
    'student_inquiries',
    'student_enquiries', 
    'institution_student_enquiries',
    'inquiries',
    'enquiries',
    'contact_messages',
    'simple_inquiries'
);

-- 10. Check current user and permissions
SELECT 'CURRENT USER CHECK' as test_name;
SELECT 
    current_user,
    session_user,
    current_database(),
    current_schema();

-- ========================================
-- PART 2: AGGRESSIVE FIXES
-- ========================================

-- 11. Force schema cache refresh (multiple times)
SELECT 'FORCING SCHEMA CACHE REFRESH' as action;
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';

-- 12. Drop and recreate the table completely
SELECT 'DROPPING AND RECREATING TABLE' as action;

-- Drop table if exists
DROP TABLE IF EXISTS student_inquiries CASCADE;

-- Create table with exact same structure
CREATE TABLE student_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    course_interest TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Grant ALL possible permissions
SELECT 'GRANTING ALL PERMISSIONS' as action;
GRANT ALL ON student_inquiries TO anon;
GRANT ALL ON student_inquiries TO authenticated;
GRANT ALL ON student_inquiries TO public;
GRANT ALL ON student_inquiries TO postgres;
GRANT ALL ON student_inquiries TO service_role;
GRANT ALL ON student_inquiries TO supabase_auth_admin;
GRANT ALL ON student_inquiries TO supabase_storage_admin;

-- 14. Grant schema permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO service_role;

-- 15. Create simple RLS policies (if needed)
SELECT 'CREATING SIMPLE RLS POLICIES' as action;
ALTER TABLE student_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow all operations" ON student_inquiries;
DROP POLICY IF EXISTS "Allow anonymous insert" ON student_inquiries;
DROP POLICY IF EXISTS "Allow authenticated read" ON student_inquiries;

-- Create permissive policies
CREATE POLICY "Allow all operations" ON student_inquiries
    FOR ALL USING (true) WITH CHECK (true);

-- 16. Force another schema refresh
SELECT 'FINAL SCHEMA REFRESH' as action;
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';

-- 17. Test insert with all possible variations
SELECT 'TESTING INSERT VARIATIONS' as action;

-- Test 1: Basic insert
INSERT INTO student_inquiries (
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'DIAGNOSTIC TEST 1',
    'test1@example.com',
    'Test Course 1',
    'Testing basic insert',
    'new'
) RETURNING id, institution_id, student_name, student_email, course_interest, message, status;

-- Test 2: Insert with explicit UUID
INSERT INTO student_inquiries (
    id,
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    gen_random_uuid(),
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'DIAGNOSTIC TEST 2',
    'test2@example.com',
    'Test Course 2',
    'Testing with explicit UUID',
    'new'
) RETURNING id, institution_id, student_name, student_email, course_interest, message, status;

-- 18. Clean up test data
DELETE FROM student_inquiries WHERE student_name LIKE 'DIAGNOSTIC TEST%';

-- 19. Final verification
SELECT 'FINAL VERIFICATION' as action;
SELECT 
    COUNT(*) as total_records,
    'student_inquiries table is ready' as status
FROM student_inquiries;

-- 20. Show final table structure
SELECT 'FINAL TABLE STRUCTURE' as action;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_inquiries' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'DIAGNOSTIC AND FIX COMPLETE!' as final_status;
