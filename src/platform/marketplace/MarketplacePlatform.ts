/**
 * ETAPA 8: Marketplace Online
 */
export interface MarketplaceItem {
  id: string; type: 'component' | 'template' | 'plugin' | 'theme' | 'package' | 'library';
  name: string; description: string; author: string; version: string;
  category: string; rating: number; downloads: number; price: number;
  installed: boolean; autoUpdate: boolean; createdAt: string;
}

class MarketplacePlatform {
  private items: MarketplaceItem[] = [
    { id: 'mp-stripe', type: 'plugin', name: 'Stripe Payments', description: 'Gateway de pagamento', author: 'MS Team', version: '1.0.0', category: 'Pagamento', rating: 4.8, downloads: 1520, price: 0, installed: false, autoUpdate: true, createdAt: '2026-07-01' },
    { id: 'mp-analytics', type: 'plugin', name: 'Google Analytics', description: 'Métricas e analytics', author: 'MS Team', version: '1.0.0', category: 'Analytics', rating: 4.5, downloads: 980, price: 0, installed: false, autoUpdate: true, createdAt: '2026-07-01' },
    { id: 'mp-ecommerce', type: 'template', name: 'E-commerce Pro', description: 'Loja virtual completa', author: 'MS Team', version: '2.0.0', category: 'E-commerce', rating: 4.9, downloads: 3450, price: 49.90, installed: false, autoUpdate: true, createdAt: '2026-06-15' },
    { id: 'mp-social', type: 'template', name: 'Social Network', description: 'Rede social pronta', author: 'MS Team', version: '1.5.0', category: 'Social', rating: 4.6, downloads: 2100, price: 39.90, installed: false, autoUpdate: true, createdAt: '2026-06-20' },
    { id: 'mp-dark', type: 'theme', name: 'Dark Premium', description: 'Tema escuro profissional', author: 'MS Team', version: '1.0.0', category: 'Temas', rating: 4.7, downloads: 5600, price: 0, installed: false, autoUpdate: true, createdAt: '2026-07-10' },
  ];

  getAll() { return this.items; }
  getByType(type: string) { return this.items.filter(i => i.type === type); }
  search(q: string) { return this.items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)); }
  install(id: string) { const i = this.items.find(x => x.id === id); if (i) { i.installed = true; this.persist(); } }
  uninstall(id: string) { const i = this.items.find(x => x.id === id); if (i) { i.installed = false; this.persist(); } }

  private persist() { try { localStorage.setItem('ms_marketplace', JSON.stringify(this.items)); } catch {} }
}

export const marketplace = new MarketplacePlatform();