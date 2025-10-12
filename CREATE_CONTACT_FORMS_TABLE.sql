-- Create a new table specifically for contact forms
-- Run this in your Supabase SQL Editor

-- Create contact_forms table
CREATE TABLE contact_forms (
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
ALTER TABLE contact_forms 
ADD CONSTRAINT contact_forms_institution_id_fkey 
FOREIGN KEY (institution_id) REFERENCES institution_profiles(user_id) ON DELETE CASCADE;

-- Grant permissions
GRANT ALL ON contact_forms TO anon;
GRANT ALL ON contact_forms TO authenticated;
GRANT ALL ON contact_forms TO public;

-- Test insert
INSERT INTO contact_forms (
    institution_id,
    student_name,
    student_email,
    course_interest,
    message,
    status
) VALUES (
    (SELECT user_id FROM institution_profiles LIMIT 1),
    'NEW TABLE TEST',
    'test@example.com',
    'Test Course',
    'Testing new contact_forms table',
    'new'
) RETURNING id, institution_id, student_name, student_email, course_interest, message, status;

-- Clean up
DELETE FROM contact_forms WHERE student_name = 'NEW TABLE TEST';

SELECT 'CONTACT_FORMS TABLE CREATED - READY TO USE!' as status;
