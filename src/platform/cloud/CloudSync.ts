/**
 * ETAPA 6: Cloud Sync
 */
export interface CloudBackup { id: string; projectId: string; name: string; data: any; version: string; timestamp: string; }

class CloudSync {
  private backups: CloudBackup[] = [];
  private enabled = false;

  setEnabled(v: boolean) { this.enabled = v; }
  isEnabled() { return this.enabled; }

  backup(projectId: string, name: string, data: any): CloudBackup {
    const b: CloudBackup = { id: `bak_${Date.now()}`, projectId, name, data, version: '1.0.0', timestamp: new Date().toISOString() };
    this.backups.push(b);
    this.persist();
    return b;
  }

  restore(backupId: string): CloudBackup | undefined {
    return this.backups.find(b => b.id === backupId);
  }

  list(projectId?: string) {
    return projectId ? this.backups.filter(b => b.projectId === projectId) : this.backups;
  }

  private persist() { try { localStorage.setItem('ms_cloud_backups', JSON.stringify(this.backups.slice(-50))); } catch {} }
}

export const cloudSync = new CloudSync();