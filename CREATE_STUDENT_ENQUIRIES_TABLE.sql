-- Create student_enquiries table for contact form submissions
-- Run this in your Supabase SQL Editor

-- Create student_enquiries table
CREATE TABLE student_enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    course_interest TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint
ALTER TABLE student_enquiries 
ADD CONSTRAINT student_enquiries_institution_id_fkey 
FOREIGN KEY (institution_id) REFERENCES institution_profiles(user_id) ON DELETE CASCADE;

-- Grant permissions
GRANT ALL ON student_enquiries TO anon;
GRANT ALL ON student_enquiries TO authenticated;
GRANT ALL ON student_enquiries TO public;

-- Test insert
INSERT INTO student_enquiries (
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'STUDENT ENQUIRIES TEST',
    'test@example.com',
    'Test Course',
    'Testing student_enquiries table',
    'new'
) RETURNING id, institution_id, student_name, student_email, course_interest, message, status;

-- Clean up
DELETE FROM student_enquiries WHERE student_name = 'STUDENT ENQUIRIES TEST';

SELECT 'STUDENT_ENQUIRIES TABLE CREATED - READY TO USE!' as status;
