-- Create institution_student_enquiries table immediately
-- Run this in your Supabase SQL editor

-- Create the table
CREATE TABLE institution_student_enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    course_interest TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint
ALTER TABLE institution_student_enquiries 
ADD CONSTRAINT institution_student_enquiries_institution_id_fkey 
FOREIGN KEY (institution_id) REFERENCES institution_profiles(user_id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE institution_student_enquiries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can create enquiries" ON institution_student_enquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Institutions can view their enquiries" ON institution_student_enquiries
    FOR SELECT USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Institutions can update enquiry status" ON institution_student_enquiries
    FOR UPDATE USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Verify table was created
SELECT 'Table created successfully!' as status;
