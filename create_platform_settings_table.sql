-- Create platform_settings table for admin dashboard settings
-- This table stores platform configuration settings that can be managed by admins

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

-- Enable Row Level Security (RLS)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
-- Allow admins to view settings
CREATE POLICY "Admins can view platform settings" ON public.platform_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to update settings
CREATE POLICY "Admins can update platform settings" ON public.platform_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow admins to insert settings
CREATE POLICY "Admins can insert platform settings" ON public.platform_settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_platform_settings_updated_at 
    BEFORE UPDATE ON public.platform_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.platform_settings_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.platform_settings_id_seq TO anon;
