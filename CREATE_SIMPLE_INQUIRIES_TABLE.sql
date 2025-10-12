-- Create a simple table with a different name
-- Run this in your Supabase SQL Editor

-- Drop existing table if it exists
DROP TABLE IF EXISTS simple_inquiries CASCADE;

-- Create simple_inquiries table
CREATE TABLE simple_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    course_interest TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON simple_inquiries TO anon;
GRANT ALL ON simple_inquiries TO authenticated;
GRANT ALL ON simple_inquiries TO public;

-- Test insert
INSERT INTO simple_inquiries (
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'SIMPLE TABLE TEST',
    'test@example.com',
    'Test Course',
    'Testing simple_inquiries table',
    'new'
) RETURNING id, institution_id, student_name, student_email, course_interest, message, status;

-- Clean up
DELETE FROM simple_inquiries WHERE student_name = 'SIMPLE TABLE TEST';

SELECT 'SIMPLE_INQUIRIES TABLE CREATED - READY TO USE!' as status;
