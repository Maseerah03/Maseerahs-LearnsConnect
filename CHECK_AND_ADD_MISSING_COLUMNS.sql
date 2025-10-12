-- Check what columns exist and add missing ones
-- Run this in your Supabase SQL Editor

-- 1. Check current columns in messages table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 2. Add missing columns one by one
ALTER TABLE messages ADD COLUMN IF NOT EXISTS course_interest TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS student_email TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- 3. Check columns again
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 4. Test insert
INSERT INTO messages (
    sender_id,
    receiver_id,
    institution_id,
    student_name,
    course_interest,
    content,
    message_type,
    status
) VALUES (
    NULL,
    (SELECT user_id FROM institution_profiles LIMIT 1),
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'COLUMN TEST',
    'Test Course',
    'Testing with all columns',
    'contact_form',
    'new'
) RETURNING id, sender_id, receiver_id, institution_id, student_name, course_interest, content, message_type, status;

-- 5. Clean up
DELETE FROM messages WHERE student_name = 'COLUMN TEST';

SELECT 'ALL COLUMNS ADDED SUCCESSFULLY!' as status;
