/**
 * ETAPA 1: User Analytics Platform
 * Independent analytics module - 100% opt-in, privacy-first
 */

export type AnalyticsEvent =
  | 'project_created' | 'project_opened' | 'project_exported'
  | 'component_added' | 'component_removed'
  | 'js_used' | 'nocode_used' | 'database_used' | 'api_used' | 'plugin_used'
  | 'export_flutter' | 'export_react_native' | 'export_kotlin' | 'export_swiftui' | 'export_html'
  | 'screen_viewed' | 'session_start' | 'session_end';

export interface AnalyticsRecord {
  event: AnalyticsEvent;
  timestamp: number;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsDashboard {
  activeUsers: number;
  totalProjects: number;
  avgSessionTime: number;
  topFeatures: { feature: string; count: number }[];
  bottomFeatures: { feature: string; count: number }[];
  topScreens: { screen: string; count: number }[];
  eventsByDay: { date: string; count: number }[];
}

class AnalyticsPlatform {
  private enabled = false;
  private consent = false;
  private sessionId = '';
  private events: AnalyticsRecord[] = [];
  private listeners: Array<(event: AnalyticsEvent) => void> = [];

  init() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.track('session_start');
  }

  setConsent(given: boolean) {
    this.consent = given;
    this.enabled = given;
    if (given) this.init();
  }

  isEnabled() { return this.enabled && this.consent; }

  track(event: AnalyticsEvent, metadata?: Record<string, any>) {
    if (!this.isEnabled()) return;
    const record: AnalyticsRecord = { event, timestamp: Date.now(), sessionId: this.sessionId, metadata };
    this.events.push(record);
    this.listeners.forEach(l => l(event));
    this.persist();
  }

  onEvent(listener: (event: AnalyticsEvent) => void) {
    this.listeners.push(listener);
  }

  getDashboard(): AnalyticsDashboard {
    const now = Date.now();
    const last24h = now - 86400000;
    const recentEvents = this.events.filter(e => e.timestamp > last24h);

    const featureCount = new Map<string, number>();
    recentEvents.forEach(e => {
      const key = e.event;
      featureCount.set(key, (featureCount.get(key) || 0) + 1);
    });

    const sorted = Array.from(featureCount.entries()).sort((a, b) => b[1] - a[1]);

    return {
      activeUsers: new Set(recentEvents.map(e => e.sessionId)).size,
      totalProjects: this.events.filter(e => e.event === 'project_created').length,
      avgSessionTime: 0,
      topFeatures: sorted.slice(0, 5).map(([feature, count]) => ({ feature, count })),
      bottomFeatures: sorted.slice(-5).map(([feature, count]) => ({ feature, count })),
      topScreens: [],
      eventsByDay: [],
    };
  }

  private persist() {
    try {
      localStorage.setItem('ms_analytics', JSON.stringify(this.events.slice(-1000)));
    } catch {}
  }

  private load() {
    try {
      const stored = localStorage.getItem('ms_analytics');
      if (stored) this.events = JSON.parse(stored);
    } catch {}
  }

  getEvents() { return this.events; }
  clear() { this.events = []; this.persist(); }
}

export const analytics = new AnalyticsPlatform();