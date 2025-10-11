-- Add Foreign Key Relationship between institution_profiles and auth.users
-- This migration establishes the proper foreign key relationship for institution_profiles.user_id

-- First, check if the institution_profiles table exists and has the user_id column
DO $$ 
BEGIN
    -- Check if institution_profiles table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'institution_profiles') THEN
        -- Check if user_id column exists
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'user_id') THEN
            -- Check if foreign key constraint already exists
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'institution_profiles_user_id_fkey' 
                AND table_name = 'institution_profiles'
            ) THEN
                -- Add the foreign key constraint
                ALTER TABLE institution_profiles 
                ADD CONSTRAINT institution_profiles_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
                
                RAISE NOTICE 'Foreign key constraint added successfully';
            ELSE
                RAISE NOTICE 'Foreign key constraint already exists';
            END IF;
        ELSE
            RAISE NOTICE 'user_id column does not exist in institution_profiles table';
        END IF;
    ELSE
        RAISE NOTICE 'institution_profiles table does not exist';
    END IF;
END $$;

-- Create an index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_institution_profiles_user_id ON institution_profiles(user_id);

-- Verify the foreign key relationship was created
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
    AND tc.table_name = 'institution_profiles'
    AND kcu.column_name = 'user_id';

-- Success message
SELECT 'Foreign key relationship established between institution_profiles.user_id and auth.users.id' as status;
