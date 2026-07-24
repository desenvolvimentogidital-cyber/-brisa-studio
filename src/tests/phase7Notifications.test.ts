import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationManager, RealtimeManager } from '../utils/notificationCommunicationLayer';
import { UniversalRuntime } from '../utils/universalRuntime';
import { createStudioAppApi } from '../utils/studioAppApi';
import { compileNoCodeFlowToJS, NoCodeFlowRule } from '../utils/nocodeEngine';
import { compileProjectToIR } from '../utils/irCompiler';
import { Project } from '../types';

describe('FASE 7 — Notification & Communication Layer Universal Suite', () => {
  let notifManager: NotificationManager;
  let rtManager: RealtimeManager;
  let runtime: UniversalRuntime;

  beforeEach(() => {
    notifManager = new NotificationManager();
    rtManager = new RealtimeManager();
    runtime = new UniversalRuntime();
  });

  it('1. Notification Core: Create, List, Read, Delete & Unread Count', async () => {
    const notif = await notifManager.create({
      title: 'Pedido Confirmado',
      message: 'Seu pedido #123 foi recebido.',
      type: 'success',
      priority: 'high',
    });

    expect(notif.id).toBeDefined();
    expect(notif.title).toBe('Pedido Confirmado');
    expect(notif.read).toBe(false);

    const list = notifManager.list();
    expect(list.some((n) => n.id === notif.id)).toBe(true);
    expect(notifManager.getUnreadCount()).toBeGreaterThan(0);

    // Mark as read
    const readOk = notifManager.markAsRead(notif.id);
    expect(readOk).toBe(true);

    // Delete
    const delOk = notifManager.delete(notif.id);
    expect(delOk).toBe(true);
  });

  it('2. Push Notification Engine: Send Push & Register Device Token', async () => {
    const dev = notifManager.registerDeviceToken('token_abc_123', 'android');
    expect(dev.id).toBeDefined();
    expect(dev.token).toBe('token_abc_123');

    const pushSent = await notifManager.sendPushNotification('Super Oferta', 'Desconto de 50%!');
    expect(pushSent).toBe(true);
  });

  it('3. Realtime Engine: Connect, Emit & Event Listeners', () => {
    let receivedData: any = null;

    rtManager.connect();
    expect(rtManager.isConnected()).toBe(true);

    const unsubscribe = rtManager.on('chat_msg', (data) => {
      receivedData = data;
    });

    rtManager.emit('chat_msg', { text: 'Olá do teste!' });
    expect(receivedData).toEqual({ text: 'Olá do teste!' });

    unsubscribe();
    rtManager.disconnect();
    expect(rtManager.isConnected()).toBe(false);
  });

  it('4. JavaScript SDK: app.notifications and app.realtime API integration', async () => {
    const app = createStudioAppApi(
      { id: 'p1', name: 'App Test' } as any,
      (() => {}) as any,
      { showToast: () => {} }
    );

    const notif = await app.notifications.create({
      title: 'SDK Test',
      message: 'Mensagem via app.notifications',
    });
    expect(notif.title).toBe('SDK Test');
    expect(app.notifications.list().length).toBeGreaterThan(0);

    let rtReceived = false;
    app.realtime.connect();
    app.realtime.on('sdk_event', () => {
      rtReceived = true;
    });
    app.realtime.emit('sdk_event', { ok: true });
    expect(rtReceived).toBe(true);
  });

  it('5. Universal Runtime: Notification & Realtime Actions Execution', async () => {
    runtime.init();

    // NOTIFICATION_SEND
    const sendRes = await runtime.executeAction({
      type: 'NOTIFICATION_SEND',
      params: { title: 'Alerta Runtime', message: 'Mensagem de teste' },
    });
    expect(sendRes.title).toBe('Alerta Runtime');

    // REALTIME_EMIT
    const rtRes = await runtime.executeAction({
      type: 'REALTIME_EMIT',
      params: { event: 'runtime_event', data: { status: 'active' } },
    });
    expect(rtRes.success).toBe(true);

    // EMAIL_SEND
    const emailRes = await runtime.executeAction({
      type: 'EMAIL_SEND',
      params: { to: 'user@test.com', subject: 'Boas-Vindas' },
    });
    expect(emailRes.success).toBe(true);
  });

  it('6. No-Code Flow compilation for Notification and Realtime blocks', () => {
    const rule: NoCodeFlowRule = {
      id: 'flow_notif',
      name: 'Notification Flow',
      triggerEvent: 'onClick',
      actions: [
        {
          id: 'act_1',
          type: 'NOTIFICATION_SEND',
          params: { title: 'Boas vindas', message: 'Seja bem vindo' },
        },
        {
          id: 'act_2',
          type: 'REALTIME_EMIT',
          params: { event: 'ping', data: { ping: true } },
        },
      ],
    };

    const jsCode = compileNoCodeFlowToJS(rule);
    expect(jsCode).toContain('app.notifications.send("Boas vindas", "Seja bem vindo"');
    expect(jsCode).toContain('app.realtime.emit("ping", {"ping":true})');
  });

  it('7. IR Compiler: Exports notificationConfig, pushProviders, realtimeEvents, communicationFlows', () => {
    const mockProj: Project = {
      id: 'proj_notif_1',
      name: 'Notification App',
      version: '1.0.0',
      device: { id: 'iphone', name: 'iPhone 15', width: 393, height: 852, type: 'phone', notchType: 'dynamic-island', borderRadius: 48 },
      assets: [],
      updatedAt: new Date().toISOString(),
      screens: [{ id: 'scr_1', name: 'Home', backgroundColor: '#1E293B', components: [] }],
      activeScreenId: 'scr_1',
    };

    const ir = compileProjectToIR(mockProj);
    expect(ir.notificationConfig).toBeDefined();
    expect(ir.notificationConfig?.enabled).toBe(true);
    expect(ir.pushProviders?.length).toBeGreaterThan(0);
    expect(ir.realtimeEvents?.length).toBeGreaterThan(0);
    expect(ir.communicationFlows?.length).toBeGreaterThan(0);
  });
});
