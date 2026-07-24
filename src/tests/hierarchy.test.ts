import { describe, it, expect } from 'vitest';
import {
  getAbsolutePosition,
  getDescendantIds,
  isAncestorOf,
  isComponentHidden,
  isComponentLocked,
  buildComponentTree,
} from '../utils/hierarchy';
import { createNewComponent } from '../constants/componentTemplates';
import { CanvasComponent } from '../types';

describe('Hierarchy Utilities', () => {
  const sampleComponents: CanvasComponent[] = [
    {
      ...createNewComponent('container', 20, 40),
      id: 'container_1',
      name: 'Card Container',
      width: 300,
      height: 200,
      zIndex: 1,
      hidden: false,
      locked: false,
    },
    {
      ...createNewComponent('button', 10, 15),
      id: 'button_1',
      name: 'Primary Button',
      width: 120,
      height: 40,
      parentId: 'container_1',
      zIndex: 2,
      hidden: false,
      locked: false,
    },
    {
      ...createNewComponent('text', 5, 5),
      id: 'text_1',
      name: 'Button Label',
      width: 50,
      height: 20,
      parentId: 'button_1',
      zIndex: 3,
      hidden: false,
      locked: false,
    },
    {
      ...createNewComponent('icon', 0, 0),
      id: 'icon_1',
      name: 'Hidden Icon',
      width: 24,
      height: 24,
      parentId: 'container_1',
      zIndex: 4,
      hidden: true,
      locked: false,
    },
  ];

  const map = new Map<string, CanvasComponent>(sampleComponents.map((c) => [c.id, c]));

  it('calculates absolute position considering nested parents', () => {
    // Root container position (20, 40)
    expect(getAbsolutePosition('container_1', map)).toEqual({ x: 20, y: 40 });

    // button_1 relative to container_1 (10, 15) => absolute (30, 55)
    expect(getAbsolutePosition('button_1', map)).toEqual({ x: 30, y: 55 });

    // text_1 relative to button_1 (5, 5) => absolute (35, 60)
    expect(getAbsolutePosition('text_1', map)).toEqual({ x: 35, y: 60 });
  });

  it('collects all descendant IDs recursively', () => {
    const descendants = getDescendantIds(['container_1'], sampleComponents);
    expect(descendants).toContain('container_1');
    expect(descendants).toContain('button_1');
    expect(descendants).toContain('text_1');
    expect(descendants).toContain('icon_1');
    expect(descendants.length).toBe(4);
  });

  it('detects ancestor relationship to prevent cyclic reparenting', () => {
    expect(isAncestorOf('container_1', 'text_1', map)).toBe(true);
    expect(isAncestorOf('button_1', 'text_1', map)).toBe(true);
    expect(isAncestorOf('text_1', 'container_1', map)).toBe(false);
  });

  it('detects component hidden or locked status inherited from parent', () => {
    expect(isComponentHidden('icon_1', map)).toBe(true);
    expect(isComponentHidden('button_1', map)).toBe(false);

    // Lock container_1 and verify child inherits locked status
    const lockedMap = new Map(map);
    const parent = lockedMap.get('container_1')!;
    lockedMap.set('container_1', { ...parent, locked: true });

    expect(isComponentLocked('text_1', lockedMap)).toBe(true);
  });

  it('builds component tree correctly sorted by zIndex', () => {
    const tree = buildComponentTree(sampleComponents);
    expect(tree.length).toBe(1); // root container_1
    expect(tree[0].component.id).toBe('container_1');
    expect(tree[0].children.length).toBe(2); // icon_1 (zIndex 4) and button_1 (zIndex 2)
    expect(tree[0].children[0].component.id).toBe('icon_1'); // higher zIndex first
  });
});
