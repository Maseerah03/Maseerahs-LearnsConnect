-- Modify existing messages table for contact form functionality
-- Run this in your Supabase SQL Editor

-- 1. Add the columns we need for contact form functionality
-- Add institution_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'institution_id'
    ) THEN
        ALTER TABLE messages ADD COLUMN institution_id UUID;
    END IF;
END $$;

-- Add student_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'student_name'
    ) THEN
        ALTER TABLE messages ADD COLUMN student_name TEXT;
    END IF;
END $$;

-- Add student_email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'student_email'
    ) THEN
        ALTER TABLE messages ADD COLUMN student_email TEXT;
    END IF;
END $$;

-- Add course_interest column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'course_interest'
    ) THEN
        ALTER TABLE messages ADD COLUMN course_interest TEXT;
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'status'
    ) THEN
        ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'new';
    END IF;
END $$;

-- 2. Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'messages_institution_id_fkey'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_institution_id_fkey 
        FOREIGN KEY (institution_id) REFERENCES institution_profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Enable RLS if not already enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Create/update RLS policies for contact form messages
DROP POLICY IF EXISTS "Allow anyone to create contact messages" ON messages;
DROP POLICY IF EXISTS "Institutions can view their contact messages" ON messages;
DROP POLICY IF EXISTS "Institutions can update their contact messages" ON messages;

-- Allow anyone to create messages (for contact form)
CREATE POLICY "Allow anyone to create contact messages" ON messages
    FOR INSERT WITH CHECK (true);

-- Allow institutions to view messages sent to them
CREATE POLICY "Institutions can view their contact messages" ON messages
    FOR SELECT USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Allow institutions to update message status
CREATE POLICY "Institutions can update their contact messages" ON messages
    FOR UPDATE USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 5. Grant permissions
GRANT ALL ON messages TO anon;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON messages TO public;
GRANT ALL ON messages TO postgres;
GRANT ALL ON messages TO service_role;

-- 6. Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO public;

-- 7. Test insert with a real institution_id
INSERT INTO messages (
    institution_id,
    student_name,
    course_interest,
    content,
    status,
    message_type,
    topic
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'TEST CONTACT FORM',
    'Test Course',
    'Testing contact form with messages table',
    'new',
    'contact_form',
    'Student Inquiry'
) RETURNING id, institution_id, student_name, course_interest, content, status;

-- 8. Clean up test record
DELETE FROM messages WHERE student_name = 'TEST CONTACT FORM';

-- 9. Final schema refresh
NOTIFY pgrst, 'reload schema';

-- 10. Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

SELECT 'MESSAGES TABLE MODIFIED FOR CONTACT FORM - READY TO USE!' as status;
