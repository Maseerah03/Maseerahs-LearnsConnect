-- Force fix RLS policies - completely remove all restrictions
-- Run this in your Supabase SQL editor

-- First, let's see what policies exist
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'institution_profiles';

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Admins can view all institution profiles" ON institution_profiles;
DROP POLICY IF EXISTS "Allow new institution profile creation" ON institution_profiles;
DROP POLICY IF EXISTS "Public can view all institution profiles" ON institution_profiles;
DROP POLICY IF EXISTS "Users can update own institution profile" ON institution_profiles;

-- Temporarily disable RLS completely
ALTER TABLE institution_profiles DISABLE ROW LEVEL SECURITY;

-- Test query to verify access
SELECT 
    id,
    institution_name,
    verified,
    status,
    user_id
FROM institution_profiles;

-- Re-enable RLS
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;

-- Create a simple, permissive policy
CREATE POLICY "Allow all public access" ON institution_profiles
    FOR ALL USING (true) WITH CHECK (true);

-- Test query again
SELECT 
    id,
    institution_name,
    verified,
    status,
    user_id
FROM institution_profiles;

-- Verify the new policy
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'institution_profiles';

-- Success message
SELECT 'RLS policies completely reset and made permissive!' as status;
