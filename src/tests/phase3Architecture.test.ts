import { describe, it, expect, vi } from 'vitest';
import { studioEventBus } from '../utils/eventBus';
import { compileProjectToIR, StudioIR } from '../utils/irCompiler';
import {
  exportToFlutter,
  exportToReactNative,
  exportToKotlinCompose,
  exportToSwiftUI,
} from '../utils/irExporters';
import { pluginManager, MobileStudioPlugin } from '../utils/pluginManager';
import { compileNoCodeFlowToJS, NoCodeFlowRule } from '../utils/nocodeEngine';
import { Project } from '../types';

const sampleProject: Project = {
  id: 'proj_phase3_test',
  name: 'Phase3 Modular App',
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
      name: 'Home',
      backgroundColor: '#0F172A',
      components: [
        {
          id: 'btnLogin',
          name: 'btnLogin',
          type: 'button',
          category: 'basic',
          x: 10,
          y: 20,
          width: 120,
          height: 40,
          rotation: 0,
          zIndex: 1,
          opacity: 1,
          locked: false,
          hidden: false,
          paddingTop: 8,
          paddingRight: 16,
          paddingBottom: 8,
          paddingLeft: 16,
          content: 'Entrar Agora',
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: '600',
          color: '#FFFFFF',
          textAlign: 'center',
          letterSpacing: 0,
          lineHeight: 1.2,
          backgroundColor: '#2563EB',
          gradient: { enabled: false, type: 'linear', angle: 90, startColor: '#000', endColor: '#FFF' },
          border: {
            style: 'solid',
            color: '#1E40AF',
            width: 1,
            radiusTopLeft: 8,
            radiusTopRight: 8,
            radiusBottomRight: 8,
            radiusBottomLeft: 8,
            isRadiusLinked: true,
          },
          shadow: { enabled: false, color: '#000', x: 0, y: 2, blur: 4, spread: 0, inset: false },
          backdropBlur: 0,
          interaction: { onClickAction: 'none' },
        },
      ],
    },
  ],
  masterComponents: [],
  assets: [],
  updatedAt: new Date().toISOString(),
};

describe('FASE 3 — Core Freeze, Modular Architecture, IR & No-Code Suite', () => {
  it('1. Event Bus: publish and receive decoupled events across modules', () => {
    const listener = vi.fn();
    const unsubscribe = studioEventBus.subscribe('ComponentCreated', listener);

    studioEventBus.publish('ComponentCreated', { componentId: 'btnLogin' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ComponentCreated',
        data: { componentId: 'btnLogin' },
      })
    );

    unsubscribe();
    studioEventBus.publish('ComponentCreated', { componentId: 'btn2' });
    expect(listener).toHaveBeenCalledTimes(1); // Not called again after unsubscribing
  });

  it('2. IR Compiler: compile Project model into normalized StudioIR AST', () => {
    const ir: StudioIR = compileProjectToIR(sampleProject);

    expect(ir.version).toBe('1.0.0-IR');
    expect(ir.appInfo.id).toBe('proj_phase3_test');
    expect(ir.appInfo.name).toBe('Phase3 Modular App');
    expect(ir.screens.length).toBe(1);

    const comp = ir.screens[0].components[0];
    expect(comp.id).toBe('btnLogin');
    expect(comp.type).toBe('button');
    expect(comp.content).toBe('Entrar Agora');
    expect(ir.variables.length).toBeGreaterThan(0);
    expect(ir.databaseCollections.length).toBeGreaterThan(0);
  });

  it('3. Multi-Framework Exporters: generate clean code for Flutter, React Native, Kotlin, SwiftUI', () => {
    const ir = compileProjectToIR(sampleProject);

    // Flutter
    const flutterRes = exportToFlutter(ir);
    expect(flutterRes.framework).toBe('flutter');
    expect(flutterRes.files.some((f) => f.path.includes('home_screen.dart'))).toBe(true);

    // React Native
    const rnRes = exportToReactNative(ir);
    expect(rnRes.framework).toBe('react-native');
    expect(rnRes.files.some((f) => f.path.includes('HomeScreen.tsx'))).toBe(true);

    // Kotlin Compose
    const ktRes = exportToKotlinCompose(ir);
    expect(ktRes.framework).toBe('kotlin');
    expect(ktRes.files.some((f) => f.path.includes('HomeScreen.kt'))).toBe(true);

    // SwiftUI
    const swiftRes = exportToSwiftUI(ir);
    expect(swiftRes.framework).toBe('swiftui');
    expect(swiftRes.files.some((f) => f.path.includes('HomeView.swift'))).toBe(true);
  });

  it('4. Plugin Manager: register, unregister and trigger lifecycle hooks', () => {
    const onRegister = vi.fn();
    const onUnregister = vi.fn();

    const mockPlugin: MobileStudioPlugin = {
      id: 'plugin_firebase_auth',
      name: 'Firebase Auth Module',
      version: '1.0.0',
      description: 'Pluggable Auth Service',
      author: 'MobileStudio Team',
      category: 'database',
      onRegister,
      onUnregister,
    };

    const regResult = pluginManager.registerPlugin(mockPlugin);
    expect(regResult).toBe(true);
    expect(onRegister).toHaveBeenCalledTimes(1);

    expect(pluginManager.getPlugin('plugin_firebase_auth')).toBeDefined();

    const unregResult = pluginManager.unregisterPlugin('plugin_firebase_auth');
    expect(unregResult).toBe(true);
    expect(onUnregister).toHaveBeenCalledTimes(1);
    expect(pluginManager.getPlugin('plugin_firebase_auth')).toBeUndefined();
  });

  it('5. No-Code Logic Engine: compile visual rule into executable JS code', () => {
    const rule: NoCodeFlowRule = {
      id: 'flow_login',
      name: 'Login Click Handler',
      triggerEvent: 'onClick',
      targetComponentId: 'btnLogin',
      actions: [
        { id: 'act_1', type: 'SHOW_TOAST', params: { message: 'Iniciando...' } },
        { id: 'act_2', type: 'NAVIGATE', params: { targetScreen: 'Dashboard' } },
      ],
    };

    const jsCode = compileNoCodeFlowToJS(rule);
    expect(jsCode).toContain('app.onClick("btnLogin"');
    expect(jsCode).toContain('app.toast("Iniciando...")');
    expect(jsCode).toContain('app.navigate("Dashboard")');
  });
});
