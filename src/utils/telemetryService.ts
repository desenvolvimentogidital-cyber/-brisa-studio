/**
 * 🚀 MOBILE STUDIO v1.0.0 — TELEMETRY SERVICE (ETAPA 7)
 * =======================================================
 * Transparent, privacy-first, opt-in analytics and telemetry engine.
 * Captures usage duration, performance metrics, crash logs, error traces,
 * and feature utilization ONLY when explicit user consent is given.
 */

export interface TelemetryConfig {
  enabled: boolean; // Opt-in consent
  trackUsageTime: boolean;
  trackPerformance: boolean;
  trackErrors: boolean;
  trackCrashes: boolean;
  trackFeatureUsage: boolean;
  anonymizeIp: boolean;
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  category: 'usage' | 'performance' | 'error' | 'crash' | 'feature';
  eventName: string;
  payload: Record<string, any>;
  sessionDurationSec: number;
}

export interface TelemetrySummary {
  totalEvents: number;
  sessionDurationMinutes: number;
  featureUsageMap: Record<string, number>;
  errorCount: number;
  crashCount: number;
  avgRenderLatencyMs: number;
  optInStatus: boolean;
}

class TelemetryService {
  private config: TelemetryConfig = {
    enabled: false, // Default is OFF — explicit opt-in required
    trackUsageTime: true,
    trackPerformance: true,
    trackErrors: true,
    trackCrashes: true,
    trackFeatureUsage: true,
    anonymizeIp: true,
  };

  private events: TelemetryEvent[] = [];
  private sessionStartTime: number = Date.now();
  private featureCounts: Map<string, number> = new Map();

  constructor() {
    this.loadConsentFromStorage();
  }

  private loadConsentFromStorage() {
    try {
      const saved = localStorage.getItem('mobile_studio_telemetry_consent');
      if (saved) {
        this.config = JSON.parse(saved);
      }
    } catch {
      // Default remains disabled
    }
  }

  public setConsent(enabled: boolean, configOverrides?: Partial<TelemetryConfig>): TelemetryConfig {
    this.config = {
      ...this.config,
      ...configOverrides,
      enabled,
    };

    try {
      localStorage.setItem('mobile_studio_telemetry_consent', JSON.stringify(this.config));
    } catch {
      // Ignore storage errors
    }

    if (enabled) {
      this.trackEvent('usage', 'telemetry_opt_in', { timestamp: new Date().toISOString() });
    }

    return this.config;
  }

  public getConsent(): TelemetryConfig {
    return { ...this.config };
  }

  public trackFeature(featureName: string, meta?: Record<string, any>) {
    if (!this.config.enabled || !this.config.trackFeatureUsage) return;

    const count = (this.featureCounts.get(featureName) || 0) + 1;
    this.featureCounts.set(featureName, count);

    this.trackEvent('feature', featureName, { count, ...meta });
  }

  public trackPerformance(metricName: string, durationMs: number, meta?: Record<string, any>) {
    if (!this.config.enabled || !this.config.trackPerformance) return;

    this.trackEvent('performance', metricName, { durationMs, ...meta });
  }

  public trackError(errorName: string, message: string, stack?: string) {
    if (!this.config.enabled || !this.config.trackErrors) return;

    this.trackEvent('error', errorName, { message, stackSnippet: stack ? stack.substring(0, 300) : '' });
  }

  public trackCrash(reason: string, details?: Record<string, any>) {
    if (!this.config.enabled || !this.config.trackCrashes) return;

    this.trackEvent('crash', reason, { ...details, timestamp: new Date().toISOString() });
  }

  private trackEvent(category: TelemetryEvent['category'], eventName: string, payload: Record<string, any>) {
    if (!this.config.enabled) return;

    const event: TelemetryEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      category,
      eventName,
      payload,
      sessionDurationSec: Math.floor((Date.now() - this.sessionStartTime) / 1000),
    };

    this.events.push(event);

    // Keep max 500 in-memory events
    if (this.events.length > 500) {
      this.events.shift();
    }
  }

  public getSummary(): TelemetrySummary {
    const featureMap: Record<string, number> = {};
    this.featureCounts.forEach((val, key) => {
      featureMap[key] = val;
    });

    const perfEvents = this.events.filter((e) => e.category === 'performance');
    const avgLatency = perfEvents.length > 0
      ? Math.round(perfEvents.reduce((s, e) => s + (e.payload.durationMs || 0), 0) / perfEvents.length)
      : 12;

    return {
      totalEvents: this.events.length,
      sessionDurationMinutes: Math.round((Date.now() - this.sessionStartTime) / 60000),
      featureUsageMap: featureMap,
      errorCount: this.events.filter((e) => e.category === 'error').length,
      crashCount: this.events.filter((e) => e.category === 'crash').length,
      avgRenderLatencyMs: avgLatency,
      optInStatus: this.config.enabled,
    };
  }

  public exportTelemetryReport(): string {
    return JSON.stringify({
      version: '1.0.0',
      consent: this.config,
      summary: this.getSummary(),
      events: this.events,
    }, null, 2);
  }

  public clearEvents() {
    this.events = [];
    this.featureCounts.clear();
  }
}

export const telemetryService = new TelemetryService();
