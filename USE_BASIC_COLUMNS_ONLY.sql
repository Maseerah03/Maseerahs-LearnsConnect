-- Use only basic columns that definitely exist
-- Run this in your Supabase SQL Editor

-- Test insert with minimal columns
INSERT INTO student_inquiries (
    id,
    student_name,
    student_email,
    course_interest,
    message,
    status,
    created_at
) VALUES (
    gen_random_uuid(),
    'BASIC COLUMNS TEST',
    'test@example.com',
    'Test Course',
    'Institution ID: ' || (SELECT user_id FROM institution_profiles LIMIT 1) || '\nStudent: BASIC COLUMNS TEST\nEmail: test@example.com\nCourse: Test Course\nMessage: Testing with basic columns only',
    'new',
    NOW()
) RETURNING id, student_name, student_email, course_interest, message, status, created_at;

-- Clean up
DELETE FROM student_inquiries WHERE student_name = 'BASIC COLUMNS TEST';

SELECT 'BASIC COLUMNS TEST COMPLETED!' as status;
