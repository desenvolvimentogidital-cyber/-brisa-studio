export interface DocArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  icon: string;
  order: number;
  relatedArticles: string[];
  examples?: string[];
  experimentAction?: string;
  experimentData?: any;
}

export interface DocCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  articles: DocArticle[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'basic' | 'intermediate' | 'advanced';
  icon: string;
  order: number;
  estimatedTime: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  articleId: string;
  duration: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  steps: ChallengeStep[];
  rewardTitle: string;
}

export interface ChallengeStep {
  id: string;
  description: string;
  hint: string;
}

export interface InspirationProject {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  image: string;
  difficulty: string;
  features: string[];
}

export interface KeyboardShortcut {
  id: string;
  key: string;
  description: string;
  category: string;
  keys: string[];
  animation?: string;
}

export interface VersionUpdate {
  id: string;
  version: string;
  date: string;
  type: 'new' | 'improvement' | 'fix' | 'breaking';
  title: string;
  description: string;
}

export const DOCUMENTATION_CATEGORIES: DocCategory[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Mobile Studio',
    description: 'Conheça a plataforma e entenda como tudo funciona',
    icon: '🎉',
    order: 1,
    articles: [
      {
        id: 'what-is-mobile-studio',
        title: 'O que é o Mobile Studio',
        description: 'Visão geral da plataforma',
        tags: ['introdução', 'visão geral', 'plataforma'],
        icon: '🚀',
        order: 1,
        category: 'welcome',
        relatedArticles: ['how-it-works', 'ecosystem'],
        content: `# O que é o Mobile Studio

O **Mobile Studio** é uma plataforma visual de desenvolvimento mobile que permite criar aplicativos nativos profissionais sem precisar escrever código do zero.

## Para quem foi criado
Designers de UI/UX, Desenvolvedores, Empreendedores, Agências, Educadores

## Principais recursos
Editor Visual, No-Code, JavaScript Engine, Banco de Dados, APIs, Autenticação, Exportação, Marketplace`
      },
      {
        id: 'how-it-works',
        title: 'Como funciona',
        description: 'Entenda a arquitetura',
        tags: ['arquitetura', 'funcionamento', 'fluxo'],
        icon: '⚙️',
        order: 2,
        category: 'welcome',
        relatedArticles: ['what-is-mobile-studio', 'ecosystem'],
        content: `# Como funciona

Editor Visual + Motor de Lógica (No-Code/JavaScript) + Exportação (Flutter, RN, Kotlin, SwiftUI, PWA)`
      },
      {
        id: 'ecosystem',
        title: 'Ecossistema',
        description: 'Módulos integrados',
        tags: ['ecossistema', 'módulos', 'integração'],
        icon: '🌐',
        order: 3,
        category: 'welcome',
        relatedArticles: ['how-it-works', 'editor-visual', 'javascript-engine', 'nocode'],
        content: `# Ecossistema

Editor Visual, JavaScript Engine, No-Code, Database, API, Auth, Export, Marketplace`
      },
      {
        id: 'editor-visual',
        title: 'Editor Visual',
        description: 'Drag-and-drop',
        tags: ['editor', 'visual', 'drag-drop', 'canvas'],
        icon: '🎨',
        order: 4,
        category: 'welcome',
        relatedArticles: ['interface', 'components'],
        experimentAction: 'openCanvas',
        content: `# Editor Visual

Arraste componentes, posicione, ajuste propriedades, conecte eventos. WYSIWYG em tempo real.`
      },
      {
        id: 'javascript-engine',
        title: 'JavaScript Engine',
        description: 'API completa',
        tags: ['javascript', 'código', 'api', 'engine'],
        icon: '📝',
        order: 5,
        category: 'welcome',
        relatedArticles: ['js-api', 'nocode'],
        experimentAction: 'openCodeEditor',
        content: `# JavaScript Engine

app.getComponent(), app.navigate(), app.toast(), app.storage(), app.database(), app.api(), app.auth(), app.notifications(), app.realtime()`
      },
      {
        id: 'nocode',
        title: 'No-Code',
        description: 'Lógica visual',
        tags: ['nocode', 'lógica', 'fluxos', 'visual'],
        icon: '⚡',
        order: 6,
        category: 'welcome',
        relatedArticles: ['javascript-engine', 'nocode-guide'],
        experimentAction: 'openNoCode',
        content: `# No-Code

Eventos, Ações, Condições, Variáveis, Loops. Crie lógica sem escrever código.`
      }
    ]
  },
  {
    id: 'getting-started',
    title: 'Primeiros Passos',
    description: 'Comece rapidamente',
    icon: '🏁',
    order: 2,
    articles: [
      {
        id: 'creating-account',
        title: 'Criando uma conta',
        description: 'Como criar sua conta',
        tags: ['conta', 'cadastro', 'registro'],
        icon: '👤',
        order: 1,
        category: 'getting-started',
        relatedArticles: ['creating-project', 'interface'],
        content: `# Criando uma conta

1. Abra o Mobile Studio e clique em "Criar Conta"
2. Preencha nome, email e senha
3. Escolha método: Email, Google, Apple ou GitHub
4. Confirme seu email`
      },
      {
        id: 'creating-project',
        title: 'Criando um projeto',
        description: 'Aprenda a criar seu primeiro projeto',
        tags: ['projeto', 'criar', 'novo'],
        icon: '📁',
        order: 2,
        category: 'getting-started',
        relatedArticles: ['choosing-template', 'empty-project', 'interface'],
        experimentAction: 'newProject',
        content: `# Criando um projeto

## Usando Template
1. Clique em "Novo Projeto a partir de Template"
2. Escolha: E-commerce, Social, Dashboard, Delivery, Financeiro, CRM

## Projeto Vazio
1. Clique em "Novo Projeto Limpo"
2. Escolha o dispositivo`
      },
      {
        id: 'choosing-template',
        title: 'Escolhendo um template',
        description: 'Saiba qual template escolher',
        tags: ['template', 'modelo', 'começar'],
        icon: '📋',
        order: 3,
        category: 'getting-started',
        relatedArticles: ['creating-project', 'empty-project'],
        content: `# Templates

E-commerce, Social App, Dashboard, Delivery, Financeiro, CRM`
      },
      {
        id: 'empty-project',
        title: 'Criando projeto vazio',
        description: 'Comece do zero',
        tags: ['vazio', 'do zero', 'limpo'],
        icon: '📄',
        order: 4,
        category: 'getting-started',
        relatedArticles: ['creating-project', 'interface'],
        experimentAction: 'newProject',
        content: `# Projeto vazio

Controle total. Escolha o dispositivo e comece do zero.`
      },
      {
        id: 'open-project',
        title: 'Abrindo projeto existente',
        description: 'Gerencie seus projetos',
        tags: ['abrir', 'projeto', 'existente', 'recente'],
        icon: '📂',
        order: 5,
        category: 'getting-started',
        relatedArticles: ['creating-project', 'import-project', 'export-project'],
        content: `# Abrir projeto

Projetos Recentes na tela inicial. Gerencie: renomear, duplicar, excluir, exportar.`
      },
      {
        id: 'import-project',
        title: 'Importando projeto',
        description: 'Importe de JSON',
        tags: ['importar', 'json', 'backup'],
        icon: '📥',
        order: 6,
        category: 'getting-started',
        relatedArticles: ['export-project', 'open-project'],
        content: `# Importar

Clique em "Importar Projeto" e selecione o arquivo .json.`
      },
      {
        id: 'export-project',
        title: 'Exportando projeto',
        description: 'Exporte em vários formatos',
        tags: ['exportar', 'json', 'backup', 'salvar'],
        icon: '📤',
        order: 7,
        category: 'getting-started',
        relatedArticles: ['import-project', 'export-guide'],
        content: `# Exportar

JSON (backup) ou código nativo (Flutter, RN, Kotlin, SwiftUI, PWA).`
      },
      {
        id: 'save-auto-save',
        title: 'Salvar e Auto Save',
        description: 'Salvamento automático',
        tags: ['salvar', 'autosave', 'auto-save', 'backup'],
        icon: '💾',
        order: 8,
        category: 'getting-started',
        relatedArticles: ['versioning', 'export-project'],
        content: `# Auto Save

Auto Save a cada 400ms. Ctrl+S para salvar manualmente.`
      },
      {
        id: 'versioning',
        title: 'Versionamento',
        description: 'Git integrado',
        tags: ['versão', 'git', 'versionamento', 'histórico'],
        icon: '🔄',
        order: 9,
        category: 'getting-started',
        relatedArticles: ['save-auto-save', 'troubleshooting-backup'],
        content: `# Versionamento

Commits, branches, histórico, reverter. Painel Git no rodapé.`
      }
    ]
  },
  {
    id: 'interface',
    title: 'Conhecendo a Interface',
    description: 'Explore cada parte',
    icon: '🖥️',
    order: 3,
    articles: [
      {
        id: 'topbar',
        title: 'TopBar',
        description: 'Barra superior',
        tags: ['topbar', 'barra', 'superior', 'controles'],
        icon: '📊',
        order: 1,
        category: 'interface',
        relatedArticles: ['toolbar', 'canvas'],
        content: `# TopBar

Telas, dispositivo, zoom, grade, modos (Visual, Código, No-Code, Dados, Segurança, Notificações, Publicação).`
      },
      {
        id: 'toolbar',
        title: 'Toolbar',
        description: 'Ferramentas de edição',
        tags: ['toolbar', 'ferramentas', 'edição'],
        icon: '🔧',
        order: 2,
        category: 'interface',
        relatedArticles: ['topbar', 'canvas'],
        content: `# Toolbar

Seleção (V), Mão (H), Texto (T), Retângulo (R), Linha (L), Comentário (C).`
      },
      {
        id: 'canvas',
        title: 'Canvas',
        description: 'Área de trabalho',
        tags: ['canvas', 'área', 'trabalho', 'design'],
        icon: '🎯',
        order: 3,
        category: 'interface',
        relatedArticles: ['left-panel', 'right-panel', 'layers'],
        experimentAction: 'highlightCanvas',
        content: `# Canvas

Área central WYSIWYG. Zoom 10%-800%, Smart Guides, Grid, Snap, Réguas.`
      },
      {
        id: 'left-panel',
        title: 'Painel Esquerdo',
        description: 'Catálogo de componentes',
        tags: ['painel', 'esquerdo', 'componentes', 'biblioteca'],
        icon: '📦',
        order: 4,
        category: 'interface',
        relatedArticles: ['right-panel', 'layers', 'components'],
        content: `# Painel Esquerdo

Componentes, Camadas, Assets, Master Components.`
      },
      {
        id: 'right-panel',
        title: 'Painel Direito',
        description: 'Propriedades',
        tags: ['painel', 'direito', 'propriedades', 'configurações'],
        icon: '⚙️',
        order: 5,
        category: 'interface',
        relatedArticles: ['left-panel', 'canvas'],
        content: `# Painel Direito

Posição, Layout, Aparência, Tipografia, Interação, Constraints.`
      },
      {
        id: 'layers',
        title: 'Camadas (Layers)',
        description: 'Hierarquia',
        tags: ['camadas', 'layers', 'hierarquia', 'ordem'],
        icon: '📑',
        order: 6,
        category: 'interface',
        relatedArticles: ['left-panel', 'components-group'],
        content: `# Camadas

Ordem Z, hierarquia, reordenar, visibilidade, bloqueio.`
      },
      {
        id: 'assets-panel',
        title: 'Assets',
        description: 'Imagens e arquivos',
        tags: ['assets', 'imagens', 'ícones', 'arquivos'],
        icon: '🖼️',
        order: 7,
        category: 'interface',
        relatedArticles: ['left-panel', 'components'],
        content: `# Assets

PNG, JPG, SVG, WebP, Ícones, Fontes. Upload, pastas, arraste para o canvas.`
      },
      {
        id: 'master-components-panel',
        title: 'Master Components',
        description: 'Reutilizáveis',
        tags: ['master', 'componentes', 'reutilizáveis', 'biblioteca'],
        icon: '♻️',
        order: 8,
        category: 'interface',
        relatedArticles: ['components-master', 'left-panel'],
        content: `# Master Components

Crie uma vez, reutilize. Sincronização: todos, novos ou nenhum.`
      },
      {
        id: 'js-editor-panel',
        title: 'Editor JavaScript',
        description: 'Ambiente de código',
        tags: ['javascript', 'editor', 'código', 'ide'],
        icon: '📝',
        order: 9,
        category: 'interface',
        relatedArticles: ['js-api', 'nocode-panel'],
        experimentAction: 'openCodeEditor',
        content: `# Editor JavaScript

Syntax highlighting, console, file explorer, API completa.`
      },
      {
        id: 'nocode-panel',
        title: 'Editor No-Code',
        description: 'Lógica visual',
        tags: ['nocode', 'lógica', 'fluxos', 'visual'],
        icon: '⚡',
        order: 10,
        category: 'interface',
        relatedArticles: ['nocode-guide', 'js-editor-panel'],
        experimentAction: 'openNoCode',
        content: `# No-Code

Eventos, Ações, Lógica, Dados, Autenticação, Notificações.`
      },
      {
        id: 'database-panel',
        title: 'Banco de Dados',
        description: 'Designer visual',
        tags: ['banco', 'dados', 'database', 'tabelas'],
        icon: '🗄️',
        order: 11,
        category: 'interface',
        relatedArticles: ['database-guide', 'api-panel'],
        experimentAction: 'openDatabase',
        content: `# Banco de Dados

Tabelas, relacionamentos (1:1, 1:N, N:N), consultas, data binding.`
      },
      {
        id: 'api-panel',
        title: 'API',
        description: 'Conector de APIs',
        tags: ['api', 'rest', 'graphql', 'integração'],
        icon: '🔌',
        order: 12,
        category: 'interface',
        relatedArticles: ['api-guide', 'database-panel'],
        content: `# API

REST e GraphQL. API Key, Bearer, Basic, OAuth 2.0.`
      },
      {
        id: 'export-panel',
        title: 'Exportação',
        description: 'Código nativo',
        tags: ['exportar', 'código', 'nativo', 'flutter', 'react'],
        icon: '📦',
        order: 13,
        category: 'interface',
        relatedArticles: ['export-guide', 'publish-guide'],
        experimentAction: 'openExport',
        content: `# Exportação

Flutter, React Native, Kotlin, SwiftUI, HTML/PWA.`
      },
      {
        id: 'marketplace-panel',
        title: 'Marketplace',
        description: 'Loja de recursos',
        tags: ['marketplace', 'loja', 'templates', 'plugins'],
        icon: '🏪',
        order: 14,
        category: 'interface',
        relatedArticles: ['marketplace-guide'],
        content: `# Marketplace

Templates, Plugins, Componentes, Temas.`
      }
    ]
  },
  {
    id: 'first-app',
    title: 'Criando seu Primeiro Aplicativo',
    description: 'Tutorial completo',
    icon: '🚀',
    order: 4,
    articles: [
      {
        id: 'first-app-tutorial',
        title: 'Tutorial: Criando um App do Zero',
        description: 'Aprenda criando um aplicativo completo',
        tags: ['tutorial', 'primeiro', 'app', 'passo a passo'],
        icon: '🎯',
        order: 1,
        category: 'first-app',
        relatedArticles: ['creating-project', 'components', 'export-guide'],
        experimentAction: 'startTutorial',
        content: `# Tutorial: Criando seu Primeiro Aplicativo

## Passo 1: Criar o Projeto
Novo Projeto Limpo > iPhone 15 Pro

## Passo 2: Adicionar Título
Texto: "Bem-vindo", 32px, Bold, X:20 Y:60

## Passo 3: Adicionar Imagem
350x200, X:20 Y:120

## Passo 4: Adicionar Botão
"Saiba Mais", azul, raio 12px, X:20 Y:340

## Passo 5: Segunda Tela
"Detalhes" com título, descrição e botão Voltar

## Passo 6: Navegação
Botão > Navegar > Detalhes. Voltar > Voltar.

## Passo 7: Testar
"Testar Protótipo"

## Passo 8: Exportar
Exportar Código > Flutter`
      }
    ]
  },
  {
    id: 'components',
    title: 'Trabalhando com Componentes',
    description: 'Domine os componentes',
    icon: '🧩',
    order: 5,
    articles: [
      {
        id: 'components-basics',
        title: 'Operações Básicas',
        description: 'Selecionar, mover, duplicar',
        tags: ['selecionar', 'mover', 'duplicar', 'excluir'],
        icon: '✏️',
        order: 1,
        category: 'components',
        relatedArticles: ['components-copy-paste', 'components-group'],
        experimentAction: 'addComponent',
        experimentData: { type: 'button' },
        content: `# Operações Básicas

Selecionar: Clique, Shift+Clique, Ctrl+A, Esc
Mover: Arraste, Setas (1px), Shift+Setas (10px)
Duplicar: Ctrl+D
Excluir: Delete/Backspace`
      },
      {
        id: 'components-copy-paste',
        title: 'Copiar e Colar',
        description: 'Copie entre telas',
        tags: ['copiar', 'colar', 'clipboard', 'transferir'],
        icon: '📋',
        order: 2,
        category: 'components',
        relatedArticles: ['components-basics', 'components-group'],
        content: `# Copiar e Colar

Ctrl+C, Ctrl+X, Ctrl+V. Copie entre telas e projetos.`
      },
      {
        id: 'components-group',
        title: 'Agrupar e Desagrupar',
        description: 'Organize em grupos',
        tags: ['agrupar', 'desagrupar', 'grupo', 'organizar'],
        icon: '📁',
        order: 3,
        category: 'components',
        relatedArticles: ['components-basics', 'containers'],
        content: `# Agrupar

Ctrl+G (agrupar), Ctrl+Shift+G (desagrupar).`
      },
      {
        id: 'containers',
        title: 'Containers',
        description: 'Estruture layouts',
        tags: ['container', 'layout', 'estrutura', 'organizar'],
        icon: '📦',
        order: 4,
        category: 'components',
        relatedArticles: ['components-group', 'auto-layout'],
        experimentAction: 'addComponent',
        experimentData: { type: 'container' },
        content: `# Containers

Container, Row, Column, Grid, Scroll. Pai e filho, aninhamento.`
      },
      {
        id: 'components-master',
        title: 'Master Components',
        description: 'Reutilizáveis',
        tags: ['master', 'reutilizável', 'componente', 'biblioteca'],
        icon: '♻️',
        order: 5,
        category: 'components',
        relatedArticles: ['containers', 'components-basics'],
        content: `# Master Components

Clique direito > "Salvar como Master". Arraste da biblioteca. Sincronize.`
      },
      {
        id: 'auto-layout',
        title: 'Auto Layout',
        description: 'Layout automático',
        tags: ['autolayout', 'layout', 'automático', 'flexbox'],
        icon: '📐',
        order: 6,
        category: 'components',
        relatedArticles: ['containers', 'constraints'],
        experimentAction: 'demoAutoLayout',
        content: `# Auto Layout

Direção: Horizontal, Vertical, Grid, Wrap. Distribuição: Start, Center, End, Space Between. Alinhamento: Start, Center, End, Stretch. Gap.`
      },
      {
        id: 'constraints',
        title: 'Constraints',
        description: 'Responsivo',
        tags: ['constraints', 'responsivo', 'adaptável'],
        icon: '📏',
        order: 7,
        category: 'components',
        relatedArticles: ['auto-layout', 'containers'],
        content: `# Constraints

Horizontal: Left, Right, Center, Stretch, Scale. Vertical: Top, Bottom, Center, Stretch, Scale.`
      },
      {
        id: 'layers-zorder',
        title: 'Camadas e Ordem Z',
        description: 'Profundidade',
        tags: ['camadas', 'zorder', 'profundidade', 'sobreposição'],
        icon: '📑',
        order: 8,
        category: 'components',
        relatedArticles: ['layers', 'components-basics'],
        content: `# Ordem Z

Ctrl+], Ctrl+[, Ctrl+Shift+], Ctrl+Shift+[.`
      },
      {
        id: 'snap-guides',
        title: 'Snap e Guias',
        description: 'Alinhamento preciso',
        tags: ['snap', 'guias', 'alinhamento', 'precisão'],
        icon: '🎯',
        order: 9,
        category: 'components',
        relatedArticles: ['auto-layout', 'constraints'],
        content: `# Snap e Guias

Snap to Grid (8px), Smart Guides, Guias Manuais (arraste da régua).`
      }
    ]
  },
  {
    id: 'js-api',
    title: 'Editor JavaScript',
    description: 'API completa',
    icon: '📝',
    order: 6,
    articles: [
      {
        id: 'js-getcomponent',
        title: 'app.getComponent()',
        description: 'Acesse componentes',
        tags: ['getcomponent', 'componente', 'acessar', 'manipular'],
        icon: '🎯',
        order: 1,
        category: 'js-api',
        relatedArticles: ['js-navigate', 'js-toast'],
        experimentAction: 'openCodeEditor',
        content: `# app.getComponent()

Acessa qualquer componente pelo ID. Métodos: setText, show, hide, enable, disable, setColor, setBackground, setSize, setPosition, animate.`
      },
      {
        id: 'js-navigate',
        title: 'app.navigate()',
        description: 'Navegue entre telas',
        tags: ['navigate', 'navegação', 'telas', 'rotas'],
        icon: '🧭',
        order: 2,
        category: 'js-api',
        relatedArticles: ['js-getcomponent', 'js-toast'],
        content: `# app.navigate()

transition (slideLeft, slideRight, fade, push, modal), duration, params. goBack, replace, goHome.`
      },
      {
        id: 'js-toast',
        title: 'app.toast()',
        description: 'Notificações',
        tags: ['toast', 'notificação', 'mensagem', 'alerta'],
        icon: '🔔',
        order: 3,
        category: 'js-api',
        relatedArticles: ['js-getcomponent', 'js-navigate'],
        content: `# app.toast()

type (success, error, warning, info), duration, position (top, bottom), action.`
      },
      {
        id: 'js-storage',
        title: 'app.storage()',
        description: 'Armazenamento local',
        tags: ['storage', 'armazenamento', 'local', 'dados'],
        icon: '💾',
        order: 4,
        category: 'js-api',
        relatedArticles: ['js-database', 'js-api-call'],
        content: `# app.storage()

set, get, remove, clear, has, keys. Preferências, cache, offline.`
      },
      {
        id: 'js-database',
        title: 'app.database()',
        description: 'Banco de dados',
        tags: ['database', 'banco', 'dados', 'consulta'],
        icon: '🗄️',
        order: 5,
        category: 'js-api',
        relatedArticles: ['js-storage', 'js-api-call'],
        content: `# app.database()

insert, find, findOne, update, delete, query, count. where, orderBy, limit, offset.`
      },
      {
        id: 'js-api-call',
        title: 'app.api()',
        description: 'APIs externas',
        tags: ['api', 'rest', 'graphql', 'requisição'],
        icon: '🔌',
        order: 6,
        category: 'js-api',
        relatedArticles: ['js-database', 'js-auth'],
        content: `# app.api()

REST: get, post, put, delete, patch. GraphQL: graphql(). baseURL, headers, timeout.`
      },
      {
        id: 'js-auth',
        title: 'app.auth()',
        description: 'Autenticação',
        tags: ['auth', 'autenticação', 'login', 'usuário'],
        icon: '🔐',
        order: 7,
        category: 'js-api',
        relatedArticles: ['js-api-call', 'js-storage'],
        content: `# app.auth()

login, register, logout, resetPassword, loginWithGoogle, loginWithApple, loginWithGitHub. isAuthenticated, getCurrentUser, getToken, onAuthStateChanged.`
      },
      {
        id: 'js-notifications',
        title: 'app.notifications()',
        description: 'Push e locais',
        tags: ['notificações', 'push', 'notificação', 'alerta'],
        icon: '🔔',
        order: 8,
        category: 'js-api',
        relatedArticles: ['js-auth', 'js-realtime'],
        content: `# app.notifications()

requestPermission, local, schedule, cancelAll, registerForPush, onNotificationReceived, onNotificationOpened.`
      },
      {
        id: 'js-realtime',
        title: 'app.realtime()',
        description: 'Tempo real',
        tags: ['realtime', 'tempo real', 'socket', 'websocket'],
        icon: '⚡',
        order: 9,
        category: 'js-api',
        relatedArticles: ['js-notifications', 'js-database'],
        content: `# app.realtime()

WebSockets. connect, subscribe, emit, disconnect. onConnectionState. Chat, notificações.`
      }
    ]
  },
  {
    id: 'nocode-guide',
    title: 'No-Code',
    description: 'Guia do construtor visual',
    icon: '⚡',
    order: 7,
    articles: [
      {
        id: 'nocode-events',
        title: 'Eventos',
        description: 'Dispare ações',
        tags: ['eventos', 'ações', 'disparar', 'gatilho'],
        icon: '🔴',
        order: 1,
        category: 'nocode-guide',
        relatedArticles: ['nocode-flows', 'nocode-variables'],
        experimentAction: 'openNoCode',
        content: `# Eventos

onClick, onDoubleClick, onLongPress, onHover, onChange, onFocus, onBlur, onSubmit, onLoad, onAppear, onDisappear, onDataChange, onSync, onError.`
      },
      {
        id: 'nocode-flows',
        title: 'Fluxos',
        description: 'Sequência de ações',
        tags: ['fluxos', 'lógica', 'sequência', 'ações'],
        icon: '🔀',
        order: 2,
        category: 'nocode-guide',
        relatedArticles: ['nocode-events', 'nocode-conditions'],
        content: `# Fluxos

Navegar, Toast, Modal, Banco, API, Storage, Condição, Loop, Aguardar, Executar Código.`
      },
      {
        id: 'nocode-variables',
        title: 'Variáveis',
        description: 'Crie e manipule',
        tags: ['variáveis', 'dados', 'memória', 'estado'],
        icon: '📊',
        order: 3,
        category: 'nocode-guide',
        relatedArticles: ['nocode-flows', 'nocode-conditions'],
        content: `# Variáveis

Local (fluxo), Global (app), Tela. Atribuir, matemática, texto, comparação.`
      },
      {
        id: 'nocode-conditions',
        title: 'Condições',
        description: 'Se/então/senão',
        tags: ['condições', 'if', 'else', 'lógica'],
        icon: '🔀',
        order: 4,
        category: 'nocode-guide',
        relatedArticles: ['nocode-flows', 'nocode-loops'],
        content: `# Condições

==, !=, >, <, >=, <=. AND, OR, NOT.`
      },
      {
        id: 'nocode-loops',
        title: 'Loops',
        description: 'Repita ações',
        tags: ['loops', 'repetição', 'iteração', 'lista'],
        icon: '🔄',
        order: 5,
        category: 'nocode-guide',
        relatedArticles: ['nocode-conditions', 'nocode-variables'],
        content: `# Loops

forEach, for, while.`
      },
      {
        id: 'nocode-database',
        title: 'Banco no No-Code',
        description: 'Operações de banco',
        tags: ['banco', 'dados', 'database', 'nocode'],
        icon: '🗄️',
        order: 6,
        category: 'nocode-guide',
        relatedArticles: ['nocode-flows', 'database-guide'],
        content: `# Banco no No-Code

Inserir, Buscar, Atualizar, Deletar.`
      },
      {
        id: 'nocode-api',
        title: 'API no No-Code',
        description: 'Consuma APIs',
        tags: ['api', 'rest', 'graphql', 'nocode'],
        icon: '🔌',
        order: 7,
        category: 'nocode-guide',
        relatedArticles: ['nocode-flows', 'api-guide'],
        content: `# API no No-Code

Chamar API REST, GraphQL. Mapeamento de resposta. Tratamento de erros.`
      },
      {
        id: 'nocode-auth',
        title: 'Autenticação no No-Code',
        description: 'Auth sem código',
        tags: ['auth', 'login', 'autenticação', 'nocode'],
        icon: '🔐',
        order: 8,
        category: 'nocode-guide',
        relatedArticles: ['nocode-flows', 'auth-guide'],
        content: `# Auth no No-Code

Login, Cadastro, Login Social, Recuperar Senha.`
      },
      {
        id: 'nocode-notifications',
        title: 'Notificações no No-Code',
        description: 'Notificações sem código',
        tags: ['notificações', 'push', 'alerta', 'nocode'],
        icon: '🔔',
        order: 9,
        category: 'nocode-guide',
        relatedArticles: ['nocode-flows', 'notifications-guide'],
        content: `# Notificações no No-Code

Notificação Local, Agendar, Push Notification.`
      }
    ]
  },
  {
    id: 'database-guide',
    title: 'Banco de Dados',
    description: 'Guia do Database Designer',
    icon: '🗄️',
    order: 8,
    articles: [
      {
        id: 'db-create-table',
        title: 'Criar Tabela',
        description: 'Crie tabelas',
        tags: ['tabela', 'criar', 'banco', 'estrutura'],
        icon: '📋',
        order: 1,
        category: 'database-guide',
        relatedArticles: ['db-fields', 'db-relationships'],
        experimentAction: 'openDatabase',
        content: `# Criar Tabela

No modo "Dados", clique em "Nova Tabela". Nome, campos, ID automático.`
      },
      {
        id: 'db-fields',
        title: 'Campos',
        description: 'Tipos e configurações',
        tags: ['campos', 'tipos', 'configuração', 'colunas'],
        icon: '📝',
        order: 2,
        category: 'database-guide',
        relatedArticles: ['db-create-table', 'db-relationships'],
        content: `# Campos

Texto, Texto Longo, Número, Decimal, Booleano, Data, Email, URL, JSON, Arquivo, Relacionamento.`
      },
      {
        id: 'db-relationships',
        title: 'Relacionamentos',
        description: 'Relacione tabelas',
        tags: ['relacionamentos', 'join', 'chave', 'estrangeira'],
        icon: '🔗',
        order: 3,
        category: 'database-guide',
        relatedArticles: ['db-fields', 'db-queries'],
        content: `# Relacionamentos

1:1, 1:N, N:N. Exemplo: usuarios 1:N pedidos, produtos N:M pedidos.`
      },
      {
        id: 'db-queries',
        title: 'Consultas',
        description: 'Consultas visuais',
        tags: ['consultas', 'query', 'busca', 'filtro'],
        icon: '🔍',
        order: 4,
        category: 'database-guide',
        relatedArticles: ['db-filters', 'db-pagination'],
        content: `# Consultas

Construtor visual. Data Binding para componentes.`
      },
      {
        id: 'db-filters',
        title: 'Filtros',
        description: 'Filtre dados',
        tags: ['filtros', 'where', 'condições', 'busca'],
        icon: '🔍',
        order: 5,
        category: 'database-guide',
        relatedArticles: ['db-queries', 'db-pagination'],
        content: `# Filtros

igual, diferente, maior, menor, contém, começa com, entre, vazio. AND/OR.`
      },
      {
        id: 'db-pagination',
        title: 'Paginação',
        description: 'Paginação',
        tags: ['paginação', 'ordenação', 'limite', 'offset'],
        icon: '📄',
        order: 6,
        category: 'database-guide',
        relatedArticles: ['db-queries', 'db-filters'],
        content: `# Paginação

Limit (1-100), offset, ordenação (ASC/DESC).`
      },
      {
        id: 'db-offline',
        title: 'Offline e Sincronização',
        description: 'Dados offline',
        tags: ['offline', 'sincronização', 'cache', 'local'],
        icon: '📡',
        order: 7,
        category: 'database-guide',
        relatedArticles: ['db-queries', 'db-filters'],
        content: `# Offline

Online/offline, cache, sincronização automática, conflitos.`
      }
    ]
  },
  {
    id: 'api-guide',
    title: 'APIs',
    description: 'Guia de APIs',
    icon: '🔌',
    order: 9,
    articles: [
      {
        id: 'api-rest',
        title: 'Consumindo REST',
        description: 'APIs REST',
        tags: ['rest', 'api', 'http', 'endpoint'],
        icon: '🌐',
        order: 1,
        category: 'api-guide',
        relatedArticles: ['api-graphql', 'api-headers'],
        experimentAction: 'openDatabase',
        content: `# REST

URL, método (GET, POST, PUT, DELETE, PATCH), headers, body, parâmetros.`
      },
      {
        id: 'api-graphql',
        title: 'Consumindo GraphQL',
        description: 'APIs GraphQL',
        tags: ['graphql', 'query', 'mutation', 'api'],
        icon: '📊',
        order: 2,
        category: 'api-guide',
        relatedArticles: ['api-rest', 'api-headers'],
        content: `# GraphQL

Endpoint, queries, mutations, variables.`
      },
      {
        id: 'api-headers',
        title: 'Headers e Autenticação',
        description: 'Configure headers',
        tags: ['headers', 'autenticação', 'token', 'bearer'],
        icon: '🔐',
        order: 3,
        category: 'api-guide',
        relatedArticles: ['api-rest', 'api-auth'],
        content: `# Headers

Content-Type, Authorization, Accept, X-API-Key. API Key, Bearer JWT, Basic Auth, OAuth 2.0.`
      },
      {
        id: 'api-body',
        title: 'Body e JSON',
        description: 'Estruture requisições',
        tags: ['body', 'json', 'dados', 'requisição'],
        icon: '📦',
        order: 4,
        category: 'api-guide',
        relatedArticles: ['api-rest', 'api-mapping'],
        content: `# Body

JSON, Form Data, URL Encoded. Variáveis do app. Transformações.`
      },
      {
        id: 'api-mapping',
        title: 'Mapeamento de Resposta',
        description: 'Mapeie respostas',
        tags: ['mapeamento', 'resposta', 'transformar', 'bind'],
        icon: '🔄',
        order: 5,
        category: 'api-guide',
        relatedArticles: ['api-rest', 'api-errors'],
        content: `# Mapeamento

Mapeie campos JSON para componentes. Listas, objetos aninhados, transformações.`
      },
      {
        id: 'api-errors',
        title: 'Tratamento de Erros',
        description: 'Lide com erros',
        tags: ['erros', 'tratamento', 'timeout', 'fallback'],
        icon: '⚠️',
        order: 6,
        category: 'api-guide',
        relatedArticles: ['api-rest', 'api-mapping'],
        content: `# Erros

Rede, HTTP 4xx, 5xx. Retry, fallback, timeout. Mensagens amigáveis.`
      }
    ]
  },
  {
    id: 'auth-guide',
    title: 'Autenticação',
    description: 'Guia de autenticação',
    icon: '🔐',
    order: 10,
    articles: [
      {
        id: 'auth-login',
        title: 'Login',
        description: 'Configure o login',
        tags: ['login', 'entrar', 'autenticação'],
        icon: '🔑',
        order: 1,
        category: 'auth-guide',
        relatedArticles: ['auth-register', 'auth-recovery'],
        content: `# Login

Email/senha, Google, Apple, GitHub. Modo "Segurança".`
      },
      {
        id: 'auth-register',
        title: 'Cadastro',
        description: 'Cadastro de usuários',
        tags: ['cadastro', 'registro', 'criar conta'],
        icon: '📝',
        order: 2,
        category: 'auth-guide',
        relatedArticles: ['auth-login', 'auth-recovery'],
        content: `# Cadastro

Nome, email, senha, confirmar senha. Validações.`
      },
      {
        id: 'auth-recovery',
        title: 'Recuperação de Senha',
        description: 'Recupere a senha',
        tags: ['recuperar', 'senha', 'esqueci', 'reset'],
        icon: '🔐',
        order: 3,
        category: 'auth-guide',
        relatedArticles: ['auth-login', 'auth-register'],
        content: `# Recuperação

Solicitar > email > redefinir > login.`
      },
      {
        id: 'auth-social',
        title: 'Login Social',
        description: 'Google, Apple, GitHub',
        tags: ['social', 'google', 'apple', 'github'],
        icon: '🌐',
        order: 4,
        category: 'auth-guide',
        relatedArticles: ['auth-login', 'auth-jwt'],
        content: `# Login Social

Google (Cloud Console), Apple (Apple Developer), GitHub (OAuth App).`
      },
      {
        id: 'auth-jwt',
        title: 'JWT e Permissões',
        description: 'Tokens e roles',
        tags: ['jwt', 'token', 'permissões', 'roles'],
        icon: '🔐',
        order: 5,
        category: 'auth-guide',
        relatedArticles: ['auth-login', 'auth-social'],
        content: `# JWT

Tokens, roles (admin, user, moderator, viewer). Tokens curtos, refresh token.`
      }
    ]
  },
  {
    id: 'export-guide',
    title: 'Exportação',
    description: 'Guia de exportação',
    icon: '📦',
    order: 11,
    articles: [
      {
        id: 'export-flutter',
        title: 'Exportar para Flutter',
        description: 'Código Flutter/Dart',
        tags: ['flutter', 'dart', 'exportar', 'mobile'],
        icon: '🦋',
        order: 1,
        category: 'export-guide',
        relatedArticles: ['export-react-native', 'export-kotlin'],
        experimentAction: 'openExport',
        content: `# Flutter

Código Dart com widgets, navegação, serviços, modelos.`
      },
      {
        id: 'export-react-native',
        title: 'Exportar para React Native',
        description: 'Código React Native',
        tags: ['react native', 'react', 'javascript', 'mobile'],
        icon: '⚛️',
        order: 2,
        category: 'export-guide',
        relatedArticles: ['export-flutter', 'export-swiftui'],
        content: `# React Native

TypeScript, React Navigation, Styled Components, Axios.`
      },
      {
        id: 'export-kotlin',
        title: 'Exportar para Kotlin',
        description: 'Kotlin/Jetpack Compose',
        tags: ['kotlin', 'jetpack', 'compose', 'android'],
        icon: '🤖',
        order: 3,
        category: 'export-guide',
        relatedArticles: ['export-flutter', 'export-swiftui'],
        content: `# Kotlin

Jetpack Compose, Material Design 3, Coroutines, Hilt.`
      },
      {
        id: 'export-swiftui',
        title: 'Exportar para SwiftUI',
        description: 'SwiftUI para iOS',
        tags: ['swift', 'swiftui', 'ios', 'apple'],
        icon: '🍎',
        order: 4,
        category: 'export-guide',
        relatedArticles: ['export-flutter', 'export-kotlin'],
        content: `# SwiftUI

SwiftUI, Combine, CoreData, projeto Xcode.`
      },
      {
        id: 'export-pwa',
        title: 'Exportar para HTML/PWA',
        description: 'Web progressiva',
        tags: ['pwa', 'html', 'web', 'tailwind'],
        icon: '🌐',
        order: 5,
        category: 'export-guide',
        relatedArticles: ['export-flutter', 'publish-pwa'],
        content: `# PWA

Responsivo, instalável, Service Worker offline, Tailwind CSS.`
      },
      {
        id: 'export-apk-aab',
        title: 'Android APK e AAB',
        description: 'APK e AAB',
        tags: ['apk', 'aab', 'android', 'build'],
        icon: '📱',
        order: 6,
        category: 'export-guide',
        relatedArticles: ['export-flutter', 'publish-playstore'],
        content: `# APK/AAB

APK (testes): flutter build apk --release. AAB (Google Play): flutter build appbundle --release.`
      },
      {
        id: 'export-ios',
        title: 'iOS (IPA)',
        description: 'IPA para App Store',
        tags: ['ios', 'ipa', 'apple', 'appstore'],
        icon: '🍎',
        order: 7,
        category: 'export-guide',
        relatedArticles: ['export-swiftui', 'publish-appstore'],
        content: `# iOS

macOS, Xcode, conta Apple Developer ($99/ano). Archive no Xcode.`
      }
    ]
  },
  {
    id: 'publish-guide',
    title: 'Publicação',
    description: 'Guia de publicação',
    icon: '🚀',
    order: 12,
    articles: [
      {
        id: 'publish-playstore',
        title: 'Google Play Store',
        description: 'Publique na Google Play',
        tags: ['google play', 'publicar', 'android', 'loja'],
        icon: '▶️',
        order: 1,
        category: 'publish-guide',
        relatedArticles: ['publish-appstore', 'publish-pwa'],
        content: `# Google Play

Conta $25, AAB assinado, ficha, upload, revisão 2-24h.`
      },
      {
        id: 'publish-appstore',
        title: 'App Store (iOS)',
        description: 'Publique na App Store',
        tags: ['app store', 'publicar', 'ios', 'apple'],
        icon: '🍎',
        order: 2,
        category: 'publish-guide',
        relatedArticles: ['publish-playstore', 'publish-pwa'],
        content: `# App Store

Conta $99/ano, IPA, App Store Connect, revisão 1-48h.`
      },
      {
        id: 'publish-pwa',
        title: 'Publicar como PWA',
        description: 'PWA sem lojas',
        tags: ['pwa', 'web', 'hospedagem', 'publicar'],
        icon: '🌐',
        order: 3,
        category: 'publish-guide',
        relatedArticles: ['export-pwa', 'publish-playstore'],
        content: `# PWA

Sem taxa, instalável, offline. Vercel, Netlify, GitHub Pages.`
      },
      {
        id: 'publish-updates',
        title: 'Atualizações e Versionamento',
        description: 'Gerencie atualizações',
        tags: ['atualizações', 'versão', 'update', 'manutenção'],
        icon: '🔄',
        order: 4,
        category: 'publish-guide',
        relatedArticles: ['publish-playstore', 'publish-appstore'],
        content: `# Atualizações

MAJOR.MINOR.PATCH. Teste, rollout gradual.`
      },
      {
        id: 'publish-build-production',
        title: 'Build de Produção',
        description: 'Prepare para produção',
        tags: ['produção', 'build', 'release', 'otimização'],
        icon: '⚙️',
        order: 5,
        category: 'publish-guide',
        relatedArticles: ['export-flutter', 'publish-playstore'],
        content: `# Build Produção

Minificação, tree shaking, compressão. Checklist: dispositivos reais, performance, offline.`
      }
    ]
  },
  {
    id: 'marketplace-guide',
    title: 'Marketplace',
    description: 'Guia do Marketplace',
    icon: '🏪',
    order: 13,
    articles: [
      {
        id: 'marketplace-templates',
        title: 'Templates',
        description: 'Templates prontos',
        tags: ['templates', 'modelos', 'prontos'],
        icon: '📋',
        order: 1,
        category: 'marketplace-guide',
        relatedArticles: ['marketplace-plugins', 'marketplace-components'],
        content: `# Templates

E-commerce, Social App, Dashboard, Delivery, Financeiro, CRM.`
      },
      {
        id: 'marketplace-plugins',
        title: 'Plugins',
        description: 'Extensões',
        tags: ['plugins', 'extensões', 'integrações'],
        icon: '🔌',
        order: 2,
        category: 'marketplace-guide',
        relatedArticles: ['marketplace-templates', 'marketplace-components'],
        content: `# Plugins

Pagamento (Stripe, Mercado Pago, PayPal), Analytics, Comunicação, Mapas.`
      },
      {
        id: 'marketplace-components',
        title: 'Componentes',
        description: 'Componentes prontos',
        tags: ['componentes', 'widgets', 'prontos'],
        icon: '🧩',
        order: 3,
        category: 'marketplace-guide',
        relatedArticles: ['marketplace-templates', 'marketplace-themes'],
        content: `# Componentes

Gráficos, Mídia, Formulários, Sociais.`
      },
      {
        id: 'marketplace-themes',
        title: 'Temas',
        description: 'Temas visuais',
        tags: ['temas', 'cores', 'estilo', 'design'],
        icon: '🎨',
        order: 4,
        category: 'marketplace-guide',
        relatedArticles: ['marketplace-components', 'marketplace-templates'],
        content: `# Temas

Minimal, Vibrant, Dark, Nature. Paleta, tipografia, ícones, modo escuro.`
      }
    ]
  },
  {
    id: 'faq',
    title: 'Perguntas Frequentes',
    description: 'Dúvidas comuns',
    icon: '❓',
    order: 14,
    articles: [
      {
        id: 'faq-general',
        title: 'Perguntas Frequentes',
        description: 'Dúvidas comuns',
        tags: ['faq', 'perguntas', 'dúvidas', 'comum'],
        icon: '❓',
        order: 1,
        category: 'faq',
        relatedArticles: ['troubleshooting-general'],
        content: `# FAQ

**Como criar um projeto?** Novo Projeto Limpo ou template.
**Como excluir um componente?** Delete ou Backspace.
**Como mover?** Arraste ou setas.
**Como criar telas?** Nova Tela no seletor.
**Como exportar?** Exportar Código na TopBar.
**Como conectar API?** Modo Dados > APIs > Nova Conexão.
**Como conectar banco?** Modo Dados > Nova Tabela.
**Como publicar?** Exporte, build, publique.
**Como usar Auto Layout?** Ative no painel direito.
**Como criar Master?** Clique direito > Salvar como Master.
**Como testar?** Testar Protótipo.
**Como recuperar versão?** Painel Git > Reverter.`
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Solução de Problemas',
    description: 'Resolva problemas',
    icon: '🔧',
    order: 15,
    articles: [
      {
        id: 'troubleshooting-general',
        title: 'Problemas Gerais',
        description: 'Soluções',
        tags: ['problemas', 'solução', 'erro', 'bug'],
        icon: '🔧',
        order: 1,
        category: 'troubleshooting',
        relatedArticles: ['faq-general', 'troubleshooting-backup'],
        content: `# Solução de Problemas

**Projeto não abre**: Limpe cache, importe backup.
**Canvas travou**: Redefina zoom, recarregue (F5).
**Erro JavaScript**: Verifique console, valide sintaxe.
**Erro Exportação**: Verifique propriedades, confirme assets.
**Erro Banco**: Verifique tabela, valide campos.
**Erro API**: Verifique URL, atualize token.
**Erro Login**: Verifique credenciais, recupere senha.`
      },
      {
        id: 'troubleshooting-backup',
        title: 'Como restaurar Backup',
        description: 'Recupere seu projeto',
        tags: ['backup', 'restaurar', 'recuperar', 'salvar'],
        icon: '💾',
        order: 2,
        category: 'troubleshooting',
        relatedArticles: ['troubleshooting-general', 'versioning'],
        content: `# Restaurar Backup

JSON: Importar Projeto > .json. Git: Painel Git > Reverter.`
      }
    ]
  },
  {
    id: 'complete-guide',
    title: 'Guia Completo',
    description: 'Tutorial do início ao fim',
    icon: '📖',
    order: 16,
    articles: [
      {
        id: 'complete-app-tutorial',
        title: 'Guia Completo: App E-commerce',
        description: 'Crie um e-commerce completo',
        tags: ['completo', 'ecommerce', 'tutorial', 'passo a passo'],
        icon: '🛒',
        order: 1,
        category: 'complete-guide',
        relatedArticles: ['first-app-tutorial', 'export-flutter', 'publish-playstore'],
        experimentAction: 'loadTemplate',
        experimentData: { templateId: 'ecommerce' },
        content: `# Guia Completo: App E-commerce

Login/Cadastro, Home, Produtos, Carrinho, Checkout, Perfil, Pedidos. Banco, API, Auth, Notificações. Flutter > Publicação.`
      }
    ]
  }
];

export const COURSES: Course[] = [
  {
    id: 'course-basics',
    title: 'Fundamentos do Mobile Studio',
    description: 'Aprenda os conceitos básicos da plataforma',
    level: 'basic',
    icon: '📚',
    order: 1,
    estimatedTime: '30 min',
    lessons: [
      { id: 'lesson-1', title: 'O que é o Mobile Studio', description: 'Visão geral', articleId: 'what-is-mobile-studio', duration: '5 min' },
      { id: 'lesson-2', title: 'Criando seu primeiro projeto', description: 'Na prática', articleId: 'creating-project', duration: '5 min' },
      { id: 'lesson-3', title: 'Conhecendo a interface', description: 'TopBar, Canvas, Painéis', articleId: 'topbar', duration: '10 min' },
      { id: 'lesson-4', title: 'Adicionando componentes', description: 'Arraste e solte', articleId: 'components-basics', duration: '5 min' },
      { id: 'lesson-5', title: 'Criando seu primeiro app', description: 'Tutorial completo', articleId: 'first-app-tutorial', duration: '5 min' },
    ]
  },
  {
    id: 'course-components',
    title: 'Componentes e Layout',
    description: 'Domine componentes, containers e layouts',
    level: 'basic',
    icon: '🧩',
    order: 2,
    estimatedTime: '40 min',
    lessons: [
      { id: 'lesson-c1', title: 'Operações básicas', description: 'Selecionar, mover, duplicar', articleId: 'components-basics', duration: '5 min' },
      { id: 'lesson-c2', title: 'Containers', description: 'Estruturando layouts', articleId: 'containers', duration: '10 min' },
      { id: 'lesson-c3', title: 'Auto Layout', description: 'Layout automático', articleId: 'auto-layout', duration: '10 min' },
      { id: 'lesson-c4', title: 'Constraints', description: 'Design responsivo', articleId: 'constraints', duration: '5 min' },
      { id: 'lesson-c5', title: 'Master Components', description: 'Reutilização', articleId: 'components-master', duration: '10 min' },
    ]
  },
  {
    id: 'course-intermediate',
    title: 'Lógica e Dados',
    description: 'JavaScript, No-Code, Banco e APIs',
    level: 'intermediate',
    icon: '⚡',
    order: 3,
    estimatedTime: '60 min',
    lessons: [
      { id: 'lesson-i1', title: 'JavaScript Engine', description: 'API completa', articleId: 'javascript-engine', duration: '10 min' },
      { id: 'lesson-i2', title: 'No-Code', description: 'Lógica visual', articleId: 'nocode', duration: '10 min' },
      { id: 'lesson-i3', title: 'Banco de Dados', description: 'Tabelas e consultas', articleId: 'db-create-table', duration: '15 min' },
      { id: 'lesson-i4', title: 'APIs', description: 'REST e GraphQL', articleId: 'api-rest', duration: '15 min' },
      { id: 'lesson-i5', title: 'Autenticação', description: 'Login e segurança', articleId: 'auth-login', duration: '10 min' },
    ]
  },
  {
    id: 'course-advanced',
    title: 'Exportação e Publicação',
    description: 'Exporte e publique seu app',
    level: 'advanced',
    icon: '🚀',
    order: 4,
    estimatedTime: '45 min',
    lessons: [
      { id: 'lesson-a1', title: 'Exportar para Flutter', description: 'Código nativo', articleId: 'export-flutter', duration: '10 min' },
      { id: 'lesson-a2', title: 'Exportar para React Native', description: 'Código JS', articleId: 'export-react-native', duration: '10 min' },
      { id: 'lesson-a3', title: 'APK e AAB', description: 'Build Android', articleId: 'export-apk-aab', duration: '10 min' },
      { id: 'lesson-a4', title: 'Publicar na Google Play', description: 'Passo a passo', articleId: 'publish-playstore', duration: '10 min' },
      { id: 'lesson-a5', title: 'Publicar na App Store', description: 'Passo a passo', articleId: 'publish-appstore', duration: '5 min' },
    ]
  }
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'challenge-login',
    title: 'Criar Tela de Login',
    description: 'Crie uma tela de login com email, senha e botão de entrar',
    difficulty: 'easy',
    icon: '🔑',
    steps: [
      { id: 'step-1', description: 'Adicione um campo de email', hint: 'Use o componente Input' },
      { id: 'step-2', description: 'Adicione um campo de senha', hint: 'Use o componente Password' },
      { id: 'step-3', description: 'Adicione um botão "Entrar"', hint: 'Use o componente Button' },
      { id: 'step-4', description: 'Configure a navegação ao clicar', hint: 'No painel direito, em Interação' },
    ],
    rewardTitle: '🎓 Iniciante em Autenticação'
  },
  {
    id: 'challenge-products',
    title: 'Criar Lista de Produtos',
    description: 'Crie uma tela com lista de produtos usando banco de dados',
    difficulty: 'medium',
    icon: '📋',
    steps: [
      { id: 'step-p1', description: 'Crie uma tabela "produtos" no banco', hint: 'Modo Dados > Nova Tabela' },
      { id: 'step-p2', description: 'Adicione campos: nome, preço, imagem', hint: 'Campos: Texto, Decimal, URL' },
      { id: 'step-p3', description: 'Crie uma consulta para listar produtos', hint: 'Nova Consulta > produtos' },
      { id: 'step-p4', description: 'Adicione uma lista na tela com data binding', hint: 'Conecte a consulta ao componente' },
    ],
    rewardTitle: '🏆 Mestre em Dados'
  },
  {
    id: 'challenge-cart',
    title: 'Criar Carrinho de Compras',
    description: 'Implemente um carrinho com adicionar/remover itens',
    difficulty: 'hard',
    icon: '🛒',
    steps: [
      { id: 'step-c1', description: 'Crie variáveis globais para o carrinho', hint: 'No-Code > Variáveis > Global' },
      { id: 'step-c2', description: 'Crie fluxo "Adicionar ao carrinho"', hint: 'Evento onClick > Ação' },
      { id: 'step-c3', description: 'Crie fluxo "Remover do carrinho"', hint: 'Use condições e loops' },
      { id: 'step-c4', description: 'Mostre o total do carrinho na tela', hint: 'Atualize um componente de texto' },
    ],
    rewardTitle: '🏅 Arquiteto de Lógica'
  },
  {
    id: 'challenge-api',
    title: 'Consumir uma API',
    description: 'Conecte seu app a uma API externa',
    difficulty: 'medium',
    icon: '🔌',
    steps: [
      { id: 'step-a1', description: 'Configure uma conexão de API', hint: 'Modo Dados > APIs > Nova Conexão' },
      { id: 'step-a2', description: 'Faça uma requisição GET', hint: 'Use uma API pública de exemplo' },
      { id: 'step-a3', description: 'Mapeie a resposta para componentes', hint: 'Mapeamento de resposta' },
      { id: 'step-a4', description: 'Trate possíveis erros', hint: 'Adicione condição de erro' },
    ],
    rewardTitle: '🌐 Integrador de APIs'
  },
  {
    id: 'challenge-auth',
    title: 'Implementar Autenticação',
    description: 'Configure login com email e login social',
    difficulty: 'medium',
    icon: '🔐',
    steps: [
      { id: 'step-au1', description: 'Configure login com email e senha', hint: 'Modo Segurança > Login' },
      { id: 'step-au2', description: 'Crie fluxo de login no No-Code', hint: 'Evento > Ação > Condição' },
      { id: 'step-au3', description: 'Adicione botão "Entrar com Google"', hint: 'Login Social > Google' },
      { id: 'step-au4', description: 'Proteja a tela Home para usuários logados', hint: 'Condição: usuarioLogado == true' },
    ],
    rewardTitle: '🛡️ Especialista em Segurança'
  },
  {
    id: 'challenge-export',
    title: 'Exportar Aplicativo',
    description: 'Exporte seu app para Flutter e gere o APK',
    difficulty: 'hard',
    icon: '📦',
    steps: [
      { id: 'step-e1', description: 'Exporte o projeto para Flutter', hint: 'Exportar Código > Flutter' },
      { id: 'step-e2', description: 'Abra o projeto no terminal', hint: 'Navegue até a pasta exportada' },
      { id: 'step-e3', description: 'Execute flutter build apk', hint: 'flutter build apk --release' },
      { id: 'step-e4', description: 'Localize o APK gerado', hint: 'build/app/outputs/flutter-apk/' },
    ],
    rewardTitle: '🚀 Publicador Profissional'
  }
];

export const INSPIRATION_PROJECTS: InspirationProject[] = [
  { id: 'insp-login', title: 'Tela de Login Moderna', description: 'Design limpo com login social', category: 'Apps', icon: '🔑', image: 'login', difficulty: 'Fácil', features: ['Email', 'Google', 'Apple', 'Animações'] },
  { id: 'insp-register', title: 'Cadastro de Usuários', description: 'Formulário completo de cadastro', category: 'Apps', icon: '📝', image: 'register', difficulty: 'Fácil', features: ['Validação', 'Máscaras', 'Termos'] },
  { id: 'insp-chat', title: 'Chat em Tempo Real', description: 'App de mensagens com WebSocket', category: 'Apps', icon: '💬', image: 'chat', difficulty: 'Avançado', features: ['Realtime', 'Mensagens', 'Status'] },
  { id: 'insp-ecommerce', title: 'Loja Virtual', description: 'E-commerce completo com carrinho', category: 'E-commerce', icon: '🛒', image: 'ecommerce', difficulty: 'Avançado', features: ['Catálogo', 'Carrinho', 'Checkout', 'Pagamento'] },
  { id: 'insp-delivery', title: 'App de Delivery', description: 'Rastreamento de entregas em tempo real', category: 'Apps', icon: '🚚', image: 'delivery', difficulty: 'Avançado', features: ['Mapa', 'Rastreamento', 'Notificações'] },
  { id: 'insp-agenda', title: 'Agenda de Contatos', description: 'CRUD completo de contatos', category: 'Apps', icon: '📅', image: 'agenda', difficulty: 'Intermediário', features: ['CRUD', 'Busca', 'Favoritos'] },
  { id: 'insp-financeiro', title: 'Controle Financeiro', description: 'Dashboard de finanças pessoais', category: 'Finanças', icon: '💰', image: 'financeiro', difficulty: 'Intermediário', features: ['Gráficos', 'Categorias', 'Extrato'] },
  { id: 'insp-dashboard', title: 'Dashboard Admin', description: 'Painel administrativo com métricas', category: 'Dashboards', icon: '📊', image: 'dashboard', difficulty: 'Intermediário', features: ['Gráficos', 'Tabelas', 'Filtros'] },
  { id: 'insp-crm', title: 'Sistema CRM', description: 'Gestão de clientes e vendas', category: 'Sistemas', icon: '👥', image: 'crm', difficulty: 'Avançado', features: ['Pipeline', 'Clientes', 'Vendas', 'Relatórios'] },
  { id: 'insp-social', title: 'Rede Social', description: 'Feed de posts com interações', category: 'Apps', icon: '🌐', image: 'social', difficulty: 'Avançado', features: ['Feed', 'Curtidas', 'Comentários', 'Perfil'] },
  { id: 'insp-saude', title: 'App de Saúde', description: 'Agendamento de consultas', category: 'Saúde', icon: '🏥', image: 'saude', difficulty: 'Intermediário', features: ['Agenda', 'Notificações', 'Perfil'] },
  { id: 'insp-educacao', title: 'Plataforma Educacional', description: 'Cursos e aulas online', category: 'Educação', icon: '🎓', image: 'educacao', difficulty: 'Avançado', features: ['Cursos', 'Aulas', 'Progresso', 'Certificado'] },
];

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { id: 'ks-undo', key: 'Z', description: 'Desfazer última ação', category: 'Edição', keys: ['ctrl', 'z'] },
  { id: 'ks-redo', key: 'Y', description: 'Refazer ação desfeita', category: 'Edição', keys: ['ctrl', 'y'] },
  { id: 'ks-copy', key: 'C', description: 'Copiar componentes selecionados', category: 'Edição', keys: ['ctrl', 'c'] },
  { id: 'ks-cut', key: 'X', description: 'Recortar componentes', category: 'Edição', keys: ['ctrl', 'x'] },
  { id: 'ks-paste', key: 'V', description: 'Colar componentes', category: 'Edição', keys: ['ctrl', 'v'] },
  { id: 'ks-duplicate', key: 'D', description: 'Duplicar componentes', category: 'Edição', keys: ['ctrl', 'd'] },
  { id: 'ks-select-all', key: 'A', description: 'Selecionar todos os componentes', category: 'Edição', keys: ['ctrl', 'a'] },
  { id: 'ks-group', key: 'G', description: 'Agrupar componentes', category: 'Edição', keys: ['ctrl', 'g'] },
  { id: 'ks-ungroup', key: 'G', description: 'Desagrupar componentes', category: 'Edição', keys: ['ctrl', 'shift', 'g'] },
  { id: 'ks-delete', key: 'Del', description: 'Excluir componentes selecionados', category: 'Edição', keys: ['delete'] },
  { id: 'ks-backspace', key: 'Bksp', description: 'Excluir componentes', category: 'Edição', keys: ['backspace'] },
  { id: 'ks-escape', key: 'Esc', description: 'Desselecionar / Sair do modo isolamento', category: 'Navegação', keys: ['escape'] },
  { id: 'ks-f2', key: 'F2', description: 'Renomear componente selecionado', category: 'Edição', keys: ['f2'] },
  { id: 'ks-command', key: '⌘K', description: 'Abrir paleta de comandos', category: 'Navegação', keys: ['ctrl', 'k'] },
  { id: 'ks-save', key: 'S', description: 'Salvar projeto', category: 'Arquivo', keys: ['ctrl', 's'] },
  { id: 'ks-arrow-up', key: '↑', description: 'Mover 1px para cima', category: 'Movimento', keys: ['arrowup'] },
  { id: 'ks-arrow-down', key: '↓', description: 'Mover 1px para baixo', category: 'Movimento', keys: ['arrowdown'] },
  { id: 'ks-arrow-left', key: '←', description: 'Mover 1px para esquerda', category: 'Movimento', keys: ['arrowleft'] },
  { id: 'ks-arrow-right', key: '→', description: 'Mover 1px para direita', category: 'Movimento', keys: ['arrowright'] },
  { id: 'ks-shift-arrow', key: 'Shift+↑↓←→', description: 'Mover 10px', category: 'Movimento', keys: ['shift', 'arrowup'] },
  { id: 'ks-bring-front', key: ']', description: 'Trazer para frente (1 nível)', category: 'Camadas', keys: [']'] },
  { id: 'ks-send-back', key: '[', description: 'Enviar para trás (1 nível)', category: 'Camadas', keys: ['['] },
  { id: 'ks-bring-top', key: 'Shift+]', description: 'Trazer para o topo', category: 'Camadas', keys: ['shift', ']'] },
  { id: 'ks-send-bottom', key: 'Shift+[', description: 'Enviar para o fundo', category: 'Camadas', keys: ['shift', '['] },
  { id: 'ks-f1', key: 'F1', description: 'Abrir documentação contextual', category: 'Ajuda', keys: ['f1'] },
];

export const VERSION_UPDATES: VersionUpdate[] = [
  { id: 'v1-0-0', version: '1.0.0', date: '2026-07-23', type: 'new', title: 'Lançamento Oficial', description: 'Primeira versão estável do Mobile Studio com editor visual, No-Code, JavaScript Engine, banco de dados, APIs, autenticação e exportação multi-plataforma.' },
  { id: 'v1-1-0', version: '1.1.0', date: '2026-08-01', type: 'new', title: 'Documentation Center', description: 'Novo sistema de documentação interativa com walkthrough, cursos, desafios, academia, exemplos e pesquisa inteligente.' },
  { id: 'v1-1-1', version: '1.1.1', date: '2026-08-05', type: 'improvement', title: 'Melhorias na Exportação', description: 'Otimização do código gerado para Flutter e React Native. Redução de 30% no tamanho do código exportado.' },
  { id: 'v1-1-2', version: '1.1.2', date: '2026-08-10', type: 'fix', title: 'Correções de Performance', description: 'Correção de memory leak no canvas. Melhoria na renderização de componentes complexos.' },
  { id: 'v2-0-0', version: '2.0.0', date: '2026-09-01', type: 'new', title: 'Nova Geração', description: 'Suporte a plugins, marketplace, temas customizados, colaboração em tempo real e deploy automático.' },
];

export function getAllArticles(): DocArticle[] {
  return DOCUMENTATION_CATEGORIES.flatMap(cat => cat.articles);
}

export function getArticleById(id: string): DocArticle | undefined {
  return getAllArticles().find(a => a.id === id);
}

export function getCategoryById(id: string): DocCategory | undefined {
  return DOCUMENTATION_CATEGORIES.find(c => c.id === id);
}

export function searchArticles(query: string): DocArticle[] {
  const q = query.toLowerCase();
  return getAllArticles().filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.description.toLowerCase().includes(q) ||
    a.tags.some(t => t.toLowerCase().includes(q)) ||
    a.content.toLowerCase().includes(q)
  );
}

export function getRelatedArticles(articleId: string): DocArticle[] {
  const article = getArticleById(articleId);
  if (!article) return [];
  return article.relatedArticles
    .map(id => getArticleById(id))
    .filter((a): a is DocArticle => a !== undefined);
}

export function getRecentArticles(): DocArticle[] {
  return getAllArticles().slice(0, 6);
}

export function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem('doc_favorites');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(articleId: string): string[] {
  const favorites = getFavorites();
  const index = favorites.indexOf(articleId);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(articleId);
  }
  localStorage.setItem('doc_favorites', JSON.stringify(favorites));
  return favorites;
}

export function getRecentAccess(): string[] {
  try {
    const stored = localStorage.getItem('doc_recent');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentAccess(articleId: string): void {
  const recent = getRecentAccess().filter(id => id !== articleId);
  recent.unshift(articleId);
  if (recent.length > 10) recent.pop();
  localStorage.setItem('doc_recent', JSON.stringify(recent));
}

export function getCourseProgress(): Record<string, string[]> {
  try {
    const stored = localStorage.getItem('course_progress');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function completeLesson(courseId: string, lessonId: string): Record<string, string[]> {
  const progress = getCourseProgress();
  if (!progress[courseId]) progress[courseId] = [];
  if (!progress[courseId].includes(lessonId)) {
    progress[courseId].push(lessonId);
  }
  localStorage.setItem('course_progress', JSON.stringify(progress));
  return progress;
}

export function getChallengeProgress(): string[] {
  try {
    const stored = localStorage.getItem('challenge_progress');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function completeChallenge(challengeId: string): string[] {
  const progress = getChallengeProgress();
  if (!progress.includes(challengeId)) {
    progress.push(challengeId);
  }
  localStorage.setItem('challenge_progress', JSON.stringify(progress));
  return progress;
}

export function getArticleFeedback(): Record<string, 'up' | 'down'> {
  try {
    const stored = localStorage.getItem('article_feedback');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function setArticleFeedback(articleId: string, type: 'up' | 'down'): Record<string, 'up' | 'down'> {
  const feedback = getArticleFeedback();
  feedback[articleId] = type;
  localStorage.setItem('article_feedback', JSON.stringify(feedback));
  return feedback;
}