import { supabase, type SOAPEntry as DBSOAPEntry } from '../lib/supabase';
import { supabaseAuthService } from './SupabaseAuthService';
import type { SOAPEntry } from '../types/SOAPEntry';

class SupabaseSOAPService {
  async saveEntry(day: number, entry: Omit<SOAPEntry, 'day'>): Promise<void> {
    const user = supabaseAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (user.isGuest) {
      // For guest users, save to localStorage
      const entries = this.getLocalEntries();
      entries[day] = {
        day,
        ...entry
      };
      localStorage.setItem('soap-entries', JSON.stringify(entries));
      return;
    }

    // For authenticated users, save to Supabase
    const { error } = await supabase
      .from('soap_entries')
      .upsert({
        user_id: user.id,
        day,
        scripture: entry.scripture,
        observation: entry.observation,
        application: entry.application,
        prayer: entry.prayer
      });

    if (error) {
      throw new Error(`Failed to save SOAP entry: ${error.message}`);
    }
  }

  async getEntry(day: number): Promise<SOAPEntry | null> {
    const user = supabaseAuthService.getCurrentUser();
    if (!user) {
      return null;
    }

    if (user.isGuest) {
      // For guest users, get from localStorage
      const entries = this.getLocalEntries();
      return entries[day] || null;
    }

    // For authenticated users, get from Supabase
    const { data, error } = await supabase
      .from('soap_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('day', day)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching SOAP entry:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      day: data.day,
      scripture: data.scripture,
      observation: data.observation,
      application: data.application,
      prayer: data.prayer,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async getAllEntries(): Promise<Record<number, SOAPEntry>> {
    const user = supabaseAuthService.getCurrentUser();
    if (!user) {
      return {};
    }

    if (user.isGuest) {
      // For guest users, get from localStorage
      return this.getLocalEntries();
    }

    // For authenticated users, get from Supabase
    const { data, error } = await supabase
      .from('soap_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('day');

    if (error) {
      console.error('Error fetching SOAP entries:', error);
      return {};
    }

    const entries: Record<number, SOAPEntry> = {};
    data.forEach((entry) => {
      entries[entry.day] = {
        day: entry.day,
        scripture: entry.scripture,
        observation: entry.observation,
        application: entry.application,
        prayer: entry.prayer,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at
      };
    });

    return entries;
  }

  private getLocalEntries(): Record<number, SOAPEntry> {
    const stored = localStorage.getItem('soap-entries');
    if (!stored) {
      return {};
    }

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing local SOAP entries:', error);
      return {};
    }
  }

  // Subscribe to real-time changes for authenticated users
  subscribeToChanges(callback: (entries: Record<number, SOAPEntry>) => void) {
    const user = supabaseAuthService.getCurrentUser();
    if (!user || user.isGuest) {
      return null;
    }

    const subscription = supabase
      .channel('soap_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'soap_entries',
          filter: `user_id=eq.${user.id}`
        },
        async () => {
          // Refetch all entries when changes occur
          const entries = await this.getAllEntries();
          callback(entries);
        }
      )
      .subscribe();

    return subscription;
  }
}

export const supabaseSOAPService = new SupabaseSOAPService();