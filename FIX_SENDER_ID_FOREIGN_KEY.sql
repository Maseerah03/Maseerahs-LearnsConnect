-- Fix sender_id foreign key constraint issue
-- Run this in your Supabase SQL Editor

-- Option 1: Make sender_id nullable for contact forms
ALTER TABLE messages ALTER COLUMN sender_id DROP NOT NULL;

-- Test insert with null sender_id (for anonymous contact forms)
INSERT INTO messages (
    sender_id,
    receiver_id,
    institution_id,
    student_name,
    course_interest,
    content,
    message_type
) VALUES (
    NULL,
    (SELECT user_id FROM institution_profiles LIMIT 1),
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'NULL SENDER TEST',
    'Test Course',
    'Testing with null sender_id for anonymous contact forms',
    'contact_form'
) RETURNING id, sender_id, receiver_id, institution_id, student_name, course_interest, content, message_type;

-- Clean up
DELETE FROM messages WHERE student_name = 'NULL SENDER TEST';

SELECT 'SENDER_ID FOREIGN KEY FIXED - CONTACT FORM READY!' as status;
