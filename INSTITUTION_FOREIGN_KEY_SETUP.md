# Institution Profiles Foreign Key Setup

This guide explains how to establish a foreign key relationship between `institution_profiles` and `auth.users` in your Supabase database.

## Problem
The ContactInstitutions component was failing with a 400 Bad Request error because Supabase couldn't find a foreign key relationship between `institution_profiles.user_id` and `auth.users.id`.

## Solution
We need to add a foreign key constraint to establish the proper relationship in the database schema.

## Migration Files Created

### 1. `setup_institution_foreign_key.sql` (Quick Setup)
A simple script that adds the foreign key constraint. Run this in your Supabase SQL editor.

### 2. `supabase/migrations/add_institution_profiles_foreign_key.sql` (Safe Migration)
A comprehensive migration that checks for existing constraints before adding new ones.

### 3. `supabase/migrations/ensure_institution_profiles_structure.sql` (Complete Setup)
A full migration that creates the table structure and all necessary constraints.

## How to Run the Migration

### Option 1: Quick Setup (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `setup_institution_foreign_key.sql`
4. Run the script

### Option 2: Using Supabase CLI
If you have the Supabase CLI installed:
```bash
supabase db push
```

### Option 3: Manual Migration
1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/ensure_institution_profiles_structure.sql`
4. Run the script

## What the Migration Does

1. **Adds Foreign Key Constraint**: Links `institution_profiles.user_id` to `auth.users.id`
2. **Adds Unique Constraint**: Ensures each user can only have one institution profile
3. **Creates Indexes**: Improves query performance
4. **Sets up RLS Policies**: Enables Row Level Security
5. **Adds Triggers**: Automatically updates `updated_at` timestamp

## Verification

After running the migration, you can verify it worked by running this query in your Supabase SQL editor:

```sql
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
```

This should return a row showing the foreign key relationship.

## Expected Result

After the migration:
- The ContactInstitutions component will be able to use join queries
- Supabase will recognize the relationship between `institution_profiles` and `profiles`
- The component will fall back to separate queries if the join fails
- Better performance with proper indexing

## Troubleshooting

If you encounter any issues:

1. **Check if the table exists**: Make sure `institution_profiles` table exists in your database
2. **Check user_id column**: Ensure the `user_id` column exists in the table
3. **Check existing constraints**: The migration will skip if constraints already exist
4. **Check permissions**: Make sure you have the necessary permissions to alter the table

## Code Changes

The ContactInstitutions component has been updated to:
1. Try join queries first (will work after migration)
2. Fall back to separate queries if joins fail
3. Provide comprehensive error logging
4. Handle both data structures gracefully

## Next Steps

1. Run the migration in your Supabase database
2. Test the ContactInstitutions section in your app
3. The component should now successfully fetch and display institution data
4. Check the browser console for detailed logging of the fetching process
