export interface NoCodeBlockAction {
  id: string;
  type:
    | 'NAVIGATE'
    | 'SHOW_TOAST'
    | 'SHOW_MODAL'
    | 'HIDE_MODAL'
    | 'SET_TEXT'
    | 'SET_BACKGROUND'
    | 'SET_VISIBLE'
    | 'STORAGE_SET'
    | 'STORAGE_GET'
    | 'DATABASE_READ'
    | 'DATABASE_WRITE'
    | 'DATABASE_QUERY'
    | 'DATABASE_CREATE'
    | 'DATABASE_UPDATE'
    | 'DATABASE_DELETE'
    | 'API_REQUEST'
    | 'AUTH_LOGIN'
    | 'AUTH_LOGOUT'
    | 'AUTH_REGISTER'
    | 'CHECK_PERMISSION'
    | 'NOTIFICATION_SEND'
    | 'NOTIFICATION_READ'
    | 'REALTIME_EMIT'
    | 'EMAIL_SEND'
    | 'BUILD_TRIGGER'
    | 'ANIMATE';
  params: Record<string, any>;
}

export interface NoCodeBlockCondition {
  id: string;
  variableName: string;
  operator: '==' | '!=' | '>' | '<' | 'contains';
  compareValue: any;
  thenActions: NoCodeBlockAction[];
  elseActions?: NoCodeBlockAction[];
}

export interface NoCodeFlowRule {
  id: string;
  name: string;
  triggerEvent: 'onClick' | 'onLoad' | 'onChange' | 'onTimer';
  targetComponentId?: string;
  conditions?: NoCodeBlockCondition[];
  actions: NoCodeBlockAction[];
}

/**
 * Converts a visual No-Code Flow Rule into clean executable JavaScript code
 * compatible with the Mobile Studio `app` SDK.
 */
export function compileNoCodeFlowToJS(rule: NoCodeFlowRule): string {
  const actionToJS = (act: NoCodeBlockAction): string => {
    switch (act.type) {
      case 'NAVIGATE':
        return `app.navigate("${act.params.targetScreen || 'Home'}");`;
      case 'SHOW_TOAST':
        return `app.toast("${act.params.message || 'Mensagem'}");`;
      case 'SHOW_MODAL':
        return `app.showModal("${act.params.modalName || 'Modal'}");`;
      case 'HIDE_MODAL':
        return `app.hideModal("${act.params.modalName || 'Modal'}");`;
      case 'SET_TEXT':
        return `
const comp = app.getComponent("${act.params.componentId}");
if (comp) comp.text = "${act.params.text || ''}";`.trim();
      case 'SET_BACKGROUND':
        return `
const comp = app.getComponent("${act.params.componentId}");
if (comp) comp.background = "${act.params.color || '#0066FF'}";`.trim();
      case 'SET_VISIBLE':
        return `
const comp = app.getComponent("${act.params.componentId}");
if (comp) comp.visible = ${act.params.visible !== false};`.trim();
      case 'STORAGE_SET':
        return `app.storage.set("${act.params.key}", "${act.params.value}");`;
      case 'STORAGE_GET':
        return `const val = app.storage.get("${act.params.key}");`;
      case 'DATABASE_CREATE':
      case 'DATABASE_WRITE':
        return `await app.database.create("${act.params.collection || 'items'}", ${JSON.stringify(act.params.record || {})});`;
      case 'DATABASE_READ':
      case 'DATABASE_QUERY':
        return `const records = await app.database.query("${act.params.collection || 'items'}");`;
      case 'DATABASE_UPDATE':
        return `await app.database.update("${act.params.collection || 'items'}", "${act.params.id || ''}", ${JSON.stringify(act.params.record || {})});`;
      case 'DATABASE_DELETE':
        return `await app.database.delete("${act.params.collection || 'items'}", "${act.params.id || ''}");`;
      case 'API_REQUEST':
        return `const apiRes = await app.api.request("${act.params.url || 'https://api.example.com'}", { method: "${act.params.method || 'GET'}" });`;
      case 'AUTH_LOGIN':
        return `await app.auth.login("${act.params.email || ''}", "${act.params.password || ''}");`;
      case 'AUTH_LOGOUT':
        return `await app.auth.logout();`;
      case 'AUTH_REGISTER':
        return `await app.auth.register({ name: "${act.params.name || ''}", email: "${act.params.email || ''}", password: "${act.params.password || ''}" });`;
      case 'CHECK_PERMISSION':
        return `const hasPerm = app.auth.hasPermission("${act.params.permission || 'read'}");`;
      case 'NOTIFICATION_SEND':
        return `await app.notifications.send("${act.params.title || 'Alerta'}", "${act.params.message || 'Nova Notificação'}", "${act.params.userId || ''}");`;
      case 'NOTIFICATION_READ':
        return `app.notifications.read("${act.params.id || ''}");`;
      case 'REALTIME_EMIT':
        return `app.realtime.emit("${act.params.event || 'update'}", ${JSON.stringify(act.params.data || {})});`;
      case 'EMAIL_SEND':
        return `await app.api.post("/api/email/send", { to: "${act.params.to || ''}", subject: "${act.params.subject || ''}", body: "${act.params.body || ''}" });`;
      case 'BUILD_TRIGGER':
        return `await app.build.trigger("${act.params.target || 'android_apk'}", "${act.params.environment || 'development'}");`;
      case 'ANIMATE':
        return `
const comp = app.getComponent("${act.params.componentId}");
if (comp) comp.animate("${act.params.animationType || 'fadeIn'}");`.trim();
      default:
        return `// Action ${act.type}`;
    }
  };

  const actionsJs = rule.actions.map(actionToJS).join('\n  ');

  if (rule.triggerEvent === 'onClick' && rule.targetComponentId) {
    return `
// Flow: ${rule.name}
app.onClick("${rule.targetComponentId}", () => {
  ${actionsJs}
});
`.trim();
  }

  if (rule.triggerEvent === 'onLoad') {
    return `
// Flow: ${rule.name}
app.onLoad(() => {
  ${actionsJs}
});
`.trim();
  }

  return `
// Flow: ${rule.name}
${actionsJs}
`.trim();
}
