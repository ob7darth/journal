export interface User {
  id: string;
  email?: string;
  name: string;
  isGuest: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

class AuthService {
  private currentUser: User | null = null;
  private authCallbacks: ((state: AuthState) => void)[] = [];

  constructor() {
    this.loadStoredAuth();
  }

  private loadStoredAuth() {
    const stored = localStorage.getItem('life-journal-auth');
    if (stored) {
      try {
        const authData = JSON.parse(stored);
        this.currentUser = authData.user;
        this.notifyAuthCallbacks();
      } catch (error) {
        console.error('Failed to load stored auth:', error);
        localStorage.removeItem('life-journal-auth');
      }
    }
  }

  private saveAuth() {
    if (this.currentUser) {
      localStorage.setItem('life-journal-auth', JSON.stringify({
        user: this.currentUser,
        timestamp: new Date().toISOString()
      }));
    } else {
      localStorage.removeItem('life-journal-auth');
    }
  }

  // Guest mode - no email required, just a name
  async signInAsGuest(name: string): Promise<User> {
    const user: User = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      isGuest: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    this.currentUser = user;
    this.saveAuth();
    this.notifyAuthCallbacks();

    return user;
  }

  // Member mode - email and password
  async signUp(email: string, password: string, name: string): Promise<User> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would make an API call to your backend
    // For now, we'll simulate it with localStorage
    const existingUsers = this.getStoredUsers();
    
    if (existingUsers.find(u => u.email === email)) {
      throw new Error('An account with this email already exists');
    }

    const user: User = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      isGuest: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Store user credentials (in production, this would be handled by your backend)
    const userCredentials = {
      ...user,
      passwordHash: await this.hashPassword(password) // Simple hash for demo
    };

    existingUsers.push(userCredentials);
    localStorage.setItem('life-journal-users', JSON.stringify(existingUsers));

    this.currentUser = user;
    this.saveAuth();
    this.notifyAuthCallbacks();

    return user;
  }

  async signIn(email: string, password: string): Promise<User> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const existingUsers = this.getStoredUsers();
    const userCredentials = existingUsers.find(u => u.email === email.toLowerCase().trim());

    if (!userCredentials) {
      throw new Error('No account found with this email');
    }

    const passwordHash = await this.hashPassword(password);
    if (userCredentials.passwordHash !== passwordHash) {
      throw new Error('Invalid password');
    }

    const user: User = {
      id: userCredentials.id,
      email: userCredentials.email,
      name: userCredentials.name,
      isGuest: false,
      createdAt: userCredentials.createdAt,
      lastLogin: new Date().toISOString()
    };

    // Update last login
    userCredentials.lastLogin = user.lastLogin;
    localStorage.setItem('life-journal-users', JSON.stringify(existingUsers));

    this.currentUser = user;
    this.saveAuth();
    this.notifyAuthCallbacks();

    return user;
  }

  // Convert guest account to member account
  async upgradeToMember(email: string, password: string): Promise<User> {
    if (!this.currentUser || !this.currentUser.isGuest) {
      throw new Error('No guest account to upgrade');
    }

    // Check if email is already taken
    const existingUsers = this.getStoredUsers();
    if (existingUsers.find(u => u.email === email)) {
      throw new Error('An account with this email already exists');
    }

    // Create new member account with same data
    const upgradedUser: User = {
      ...this.currentUser,
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase().trim(),
      isGuest: false,
      lastLogin: new Date().toISOString()
    };

    // Store credentials
    const userCredentials = {
      ...upgradedUser,
      passwordHash: await this.hashPassword(password)
    };

    existingUsers.push(userCredentials);
    localStorage.setItem('life-journal-users', JSON.stringify(existingUsers));

    // Migrate guest data to member account
    await this.migrateGuestData(this.currentUser.id, upgradedUser.id);

    this.currentUser = upgradedUser;
    this.saveAuth();
    this.notifyAuthCallbacks();

    return upgradedUser;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.saveAuth();
    this.notifyAuthCallbacks();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isGuest(): boolean {
    return this.currentUser?.isGuest ?? false;
  }

  isMember(): boolean {
    return this.currentUser?.isGuest === false;
  }

  // Data migration from guest to member
  private async migrateGuestData(guestId: string, memberId: string): Promise<void> {
    // Migrate SOAP entries
    const soapEntries = localStorage.getItem('soap-entries');
    if (soapEntries) {
      const entries = JSON.parse(soapEntries);
      localStorage.setItem(`soap-entries-${memberId}`, JSON.stringify(entries));
    }

    // In production, this would sync data to cloud storage
    console.log(`Migrated data from guest ${guestId} to member ${memberId}`);
  }

  // Get user-specific storage key
  getStorageKey(key: string): string {
    if (this.currentUser && !this.currentUser.isGuest) {
      return `${key}-${this.currentUser.id}`;
    }
    return key; // Guest mode uses default keys
  }

  // Cloud sync simulation (in production, this would sync with your backend)
  async syncData(): Promise<void> {
    if (!this.currentUser || this.currentUser.isGuest) {
      return; // No sync for guest users
    }

    // Simulate cloud sync
    console.log('Syncing data to cloud for user:', this.currentUser.email);
    
    // In production, this would:
    // 1. Upload local SOAP entries to cloud
    // 2. Download any newer entries from cloud
    // 3. Merge and resolve conflicts
    // 4. Update local storage
  }

  private getStoredUsers(): any[] {
    const stored = localStorage.getItem('life-journal-users');
    return stored ? JSON.parse(stored) : [];
  }

  private async hashPassword(password: string): Promise<string> {
    // Simple hash for demo - in production, use proper bcrypt or similar
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'life-journal-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  onAuthChange(callback: (state: AuthState) => void) {
    this.authCallbacks.push(callback);
    // Call immediately with current state
    callback(this.getAuthState());
  }

  private getAuthState(): AuthState {
    return {
      user: this.currentUser,
      isAuthenticated: this.currentUser !== null,
      isLoading: false,
      error: null
    };
  }

  private notifyAuthCallbacks() {
    const state = this.getAuthState();
    this.authCallbacks.forEach(callback => callback(state));
  }
}

export const authService = new AuthService();