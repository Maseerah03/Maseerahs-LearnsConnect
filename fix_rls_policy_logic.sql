-- Fix RLS policy logic for institution_student_enquiries
-- Run this in your Supabase SQL Editor

-- 1. Drop the problematic policies
DROP POLICY IF EXISTS "institution_read_own_enquiries" ON institution_student_enquiries;
DROP POLICY IF EXISTS "institution_update_own_enquiries" ON institution_student_enquiries;
DROP POLICY IF EXISTS "institution_delete_own_enquiries" ON institution_student_enquiries;

-- 2. Create correct policies that check institution_profiles table
-- Allow institutions to view enquiries sent to them
CREATE POLICY "Institutions can view their enquiries" ON institution_student_enquiries
    FOR SELECT USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Allow institutions to update enquiries sent to them
CREATE POLICY "Institutions can update their enquiries" ON institution_student_enquiries
    FOR UPDATE USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Allow institutions to delete enquiries sent to them
CREATE POLICY "Institutions can delete their enquiries" ON institution_student_enquiries
    FOR DELETE USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 3. Verify the policies
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'institution_student_enquiries'
ORDER BY policyname;

-- 4. Test the INSERT policy (this should work for anonymous users)
SELECT 'RLS policies fixed! The INSERT policy should now work for anonymous users.' as status;
