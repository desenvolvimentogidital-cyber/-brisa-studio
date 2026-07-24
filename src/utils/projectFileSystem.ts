import { Project, Screen, CanvasComponent } from '../types';
import { generateCode } from './codeGenerators';

export interface VirtualFile {
  id: string;
  name: string;
  path: string;
  language: 'json' | 'typescript' | 'javascript' | 'css' | 'html' | 'markdown';
  content?: string;
  isReadOnly?: boolean;
  isFolder?: boolean;
  children?: VirtualFile[];
}

/**
 * Builds a comprehensive Virtual File Explorer structure for JavaScript application logic.
 */
export function buildVirtualFileSystem(
  project: Project,
  customFiles: Record<string, string> = {}
): VirtualFile[] {
  const activeScreen =
    project.screens.find((s) => s.id === project.activeScreenId) || project.screens[0];

  const screensFiles: VirtualFile[] = project.screens.map((scr) => {
    const fileName = `${scr.name.replace(/[^a-zA-Z0-9]/g, '') || 'Screen'}.js`;
    const filePath = `src/screens/${fileName}`;
    const code =
      customFiles[filePath] ||
      `// Screen Controller: ${scr.name}\n` +
      `// Manipulação de componentes via Mobile Studio JavaScript API (app)\n\n` +
      `export function init${scr.name.replace(/[^a-zA-Z0-9]/g, '') || 'Screen'}(app) {\n` +
      `  app.onLoad(() => {\n` +
      `    app.toast("Tela ${scr.name} inicializada!");\n` +
      `  });\n` +
      `}\n`;

    return {
      id: filePath,
      name: fileName,
      path: filePath,
      language: 'javascript',
      content: code,
    };
  });

  const defaultFiles: VirtualFile[] = [
    {
      id: 'src/app.js',
      name: 'app.js',
      path: 'src/app.js',
      language: 'javascript',
      content: customFiles['src/app.js'] ||
        `/**\n * Mobile Studio - JavaScript Application Entry Point\n` +
        ` * Utilize a API 'app' para controlar a lógica da aplicação e componentes do Canvas.\n` +
        ` */\n\n` +
        `// Exemplo: Manipulação de componente e navegação\n` +
        `const botao = app.getComponent("btnLogin");\n` +
        `if (botao) {\n` +
        `  botao.text = "Entrar no App";\n` +
        `  botao.background = "#0066FF";\n` +
        `  botao.borderRadius = 12;\n` +
        `}\n\n` +
        `// Registro de Evento de Clique\n` +
        `app.onClick("btnLogin", () => {\n` +
        `  app.toast("Processando login...");\n` +
        `  app.navigate("Home");\n` +
        `});\n\n` +
        `app.onLoad(() => {\n` +
        `  console.log("Aplicação iniciada no Mobile Studio.");\n` +
        `});\n`,
    },
    {
      id: 'src/events/handlers.js',
      name: 'handlers.js',
      path: 'src/events/handlers.js',
      language: 'javascript',
      content: customFiles['src/events/handlers.js'] ||
        `// Handlers de Eventos Globais da Aplicação\n\n` +
        `export function setupEventHandlers(app) {\n` +
        `  app.onClick("btnSalvar", () => {\n` +
        `    app.toast("Dados salvos com sucesso!");\n` +
        `  });\n` +
        `}\n`,
    },
    {
      id: 'src/services/api.js',
      name: 'api.js',
      path: 'src/services/api.js',
      language: 'javascript',
      content: customFiles['src/services/api.js'] ||
        `// Serviço de Chamadas de API REST / Backend\n\n` +
        `export async function loginUser(email, password) {\n` +
        `  return { success: true, token: "jwt_token_example", user: { email } };\n` +
        `}\n`,
    },
    {
      id: 'src/styles/globals.css',
      name: 'globals.css',
      path: 'src/styles/globals.css',
      language: 'css',
      content: customFiles['src/styles/globals.css'] || `@import "tailwindcss";\n\n:root {\n  --primary: #2563eb;\n}\n`,
    },
    {
      id: 'project.json',
      name: 'project.json (Modelo Interno)',
      path: 'project.json',
      language: 'json',
      content: customFiles['project.json'] || JSON.stringify(project, null, 2),
    },
    {
      id: 'package.json',
      name: 'package.json',
      path: 'package.json',
      language: 'json',
      content: customFiles['package.json'] || JSON.stringify(
        {
          name: project.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          version: project.version || '1.0.0',
          private: true,
          dependencies: {
            react: '^19.0.0',
            'react-native': '^0.74.0',
            tailwindcss: '^4.0.0',
          },
        },
        null,
        2
      ),
    },
  ];

  const rootStructure: VirtualFile[] = [
    {
      id: 'src',
      name: 'src',
      path: 'src',
      language: 'javascript',
      isFolder: true,
      children: [
        defaultFiles.find((f) => f.id === 'src/app.js')!,
        {
          id: 'src/screens',
          name: 'screens',
          path: 'src/screens',
          language: 'javascript',
          isFolder: true,
          children: screensFiles,
        },
        {
          id: 'src/events',
          name: 'events',
          path: 'src/events',
          language: 'javascript',
          isFolder: true,
          children: [
            defaultFiles.find((f) => f.id === 'src/events/handlers.js')!,
          ],
        },
        {
          id: 'src/services',
          name: 'services',
          path: 'src/services',
          language: 'javascript',
          isFolder: true,
          children: [
            defaultFiles.find((f) => f.id === 'src/services/api.js')!,
          ],
        },
        {
          id: 'src/styles',
          name: 'styles',
          path: 'src/styles',
          language: 'css',
          isFolder: true,
          children: [
            defaultFiles.find((f) => f.id === 'src/styles/globals.css')!,
          ],
        },
      ],
    },
    defaultFiles.find((f) => f.id === 'project.json')!,
    defaultFiles.find((f) => f.id === 'package.json')!,
  ];

  return rootStructure;
}
