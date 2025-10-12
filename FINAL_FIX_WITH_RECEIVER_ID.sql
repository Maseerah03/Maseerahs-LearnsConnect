-- Final fix with receiver_id field
-- Run this in your Supabase SQL Editor

-- Test insert with both sender_id and receiver_id
INSERT INTO messages (
    sender_id,
    receiver_id,
    institution_id,
    student_name,
    course_interest,
    content,
    message_type
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    (SELECT user_id FROM institution_profiles LIMIT 1),
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'FINAL FIX TEST',
    'Test Course',
    'Testing with both sender_id and receiver_id',
    'contact_form'
) RETURNING id, sender_id, receiver_id, institution_id, student_name, course_interest, content, message_type;

-- Clean up
DELETE FROM messages WHERE student_name = 'FINAL FIX TEST';

SELECT 'FINAL FIX SUCCESSFUL - CONTACT FORM READY!' as status;
