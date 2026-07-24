import { Project, Screen, CanvasComponent } from '../types';

export interface IRComponent {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  content: string;
  backgroundColor: string;
  color: string;
  borderRadius: number;
  fontSize: number;
  fontWeight: string;
  textAlign: string;
  parentId?: string;
  autoLayout?: {
    enabled: boolean;
    direction: string;
    gap: number;
    padding: number;
  };
  constraints?: {
    horizontal: string;
    vertical: string;
  };
  children: IRComponent[];
  events: Record<string, {
    enabled: boolean;
    actions: {
      id: string;
      type: string;
      flowId?: string;
      javaScript?: string;
      targetScreenId?: string;
      toastMessage?: string;
      disabled: boolean;
      label?: string;
    }[];
    haltOnError?: boolean;
    parallel?: boolean;
    debounceMs?: number;
    throttleMs?: number;
  }>;
  // Additional component-specific properties
  placeholder?: string;
  checked?: boolean;
  value?: number;
  minValue?: number;
  maxValue?: number;
  iconName?: string;
  imageSrc?: string;
  objectFit?: string;
  items?: string[];
}

export interface IRScreen {
  id: string;
  name: string;
  backgroundColor: string;
  components: IRComponent[];
}

export interface IRVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  scope: 'local' | 'global';
  initialValue: any;
}

export interface IRDatabaseCollection {
  name: string;
  fields: { name: string; type: string; required?: boolean }[];
}

export interface IRApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
}

export interface IRLogicFlow {
  id: string;
  triggerEvent: string;
  targetComponentId?: string;
  actions: {
    type: string;
    params: Record<string, any>;
  }[];
}

export interface IRAuthConfig {
  enabled: boolean;
  providers: string[];
  sessionTimeoutMinutes: number;
}

export interface IRRole {
  name: string;
  permissions: string[];
}

export interface IRSecurityRule {
  resource: string;
  action: string;
  condition: string;
  requiredRole?: string;
}

export interface IRNotificationConfig {
  enabled: boolean;
  inAppCenterEnabled: boolean;
  pushEnabled: boolean;
  defaultChannel: string;
}

export interface IRPushProvider {
  name: string;
  type: 'fcm' | 'apns' | 'webpush';
  enabled: boolean;
}

export interface IRRealtimeEvent {
  event: string;
  description: string;
}

export interface IRCommunicationFlow {
  id: string;
  event: string;
  action: string;
  recipient: string;
}

export interface IRAppManifest {
  name: string;
  id: string;
  version: string;
  buildNumber: number;
  description: string;
  category: string;
}

export interface IRDevicePermission {
  type: string;
  enabled: boolean;
  reason: string;
}

/**
 * Portable collaboration data that may be added by collaboration services.
 * Keeping this data-only avoids coupling the IR to service implementations.
 */
export interface IRCollaborationMeta {
  versionHistory: {
    snapshotCount: number;
    lastSnapshotId?: string;
    branches: { name: string; headSnapshotId: string }[];
  };
  collaborators: { name: string; email: string; lastActive: string }[];
  comments: { total: number; unresolved: number; lastActivity: string };
  pipeline: { configured: boolean; lastRunStatus?: string; lastRunAt?: string };
  deploy: { configured: boolean; lastPublishedAt?: string; lastVersion?: string };
  audit: { totalActions: number; lastAction?: string };
}

export interface StudioIR {
  version: string;
  appInfo: {
    id: string;
    name: string;
    packageName: string;
    version: string;
    deviceWidth: number;
    deviceHeight: number;
  };
  activeScreenId: string;
  screens: IRScreen[];
  variables: IRVariable[];
  databaseCollections: IRDatabaseCollection[];
  apiEndpoints: IRApiEndpoint[];
  logicFlows: IRLogicFlow[];
  authConfig?: IRAuthConfig;
  roles?: IRRole[];
  securityRules?: IRSecurityRule[];
  notificationConfig?: IRNotificationConfig;
  pushProviders?: IRPushProvider[];
  realtimeEvents?: IRRealtimeEvent[];
  communicationFlows?: IRCommunicationFlow[];
  appManifest?: IRAppManifest;
  permissions?: IRDevicePermission[];
  environments?: {
    active: string;
    apiUrl: string;
  };
  buildConfig?: {
    targets: string[];
    version: string;
  };
  deploymentConfig?: {
    googlePlayReady: boolean;
    appStoreReady: boolean;
  };
  collaborationMeta?: IRCollaborationMeta;
}

/**
 * Compiles a Mobile Studio Project into a unified Intermediate Representation (StudioIR).
 * The IR acts as the single source of truth for code generators and multi-platform exporters.
 */
export function compileProjectToIR(project: Project): StudioIR {
  const sanitizeName = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const mapComponent = (comp: CanvasComponent): IRComponent => {
    return {
      id: comp.id,
      name: comp.name || `comp_${comp.id}`,
      type: comp.type || 'container',
      x: comp.x || 0,
      y: comp.y || 0,
      width: comp.width || 100,
      height: comp.height || 40,
      visible: !comp.hidden,
      content: comp.content || comp.label || '',
      backgroundColor: comp.backgroundColor || 'transparent',
      color: comp.color || '#000000',
      borderRadius: comp.borderRadius || comp.border?.radiusTopLeft || 0,
      fontSize: comp.fontSize || 14,
      fontWeight: comp.fontWeight || '400',
      textAlign: comp.textAlign || 'left',
      autoLayout: comp.autoLayout
        ? {
            enabled: comp.autoLayout,
            direction: comp.layoutDirection || 'vertical',
            gap: comp.itemGap || 8,
            padding: comp.paddingTop || 8,
          }
        : undefined,
      constraints: comp.constraints
        ? {
            horizontal: comp.constraints.horizontal,
            vertical: comp.constraints.vertical,
          }
        : undefined,
      children: (comp.children || []).map(mapComponent),
      events: (comp as any).events || {},
    };
  };

  const screens: IRScreen[] = (project.screens || []).map((scr: Screen) => ({
    id: scr.id,
    name: scr.name,
    backgroundColor: scr.backgroundColor || '#FFFFFF',
    components: (scr.components || []).map(mapComponent),
  }));

  // Default initial IR variables & database structure if not explicitly defined
  const variables: IRVariable[] = [
    { name: 'currentUser', type: 'object', scope: 'global', initialValue: null },
    { name: 'themeMode', type: 'string', scope: 'global', initialValue: 'dark' },
    { name: 'isLoggedIn', type: 'boolean', scope: 'global', initialValue: false },
  ];

  const databaseCollections: IRDatabaseCollection[] = [
    {
      name: 'users',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
      ],
    },
    {
      name: 'preferences',
      fields: [
        { name: 'key', type: 'string', required: true },
        { name: 'value', type: 'string', required: false },
      ],
    },
  ];

  const apiEndpoints: IRApiEndpoint[] = [
    {
      id: 'api_auth_login',
      name: 'LoginUser',
      method: 'POST',
      url: 'https://api.example.com/v1/auth/login',
    },
  ];

  const logicFlows: IRLogicFlow[] = [
    {
      id: 'flow_login_click',
      triggerEvent: 'onClick',
      targetComponentId: 'btnLogin',
      actions: [
        { type: 'SHOW_TOAST', params: { message: 'Iniciando login...' } },
        { type: 'NAVIGATE', params: { targetScreen: 'Home' } },
      ],
    },
  ];

  return {
    version: '1.0.0-IR',
    appInfo: {
      id: project.id,
      name: project.name || 'MobileStudioApp',
      packageName: `com.mobilestudio.${sanitizeName(project.name || 'app')}`,
      version: project.version || '1.0.0',
      deviceWidth: project.device?.width || 393,
      deviceHeight: project.device?.height || 852,
    },
    activeScreenId: project.activeScreenId || (project.screens && project.screens[0]?.id) || 'scr_1',
    screens,
    variables,
    databaseCollections,
    apiEndpoints,
    logicFlows,
    authConfig: {
      enabled: true,
      providers: ['email_password', 'anonymous', 'google_oauth'],
      sessionTimeoutMinutes: 1440,
    },
    roles: [
      { name: 'Admin', permissions: ['*'] },
      { name: 'Editor', permissions: ['create', 'read', 'update'] },
      { name: 'User', permissions: ['read', 'update_own'] },
      { name: 'Guest', permissions: ['read_public'] },
    ],
    securityRules: [
      { resource: 'table:users', action: 'read', condition: 'authenticated' },
      { resource: 'table:orders', action: 'write', condition: 'hasRole', requiredRole: 'User' },
    ],
    notificationConfig: {
      enabled: true,
      inAppCenterEnabled: true,
      pushEnabled: true,
      defaultChannel: 'default_notifications',
    },
    pushProviders: [
      { name: 'Firebase Cloud Messaging (FCM)', type: 'fcm', enabled: true },
      { name: 'Apple Push Notification Service (APNs)', type: 'apns', enabled: true },
      { name: 'Web Push Standard API', type: 'webpush', enabled: true },
    ],
    realtimeEvents: [
      { event: 'chat_message', description: 'Mensagem de chat instantânea' },
      { event: 'status_update', description: 'Atualização de status em tempo real' },
      { event: 'user_online', description: 'Presença e estado do usuário' },
    ],
    communicationFlows: [
      { id: 'cf_1', event: 'user_registered', action: 'send_email', recipient: 'user_email' },
      { id: 'cf_2', event: 'order_created', action: 'send_push', recipient: 'user_devices' },
    ],
    appManifest: {
      name: project.name || 'Mobile Studio App',
      id: 'com.mobilestudio.app',
      version: project.version || '1.0.0',
      buildNumber: 1,
      description: 'Aplicativo gerado via Mobile Studio Pro',
      category: 'Productivity',
    },
    permissions: [
      { type: 'CAMERA', enabled: true, reason: 'Tirar fotos no app' },
      { type: 'GPS', enabled: true, reason: 'Obter localização' },
      { type: 'NOTIFICATIONS', enabled: true, reason: 'Enviar alertas push' },
    ],
    environments: {
      active: 'development',
      apiUrl: 'https://dev-api.mobilestudio.app',
    },
    buildConfig: {
      targets: ['android_apk', 'android_aab', 'ios_ipa', 'web_pwa', 'flutter', 'react_native'],
      version: '1.0.0',
    },
    deploymentConfig: {
      googlePlayReady: true,
      appStoreReady: true,
    },
  };
}
