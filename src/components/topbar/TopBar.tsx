import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { DEVICE_PRESETS } from '../../constants/componentTemplates';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Sun,
  Moon,
  Code2,
  Play,
  Plus,
  ChevronDown,
  LayoutTemplate,
  Search,
  HelpCircle,
  FileDown,
  Eye,
  Check,
  Edit2,
  Settings,
  Columns,
  Terminal,
  Zap,
  Database,
  ShieldCheck,
  Bell,
  Package,
  Globe,
  BookOpen,
} from 'lucide-react';
import { downloadProjectJson } from '../../utils/storage';

export const TopBar: React.FC = () => {
  const {
    project,
    activeScreen,
    setActiveScreenId,
    addScreen,
    renameScreen,
    device,
    setDevice,
    undo,
    redo,
    canUndo,
    canRedo,
    zoom,
    setZoom,
    resetCanvasView,
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    theme,
    toggleTheme,
    mode,
    setMode,
    devMode,
    setDevMode,
    setIsExportModalOpen,
    setIsWelcomeModalOpen,
    setIsCommandPaletteOpen,
    setIsShortcutsModalOpen,
    setIsFeedbackModalOpen,
    setIsWebsitePortalOpen,
    setIsDocumentationOpen,
    resetProjectToBlank,
    showToast,
  } = useEditor();

  const [isScreenMenuOpen, setIsScreenMenuOpen] = useState(false);
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);
  const [isEditingScreenName, setIsEditingScreenName] = useState(false);
  const [tempScreenName, setTempScreenName] = useState(activeScreen.name);

  const handleScreenRenameSubmit = () => {
    if (tempScreenName.trim()) {
      renameScreen(activeScreen.id, tempScreenName.trim());
    }
    setIsEditingScreenName(false);
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 text-slate-200 flex items-center justify-between px-3 select-none z-30 shrink-0">
      {/* Left: Brand & Screen Selector */}
      <div className="flex items-center gap-3">
        {/* App Logo & Welcome Screen Trigger */}
        <button
          onClick={() => setIsWelcomeModalOpen(true)}
          title="Abrir Tela Inicial (Projetos & Modelos)"
          className="flex items-center gap-2 font-bold text-base tracking-tight text-white pr-2 border-r border-slate-800 hover:opacity-80 transition group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden md:inline bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Mobile Studio
            </span>
            <span className="hidden lg:inline bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
              v1.0.0
            </span>
          </div>
        </button>

        {/* Screen Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsScreenMenuOpen(!isScreenMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{activeScreen.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isScreenMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Telas do App ({project.screens.length})
              </div>
              {project.screens.map((scr) => (
                <button
                  key={scr.id}
                  onClick={() => {
                    setActiveScreenId(scr.id);
                    setIsScreenMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/60 transition ${
                    scr.id === activeScreen.id ? 'text-blue-400 font-semibold bg-blue-500/10' : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">{scr.name}</span>
                  {scr.isInitialScreen && (
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                      Inicial
                    </span>
                  )}
                </button>
              ))}
              <div className="border-t border-slate-700 my-1" />
              <button
                onClick={() => {
                  addScreen(`Tela ${project.screens.length + 1}`);
                  setIsScreenMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-blue-400 hover:bg-slate-700/60 transition font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Tela</span>
              </button>
            </div>
          )}
        </div>

        {/* Rename Screen inline trigger */}
        {isEditingScreenName ? (
          <input
            type="text"
            value={tempScreenName}
            onChange={(e) => setTempScreenName(e.target.value)}
            onBlur={handleScreenRenameSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleScreenRenameSubmit()}
            autoFocus
            className="px-2 py-1 bg-slate-950 border border-blue-500 rounded text-xs text-white outline-none w-32"
          />
        ) : (
          <button
            onClick={() => {
              setTempScreenName(activeScreen.name);
              setIsEditingScreenName(true);
            }}
            title="Renomear tela"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Center: Device Presets & Canvas Controls */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
        {/* Device Picker */}
        <div className="relative">
          <button
            onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition"
          >
            {device.id === 'desktop' ? (
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
            ) : device.id === 'tablet' ? (
              <Tablet className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span className="font-medium">{device.name}</span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({device.width}x{device.height})
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isDeviceMenuOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
              {DEVICE_PRESETS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setDevice(d);
                    setIsDeviceMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/60 transition ${
                    d.id === device.id ? 'text-blue-400 font-semibold bg-blue-500/10' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div>{d.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {d.width} x {d.height} px
                    </div>
                  </div>
                  {d.id === device.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-slate-800 my-auto" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Desfazer (Ctrl+Z)"
            className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Refazer (Ctrl+Y)"
            className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition hover:bg-slate-800"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-slate-800 my-auto" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 relative">
          <button
            onClick={() => setZoom(zoom - 0.1)}
            title="Diminuir Zoom"
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsZoomMenuOpen(!isZoomMenuOpen)}
            title="Nível de Zoom"
            className="text-xs text-slate-300 hover:text-white px-2 py-1 rounded font-mono hover:bg-slate-800 transition flex items-center gap-1"
          >
            <span>{Math.round(zoom * 100)}%</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>
          <button
            onClick={() => setZoom(zoom + 0.1)}
            title="Aumentar Zoom"
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {isZoomMenuOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
              {[0.1, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 4.0, 8.0].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setZoom(level);
                    setIsZoomMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-slate-700/60 transition flex items-center justify-between ${
                    Math.round(zoom * 100) === Math.round(level * 100)
                      ? 'text-blue-400 font-bold bg-blue-500/10'
                      : 'text-slate-300'
                  }`}
                >
                  <span>{Math.round(level * 100)}%</span>
                  {Math.round(zoom * 100) === Math.round(level * 100) && (
                    <Check className="w-3 h-3 text-blue-400" />
                  )}
                </button>
              ))}
              <div className="border-t border-slate-700 my-1" />
              <button
                onClick={() => {
                  resetCanvasView();
                  setIsZoomMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700/60 transition"
              >
                Resetar (100%)
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-slate-800 my-auto" />

        {/* Grid & Snap Toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Alternar Grade (Grid)"
          className={`p-1.5 rounded transition ${
            showGrid ? 'text-blue-400 bg-blue-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Development Modes (Visual, Híbrido, Código) */}
      <div className="flex items-center p-1 bg-slate-950/90 rounded-xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setDevMode('visual')}
          title="Modo Visual (Drag and Drop)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
            devMode === 'visual'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Visual</span>
        </button>

        <button
          onClick={() => setDevMode('hybrid')}
          title="Modo Híbrido (Visual + Código em Tempo Real)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
            devMode === 'hybrid'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Híbrido</span>
        </button>

        <button
          onClick={() => setDevMode('code')}
          title="Modo Código (IDE VS Code Híbrido)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
            devMode === 'code'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Código</span>
        </button>

        <button
          onClick={() => setDevMode('nocode')}
          title="Modo No-Code (Motor de Lógica Visual)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
            devMode === 'nocode'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">No-Code</span>
        </button>

        <button
          onClick={() => setDevMode('database')}
          title="Modo Dados & APIs (Universal Data Engine)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
            devMode === 'database'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Dados</span>
        </button>

        <button
          onClick={() => setDevMode('security')}
          title="Modo Segurança & Auth (Identity Layer)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
            devMode === 'security'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span className="hidden sm:inline">Segurança</span>
        </button>

        <button
          onClick={() => setDevMode('notifications')}
          title="Modo Notificações & Comunicação"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
            devMode === 'notifications'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-indigo-300" />
          <span className="hidden sm:inline">Notificações</span>
        </button>

        <button
          onClick={() => setDevMode('packaging')}
          title="Modo Packaging & Deployment (Fase 8)"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
            devMode === 'packaging'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-purple-300" />
          <span className="hidden sm:inline">Publicação</span>
        </button>
      </div>

      {/* Right: Actions, Command Palette, Mode & Export */}
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 transition"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Buscar Ação</span>
          <kbd className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Download Project JSON */}
        <button
          onClick={() => {
            downloadProjectJson(project);
            showToast('Projeto JSON baixado!');
          }}
          title="Baixar Arquivo de Projeto (.json)"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <FileDown className="w-4 h-4" />
        </button>

        {/* Interactive Prototype Mode Button */}
        <button
          onClick={() => setMode('prototype')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Testar Protótipo</span>
        </button>

        {/* Code Export Button */}
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md shadow-blue-600/20"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Exportar Código</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title="Alternar Tema Claro/Escuro"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Official Release Portal Button */}
        <button
          onClick={() => setIsWebsitePortalOpen(true)}
          title="Abrir Portal Oficial de Lançamento (v1.0.0)"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-emerald-500/30 transition"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Portal v1.0.0</span>
        </button>

        {/* Feedback Modal Trigger */}
        <button
          onClick={() => setIsFeedbackModalOpen(true)}
          title="Enviar Feedback & Diagnósticos"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Feedback</span>
        </button>

        {/* Documentation Center Trigger */}
        <button
          onClick={() => setIsDocumentationOpen(true)}
          title="Documentation Center"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-400 border border-blue-500/30 transition"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Documentação</span>
        </button>

        {/* Shortcuts Modal Trigger */}
        <button
          onClick={() => setIsShortcutsModalOpen(true)}
          title="Atalhos do Teclado"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
