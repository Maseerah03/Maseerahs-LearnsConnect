-- Fix RLS policies for messages table to allow contact form inserts
-- Run this in your Supabase SQL Editor

-- 1. Check current RLS policies
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- 3. Create permissive policies for contact forms
CREATE POLICY "Allow anyone to create contact form messages" ON messages
    FOR INSERT WITH CHECK (message_type = 'contact_form');

CREATE POLICY "Allow institutions to view contact form messages" ON messages
    FOR SELECT USING (
        receiver_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Allow institutions to update contact form messages" ON messages
    FOR UPDATE USING (
        receiver_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 4. Grant permissions
GRANT ALL ON messages TO anon;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON messages TO public;

-- 5. Test insert
INSERT INTO messages (
    sender_id,
    receiver_id,
    content,
    message_type
) VALUES (
    NULL,
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'Student: RLS TEST\nEmail: test@example.com\nCourse: Test Course\nMessage: Testing RLS policies',
    'contact_form'
) RETURNING id, sender_id, receiver_id, content, message_type;

-- 6. Clean up
DELETE FROM messages WHERE content LIKE '%RLS TEST%';

SELECT 'RLS POLICIES FIXED - CONTACT FORM READY!' as status;
