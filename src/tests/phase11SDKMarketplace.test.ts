import { describe, it, expect, beforeEach } from 'vitest';
import {
  componentSDK,
  ComponentSDK,
  pluginSDK,
  PluginSDK,
  marketplace,
  Marketplace,
  themeEngine,
  ThemeEngine,
  templateEngine,
  TemplateEngine,
  customExporterRegistry,
  CustomExporterRegistry,
  aiExtensionAPI,
  AIExtensionAPI,
  documentationGenerator,
  DocumentationGenerator,
  packageManager,
  PackageManager,
  developerPortal,
  DeveloperPortal,
  SDKMarketplacePlatform,
  SDKComponentRegistration,
  SDKProperty,
} from '../utils/sdkMarketplacePlatform';
import { compileProjectToIR } from '../utils/irCompiler';
import { Project } from '../types';

const mockProject: Project = {
  id: 'proj_sdk_1',
  name: 'SDK Test App',
  version: '1.0.0',
  device: { id: 'iphone', name: 'iPhone 15', width: 393, height: 852, type: 'phone', notchType: 'dynamic-island', borderRadius: 48 },
  assets: [],
  updatedAt: new Date().toISOString(),
  screens: [
    { id: 'scr_1', name: 'Home', backgroundColor: '#1E293B', components: [] },
    { id: 'scr_2', name: 'Settings', backgroundColor: '#0F172A', components: [] },
  ],
  activeScreenId: 'scr_1',
};

const ir = compileProjectToIR(mockProject);

describe('FASE 11 — SDK, Marketplace & AI Extension Platform', () => {
  // ==============================================
  // ETAPA 1 — COMPONENT SDK TESTS
  // ==============================================

  describe('ETAPA 1 — Universal Component SDK', () => {
    let sdk: ComponentSDK;

    beforeEach(() => {
      sdk = new ComponentSDK();
    });

    it('1.1 Deve registrar componente customizado', () => {
      const result = sdk.registerComponent({
        name: 'Chart',
        category: 'Data',
        description: 'Gráfico de barras customizado',
        tags: ['chart', 'data', 'visualization'],
        properties: [
          { id: 'title', name: 'Title', type: 'string', defaultValue: 'Chart', required: true, description: 'Chart title', category: 'content' },
          { id: 'height', name: 'Height', type: 'number', defaultValue: 300, required: false, description: 'Chart height', category: 'layout', min: 100, max: 800 },
        ],
        events: ['onClick', 'onHover'],
        defaultWidth: 400,
        defaultHeight: 300,
        renderer: (props) => `<div class="chart" style="height:${props.height}px"><h3>${props.title}</h3></div>`,
        exporters: {
          flutter: (props) => `Container(height: ${props.height}, child: Text('${props.title}'))`,
          react_native: (props) => `<View style={{height:${props.height}}}><Text>${props.title}</Text></View>`,
        },
        version: '1.0.0',
        author: 'Test Dev',
      });
      expect(result).toBe(true);
    });

    it('1.2 Deve rejeitar registro duplicado', () => {
      sdk.registerComponent({
        name: 'Chart', category: 'Data', description: '', tags: [],
        properties: [], events: [], defaultWidth: 100, defaultHeight: 100,
        renderer: () => '', exporters: {}, version: '1.0.0', author: '',
      });
      const result = sdk.registerComponent({
        name: 'Chart', category: 'Data', description: '', tags: [],
        properties: [], events: [], defaultWidth: 100, defaultHeight: 100,
        renderer: () => '', exporters: {}, version: '1.0.0', author: '',
      });
      expect(result).toBe(false);
    });

    it('1.3 Deve listar componentes registrados', () => {
      sdk.registerComponent({
        name: 'Button', category: 'Basic', description: '', tags: [],
        properties: [], events: [], defaultWidth: 100, defaultHeight: 40,
        renderer: () => '', exporters: {}, version: '1.0.0', author: '',
      });
      sdk.registerComponent({
        name: 'Card', category: 'Layout', description: '', tags: [],
        properties: [], events: [], defaultWidth: 200, defaultHeight: 150,
        renderer: () => '', exporters: {}, version: '1.0.0', author: '',
      });
      expect(sdk.getComponents().length).toBe(2);
      expect(sdk.getComponentsByCategory('Basic').length).toBe(1);
    });

    it('1.4 Deve criar instâncias de componentes', () => {
      sdk.registerComponent({
        name: 'Button', category: 'Basic', description: '', tags: [],
        properties: [
          { id: 'label', name: 'Label', type: 'string', defaultValue: 'Click', required: true, description: '', category: 'content' },
          { id: 'color', name: 'Color', type: 'color', defaultValue: '#6366F1', required: false, description: '', category: 'style' },
        ],
        events: [], defaultWidth: 120, defaultHeight: 44,
        renderer: (props) => `<button style="background:${props.color}">${props.label}</button>`,
        exporters: {}, version: '1.0.0', author: '',
      });

      const instance = sdk.createInstance('Button', { label: 'Save' });
      expect(instance).not.toBeNull();
      expect(instance!.props.label).toBe('Save');
      expect(instance!.props.color).toBe('#6366F1');
      expect(instance!.width).toBe(120);
    });

    it('1.5 Deve renderizar componente', () => {
      sdk.registerComponent({
        name: 'Greeting', category: 'Content', description: '', tags: [],
        properties: [
          { id: 'name', name: 'Name', type: 'string', defaultValue: 'World', required: true, description: '', category: 'content' },
        ],
        events: [], defaultWidth: 200, defaultHeight: 50,
        renderer: (props) => `<div>Hello, ${props.name}!</div>`,
        exporters: {}, version: '1.0.0', author: '',
      });

      const instance = sdk.createInstance('Greeting', { name: 'Mobile Studio' });
      const html = sdk.renderComponent(instance!);
      expect(html).toContain('Hello, Mobile Studio!');
    });

    it('1.6 Deve exportar para plataforma específica', () => {
      sdk.registerComponent({
        name: 'Label', category: 'Content', description: '', tags: [],
        properties: [
          { id: 'text', name: 'Text', type: 'string', defaultValue: '', required: true, description: '', category: 'content' },
        ],
        events: [], defaultWidth: 200, defaultHeight: 30,
        renderer: () => '', exporters: {
          flutter: (props) => `Text('${props.text}')`,
        }, version: '1.0.0', author: '',
      });

      const instance = sdk.createInstance('Label', { text: 'Hello' });
      const code = sdk.renderForExport(instance!, 'flutter');
      expect(code).toContain("Text('Hello')");
    });

    it('1.7 Deve retornar estatísticas', () => {
      const stats = sdk.getStats();
      expect(stats.totalComponents).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(stats.categories)).toBe(true);
    });
  });

  // ==============================================
  // ETAPA 2 — PLUGIN SDK TESTS
  // ==============================================

  describe('ETAPA 2 — Plugin SDK', () => {
    it('2.1 PluginSDK deve exigir init antes do acesso', () => {
      const sdk = new PluginSDK();
      expect(() => sdk.getAccess()).toThrow();
    });

    it('2.2 PluginSDK deve aceitar init com acesso', () => {
      const sdk = new PluginSDK();
      sdk.init({
        canvas: { getComponents: () => [], addComponent: () => {}, updateComponent: () => {}, removeComponent: () => {}, getSelected: () => [] },
        project: { get: () => mockProject, update: () => {}, getScreens: () => [], addScreen: () => {}, getActiveScreen: () => undefined },
        ir: { getCurrent: () => null, compile: () => ir },
        runtime: { executeAction: async () => {}, getVariable: () => null, setVariable: () => {} },
        data: { query: async () => [], create: async () => ({}), update: async () => ({}), delete: async () => true },
        export: { getTargets: () => [], compile: () => ({}), generate: () => ({}) },
        notifications: { showToast: () => {} },
        sdk: { registerComponent: () => true, getComponents: () => [] },
      });
      const access = sdk.getAccess();
      expect(access.canvas).toBeDefined();
      expect(access.project).toBeDefined();
      expect(access.ir).toBeDefined();
      expect(access.runtime).toBeDefined();
      expect(access.data).toBeDefined();
      expect(access.export).toBeDefined();
      expect(access.sdk).toBeDefined();
    });

    it('2.3 PluginSDK deve registrar plugin no PluginManager', () => {
      const sdk = new PluginSDK();
      const result = sdk.registerPlugin({
        id: 'test_plugin', name: 'Test Plugin', version: '1.0.0',
        description: 'A test plugin', author: 'Tester', category: 'ui-component',
      });
      expect(result).toBe(true);
      expect(sdk.getPlugins().length).toBeGreaterThan(0);
    });
  });

  // ==============================================
  // ETAPA 3 — MARKETPLACE TESTS
  // ==============================================

  describe('ETAPA 3 — Marketplace', () => {
    let store: Marketplace;

    beforeEach(() => {
      store = new Marketplace();
    });

    it('3.1 Deve adicionar e listar itens', () => {
      store.addItem({
        id: 'comp_chart', name: 'Chart Pro', version: '2.0.0',
        description: 'Advanced charts', author: 'DevCo', type: 'component',
        category: 'Data', tags: ['chart'], screenshots: [], rating: 4.5,
        downloads: 1200, installed: false, hasUpdate: false, license: 'MIT',
        sizeKb: 45, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        requires: [], compatibleApps: [],
      });
      expect(store.getItems().length).toBe(1);
    });

    it('3.2 Deve pesquisar itens', () => {
      store.addItem({
        id: 'plugin_auth', name: 'Auth Pro', version: '1.0.0',
        description: 'Authentication plugin', author: 'AuthCo', type: 'plugin',
        category: 'Security', tags: ['auth', 'login'], screenshots: [], rating: 5,
        downloads: 500, installed: false, hasUpdate: false, license: 'MIT',
        sizeKb: 30, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        requires: [], compatibleApps: [],
      });
      const results = store.getItems({ query: 'auth' });
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Auth Pro');
    });

    it('3.3 Deve instalar e desinstalar itens', () => {
      store.addItem({
        id: 'theme_dark', name: 'Dark Pro', version: '1.0.0',
        description: 'Dark theme', author: 'ThemeCo', type: 'theme',
        category: 'Appearance', tags: ['dark'], screenshots: [], rating: 4,
        downloads: 300, installed: false, hasUpdate: false, license: 'MIT',
        sizeKb: 12, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        requires: [], compatibleApps: [],
      });

      expect(store.install('theme_dark')).toBe(true);
      expect(store.getItem('theme_dark')!.installed).toBe(true);

      expect(store.uninstall('theme_dark')).toBe(true);
      expect(store.getItem('theme_dark')!.installed).toBe(false);
    });

    it('3.4 Deve detectar atualizações', () => {
      store.addItem({
        id: 'pkg_test', name: 'Test Pkg', version: '2.0.0',
        description: '', author: '', type: 'package',
        category: '', tags: [], screenshots: [], rating: 0,
        downloads: 0, installed: false, hasUpdate: false, license: '',
        sizeKb: 0, createdAt: '', updatedAt: '',
        requires: [], compatibleApps: [],
      });
      store.install('pkg_test');
      // Update the item to a newer version
      store.addItem({
        id: 'pkg_test', name: 'Test Pkg', version: '3.0.0',
        description: '', author: '', type: 'package',
        category: '', tags: [], screenshots: [], rating: 0,
        downloads: 0, installed: false, hasUpdate: false, license: '',
        sizeKb: 0, createdAt: '', updatedAt: '',
        requires: [], compatibleApps: [],
      });
      const item = store.getItem('pkg_test');
      expect(item!.hasUpdate).toBe(true);
    });

    it('3.5 Deve retornar estatísticas', () => {
      store.addItem({
        id: 'a', name: 'A', version: '1', description: '', author: '', type: 'component',
        category: '', tags: [], screenshots: [], rating: 0, downloads: 10,
        installed: false, hasUpdate: false, license: '', sizeKb: 0,
        createdAt: '', updatedAt: '', requires: [], compatibleApps: [],
      });
      store.addItem({
        id: 'b', name: 'B', version: '1', description: '', author: '', type: 'plugin',
        category: '', tags: [], screenshots: [], rating: 0, downloads: 5,
        installed: false, hasUpdate: false, license: '', sizeKb: 0,
        createdAt: '', updatedAt: '', requires: [], compatibleApps: [],
      });
      const stats = store.getStats();
      expect(stats.totalItems).toBe(2);
      expect(stats.totalDownloads).toBe(15);
      expect(stats.byType.component).toBe(1);
      expect(stats.byType.plugin).toBe(1);
    });
  });

  // ==============================================
  // ETAPA 4 — THEME ENGINE TESTS
  // ==============================================

  describe('ETAPA 4 — Theme Engine', () => {
    let themes: ThemeEngine;

    beforeEach(() => {
      themes = new ThemeEngine();
    });

    it('4.1 Deve ter temas padrão (dark e light)', () => {
      expect(themes.getThemes().length).toBe(2);
      expect(themes.getTheme('dark')).toBeDefined();
      expect(themes.getTheme('light')).toBeDefined();
    });

    it('4.2 Deve alternar entre temas', () => {
      expect(themes.getActiveTheme().id).toBe('dark');
      themes.setActiveTheme('light');
      expect(themes.getActiveTheme().id).toBe('light');
      expect(themes.getActiveTheme().isDark).toBe(false);
    });

    it('4.3 Deve alternar dark/light', () => {
      themes.toggleDarkLight();
      expect(themes.getActiveTheme().id).toBe('light');
      themes.toggleDarkLight();
      expect(themes.getActiveTheme().id).toBe('dark');
    });

    it('4.4 Deve registrar tema customizado', () => {
      const result = themes.registerTheme({
        id: 'ocean', name: 'Ocean', description: 'Blue ocean theme',
        author: 'Designer', version: '1.0.0',
        tokens: themes.getActiveTokens(),
        isDark: false,
      });
      expect(result).toBe(true);
      expect(themes.getThemes().length).toBe(3);
    });

    it('4.5 Deve gerar CSS variables', () => {
      const cssVars = themes.getCSSVariables();
      expect(cssVars['--color-primary']).toBe('#6366F1');
      expect(cssVars['--color-background']).toBe('#0F172A');
      expect(cssVars['--font-family']).toBeDefined();
    });

    it('4.6 Deve retornar tokens ativos', () => {
      const tokens = themes.getActiveTokens();
      expect(tokens.colors.primary).toBeDefined();
      expect(tokens.typography.fontFamily).toBeDefined();
      expect(tokens.spacing.md).toBe(16);
      expect(tokens.borders.radiusMd).toBe(8);
    });
  });

  // ==============================================
  // ETAPA 5 — TEMPLATE ENGINE TESTS
  // ==============================================

  describe('ETAPA 5 — Template Engine', () => {
    let templates: TemplateEngine;

    beforeEach(() => {
      templates = new TemplateEngine();
    });

    it('5.1 Deve registrar template', () => {
      const result = templates.registerTemplate({
        id: 'app_blank', name: 'Blank App', description: 'Empty app template',
        category: 'app', tags: ['blank', 'starter'], author: 'Mobile Studio',
        version: '1.0.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
      expect(result).toBe(true);
    });

    it('5.2 Deve listar templates por categoria', () => {
      templates.registerTemplate({
        id: 't1', name: 'Login', description: '', category: 'screen',
        tags: [], author: '', version: '1', createdAt: '', updatedAt: '',
      });
      templates.registerTemplate({
        id: 't2', name: 'Dashboard', description: '', category: 'dashboard',
        tags: [], author: '', version: '1', createdAt: '', updatedAt: '',
      });
      expect(templates.getTemplates('screen').length).toBe(1);
      expect(templates.getTemplates().length).toBe(2);
    });

    it('5.3 Deve pesquisar templates', () => {
      templates.registerTemplate({
        id: 'auth_flow', name: 'Auth Flow', description: 'Login and registration flow',
        category: 'flow', tags: ['auth', 'login'], author: '', version: '1',
        createdAt: '', updatedAt: '',
      });
      const results = templates.searchTemplates('login');
      expect(results.length).toBeGreaterThan(0);
    });

    it('5.4 Deve retornar estatísticas', () => {
      const stats = templates.getStats();
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(typeof stats.byCategory).toBe('object');
    });
  });

  // ==============================================
  // ETAPA 6 — CUSTOM EXPORTERS TESTS
  // ==============================================

  describe('ETAPA 6 — Custom Exporters', () => {
    let exporters: CustomExporterRegistry;

    beforeEach(() => {
      exporters = new CustomExporterRegistry();
    });

    it('6.1 Deve registrar exportador customizado', () => {
      const result = exporters.register({
        id: 'unity_exporter', name: 'Unity Exporter', description: 'Export to Unity',
        version: '1.0.0', author: 'Dev', extensions: ['.unity'],
        target: 'unity', dependencies: [],
        compile: (ir) => ({
          files: [{ path: 'Assets/App.cs', content: `// ${ir.appInfo.name}` }],
          warnings: [], errors: [],
        }),
      });
      expect(result).toBe(true);
    });

    it('6.2 Deve executar exportador', () => {
      exporters.register({
        id: 'electron', name: 'Electron', description: '', version: '1',
        author: '', extensions: ['.js'], target: 'electron', dependencies: [],
        compile: () => ({
          files: [{ path: 'main.js', content: 'console.log("hello")' }],
          warnings: [], errors: [],
        }),
      });
      const result = exporters.execute('electron', ir);
      expect(result.files.length).toBe(1);
      expect(result.errors.length).toBe(0);
    });

    it('6.3 Deve retornar erro para exportador inexistente', () => {
      const result = exporters.execute('nonexistent', ir);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // ==============================================
  // ETAPA 7 — AI EXTENSION API TESTS
  // ==============================================

  describe('ETAPA 7 — AI Extension API', () => {
    // Use the singleton which has the default provider registered
    const ai = aiExtensionAPI;

    it('7.1 Deve ter provider padrão registrado', () => {
      expect(ai.getProviders().length).toBeGreaterThan(0);
      expect(ai.hasCapability('generate_screen')).toBe(true);
    });

    it('7.2 Deve executar comando de IA', async () => {
      const response = await ai.execute({
        prompt: 'Criar uma tela de login',
        context: { project: mockProject, ir },
      });
      expect(response.success).toBe(true);
      expect(response.result).toBeDefined();
      expect(response.usage).toBeDefined();
    });

    it('7.3 Deve gerar componentes via IA', async () => {
      const response = await ai.execute({
        prompt: 'Criar um componente de botão',
        context: {},
      });
      expect(response.success).toBe(true);
      expect(response.result!.components).toBeDefined();
    });

    it('7.4 Deve gerar lógica via IA', async () => {
      const response = await ai.execute({
        prompt: 'Criar fluxo de logica para login',
        context: {},
      });
      expect(response.success).toBe(true);
      expect(response.result!.flows).toBeDefined();
    });

    it('7.5 Deve retornar sugestões', async () => {
      const response = await ai.execute({
        prompt: 'Ajuda',
        context: {},
      });
      expect(response.success).toBe(true);
      expect(response.result!.suggestions).toBeDefined();
      expect(response.result!.suggestions!.length).toBeGreaterThan(0);
    });

    it('7.6 Deve registrar provider customizado', () => {
      const result = ai.registerProvider({
        id: 'custom_ai', name: 'Custom AI', description: '',
        capabilities: ['fix_errors', 'refactor'],
        isAvailable: true,
        execute: async () => ({ success: true, result: { text: 'Fixed!' } }),
      });
      expect(result).toBe(true);
      expect(ai.getProviders().length).toBeGreaterThan(1);
    });

    it('7.7 Deve retornar estatísticas', () => {
      const stats = ai.getStats();
      expect(stats.totalProviders).toBeGreaterThan(0);
      expect(stats.available).toBeGreaterThan(0);
      expect(stats.capabilities.length).toBeGreaterThan(0);
    });
  });

  // ==============================================
  // ETAPA 8 — DOCUMENTATION GENERATOR TESTS
  // ==============================================

  describe('ETAPA 8 — Documentation Generator', () => {
    let docs: DocumentationGenerator;

    beforeEach(() => {
      docs = new DocumentationGenerator();
    });

    it('8.1 Deve gerar documentação em Markdown', () => {
      const md = docs.generateProjectDocs(mockProject, ir, 'markdown');
      expect(md).toContain('SDK Test App');
      expect(md).toContain('Version: 1.0.0');
      expect(md).toContain('Screen: Home');
    });

    it('8.2 Deve gerar documentação em HTML', () => {
      const html = docs.generateProjectDocs(mockProject, ir, 'html');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('SDK Test App');
    });

    it('8.3 Deve gerar documentação em JSON', () => {
      const json = docs.generateProjectDocs(mockProject, ir, 'json');
      const parsed = JSON.parse(json);
      expect(parsed.name).toBe('SDK Test App');
      expect(parsed.sections.length).toBeGreaterThan(0);
    });
  });

  // ==============================================
  // ETAPA 9 — PACKAGE MANAGER TESTS
  // ==============================================

  describe('ETAPA 9 — Package Manager', () => {
    let pkg: PackageManager;

    beforeEach(() => {
      pkg = new PackageManager();
    });

    it('9.1 Deve registrar pacote', () => {
      const result = pkg.registerPackage({
        id: 'pkg_utils', name: '@studio/utils', version: '1.0.0',
        description: 'Utility functions', author: 'Studio', license: 'MIT',
        dependencies: [], entryPoint: 'index.js', exports: ['format', 'validate'],
        signatures: [], integrity: 'sha256-abc', sizeKb: 15,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
      expect(result).toBe(true);
    });

    it('9.2 Deve instalar pacote com dependências', () => {
      pkg.registerPackage({
        id: 'pkg_core', name: '@studio/core', version: '1.0.0',
        description: '', author: '', license: '', dependencies: [],
        entryPoint: '', exports: [], signatures: [], integrity: '', sizeKb: 0,
        createdAt: '', updatedAt: '',
      });
      pkg.registerPackage({
        id: 'pkg_ui', name: '@studio/ui', version: '1.0.0',
        description: '', author: '', license: '',
        dependencies: [{ name: '@studio/core', version: '1.0.0', type: 'runtime', optional: false }],
        entryPoint: '', exports: [], signatures: [], integrity: '', sizeKb: 0,
        createdAt: '', updatedAt: '',
      });

      // Install dependency first
      const depResult = pkg.install('pkg_core');
      expect(depResult.success).toBe(true);

      // Install main package
      const result = pkg.install('pkg_ui');
      expect(result.success).toBe(true);
    });

    it('9.3 Deve detectar atualizações', () => {
      pkg.registerPackage({
        id: 'pkg_test', name: 'test-pkg', version: '2.0.0',
        description: '', author: '', license: '', dependencies: [],
        entryPoint: '', exports: [], signatures: [], integrity: '', sizeKb: 0,
        createdAt: '', updatedAt: '',
      });
      pkg.install('pkg_test');
      // Register newer version
      pkg.registerPackage({
        id: 'pkg_test', name: 'test-pkg', version: '3.0.0',
        description: '', author: '', license: '', dependencies: [],
        entryPoint: '', exports: [], signatures: [], integrity: '', sizeKb: 0,
        createdAt: '', updatedAt: '',
      });
      const updates = pkg.checkUpdates();
      expect(updates.length).toBeGreaterThan(0);
    });

    it('9.4 Deve retornar estatísticas', () => {
      const stats = pkg.getStats();
      expect(stats.total).toBeGreaterThanOrEqual(0);
      expect(stats.installed).toBeGreaterThanOrEqual(0);
    });
  });

  // ==============================================
  // ETAPA 10 — DEVELOPER PORTAL TESTS
  // ==============================================

  describe('ETAPA 10 — Developer Portal', () => {
    let portal: DeveloperPortal;

    beforeEach(() => {
      portal = new DeveloperPortal();
    });

    it('10.1 Deve criar projeto de desenvolvedor', () => {
      const project = portal.createProject('My Plugin', 'plugin', 'A great plugin');
      expect(project.id).toBeDefined();
      expect(project.name).toBe('My Plugin');
      expect(project.status).toBe('draft');
    });

    it('10.2 Deve publicar projeto no marketplace', () => {
      const project = portal.createProject('Chart Component', 'component', '');
      const published = portal.publishToMarketplace(project.id, 'marketplace_chart');
      expect(published).not.toBeNull();
      expect(published!.status).toBe('published');
      expect(published!.marketplaceId).toBe('marketplace_chart');
    });

    it('10.3 Deve gerar e validar API keys', () => {
      const { id, key } = portal.generateAPIKey('Development', ['read', 'write']);
      expect(id).toBeDefined();
      expect(key).toContain('ms_');
      expect(portal.validateAPIKey(key)).toBe(true);
      expect(portal.validateAPIKey('invalid')).toBe(false);
    });

    it('10.4 Deve revogar API key', () => {
      const { id, key } = portal.generateAPIKey('Test', ['read']);
      expect(portal.revokeAPIKey(id)).toBe(true);
      expect(portal.validateAPIKey(key)).toBe(false);
    });

    it('10.5 Deve listar projetos por tipo', () => {
      portal.createProject('Plugin A', 'plugin', '');
      portal.createProject('Theme B', 'theme', '');
      portal.createProject('Exporter C', 'exporter', '');
      expect(portal.getProjects('plugin').length).toBe(1);
      expect(portal.getProjects().length).toBe(3);
    });

    it('10.6 Deve arquivar projeto', () => {
      const project = portal.createProject('Old Plugin', 'plugin', '');
      expect(portal.archiveProject(project.id)).toBe(true);
      expect(portal.getProject(project.id)!.status).toBe('archived');
    });
  });

  // ==============================================
  // COMPREHENSIVE PLATFORM TESTS
  // ==============================================

  describe('Comprehensive — SDK Marketplace Platform', () => {
    it('Deve integrar todos os módulos via SDKMarketplacePlatform', () => {
      const platform = new SDKMarketplacePlatform();
      expect(platform.componentSDK).toBeDefined();
      expect(platform.pluginSDK).toBeDefined();
      expect(platform.marketplace).toBeDefined();
      expect(platform.themeEngine).toBeDefined();
      expect(platform.templateEngine).toBeDefined();
      expect(platform.customExporters).toBeDefined();
      expect(platform.ai).toBeDefined();
      expect(platform.docs).toBeDefined();
      expect(platform.packages).toBeDefined();
      expect(platform.developerPortal).toBeDefined();
    });

    it('Deve retornar dashboard data consolidado', () => {
      const platform = new SDKMarketplacePlatform();
      const data = platform.getDashboardData();
      expect(data.sdk).toBeDefined();
      expect(data.marketplace).toBeDefined();
      expect(data.themes).toBeDefined();
      expect(data.templates).toBeDefined();
      expect(data.exporters).toBeDefined();
      expect(data.ai).toBeDefined();
      expect(data.packages).toBeDefined();
      expect(data.developerPortal).toBeDefined();
    });

    it('Deve registrar componente via SDK e criar instância', () => {
      const platform = new SDKMarketplacePlatform();
      platform.componentSDK.registerComponent({
        name: 'CustomWidget', category: 'Custom', description: '', tags: [],
        properties: [], events: [], defaultWidth: 100, defaultHeight: 50,
        renderer: () => '<div>Custom</div>', exporters: {}, version: '1.0.0', author: '',
      });
      const instance = platform.componentSDK.createInstance('CustomWidget');
      expect(instance).not.toBeNull();
      expect(instance!.componentType).toBe('CustomWidget');
    });
  });
});