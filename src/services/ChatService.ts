import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'prayer' | 'encouragement';
  userId?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: Date;
}

class ChatService {
  private socket: Socket | null = null;
  private isConnected = false;
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private userCallbacks: ((users: ChatUser[]) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  // For demo purposes, we'll use localStorage to simulate real-time chat
  private storageKey = 'life-journal-chat-messages';
  private usersKey = 'life-journal-chat-users';
  private currentUser: ChatUser | null = null;

  constructor() {
    // Initialize with demo mode (localStorage simulation)
    this.initializeDemoMode();
  }

  private initializeDemoMode() {
    // Listen for storage changes to simulate real-time updates
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey && e.newValue) {
        const messages = JSON.parse(e.newValue);
        const latestMessage = messages[messages.length - 1];
        if (latestMessage) {
          this.notifyMessageCallbacks({
            ...latestMessage,
            timestamp: new Date(latestMessage.timestamp)
          });
        }
      }
    });

    // Simulate periodic user activity updates
    setInterval(() => {
      this.updateUserActivity();
    }, 30000); // Update every 30 seconds
  }

  // Initialize real Socket.IO connection (for production)
  async connectToServer(serverUrl: string = 'ws://localhost:3001') {
    try {
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.notifyConnectionCallbacks(true);
        console.log('Connected to chat server');
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        this.notifyConnectionCallbacks(false);
        console.log('Disconnected from chat server');
      });

      this.socket.on('message', (message: ChatMessage) => {
        this.notifyMessageCallbacks({
          ...message,
          timestamp: new Date(message.timestamp)
        });
      });

      this.socket.on('users', (users: ChatUser[]) => {
        this.notifyUserCallbacks(users);
      });

    } catch (error) {
      console.warn('Failed to connect to chat server, using demo mode:', error);
      this.useDemoMode();
    }
  }

  private useDemoMode() {
    // Simulate connection for demo
    setTimeout(() => {
      this.isConnected = true;
      this.notifyConnectionCallbacks(true);
    }, 1000);
  }

  async joinChat(userName: string): Promise<boolean> {
    const userId = this.generateUserId();
    this.currentUser = {
      id: userId,
      name: userName,
      isOnline: true,
      lastSeen: new Date()
    };

    if (this.socket && this.isConnected) {
      // Real server mode
      this.socket.emit('join', { userId, userName });
    } else {
      // Demo mode - store user in localStorage
      const users = this.getStoredUsers();
      const existingUserIndex = users.findIndex(u => u.name === userName);
      
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = this.currentUser;
      } else {
        users.push(this.currentUser);
      }
      
      localStorage.setItem(this.usersKey, JSON.stringify(users));
      this.notifyUserCallbacks(users);
    }

    return true;
  }

  async sendMessage(message: string, type: ChatMessage['type'] = 'message'): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not joined to chat');
    }

    const chatMessage: ChatMessage = {
      id: this.generateMessageId(),
      user: this.currentUser.name,
      message,
      timestamp: new Date(),
      type,
      userId: this.currentUser.id
    };

    if (this.socket && this.isConnected) {
      // Real server mode
      this.socket.emit('message', chatMessage);
    } else {
      // Demo mode - store in localStorage
      const messages = this.getStoredMessages();
      messages.push(chatMessage);
      localStorage.setItem(this.storageKey, JSON.stringify(messages));
      
      // Notify local callbacks immediately
      this.notifyMessageCallbacks(chatMessage);
    }
  }

  getMessages(): ChatMessage[] {
    if (this.socket && this.isConnected) {
      // In real mode, messages would be fetched from server
      return [];
    } else {
      // Demo mode - get from localStorage
      return this.getStoredMessages().map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  }

  getUsers(): ChatUser[] {
    if (this.socket && this.isConnected) {
      // In real mode, users would be fetched from server
      return [];
    } else {
      // Demo mode - get from localStorage
      return this.getStoredUsers();
    }
  }

  private getStoredMessages(): ChatMessage[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      // Initialize with sample messages
      const sampleMessages: ChatMessage[] = [
        {
          id: '1',
          user: 'Sarah M.',
          message: 'Good morning everyone! Just finished Day 3 - the Beatitudes really spoke to my heart today.',
          timestamp: new Date(Date.now() - 3600000),
          type: 'message'
        },
        {
          id: '2',
          user: 'Mike R.',
          message: 'Praying for everyone in our group today. May God\'s word transform our hearts! 🙏',
          timestamp: new Date(Date.now() - 1800000),
          type: 'prayer'
        },
        {
          id: '3',
          user: 'Jennifer L.',
          message: 'The verse about being "salt and light" in Matthew 5:13-16 is challenging me to live differently.',
          timestamp: new Date(Date.now() - 900000),
          type: 'message'
        }
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(sampleMessages));
      return sampleMessages;
    }
    return JSON.parse(stored);
  }

  private getStoredUsers(): ChatUser[] {
    const stored = localStorage.getItem(this.usersKey);
    if (!stored) {
      const sampleUsers: ChatUser[] = [
        { id: 'user1', name: 'Sarah M.', isOnline: true },
        { id: 'user2', name: 'Mike R.', isOnline: true },
        { id: 'user3', name: 'Jennifer L.', isOnline: false, lastSeen: new Date(Date.now() - 1800000) }
      ];
      localStorage.setItem(this.usersKey, JSON.stringify(sampleUsers));
      return sampleUsers;
    }
    return JSON.parse(stored);
  }

  private updateUserActivity() {
    if (this.currentUser) {
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === this.currentUser!.id);
      if (userIndex >= 0) {
        users[userIndex].lastSeen = new Date();
        users[userIndex].isOnline = true;
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        this.notifyUserCallbacks(users);
      }
    }
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

  private notifyMessageCallbacks(message: ChatMessage) {
    this.messageCallbacks.forEach(callback => callback(message));
  }

  private notifyUserCallbacks(users: ChatUser[]) {
    this.userCallbacks.forEach(callback => callback(users));
  }

  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach(callback => callback(connected));
  }

  private generateMessageId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private generateUserId(): string {
    return 'user_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    // Mark user as offline in demo mode
    if (this.currentUser) {
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === this.currentUser!.id);
      if (userIndex >= 0) {
        users[userIndex].isOnline = false;
        users[userIndex].lastSeen = new Date();
        localStorage.setItem(this.usersKey, JSON.stringify(users));
      }
    }
  }
}

export const chatService = new ChatService();