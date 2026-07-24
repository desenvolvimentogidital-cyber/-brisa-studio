import { describe, it, expect, beforeEach } from 'vitest';
import {
  PackagingDeploymentManager,
  BuildTarget,
} from '../utils/packagingDeploymentLayer';
import { compileProjectToIR } from '../utils/irCompiler';
import { Project, CanvasComponent } from '../types';
import { createStudioAppApi } from '../utils/studioAppApi';
import { UniversalRuntime } from '../utils/universalRuntime';
import { compileNoCodeFlowToJS } from '../utils/nocodeEngine';

const mockProject: Project = {
  id: 'proj_deploy_1',
  name: 'Deploy Test App',
  version: '1.0.0',
  device: {
    id: 'iphone',
    name: 'iPhone 15',
    width: 393,
    height: 852,
    type: 'phone',
    notchType: 'dynamic-island',
    borderRadius: 48,
  },
  assets: [],
  updatedAt: new Date().toISOString(),
  screens: [
    {
      id: 'scr_1',
      name: 'Home',
      backgroundColor: '#1E293B',
      components: [
        {
          id: 'comp_1',
          name: 'btn_login',
          type: 'button',
          category: 'basic',
          x: 40, y: 200, width: 300, height: 48,
          rotation: 0, zIndex: 1, opacity: 1, locked: false, hidden: false,
          paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
          fontFamily: 'Inter', fontSize: 16, fontWeight: '600',
          color: '#FFFFFF', textAlign: 'center', letterSpacing: 0, lineHeight: 20,
          backgroundColor: '#6366F1',
          gradient: { enabled: false, type: 'linear', angle: 0, startColor: '#000', endColor: '#000' },
          border: { style: 'none', color: '#000', width: 0, radiusTopLeft: 8, radiusTopRight: 8, radiusBottomRight: 8, radiusBottomLeft: 8, isRadiusLinked: true },
          shadow: { enabled: false, color: '#000', x: 0, y: 0, blur: 0, spread: 0, inset: false },
          backdropBlur: 0,
          interaction: { onClickAction: 'navigate', targetScreenId: 'scr_2' },
          children: [],
        },
      ],
    },
    { id: 'scr_2', name: 'Dashboard', backgroundColor: '#0F172A', components: [] },
  ],
  activeScreenId: 'scr_1',
};

describe('FASE 8 — Application Packaging & Deployment Layer Suite', () => {
  let pm: PackagingDeploymentManager;

  beforeEach(() => {
    pm = new PackagingDeploymentManager();
  });

  // ==============================================
  // ETAPA 1 — APP MANIFEST TESTS (5 tests)
  // ==============================================

  describe('ETAPA 1 — App Manifest', () => {
    it('1.1 Deve criar manifest com valores padrão', () => {
      const manifest = pm.getManifest();
      expect(manifest).toBeDefined();
      expect(manifest.name).toBe('Mobile Studio App');
      expect(manifest.id).toBe('com.mobilestudio.app');
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.buildNumber).toBe(1);
      expect(manifest.category).toBeDefined();
      expect(manifest.theme).toBeDefined();
      expect(manifest.keywords).toBeDefined();
      expect(Array.isArray(manifest.keywords)).toBe(true);
    });

    it('1.2 Deve atualizar campos do manifest', () => {
      const updated = pm.updateManifest({
        name: 'Meu App', id: 'com.app.produto', version: '2.5.1', buildNumber: 42,
      });
      expect(updated.name).toBe('Meu App');
      expect(updated.id).toBe('com.app.produto');
      expect(updated.version).toBe('2.5.1');
      expect(updated.buildNumber).toBe(42);

      const manifest = pm.getManifest();
      expect(manifest.name).toBe('Meu App');
    });

    it('1.3 Deve resetar manifest para padrão', () => {
      pm.updateManifest({ name: 'Temp', version: '9.9.9' });
      const reset = pm.resetManifest();
      expect(reset.name).toBe('Mobile Studio App');
      expect(reset.version).toBe('1.0.0');
    });

    it('1.4 Deve validar manifest corretamente', () => {
      let validation = pm.validateManifest();
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);

      pm.updateManifest({ name: '' });
      validation = pm.validateManifest();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('Nome'))).toBe(true);

      pm.updateManifest({ name: 'ValidName', id: 'invalid-id' });
      validation = pm.validateManifest();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('ID'))).toBe(true);

      pm.updateManifest({ id: 'com.app.test', version: 'abc' });
      validation = pm.validateManifest();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('Versão') || e.includes('semver'))).toBe(true);

      pm.updateManifest({ version: '2.0.0', name: 'App' });
      expect(pm.validateManifest().valid).toBe(true);
    });

    it('1.5 Deve permitir configuração de tema, ícone e splash screen', () => {
      pm.updateManifest({ theme: 'light', icon: 'https://example.com/icon.png', splashScreen: 'https://example.com/splash.png' });
      const m = pm.getManifest();
      expect(m.theme).toBe('light');
      expect(m.icon).toBe('https://example.com/icon.png');
      expect(m.splashScreen).toBe('https://example.com/splash.png');
    });
  });

  // ==============================================
  // ETAPA 2 — ASSET MANAGER TESTS (7 tests)
  // ==============================================

  describe('ETAPA 2 — Asset Manager', () => {
    it('2.1 Deve gerenciar assets (CRUD)', () => {
      const initialCount = pm.getAssets().length;
      const newAsset = pm.addAsset({
        name: 'banner_home.png', type: 'image', sizeBytes: 250000,
        url: 'https://example.com/banner.png', compressed: false,
        folder: 'images', tags: ['banner', 'home'], optimized: false,
        mimeType: 'image/png', width: 1200, height: 600,
      });
      expect(newAsset.id).toBeDefined();
      expect(newAsset.name).toBe('banner_home.png');
      expect(pm.getAssets().length).toBe(initialCount + 1);

      const found = pm.getAssetById(newAsset.id);
      expect(found).toBeDefined();
      expect(found!.name).toBe('banner_home.png');

      const removed = pm.removeAsset(newAsset.id);
      expect(removed).toBe(true);
      expect(pm.getAssets().length).toBe(initialCount);
      expect(pm.removeAsset('nonexistent')).toBe(false);
    });

    it('2.2 Deve organizar assets por pastas', () => {
      const folders = pm.getAssetFolders();
      expect(folders).toContain('icons');
      expect(folders).toContain('images');
      expect(folders).toContain('fonts');
      expect(folders).toContain('videos');
      expect(folders).toContain('animations');
      expect(folders).toContain('audio');
      expect(folders).toContain('documents');
      expect(folders).toContain('splash');
      expect(folders).toContain('general');

      const added = pm.addFolder('custom_assets');
      expect(added).toBe(true);
      expect(pm.getAssetFolders()).toContain('custom_assets');
      expect(pm.addFolder('custom_assets')).toBe(false);
    });

    it('2.3 Deve filtrar assets por pasta', () => {
      const splashAssets = pm.getAssetsByFolder('splash');
      expect(splashAssets.length).toBeGreaterThanOrEqual(1);
      expect(splashAssets[0].folder).toBe('splash');
    });

    it('2.4 Deve comprimir e otimizar assets', () => {
      // Add a small asset that won't be auto-compressed (< 10000 bytes)
      const testAsset = pm.addAsset({
        name: 'small_file.txt', type: 'file', sizeBytes: 5000,
        url: 'https://example.com/small.txt', compressed: false,
        folder: 'documents', tags: [], optimized: false, mimeType: 'text/plain',
      });
      // Should NOT be auto-compressed since sizeBytes <= 10000
      expect(testAsset.compressed).toBe(false);

      // Compress - should apply 0.65 ratio
      const compressed = pm.compressAsset(testAsset.id);
      expect(compressed).toBeDefined();
      expect(compressed!.compressed).toBe(true);
      expect(compressed!.compressionRatio).toBe(0.65);
      expect(compressed!.sizeBytes).toBe(3250); // 5000 * 0.65

      // Optimize (further reduction 0.55)
      const optimized = pm.optimizeAsset(testAsset.id);
      expect(optimized).toBeDefined();
      expect(optimized!.optimized).toBe(true);
      expect(optimized!.sizeBytes).toBe(1787); // 3250 * 0.55 (floor)
    });

    it('2.5 Deve versionar assets', () => {
      const testAsset = pm.addAsset({
        name: 'logo_v1.png', type: 'icon', sizeBytes: 50000,
        url: 'https://example.com/logo_v1.png', compressed: true,
        folder: 'icons', tags: ['logo'], optimized: true, mimeType: 'image/png',
      });
      const versioned = pm.createAssetVersion(testAsset.id, 'https://example.com/logo_v2.png', 45000);
      expect(versioned).toBeDefined();
      expect(versioned!.version).toBe('1.0.1');
      expect(versioned!.versions.length).toBe(1);
      expect(versioned!.versions[0].url).toContain('logo_v1');
    });

    it('2.6 Deve retornar estatísticas de assets', () => {
      const stats = pm.getAssetsStats();
      expect(stats.total).toBeGreaterThanOrEqual(2);
      expect(stats.totalSizeKb).toBeGreaterThan(0);
      expect(stats.byType).toBeDefined();
      expect(stats.byType.icon).toBeGreaterThanOrEqual(1);
    });

    it('2.7 Deve calcular tamanho total dos assets', () => {
      const totalSize = pm.getTotalAssetsSize();
      expect(totalSize).toBeGreaterThan(0);
    });
  });

  // ==============================================
  // ETAPA 3 — DEVICE CAPABILITY MANAGER TESTS (5 tests)
  // ==============================================

  describe('ETAPA 3 — Device Capability Manager', () => {
    it('3.1 Deve gerenciar permissões (toggle)', () => {
      const perms = pm.getPermissions();
      expect(perms.length).toBe(13);

      const camera = perms.find((p) => p.type === 'CAMERA');
      expect(camera).toBeDefined();
      expect(camera!.enabled).toBe(true);

      pm.togglePermission('CAMERA', false);
      expect(pm.getPermissions().find((p) => p.type === 'CAMERA')!.enabled).toBe(false);

      pm.togglePermission('CAMERA');
      expect(pm.getPermissions().find((p) => p.type === 'CAMERA')!.enabled).toBe(true);
    });

    it('3.2 Deve permitir habilitar/desabilitar todas as permissões', () => {
      pm.enableAllPermissions();
      pm.getPermissions().forEach((p) => { expect(p.enabled).toBe(true); });

      pm.disableAllPermissions();
      pm.getPermissions().forEach((p) => { expect(p.enabled).toBe(false); });
    });

    it('3.3 Deve retornar listas de permissões específicas para Android e iOS', () => {
      pm.enableAllPermissions();
      const androidPerms = pm.getAndroidPermissionsList();
      expect(androidPerms.length).toBe(13);
      expect(androidPerms).toContain('android.permission.CAMERA');
      expect(androidPerms).toContain('android.permission.NFC');

      const iosPerms = pm.getIosPermissionKeys();
      expect(iosPerms.length).toBe(13);
      expect(iosPerms).toContain('NSCameraUsageDescription');
      expect(iosPerms).toContain('CoreNFCUsageDescription');
    });

    it('3.4 Deve injetar permissões no StudioIR automaticamente', () => {
      pm.enableAllPermissions();
      const mockIr = compileProjectToIR(mockProject);
      const irWithPerms = pm.injectPermissionsIntoIR(mockIr);

      expect(irWithPerms.permissions).toBeDefined();
      expect(irWithPerms.permissions!.length).toBe(13);
      expect(irWithPerms.permissions![0].type).toBeDefined();
      expect(irWithPerms.permissions![0].enabled).toBe(true);
    });

    it('3.5 Deve retornar apenas permissões habilitadas', () => {
      pm.disableAllPermissions();
      pm.togglePermission('CAMERA', true);
      pm.togglePermission('GPS', true);

      const enabled = pm.getEnabledPermissions();
      expect(enabled.length).toBe(2);
      expect(enabled.map((p) => p.type)).toContain('CAMERA');
      expect(enabled.map((p) => p.type)).toContain('GPS');
    });
  });

  // ==============================================
  // ETAPA 4 — ENVIRONMENT MANAGER TESTS (6 tests)
  // ==============================================

  describe('ETAPA 4 — Environment Manager', () => {
    it('4.1 Deve gerenciar ambientes (dev, test, prod)', () => {
      const envs = pm.getEnvironments();
      expect(Object.keys(envs).length).toBe(3);
      expect(envs.development).toBeDefined();
      expect(envs.testing).toBeDefined();
      expect(envs.production).toBeDefined();
    });

    it('4.2 Deve alternar ambiente ativo', () => {
      pm.setActiveEnvironment('production');
      expect(pm.getActiveEnvironment().name).toBe('production');
      expect(pm.getActiveEnvironment().apiUrl).toContain('api.mobilestudio.app');

      pm.setActiveEnvironment('development');
      expect(pm.getActiveEnvironment().name).toBe('development');
    });

    it('4.3 Deve retornar variáveis de ambiente via app.env.API_URL', () => {
      pm.setActiveEnvironment('production');
      expect(pm.getEnvVar('API_URL')).toBe('https://api.mobilestudio.app');

      pm.setActiveEnvironment('development');
      expect(pm.getEnvVar('API_URL')).toBe('https://dev-api.mobilestudio.app');
      expect(pm.getEnvVar('DB_URL')).toContain('dev_db');
      expect(pm.getEnvVar('ENV')).toBe('development');
      expect(pm.getEnvVar('DEBUG')).toBe('true');
      expect(pm.getEnvVar('LOG_LEVEL')).toBe('verbose');
    });

    it('4.4 Deve permitir configuração de variáveis customizadas por ambiente', () => {
      pm.setEnvVar('production', 'CUSTOM_KEY', 'prod_value');
      const vars = pm.getEnvVarsForEnvironment('production');
      expect(vars.CUSTOM_KEY).toBe('prod_value');
    });

    it('4.5 Deve atualizar configurações de ambiente', () => {
      pm.updateEnvironment('testing', { apiUrl: 'https://staging-api.myapp.com', customVars: { FEATURE_FLAG: 'true' } });
      const env = pm.getEnvironment('testing');
      expect(env!.apiUrl).toBe('https://staging-api.myapp.com');
      expect(env!.customVars.FEATURE_FLAG).toBe('true');
    });

    it('4.6 Deve retornar lista completa de variáveis por ambiente', () => {
      const vars = pm.getEnvVarsForEnvironment('development');
      expect(vars.API_URL).toBeDefined();
      expect(vars.DB_URL).toBeDefined();
      expect(vars.AUTH_DOMAIN).toBeDefined();
      expect(vars.STORAGE_BUCKET).toBeDefined();
      expect(vars.ENV).toBe('development');
    });
  });

  // ==============================================
  // ETAPA 5 — BUILD PIPELINE TESTS (5 tests)
  // ==============================================

  describe('ETAPA 5 — Build Pipeline', () => {
    it('5.1 Deve iniciar e completar um build', async () => {
      const build = await pm.triggerBuild('android_apk', 'development');

      expect(build.id).toBeDefined();
      expect(build.target).toBe('android_apk');
      expect(build.environment).toBe('development');
      expect(build.status).toBe('completed');
      expect(build.progress).toBe(100);
      expect(build.version).toBeDefined();
      expect(build.buildNumber).toBeDefined();
      expect(build.downloadUrl).toBeDefined();
      expect(build.sizeMb).toBeGreaterThan(0);
    }, 10000);

    it('5.2 Deve executar build com todos os estágios', async () => {
      const build = await pm.triggerBuild('ios_ipa', 'production');

      expect(build.stages.length).toBe(7);
      expect(build.stages[0].name).toBe('Preparação');
      expect(build.stages[6].name).toBe('Assinatura e Finalização');

      build.stages.forEach((stage) => {
        expect(stage.status).toBe('completed');
        expect(stage.durationMs).toBeGreaterThan(0);
        expect(stage.logs.length).toBeGreaterThan(0);
      });

      expect(build.logs.length).toBeGreaterThanOrEqual(7);
      expect(build.artifactType).toBe('IPA');
    }, 10000);

    it('5.3 Deve gerar diferentes artefatos por target', async () => {
      const build1 = await pm.triggerBuild('android_apk');
      expect(build1.target).toBe('android_apk');
      expect(build1.status).toBe('completed');

      const build2 = await pm.triggerBuild('flutter');
      expect(build2.target).toBe('flutter');
      expect(build2.status).toBe('completed');

      const build3 = await pm.triggerBuild('web_pwa');
      expect(build3.target).toBe('web_pwa');
      expect(build3.status).toBe('completed');
    }, 15000);

    it('5.4 Build deve conter configuração completa', async () => {
      const build = await pm.triggerBuild('android_apk');
      const config = build.config;

      expect(config.versionCode).toBeGreaterThan(0);
      expect(config.versionName).toBe('1.0.0');
      expect(config.minSdk).toBe(24);
      expect(config.targetSdk).toBe(34);
      expect(config.compileSdk).toBe(34);
      expect(config.signingConfig.keystore).toBeDefined();
      expect(config.signingConfig.keyAlias).toBeDefined();
      expect(config.dependencies.length).toBeGreaterThanOrEqual(1);
      expect(config.optimizations.shrinkResources).toBe(true);
      expect(config.optimizations.minifyEnabled).toBe(true);
    }, 10000);

    it('5.5 Deve gerenciar histórico de builds', async () => {
      let stats = pm.getBuildStats();
      expect(stats.total).toBe(0);

      await pm.triggerBuild('web_pwa');
      await pm.triggerBuild('flutter');

      stats = pm.getBuildStats();
      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(2);

      const latest = pm.getLatestBuild();
      expect(latest).toBeDefined();
      expect(latest!.target).toBe('flutter');

      const builds = pm.getBuilds();
      const firstBuild = builds[builds.length - 1];
      const found = pm.getBuildById(firstBuild.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(firstBuild.id);

      pm.clearBuildHistory();
      expect(pm.getBuilds().length).toBe(0);
    }, 15000);
  });

  // ==============================================
  // ETAPA 6 — EXPORT PACKAGE MANAGER TESTS (10 tests)
  // ==============================================

  describe('ETAPA 6 — Export Package Manager', () => {
    it('6.1 Deve gerar pacote Android APK', () => {
      const pkg = pm.generateExportPackage('android_apk');
      expect(pkg.id).toBeDefined();
      expect(pkg.target).toBe('android_apk');
      expect(pkg.framework).toBe('Android APK');
      expect(pkg.files.length).toBeGreaterThanOrEqual(2);
      expect(pkg.files.some((f) => f.path.endsWith('.apk'))).toBe(true);
      expect(pkg.files.some((f) => f.path.endsWith('mapping.txt'))).toBe(true);
    });

    it('6.2 Deve gerar pacote Android AAB', () => {
      const pkg = pm.generateExportPackage('android_aab');
      expect(pkg.files.some((f) => f.path.endsWith('.aab'))).toBe(true);
    });

    it('6.3 Deve gerar pacote iOS IPA', () => {
      const pkg = pm.generateExportPackage('ios_ipa');
      expect(pkg.files.some((f) => f.path.endsWith('.ipa'))).toBe(true);
      expect(pkg.files.some((f) => f.path.endsWith('export_options.plist'))).toBe(true);
    });

    it('6.4 Deve gerar pacote Web PWA com service worker e manifest', () => {
      const pkg = pm.generateExportPackage('web_pwa');
      expect(pkg.files.some((f) => f.path === 'dist/manifest.json')).toBe(true);
      expect(pkg.files.some((f) => f.path === 'dist/sw.js')).toBe(true);
      expect(pkg.files.some((f) => f.path === 'dist/index.html')).toBe(true);

      const sw = pkg.files.find((f) => f.path === 'dist/sw.js');
      expect(sw).toBeDefined();
      expect(sw!.content).toContain('CACHE_NAME');
    });

    it('6.5 Deve gerar pacote Web Static', () => {
      const pkg = pm.generateExportPackage('web_static');
      expect(pkg.files.some((f) => f.path === 'dist/index.html')).toBe(true);
      expect(pkg.files.some((f) => f.path === 'dist/styles.css')).toBe(true);
    });

    it('6.6 Deve gerar projeto Flutter completo', () => {
      const pkg = pm.generateExportPackage('flutter');
      expect(pkg.files.some((f) => f.path === 'lib/main.dart')).toBe(true);
      expect(pkg.files.some((f) => f.path === 'pubspec.yaml')).toBe(true);

      const mainDart = pkg.files.find((f) => f.path === 'lib/main.dart');
      expect(mainDart!.content).toContain('MaterialApp');
      expect(mainDart!.content).toContain('v1.0.0');
    });

    it('6.7 Deve gerar projeto React Native completo', () => {
      const pkg = pm.generateExportPackage('react_native');
      expect(pkg.files.some((f) => f.path === 'src/App.tsx')).toBe(true);
      expect(pkg.files.some((f) => f.path.endsWith('package.json'))).toBe(true);
    });

    it('6.8 Deve gerar projeto Kotlin Compose completo', () => {
      const pkg = pm.generateExportPackage('kotlin_compose');
      expect(pkg.files.some((f) => f.path.endsWith('MainActivity.kt'))).toBe(true);
    });

    it('6.9 Deve gerar projeto SwiftUI completo', () => {
      const pkg = pm.generateExportPackage('swiftui');
      expect(pkg.files.some((f) => f.path.includes('App.swift'))).toBe(true);
    });

    it('6.10 Pacote deve conter manifest com metadados', () => {
      const pkg = pm.generateExportPackage('android_apk');
      expect(pkg.manifest.name).toBeDefined();
      expect(pkg.manifest.id).toBeDefined();
      expect(pkg.manifest.version).toBeDefined();
      expect(pkg.manifest.target).toBe('android_apk');
      expect(pkg.manifest.permissions).toBeDefined();
    });
  });

  // ==============================================
  // ETAPA 7 — APP STORE CONFIGURATION TESTS (5 tests)
  // ==============================================

  describe('ETAPA 7 — App Store Configuration', () => {
    it('7.1 Deve gerenciar metadados da Google Play Store', () => {
      const meta = pm.getStoreMetadata();
      expect(meta.googlePlay.title).toBeDefined();
      expect(meta.googlePlay.shortDescription).toBeDefined();
      expect(meta.googlePlay.fullDescription).toBeDefined();
      expect(meta.googlePlay.category).toBeDefined();
      expect(meta.googlePlay.contentRating).toBeDefined();
      expect(meta.googlePlay.screenshots.length).toBeGreaterThan(0);
    });

    it('7.2 Deve gerenciar metadados da Apple App Store', () => {
      const meta = pm.getStoreMetadata();
      expect(meta.appStore.title).toBeDefined();
      expect(meta.appStore.subtitle).toBeDefined();
      expect(meta.appStore.description).toBeDefined();
      expect(meta.appStore.keywords.length).toBeGreaterThan(0);
      expect(meta.appStore.privacyUrl).toBeDefined();
      expect(meta.appStore.supportUrl).toBeDefined();
    });

    it('7.3 Deve atualizar metadados da loja', () => {
      pm.updateStoreMetadata({
        googlePlay: {
          title: 'My Updated App', shortDescription: 'New short desc',
          fullDescription: 'Full desc updated', category: 'Education',
          contentRating: 'Everyone 10+', screenshots: ['https://example.com/screen1.png'],
          releaseNotes: 'Bug fixes', price: 'Free', containsAds: false,
          hasInAppPurchases: true, privacyPolicyUrl: 'https://example.com/privacy',
        },
      });
      const meta = pm.getStoreMetadata();
      expect(meta.googlePlay.title).toBe('My Updated App');
      expect(meta.googlePlay.category).toBe('Education');
      expect(meta.googlePlay.hasInAppPurchases).toBe(true);
    });

    it('7.4 Deve verificar se está pronto para Google Play', () => {
      let ready = pm.isGooglePlayReady();
      expect(ready.ready).toBe(true);

      pm.updateStoreMetadata({
        googlePlay: { ...pm.getStoreMetadata().googlePlay, screenshots: [] },
      });
      ready = pm.isGooglePlayReady();
      expect(ready.ready).toBe(false);
      expect(ready.issues.length).toBeGreaterThan(0);
    });

    it('7.5 Deve verificar se está pronto para App Store', () => {
      let ready = pm.isAppStoreReady();
      expect(ready.ready).toBe(true);

      pm.updateStoreMetadata({
        appStore: { ...pm.getStoreMetadata().appStore, privacyUrl: '' },
      });
      ready = pm.isAppStoreReady();
      expect(ready.ready).toBe(false);
    });
  });

  // ==============================================
  // ETAPA 8 — RUNTIME PRODUCTION MODE TESTS (4 tests)
  // ==============================================

  describe('ETAPA 8 — Runtime Production Mode', () => {
    it('8.1 Deve ativar/desativar modo produção', () => {
      expect(pm.isProductionMode()).toBe(false);
      pm.setProductionRuntimeMode(true);
      expect(pm.isProductionMode()).toBe(true);
      pm.setProductionRuntimeMode(false);
      expect(pm.isProductionMode()).toBe(false);
    });

    it('8.2 Modo produção deve otimizar código', () => {
      pm.setProductionRuntimeMode(false);
      const debugResult = pm.optimizeForProduction(compileProjectToIR(mockProject));
      expect(debugResult.debugCodeRemoved).toBe(false);
      expect(debugResult.logsReduced).toBe(false);
      expect(debugResult.performanceProfile).toBe('development');

      pm.setProductionRuntimeMode(true);
      const prodResult = pm.optimizeForProduction(compileProjectToIR(mockProject));
      expect(prodResult.debugCodeRemoved).toBe(true);
      expect(prodResult.logsReduced).toBe(true);
      expect(prodResult.codeCompressed).toBe(true);
      expect(prodResult.assetsOptimized).toBe(true);
      expect(prodResult.treeShaken).toBe(true);
      expect(prodResult.cacheEnabled).toBe(true);
      expect(prodResult.performanceProfile).toBe('high_performance');
    });

    it('8.3 Modo produção deve reduzir tamanho do bundle', () => {
      pm.setProductionRuntimeMode(true);
      const result = pm.optimizeForProduction(compileProjectToIR(mockProject));

      expect(result.metrics.originalSizeKb).toBeGreaterThan(0);
      expect(result.metrics.optimizedSizeKb).toBeLessThan(result.metrics.originalSizeKb);
      expect(result.metrics.reductionPercent).toBeGreaterThan(0);
    });

    it('8.4 Deve retornar configuração de produção', () => {
      pm.setProductionRuntimeMode(false);
      expect(pm.getRuntimeProductionConfig().mode).toBe('debug');

      pm.setProductionRuntimeMode(true);
      const config = pm.getRuntimeProductionConfig();
      expect(config.mode).toBe('production');
      expect(config.optimizations).toContain('remove_console_logs');
      expect(config.optimizations).toContain('minify_code');
      expect(config.optimizations).toContain('compress_assets');
      expect(config.optimizations).toContain('tree_shaking');
      expect(config.features.sourceMaps).toBe(false);
      expect(config.features.hotReload).toBe(false);
      expect(config.features.performanceMonitoring).toBe(true);
    });
  });

  // ==============================================
  // ETAPA 9 — IR UPDATE TESTS (3 tests)
  // ==============================================

  describe('ETAPA 9 — IR Integration', () => {
    it('9.1 Deve injetar deployment config completo no IR', () => {
      pm.updateManifest({
        name: 'Production App', id: 'com.company.app', version: '2.0.0',
        buildNumber: 15, description: 'App description', category: 'Business',
      });
      pm.setActiveEnvironment('production');

      const ir = compileProjectToIR(mockProject);
      const irWithDeploy = pm.injectDeploymentIntoIR(ir);

      expect(irWithDeploy.appManifest).toBeDefined();
      expect(irWithDeploy.appManifest!.name).toBe('Production App');
      expect(irWithDeploy.appManifest!.id).toBe('com.company.app');
      expect(irWithDeploy.appManifest!.version).toBe('2.0.0');
      expect(irWithDeploy.appManifest!.buildNumber).toBe(15);
      expect(irWithDeploy.appManifest!.description).toBe('App description');
      expect(irWithDeploy.appManifest!.category).toBe('Business');

      expect(irWithDeploy.permissions).toBeDefined();
      expect(irWithDeploy.permissions!.length).toBeGreaterThan(0);
      expect(irWithDeploy.environments).toBeDefined();
      expect(irWithDeploy.environments!.active).toBe('production');
      expect(irWithDeploy.environments!.apiUrl).toContain('api.mobilestudio.app');
      expect(irWithDeploy.buildConfig).toBeDefined();
      expect(irWithDeploy.buildConfig!.version).toBe('2.0.0');
      expect(irWithDeploy.buildConfig!.targets.length).toBeGreaterThan(0);
      expect(irWithDeploy.deploymentConfig).toBeDefined();
      expect(irWithDeploy.deploymentConfig!.googlePlayReady).toBeDefined();
      expect(irWithDeploy.deploymentConfig!.appStoreReady).toBeDefined();
    });

    it('9.2 Deve gerar Production IR completo a partir de um Project', () => {
      pm.updateManifest({ name: 'GenApp', version: '3.1.0', buildNumber: 42 });
      pm.setActiveEnvironment('production');
      pm.setProductionRuntimeMode(true);

      const prodIR = pm.generateProductionIR(mockProject);

      expect(prodIR.appManifest).toBeDefined();
      expect(prodIR.appManifest!.name).toBe('GenApp');
      expect(prodIR.permissions).toBeDefined();
      expect(prodIR.environments).toBeDefined();
      expect(prodIR.buildConfig).toBeDefined();
      expect(prodIR.deploymentConfig).toBeDefined();

      expect(prodIR.screens).toBeDefined();
      expect(prodIR.screens.length).toBe(2);
      expect(prodIR.appInfo.name).toBe('Deploy Test App');
    });

    it('9.3 IR mantém-se como fonte única com todos os layers', () => {
      const fullIR = pm.generateProductionIR(mockProject);

      const requiredFields = ['appManifest', 'permissions', 'environments', 'buildConfig', 'deploymentConfig'];
      requiredFields.forEach((field) => { expect((fullIR as any)[field]).toBeDefined(); });

      const existingFields = [
        'version', 'appInfo', 'screens', 'variables',
        'databaseCollections', 'apiEndpoints', 'logicFlows',
        'authConfig', 'roles', 'securityRules',
        'notificationConfig', 'pushProviders',
        'realtimeEvents', 'communicationFlows',
      ];
      existingFields.forEach((field) => { expect((fullIR as any)[field]).toBeDefined(); });
    });
  });

  // ==============================================
  // ETAPA 10 — DEPLOYMENT DASHBOARD DATA TESTS (3 tests)
  // ==============================================

  describe('ETAPA 10 — Deployment Dashboard', () => {
    it('10.1 Deve retornar dados do dashboard sem builds', () => {
      const data = pm.getDashboardData();
      expect(data.version).toBe('1.0.0');
      expect(data.buildNumber).toBe(1);
      expect(data.buildsPerformed).toBe(0);
      expect(data.buildsCompleted).toBe(0);
      expect(data.activeEnvironment).toBe('development');
      expect(data.assetsCount).toBeGreaterThan(0);
      expect(data.permissionsEnabled).toBeGreaterThan(0);
      expect(data.lastBuild).toBeNull();
      expect(data.recentBuilds.length).toBe(0);
      expect(typeof data.googlePlayReady).toBe('boolean');
      expect(typeof data.appStoreReady).toBe('boolean');
    });

    it('10.2 Deve refletir builds no dashboard', async () => {
      await pm.triggerBuild('web_pwa');
      const data = pm.getDashboardData();
      expect(data.buildsPerformed).toBe(1);
      expect(data.buildsCompleted).toBe(1);
      expect(data.lastBuild).toBeDefined();
      expect(data.lastBuild!.target).toBe('web_pwa');
    }, 10000);

    it('10.3 Deve refletir mudanças de ambiente e modo produção', () => {
      pm.setActiveEnvironment('production');
      pm.setProductionRuntimeMode(true);
      const data = pm.getDashboardData();
      expect(data.activeEnvironment).toBe('production');
      expect(data.productionMode).toBe(true);
    });
  });

  // ==============================================
  // INTEGRATION TESTS (3 tests)
  // ==============================================

  describe('Integration — JS API & Runtime', () => {
    it('Deve expor env vars via app.env na API', () => {
      pm.setActiveEnvironment('development');

      const mockSetProject = () => {};
      const mockShowToast = () => {};
      const app = createStudioAppApi(
        mockProject as any,
        mockSetProject as any,
        { showToast: mockShowToast }
      );
      // createStudioAppApi uses packagingManager singleton, but pm.setActiveEnvironment
      // modifies the same singleton's state indirectly.
      // The app created reads from packagingManager, which was set to 'development'
      // So API_URL should be dev API
      expect(app.env.active).toBe('development');
      expect(app.env.API_URL).toBe('https://dev-api.mobilestudio.app');

      const dbUrl = app.env.get('DB_URL');
      expect(dbUrl).toContain('dev_db');
    });

    it('Deve executar BUILD_TRIGGER via UniversalRuntime', async () => {
      const runtime = new UniversalRuntime();
      runtime.init();

      const result = await runtime.executeAction({
        type: 'BUILD_TRIGGER',
        params: { target: 'android_apk', environment: 'development' },
      });

      expect(result.id).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.target).toBe('android_apk');
      expect(result.logs.length).toBeGreaterThan(0);
    }, 10000);

    it('No-Code Flow deve compilar BUILD_TRIGGER corretamente', () => {
      const flow = {
        id: 'flow_build',
        name: 'Build Action',
        triggerEvent: 'onClick' as const,
        targetComponentId: 'btn_build',
        actions: [
          { id: 'act_build', type: 'BUILD_TRIGGER' as const, params: { target: 'android_apk', environment: 'production' } },
        ],
      };

      const jsCode = compileNoCodeFlowToJS(flow);
      expect(jsCode).toContain('app.build.trigger');
      expect(jsCode).toContain('"android_apk"');
      expect(jsCode).toContain('"production"');
    });
  });

  // ==============================================
  // SECURITY TESTS (2 tests)
  // ==============================================

  describe('Security — Packaging Layer', () => {
    it('Deve sanitizar bundle identifier', () => {
      expect(pm.validateManifest().valid).toBe(true);

      pm.updateManifest({ id: 'Invalid@Bundle#ID!' });
      expect(pm.validateManifest().valid).toBe(false);
    });

    it('Deve validar versão semver', () => {
      pm.updateManifest({ version: '1.0' });
      expect(pm.validateManifest().valid).toBe(false);

      pm.updateManifest({ version: '1.0.0' });
      expect(pm.validateManifest().valid).toBe(true);

      pm.updateManifest({ version: '0.0.1' });
      expect(pm.validateManifest().valid).toBe(true);
    });
  });

  // ==============================================
  // COMPREHENSIVE BUILD PIPELINE & EXPORTER TESTS (3 tests)
  // ==============================================

  describe('Comprehensive — Build Pipeline & Exporters', () => {
    it('Deve executar múltiplas exportações simultâneas', async () => {
      const builds = await Promise.all([
        pm.triggerBuild('android_apk'),
        pm.triggerBuild('ios_ipa'),
        pm.triggerBuild('web_pwa'),
      ]);

      expect(builds.length).toBe(3);
      builds.forEach((b) => { expect(b.status).toBe('completed'); });

      const targets = builds.map((b) => b.target);
      expect(new Set(targets).size).toBe(3);
    }, 15000);

    it('Deve gerar exports para todos os targets com arquivos válidos', () => {
      const targets: BuildTarget[] = [
        'android_apk', 'android_aab', 'ios_ipa',
        'web_pwa', 'web_static', 'flutter',
        'react_native', 'kotlin_compose', 'swiftui',
      ];

      targets.forEach((target) => {
        const pkg = pm.generateExportPackage(target);
        expect(pkg.files.length).toBeGreaterThan(0);
        pkg.files.forEach((file) => {
          expect(file.path).toBeDefined();
          expect(file.content).toBeDefined();
          expect(file.size).toBeGreaterThan(0);
        });
      });
    });

    it('Deve medir tempo de build e tamanho final', async () => {
      const startTime = Date.now();
      const build = await pm.triggerBuild('android_apk');
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThan(0);
      expect(build.sizeMb).toBeGreaterThan(0);
      expect(build.sizeMb).toBeLessThan(50);
    }, 10000);
  });

  // ==============================================
  // AUDITORIA FINAL TESTS (4 tests)
  // ==============================================

  describe('Auditoria Final', () => {
    it('Projetos pequenos: deve configurar rapidamente', () => {
      const smallProject: Project = {
        id: 'small_proj', name: 'Small App', version: '1.0.0',
        device: mockProject.device, assets: [], updatedAt: new Date().toISOString(),
        screens: [{ id: 'scr_a', name: 'Intro', backgroundColor: '#FFF', components: [] }],
        activeScreenId: 'scr_a',
      };

      const ir = pm.generateProductionIR(smallProject);
      expect(ir.appManifest!.name).toBe('Mobile Studio App');
      expect(ir.screens.length).toBe(1);
    });

    it('Projetos grandes: múltiplas telas e componentes', () => {
      const screens = Array.from({ length: 10 }, (_, i) => ({
        id: `scr_big_${i}`, name: `Screen ${i}`, backgroundColor: '#1E293B',
        components: Array.from({ length: 20 }, (_, j) => {
          const comp: CanvasComponent = {
            id: `comp_big_${i}_${j}`, name: `Component ${i}_${j}`,
            type: 'button' as const, category: 'basic' as const,
            x: 10 + j * 10, y: 10 + i * 10, width: 200, height: 44,
            rotation: 0, zIndex: 1, opacity: 1, locked: false, hidden: false,
            paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
            fontFamily: 'Inter', fontSize: 14, fontWeight: '500', color: '#FFF',
            textAlign: 'center' as const, letterSpacing: 0, lineHeight: 20,
            backgroundColor: '#6366F1',
            gradient: { enabled: false, type: 'linear', angle: 0, startColor: '#000', endColor: '#000' },
            border: { style: 'none', color: '#000', width: 0, radiusTopLeft: 8, radiusTopRight: 8, radiusBottomRight: 8, radiusBottomLeft: 8, isRadiusLinked: true },
            shadow: { enabled: false, color: '#000', x: 0, y: 0, blur: 0, spread: 0, inset: false },
            backdropBlur: 0, interaction: { onClickAction: 'none' }, children: [],
          };
          return comp;
        }),
      }));

      const largeProject: Project = {
        id: 'big_proj', name: 'Large App', version: '2.0.0',
        device: mockProject.device, assets: [], updatedAt: new Date().toISOString(),
        screens, activeScreenId: 'scr_big_0',
      };

      const ir = pm.generateProductionIR(largeProject);
      expect(ir.screens.length).toBe(10);
      expect(ir.appManifest).toBeDefined();
      expect(ir.permissions).toBeDefined();
      expect(ir.buildConfig).toBeDefined();

      const fullIr = compileProjectToIR(largeProject);
      expect(fullIr.screens.length).toBe(10);
    });

    it('Múltiplos ambientes: configuração independente', () => {
      pm.updateEnvironment('development', { apiUrl: 'http://localhost:3000' });
      pm.updateEnvironment('production', { apiUrl: 'https://api.production.com' });

      expect(pm.getEnvironment('development')!.apiUrl).toBe('http://localhost:3000');
      expect(pm.getEnvironment('production')!.apiUrl).toBe('https://api.production.com');

      const devVars = pm.getEnvVarsForEnvironment('development');
      const prodVars = pm.getEnvVarsForEnvironment('production');
      expect(devVars.API_URL).not.toBe(prodVars.API_URL);
    });

    it('Exportações simultâneas: todos os targets', () => {
      const targets: BuildTarget[] = [
        'android_apk', 'android_aab', 'ios_ipa',
        'web_pwa', 'web_static', 'flutter',
        'react_native', 'kotlin_compose', 'swiftui',
      ];

      const packages = targets.map((t) => pm.generateExportPackage(t));
      expect(packages.length).toBe(9);
      packages.forEach((pkg) => {
        expect(pkg.files.length).toBeGreaterThan(0);
        expect(pkg.manifest.target).toBeDefined();
      });
    });
  });
});