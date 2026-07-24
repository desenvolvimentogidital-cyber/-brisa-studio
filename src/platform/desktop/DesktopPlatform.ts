// ==========================================
// Mobile Studio - Desktop Platform Layer
// ==========================================
// Professional Desktop integration for Electron.
// All desktop-specific functionality lives here.
// Core remains frozen - this is a modular layer.

export interface DesktopAPI {
  platform: string;
  arch: string;
  versions: { node: string; chrome: string; electron: string };
  dialog: DesktopDialogAPI;
  files: DesktopFileSystemAPI;
  shell: DesktopShellAPI;
  clipboard: DesktopClipboardAPI;
  window: DesktopWindowAPI;
  system: DesktopSystemAPI;
  autoSave: DesktopAutoSaveAPI;
  recent: DesktopRecentAPI;
  theme: DesktopThemeAPI;
  onMenuEvent: (callback: (channel: string, ...args: any[]) => void) => () => void;
}

export interface DesktopDialogAPI {
  openFile: (options?: any) => Promise<any>;
  saveFile: (options?: any) => Promise<any>;
  showMessage: (options: any) => Promise<any>;
  confirm: (message: string) => Promise<boolean>;
}

export interface DesktopFileSystemAPI {
  readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  writeFile: (filePath: string, data: string) => Promise<{ success: boolean; error?: string }>;
  exists: (filePath: string) => Promise<boolean>;
  delete: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  readDir: (dirPath: string) => Promise<{ success: boolean; data?: string[]; error?: string }>;
}

export interface DesktopShellAPI {
  openExternal: (url: string) => Promise<void>;
  showItemInFolder: (filePath: string) => Promise<void>;
}

export interface DesktopClipboardAPI {
  readText: () => Promise<string>;
  writeText: (text: string) => Promise<void>;
}

export interface DesktopWindowAPI {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  setTitle: (title: string) => Promise<void>;
}

export interface DesktopSystemAPI {
  platform: () => Promise<string>;
  arch: () => Promise<string>;
  version: () => Promise<string>;
  userDataPath: () => Promise<string>;
  homeDir: () => Promise<string>;
  documentsDir: () => Promise<string>;
  desktopDir: () => Promise<string>;
  tempDir: () => Promise<string>;
}

export interface DesktopAutoSaveAPI {
  save: (data: string) => Promise<{ success: boolean; error?: string }>;
  recover: () => Promise<{ success: boolean; data?: string; error?: string }>;
  clear: () => Promise<{ success: boolean; error?: string }>;
}

export interface DesktopRecentAPI {
  add: (filePath: string) => Promise<void>;
  clear: () => Promise<void>;
}

export interface DesktopThemeAPI {
  isDark: () => Promise<boolean>;
  getSource: () => Promise<string>;
  setSource: (source: 'system' | 'light' | 'dark') => Promise<void>;
}

/**
 * Desktop Platform Manager
 * Provides the desktop API to the renderer process.
 * Falls back gracefully when not running in Electron.
 */
class DesktopPlatformManager {
  private api: DesktopAPI | null = null;
  private isElectron = false;
  private menuCleanup: (() => void) | null = null;

  /**
   * Initialize the Desktop Platform
   */
  init(): void {
    this.isElectron = this.checkIfElectron();
    if (this.isElectron) {
      this.api = (window as any).desktop as DesktopAPI;
      console.log('[DesktopPlatform] Electron detected, desktop API ready');
    } else {
      this.api = this.createFallbackAPI();
      console.log('[DesktopPlatform] Running in browser mode, using fallback API');
    }
  }

  /**
   * Check if running inside Electron
   */
  private checkIfElectron(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof (window as any).desktop !== 'undefined' &&
      (window as any).desktop?.platform !== undefined
    );
  }

  /**
   * Create a fallback API for browser mode
   */
  private createFallbackAPI(): DesktopAPI {
    return {
      platform: navigator.platform || 'unknown',
      arch: 'unknown',
      versions: { node: '', chrome: '', electron: '' },
      dialog: {
        openFile: async () => ({ canceled: true, filePaths: [] }),
        saveFile: async () => ({ canceled: true, filePath: '' }),
        showMessage: async () => ({ response: 0 }),
        confirm: async (message: string) => window.confirm(message),
      },
      files: {
        readFile: async () => ({ success: false, error: 'Not available in browser' }),
        writeFile: async () => ({ success: false, error: 'Not available in browser' }),
        exists: async () => false,
        delete: async () => ({ success: false, error: 'Not available in browser' }),
        readDir: async () => ({ success: false, error: 'Not available in browser' }),
      },
      shell: {
        openExternal: async (url: string) => { window.open(url, '_blank'); },
        showItemInFolder: async () => {},
      },
      clipboard: {
        readText: async () => '',
        writeText: async (text: string) => { try { await navigator.clipboard.writeText(text); } catch {} },
      },
      window: {
        minimize: async () => {},
        maximize: async () => {},
        close: async () => {},
        isMaximized: async () => false,
        setTitle: async (title: string) => { document.title = title; },
      },
      system: {
        platform: async () => navigator.platform,
        arch: async () => 'unknown',
        version: async () => '1.0.0',
        userDataPath: async () => '',
        homeDir: async () => '',
        documentsDir: async () => '',
        desktopDir: async () => '',
        tempDir: async () => '',
      },
      autoSave: {
        save: async () => ({ success: false, error: 'Not available in browser' }),
        recover: async () => ({ success: false, error: 'Not available in browser' }),
        clear: async () => ({ success: false, error: 'Not available in browser' }),
      },
      recent: {
        add: async () => {},
        clear: async () => {},
      },
      theme: {
        isDark: async () => window.matchMedia('(prefers-color-scheme: dark)').matches,
        getSource: async () => 'system',
        setSource: async () => {},
      },
      onMenuEvent: () => () => {},
    };
  }

  /**
   * Get the desktop API
   */
  getAPI(): DesktopAPI {
    if (!this.api) {
      this.init();
    }
    return this.api!;
  }

  /**
   * Check if running in Electron
   */
  isRunningInElectron(): boolean {
    return this.isElectron;
  }

  /**
   * Listen for menu events from Electron main process
   */
  onMenuEvent(callback: (channel: string, ...args: any[]) => void): () => void {
    if (this.api) {
      this.menuCleanup = this.api.onMenuEvent(callback);
      return this.menuCleanup;
    }
    return () => {};
  }

  /**
   * Clean up menu listeners
   */
  destroy(): void {
    if (this.menuCleanup) {
      this.menuCleanup();
      this.menuCleanup = null;
    }
  }
}

/**
 * Singleton instance
 */
export const desktopPlatform = new DesktopPlatformManager();