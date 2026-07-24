# 📚 MOBILE STUDIO v1.0.0 — MANUAL DO USUÁRIO & DOCUMENTAÇÃO OFICIAL

Bem-vindo à documentação oficial do **Mobile Studio v1.0.0**! Esta documentação contém todos os guias, tutoriais e referências necessários para criar, personalizar, conectar e publicar aplicativos mobile nativos de nível comercial.

---

## 📋 Sumário Geral

1. [Bem-vindo ao Mobile Studio](#1-bem-vindo-ao-mobile-studio)
2. [Primeiros Passos](#2-primeiros-passos)
3. [Conhecendo a Interface](#3-conhecendo-a-interface)
4. [Criando um Aplicativo (Passo a Passo)](#4-criando-um-aplicativo)
5. [Trabalhando com Componentes](#5-trabalhando-com-componentes)
6. [Banco de Dados](#6-banco-de-dados)
7. [APIs (REST & GraphQL)](#7-apis)
8. [JavaScript Engine API](#8-javascript)
9. [No-Code Logic Flow Builder](#9-no-code)
10. [Exportação Multi-Platform](#10-exportacao)
11. [Publicação (Play Store, App Store & Web)](#11-publicacao)
12. [Marketplace](#12-marketplace)
13. [Perguntas Frequentes (FAQ)](#13-faq)
14. [Atalhos do Teclado](#14-atalhos)
15. [Solução de Problemas (Troubleshooting)](#15-solucao-de-problemas)
16. [Atualizações & Notas de Versão](#16-atualizacoes)

---

## 1. Bem-vindo ao Mobile Studio

### O que é o Mobile Studio?
O **Mobile Studio** é uma plataforma visual comercial de alta performance para criação e exportação nativa de aplicativos mobile. Ele combina um editor visual intuitivo *drag-and-drop*, construtor de lógica *No-Code*, designer de banco de dados e um motor de exportação de código limpo para **Flutter, React Native, Kotlin, SwiftUI e HTML5/PWA**.

### Para quem ele foi criado?
- **Desenvolvedores**: Para aceleração de prototipagem e geração de código nativo limpo sem código espaguete.
- **Designers de UI/UX**: Para criação de interfaces vivas e protótipos interativos diretamente no ambiente de produção.
- **Equipes de Produto e Startups**: Para validação rápida de MVPs e criação de apps comerciais de grande porte.
- **Agências e Empresas**: Para entrega rápida de soluções mobile com baixa manutenção e código 100% próprio.

### O que é possível construir?
Com o Mobile Studio você pode construir qualquer tipo de aplicativo mobile:
- **E-commerce & Lojas Virtuais**: Catálogos, carrinhos de compras, checkout e integração com gateways de pagamento.
- **Redes Sociais & Comunidades**: Feeds, perfis de usuários, comentários, curtidas e mensagens em tempo real.
- **Dashboards & Business Intelligence**: Gráficos, métricas, relatórios em PDF e relatórios financeiros.
- **Sistemas de Gestão & Entregas**: Apps de motoristas, rastreamento por mapa, agendamentos e notificações push.

### Como funciona o editor visual?
O editor opera em tempo real com renderização WYSIWYG (*What You See Is What You Get*). Você arrasta componentes da biblioteca para o Canvas, ajusta propriedades no painel direito (dimensões, cores, tipografia, bordas), conecta ações e simula a execução imediatamente no protótipo interativo.

---

## 2. Primeiros Passos

### Criar uma conta
Acesse o aplicativo e registre-se com seu e-mail ou provedores de autenticação rápida. Todas as suas configurações e projetos serão vinculados com segurança à sua conta.

### Criar um projeto
Na tela inicial (*Welcome Modal*):
1. Clique em **Novo Projeto Limpo** para começar do zero com uma tela em branco.
2. Ou escolha um dos **Templates Prontos** (E-commerce, Social App, Dashboard, Delivery) para iniciar com estrutura pré-configurada.

### Abrir um projeto
Na seção **Projetos Recentes**, clique no projeto desejado para abrir imediatamente no editor.

### Salvar alterações
O Mobile Studio possui **Auto-Save Inteligente** com resiliência a falhas:
- Suas alterações são salvas automaticamente no armazenamento local a cada modificação.
- Você também pode clicar no ícone de download ou pressionar `Ctrl+S` / `Cmd+S` para exportar um backup JSON do projeto.

### Renomear, Excluir e Duplicar
No seletor de telas ou na lista de projetos:
- **Renomear**: Clique no botão de edição ou pressione `F2` sobre a tela ativa.
- **Duplicar**: Clique em **Duplicar Tela** para criar uma cópia exata com todos os componentes e layouts.
- **Excluir**: Clique no ícone da lixeira para remover a tela ou projeto.

---

## 3. Conhecendo a Interface

### Barra Superior (TopBar)
A barra superior concentra os controles principais da aplicação:
- **Seletor de Telas**: Alterne entre as telas do seu app ou adicione novas telas.
- **Seletor de Dispositivo**: Alterne a visualização entre iPhone 15 Pro, iPad, Android Galaxy, ou monitor desktop.
- **Controle de Zoom & Grade**: Ajuste o zoom (50% a 200%), ative/desative a grade de alinhamento e o *snap to grid*.
- **Desfazer / Refazer**: Botões de histórico (`Ctrl+Z` / `Ctrl+Y`).
- **Seletor de Modos**: Alterne entre o **Modo Visual**, **Code Workspace**, **No-Code Logic**, **Database Designer**, **Security Designer** e **Notifications Center**.
- **Protótipo Interativo**: Botão **Testar Protótipo** para rodar o app no simulador em tempo real.
- **Exportar Código**: Botão **Exportar Código** para gerar o projeto nativo em Flutter, React Native, Kotlin, SwiftUI ou HTML.

### Painel de Componentes (LeftSidebar)
Localizado à esquerda no Modo Visual, contém o catálogo completo de widgets organizados por categorias:
- **Básicos**: Texto, Botão, Imagem, Ícone, Container, Divisor, Espaçador.
- **Entradas**: Campo de Texto, Seleção (Dropdown), Switch (Alternador), Checkbox, Slider.
- **Layouts**: Linha (FlexRow), Coluna (FlexColumn), Grade (Grid), Card, ScrollView.
- **Avançados**: Tabela de Dados, Gráfico, Mapa, Player de Vídeo, Webview.
- **Componentes Mestre**: Seus componentes reutilizáveis salvos na biblioteca.

### Canvas Area
A área central de trabalho onde a interface é construída:
- Suporta arrastar e soltar livre (*absolute positioning*) ou ordenação automática (*Auto Layout*).
- Conta com **Smart Guides** (linhas guia magnéticas) para alinhamento automático entre elementos.
- Oferece **Modo de Isolamento** para editar componentes complexos e aninhados sem distrações.

### Painel de Propriedades (Right Panel)
Exibe as configurações do componente selecionado:
- **Dimensões & Posição**: Largura, altura, coordenadas X/Y, z-index, alinhamento flex.
- **Estilo & Aparência**: Cor de fundo, gradiente, opacidade, raio da borda (*border-radius*), sombras (*box-shadow*).
- **Tipografia**: Família da fonte, tamanho, peso (*font-weight*), cor, alinhamento do texto.
- **Ações & Eventos**: Associação de eventos `onClick`, navegação entre telas, chamadas de API ou execuções de scripts JS.

### Camadas (Hierarchy Tree)
Árvore hierárquica exibindo a estrutura de componentes da tela ativa:
- Permite reordenar a sobreposição dos elementos (z-index).
- Suporta ocultar elementos (ícone do olho) e bloquear alterações (ícone do cadeado).

### Componentes Mestre
Gerenciador de componentes reutilizáveis:
- Crie botões, barras de navegação ou cards padronizados uma única vez.
- Atualizações no componente mestre são propagadas automaticamente para todas as instâncias no projeto.

### Assets Manager
Central de mídias e arquivos do projeto:
- Faça upload e organize imagens (PNG, JPG, SVG, WebP), ícones e fontes.
- Otimização e compressão automática de ativos para redução do tamanho final da aplicação.

### Code Workspace
Ambiente de desenvolvimento integrado com editor de código com destaque de sintaxe:
- Árvore de arquivos virtuais do projeto gerado.
- Edição de scripts customizados e arquivos de configuração.

### No-Code Logic Builder
Construtor visual de fluxos de lógica através de nós conectados:
- Crie condicionais, loops, validações de formulário e integrações sem digitar código.

### Database Designer
Modelador visual de banco de dados:
- Defina coleções/tabelas, campos, tipos de dados e relacionamentos.

---

## 4. Criando um Aplicativo (Passo a Passo)

```
Criar Projeto ➔ Criar Telas ➔ Adicionar Componentes ➔ Editar Propriedades
       │
       ▼
Criar Navegação ➔ Adicionar Banco ➔ Adicionar APIs ➔ Criar Login ➔ Criar Fluxos
       │
       ▼
Testar Protótipo ➔ Exportar Código Nativo ➔ Publicar nas Lojas
```

1. **Criar Projeto**: Clique em *Novo Projeto* e defina o nome e dispositivo padrão.
2. **Criar Telas**: Adicione telas como `Login`, `Home`, `Perfil` e `Detalhes`.
3. **Adicionar Componentes**: Arraste botões, entradas de texto, cartões e imagens para o Canvas.
4. **Editar Propriedades**: Personalize cores, tamanhos, fontes e bordas para adequar à sua marca.
5. **Criar Navegação**: Configure o evento `onClick` do botão de login para navegar até a tela `Home`.
6. **Adicionar Banco de Dados**: Crie a tabela `Usuarios` e `Produtos` no Database Designer.
7. **Adicionar APIs**: Configure endpoints REST para buscar dados externos.
8. **Criar Login**: Vincule a autenticação com o módulo de Identity & Security.
9. **Criar Fluxos No-Code**: Adicione validações para garantir que os campos de e-mail e senha não estejam vazios.
10. **Testar Protótipo**: Clique em *Testar Protótipo* para interagir com o app simulado em tempo real.
11. **Exportar Código**: Escolha Flutter, React Native, Kotlin, SwiftUI ou HTML e clique em *Exportar*.

---

## 5. Trabalhando com Componentes

- **Adicionar**: Clique no componente na barra lateral esquerda ou arraste-o diretamente para o Canvas.
- **Mover**: Clique e arraste o componente no Canvas, ou use as setas do teclado para ajustes precisos.
- **Duplicar**: Selecione o componente e pressione `Ctrl+D` (Windows) ou `Cmd+D` (Mac).
- **Agrupar / Desagrupar**: Selecione múltiplos componentes e pressione `Ctrl+G` para agrupar em um Container. Pressione `Ctrl+Shift+G` para desagrupar.
- **Excluir**: Selecione e pressione `Delete` ou `Backspace`.
- **Renomear**: Pressione `F2` sobre o componente selecionado para alterar seu nome.
- **Converter em Mestre**: Clique com o botão direito sobre o componente e selecione **Criar Componente Mestre**.
- **Criar Biblioteca**: Organize seus componentes mestre em categorias (ex: *Botoes*, *Cards*, *Navegacao*).

---

## 6. Banco de Dados

### Criar Tabela / Coleção
No módulo **Database Designer**, clique em **Nova Tabela** (ex: `Produtos`).

### Criar Campos
Adicione colunas e especifique os tipos de dados:
- `id` (String / UUID)
- `nome` (String)
- `preco` (Number)
- `emEstoque` (Boolean)
- `fotos` (Array)

### Relacionamentos
Defina conexões entre tabelas:
- **1 para 1**: Ex: `Usuario` ➔ `Perfil`
- **1 para N**: Ex: `Categoria` ➔ `Produtos`
- **N para M**: Ex: `Pedidos` ➔ `Produtos`

### Data Binding
Vincule uma propriedade de UI diretamente a um campo do banco de dados. Quando os dados mudarem no banco, a interface será atualizada automaticamente.

---

## 7. APIs (Integração REST & GraphQL)

### Criar e Consumir Endpoints
1. Abra a guia de APIs e insira a URL base (ex: `https://api.meusite.com/v1`).
2. Defina o método HTTP: `GET`, `POST`, `PUT`, `DELETE`.
3. Adicione parâmetros de query e corpo da requisição em formato JSON.

### Autenticação
Suporte integrado para os principais métodos de autenticação:
- **Bearer Token (JWT)**
- **API Key em Header ou Query**
- **Basic Auth**
- **OAuth 2.0 (Authorization Code & Client Credentials)**

### Testar Requisições
Clique em **Testar Endpoint** para executar a chamada em tempo real e visualizar o status HTTP, tempo de resposta, headers e resposta JSON formatada.

---

## 8. JavaScript Engine API

O Mobile Studio disponibiliza a API global `app` para controle programático completo da aplicação no protótipo e no código exportado:

```javascript
// Buscar um componente pelo ID e alterar suas propriedades
const btnLogin = app.getComponent("btnLogin");
btnLogin.text = "Processando...";
btnLogin.disabled = true;

// Acessar valor de um campo de entrada
const email = app.getComponent("inputEmail").value;
const senha = app.getComponent("inputSenha").value;

// Executar validação e navegar entre telas
if (email && senha) {
  app.navigate("Home", { userEmail: email });
  app.showToast("Login realizado com sucesso!");
} else {
  app.showToast("Preencha todos os campos.");
  btnLogin.text = "Entrar";
  btnLogin.disabled = false;
}
```

### Principais Métodos da API `app`
- `app.getComponent(id)`: Retorna a instância do componente.
- `app.navigate(screenId, params)`: Navega para a tela especificada.
- `app.showToast(message)`: Exibe uma notificação flutuante na tela.
- `app.getVariable(name)` / `app.setVariable(name, value)`: Lê e grava variáveis de estado global.
- `app.callApi(apiId, options)`: Executa uma chamada de API REST configurada.

---

## 9. No-Code (Visual Logic Flow Builder)

O construtor No-Code permite criar lógica de negócios complexa conectando blocos visuais:

- **Gatilhos de Eventos**: `onClick`, `onPageLoad`, `onInputChange`, `onSubmit`.
- **Blocos de Condição**: Condicionais `If / Else` baseadas em comparação de valores (igual, diferente, maior que, contém).
- **Blocos de Loop**: Iterações `For Each` sobre listas de dados para atualizar coleções.
- **Variáveis de Estado**: Definição de variáveis locais da tela ou variáveis globais da aplicação.
- **Orquestração de Fluxos**: Encadeamento de ações como abrir modais, disparar notificações push e gravar no banco de dados.

---

## 10. Exportação Multi-Platform

O Mobile Studio gera projetos nativos completos, limpos e prontos para compilação profissional:

- **Flutter**: Código em linguagem **Dart** com arquitetura limpa, widgets reutilizáveis e suporte a pacotes `pub.dev`.
- **React Native**: Código em **TypeScript** com React 19, componentes funcionais, JSX e estilização `StyleSheet`.
- **Kotlin (Jetpack Compose)**: Código Android nativo em **Kotlin** utilizando Jetpack Compose e Material Design 3.
- **SwiftUI**: Código iOS nativo em **Swift** otimizado para iOS 17+ com suporte a preview em tempo real no Xcode.
- **HTML5 / PWA**: Aplicação Web responsiva construída em **HTML5 semântico, CSS moderno e JavaScript**, pronta para hospedagem web e instalação como PWA.

---

## 11. Publicação (Play Store, App Store & Web)

### Google Play Store
1. No painel de **Publicação**, configure o App Manifest (Nome do Pacote, Versão, Ícone, Splash Screen).
2. Adicione as chaves de assinatura (*Keystore*).
3. Clique em **Gerar Build Android (AAB / APK)**.
4. Faça upload do arquivo `.aab` no Google Play Console.

### Apple App Store
1. Insira seu Team ID e Certificado de Distribuição da Apple.
2. Defina os metadados da App Store (Título, Subtítulo, Descrição, URL de Privacidade).
3. Clique em **Gerar Build iOS (IPA)** e envie para o App Store Connect via Transporter.

### Publicação Web (PWA)
1. Clique em **Gerar Build Web PWA**.
2. Baixe o pacote comprimido para hospedar no seu servidor ou faça deploy direto com SSL ativado.

---

## 12. Marketplace

Instale recursos prontos ou publique suas próprias extensões no Marketplace do Mobile Studio:

- **Componentes**: Pacotes de UI prontos (gráficos, formulários avançados, cards 3D).
- **Plugins**: Integrações com serviços de terceiros (Stripe, Firebase, Google Maps, OneSignal).
- **Templates**: Modelos de projetos completos prontos para uso comercial.
- **Temas**: Paletas de cores e sistemas de design customizados para o editor.

*Nota de Segurança: Todos os plugins no Marketplace passam por verificação automatizada com assinatura digital HMAC SHA-256.*

---

## 13. Perguntas Frequentes (FAQ)

### O código gerado pertence a quem?
O código-fonte gerado e exportado pelo Mobile Studio pertence **100% a você ou sua empresa**. Não há cobrança de *royalties* nem dependência de servidores proprietários após a exportação.

### O aplicativo funciona offline?
Sim! Os apps exportados possuem suporte a filas de sincronização offline e persistência de dados local no dispositivo.

### Posso alterar o código depois de exportar?
Com certeza! O código gerado segue arquitetura padrão de cada linguagem (Flutter, React Native, Kotlin, Swift, HTML), permitindo que qualquer desenvolvedor continue evoluindo o projeto no VS Code, Android Studio ou Xcode.

---

## 14. Atalhos do Teclado

| Atalho (Windows / Linux) | Atalho (Mac) | Ação Executada |
| :--- | :--- | :--- |
| `Ctrl + K` | `Cmd + K` | Abrir Paleta de Comandos (Search) |
| `Ctrl + Z` | `Cmd + Z` | Desfazer (*Undo*) |
| `Ctrl + Y` ou `Ctrl + Shift + Z` | `Cmd + Shift + Z` | Refazer (*Redo*) |
| `Ctrl + D` | `Cmd + D` | Duplicar componente(s) selecionado(s) |
| `Ctrl + G` | `Cmd + G` | Agrupar componentes em um Container |
| `Ctrl + Shift + G` | `Cmd + Shift + G` | Desagrupar componentes |
| `Ctrl + A` | `Cmd + A` | Selecionar todos os componentes da tela |
| `F2` | `F2` | Renomear componente selecionado |
| `Delete` / `Backspace` | `Delete` / `Backspace` | Excluir componente(s) selecionado(s) |
| `Esc` | `Esc` | Desselecionar tudo ou sair do modo de isolamento |
| `Setas do Teclado` | `Setas do Teclado` | Mover componente selecionado 1px |
| `Shift + Setas` | `Shift + Setas` | Mover componente selecionado 10px |

---

## 15. Solução de Problemas (Troubleshooting)

### Componente não aparece no Canvas
- Verifique se a camada do componente não está oculta (ícone do olho no painel de hierarquia).
- Verifique se o z-index não está atrás do plano de fundo da tela.

### Erro ao Exportar Código
- Garanta que todas as telas possuem nomes válidos e sem caracteres especiais proibidos.
- Verifique se todos os bindings de dados possuem tabelas e campos correspondentes no Database Designer.

### O protótipo não responde ao clicar no botão
- Certifique-se de que configurou o evento `onClick` nas propriedades do botão apontando para uma ação de navegação ou script válido.

---

## 16. Atualizações & Notas de Versão

### Versão 1.0.0 (Lançamento Oficial Estável)
- **Status**: *Production Ready & Commercial Ready*
- Editor visual com Auto Layout, Smart Guides e isolamento de componentes.
- 5 Exportadores Nativos (Flutter, React Native, Kotlin, SwiftUI, HTML/PWA).
- Construtor No-Code, Database Designer, Central de Notificações e Auth Security.
- SDK de Componentes Universais e Marketplace Oficial com validação SHA-256.
- Suíte de segurança hardened com JS Sandbox e criptografia AES-256.
