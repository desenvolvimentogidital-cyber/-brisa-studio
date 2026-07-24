"use strict";
// ==========================================
// Mobile Studio - Electron Preload Script
// ==========================================
// Bridges secure IPC between main process and renderer.
// NO nodeIntegration - uses contextBridge only.
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
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
electron_1.contextBridge.exposeInMainWorld('desktop', {
    platform: process.platform,
    arch: process.arch,
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron,
    },
    // Menu events from main process
    onMenuEvent: (callback) => {
        const handlers = new Map();
        ALLOWED_CHANNELS.forEach((channel) => {
            const handler = (_event, ...args) => callback(channel, ...args);
            electron_1.ipcRenderer.on(channel, handler);
            handlers.set(channel, handler);
        });
        return () => {
            handlers.forEach((handler, channel) => {
                electron_1.ipcRenderer.removeListener(channel, handler);
            });
        };
    },
    // Dialog API
    dialog: {
        openFile: (options) => electron_1.ipcRenderer.invoke('dialog:open-file', options || {}),
        saveFile: (options) => electron_1.ipcRenderer.invoke('dialog:save-file', options || {}),
        showMessage: (options) => electron_1.ipcRenderer.invoke('dialog:message', options),
        confirm: (message) => electron_1.ipcRenderer.invoke('dialog:confirm', message),
    },
    // File System API
    files: {
        readFile: (filePath) => electron_1.ipcRenderer.invoke('fs:read-file', filePath),
        writeFile: (filePath, data) => electron_1.ipcRenderer.invoke('fs:write-file', filePath, data),
        exists: (filePath) => electron_1.ipcRenderer.invoke('fs:exists', filePath),
        delete: (filePath) => electron_1.ipcRenderer.invoke('fs:delete', filePath),
        readDir: (dirPath) => electron_1.ipcRenderer.invoke('fs:readdir', dirPath),
    },
    // Shell API
    shell: {
        openExternal: (url) => electron_1.ipcRenderer.invoke('shell:open-external', url),
        showItemInFolder: (filePath) => electron_1.ipcRenderer.invoke('shell:show-item', filePath),
    },
    // Clipboard API
    clipboard: {
        readText: () => electron_1.ipcRenderer.invoke('clipboard:read-text'),
        writeText: (text) => electron_1.ipcRenderer.invoke('clipboard:write-text', text),
    },
    // Window API
    window: {
        minimize: () => electron_1.ipcRenderer.invoke('window:minimize'),
        maximize: () => electron_1.ipcRenderer.invoke('window:maximize'),
        close: () => electron_1.ipcRenderer.invoke('window:close'),
        isMaximized: () => electron_1.ipcRenderer.invoke('window:is-maximized'),
        setTitle: (title) => electron_1.ipcRenderer.invoke('window:set-title', title),
    },
    // System API
    system: {
        platform: () => electron_1.ipcRenderer.invoke('system:platform'),
        arch: () => electron_1.ipcRenderer.invoke('system:arch'),
        version: () => electron_1.ipcRenderer.invoke('system:version'),
        userDataPath: () => electron_1.ipcRenderer.invoke('system:user-data-path'),
        homeDir: () => electron_1.ipcRenderer.invoke('system:home-dir'),
        documentsDir: () => electron_1.ipcRenderer.invoke('system:documents-dir'),
        desktopDir: () => electron_1.ipcRenderer.invoke('system:desktop-dir'),
        tempDir: () => electron_1.ipcRenderer.invoke('system:temp-dir'),
    },
    // Auto Save & Recovery
    autoSave: {
        save: (data) => electron_1.ipcRenderer.invoke('auto-save:set', '', data),
        recover: () => electron_1.ipcRenderer.invoke('auto-save:recover'),
        clear: () => electron_1.ipcRenderer.invoke('auto-save:clear'),
    },
    // Recent Documents
    recent: {
        add: (filePath) => electron_1.ipcRenderer.invoke('recent:add', filePath),
        clear: () => electron_1.ipcRenderer.invoke('recent:clear'),
    },
    // Theme
    theme: {
        isDark: () => electron_1.ipcRenderer.invoke('theme:is-dark'),
        getSource: () => electron_1.ipcRenderer.invoke('theme:get-source'),
        setSource: (source) => electron_1.ipcRenderer.invoke('theme:set-source', source),
    },
});
//# sourceMappingURL=preload.js.map