-- Test insert with institution_id column
-- Run this in your Supabase SQL Editor

INSERT INTO student_inquiries (
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'INSTITUTION ID TEST',
    'test@example.com',
    'Test Course',
    'Testing with institution_id column',
    'new'
) RETURNING id, institution_id, student_name, student_email, course_interest, message, status;

-- Clean up
DELETE FROM student_inquiries WHERE student_name = 'INSTITUTION ID TEST';

SELECT 'INSTITUTION_ID COLUMN TEST COMPLETED!' as status;
