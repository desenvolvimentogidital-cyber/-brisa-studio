"use strict";
// ==========================================
// Mobile Studio - Electron Main Process
// ==========================================
// Professional Desktop application entry point.
// Handles window management, IPC, menus, updates, and lifecycle.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Constants
const IS_DEV = !electron_1.app.isPackaged;
const APP_NAME = 'Mobile Studio';
const APP_VERSION = electron_1.app.getVersion();
const MIN_WIDTH = 1024;
const MIN_HEIGHT = 680;
const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
// State
let mainWindow = null;
let splashWindow = null;
let isQuitting = false;
// ==========================================
// Window State Persistence
// ==========================================
const WINDOW_STATE_PATH = path.join(electron_1.app.getPath('userData'), 'window-state.json');
function loadWindowState() {
    try {
        if (fs.existsSync(WINDOW_STATE_PATH)) {
            return JSON.parse(fs.readFileSync(WINDOW_STATE_PATH, 'utf-8'));
        }
    }
    catch { /* ignore */ }
    return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT, isMaximized: true, isFullscreen: false };
}
function saveWindowState(win) {
    try {
        const state = {
            x: win.getBounds().x,
            y: win.getBounds().y,
            width: win.getBounds().width,
            height: win.getBounds().height,
            isMaximized: win.isMaximized(),
            isFullscreen: win.isFullScreen(),
        };
        fs.writeFileSync(WINDOW_STATE_PATH, JSON.stringify(state, null, 2));
    }
    catch { /* ignore */ }
}
// ==========================================
// Splash Screen
// ==========================================
function createSplashWindow() {
    splashWindow = new electron_1.BrowserWindow({
        width: 520,
        height: 360,
        frame: false,
        transparent: true,
        resizable: false,
        center: true,
        show: false,
        alwaysOnTop: true,
        webPreferences: {
            sandbox: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    splashWindow.loadURL(IS_DEV
        ? 'http://localhost:5173/#/splash'
        : `file://${path.join(__dirname, '../dist/index.html#/splash')}`);
    splashWindow.once('ready-to-show', () => {
        splashWindow?.show();
    });
}
// ==========================================
// Main Window
// ==========================================
function createMainWindow() {
    const savedState = loadWindowState();
    mainWindow = new electron_1.BrowserWindow({
        width: savedState.width,
        height: savedState.height,
        x: savedState.x,
        y: savedState.y,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        title: APP_NAME,
        icon: path.join(__dirname, '../public/icon.png'),
        show: false,
        backgroundColor: '#0F172A',
        webPreferences: {
            sandbox: true,
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
        },
    });
    // Restore window state
    if (savedState.isMaximized)
        mainWindow.maximize();
    if (savedState.isFullscreen)
        mainWindow.setFullScreen(true);
    // Load the app
    if (IS_DEV) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    // Window event handlers
    mainWindow.on('ready-to-show', () => {
        // Close splash and show main
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.close();
        }
        mainWindow?.show();
    });
    mainWindow.on('close', (e) => {
        if (!isQuitting) {
            e.preventDefault();
            mainWindow?.hide();
        }
    });
    mainWindow.on('resize', () => {
        if (mainWindow)
            saveWindowState(mainWindow);
    });
    mainWindow.on('move', () => {
        if (mainWindow)
            saveWindowState(mainWindow);
    });
    mainWindow.on('maximize', () => {
        if (mainWindow)
            saveWindowState(mainWindow);
    });
    mainWindow.on('unmaximize', () => {
        if (mainWindow)
            saveWindowState(mainWindow);
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // Set application menu
    electron_1.Menu.setApplicationMenu(createAppMenu());
}
// ==========================================
// Application Menu
// ==========================================
function createAppMenu() {
    const template = [
        {
            label: 'Arquivo',
            submenu: [
                {
                    label: 'Novo Projeto',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow?.webContents.send('menu:new-project'),
                },
                {
                    label: 'Abrir Projeto...',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        const result = await electron_1.dialog.showOpenDialog(mainWindow, {
                            filters: [
                                { name: 'Mobile Studio Project', extensions: ['msproj', 'mobilestudio', 'json'] },
                                { name: 'All Files', extensions: ['*'] },
                            ],
                            properties: ['openFile'],
                        });
                        if (!result.canceled && result.filePaths.length > 0) {
                            mainWindow?.webContents.send('menu:open-project', result.filePaths[0]);
                        }
                    },
                },
                { type: 'separator' },
                {
                    label: 'Salvar',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => mainWindow?.webContents.send('menu:save'),
                },
                {
                    label: 'Salvar Como...',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: async () => {
                        const result = await electron_1.dialog.showSaveDialog(mainWindow, {
                            filters: [{ name: 'Mobile Studio Project', extensions: ['msproj'] }],
                        });
                        if (!result.canceled && result.filePath) {
                            mainWindow?.webContents.send('menu:save-as', result.filePath);
                        }
                    },
                },
                { type: 'separator' },
                {
                    label: 'Exportar...',
                    submenu: [
                        { label: 'Exportar como Flutter', click: () => mainWindow?.webContents.send('export:flutter') },
                        { label: 'Exportar como React Native', click: () => mainWindow?.webContents.send('export:react-native') },
                        { label: 'Exportar como HTML/PWA', click: () => mainWindow?.webContents.send('export:html') },
                        { label: 'Exportar como JSON', click: () => mainWindow?.webContents.send('export:json') },
                    ],
                },
                { type: 'separator' },
                {
                    label: 'Sair',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
                    click: () => {
                        isQuitting = true;
                        electron_1.app.quit();
                    },
                },
            ],
        },
        {
            label: 'Editar',
            submenu: [
                { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', click: () => mainWindow?.webContents.send('menu:undo') },
                { label: 'Refazer', accelerator: 'CmdOrCtrl+Y', click: () => mainWindow?.webContents.send('menu:redo') },
                { type: 'separator' },
                { label: 'Recortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Colar', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'Selecionar Tudo', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
                { type: 'separator' },
                { label: 'Duplicar', accelerator: 'CmdOrCtrl+D', click: () => mainWindow?.webContents.send('menu:duplicate') },
                { label: 'Excluir', accelerator: 'Delete', click: () => mainWindow?.webContents.send('menu:delete') },
            ],
        },
        {
            label: 'Visualizar',
            submenu: [
                { label: 'Modo Visual', click: () => mainWindow?.webContents.send('mode:visual') },
                { label: 'Modo Código', click: () => mainWindow?.webContents.send('mode:code') },
                { label: 'Modo Híbrido', click: () => mainWindow?.webContents.send('mode:hybrid') },
                { type: 'separator' },
                { label: 'Alternar Tema', accelerator: 'CmdOrCtrl+T', click: () => mainWindow?.webContents.send('menu:toggle-theme') },
                { type: 'separator' },
                { label: 'Zoom +', accelerator: 'CmdOrCtrl+=', click: () => mainWindow?.webContents.send('menu:zoom-in') },
                { label: 'Zoom -', accelerator: 'CmdOrCtrl+-', click: () => mainWindow?.webContents.send('menu:zoom-out') },
                { label: 'Resetar Zoom', accelerator: 'CmdOrCtrl+0', click: () => mainWindow?.webContents.send('menu:zoom-reset') },
                { type: 'separator' },
                { label: 'Tela Cheia', accelerator: 'F11', role: 'togglefullscreen' },
            ],
        },
        {
            label: 'Projeto',
            submenu: [
                { label: 'Propriedades do Projeto', click: () => mainWindow?.webContents.send('menu:project-properties') },
                { label: 'Gerenciar Telas', click: () => mainWindow?.webContents.send('menu:manage-screens') },
                { type: 'separator' },
                { label: 'Adicionar Tela', accelerator: 'CmdOrCtrl+Shift+N', click: () => mainWindow?.webContents.send('menu:add-screen') },
                { label: 'Duplicar Tela', click: () => mainWindow?.webContents.send('menu:duplicate-screen') },
            ],
        },
        {
            label: 'Ferramentas',
            submenu: [
                { label: 'Paleta de Comandos', accelerator: 'CmdOrCtrl+K', click: () => mainWindow?.webContents.send('menu:command-palette') },
                { label: 'Console de Depuração', accelerator: 'CmdOrCtrl+Shift+I', click: () => mainWindow?.webContents.send('menu:toggle-console') },
                { type: 'separator' },
                { label: 'Event Inspector', click: () => mainWindow?.webContents.send('menu:event-inspector') },
                { label: 'No-Code Logic Builder', click: () => mainWindow?.webContents.send('menu:nocode-builder') },
                { type: 'separator' },
                { label: 'Verificar Atualizações...', click: () => mainWindow?.webContents.send('menu:check-updates') },
            ],
        },
        {
            label: 'Janela',
            submenu: [
                { label: 'Minimizar', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
                { label: 'Fechar', accelerator: 'CmdOrCtrl+W', role: 'close' },
                { type: 'separator' },
                { label: 'Centralizar', click: () => mainWindow?.center() },
            ],
        },
        {
            label: 'Ajuda',
            submenu: [
                { label: 'Documentação', accelerator: 'F1', click: () => mainWindow?.webContents.send('menu:documentation') },
                { label: 'Atalhos do Teclado', accelerator: 'CmdOrCtrl+/', click: () => mainWindow?.webContents.send('menu:shortcuts') },
                { type: 'separator' },
                { label: 'Enviar Feedback', click: () => mainWindow?.webContents.send('menu:feedback') },
                { type: 'separator' },
                { label: `Sobre ${APP_NAME}`, click: () => {
                        electron_1.dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: `Sobre ${APP_NAME}`,
                            message: `${APP_NAME} v${APP_VERSION}`,
                            detail: 'Plataforma profissional de prototipagem e design visual mobile.\n\nCriado com Electron, React e TypeScript.',
                        });
                    } },
            ],
        },
    ];
    // macOS specific menu
    if (process.platform === 'darwin') {
        template.unshift({
            label: electron_1.app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' },
            ],
        });
    }
    return electron_1.Menu.buildFromTemplate(template);
}
// ==========================================
// IPC Handlers
// ==========================================
function setupIPC() {
    // File System Operations
    electron_1.ipcMain.handle('dialog:open-file', async (_event, options) => {
        const result = await electron_1.dialog.showOpenDialog(mainWindow, options);
        return result;
    });
    electron_1.ipcMain.handle('dialog:save-file', async (_event, options) => {
        const result = await electron_1.dialog.showSaveDialog(mainWindow, options);
        return result;
    });
    electron_1.ipcMain.handle('dialog:message', async (_event, options) => {
        const result = await electron_1.dialog.showMessageBox(mainWindow, options);
        return result;
    });
    electron_1.ipcMain.handle('dialog:confirm', async (_event, message) => {
        const result = await electron_1.dialog.showMessageBox(mainWindow, {
            type: 'question',
            buttons: ['Sim', 'Não'],
            defaultId: 0,
            cancelId: 1,
            message,
        });
        return result.response === 0;
    });
    // File System
    electron_1.ipcMain.handle('fs:read-file', async (_event, filePath) => {
        try {
            return { success: true, data: fs.readFileSync(filePath, 'utf-8') };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
    electron_1.ipcMain.handle('fs:write-file', async (_event, filePath, data) => {
        try {
            fs.writeFileSync(filePath, data, 'utf-8');
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
    electron_1.ipcMain.handle('fs:exists', async (_event, filePath) => {
        return fs.existsSync(filePath);
    });
    electron_1.ipcMain.handle('fs:delete', async (_event, filePath) => {
        try {
            fs.unlinkSync(filePath);
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
    electron_1.ipcMain.handle('fs:readdir', async (_event, dirPath) => {
        try {
            return { success: true, data: fs.readdirSync(dirPath) };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
    // Shell
    electron_1.ipcMain.handle('shell:open-external', async (_event, url) => {
        await electron_1.shell.openExternal(url);
    });
    electron_1.ipcMain.handle('shell:show-item', async (_event, filePath) => {
        electron_1.shell.showItemInFolder(filePath);
    });
    // Clipboard
    electron_1.ipcMain.handle('clipboard:read-text', () => electron_1.clipboard.readText());
    electron_1.ipcMain.handle('clipboard:write-text', (_event, text) => electron_1.clipboard.writeText(text));
    // Window
    electron_1.ipcMain.handle('window:minimize', () => mainWindow?.minimize());
    electron_1.ipcMain.handle('window:maximize', () => {
        if (mainWindow?.isMaximized())
            mainWindow.unmaximize();
        else
            mainWindow?.maximize();
    });
    electron_1.ipcMain.handle('window:close', () => mainWindow?.close());
    electron_1.ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized() ?? false);
    electron_1.ipcMain.handle('window:set-title', (_event, title) => mainWindow?.setTitle(title));
    // System
    electron_1.ipcMain.handle('system:platform', () => process.platform);
    electron_1.ipcMain.handle('system:arch', () => process.arch);
    electron_1.ipcMain.handle('system:version', () => electron_1.app.getVersion());
    electron_1.ipcMain.handle('system:user-data-path', () => electron_1.app.getPath('userData'));
    electron_1.ipcMain.handle('system:home-dir', () => electron_1.app.getPath('home'));
    electron_1.ipcMain.handle('system:documents-dir', () => electron_1.app.getPath('documents'));
    electron_1.ipcMain.handle('system:desktop-dir', () => electron_1.app.getPath('desktop'));
    electron_1.ipcMain.handle('system:temp-dir', () => electron_1.app.getPath('temp'));
    // Recent Documents
    electron_1.ipcMain.handle('recent:add', (_event, filePath) => {
        electron_1.app.addRecentDocument(filePath);
    });
    electron_1.ipcMain.handle('recent:clear', () => {
        electron_1.app.clearRecentDocuments();
    });
    // Auto Save
    electron_1.ipcMain.handle('auto-save:set', async (_event, filePath, data) => {
        try {
            const autoSavePath = path.join(electron_1.app.getPath('userData'), 'autosave');
            if (!fs.existsSync(autoSavePath))
                fs.mkdirSync(autoSavePath, { recursive: true });
            fs.writeFileSync(path.join(autoSavePath, 'recovery.msproj'), data, 'utf-8');
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
    electron_1.ipcMain.handle('auto-save:recover', async () => {
        try {
            const recoveryPath = path.join(electron_1.app.getPath('userData'), 'autosave', 'recovery.msproj');
            if (fs.existsSync(recoveryPath)) {
                return { success: true, data: fs.readFileSync(recoveryPath, 'utf-8') };
            }
            return { success: false, error: 'No recovery file found' };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
    electron_1.ipcMain.handle('auto-save:clear', () => {
        try {
            const recoveryPath = path.join(electron_1.app.getPath('userData'), 'autosave', 'recovery.msproj');
            if (fs.existsSync(recoveryPath))
                fs.unlinkSync(recoveryPath);
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    });
    // Theme
    electron_1.ipcMain.handle('theme:is-dark', () => electron_1.nativeTheme.shouldUseDarkColors);
    electron_1.ipcMain.handle('theme:get-source', () => electron_1.nativeTheme.themeSource);
    electron_1.ipcMain.handle('theme:set-source', (_event, source) => {
        electron_1.nativeTheme.themeSource = source;
    });
}
// ==========================================
// App Lifecycle
// ==========================================
electron_1.app.whenReady().then(() => {
    setupIPC();
    createSplashWindow();
    createMainWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
        else {
            mainWindow?.show();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    isQuitting = true;
    if (mainWindow)
        saveWindowState(mainWindow);
});
// Handle file association (double-click .msproj)
electron_1.app.on('open-file', (event, filePath) => {
    event.preventDefault();
    if (mainWindow) {
        mainWindow.show();
        mainWindow.webContents.send('menu:open-project', filePath);
    }
});
// Prevent multiple instances
const gotLock = electron_1.app.requestSingleInstanceLock();
if (!gotLock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }
    });
}
//# sourceMappingURL=main.js.map