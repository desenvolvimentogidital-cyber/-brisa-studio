import { studioEventBus } from './eventBus';
import { universalDatabase } from './dataLayer';

// ==========================================
// 1. IDENTITY & USER TYPES
// ==========================================

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roles: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'suspended' | 'pending';
}

export interface Session {
  sessionId: string;
  userId: string;
  token: string;
  refreshToken: string;
  createdAt: string;
  expiresAt: string;
  deviceInfo?: string;
}

export interface Role {
  name: string;
  permissions: string[];
}

export interface SecurityRule {
  id: string;
  resource: string; // 'table:users', 'screen:Dashboard', 'api:getUsers'
  action: 'read' | 'write' | 'delete' | 'execute';
  condition: 'authenticated' | 'hasRole' | 'isOwner' | 'custom';
  requiredRole?: string;
}

// ==========================================
// 2. IDENTITY MANAGER & AUTH ENGINE
// ==========================================

export class IdentityManager {
  private currentUserObj: User | null = null;
  private currentSessionObj: Session | null = null;
  private usersMap: Map<string, { user: User; passwordHash: string }> = new Map();
  private rolesMap: Map<string, Role> = new Map();
  private securityRules: SecurityRule[] = [];
  private authStateListeners: Set<(user: User | null) => void> = new Set();

  constructor() {
    // Default roles
    this.rolesMap.set('Admin', { name: 'Admin', permissions: ['*'] });
    this.rolesMap.set('Editor', { name: 'Editor', permissions: ['create', 'read', 'update'] });
    this.rolesMap.set('User', { name: 'User', permissions: ['read', 'update_own'] });
    this.rolesMap.set('Guest', { name: 'Guest', permissions: ['read_public'] });

    // Seed default Admin user for local testing
    const defaultAdmin: User = {
      id: 'usr_admin',
      username: 'admin',
      name: 'System Admin',
      email: 'admin@studio.app',
      roles: ['Admin'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.usersMap.set('admin@studio.app', { user: defaultAdmin, passwordHash: 'admin123' });

    // Attempt restoring session from localStorage
    this.restoreLocalSession();
  }

  private restoreLocalSession(): void {
    try {
      const storedSession = localStorage.getItem('studio_auth_session');
      const storedUser = localStorage.getItem('studio_auth_user');
      if (storedSession && storedUser) {
        this.currentSessionObj = JSON.parse(storedSession);
        this.currentUserObj = JSON.parse(storedUser);
      }
    } catch (e) {}
  }

  private persistSession(): void {
    try {
      if (this.currentSessionObj && this.currentUserObj) {
        localStorage.setItem('studio_auth_session', JSON.stringify(this.currentSessionObj));
        localStorage.setItem('studio_auth_user', JSON.stringify(this.currentUserObj));
      } else {
        localStorage.removeItem('studio_auth_session');
        localStorage.removeItem('studio_auth_user');
      }
    } catch (e) {}
  }

  onAuthStateChanged(listener: (user: User | null) => void): () => void {
    this.authStateListeners.add(listener);
    return () => this.authStateListeners.delete(listener);
  }

  private notifyAuthState(): void {
    this.authStateListeners.forEach((fn) => fn(this.currentUserObj));
    studioEventBus.publish('NotificationSent', {
      type: 'AUTH_STATE_CHANGED',
      user: this.currentUserObj,
    });
  }

  async register(data: { name: string; email: string; password?: string; roles?: string[] }): Promise<{ user: User; session: Session }> {
    const emailKey = data.email.toLowerCase().trim();
    if (this.usersMap.has(emailKey)) {
      throw new Error('E-mail já cadastrado.');
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      username: emailKey.split('@')[0],
      name: data.name,
      email: emailKey,
      roles: data.roles || ['User'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.usersMap.set(emailKey, { user: newUser, passwordHash: data.password || 'password' });

    // Save user to Universal Database 'users' collection
    await universalDatabase.create('users', newUser);

    return this.createSessionForUser(newUser);
  }

  async login(email: string, password?: string): Promise<{ user: User; session: Session }> {
    const emailKey = email.toLowerCase().trim();
    const entry = this.usersMap.get(emailKey);

    if (!entry) {
      throw new Error('Usuário não encontrado.');
    }

    if (password && entry.passwordHash !== password) {
      throw new Error('Senha incorreta.');
    }

    return this.createSessionForUser(entry.user);
  }

  async loginAnonymous(): Promise<{ user: User; session: Session }> {
    const anonUser: User = {
      id: `usr_anon_${Date.now()}`,
      username: 'guest',
      name: 'Visitante Anônimo',
      email: `anon_${Date.now()}@guest.local`,
      roles: ['Guest'],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.createSessionForUser(anonUser);
  }

  private createSessionForUser(user: User): { user: User; session: Session } {
    const session: Session = {
      sessionId: `sess_${Date.now()}`,
      userId: user.id,
      token: `jwt_mock_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      refreshToken: `refresh_${Date.now()}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24h
      deviceInfo: 'MobileStudio Universal Runtime Browser',
    };

    this.currentUserObj = user;
    this.currentSessionObj = session;
    this.persistSession();
    this.notifyAuthState();

    return { user, session };
  }

  async logout(): Promise<void> {
    this.currentUserObj = null;
    this.currentSessionObj = null;
    this.persistSession();
    this.notifyAuthState();
  }

  getCurrentUser(): User | null {
    return this.currentUserObj;
  }

  getSession(): Session | null {
    return this.currentSessionObj;
  }

  isAuthenticated(): boolean {
    return this.currentUserObj !== null;
  }

  hasRole(roleName: string): boolean {
    if (!this.currentUserObj) return false;
    if (this.currentUserObj.roles.includes('Admin')) return true;
    return this.currentUserObj.roles.includes(roleName);
  }

  hasPermission(permission: string): boolean {
    if (!this.currentUserObj) return false;
    if (this.hasRole('Admin')) return true;

    return this.currentUserObj.roles.some((r) => {
      const roleObj = this.rolesMap.get(r);
      return roleObj ? roleObj.permissions.includes('*') || roleObj.permissions.includes(permission) : false;
    });
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentUserObj) {
      throw new Error('Nenhum usuário autenticado.');
    }

    const updated: User = {
      ...this.currentUserObj,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.currentUserObj = updated;
    const entry = this.usersMap.get(updated.email);
    if (entry) {
      entry.user = updated;
    }

    this.persistSession();
    this.notifyAuthState();
    return updated;
  }

  addSecurityRule(rule: SecurityRule): void {
    this.securityRules.push(rule);
  }

  checkAccess(resource: string, action: SecurityRule['action'], context: { userId?: string; ownerId?: string } = {}): boolean {
    const matchingRules = this.securityRules.filter((r) => r.resource === resource && r.action === action);

    if (matchingRules.length === 0) {
      // Default: require authentication for writes, open for reads
      if (action === 'read') return true;
      return this.isAuthenticated();
    }

    return matchingRules.every((rule) => {
      if (rule.condition === 'authenticated') return this.isAuthenticated();
      if (rule.condition === 'hasRole') return rule.requiredRole ? this.hasRole(rule.requiredRole) : false;
      if (rule.condition === 'isOwner') return this.currentUserObj?.id === context.ownerId;
      return true;
    });
  }
}

export const identityManager = new IdentityManager();
