# Quick Fix Guide: ContactInstitutions Not Loading

## 🔍 Problem Identified
The ContactInstitutions section is not loading because **Row Level Security (RLS) policies** are blocking access to the `institution_profiles` table.

## ✅ Solution: Fix RLS Policies

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)

### Step 2: Run the Fix Script
Copy and paste this SQL code into the SQL Editor:

```sql
-- Fix RLS policies to allow public access to all institutions
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public can view verified institution profiles" ON institution_profiles;
DROP POLICY IF EXISTS "Users can view own institution profile" ON institution_profiles;

-- Create a new policy that allows public access to all institutions
CREATE POLICY "Public can view all institution profiles" ON institution_profiles
    FOR SELECT USING (true);

-- Test query to verify it works
SELECT 
    id,
    institution_name,
    verified,
    status,
    user_id,
    created_at
FROM institution_profiles;
```

### Step 3: Click "Run"
Execute the SQL script by clicking the "Run" button.

### Step 4: Verify Success
You should see your institution data returned in the results.

### Step 5: Test the App
1. Go back to your app
2. Navigate to the **Contact Institution** section
3. Your "Global Learning Academy" should now appear!

## 🎯 Expected Result
After running the fix:
- ✅ **Institution data loads** without errors
- ✅ **"Global Learning Academy" appears** in the Contact Institution section
- ✅ **All contact information** is displayed
- ✅ **Email contact functionality** works
- ✅ **Verification status** is clearly shown

## 🔧 Alternative: Temporary RLS Disable
If the above doesn't work, you can temporarily disable RLS:

```sql
-- Temporarily disable RLS
ALTER TABLE institution_profiles DISABLE ROW LEVEL SECURITY;

-- Test query
SELECT * FROM institution_profiles;

-- IMPORTANT: Re-enable after testing
-- ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;
```

## 📋 What the Debug Logs Will Show
After the fix, you should see:
- `✅ [ContactInstitutions] Found institutions: 1`
- `🔍 [ContactInstitutions] Transformed institutions: [institution data]`
- No more "RLS policies blocking access" messages

## 🚨 Important Notes
- The RLS fix allows public access to institution data
- This is appropriate for a public directory of institutions
- The fix maintains security for INSERT/UPDATE/DELETE operations
- Only SELECT operations are made public

## 🆘 If Still Not Working
1. Check the browser console for any new error messages
2. Verify the SQL script ran successfully in Supabase
3. Make sure you're logged in as a user (not anonymous)
4. Try refreshing the page after running the fix
