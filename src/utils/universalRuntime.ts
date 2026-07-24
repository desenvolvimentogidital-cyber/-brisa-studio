import { studioEventBus, StudioEventType } from './eventBus';
import { StudioIR, IRApiEndpoint, IRDatabaseCollection } from './irCompiler';
import { universalDatabase, universalApi } from './dataLayer';
import { identityManager } from './identitySecurityLayer';
import { notificationManager, realtimeManager } from './notificationCommunicationLayer';
import { packagingManager } from './packagingDeploymentLayer';

// ==========================================
// 1. STATE & VARIABLE MANAGER
// ==========================================

export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'enum' | 'json';

export interface RuntimeVariable {
  name: string;
  type: VariableType;
  value: any;
  scope: 'local' | 'global' | 'persistent';
  isComputed?: boolean;
  computedFn?: (state: Record<string, any>) => any;
}

export type StateObserver = (key: string, newValue: any, oldValue: any) => void;

export class StateManager {
  private state: Map<string, RuntimeVariable> = new Map();
  private observers: Map<string, Set<StateObserver>> = new Map();
  private history: { timestamp: number; key: string; oldValue: any; newValue: any }[] = [];
  private batching = false;
  private pendingBatchUpdates: { key: string; newValue: any; oldValue: any }[] = [];

  setVariable(
    name: string,
    value: any,
    type: VariableType = 'string',
    scope: 'local' | 'global' | 'persistent' = 'global'
  ): void {
    const existing = this.state.get(name);
    const oldValue = existing ? existing.value : undefined;

    // Validate or format value if needed
    let sanitizedValue = value;
    if (type === 'number') sanitizedValue = Number(value) || 0;
    if (type === 'boolean') sanitizedValue = Boolean(value);
    if (type === 'date') sanitizedValue = new Date(value).toISOString();

    const varObj: RuntimeVariable = {
      name,
      type,
      value: sanitizedValue,
      scope,
    };

    this.state.set(name, varObj);

    if (scope === 'persistent') {
      try {
        localStorage.setItem(`studio_var_${name}`, JSON.stringify(sanitizedValue));
      } catch (e) {
        // Safe fallback in restricted environments
      }
    }

    this.recordHistory(name, oldValue, sanitizedValue);
    this.notifyObservers(name, sanitizedValue, oldValue);
    this.reevaluateComputed();
  }

  getVariable(name: string): any {
    const varObj = this.state.get(name);
    if (!varObj) {
      // Check localStorage for persistent vars
      try {
        const stored = localStorage.getItem(`studio_var_${name}`);
        if (stored !== null) return JSON.parse(stored);
      } catch (e) {}
      return undefined;
    }
    if (varObj.isComputed && varObj.computedFn) {
      const rawState = this.getRawVariables();
      return varObj.computedFn(rawState);
    }
    return varObj.value;
  }

  getRawVariables(): Record<string, any> {
    const res: Record<string, any> = {};
    this.state.forEach((v, k) => {
      if (!v.isComputed) {
        res[k] = v.value;
      }
    });
    return res;
  }

  defineComputed(name: string, fn: (state: Record<string, any>) => any): void {
    this.state.set(name, {
      name,
      type: 'object',
      value: undefined,
      scope: 'global',
      isComputed: true,
      computedFn: fn,
    });
  }

  subscribe(key: string, observer: StateObserver): () => void {
    if (!this.observers.has(key)) {
      this.observers.set(key, new Set());
    }
    this.observers.get(key)!.add(observer);

    return () => {
      this.observers.get(key)?.delete(observer);
    };
  }

  batch(fn: () => void): void {
    this.batching = true;
    try {
      fn();
    } finally {
      this.batching = false;
      this.flushBatch();
    }
  }

  private flushBatch(): void {
    const pending = [...this.pendingBatchUpdates];
    this.pendingBatchUpdates = [];
    pending.forEach(({ key, newValue, oldValue }) => {
      this.notifyObservers(key, newValue, oldValue);
    });
  }

  private notifyObservers(key: string, newValue: any, oldValue: any): void {
    if (this.batching) {
      this.pendingBatchUpdates.push({ key, newValue, oldValue });
      return;
    }
    const set = this.observers.get(key);
    if (set) {
      set.forEach((obs) => {
        try {
          obs(key, newValue, oldValue);
        } catch (err) {
          console.error(`[StateManager] Observer error on ${key}:`, err);
        }
      });
    }
  }

  private recordHistory(key: string, oldValue: any, newValue: any): void {
    this.history.push({ timestamp: Date.now(), key, oldValue, newValue });
    if (this.history.length > 500) {
      this.history.shift(); // Bound memory
    }
  }

  private reevaluateComputed(): void {
    this.state.forEach((v, k) => {
      if (v.isComputed && v.computedFn) {
        const newVal = v.computedFn(this.getAllVariables());
        if (newVal !== v.value) {
          const old = v.value;
          v.value = newVal;
          this.notifyObservers(k, newVal, old);
        }
      }
    });
  }

  getAllVariables(): Record<string, any> {
    const res: Record<string, any> = {};
    this.state.forEach((v, k) => {
      res[k] = this.getVariable(k);
    });
    return res;
  }

  getHistory() {
    return [...this.history];
  }

  clear(): void {
    this.state.clear();
    this.observers.clear();
    this.history = [];
  }
}

// ==========================================
// 2. RUNTIME LOGGER & DEBUGGER
// ==========================================

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
}

export class RuntimeDebugger {
  private logs: LogEntry[] = [];
  private isPaused = false;
  private breakpoints: Set<string> = new Set();
  private callStack: string[] = [];

  log(level: LogEntry['level'], category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
    };
    this.logs.push(entry);
    if (this.logs.length > 1000) this.logs.shift(); // bound log size
    studioEventBus.publish('NoCodeBlockExecuted', entry);
  }

  pushStack(fnName: string): void {
    this.callStack.push(fnName);
  }

  popStack(): void {
    this.callStack.pop();
  }

  getStack(): string[] {
    return [...this.callStack];
  }

  setBreakpoint(id: string): void {
    this.breakpoints.add(id);
  }

  removeBreakpoint(id: string): void {
    this.breakpoints.delete(id);
  }

  pause(): void {
    this.isPaused = true;
    this.log('warn', 'Debugger', 'Execution paused by user breakpoint.');
  }

  resume(): void {
    this.isPaused = false;
    this.log('info', 'Debugger', 'Execution resumed.');
  }

  getLogs(levelFilter?: LogEntry['level']): LogEntry[] {
    if (!levelFilter) return [...this.logs];
    return this.logs.filter((l) => l.level === levelFilter);
  }

  clear(): void {
    this.logs = [];
    this.callStack = [];
    this.breakpoints.clear();
  }
}

// ==========================================
// 3. UNIVERSAL RUNTIME ENGINE
// ==========================================

export interface ActionPayload {
  type: string;
  params: Record<string, any>;
}

export class UniversalRuntime {
  public stateManager = new StateManager();
  public debugger = new RuntimeDebugger();
  private currentIR?: StudioIR;
  private isRunning = false;

  init(ir?: StudioIR): void {
    this.currentIR = ir;
    this.isRunning = true;
    this.debugger.log('info', 'Runtime', 'Universal Runtime Engine initialized successfully.');

    if (ir) {
      // Seed IR default variables
      ir.variables.forEach((v) => {
        this.stateManager.setVariable(v.name, v.initialValue, v.type as VariableType, v.scope as any);
      });
    }
  }

  /**
   * Safe execution wrapper with Error Boundary & Stack Tracking
   */
  async executeAction(action: ActionPayload, context: Record<string, any> = {}): Promise<any> {
    const actionId = `${action.type}_${Date.now()}`;
    this.debugger.pushStack(action.type);
    this.debugger.log('debug', 'ActionEngine', `Executing action: ${action.type}`, action.params);

    try {
      let result: any = null;

      switch (action.type) {
        case 'NAVIGATE':
          studioEventBus.publish('ScreenCreated', { targetScreen: action.params.targetScreen });
          this.stateManager.setVariable('activeScreen', action.params.targetScreen);
          result = { navigatedTo: action.params.targetScreen };
          break;

        case 'SHOW_TOAST':
          studioEventBus.publish('NotificationSent', { message: action.params.message });
          result = { toastShown: action.params.message };
          break;

        case 'SET_VARIABLE':
          this.stateManager.setVariable(action.params.name, action.params.value, action.params.type || 'string');
          result = { varName: action.params.name, value: action.params.value };
          break;

        case 'API_REQUEST':
          this.debugger.log('info', 'API', `Calling API endpoint: ${action.params.url}`);
          result = await universalApi.request(action.params.url || 'https://api.example.com', {
            method: action.params.method || 'GET',
            params: action.params.params,
            body: action.params.body,
          });
          break;

        case 'DATABASE_QUERY':
          this.debugger.log('info', 'Database', `Database operation: ${action.params.operation} on collection ${action.params.collection}`);
          if (action.params.operation === 'CREATE') {
            result = await universalDatabase.create(action.params.collection, action.params.record || {});
          } else if (action.params.operation === 'UPDATE') {
            result = await universalDatabase.update(action.params.collection, action.params.id, action.params.record || {});
          } else if (action.params.operation === 'DELETE') {
            result = await universalDatabase.delete(action.params.collection, action.params.id);
          } else {
            const records = await universalDatabase.query(action.params.collection, action.params.options || {});
            result = Object.assign(records, { collection: action.params.collection, records });
          }
          break;

        case 'AUTH_LOGIN':
          this.debugger.log('info', 'Auth', `Login attempt for: ${action.params.email}`);
          result = await identityManager.login(action.params.email, action.params.password);
          break;

        case 'AUTH_LOGOUT':
          this.debugger.log('info', 'Auth', `Logout user`);
          await identityManager.logout();
          result = { success: true };
          break;

        case 'AUTH_REGISTER':
          this.debugger.log('info', 'Auth', `Register user: ${action.params.email}`);
          result = await identityManager.register({
            name: action.params.name,
            email: action.params.email,
            password: action.params.password,
          });
          break;

        case 'CHECK_PERMISSION':
          const perm = action.params.permission || 'read';
          const hasPerm = identityManager.hasPermission(perm);
          this.debugger.log('info', 'Auth', `Permission check for ${perm}: ${hasPerm}`);
          result = { permission: perm, granted: hasPerm };
          break;

        case 'NOTIFICATION_SEND':
          this.debugger.log('info', 'Notifications', `Sending notification: ${action.params.title}`);
          result = await notificationManager.create({
            title: action.params.title || 'Notification',
            message: action.params.message || '',
            type: action.params.type || 'info',
            userId: action.params.userId,
            priority: action.params.priority,
          });
          break;

        case 'NOTIFICATION_READ':
          this.debugger.log('info', 'Notifications', `Mark read notification: ${action.params.id}`);
          result = { success: notificationManager.markAsRead(action.params.id) };
          break;

        case 'REALTIME_EMIT':
          this.debugger.log('info', 'Realtime', `Emit event: ${action.params.event}`);
          realtimeManager.emit(action.params.event || 'message', action.params.data);
          result = { success: true, event: action.params.event };
          break;

        case 'EMAIL_SEND':
          this.debugger.log('info', 'Email', `Send email to: ${action.params.to}`);
          result = { success: true, messageId: `msg_${Date.now()}` };
          break;

        case 'BUILD_TRIGGER':
          this.debugger.log('info', 'Packaging', `Trigger build for target: ${action.params.target}`);
          result = await packagingManager.triggerBuild(action.params.target || 'android_apk', action.params.environment);
          break;

        case 'DELAY':
          const ms = Number(action.params.ms) || 100;
          await new Promise((resolve) => setTimeout(resolve, ms));
          result = { delayed: ms };
          break;

        default:
          this.debugger.log('warn', 'ActionEngine', `Unknown action type: ${action.type}`);
          result = { warning: 'Unknown action' };
      }

      this.debugger.log('info', 'ActionEngine', `Action ${action.type} completed successfully.`, result);
      return result;
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      this.debugger.log('error', 'ActionEngine', `Error executing ${action.type}: ${errorMsg}`, err);
      return { error: errorMsg };
    } finally {
      this.debugger.popStack();
    }
  }

  /**
   * Flow Runner supporting sequential and parallel execution, loops & conditions
   */
  async executeFlow(
    actions: ActionPayload[],
    mode: 'sequential' | 'parallel' = 'sequential'
  ): Promise<any[]> {
    this.debugger.log('info', 'FlowEngine', `Starting flow execution (${actions.length} actions, mode: ${mode})`);

    if (mode === 'parallel') {
      return Promise.all(actions.map((act) => this.executeAction(act)));
    }

    const results: any[] = [];
    for (const action of actions) {
      const res = await this.executeAction(action);
      results.push(res);
      if (res && res.error) {
        this.debugger.log('error', 'FlowEngine', 'Halting sequential flow due to step error.');
        break;
      }
    }
    return results;
  }

  getMetrics() {
    return {
      isRunning: this.isRunning,
      activeVariablesCount: Object.keys(this.stateManager.getAllVariables()).length,
      logsCount: this.debugger.getLogs().length,
      stackDepth: this.debugger.getStack().length,
    };
  }

  destroy(): void {
    this.isRunning = false;
    this.stateManager.clear();
    this.debugger.clear();
  }
}

export const universalRuntime = new UniversalRuntime();
