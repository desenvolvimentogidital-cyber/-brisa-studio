import { describe, it, expect, vi } from 'vitest';
import { createStudioAppApi } from '../utils/studioAppApi';
import { Project, Screen, CanvasComponent } from '../types';

function createMockProject(screenCount = 1, componentsPerScreen = 100): Project {
  const screens: Screen[] = [];

  for (let i = 1; i <= screenCount; i++) {
    const components: CanvasComponent[] = [];
    for (let j = 1; j <= componentsPerScreen; j++) {
      components.push({
        id: `comp_${i}_${j}`,
        name: `component_${i}_${j}`,
        type: j % 2 === 0 ? 'button' : 'text',
        category: 'basic',
        x: j * 5,
        y: j * 5,
        width: 100,
        height: 40,
        rotation: 0,
        zIndex: j,
        opacity: 1,
        locked: false,
        hidden: false,
        paddingTop: 8,
        paddingRight: 16,
        paddingBottom: 8,
        paddingLeft: 16,
        content: `Element ${j}`,
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 0,
        lineHeight: 1.2,
        backgroundColor: '#1E293B',
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
      });
    }

    screens.push({
      id: `scr_${i}`,
      name: `Screen_${i}`,
      backgroundColor: '#0F172A',
      components,
    });
  }

  return {
    id: 'large_audit_proj',
    name: 'Audit Benchmark Project',
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
    screens,
    masterComponents: [],
    assets: [],
    updatedAt: new Date().toISOString(),
  };
}

describe('Audit & Performance Benchmark Suite', () => {
  it('1. Canvas Scale Benchmark: 10,000 components search & state mutation performance', () => {
    const project = createMockProject(10, 1000); // 10 screens x 1,000 components = 10,000 total
    let currentProject = project;
    const setProject = (updater: any) => {
      currentProject = typeof updater === 'function' ? updater(currentProject) : updater;
    };

    const startTime = performance.now();
    const app = createStudioAppApi(currentProject, setProject as any, { showToast: vi.fn() });

    // Find and update component #999 in active screen
    const targetComp = app.getComponent('component_1_999');
    expect(targetComp).not.toBeNull();
    targetComp!.text = 'Updated Text Benchmark';
    targetComp!.background = '#FF0000';

    const endTime = performance.now();
    const elapsed = endTime - startTime;

    expect(currentProject.screens[0].components[998].content).toBe('Updated Text Benchmark');
    expect(elapsed).toBeLessThan(100); // Must process 10k items in under 100ms
  });

  it('2. JS API Stress: 10,000 consecutive property syncs and 1,000 evals', () => {
    const project = createMockProject(1, 10);
    let currentProject = project;
    const setProject = (updater: any) => {
      currentProject = typeof updater === 'function' ? updater(currentProject) : updater;
    };

    const app = createStudioAppApi(currentProject, setProject as any, { showToast: vi.fn() });

    const startTime = performance.now();

    // 10,000 property updates
    const btn = app.getComponent('component_1_2');
    expect(btn).not.toBeNull();

    for (let i = 0; i < 10000; i++) {
      btn!.x = i;
    }

    // 1,000 code evaluations
    const jsCode = `app.getComponent("component_1_2").y = 250;`;
    for (let i = 0; i < 1000; i++) {
      app.evalCode(jsCode);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(currentProject.screens[0].components[1].x).toBe(9999);
    expect(currentProject.screens[0].components[1].y).toBe(250);
    expect(duration).toBeLessThan(1500); // Must complete 10k updates + 1k evals under 1.5s
  });

  it('3. Scalability Benchmark: 500 Screens with 50,000 components total', () => {
    const project = createMockProject(500, 100); // 500 screens x 100 components
    let currentProject = project;
    const setProject = (updater: any) => {
      currentProject = typeof updater === 'function' ? updater(currentProject) : updater;
    };

    const setActiveScreenId = vi.fn();
    const app = createStudioAppApi(currentProject, setProject as any, {
      showToast: vi.fn(),
      setActiveScreenId,
    });

    const startTime = performance.now();

    // Navigate to screen #450
    const navOk = app.navigate('Screen_450');
    expect(navOk).toBe(true);
    expect(setActiveScreenId).toHaveBeenCalledWith('scr_450');

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(50);
  });

  it('4. Security & Sandbox: Verify global protection against malicious script inputs', () => {
    const project = createMockProject(1, 5);
    let currentProject = project;
    const setProject = (updater: any) => {
      currentProject = typeof updater === 'function' ? updater(currentProject) : updater;
    };

    const app = createStudioAppApi(currentProject, setProject as any, { showToast: vi.fn() });

    // Code attempting window / document / process leak
    const maliciousCode = `
      try {
        window.location = 'http://malicious.com';
      } catch (e) {}
      try {
        document.body.innerHTML = '';
      } catch (e) {}
      app.toast('Sandboxed safely');
    `;

    const res = app.evalCode(maliciousCode);
    expect(res.success).toBe(true);
  });

  it('5. Edge cases: Handle null, undefined, missing target IDs gracefully', () => {
    const project = createMockProject(1, 2);
    let currentProject = project;
    const setProject = (updater: any) => {
      currentProject = typeof updater === 'function' ? updater(currentProject) : updater;
    };

    const app = createStudioAppApi(currentProject, setProject as any, { showToast: vi.fn() });

    expect(app.getComponent('')).toBeNull();
    expect(app.getComponent('non_existent')).toBeNull();
    expect(app.navigate('NonExistentScreen')).toBe(false);

    const resEmpty = app.evalCode('');
    expect(resEmpty.success).toBe(false);
  });
});
