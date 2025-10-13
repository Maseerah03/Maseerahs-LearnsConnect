import { supabase } from "@/integrations/supabase/client";

// Production admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'LearnsConnect2024!',
  email: 'admin@learnsconnect.com'
};

// Admin user ID (matches the one we'll create in the database)
const ADMIN_USER_ID = '488005d7-5af4-447c-a6c8-0b6e4fb65c0f';

export interface AdminSession {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
}

/**
 * Authenticate admin user using Supabase Auth
 */
export const adminLogin = async (username: string, password: string): Promise<boolean> => {
  try {
    // Validate credentials
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return false;
    }

    // Sign in with Supabase Auth using the admin email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password
    });

    if (error) {
      console.error('Admin login error:', error);
      return false;
    }

    if (data.user) {
      // Store session in localStorage as backup
      localStorage.setItem('admin_session', JSON.stringify({
        isAuthenticated: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: 'admin'
        },
        timestamp: Date.now()
      }));

      return true;
    }

    return false;
  } catch (error) {
    console.error('Admin login error:', error);
    return false;
  }
};

/**
 * Check if admin is authenticated
 */
export const isAdminAuthenticated = (): boolean => {
  try {
    // First check Supabase Auth session
    const { data: { session } } = supabase.auth.getSession();
    if (session?.user) {
      return true;
    }

    // Fallback to localStorage
    const sessionData = localStorage.getItem('admin_session');
    if (!sessionData) return false;

    const session = JSON.parse(sessionData);
    const isExpired = Date.now() - session.timestamp > 24 * 60 * 60 * 1000; // 24 hours

    return session.isAuthenticated && !isExpired;
  } catch (error) {
    console.error('Error checking admin authentication:', error);
    return false;
  }
};

/**
 * Get current admin session
 */
export const getAdminSession = (): AdminSession | null => {
  try {
    // First check Supabase Auth session
    const { data: { session } } = supabase.auth.getSession();
    if (session?.user) {
      return {
        isAuthenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email || '',
          role: 'admin'
        }
      };
    }

    // Fallback to localStorage
    const sessionData = localStorage.getItem('admin_session');
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);
    const isExpired = Date.now() - session.timestamp > 24 * 60 * 60 * 1000; // 24 hours

    if (session.isAuthenticated && !isExpired) {
      return session;
    }

    return null;
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
};

/**
 * Logout admin user
 */
export const adminLogout = async (): Promise<void> => {
  try {
    // Sign out from Supabase Auth
    await supabase.auth.signOut();
    
    // Clear localStorage
    localStorage.removeItem('admin_session');
  } catch (error) {
    console.error('Error during admin logout:', error);
  }
};

/**
 * Validate admin session
 */
export const validateAdminSession = async (): Promise<boolean> => {
  try {
    // Check Supabase Auth session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return false;
    }

    if (session?.user) {
      // Verify the user has admin role in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (profileError || !profile) {
        console.error('Admin profile not found:', profileError);
        return false;
      }

      return true;
    }

    // Fallback to localStorage validation
    const sessionData = localStorage.getItem('admin_session');
    if (!sessionData) return false;

    const session = JSON.parse(sessionData);
    const isExpired = Date.now() - session.timestamp > 24 * 60 * 60 * 1000; // 24 hours

    return session.isAuthenticated && !isExpired;
  } catch (error) {
    console.error('Error validating admin session:', error);
    return false;
  }
};

/**
 * Get admin user ID for database operations
 */
export const getAdminUserId = (): string => {
  return ADMIN_USER_ID;
};

/**
 * Check if current user is admin (for RLS policies)
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    return !!profile;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
