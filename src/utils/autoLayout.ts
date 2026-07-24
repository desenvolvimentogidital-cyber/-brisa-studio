import { CanvasComponent, LayoutDirection, LayoutDistribution, LayoutAlignment, ComponentConstraints } from '../types';

/**
 * Recalculates coordinates and dimensions for children of a given container
 * according to Auto Layout rules (Direction, Distribution, Alignment, Gap, Padding).
 */
export function recalculateContainerAutoLayout(
  container: CanvasComponent,
  allComponents: CanvasComponent[]
): CanvasComponent[] {
  const isAutoLayoutEnabled =
    container.autoLayout ||
    container.type === 'row' ||
    container.type === 'column' ||
    container.type === 'grid';

  if (!isAutoLayoutEnabled) {
    return allComponents;
  }

  const children = allComponents.filter((c) => c.parentId === container.id);
  if (children.length === 0) {
    return allComponents;
  }

  const direction: LayoutDirection =
    container.layoutDirection ||
    (container.type === 'row' ? 'horizontal' : container.type === 'column' ? 'vertical' : container.type === 'grid' ? 'grid' : 'vertical');

  const distribution: LayoutDistribution = container.layoutDistribution || 'start';
  const alignment: LayoutAlignment = container.layoutAlignment || 'start';
  const gap = container.itemGap !== undefined ? container.itemGap : 8;
  const gridRowGap = container.gridRowGap !== undefined ? container.gridRowGap : gap;
  const gridCols = Math.max(1, container.gridColumns || 2);

  const pTop = container.paddingTop || 0;
  const pRight = container.paddingRight || 0;
  const pBottom = container.paddingBottom || 0;
  const pLeft = container.paddingLeft || 0;

  const innerWidth = Math.max(10, container.width - pLeft - pRight);
  const innerHeight = Math.max(10, container.height - pTop - pBottom);

  const updatedChildrenMap = new Map<string, Partial<CanvasComponent>>();

  if (direction === 'horizontal') {
    const totalChildWidth = children.reduce((acc, c) => acc + c.width, 0);
    const count = children.length;

    let startX = pLeft;
    let computedGap = gap;

    if (distribution === 'end') {
      startX = container.width - pRight - totalChildWidth - (count - 1) * gap;
    } else if (distribution === 'center') {
      startX = pLeft + Math.max(0, (innerWidth - totalChildWidth - (count - 1) * gap) / 2);
    } else if (distribution === 'space-between') {
      computedGap = count > 1 ? Math.max(0, (innerWidth - totalChildWidth) / (count - 1)) : gap;
      startX = pLeft;
    } else if (distribution === 'space-around') {
      computedGap = count > 0 ? Math.max(0, (innerWidth - totalChildWidth) / count) : gap;
      startX = pLeft + computedGap / 2;
    } else if (distribution === 'space-evenly') {
      computedGap = count > 0 ? Math.max(0, (innerWidth - totalChildWidth) / (count + 1)) : gap;
      startX = pLeft + computedGap;
    }

    let currentX = startX;

    children.forEach((child) => {
      let childY = pTop;
      let childHeight = child.height;

      if (alignment === 'center') {
        childY = Math.round(pTop + (innerHeight - child.height) / 2);
      } else if (alignment === 'end') {
        childY = Math.round(container.height - pBottom - child.height);
      } else if (alignment === 'stretch') {
        childY = pTop;
        childHeight = Math.max(10, innerHeight);
      }

      updatedChildrenMap.set(child.id, {
        x: Math.round(currentX),
        y: childY,
        height: childHeight,
      });

      currentX += child.width + computedGap;
    });
  } else if (direction === 'vertical') {
    const totalChildHeight = children.reduce((acc, c) => acc + c.height, 0);
    const count = children.length;

    let startY = pTop;
    let computedGap = gap;

    if (distribution === 'end') {
      startY = container.height - pBottom - totalChildHeight - (count - 1) * gap;
    } else if (distribution === 'center') {
      startY = pTop + Math.max(0, (innerHeight - totalChildHeight - (count - 1) * gap) / 2);
    } else if (distribution === 'space-between') {
      computedGap = count > 1 ? Math.max(0, (innerHeight - totalChildHeight) / (count - 1)) : gap;
      startY = pTop;
    } else if (distribution === 'space-around') {
      computedGap = count > 0 ? Math.max(0, (innerHeight - totalChildHeight) / count) : gap;
      startY = pTop + computedGap / 2;
    } else if (distribution === 'space-evenly') {
      computedGap = count > 0 ? Math.max(0, (innerHeight - totalChildHeight) / (count + 1)) : gap;
      startY = pTop + computedGap;
    }

    let currentY = startY;

    children.forEach((child) => {
      let childX = pLeft;
      let childWidth = child.width;

      if (alignment === 'center') {
        childX = Math.round(pLeft + (innerWidth - child.width) / 2);
      } else if (alignment === 'end') {
        childX = Math.round(container.width - pRight - child.width);
      } else if (alignment === 'stretch') {
        childX = pLeft;
        childWidth = Math.max(10, innerWidth);
      }

      updatedChildrenMap.set(child.id, {
        x: childX,
        y: Math.round(currentY),
        width: childWidth,
      });

      currentY += child.height + computedGap;
    });
  } else if (direction === 'grid') {
    const colWidth = Math.max(10, (innerWidth - (gridCols - 1) * gap) / gridCols);

    children.forEach((child, idx) => {
      const row = Math.floor(idx / gridCols);
      const col = idx % gridCols;

      const childX = Math.round(pLeft + col * (colWidth + gap));
      const childY = Math.round(pTop + row * (child.height + gridRowGap));

      let childWidth = child.width;
      if (child.constraints?.fillParent || alignment === 'stretch') {
        childWidth = Math.round(colWidth);
      }

      updatedChildrenMap.set(child.id, {
        x: childX,
        y: childY,
        width: childWidth,
      });
    });
  } else if (direction === 'wrap') {
    let currentX = pLeft;
    let currentY = pTop;
    let lineHeight = 0;

    children.forEach((child) => {
      if (currentX + child.width > container.width - pRight && currentX > pLeft) {
        currentX = pLeft;
        currentY += lineHeight + gap;
        lineHeight = 0;
      }

      updatedChildrenMap.set(child.id, {
        x: Math.round(currentX),
        y: Math.round(currentY),
      });

      currentX += child.width + gap;
      lineHeight = Math.max(lineHeight, child.height);
    });
  }

  return allComponents.map((comp) => {
    const update = updatedChildrenMap.get(comp.id);
    if (update) {
      return { ...comp, ...update };
    }
    return comp;
  });
}

/**
 * Recursively applies auto layout to all containers in the component tree.
 */
export function recalculateAllAutoLayouts(components: CanvasComponent[]): CanvasComponent[] {
  let current = [...components];

  const containers = current.filter(
    (c) =>
      c.autoLayout ||
      c.type === 'container' ||
      c.type === 'card' ||
      c.type === 'row' ||
      c.type === 'column' ||
      c.type === 'grid'
  );

  containers.forEach((container) => {
    current = recalculateContainerAutoLayout(container, current);
  });

  return current;
}

/**
 * Applies responsive constraints when parent device or container resizes.
 */
export function applyResizeConstraints(
  comp: CanvasComponent,
  oldParentWidth: number,
  oldParentHeight: number,
  newParentWidth: number,
  newParentHeight: number
): Partial<CanvasComponent> {
  const constraints: ComponentConstraints = comp.constraints || {
    horizontal: 'left',
    vertical: 'top',
  };

  let newX = comp.x;
  let newY = comp.y;
  let newWidth = comp.width;
  let newHeight = comp.height;

  // Horizontal constraint calculation
  switch (constraints.horizontal) {
    case 'left':
      newX = comp.x;
      break;

    case 'right': {
      const rightDistance = oldParentWidth - (comp.x + comp.width);
      newX = newParentWidth - rightDistance - comp.width;
      break;
    }

    case 'center':
      newX = Math.round((newParentWidth - comp.width) / 2);
      break;

    case 'stretch': {
      const rightDistance = oldParentWidth - (comp.x + comp.width);
      newWidth = Math.max(10, newParentWidth - comp.x - rightDistance);
      break;
    }

    case 'scale': {
      const scaleX = newParentWidth / Math.max(1, oldParentWidth);
      newX = Math.round(comp.x * scaleX);
      newWidth = Math.max(10, Math.round(comp.width * scaleX));
      break;
    }
  }

  // Vertical constraint calculation
  switch (constraints.vertical) {
    case 'top':
      newY = comp.y;
      break;

    case 'bottom': {
      const bottomDistance = oldParentHeight - (comp.y + comp.height);
      newY = newParentHeight - bottomDistance - comp.height;
      break;
    }

    case 'center':
      newY = Math.round((newParentHeight - comp.height) / 2);
      break;

    case 'stretch': {
      const bottomDistance = oldParentHeight - (comp.y + comp.height);
      newHeight = Math.max(10, newParentHeight - comp.y - bottomDistance);
      break;
    }

    case 'scale': {
      const scaleY = newParentHeight / Math.max(1, oldParentHeight);
      newY = Math.round(comp.y * scaleY);
      newHeight = Math.max(10, Math.round(comp.height * scaleY));
      break;
    }
  }

  if (constraints.maintainAspectRatio && comp.width > 0 && comp.height > 0) {
    const ratio = comp.width / comp.height;
    newHeight = Math.round(newWidth / ratio);
  }

  return {
    x: Math.round(newX),
    y: Math.round(newY),
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
}

/**
 * Resizes screen or device viewports and recalculates all component positions based on constraints.
 */
export function applyDeviceViewportResize(
  components: CanvasComponent[],
  oldDeviceWidth: number,
  oldDeviceHeight: number,
  newDeviceWidth: number,
  newDeviceHeight: number
): CanvasComponent[] {
  const updatedTopLevel = components.map((comp) => {
    if (!comp.parentId) {
      const updates = applyResizeConstraints(
        comp,
        oldDeviceWidth,
        oldDeviceHeight,
        newDeviceWidth,
        newDeviceHeight
      );
      return { ...comp, ...updates };
    }
    return comp;
  });

  return recalculateAllAutoLayouts(updatedTopLevel);
}
