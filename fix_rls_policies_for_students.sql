-- Fix RLS policies to allow students to create enquiries
-- Run this in your Supabase SQL editor

-- First, let's see the current policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'institution_student_enquiries'
ORDER BY policyname;

-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "institution_insert_own_enquiries" ON institution_student_enquiries;

-- Create a new policy that allows anyone to insert enquiries
CREATE POLICY "Allow anyone to create enquiries" ON institution_student_enquiries
    FOR INSERT WITH CHECK (true);

-- Verify the new policies
SELECT 
    'Updated Policies' as check_type,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'institution_student_enquiries'
ORDER BY policyname;

-- Test the fix by trying to insert a test record
INSERT INTO institution_student_enquiries (
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- dummy UUID
    'Test Student',
    'test@example.com',
    'Test Course',
    'This is a test message',
    'new'
);

-- Clean up the test record
DELETE FROM institution_student_enquiries WHERE student_name = 'Test Student';

-- Success message
SELECT 'RLS policies fixed! Students can now create enquiries.' as status;
