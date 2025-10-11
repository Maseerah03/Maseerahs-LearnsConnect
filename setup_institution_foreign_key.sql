-- Quick setup script to establish foreign key relationship for institution_profiles
-- Run this in your Supabase SQL editor

-- Step 1: Add foreign key constraint
ALTER TABLE institution_profiles 
ADD CONSTRAINT institution_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Add unique constraint on user_id
ALTER TABLE institution_profiles 
ADD CONSTRAINT institution_profiles_user_id_unique UNIQUE (user_id);

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_institution_profiles_user_id ON institution_profiles(user_id);

-- Step 4: Verify the constraint was created
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
SELECT 'Foreign key relationship established successfully!' as status;
