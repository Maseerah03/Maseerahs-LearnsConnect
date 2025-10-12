-- Fix Course Enrollment Schema Issues
-- This script will fix the database schema to properly handle both tutor and institution courses

-- 1. First, let's see the current state
SELECT 'BEFORE FIX - Current enrollments:' as status;
SELECT 
    ce.id,
    ce.course_id,
    ce.student_id,
    ce.status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM courses WHERE id = ce.course_id) THEN 'TUTOR_COURSE'
        WHEN EXISTS (SELECT 1 FROM institution_courses WHERE id = ce.course_id) THEN 'INSTITUTION_COURSE'
        ELSE 'INVALID_COURSE'
    END as course_type
FROM course_enrollments ce;

-- 2. Drop the existing foreign key constraint that's causing issues
ALTER TABLE course_enrollments DROP CONSTRAINT IF EXISTS course_enrollments_course_id_fkey;

-- 3. Create a new foreign key constraint that allows both course types
-- We'll use a check constraint instead of a foreign key since we have two possible parent tables
ALTER TABLE course_enrollments 
ADD CONSTRAINT course_enrollments_course_id_check 
CHECK (
    EXISTS (SELECT 1 FROM courses WHERE id = course_id) OR 
    EXISTS (SELECT 1 FROM institution_courses WHERE id = course_id)
);

-- 4. Update RLS policies to handle both course types
DROP POLICY IF EXISTS "Students can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can insert own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Students can update own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Tutors can view course enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Institutions can view course enrollments" ON course_enrollments;

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments" ON course_enrollments
    FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own enrollments
CREATE POLICY "Students can insert own enrollments" ON course_enrollments
    FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can update their own enrollments
CREATE POLICY "Students can update own enrollments" ON course_enrollments
    FOR UPDATE USING (auth.uid() = student_id);

-- Tutors can view enrollments for their courses
CREATE POLICY "Tutors can view course enrollments" ON course_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_enrollments.course_id 
            AND courses.tutor_id = auth.uid()
        )
    );

-- Institutions can view enrollments for their courses
CREATE POLICY "Institutions can view course enrollments" ON course_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM institution_courses 
            WHERE institution_courses.id = course_enrollments.course_id 
            AND institution_courses.institution_id = auth.uid()
        )
    );

-- 5. Verify the fix
SELECT 'AFTER FIX - Current enrollments:' as status;
SELECT 
    ce.id,
    ce.course_id,
    ce.student_id,
    ce.status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM courses WHERE id = ce.course_id) THEN 'TUTOR_COURSE'
        WHEN EXISTS (SELECT 1 FROM institution_courses WHERE id = ce.course_id) THEN 'INSTITUTION_COURSE'
        ELSE 'INVALID_COURSE'
    END as course_type,
    COALESCE(ic.title, c.title) as course_title,
    COALESCE(ic.institution_id, c.tutor_id) as course_owner_id
FROM course_enrollments ce
LEFT JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN courses c ON ce.course_id = c.id;

-- 6. Test the constraint
SELECT 'CONSTRAINT TEST:' as test_type;
SELECT 
    COUNT(*) as total_enrollments,
    COUNT(CASE WHEN EXISTS (SELECT 1 FROM courses WHERE id = course_id) THEN 1 END) as valid_tutor_enrollments,
    COUNT(CASE WHEN EXISTS (SELECT 1 FROM institution_courses WHERE id = course_id) THEN 1 END) as valid_institution_enrollments,
    COUNT(CASE WHEN NOT EXISTS (SELECT 1 FROM courses WHERE id = course_id) 
               AND NOT EXISTS (SELECT 1 FROM institution_courses WHERE id = course_id) THEN 1 END) as invalid_enrollments
FROM course_enrollments;
