-- Verify the institution so it can be displayed in the Contact Institution section
-- Run this in your Supabase SQL editor

-- First, check the current status
SELECT 
    id,
    institution_name,
    verified,
    status,
    created_at
FROM institution_profiles;

-- Update the institution to be verified
UPDATE institution_profiles 
SET verified = true, status = 'approved'
WHERE institution_name = 'Global Learning Academy';

-- Verify the update
SELECT 
    id,
    institution_name,
    verified,
    status,
    updated_at
FROM institution_profiles
WHERE institution_name = 'Global Learning Academy';

-- Success message
SELECT 'Institution verified successfully! It should now appear in the Contact Institution section.' as status;
