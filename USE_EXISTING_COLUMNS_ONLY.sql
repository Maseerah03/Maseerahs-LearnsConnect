-- Use only existing columns that are already in the schema cache
-- Run this in your Supabase SQL Editor

-- Test insert using only the original columns that exist in schema cache
INSERT INTO messages (
    sender_id,
    receiver_id,
    topic,
    content,
    message_type
) VALUES (
    NULL,
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'Student Inquiry - Test Course',
    'Student: EXISTING COLUMNS TEST\nEmail: test@example.com\nCourse: Test Course\nMessage: Testing with existing columns only',
    'contact_form'
) RETURNING id, sender_id, receiver_id, topic, content, message_type;

-- Clean up
DELETE FROM messages WHERE content LIKE '%EXISTING COLUMNS TEST%';

SELECT 'USING EXISTING COLUMNS ONLY - READY TO TEST!' as status;
