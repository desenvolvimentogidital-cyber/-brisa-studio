import { studioEventBus, StudioEventType } from './eventBus';
import { DEFAULT_PLUGIN_POLICY, PluginValidationPolicy, validatePluginManifest } from './enterpriseSecurity';

export interface MobileStudioPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'no-code' | 'database' | 'api' | 'exporter' | 'ui-component' | 'theme';
  onRegister?: () => void;
  onUnregister?: () => void;
  onEvent?: (eventType: StudioEventType, data?: any) => void;
  /** Public manifest data checked before registration. */
  security?: {
    integrity?: string;
    signature?: string;
    permissions?: string[];
  };
}

export class PluginManager {
  private plugins: Map<string, MobileStudioPlugin> = new Map();
  private unsubscribers: Map<string, () => void> = new Map();
  private securityPolicy: PluginValidationPolicy = { ...DEFAULT_PLUGIN_POLICY };

  configureSecurity(policy: Partial<PluginValidationPolicy>): PluginValidationPolicy {
    this.securityPolicy = {
      ...this.securityPolicy,
      ...policy,
      allowedPermissions: policy.allowedPermissions || this.securityPolicy.allowedPermissions,
    };
    return { ...this.securityPolicy, allowedPermissions: [...this.securityPolicy.allowedPermissions] };
  }

  getSecurityPolicy(): PluginValidationPolicy {
    return { ...this.securityPolicy, allowedPermissions: [...this.securityPolicy.allowedPermissions] };
  }

  validatePlugin(plugin: MobileStudioPlugin) {
    return validatePluginManifest({
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      author: plugin.author,
      integrity: plugin.security?.integrity,
      signature: plugin.security?.signature,
      permissions: plugin.security?.permissions,
    }, this.securityPolicy);
  }

  registerPlugin(plugin: MobileStudioPlugin): boolean {
    const validation = this.validatePlugin(plugin);
    if (!validation.valid) {
      console.error(`[PluginManager] Plugin rejected: ${validation.reason}`);
      return false;
    }
    if (this.plugins.has(plugin.id)) {
      console.warn(`[PluginManager] Plugin "${plugin.id}" já está registrado.`);
      return false;
    }

    this.plugins.set(plugin.id, plugin);

    // Call registration lifecycle hook
    if (plugin.onRegister) {
      try {
        plugin.onRegister();
      } catch (err) {
        console.error(`[PluginManager] Error registering plugin ${plugin.id}:`, err);
      }
    }

    // Subscribe to global Event Bus if plugin defines onEvent
    if (plugin.onEvent) {
      const unsub = studioEventBus.subscribe('ComponentCreated', (event) => {
        plugin.onEvent?.(event.type, event.data);
      });
      this.unsubscribers.set(plugin.id, unsub);
    }

    studioEventBus.publish('PluginRegistered', { pluginId: plugin.id, name: plugin.name });
    return true;
  }

  unregisterPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    if (plugin.onUnregister) {
      try {
        plugin.onUnregister();
      } catch (err) {
        console.error(`[PluginManager] Error unregistering plugin ${pluginId}:`, err);
      }
    }

    const unsub = this.unsubscribers.get(pluginId);
    if (unsub) {
      unsub();
      this.unsubscribers.delete(pluginId);
    }

    this.plugins.delete(pluginId);
    studioEventBus.publish('PluginUnregistered', { pluginId });
    return true;
  }

  getPlugin(pluginId: string): MobileStudioPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getPlugins(): MobileStudioPlugin[] {
    return Array.from(this.plugins.values());
  }

  clear(): void {
    this.plugins.forEach((_, id) => this.unregisterPlugin(id));
  }
}

export const pluginManager = new PluginManager();
