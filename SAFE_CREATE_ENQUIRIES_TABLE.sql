-- SAFE CREATE - Create enquiries table without dropping existing tables
-- Run this in your Supabase SQL Editor

-- 1. Create a simple table with a basic name (don't drop existing tables)
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    course_interest TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add foreign key constraint (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'enquiries_institution_id_fkey'
    ) THEN
        ALTER TABLE enquiries 
        ADD CONSTRAINT enquiries_institution_id_fkey 
        FOREIGN KEY (institution_id) REFERENCES institution_profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Enable RLS (only if not already enabled)
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow all insert" ON enquiries;
DROP POLICY IF EXISTS "Allow all select" ON enquiries;
DROP POLICY IF EXISTS "Allow all update" ON enquiries;

CREATE POLICY "Allow all insert" ON enquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all select" ON enquiries
    FOR SELECT USING (true);

CREATE POLICY "Allow all update" ON enquiries
    FOR UPDATE USING (true);

-- 5. Grant permissions (safe to run multiple times)
GRANT ALL ON enquiries TO anon;
GRANT ALL ON enquiries TO authenticated;
GRANT ALL ON enquiries TO public;
GRANT ALL ON enquiries TO postgres;
GRANT ALL ON enquiries TO service_role;

-- 6. Grant schema usage (safe to run multiple times)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO public;

-- 7. Test insert
INSERT INTO enquiries (
    institution_id,
    student_name,
    course_interest,
    message
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'SAFE TEST',
    'Test Course',
    'Testing safe enquiries table creation'
) RETURNING id, institution_id, student_name, course_interest, message, status, created_at;

-- 8. Clean up test record
DELETE FROM enquiries WHERE student_name = 'SAFE TEST';

-- 9. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- 10. Verify table exists
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'enquiries';

SELECT 'SAFE ENQUIRIES TABLE CREATED SUCCESSFULLY!' as status;
