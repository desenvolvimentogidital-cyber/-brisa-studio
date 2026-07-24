import { studioEventBus } from './eventBus';
import { identityManager } from './identitySecurityLayer';
import { universalDatabase } from './dataLayer';

// ==========================================
// 1. NOTIFICATION & REALTIME TYPES
// ==========================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'message' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  userId?: string;
  createdAt: string;
  read: boolean;
  metadata?: Record<string, any>;
  actionUrl?: string;
  priority?: NotificationPriority;
}

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: string;
}

export interface RealtimeMessage {
  event: string;
  senderId?: string;
  data: any;
  timestamp: string;
}

// ==========================================
// 2. NOTIFICATION MANAGER ENGINE
// ==========================================

export class NotificationManager {
  private notifications: AppNotification[] = [];
  private deviceTokens: DeviceToken[] = [];
  private listeners: Set<(notifications: AppNotification[]) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('studio_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (e) {}
  }

  private persistStorage(): void {
    try {
      localStorage.setItem('studio_notifications', JSON.stringify(this.notifications.slice(-100)));
    } catch (e) {}
  }

  onNotificationsChanged(listener: (notifications: AppNotification[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => fn([...this.notifications]));
    studioEventBus.publish('NotificationSent', {
      unreadCount: this.getUnreadCount(),
      total: this.notifications.length,
    });
  }

  async create(data: {
    title: string;
    message: string;
    type?: NotificationType;
    userId?: string;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
    actionUrl?: string;
  }): Promise<AppNotification> {
    const targetUserId = data.userId || identityManager.getCurrentUser()?.id;

    const notification: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      userId: targetUserId,
      createdAt: new Date().toISOString(),
      read: false,
      metadata: data.metadata,
      actionUrl: data.actionUrl,
      priority: data.priority || 'normal',
    };

    this.notifications.unshift(notification);
    this.persistStorage();
    this.notifyListeners();

    // Store in Universal DB
    await universalDatabase.create('notifications', notification);

    return notification;
  }

  async sendPushNotification(title: string, message: string, userId?: string): Promise<boolean> {
    // Simulate FCM / APNS push dispatch
    const notif = await this.create({
      title: `[PUSH] ${title}`,
      message,
      type: 'system',
      userId,
      priority: 'high',
    });
    return !!notif;
  }

  markAsRead(id: string): boolean {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.persistStorage();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  delete(id: string): boolean {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.notifications.splice(idx, 1);
      this.persistStorage();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  list(userId?: string): AppNotification[] {
    const uid = userId || identityManager.getCurrentUser()?.id;
    if (!uid) return [...this.notifications];
    return this.notifications.filter((n) => !n.userId || n.userId === uid);
  }

  getUnreadCount(userId?: string): number {
    return this.list(userId).filter((n) => !n.read).length;
  }

  registerDeviceToken(token: string, platform: DeviceToken['platform'] = 'web'): DeviceToken {
    const uid = identityManager.getCurrentUser()?.id || 'guest';
    const device: DeviceToken = {
      id: `dev_${Date.now()}`,
      userId: uid,
      token,
      platform,
      createdAt: new Date().toISOString(),
    };
    this.deviceTokens.push(device);
    return device;
  }
}

// ==========================================
// 3. REALTIME ENGINE (WEBSOCKET / PUBSUB)
// ==========================================

export class RealtimeManager {
  private connected: boolean = false;
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(): void {
    this.connected = true;
    studioEventBus.publish('NotificationSent', { type: 'REALTIME_CONNECTED' });
  }

  disconnect(): void {
    this.connected = false;
    studioEventBus.publish('NotificationSent', { type: 'REALTIME_DISCONNECTED' });
  }

  isConnected(): boolean {
    return this.connected;
  }

  on(event: string, callback: (data: any) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, data: any): void {
    if (!this.connected) {
      this.connect();
    }

    const payload: RealtimeMessage = {
      event,
      senderId: identityManager.getCurrentUser()?.id,
      data,
      timestamp: new Date().toISOString(),
    };

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((fn) => fn(payload.data));
    }

    studioEventBus.publish('NotificationSent', { type: 'REALTIME_EVENT', payload });
  }
}

export const notificationManager = new NotificationManager();
export const realtimeManager = new RealtimeManager();
