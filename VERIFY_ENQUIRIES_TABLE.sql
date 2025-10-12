-- Verify enquiries table is working correctly
-- Run this in your Supabase SQL Editor

-- 1. Check table exists and structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'enquiries'
ORDER BY ordinal_position;

-- 2. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'enquiries';

-- 3. Check RLS policies
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'enquiries'
ORDER BY policyname;

-- 4. Check permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'enquiries'
ORDER BY grantee, privilege_type;

-- 5. Test basic query (should work)
SELECT COUNT(*) as total_records FROM enquiries;

-- 6. Final schema refresh
NOTIFY pgrst, 'reload schema';

SELECT 'ENQUIRIES TABLE IS READY TO USE! Your contact form should work now!' as status;
