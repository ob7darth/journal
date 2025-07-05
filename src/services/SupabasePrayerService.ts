import { supabase } from '../lib/supabase';
import { supabaseAuthService } from './SupabaseAuthService';

export interface PrayerRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  isAnonymous: boolean;
  isAnswered: boolean;
  answeredAt?: string;
  answerDescription?: string;
  expiresAt: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerResponse {
  id: string;
  prayerRequestId: string;
  userId: string;
  responseType: 'praying' | 'encouragement' | 'testimony';
  message: string;
  createdAt: string;
}

class SupabasePrayerService {
  async submitPrayerRequest(
    title: string,
    description: string,
    isAnonymous: boolean = false,
    isPublic: boolean = true
  ): Promise<PrayerRequest> {
    const user = supabaseAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (user.isGuest) {
      // For guest users, store in localStorage
      const guestRequests = this.getGuestRequests();
      const newRequest: PrayerRequest = {
        id: Date.now().toString(),
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        isAnonymous,
        isAnswered: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        isPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      guestRequests.push(newRequest);
      localStorage.setItem('guest-prayer-requests', JSON.stringify(guestRequests));
      return newRequest;
    }

    // For authenticated users, save to Supabase
    const { data, error } = await supabase
      .from('prayer_requests')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        is_anonymous: isAnonymous,
        is_public: isPublic
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit prayer request: ${error.message}`);
    }

    return this.transformDBPrayerRequest(data);
  }

  async getPrayerRequests(limit: number = 10): Promise<PrayerRequest[]> {
    const user = supabaseAuthService.getCurrentUser();
    
    if (!user || user.isGuest) {
      // For guest users, get from localStorage with sample data
      const guestRequests = this.getGuestRequests();
      const sampleRequests = this.getSampleRequests();
      
      return [...guestRequests, ...sampleRequests]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    }

    // For authenticated users, get from Supabase
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('is_public', true)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch prayer requests: ${error.message}`);
    }

    return data.map(this.transformDBPrayerRequest);
  }

  async respondToPrayerRequest(
    prayerRequestId: string,
    responseType: 'praying' | 'encouragement' | 'testimony',
    message: string = ''
  ): Promise<PrayerResponse> {
    const user = supabaseAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (user.isGuest) {
      // For guest users, store in localStorage
      const guestResponses = this.getGuestResponses();
      const newResponse: PrayerResponse = {
        id: Date.now().toString(),
        prayerRequestId,
        userId: user.id,
        responseType,
        message: message.trim(),
        createdAt: new Date().toISOString()
      };
      
      guestResponses.push(newResponse);
      localStorage.setItem('guest-prayer-responses', JSON.stringify(guestResponses));
      return newResponse;
    }

    // For authenticated users, save to Supabase
    const { data, error } = await supabase
      .from('prayer_responses')
      .insert({
        prayer_request_id: prayerRequestId,
        user_id: user.id,
        response_type: responseType,
        message: message.trim()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit prayer response: ${error.message}`);
    }

    return this.transformDBPrayerResponse(data);
  }

  async markPrayerAnswered(
    prayerRequestId: string,
    answerDescription: string
  ): Promise<void> {
    const user = supabaseAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (user.isGuest) {
      // For guest users, update localStorage
      const guestRequests = this.getGuestRequests();
      const requestIndex = guestRequests.findIndex(r => r.id === prayerRequestId && r.userId === user.id);
      
      if (requestIndex >= 0) {
        guestRequests[requestIndex].isAnswered = true;
        guestRequests[requestIndex].answeredAt = new Date().toISOString();
        guestRequests[requestIndex].answerDescription = answerDescription.trim();
        guestRequests[requestIndex].updatedAt = new Date().toISOString();
        
        localStorage.setItem('guest-prayer-requests', JSON.stringify(guestRequests));
      }
      return;
    }

    // For authenticated users, update in Supabase
    const { error } = await supabase
      .from('prayer_requests')
      .update({
        is_answered: true,
        answered_at: new Date().toISOString(),
        answer_description: answerDescription.trim()
      })
      .eq('id', prayerRequestId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to mark prayer as answered: ${error.message}`);
    }
  }

  private transformDBPrayerRequest(data: any): PrayerRequest {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      isAnonymous: data.is_anonymous,
      isAnswered: data.is_answered,
      answeredAt: data.answered_at,
      answerDescription: data.answer_description,
      expiresAt: data.expires_at,
      isPublic: data.is_public,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private transformDBPrayerResponse(data: any): PrayerResponse {
    return {
      id: data.id,
      prayerRequestId: data.prayer_request_id,
      userId: data.user_id,
      responseType: data.response_type,
      message: data.message,
      createdAt: data.created_at
    };
  }

  private getGuestRequests(): PrayerRequest[] {
    const stored = localStorage.getItem('guest-prayer-requests');
    return stored ? JSON.parse(stored) : [];
  }

  private getGuestResponses(): PrayerResponse[] {
    const stored = localStorage.getItem('guest-prayer-responses');
    return stored ? JSON.parse(stored) : [];
  }

  private getSampleRequests(): PrayerRequest[] {
    return [
      {
        id: 'sample-1',
        userId: 'sample-user-1',
        title: 'Healing for my grandmother',
        description: 'Please pray for my grandmother who is in the hospital. She needs strength and healing during this difficult time.',
        isAnonymous: false,
        isAnswered: false,
        expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        isPublic: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'sample-2',
        userId: 'sample-user-2',
        title: 'Job interview tomorrow',
        description: 'I have an important job interview tomorrow. Praying for peace, wisdom, and God\'s will to be done.',
        isAnonymous: true,
        isAnswered: false,
        expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
        isPublic: true,
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString()
      },
      {
        id: 'sample-3',
        userId: 'sample-user-3',
        title: 'Marriage restoration',
        description: 'Please pray for healing and restoration in my marriage. We need God\'s guidance and wisdom during this challenging season.',
        isAnonymous: false,
        isAnswered: true,
        answeredAt: new Date(Date.now() - 172800000).toISOString(),
        answerDescription: 'Thank you all for your prayers! We had a breakthrough conversation and are going to counseling together. God is working!',
        expiresAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
        isPublic: true,
        createdAt: new Date(Date.now() - 604800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
  }
}

export const supabasePrayerService = new SupabasePrayerService();