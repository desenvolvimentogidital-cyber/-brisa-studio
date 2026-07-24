import { describe, it, expect, beforeEach } from 'vitest';
import { IdentityManager } from '../utils/identitySecurityLayer';
import { UniversalRuntime } from '../utils/universalRuntime';
import { createStudioAppApi } from '../utils/studioAppApi';
import { compileNoCodeFlowToJS, NoCodeFlowRule } from '../utils/nocodeEngine';
import { compileProjectToIR } from '../utils/irCompiler';
import { Project } from '../types';

describe('FASE 6 — Identity, Authentication & Security Layer Suite', () => {
  let identity: IdentityManager;
  let runtime: UniversalRuntime;

  beforeEach(() => {
    identity = new IdentityManager();
    runtime = new UniversalRuntime();
  });

  it('1. Identity Core: User Registration, Authentication & Session creation', async () => {
    const { user, session } = await identity.register({
      name: 'Carlos Oliveira',
      email: 'carlos@studio.app',
      password: 'mypassword123',
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('carlos@studio.app');
    expect(user.roles).toContain('User');
    expect(session.token).toBeDefined();

    expect(identity.isAuthenticated()).toBe(true);
    expect(identity.getCurrentUser()?.email).toBe('carlos@studio.app');

    // Logout
    await identity.logout();
    expect(identity.isAuthenticated()).toBe(false);
    expect(identity.getCurrentUser()).toBeNull();

    // Login back
    const loginRes = await identity.login('carlos@studio.app', 'mypassword123');
    expect(loginRes.user.email).toBe('carlos@studio.app');
    expect(identity.isAuthenticated()).toBe(true);
  });

  it('2. Roles & Permission System Evaluation', async () => {
    // Default admin login
    await identity.login('admin@studio.app', 'admin123');
    expect(identity.hasRole('Admin')).toBe(true);
    expect(identity.hasPermission('delete_any')).toBe(true);

    // Register standard user
    await identity.register({
      name: 'User One',
      email: 'user1@studio.app',
      password: 'password123',
    });

    expect(identity.hasRole('Admin')).toBe(false);
    expect(identity.hasRole('User')).toBe(true);
    expect(identity.hasPermission('read')).toBe(true);
  });

  it('3. Security Rules Engine: Access evaluation', async () => {
    identity.addSecurityRule({
      id: 'r_orders',
      resource: 'orders',
      action: 'write',
      condition: 'hasRole',
      requiredRole: 'User',
    });

    // Unauthenticated check
    await identity.logout();
    expect(identity.checkAccess('orders', 'write')).toBe(false);

    // Authenticated User check
    await identity.register({ name: 'User Two', email: 'user2@studio.app' });
    expect(identity.checkAccess('orders', 'write')).toBe(true);
  });

  it('4. JavaScript SDK: app.auth API integration', async () => {
    const mockSetProject = () => {};
    const mockShowToast = () => {};
    const app = createStudioAppApi(
      { id: 'p1', name: 'App Test' } as any,
      mockSetProject as any,
      { showToast: mockShowToast }
    );

    const reg = await app.auth.register({ name: 'Ana', email: 'ana@studio.app', password: 'pass' });
    expect(reg.user.name).toBe('Ana');
    expect(app.auth.isAuthenticated()).toBe(true);

    await app.auth.logout();
    expect(app.auth.isAuthenticated()).toBe(false);
  });

  it('5. Universal Runtime: Auth Actions Execution', async () => {
    runtime.init();

    // Action register via Runtime
    const regRes = await runtime.executeAction({
      type: 'AUTH_REGISTER',
      params: { name: 'Bruno', email: 'bruno@studio.app', password: 'secretpassword' },
    });
    expect(regRes.user.email).toBe('bruno@studio.app');

    // Action check permission via Runtime
    const permRes = await runtime.executeAction({
      type: 'CHECK_PERMISSION',
      params: { permission: 'read' },
    });
    expect(permRes.granted).toBe(true);

    // Action logout
    const logoutRes = await runtime.executeAction({
      type: 'AUTH_LOGOUT',
      params: {},
    });
    expect(logoutRes.success).toBe(true);
  });

  it('6. No-Code Flow compilation for Auth blocks', () => {
    const rule: NoCodeFlowRule = {
      id: 'flow_auth',
      name: 'Login Flow',
      triggerEvent: 'onClick',
      actions: [
        {
          id: 'act_1',
          type: 'AUTH_LOGIN',
          params: { email: 'user@app.com', password: '123' },
        },
        {
          id: 'act_2',
          type: 'CHECK_PERMISSION',
          params: { permission: 'admin_panel' },
        },
      ],
    };

    const jsCode = compileNoCodeFlowToJS(rule);
    expect(jsCode).toContain('app.auth.login("user@app.com", "123")');
    expect(jsCode).toContain('app.auth.hasPermission("admin_panel")');
  });

  it('7. IR Compiler: Exports authConfig, roles, and securityRules in StudioIR', () => {
    const mockProj: Project = {
      id: 'proj_auth_1',
      name: 'Auth Studio Project',
      version: '1.0.0',
      device: { id: 'iphone', name: 'iPhone 15', width: 393, height: 852, type: 'phone', notchType: 'dynamic-island', borderRadius: 48 },
      assets: [],
      updatedAt: new Date().toISOString(),
      screens: [{ id: 'scr_1', name: 'Home', backgroundColor: '#1E293B', components: [] }],
      activeScreenId: 'scr_1',
    };

    const ir = compileProjectToIR(mockProj);
    expect(ir.authConfig).toBeDefined();
    expect(ir.authConfig?.enabled).toBe(true);
    expect(ir.roles).toBeDefined();
    expect(ir.roles?.length).toBeGreaterThan(0);
    expect(ir.securityRules).toBeDefined();
  });
});
