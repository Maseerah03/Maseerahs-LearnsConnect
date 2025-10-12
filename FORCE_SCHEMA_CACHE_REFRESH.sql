-- Force schema cache refresh and test
-- Run this in your Supabase SQL Editor

-- 1. Force multiple schema cache refreshes
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';

-- 2. Wait a moment and then test with course_interest column
INSERT INTO messages (
    sender_id,
    receiver_id,
    topic,
    content,
    message_type,
    course_interest
) VALUES (
    NULL,
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'Student Inquiry - Test Course',
    'Student: SCHEMA CACHE TEST\nEmail: test@example.com\nCourse: Test Course\nMessage: Testing schema cache refresh',
    'contact_form',
    'Test Course'
) RETURNING id, sender_id, receiver_id, topic, content, message_type, course_interest;

-- 3. Clean up
DELETE FROM messages WHERE content LIKE '%SCHEMA CACHE TEST%';

SELECT 'SCHEMA CACHE REFRESHED - TESTING WITH COURSE_INTEREST!' as status;
