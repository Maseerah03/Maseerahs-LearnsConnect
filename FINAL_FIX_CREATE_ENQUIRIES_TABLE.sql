-- FINAL FIX - Create enquiries table (singular, simple name)
-- Run this in your Supabase SQL Editor

-- 1. Drop any existing problematic tables
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS student_inquiries CASCADE;
DROP TABLE IF EXISTS institution_student_enquiries CASCADE;

-- 2. Create a simple table with a basic name
CREATE TABLE enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    course_interest TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add foreign key constraint
ALTER TABLE enquiries 
ADD CONSTRAINT enquiries_institution_id_fkey 
FOREIGN KEY (institution_id) REFERENCES institution_profiles(user_id) ON DELETE CASCADE;

-- 4. Enable RLS
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- 5. Create simple RLS policies
CREATE POLICY "Allow all insert" ON enquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all select" ON enquiries
    FOR SELECT USING (true);

CREATE POLICY "Allow all update" ON enquiries
    FOR UPDATE USING (true);

-- 6. Grant ALL permissions to everyone
GRANT ALL ON enquiries TO anon;
GRANT ALL ON enquiries TO authenticated;
GRANT ALL ON enquiries TO public;
GRANT ALL ON enquiries TO postgres;
GRANT ALL ON enquiries TO service_role;

-- 7. Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO public;

-- 8. Test insert immediately
INSERT INTO enquiries (
    institution_id,
    student_name,
    course_interest,
    message
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'FINAL TEST',
    'Test Course',
    'Testing final enquiries table'
) RETURNING id, institution_id, student_name, course_interest, message, status, created_at;

-- 9. Clean up test record
DELETE FROM enquiries WHERE student_name = 'FINAL TEST';

-- 10. Force schema refresh multiple times
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload schema';

-- 11. Verify table exists and is accessible
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'enquiries';

SELECT 'ENQUIRIES TABLE CREATED AND READY TO USE!' as status;
