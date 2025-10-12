-- Clean up conflicting RLS policies for messages table
-- Run this in your Supabase SQL Editor

-- 1. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow anyone to create contact messages" ON messages;
DROP POLICY IF EXISTS "Institutions can view their contact messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages they send" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update messages they sent" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can view their messages" ON messages;

-- 2. Create simple, clear policies
CREATE POLICY "Allow contact form inserts" ON messages
    FOR INSERT WITH CHECK (message_type = 'contact_form');

CREATE POLICY "Allow institutions to view contact forms" ON messages
    FOR SELECT USING (
        receiver_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Allow institutions to update contact forms" ON messages
    FOR UPDATE USING (
        receiver_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 3. Grant permissions
GRANT ALL ON messages TO anon;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON messages TO public;

-- 4. Test insert
INSERT INTO messages (
    sender_id,
    receiver_id,
    content,
    message_type
) VALUES (
    NULL,
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'Student: CLEAN RLS TEST\nEmail: test@example.com\nCourse: Test Course\nMessage: Testing clean RLS policies',
    'contact_form'
) RETURNING id, sender_id, receiver_id, content, message_type;

-- 5. Clean up
DELETE FROM messages WHERE content LIKE '%CLEAN RLS TEST%';

-- 6. Show final policies
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

SELECT 'RLS POLICIES CLEANED UP - CONTACT FORM READY!' as status;
