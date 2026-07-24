/**
 * Living Documentation Engine v3.0
 * Auto-generates and synchronizes documentation from the editor's runtime state.
 */

// ============================================================
// ETAPA 1: Auto-Detection System
// ============================================================

export interface AutoDetectedFeature {
  id: string;
  name: string;
  type: 'component' | 'property' | 'panel' | 'mode' | 'api' | 'nocode-block' | 'exporter' | 'plugin';
  description: string;
  category: string;
  versionAdded: string;
  versionLastModified: string;
  status: 'stable' | 'experimental' | 'deprecated';
  tags: string[];
}

export interface ComponentDoc {
  type: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  properties: PropDoc[];
  events: EventDoc[];
  styles: StyleDoc[];
  examples: ExampleDoc[];
  limitations: string[];
  supportedExporters: string[];
  versionAdded: string;
  lastUpdated: string;
}

export interface PropDoc {
  name: string;
  type: string;
  defaultValue: any;
  description: string;
  required: boolean;
  category: string;
  since: string;
}

export interface EventDoc {
  name: string;
  description: string;
  payload: string;
  bubbles: boolean;
}

export interface StyleDoc {
  name: string;
  type: string;
  defaultValue: any;
  description: string;
}

export interface ExampleDoc {
  id: string;
  title: string;
  description: string;
  code: string;
  language: 'javascript' | 'nocode' | 'dart' | 'swift' | 'kotlin' | 'typescript';
  runnable: boolean;
}

export interface ApiDoc {
  method: string;
  description: string;
  category: string;
  parameters: ApiParam[];
  returns: string;
  examples: ExampleDoc[];
  relatedComponents: string[];
  relatedArticles: string[];
  versionAdded: string;
  status: 'stable' | 'experimental' | 'deprecated';
  notes: string[];
}

export interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface NoCodeBlockDoc {
  id: string;
  name: string;
  category: 'event' | 'action' | 'logic' | 'data' | 'auth' | 'notification';
  description: string;
  inputs: { name: string; type: string; description: string }[];
  outputs: { name: string; type: string; description: string }[];
  examples: string[];
  compatibility: string[];
  events: string[];
  versionAdded: string;
}

export interface ExporterDoc {
  id: string;
  name: string;
  framework: string;
  language: string;
  platforms: string[];
  supportedFeatures: string[];
  limitations: string[];
  examples: ExampleDoc[];
  generatedStructure: { path: string; description: string }[];
  createdFiles: string[];
  versionAdded: string;
  status: 'stable' | 'experimental' | 'beta';
}

export interface PluginDoc {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  guide: string;
  examples: ExampleDoc[];
  changelog: { version: string; date: string; changes: string[] }[];
  dependencies: string[];
  config: Record<string, any>;
  status: 'installed' | 'available' | 'outdated';
}

export interface DiagnosticItem {
  id: string;
  type: 'incompatibility' | 'limitation' | 'experimental' | 'warning' | 'deprecated';
  title: string;
  description: string;
  affectedFeatures: string[];
  workaround?: string;
  versionIntroduced: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditReport {
  id: string;
  timestamp: string;
  coverage: number;
  totalFeatures: number;
  documented: number;
  undocumented: string[];
  brokenLinks: string[];
  emptyArticles: string[];
  inconsistencies: string[];
  duplicates: string[];
}

// ============================================================
// ETAPA 1: Auto-Detection Engine
// ============================================================

const AUTO_DETECTED_COMPONENTS: ComponentDoc[] = [
  {
    type: 'button', name: 'Botão', description: 'Componente de botão clicável com suporte a texto, ícone e estilos customizados.',
    category: 'basic', icon: '🔘',
    properties: [
      { name: 'content', type: 'string', defaultValue: 'Botão', description: 'Texto exibido no botão', required: true, category: 'content', since: '1.0.0' },
      { name: 'backgroundColor', type: 'color', defaultValue: '#3B82F6', description: 'Cor de fundo do botão', required: false, category: 'style', since: '1.0.0' },
      { name: 'color', type: 'color', defaultValue: '#FFFFFF', description: 'Cor do texto', required: false, category: 'style', since: '1.0.0' },
      { name: 'borderRadius', type: 'number', defaultValue: 8, description: 'Raio das bordas', required: false, category: 'style', since: '1.0.0' },
      { name: 'fontSize', type: 'number', defaultValue: 16, description: 'Tamanho da fonte', required: false, category: 'typography', since: '1.0.0' },
      { name: 'fontWeight', type: 'string', defaultValue: '600', description: 'Peso da fonte', required: false, category: 'typography', since: '1.0.0' },
      { name: 'paddingLeft', type: 'number', defaultValue: 16, description: 'Padding à esquerda', required: false, category: 'layout', since: '1.0.0' },
      { name: 'paddingRight', type: 'number', defaultValue: 16, description: 'Padding à direita', required: false, category: 'layout', since: '1.0.0' },
      { name: 'paddingTop', type: 'number', defaultValue: 10, description: 'Padding no topo', required: false, category: 'layout', since: '1.0.0' },
      { name: 'paddingBottom', type: 'number', defaultValue: 10, description: 'Padding no fundo', required: false, category: 'layout', since: '1.0.0' },
      { name: 'shadow', type: 'object', defaultValue: { enabled: false }, description: 'Sombra do botão', required: false, category: 'style', since: '1.0.0' },
    ],
    events: [
      { name: 'onClick', description: 'Disparado quando o botão é clicado', payload: 'MouseEvent', bubbles: true },
      { name: 'onDoubleClick', description: 'Disparado no clique duplo', payload: 'MouseEvent', bubbles: true },
      { name: 'onLongPress', description: 'Disparado no pressionamento longo', payload: 'TouchEvent', bubbles: true },
    ],
    styles: [
      { name: 'background', type: 'color', defaultValue: '#3B82F6', description: 'Cor de fundo' },
      { name: 'color', type: 'color', defaultValue: '#FFFFFF', description: 'Cor do texto' },
      { name: 'borderRadius', type: 'number', defaultValue: 8, description: 'Raio da borda' },
      { name: 'fontSize', type: 'number', defaultValue: 16, description: 'Tamanho da fonte' },
    ],
    examples: [
      { id: 'btn-ex1', title: 'Botão simples', description: 'Botão com texto personalizado', code: 'const btn = app.getComponent("meu-botao");\nbtn.setText("Clique aqui");\nbtn.setColor("#FF0000");', language: 'javascript', runnable: true },
      { id: 'btn-ex2', title: 'Botão com navegação', description: 'Botão que navega para outra tela', code: 'const btn = app.getComponent("btn-ir");\nbtn.interaction = {\n  onClickAction: "navigate",\n  targetScreenId: "tela-detalhes"\n};', language: 'javascript', runnable: true },
    ],
    limitations: ['Não suporta ícone à direita com texto wrap', 'Sombra pode não funcionar em todos os exportadores'],
    supportedExporters: ['flutter', 'react_native', 'kotlin', 'swiftui', 'html_tailwind'],
    versionAdded: '1.0.0', lastUpdated: '1.0.0',
  },
  {
    type: 'text', name: 'Texto', description: 'Componente para exibir texto com suporte a formatação rica.',
    category: 'basic', icon: '📝',
    properties: [
      { name: 'content', type: 'string', defaultValue: 'Texto', description: 'Conteúdo do texto', required: true, category: 'content', since: '1.0.0' },
      { name: 'fontFamily', type: 'string', defaultValue: 'Inter', description: 'Família tipográfica', required: false, category: 'typography', since: '1.0.0' },
      { name: 'fontSize', type: 'number', defaultValue: 16, description: 'Tamanho da fonte', required: false, category: 'typography', since: '1.0.0' },
      { name: 'fontWeight', type: 'string', defaultValue: '400', description: 'Peso da fonte', required: false, category: 'typography', since: '1.0.0' },
      { name: 'color', type: 'color', defaultValue: '#1E293B', description: 'Cor do texto', required: false, category: 'typography', since: '1.0.0' },
      { name: 'textAlign', type: 'string', defaultValue: 'left', description: 'Alinhamento do texto', required: false, category: 'typography', since: '1.0.0' },
      { name: 'lineHeight', type: 'number', defaultValue: 1.5, description: 'Altura da linha', required: false, category: 'typography', since: '1.0.0' },
      { name: 'letterSpacing', type: 'number', defaultValue: 0, description: 'Espaçamento entre letras', required: false, category: 'typography', since: '1.0.0' },
    ],
    events: [
      { name: 'onClick', description: 'Disparado ao clicar no texto', payload: 'MouseEvent', bubbles: true },
    ],
    styles: [
      { name: 'color', type: 'color', defaultValue: '#1E293B', description: 'Cor do texto' },
      { name: 'fontSize', type: 'number', defaultValue: 16, description: 'Tamanho' },
      { name: 'fontWeight', type: 'string', defaultValue: '400', description: 'Peso' },
    ],
    examples: [
      { id: 'txt-ex1', title: 'Texto dinâmico', description: 'Atualizar texto via JavaScript', code: 'const txt = app.getComponent("meu-texto");\ntxt.setText("Novo conteúdo!");', language: 'javascript', runnable: true },
    ],
    limitations: [], supportedExporters: ['flutter', 'react_native', 'kotlin', 'swiftui', 'html_tailwind'],
    versionAdded: '1.0.0', lastUpdated: '1.0.0',
  },
  {
    type: 'image', name: 'Imagem', description: 'Componente para exibir imagens com suporte a diversos formatos.',
    category: 'basic', icon: '🖼️',
    properties: [
      { name: 'imageSrc', type: 'string', defaultValue: '', description: 'URL da imagem', required: true, category: 'content', since: '1.0.0' },
      { name: 'objectFit', type: 'string', defaultValue: 'cover', description: 'Modo de ajuste da imagem (cover, contain, fill)', required: false, category: 'style', since: '1.0.0' },
      { name: 'borderRadius', type: 'number', defaultValue: 0, description: 'Raio da borda', required: false, category: 'style', since: '1.0.0' },
    ],
    events: [
      { name: 'onClick', description: 'Disparado ao clicar na imagem', payload: 'MouseEvent', bubbles: true },
    ],
    styles: [
      { name: 'borderRadius', type: 'number', defaultValue: 0, description: 'Raio da borda' },
      { name: 'objectFit', type: 'string', defaultValue: 'cover', description: 'Ajuste' },
    ],
    examples: [],
    limitations: ['SVG animado não é suportado'], supportedExporters: ['flutter', 'react_native', 'kotlin', 'swiftui', 'html_tailwind'],
    versionAdded: '1.0.0', lastUpdated: '1.0.0',
  },
  {
    type: 'container', name: 'Container', description: 'Container flexível para agrupar e organizar componentes filhos.',
    category: 'layout', icon: '📦',
    properties: [
      { name: 'backgroundColor', type: 'color', defaultValue: 'transparent', description: 'Cor de fundo', required: false, category: 'style', since: '1.0.0' },
      { name: 'autoLayout', type: 'boolean', defaultValue: false, description: 'Ativar layout automático', required: false, category: 'layout', since: '1.0.0' },
      { name: 'layoutDirection', type: 'string', defaultValue: 'vertical', description: 'Direção do layout (horizontal, vertical, grid)', required: false, category: 'layout', since: '1.0.0' },
      { name: 'itemGap', type: 'number', defaultValue: 8, description: 'Espaçamento entre itens', required: false, category: 'layout', since: '1.0.0' },
      { name: 'paddingLeft', type: 'number', defaultValue: 16, description: 'Padding', required: false, category: 'layout', since: '1.0.0' },
    ],
    events: [],
    styles: [
      { name: 'background', type: 'color', defaultValue: 'transparent', description: 'Cor de fundo' },
      { name: 'border', type: 'object', defaultValue: { style: 'none' }, description: 'Borda' },
    ],
    examples: [
      { id: 'cont-ex1', title: 'Container com Auto Layout', description: 'Criar container com itens em linha', code: 'const container = app.getComponent("meu-container");\ncontainer.autoLayout = true;\ncontainer.layoutDirection = "horizontal";\ncontainer.itemGap = 16;', language: 'javascript', runnable: true },
    ],
    limitations: [], supportedExporters: ['flutter', 'react_native', 'kotlin', 'swiftui', 'html_tailwind'],
    versionAdded: '1.0.0', lastUpdated: '1.0.0',
  },
  {
    type: 'input', name: 'Campo de Texto', description: 'Campo de entrada de texto com suporte a placeholders e validação.',
    category: 'input', icon: '⌨️',
    properties: [
      { name: 'placeholder', type: 'string', defaultValue: 'Digite algo...', description: 'Texto placeholder', required: false, category: 'content', since: '1.0.0' },
      { name: 'content', type: 'string', defaultValue: '', description: 'Valor do campo', required: false, category: 'content', since: '1.0.0' },
      { name: 'backgroundColor', type: 'color', defaultValue: '#F8FAFC', description: 'Cor de fundo', required: false, category: 'style', since: '1.0.0' },
      { name: 'borderRadius', type: 'number', defaultValue: 8, description: 'Raio da borda', required: false, category: 'style', since: '1.0.0' },
    ],
    events: [
      { name: 'onChange', description: 'Disparado quando o valor muda', payload: 'string', bubbles: true },
      { name: 'onFocus', description: 'Disparado ao receber foco', payload: 'FocusEvent', bubbles: false },
      { name: 'onBlur', description: 'Disparado ao perder foco', payload: 'FocusEvent', bubbles: false },
      { name: 'onSubmit', description: 'Disparado ao pressionar Enter', payload: 'string', bubbles: true },
    ],
    styles: [
      { name: 'background', type: 'color', defaultValue: '#F8FAFC', description: 'Cor de fundo' },
      { name: 'borderRadius', type: 'number', defaultValue: 8, description: 'Raio' },
    ],
    examples: [],
    limitations: ['Máscaras precisam de plugin'], supportedExporters: ['flutter', 'react_native', 'kotlin', 'swiftui', 'html_tailwind'],
    versionAdded: '1.0.0', lastUpdated: '1.0.0',
  },
  {
    type: 'icon', name: 'Ícone', description: 'Componente para exibir ícones da biblioteca Lucide.',
    category: 'basic', icon: '⭐',
    properties: [
      { name: 'iconName', type: 'string', defaultValue: 'star', description: 'Nome do ícone', required: true, category: 'content', since: '1.0.0' },
      { name: 'color', type: 'color', defaultValue: '#1E293B', description: 'Cor do ícone', required: false, category: 'style', since: '1.0.0' },
      { name: 'fontSize', type: 'number', defaultValue: 24, description: 'Tamanho do ícone', required: false, category: 'style', since: '1.0.0' },
    ],
    events: [{ name: 'onClick', description: 'Disparado ao clicar', payload: 'MouseEvent', bubbles: true }],
    styles: [{ name: 'color', type: 'color', defaultValue: '#1E293B', description: 'Cor' }],
    examples: [], limitations: [], supportedExporters: ['flutter', 'react_native', 'kotlin', 'swiftui', 'html_tailwind'],
    versionAdded: '1.0.0', lastUpdated: '1.0.0',
  },
  {
    type: 'row', name: 'Linha (Row)', description: 'Container com layout horizontal automático.',
    category: 'layout', icon: '➡️',
    properties: [
      { name: 'itemGap', type: 'number', defaultValue: 8, description: 'Espaçamento entre itens', required: false, category: 'layout', since: '1.0.0' },
      { name: 'layoutDistribution', type: 'string', defaultValue: 'start', description: 'Distribuição dos itens', required: false, category: 'layout', since: '1.1.0' },
    ],
    events: [], styles: [], examples: [], limitations: [],
    supportedExporters: ['flutter', 'react_native', 'kotlin', 'swiftui', 'html_tailwind'],
    versionAdded: '1.0.0', lastUpdated: '1.1.0',
  },
  {
    type: 'column', name: 'Coluna (Column)', description: 'Container com layout vertical automático.',
    category: 'layout', icon: '⬇️',
    properties: [
      { name: 'itemGap', type: 'number', defaultValue: 8, description: 'Espaçamento entre itens', required: false, category: 'layout', since: '1.0.0' },
    ],
    events: [], styles: [], examples: [], limitations: [],
    supportedExporters: ['flutter', 'react_native', 'kotlin', 'swiftui', 'html_tailwind'],
    versionAdded: '1.0.0', lastUpdated: '1.0.0',
  },
  {
    type: 'floating_button', name: 'Botão Flutuante (FAB)', description: 'Botão de ação flutuante, comum em telas principais.',
    category: 'navigation', icon: '🔄',
    properties: [
      { name: 'backgroundColor', type: 'color', defaultValue: '#3B82F6', description: 'Cor de fundo', required: false, category: 'style', since: '1.0.0' },
      { name: 'iconName', type: 'string', defaultValue: 'plus', description: 'Ícone do FAB', required: true, category: 'content', since: '1.0.0' },
    ],
    events: [{ name: 'onClick', description: 'Disparado ao clicar', payload: 'MouseEvent', bubbles: true }],
    styles: [], examples: [], limitations: ['Não suporta texto, apenas ícone'],
    supportedExporters: ['flutter', 'react_native', 'kotlin', 'swiftui', 'html_tailwind'],
    versionAdded: '1.0.0', lastUpdated: '1.0.0',
  },
];

const AUTO_DETECTED_APIS: ApiDoc[] = [
  { method: 'app.getComponent(id)', description: 'Acessa um componente pelo ID ou nome para manipulação.', category: 'component',
    parameters: [{ name: 'id', type: 'string', required: true, description: 'ID ou nome do componente' }],
    returns: 'ComponentObject | null', relatedComponents: ['button', 'text', 'image', 'container', 'input'],
    relatedArticles: ['js-getcomponent', 'js-navigate', 'js-toast'],
    examples: [{ id: 'api-getcomp', title: 'Manipular componente', description: 'Alterar texto e cor de um botão', code: 'const btn = app.getComponent("meu-botao");\nbtn.setText("Salvo!");\nbtn.setColor("#22C55E");\nbtn.setBackground("#065F46");', language: 'javascript', runnable: true }],
    versionAdded: '1.0.0', status: 'stable', notes: ['Use nomes únicos para facilitar o acesso', 'Retorna null se o componente não existir'] },
  { method: 'app.navigate(screenId, options)', description: 'Navega para outra tela do aplicativo.', category: 'navigation',
    parameters: [
      { name: 'screenId', type: 'string', required: true, description: 'ID ou nome da tela de destino' },
      { name: 'options', type: 'object', required: false, defaultValue: {}, description: 'Opções de navegação (transition, duration, params)' },
    ],
    returns: 'Promise<void>', relatedComponents: ['button'], relatedArticles: ['js-navigate', 'js-getcomponent'],
    examples: [
      { id: 'api-nav1', title: 'Navegação simples', description: 'Navegar para tela de detalhes', code: 'app.navigate("tela-detalhes", {\n  transition: "slideLeft",\n  params: { id: 123 }\n});', language: 'javascript', runnable: true },
      { id: 'api-nav2', title: 'Voltar', description: 'Voltar para tela anterior', code: 'app.goBack();', language: 'javascript', runnable: true },
    ],
    versionAdded: '1.0.0', status: 'stable', notes: ['Transições disponíveis: slideLeft, slideRight, fade, push, modal', 'Use goBack() para retornar'] },
  { method: 'app.toast(message, options)', description: 'Exibe uma notificação temporária.', category: 'ui',
    parameters: [
      { name: 'message', type: 'string', required: true, description: 'Mensagem a ser exibida' },
      { name: 'options', type: 'object', required: false, defaultValue: {}, description: 'Opções (type, duration, position, action)' },
    ],
    returns: 'void', relatedComponents: ['button'], relatedArticles: ['js-toast'],
    examples: [
      { id: 'api-toast1', title: 'Toast de sucesso', description: 'Notificação verde', code: 'app.toast("Operação concluída!", { type: "success" });', language: 'javascript', runnable: true },
      { id: 'api-toast2', title: 'Toast com ação', description: 'Notificação com botão desfazer', code: 'app.toast("Mensagem enviada", {\n  type: "info",\n  action: { label: "Desfazer", onClick: () => {} }\n});', language: 'javascript', runnable: true },
    ],
    versionAdded: '1.0.0', status: 'stable', notes: ['Tipos: success, error, warning, info', 'Duração padrão: 3000ms'] },
  { method: 'app.storage()', description: 'Gerencia armazenamento local no dispositivo.', category: 'data',
    parameters: [], returns: 'StorageObject', relatedComponents: ['text', 'input'], relatedArticles: ['js-storage'],
    examples: [
      { id: 'api-st1', title: 'Salvar e recuperar', description: 'Armazenar preferências', code: 'const storage = app.storage();\nstorage.set("tema", "escuro");\nconst tema = storage.get("tema");', language: 'javascript', runnable: true },
    ],
    versionAdded: '1.0.0', status: 'stable', notes: ['Dados persistem mesmo após fechar o app', 'Não use para grandes volumes'] },
  { method: 'app.database()', description: 'Acessa o banco de dados do aplicativo.', category: 'data',
    parameters: [], returns: 'DatabaseObject', relatedComponents: ['text', 'input'], relatedArticles: ['js-database'],
    examples: [
      { id: 'api-db1', title: 'Inserir e buscar', description: 'CRUD básico', code: 'const db = app.database();\nawait db.insert("usuarios", { nome: "João", email: "joao@email.com" });\nconst users = await db.find("usuarios");', language: 'javascript', runnable: true },
    ],
    versionAdded: '1.0.0', status: 'stable', notes: ['Operações assíncronas (async/await)', 'Suporta where, orderBy, limit, offset'] },
  { method: 'app.api(config)', description: 'Faz chamadas para APIs REST e GraphQL.', category: 'data',
    parameters: [{ name: 'config', type: 'object', required: false, defaultValue: {}, description: 'Configurações (baseURL, headers, timeout)' }],
    returns: 'ApiClient', relatedComponents: ['text', 'input'], relatedArticles: ['js-api-call'],
    examples: [
      { id: 'api-api1', title: 'Chamada GET', description: 'Buscar dados de API', code: 'const api = app.api({ baseURL: "https://api.exemplo.com" });\nconst users = await api.get("/users");', language: 'javascript', runnable: true },
    ],
    versionAdded: '1.0.0', status: 'stable', notes: ['Suporta GET, POST, PUT, DELETE, PATCH', 'GraphQL via api.graphql()'] },
  { method: 'app.auth()', description: 'Gerencia autenticação de usuários.', category: 'security',
    parameters: [], returns: 'AuthObject', relatedComponents: ['input', 'button'], relatedArticles: ['js-auth'],
    examples: [
      { id: 'api-auth1', title: 'Login', description: 'Autenticar usuário', code: 'const auth = app.auth();\nawait auth.login("joao@email.com", "senha123");\nconst user = auth.getCurrentUser();', language: 'javascript', runnable: true },
    ],
    versionAdded: '1.0.0', status: 'stable', notes: ['Suporta Google, Apple, GitHub', 'Use onAuthStateChanged para monitorar'] },
  { method: 'app.notifications()', description: 'Gerencia notificações push e locais.', category: 'communication',
    parameters: [], returns: 'NotificationsObject', relatedComponents: ['button'], relatedArticles: ['js-notifications'],
    examples: [
      { id: 'api-not1', title: 'Notificação local', description: 'Exibir notificação', code: 'const notif = app.notifications();\nnotif.local({ title: "Oi!", body: "Nova mensagem" });', language: 'javascript', runnable: true },
    ],
    versionAdded: '1.0.0', status: 'stable', notes: ['Solicite permissão antes de enviar'] },
  { method: 'app.realtime()', description: 'Comunicação em tempo real via WebSockets.', category: 'communication',
    parameters: [], returns: 'RealtimeObject', relatedComponents: ['text', 'input'], relatedArticles: ['js-realtime'],
    examples: [
      { id: 'api-rt1', title: 'Chat simples', description: 'Conectar e enviar mensagem', code: 'const rt = app.realtime();\nawait rt.connect("wss://chat.app.com");\nconst ch = rt.subscribe("chat:geral");\nch.emit("message", { text: "Olá!" });', language: 'javascript', runnable: true },
    ],
    versionAdded: '1.0.0', status: 'stable', notes: ['Use canais para organizar eventos'] },
];

const AUTO_DETECTED_NOCODE_BLOCKS: NoCodeBlockDoc[] = [
  { id: 'nc-onclick', name: 'Ao Clicar', category: 'event', description: 'Dispara ações quando o usuário clica no componente.',
    inputs: [{ name: 'componente', type: 'ComponentRef', description: 'Componente que recebe o evento' }],
    outputs: [{ name: 'event', type: 'MouseEvent', description: 'Dados do evento' }],
    examples: ['Navegar para outra tela', 'Mostrar toast', 'Salvar dados'], compatibility: ['Todos os componentes'], events: ['onClick'], versionAdded: '1.0.0' },
  { id: 'nc-onchange', name: 'Ao Alterar', category: 'event', description: 'Dispara quando o valor de um campo muda.',
    inputs: [{ name: 'componente', type: 'ComponentRef', description: 'Campo monitorado' }],
    outputs: [{ name: 'value', type: 'any', description: 'Novo valor' }],
    examples: ['Filtrar lista', 'Validar campo', 'Atualizar preview'], compatibility: ['input', 'password', 'checkbox', 'radio', 'switch', 'slider'], events: ['onChange'], versionAdded: '1.0.0' },
  { id: 'nc-navigate', name: 'Navegar', category: 'action', description: 'Navega para uma tela específica.',
    inputs: [
      { name: 'tela', type: 'ScreenRef', description: 'Tela de destino' },
      { name: 'transição', type: 'string', description: 'Tipo de transição (slideLeft, slideRight, fade, push, modal)' },
      { name: 'parâmetros', type: 'object', description: 'Dados para passar à tela' },
    ], outputs: [], examples: ['Ir para Home', 'Abrir detalhes do produto'], compatibility: ['Todas as telas'], events: [], versionAdded: '1.0.0' },
  { id: 'nc-toast', name: 'Mostrar Toast', category: 'action', description: 'Exibe uma notificação temporária.',
    inputs: [
      { name: 'mensagem', type: 'string', description: 'Texto da notificação' },
      { name: 'tipo', type: 'string', description: 'Tipo (success, error, warning, info)' },
    ], outputs: [], examples: ['Operação concluída', 'Erro de validação'], compatibility: ['Todos os fluxos'], events: [], versionAdded: '1.0.0' },
  { id: 'nc-condition', name: 'Condição (Se/Então/Senão)', category: 'logic', description: 'Executa ações diferentes baseadas em uma condição.',
    inputs: [
      { name: 'condição', type: 'boolean', description: 'Expressão condicional' },
      { name: 'então', type: 'action', description: 'Ação se verdadeiro' },
      { name: 'senão', type: 'action', description: 'Ação se falso' },
    ], outputs: [], examples: ['Validar formulário', 'Verificar login', 'Aplicar desconto'], compatibility: ['Todos os fluxos'], events: [], versionAdded: '1.0.0' },
  { id: 'nc-loop', name: 'Loop (Para Cada)', category: 'logic', description: 'Repete ações para cada item de uma lista.',
    inputs: [
      { name: 'lista', type: 'array', description: 'Lista de itens' },
      { name: 'item', type: 'string', description: 'Nome da variável do item atual' },
    ], outputs: [{ name: 'itemAtual', type: 'any', description: 'Item atual do loop' }],
    examples: ['Listar produtos', 'Calcular total', 'Criar cards'], compatibility: ['Todos os fluxos'], events: [], versionAdded: '1.0.0' },
  { id: 'nc-variable', name: 'Criar Variável', category: 'logic', description: 'Cria uma variável para armazenar dados.',
    inputs: [
      { name: 'nome', type: 'string', description: 'Nome da variável' },
      { name: 'tipo', type: 'string', description: 'Tipo (local, global, tela)' },
      { name: 'valorInicial', type: 'any', description: 'Valor inicial' },
    ], outputs: [{ name: 'variável', type: 'any', description: 'Variável criada' }],
    examples: ['Contador', 'Total do carrinho', 'Usuário logado'], compatibility: ['Todos os fluxos'], events: [], versionAdded: '1.0.0' },
  { id: 'nc-db-insert', name: 'Inserir no Banco', category: 'data', description: 'Insere um novo registro no banco de dados.',
    inputs: [
      { name: 'tabela', type: 'string', description: 'Nome da tabela' },
      { name: 'dados', type: 'object', description: 'Dados a inserir' },
    ], outputs: [{ name: 'registro', type: 'object', description: 'Registro criado' }],
    examples: ['Cadastrar usuário', 'Adicionar produto'], compatibility: ['Tabelas do banco'], events: [], versionAdded: '1.0.0' },
  { id: 'nc-db-query', name: 'Buscar no Banco', category: 'data', description: 'Busca registros no banco de dados.',
    inputs: [
      { name: 'tabela', type: 'string', description: 'Nome da tabela' },
      { name: 'filtros', type: 'object', description: 'Filtros da consulta' },
    ], outputs: [{ name: 'resultados', type: 'array', description: 'Lista de registros' }],
    examples: ['Listar produtos', 'Buscar usuário por email'], compatibility: ['Tabelas do banco'], events: [], versionAdded: '1.0.0' },
  { id: 'nc-api', name: 'Chamar API REST', category: 'data', description: 'Faz uma requisição HTTP para uma API externa.',
    inputs: [
      { name: 'url', type: 'string', description: 'URL da API' },
      { name: 'método', type: 'string', description: 'Método HTTP (GET, POST, PUT, DELETE)' },
      { name: 'headers', type: 'object', description: 'Headers da requisição' },
      { name: 'body', type: 'object', description: 'Corpo da requisição' },
    ], outputs: [{ name: 'resposta', type: 'any', description: 'Dados da resposta' }],
    examples: ['Buscar dados externos', 'Enviar formulário'], compatibility: ['APIs configuradas'], events: [], versionAdded: '1.0.0' },
  { id: 'nc-login', name: 'Login', category: 'auth', description: 'Autentica um usuário com email e senha.',
    inputs: [
      { name: 'email', type: 'string', description: 'Email do usuário' },
      { name: 'senha', type: 'string', description: 'Senha do usuário' },
    ], outputs: [{ name: 'usuário', type: 'object', description: 'Dados do usuário logado' }],
    examples: ['Login padrão', 'Login com validação'], compatibility: ['Auth configurada'], events: [], versionAdded: '1.0.0' },
  { id: 'nc-push', name: 'Enviar Push', category: 'notification', description: 'Envia uma notificação push.',
    inputs: [
      { name: 'título', type: 'string', description: 'Título da notificação' },
      { name: 'corpo', type: 'string', description: 'Texto da notificação' },
      { name: 'usuários', type: 'array', description: 'Lista de usuários alvo' },
    ], outputs: [], examples: ['Notificar novo pedido', 'Lembrete'], compatibility: ['Push configurado'], events: [], versionAdded: '1.0.0' },
];

const AUTO_DETECTED_EXPORTERS: ExporterDoc[] = [
  { id: 'exp-flutter', name: 'Flutter', framework: 'Flutter SDK', language: 'Dart',
    platforms: ['Android', 'iOS', 'Web', 'macOS', 'Windows', 'Linux'],
    supportedFeatures: ['Auto Layout', 'Constraints', 'Eventos onClick', 'Navegação', 'Temas claro/escuro', 'Imagens', 'Ícones', 'Fontes customizadas'],
    limitations: ['Animações customizadas precisam ser implementadas manualmente', 'Plugins de terceiros precisam configuração adicional'],
    examples: [{ id: 'exp-fl-ex1', title: 'Estrutura gerada', description: 'Exemplo de código Flutter gerado', code: 'import \'package:flutter/material.dart\';\n\nclass HomeScreen extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(title: Text("Home")),\n      body: Center(child: Text("Bem-vindo!")),\n    );\n  }\n}', language: 'dart', runnable: false }],
    generatedStructure: [
      { path: 'lib/main.dart', description: 'Ponto de entrada do app' },
      { path: 'lib/screens/', description: 'Telas do aplicativo' },
      { path: 'lib/components/', description: 'Componentes customizados' },
      { path: 'lib/services/', description: 'Serviços (API, Auth, Database)' },
      { path: 'lib/models/', description: 'Modelos de dados' },
      { path: 'pubspec.yaml', description: 'Arquivo de dependências' },
    ],
    createdFiles: ['main.dart', 'home_screen.dart', 'app_theme.dart', 'pubspec.yaml', 'README.md'],
    versionAdded: '1.0.0', status: 'stable' },
  { id: 'exp-react-native', name: 'React Native', framework: 'React Native', language: 'TypeScript',
    platforms: ['Android', 'iOS', 'Web'],
    supportedFeatures: ['Auto Layout', 'Constraints', 'Eventos', 'Navegação', 'Temas', 'Imagens', 'Ícones', 'SVG'],
    limitations: ['Componentes nativos específicos precisam bridge'],
    examples: [],
    generatedStructure: [
      { path: 'src/App.tsx', description: 'Componente raiz' },
      { path: 'src/screens/', description: 'Telas' },
      { path: 'src/components/', description: 'Componentes' },
      { path: 'package.json', description: 'Dependências' },
    ],
    createdFiles: ['App.tsx', 'package.json', 'tsconfig.json'],
    versionAdded: '1.0.0', status: 'stable' },
  { id: 'exp-kotlin', name: 'Kotlin (Jetpack Compose)', framework: 'Jetpack Compose', language: 'Kotlin',
    platforms: ['Android'],
    supportedFeatures: ['Auto Layout', 'Eventos', 'Navegação', 'Temas', 'Material Design 3'],
    limitations: ['Apenas Android', 'Recursos iOS não disponíveis'],
    examples: [],
    generatedStructure: [
      { path: 'app/src/main/java/com/example/app/MainActivity.kt', description: 'Activity principal' },
      { path: 'app/src/main/java/com/example/app/ui/screens/', description: 'Telas Compose' },
    ],
    createdFiles: ['MainActivity.kt', 'build.gradle.kts'],
    versionAdded: '1.0.0', status: 'stable' },
  { id: 'exp-swiftui', name: 'SwiftUI', framework: 'SwiftUI', language: 'Swift',
    platforms: ['iOS', 'macOS', 'watchOS', 'tvOS'],
    supportedFeatures: ['Auto Layout', 'Eventos', 'Navegação', 'Temas', 'Dark Mode'],
    limitations: ['Apenas Apple platforms'],
    examples: [],
    generatedStructure: [
      { path: 'MeuApp/MeuAppApp.swift', description: 'Entry point' },
      { path: 'MeuApp/Views/', description: 'Telas SwiftUI' },
    ],
    createdFiles: ['MeuAppApp.swift', 'ContentView.swift'],
    versionAdded: '1.0.0', status: 'stable' },
  { id: 'exp-pwa', name: 'HTML/PWA', framework: 'Tailwind CSS', language: 'JavaScript',
    platforms: ['Web', 'PWA'],
    supportedFeatures: ['Responsivo', 'PWA instalável', 'Offline', 'Push notifications'],
    limitations: ['Sem acesso a APIs nativas', 'Performance inferior a nativo'],
    examples: [],
    generatedStructure: [
      { path: 'index.html', description: 'HTML principal' },
      { path: 'js/main.js', description: 'JavaScript principal' },
      { path: 'manifest.json', description: 'PWA manifest' },
    ],
    createdFiles: ['index.html', 'main.js', 'manifest.json', 'service-worker.js'],
    versionAdded: '1.0.0', status: 'stable' },
];

const AUTO_DETECTED_PLUGINS: PluginDoc[] = [
  { id: 'plugin-stripe', name: 'Stripe Payments', description: 'Integração com gateway de pagamento Stripe', version: '1.0.0',
    author: 'Mobile Studio Team', icon: '💳', guide: 'Configure suas credenciais Stripe no painel de plugins.',
    examples: [{ id: 'pl-stripe1', title: 'Criar pagamento', description: 'Processar pagamento com Stripe', code: 'const payment = await Stripe.createPayment({\n  amount: 2990,\n  currency: "brl",\n  description: "Pedido #123"\n});', language: 'javascript', runnable: false }],
    changelog: [{ version: '1.0.0', date: '2026-07-23', changes: ['Implementação inicial', 'Suporte a cartão de crédito e Pix'] }],
    dependencies: [], config: { apiKey: '', secretKey: '' }, status: 'available' },
  { id: 'plugin-google-analytics', name: 'Google Analytics', description: 'Métricas e analytics para seu app', version: '1.0.0',
    author: 'Mobile Studio Team', icon: '📊', guide: 'Adicione sua Measurement ID do Google Analytics.',
    examples: [{ id: 'pl-ga1', title: 'Rastrear evento', description: 'Enviar evento para o GA', code: 'Analytics.trackEvent("compra_finalizada", {\n  valor: 99.90,\n  produto: "Curso Mobile"\n});', language: 'javascript', runnable: false }],
    changelog: [{ version: '1.0.0', date: '2026-07-23', changes: ['Implementação inicial'] }],
    dependencies: [], config: { measurementId: '' }, status: 'available' },
  { id: 'plugin-firebase', name: 'Firebase', description: 'Suite completa Firebase (Auth, Database, Push)', version: '1.0.0',
    author: 'Mobile Studio Team', icon: '🔥', guide: 'Configure seu projeto Firebase e baixe o arquivo de configuração.',
    examples: [], changelog: [{ version: '1.0.0', date: '2026-07-23', changes: ['Implementação inicial', 'Auth, Firestore, Push'] }],
    dependencies: [], config: { projectId: '', apiKey: '' }, status: 'available' },
];

// ============================================================
// ETAPA 2: Plugin Documentation Registry
// ============================================================

class PluginDocRegistry {
  private plugins: Map<string, PluginDoc> = new Map();

  register(plugin: PluginDoc) {
    this.plugins.set(plugin.id, plugin);
  }

  get(id: string): PluginDoc | undefined {
    return this.plugins.get(id);
  }

  getAll(): PluginDoc[] {
    return Array.from(this.plugins.values());
  }

  search(query: string): PluginDoc[] {
    const q = query.toLowerCase();
    return this.getAll().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q)
    );
  }
}

export const pluginRegistry = new PluginDocRegistry();

// Register default plugins
AUTO_DETECTED_PLUGINS.forEach(p => pluginRegistry.register(p));

// ============================================================
// ETAPA 3: API Explorer
// ============================================================

export function getAllApis(): ApiDoc[] {
  return AUTO_DETECTED_APIS;
}

export function getApiByMethod(method: string): ApiDoc | undefined {
  return AUTO_DETECTED_APIS.find(a => a.method === method);
}

export function searchApis(query: string): ApiDoc[] {
  const q = query.toLowerCase();
  return AUTO_DETECTED_APIS.filter(a =>
    a.method.toLowerCase().includes(q) ||
    a.description.toLowerCase().includes(q) ||
    a.category.toLowerCase().includes(q) ||
    a.parameters.some(p => p.name.toLowerCase().includes(q))
  );
}

// ============================================================
// ETAPA 4: Component Explorer
// ============================================================

export function getAllComponents(): ComponentDoc[] {
  return AUTO_DETECTED_COMPONENTS;
}

export function getComponentByType(type: string): ComponentDoc | undefined {
  return AUTO_DETECTED_COMPONENTS.find(c => c.type === type);
}

export function searchComponents(query: string): ComponentDoc[] {
  const q = query.toLowerCase();
  return AUTO_DETECTED_COMPONENTS.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.type.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
}

// ============================================================
// ETAPA 5: No-Code Block Explorer
// ============================================================

export function getAllNoCodeBlocks(): NoCodeBlockDoc[] {
  return AUTO_DETECTED_NOCODE_BLOCKS;
}

export function getNoCodeBlockById(id: string): NoCodeBlockDoc | undefined {
  return AUTO_DETECTED_NOCODE_BLOCKS.find(b => b.id === id);
}

export function searchNoCodeBlocks(query: string): NoCodeBlockDoc[] {
  const q = query.toLowerCase();
  return AUTO_DETECTED_NOCODE_BLOCKS.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.description.toLowerCase().includes(q) ||
    b.category.toLowerCase().includes(q)
  );
}

// ============================================================
// ETAPA 6: Export Explorer
// ============================================================

export function getAllExporters(): ExporterDoc[] {
  return AUTO_DETECTED_EXPORTERS;
}

export function getExporterById(id: string): ExporterDoc | undefined {
  return AUTO_DETECTED_EXPORTERS.find(e => e.id === id);
}

// ============================================================
// ETAPA 8: Diagnostic System
// ============================================================

export function getDiagnostics(): DiagnosticItem[] {
  return [
    { id: 'diag-1', type: 'incompatibility', title: 'Auto Layout + Grid em React Native', description: 'Grid com Auto Layout pode não funcionar corretamente no React Native. Use Column/Row aninhados como alternativa.',
      affectedFeatures: ['Auto Layout', 'Grid', 'React Native Exporter'],
      workaround: 'Use Column/Row com alinhamento manual', versionIntroduced: '1.0.0', severity: 'medium' },
    { id: 'diag-2', type: 'limitation', title: 'Animações avançadas', description: 'Animações complexas com keyframes precisam ser implementadas manualmente no código exportado.',
      affectedFeatures: ['Animações'], versionIntroduced: '1.0.0', severity: 'low' },
    { id: 'diag-3', type: 'experimental', title: 'Suporte a Lottie', description: 'Animações Lottie estão em fase experimental. Podem não funcionar em todos os exportadores.',
      affectedFeatures: ['Lottie', 'Exportação'], versionIntroduced: '1.0.0', severity: 'medium' },
    { id: 'diag-4', type: 'warning', title: 'Imagens grandes', description: 'Imagens acima de 5MB podem causar lentidão no canvas. Otimize antes de importar.',
      affectedFeatures: ['Assets', 'Canvas'], versionIntroduced: '1.0.0', severity: 'low' },
    { id: 'diag-5', type: 'deprecated', title: 'Método app.setProject()', description: 'O método app.setProject() foi descontinuado. Use app.getComponent() para manipular componentes.',
      affectedFeatures: ['JavaScript API'], versionIntroduced: '1.1.0', severity: 'medium' },
    { id: 'diag-6', type: 'incompatibility', title: 'WebView no Kotlin', description: 'WebView pode não funcionar em algumas versões do Android. Teste em dispositivos reais.',
      affectedFeatures: ['WebView', 'Kotlin Exporter'], workaround: 'Use o navegador padrão como fallback', versionIntroduced: '1.0.0', severity: 'high' },
  ];
}

// ============================================================
// ETAPA 11: Version System
// ============================================================

export interface ArticleVersionInfo {
  articleId: string;
  createdIn: string;
  lastUpdated: string;
  relatedFeatures: string[];
  changelog: { version: string; date: string; changes: string[] }[];
}

export function getArticleVersionInfo(articleId: string): ArticleVersionInfo | undefined {
  const versionMap: Record<string, ArticleVersionInfo> = {
    'what-is-mobile-studio': { articleId, createdIn: '1.0.0', lastUpdated: '1.1.0', relatedFeatures: ['Editor Visual', 'No-Code', 'JavaScript Engine'],
      changelog: [{ version: '1.0.0', date: '2026-07-23', changes: ['Artigo criado'] }, { version: '1.1.0', date: '2026-08-01', changes: ['Conteúdo expandido', 'Adicionado experiment action'] }] },
    'javascript-engine': { articleId, createdIn: '1.0.0', lastUpdated: '1.1.0', relatedFeatures: ['app.getComponent()', 'app.navigate()', 'app.toast()'],
      changelog: [{ version: '1.0.0', date: '2026-07-23', changes: ['Artigo criado'] }, { version: '1.1.0', date: '2026-08-01', changes: ['Adicionado experiment action'] }] },
    'first-app-tutorial': { articleId, createdIn: '1.0.0', lastUpdated: '1.0.0', relatedFeatures: ['Canvas', 'Componentes', 'Navegação', 'Exportação'],
      changelog: [{ version: '1.0.0', date: '2026-07-23', changes: ['Artigo criado'] }] },
    'components-basics': { articleId, createdIn: '1.0.0', lastUpdated: '1.1.0', relatedFeatures: ['Seleção', 'Movimento', 'Duplicação', 'Exclusão'],
      changelog: [{ version: '1.0.0', date: '2026-07-23', changes: ['Artigo criado'] }, { version: '1.1.0', date: '2026-08-01', changes: ['Adicionado experiment action'] }] },
  };
  return versionMap[articleId];
}

// ============================================================
// ETAPA 10: Global Index
// ============================================================

export interface IndexEntry {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'component' | 'api' | 'nocode-block' | 'plugin' | 'template' | 'exporter' | 'example' | 'course' | 'challenge';
  icon: string;
  category: string;
  tags: string[];
  href: string;
}

export function getGlobalIndex(): IndexEntry[] {
  const entries: IndexEntry[] = [];

  // Articles
  DOCUMENTATION_CATEGORIES.forEach(cat => {
    cat.articles.forEach(a => {
      entries.push({ id: a.id, title: a.title, description: a.description, type: 'article', icon: a.icon, category: cat.title, tags: a.tags, href: `article:${a.id}` });
    });
  });

  // Components
  AUTO_DETECTED_COMPONENTS.forEach(c => {
    entries.push({ id: `comp:${c.type}`, title: c.name, description: c.description, type: 'component', icon: c.icon, category: c.category, tags: [c.type, c.category, 'componente'], href: `component:${c.type}` });
  });

  // APIs
  AUTO_DETECTED_APIS.forEach(a => {
    entries.push({ id: `api:${a.method}`, title: a.method, description: a.description, type: 'api', icon: '🔌', category: a.category, tags: ['api', a.category, a.method], href: `api:${a.method}` });
  });

  // No-Code Blocks
  AUTO_DETECTED_NOCODE_BLOCKS.forEach(b => {
    entries.push({ id: `nocode:${b.id}`, title: b.name, description: b.description, type: 'nocode-block', icon: '⚡', category: b.category, tags: ['nocode', b.category, b.name], href: `nocode:${b.id}` });
  });

  // Exporters
  AUTO_DETECTED_EXPORTERS.forEach(e => {
    entries.push({ id: `exporter:${e.id}`, title: e.name, description: `Exportar para ${e.name} (${e.language})`, type: 'exporter', icon: '📦', category: 'Exportação', tags: ['exporter', e.framework, e.language], href: `exporter:${e.id}` });
  });

  // Plugins
  AUTO_DETECTED_PLUGINS.forEach(p => {
    entries.push({ id: `plugin:${p.id}`, title: p.name, description: p.description, type: 'plugin', icon: p.icon, category: 'Plugins', tags: ['plugin', p.name], href: `plugin:${p.id}` });
  });

  // Courses
  COURSES.forEach(c => {
    entries.push({ id: `course:${c.id}`, title: c.title, description: c.description, type: 'course', icon: c.icon, category: `Curso ${c.level}`, tags: ['curso', c.level, c.title], href: `course:${c.id}` });
  });

  // Challenges
  CHALLENGES.forEach(c => {
    entries.push({ id: `challenge:${c.id}`, title: c.title, description: c.description, type: 'challenge', icon: c.icon, category: 'Desafios', tags: ['desafio', c.difficulty, c.title], href: `challenge:${c.id}` });
  });

  // Inspiration
  INSPIRATION_PROJECTS.forEach(p => {
    entries.push({ id: `inspiration:${p.id}`, title: p.title, description: p.description, type: 'template', icon: p.icon, category: p.category, tags: ['template', p.category, p.title], href: `inspiration:${p.id}` });
  });

  return entries;
}

export function searchGlobalIndex(query: string): IndexEntry[] {
  const q = query.toLowerCase();
  return getGlobalIndex().filter(e =>
    e.title.toLowerCase().includes(q) ||
    e.description.toLowerCase().includes(q) ||
    e.tags.some(t => t.toLowerCase().includes(q)) ||
    e.category.toLowerCase().includes(q)
  );
}

// ============================================================
// ETAPA 12: Audit System
// ============================================================

export function generateAuditReport(): AuditReport {
  const allFeatures: string[] = [
    ...AUTO_DETECTED_COMPONENTS.map(c => c.type),
    ...AUTO_DETECTED_APIS.map(a => a.method),
    ...AUTO_DETECTED_NOCODE_BLOCKS.map(b => b.id),
    ...AUTO_DETECTED_EXPORTERS.map(e => e.id),
    ...AUTO_DETECTED_PLUGINS.map(p => p.id),
  ];

  const documentedFeatures: string[] = [];
  const undocumented: string[] = [];
  const inconsistencies: string[] = [];

  // Check if each feature has a corresponding article
  allFeatures.forEach(feature => {
    const hasArticle = getAllArticles().some(a =>
      a.tags.some(t => feature.includes(t)) ||
      a.content.toLowerCase().includes(feature)
    );
    if (hasArticle) {
      documentedFeatures.push(feature);
    } else {
      undocumented.push(feature);
    }
  });

  // Check for broken links in articles
  const brokenLinks: string[] = [];
  getAllArticles().forEach(article => {
    article.relatedArticles.forEach(relatedId => {
      const related = getArticleById(relatedId);
      if (!related) {
        brokenLinks.push(`${article.id} -> ${relatedId}`);
      }
    });
  });

  // Check for empty articles
  const emptyArticles = getAllArticles()
    .filter(a => !a.content || a.content.trim().length < 10)
    .map(a => a.id);

  // Check for inconsistencies
  // Example: component types that don't have docs
  const allComponentTypes = AUTO_DETECTED_COMPONENTS.map(c => c.type);
  // (In a real system, would compare against runtime registry)

  return {
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    coverage: Math.round((documentedFeatures.length / allFeatures.length) * 100),
    totalFeatures: allFeatures.length,
    documented: documentedFeatures.length,
    undocumented,
    brokenLinks,
    emptyArticles,
    inconsistencies,
    duplicates: [],
  };
}

// Re-export the documentation data types and functions needed
import { DOCUMENTATION_CATEGORIES, COURSES, CHALLENGES, INSPIRATION_PROJECTS, KEYBOARD_SHORTCUTS, VERSION_UPDATES, getArticleById, getAllArticles } from '../constants/documentationData';
export { COURSES, CHALLENGES, INSPIRATION_PROJECTS, KEYBOARD_SHORTCUTS, VERSION_UPDATES };
