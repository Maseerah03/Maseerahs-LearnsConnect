-- Create platform_settings table for admin dashboard settings (Simple version)
-- This version temporarily disables RLS to avoid authentication issues

-- Create the table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id SERIAL PRIMARY KEY,
    platform_name TEXT NOT NULL DEFAULT 'LearnsConnect',
    admin_email TEXT NOT NULL DEFAULT 'admin@learnsconnect.com',
    phone_number TEXT DEFAULT '+1 (555) 123-4567',
    footer_text TEXT DEFAULT '© 2024 LearnsConnect. All rights reserved. Empowering education through technology.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.platform_settings (platform_name, admin_email, phone_number, footer_text)
VALUES (
    'LearnsConnect',
    'admin@learnsconnect.com',
    '+1 (555) 123-4567',
    '© 2024 LearnsConnect. All rights reserved. Empowering education through technology.'
)
ON CONFLICT DO NOTHING;

-- Temporarily disable RLS for admin access
ALTER TABLE public.platform_settings DISABLE ROW LEVEL SECURITY;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON public.platform_settings;
CREATE TRIGGER update_platform_settings_updated_at 
    BEFORE UPDATE ON public.platform_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.platform_settings_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.platform_settings_id_seq TO anon;
