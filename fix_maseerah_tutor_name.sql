-- Fix Maseerah's name in tutor_profiles table
-- This will copy the full_name from profiles table to tutor_profiles table

-- Update the tutor_profiles table with the name from profiles table
UPDATE tutor_profiles 
SET full_name = (
    SELECT full_name 
    FROM profiles 
    WHERE user_id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82'
)
WHERE user_id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82';

-- Verify the update worked
SELECT 
    user_id,
    full_name,
    bio,
    experience_years,
    teaching_mode,
    subjects
FROM tutor_profiles 
WHERE user_id = 'f7783d23-b9f4-42ca-acc4-4847876b0c82';

-- Show the result
SELECT 
    'SUCCESS: Maseerah should now show as "Maseerah" instead of "Tutor f7783d23"' as message;
