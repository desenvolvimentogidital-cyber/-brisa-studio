import { describe, it, expect } from 'vitest';
import { COMPONENT_CATALOG, createNewComponent } from '../constants/componentTemplates';
import { calculateSmartGuides } from '../utils/smartGuides';
import { CanvasComponent } from '../types';

describe('Canvas Templates & Smart Guides', () => {
  it('creates component from template catalog with unique ID and default styling', () => {
    const buttonComp = createNewComponent('button', 50, 100);
    expect(buttonComp).toBeDefined();
    expect(buttonComp.type).toBe('button');
    expect(buttonComp.x).toBe(50);
    expect(buttonComp.y).toBe(100);
    expect(buttonComp.width).toBeGreaterThan(0);
    expect(buttonComp.height).toBeGreaterThan(0);
    expect(buttonComp.content).toBeDefined();
  });

  it('includes required component types in catalog', () => {
    const types = COMPONENT_CATALOG.map((c) => c.type);
    expect(types).toContain('button');
    expect(types).toContain('text');
    expect(types).toContain('container');
    expect(types).toContain('image');
    expect(types).toContain('input');
    expect(types).toContain('avatar');
    expect(types).toContain('card');
  });

  it('calculates alignment smart guides when dragging components', () => {
    const existingComponents: CanvasComponent[] = [
      {
        ...createNewComponent('text', 100, 100),
        id: 'comp_1',
        name: 'Header',
        width: 200,
        height: 40,
        zIndex: 1,
      },
    ];

    const activeComponent: CanvasComponent = {
      ...createNewComponent('text', 102, 180),
      id: 'comp_2',
      name: 'Subhead',
      width: 200,
      height: 30,
      zIndex: 2,
    };

    const { snappedX, guides } = calculateSmartGuides(
      activeComponent,
      existingComponents,
      { width: 390, height: 844 },
      true
    );

    // Should snap X left edge to 100
    expect(snappedX).toBe(100);
    expect(guides.length).toBeGreaterThan(0);
  });
});
