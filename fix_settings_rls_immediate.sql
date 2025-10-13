-- Immediate fix for Settings page RLS issues
-- This temporarily disables RLS to allow admin access via localStorage

-- Disable RLS on platform_settings table
ALTER TABLE public.platform_settings DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can insert platform settings" ON public.platform_settings;

-- Grant full access to authenticated users
GRANT ALL ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO anon;

-- Ensure default settings exist
INSERT INTO public.platform_settings (platform_name, admin_email, phone_number, footer_text)
SELECT 'LearnsConnect', 'admin@learnsconnect.com', '+1 (555) 123-4567', '© 2024 LearnsConnect. All rights reserved. Empowering education through technology.'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);

-- Verify the setup
SELECT 'RLS disabled on platform_settings' as status;
SELECT 'Current settings:' as info;
SELECT * FROM public.platform_settings;
