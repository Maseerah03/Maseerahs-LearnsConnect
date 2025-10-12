-- REGENERATE SUPABASE TYPES
-- This will help regenerate your TypeScript types

-- 1. First, let's make sure the table is properly visible
SELECT 'ENSURING TABLE VISIBILITY' as step;

-- Check table exists
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'student_inquiries';

-- 2. Force schema refresh
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';

-- 3. Test the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_inquiries' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'TYPES REGENERATION READY' as status;
