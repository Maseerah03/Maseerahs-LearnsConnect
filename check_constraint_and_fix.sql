-- First, let's check what the exact constraint is for class_type
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'tutor_profiles'::regclass 
AND contype = 'c'
AND conname LIKE '%class_type%';

-- Also check if there are any existing values in the table
SELECT DISTINCT class_type FROM tutor_profiles LIMIT 10;
