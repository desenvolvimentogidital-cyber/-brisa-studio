import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AppMode,
  DevMode,
  AssetFile,
  CanvasComponent,
  ComponentType,
  ConsoleLogItem,
  ConsoleLogType,
  DevicePreset,
  EventLogItem,
  GitCommit,
  GitState,
  MasterComponent,
  Project,
  Screen,
  StudioTheme,
} from '../types';
import { DEVICE_PRESETS, createNewComponent } from '../constants/componentTemplates';
import { TEMPLATE_PROJECTS } from '../constants/templates';
import { DEFAULT_MASTER_CATEGORIES, INITIAL_MASTER_COMPONENTS } from '../constants/masterTemplates';
import { loadSavedProject, saveProjectToStorage } from '../utils/storage';
import {
  getAbsolutePosition,
  getDescendantIds,
  isAncestorOf,
} from '../utils/hierarchy';
import {
  recalculateAllAutoLayouts,
  applyDeviceViewportResize,
} from '../utils/autoLayout';

interface EditorContextType {
  // Project & Screen
  project: Project;
  activeScreen: Screen;
  setActiveScreenId: (screenId: string) => void;
  addScreen: (name: string) => void;
  duplicateScreen: (screenId: string) => void;
  renameScreen: (screenId: string, name: string) => void;
  deleteScreen: (screenId: string) => void;
  setScreenBackgroundColor: (color: string) => void;
  setInitialScreen: (screenId: string) => void;

  // Components & Selection
  selectedComponentIds: string[];
  selectedComponent: CanvasComponent | null;
  selectComponent: (id: string, multiSelect?: boolean) => void;
  selectAllComponents: () => void;
  deselectAll: () => void;
  updateComponentProperties: (id: string, updates: Partial<CanvasComponent>, skipHistory?: boolean) => void;
  updateSelectedComponents: (updates: Partial<CanvasComponent>, skipHistory?: boolean) => void;
  commitHistory: () => void;
  addComponentToCanvas: (type: ComponentType, dropX?: number, dropY?: number) => void;
  deleteSelectedComponents: () => void;
  duplicateSelectedComponents: () => void;
  groupSelectedComponents: () => void;
  ungroupSelectedComponents: () => void;
  toggleLockComponent: (id: string) => void;
  toggleHideComponent: (id: string) => void;
  changeComponentZIndex: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  reorderLayers: (sourceIndex: number, destinationIndex: number) => void;
  reparentComponent: (componentId: string, newParentId?: string) => void;
  nudgeSelectedComponents: (dx: number, dy: number) => void;

  // Master Components
  masterComponents: MasterComponent[];
  masterCategories: string[];
  saveAsMasterComponent: (
    componentId: string,
    name: string,
    category?: string,
    description?: string,
    tags?: string[]
  ) => MasterComponent;
  instantiateMasterComponent: (
    masterId: string,
    targetX?: number,
    targetY?: number,
    targetParentId?: string
  ) => CanvasComponent | null;
  updateMasterComponent: (
    masterId: string,
    updatedRoot: CanvasComponent,
    updatedChildren: CanvasComponent[],
    syncMode: 'all' | 'new' | 'none'
  ) => void;
  unlinkInstance: (instanceId: string) => void;
  deleteMasterComponent: (masterId: string) => void;
  toggleFavoriteMasterComponent: (masterId: string) => void;
  duplicateMasterComponent: (masterId: string) => void;
  exportMasterComponentsJson: () => string;
  importMasterComponentsJson: (jsonStr: string) => boolean;
  createMasterCategory: (categoryName: string) => void;
  pendingSyncMaster: MasterComponent | null;
  setPendingSyncMaster: (master: MasterComponent | null) => void;

  // Isolation Mode
  isolatedComponentId: string | null;
  enterIsolationMode: (componentId: string) => void;
  exitIsolationMode: () => void;
  isolationBreadcrumbs: { id: string; name: string; type: string }[];

  // Clipboard & History
  copySelectedComponents: () => void;
  cutSelectedComponents: () => void;
  pasteComponents: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Canvas Viewport & Config
  zoom: number;
  setZoom: (zoom: number) => void;
  panX: number;
  panY: number;
  setPan: (x: number, y: number) => void;
  resetCanvasView: () => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showRulers: boolean;
  setShowRulers: (show: boolean) => void;
  showGuides: boolean;
  setShowGuides: (show: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  gridSize: number;
  device: DevicePreset;
  setDevice: (device: DevicePreset) => void;

  // Studio Theme & Mode
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  devMode: DevMode;
  setDevMode: (devMode: DevMode) => void;
  theme: StudioTheme;
  toggleTheme: () => void;

  // Code Editor & File Explorer
  selectedFileId: string;
  setSelectedFileId: (fileId: string) => void;
  customFileContents: Record<string, string>;
  updateFileContent: (fileId: string, content: string) => void;
  createFile: (filePath: string, content?: string) => void;
  createFolder: (folderPath: string) => void;
  deleteFileOrFolder: (path: string) => void;
  renameFileOrFolder: (oldPath: string, newPath: string) => void;

  // Debug, Console & Event Monitor
  consoleLogs: ConsoleLogItem[];
  addConsoleLog: (type: ConsoleLogType, message: string, source?: string) => void;
  clearConsoleLogs: () => void;
  eventLogs: EventLogItem[];
  logEvent: (action: string, details: string) => void;
  activeBottomPanelTab: 'console' | 'inspector' | 'variables' | 'events' | 'diagnostics' | 'git';
  setActiveBottomPanelTab: (tab: 'console' | 'inspector' | 'variables' | 'events' | 'diagnostics' | 'git') => void;

  // Git Integration
  gitState: GitState;
  gitInit: () => void;
  gitCommit: (message: string) => void;
  gitCreateBranch: (branchName: string) => void;
  gitSwitchBranch: (branchName: string) => void;
  gitMerge: (branchName: string) => void;
  gitRevert: (commitHash: string) => void;

  // Modals & UI Controls
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isWelcomeModalOpen: boolean;
  setIsWelcomeModalOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (open: boolean) => void;
  isIconPickerOpen: boolean;
  setIsIconPickerOpen: (open: boolean) => void;
  isFeedbackModalOpen: boolean;
  setIsFeedbackModalOpen: (open: boolean) => void;
  isWebsitePortalOpen: boolean;
  setIsWebsitePortalOpen: (open: boolean) => void;
  isDocumentationOpen: boolean;
  setIsDocumentationOpen: (open: boolean) => void;
  documentationArticleId: string | undefined;
  setDocumentationArticleId: (id: string | undefined) => void;
  activeToast: string | null;
  showToast: (msg: string) => void;

  // Asset Management
  addAsset: (asset: AssetFile) => void;
  deleteAsset: (id: string) => void;

  // Templates
  loadTemplateProject: (templateId: string) => void;
  resetProjectToBlank: () => void;
  createNewProject: (name: string, deviceId?: string) => void;
  importProjectJson: (jsonStr: string) => void;
  deleteCurrentProject: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

const MAX_HISTORY = 40;

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Project State
  const [project, setProject] = useState<Project>(() => loadSavedProject());
  const [history, setHistory] = useState<Project[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Selection & Clipboard State
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<CanvasComponent[]>([]);

  // Canvas Config State
  const [zoom, setZoomState] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const gridSize = 8;

  // Theme & Mode
  const [theme, setTheme] = useState<StudioTheme>('dark');
  const [mode, setMode] = useState<AppMode>('editor');
  const [devMode, setDevMode] = useState<DevMode>('visual');

  // Modals & Portal Controls
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [isWebsitePortalOpen, setIsWebsitePortalOpen] = useState<boolean>(false);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState<boolean>(false);
  const [documentationArticleId, setDocumentationArticleId] = useState<string | undefined>(undefined);

  // Code Editor & Virtual File System
  const [selectedFileId, setSelectedFileId] = useState<string>('src/app.js');
  const [customFileContents, setCustomFileContents] = useState<Record<string, string>>({});

  // Debug Console & Event Monitor
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogItem[]>([
    {
      id: 'log_init',
      type: 'info',
      message: 'Mobile Studio Code Engine v2.0 inicializado.',
      timestamp: new Date().toLocaleTimeString(),
      source: 'System',
    },
  ]);
  const [eventLogs, setEventLogs] = useState<EventLogItem[]>([
    {
      id: 'evt_init',
      timestamp: new Date().toLocaleTimeString(),
      action: 'Projeto Carregado',
      details: `Projeto iniciado com ${project.screens.length} tela(s).`,
    },
  ]);
  const [activeBottomPanelTab, setActiveBottomPanelTab] = useState<
    'console' | 'inspector' | 'variables' | 'events' | 'diagnostics' | 'git'
  >('console');

  // Git Integration State
  const [gitState, setGitState] = useState<GitState>({
    isInitialized: true,
    currentBranch: 'main',
    branches: ['main', 'feature/ui-layout'],
    commits: [
      {
        id: 'commit_1',
        hash: 'a7b8c9d',
        message: 'Setup inicial da aplicação mobile e navegação',
        author: 'Desenvolvedor <dev@studio.app>',
        date: new Date().toLocaleString(),
        branch: 'main',
        projectSnapshot: project,
      },
    ],
  });

  // Master Component System State
  const [masterComponents, setMasterComponents] = useState<MasterComponent[]>(
    () => project.masterComponents || INITIAL_MASTER_COMPONENTS
  );
  const [masterCategories, setMasterCategories] = useState<string[]>(
    () => project.masterCategories || DEFAULT_MASTER_CATEGORIES
  );
  const [pendingSyncMaster, setPendingSyncMaster] = useState<MasterComponent | null>(null);

  // Isolation Mode State
  const [isolatedComponentId, setIsolatedComponentId] = useState<string | null>(null);

  const enterIsolationMode = (componentId: string) => {
    setIsolatedComponentId(componentId);
    setSelectedComponentIds([componentId]);
  };

  const exitIsolationMode = () => {
    setIsolatedComponentId(null);
  };

  // Calculate breadcrumbs for isolation mode
  const isolationBreadcrumbs = React.useMemo(() => {
    if (!isolatedComponentId) return [];

    const activeScreen = project.screens.find((s) => s.id === project.activeScreenId);
    if (!activeScreen) return [];

    const compMap = new Map<string, CanvasComponent>();
    activeScreen.components.forEach((c) => compMap.set(c.id, c));

    const trail: { id: string; name: string; type: string }[] = [];
    let current = compMap.get(isolatedComponentId);

    while (current) {
      trail.unshift({ id: current.id, name: current.name, type: current.type });
      if (!current.parentId) break;
      current = compMap.get(current.parentId);
    }

    trail.unshift({ id: 'screen_root', name: activeScreen.name, type: 'screen' });
    return trail;
  }, [isolatedComponentId, project]);

  // Master Component Methods
  const saveAsMasterComponent = (
    componentId: string,
    name: string,
    category: string = 'Geral',
    description: string = '',
    tags: string[] = []
  ): MasterComponent => {
    const activeScreen = project.screens.find((s) => s.id === project.activeScreenId);
    if (!activeScreen) throw new Error('No active screen');

    const target = activeScreen.components.find((c) => c.id === componentId);
    if (!target) throw new Error('Component not found');

    // Get descendants
    const descendantIds = getDescendantIds([componentId], activeScreen.components);
    const childrenComps = activeScreen.components.filter(
      (c) => descendantIds.includes(c.id) && c.id !== componentId
    );

    const masterId = `master_${Date.now()}`;
    const rootCopy: CanvasComponent = JSON.parse(JSON.stringify(target));
    rootCopy.parentId = undefined;
    rootCopy.masterComponentId = masterId;
    rootCopy.isMasterRoot = true;

    const childrenCopies: CanvasComponent[] = JSON.parse(JSON.stringify(childrenComps)).map(
      (c: CanvasComponent) => ({
        ...c,
        masterComponentId: masterId,
      })
    );

    const newMaster: MasterComponent = {
      id: masterId,
      name,
      description,
      category,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemCount: childrenCopies.length + 1,
      width: target.width,
      height: target.height,
      rootComponent: rootCopy,
      childrenComponents: childrenCopies,
      isFavorite: false,
    };

    setMasterComponents((prev) => [newMaster, ...prev]);

    // Mark original canvas components as master instances
    setProject((prev) => {
      const newScreens = prev.screens.map((screen) => {
        if (screen.id !== prev.activeScreenId) return screen;
        return {
          ...screen,
          components: screen.components.map((c) => {
            if (c.id === componentId) {
              return { ...c, masterComponentId: masterId, isMasterRoot: true };
            }
            if (descendantIds.includes(c.id)) {
              return { ...c, masterComponentId: masterId };
            }
            return c;
          }),
        };
      });
      return { ...prev, screens: newScreens };
    });

    if (showToast) showToast(`Componente mestre "${name}" salvo com sucesso!`);
    return newMaster;
  };

  const instantiateMasterComponent = (
    masterId: string,
    targetX?: number,
    targetY?: number,
    targetParentId?: string
  ): CanvasComponent | null => {
    const master = masterComponents.find((m) => m.id === masterId);
    if (!master) return null;

    const activeScreen = project.screens.find((s) => s.id === project.activeScreenId);
    if (!activeScreen) return null;

    const timestamp = Date.now();
    const idMap = new Map<string, string>();

    const newRootId = `comp_${master.rootComponent.type}_${timestamp}_${Math.floor(Math.random() * 1000)}`;
    idMap.set(master.rootComponent.id, newRootId);

    master.childrenComponents.forEach((child) => {
      idMap.set(child.id, `comp_${child.type}_${timestamp}_${Math.floor(Math.random() * 1000)}`);
    });

    const rootX = targetX !== undefined ? targetX : 40;
    const rootY = targetY !== undefined ? targetY : 60;

    const clonedRoot: CanvasComponent = {
      ...JSON.parse(JSON.stringify(master.rootComponent)),
      id: newRootId,
      x: rootX,
      y: rootY,
      parentId: targetParentId,
      masterComponentId: master.id,
      isMasterRoot: true,
    };

    const clonedChildren: CanvasComponent[] = master.childrenComponents.map((child) => {
      const copy: CanvasComponent = JSON.parse(JSON.stringify(child));
      copy.id = idMap.get(child.id) || copy.id;
      if (copy.parentId) {
        copy.parentId = idMap.get(copy.parentId) || targetParentId || newRootId;
      } else {
        copy.parentId = newRootId;
      }
      copy.masterComponentId = master.id;
      return copy;
    });

    setProject((prev) => {
      const newScreens = prev.screens.map((screen) => {
        if (screen.id !== prev.activeScreenId) return screen;
        return {
          ...screen,
          components: [...screen.components, clonedRoot, ...clonedChildren],
        };
      });
      return { ...prev, screens: newScreens };
    });

    setSelectedComponentIds([newRootId]);
    if (showToast) showToast(`Instância de "${master.name}" adicionada.`);
    return clonedRoot;
  };

  const updateMasterComponent = (
    masterId: string,
    updatedRoot: CanvasComponent,
    updatedChildren: CanvasComponent[],
    syncMode: 'all' | 'new' | 'none'
  ) => {
    if (syncMode === 'none') return;

    setMasterComponents((prev) =>
      prev.map((m) =>
        m.id === masterId
          ? {
              ...m,
              rootComponent: updatedRoot,
              childrenComponents: updatedChildren,
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );

    if (syncMode === 'all') {
      // Sync styles & props across all instances in project
      setProject((prev) => {
        const newScreens = prev.screens.map((screen) => {
          return {
            ...screen,
            components: screen.components.map((c) => {
              if (c.masterComponentId === masterId && c.isMasterRoot) {
                return {
                  ...c,
                  backgroundColor: updatedRoot.backgroundColor,
                  color: updatedRoot.color,
                  border: updatedRoot.border,
                  shadow: updatedRoot.shadow,
                  fontFamily: updatedRoot.fontFamily,
                  fontSize: updatedRoot.fontSize,
                  fontWeight: updatedRoot.fontWeight,
                };
              }
              return c;
            }),
          };
        });
        return { ...prev, screens: newScreens };
      });
      if (showToast) showToast(`Todas as instâncias do Mestre foram sincronizadas.`);
    }
  };

  const unlinkInstance = (instanceId: string) => {
    const activeScreen = project.screens.find((s) => s.id === project.activeScreenId);
    if (!activeScreen) return;

    const descendantIds = getDescendantIds([instanceId], activeScreen.components);
    const targetIds = new Set([instanceId, ...descendantIds]);

    setProject((prev) => {
      const newScreens = prev.screens.map((screen) => {
        if (screen.id !== prev.activeScreenId) return screen;
        return {
          ...screen,
          components: screen.components.map((c) => {
            if (targetIds.has(c.id)) {
              return {
                ...c,
                masterComponentId: undefined,
                isMasterRoot: undefined,
                overrides: undefined,
              };
            }
            return c;
          }),
        };
      });
      return { ...prev, screens: newScreens };
    });

    if (showToast) showToast('Instância desvinculada do componente mestre.');
  };

  const deleteMasterComponent = (masterId: string) => {
    const master = masterComponents.find((m) => m.id === masterId);
    setMasterComponents((prev) => prev.filter((m) => m.id !== masterId));
    if (master && showToast) {
      showToast(`Componente mestre "${master.name}" removido.`);
    }
  };

  const toggleFavoriteMasterComponent = (masterId: string) => {
    setMasterComponents((prev) =>
      prev.map((m) => (m.id === masterId ? { ...m, isFavorite: !m.isFavorite } : m))
    );
  };

  const duplicateMasterComponent = (masterId: string) => {
    const master = masterComponents.find((m) => m.id === masterId);
    if (!master) return;

    const newId = `master_${Date.now()}`;
    const copy: MasterComponent = {
      ...JSON.parse(JSON.stringify(master)),
      id: newId,
      name: `${master.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMasterComponents((prev) => [copy, ...prev]);
    if (showToast) showToast(`Mestre duplicado: "${copy.name}"`);
  };

  const exportMasterComponentsJson = (): string => {
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        categories: masterCategories,
        components: masterComponents,
      },
      null,
      2
    );
  };

  const importMasterComponentsJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.components)) {
        setMasterComponents((prev) => [...parsed.components, ...prev]);
        if (Array.isArray(parsed.categories)) {
          setMasterCategories((prev) => Array.from(new Set([...prev, ...parsed.categories])));
        }
        if (showToast) showToast(`${parsed.components.length} componentes mestres importados!`);
        return true;
      }
    } catch (e) {
      console.error('Failed to parse master components JSON', e);
    }
    if (showToast) showToast('Erro ao importar arquivo JSON de componentes.');
    return false;
  };

  const createMasterCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (trimmed && !masterCategories.includes(trimmed)) {
      setMasterCategories((prev) => [...prev, trimmed]);
      if (showToast) showToast(`Categoria "${trimmed}" criada.`);
    }
  };

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Toast Notification helper
  const showToast = useCallback((msg: string) => {
    setActiveToast(msg);
    setTimeout(() => {
      setActiveToast((curr) => (curr === msg ? null : curr));
    }, 2800);
  }, []);

  // Debounced sync to local storage to maintain fluid performance during continuous edits/dragging
  useEffect(() => {
    const handler = setTimeout(() => {
      saveProjectToStorage(project);
    }, 400);
    return () => clearTimeout(handler);
  }, [project]);

  // Active Screen
  const activeScreen =
    project.screens.find((s) => s.id === project.activeScreenId) || project.screens[0];

  const activeDevice = project.device || DEVICE_PRESETS[0];

  // Helper: push state into undo history
  const pushHistory = useCallback(
    (newProject: Project) => {
      setHistory((prevHistory) => {
        const sliced = prevHistory.slice(0, historyIndex + 1);
        if (sliced.length >= MAX_HISTORY) {
          sliced.shift();
        }
        return [...sliced, newProject];
      });
      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
      setProject(newProject);
    },
    [historyIndex]
  );

  const commitHistory = useCallback(() => {
    setHistory((prevHistory) => {
      const sliced = prevHistory.slice(0, historyIndex + 1);
      if (sliced.length >= MAX_HISTORY) {
        sliced.shift();
      }
      return [...sliced, project];
    });
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex, project]);

  // Undo / Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (canUndo) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setProject(history[prevIndex]);
      showToast('Ação desfeita (Undo)');
    }
  }, [canUndo, history, historyIndex, showToast]);

  const redo = useCallback(() => {
    if (canRedo) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setProject(history[nextIndex]);
      showToast('Ação refeita (Redo)');
    }
  }, [canRedo, history, historyIndex, showToast]);

  // Initial history setup
  useEffect(() => {
    if (history.length === 0) {
      setHistory([project]);
      setHistoryIndex(0);
    }
  }, []);

  // Screen Actions
  const setActiveScreenId = (screenId: string) => {
    setProject((prev) => ({
      ...prev,
      activeScreenId: screenId,
    }));
    setSelectedComponentIds([]);
  };

  const addScreen = (name: string) => {
    const newScreenId = `scr_${Date.now()}`;
    const newScreen: Screen = {
      id: newScreenId,
      name: name.trim() || `Nova Tela ${project.screens.length + 1}`,
      backgroundColor: '#FFFFFF',
      components: [],
      isInitialScreen: project.screens.length === 0,
    };

    const newProject: Project = {
      ...project,
      screens: [...project.screens, newScreen],
      activeScreenId: newScreenId,
    };
    pushHistory(newProject);
    setSelectedComponentIds([]);
    showToast(`Tela "${newScreen.name}" criada`);
  };

  const duplicateScreen = (screenId: string) => {
    const sourceScreen = project.screens.find((s) => s.id === screenId);
    if (!sourceScreen) return;

    const newScreenId = `scr_${Date.now()}`;
    const duplicatedComponents = sourceScreen.components.map((c) => ({
      ...c,
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    }));

    const newScreen: Screen = {
      ...sourceScreen,
      id: newScreenId,
      name: `${sourceScreen.name} (Cópia)`,
      isInitialScreen: false,
      components: duplicatedComponents,
    };

    const newProject: Project = {
      ...project,
      screens: [...project.screens, newScreen],
      activeScreenId: newScreenId,
    };
    pushHistory(newProject);
    showToast(`Tela duplicada`);
  };

  const renameScreen = (screenId: string, name: string) => {
    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) => (s.id === screenId ? { ...s, name } : s)),
    };
    pushHistory(newProject);
  };

  const deleteScreen = (screenId: string) => {
    if (project.screens.length <= 1) {
      showToast('Não é possível excluir a única tela do aplicativo');
      return;
    }
    const remainingScreens = project.screens.filter((s) => s.id !== screenId);
    const newActiveId =
      project.activeScreenId === screenId ? remainingScreens[0].id : project.activeScreenId;

    const newProject: Project = {
      ...project,
      screens: remainingScreens,
      activeScreenId: newActiveId,
    };
    pushHistory(newProject);
    showToast('Tela excluída');
  };

  const setScreenBackgroundColor = (color: string) => {
    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, backgroundColor: color } : s
      ),
    };
    pushHistory(newProject);
  };

  const setInitialScreen = (screenId: string) => {
    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) => ({
        ...s,
        isInitialScreen: s.id === screenId,
      })),
    };
    pushHistory(newProject);
    showToast('Tela inicial definida');
  };

  // Component Selection
  const selectComponent = (id: string, multiSelect = false) => {
    const clickedComp = activeScreen.components.find((c) => c.id === id);
    let idsToSelect = [id];

    if (clickedComp && clickedComp.groupId) {
      const groupMembers = activeScreen.components
        .filter((c) => c.groupId === clickedComp.groupId)
        .map((c) => c.id);
      idsToSelect = groupMembers;
    }

    if (multiSelect) {
      setSelectedComponentIds((prev) => {
        const hasAll = idsToSelect.every((i) => prev.includes(i));
        if (hasAll) {
          return prev.filter((i) => !idsToSelect.includes(i));
        } else {
          return Array.from(new Set([...prev, ...idsToSelect]));
        }
      });
    } else {
      setSelectedComponentIds(idsToSelect);
    }
  };

  const selectAllComponents = () => {
    setSelectedComponentIds(activeScreen.components.map((c) => c.id));
  };

  const deselectAll = () => {
    setSelectedComponentIds([]);
  };

  const selectedComponent =
    activeScreen.components.find((c) => selectedComponentIds.includes(c.id)) || null;

  // Add Component to Canvas
  const addComponentToCanvas = (type: ComponentType, dropX?: number, dropY?: number) => {
    const maxZIndex = activeScreen.components.reduce((max, c) => Math.max(max, c.zIndex), 0);
    const defaultX = dropX ?? Math.floor((activeDevice.width - 280) / 2);
    const defaultY = dropY ?? Math.floor((activeDevice.height - 100) / 2);

    const newComp = createNewComponent(type, Math.max(10, defaultX), Math.max(10, defaultY), maxZIndex + 1);

    const updatedComponents = [...activeScreen.components, newComp];
    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, components: updatedComponents } : s
      ),
    };

    pushHistory(newProject);
    setSelectedComponentIds([newComp.id]);
    showToast(`Adicionado: ${newComp.name}`);
  };

  // Property Update
  const updateComponentProperties = (
    id: string,
    updates: Partial<CanvasComponent>,
    skipHistory = false
  ) => {
    let updatedComponents = activeScreen.components.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );

    // Apply auto layout if container properties or dimensions changed
    updatedComponents = recalculateAllAutoLayouts(updatedComponents);

    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, components: updatedComponents } : s
      ),
    };

    if (skipHistory) {
      setProject(newProject);
    } else {
      pushHistory(newProject);
    }
  };

  const updateSelectedComponents = (
    updates: Partial<CanvasComponent>,
    skipHistory = false
  ) => {
    if (selectedComponentIds.length === 0) return;

    let updatedComponents = activeScreen.components.map((c) =>
      selectedComponentIds.includes(c.id) ? { ...c, ...updates } : c
    );

    // Apply auto layout
    updatedComponents = recalculateAllAutoLayouts(updatedComponents);

    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, components: updatedComponents } : s
      ),
    };

    if (skipHistory) {
      setProject(newProject);
    } else {
      pushHistory(newProject);
    }
  };

  const deleteSelectedComponents = () => {
    if (selectedComponentIds.length === 0) return;

    const idsToDelete = getDescendantIds(selectedComponentIds, activeScreen.components);

    const updatedComponents = activeScreen.components.filter(
      (c) => !idsToDelete.includes(c.id)
    );

    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, components: updatedComponents } : s
      ),
    };

    pushHistory(newProject);
    setSelectedComponentIds([]);
    showToast(`${idsToDelete.length} componente(s) removido(s)`);
  };

  const duplicateSelectedComponents = () => {
    if (selectedComponentIds.length === 0) return;

    const allIdsToDuplicate = getDescendantIds(selectedComponentIds, activeScreen.components);
    const compsToDuplicate = activeScreen.components.filter((c) =>
      allIdsToDuplicate.includes(c.id)
    );

    const idMap = new Map<string, string>();
    compsToDuplicate.forEach((c) => {
      idMap.set(c.id, `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`);
    });

    const newDuplicates: CanvasComponent[] = compsToDuplicate.map((c) => {
      const isTopSelected = selectedComponentIds.includes(c.id);
      const newId = idMap.get(c.id)!;
      const newParentId = c.parentId && idMap.has(c.parentId) ? idMap.get(c.parentId) : c.parentId;

      return {
        ...c,
        id: newId,
        name: isTopSelected ? `${c.name} (Cópia)` : c.name,
        parentId: newParentId,
        x: isTopSelected ? c.x + 16 : c.x,
        y: isTopSelected ? c.y + 16 : c.y,
        zIndex: c.zIndex + 1,
      };
    });

    const updatedComponents = [...activeScreen.components, ...newDuplicates];
    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, components: updatedComponents } : s
      ),
    };

    pushHistory(newProject);
    const topLevelDuplicateIds = selectedComponentIds.map((id) => idMap.get(id)!);
    setSelectedComponentIds(topLevelDuplicateIds);
    showToast(`${newDuplicates.length} componente(s) duplicado(s)`);
  };

  const reparentComponent = (componentId: string, newParentId?: string) => {
    const compMap = new Map<string, CanvasComponent>();
    activeScreen.components.forEach((c) => compMap.set(c.id, c));

    const comp = compMap.get(componentId);
    if (!comp) return;

    if (newParentId && (newParentId === componentId || isAncestorOf(componentId, newParentId, compMap))) {
      showToast('Não é possível mover um container para dentro de si mesmo');
      return;
    }

    const oldAbs = getAbsolutePosition(componentId, compMap);

    let newX = oldAbs.x;
    let newY = oldAbs.y;

    if (newParentId) {
      const parentAbs = getAbsolutePosition(newParentId, compMap);
      newX = oldAbs.x - parentAbs.x;
      newY = oldAbs.y - parentAbs.y;
    }

    let updatedComponents = activeScreen.components.map((c) => {
      if (c.id === componentId) {
        return {
          ...c,
          parentId: newParentId,
          x: newX,
          y: newY,
        };
      }
      return c;
    });

    updatedComponents = recalculateAllAutoLayouts(updatedComponents);

    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, components: updatedComponents } : s
      ),
    };

    pushHistory(newProject);
  };

  const groupSelectedComponents = () => {
    if (selectedComponentIds.length < 1) {
      showToast('Selecione pelo menos 1 componente para criar um Container');
      return;
    }

    const compMap = new Map<string, CanvasComponent>();
    activeScreen.components.forEach((c) => compMap.set(c.id, c));

    // Calculate bounding box of absolute positions of selected components
    const selectedComps = activeScreen.components.filter((c) => selectedComponentIds.includes(c.id));
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedComps.forEach((c) => {
      const absPos = getAbsolutePosition(c.id, compMap);
      minX = Math.min(minX, absPos.x);
      minY = Math.min(minY, absPos.y);
      maxX = Math.max(maxX, absPos.x + c.width);
      maxY = Math.max(maxY, absPos.y + c.height);
    });

    const padding = 16;
    const containerX = Math.max(0, minX - padding);
    const containerY = Math.max(0, minY - padding);
    const containerW = Math.max(100, maxX - minX + padding * 2);
    const containerH = Math.max(80, maxY - minY + padding * 2);

    const newContainer = createNewComponent('container', containerX, containerY);
    newContainer.width = containerW;
    newContainer.height = containerH;
    newContainer.name = 'Container Grupo';

    // Reparent selected components to this container
    const updatedComponents = activeScreen.components.map((c) => {
      if (selectedComponentIds.includes(c.id)) {
        const absPos = getAbsolutePosition(c.id, compMap);
        return {
          ...c,
          parentId: newContainer.id,
          x: absPos.x - containerX,
          y: absPos.y - containerY,
        };
      }
      return c;
    });

    const finalComponents = [...updatedComponents, newContainer];

    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, components: finalComponents } : s
      ),
    };

    pushHistory(newProject);
    setSelectedComponentIds([newContainer.id]);
    showToast('Container criado e componentes agrupados');
  };

  const ungroupSelectedComponents = () => {
    if (selectedComponentIds.length === 0) return;

    const compMap = new Map<string, CanvasComponent>();
    activeScreen.components.forEach((c) => compMap.set(c.id, c));

    const selectedContainers = activeScreen.components.filter(
      (c) => selectedComponentIds.includes(c.id) && (c.type === 'container' || c.type === 'card' || c.groupId)
    );

    if (selectedContainers.length === 0) {
      // Fallback: clear groupId
      updateSelectedComponents({ groupId: undefined });
      showToast('Agrupamento desfeito');
      return;
    }

    const containerIdsToRemove = selectedContainers.map((c) => c.id);
    const formerChildIds: string[] = [];

    const updatedComponents = activeScreen.components
      .filter((c) => !containerIdsToRemove.includes(c.id))
      .map((c) => {
        if (c.parentId && containerIdsToRemove.includes(c.parentId)) {
          const parentComp = compMap.get(c.parentId);
          const parentParentId = parentComp?.parentId;
          const absPos = getAbsolutePosition(c.id, compMap);

          let newX = absPos.x;
          let newY = absPos.y;

          if (parentParentId) {
            const grandParentAbs = getAbsolutePosition(parentParentId, compMap);
            newX = absPos.x - grandParentAbs.x;
            newY = absPos.y - grandParentAbs.y;
          }

          formerChildIds.push(c.id);
          return {
            ...c,
            parentId: parentParentId,
            x: newX,
            y: newY,
          };
        }
        return c;
      });

    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, components: updatedComponents } : s
      ),
    };

    pushHistory(newProject);
    setSelectedComponentIds(formerChildIds);
    showToast('Container desagrupado');
  };

  const toggleLockComponent = (id: string) => {
    const comp = activeScreen.components.find((c) => c.id === id);
    if (comp) {
      updateComponentProperties(id, { locked: !comp.locked });
      showToast(comp.locked ? 'Componente desbloqueado' : 'Componente bloqueado');
    }
  };

  const toggleHideComponent = (id: string) => {
    const comp = activeScreen.components.find((c) => c.id === id);
    if (comp) {
      updateComponentProperties(id, { hidden: !comp.hidden });
    }
  };

  const changeComponentZIndex = (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const targetIds = id ? [id] : selectedComponentIds;
    if (targetIds.length === 0) return;

    // Sort components by zIndex descending (0 is top of stack)
    const sorted = [...activeScreen.components].sort((a, b) => b.zIndex - a.zIndex);

    let newSorted = [...sorted];

    if (direction === 'top') {
      const moving = newSorted.filter((c) => targetIds.includes(c.id));
      const rest = newSorted.filter((c) => !targetIds.includes(c.id));
      newSorted = [...moving, ...rest];
    } else if (direction === 'bottom') {
      const moving = newSorted.filter((c) => targetIds.includes(c.id));
      const rest = newSorted.filter((c) => !targetIds.includes(c.id));
      newSorted = [...rest, ...moving];
    } else if (direction === 'up') {
      for (let i = 1; i < newSorted.length; i++) {
        if (targetIds.includes(newSorted[i].id) && !targetIds.includes(newSorted[i - 1].id)) {
          const temp = newSorted[i];
          newSorted[i] = newSorted[i - 1];
          newSorted[i - 1] = temp;
        }
      }
    } else if (direction === 'down') {
      for (let i = newSorted.length - 2; i >= 0; i--) {
        if (targetIds.includes(newSorted[i].id) && !targetIds.includes(newSorted[i + 1].id)) {
          const temp = newSorted[i];
          newSorted[i] = newSorted[i + 1];
          newSorted[i + 1] = temp;
        }
      }
    }

    const total = newSorted.length;
    const updatedComponents = activeScreen.components.map((comp) => {
      const idx = newSorted.findIndex((c) => c.id === comp.id);
      return { ...comp, zIndex: total - 1 - idx };
    });

    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, components: updatedComponents } : s
      ),
    };
    pushHistory(newProject);
  };

  const reorderLayers = (sourceIndex: number, destinationIndex: number) => {
    const sorted = [...activeScreen.components].sort((a, b) => b.zIndex - a.zIndex);
    if (
      sourceIndex < 0 ||
      sourceIndex >= sorted.length ||
      destinationIndex < 0 ||
      destinationIndex >= sorted.length ||
      sourceIndex === destinationIndex
    ) {
      return;
    }

    const [moved] = sorted.splice(sourceIndex, 1);
    sorted.splice(destinationIndex, 0, moved);

    const total = sorted.length;
    const reorderedMap = new Map<string, number>();
    sorted.forEach((comp, idx) => {
      reorderedMap.set(comp.id, total - 1 - idx);
    });

    const updatedComponents = activeScreen.components.map((comp) => ({
      ...comp,
      zIndex: reorderedMap.get(comp.id) ?? comp.zIndex,
    }));

    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, components: updatedComponents } : s
      ),
    };
    pushHistory(newProject);
  };

  const nudgeSelectedComponents = (dx: number, dy: number) => {
    if (selectedComponentIds.length === 0) return;

    const updatedComponents = activeScreen.components.map((c) => {
      if (selectedComponentIds.includes(c.id) && !c.locked) {
        return { ...c, x: c.x + dx, y: c.y + dy };
      }
      return c;
    });

    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, components: updatedComponents } : s
      ),
    };
    pushHistory(newProject);
  };

  // Clipboard
  const copySelectedComponents = () => {
    const selected = activeScreen.components.filter((c) => selectedComponentIds.includes(c.id));
    if (selected.length > 0) {
      setClipboard(selected);
      showToast(`${selected.length} elemento(s) copiado(s)`);
    }
  };

  const cutSelectedComponents = () => {
    copySelectedComponents();
    deleteSelectedComponents();
  };

  const pasteComponents = () => {
    if (clipboard.length === 0) return;

    const pasted = clipboard.map((c) => ({
      ...c,
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: `${c.name} (Colado)`,
      x: c.x + 20,
      y: c.y + 20,
      zIndex: c.zIndex + 2,
    }));

    const updatedComponents = [...activeScreen.components, ...pasted];
    const newProject: Project = {
      ...project,
      screens: project.screens.map((s) =>
        s.id === activeScreen.id ? { ...s, components: updatedComponents } : s
      ),
    };

    pushHistory(newProject);
    setSelectedComponentIds(pasted.map((p) => p.id));
    showToast(`${pasted.length} elemento(s) colado(s)`);
  };

  // Canvas Viewport
  const setZoom = (z: number) => {
    const clamped = Math.min(8.0, Math.max(0.1, z));
    setZoomState(Math.round(clamped * 100) / 100);
  };

  const setPan = (x: number, y: number) => {
    setPanX(x);
    setPanY(y);
  };

  const resetCanvasView = () => {
    setZoomState(1);
    setPanX(0);
    setPanY(0);
  };

  const setDevice = (device: DevicePreset) => {
    const oldWidth = activeDevice.width;
    const oldHeight = activeDevice.height;
    const newWidth = device.width;
    const newHeight = device.height;

    const updatedScreens = project.screens.map((scr) => {
      const resizedComps = applyDeviceViewportResize(
        scr.components,
        oldWidth,
        oldHeight,
        newWidth,
        newHeight
      );
      return { ...scr, components: resizedComps };
    });

    const newProject: Project = {
      ...project,
      device,
      screens: updatedScreens,
    };
    pushHistory(newProject);
    showToast(`Dispositivo alterado: ${device.name}`);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Debug Console & Event Logger
  const addConsoleLog = useCallback((type: ConsoleLogType, message: string, source = 'UserCode') => {
    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type,
        message,
        timestamp: new Date().toLocaleTimeString(),
        source,
      },
    ]);
  }, []);

  const clearConsoleLogs = useCallback(() => {
    setConsoleLogs([]);
  }, []);

  const logEvent = useCallback((action: string, details: string) => {
    setEventLogs((prev) => [
      {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString(),
        action,
        details,
      },
      ...prev,
    ]);
  }, []);

  // Real-Time Bidirectional Code Sync Engine
  const updateFileContent = useCallback(
    (fileId: string, content: string) => {
      setCustomFileContents((prev) => ({
        ...prev,
        [fileId]: content,
      }));

      // If user edits project.json -> sync back to Visual Canvas state instantly
      if (fileId === 'project.json') {
        try {
          const parsed = JSON.parse(content);
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.screens)) {
            setProject(parsed);
            addConsoleLog('info', 'Sincronização bidirecional: Canvas atualizado a partir do project.json.', 'SyncEngine');
            logEvent('Code Sync', 'project.json compilado e refletido no Canvas.');
          }
        } catch (err: any) {
          addConsoleLog('error', `Erro de sintaxe no JSON: ${err.message}`, 'JSON Parser');
        }
      } else {
        addConsoleLog('log', `Arquivo "${fileId}" atualizado em tempo real.`, 'Editor');
        logEvent('File Edit', `Alteração de código salva em ${fileId}`);
      }
    },
    [addConsoleLog, logEvent]
  );

  const createFile = useCallback((filePath: string, content = '') => {
    setCustomFileContents((prev) => ({
      ...prev,
      [filePath]: content,
    }));
    setSelectedFileId(filePath);
    showToast(`Arquivo criado: ${filePath}`);
    logEvent('File Created', filePath);
  }, [showToast, logEvent]);

  const createFolder = useCallback((folderPath: string) => {
    const dummyFile = `${folderPath}/.keep`;
    setCustomFileContents((prev) => ({
      ...prev,
      [dummyFile]: '// Folder keeper',
    }));
    showToast(`Pasta criada: ${folderPath}`);
    logEvent('Folder Created', folderPath);
  }, [showToast, logEvent]);

  const deleteFileOrFolder = useCallback((path: string) => {
    setCustomFileContents((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k === path || k.startsWith(`${path}/`)) {
          delete next[k];
        }
      });
      return next;
    });
    if (selectedFileId === path) {
      setSelectedFileId('project.json');
    }
    showToast(`Item excluído: ${path}`);
    logEvent('Item Deleted', path);
  }, [selectedFileId, showToast, logEvent]);

  const renameFileOrFolder = useCallback((oldPath: string, newPath: string) => {
    setCustomFileContents((prev) => {
      const next: Record<string, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const val = String(v);
        if (k === oldPath) {
          next[newPath] = val;
        } else if (k.startsWith(`${oldPath}/`)) {
          const suffix = k.substring(oldPath.length);
          next[`${newPath}${suffix}`] = val;
        } else {
          next[k] = val;
        }
      });
      return next;
    });
    if (selectedFileId === oldPath) {
      setSelectedFileId(newPath);
    }
    showToast(`Renomeado para: ${newPath}`);
    logEvent('Renamed Path', `${oldPath} -> ${newPath}`);
  }, [selectedFileId, showToast, logEvent]);

  // Git Integration Engine
  const gitInit = useCallback(() => {
    setGitState({
      isInitialized: true,
      currentBranch: 'main',
      branches: ['main'],
      commits: [
        {
          id: `commit_${Date.now()}`,
          hash: Math.random().toString(16).substring(2, 9),
          message: 'Repositório Git inicializado',
          author: 'Desenvolvedor <dev@mobilestudio.io>',
          date: new Date().toLocaleString(),
          branch: 'main',
          projectSnapshot: project,
        },
      ],
    });
    showToast('Repositório Git Inicializado!');
    addConsoleLog('info', 'git init: repositório Git inicializado com sucesso.', 'Git');
  }, [project, showToast, addConsoleLog]);

  const gitCommit = useCallback((message: string) => {
    if (!message.trim()) return;
    const newCommit: GitCommit = {
      id: `commit_${Date.now()}`,
      hash: Math.random().toString(16).substring(2, 9),
      message: message.trim(),
      author: 'Desenvolvedor <dev@mobilestudio.io>',
      date: new Date().toLocaleString(),
      branch: gitState.currentBranch,
      projectSnapshot: JSON.parse(JSON.stringify(project)),
    };

    setGitState((prev) => ({
      ...prev,
      commits: [newCommit, ...prev.commits],
    }));

    showToast(`Commit realizado: ${newCommit.hash}`);
    addConsoleLog('info', `git commit -m "${message}": [${newCommit.hash}]`, 'Git');
    logEvent('Git Commit', `Commit ${newCommit.hash}: ${message}`);
  }, [gitState.currentBranch, project, showToast, addConsoleLog, logEvent]);

  const gitCreateBranch = useCallback((branchName: string) => {
    const sanitized = branchName.trim().replace(/\s+/g, '-').toLowerCase();
    if (!sanitized || gitState.branches.includes(sanitized)) return;

    setGitState((prev) => ({
      ...prev,
      branches: [...prev.branches, sanitized],
      currentBranch: sanitized,
    }));

    showToast(`Nova branch criada e ativada: ${sanitized}`);
    addConsoleLog('info', `git checkout -b ${sanitized}`, 'Git');
  }, [gitState.branches, showToast, addConsoleLog]);

  const gitSwitchBranch = useCallback((branchName: string) => {
    if (!gitState.branches.includes(branchName)) return;

    setGitState((prev) => ({
      ...prev,
      currentBranch: branchName,
    }));

    showToast(`Trocado para a branch: ${branchName}`);
    addConsoleLog('info', `git checkout ${branchName}`, 'Git');
  }, [gitState.branches, showToast, addConsoleLog]);

  const gitMerge = useCallback((branchName: string) => {
    if (branchName === gitState.currentBranch) return;

    gitCommit(`Merge branch '${branchName}' into ${gitState.currentBranch}`);
    showToast(`Branch '${branchName}' mesclada em '${gitState.currentBranch}'`);
    addConsoleLog('info', `git merge ${branchName}`, 'Git');
  }, [gitState.currentBranch, gitCommit, showToast, addConsoleLog]);

  const gitRevert = useCallback((commitHash: string) => {
    const commit = gitState.commits.find((c) => c.hash === commitHash);
    if (commit && commit.projectSnapshot) {
      setProject(commit.projectSnapshot);
      showToast(`Projeto revertido para commit [${commitHash}]`);
      addConsoleLog('warn', `git revert ${commitHash}: estado restaurado.`, 'Git');
      logEvent('Git Revert', `Projeto revertido para commit ${commitHash}`);
    }
  }, [gitState.commits, showToast, addConsoleLog, logEvent]);

  // Asset Management
  const addAsset = (asset: AssetFile) => {
    const newProject: Project = {
      ...project,
      assets: [asset, ...project.assets],
    };
    pushHistory(newProject);
    showToast(`Mídia adicionada: ${asset.name}`);
  };

  const deleteAsset = (id: string) => {
    const newProject: Project = {
      ...project,
      assets: project.assets.filter((a) => a.id !== id),
    };
    pushHistory(newProject);
    showToast(`Mídia excluída`);
  };

  // Templates
  const loadTemplateProject = (templateId: string) => {
    const found = TEMPLATE_PROJECTS.find((t) => t.id === templateId);
    if (found) {
      const freshProject: Project = {
        ...found.project,
        updatedAt: new Date().toISOString(),
      };
      setHistory([freshProject]);
      setHistoryIndex(0);
      setProject(freshProject);
      setSelectedComponentIds([]);
      showToast(`Template "${found.name}" carregado`);
    }
  };

  const resetProjectToBlank = () => {
    const newScreenId = `scr_main`;
    const blankProject: Project = {
      id: `proj_${Date.now()}`,
      name: 'Novo Aplicativo Mobile',
      version: '1.0.0',
      device: DEVICE_PRESETS[0],
      updatedAt: new Date().toISOString(),
      activeScreenId: newScreenId,
      assets: [],
      screens: [
        {
          id: newScreenId,
          name: 'Tela Inicial',
          backgroundColor: '#FFFFFF',
          isInitialScreen: true,
          components: [],
        },
      ],
    };

    setHistory([blankProject]);
    setHistoryIndex(0);
    setProject(blankProject);
    setSelectedComponentIds([]);
    showToast('Projeto limpo zerado');
  };

  const createNewProject = (name: string, deviceId: string = 'iphone') => {
    const device = DEVICE_PRESETS.find((d) => d.id === deviceId) || DEVICE_PRESETS[0];
    const newScreenId = `scr_main_${Date.now()}`;
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: name || 'Novo App Mobile',
      version: '1.0.0',
      device,
      updatedAt: new Date().toISOString(),
      activeScreenId: newScreenId,
      assets: [],
      screens: [
        {
          id: newScreenId,
          name: 'Tela Inicial',
          backgroundColor: '#FFFFFF',
          isInitialScreen: true,
          components: [],
        },
      ],
    };
    setHistory([newProject]);
    setHistoryIndex(0);
    setProject(newProject);
    setSelectedComponentIds([]);
    showToast(`Novo projeto "${newProject.name}" criado`);
  };

  const importProjectJson = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.screens)) {
        const imported: Project = {
          ...parsed,
          updatedAt: new Date().toISOString(),
        };
        setHistory([imported]);
        setHistoryIndex(0);
        setProject(imported);
        setSelectedComponentIds([]);
        showToast(`Projeto importado: "${imported.name}"`);
      } else {
        showToast('JSON inválido: formato de projeto não reconhecido');
      }
    } catch (e) {
      showToast('Erro ao importar JSON: verifique o formato do arquivo');
    }
  };

  const deleteCurrentProject = () => {
    const confirmed = window.confirm('Tem certeza que deseja excluir o projeto atual? Esta ação não pode ser desfeita.');
    if (!confirmed) return;
    try {
      localStorage.removeItem('aistudio_mobile_builder_project_v1');
    } catch {
      // Ignore
    }
    resetProjectToBlank();
    showToast('Projeto excluído');
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when focused in text inputs
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelectedComponents();
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        cutSelectedComponents();
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteComponents();
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelectedComponents();
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAllComponents();
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) ungroupSelectedComponents();
        else groupSelectedComponents();
        return;
      }

      // Layer Order Shortcuts
      if (e.key === ']') {
        e.preventDefault();
        changeComponentZIndex('', e.shiftKey ? 'top' : 'up');
        return;
      }

      if (e.key === '[') {
        e.preventDefault();
        changeComponentZIndex('', e.shiftKey ? 'bottom' : 'down');
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedComponents();
        return;
      }

      if (e.key === 'Escape') {
        if (isolatedComponentId) {
          exitIsolationMode();
          return;
        }
        if (selectedComponentIds.length === 1) {
          const curr = activeScreen.components.find((c) => c.id === selectedComponentIds[0]);
          if (curr && curr.parentId) {
            setSelectedComponentIds([curr.parentId]);
            return;
          }
        }
        deselectAll();
        return;
      }

      // F2 Shortcut - Rename Selected Component
      if (e.key === 'F2' && selectedComponentIds.length === 1) {
        e.preventDefault();
        const comp = activeScreen.components.find((c) => c.id === selectedComponentIds[0]);
        if (comp) {
          const newName = window.prompt('Renomear componente:', comp.name);
          if (newName && newName.trim()) {
            updateSelectedComponents({ name: newName.trim() });
          }
        }
        return;
      }

      // Arrow Keys Nudging
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        nudgeSelectedComponents(dx, dy);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    copySelectedComponents,
    cutSelectedComponents,
    pasteComponents,
    duplicateSelectedComponents,
    deleteSelectedComponents,
    selectAllComponents,
    groupSelectedComponents,
    ungroupSelectedComponents,
    deselectAll,
    nudgeSelectedComponents,
  ]);

  return (
    <EditorContext.Provider
      value={{
        project,
        activeScreen,
        setActiveScreenId,
        addScreen,
        duplicateScreen,
        renameScreen,
        deleteScreen,
        setScreenBackgroundColor,
        setInitialScreen,

        selectedComponentIds,
        selectedComponent,
        selectComponent,
        selectAllComponents,
        deselectAll,
        updateComponentProperties,
        updateSelectedComponents,
        commitHistory,
        addComponentToCanvas,
        deleteSelectedComponents,
        duplicateSelectedComponents,
        groupSelectedComponents,
        ungroupSelectedComponents,
        toggleLockComponent,
        toggleHideComponent,
        changeComponentZIndex,
        reorderLayers,
        reparentComponent,
        nudgeSelectedComponents,

        masterComponents,
        masterCategories,
        saveAsMasterComponent,
        instantiateMasterComponent,
        updateMasterComponent,
        unlinkInstance,
        deleteMasterComponent,
        toggleFavoriteMasterComponent,
        duplicateMasterComponent,
        exportMasterComponentsJson,
        importMasterComponentsJson,
        createMasterCategory,
        pendingSyncMaster,
        setPendingSyncMaster,

        isolatedComponentId,
        enterIsolationMode,
        exitIsolationMode,
        isolationBreadcrumbs,

        copySelectedComponents,
        cutSelectedComponents,
        pasteComponents,
        undo,
        redo,
        canUndo,
        canRedo,

        zoom,
        setZoom,
        panX,
        panY,
        setPan,
        resetCanvasView,
        showGrid,
        setShowGrid,
        showRulers,
        setShowRulers,
        showGuides,
        setShowGuides,
        snapToGrid,
        setSnapToGrid,
        gridSize,
        device: activeDevice,
        setDevice,

        mode,
        setMode,
        devMode,
        setDevMode,
        theme,
        toggleTheme,

        selectedFileId,
        setSelectedFileId,
        customFileContents,
        updateFileContent,
        createFile,
        createFolder,
        deleteFileOrFolder,
        renameFileOrFolder,

        consoleLogs,
        addConsoleLog,
        clearConsoleLogs,
        eventLogs,
        logEvent,
        activeBottomPanelTab,
        setActiveBottomPanelTab,

        gitState,
        gitInit,
        gitCommit,
        gitCreateBranch,
        gitSwitchBranch,
        gitMerge,
        gitRevert,

        isExportModalOpen,
        setIsExportModalOpen,
        isWelcomeModalOpen,
        setIsWelcomeModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isShortcutsModalOpen,
        setIsShortcutsModalOpen,
        isIconPickerOpen,
        setIsIconPickerOpen,
        isFeedbackModalOpen,
        setIsFeedbackModalOpen,
        isWebsitePortalOpen,
        setIsWebsitePortalOpen,
        isDocumentationOpen,
        setIsDocumentationOpen,
        documentationArticleId,
        setDocumentationArticleId,
        activeToast,
        showToast,

        addAsset,
        deleteAsset,

        loadTemplateProject,
        resetProjectToBlank,
        createNewProject,
        importProjectJson,
        deleteCurrentProject,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
