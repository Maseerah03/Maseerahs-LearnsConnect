-- Fix RLS policies to allow public access to all institutions
-- Run this in your Supabase SQL editor

-- First, check current policies
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
WHERE tablename = 'institution_profiles';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public can view verified institution profiles" ON institution_profiles;
DROP POLICY IF EXISTS "Users can view own institution profile" ON institution_profiles;

-- Create a new policy that allows public access to all institutions
CREATE POLICY "Public can view all institution profiles" ON institution_profiles
    FOR SELECT USING (true);

-- Verify the new policy
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
WHERE tablename = 'institution_profiles';

-- Test query to see all institutions
SELECT 
    id,
    institution_name,
    verified,
    status,
    user_id,
    created_at
FROM institution_profiles;

-- Success message
SELECT 'RLS policies updated! Public can now view all institutions.' as status;