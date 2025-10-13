-- Check what values are allowed for class_type in tutor_profiles table
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'tutor_profiles'::regclass 
AND contype = 'c'
AND conname LIKE '%class_type%';
