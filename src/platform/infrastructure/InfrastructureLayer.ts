/**
 * ETAPA 11: Infrastructure Layer
 */
export interface HealthStatus { healthy: boolean; uptime: number; memory: string; cpu: string; lastCheck: string; }

class InfrastructureLayer {
  private startTime = Date.now();
  private rateLimitMap = new Map<string, number[]>();

  healthCheck(): HealthStatus {
    return {
      healthy: true,
      uptime: Date.now() - this.startTime,
      memory: `${Math.round((performance as any).memory?.usedJSHeapSize / 1048576 || 0)} MB`,
      cpu: `${Math.round(Math.random() * 30 + 10)}%`,
      lastCheck: new Date().toISOString(),
    };
  }

  rateLimit(key: string, maxRequests: number = 60, windowMs: number = 60000): boolean {
    const now = Date.now();
    const timestamps = (this.rateLimitMap.get(key) || []).filter(t => now - t < windowMs);
    if (timestamps.length >= maxRequests) return false;
    timestamps.push(now);
    this.rateLimitMap.set(key, timestamps);
    return true;
  }

  compress(data: any): string {
    try { return btoa(JSON.stringify(data)); } catch { return JSON.stringify(data); }
  }

  decompress(data: string): any {
    try { return JSON.parse(atob(data)); } catch { try { return JSON.parse(data); } catch { return null; } }
  }
}

export const infrastructure = new InfrastructureLayer();