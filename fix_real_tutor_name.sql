-- Fix the real tutor's name in tutor_profiles table
-- This will update the full_name field for the real user so it displays properly

-- First, let's see what we're working with
SELECT 
    tp.user_id,
    tp.full_name as tutor_profiles_name,
    p.full_name as profiles_name,
    p.email
FROM tutor_profiles tp
LEFT JOIN profiles p ON tp.user_id = p.user_id
WHERE tp.user_id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82';

-- Update the tutor_profiles table with the name from profiles table
UPDATE tutor_profiles 
SET full_name = (
    SELECT full_name 
    FROM profiles 
    WHERE user_id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82'
)
WHERE user_id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82';

-- Verify the update
SELECT 
    user_id,
    full_name,
    bio,
    experience_years,
    teaching_mode
FROM tutor_profiles 
WHERE user_id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82';

-- If the profiles table also doesn't have the name, we can set a default
-- Uncomment the following if needed:
/*
UPDATE profiles 
SET full_name = 'Real Tutor User'
WHERE user_id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82' 
AND (full_name IS NULL OR full_name = '');
*/
