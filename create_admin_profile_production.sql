-- Create admin profile for production-level authentication
-- This script creates a proper admin profile in the profiles table

-- First, let's check if there are any existing users in auth.users
SELECT 'Current auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Check existing profiles
SELECT 'Current profiles:' as info;
SELECT user_id, full_name, email, role, created_at FROM profiles ORDER BY created_at;

-- Create admin profile for the admin user
-- We'll use a specific admin user ID that matches your admin credentials
-- Since you're using localStorage admin auth, we need to create a profile that can be linked

-- Create admin profile with your actual user ID
INSERT INTO profiles (
    user_id,
    full_name,
    email,
    role,
    phone,
    bio,
    created_at,
    updated_at
) VALUES (
    '488005d7-5af4-447c-a6c8-0b6e4fb65c0f'::uuid,  -- Your actual admin user ID
    'System Administrator',
    'admin@learnsconnect.com',
    'admin',
    15551234567,  -- Phone as bigint (removed formatting)
    'System administrator with full platform access',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    bio = EXCLUDED.bio,
    updated_at = NOW();

-- Option 2: If you want to use an existing auth.users ID, uncomment and modify this:
-- INSERT INTO profiles (
--     user_id,
--     full_name,
--     email,
--     role,
--     phone,
--     bio,
--     created_at,
--     updated_at
-- ) VALUES (
--     'YOUR_EXISTING_AUTH_USER_ID_HERE',  -- Replace with actual auth.users ID
--     'System Administrator',
--     'admin@learnsconnect.com',
--     'admin',
--     '+1 (555) 123-4567',
--     'System administrator with full platform access',
--     NOW(),
--     NOW()
-- ) ON CONFLICT (user_id) DO UPDATE SET
--     full_name = EXCLUDED.full_name,
--     email = EXCLUDED.email,
--     role = EXCLUDED.role,
--     phone = EXCLUDED.phone,
--     bio = EXCLUDED.bio,
--     updated_at = NOW();

-- Verify the admin profile was created
SELECT 'Admin profile created:' as info;
SELECT user_id, full_name, email, role, created_at FROM profiles WHERE role = 'admin';

-- Now let's set up proper RLS policies for platform_settings
-- First, enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can insert platform settings" ON public.platform_settings;

-- Create new RLS policies that work with the admin profile
-- Policy for SELECT (viewing settings)
CREATE POLICY "Admins can view platform settings" ON public.platform_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy for UPDATE (updating settings)
CREATE POLICY "Admins can update platform settings" ON public.platform_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy for INSERT (creating settings)
CREATE POLICY "Admins can insert platform settings" ON public.platform_settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.platform_settings_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.platform_settings_id_seq TO anon;

-- Insert default settings if table is empty
INSERT INTO public.platform_settings (platform_name, admin_email, phone_number, footer_text)
SELECT 'LearnsConnect', 'admin@learnsconnect.com', '+1 (555) 123-4567', '© 2024 Ellen Information Technology Solutions Pvt. Ltd. All rights reserved. Empowering education through technology.'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);

-- Verify everything is set up correctly
SELECT 'Final verification:' as info;
SELECT 'Admin profiles:' as check_type, COUNT(*) as count FROM profiles WHERE role = 'admin'
UNION ALL
SELECT 'Platform settings:' as check_type, COUNT(*) as count FROM platform_settings
UNION ALL
SELECT 'RLS enabled:' as check_type, CASE WHEN relrowsecurity THEN 1 ELSE 0 END as count FROM pg_class WHERE relname = 'platform_settings';
