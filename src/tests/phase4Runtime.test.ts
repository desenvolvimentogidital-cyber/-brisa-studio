import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  UniversalRuntime,
  StateManager,
  RuntimeDebugger,
  ActionPayload,
} from '../utils/universalRuntime';
import { compileProjectToIR } from '../utils/irCompiler';
import { Project } from '../types';

const sampleProject: Project = {
  id: 'proj_phase4_test',
  name: 'Phase4 Runtime App',
  version: '1.0.0',
  activeScreenId: 'scr_1',
  device: {
    id: 'iphone',
    name: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    type: 'mobile',
    notchType: 'dynamic-island',
    borderRadius: 48,
  },
  screens: [
    {
      id: 'scr_1',
      name: 'Dashboard',
      backgroundColor: '#0F172A',
      components: [],
    },
  ],
  masterComponents: [],
  assets: [],
  updatedAt: new Date().toISOString(),
};

describe('FASE 4 — Universal Runtime (Execution Engine) Test Suite', () => {
  let runtime: UniversalRuntime;

  beforeEach(() => {
    runtime = new UniversalRuntime();
  });

  it('1. StateManager: typed variables, observe reactivity and batch updates', () => {
    const state = runtime.stateManager;
    const observer = vi.fn();

    state.subscribe('userScore', observer);

    // Set variable
    state.setVariable('userScore', 100, 'number', 'global');
    expect(state.getVariable('userScore')).toBe(100);
    expect(observer).toHaveBeenCalledWith('userScore', 100, undefined);

    // Batch updates
    state.batch(() => {
      state.setVariable('userScore', 150, 'number');
      state.setVariable('userName', 'Alex', 'string');
    });

    expect(state.getVariable('userScore')).toBe(150);
    expect(state.getVariable('userName')).toBe('Alex');
  });

  it('2. StateManager: computed properties calculation and auto re-evaluation', () => {
    const state = runtime.stateManager;

    state.setVariable('price', 50, 'number');
    state.setVariable('quantity', 3, 'number');

    state.defineComputed('totalCost', (s) => (s.price || 0) * (s.quantity || 0));

    expect(state.getVariable('totalCost')).toBe(150);

    // Update dependency
    state.setVariable('quantity', 4, 'number');
    expect(state.getVariable('totalCost')).toBe(200);
  });

  it('3. RuntimeDebugger: call stack tracking, logging levels, and error isolation', async () => {
    const dbg = runtime.debugger;

    dbg.log('info', 'TestModule', 'Engine started');
    dbg.log('error', 'TestModule', 'Handled exception sample');

    const errorLogs = dbg.getLogs('error');
    expect(errorLogs.length).toBe(1);
    expect(errorLogs[0].message).toContain('Handled exception');

    // Call stack verification
    dbg.pushStack('mainFlow');
    dbg.pushStack('childAction');
    expect(dbg.getStack()).toEqual(['mainFlow', 'childAction']);

    dbg.popStack();
    expect(dbg.getStack()).toEqual(['mainFlow']);
  });

  it('4. UniversalRuntime: sequential flow execution with actions', async () => {
    const ir = compileProjectToIR(sampleProject);
    runtime.init(ir);

    const actions: ActionPayload[] = [
      { type: 'SET_VARIABLE', params: { name: 'authToken', value: 'secret_123', type: 'string' } },
      { type: 'SHOW_TOAST', params: { message: 'Autenticado!' } },
      { type: 'NAVIGATE', params: { targetScreen: 'Home' } },
    ];

    const results = await runtime.executeFlow(actions, 'sequential');

    expect(results.length).toBe(3);
    expect(runtime.stateManager.getVariable('authToken')).toBe('secret_123');
    expect(runtime.stateManager.getVariable('activeScreen')).toBe('Home');
  });

  it('5. UniversalRuntime: parallel flow execution & error isolation handling', async () => {
    runtime.init();

    const parallelActions: ActionPayload[] = [
      { type: 'API_REQUEST', params: { url: 'https://api.example.com/users' } },
      { type: 'DATABASE_QUERY', params: { operation: 'SELECT', collection: 'users' } },
    ];

    const results = await runtime.executeFlow(parallelActions, 'parallel');

    expect(results.length).toBe(2);
    expect(results[0].status).toBe(200);
    expect(results[1].collection).toBe('users');

    const metrics = runtime.getMetrics();
    expect(metrics.isRunning).toBe(true);
    expect(metrics.logsCount).toBeGreaterThan(0);
  });
});
