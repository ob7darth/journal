import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Check if Supabase is configured
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  isValidUrl(supabaseUrl)
);

// Create Supabase client only if configured
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Helper function to check if Supabase operations are available
export const canUseSupabase = (): boolean => {
  return isSupabaseConfigured && supabase !== null;
};

// Database types
export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
}

export interface SOAPEntry {
  id: string;
  user_id: string;
  day: number;
  scripture: string;
  observation: string;
  application: string;
  prayer: string;
  created_at: string;
  updated_at: string;
}

export interface PrayerRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_anonymous: boolean;
  is_public: boolean;
  is_answered: boolean;
  answered_at?: string;
  answer_description?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface PrayerResponse {
  id: string;
  prayer_request_id: string;
  user_id: string;
  response_type: 'praying' | 'encouragement' | 'testimony';
  message: string;
  created_at: string;
}