import { describe, it, expect } from 'vitest';
import { buildVirtualFileSystem } from '../utils/projectFileSystem';
import { Project } from '../types';
import { DEVICE_PRESETS } from '../constants/componentTemplates';

describe('Editor de Código Integrado & Virtual File System', () => {
  const dummyProject: Project = {
    id: 'proj_test',
    name: 'App Teste Híbrido',
    version: '1.0.0',
    device: DEVICE_PRESETS[0],
    updatedAt: new Date().toISOString(),
    activeScreenId: 'scr_main',
    assets: [],
    screens: [
      {
        id: 'scr_main',
        name: 'Tela Inicial',
        backgroundColor: '#FFFFFF',
        isInitialScreen: true,
        components: [],
      },
    ],
  };

  it('gerencia e constrói o File Explorer com a estrutura do projeto', () => {
    const files = buildVirtualFileSystem(dummyProject);
    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThan(0);

    const srcFolder = files.find((f) => f.id === 'src');
    expect(srcFolder).toBeDefined();
    expect(srcFolder?.isFolder).toBe(true);

    const projectJson = files.find((f) => f.id === 'project.json');
    expect(projectJson).toBeDefined();
    expect(projectJson?.content).toContain('App Teste Híbrido');
  });

  it('permite a atualização em tempo real com arquivos customizados', () => {
    const customFiles = {
      'project.json': JSON.stringify({ ...dummyProject, name: 'App Modificado via Código' }),
    };

    const files = buildVirtualFileSystem(dummyProject, customFiles);
    const projectJson = files.find((f) => f.id === 'project.json');

    expect(projectJson?.content).toContain('App Modificado via Código');
  });
});
