-- Simple test with existing columns only
-- Run this in your Supabase SQL Editor

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
    'Student: John Doe\nEmail: john@example.com\nCourse: Test Course\nMessage: This is a test message',
    'contact_form'
) RETURNING id, sender_id, receiver_id, topic, content, message_type;

SELECT 'TEST COMPLETED - CONTACT FORM SHOULD WORK!' as status;
