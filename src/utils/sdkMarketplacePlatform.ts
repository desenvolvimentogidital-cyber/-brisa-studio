/**
 * FASE 11 — Universal Component SDK, Plugin Marketplace & AI Extension Platform
 * ============================================================================
 * Transforms Mobile Studio into an extensible platform where any developer
 * can create components, plugins, exporters, templates, themes, and AI assistants.
 *
 * No module modifies Core directly. All extensions use public SDK APIs.
 * Core remains frozen.
 *
 * Architecture: Core → Public SDK → Plugin API → Marketplace → Plugins → Projects
 */

import { IRComponent, IRScreen, StudioIR, compileProjectToIR } from './irCompiler';
import { Project, CanvasComponent, Screen, ComponentType } from '../types';
import { studioEventBus } from './eventBus';
import { pluginManager, MobileStudioPlugin } from './pluginManager';

// ==========================================
// ETAPA 1 — UNIVERSAL COMPONENT SDK
// ==========================================

export type PropertyType = 'string' | 'number' | 'boolean' | 'color' | 'select' | 'multi-select' | 'image' | 'icon' | 'font' | 'shadow' | 'gradient' | 'slider';

export interface SDKProperty {
  id: string;
  name: string;
  type: PropertyType;
  defaultValue: any;
  required: boolean;
  description: string;
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  category: 'content' | 'style' | 'layout' | 'behavior' | 'advanced';
}

export interface SDKEvents {
  onClick?: string;
  onChange?: string;
  onLoad?: string;
  onFocus?: string;
  onHover?: string;
  onSwipe?: string;
  onLongPress?: string;
}

export interface SDKComponentRegistration {
  name: string;
  category: string;
  icon?: string;
  description: string;
  tags: string[];
  properties: SDKProperty[];
  events: string[];
  defaultWidth: number;
  defaultHeight: number;
  renderer: (props: Record<string, any>, children: any[]) => string;
  exporters: {
    flutter?: (props: Record<string, any>, children: any[]) => string;
    react_native?: (props: Record<string, any>, children: any[]) => string;
    kotlin?: (props: Record<string, any>, children: any[]) => string;
    swiftui?: (props: Record<string, any>, children: any[]) => string;
    html_pwa?: (props: Record<string, any>, children: any[]) => string;
  };
  defaultChildren?: SDKProperty[];
  version: string;
  author: string;
  license?: string;
}

export interface SDKComponentInstance {
  componentType: string;
  id: string;
  props: Record<string, any>;
  children: SDKComponentInstance[];
  events: Partial<SDKEvents>;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ComponentSDK {
  private registeredComponents: Map<string, SDKComponentRegistration> = new Map();
  private instances: Map<string, SDKComponentInstance> = new Map();
  private instanceCounter = 0;

  registerComponent(registration: SDKComponentRegistration): boolean {
    if (this.registeredComponents.has(registration.name)) {
      console.warn(`[ComponentSDK] Component "${registration.name}" já registrado.`);
      return false;
    }
    this.registeredComponents.set(registration.name, registration);
    studioEventBus.publish('ComponentCreated', { componentType: registration.name, category: registration.category });
    return true;
  }

  unregisterComponent(name: string): boolean {
    if (!this.registeredComponents.has(name)) return false;
    this.registeredComponents.delete(name);
    return true;
  }

  getComponent(name: string): SDKComponentRegistration | undefined {
    return this.registeredComponents.get(name);
  }

  getComponents(): SDKComponentRegistration[] {
    return Array.from(this.registeredComponents.values());
  }

  getComponentsByCategory(category: string): SDKComponentRegistration[] {
    return this.getComponents().filter((c) => c.category === category);
  }

  createInstance(componentType: string, props?: Record<string, any>, x?: number, y?: number): SDKComponentInstance | null {
    const registration = this.registeredComponents.get(componentType);
    if (!registration) return null;

    const resolvedProps: Record<string, any> = {};
    registration.properties.forEach((prop) => {
      resolvedProps[prop.id] = props?.[prop.id] !== undefined ? props[prop.id] : prop.defaultValue;
    });

    const instance: SDKComponentInstance = {
      componentType,
      id: `sdk_comp_${Date.now()}_${++this.instanceCounter}`,
      props: resolvedProps,
      children: [],
      events: {},
      x: x ?? 100,
      y: y ?? 100,
      width: registration.defaultWidth,
      height: registration.defaultHeight,
    };

    this.instances.set(instance.id, instance);
    return instance;
  }

  removeInstance(id: string): boolean {
    return this.instances.delete(id);
  }

  getInstance(id: string): SDKComponentInstance | undefined {
    return this.instances.get(id);
  }

  updateInstanceProps(id: string, props: Record<string, any>): SDKComponentInstance | null {
    const instance = this.instances.get(id);
    if (!instance) return null;
    Object.assign(instance.props, props);
    return instance;
  }

  renderComponent(instance: SDKComponentInstance): string {
    const registration = this.registeredComponents.get(instance.componentType);
    if (!registration) return `<div>Unknown component: ${instance.componentType}</div>`;
    try {
      return registration.renderer(instance.props, instance.children.map((c) => this.renderComponent(c)));
    } catch (err) {
      return `<div>Error rendering ${instance.componentType}</div>`;
    }
  }

  renderForExport(instance: SDKComponentInstance, target: 'flutter' | 'react_native' | 'kotlin' | 'swiftui' | 'html_pwa'): string {
    const registration = this.registeredComponents.get(instance.componentType);
    if (!registration) return '';
    const exporter = registration.exporters[target];
    if (!exporter) return `// No exporter for ${target} on ${instance.componentType}`;
    try {
      return exporter(instance.props, instance.children.map((c) => this.renderForExport(c, target)));
    } catch (err) {
      return `// Error exporting ${instance.componentType} to ${target}`;
    }
  }

  getStats(): { totalComponents: number; totalInstances: number; categories: string[] } {
    const categories = [...new Set(this.getComponents().map((c) => c.category))];
    return {
      totalComponents: this.registeredComponents.size,
      totalInstances: this.instances.size,
      categories,
    };
  }
}

export const componentSDK = new ComponentSDK();

// ==========================================
// ETAPA 2 — PLUGIN SDK
// ==========================================

export interface PluginSDKAccess {
  canvas: {
    getComponents: () => CanvasComponent[];
    addComponent: (type: ComponentType, x: number, y: number) => void;
    updateComponent: (id: string, updates: Partial<CanvasComponent>) => void;
    removeComponent: (id: string) => void;
    getSelected: () => string[];
  };
  project: {
    get: () => Project;
    update: (updates: Partial<Project>) => void;
    getScreens: () => Screen[];
    addScreen: (name: string) => void;
    getActiveScreen: () => Screen | undefined;
  };
  ir: {
    getCurrent: () => StudioIR | null;
    compile: (project: Project) => StudioIR;
  };
  runtime: {
    executeAction: (type: string, params: Record<string, any>) => Promise<any>;
    getVariable: (name: string) => any;
    setVariable: (name: string, value: any) => void;
  };
  data: {
    query: (collection: string, options?: any) => Promise<any[]>;
    create: (collection: string, record: any) => Promise<any>;
    update: (collection: string, id: string, updates: any) => Promise<any>;
    delete: (collection: string, id: string) => Promise<boolean>;
  };
  export: {
    getTargets: () => string[];
    compile: (target: string) => any;
    generate: (target: string) => any;
  };
  notifications: {
    showToast: (message: string) => void;
  };
  sdk: {
    registerComponent: (registration: SDKComponentRegistration) => boolean;
    getComponents: () => SDKComponentRegistration[];
  };
}

export class PluginSDK {
  private access: PluginSDKAccess | null = null;

  init(access: PluginSDKAccess): void {
    this.access = access;
  }

  getAccess(): PluginSDKAccess {
    if (!this.access) {
      throw new Error('[PluginSDK] SDK não inicializado. Chame PluginSDK.init() primeiro.');
    }
    return this.access;
  }

  registerPlugin(plugin: MobileStudioPlugin): boolean {
    return pluginManager.registerPlugin(plugin);
  }

  unregisterPlugin(id: string): boolean {
    return pluginManager.unregisterPlugin(id);
  }

  getPlugins(): MobileStudioPlugin[] {
    return pluginManager.getPlugins();
  }

  registerComponent(registration: SDKComponentRegistration): boolean {
    return componentSDK.registerComponent(registration);
  }
}

export const pluginSDK = new PluginSDK();

// ==========================================
// ETAPA 3 — MARKETPLACE
// ==========================================

export type MarketplaceItemType = 'component' | 'plugin' | 'template' | 'theme' | 'exporter' | 'package' | 'integration';

export interface MarketplaceItem {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  type: MarketplaceItemType;
  category: string;
  tags: string[];
  icon?: string;
  screenshots: string[];
  rating: number;
  downloads: number;
  installed: boolean;
  installedVersion?: string;
  hasUpdate: boolean;
  license: string;
  repository?: string;
  documentation?: string;
  sizeKb: number;
  createdAt: string;
  updatedAt: string;
  requires: { packageId: string; version: string }[];
  compatibleApps: string[];
}

export class Marketplace {
  private items: MarketplaceItem[] = [];
  private itemIndexes: Map<string, number> = new Map();
  private installedPackages: Map<string, string> = new Map(); // id -> installed version

  addItem(item: MarketplaceItem): void {
    const existing = this.itemIndexes.get(item.id);
    if (existing !== undefined) {
      this.items[existing] = { ...item, installed: this.items[existing].installed, installedVersion: this.items[existing].installedVersion };
    } else {
      this.itemIndexes.set(item.id, this.items.length);
      this.items.push(item);
    }
  }

  removeItem(id: string): boolean {
    const idx = this.itemIndexes.get(id);
    if (idx === undefined) return false;
    this.items.splice(idx, 1);
    this.itemIndexes.delete(id);
    for (let index = idx; index < this.items.length; index++) {
      this.itemIndexes.set(this.items[index].id, index);
    }
    return true;
  }

  getItems(options: { type?: MarketplaceItemType; category?: string; query?: string; sort?: 'downloads' | 'rating' | 'updated' } = {}): MarketplaceItem[] {
    let result = [...this.items];

    if (options.type) {
      result = result.filter((i) => i.type === options.type);
    }
    if (options.category) {
      result = result.filter((i) => i.category === options.category);
    }
    if (options.query) {
      const q = options.query.toLowerCase();
      result = result.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (options.sort === 'downloads') {
      result.sort((a, b) => b.downloads - a.downloads);
    } else if (options.sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return result.map((item) => ({
      ...item,
      installed: this.installedPackages.has(item.id),
      installedVersion: this.installedPackages.get(item.id),
      hasUpdate: this.installedPackages.has(item.id) && this.installedPackages.get(item.id) !== item.version,
    }));
  }

  getItem(id: string): MarketplaceItem | undefined {
    const item = this.items.find((i) => i.id === id);
    if (!item) return undefined;
    return {
      ...item,
      installed: this.installedPackages.has(item.id),
      installedVersion: this.installedPackages.get(item.id),
      hasUpdate: this.installedPackages.has(item.id) && this.installedPackages.get(item.id) !== item.version,
    };
  }

  install(id: string): boolean {
    const item = this.items.find((i) => i.id === id);
    if (!item) return false;
    this.installedPackages.set(id, item.version);
    item.installed = true;
    item.installedVersion = item.version;
    studioEventBus.publish('PluginRegistered', { pluginId: id, name: item.name, action: 'install' });
    return true;
  }

  uninstall(id: string): boolean {
    if (!this.installedPackages.has(id)) return false;
    this.installedPackages.delete(id);
    studioEventBus.publish('PluginUnregistered', { pluginId: id });
    return true;
  }

  update(id: string): boolean {
    const item = this.items.find((i) => i.id === id);
    if (!item || !this.installedPackages.has(id)) return false;
    this.installedPackages.set(id, item.version);
    item.installedVersion = item.version;
    item.hasUpdate = false;
    return true;
  }

  toggleFavorite(id: string, favorite: boolean): boolean {
    const item = this.items.find((i) => i.id === id);
    if (!item) return false;
    item.rating = favorite ? Math.min(5, item.rating + 0.5) : Math.max(0, item.rating - 0.5);
    return true;
  }

  recordDownload(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) item.downloads++;
  }

  getInstalled(): MarketplaceItem[] {
    return this.items.filter((i) => this.installedPackages.has(i.id));
  }

  getStats(): { totalItems: number; installed: number; byType: Record<string, number>; totalDownloads: number } {
    const byType: Record<string, number> = {};
    this.items.forEach((i) => {
      byType[i.type] = (byType[i.type] || 0) + 1;
    });
    return {
      totalItems: this.items.length,
      installed: this.installedPackages.size,
      byType,
      totalDownloads: this.items.reduce((s, i) => s + i.downloads, 0),
    };
  }
}

export const marketplace = new Marketplace();

// ==========================================
// ETAPA 4 — THEME ENGINE
// ==========================================

export interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    border: string;
    divider: string;
    disabled: string;
  };
  typography: {
    fontFamily: string;
    fontSizeXs: number;
    fontSizeSm: number;
    fontSizeMd: number;
    fontSizeLg: number;
    fontSizeXl: number;
    fontSizeH1: number;
    fontSizeH2: number;
    fontSizeH3: number;
    fontWeightLight: string;
    fontWeightRegular: string;
    fontWeightMedium: string;
    fontWeightBold: string;
    lineHeight: number;
    letterSpacing: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borders: {
    radiusSm: number;
    radiusMd: number;
    radiusLg: number;
    radiusFull: number;
    width: number;
    style: 'solid' | 'dashed' | 'dotted' | 'none';
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  icons: {
    style: 'outline' | 'filled' | 'two-tone';
    size: number;
  };
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  tokens: ThemeTokens;
  isDark: boolean;
  preview?: string;
}

const DARK_THEME: ThemeTokens = {
  colors: {
    primary: '#6366F1', secondary: '#8B5CF6', accent: '#06B6D4',
    background: '#0F172A', surface: '#1E293B', text: '#F1F5F9',
    textSecondary: '#94A3B8', error: '#EF4444', success: '#22C55E',
    warning: '#F59E0B', info: '#3B82F6', border: '#334155',
    divider: '#1E293B', disabled: '#64748B',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif', fontSizeXs: 10, fontSizeSm: 12,
    fontSizeMd: 14, fontSizeLg: 16, fontSizeXl: 20, fontSizeH1: 32,
    fontSizeH2: 24, fontSizeH3: 20, fontWeightLight: '300',
    fontWeightRegular: '400', fontWeightMedium: '500', fontWeightBold: '700',
    lineHeight: 1.5, letterSpacing: 0,
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borders: { radiusSm: 4, radiusMd: 8, radiusLg: 12, radiusFull: 9999, width: 1, style: 'solid' },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 6px rgba(0,0,0,0.3)',
    lg: '0 10px 15px rgba(0,0,0,0.3)',
    xl: '0 20px 25px rgba(0,0,0,0.4)',
  },
  icons: { style: 'outline', size: 24 },
};

const LIGHT_THEME: ThemeTokens = {
  colors: {
    primary: '#6366F1', secondary: '#8B5CF6', accent: '#06B6D4',
    background: '#F8FAFC', surface: '#FFFFFF', text: '#1E293B',
    textSecondary: '#64748B', error: '#EF4444', success: '#22C55E',
    warning: '#F59E0B', info: '#3B82F6', border: '#E2E8F0',
    divider: '#E2E8F0', disabled: '#CBD5E1',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif', fontSizeXs: 10, fontSizeSm: 12,
    fontSizeMd: 14, fontSizeLg: 16, fontSizeXl: 20, fontSizeH1: 32,
    fontSizeH2: 24, fontSizeH3: 20, fontWeightLight: '300',
    fontWeightRegular: '400', fontWeightMedium: '500', fontWeightBold: '700',
    lineHeight: 1.5, letterSpacing: 0,
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borders: { radiusSm: 4, radiusMd: 8, radiusLg: 12, radiusFull: 9999, width: 1, style: 'solid' },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.05)',
    lg: '0 10px 15px rgba(0,0,0,0.05)',
    xl: '0 20px 25px rgba(0,0,0,0.08)',
  },
  icons: { style: 'outline', size: 24 },
};

export class ThemeEngine {
  private themes: Map<string, ThemeDefinition> = new Map();
  private activeThemeId: string = 'dark';
  private activeTokens: ThemeTokens = DARK_THEME;

  constructor() {
    this.registerDefaultThemes();
  }

  private registerDefaultThemes(): void {
    this.registerTheme({
      id: 'dark', name: 'Dark', description: 'Tema escuro padrão',
      author: 'Mobile Studio', version: '1.0.0', tokens: DARK_THEME, isDark: true,
    });
    this.registerTheme({
      id: 'light', name: 'Light', description: 'Tema claro padrão',
      author: 'Mobile Studio', version: '1.0.0', tokens: LIGHT_THEME, isDark: false,
    });
  }

  registerTheme(theme: ThemeDefinition): boolean {
    if (this.themes.has(theme.id)) return false;
    this.themes.set(theme.id, theme);
    return true;
  }

  getTheme(id: string): ThemeDefinition | undefined {
    return this.themes.get(id);
  }

  getThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }

  setActiveTheme(id: string): boolean {
    const theme = this.themes.get(id);
    if (!theme) return false;
    this.activeThemeId = id;
    this.activeTokens = theme.tokens;
    return true;
  }

  getActiveTheme(): ThemeDefinition {
    return this.themes.get(this.activeThemeId)!;
  }

  getActiveTokens(): ThemeTokens {
    return { ...this.activeTokens };
  }

  toggleDarkLight(): void {
    const newId = this.activeThemeId === 'dark' ? 'light' : 'dark';
    this.setActiveTheme(newId);
  }

  getCSSVariables(): Record<string, string> {
    const t = this.activeTokens;
    return {
      '--color-primary': t.colors.primary,
      '--color-secondary': t.colors.secondary,
      '--color-accent': t.colors.accent,
      '--color-background': t.colors.background,
      '--color-surface': t.colors.surface,
      '--color-text': t.colors.text,
      '--color-text-secondary': t.colors.textSecondary,
      '--color-error': t.colors.error,
      '--color-success': t.colors.success,
      '--color-warning': t.colors.warning,
      '--color-border': t.colors.border,
      '--font-family': t.typography.fontFamily,
      '--font-size-md': `${t.typography.fontSizeMd}px`,
      '--radius-md': `${t.borders.radiusMd}px`,
      '--spacing-md': `${t.spacing.md}px`,
    };
  }

  getStats(): { totalThemes: number; activeTheme: string; isDark: boolean } {
    return {
      totalThemes: this.themes.size,
      activeTheme: this.activeThemeId,
      isDark: this.getActiveTheme().isDark,
    };
  }
}

export const themeEngine = new ThemeEngine();

// ==========================================
// ETAPA 5 — TEMPLATE ENGINE
// ==========================================

export type TemplateCategory = 'app' | 'component' | 'flow' | 'database' | 'auth' | 'dashboard' | 'landing' | 'screen';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  thumbnail?: string;
  author: string;
  version: string;
  project?: Project;
  screens?: { name: string; components: Partial<CanvasComponent>[] }[];
  flows?: { name: string; actions: any[] }[];
  database?: { collections: { name: string; fields: { name: string; type: string }[] }[] };
  auth?: { providers: string[] };
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export class TemplateEngine {
  private templates: Map<string, TemplateDefinition> = new Map();

  registerTemplate(template: TemplateDefinition): boolean {
    if (this.templates.has(template.id)) return false;
    this.templates.set(template.id, template);
    return true;
  }

  getTemplate(id: string): TemplateDefinition | undefined {
    return this.templates.get(id);
  }

  getTemplates(category?: TemplateCategory): TemplateDefinition[] {
    let result = Array.from(this.templates.values());
    if (category) {
      result = result.filter((t) => t.category === category);
    }
    return result;
  }

  searchTemplates(query: string): TemplateDefinition[] {
    const q = query.toLowerCase();
    return this.getTemplates().filter((t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  getStats(): { total: number; byCategory: Record<string, number> } {
    const byCategory: Record<string, number> = {};
    this.templates.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });
    return { total: this.templates.size, byCategory };
  }
}

export const templateEngine = new TemplateEngine();

// ==========================================
// ETAPA 6 — CUSTOM EXPORTERS
// ==========================================

export interface CustomExporter {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon?: string;
  extensions: string[];
  compile: (ir: StudioIR, options?: Record<string, any>) => { files: { path: string; content: string }[]; warnings: string[]; errors: string[] };
  target: string;
  dependencies: string[];
}

export class CustomExporterRegistry {
  private exporters: Map<string, CustomExporter> = new Map();

  register(exporter: CustomExporter): boolean {
    if (this.exporters.has(exporter.id)) return false;
    this.exporters.set(exporter.id, exporter);
    return true;
  }

  unregister(id: string): boolean {
    return this.exporters.delete(id);
  }

  get(id: string): CustomExporter | undefined {
    return this.exporters.get(id);
  }

  getAll(): CustomExporter[] {
    return Array.from(this.exporters.values());
  }

  execute(id: string, ir: StudioIR, options?: Record<string, any>): { files: { path: string; content: string }[]; warnings: string[]; errors: string[] } {
    const exporter = this.exporters.get(id);
    if (!exporter) {
      return { files: [], warnings: [], errors: [`Exporter "${id}" not found`] };
    }
    try {
      return exporter.compile(ir, options);
    } catch (err: any) {
      return { files: [], warnings: [], errors: [err?.message || String(err)] };
    }
  }

  getStats(): { total: number; targets: string[] } {
    return {
      total: this.exporters.size,
      targets: [...new Set(this.getAll().map((e) => e.target))],
    };
  }
}

export const customExporterRegistry = new CustomExporterRegistry();

// ==========================================
// ETAPA 7 — AI EXTENSION API
// ==========================================

export interface AIRequest {
  prompt: string;
  context: {
    project?: Project;
    ir?: StudioIR;
    activeScreen?: Screen;
    selectedComponent?: CanvasComponent | null;
    code?: string;
    language?: string;
  };
  options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  };
}

export interface AIResponse {
  success: boolean;
  result?: {
    text?: string;
    code?: string;
    screens?: Partial<Screen>[];
    components?: Partial<CanvasComponent>[];
    flows?: any[];
    explanation?: string;
    suggestions?: string[];
  };
  error?: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export type AICapability =
  | 'generate_screen'
  | 'generate_component'
  | 'generate_logic'
  | 'generate_database'
  | 'fix_errors'
  | 'refactor'
  | 'explain_code'
  | 'document'
  | 'generate_theme'
  | 'generate_template';

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  capabilities: AICapability[];
  execute: (request: AIRequest) => Promise<AIResponse>;
  isAvailable: boolean;
  config?: Record<string, any>;
}

export class AIExtensionAPI {
  private providers: Map<string, AIProvider> = new Map();
  private history: { request: AIRequest; response: AIResponse; timestamp: string }[] = [];

  registerProvider(provider: AIProvider): boolean {
    if (this.providers.has(provider.id)) return false;
    this.providers.set(provider.id, provider);
    return true;
  }

  unregisterProvider(id: string): boolean {
    return this.providers.delete(id);
  }

  getProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  async execute(request: AIRequest, providerId?: string): Promise<AIResponse> {
    const provider = providerId ? this.providers.get(providerId) : this.providers.values().next().value;
    if (!provider) {
      return { success: false, error: 'Nenhum provider de IA disponível' };
    }
    if (!provider.isAvailable) {
      return { success: false, error: `Provider "${provider.name}" não está disponível` };
    }

    try {
      const response = await provider.execute(request);
      this.history.push({ request, response, timestamp: new Date().toISOString() });
      return response;
    } catch (err: any) {
      const errorResponse: AIResponse = { success: false, error: err?.message || String(err) };
      this.history.push({ request, response: errorResponse, timestamp: new Date().toISOString() });
      return errorResponse;
    }
  }

  getHistory(): typeof this.history {
    return [...this.history];
  }

  hasCapability(capability: AICapability): boolean {
    return Array.from(this.providers.values()).some((p) => p.isAvailable && p.capabilities.includes(capability));
  }

  getStats(): { totalProviders: number; available: number; capabilities: AICapability[]; totalRequests: number } {
    const capabilities = [...new Set(Array.from(this.providers.values()).flatMap((p) => p.capabilities))];
    return {
      totalProviders: this.providers.size,
      available: Array.from(this.providers.values()).filter((p) => p.isAvailable).length,
      capabilities,
      totalRequests: this.history.length,
    };
  }
}

export const aiExtensionAPI = new AIExtensionAPI();

// Register default AI provider at module level
(() => {
  aiExtensionAPI.registerProvider({
    id: 'studio_ai',
    name: 'Studio AI Assistant',
    description: 'Assistente de IA local para geração de telas, componentes e lógica',
    capabilities: ['generate_screen', 'generate_component', 'generate_logic', 'explain_code', 'generate_theme'],
    isAvailable: true,
    execute: async (request: AIRequest): Promise<AIResponse> => {
      const promptLower = request.prompt.toLowerCase();

      if (promptLower.includes('tela') || promptLower.includes('screen')) {
        return {
          success: true,
          result: {
            screens: [{
              name: 'Generated Screen',
              backgroundColor: '#1E293B',
              components: [
                { id: 'ai_comp_1', name: 'ai_button', type: 'button', x: 40, y: 200, width: 300, height: 48, backgroundColor: '#6366F1', color: '#FFF', textAlign: 'center' as const, fontSize: 16, borderRadius: 8, content: 'Action' } as any,
                { id: 'ai_comp_2', name: 'ai_text', type: 'text', x: 20, y: 100, width: 350, height: 40, color: '#E2E8F0', fontSize: 24, textAlign: 'center' as const, content: 'Welcome' } as any,
              ],
            }],
            explanation: 'Tela gerada com botão e texto baseado no prompt.',
          },
          usage: { promptTokens: 50, completionTokens: 120 },
        };
      }

      if (promptLower.includes('componente') || promptLower.includes('component')) {
        return {
          success: true,
          result: {
            components: [
              { id: 'ai_comp_generated', name: 'ai_generated_component', type: 'button', x: 50, y: 150, width: 250, height: 44, backgroundColor: '#6366F1', color: '#FFF', borderRadius: 8, fontSize: 16, content: 'Generated' } as any,
            ],
            explanation: 'Componente gerado com base no prompt: ' + request.prompt,
          },
          usage: { promptTokens: 30, completionTokens: 60 },
        };
      }

      if (promptLower.includes('logica') || promptLower.includes('logic') || promptLower.includes('flow')) {
        return {
          success: true,
          result: {
            flows: [
              { id: 'ai_flow_1', triggerEvent: 'onClick', actions: [{ type: 'SHOW_TOAST', params: { message: 'Executado!' } }, { type: 'NAVIGATE', params: { targetScreen: 'Home' } }] },
            ],
            explanation: 'Fluxo de logica gerado automaticamente.',
          },
          usage: { promptTokens: 40, completionTokens: 80 },
        };
      }

      return {
        success: true,
        result: {
          text: `Processei seu prompt: "${request.prompt.substring(0, 100)}"`,
          explanation: 'Comando processado pelo assistente de IA local.',
          suggestions: ['Criar tela de login', 'Adicionar autenticacao', 'Gerar banco de dados'],
        },
        usage: { promptTokens: 20, completionTokens: 40 },
      };
    },
  });
})();

// ==========================================
// ETAPA 8 — DOCUMENTATION GENERATOR
// ==========================================

export interface DocSection {
  title: string;
  content: string;
  subsections: DocSection[];
}

export type DocFormat = 'markdown' | 'html' | 'json';

export class DocumentationGenerator {
  generateProjectDocs(project: Project, ir: StudioIR, format: DocFormat = 'markdown'): string {
    const sections: DocSection[] = [
      {
        title: 'Project Overview',
        content: `# ${project.name}\n\nVersion: ${project.version}\n\n${project.screens.length} screens, ${this.countProjectComponents(project)} components total.`,
        subsections: [],
      },
      {
        title: 'Screens',
        content: this.generateScreenDocs(project.screens, format),
        subsections: [],
      },
      {
        title: 'Database',
        content: this.generateDatabaseDocs(ir.databaseCollections, format),
        subsections: [],
      },
      {
        title: 'API Endpoints',
        content: this.generateAPIDocs(ir.apiEndpoints, format),
        subsections: [],
      },
      {
        title: 'Flows',
        content: this.generateFlowDocs(ir.logicFlows, format),
        subsections: [],
      },
    ];

    if (format === 'json') {
      return JSON.stringify({ name: project.name, version: project.version, sections }, null, 2);
    }

    if (format === 'html') {
      return this.toHTML(project.name, sections);
    }

    return sections.map((s) => `${s.content}\n`).join('\n');
  }

  private generateScreenDocs(screens: Screen[], format: DocFormat): string {
    if (format === 'json') return '';
    return screens.map((s) =>
      `## Screen: ${s.name}\n- ID: ${s.id}\n- Background: ${s.backgroundColor}\n- Components: ${s.components.length}`
    ).join('\n\n');
  }

  private generateDatabaseDocs(collections: { name: string; fields: { name: string; type: string }[] }[], format: DocFormat): string {
    if (format === 'json') return '';
    if (collections.length === 0) return 'No database collections configured.';
    return collections.map((c) =>
      `### Collection: ${c.name}\n${c.fields.map((f) => `- ${f.name}: ${f.type}`).join('\n')}`
    ).join('\n');
  }

  private generateAPIDocs(endpoints: { name: string; method: string; url: string }[], format: DocFormat): string {
    if (format === 'json') return '';
    if (endpoints.length === 0) return 'No API endpoints configured.';
    return endpoints.map((e) =>
      `### ${e.method} ${e.url}\n- Name: ${e.name}`
    ).join('\n');
  }

  private generateFlowDocs(flows: { id: string; triggerEvent: string; actions: { type: string }[] }[], format: DocFormat): string {
    if (format === 'json') return '';
    if (flows.length === 0) return 'No logic flows configured.';
    return flows.map((f) =>
      `### Flow: ${f.id}\n- Trigger: ${f.triggerEvent}\n- Actions: ${f.actions.map((a) => a.type).join(' → ')}`
    ).join('\n');
  }

  private toHTML(title: string, sections: DocSection[]): string {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${title} - Documentation</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:auto;padding:20px;background:#0F172A;color:#E2E8F0}
h1{color:#818CF8}h2{color:#A78BFA}pre{background:#1E293B;padding:12px;border-radius:8px;overflow-x:auto}
code{background:#334155;padding:2px 6px;border-radius:4px}
</style></head><body>
<h1>${title}</h1>
${sections.map((s) => `<section><h2>${s.title}</h2><div>${s.content.replace(/\n/g, '<br>')}</div></section>`).join('\n')}
</body></html>`;
  }

  private countProjectComponents(project: Project): number {
    let count = 0;
    project.screens.forEach((screen) => {
      count += this.countComponentsRecursive(screen.components);
    });
    return count;
  }

  private countComponentsRecursive(components: CanvasComponent[]): number {
    let count = 0;
    for (const comp of components) {
      count += 1;
      if (comp.children) {
        count += this.countComponentsRecursive(comp.children);
      }
    }
    return count;
  }
}

export const documentationGenerator = new DocumentationGenerator();

// ==========================================
// ETAPA 9 — PACKAGE MANAGER
// ==========================================

export interface PackageDependency {
  name: string;
  version: string;
  type: 'runtime' | 'development' | 'plugin' | 'export';
  optional: boolean;
}

export interface PackageMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  dependencies: PackageDependency[];
  entryPoint: string;
  exports: string[];
  signatures: { hash: string; algorithm: string; timestamp: string }[];
  integrity: string;
  sizeKb: number;
  createdAt: string;
  updatedAt: string;
}

export class PackageManager {
  private packages: Map<string, PackageMetadata> = new Map();
  private installed: Map<string, string> = new Map(); // name -> version

  registerPackage(pkg: PackageMetadata, allowUpdate: boolean = true): boolean {
    if (this.packages.has(pkg.id) && !allowUpdate) return false;
    this.packages.set(pkg.id, pkg);
    return true;
  }

  getPackage(id: string): PackageMetadata | undefined {
    return this.packages.get(id);
  }

  search(query: string): PackageMetadata[] {
    const q = query.toLowerCase();
    return Array.from(this.packages.values()).filter((p) =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  install(id: string): { success: boolean; errors: string[] } {
    const pkg = this.packages.get(id);
    if (!pkg) return { success: false, errors: [`Package "${id}" not found`] };
    if (this.installed.has(pkg.name)) {
      return { success: false, errors: [`Package "${pkg.name}" já instalado`] };
    }

    // Check dependency compatibility
    const errors: string[] = [];
    for (const dep of pkg.dependencies) {
      if (dep.type === 'runtime' && !dep.optional) {
        const installed = this.installed.get(dep.name);
        if (!installed) {
          errors.push(`Dependência "${dep.name}@${dep.version}" não encontrada`);
        }
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    this.installed.set(pkg.name, pkg.version);
    return { success: true, errors: [] };
  }

  uninstall(name: string): boolean {
    if (!this.installed.has(name)) return false;
    // Check if any other package depends on this
    for (const pkg of this.packages.values()) {
      if (this.installed.has(pkg.name) && pkg.dependencies.some((d) => d.name === name && !d.optional)) {
        return false; // Block uninstall if dependency is required
      }
    }
    this.installed.delete(name);
    return true;
  }

  getInstalled(): { name: string; version: string }[] {
    return Array.from(this.installed.entries()).map(([name, version]) => ({ name, version }));
  }

  checkUpdates(): { name: string; current: string; latest: string }[] {
    const updates: { name: string; current: string; latest: string }[] = [];
    for (const [name, currentVersion] of this.installed) {
      const pkg = Array.from(this.packages.values()).find((p) => p.name === name);
      if (pkg && pkg.version !== currentVersion) {
        updates.push({ name, current: currentVersion, latest: pkg.version });
      }
    }
    return updates;
  }

  update(name: string): boolean {
    if (!this.installed.has(name)) return false;
    const pkg = Array.from(this.packages.values()).find((p) => p.name === name);
    if (!pkg) return false;
    this.installed.set(name, pkg.version);
    return true;
  }

  getStats(): { total: number; installed: number; updates: number } {
    return {
      total: this.packages.size,
      installed: this.installed.size,
      updates: this.checkUpdates().length,
    };
  }
}

export const packageManager = new PackageManager();

// ==========================================
// ETAPA 10 — DEVELOPER PORTAL
// ==========================================

export interface DeveloperProject {
  id: string;
  name: string;
  type: 'plugin' | 'component' | 'exporter' | 'theme' | 'template';
  version: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  downloads: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  marketplaceId?: string;
}

export class DeveloperPortal {
  private projects: DeveloperProject[] = [];
  private apiKeys: Map<string, { id: string; key: string; name: string; permissions: string[]; createdAt: string }> = new Map();

  createProject(name: string, type: DeveloperProject['type'], description: string): DeveloperProject {
    const project: DeveloperProject = {
      id: `dev_${Date.now()}`,
      name,
      type,
      version: '1.0.0',
      description,
      status: 'draft',
      downloads: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.push(project);
    return project;
  }

  updateProject(id: string, data: Partial<DeveloperProject>): DeveloperProject | null {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return null;
    Object.assign(project, data, { updatedAt: new Date().toISOString() });
    return project;
  }

  publishToMarketplace(id: string, marketplaceId: string): DeveloperProject | null {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return null;
    project.status = 'published';
    project.marketplaceId = marketplaceId;
    project.publishedAt = new Date().toISOString();
    return project;
  }

  archiveProject(id: string): boolean {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return false;
    project.status = 'archived';
    return true;
  }

  getProjects(type?: DeveloperProject['type']): DeveloperProject[] {
    let result = [...this.projects];
    if (type) result = result.filter((p) => p.type === type);
    return result;
  }

  getProject(id: string): DeveloperProject | undefined {
    return this.projects.find((p) => p.id === id);
  }

  recordDownload(id: string): void {
    const project = this.projects.find((p) => p.id === id);
    if (project) project.downloads++;
  }

  generateAPIKey(name: string, permissions: string[]): { id: string; key: string } {
    const id = `key_${Date.now()}`;
    const key = `ms_${Math.random().toString(36).substr(2, 24)}`;
    this.apiKeys.set(id, { id, key, name, permissions, createdAt: new Date().toISOString() });
    return { id, key };
  }

  getAPIKeys(): typeof this.apiKeys extends Map<string, infer V> ? V[] : never[] {
    return Array.from(this.apiKeys.values());
  }

  revokeAPIKey(id: string): boolean {
    return this.apiKeys.delete(id);
  }

  validateAPIKey(key: string): boolean {
    return Array.from(this.apiKeys.values()).some((k) => k.key === key);
  }

  getStats(): { projects: number; published: number; drafts: number; apiKeys: number } {
    return {
      projects: this.projects.length,
      published: this.projects.filter((p) => p.status === 'published').length,
      drafts: this.projects.filter((p) => p.status === 'draft').length,
      apiKeys: this.apiKeys.size,
    };
  }
}

export const developerPortal = new DeveloperPortal();

// ==========================================
// COMPREHENSIVE SDK MARKETPLACE PLATFORM
// ==========================================

export class SDKMarketplacePlatform {
  public componentSDK = componentSDK;
  public pluginSDK = pluginSDK;
  public marketplace = marketplace;
  public themeEngine = themeEngine;
  public templateEngine = templateEngine;
  public customExporters = customExporterRegistry;
  public ai = aiExtensionAPI;
  public docs = documentationGenerator;
  public packages = packageManager;
  public developerPortal = developerPortal;

  getDashboardData() {
    return {
      sdk: this.componentSDK.getStats(),
      marketplace: this.marketplace.getStats(),
      themes: this.themeEngine.getStats(),
      templates: this.templateEngine.getStats(),
      exporters: this.customExporters.getStats(),
      ai: this.ai.getStats(),
      packages: this.packages.getStats(),
      developerPortal: this.developerPortal.getStats(),
    };
  }
}

export const sdkMarketplacePlatform = new SDKMarketplacePlatform();
