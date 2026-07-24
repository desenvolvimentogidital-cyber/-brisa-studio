import { CanvasComponent } from '../types';

/**
 * Calculates absolute coordinates (x, y) on the device canvas for a component,
 * taking into account relative offset from all parent containers up the hierarchy.
 */
export function getAbsolutePosition(
  componentId: string,
  componentsMap: Map<string, CanvasComponent>
): { x: number; y: number } {
  const comp = componentsMap.get(componentId);
  if (!comp) return { x: 0, y: 0 };

  let absX = comp.x;
  let absY = comp.y;
  let current = comp;

  while (current.parentId) {
    const parent = componentsMap.get(current.parentId);
    if (!parent) break;
    absX += parent.x;
    absY += parent.y;
    current = parent;
  }

  return { x: absX, y: absY };
}

/**
 * Gets all descendant IDs (children, grandchildren, etc.) of a list of component IDs.
 */
export function getDescendantIds(
  rootIds: string[],
  components: CanvasComponent[]
): string[] {
  const result = new Set<string>();
  const parentToChildrenMap = new Map<string, string[]>();

  for (const c of components) {
    if (c.parentId) {
      const list = parentToChildrenMap.get(c.parentId) || [];
      list.push(c.id);
      parentToChildrenMap.set(c.parentId, list);
    }
  }

  function collect(id: string) {
    if (result.has(id)) return;
    result.add(id);
    const children = parentToChildrenMap.get(id) || [];
    for (const childId of children) {
      collect(childId);
    }
  }

  for (const id of rootIds) {
    collect(id);
  }

  return Array.from(result);
}

/**
 * Checks if targetId is an ancestor of potentialChildId to prevent circular references.
 */
export function isAncestorOf(
  potentialAncestorId: string,
  targetId: string,
  componentsMap: Map<string, CanvasComponent>
): boolean {
  let current = componentsMap.get(targetId);
  while (current && current.parentId) {
    if (current.parentId === potentialAncestorId) {
      return true;
    }
    current = componentsMap.get(current.parentId);
  }
  return false;
}

/**
 * Checks if component is effectively hidden (either itself or any parent is hidden).
 */
export function isComponentHidden(
  componentId: string,
  componentsMap: Map<string, CanvasComponent>
): boolean {
  let current = componentsMap.get(componentId);
  while (current) {
    if (current.hidden) return true;
    if (!current.parentId) break;
    current = componentsMap.get(current.parentId);
  }
  return false;
}

/**
 * Checks if component is effectively locked (either itself or any parent is locked).
 */
export function isComponentLocked(
  componentId: string,
  componentsMap: Map<string, CanvasComponent>
): boolean {
  let current = componentsMap.get(componentId);
  while (current) {
    if (current.locked) return true;
    if (!current.parentId) break;
    current = componentsMap.get(current.parentId);
  }
  return false;
}

/**
 * Represents a tree node for the Layers panel.
 */
export interface ComponentTreeNode {
  component: CanvasComponent;
  children: ComponentTreeNode[];
  depth: number;
}

/**
 * Builds a hierarchical tree structure from a flat array of components.
 */
export function buildComponentTree(
  components: CanvasComponent[]
): ComponentTreeNode[] {
  const compMap = new Map<string, CanvasComponent>();
  const childrenMap = new Map<string, CanvasComponent[]>();

  for (const c of components) {
    compMap.set(c.id, c);
  }

  const rootComps: CanvasComponent[] = [];

  for (const c of components) {
    if (c.parentId && compMap.has(c.parentId)) {
      const list = childrenMap.get(c.parentId) || [];
      list.push(c);
      childrenMap.set(c.parentId, list);
    } else {
      rootComps.push(c);
    }
  }

  // Sort function by zIndex descending (top elements first)
  const sortByZIndexDesc = (a: CanvasComponent, b: CanvasComponent) => b.zIndex - a.zIndex;

  function buildNode(comp: CanvasComponent, depth: number): ComponentTreeNode {
    const rawChildren = childrenMap.get(comp.id) || [];
    rawChildren.sort(sortByZIndexDesc);
    return {
      component: comp,
      children: rawChildren.map((child) => buildNode(child, depth + 1)),
      depth,
    };
  }

  rootComps.sort(sortByZIndexDesc);
  return rootComps.map((root) => buildNode(root, 0));
}
