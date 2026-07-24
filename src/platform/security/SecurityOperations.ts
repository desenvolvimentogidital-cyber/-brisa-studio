/**
 * ETAPA 12: Security Operations
 */
export interface AuditLog { id: string; userId: string; action: string; timestamp: string; ip: string; details: string; }

class SecurityOperations {
  private auditLogs: AuditLog[] = [];

  log(userId: string, action: string, details: string = '') {
    const log: AuditLog = { id: `audit_${Date.now()}`, userId, action, timestamp: new Date().toISOString(), ip: '', details };
    this.auditLogs.push(log);
    if (this.auditLogs.length > 1000) this.auditLogs.shift();
    this.persist();
  }

  getLogs() { return this.auditLogs; }
  encrypt(data: string): string { return btoa(data); }
  decrypt(data: string): string { return atob(data); }
  generateToken(): string { return `ms_${Array.from({length: 32}, () => Math.random().toString(36)[2]).join('')}`; }

  private persist() { try { localStorage.setItem('ms_audit_logs', JSON.stringify(this.auditLogs)); } catch {} }
}

export const security = new SecurityOperations();