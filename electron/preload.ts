// ==========================================
// Mobile Studio - Electron Preload Script
// ==========================================
// Bridges secure IPC between main process and renderer.
// NO nodeIntegration - uses contextBridge only.

import { contextBridge, ipcRenderer } from 'electron';

// Whitelist of allowed IPC channels
const ALLOWED_CHANNELS = [
  'menu:new-project', 'menu:open-project', 'menu:save', 'menu:save-as',
  'menu:undo', 'menu:redo', 'menu:duplicate', 'menu:delete',
  'menu:toggle-theme', 'menu:zoom-in', 'menu:zoom-out', 'menu:zoom-reset',
  'menu:command-palette', 'menu:toggle-console', 'menu:event-inspector',
  'menu:nocode-builder', 'menu:check-updates', 'menu:documentation',
  'menu:shortcuts', 'menu:feedback', 'menu:project-properties',
  'menu:manage-screens', 'menu:add-screen', 'menu:duplicate-screen',
  'mode:visual', 'mode:code', 'mode:hybrid',
  'export:flutter', 'export:react-native', 'export:html', 'export:json',
];

// Expose a secure desktop API to the renderer
contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  arch: process.arch,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },

  // Menu events from main process
  onMenuEvent: (callback: (channel: string, ...args: any[]) => void) => {
    const handlers = new Map<string, (...args: any[]) => void>();

    ALLOWED_CHANNELS.forEach((channel) => {
      const handler = (_event: any, ...args: any[]) => callback(channel, ...args);
      ipcRenderer.on(channel, handler);
      handlers.set(channel, handler);
    });

    return () => {
      handlers.forEach((handler, channel) => {
        ipcRenderer.removeListener(channel, handler);
      });
    };
  },

  // Dialog API
  dialog: {
    openFile: (options?: any) => ipcRenderer.invoke('dialog:open-file', options || {}),
    saveFile: (options?: any) => ipcRenderer.invoke('dialog:save-file', options || {}),
    showMessage: (options: any) => ipcRenderer.invoke('dialog:message', options),
    confirm: (message: string) => ipcRenderer.invoke('dialog:confirm', message),
  },

  // File System API
  files: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:read-file', filePath),
    writeFile: (filePath: string, data: string) => ipcRenderer.invoke('fs:write-file', filePath, data),
    exists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
    delete: (filePath: string) => ipcRenderer.invoke('fs:delete', filePath),
    readDir: (dirPath: string) => ipcRenderer.invoke('fs:readdir', dirPath),
  },

  // Shell API
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),
    showItemInFolder: (filePath: string) => ipcRenderer.invoke('shell:show-item', filePath),
  },

  // Clipboard API
  clipboard: {
    readText: () => ipcRenderer.invoke('clipboard:read-text'),
    writeText: (text: string) => ipcRenderer.invoke('clipboard:write-text', text),
  },

  // Window API
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
    setTitle: (title: string) => ipcRenderer.invoke('window:set-title', title),
  },

  // System API
  system: {
    platform: () => ipcRenderer.invoke('system:platform'),
    arch: () => ipcRenderer.invoke('system:arch'),
    version: () => ipcRenderer.invoke('system:version'),
    userDataPath: () => ipcRenderer.invoke('system:user-data-path'),
    homeDir: () => ipcRenderer.invoke('system:home-dir'),
    documentsDir: () => ipcRenderer.invoke('system:documents-dir'),
    desktopDir: () => ipcRenderer.invoke('system:desktop-dir'),
    tempDir: () => ipcRenderer.invoke('system:temp-dir'),
  },

  // Auto Save & Recovery
  autoSave: {
    save: (data: string) => ipcRenderer.invoke('auto-save:set', '', data),
    recover: () => ipcRenderer.invoke('auto-save:recover'),
    clear: () => ipcRenderer.invoke('auto-save:clear'),
  },

  // Recent Documents
  recent: {
    add: (filePath: string) => ipcRenderer.invoke('recent:add', filePath),
    clear: () => ipcRenderer.invoke('recent:clear'),
  },

  // Theme
  theme: {
    isDark: () => ipcRenderer.invoke('theme:is-dark'),
    getSource: () => ipcRenderer.invoke('theme:get-source'),
    setSource: (source: 'system' | 'light' | 'dark') => ipcRenderer.invoke('theme:set-source', source),
  },
});