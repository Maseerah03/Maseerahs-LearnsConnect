-- Fix RLS issues for platform_settings table
-- This script temporarily disables RLS to allow admin access

-- Disable RLS on platform_settings table
ALTER TABLE public.platform_settings DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can insert platform settings" ON public.platform_settings;

-- Grant full access to authenticated users
GRANT ALL ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO anon;

-- Ensure the table has the correct structure
ALTER TABLE public.platform_settings 
ALTER COLUMN platform_name SET DEFAULT 'LearnsConnect',
ALTER COLUMN admin_email SET DEFAULT 'admin@learnsconnect.com',
ALTER COLUMN phone_number SET DEFAULT '+1 (555) 123-4567',
ALTER COLUMN footer_text SET DEFAULT '© 2024 LearnsConnect. All rights reserved. Empowering education through technology.';

-- Insert default settings if table is empty
INSERT INTO public.platform_settings (platform_name, admin_email, phone_number, footer_text)
SELECT 'LearnsConnect', 'admin@learnsconnect.com', '+1 (555) 123-4567', '© 2024 LearnsConnect. All rights reserved. Empowering education through technology.'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);

-- Verify the table structure and data
SELECT 'Table structure:' as info;
\d public.platform_settings;

SELECT 'Current data:' as info;
SELECT * FROM public.platform_settings;
