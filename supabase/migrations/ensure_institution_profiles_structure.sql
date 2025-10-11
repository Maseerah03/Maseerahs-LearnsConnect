-- Ensure institution_profiles table has proper structure and foreign key relationships
-- This migration creates the table if it doesn't exist and adds proper constraints

-- Create institution_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS institution_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    institution_name TEXT NOT NULL,
    institution_type TEXT,
    other_institution_type TEXT,
    established_year INTEGER,
    registration_number TEXT,
    pan_number TEXT,
    gst_number TEXT,
    official_email TEXT,
    primary_contact TEXT,
    secondary_contact TEXT,
    website_url TEXT,
    complete_address TEXT,
    city TEXT,
    state TEXT,
    pin_code TEXT,
    landmark TEXT,
    map_location TEXT,
    owner_director_name TEXT,
    owner_contact_number TEXT,
    business_license_file TEXT,
    registration_certificate_file TEXT,
    agree_to_terms BOOLEAN DEFAULT FALSE,
    agree_to_background_verification BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'institution_profiles_user_id_fkey' 
        AND table_name = 'institution_profiles'
    ) THEN
        ALTER TABLE institution_profiles 
        ADD CONSTRAINT institution_profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint added to institution_profiles.user_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists on institution_profiles.user_id';
    END IF;
END $$;

-- Add unique constraint on user_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'institution_profiles_user_id_unique' 
        AND table_name = 'institution_profiles'
    ) THEN
        ALTER TABLE institution_profiles 
        ADD CONSTRAINT institution_profiles_user_id_unique UNIQUE (user_id);
        
        RAISE NOTICE 'Unique constraint added to institution_profiles.user_id';
    ELSE
        RAISE NOTICE 'Unique constraint already exists on institution_profiles.user_id';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_institution_profiles_user_id ON institution_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_institution_name ON institution_profiles(institution_name);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_city ON institution_profiles(city);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_state ON institution_profiles(state);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_verified ON institution_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_created_at ON institution_profiles(created_at);

-- Enable Row Level Security
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view all institution profiles" ON institution_profiles;
CREATE POLICY "Users can view all institution profiles" ON institution_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own institution profile" ON institution_profiles;
CREATE POLICY "Users can insert their own institution profile" ON institution_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own institution profile" ON institution_profiles;
CREATE POLICY "Users can update their own institution profile" ON institution_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own institution profile" ON institution_profiles;
CREATE POLICY "Users can delete their own institution profile" ON institution_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_institution_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_institution_profiles_updated_at ON institution_profiles;
CREATE TRIGGER update_institution_profiles_updated_at
    BEFORE UPDATE ON institution_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_institution_profiles_updated_at();

-- Grant permissions
GRANT ALL ON institution_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify the table structure and constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'institution_profiles'
ORDER BY ordinal_position;

-- Verify foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'institution_profiles';

-- Success message
SELECT 'Institution profiles table structure and foreign key relationships established successfully!' as status;
