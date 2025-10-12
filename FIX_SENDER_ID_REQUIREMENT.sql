-- Fix sender_id requirement for messages table
-- Run this in your Supabase SQL Editor

-- Test insert with required sender_id field
INSERT INTO messages (
    sender_id,
    institution_id,
    student_name,
    course_interest,
    content,
    message_type,
    topic
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'FIXED TEST',
    'Test Course',
    'Testing with sender_id',
    'contact_form',
    'Student Inquiry'
) RETURNING id, sender_id, institution_id, student_name, course_interest, content;

-- Clean up
DELETE FROM messages WHERE student_name = 'FIXED TEST';

SELECT 'SENDER_ID REQUIREMENT FIXED - READY TO USE!' as status;
