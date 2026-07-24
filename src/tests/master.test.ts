import { describe, it, expect } from 'vitest';
import { INITIAL_MASTER_COMPONENTS, DEFAULT_MASTER_CATEGORIES } from '../constants/masterTemplates';

describe('Master Component System', () => {
  it('loads default master categories', () => {
    expect(DEFAULT_MASTER_CATEGORIES).toContain('Navegação');
    expect(DEFAULT_MASTER_CATEGORIES).toContain('Cards');
    expect(DEFAULT_MASTER_CATEGORIES).toContain('Formulários');
  });

  it('provides ready-to-use initial master component templates', () => {
    expect(INITIAL_MASTER_COMPONENTS.length).toBeGreaterThan(0);
    const headerMaster = INITIAL_MASTER_COMPONENTS.find((m) => m.category === 'Cabeçalhos' || m.name.includes('Card'));
    expect(headerMaster).toBeDefined();
    expect(headerMaster?.rootComponent).toBeDefined();
    expect(headerMaster?.childrenComponents.length).toBeGreaterThan(0);
  });
});
