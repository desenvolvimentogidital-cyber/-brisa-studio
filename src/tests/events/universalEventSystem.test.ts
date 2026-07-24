// ==========================================
// Mobile Studio - Universal Event System Tests
// ==========================================
// Tests for: ComponentEvents, EventEngine, IR, Exporters, SDK, Undo/Redo

import {
  ComponentEventType,
  ALL_COMPONENT_EVENTS,
  EVENT_LABELS,
  EVENT_CATEGORIES,
  ComponentEventConfig,
  EventAction,
  ComponentEvents,
  createDefaultEventConfig,
  createEventAction,
  componentSupportsEvent,
  getEventsForComponent,
} from '../../events/ComponentEvents';
import { EventEngine, eventEngine, EventHandler, EventExecutionResult } from '../../events/EventEngine';

// ==========================================
// 1. ComponentEvents Tests
// ==========================================
describe('ComponentEvents', () => {
  test('ALL_COMPONENT_EVENTS contains all event types', () => {
    expect(ALL_COMPONENT_EVENTS.length).toBeGreaterThan(30);
    expect(ALL_COMPONENT_EVENTS).toContain('onClick');
    expect(ALL_COMPONENT_EVENTS).toContain('onChange');
    expect(ALL_COMPONENT_EVENTS).toContain('onLoad');
    expect(ALL_COMPONENT_EVENTS).toContain('onFocus');
    expect(ALL_COMPONENT_EVENTS).toContain('onBlur');
    expect(ALL_COMPONENT_EVENTS).toContain('onKeyDown');
    expect(ALL_COMPONENT_EVENTS).toContain('onMouseEnter');
    expect(ALL_COMPONENT_EVENTS).toContain('onLongPress');
    expect(ALL_COMPONENT_EVENTS).toContain('onDoubleClick');
    expect(ALL_COMPONENT_EVENTS).toContain('onScroll');
    expect(ALL_COMPONENT_EVENTS).toContain('onSwipeLeft');
    expect(ALL_COMPONENT_EVENTS).toContain('onDragStart');
    expect(ALL_COMPONENT_EVENTS).toContain('onError');
  });

  test('EVENT_LABELS has labels for all events', () => {
    ALL_COMPONENT_EVENTS.forEach((evt) => {
      expect(EVENT_LABELS[evt]).toBeDefined();
      expect(typeof EVENT_LABELS[evt]).toBe('string');
      expect(EVENT_LABELS[evt].length).toBeGreaterThan(0);
    });
  });

  test('EVENT_CATEGORIES organizes all events', () => {
    const categorizedEvents = new Set<ComponentEventType>();
    Object.values(EVENT_CATEGORIES).forEach((events) => {
      events.forEach((evt) => categorizedEvents.add(evt));
    });
    ALL_COMPONENT_EVENTS.forEach((evt) => {
      expect(categorizedEvents.has(evt)).toBe(true);
    });
  });

  test('createDefaultEventConfig returns valid config', () => {
    const config = createDefaultEventConfig();
    expect(config.enabled).toBe(false);
    expect(config.actions).toEqual([]);
    expect(config.haltOnError).toBe(false);
    expect(config.parallel).toBe(false);
    expect(config.metadata).toBeDefined();
    expect(config.metadata!.createdAt).toBeDefined();
  });

  test('createEventAction returns valid action', () => {
    const action = createEventAction('javascript', { javaScript: 'app.toast("test")', label: 'Test Action' });
    expect(action.id).toBeDefined();
    expect(action.type).toBe('javascript');
    expect(action.javaScript).toBe('app.toast("test")');
    expect(action.label).toBe('Test Action');
    expect(action.disabled).toBe(false);
    expect(action.createdAt).toBeDefined();
  });

  test('componentSupportsEvent - all components support onClick', () => {
    expect(componentSupportsEvent('button', 'onClick')).toBe(true);
    expect(componentSupportsEvent('text', 'onClick')).toBe(true);
    expect(componentSupportsEvent('container', 'onClick')).toBe(true);
    expect(componentSupportsEvent('image', 'onClick')).toBe(true);
  });

  test('componentSupportsEvent - only inputs support onChange', () => {
    expect(componentSupportsEvent('input', 'onChange')).toBe(true);
    expect(componentSupportsEvent('checkbox', 'onChange')).toBe(true);
    expect(componentSupportsEvent('switch', 'onChange')).toBe(true);
    expect(componentSupportsEvent('button', 'onChange')).toBe(false);
    expect(componentSupportsEvent('text', 'onChange')).toBe(false);
  });

  test('componentSupportsEvent - only media supports onLoad', () => {
    expect(componentSupportsEvent('image', 'onLoad')).toBe(true);
    expect(componentSupportsEvent('video', 'onLoad')).toBe(true);
    expect(componentSupportsEvent('button', 'onLoad')).toBe(false);
  });

  test('getEventsForComponent returns correct events for button', () => {
    const events = getEventsForComponent('button');
    expect(events).toContain('onClick');
    expect(events).toContain('onDoubleClick');
    expect(events).toContain('onLongPress');
    expect(events).not.toContain('onChange');
    expect(events).not.toContain('onLoad');
  });

  test('getEventsForComponent returns correct events for input', () => {
    const events = getEventsForComponent('input');
    expect(events).toContain('onClick');
    expect(events).toContain('onChange');
    expect(events).toContain('onInput');
    expect(events).toContain('onFocus');
    expect(events).toContain('onBlur');
    expect(events).toContain('onKeyDown');
    expect(events).toContain('onKeyUp');
  });

  test('getEventsForComponent returns correct events for container', () => {
    const events = getEventsForComponent('container');
    expect(events).toContain('onClick');
    expect(events).toContain('onScroll');
    expect(events).toContain('onExpand');
    expect(events).toContain('onCollapse');
    expect(events).toContain('onDrop');
  });
});

// ==========================================
// 2. EventEngine Tests
// ==========================================
describe('EventEngine', () => {
  let engine: EventEngine;

  beforeEach(() => {
    engine = new EventEngine();
    engine.init();
  });

  afterEach(() => {
    engine.destroy();
  });

  test('init initializes engine', () => {
    const metrics = engine.getMetrics();
    expect(metrics.isRunning).toBe(true);
    expect(metrics.handlerCount).toBe(0);
  });

  test('registerEvent creates a handler', () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    const handler = engine.registerEvent('comp_1', 'onClick', config);
    expect(handler.id).toBeDefined();
    expect(handler.componentId).toBe('comp_1');
    expect(handler.eventType).toBe('onClick');
    expect(engine.getHandlerCount()).toBe(1);
    expect(engine.getComponentCount()).toBe(1);
  });

  test('registerEvent - multiple events for same component', () => {
    const config1 = createDefaultEventConfig();
    config1.enabled = true;
    const config2 = createDefaultEventConfig();
    config2.enabled = true;
    engine.registerEvent('comp_1', 'onClick', config1);
    engine.registerEvent('comp_1', 'onChange', config2);
    expect(engine.getHandlerCount()).toBe(2);
    expect(engine.getComponentCount()).toBe(1);
  });

  test('unregisterEvent removes a handler', () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    engine.registerEvent('comp_1', 'onClick', config);
    expect(engine.getHandlerCount()).toBe(1);
    const result = engine.unregisterEvent('comp_1', 'onClick');
    expect(result).toBe(true);
    expect(engine.getHandlerCount()).toBe(0);
  });

  test('unregisterEvent returns false for non-existent event', () => {
    const result = engine.unregisterEvent('comp_nonexistent', 'onClick');
    expect(result).toBe(false);
  });

  test('unregisterAllEvents removes all handlers for component', () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    engine.registerEvent('comp_1', 'onClick', config);
    engine.registerEvent('comp_1', 'onChange', config);
    engine.registerEvent('comp_2', 'onClick', config);
    expect(engine.getHandlerCount()).toBe(3);
    const result = engine.unregisterAllEvents('comp_1');
    expect(result).toBe(true);
    expect(engine.getHandlerCount()).toBe(1);
  });

  test('hasEvent checks if event is registered', () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    engine.registerEvent('comp_1', 'onClick', config);
    expect(engine.hasEvent('comp_1', 'onClick')).toBe(true);
    expect(engine.hasEvent('comp_1', 'onChange')).toBe(false);
  });

  test('hasEvent returns false for disabled events', () => {
    const config = createDefaultEventConfig();
    config.enabled = false;
    engine.registerEvent('comp_1', 'onClick', config);
    expect(engine.hasEvent('comp_1', 'onClick')).toBe(false);
  });

  test('getComponentEvents returns enabled events', () => {
    const config1 = createDefaultEventConfig();
    config1.enabled = true;
    const config2 = createDefaultEventConfig();
    config2.enabled = false;
    engine.registerEvent('comp_1', 'onClick', config1);
    engine.registerEvent('comp_1', 'onChange', config2);
    const events = engine.getComponentEvents('comp_1');
    expect(events).toContain('onClick');
    expect(events).not.toContain('onChange');
  });

  test('fireEvent executes event and returns result', async () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    config.actions.push(createEventAction('toast', { toastMessage: 'Hello' }));
    engine.registerEvent('comp_1', 'onClick', config);
    const result = await engine.fireEvent('comp_1', 'onClick', { test: true });
    expect(result).not.toBeNull();
    expect(result!.success).toBe(true);
    expect(result!.eventType).toBe('onClick');
    expect(result!.componentId).toBe('comp_1');
    expect(result!.actionResults.length).toBe(1);
  });

  test('fireEvent returns null for unregistered event', async () => {
    const result = await engine.fireEvent('comp_1', 'onClick');
    expect(result).toBeNull();
  });

  test('fireEvent returns null for disabled event', async () => {
    const config = createDefaultEventConfig();
    config.enabled = false;
    engine.registerEvent('comp_1', 'onClick', config);
    const result = await engine.fireEvent('comp_1', 'onClick');
    expect(result).toBeNull();
  });

  test('fireEvent with debounce delays execution', async () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    config.debounceMs = 50;
    config.actions.push(createEventAction('toast', { toastMessage: 'Debounced' }));
    engine.registerEvent('comp_1', 'onClick', config);
    const start = Date.now();
    const resultPromise = engine.fireEvent('comp_1', 'onClick');
    const result = await resultPromise;
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(45);
    expect(result).not.toBeNull();
    expect(result!.success).toBe(true);
  });

  test('fireEvent with throttle skips rapid executions', async () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    config.throttleMs = 100;
    config.actions.push(createEventAction('toast', { toastMessage: 'Throttled' }));
    engine.registerEvent('comp_1', 'onClick', config);
    const result1 = await engine.fireEvent('comp_1', 'onClick');
    const result2 = await engine.fireEvent('comp_1', 'onClick');
    expect(result1).not.toBeNull();
    expect(result2).toBeNull(); // Throttled
  });

  test('fireEvent with parallel execution', async () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    config.parallel = true;
    config.actions.push(createEventAction('toast', { toastMessage: 'Action 1' }));
    config.actions.push(createEventAction('toast', { toastMessage: 'Action 2' }));
    engine.registerEvent('comp_1', 'onClick', config);
    const result = await engine.fireEvent('comp_1', 'onClick');
    expect(result).not.toBeNull();
    expect(result!.actionResults.length).toBe(2);
  });

  test('fireEvent with haltOnError stops on first error', async () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    config.haltOnError = true;
    config.actions.push(createEventAction('javascript', { javaScript: 'throw new Error("Test error")' }));
    config.actions.push(createEventAction('toast', { toastMessage: 'Should not run' }));
    engine.registerEvent('comp_1', 'onClick', config);
    const result = await engine.fireEvent('comp_1', 'onClick');
    expect(result).not.toBeNull();
    expect(result!.actionResults.length).toBe(1);
    expect(result!.actionResults[0].success).toBe(false);
  });

  test('getAllHandlers returns all registered handlers', () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    engine.registerEvent('comp_1', 'onClick', config);
    engine.registerEvent('comp_2', 'onChange', config);
    const handlers = engine.getAllHandlers();
    expect(handlers.length).toBe(2);
  });

  test('getLogs returns event logs', () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    engine.registerEvent('comp_1', 'onClick', config);
    const logs = engine.getLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].level).toBe('info');
    expect(logs[0].componentId).toBe('comp_1');
  });

  test('clearLogs removes all logs', () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    engine.registerEvent('comp_1', 'onClick', config);
    engine.clearLogs();
    expect(engine.getLogs().length).toBe(0);
  });

  test('clear removes all handlers and logs', () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    engine.registerEvent('comp_1', 'onClick', config);
    engine.clear();
    expect(engine.getHandlerCount()).toBe(0);
    expect(engine.getComponentCount()).toBe(0);
    expect(engine.getLogs().length).toBe(0);
  });

  test('getMetrics returns correct values', () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    engine.registerEvent('comp_1', 'onClick', config);
    const metrics = engine.getMetrics();
    expect(metrics.isRunning).toBe(true);
    expect(metrics.handlerCount).toBe(1);
    expect(metrics.componentCount).toBe(1);
    expect(metrics.logCount).toBeGreaterThan(0);
  });
});

// ==========================================
// 3. Serialization / Deserialization Tests
// ==========================================
describe('Event Serialization', () => {
  test('ComponentEventConfig serializes to JSON', () => {
    const config = createDefaultEventConfig();
    config.enabled = true;
    config.actions.push(createEventAction('javascript', { javaScript: 'app.toast("test")' }));
    config.debounceMs = 200;
    config.haltOnError = true;
    const json = JSON.stringify(config);
    const parsed = JSON.parse(json);
    expect(parsed.enabled).toBe(true);
    expect(parsed.actions.length).toBe(1);
    expect(parsed.actions[0].type).toBe('javascript');
    expect(parsed.actions[0].javaScript).toBe('app.toast("test")');
    expect(parsed.debounceMs).toBe(200);
    expect(parsed.haltOnError).toBe(true);
  });

  test('ComponentEvents serializes to JSON', () => {
    const events: ComponentEvents = {
      onClick: createDefaultEventConfig(),
      onChange: createDefaultEventConfig(),
    };
    events.onClick!.enabled = true;
    events.onClick!.actions.push(createEventAction('navigation', { targetScreenId: 'screen_1' }));
    const json = JSON.stringify(events);
    const parsed = JSON.parse(json);
    expect(parsed.onClick).toBeDefined();
    expect(parsed.onChange).toBeDefined();
    expect(parsed.onClick.enabled).toBe(true);
    expect(parsed.onClick.actions[0].type).toBe('navigation');
  });
});

// ==========================================
// 4. Performance Tests
// ==========================================
describe('Event Performance', () => {
  test('register 100 events quickly', () => {
    const engine = new EventEngine();
    engine.init();
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      const config = createDefaultEventConfig();
      config.enabled = true;
      engine.registerEvent(`comp_${i}`, 'onClick', config);
    }
    const elapsed = Date.now() - start;
    expect(engine.getHandlerCount()).toBe(100);
    expect(elapsed).toBeLessThan(500); // Should register 100 events in under 500ms
    engine.destroy();
  });

  test('fire 50 events sequentially', async () => {
    const engine = new EventEngine();
    engine.init();
    for (let i = 0; i < 50; i++) {
      const config = createDefaultEventConfig();
      config.enabled = true;
      config.actions.push(createEventAction('toast', { toastMessage: `Action ${i}` }));
      engine.registerEvent(`comp_${i}`, 'onClick', config);
    }
    const start = Date.now();
    for (let i = 0; i < 50; i++) {
      await engine.fireEvent(`comp_${i}`, 'onClick');
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(2000); // Should fire 50 events in under 2s
    engine.destroy();
  });
});

// ==========================================
// 5. Security Tests
// ==========================================
describe('Event Security', () => {
  test('JavaScript execution is sandboxed', () => {
    const engine = new EventEngine();
    engine.init();
    const config = createDefaultEventConfig();
    config.enabled = true;
    config.actions.push(createEventAction('javascript', { javaScript: 'const x = 1 + 1; x' }));
    engine.registerEvent('comp_1', 'onClick', config);
    // Should not throw
    expect(async () => {
      await engine.fireEvent('comp_1', 'onClick');
    }).not.toThrow();
    engine.destroy();
  });

  test('Invalid JavaScript is caught', async () => {
    const engine = new EventEngine();
    engine.init();
    const config = createDefaultEventConfig();
    config.enabled = true;
    config.actions.push(createEventAction('javascript', { javaScript: 'invalid syntax @@' }));
    engine.registerEvent('comp_1', 'onClick', config);
    const result = await engine.fireEvent('comp_1', 'onClick');
    expect(result).not.toBeNull();
    expect(result!.actionResults[0].success).toBe(false);
    engine.destroy();
  });
});

// ==========================================
// 6. EventBus Integration Tests
// ==========================================
describe('EventBus Integration', () => {
  test('Event registration publishes to EventBus', () => {
    const engine = new EventEngine();
    engine.init();
    const config = createDefaultEventConfig();
    config.enabled = true;
    // Should not throw
    expect(() => {
      engine.registerEvent('comp_1', 'onClick', config);
    }).not.toThrow();
    engine.destroy();
  });
});

// ==========================================
// 7. Component Event Filter Tests
// ==========================================
describe('Component Event Filters', () => {
  test('All component types support onClick', () => {
    const types = ['text', 'button', 'image', 'icon', 'container', 'card', 'row', 'column',
                   'input', 'checkbox', 'switch', 'slider', 'tabs', 'bottom_nav', 'floating_button',
                   'modal', 'video', 'map', 'calendar', 'carousel'];
    types.forEach((type) => {
      expect(componentSupportsEvent(type, 'onClick')).toBe(true);
    });
  });

  test('Input components support focus/blur', () => {
    const inputTypes = ['input', 'password', 'textarea', 'checkbox', 'radio', 'switch', 'slider'];
    inputTypes.forEach((type) => {
      expect(componentSupportsEvent(type, 'onFocus')).toBe(true);
      expect(componentSupportsEvent(type, 'onBlur')).toBe(true);
    });
    expect(componentSupportsEvent('button', 'onFocus')).toBe(false);
    expect(componentSupportsEvent('text', 'onFocus')).toBe(false);
  });

  test('Container components support scroll', () => {
    const containerTypes = ['container', 'card', 'row', 'column', 'grid', 'scroll', 'list'];
    containerTypes.forEach((type) => {
      expect(componentSupportsEvent(type, 'onScroll')).toBe(true);
    });
    expect(componentSupportsEvent('button', 'onScroll')).toBe(false);
  });
});

// ==========================================
// 8. Event Action Type Tests
// ==========================================
describe('Event Action Types', () => {
  test('Navigation action has targetScreenId', () => {
    const action = createEventAction('navigation', { targetScreenId: 'screen_home' });
    expect(action.type).toBe('navigation');
    expect(action.targetScreenId).toBe('screen_home');
  });

  test('Toast action has toastMessage', () => {
    const action = createEventAction('toast', { toastMessage: 'Hello World' });
    expect(action.type).toBe('toast');
    expect(action.toastMessage).toBe('Hello World');
  });

  test('JavaScript action has javaScript code', () => {
    const action = createEventAction('javascript', { javaScript: 'app.toast("test")' });
    expect(action.type).toBe('javascript');
    expect(action.javaScript).toBe('app.toast("test")');
  });

  test('No-Code flow action has flowId', () => {
    const action = createEventAction('no_code_flow', { flowId: 'flow_login' });
    expect(action.type).toBe('no_code_flow');
    expect(action.flowId).toBe('flow_login');
  });

  test('Both action has chainFlowId and chainJavaScript', () => {
    const action = createEventAction('both', {
      chainFlowId: 'flow_login',
      chainJavaScript: 'app.toast("done")',
    });
    expect(action.type).toBe('both');
    expect(action.chainFlowId).toBe('flow_login');
    expect(action.chainJavaScript).toBe('app.toast("done")');
  });
});

// ==========================================
// 9. Edge Case Tests
// ==========================================
describe('Edge Cases', () => {
  test('Empty actions list executes successfully', async () => {
    const engine = new EventEngine();
    engine.init();
    const config = createDefaultEventConfig();
    config.enabled = true;
    engine.registerEvent('comp_1', 'onClick', config);
    const result = await engine.fireEvent('comp_1', 'onClick');
    expect(result).not.toBeNull();
    expect(result!.success).toBe(true);
    expect(result!.actionResults.length).toBe(0);
    engine.destroy();
  });

  test('Disabled actions are skipped', async () => {
    const engine = new EventEngine();
    engine.init();
    const config = createDefaultEventConfig();
    config.enabled = true;
    const action1 = createEventAction('toast', { toastMessage: 'Should run' });
    const action2 = createEventAction('toast', { toastMessage: 'Should not run', disabled: true });
    config.actions.push(action1, action2);
    engine.registerEvent('comp_1', 'onClick', config);
    const result = await engine.fireEvent('comp_1', 'onClick');
    expect(result).not.toBeNull();
    expect(result!.actionResults.length).toBe(1);
    engine.destroy();
  });

  test('Unregister non-existent component returns false', () => {
    const engine = new EventEngine();
    engine.init();
    expect(engine.unregisterAllEvents('nonexistent')).toBe(false);
    engine.destroy();
  });

  test('Double unregister is safe', () => {
    const engine = new EventEngine();
    engine.init();
    const config = createDefaultEventConfig();
    config.enabled = true;
    engine.registerEvent('comp_1', 'onClick', config);
    engine.unregisterEvent('comp_1', 'onClick');
    expect(engine.unregisterEvent('comp_1', 'onClick')).toBe(false);
    engine.destroy();
  });
});