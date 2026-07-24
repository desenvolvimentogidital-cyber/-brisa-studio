import { describe, it, expect, beforeEach } from 'vitest';
import {
  ProfessionalExportEngine,
  WidgetMappingEngine,
  compileLayout,
  compileStyles,
  compileLogic,
  compileDataLayer,
  compileAssets,
  optimizeIR,
  validateIR,
  createExportWizard,
  auditExportFidelity,
} from '../utils/professionalExportEngine';
import { compileProjectToIR, StudioIR, IRComponent } from '../utils/irCompiler';
import { Project, CanvasComponent } from '../types';

const mockProject: Project = {
  id: 'proj_export_1',
  name: 'Export Test App',
  version: '2.0.0',
  device: { id: 'iphone', name: 'iPhone 15', width: 393, height: 852, type: 'phone', notchType: 'dynamic-island', borderRadius: 48 },
  assets: [],
  updatedAt: new Date().toISOString(),
  screens: [
    { id: 'scr_home', name: 'Home', backgroundColor: '#1E293B', components: [
      { id: 'comp_btn', name: 'btn_login', type: 'button', category: 'basic', x: 40, y: 200, width: 300, height: 48, rotation: 0, zIndex: 1, opacity: 1, locked: false, hidden: false, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, fontFamily: 'Inter', fontSize: 16, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', letterSpacing: 0, lineHeight: 20, backgroundColor: '#6366F1', gradient: { enabled: false, type: 'linear', angle: 0, startColor: '#000', endColor: '#000' }, border: { style: 'none', color: '#000', width: 0, radiusTopLeft: 8, radiusTopRight: 8, radiusBottomRight: 8, radiusBottomLeft: 8, isRadiusLinked: true }, shadow: { enabled: false, color: '#000', x: 0, y: 0, blur: 0, spread: 0, inset: false }, backdropBlur: 0, interaction: { onClickAction: 'navigate', targetScreenId: 'scr_dash' }, children: [] },
      { id: 'comp_txt', name: 'welcome_text', type: 'text', category: 'basic', x: 20, y: 100, width: 350, height: 40, rotation: 0, zIndex: 2, opacity: 1, locked: false, hidden: false, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, fontFamily: 'Inter', fontSize: 24, fontWeight: '700', color: '#E2E8F0', textAlign: 'center', letterSpacing: 0, lineHeight: 28, backgroundColor: 'transparent', gradient: { enabled: false, type: 'linear', angle: 0, startColor: '#000', endColor: '#000' }, border: { style: 'none', color: '#000', width: 0, radiusTopLeft: 0, radiusTopRight: 0, radiusBottomRight: 0, radiusBottomLeft: 0, isRadiusLinked: true }, shadow: { enabled: false, color: '#000', x: 0, y: 0, blur: 0, spread: 0, inset: false }, backdropBlur: 0, interaction: { onClickAction: 'none' }, children: [] },
    ]},
    { id: 'scr_dash', name: 'Dashboard', backgroundColor: '#0F172A', components: [] },
  ],
  activeScreenId: 'scr_home',
};

const ir = compileProjectToIR(mockProject);

describe('FASE 9 — Professional Export Engine (Compiler)', () => {
  let engine: ProfessionalExportEngine;

  beforeEach(() => {
    engine = new ProfessionalExportEngine();
  });

  // ==============================================
  // ETAPA 1 — COMPILER CORE TESTS
  // ==============================================

  describe('ETAPA 1 — Compiler Core', () => {
    it('1.1 Deve compilar projeto para Flutter', () => {
      const result = engine.compile('flutter', ir);
      expect(result.target).toBe('flutter');
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
      expect(result.metrics.totalFiles).toBeGreaterThan(0);
      expect(result.metrics.totalLines).toBeGreaterThan(0);
      expect(result.metrics.totalSizeBytes).toBeGreaterThan(0);

      const mainDart = result.files.find((f) => f.path === 'lib/main.dart');
      expect(mainDart).toBeDefined();
      expect(mainDart!.content).toContain('MaterialApp');
      expect(mainDart!.content).toContain('ExportTestApp');
    });

    it('1.2 Deve compilar projeto para React Native', () => {
      const result = engine.compile('react_native', ir);
      expect(result.target).toBe('react_native');
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);

      const appTsx = result.files.find((f) => f.path === 'App.tsx');
      expect(appTsx).toBeDefined();
      expect(appTsx!.content).toContain('SafeAreaView');
    });

    it('1.3 Deve compilar projeto para Kotlin', () => {
      const result = engine.compile('kotlin', ir);
      expect(result.target).toBe('kotlin');
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);

      const mainActivity = result.files.find((f) => f.path.includes('MainActivity.kt'));
      expect(mainActivity).toBeDefined();
      expect(mainActivity!.content).toContain('ComponentActivity');
    });

    it('1.4 Deve compilar projeto para SwiftUI', () => {
      const result = engine.compile('swiftui', ir);
      expect(result.target).toBe('swiftui');
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);

      const appSwift = result.files.find((f) => f.path.includes('App.swift'));
      expect(appSwift).toBeDefined();
      expect(appSwift!.content).toContain('@main');
    });

    it('1.5 Deve compilar projeto para HTML/PWA', () => {
      const result = engine.compile('html_pwa', ir);
      expect(result.target).toBe('html_pwa');
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);

      const indexHtml = result.files.find((f) => f.path === 'index.html');
      expect(indexHtml).toBeDefined();
      expect(indexHtml!.content).toContain('<!DOCTYPE html>');

      const sw = result.files.find((f) => f.path === 'sw.js');
      expect(sw).toBeDefined();
      expect(sw!.content).toContain('CACHE_NAME');
    });

    it('1.6 Cada compilador deve gerar arquivos na linguagem correta', () => {
      const flutter = engine.compile('flutter', ir);
      expect(flutter.files.every((f) => f.language === 'dart')).toBe(true);

      const rn = engine.compile('react_native', ir);
      expect(rn.files.every((f) => f.language === 'typescript')).toBe(true);

      const kotlin = engine.compile('kotlin', ir);
      expect(kotlin.files.every((f) => f.language === 'kotlin')).toBe(true);
    });

    it('1.7 Deve gerar projeto completo a partir do compiled code', () => {
      const compiled = engine.compile('flutter', ir);
      const project = engine.generate(compiled, 'flutter', ir);
      expect(project.target).toBe('flutter');
      expect(project.files.length).toBeGreaterThan(0);
      expect(project.readyMessage).toContain('✅');
      expect(project.openInstructions).toContain('flutter');
      expect(project.totalSizeBytes).toBeGreaterThan(0);
    });
  });

  // ==============================================
  // ETAPA 2 — WIDGET MAPPING ENGINE TESTS
  // ==============================================

  describe('ETAPA 2 — Widget Mapping Engine', () => {
    it('2.1 Deve mapear widgets corretamente para cada plataforma', () => {
      const mapper = new WidgetMappingEngine();
      expect(mapper.getWidgetName('button', 'flutter')).toBe('ElevatedButton');
      expect(mapper.getWidgetName('button', 'react_native')).toBe('TouchableOpacity');
      expect(mapper.getWidgetName('button', 'kotlin')).toBe('Button');
      expect(mapper.getWidgetName('button', 'swiftui')).toBe('Button');
      expect(mapper.getWidgetName('button', 'html_pwa')).toBe('button');

      expect(mapper.getWidgetName('text', 'flutter')).toBe('Text');
      expect(mapper.getWidgetName('container', 'flutter')).toBe('Container');
      expect(mapper.getWidgetName('image', 'react_native')).toBe('Image');
    });

    it('2.2 Deve retornar fallback para tipos não mapeados', () => {
      const mapper = new WidgetMappingEngine();
      expect(mapper.getWidgetName('unknown_type', 'flutter')).toBe('Container');
      expect(mapper.getWidgetName('unknown_type', 'kotlin')).toBe('Box');
    });

    it('2.3 Deve retornar imports corretos', () => {
      const mapper = new WidgetMappingEngine();
      const buttonImports = mapper.getImports('button', 'flutter');
      expect(buttonImports).toContain('package:flutter/material.dart');

      const rnImports = mapper.getImports('button', 'react_native');
      expect(rnImports.length).toBeGreaterThan(0);
    });

    it('2.4 Deve retornar props configuradas', () => {
      const mapper = new WidgetMappingEngine();
      const props = mapper.getProps('button', 'flutter');
      expect(props).toBeDefined();
      expect(props!.onPressed).toBeDefined();
    });

    it('2.5 Deve permitir registro de mapeamento customizado', () => {
      const mapper = new WidgetMappingEngine();
      mapper.registerMapping('custom_component', {
        flutter: 'CustomWidget',
        react_native: 'CustomView',
      });
      expect(mapper.getWidgetName('custom_component', 'flutter')).toBe('CustomWidget');
      expect(mapper.getWidgetName('custom_component', 'react_native')).toBe('CustomView');
    });

    it('2.6 A engine exportada usa o WidgetMapper', () => {
      const mapper = engine.getWidgetMapper();
      expect(mapper).toBeDefined();
      expect(mapper.getWidgetName('button', 'flutter')).toBe('ElevatedButton');
    });
  });

  // ==============================================
  // ETAPA 3 — LAYOUT COMPILER TESTS
  // ==============================================

  describe('ETAPA 3 — Layout Compiler', () => {
    it('3.1 Deve compilar layout posicional', () => {
      const comp: IRComponent = {
        id: 'test', name: 'test', type: 'container',
        x: 100, y: 200, width: 300, height: 400,
        visible: true, content: 'Test', backgroundColor: '#FF0000',
        color: '#FFF', borderRadius: 8, fontSize: 16, fontWeight: '600',
        textAlign: 'center', children: [], events: {},
      };

      const layout = compileLayout(comp);
      expect(layout.flutter).toContain('Positioned');
      expect(layout.flutter).toContain('left: 100');
      expect(layout.flutter).toContain('top: 200');

      expect(layout.react_native).toContain('left: 100');
      expect(layout.kotlin).toContain('offset');
      expect(layout.html_pwa).toContain('100px');
    });

    it('3.2 Deve compilar auto layout horizontal', () => {
      const comp: IRComponent = {
        id: 'test', name: 'test', type: 'row',
        x: 0, y: 0, width: 400, height: 100,
        visible: true, content: '', backgroundColor: 'transparent',
        color: '#000', borderRadius: 0, fontSize: 14, fontWeight: '400',
        textAlign: 'left', children: [], events: {},
        autoLayout: { enabled: true, direction: 'horizontal', gap: 8, padding: 16 },
      };

      const layout = compileLayout(comp);
      expect(layout.flutter).toContain('Row');
      expect(layout.react_native).toContain('flexDirection');
      expect(layout.react_native).toContain('row');
      expect(layout.kotlin).toContain('Row');
      expect(layout.swiftui).toContain('HStack');
      expect(layout.html_pwa).toContain('flex-direction: row');
    });

    it('3.3 Deve compilar auto layout vertical', () => {
      const comp: IRComponent = {
        id: 'test', name: 'test', type: 'column',
        x: 0, y: 0, width: 300, height: 500,
        visible: true, content: '', backgroundColor: 'transparent',
        color: '#000', borderRadius: 0, fontSize: 14, fontWeight: '400',
        textAlign: 'left', children: [], events: {},
        autoLayout: { enabled: true, direction: 'vertical', gap: 12, padding: 8 },
      };

      const layout = compileLayout(comp);
      expect(layout.flutter).toContain('Column');
      expect(layout.react_native).toContain('column');
      expect(layout.kotlin).toContain('Column');
      expect(layout.swiftui).toContain('VStack');
      expect(layout.html_pwa).toContain('flex-direction: column');
    });
  });

  // ==============================================
  // ETAPA 4 — STYLE COMPILER TESTS
  // ==============================================

  describe('ETAPA 4 — Style Compiler', () => {
    it('4.1 Deve compilar estilos para cada plataforma', () => {
      const comp: IRComponent = {
        id: 'test', name: 'test', type: 'text',
        x: 0, y: 0, width: 200, height: 50,
        visible: true, content: 'Hello World',
        backgroundColor: '#6366F1', color: '#FFFFFF',
        borderRadius: 12, fontSize: 18, fontWeight: '700',
        textAlign: 'center', children: [], events: {},
      };

      const styles = compileStyles(comp);
      expect(styles.flutter).toContain('0xFF6366F1');
      expect(styles.flutter).toContain('0xFFFFFFFF');
      expect(styles.flutter).toContain('18');

      expect(styles.react_native).toContain('#6366F1');
      expect(styles.react_native).toContain('#FFFFFF');

      expect(styles.kotlin).toContain('0xFF6366F1');
      expect(styles.kotlin).toContain('18.sp');

      expect(styles.html_pwa).toContain('#6366F1');
      expect(styles.html_pwa).toContain('18px');
    });

    it('4.2 Deve compilar borderRadius corretamente', () => {
      const comp: IRComponent = {
        id: 'test', name: 'test', type: 'container',
        x: 0, y: 0, width: 100, height: 100,
        visible: true, content: '', backgroundColor: '#000',
        color: '#FFF', borderRadius: 16, fontSize: 14, fontWeight: '400',
        textAlign: 'left', children: [], events: {},
      };

      const styles = compileStyles(comp);
      expect(styles.flutter).toContain('16');
      expect(styles.react_native).toContain('16');
      expect(styles.kotlin).toContain('16.dp');
      expect(styles.html_pwa).toContain('16px');
    });
  });

  // ==============================================
  // ETAPA 5 — LOGIC COMPILER TESTS
  // ==============================================

  describe('ETAPA 5 — Logic Compiler', () => {
    it('5.1 Deve compilar lógica de navegação', () => {
      const snippets = compileLogic(ir, 'flutter');
      expect(snippets.length).toBeGreaterThan(0);
      expect(snippets.some((s) => s.includes('Screen'))).toBe(true);
    });

    it('5.2 Deve compilar eventos de componentes', () => {
      const snippets = compileLogic(ir, 'flutter');
      expect(snippets.some((s) => s.includes('onClick'))).toBe(true);
    });

    it('5.3 Deve compilar fluxos de autenticação', () => {
      const snippets = compileLogic(ir, 'flutter');
      expect(snippets.some((s) => s.includes('auth'))).toBe(true);
    });
  });

  // ==============================================
  // ETAPA 6 — DATA COMPILER TESTS
  // ==============================================

  describe('ETAPA 6 — Data Compiler', () => {
    it('6.1 Deve compilar modelos de banco para Flutter', () => {
      const data = compileDataLayer(ir, 'flutter');
      expect(data.flutter.length).toBeGreaterThan(0);
      expect(data.flutter.some((c) => c.includes('class'))).toBe(true);
      expect(data.flutter.some((c) => c.includes('fromJson'))).toBe(true);
      expect(data.flutter.some((c) => c.includes('toJson'))).toBe(true);
    });

    it('6.2 Deve compilar modelos de banco para React Native', () => {
      const data = compileDataLayer(ir, 'react_native');
      expect(data.react_native.length).toBeGreaterThan(0);
      expect(data.react_native.some((c) => c.includes('interface'))).toBe(true);
      expect(data.react_native.some((c) => c.includes('create'))).toBe(true);
    });

    it('6.3 Deve compilar modelos de banco para Kotlin', () => {
      const data = compileDataLayer(ir, 'kotlin');
      expect(data.kotlin.length).toBeGreaterThan(0);
      expect(data.kotlin.some((c) => c.includes('data class'))).toBe(true);
    });

    it('6.4 Deve compilar modelos de banco para SwiftUI', () => {
      const data = compileDataLayer(ir, 'swiftui');
      expect(data.swiftui.length).toBeGreaterThan(0);
      expect(data.swiftui.some((c) => c.includes('Codable'))).toBe(true);
      expect(data.swiftui.some((c) => c.includes('Identifiable'))).toBe(true);
    });

    it('6.5 Deve compilar API endpoints para cada plataforma', () => {
      const data = compileDataLayer(ir, 'flutter');
      expect(data.flutter.some((c) => c.includes('http.get'))).toBe(true);
      expect(data.flutter.some((c) => c.includes('jsonDecode'))).toBe(true);

      const rnData = compileDataLayer(ir, 'react_native');
      expect(rnData.react_native.some((c) => c.includes('fetch'))).toBe(true);

      const htmlData = compileDataLayer(ir, 'html_pwa');
      expect(htmlData.html_pwa.some((c) => c.includes('fetch'))).toBe(true);
    });
  });

  // ==============================================
  // ETAPA 7 — ASSET COMPILER TESTS
  // ==============================================

  describe('ETAPA 7 — Asset Compiler', () => {
    it('7.1 Deve organizar assets na estrutura correta de cada plataforma', () => {
      const assets = [
        { name: 'icon.png', url: 'https://example.com/icon.png', type: 'icon', mimeType: 'image/png' },
        { name: 'bg.jpg', url: 'https://example.com/bg.jpg', type: 'image', mimeType: 'image/jpg' },
      ];

      const compiled = compileAssets(ir, assets);
      expect(compiled.flutter.length).toBeGreaterThan(0);
      expect(compiled.flutter.some((f) => f.path.startsWith('assets/'))).toBe(true);

      expect(compiled.react_native.length).toBeGreaterThan(0);
      expect(compiled.react_native.some((f) => f.path === 'react-native.config.js')).toBe(true);

      expect(compiled.kotlin.length).toBeGreaterThan(0);
      expect(compiled.swiftui.length).toBeGreaterThan(0);

      expect(compiled.html_pwa.some((f) => f.path === 'assets/manifest.json')).toBe(true);
    });
  });

  // ==============================================
  // ETAPA 8 — PROJECT GENERATOR TESTS
  // ==============================================

  describe('ETAPA 8 — Project Generator', () => {
    it('8.1 Deve gerar projeto Flutter com pubspec.yaml', () => {
      const compiled = engine.compile('flutter', ir);
      const project = engine.generate(compiled, 'flutter', ir);
      expect(project.files.some((f) => f.path === 'pubspec.yaml')).toBe(true);
      expect(project.files.some((f) => f.path === 'analysis_options.yaml')).toBe(true);
      expect(project.files.some((f) => f.path === 'test/widget_test.dart')).toBe(true);
    });

    it('8.2 Deve gerar projeto React Native com package.json e app.json', () => {
      const compiled = engine.compile('react_native', ir);
      const project = engine.generate(compiled, 'react_native', ir);
      expect(project.files.some((f) => f.path === 'package.json')).toBe(true);
      expect(project.files.some((f) => f.path === 'app.json')).toBe(true);
      expect(project.files.some((f) => f.path === 'tsconfig.json')).toBe(true);
    });

    it('8.3 Deve gerar projeto Kotlin com build.gradle.kts e AndroidManifest', () => {
      const compiled = engine.compile('kotlin', ir);
      const project = engine.generate(compiled, 'kotlin', ir);
      expect(project.files.some((f) => f.path === 'build.gradle.kts')).toBe(true);
      expect(project.files.some((f) => f.path.includes('AndroidManifest.xml'))).toBe(true);
    });

    it('8.4 Deve gerar projeto SwiftUI com Info.plist', () => {
      const compiled = engine.compile('swiftui', ir);
      const project = engine.generate(compiled, 'swiftui', ir);
      expect(project.files.some((f) => f.path === 'Info.plist')).toBe(true);
    });

    it('8.5 Deve gerar projeto HTML/PWA com manifest e service worker', () => {
      const compiled = engine.compile('html_pwa', ir);
      const project = engine.generate(compiled, 'html_pwa', ir);
      expect(project.files.some((f) => f.path === 'manifest.json')).toBe(true);
      expect(project.files.some((f) => f.path === 'README.md')).toBe(true);
    });

    it('8.6 Projetos devem conter mensagem de ready e instruções de abertura', () => {
      const compiled = engine.compile('flutter', ir);
      const project = engine.generate(compiled, 'flutter', ir);
      expect(project.readyMessage).toBeDefined();
      expect(project.openInstructions).toBeDefined();
      expect(project.totalSizeBytes).toBeGreaterThan(0);
    });
  });

  // ==============================================
  // ETAPA 9 — OPTIMIZATION PIPELINE TESTS
  // ==============================================

  describe('ETAPA 9 — Optimization Pipeline', () => {
    it('9.1 Nível "none" não deve remover nada', () => {
      const { ir: optimized, result } = optimizeIR(ir, { optimizationLevel: 'none' });
      expect(optimized.screens.length).toBe(ir.screens.length);
      expect(optimized.variables.length).toBe(ir.variables.length);
      expect(result.deadCodeEliminated).toBe(false);
      expect(result.treeshaken).toBe(false);
    });

    it('9.2 Nível "basic" deve fazer tree shaking', () => {
      const { result } = optimizeIR(ir, { optimizationLevel: 'basic' });
      expect(result.deadCodeEliminated).toBe(true);
      expect(result.treeshaken).toBe(true);
      expect(result.metrics.originalComponentCount).toBeGreaterThan(0);
    });

    it('9.3 Nível "aggressive" deve remover variáveis e fluxos não utilizados', () => {
      const { result } = optimizeIR(ir, { optimizationLevel: 'aggressive' });
      expect(result.deadCodeEliminated).toBe(true);
      expect(result.deduplicated).toBe(true);
      expect(result.metrics.reductionPercent).toBeGreaterThanOrEqual(0);
    });

    it('9.4 Deve reportar métricas de otimização', () => {
      const { result } = optimizeIR(ir, { optimizationLevel: 'basic' });
      expect(result.metrics.originalComponentCount).toBeGreaterThan(0);
      expect(result.metrics.optimizedComponentCount).toBeGreaterThanOrEqual(0);
      expect(result.metrics.originalVariableCount).toBeGreaterThan(0);
      expect(result.metrics.optimizedVariableCount).toBeGreaterThan(0);
    });
  });

  // ==============================================
  // ETAPA 10 — VALIDATION ENGINE TESTS
  // ==============================================

  describe('ETAPA 10 — Validation Engine', () => {
    it('10.1 Deve validar IR completo sem erros críticos', () => {
      const report = validateIR(ir);
      expect(report.valid).toBe(true);
      expect(report.summary.errors).toBe(0);
      expect(report.summary.warnings).toBe(0);
    });

    it('10.2 Deve detectar falta de permissões', () => {
      const irNoPerms = { ...ir, permissions: [] };
      const report = validateIR(irNoPerms);
      expect(report.issues.some((i) => i.category === 'permission')).toBe(true);
    });

    it('10.3 Deve detectar falta de ambiente', () => {
      const irNoEnv = { ...ir, environments: undefined };
      const report = validateIR(irNoEnv);
      expect(report.issues.some((i) => i.category === 'environment')).toBe(true);
    });

    it('10.4 Deve detectar problema no build config', () => {
      const irNoBuild = { ...ir, buildConfig: undefined };
      const report = validateIR(irNoBuild);
      expect(report.issues.some((i) => i.category === 'build')).toBe(true);
    });

    it('10.5 Deve gerar resumo com contagem de issues', () => {
      const irBad = { ...ir, permissions: [], buildConfig: undefined, environments: undefined, appManifest: undefined };
      const report = validateIR(irBad);
      expect(report.summary.totalIssues).toBeGreaterThan(0);
      expect(report.summary.errors).toBeGreaterThan(0);
      expect(report.summary.warnings).toBeGreaterThan(0);
    });
  });

  // ==============================================
  // ETAPA 11 — EXPORT WIZARD TESTS
  // ==============================================

  describe('ETAPA 11 — Export Wizard', () => {
    it('11.1 Deve criar wizard com 5 etapas', () => {
      const wizard = createExportWizard();
      expect(wizard.steps.length).toBe(5);
      expect(wizard.steps[0].id).toBe('platform');
      expect(wizard.steps[1].id).toBe('environment');
      expect(wizard.steps[2].id).toBe('build');
      expect(wizard.steps[3].id).toBe('validation');
      expect(wizard.steps[4].id).toBe('generate');
    });

    it('11.2 Primeira etapa deve permitir selecionar plataforma', () => {
      const wizard = createExportWizard();
      const platformStep = wizard.steps[0];
      expect(platformStep.fields.length).toBe(1);
      expect(platformStep.fields[0].id).toBe('target');
      expect(platformStep.fields[0].options!.length).toBe(5);
    });

    it('11.3 Segunda etapa deve configurar ambiente', () => {
      const wizard = createExportWizard();
      const envStep = wizard.steps[1];
      expect(envStep.fields.length).toBe(2);
      expect(envStep.fields[0].id).toBe('environment');
      expect(envStep.fields[1].id).toBe('apiUrl');
    });

    it('11.4 A engine deve criar wizard', () => {
      const wizard = engine.createWizard();
      expect(wizard).toBeDefined();
      expect(wizard.currentStep).toBe(0);
      expect(wizard.completed).toBe(false);
    });
  });

  // ==============================================
  // ETAPA 12 — AUDITORIA TESTS
  // ==============================================

  describe('ETAPA 12 — Auditoria', () => {
    it('12.1 Deve executar auditoria e comparar fidelidade', () => {
      const compiled = engine.compile('flutter', ir);
      const project = engine.generate(compiled, 'flutter', ir);
      const audit = auditExportFidelity(ir, project);
      expect(audit.performed).toBe(true);
      expect(audit.irUsed).toBe(true);
      expect(audit.totalComparisons).toBeGreaterThan(0);
    });

    it('12.2 Deve verificar correspondência de telas, componentes e dados', () => {
      const compiled = engine.compile('flutter', ir);
      const project = engine.generate(compiled, 'flutter', ir);
      const audit = auditExportFidelity(ir, project);

      const screenComp = audit.comparisons.find((c) => c.field.includes('Telas'));
      expect(screenComp).toBeDefined();
      expect(screenComp!.match).toBe(true);

      const nameComp = audit.comparisons.find((c) => c.field.includes('Nome'));
      expect(nameComp).toBeDefined();
      expect(nameComp!.match).toBe(true);
    });

    it('12.3 Deve calcular matchPercent e status', () => {
      const compiled = engine.compile('flutter', ir);
      const project = engine.generate(compiled, 'flutter', ir);
      const audit = auditExportFidelity(ir, project);
      expect(audit.matchPercent).toBeGreaterThanOrEqual(0);
      expect(audit.status).toMatch(/^(passed|failed|partial)$/);
    });
  });

  // ==============================================
  // COMPREHENSIVE TESTS
  // ==============================================

  describe('Comprehensive — End-to-End Export', () => {
    it('Deve exportar projeto para todas as 5 plataformas', () => {
      const targets = ['flutter', 'react_native', 'kotlin', 'swiftui', 'html_pwa'] as const;
      for (const target of targets) {
        const result = engine.compile(target, ir);
        expect(result.errors.length).toBe(0);
        expect(result.files.length).toBeGreaterThan(0);

        const project = engine.generate(result, target, ir);
        expect(project.files.length).toBeGreaterThan(0);
        expect(project.readyMessage).toContain('✅');
      }
    });

    it('Deve usar exclusivamente o IR (sem acesso ao canvas)', () => {
      // The compile function only receives StudioIR, not Project or CanvasComponent
      const compileFn = engine.compile.bind(engine);
      const result = compileFn('flutter', ir);
      expect(result.errors.length).toBe(0);
      expect(result.metrics.totalFiles).toBeGreaterThan(0);
    });

    it('Deve gerar relatório de validação antes da exportação', () => {
      const report = engine.validate(ir);
      expect(report.valid).toBe(true);
      expect(report.issues).toBeDefined();
    });

    it('Deve gerar código compilado com métricas', () => {
      const result = engine.compile('flutter', ir);
      expect(result.metrics.totalFiles).toBeGreaterThan(0);
      expect(result.metrics.totalLines).toBeGreaterThan(0);
      expect(result.metrics.totalSizeBytes).toBeGreaterThan(0);
    });
  });
});