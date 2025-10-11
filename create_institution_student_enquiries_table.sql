-- Create institution_student_enquiries table
-- Run this in your Supabase SQL editor

-- Create the table with the exact structure you provided
CREATE TABLE IF NOT EXISTS institution_student_enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT,
    course_interest TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to institution_profiles
ALTER TABLE institution_student_enquiries 
ADD CONSTRAINT institution_student_enquiries_institution_id_fkey 
FOREIGN KEY (institution_id) REFERENCES institution_profiles(user_id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_institution_student_enquiries_institution_id ON institution_student_enquiries(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_student_enquiries_status ON institution_student_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_institution_student_enquiries_created_at ON institution_student_enquiries(created_at);

-- Enable Row Level Security
ALTER TABLE institution_student_enquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- 1. Students can create enquiries
CREATE POLICY "Students can create enquiries" ON institution_student_enquiries
    FOR INSERT WITH CHECK (true);

-- 2. Institutions can view enquiries sent to them
CREATE POLICY "Institutions can view their enquiries" ON institution_student_enquiries
    FOR SELECT USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- 3. Institutions can update enquiry status
CREATE POLICY "Institutions can update enquiry status" ON institution_student_enquiries
    FOR UPDATE USING (
        institution_id IN (
            SELECT user_id FROM institution_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- Verify the table was created
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institution_student_enquiries'
ORDER BY ordinal_position;

-- Verify the policies were created
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'institution_student_enquiries'
ORDER BY policyname;

-- Success message
SELECT 'institution_student_enquiries table created successfully with RLS policies!' as status;
