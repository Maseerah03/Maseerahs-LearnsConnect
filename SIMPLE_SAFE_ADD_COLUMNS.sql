-- SIMPLE SAFE - Add columns one by one to messages table
-- Run this in your Supabase SQL Editor

-- Add institution_id column
ALTER TABLE messages ADD COLUMN IF NOT EXISTS institution_id UUID;

-- Add student_name column  
ALTER TABLE messages ADD COLUMN IF NOT EXISTS student_name TEXT;

-- Add student_email column
ALTER TABLE messages ADD COLUMN IF NOT EXISTS student_email TEXT;

-- Add course_interest column
ALTER TABLE messages ADD COLUMN IF NOT EXISTS course_interest TEXT;

-- Add status column
ALTER TABLE messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- Grant permissions
GRANT ALL ON messages TO anon;
GRANT ALL ON messages TO authenticated;

-- Test insert
INSERT INTO messages (
    institution_id,
    student_name,
    course_interest,
    content,
    message_type
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'SIMPLE TEST',
    'Test Course',
    'Testing simple approach',
    'contact_form'
) RETURNING id, institution_id, student_name, course_interest, content;

-- Clean up
DELETE FROM messages WHERE student_name = 'SIMPLE TEST';

SELECT 'SIMPLE COLUMNS ADDED SUCCESSFULLY!' as status;
