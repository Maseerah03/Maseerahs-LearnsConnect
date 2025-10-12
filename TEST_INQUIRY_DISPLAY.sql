-- TEST INQUIRY DISPLAY
-- Run this in your Supabase SQL Editor to verify the inquiry was saved

-- 1. Check if the inquiry was saved
SELECT 
    id,
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status,
    created_at
FROM student_inquiries 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check the institution_id matches
SELECT 
    user_id,
    institution_name
FROM institution_profiles 
WHERE user_id IN (
    SELECT DISTINCT institution_id 
    FROM student_inquiries
);

-- 3. Count total inquiries
SELECT 
    COUNT(*) as total_inquiries,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_inquiries
FROM student_inquiries;

SELECT 'INQUIRY DISPLAY TEST COMPLETE!' as status;
