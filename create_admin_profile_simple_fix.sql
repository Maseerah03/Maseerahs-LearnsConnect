-- Simple admin profile creation (avoiding phone column issues)
-- This script creates the admin profile with minimal required fields

-- First, let's check the profiles table structure
SELECT 'Profiles table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Create admin profile with your actual user ID (without phone to avoid type issues)
INSERT INTO profiles (
    user_id,
    full_name,
    email,
    role,
    bio,
    created_at,
    updated_at
) VALUES (
    '488005d7-5af4-447c-a6c8-0b6e4fb65c0f'::uuid,  -- Your actual admin user ID
    'System Administrator',
    'admin@learnsconnect.com',
    'admin',
    'System administrator with full platform access',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    bio = EXCLUDED.bio,
    updated_at = NOW();

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
