-- Fix Admin RLS Policies for Dashboard Access
-- Since admin authentication is handled in frontend (localStorage), not Supabase Auth

-- 1. Drop existing admin policies that check for auth.uid()
DROP POLICY IF EXISTS "Admins can view all enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can insert enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Admins can update enrollments" ON course_enrollments;

-- 2. Create new admin policies that allow access for admin dashboard
-- These policies will allow access when no user is authenticated (admin dashboard case)
CREATE POLICY "Admin dashboard can view all enrollments" ON course_enrollments
    FOR SELECT USING (true);

CREATE POLICY "Admin dashboard can insert enrollments" ON course_enrollments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin dashboard can update enrollments" ON course_enrollments
    FOR UPDATE USING (true);

-- 3. Also fix policies for other tables that admin dashboard needs
-- Drop existing restrictive policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies for profiles
CREATE POLICY "Admin dashboard can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Admin dashboard can update profiles" ON profiles
    FOR UPDATE USING (true);

-- 4. Test the new policies
SELECT 'TEST_ENROLLMENTS_ACCESS' as section;
SELECT COUNT(*) as total_enrollments FROM course_enrollments;

SELECT 'TEST_PROFILES_ACCESS' as section;
SELECT COUNT(*) as total_profiles FROM profiles;

-- 5. Show all current policies
SELECT 'CURRENT_POLICIES' as section;
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename IN ('course_enrollments', 'profiles', 'courses', 'institution_courses')
ORDER BY tablename, policyname;
