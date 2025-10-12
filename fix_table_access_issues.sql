-- Fix institution_student_enquiries table access issues
-- Run this in your Supabase SQL editor

-- 1. First, let's check current policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'institution_student_enquiries';

-- 2. Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Students can create enquiries" ON institution_student_enquiries;
DROP POLICY IF EXISTS "Institutions can view their enquiries" ON institution_student_enquiries;
DROP POLICY IF EXISTS "Institutions can update enquiry status" ON institution_student_enquiries;
DROP POLICY IF EXISTS "Allow anyone to create enquiries" ON institution_student_enquiries;
DROP POLICY IF EXISTS "institution_insert_own_enquiries" ON institution_student_enquiries;

-- 3. Ensure RLS is enabled
ALTER TABLE institution_student_enquiries ENABLE ROW LEVEL SECURITY;

-- 4. Create more permissive policies for testing
-- Allow anyone to insert (for students to submit inquiries)
CREATE POLICY "Allow public insert" ON institution_student_enquiries
    FOR INSERT WITH CHECK (true);

-- Allow institutions to view their own enquiries
CREATE POLICY "Institutions can view enquiries" ON institution_student_enquiries
    FOR SELECT USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Allow institutions to update enquiry status
CREATE POLICY "Institutions can update enquiries" ON institution_student_enquiries
    FOR UPDATE USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 5. Grant necessary permissions
GRANT ALL ON institution_student_enquiries TO authenticated;
GRANT ALL ON institution_student_enquiries TO anon;

-- 6. Test the policies
SELECT 'RLS policies updated successfully' as status;

-- 7. Verify policies are working
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'institution_student_enquiries'
ORDER BY policyname;
