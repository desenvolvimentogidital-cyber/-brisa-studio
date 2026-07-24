import { CanvasComponent } from '../types';

export interface GuideLine {
  id: string;
  type: 'vertical' | 'horizontal';
  position: number; // x for vertical line, y for horizontal line
  start: number;    // min coordinate along line
  end: number;      // max coordinate along line
  label?: string;   // distance or alignment text e.g., "16px"
}

export interface SmartGuideResult {
  snappedX: number;
  snappedY: number;
  guides: GuideLine[];
}

interface Bounds {
  left: number;
  centerX: number;
  right: number;
  top: number;
  centerY: number;
  bottom: number;
  width: number;
  height: number;
}

const SNAP_THRESHOLD = 5;

export function calculateSmartGuides(
  target: { x: number; y: number; width: number; height: number; id?: string },
  otherComponents: CanvasComponent[],
  device: { width: number; height: number },
  snapEnabled: boolean = true
): SmartGuideResult {
  let snappedX = target.x;
  let snappedY = target.y;
  const guides: GuideLine[] = [];

  const targetBounds: Bounds = {
    left: target.x,
    centerX: target.x + target.width / 2,
    right: target.x + target.width,
    top: target.y,
    centerY: target.y + target.height / 2,
    bottom: target.y + target.height,
    width: target.width,
    height: target.height,
  };

  // Viewport canvas height (adjusting for status bar 44px if needed)
  const deviceViewportHeight = device.height - 44;

  // Screen Guidelines
  const screenXTargets = [
    { pos: 0, type: 'left', label: 'Borda Esquerda' },
    { pos: device.width / 2, type: 'centerX', label: 'Centro V' },
    { pos: device.width, type: 'right', label: 'Borda Direita' },
  ];

  const screenYTargets = [
    { pos: 0, type: 'top', label: 'Topo' },
    { pos: deviceViewportHeight / 2, type: 'centerY', label: 'Centro H' },
    { pos: deviceViewportHeight, type: 'bottom', label: 'Fundo' },
  ];

  let minDiffX = SNAP_THRESHOLD + 1;
  let minDiffY = SNAP_THRESHOLD + 1;

  // Check Vertical Snapping (X) against Screen
  if (snapEnabled) {
    for (const st of screenXTargets) {
      // Align target left
      let diff = Math.abs(targetBounds.left - st.pos);
      if (diff < minDiffX) {
        minDiffX = diff;
        snappedX = st.pos;
      }
      // Align target center
      diff = Math.abs(targetBounds.centerX - st.pos);
      if (diff < minDiffX) {
        minDiffX = diff;
        snappedX = st.pos - targetBounds.width / 2;
      }
      // Align target right
      diff = Math.abs(targetBounds.right - st.pos);
      if (diff < minDiffX) {
        minDiffX = diff;
        snappedX = st.pos - targetBounds.width;
      }
    }

    // Check Horizontal Snapping (Y) against Screen
    for (const st of screenYTargets) {
      // Align target top
      let diff = Math.abs(targetBounds.top - st.pos);
      if (diff < minDiffY) {
        minDiffY = diff;
        snappedY = st.pos;
      }
      // Align target center
      diff = Math.abs(targetBounds.centerY - st.pos);
      if (diff < minDiffY) {
        minDiffY = diff;
        snappedY = st.pos - targetBounds.height / 2;
      }
      // Align target bottom
      diff = Math.abs(targetBounds.bottom - st.pos);
      if (diff < minDiffY) {
        minDiffY = diff;
        snappedY = st.pos - targetBounds.height;
      }
    }
  }

  // Recalculate target bounds after potential screen snap
  const currentBounds: Bounds = {
    left: snappedX,
    centerX: snappedX + target.width / 2,
    right: snappedX + target.width,
    top: snappedY,
    centerY: snappedY + target.height / 2,
    bottom: snappedY + target.height,
    width: target.width,
    height: target.height,
  };

  // Check against other components
  const validOthers = otherComponents.filter(
    (c) => !c.hidden && c.id !== target.id
  );

  for (const other of validOthers) {
    const oBounds: Bounds = {
      left: other.x,
      centerX: other.x + other.width / 2,
      right: other.x + other.width,
      top: other.y,
      centerY: other.y + other.height / 2,
      bottom: other.y + other.height,
      width: other.width,
      height: other.height,
    };

    if (snapEnabled) {
      // X alignments
      const xAlignments = [
        { targetVal: currentBounds.left, otherVal: oBounds.left, newX: oBounds.left },
        { targetVal: currentBounds.left, otherVal: oBounds.right, newX: oBounds.right },
        { targetVal: currentBounds.right, otherVal: oBounds.left, newX: oBounds.left - currentBounds.width },
        { targetVal: currentBounds.right, otherVal: oBounds.right, newX: oBounds.right - currentBounds.width },
        { targetVal: currentBounds.centerX, otherVal: oBounds.centerX, newX: oBounds.centerX - currentBounds.width / 2 },
      ];

      for (const align of xAlignments) {
        const diff = Math.abs(align.targetVal - align.otherVal);
        if (diff < minDiffX) {
          minDiffX = diff;
          snappedX = align.newX;
        }
      }

      // Y alignments
      const yAlignments = [
        { targetVal: currentBounds.top, otherVal: oBounds.top, newY: oBounds.top },
        { targetVal: currentBounds.top, otherVal: oBounds.bottom, newY: oBounds.bottom },
        { targetVal: currentBounds.bottom, otherVal: oBounds.top, newY: oBounds.top - currentBounds.height },
        { targetVal: currentBounds.bottom, otherVal: oBounds.bottom, newY: oBounds.bottom - currentBounds.height },
        { targetVal: currentBounds.centerY, otherVal: oBounds.centerY, newY: oBounds.centerY - currentBounds.height / 2 },
      ];

      for (const align of yAlignments) {
        const diff = Math.abs(align.targetVal - align.otherVal);
        if (diff < minDiffY) {
          minDiffY = diff;
          snappedY = align.newY;
        }
      }
    }
  }

  // Update final bounds for generating visual guide lines
  const finalBounds: Bounds = {
    left: snappedX,
    centerX: snappedX + target.width / 2,
    right: snappedX + target.width,
    top: snappedY,
    centerY: snappedY + target.height / 2,
    bottom: snappedY + target.height,
    width: target.width,
    height: target.height,
  };

  // Generate Visual Vertical Guides (X)
  const xPositions = [
    { val: finalBounds.left, label: 'L' },
    { val: finalBounds.centerX, label: 'C' },
    { val: finalBounds.right, label: 'R' },
  ];

  for (const xp of xPositions) {
    // Check match with screen
    for (const st of screenXTargets) {
      if (Math.abs(xp.val - st.pos) < 1) {
        guides.push({
          id: `v_screen_${st.pos}_${xp.val}`,
          type: 'vertical',
          position: st.pos,
          start: 0,
          end: deviceViewportHeight,
        });
      }
    }

    // Check match with other components
    for (const other of validOthers) {
      const oLeft = other.x;
      const oCenter = other.x + other.width / 2;
      const oRight = other.x + other.width;

      if (
        Math.abs(xp.val - oLeft) < 1 ||
        Math.abs(xp.val - oCenter) < 1 ||
        Math.abs(xp.val - oRight) < 1
      ) {
        const minY = Math.min(finalBounds.top, other.y);
        const maxY = Math.max(finalBounds.bottom, other.y + other.height);
        guides.push({
          id: `v_comp_${other.id}_${xp.val}`,
          type: 'vertical',
          position: xp.val,
          start: minY - 8,
          end: maxY + 8,
        });
      }
    }
  }

  // Generate Visual Horizontal Guides (Y)
  const yPositions = [
    { val: finalBounds.top, label: 'T' },
    { val: finalBounds.centerY, label: 'C' },
    { val: finalBounds.bottom, label: 'B' },
  ];

  for (const yp of yPositions) {
    // Check match with screen
    for (const st of screenYTargets) {
      if (Math.abs(yp.val - st.pos) < 1) {
        guides.push({
          id: `h_screen_${st.pos}_${yp.val}`,
          type: 'horizontal',
          position: st.pos,
          start: 0,
          end: device.width,
        });
      }
    }

    // Check match with other components
    for (const other of validOthers) {
      const oTop = other.y;
      const oCenter = other.y + other.height / 2;
      const oBottom = other.y + other.height;

      if (
        Math.abs(yp.val - oTop) < 1 ||
        Math.abs(yp.val - oCenter) < 1 ||
        Math.abs(yp.val - oBottom) < 1
      ) {
        const minX = Math.min(finalBounds.left, other.x);
        const maxX = Math.max(finalBounds.right, other.x + other.width);
        guides.push({
          id: `h_comp_${other.id}_${yp.val}`,
          type: 'horizontal',
          position: yp.val,
          start: minX - 8,
          end: maxX + 8,
        });
      }
    }
  }

  // Calculate Distance Indicators (Pixel measurements between components or bounds)
  for (const other of validOthers) {
    // Horizontal gap between target and other
    if (
      (finalBounds.top <= other.y + other.height && finalBounds.bottom >= other.y)
    ) {
      if (finalBounds.left > other.x + other.width) {
        const gap = Math.round(finalBounds.left - (other.x + other.width));
        if (gap > 0 && gap < 200) {
          const midY = (Math.max(finalBounds.top, other.y) + Math.min(finalBounds.bottom, other.y + other.height)) / 2;
          guides.push({
            id: `dist_h_${other.id}`,
            type: 'horizontal',
            position: midY,
            start: other.x + other.width,
            end: finalBounds.left,
            label: `${gap}px`,
          });
        }
      } else if (other.x > finalBounds.right) {
        const gap = Math.round(other.x - finalBounds.right);
        if (gap > 0 && gap < 200) {
          const midY = (Math.max(finalBounds.top, other.y) + Math.min(finalBounds.bottom, other.y + other.height)) / 2;
          guides.push({
            id: `dist_h_${other.id}`,
            type: 'horizontal',
            position: midY,
            start: finalBounds.right,
            end: other.x,
            label: `${gap}px`,
          });
        }
      }
    }

    // Vertical gap between target and other
    if (
      (finalBounds.left <= other.x + other.width && finalBounds.right >= other.x)
    ) {
      if (finalBounds.top > other.y + other.height) {
        const gap = Math.round(finalBounds.top - (other.y + other.height));
        if (gap > 0 && gap < 200) {
          const midX = (Math.max(finalBounds.left, other.x) + Math.min(finalBounds.right, other.x + other.width)) / 2;
          guides.push({
            id: `dist_v_${other.id}`,
            type: 'vertical',
            position: midX,
            start: other.y + other.height,
            end: finalBounds.top,
            label: `${gap}px`,
          });
        }
      } else if (other.y > finalBounds.bottom) {
        const gap = Math.round(other.y - finalBounds.bottom);
        if (gap > 0 && gap < 200) {
          const midX = (Math.max(finalBounds.left, other.x) + Math.min(finalBounds.right, other.x + other.width)) / 2;
          guides.push({
            id: `dist_v_${other.id}`,
            type: 'vertical',
            position: midX,
            start: finalBounds.bottom,
            end: other.y,
            label: `${gap}px`,
          });
        }
      }
    }
  }

  // Remove duplicate guide lines
  const uniqueGuidesMap = new Map<string, GuideLine>();
  for (const g of guides) {
    const key = `${g.type}_${g.position}_${g.start}_${g.end}_${g.label || ''}`;
    if (!uniqueGuidesMap.has(key)) {
      uniqueGuidesMap.set(key, g);
    }
  }

  return {
    snappedX: Math.round(snappedX),
    snappedY: Math.round(snappedY),
    guides: Array.from(uniqueGuidesMap.values()),
  };
}
