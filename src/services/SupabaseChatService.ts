import { supabase, type ChatMessage as DBChatMessage, type ChatReaction as DBChatReaction } from '../lib/supabase';
import { supabaseAuthService } from './SupabaseAuthService';

export interface ChatReaction {
  type: 'like' | 'heart' | 'wow' | 'pray';
  userId: string;
  userName: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'prayer' | 'encouragement';
  userId?: string;
  reactions?: Record<string, ChatReaction[]>;
}

export interface ChatUser {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: Date;
}

class SupabaseChatService {
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private userCallbacks: ((users: ChatUser[]) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private reactionCallbacks: ((messageId: string, reactions: Record<string, ChatReaction[]>) => void)[] = [];
  private isConnected = false;
  private subscription: any = null;

  async connectToServer(): Promise<void> {
    const user = supabaseAuthService.getCurrentUser();
    if (!user || user.isGuest) {
      // Fall back to demo mode for guest users
      this.useDemoMode();
      return;
    }

    try {
      // Test connection to Supabase
      const { error } = await supabase.from('chat_messages').select('count').limit(1);
      if (error) {
        throw error;
      }

      this.isConnected = true;
      this.notifyConnectionCallbacks(true);
      
      // Set up real-time subscription
      this.setupRealtimeSubscription();
      
    } catch (error) {
      console.warn('Failed to connect to Supabase chat, using demo mode:', error);
      this.useDemoMode();
    }
  }

  private setupRealtimeSubscription() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = supabase
      .channel('chat_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const message = this.transformDBMessage(payload.new as DBChatMessage);
          this.notifyMessageCallbacks(message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_reactions'
        },
        async (payload) => {
          // Refetch reactions for the affected message
          if (payload.new?.message_id) {
            const reactions = await this.getMessageReactions(payload.new.message_id);
            this.notifyReactionCallbacks(payload.new.message_id, reactions);
          }
        }
      )
      .subscribe();
  }

  private useDemoMode() {
    // Simulate connection for demo
    setTimeout(() => {
      this.isConnected = true;
      this.notifyConnectionCallbacks(true);
    }, 1000);
  }

  async joinChat(userName: string): Promise<boolean> {
    const user = supabaseAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (user.isGuest) {
      // For guest users, use localStorage demo mode
      const users = this.getStoredUsers();
      const existingUserIndex = users.findIndex(u => u.name === userName);
      
      if (existingUserIndex >= 0) {
        users[existingUserIndex].isOnline = true;
        users[existingUserIndex].lastSeen = new Date();
      } else {
        users.push({
          id: user.id,
          name: userName,
          isOnline: true,
          lastSeen: new Date()
        });
      }
      
      localStorage.setItem('life-journal-chat-users', JSON.stringify(users));
      this.notifyUserCallbacks(users);
      return true;
    }

    // For authenticated users, they're automatically "joined" when they have an account
    return true;
  }

  async sendMessage(message: string, type: ChatMessage['type'] = 'message'): Promise<void> {
    const user = supabaseAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (user.isGuest) {
      // For guest users, use localStorage demo mode
      const chatMessage: ChatMessage = {
        id: this.generateMessageId(),
        user: user.name,
        message,
        timestamp: new Date(),
        type,
        userId: user.id,
        reactions: {}
      };

      const messages = this.getStoredMessages();
      messages.push(chatMessage);
      localStorage.setItem('life-journal-chat-messages', JSON.stringify(messages));
      
      this.notifyMessageCallbacks(chatMessage);
      return;
    }

    // For authenticated users, save to Supabase
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        user_name: user.name,
        message,
        message_type: type
      });

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async addReaction(messageId: string, reactionType: ChatReaction['type']): Promise<void> {
    const user = supabaseAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (user.isGuest) {
      // For guest users, use localStorage demo mode
      const messages = this.getStoredMessages();
      const messageIndex = messages.findIndex(m => m.id === messageId);
      
      if (messageIndex >= 0) {
        const message = messages[messageIndex];
        if (!message.reactions) {
          message.reactions = {};
        }
        if (!message.reactions[reactionType]) {
          message.reactions[reactionType] = [];
        }

        const existingReactionIndex = message.reactions[reactionType].findIndex(r => r.userId === user.id);
        
        if (existingReactionIndex >= 0) {
          message.reactions[reactionType].splice(existingReactionIndex, 1);
          if (message.reactions[reactionType].length === 0) {
            delete message.reactions[reactionType];
          }
        } else {
          message.reactions[reactionType].push({
            type: reactionType,
            userId: user.id,
            userName: user.name
          });
        }

        localStorage.setItem('life-journal-chat-messages', JSON.stringify(messages));
        this.notifyReactionCallbacks(messageId, message.reactions);
      }
      return;
    }

    // For authenticated users, save to Supabase
    const { error } = await supabase
      .from('chat_reactions')
      .upsert({
        message_id: messageId,
        user_id: user.id,
        reaction_type: reactionType
      });

    if (error) {
      throw new Error(`Failed to add reaction: ${error.message}`);
    }
  }

  async getMessages(): Promise<ChatMessage[]> {
    const user = supabaseAuthService.getCurrentUser();
    if (!user) {
      return [];
    }

    if (user.isGuest) {
      // For guest users, get from localStorage
      return this.getStoredMessages().map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }

    // For authenticated users, get from Supabase
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    const messages = await Promise.all(
      data.map(async (msg) => {
        const reactions = await this.getMessageReactions(msg.id);
        return this.transformDBMessage(msg, reactions);
      })
    );

    return messages;
  }

  private async getMessageReactions(messageId: string): Promise<Record<string, ChatReaction[]>> {
    const { data, error } = await supabase
      .from('chat_reactions')
      .select(`
        reaction_type,
        user_id,
        profiles!inner(full_name)
      `)
      .eq('message_id', messageId);

    if (error) {
      console.error('Error fetching reactions:', error);
      return {};
    }

    const reactions: Record<string, ChatReaction[]> = {};
    data.forEach((reaction: any) => {
      if (!reactions[reaction.reaction_type]) {
        reactions[reaction.reaction_type] = [];
      }
      reactions[reaction.reaction_type].push({
        type: reaction.reaction_type,
        userId: reaction.user_id,
        userName: reaction.profiles.full_name
      });
    });

    return reactions;
  }

  private transformDBMessage(dbMessage: DBChatMessage, reactions?: Record<string, ChatReaction[]>): ChatMessage {
    return {
      id: dbMessage.id,
      user: dbMessage.user_name,
      message: dbMessage.message,
      timestamp: new Date(dbMessage.created_at),
      type: dbMessage.message_type,
      userId: dbMessage.user_id,
      reactions: reactions || {}
    };
  }

  getUsers(): ChatUser[] {
    const user = supabaseAuthService.getCurrentUser();
    if (!user || user.isGuest) {
      return this.getStoredUsers();
    }

    // For authenticated users, we could implement online presence
    // For now, return empty array as this would require more complex real-time presence
    return [];
  }

  private getStoredMessages(): ChatMessage[] {
    const stored = localStorage.getItem('life-journal-chat-messages');
    if (!stored) {
      const sampleMessages: ChatMessage[] = [
        {
          id: '1',
          user: 'Sarah M.',
          message: 'Good morning everyone! Just finished Day 3 - the Beatitudes really spoke to my heart today.',
          timestamp: new Date(Date.now() - 3600000),
          type: 'message',
          reactions: {
            heart: [{ type: 'heart', userId: 'user2', userName: 'Mike R.' }],
            pray: [{ type: 'pray', userId: 'user3', userName: 'Jennifer L.' }]
          }
        },
        {
          id: '2',
          user: 'Mike R.',
          message: 'Praying for everyone in our group today. May God\'s word transform our hearts! 🙏',
          timestamp: new Date(Date.now() - 1800000),
          type: 'prayer',
          reactions: {
            pray: [
              { type: 'pray', userId: 'user1', userName: 'Sarah M.' },
              { type: 'pray', userId: 'user3', userName: 'Jennifer L.' }
            ],
            heart: [{ type: 'heart', userId: 'user1', userName: 'Sarah M.' }]
          }
        }
      ];
      localStorage.setItem('life-journal-chat-messages', JSON.stringify(sampleMessages));
      return sampleMessages;
    }
    return JSON.parse(stored);
  }

  private getStoredUsers(): ChatUser[] {
    const stored = localStorage.getItem('life-journal-chat-users');
    if (!stored) {
      const sampleUsers: ChatUser[] = [
        { id: 'user1', name: 'Sarah M.', isOnline: true },
        { id: 'user2', name: 'Mike R.', isOnline: true },
        { id: 'user3', name: 'Jennifer L.', isOnline: false, lastSeen: new Date(Date.now() - 1800000) }
      ];
      localStorage.setItem('life-journal-chat-users', JSON.stringify(sampleUsers));
      return sampleUsers;
    }
    return JSON.parse(stored);
  }

  private generateMessageId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  onMessage(callback: (message: ChatMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  onUsers(callback: (users: ChatUser[]) => void) {
    this.userCallbacks.push(callback);
  }

  onConnection(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback);
  }

  onReaction(callback: (messageId: string, reactions: Record<string, ChatReaction[]>) => void) {
    this.reactionCallbacks.push(callback);
  }

  private notifyMessageCallbacks(message: ChatMessage) {
    this.messageCallbacks.forEach(callback => callback(message));
  }

  private notifyUserCallbacks(users: ChatUser[]) {
    this.userCallbacks.forEach(callback => callback(users));
  }

  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach(callback => callback(connected));
  }

  private notifyReactionCallbacks(messageId: string, reactions: Record<string, ChatReaction[]>) {
    this.reactionCallbacks.forEach(callback => callback(messageId, reactions));
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.isConnected = false;
  }
}

export const supabaseChatService = new SupabaseChatService();