/**
 * ETAPA 5: Licensing Platform
 */

export type PlanType = 'free' | 'pro' | 'enterprise';

export interface License {
  id: string; plan: PlanType; email: string; activatedAt: string; expiresAt: string;
  devices: string[]; maxDevices: number; features: string[]; valid: boolean;
}

export const PLAN_FEATURES: Record<PlanType, string[]> = {
  free: ['editor', 'export_json', 'basic_components', 'local_storage'],
  pro: ['editor', 'export_all', 'all_components', 'cloud_sync', 'marketplace', 'plugins', 'api_access', 'analytics'],
  enterprise: ['editor', 'export_all', 'all_components', 'cloud_sync', 'marketplace', 'plugins', 'api_access', 'analytics', 'team_collab', 'white_label', 'dedicated_support', 'sso', 'audit_logs'],
};

class LicensingPlatform {
  private currentLicense: License | null = null;

  constructor() { this.load(); }

  login(email: string, plan: PlanType): License {
    const license: License = {
      id: `lic_${Date.now()}`, plan, email,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      devices: [this.getDeviceId()], maxDevices: plan === 'free' ? 1 : plan === 'pro' ? 3 : 10,
      features: PLAN_FEATURES[plan], valid: true,
    };
    this.currentLicense = license;
    this.persist();
    return license;
  }

  logout() { this.currentLicense = null; localStorage.removeItem('ms_license'); }
  getLicense() { return this.currentLicense; }
  isLoggedIn() { return this.currentLicense !== null; }
  hasFeature(feature: string) { return this.currentLicense?.features.includes(feature) || false; }
  getPlan() { return this.currentLicense?.plan || 'free'; }

  private getDeviceId(): string {
    let id = localStorage.getItem('ms_device_id');
    if (!id) { id = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; localStorage.setItem('ms_device_id', id); }
    return id;
  }

  private persist() { try { localStorage.setItem('ms_license', JSON.stringify(this.currentLicense)); } catch {} }
  private load() { try { const s = localStorage.getItem('ms_license'); if (s) this.currentLicense = JSON.parse(s); } catch {} }
}

export const licensing = new LicensingPlatform();