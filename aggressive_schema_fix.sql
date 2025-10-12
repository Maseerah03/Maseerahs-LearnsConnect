-- Aggressive fix for student_inquiries schema cache issue
-- Run this in your Supabase SQL Editor

-- 1. First, let's temporarily disable the foreign key constraint
ALTER TABLE student_inquiries DROP CONSTRAINT IF EXISTS student_inquiries_institution_id_fkey;

-- 2. Force multiple schema cache refreshes
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';

-- 3. Grant permissions again
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON student_inquiries TO anon;
GRANT ALL ON student_inquiries TO authenticated;
GRANT ALL ON student_inquiries TO public;

-- 4. Test insert without foreign key constraint
INSERT INTO student_inquiries (
    institution_id,
    student_name,
    course_interest,
    message
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'Test Without FK',
    'Test Course',
    'Testing without foreign key constraint'
) RETURNING id, institution_id, student_name, course_interest, message, status, created_at;

-- 5. Clean up test record
DELETE FROM student_inquiries WHERE student_name = 'Test Without FK';

-- 6. Re-add the foreign key constraint
ALTER TABLE student_inquiries 
ADD CONSTRAINT student_inquiries_institution_id_fkey 
FOREIGN KEY (institution_id) REFERENCES institution_profiles(user_id) ON DELETE CASCADE;

-- 7. Final schema refresh
NOTIFY pgrst, 'reload schema';

SELECT 'Aggressive schema cache fix complete!' as status;
