-- Check the schema of tutor_profiles table, specifically class_type column
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'tutor_profiles'
AND column_name = 'class_type';

-- Also check if there are any enum types or check constraints
SELECT 
    t.typname AS type_name,
    e.enumlabel AS enum_value
FROM pg_type t
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public' 
AND t.typname LIKE '%class%';
