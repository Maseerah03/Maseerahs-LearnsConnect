-- Fix profile columns if they don't exist
-- Run this if verification_status or profile_completion columns are missing

-- 1. Add verification_status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'verification_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN verification_status TEXT DEFAULT 'pending';
        UPDATE profiles SET verification_status = 'pending' WHERE verification_status IS NULL;
    END IF;
END $$;

-- 2. Add profile_completion column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'profile_completion'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN profile_completion INTEGER DEFAULT 0;
        UPDATE profiles SET profile_completion = 0 WHERE profile_completion IS NULL;
    END IF;
END $$;

-- 3. Add location column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'location'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN location TEXT;
    END IF;
END $$;

-- 4. Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
  AND column_name IN ('verification_status', 'profile_completion', 'location')
ORDER BY column_name;

-- 5. Update existing profiles with default values
UPDATE profiles 
SET verification_status = 'pending' 
WHERE verification_status IS NULL;

UPDATE profiles 
SET profile_completion = 0 
WHERE profile_completion IS NULL;

-- 6. Check the updated data
SELECT 
    user_id,
    full_name,
    email,
    role,
    verification_status,
    profile_completion,
    location
FROM profiles 
LIMIT 5;
