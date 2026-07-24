import { describe, it, expect, vi } from 'vitest';
import { createStudioAppApi } from '../utils/studioAppApi';
import { Project } from '../types';

const sampleProject: Project = {
  id: 'proj_test',
  name: 'Test Project',
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
          content: 'Entrar',
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
    {
      id: 'scr_2',
      name: 'Dashboard',
      backgroundColor: '#1E293B',
      components: [],
    },
  ],
  masterComponents: [],
  assets: [],
  updatedAt: new Date().toISOString(),
};

describe('Mobile Studio JavaScript API (createStudioAppApi)', () => {
  it('should find component and expose properties correctly', () => {
    let currentProject = { ...sampleProject };
    const setProject = (updater: any) => {
      if (typeof updater === 'function') {
        currentProject = updater(currentProject);
      } else {
        currentProject = updater;
      }
    };

    const showToast = vi.fn();
    const app = createStudioAppApi(currentProject, setProject as any, { showToast });

    const btn = app.getComponent('btnLogin');
    expect(btn).not.toBeNull();
    expect(btn?.text).toBe('Entrar');
    expect(btn?.visible).toBe(true);
    expect(btn?.background).toBe('#2563EB');
  });

  it('should update component properties and mutate state through setProject', () => {
    let currentProject = { ...sampleProject };
    const setProject = (updater: any) => {
      if (typeof updater === 'function') {
        currentProject = updater(currentProject);
      } else {
        currentProject = updater;
      }
    };

    const showToast = vi.fn();
    const app = createStudioAppApi(currentProject, setProject as any, { showToast });

    const btn = app.getComponent('btnLogin');
    if (btn) {
      btn.text = 'Entrar Agora';
      btn.background = '#0066FF';
    }

    const updatedComp = currentProject.screens[0].components[0];
    expect(updatedComp.content).toBe('Entrar Agora');
    expect(updatedComp.backgroundColor).toBe('#0066FF');
  });

  it('should evaluate JS code strings using evalCode', () => {
    let currentProject = { ...sampleProject };
    const setProject = (updater: any) => {
      if (typeof updater === 'function') {
        currentProject = updater(currentProject);
      } else {
        currentProject = updater;
      }
    };

    const showToast = vi.fn();
    const app = createStudioAppApi(currentProject, setProject as any, { showToast });

    const jsCode = `
      const botao = app.getComponent("btnLogin");
      if (botao) {
        botao.text = "Novo Texto Via JS";
        botao.background = "#10B981";
      }
      app.toast("Sucesso JS");
    `;

    const res = app.evalCode(jsCode);
    expect(res.success).toBe(true);
    expect(showToast).toHaveBeenCalledWith('Sucesso JS');
  });

  it('should handle navigation, modals, and local storage via app API', () => {
    let currentProject = { ...sampleProject };
    const setProject = (updater: any) => {
      if (typeof updater === 'function') {
        currentProject = updater(currentProject);
      } else {
        currentProject = updater;
      }
    };

    const showToast = vi.fn();
    const setActiveScreenId = vi.fn();
    const app = createStudioAppApi(currentProject, setProject as any, {
      showToast,
      setActiveScreenId,
    });

    // Navigation test
    const navSuccess = app.navigate('Dashboard');
    expect(navSuccess).toBe(true);
    expect(setActiveScreenId).toHaveBeenCalledWith('scr_2');

    // Modals test
    app.showModal('SettingsModal');
    expect(showToast).toHaveBeenCalledWith('Modal exibido: SettingsModal');

    // Storage test
    app.storage.set('userToken', 'abc_123_xyz');
    expect(app.storage.get('userToken')).toBe('abc_123_xyz');
  });

  it('should safely move component and update border radius', () => {
    let currentProject = { ...sampleProject };
    const setProject = (updater: any) => {
      if (typeof updater === 'function') {
        currentProject = updater(currentProject);
      } else {
        currentProject = updater;
      }
    };

    const showToast = vi.fn();
    const app = createStudioAppApi(currentProject, setProject as any, { showToast });

    const btn = app.getComponent('btnLogin');
    expect(btn).not.toBeNull();

    btn?.move(150, 300);
    btn!.borderRadius = 16;

    const comp = currentProject.screens[0].components[0];
    expect(comp.x).toBe(150);
    expect(comp.y).toBe(300);
    expect(comp.borderRadius).toBe(16);
    expect(comp.border?.radiusTopLeft).toBe(16);
  });

  it('should handle non-existent components and JS evaluation errors gracefully', () => {
    let currentProject = { ...sampleProject };
    const setProject = (updater: any) => {
      if (typeof updater === 'function') {
        currentProject = updater(currentProject);
      } else {
        currentProject = updater;
      }
    };

    const showToast = vi.fn();
    const addConsoleLog = vi.fn();
    const app = createStudioAppApi(currentProject, setProject as any, { showToast, addConsoleLog });

    // Non-existent component
    const missing = app.getComponent('nonExistentButton');
    expect(missing).toBeNull();

    // Syntax error in JS code
    const invalidJs = `const x = ;`;
    const res = app.evalCode(invalidJs);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
    expect(addConsoleLog).toHaveBeenCalledWith('error', expect.stringContaining('Erro na execução do JS'), 'JS Runner');
  });
});
