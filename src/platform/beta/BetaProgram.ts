/**
 * ETAPA 15: Beta Program
 */
export interface BetaMember { email: string; invitedAt: string; active: boolean; feedbackCount: number; }

class BetaProgram {
  private members: BetaMember[] = [];

  invite(email: string) { this.members.push({ email, invitedAt: new Date().toISOString(), active: true, feedbackCount: 0 }); }
  getMembers() { return this.members; }
  isMember(email: string) { return this.members.some(m => m.email === email && m.active); }
}

export const betaProgram = new BetaProgram();