-- Temporarily disable RLS to test contact form
-- Run this in your Supabase SQL Editor

-- Disable RLS temporarily
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL ON messages TO anon;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON messages TO public;

-- Test insert
INSERT INTO messages (
    sender_id,
    receiver_id,
    content,
    message_type
) VALUES (
    NULL,
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'Student: RLS DISABLED TEST\nEmail: test@example.com\nCourse: Test Course\nMessage: Testing with RLS disabled',
    'contact_form'
) RETURNING id, sender_id, receiver_id, content, message_type;

-- Clean up
DELETE FROM messages WHERE content LIKE '%RLS DISABLED TEST%';

SELECT 'RLS DISABLED - CONTACT FORM SHOULD WORK NOW!' as status;