-- Add Admin Policy for Course Enrollments
-- This adds the missing admin policy to access course_enrollments

-- 1. Add admin policy to view all enrollments
CREATE POLICY "Admins can view all enrollments" ON course_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 2. Add admin policy to insert enrollments
CREATE POLICY "Admins can insert enrollments" ON course_enrollments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 3. Add admin policy to update enrollments
CREATE POLICY "Admins can update enrollments" ON course_enrollments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 4. Test the new policies
SELECT 'TEST_ADMIN_ACCESS' as section;
SELECT COUNT(*) as total_enrollments FROM course_enrollments;

-- 5. Show all policies after adding admin policies
SELECT 'UPDATED_POLICIES' as section;
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'course_enrollments'
ORDER BY policyname;
