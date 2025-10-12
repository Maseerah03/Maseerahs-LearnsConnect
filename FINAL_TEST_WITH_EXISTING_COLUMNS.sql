-- Final test with only existing columns
-- Run this in your Supabase SQL Editor

-- Test insert with only the columns that exist
INSERT INTO messages (
    sender_id,
    institution_id,
    student_name,
    course_interest,
    content,
    message_type
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'FINAL TEST',
    'Test Course',
    'Testing with existing columns only',
    'contact_form'
) RETURNING id, sender_id, institution_id, student_name, course_interest, content, message_type;

-- Clean up
DELETE FROM messages WHERE student_name = 'FINAL TEST';

SELECT 'FINAL TEST SUCCESSFUL - CONTACT FORM READY!' as status;
