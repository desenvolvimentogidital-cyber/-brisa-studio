// ==========================================
// Mobile Studio - Universal Event Injection
// ==========================================
// Automatically injects event support into every component.
// No component should exist without event support.

import { CanvasComponent, ComponentType } from '../types';
import { ComponentEvents, createDefaultEventConfig, ALL_COMPONENT_EVENTS } from './ComponentEvents';

/**
 * All component types that must support events
 */
export const ALL_COMPONENT_TYPES: ComponentType[] = [
  'text', 'button', 'image', 'icon', 'badge', 'chip', 'avatar', 'divider',
  'input', 'password', 'checkbox', 'radio', 'switch', 'slider', 'progressbar',
  'container', 'card', 'row', 'column', 'grid', 'scroll',
  'floating_button', 'bottom_nav', 'top_app_bar', 'drawer', 'tabs',
  'modal', 'dialog', 'snackbar', 'tooltip', 'video', 'audio', 'map', 'webview', 'calendar', 'carousel', 'lottie',
];

/**
 * Ensure a component has an events property
 * If events is not present, create an empty one.
 * This is called every time a component is created.
 */
export function ensureComponentEvents(component: CanvasComponent): CanvasComponent {
  if (!component.events) {
    component.events = {};
  }
  return component;
}

/**
 * Initialize a component with default empty events
 * This ensures every new component has the events structure.
 */
export function createComponentWithEvents(
  component: CanvasComponent
): CanvasComponent {
  const enhanced = { ...component };
  if (!enhanced.events) {
    enhanced.events = {};
  }
  return enhanced;
}

/**
 * Check if a component has any enabled events
 */
export function hasEnabledEvents(component: CanvasComponent): boolean {
  if (!component.events) return false;
  return Object.values(component.events).some((config: any) => config?.enabled === true);
}

/**
 * Count enabled events on a component
 */
export function countEnabledEvents(component: CanvasComponent): number {
  if (!component.events) return 0;
  return Object.values(component.events).filter((config: any) => config?.enabled === true).length;
}

/**
 * Get event summary for a component (for display)
 */
export function getEventSummary(component: CanvasComponent): string {
  const count = countEnabledEvents(component);
  if (count === 0) return '';
  const firstEvent = Object.entries(component.events || {}).find(([_, config]: [string, any]) => config?.enabled === true);
  if (count === 1 && firstEvent) {
    return firstEvent[0].replace('on', '');
  }
  return `${count} eventos`;
}

/**
 * Visual indicator for components with events
 * Returns an object with color, symbol, and tooltip
 */
export function getEventIndicator(component: CanvasComponent): { show: boolean; symbol: string; color: string; tooltip: string } {
  const count = countEnabledEvents(component);
  if (count === 0) {
    return { show: false, symbol: '', color: '', tooltip: '' };
  }
  return {
    show: true,
    symbol: '⚡',
    color: '#F59E0B',
    tooltip: `${count} evento(s) configurado(s)`,
  };
}

/**
 * Inject events into a list of components recursively
 */
export function injectEventsToComponents(components: CanvasComponent[]): CanvasComponent[] {
  return components.map((comp) => {
    const enhanced = createComponentWithEvents(comp);
    if (enhanced.children && enhanced.children.length > 0) {
      enhanced.children = injectEventsToComponents(enhanced.children);
    }
    return enhanced;
  });
}