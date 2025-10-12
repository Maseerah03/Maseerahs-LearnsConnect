-- FINAL SOLUTION - Use the existing messages table that Supabase keeps suggesting
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what the messages table looks like
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 2. Check if we need to add columns to messages table
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

-- 3. Add foreign key constraint if it doesn't exist
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

-- 4. Enable RLS if not already enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. Create/update RLS policies for messages table
DROP POLICY IF EXISTS "Allow anyone to create messages" ON messages;
DROP POLICY IF EXISTS "Institutions can view their messages" ON messages;
DROP POLICY IF EXISTS "Institutions can update their messages" ON messages;

CREATE POLICY "Allow anyone to create messages" ON messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Institutions can view their messages" ON messages
    FOR SELECT USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Institutions can update their messages" ON messages
    FOR UPDATE USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 6. Grant permissions
GRANT ALL ON messages TO anon;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON messages TO public;
GRANT ALL ON messages TO postgres;
GRANT ALL ON messages TO service_role;

-- 7. Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO public;

-- 8. Test insert with a real institution_id (get one from institution_profiles)
INSERT INTO messages (
    institution_id,
    student_name,
    course_interest,
    message,
    status
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'TEST MESSAGE',
    'Test Course',
    'Testing messages table for contact form',
    'new'
) RETURNING id, institution_id, student_name, course_interest, message, status;

-- 9. Clean up test record
DELETE FROM messages WHERE student_name = 'TEST MESSAGE';

-- 10. Final schema refresh
NOTIFY pgrst, 'reload schema';

-- 11. Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages'
ORDER BY ordinal_position;

SELECT 'MESSAGES TABLE IS READY FOR CONTACT FORM!' as status;
