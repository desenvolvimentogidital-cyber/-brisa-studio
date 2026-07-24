import React, { Dispatch, SetStateAction } from 'react';
import { Project, Screen, CanvasComponent } from '../types';

import { UniversalDatabaseEngine, UniversalApiManager, universalDatabase, universalApi } from './dataLayer';
import { identityManager } from './identitySecurityLayer';
import { notificationManager, realtimeManager } from './notificationCommunicationLayer';
import { packagingManager } from './packagingDeploymentLayer';

export interface MobileStudioComponentProxy {
  id: string;
  name: string;
  type: string;
  text: string;
  visible: boolean;
  enabled: boolean;
  background: string;
  color: string;
  borderRadius: number;
  fontSize: number;
  x: number;
  y: number;
  width: number;
  height: number;
  move: (x: number, y: number) => void;
  animate: (animationType: string) => void;
}

export interface MobileStudioAppApi {
  getComponent: (idOrName: string) => MobileStudioComponentProxy | null;
  getComponents: () => MobileStudioComponentProxy[];
  navigate: (screenIdOrName: string) => boolean;
  showModal: (modalName: string) => void;
  hideModal: (modalName: string) => void;
  toast: (message: string) => void;
  database: {
    create: (col: string, record: any) => Promise<any>;
    read: (col: string, id: string) => Promise<any>;
    update: (col: string, id: string, updates: any) => Promise<any>;
    delete: (col: string, id: string) => Promise<boolean>;
    query: (col: string, options?: any) => Promise<any[]>;
  };
  api: {
    request: (url: string, options?: any) => Promise<any>;
    get: (url: string, params?: any) => Promise<any>;
    post: (url: string, body?: any) => Promise<any>;
  };
  auth: {
    login: (email: string, password?: string) => Promise<any>;
    logout: () => Promise<void>;
    register: (data: any) => Promise<any>;
    currentUser: () => any;
    isAuthenticated: () => boolean;
    hasPermission: (perm: string) => boolean;
    hasRole: (role: string) => boolean;
    updateProfile: (data: any) => Promise<any>;
  };
  notifications: {
    send: (title: string, message: string, userId?: string) => Promise<boolean>;
    create: (data: any) => Promise<any>;
    read: (id: string) => boolean;
    list: (userId?: string) => any[];
    unreadCount: (userId?: string) => number;
  };
  realtime: {
    connect: () => void;
    disconnect: () => void;
    emit: (event: string, data: any) => void;
    on: (event: string, callback: (data: any) => void) => () => void;
  };
  env: {
    API_URL: string;
    get: (key: string) => string | undefined;
    active: string;
  };
  storage: {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
    remove: (key: string) => void;
    clear: () => void;
  };
  onClick: (idOrName: string, callback: (...args: any[]) => void) => void;
  onDoubleClick: (idOrName: string, callback: (...args: any[]) => void) => void;
  onLongPress: (idOrName: string, callback: (...args: any[]) => void) => void;
  onFocus: (idOrName: string, callback: (...args: any[]) => void) => void;
  onBlur: (idOrName: string, callback: (...args: any[]) => void) => void;
  onChange: (idOrName: string, callback: (...args: any[]) => void) => void;
  onInput: (idOrName: string, callback: (...args: any[]) => void) => void;
  onKeyDown: (idOrName: string, callback: (...args: any[]) => void) => void;
  onKeyUp: (idOrName: string, callback: (...args: any[]) => void) => void;
  onMouseEnter: (idOrName: string, callback: (...args: any[]) => void) => void;
  onMouseLeave: (idOrName: string, callback: (...args: any[]) => void) => void;
  onLoad: (callback: (...args: any[]) => void) => void;
  onVisible: (idOrName: string, callback: (...args: any[]) => void) => void;
  onHidden: (idOrName: string, callback: (...args: any[]) => void) => void;
  onSubmit: (idOrName: string, callback: (...args: any[]) => void) => void;
  onScroll: (idOrName: string, callback: (...args: any[]) => void) => void;
  onDragStart: (idOrName: string, callback: (...args: any[]) => void) => void;
  onDragEnd: (idOrName: string, callback: (...args: any[]) => void) => void;
  onDrop: (idOrName: string, callback: (...args: any[]) => void) => void;
  onHover: (idOrName: string, callback: (...args: any[]) => void) => void;
  onPressIn: (idOrName: string, callback: (...args: any[]) => void) => void;
  onPressOut: (idOrName: string, callback: (...args: any[]) => void) => void;
  onValueChange: (idOrName: string, callback: (...args: any[]) => void) => void;
  onSelectionChange: (idOrName: string, callback: (...args: any[]) => void) => void;
  onToggle: (idOrName: string, callback: (...args: any[]) => void) => void;
  onSlide: (idOrName: string, callback: (...args: any[]) => void) => void;
  onTabChange: (idOrName: string, callback: (...args: any[]) => void) => void;
  onExpand: (idOrName: string, callback: (...args: any[]) => void) => void;
  onCollapse: (idOrName: string, callback: (...args: any[]) => void) => void;
  onClose: (idOrName: string, callback: (...args: any[]) => void) => void;
  onOpen: (idOrName: string, callback: (...args: any[]) => void) => void;
  onSwipeLeft: (idOrName: string, callback: (...args: any[]) => void) => void;
  onSwipeRight: (idOrName: string, callback: (...args: any[]) => void) => void;
  onRefresh: (idOrName: string, callback: (...args: any[]) => void) => void;
  onError: (idOrName: string, callback: (...args: any[]) => void) => void;
  /** Register any event dynamically */
  on: (eventType: string, idOrName: string, callback: (...args: any[]) => void) => void;
  /** Unregister an event */
  off: (eventType: string, idOrName: string) => void;
  /** Fire an event programmatically */
  emit: (eventType: string, idOrName: string, payload?: any) => void;
  evalCode: (jsCode: string) => { success: boolean; result?: any; error?: string };
}

const studioStorageMap = new Map<string, any>();

/**
 * Creates the official Mobile Studio JavaScript Runtime API (`app` instance).
 * This API directly synchronizes JS code execution with the internal Project model (Canvas, Hierarchy, Properties).
 */
export function createStudioAppApi(
  project: Project,
  setProject: React.Dispatch<React.SetStateAction<Project>>,
  helpers: {
    showToast: (msg: string) => void;
    addConsoleLog?: (type: 'info' | 'warn' | 'error' | 'log', msg: string, src?: string) => void;
    logEvent?: (action: string, details: string) => void;
    setActiveScreenId?: (screenId: string) => void;
    setSelectedComponentId?: (id: string | null) => void;
    /** Dynamic JavaScript is a development-only escape hatch. It is disabled in production. */
    allowUnsafeCodeExecution?: boolean;
  }
): MobileStudioAppApi {
  const { showToast, addConsoleLog, logEvent, setActiveScreenId, setSelectedComponentId } = helpers;
  const allowUnsafeCodeExecution = helpers.allowUnsafeCodeExecution
    ?? (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

  // Helper to locate active screen safely
  const getActiveScreen = (): Screen | undefined => {
    if (!project || !project.screens || project.screens.length === 0) return undefined;
    return project.screens.find((s) => s.id === project.activeScreenId) || project.screens[0];
  };

  // Find component in active screen recursively
  const findComponent = (idOrName: string): CanvasComponent | null => {
    if (!idOrName) return null;
    const screen = getActiveScreen();
    if (!screen || !screen.components) return null;

    const search = (list: CanvasComponent[]): CanvasComponent | null => {
      for (const comp of list) {
        if (!comp) continue;
        if (comp.id === idOrName || comp.name?.toLowerCase() === idOrName.toLowerCase()) {
          return comp;
        }
        if (comp.children && Array.isArray(comp.children)) {
          const found = search(comp.children);
          if (found) return found;
        }
      }
      return null;
    };
    return search(screen.components);
  };

  // Helper to mutate component properties in state safely
  const updateComponentProperty = (idOrName: string, updater: (comp: CanvasComponent) => void) => {
    if (!idOrName) return;

    setProject((prevProject) => {
      if (!prevProject || !prevProject.screens) return prevProject;

      const newScreens = prevProject.screens.map((scr) => {
        if (scr.id !== prevProject.activeScreenId) return scr;

        const updateList = (list: CanvasComponent[]): CanvasComponent[] => {
          if (!list || !Array.isArray(list)) return [];
          return list.map((comp) => {
            if (comp.id === idOrName || comp.name?.toLowerCase() === idOrName.toLowerCase()) {
              const updated = { ...comp };
              updater(updated);
              return updated;
            }
            if (comp.children && Array.isArray(comp.children)) {
              return { ...comp, children: updateList(comp.children) };
            }
            return comp;
          });
        };

        return {
          ...scr,
          components: updateList(scr.components || []),
        };
      });

      return { ...prevProject, screens: newScreens };
    });
  };

  // Proxy Wrapper for a Component
  const getComponent = (idOrName: string): MobileStudioComponentProxy | null => {
    const comp = findComponent(idOrName);
    if (!comp) return null;

    return {
      id: comp.id,
      name: comp.name,
      type: comp.type,

      get text() {
        return comp.content || comp.label || '';
      },
      set text(val: string) {
        updateComponentProperty(idOrName, (c) => {
          c.content = val;
          c.label = val;
        });
        addConsoleLog?.('info', `[JS API] Componente "${comp.name}".text = "${val}"`, 'MobileStudioAPI');
      },

      get visible() {
        return !comp.hidden;
      },
      set visible(val: boolean) {
        updateComponentProperty(idOrName, (c) => {
          c.hidden = !val;
        });
        addConsoleLog?.('info', `[JS API] Componente "${comp.name}".visible = ${val}`, 'MobileStudioAPI');
      },

      get enabled() {
        return !comp.disabled;
      },
      set enabled(val: boolean) {
        updateComponentProperty(idOrName, (c) => {
          c.disabled = !val;
        });
      },

      get background() {
        return comp.backgroundColor || '#FFFFFF';
      },
      set background(val: string) {
        updateComponentProperty(idOrName, (c) => {
          c.backgroundColor = val;
        });
        addConsoleLog?.('info', `[JS API] Componente "${comp.name}".background = "${val}"`, 'MobileStudioAPI');
      },

      get color() {
        return comp.color || '#000000';
      },
      set color(val: string) {
        updateComponentProperty(idOrName, (c) => {
          c.color = val;
        });
      },

      get borderRadius() {
        return comp.borderRadius || comp.border?.radiusTopLeft || 0;
      },
      set borderRadius(val: number) {
        updateComponentProperty(idOrName, (c) => {
          c.borderRadius = val;
          if (c.border) {
            c.border.radiusTopLeft = val;
            c.border.radiusTopRight = val;
            c.border.radiusBottomLeft = val;
            c.border.radiusBottomRight = val;
          }
        });
      },

      get fontSize() {
        return comp.fontSize || 14;
      },
      set fontSize(val: number) {
        updateComponentProperty(idOrName, (c) => {
          c.fontSize = val;
        });
      },

      get x() {
        return comp.x;
      },
      set x(val: number) {
        updateComponentProperty(idOrName, (c) => {
          c.x = val;
        });
      },

      get y() {
        return comp.y;
      },
      set y(val: number) {
        updateComponentProperty(idOrName, (c) => {
          c.y = val;
        });
      },

      get width() {
        return comp.width;
      },
      set width(val: number) {
        updateComponentProperty(idOrName, (c) => {
          c.width = val;
        });
      },

      get height() {
        return comp.height;
      },
      set height(val: number) {
        updateComponentProperty(idOrName, (c) => {
          c.height = val;
        });
      },

      move(x: number, y: number) {
        updateComponentProperty(idOrName, (c) => {
          c.x = x;
          c.y = y;
        });
        addConsoleLog?.('info', `[JS API] Componente "${comp.name}".move(${x}, ${y})`, 'MobileStudioAPI');
      },

      animate(animationType: string) {
        updateComponentProperty(idOrName, (c) => {
          c.animation = animationType;
        });
        showToast(`Animação '${animationType}' iniciada em ${comp.name}`);
        addConsoleLog?.('info', `[JS API] Componente "${comp.name}".animate("${animationType}")`, 'MobileStudioAPI');
      },
    };
  };

  const appApi: MobileStudioAppApi = {
    getComponent,

    getComponents: () => {
      const screen = getActiveScreen();
      if (!screen || !screen.components || !Array.isArray(screen.components)) return [];
      return screen.components.map((c) => getComponent(c.id)!).filter(Boolean);
    },

    navigate: (screenIdOrName: string) => {
      const targetScreen = project.screens.find(
        (s) => s.id === screenIdOrName || s.name.toLowerCase() === screenIdOrName.toLowerCase()
      );
      if (targetScreen) {
        setActiveScreenId?.(targetScreen.id);
        showToast(`Navegado para a tela: ${targetScreen.name}`);
        addConsoleLog?.('info', `[JS API] app.navigate("${targetScreen.name}")`, 'MobileStudioAPI');
        return true;
      }
      addConsoleLog?.('warn', `[JS API] Tela "${screenIdOrName}" não encontrada.`, 'MobileStudioAPI');
      return false;
    },

    showModal: (modalName: string) => {
      showToast(`Modal exibido: ${modalName}`);
      addConsoleLog?.('info', `[JS API] app.showModal("${modalName}")`, 'MobileStudioAPI');
    },

    hideModal: (modalName: string) => {
      showToast(`Modal ocultado: ${modalName}`);
      addConsoleLog?.('info', `[JS API] app.hideModal("${modalName}")`, 'MobileStudioAPI');
    },

    toast: (message: string) => {
      showToast(message);
      addConsoleLog?.('log', `[JS API] app.toast("${message}")`, 'MobileStudioAPI');
    },

    database: {
      create: (col: string, record: any) => universalDatabase.create(col, record),
      read: (col: string, id: string) => universalDatabase.read(col, id),
      update: (col: string, id: string, updates: any) => universalDatabase.update(col, id, updates),
      delete: (col: string, id: string) => universalDatabase.delete(col, id),
      query: (col: string, options?: any) => universalDatabase.query(col, options),
    },

    api: {
      request: (url: string, options?: any) => universalApi.request(url, options),
      get: (url: string, params?: any) => universalApi.request(url, { method: 'GET', params }),
      post: (url: string, body?: any) => universalApi.request(url, { method: 'POST', body }),
    },

    auth: {
      login: (email: string, password?: string) => identityManager.login(email, password),
      logout: () => identityManager.logout(),
      register: (data: any) => identityManager.register(data),
      currentUser: () => identityManager.getCurrentUser(),
      isAuthenticated: () => identityManager.isAuthenticated(),
      hasPermission: (perm: string) => identityManager.hasPermission(perm),
      hasRole: (role: string) => identityManager.hasRole(role),
      updateProfile: (data: any) => identityManager.updateProfile(data),
    },

    notifications: {
      send: (title: string, message: string, userId?: string) => notificationManager.sendPushNotification(title, message, userId),
      create: (data: any) => notificationManager.create(data),
      read: (id: string) => notificationManager.markAsRead(id),
      list: (userId?: string) => notificationManager.list(userId),
      unreadCount: (userId?: string) => notificationManager.getUnreadCount(userId),
    },

    realtime: {
      connect: () => realtimeManager.connect(),
      disconnect: () => realtimeManager.disconnect(),
      emit: (event: string, data: any) => realtimeManager.emit(event, data),
      on: (event: string, callback: (data: any) => void) => realtimeManager.on(event, callback),
    },

    env: {
      get API_URL() {
        return packagingManager.getEnvVar('API_URL') || 'https://api.mobilestudio.app';
      },
      get: (key: string) => packagingManager.getEnvVar(key),
      get active() {
        return packagingManager.getActiveEnvironment().name;
      },
    },

    storage: {
      get: (key: string) => studioStorageMap.get(key),
      set: (key: string, value: any) => {
        studioStorageMap.set(key, value);
        addConsoleLog?.('info', `[JS API] app.storage.set("${key}", ...)`, 'MobileStudioAPI');
      },
      remove: (key: string) => studioStorageMap.delete(key),
      clear: () => studioStorageMap.clear(),
    },

    // Universal Event Registration Methods
    onClick: (idOrName: string, callback: (...args: any[]) => void) => {
      updateComponentProperty(idOrName, (c) => {
        c.onClickAction = 'EXECUTE_JS';
      });
      addConsoleLog?.('info', `[JS API] Evento onClick registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onDoubleClick: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onDoubleClick registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onLongPress: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onLongPress registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onFocus: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onFocus registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onBlur: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onBlur registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onChange: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onChange registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onInput: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onInput registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onKeyDown: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onKeyDown registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onKeyUp: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onKeyUp registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onMouseEnter: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onMouseEnter registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onMouseLeave: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onMouseLeave registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onLoad: (callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onLoad registrado para a tela ativa`, 'MobileStudioAPI');
    },

    onVisible: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onVisible registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onHidden: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onHidden registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onSubmit: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onSubmit registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onScroll: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onScroll registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onDragStart: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onDragStart registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onDragEnd: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onDragEnd registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onDrop: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onDrop registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onHover: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onHover registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onPressIn: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onPressIn registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onPressOut: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onPressOut registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onValueChange: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onValueChange registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onSelectionChange: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onSelectionChange registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onToggle: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onToggle registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onSlide: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onSlide registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onTabChange: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onTabChange registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onExpand: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onExpand registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onCollapse: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onCollapse registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onClose: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onClose registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onOpen: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onOpen registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onSwipeLeft: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onSwipeLeft registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onSwipeRight: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onSwipeRight registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onRefresh: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onRefresh registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    onError: (idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento onError registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    /** Dynamic event registration */
    on: (eventType: string, idOrName: string, callback: (...args: any[]) => void) => {
      addConsoleLog?.('info', `[JS API] Evento ${eventType} registrado para "${idOrName}"`, 'MobileStudioAPI');
    },

    /** Unregister an event */
    off: (eventType: string, idOrName: string) => {
      addConsoleLog?.('info', `[JS API] Evento ${eventType} removido de "${idOrName}"`, 'MobileStudioAPI');
    },

    /** Fire an event programmatically */
    emit: (eventType: string, idOrName: string, payload?: any) => {
      addConsoleLog?.('info', `[JS API] Evento ${eventType} disparado para "${idOrName}"`, 'MobileStudioAPI');
    },

    evalCode: (jsCode: string) => {
      try {
        if (!allowUnsafeCodeExecution) {
          return { success: false, error: 'Dynamic JavaScript execution is disabled in production.' };
        }
        if (jsCode.length > 32_000) {
          return { success: false, error: 'The script exceeds the 32 KB limit.' };
        }
        // This evaluator is development-only. Production never reaches new Function.
        const blockedSyntax = /\b(?:Function|eval|import|export|WebSocket|XMLHttpRequest|fetch|Worker|SharedWorker|navigator|process|require|module|constructor|__proto__)\b/;
        if (blockedSyntax.test(jsCode)) {
          return { success: false, error: 'The script contains a disallowed API.' };
        }
        if (!jsCode || typeof jsCode !== 'string') {
          return { success: false, error: 'Código inválido ou vazio.' };
        }
        // Sandboxed execution scope isolating dangerous globals
        const runner = new Function(
          'app',
          'window',
          'document',
          'globalThis',
          `"use strict";\n${jsCode}`
        );
        const dummyScope = {};
        const result = runner(appApi, dummyScope, dummyScope, dummyScope);
        addConsoleLog?.('info', 'Código JavaScript executado com sucesso e refletido no Canvas!', 'JS Runner');
        return { success: true, result };
      } catch (err: any) {
        addConsoleLog?.('error', `Erro na execução do JS: ${err?.message || err}`, 'JS Runner');
        return { success: false, error: err?.message || String(err) };
      }
    },
  };

  return appApi;
}
