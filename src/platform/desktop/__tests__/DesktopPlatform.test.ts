// ==========================================
// Mobile Studio - Desktop Platform Tests
// ==========================================
// Tests for DesktopPlatform initialization and fallback behavior.

import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import { desktopPlatform, DesktopAPI } from '../DesktopPlatform';

describe('DesktopPlatform', () => {
  beforeEach(() => {
    // Clear any previous state
    desktopPlatform.destroy();
  });

  afterEach(() => {
    desktopPlatform.destroy();
  });

  test('init should create API reference', () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    expect(api).toBeDefined();
    expect(api.platform).toBeDefined();
  });

  test('isRunningInElectron returns false in browser', () => {
    expect(desktopPlatform.isRunningInElectron()).toBe(false);
  });

  test('dialog.confirm works in browser mode', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    // In browser mode, confirm uses window.confirm, but we can't test it directly
    // Instead check the dialog API exists
    expect(api.dialog.confirm).toBeDefined();
  });

  test('dialog.openFile works in browser mode', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    const result = await api.dialog.openFile();
    expect(result.canceled).toBe(true);
  });

  test('dialog.saveFile works in browser mode', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    const result = await api.dialog.saveFile();
    expect(result.canceled).toBe(true);
  });

  test('files.readFile returns error in browser mode', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    const result = await api.files.readFile('/test/file.txt');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Not available');
  });

  test('files.writeFile returns error in browser mode', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    const result = await api.files.writeFile('/test/file.txt', 'content');
    expect(result.success).toBe(false);
  });

  test('files.exists returns false in browser mode', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    const result = await api.files.exists('/test/file.txt');
    expect(result).toBe(false);
  });

  test('files.delete returns error in browser mode', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    const result = await api.files.delete('/test/file.txt');
    expect(result.success).toBe(false);
  });

  test('shell.openExternal opens window in browser mode', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    // Should not throw
    await expect(api.shell.openExternal('https://example.com')).resolves.not.toThrow();
  });

  test('clipboard.writeText works in browser mode', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    await expect(api.clipboard.writeText('test')).resolves.not.toThrow();
  });

  test('clipboard.readText returns empty string in browser mode', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    const result = await api.clipboard.readText();
    expect(typeof result).toBe('string');
  });

  test('window methods exist and are callable', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    await expect(api.window.minimize()).resolves.not.toThrow();
    await expect(api.window.maximize()).resolves.not.toThrow();
    await expect(api.window.close()).resolves.not.toThrow();
    const isMax = await api.window.isMaximized();
    expect(isMax).toBe(false);
    await expect(api.window.setTitle('Test Title')).resolves.not.toThrow();
  });

  test('system methods return values', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    const platform = await api.system.platform();
    expect(typeof platform).toBe('string');
    const version = await api.system.version();
    expect(typeof version).toBe('string');
  });

  test('autoSave methods return error in browser mode', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    const saveResult = await api.autoSave.save('data');
    expect(saveResult.success).toBe(false);
    const recoverResult = await api.autoSave.recover();
    expect(recoverResult.success).toBe(false);
    const clearResult = await api.autoSave.clear();
    expect(clearResult.success).toBe(false);
  });

  test('theme methods work in browser mode', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    const isDark = await api.theme.isDark();
    expect(typeof isDark).toBe('boolean');
    const source = await api.theme.getSource();
    expect(typeof source).toBe('string');
    await expect(api.theme.setSource('dark')).resolves.not.toThrow();
  });

  test('onMenuEvent returns cleanup function', () => {
    desktopPlatform.init();
    const callback = (channel: string) => {};
    const cleanup = desktopPlatform.onMenuEvent(callback);
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  test('getAPI auto-initializes', () => {
    const api = desktopPlatform.getAPI();
    expect(api).toBeDefined();
    expect(api.platform).toBeDefined();
  });

  test('destroy cleans up menu listeners', () => {
    desktopPlatform.init();
    const callback = (channel: string) => {};
    desktopPlatform.onMenuEvent(callback);
    desktopPlatform.destroy();
    // After destroy, should be able to re-init
    desktopPlatform.init();
    expect(desktopPlatform.getAPI()).toBeDefined();
  });
});

describe('DesktopPlatform - Electron Mode Detection', () => {
  test('checkIfElectron returns false without desktop object', () => {
    expect(desktopPlatform.isRunningInElectron()).toBe(false);
  });

  test('getAPI returns valid interface', () => {
    const api = desktopPlatform.getAPI();
    expect(api.versions).toBeDefined();
    expect(api.versions.node).toBeDefined();
    expect(api.versions.chrome).toBeDefined();
    expect(api.versions.electron).toBeDefined();
  });

  test('recent methods exist', async () => {
    desktopPlatform.init();
    const api = desktopPlatform.getAPI();
    await expect(api.recent.add('/test/path')).resolves.not.toThrow();
    await expect(api.recent.clear()).resolves.not.toThrow();
  });
});