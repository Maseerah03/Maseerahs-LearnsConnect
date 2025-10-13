-- Setup admin user in Supabase Auth for production
-- This script creates the admin user in auth.users table

-- Note: This script should be run in Supabase Dashboard > Authentication > Users
-- Or you can create the user manually through the Supabase Dashboard

-- The admin user should be created with these details:
-- Email: admin@learnsconnect.com
-- Password: LearnsConnect2024!
-- User ID: 00000000-0000-0000-0000-000000000001 (optional, can be auto-generated)

-- After creating the user in Supabase Auth, run the create_admin_profile_production.sql script
-- to create the corresponding profile in the profiles table

-- Verify the setup by running this query:
SELECT 'Auth users check:' as info;
SELECT id, email, created_at, email_confirmed_at FROM auth.users WHERE email = 'admin@learnsconnect.com';

-- Check if admin profile exists
SELECT 'Admin profile check:' as info;
SELECT user_id, full_name, email, role FROM profiles WHERE role = 'admin';

-- Instructions for manual setup:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" or "Invite user"
-- 3. Enter email: admin@learnsconnect.com
-- 4. Enter password: LearnsConnect2024!
-- 5. Set email_confirmed_at to current timestamp
-- 6. Save the user
-- 7. Copy the user ID and update the create_admin_profile_production.sql script
-- 8. Run the create_admin_profile_production.sql script

-- Alternative: Use Supabase CLI or API to create the user programmatically
-- This would require additional setup and is more complex
