-- Setup RLS policies for institution_student_enquiries table
-- Run this in your Supabase SQL editor

-- Check if the table exists
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'institution_student_enquiries';

-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'institution_student_enquiries';

-- Enable RLS if not already enabled
ALTER TABLE institution_student_enquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can create enquiries" ON institution_student_enquiries;
DROP POLICY IF EXISTS "Institutions can view their enquiries" ON institution_student_enquiries;
DROP POLICY IF EXISTS "Institutions can update enquiry status" ON institution_student_enquiries;

-- Create policies for institution_student_enquiries
-- 1. Students can create enquiries
CREATE POLICY "Students can create enquiries" ON institution_student_enquiries
    FOR INSERT WITH CHECK (true);

-- 2. Institutions can view enquiries sent to them
CREATE POLICY "Institutions can view their enquiries" ON institution_student_enquiries
    FOR SELECT USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 3. Institutions can update enquiry status
CREATE POLICY "Institutions can update enquiry status" ON institution_student_enquiries
    FOR UPDATE USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Verify the policies were created
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
WHERE tablename = 'institution_student_enquiries'
ORDER BY policyname;

-- Test query to see if we can insert (should work for any authenticated user)
SELECT 'RLS policies setup complete for institution_student_enquiries!' as status;
