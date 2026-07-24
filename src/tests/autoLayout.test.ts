import { describe, it, expect } from 'vitest';
import { createNewComponent } from '../constants/componentTemplates';
import { recalculateContainerAutoLayout, applyResizeConstraints, applyDeviceViewportResize } from '../utils/autoLayout';
import { CanvasComponent } from '../types';

describe('Auto Layout & Responsive Constraints Utility', () => {
  it('recalculates horizontal Auto Layout positions correctly', () => {
    const container: CanvasComponent = {
      ...createNewComponent('container', 0, 0),
      id: 'cont_1',
      width: 300,
      height: 100,
      autoLayout: true,
      layoutDirection: 'horizontal',
      layoutDistribution: 'start',
      layoutAlignment: 'center',
      itemGap: 10,
      paddingLeft: 10,
      paddingTop: 10,
    };

    const child1: CanvasComponent = {
      ...createNewComponent('button', 0, 0),
      id: 'c1',
      parentId: 'cont_1',
      width: 80,
      height: 40,
    };

    const child2: CanvasComponent = {
      ...createNewComponent('button', 0, 0),
      id: 'c2',
      parentId: 'cont_1',
      width: 100,
      height: 40,
    };

    const updated = recalculateContainerAutoLayout(container, [container, child1, child2]);
    const updatedC1 = updated.find((c) => c.id === 'c1')!;
    const updatedC2 = updated.find((c) => c.id === 'c2')!;

    // child1 starts at paddingLeft 10
    expect(updatedC1.x).toBe(10);
    // child2 starts at 10 + 80 + gap(10) = 100
    expect(updatedC2.x).toBe(100);
  });

  it('applies responsive resize constraints accurately', () => {
    const comp: CanvasComponent = {
      ...createNewComponent('button', 20, 20),
      id: 'b1',
      width: 100,
      height: 40,
      constraints: {
        horizontal: 'stretch',
        vertical: 'top',
      },
    };

    // Resizing parent/viewport from 300 to 400 width
    const updates = applyResizeConstraints(comp, 300, 500, 400, 500);

    expect(updates.x).toBe(20);
    // Stretch from left distance 20 and right distance (300 - (20+100) = 180).
    // New width = 400 - 20 - 180 = 200
    expect(updates.width).toBe(200);
  });

  it('handles device viewport resizing for all top-level components', () => {
    const comp: CanvasComponent = {
      ...createNewComponent('card', 10, 10),
      id: 'card_1',
      width: 350,
      height: 200,
      constraints: {
        horizontal: 'scale',
        vertical: 'scale',
      },
    };

    const updated = applyDeviceViewportResize([comp], 375, 812, 750, 1624);
    expect(updated[0].x).toBe(20);
    expect(updated[0].width).toBe(700);
  });
});
