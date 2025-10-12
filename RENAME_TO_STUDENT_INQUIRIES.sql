-- Rename student_enquiries to student_inquiries (as suggested by Supabase)
-- Run this in your Supabase SQL Editor

-- Rename the table to match what Supabase suggests
ALTER TABLE student_enquiries RENAME TO student_inquiries;

-- Grant permissions on the renamed table
GRANT ALL ON student_inquiries TO anon;
GRANT ALL ON student_inquiries TO authenticated;
GRANT ALL ON student_inquiries TO public;

-- Test insert
INSERT INTO student_inquiries (
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'RENAMED TABLE TEST',
    'test@example.com',
    'Test Course',
    'Testing renamed student_inquiries table',
    'new'
) RETURNING id, institution_id, student_name, student_email, course_interest, message, status;

-- Clean up
DELETE FROM student_inquiries WHERE student_name = 'RENAMED TABLE TEST';

SELECT 'TABLE RENAMED TO STUDENT_INQUIRIES - READY TO USE!' as status;
