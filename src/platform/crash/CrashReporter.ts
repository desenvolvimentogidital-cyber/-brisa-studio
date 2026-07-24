/**
 * ETAPA 2: Crash Reporting
 * Professional crash reporter with consent-based submission
 */

export interface CrashReport {
  id: string;
  timestamp: string;
  type: 'javascript' | 'runtime' | 'canvas' | 'export' | 'database' | 'api';
  message: string;
  stackTrace: string;
  version: string;
  os: string;
  memory: { used: number; total: number };
  editorContext: { projectId?: string; activeScreen?: string; devMode?: string };
  consent: boolean;
}

class CrashReporter {
  private reports: CrashReport[] = [];
  private consent = false;
  private version = '1.0.0';

  setConsent(given: boolean) { this.consent = given; }
  setVersion(v: string) { this.version = v; }

  capture(type: CrashReport['type'], message: string, error: Error, context?: Partial<CrashReport['editorContext']>) {
    const report: CrashReport = {
      id: `crash_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      stackTrace: error.stack || '',
      version: this.version,
      os: navigator.platform,
      memory: { used: (performance as any).memory?.usedJSHeapSize || 0, total: (performance as any).memory?.jsHeapSizeLimit || 0 },
      editorContext: context || {},
      consent: this.consent,
    };
    this.reports.push(report);
    if (this.consent) this.submit(report);
    return report;
  }

  private submit(report: CrashReport) {
    try {
      const stored = JSON.parse(localStorage.getItem('ms_crash_reports') || '[]');
      stored.push(report);
      localStorage.setItem('ms_crash_reports', JSON.stringify(stored.slice(-50)));
    } catch {}
  }

  getReports() { return this.reports; }
  clear() { this.reports = []; localStorage.removeItem('ms_crash_reports'); }
}

export const crashReporter = new CrashReporter();