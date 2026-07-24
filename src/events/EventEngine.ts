// ==========================================
// Mobile Studio - Universal Event Engine
// ==========================================
// Manages registration, execution, removal, chaining,
// cancellation, exception handling, and logging of events.

import { studioEventBus } from '../utils/eventBus';
import {
  ComponentEventType,
  ComponentEventConfig,
  EventAction,
  EventActionType,
  EventCondition,
  ComponentEvents,
  createDefaultEventConfig,
} from './ComponentEvents';
import { universalRuntime } from '../utils/universalRuntime';

export interface EventHandler {
  id: string;
  componentId: string;
  eventType: ComponentEventType;
  config: ComponentEventConfig;
  /** The compiled handler function */
  handler: (payload?: any) => Promise<any>;
  /** Timestamp of registration */
  registeredAt: number;
}

export interface EventExecutionResult {
  success: boolean;
  eventType: ComponentEventType;
  componentId: string;
  actionResults: { actionId: string; success: boolean; result?: any; error?: string }[];
  duration: number;
  error?: string;
}

export type EventLogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface EventLogEntry {
  id: string;
  timestamp: number;
  level: EventLogLevel;
  componentId: string;
  eventType: ComponentEventType;
  message: string;
  data?: any;
}

/**
 * Universal Event Engine
 * Central manager for all component events in the runtime.
 */
export class EventEngine {
  private handlers: Map<string, EventHandler> = new Map();
  private componentHandlers: Map<string, Map<ComponentEventType, EventHandler>> = new Map();
  private logs: EventLogEntry[] = [];
  private maxLogs = 500;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private throttleTimers: Map<string, number> = new Map();
  private isRunning = false;

  /**
   * Initialize the event engine
   */
  init(): void {
    this.isRunning = true;
    this.log('info', '__engine__', 'onLoad', 'Event Engine initialized');
  }

  /**
   * Register an event handler for a component
   */
  registerEvent(
    componentId: string,
    eventType: ComponentEventType,
    config: ComponentEventConfig
  ): EventHandler {
    const handlerId = `evt_${componentId}_${eventType}_${Date.now()}`;

    const handler: EventHandler = {
      id: handlerId,
      componentId,
      eventType,
      config,
      handler: async (payload?: any) => {
        return this.executeEvent(componentId, eventType, config, payload);
      },
      registeredAt: Date.now(),
    };

    // Store by handler ID
    this.handlers.set(handlerId, handler);

    // Store by component + event type
    if (!this.componentHandlers.has(componentId)) {
      this.componentHandlers.set(componentId, new Map());
    }
    this.componentHandlers.get(componentId)!.set(eventType, handler);

    this.log('info', componentId, eventType, `Event registered: ${eventType}`);
    studioEventBus.publish('NoCodeBlockExecuted', {
      type: 'EVENT_REGISTERED',
      componentId,
      eventType,
    });

    return handler;
  }

  /**
   * Unregister a specific event handler
   */
  unregisterEvent(componentId: string, eventType: ComponentEventType): boolean {
    const compMap = this.componentHandlers.get(componentId);
    if (!compMap) return false;

    const handler = compMap.get(eventType);
    if (!handler) return false;

    this.handlers.delete(handler.id);
    compMap.delete(eventType);

    if (compMap.size === 0) {
      this.componentHandlers.delete(componentId);
    }

    // Clean up debounce/throttle timers
    const timerKey = `${componentId}_${eventType}`;
    const debounceTimer = this.debounceTimers.get(timerKey);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      this.debounceTimers.delete(timerKey);
    }
    this.throttleTimers.delete(timerKey);

    this.log('info', componentId, eventType, `Event unregistered: ${eventType}`);
    return true;
  }

  /**
   * Unregister all events for a component
   */
  unregisterAllEvents(componentId: string): boolean {
    const compMap = this.componentHandlers.get(componentId);
    if (!compMap) return false;

    compMap.forEach((handler, eventType) => {
      this.handlers.delete(handler.id);
      const timerKey = `${componentId}_${eventType}`;
      const debounceTimer = this.debounceTimers.get(timerKey);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        this.debounceTimers.delete(timerKey);
      }
      this.throttleTimers.delete(timerKey);
    });

    this.componentHandlers.delete(componentId);
    this.log('info', componentId, 'onLoad', `All events unregistered for component`);
    return true;
  }

  /**
   * Fire an event for a component
   */
  async fireEvent(
    componentId: string,
    eventType: ComponentEventType,
    payload?: any
  ): Promise<EventExecutionResult | null> {
    const compMap = this.componentHandlers.get(componentId);
    if (!compMap) return null;

    const handler = compMap.get(eventType);
    if (!handler || !handler.config.enabled) return null;

    // Debounce check
    const timerKey = `${componentId}_${eventType}`;
    if (handler.config.debounceMs && handler.config.debounceMs > 0) {
      const existingTimer = this.debounceTimers.get(timerKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      return new Promise((resolve) => {
        this.debounceTimers.set(
          timerKey,
          setTimeout(async () => {
            const result = await this.executeEvent(componentId, eventType, handler.config, payload);
            resolve(result);
          }, handler.config.debounceMs!)
        );
      });
    }

    // Throttle check
    if (handler.config.throttleMs && handler.config.throttleMs > 0) {
      const lastRun = this.throttleTimers.get(timerKey) || 0;
      const now = Date.now();
      if (now - lastRun < handler.config.throttleMs) {
        return null; // Skip this execution
      }
      this.throttleTimers.set(timerKey, now);
    }

    return this.executeEvent(componentId, eventType, handler.config, payload);
  }

  /**
   * Execute all actions for an event
   */
  private async executeEvent(
    componentId: string,
    eventType: ComponentEventType,
    config: ComponentEventConfig,
    payload?: any
  ): Promise<EventExecutionResult> {
    const startTime = Date.now();
    this.log('debug', componentId, eventType, `Executing event: ${eventType}`, payload);

    const actionResults: { actionId: string; success: boolean; result?: any; error?: string }[] = [];

    try {
      if (config.parallel) {
        // Execute all actions in parallel
        const results = await Promise.all(
          config.actions
            .filter((a) => !a.disabled)
            .map(async (action) => {
              try {
                const result = await this.executeAction(action, componentId, eventType, payload);
                return { actionId: action.id, success: true, result };
              } catch (err: any) {
                return { actionId: action.id, success: false, error: err?.message || String(err) };
              }
            })
        );
        actionResults.push(...results);
      } else {
        // Execute actions sequentially
        for (const action of config.actions) {
          if (action.disabled) continue;
          try {
            const result = await this.executeAction(action, componentId, eventType, payload);
            actionResults.push({ actionId: action.id, success: true, result });
          } catch (err: any) {
            const errorMsg = err?.message || String(err);
            actionResults.push({ actionId: action.id, success: false, error: errorMsg });
            if (config.haltOnError) {
              this.log('error', componentId, eventType, `Halted on error: ${errorMsg}`);
              break;
            }
          }
        }
      }

      const duration = Date.now() - startTime;
      const hasErrors = actionResults.some((r) => !r.success);

      if (hasErrors) {
        this.log('warn', componentId, eventType, `Event completed with errors`, { actionResults, duration });
      } else {
        this.log('info', componentId, eventType, `Event completed successfully`, { actionResults, duration });
      }

      // Emit to EventBus
      studioEventBus.publish('NoCodeBlockExecuted', {
        type: 'EVENT_EXECUTED',
        componentId,
        eventType,
        actionResults,
        duration,
      });

      return {
        success: !hasErrors,
        eventType,
        componentId,
        actionResults,
        duration,
      };
    } catch (err: any) {
      const duration = Date.now() - startTime;
      const errorMsg = err?.message || String(err);
      this.log('error', componentId, eventType, `Event execution failed: ${errorMsg}`, err);

      return {
        success: false,
        eventType,
        componentId,
        actionResults,
        duration,
        error: errorMsg,
      };
    }
  }

  /**
   * Evaluate a condition against the current context
   */
  private evaluateCondition(
    condition: EventCondition,
    context: Record<string, any>
  ): boolean {
    const variableValue = context[condition.variable];
    
    switch (condition.operator) {
      case '==': return variableValue == condition.value;
      case '!=': return variableValue != condition.value;
      case '>': return Number(variableValue) > Number(condition.value);
      case '<': return Number(variableValue) < Number(condition.value);
      case '>=': return Number(variableValue) >= Number(condition.value);
      case '<=': return Number(variableValue) <= Number(condition.value);
      case 'contains': return String(variableValue).includes(String(condition.value));
      case 'startsWith': return String(variableValue).startsWith(String(condition.value));
      case 'endsWith': return String(variableValue).endsWith(String(condition.value));
      case 'empty': return !variableValue || variableValue === '';
      case 'notEmpty': return variableValue !== undefined && variableValue !== null && variableValue !== '';
      default: return true;
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    action: EventAction,
    componentId: string,
    eventType: ComponentEventType,
    payload?: any
  ): Promise<any> {
    switch (action.type) {
      case 'no_code_flow':
        if (action.flowId) {
          return universalRuntime.executeFlow(
            [{ type: 'EXECUTE_FLOW', params: { flowId: action.flowId } }],
            'sequential'
          );
        }
        break;

      case 'javascript':
        if (action.javaScript) {
          return this.executeJavaScript(action.javaScript, componentId, eventType, payload);
        }
        break;

      case 'both':
        if (action.chainFlowId) {
          await universalRuntime.executeFlow(
            [{ type: 'EXECUTE_FLOW', params: { flowId: action.chainFlowId } }],
            'sequential'
          );
        }
        if (action.chainJavaScript) {
          return this.executeJavaScript(action.chainJavaScript, componentId, eventType, payload);
        }
        break;

      case 'navigation':
        if (action.targetScreenId) {
          return universalRuntime.executeAction({
            type: 'NAVIGATE',
            params: { targetScreen: action.targetScreenId },
          });
        }
        break;

      case 'toast':
        if (action.toastMessage) {
          return universalRuntime.executeAction({
            type: 'SHOW_TOAST',
            params: { message: action.toastMessage },
          });
        }
        break;

      case 'api_request':
        if (action.apiUrl) {
          return universalRuntime.executeAction({
            type: 'API_REQUEST',
            params: {
              url: action.apiUrl,
              method: action.apiMethod || 'GET',
              body: action.apiBody ? JSON.parse(action.apiBody) : undefined,
            },
          });
        }
        break;

      case 'database':
        if (action.dbOperation && action.dbCollection) {
          return universalRuntime.executeAction({
            type: 'DATABASE_QUERY',
            params: {
              operation: action.dbOperation.toUpperCase(),
              collection: action.dbCollection,
              record: action.dbRecord ? JSON.parse(action.dbRecord) : undefined,
            },
          });
        }
        break;

      case 'auth':
        if (action.authOperation === 'login') {
          return universalRuntime.executeAction({ type: 'AUTH_LOGIN', params: {} });
        } else if (action.authOperation === 'logout') {
          return universalRuntime.executeAction({ type: 'AUTH_LOGOUT', params: {} });
        } else if (action.authOperation === 'register') {
          return universalRuntime.executeAction({ type: 'AUTH_REGISTER', params: {} });
        }
        break;

      case 'animation':
        if (action.animationType) {
          this.log('info', componentId, eventType, `Animation: ${action.animationType} on ${action.animationTarget || componentId}`);
          return { animation: action.animationType, target: action.animationTarget || componentId };
        }
        break;

      case 'notification':
        if (action.notificationTitle) {
          return universalRuntime.executeAction({
            type: 'NOTIFICATION_SEND',
            params: {
              title: action.notificationTitle,
              message: action.notificationMessage || '',
            },
          });
        }
        break;

      case 'custom':
        return universalRuntime.executeAction({
          type: 'CUSTOM',
          params: { actionId: action.id, data: action },
        });
    }
  }

  /**
   * Execute JavaScript code in a sandboxed environment
   */
  private executeJavaScript(
    code: string,
    componentId: string,
    eventType: ComponentEventType,
    payload?: any
  ): any {
    try {
      if (!code || typeof code !== 'string') {
        throw new Error('Invalid JavaScript code');
      }

      // Sandboxed execution
      const runner = new Function(
        'componentId',
        'eventType',
        'payload',
        `"use strict";\n${code}`
      );
      return runner(componentId, eventType, payload);
    } catch (err: any) {
      this.log('error', componentId, eventType, `JavaScript execution error: ${err?.message}`, err);
      throw err;
    }
  }

  /**
   * Check if a component has a specific event registered
   */
  hasEvent(componentId: string, eventType: ComponentEventType): boolean {
    const compMap = this.componentHandlers.get(componentId);
    if (!compMap) return false;
    const handler = compMap.get(eventType);
    return !!handler && handler.config.enabled;
  }

  /**
   * Get all registered events for a component
   */
  getComponentEvents(componentId: string): ComponentEventType[] {
    const compMap = this.componentHandlers.get(componentId);
    if (!compMap) return [];
    return Array.from(compMap.keys()).filter((key) => {
      const handler = compMap.get(key);
      return handler && handler.config.enabled;
    });
  }

  /**
   * Get all registered handlers
   */
  getAllHandlers(): EventHandler[] {
    return Array.from(this.handlers.values());
  }

  /**
   * Get handler count
   */
  getHandlerCount(): number {
    return this.handlers.size;
  }

  /**
   * Get component count with registered events
   */
  getComponentCount(): number {
    return this.componentHandlers.size;
  }

  /**
   * Internal logging
   */
  private log(
    level: EventLogLevel,
    componentId: string,
    eventType: ComponentEventType,
    message: string,
    data?: any
  ): void {
    const entry: EventLogEntry = {
      id: `evt_log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      level,
      componentId,
      eventType,
      message,
      data,
    };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Get event logs
   */
  getLogs(levelFilter?: EventLogLevel): EventLogEntry[] {
    if (!levelFilter) return [...this.logs];
    return this.logs.filter((l) => l.level === levelFilter);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Clear all handlers and reset
   */
  clear(): void {
    this.handlers.clear();
    this.componentHandlers.clear();
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
    this.throttleTimers.clear();
    this.logs = [];
    this.isRunning = false;
  }

  /**
   * Get engine metrics
   */
  getMetrics() {
    return {
      isRunning: this.isRunning,
      handlerCount: this.handlers.size,
      componentCount: this.componentHandlers.size,
      logCount: this.logs.length,
    };
  }

  /**
   * Destroy the engine
   */
  destroy(): void {
    this.clear();
  }
}

/**
 * Singleton instance of the Event Engine
 */
export const eventEngine = new EventEngine();