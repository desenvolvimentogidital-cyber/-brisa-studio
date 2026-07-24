import { describe, expect, it } from 'vitest';
import {
  decryptJson,
  encryptJson,
  sha256Integrity,
  validatePluginManifest,
  validateUpload,
} from '../utils/enterpriseSecurity';
import { PluginManager } from '../utils/pluginManager';
import { ObservabilityDashboard, RecoveryManager } from '../utils/enterpriseQualityPlatform';
import { Project } from '../types';

const project: Project = {
  id: 'recovery-project',
  name: 'Recovery Project',
  version: '1.0.0',
  device: { id: 'iphone', name: 'Phone', width: 390, height: 844, type: 'iphone', notchType: 'none', borderRadius: 0 },
  assets: [],
  updatedAt: '2026-07-23T00:00:00.000Z',
  activeScreenId: 'home',
  screens: [{ id: 'home', name: 'Home', backgroundColor: '#fff', components: [] }],
};

describe('enterprise security and resilience controls', () => {
  it('rejects executable and unapproved asset uploads', () => {
    expect(validateUpload({ name: 'tool.exe', mimeType: 'application/octet-stream', sizeBytes: 128 }).valid).toBe(false);
    expect(validateUpload({ name: 'hero.png', mimeType: 'image/png', sizeBytes: 128 }).valid).toBe(true);
  });

  it('requires integrity and a signature for production plugins', () => {
    const productionPolicy = { production: true, requireIntegrity: true, requireSignature: true, allowedPermissions: ['components:read'] };
    expect(validatePluginManifest({ id: 'sample.plugin', name: 'Sample', version: '1.0.0', author: 'Team' }, productionPolicy).valid).toBe(false);
    expect(validatePluginManifest({
      id: 'sample.plugin', name: 'Sample', version: '1.0.0', author: 'Team',
      integrity: 'sha256-abcdefghijklmnopqrstuvwxyz123456', signature: 'signed', permissions: ['components:read'],
    }, productionPolicy).valid).toBe(true);

    const manager = new PluginManager();
    manager.configureSecurity(productionPolicy);
    expect(manager.registerPlugin({ id: 'unsigned.plugin', name: 'Unsigned', version: '1.0.0', description: 'Unsigned plugin', author: 'Team', category: 'theme' })).toBe(false);
  });

  it('calculates integrity and encrypts recovery data with AES-GCM', async () => {
    if (!globalThis.crypto?.subtle) return;
    const integrity = await sha256Integrity('mobile-studio');
    expect(integrity.startsWith('sha256-')).toBe(true);
    const encrypted = await encryptJson({ projectId: project.id, state: 'saved' }, 'a-strong-session-secret');
    expect(encrypted.ciphertext).not.toContain(project.id);
    await expect(decryptJson<{ projectId: string }>(encrypted, 'a-strong-session-secret')).resolves.toMatchObject({ projectId: project.id });
  });

  it('persists snapshots through an injected durable store', async () => {
    const saved: unknown[] = [];
    const store = {
      save: (snapshot: unknown) => { saved.push(snapshot); },
      load: () => saved as any[],
    };
    const writer = new RecoveryManager();
    writer.configurePersistence(store);
    writer.createSnapshot(project, 'manual', 'persist');
    await Promise.resolve();

    const reader = new RecoveryManager();
    reader.configurePersistence(store);
    await expect(reader.restorePersistedSnapshots()).resolves.toBe(1);
    expect(reader.getRecoveryOptions().available).toBe(true);
  });

  it('records real spans for an instrumented operation', async () => {
    const dashboard = new ObservabilityDashboard();
    const traceId = dashboard.startTrace('export');
    dashboard.recordSpan(traceId, 'compile', 12);
    await dashboard.trace('serialize', async () => 'ok');
    expect(dashboard.getTrace(traceId)?.spans).toHaveLength(1);
  });
});
