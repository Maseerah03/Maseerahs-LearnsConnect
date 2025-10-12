-- Create a new table with different name to bypass schema cache issues
-- Run this in your Supabase SQL Editor

-- 1. Create a new table with a different name
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    course_interest TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add foreign key constraint
ALTER TABLE contact_messages 
ADD CONSTRAINT contact_messages_institution_id_fkey 
FOREIGN KEY (institution_id) REFERENCES institution_profiles(user_id) ON DELETE CASCADE;

-- 3. Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Allow anyone to create contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Institutions can view their contact messages" ON contact_messages
    FOR SELECT USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Institutions can update their contact messages" ON contact_messages
    FOR UPDATE USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 5. Grant permissions
GRANT ALL ON contact_messages TO anon;
GRANT ALL ON contact_messages TO authenticated;
GRANT ALL ON contact_messages TO public;

-- 6. Test insert
INSERT INTO contact_messages (
    institution_id,
    student_name,
    course_interest,
    message
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'Test Contact',
    'Test Course',
    'Testing new contact_messages table'
) RETURNING id, institution_id, student_name, course_interest, message, status, created_at;

-- 7. Clean up test record
DELETE FROM contact_messages WHERE student_name = 'Test Contact';

-- 8. Refresh schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'contact_messages table created successfully!' as status;
