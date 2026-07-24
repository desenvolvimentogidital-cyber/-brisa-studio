/**
 * ETAPA 10: Support Center
 */
export interface Ticket { id: string; subject: string; message: string; status: 'open' | 'answered' | 'closed'; createdAt: string; }

class SupportCenter {
  private tickets: Ticket[] = [];

  createTicket(subject: string, message: string): Ticket {
    const t: Ticket = { id: `ticket_${Date.now()}`, subject, message, status: 'open', createdAt: new Date().toISOString() };
    this.tickets.push(t);
    return t;
  }

  getTickets() { return this.tickets; }
}

export const supportCenter = new SupportCenter();