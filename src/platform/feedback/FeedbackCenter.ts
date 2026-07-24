/**
 * ETAPA 3: Feedback Center
 */
export type FeedbackType = 'bug' | 'suggestion' | 'feature' | 'rating';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Feedback {
  id: string; type: FeedbackType; priority: FeedbackPriority;
  title: string; description: string; attachments: string[];
  version: string; timestamp: string; status: 'open' | 'in_review' | 'resolved';
}

class FeedbackCenter {
  private items: Feedback[] = [];

  submit(type: FeedbackType, priority: FeedbackPriority, title: string, description: string, attachments: string[] = []) {
    const fb: Feedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type, priority, title, description, attachments,
      version: '1.0.0', timestamp: new Date().toISOString(), status: 'open',
    };
    this.items.push(fb);
    this.persist();
    return fb;
  }

  getAll() { return this.items; }
  getByType(type: FeedbackType) { return this.items.filter(f => f.type === type); }

  private persist() {
    try { localStorage.setItem('ms_feedback', JSON.stringify(this.items.slice(-100))); } catch {}
  }
  private load() {
    try { const s = localStorage.getItem('ms_feedback'); if (s) this.items = JSON.parse(s); } catch {}
  }
}

export const feedbackCenter = new FeedbackCenter();