-- Simple Faculty Table Creation
-- Use this if you want to create the table without dropping existing data

-- Check if table exists, if not create it
DO $$
BEGIN
    -- Create the faculty table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'faculty') THEN
        CREATE TABLE faculty (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            institution_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            subject_expertise TEXT NOT NULL,
            email TEXT NOT NULL,
            contact_number TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_faculty_institution_id ON faculty(institution_id);
        CREATE INDEX idx_faculty_email ON faculty(email);
        
        -- Enable RLS
        ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Institutions can view their own faculty" ON faculty
            FOR SELECT USING (institution_id = auth.uid());
            
        CREATE POLICY "Institutions can insert their own faculty" ON faculty
            FOR INSERT WITH CHECK (institution_id = auth.uid());
            
        CREATE POLICY "Institutions can update their own faculty" ON faculty
            FOR UPDATE USING (institution_id = auth.uid());
            
        CREATE POLICY "Institutions can delete their own faculty" ON faculty
            FOR DELETE USING (institution_id = auth.uid());
        
        -- Grant permissions
        GRANT ALL ON faculty TO authenticated;
        
        RAISE NOTICE 'Faculty table created successfully';
    ELSE
        RAISE NOTICE 'Faculty table already exists';
    END IF;
END $$;

-- Create the update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_faculty_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_faculty_updated_at_trigger') THEN
        CREATE TRIGGER update_faculty_updated_at_trigger
            BEFORE UPDATE ON faculty
            FOR EACH ROW
            EXECUTE FUNCTION update_faculty_updated_at();
    END IF;
END $$;
