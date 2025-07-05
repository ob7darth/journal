import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

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

export interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  message_type: 'message' | 'prayer' | 'encouragement';
  created_at: string;
  reactions?: ChatReaction[];
}

export interface ChatReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction_type: 'like' | 'heart' | 'wow' | 'pray';
  created_at: string;
}