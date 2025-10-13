-- Clean admin profile creation script
-- This script creates the admin profile and sets up platform_settings

-- Create admin profile with your actual user ID
INSERT INTO profiles (
    user_id,
    full_name,
    email,
    role,
    bio,
    created_at,
    updated_at
) VALUES (
    '488005d7-5af4-447c-a6c8-0b6e4fb65c0f'::uuid,
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

-- Verify admin profile was created
SELECT user_id, full_name, email, role FROM profiles WHERE role = 'admin';

-- Enable RLS on platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can insert platform settings" ON public.platform_settings;

-- Create RLS policies
CREATE POLICY "Admins can view platform settings" ON public.platform_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update platform settings" ON public.platform_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert platform settings" ON public.platform_settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO anon;

-- Insert default settings
INSERT INTO public.platform_settings (platform_name, admin_email, phone_number, footer_text)
SELECT 'LearnsConnect', 'admin@learnsconnect.com', '+1 (555) 123-4567', '© 2024 Ellen Information Technology Solutions Pvt. Ltd. All rights reserved. Empowering education through technology.'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);

-- Final verification
SELECT 'Setup complete' as status;
SELECT COUNT(*) as admin_profiles FROM profiles WHERE role = 'admin';
SELECT COUNT(*) as platform_settings FROM platform_settings;
