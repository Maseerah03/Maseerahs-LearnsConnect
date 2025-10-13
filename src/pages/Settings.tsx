import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw,
  Mail,
  Phone,
  Globe,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface PlatformSettings {
  id?: string;
  platform_name: string;
  admin_email: string;
  phone_number: string;
  footer_text: string;
  created_at?: string;
  updated_at?: string;
}

export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PlatformSettings>({
    platform_name: 'LearnsConnect',
    admin_email: 'admin@learnsconnect.com',
    phone_number: '+1 (555) 123-4567',
    footer_text: '© 2024 LearnsConnect. All rights reserved. Empowering education through technology.'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    
    loadSettings();
  }, [navigate]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Try to load settings from database
      const { data: settingsData, error: settingsError } = await supabase
        .from('platform_settings')
        .select('*')
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - that's okay, we'll use defaults
        console.error('Error loading settings:', settingsError);
        
        // Check if it's an RLS or permission error
        if (settingsError.code === '42501' || settingsError.code === 'PGRST301' || settingsError.message?.includes('row-level security')) {
          toast({
            title: "Permission Error",
            description: "Admin access required. Please run the RLS fix script in Supabase.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Warning",
            description: "Could not load saved settings, using defaults",
            variant: "destructive",
          });
        }
      }

      if (settingsData) {
        setSettings({
          platform_name: settingsData.platform_name || 'LearnsConnect',
          admin_email: settingsData.admin_email || 'admin@learnsconnect.com',
          phone_number: settingsData.phone_number || '+1 (555) 123-4567',
          footer_text: settingsData.footer_text || '© 2024 LearnsConnect. All rights reserved. Empowering education through technology.'
        });
        setLastSaved(new Date(settingsData.updated_at || settingsData.created_at));
      }

      console.log('Settings loaded:', settingsData || 'Using default settings');

    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Warning",
        description: "Could not load saved settings, using defaults",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof PlatformSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      // Validate required fields
      if (!settings.platform_name.trim()) {
        toast({
          title: "Validation Error",
          description: "Platform name is required",
          variant: "destructive",
        });
        return;
      }

      if (!settings.admin_email.trim()) {
        toast({
          title: "Validation Error",
          description: "Admin email is required",
          variant: "destructive",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(settings.admin_email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      const settingsData = {
        platform_name: settings.platform_name.trim(),
        admin_email: settings.admin_email.trim(),
        phone_number: settings.phone_number.trim(),
        footer_text: settings.footer_text.trim(),
        updated_at: new Date().toISOString()
      };

      // Try to update existing settings first
      const { data: existingSettings } = await supabase
        .from('platform_settings')
        .select('id')
        .single();

      let result;
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('platform_settings')
          .update(settingsData)
          .eq('id', existingSettings.id)
          .select()
          .single();
      } else {
        // Insert new settings
        result = await supabase
          .from('platform_settings')
          .insert([{
            ...settingsData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving settings:', result.error);
        
        // Check if it's an RLS or permission error
        if (result.error.code === '42501' || result.error.message?.includes('row-level security')) {
          toast({
            title: "Permission Error",
            description: "Admin access required. Please run the RLS fix script in Supabase.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to save settings. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      setHasChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "Settings Saved",
        description: "Platform settings have been updated successfully",
      });

      console.log('Settings saved successfully:', result.data);

    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({
      platform_name: 'LearnsConnect',
      admin_email: 'admin@learnsconnect.com',
      phone_number: '+1 (555) 123-4567',
      footer_text: '© 2024 LearnsConnect. All rights reserved. Empowering education through technology.'
    });
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Platform Settings</h1>
                <p className="text-xs text-gray-500">Configure platform information</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {lastSaved && (
                <div className="text-sm text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadSettings}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/admin/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Platform Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Platform Name */}
            <div className="space-y-2">
              <Label htmlFor="platform_name" className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-600" />
                <span>Platform Name</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="platform_name"
                value={settings.platform_name}
                onChange={(e) => handleInputChange('platform_name', e.target.value)}
                placeholder="Enter platform name"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                This will be displayed as the main platform name throughout the application
              </p>
            </div>

            {/* Admin Email */}
            <div className="space-y-2">
              <Label htmlFor="admin_email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <span>Admin Email</span>
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="admin_email"
                type="email"
                value={settings.admin_email}
                onChange={(e) => handleInputChange('admin_email', e.target.value)}
                placeholder="admin@example.com"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Primary contact email for platform administration
              </p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone_number"
                value={settings.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Contact phone number for platform support
              </p>
            </div>

            {/* Footer Text */}
            <div className="space-y-2">
              <Label htmlFor="footer_text" className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span>Footer Text</span>
              </Label>
              <Textarea
                id="footer_text"
                value={settings.footer_text}
                onChange={(e) => handleInputChange('footer_text', e.target.value)}
                placeholder="Enter footer text"
                className="w-full min-h-[100px]"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                This text will appear in the footer of the platform
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center space-x-4">
                {hasChanges && (
                  <div className="flex items-center space-x-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">You have unsaved changes</span>
                  </div>
                )}
                {!hasChanges && lastSaved && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">All changes saved</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleResetSettings}
                  disabled={isSaving}
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving || !hasChanges}
                  className="flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Settings Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Platform Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Platform Name:</strong> {settings.platform_name}</div>
                  <div><strong>Admin Email:</strong> {settings.admin_email}</div>
                  <div><strong>Phone:</strong> {settings.phone_number}</div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Footer Preview</h3>
                <div className="text-sm text-gray-600 border-t pt-2">
                  {settings.footer_text}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
