
import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise use placeholder values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key-for-development-only';

// Skip the validation check in development mode to avoid breaking the app
const isProd = import.meta.env.PROD;
if (isProd && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'volunteer' | 'nonprofit' | 'admin';

export interface UserMetadata {
  role?: UserRole;
  organization_name?: string;
}
