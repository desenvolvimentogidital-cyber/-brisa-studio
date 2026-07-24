import { studioEventBus } from './eventBus';
import { StudioIR, compileProjectToIR } from './irCompiler';
import { Project } from '../types';

// ==========================================
// ETAPA 1 — APPLICATION CONFIGURATION SYSTEM
// ==========================================

export interface AppManifest {
  name: string;
  id: string; // Bundle ID e.g. com.mycompany.app
  version: string;
  buildNumber: number;
  description: string;
  author: string;
  language: string;
  category: string;
  theme: 'light' | 'dark' | 'system';
  icon: string;
  splashScreen: string;
  keywords: string[];
  appUrl?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
}

// ==========================================
// ETAPA 2 — ASSET MANAGER
// ==========================================

export type AppAssetType = 'icon' | 'image' | 'font' | 'video' | 'animation' | 'file' | 'audio' | 'document';

export interface AppAssetVersion {
  version: string;
  sizeBytes: number;
  url: string;
  compressed: boolean;
  compressionRatio?: number;
  checksum: string;
  createdAt: string;
}

export interface AppAsset {
  id: string;
  name: string;
  type: AppAssetType;
  sizeBytes: number;
  originalSizeBytes?: number;
  url: string;
  compressed: boolean;
  compressionRatio?: number;
  folder: string;
  tags: string[];
  version: string;
  versions: AppAssetVersion[];
  optimized: boolean;
  width?: number;
  height?: number;
  duration?: number; // for video/audio
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// ETAPA 3 — DEVICE CAPABILITY MANAGER
// ==========================================

export type DevicePermissionType =
  | 'CAMERA'
  | 'MICROPHONE'
  | 'GPS'
  | 'BLUETOOTH'
  | 'STORAGE'
  | 'NOTIFICATIONS'
  | 'BIOMETRICS'
  | 'CONTACTS'
  | 'CALENDAR'
  | 'MOTION'
  | 'SMS'
  | 'PHONE'
  | 'NFC';

export interface DevicePermission {
  type: DevicePermissionType;
  enabled: boolean;
  reason: string;
  androidPermissionName: string;
  iosInfoPlistKey: string;
  requiredAtBuild: boolean;
}

const PERMISSION_REGISTRY: Record<DevicePermissionType, Omit<DevicePermission, 'enabled' | 'requiredAtBuild'>> = {
  CAMERA: {
    type: 'CAMERA',
    reason: 'Acessar câmera para capturar fotos e vídeos',
    androidPermissionName: 'android.permission.CAMERA',
    iosInfoPlistKey: 'NSCameraUsageDescription',
  },
  MICROPHONE: {
    type: 'MICROPHONE',
    reason: 'Gravar áudio e capturar som',
    androidPermissionName: 'android.permission.RECORD_AUDIO',
    iosInfoPlistKey: 'NSMicrophoneUsageDescription',
  },
  GPS: {
    type: 'GPS',
    reason: 'Obter localização geográfica do dispositivo',
    androidPermissionName: 'android.permission.ACCESS_FINE_LOCATION',
    iosInfoPlistKey: 'NSLocationWhenInUseUsageDescription',
  },
  BLUETOOTH: {
    type: 'BLUETOOTH',
    reason: 'Conectar dispositivos Bluetooth',
    androidPermissionName: 'android.permission.BLUETOOTH',
    iosInfoPlistKey: 'NSBluetoothAlwaysUsageDescription',
  },
  STORAGE: {
    type: 'STORAGE',
    reason: 'Ler e escrever arquivos no armazenamento',
    androidPermissionName: 'android.permission.READ_EXTERNAL_STORAGE',
    iosInfoPlistKey: 'NSPhotoLibraryUsageDescription',
  },
  NOTIFICATIONS: {
    type: 'NOTIFICATIONS',
    reason: 'Enviar notificações push e alertas',
    androidPermissionName: 'android.permission.POST_NOTIFICATIONS',
    iosInfoPlistKey: 'NSRemoteNotification',
  },
  BIOMETRICS: {
    type: 'BIOMETRICS',
    reason: 'Autenticar via impressão digital ou Face ID',
    androidPermissionName: 'android.permission.USE_BIOMETRIC',
    iosInfoPlistKey: 'NSFaceIDUsageDescription',
  },
  CONTACTS: {
    type: 'CONTACTS',
    reason: 'Acessar lista de contatos do dispositivo',
    androidPermissionName: 'android.permission.READ_CONTACTS',
    iosInfoPlistKey: 'NSContactsUsageDescription',
  },
  CALENDAR: {
    type: 'CALENDAR',
    reason: 'Acessar eventos do calendário',
    androidPermissionName: 'android.permission.WRITE_CALENDAR',
    iosInfoPlistKey: 'NSCalendarsUsageDescription',
  },
  MOTION: {
    type: 'MOTION',
    reason: 'Detectar movimento e orientação do dispositivo',
    androidPermissionName: 'android.permission.ACTIVITY_RECOGNITION',
    iosInfoPlistKey: 'NSMotionUsageDescription',
  },
  SMS: {
    type: 'SMS',
    reason: 'Enviar e ler mensagens SMS',
    androidPermissionName: 'android.permission.SEND_SMS',
    iosInfoPlistKey: 'NSMicrophoneUsageDescription',
  },
  PHONE: {
    type: 'PHONE',
    reason: 'Fazer chamadas telefônicas',
    androidPermissionName: 'android.permission.CALL_PHONE',
    iosInfoPlistKey: 'NSMicrophoneUsageDescription',
  },
  NFC: {
    type: 'NFC',
    reason: 'Ler tags NFC para pagamentos e automação',
    androidPermissionName: 'android.permission.NFC',
    iosInfoPlistKey: 'CoreNFCUsageDescription',
  },
};

// ==========================================
// ETAPA 4 — ENVIRONMENT MANAGER
// ==========================================

export type EnvironmentType = 'development' | 'testing' | 'production';

export interface EnvironmentConfig {
  name: EnvironmentType;
  label: string;
  apiUrl: string;
  dbUrl: string;
  authDomain: string;
  storageBucket: string;
  customVars: Record<string, string>;
  features: {
    debug: boolean;
    verboseLogging: boolean;
    analytics: boolean;
    crashReporting: boolean;
  };
}

// ==========================================
// ETAPA 5 — BUILD PIPELINE
// ==========================================

export type BuildTarget =
  | 'android_apk'
  | 'android_aab'
  | 'ios_ipa'
  | 'web_pwa'
  | 'web_static'
  | 'flutter'
  | 'react_native'
  | 'kotlin_compose'
  | 'swiftui';

export interface BuildDependency {
  name: string;
  version: string;
  type: 'runtime' | 'compile' | 'test';
}

export interface BuildConfiguration {
  target: BuildTarget;
  versionCode: number;
  versionName: string;
  minSdk?: number;
  targetSdk?: number;
  compileSdk?: number;
  swiftVersion?: string;
  iosDeploymentTarget?: string;
  signingConfig: {
    keystore?: string;
    keyAlias?: string;
    provisioningProfile?: string;
    teamId?: string;
  };
  dependencies: BuildDependency[];
  optimizations: {
    shrinkResources: boolean;
    minifyEnabled: boolean;
    proguardEnabled: boolean;
    splitPerDensity: boolean;
    splitPerAbi: boolean;
  };
}

export interface BuildStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  durationMs: number;
  logs: string[];
}

export interface BuildRecord {
  id: string;
  target: BuildTarget;
  environment: EnvironmentType;
  status: 'pending' | 'building' | 'completed' | 'failed';
  progress: number;
  version: string;
  buildNumber: number;
  timestamp: string;
  completedAt?: string;
  downloadUrl?: string;
  sizeMb?: number;
  logs: string[];
  stages: BuildStage[];
  config: BuildConfiguration;
  errors: string[];
  warnings: string[];
  artifactType: string;
}

// ==========================================
// ETAPA 6 — EXPORT PACKAGE MANAGER
// ==========================================

export interface ExportPackage {
  id: string;
  target: BuildTarget;
  framework: string;
  files: { path: string; content: string; size: number }[];
  manifest: Record<string, any>;
  generatedAt: string;
}

// ==========================================
// ETAPA 7 — APP STORE CONFIGURATION
// ==========================================

export interface StoreMetadata {
  googlePlay: {
    title: string;
    shortDescription: string;
    fullDescription: string;
    category: string;
    contentRating: string;
    screenshots: string[];
    promoVideo?: string;
    releaseNotes: string;
    price: string;
    containsAds: boolean;
    hasInAppPurchases: boolean;
    privacyPolicyUrl: string;
  };
  appStore: {
    title: string;
    subtitle: string;
    description: string;
    keywords: string[];
    primaryCategory: string;
    secondaryCategory: string;
    privacyUrl: string;
    supportUrl: string;
    marketingUrl: string;
    screenshots: string[];
    promoVideo?: string;
    releaseNotes: string;
    priceTier: number;
    hasInAppPurchases: boolean;
  };
}

// ==========================================
// ETAPA 8 — RUNTIME PRODUCTION MODE
// ==========================================

export interface ProductionOptimizationResult {
  debugCodeRemoved: boolean;
  logsReduced: boolean;
  codeCompressed: boolean;
  assetsOptimized: boolean;
  treeShaken: boolean;
  cacheEnabled: boolean;
  performanceProfile: string;
  metrics: {
    originalSizeKb: number;
    optimizedSizeKb: number;
    reductionPercent: number;
  };
}

// ==========================================
// PACKAGING & DEPLOYMENT MANAGER
// ==========================================

let buildCounter = 0;

export class PackagingDeploymentManager {
  private manifest: AppManifest = {
    name: 'Mobile Studio App',
    id: 'com.mobilestudio.app',
    version: '1.0.0',
    buildNumber: 1,
    description: 'Aplicativo criado no Mobile Studio Pro',
    author: 'Developer',
    language: 'pt-BR',
    category: 'Productivity',
    theme: 'dark',
    icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80',
    splashScreen: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80',
    keywords: ['mobile', 'studio'],
    appUrl: 'https://mobilestudio.app',
  };

  private assetFolderStructure: string[] = [
    'icons', 'images', 'fonts', 'videos', 'animations',
    'audio', 'documents', 'splash', 'general',
  ];

  private assets: AppAsset[] = [
    {
      id: 'asset_1',
      name: 'app_logo.png',
      type: 'icon',
      sizeBytes: 45200,
      originalSizeBytes: 98000,
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80',
      compressed: true,
      compressionRatio: 0.46,
      folder: 'icons',
      tags: ['logo', 'app'],
      version: '1.0.0',
      versions: [],
      optimized: true,
      width: 128,
      height: 128,
      mimeType: 'image/png',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'asset_2',
      name: 'splash_background.png',
      type: 'image',
      sizeBytes: 120500,
      originalSizeBytes: 250000,
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80',
      compressed: true,
      compressionRatio: 0.48,
      folder: 'splash',
      tags: ['splash', 'background'],
      version: '1.0.0',
      versions: [],
      optimized: true,
      width: 500,
      height: 500,
      mimeType: 'image/png',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private permissions: DevicePermission[] = Object.entries(PERMISSION_REGISTRY).map(([type, base]) => ({
    ...base,
    enabled: ['CAMERA', 'GPS', 'NOTIFICATIONS', 'STORAGE'].includes(type),
    requiredAtBuild: ['CAMERA', 'GPS', 'STORAGE', 'NOTIFICATIONS'].includes(type),
  }));

  private environments: Record<EnvironmentType, EnvironmentConfig> = {
    development: {
      name: 'development',
      label: 'Development',
      apiUrl: 'https://dev-api.mobilestudio.app',
      dbUrl: 'indexeddb://dev_db',
      authDomain: 'dev-auth.mobilestudio.app',
      storageBucket: 'dev-storage.mobilestudio.app',
      customVars: { DEBUG: 'true', LOG_LEVEL: 'verbose', ENV: 'development' },
      features: { debug: true, verboseLogging: true, analytics: false, crashReporting: false },
    },
    testing: {
      name: 'testing',
      label: 'Testing',
      apiUrl: 'https://test-api.mobilestudio.app',
      dbUrl: 'indexeddb://test_db',
      authDomain: 'test-auth.mobilestudio.app',
      storageBucket: 'test-storage.mobilestudio.app',
      customVars: { DEBUG: 'true', LOG_LEVEL: 'info', ENV: 'testing' },
      features: { debug: true, verboseLogging: false, analytics: true, crashReporting: true },
    },
    production: {
      name: 'production',
      label: 'Production',
      apiUrl: 'https://api.mobilestudio.app',
      dbUrl: 'postgres://prod_db',
      authDomain: 'auth.mobilestudio.app',
      storageBucket: 'prod-storage.mobilestudio.app',
      customVars: { DEBUG: 'false', LOG_LEVEL: 'error', ENV: 'production' },
      features: { debug: false, verboseLogging: false, analytics: true, crashReporting: true },
    },
  };

  private activeEnvironment: EnvironmentType = 'development';
  private isProductionRuntimeMode: boolean = false;

  private builds: BuildRecord[] = [];
  private exportPackages: ExportPackage[] = [];

  private storeMetadata: StoreMetadata = {
    googlePlay: {
      title: 'Mobile Studio App',
      shortDescription: 'Crie e gerencie sua produtividade com facilidade.',
      fullDescription: 'Aplicativo mobile profissional de alta performance construído com o Mobile Studio Universal.',
      category: 'Productivity',
      contentRating: 'Everyone 3+',
      screenshots: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80'],
      releaseNotes: 'Primeira versão do aplicativo',
      price: 'Free',
      containsAds: false,
      hasInAppPurchases: false,
      privacyPolicyUrl: 'https://mobilestudio.app/privacy',
    },
    appStore: {
      title: 'Mobile Studio App',
      subtitle: 'Sua produtividade simplificada',
      description: 'O melhor aplicativo para gerenciar fluxos de trabalho e equipes com design responsivo.',
      keywords: ['mobile', 'studio', 'produtividade'],
      primaryCategory: 'Productivity',
      secondaryCategory: 'Business',
      privacyUrl: 'https://mobilestudio.app/privacy',
      supportUrl: 'https://mobilestudio.app/support',
      marketingUrl: 'https://mobilestudio.app',
      screenshots: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80'],
      releaseNotes: 'Lançamento inicial',
      priceTier: 0,
      hasInAppPurchases: false,
    },
  };

  private buildHistoryLimit = 50;

  // ==========================================
  // MANIFEST METHODS (ETAPA 1)
  // ==========================================

  getManifest(): AppManifest {
    return { ...this.manifest };
  }

  updateManifest(data: Partial<AppManifest>): AppManifest {
    this.manifest = { ...this.manifest, ...data };
    studioEventBus.publish('PackagingUpdated', { type: 'MANIFEST_UPDATED', manifest: this.manifest });
    return this.manifest;
  }

  resetManifest(): AppManifest {
    this.manifest = {
      name: 'Mobile Studio App',
      id: 'com.mobilestudio.app',
      version: '1.0.0',
      buildNumber: 1,
      description: 'Aplicativo criado no Mobile Studio Pro',
      author: 'Developer',
      language: 'pt-BR',
      category: 'Productivity',
      theme: 'dark',
      icon: '',
      splashScreen: '',
      keywords: ['mobile', 'studio'],
    };
    return this.manifest;
  }

  validateManifest(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!this.manifest.name || this.manifest.name.trim().length === 0) {
      errors.push('Nome do aplicativo é obrigatório');
    }
    if (!this.manifest.id || !/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(this.manifest.id)) {
      errors.push('ID do aplicativo deve ser um bundle identifier válido (ex: com.app.produto)');
    }
    if (!this.manifest.version || !/^\d+\.\d+\.\d+$/.test(this.manifest.version)) {
      errors.push('Versão deve seguir semver (ex: 1.0.0)');
    }
    return { valid: errors.length === 0, errors };
  }

  // ==========================================
  // ASSET MANAGER METHODS (ETAPA 2)
  // ==========================================

  getAssets(): AppAsset[] {
    return [...this.assets].sort((a, b) => a.name.localeCompare(b.name));
  }

  getAssetById(id: string): AppAsset | undefined {
    return this.assets.find((a) => a.id === id);
  }

  getAssetsByFolder(folder: string): AppAsset[] {
    return this.assets.filter((a) => a.folder === folder);
  }

  getAssetFolders(): string[] {
    return [...this.assetFolderStructure];
  }

  addFolder(folderName: string): boolean {
    const name = folderName.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!name || this.assetFolderStructure.includes(name)) return false;
    this.assetFolderStructure.push(name);
    return true;
  }

  addAsset(asset: Omit<AppAsset, 'id' | 'createdAt' | 'updatedAt' | 'versions' | 'version'> & { version?: string }): AppAsset {
    const now = new Date().toISOString();
    const newAsset: AppAsset = {
      ...asset,
      id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      version: '1.0.0',
      versions: [],
      createdAt: now,
      updatedAt: now,
    };

    // Simulate compression if not already
    if (!newAsset.compressed && newAsset.sizeBytes > 10000) {
      newAsset.compressed = true;
      newAsset.originalSizeBytes = newAsset.sizeBytes;
      newAsset.sizeBytes = Math.floor(newAsset.sizeBytes * 0.6);
      newAsset.compressionRatio = 0.6;
    }

    this.assets.push(newAsset);
    studioEventBus.publish('PackagingUpdated', { type: 'ASSET_ADDED', asset: newAsset });
    return newAsset;
  }

  removeAsset(id: string): boolean {
    const idx = this.assets.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.assets.splice(idx, 1);
      studioEventBus.publish('PackagingUpdated', { type: 'ASSET_REMOVED', id });
      return true;
    }
    return false;
  }

  optimizeAsset(id: string): AppAsset | null {
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) return null;
    if (asset.optimized) return asset;

    const originalSize = asset.sizeBytes;
    asset.optimized = true;
    asset.originalSizeBytes = asset.originalSizeBytes || originalSize;
    asset.sizeBytes = Math.floor(originalSize * 0.55);
    asset.compressed = true;
    asset.compressionRatio = 0.55;
    asset.updatedAt = new Date().toISOString();
    return asset;
  }

  compressAsset(id: string): AppAsset | null {
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) return null;
    if (asset.compressed) return asset;

    asset.originalSizeBytes = asset.sizeBytes;
    asset.sizeBytes = Math.floor(asset.sizeBytes * 0.65);
    asset.compressed = true;
    asset.compressionRatio = 0.65;
    asset.updatedAt = new Date().toISOString();
    return asset;
  }

  createAssetVersion(id: string, newUrl: string, newSizeBytes: number): AppAsset | null {
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) return null;

    const version: AppAssetVersion = {
      version: asset.version,
      sizeBytes: asset.sizeBytes,
      url: asset.url,
      compressed: asset.compressed,
      checksum: `sha256_${Date.now()}`,
      createdAt: asset.createdAt,
    };

    const [major, minor, patch] = asset.version.split('.').map(Number);
    asset.version = `${major}.${minor}.${patch + 1}`;
    asset.versions.push(version);
    asset.url = newUrl;
    asset.sizeBytes = newSizeBytes;
    asset.updatedAt = new Date().toISOString();

    return asset;
  }

  getTotalAssetsSize(): number {
    return this.assets.reduce((sum, a) => sum + a.sizeBytes, 0);
  }

  getAssetsStats(): { total: number; totalSizeKb: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    this.assets.forEach((a) => {
      byType[a.type] = (byType[a.type] || 0) + 1;
    });
    return {
      total: this.assets.length,
      totalSizeKb: Math.round(this.assets.reduce((s, a) => s + a.sizeBytes, 0) / 1024),
      byType,
    };
  }

  // ==========================================
  // PERMISSION METHODS (ETAPA 3)
  // ==========================================

  getPermissions(): DevicePermission[] {
    return this.permissions.map((p) => ({ ...p }));
  }

  getEnabledPermissions(): DevicePermission[] {
    return this.permissions.filter((p) => p.enabled);
  }

  togglePermission(type: DevicePermissionType, enabled?: boolean): DevicePermission | null {
    const perm = this.permissions.find((p) => p.type === type);
    if (perm) {
      perm.enabled = enabled !== undefined ? enabled : !perm.enabled;
      studioEventBus.publish('PackagingUpdated', { type: 'PERMISSION_TOGGLED', perm });
      return perm;
    }
    return null;
  }

  enableAllPermissions(): void {
    this.permissions.forEach((p) => { p.enabled = true; });
    studioEventBus.publish('PackagingUpdated', { type: 'PERMISSIONS_BULK_UPDATE', permissions: this.permissions });
  }

  disableAllPermissions(): void {
    this.permissions.forEach((p) => { p.enabled = false; });
    studioEventBus.publish('PackagingUpdated', { type: 'PERMISSIONS_BULK_UPDATE', permissions: this.permissions });
  }

  getAndroidPermissionsList(): string[] {
    return this.permissions.filter((p) => p.enabled).map((p) => p.androidPermissionName);
  }

  getIosPermissionKeys(): string[] {
    return this.permissions.filter((p) => p.enabled).map((p) => p.iosInfoPlistKey);
  }

  /**
   * Auto-inject permissions into IR (ETAPA 3)
   */
  injectPermissionsIntoIR(ir: StudioIR): StudioIR {
    return {
      ...ir,
      permissions: this.getEnabledPermissions().map((p) => ({
        type: p.type,
        enabled: p.enabled,
        reason: p.reason,
      })),
    };
  }

  // ==========================================
  // ENVIRONMENT METHODS (ETAPA 4)
  // ==========================================

  getEnvironments(): Record<EnvironmentType, EnvironmentConfig> {
    return Object.fromEntries(
      Object.entries(this.environments).map(([k, v]) => [k, { ...v }])
    ) as Record<EnvironmentType, EnvironmentConfig>;
  }

  getEnvironment(env: EnvironmentType): EnvironmentConfig | undefined {
    return this.environments[env] ? { ...this.environments[env] } : undefined;
  }

  getActiveEnvironment(): EnvironmentConfig {
    return { ...this.environments[this.activeEnvironment] };
  }

  setActiveEnvironment(env: EnvironmentType): void {
    this.activeEnvironment = env;
    studioEventBus.publish('PackagingUpdated', { type: 'ENV_CHANGED', activeEnvironment: env });
  }

  updateEnvironment(env: EnvironmentType, config: Partial<EnvironmentConfig>): EnvironmentConfig {
    if (this.environments[env]) {
      this.environments[env] = { ...this.environments[env], ...config };
    }
    return { ...this.environments[env] };
  }

  getEnvVar(key: string): string | undefined {
    const active = this.getActiveEnvironment();
    const envVarMap: Record<string, string> = {
      API_URL: active.apiUrl,
      DB_URL: active.dbUrl,
      AUTH_DOMAIN: active.authDomain,
      STORAGE_BUCKET: active.storageBucket,
      ENV: active.name,
      DEBUG: String(active.features.debug),
      LOG_LEVEL: active.customVars.LOG_LEVEL || 'info',
    };
    return envVarMap[key] || active.customVars[key];
  }

  setEnvVar(env: EnvironmentType, key: string, value: string): void {
    if (this.environments[env]) {
      this.environments[env].customVars[key] = value;
    }
  }

  getEnvVarsForEnvironment(env: EnvironmentType): Record<string, string> {
    const config = this.environments[env];
    if (!config) return {};
    return {
      API_URL: config.apiUrl,
      DB_URL: config.dbUrl,
      AUTH_DOMAIN: config.authDomain,
      STORAGE_BUCKET: config.storageBucket,
      ENV: config.name,
      DEBUG: String(config.features.debug),
      LOG_LEVEL: config.customVars.LOG_LEVEL || 'info',
      ...config.customVars,
    };
  }

  // ==========================================
  // RUNTIME PRODUCTION MODE (ETAPA 8)
  // ==========================================

  setProductionRuntimeMode(enabled: boolean): void {
    this.isProductionRuntimeMode = enabled;
  }

  isProductionMode(): boolean {
    return this.isProductionRuntimeMode;
  }

  optimizeForProduction(ir: StudioIR): ProductionOptimizationResult {
    const originalCodeStr = JSON.stringify(ir);
    const originalSizeKb = Math.round(new Blob([originalCodeStr]).size / 1024);

    const optimized = this.isProductionRuntimeMode;

    // Simulate production optimizations
    const result: ProductionOptimizationResult = {
      debugCodeRemoved: optimized,
      logsReduced: optimized,
      codeCompressed: optimized,
      assetsOptimized: optimized,
      treeShaken: optimized,
      cacheEnabled: optimized,
      performanceProfile: optimized ? 'high_performance' : 'development',
      metrics: {
        originalSizeKb,
        optimizedSizeKb: optimized ? Math.round(originalSizeKb * 0.45) : originalSizeKb,
        reductionPercent: optimized ? 55 : 0,
      },
    };

    studioEventBus.publish('PackagingUpdated', { type: 'PRODUCTION_OPTIMIZED', result });
    return result;
  }

  getRuntimeProductionConfig(): Record<string, any> {
    if (!this.isProductionRuntimeMode) {
      return { mode: 'debug', optimizations: [] };
    }
    return {
      mode: 'production',
      optimizations: [
        'remove_console_logs',
        'minify_code',
        'compress_assets',
        'tree_shaking',
        'enable_service_worker_cache',
        'lazy_load_screens',
        'code_splitting',
        'reduce_bundle_size',
      ],
      features: {
        sourceMaps: false,
        hotReload: false,
        performanceMonitoring: true,
        crashReporting: true,
      },
    };
  }

  // ==========================================
  // BUILD PIPELINE METHODS (ETAPA 5)
  // ==========================================

  getBuilds(): BuildRecord[] {
    return [...this.builds];
  }

  getBuildById(id: string): BuildRecord | undefined {
    return this.builds.find((b) => b.id === id);
  }

  getLatestBuild(): BuildRecord | null {
    return this.builds.length > 0 ? this.builds[0] : null;
  }

  getBuildStats(): { total: number; completed: number; failed: number; building: number } {
    return {
      total: this.builds.length,
      completed: this.builds.filter((b) => b.status === 'completed').length,
      failed: this.builds.filter((b) => b.status === 'failed').length,
      building: this.builds.filter((b) => b.status === 'building' || b.status === 'pending').length,
    };
  }

  clearBuildHistory(): void {
    this.builds = [];
  }

  private createBuildConfig(target: BuildTarget, env: EnvironmentType): BuildConfiguration {
    const isAndroid = target === 'android_apk' || target === 'android_aab';
    const isIos = target === 'ios_ipa';
    const isWeb = target === 'web_pwa' || target === 'web_static';
    const isFramework = target === 'flutter' || target === 'react_native' || target === 'kotlin_compose' || target === 'swiftui';

    return {
      target,
      versionCode: this.manifest.buildNumber,
      versionName: this.manifest.version,
      minSdk: isAndroid ? 24 : isIos ? 15 : undefined,
      targetSdk: isAndroid ? 34 : undefined,
      compileSdk: isAndroid ? 34 : undefined,
      swiftVersion: isIos || target === 'swiftui' ? '5.9' : undefined,
      iosDeploymentTarget: isIos || target === 'swiftui' ? '16.0' : undefined,
      signingConfig: {
        keystore: isAndroid ? 'debug.keystore' : undefined,
        keyAlias: isAndroid ? 'androiddebugkey' : undefined,
        provisioningProfile: isIos ? 'Development_Profile.mobileprovision' : undefined,
        teamId: isIos ? 'TEAM_ID_12345' : undefined,
      },
      dependencies: [
        { name: 'app_runtime', version: this.manifest.version, type: 'runtime' },
        ...(isFramework ? [{ name: target === 'flutter' ? 'flutter_sdk' : target === 'react_native' ? 'react_native' : target === 'kotlin_compose' ? 'compose' : 'swiftui', version: 'latest', type: 'runtime' as const }] : []),
      ],
      optimizations: {
        shrinkResources: true,
        minifyEnabled: true,
        proguardEnabled: isAndroid,
        splitPerDensity: isAndroid,
        splitPerAbi: isAndroid,
      },
    };
  }

  async triggerBuild(target: BuildTarget, env?: EnvironmentType): Promise<BuildRecord> {
    const selectedEnv = env || this.activeEnvironment;
    const buildId = `build_${Date.now()}_${++buildCounter}`;
    const startTime = Date.now();

    const config = this.createBuildConfig(target, selectedEnv);

    const record: BuildRecord = {
      id: buildId,
      target,
      environment: selectedEnv,
      status: 'pending',
      progress: 0,
      version: this.manifest.version,
      buildNumber: this.manifest.buildNumber,
      timestamp: new Date().toISOString(),
      logs: [`Build iniciado para ${target} no ambiente [${selectedEnv}]`],
      stages: [
        { name: 'Preparação', status: 'pending', durationMs: 0, logs: [] },
        { name: 'Compilação do Projeto para IR', status: 'pending', durationMs: 0, logs: [] },
        { name: 'Otimização de Assets', status: 'pending', durationMs: 0, logs: [] },
        { name: 'Empacotamento de Permissões', status: 'pending', durationMs: 0, logs: [] },
        { name: 'Configuração de Build', status: 'pending', durationMs: 0, logs: [] },
        { name: 'Geração de Artefato', status: 'pending', durationMs: 0, logs: [] },
        { name: 'Assinatura e Finalização', status: 'pending', durationMs: 0, logs: [] },
      ],
      config,
      errors: [],
      warnings: [],
      artifactType: target === 'android_apk' ? 'APK' : target === 'android_aab' ? 'AAB' : target === 'ios_ipa' ? 'IPA' : target === 'web_pwa' ? 'PWA' : target === 'web_static' ? 'Static HTML' : `${target} Project`,
    };

    this.builds.unshift(record);
    if (this.builds.length > this.buildHistoryLimit) {
      this.builds.pop();
    }

    // Stage 1: Preparation
    record.status = 'building';
    record.progress = 5;
    record.stages[0].status = 'running';
    await this.simulateDelay(300);
    record.stages[0].status = 'completed';
    record.stages[0].durationMs = 300;
    record.stages[0].logs = ['Cache limpo', 'Diretórios preparados'];
    record.logs.push('✓ Preparação concluída');

    // Stage 2: IR Compilation
    record.progress = 20;
    record.stages[1].status = 'running';
    await this.simulateDelay(500);
    record.stages[1].status = 'completed';
    record.stages[1].durationMs = 500;
    record.stages[1].logs = ['Projeto convertido para StudioIR', 'Componentes compilados', 'Lógicas compiladas'];
    record.logs.push('✓ Projeto compilado para IR');

    // Stage 3: Asset Optimization
    record.progress = 40;
    record.stages[2].status = 'running';
    await this.simulateDelay(400);
    const totalAssetsSize = this.getTotalAssetsSize();
    const optimizedSize = Math.floor(totalAssetsSize * 0.55);
    record.stages[2].status = 'completed';
    record.stages[2].durationMs = 400;
    record.stages[2].logs = [
      `${this.assets.length} assets processados`,
      `Tamanho total: ${Math.round(totalAssetsSize / 1024)}KB → ${Math.round(optimizedSize / 1024)}KB`,
      'Compressão aplicada',
    ];
    record.logs.push(`✓ ${this.assets.length} assets otimizados`);

    // Stage 4: Permission Packaging
    record.progress = 55;
    record.stages[3].status = 'running';
    await this.simulateDelay(200);
    const enabledPerms = this.getEnabledPermissions();
    record.stages[3].status = 'completed';
    record.stages[3].durationMs = 200;
    record.stages[3].logs = [
      `${enabledPerms.length} permissões habilitadas`,
      'Permissões injetadas no manifesto',
      this.getAndroidPermissionsList().map((p) => `Android: ${p}`).join(', '),
      this.getIosPermissionKeys().map((p) => `iOS: ${p}`).join(', '),
    ];
    record.logs.push(`✓ ${enabledPerms.length} permissões configuradas`);

    // Stage 5: Build Configuration
    record.progress = 70;
    record.stages[4].status = 'running';
    await this.simulateDelay(300);
    record.stages[4].status = 'completed';
    record.stages[4].durationMs = 300;
    record.stages[4].logs = [
      `Versão: ${config.versionName} (${config.versionCode})`,
      `Min SDK: ${config.minSdk || 'N/A'}`,
      `Assinatura: ${config.signingConfig.keystore || config.signingConfig.provisioningProfile || 'N/A'}`,
    ];
    record.logs.push('✓ Configuração de build aplicada');

    // Stage 6: Artifact Generation
    record.progress = 85;
    record.stages[5].status = 'running';
    await this.simulateDelay(600);
    record.stages[5].status = 'completed';
    record.stages[5].durationMs = 600;
    record.stages[5].logs = [`Artefato ${record.artifactType} gerado`];
    record.logs.push(`✓ Artefato ${record.artifactType} gerado`);

    // Stage 7: Sign & Finalize
    record.progress = 95;
    record.stages[6].status = 'running';
    await this.simulateDelay(200);
    record.stages[6].status = 'completed';
    record.stages[6].durationMs = 200;
    record.stages[6].logs = ['Assinatura aplicada', 'Artefato finalizado'];
    record.logs.push('✓ Build concluído com sucesso!');

    // Complete
    record.status = 'completed';
    record.progress = 100;
    record.completedAt = new Date().toISOString();
    record.downloadUrl = `#download_${target}_${buildId}`;

    // Calculate size based on target
    const sizeMap: Record<string, number> = {
      android_apk: 19.5 + Math.random() * 5,
      android_aab: 15.2 + Math.random() * 3,
      ios_ipa: 24.1 + Math.random() * 6,
      web_pwa: 3.2 + Math.random() * 1.5,
      web_static: 2.8 + Math.random() * 1,
      flutter: 8.5 + Math.random() * 2,
      react_native: 7.2 + Math.random() * 2,
      kotlin_compose: 12.3 + Math.random() * 3,
      swiftui: 10.1 + Math.random() * 3,
    };
    record.sizeMb = Math.round((sizeMap[target] || 10) * 10) / 10;

    studioEventBus.publish('PackagingUpdated', { type: 'BUILD_COMPLETED', build: record });
    return record;
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ==========================================
  // EXPORT PACKAGE METHODS (ETAPA 6)
  // ==========================================

  getExportPackages(): ExportPackage[] {
    return [...this.exportPackages];
  }

  generateExportPackage(target: BuildTarget): ExportPackage {
    const packageId = `export_${Date.now()}_${target}`;
    const frameworkMap: Record<BuildTarget, string> = {
      android_apk: 'Android APK',
      android_aab: 'Android AAB',
      ios_ipa: 'iOS IPA',
      web_pwa: 'Web PWA',
      web_static: 'Web Static',
      flutter: 'Flutter',
      react_native: 'React Native',
      kotlin_compose: 'Kotlin Compose',
      swiftui: 'SwiftUI',
    };

    const files = this.generateExportFiles(target);

    const pkg: ExportPackage = {
      id: packageId,
      target,
      framework: frameworkMap[target],
      files,
      manifest: {
        name: this.manifest.name,
        id: this.manifest.id,
        version: this.manifest.version,
        buildNumber: this.manifest.buildNumber,
        target,
        permissions: this.getAndroidPermissionsList(),
        generatedAt: new Date().toISOString(),
      },
      generatedAt: new Date().toISOString(),
    };

    this.exportPackages.push(pkg);
    return pkg;
  }

  private generateExportFiles(target: BuildTarget): ExportPackage['files'] {
    const files: ExportPackage['files'] = [];
    const timestamp = Date.now();

    if (target === 'android_apk' || target === 'android_aab') {
      const ext = target === 'android_apk' ? 'apk' : 'aab';
      files.push({
        path: `app/build/outputs/${ext === 'apk' ? 'apk/release' : 'bundle/release'}/app-release.${ext}`,
        content: `[Binary ${target.toUpperCase()} artifact - ${this.manifest.version}]`,
        size: Math.floor(15000000 + Math.random() * 5000000),
      });
      files.push({
        path: `app/build/outputs/mapping/release/mapping.txt`,
        content: 'ProGuard mapping file\n' + `app version: ${this.manifest.version}\n`,
        size: 4500,
      });
    } else if (target === 'ios_ipa') {
      files.push({
        path: `build/Release-iphoneos/${this.manifest.name}.ipa`,
        content: `[Binary IPA artifact - ${this.manifest.version}]`,
        size: Math.floor(20000000 + Math.random() * 8000000),
      });
      files.push({
        path: `build/Release-iphoneos/export_options.plist`,
        content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store</string>
  <key>teamID</key>
  <string>TEAM_ID_12345</string>
  <key>uploadBitcode</key>
  <true/>
</dict>
</plist>`,
        size: 350,
      });
    } else if (target === 'web_pwa') {
      files.push({
        path: `dist/index.html`,
        content: `<!DOCTYPE html>
<html lang="${this.manifest.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.manifest.name}</title>
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" href="/icon.png">
  <meta name="theme-color" content="#1E293B">
</head>
<body>
  <div id="root"></div>
  <script src="/app.js"></script>
</body>
</html>`,
        size: 420,
      });
      files.push({
        path: `dist/manifest.json`,
        content: JSON.stringify({
          name: this.manifest.name,
          short_name: this.manifest.name.substring(0, 12),
          description: this.manifest.description,
          start_url: '/',
          display: 'standalone',
          background_color: '#1E293B',
          theme_color: '#1E293B',
          icons: [{ src: '/icon.png', sizes: '192x192', type: 'image/png' }],
        }, null, 2),
        size: 280,
      });
      files.push({
        path: `dist/sw.js`,
        content: `// Service Worker v${this.manifest.version}
const CACHE_NAME = '${this.manifest.id}-v${this.manifest.version}';
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME));
});
self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});`,
        size: 380,
      });
    } else if (target === 'web_static') {
      files.push({
        path: `dist/index.html`,
        content: `<!DOCTYPE html>
<html lang="${this.manifest.language}">
<head>
  <meta charset="UTF-8">
  <title>${this.manifest.name}</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div id="app">
    <h1>${this.manifest.name}</h1>
    <p>${this.manifest.description}</p>
  </div>
  <script src="/app.js"></script>
</body>
</html>`,
        size: 350,
      });
      files.push({
        path: `dist/styles.css`,
        content: `/* ${this.manifest.name} - v${this.manifest.version} */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #0F172A; color: #E2E8F0; }
#app { padding: 20px; }`,
        size: 200,
      });
    } else if (target === 'flutter') {
      files.push({
        path: `lib/main.dart`,
        content: `import 'package:flutter/material.dart';

void main() {
  runApp(const ${this.manifest.name.replace(/[^a-zA-Z0-9]/g, '')}App());
}

class ${this.manifest.name.replace(/[^a-zA-Z0-9]/g, '')}App extends StatelessWidget {
  const ${this.manifest.name.replace(/[^a-zA-Z0-9]/g, '')}App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${this.manifest.name}',
      theme: ThemeData.dark(),
      home: const Scaffold(
        body: Center(child: Text('${this.manifest.name} v${this.manifest.version}')),
      ),
    );
  }
}`,
        size: 550,
      });
      files.push({
        path: `pubspec.yaml`,
        content: `name: ${this.manifest.id.split('.').pop()}
description: ${this.manifest.description}
version: ${this.manifest.version}+${this.manifest.buildNumber}

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter

flutter:
  uses-material-design: true`,
        size: 320,
      });
    } else if (target === 'react_native') {
      files.push({
        path: `src/App.tsx`,
        content: `import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>${this.manifest.name}</Text>
      <Text style={styles.version}>v${this.manifest.version}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#E2E8F0' },
  version: { fontSize: 14, color: '#818CF8', marginTop: 8 },
});`,
        size: 500,
      });
      files.push({
        path: `package.json`,
        content: JSON.stringify({
          name: this.manifest.id.split('.').pop(),
          version: this.manifest.version,
          private: true,
          scripts: { start: 'expo start', android: 'expo start --android', ios: 'expo start --ios' },
          dependencies: { 'react-native': '0.76.0', react: '19.0.0', 'expo': '~52.0.0' },
        }, null, 2),
        size: 320,
      });
    } else if (target === 'kotlin_compose') {
      files.push({
        path: `app/src/main/java/com/${this.manifest.id.replace(/\./g, '/')}/MainActivity.kt`,
        content: `package ${this.manifest.id}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ${this.manifest.name.replace(/[^a-zA-Z0-9]/g, '')}Theme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    Greeting("${this.manifest.name}")
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = name, style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = "v${this.manifest.version}", style = MaterialTheme.typography.bodyMedium)
    }
}`,
        size: 900,
      });
    } else if (target === 'swiftui') {
      files.push({
        path: `Sources/${this.manifest.name.replace(/[^a-zA-Z0-9]/g, '')}/${this.manifest.name.replace(/[^a-zA-Z0-9]/g, '')}App.swift`,
        content: `import SwiftUI

@main
struct ${this.manifest.name.replace(/[^a-zA-Z0-9]/g, '')}App: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    var body: some View {
        VStack {
            Text("${this.manifest.name}")
                .font(.largeTitle)
                .fontWeight(.bold)
            Text("v${this.manifest.version}")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding()
    }
}`,
        size: 500,
      });
    }

    return files;
  }

  // ==========================================
  // STORE METADATA METHODS (ETAPA 7)
  // ==========================================

  getStoreMetadata(): StoreMetadata {
    return JSON.parse(JSON.stringify(this.storeMetadata));
  }

  updateStoreMetadata(data: Partial<StoreMetadata>): StoreMetadata {
    if (data.googlePlay) {
      this.storeMetadata.googlePlay = { ...this.storeMetadata.googlePlay, ...data.googlePlay };
    }
    if (data.appStore) {
      this.storeMetadata.appStore = { ...this.storeMetadata.appStore, ...data.appStore };
    }
    return this.storeMetadata;
  }

  isGooglePlayReady(): { ready: boolean; issues: string[] } {
    const issues: string[] = [];
    const gp = this.storeMetadata.googlePlay;
    if (!gp.title) issues.push('Título é obrigatório no Google Play');
    if (!gp.shortDescription) issues.push('Descrição curta é obrigatória');
    if (!gp.fullDescription) issues.push('Descrição completa é obrigatória');
    if (gp.screenshots.length === 0) issues.push('Pelo menos 1 screenshot é obrigatório');
    if (!this.manifest.icon) issues.push('Ícone do aplicativo é obrigatório');
    return { ready: issues.length === 0, issues };
  }

  isAppStoreReady(): { ready: boolean; issues: string[] } {
    const issues: string[] = [];
    const as = this.storeMetadata.appStore;
    if (!as.title) issues.push('Título é obrigatório na App Store');
    if (!as.description) issues.push('Descrição é obrigatória');
    if (as.screenshots.length === 0) issues.push('Pelo menos 1 screenshot é obrigatório');
    if (!as.privacyUrl) issues.push('URL de privacidade é obrigatória');
    return { ready: issues.length === 0, issues };
  }

  // ==========================================
  // IR INTEGRATION (ETAPA 9)
  // ==========================================

  /**
   * Complete deployment config injected into IR
   */
  injectDeploymentIntoIR(ir: StudioIR): StudioIR {
    const enabledPerms = this.getEnabledPermissions();
    const activeEnv = this.getActiveEnvironment();

    return {
      ...ir,
      appManifest: {
        name: this.manifest.name,
        id: this.manifest.id,
        version: this.manifest.version,
        buildNumber: this.manifest.buildNumber,
        description: this.manifest.description,
        category: this.manifest.category,
      },
      permissions: enabledPerms.map((p) => ({
        type: p.type,
        enabled: p.enabled,
        reason: p.reason,
      })),
      environments: {
        active: activeEnv.name,
        apiUrl: activeEnv.apiUrl,
      },
      buildConfig: {
        targets: ['android_apk', 'android_aab', 'ios_ipa', 'web_pwa', 'flutter', 'react_native'],
        version: this.manifest.version,
      },
      deploymentConfig: {
        googlePlayReady: this.isGooglePlayReady().ready,
        appStoreReady: this.isAppStoreReady().ready,
      },
    };
  }

  /**
   * Generate full production IR with all deployment layers
   */
  generateProductionIR(project: Project): StudioIR {
    const baseIR = compileProjectToIR(project);
    const irWithPermissions = this.injectPermissionsIntoIR(baseIR);
    return this.injectDeploymentIntoIR(irWithPermissions);
  }

  // ==========================================
  // DEPLOYMENT DASHBOARD DATA (ETAPA 10)
  // ==========================================

  getDashboardData(): {
    version: string;
    buildNumber: number;
    buildsPerformed: number;
    buildsCompleted: number;
    buildsFailed: number;
    activeEnvironment: string;
    productionMode: boolean;
    assetsCount: number;
    permissionsEnabled: number;
    googlePlayReady: boolean;
    appStoreReady: boolean;
    lastBuild: BuildRecord | null;
    recentBuilds: BuildRecord[];
  } {
    const stats = this.getBuildStats();
    return {
      version: this.manifest.version,
      buildNumber: this.manifest.buildNumber,
      buildsPerformed: stats.total,
      buildsCompleted: stats.completed,
      buildsFailed: stats.failed,
      activeEnvironment: this.activeEnvironment,
      productionMode: this.isProductionRuntimeMode,
      assetsCount: this.assets.length,
      permissionsEnabled: this.getEnabledPermissions().length,
      googlePlayReady: this.isGooglePlayReady().ready,
      appStoreReady: this.isAppStoreReady().ready,
      lastBuild: this.getLatestBuild(),
      recentBuilds: this.builds.slice(0, 5),
    };
  }
}

export const packagingManager = new PackagingDeploymentManager();