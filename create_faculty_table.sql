-- Create Faculty Table for Institution Dashboard
-- This table will store faculty member information

-- Create the faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject_expertise TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_institution_id ON faculty(institution_id);
CREATE INDEX IF NOT EXISTS idx_faculty_email ON faculty(email);

-- Enable Row Level Security (RLS)
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Institutions can only see their own faculty
CREATE POLICY "Institutions can view their own faculty" ON faculty
  FOR SELECT USING (institution_id = auth.uid());

-- Policy: Institutions can insert their own faculty
CREATE POLICY "Institutions can insert their own faculty" ON faculty
  FOR INSERT WITH CHECK (institution_id = auth.uid());

-- Policy: Institutions can update their own faculty
CREATE POLICY "Institutions can update their own faculty" ON faculty
  FOR UPDATE USING (institution_id = auth.uid());

-- Policy: Institutions can delete their own faculty
CREATE POLICY "Institutions can delete their own faculty" ON faculty
  FOR DELETE USING (institution_id = auth.uid());

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_faculty_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_faculty_updated_at_trigger
  BEFORE UPDATE ON faculty
  FOR EACH ROW
  EXECUTE FUNCTION update_faculty_updated_at();

-- Grant necessary permissions
GRANT ALL ON faculty TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Insert some sample data for testing (optional)
-- INSERT INTO faculty (institution_id, name, subject_expertise, email, contact_number) VALUES
-- ('your-institution-user-id', 'Dr. John Smith', 'Mathematics', 'john.smith@institution.edu', '+1-555-123-4567'),
-- ('your-institution-user-id', 'Dr. Jane Doe', 'Physics', 'jane.doe@institution.edu', '+1-555-987-6543');
