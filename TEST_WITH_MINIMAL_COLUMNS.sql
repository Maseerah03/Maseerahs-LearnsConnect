-- Test with only the most basic columns that definitely exist
-- Run this in your Supabase SQL Editor

INSERT INTO messages (
    sender_id,
    receiver_id,
    content,
    message_type
) VALUES (
    NULL,
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'Student: John Doe\nEmail: john@example.com\nCourse: Test Course\nMessage: This is a test message',
    'contact_form'
) RETURNING id, sender_id, receiver_id, content, message_type;

SELECT 'MINIMAL COLUMNS TEST COMPLETED!' as status;
