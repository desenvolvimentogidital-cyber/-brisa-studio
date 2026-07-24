/**
 * Small, dependency-free security primitives shared by the browser platform.
 * Secrets are never persisted here: callers supply them at each session.
 */

export const ENTERPRISE_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self'",
  "connect-src 'self' https://generativelanguage.googleapis.com",
].join('; ');

export interface UploadCandidate {
  name: string;
  mimeType: string;
  sizeBytes: number;
}

export interface UploadPolicy {
  maxBytes: number;
  allowedMimeTypes: readonly string[];
  blockedExtensions?: readonly string[];
}

export interface SecurityValidationResult {
  valid: boolean;
  reason?: string;
}

export const DEFAULT_ASSET_UPLOAD_POLICY: UploadPolicy = {
  maxBytes: 50 * 1024 * 1024,
  allowedMimeTypes: [
    'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml',
    'font/woff2', 'font/ttf', 'application/json', 'video/mp4',
    'audio/mpeg', 'application/pdf',
  ],
  blockedExtensions: ['.exe', '.dll', '.bat', '.cmd', '.ps1', '.sh', '.js', '.html', '.svgz'],
};

export function validateUpload(
  candidate: UploadCandidate,
  policy: UploadPolicy = DEFAULT_ASSET_UPLOAD_POLICY
): SecurityValidationResult {
  if (!candidate.name?.trim() || !candidate.mimeType?.trim()) {
    return { valid: false, reason: 'Asset name and MIME type are required.' };
  }
  if (!Number.isFinite(candidate.sizeBytes) || candidate.sizeBytes < 0 || candidate.sizeBytes > policy.maxBytes) {
    return { valid: false, reason: `Asset size must be between 0 and ${policy.maxBytes} bytes.` };
  }
  const name = candidate.name.toLowerCase();
  if ((policy.blockedExtensions || []).some((extension) => name.endsWith(extension))) {
    return { valid: false, reason: 'This file extension is blocked by the upload policy.' };
  }
  if (!policy.allowedMimeTypes.includes(candidate.mimeType.toLowerCase())) {
    return { valid: false, reason: 'This MIME type is not allowed by the upload policy.' };
  }
  return { valid: true };
}

export interface PluginManifestForValidation {
  id: string;
  name: string;
  version: string;
  author: string;
  integrity?: string;
  signature?: string;
  permissions?: string[];
}

export interface PluginValidationPolicy {
  production: boolean;
  allowedPermissions: readonly string[];
  requireIntegrity: boolean;
  requireSignature: boolean;
}

export const DEFAULT_PLUGIN_POLICY: PluginValidationPolicy = {
  production: false,
  allowedPermissions: ['components:read', 'components:write', 'events:subscribe'],
  requireIntegrity: false,
  requireSignature: false,
};

export function validatePluginManifest(
  manifest: PluginManifestForValidation,
  policy: PluginValidationPolicy = DEFAULT_PLUGIN_POLICY
): SecurityValidationResult {
  if (!/^[a-z0-9][a-z0-9._-]{2,127}$/i.test(manifest.id || '')) {
    return { valid: false, reason: 'Plugin id must be a stable, URL-safe identifier.' };
  }
  if (!manifest.name?.trim() || !manifest.author?.trim() || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(manifest.version || '')) {
    return { valid: false, reason: 'Plugin name, author and semantic version are required.' };
  }
  if (policy.requireIntegrity && !/^sha256-[A-Za-z0-9+/=_-]{20,}$/.test(manifest.integrity || '')) {
    return { valid: false, reason: 'A SHA-256 integrity value is required in production.' };
  }
  if (policy.requireSignature && !manifest.signature?.trim()) {
    return { valid: false, reason: 'A verified digital signature is required in production.' };
  }
  const invalidPermission = (manifest.permissions || []).find(
    (permission) => !policy.allowedPermissions.includes(permission)
  );
  return invalidPermission
    ? { valid: false, reason: `Permission "${invalidPermission}" is not allowed.` }
    : { valid: true };
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

/** Computes a real SHA-256 integrity value for a plugin archive or document. */
export async function sha256Integrity(payload: string | ArrayBuffer): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('Web Crypto API is required for integrity verification.');
  const bytes = typeof payload === 'string' ? new TextEncoder().encode(payload) : payload;
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return `sha256-${bytesToBase64(new Uint8Array(digest))}`;
}

export async function verifyIntegrity(payload: string | ArrayBuffer, expected: string): Promise<boolean> {
  const actual = await sha256Integrity(payload);
  // Constant-time comparison is unnecessary for public integrity hashes, but
  // retaining a fixed-length comparison prevents accidental partial matches.
  if (actual.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < actual.length; index++) mismatch |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  return mismatch === 0;
}

export interface EncryptedPayload {
  algorithm: 'AES-GCM';
  salt: string;
  iv: string;
  ciphertext: string;
}

async function deriveAesKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  if (!globalThis.crypto?.subtle) throw new Error('Web Crypto API is required for encryption.');
  const material = await globalThis.crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveKey']
  );
  return globalThis.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/** Encrypts JSON with AES-256-GCM. The caller owns the secret and key rotation. */
export async function encryptJson(value: unknown, secret: string): Promise<EncryptedPayload> {
  if (!secret || secret.length < 12) throw new Error('Use a strong, session-scoped encryption secret.');
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(secret, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = await globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return { algorithm: 'AES-GCM', salt: bytesToBase64(salt), iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(ciphertext)) };
}

export async function decryptJson<T>(payload: EncryptedPayload, secret: string): Promise<T> {
  if (payload.algorithm !== 'AES-GCM') throw new Error('Unsupported encrypted payload algorithm.');
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const key = await deriveAesKey(secret, salt);
  const plaintext = await globalThis.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, key, base64ToBytes(payload.ciphertext)
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}
