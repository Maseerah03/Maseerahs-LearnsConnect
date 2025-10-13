-- Fix Admin Access to Course Enrollments
-- This script ensures admin users can access course_enrollments data

-- 1. Check current RLS policies on course_enrollments
SELECT 'CURRENT_RLS_POLICIES' as section;
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
WHERE tablename = 'course_enrollments';

-- 2. Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Students can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can insert own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can update own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Tutors can view course enrollments" ON course_enrollments;

-- 3. Create admin-friendly policies
-- Allow admins to view all enrollments
CREATE POLICY "Admins can view all enrollments" ON course_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to insert enrollments
CREATE POLICY "Admins can insert enrollments" ON course_enrollments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update enrollments
CREATE POLICY "Admins can update enrollments" ON course_enrollments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Keep existing student policies but make them more permissive
CREATE POLICY "Students can view own enrollments" ON course_enrollments
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own enrollments" ON course_enrollments
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own enrollments" ON course_enrollments
    FOR UPDATE USING (auth.uid() = student_id);

-- Allow tutors to view enrollments for their courses
CREATE POLICY "Tutors can view course enrollments" ON course_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_enrollments.course_id 
            AND courses.tutor_id = auth.uid()
        )
    );

-- 4. Test the policies by checking if we can count enrollments
SELECT 'TEST_ENROLLMENTS_ACCESS' as section;
SELECT COUNT(*) as total_enrollments FROM course_enrollments;

-- 5. Show sample enrollments data
SELECT 'SAMPLE_ENROLLMENTS' as section;
SELECT 
    id,
    course_id,
    student_id,
    status,
    enrolled_at
FROM course_enrollments
LIMIT 3;
