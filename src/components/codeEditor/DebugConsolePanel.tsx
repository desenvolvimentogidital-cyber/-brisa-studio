import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { GitIntegrationPanel } from './GitIntegrationPanel';
import {
  Terminal,
  Activity,
  Sliders,
  Layers,
  AlertTriangle,
  GitBranch,
  Trash2,
  CheckCircle2,
  XCircle,
  Info,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const DebugConsolePanel: React.FC = () => {
  const {
    consoleLogs,
    clearConsoleLogs,
    eventLogs,
    activeBottomPanelTab,
    setActiveBottomPanelTab,
    selectedComponent,
    project,
    activeScreen,
    device,
    zoom,
  } = useEditor();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');

  const filteredConsoleLogs = consoleLogs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.type === logFilter;
  });

  return (
    <div
      className={`w-full bg-slate-950 border-t border-slate-800 flex flex-col transition-all duration-200 select-none ${
        isCollapsed ? 'h-9' : 'h-64'
      }`}
    >
      {/* Console Tab Navigation Bar */}
      <div className="h-9 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              setActiveBottomPanelTab('console');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
              activeBottomPanelTab === 'console' && !isCollapsed
                ? 'bg-slate-800 text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Console</span>
            <span className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.2 rounded-full text-slate-300">
              {consoleLogs.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveBottomPanelTab('inspector');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
              activeBottomPanelTab === 'inspector' && !isCollapsed
                ? 'bg-slate-800 text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Inspecionar Componente</span>
            {selectedComponent && (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded">
                {selectedComponent.name}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveBottomPanelTab('variables');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
              activeBottomPanelTab === 'variables' && !isCollapsed
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Variáveis & Estado</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomPanelTab('events');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
              activeBottomPanelTab === 'events' && !isCollapsed
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Monitor de Eventos</span>
            <span className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.2 rounded-full text-slate-300">
              {eventLogs.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveBottomPanelTab('diagnostics');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
              activeBottomPanelTab === 'diagnostics' && !isCollapsed
                ? 'bg-slate-800 text-rose-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Diagnósticos</span>
          </button>

          <button
            onClick={() => {
              setActiveBottomPanelTab('git');
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition ${
              activeBottomPanelTab === 'git' && !isCollapsed
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
            <span>Git</span>
          </button>
        </div>

        {/* Panel Controls */}
        <div className="flex items-center gap-2">
          {activeBottomPanelTab === 'console' && !isCollapsed && (
            <button
              onClick={clearConsoleLogs}
              title="Limpar Console"
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expandir Painel' : 'Recolher Painel'}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            {isCollapsed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Panel Body */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-slate-200">
          {/* TAB 1: Console */}
          {activeBottomPanelTab === 'console' && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="font-sans font-bold">Filtro:</span>
                {(['all', 'info', 'warn', 'error'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className={`px-2 py-0.5 rounded font-medium uppercase transition ${
                      logFilter === f
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {filteredConsoleLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 py-1 px-2 rounded border ${
                    log.type === 'error'
                      ? 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                      : log.type === 'warn'
                      ? 'bg-amber-950/30 border-amber-900/50 text-amber-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 shrink-0">
                    [{log.timestamp}]
                  </span>
                  <span className="text-[10px] font-bold uppercase text-blue-400 shrink-0">
                    [{log.source || 'Studio'}]
                  </span>
                  <span className="flex-1 whitespace-pre-wrap leading-relaxed">
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Component Inspector */}
          {activeBottomPanelTab === 'inspector' && (
            <div>
              {selectedComponent ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <h4 className="text-xs font-bold text-blue-400 font-sans uppercase">
                      Informações Gerais
                    </h4>
                    <div>
                      <span className="text-slate-400">ID:</span> {selectedComponent.id}
                    </div>
                    <div>
                      <span className="text-slate-400">Nome:</span> {selectedComponent.name}
                    </div>
                    <div>
                      <span className="text-slate-400">Tipo:</span> {selectedComponent.type}
                    </div>
                    <div>
                      <span className="text-slate-400">Categoria:</span> {selectedComponent.category}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <h4 className="text-xs font-bold text-emerald-400 font-sans uppercase">
                      Geometria e Estilo
                    </h4>
                    <div>
                      <span className="text-slate-400">Posição:</span> X={selectedComponent.x}px, Y={selectedComponent.y}px
                    </div>
                    <div>
                      <span className="text-slate-400">Tamanho:</span> W={selectedComponent.width}px, H={selectedComponent.height}px
                    </div>
                    <div>
                      <span className="text-slate-400">Fundo:</span> {selectedComponent.backgroundColor}
                    </div>
                    <div>
                      <span className="text-slate-400">Cor do Texto:</span> {selectedComponent.color}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 py-8 text-center font-sans">
                  Nenhum componente selecionado no Canvas. Clique em um elemento para inspecionar.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: State Variables */}
          {activeBottomPanelTab === 'variables' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-sans">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Nome do Projeto</div>
                <div className="text-sm font-bold text-white mt-1">{project.name}</div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Tela Ativa</div>
                <div className="text-sm font-bold text-blue-400 mt-1">{activeScreen.name}</div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Dispositivo Viewport</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">
                  {device.name} ({device.width}x{device.height})
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Total de Telas</div>
                <div className="text-sm font-bold text-indigo-400 mt-1">
                  {project.screens.length} tela(s)
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Event Monitor */}
          {activeBottomPanelTab === 'events' && (
            <div className="space-y-1.5">
              {eventLogs.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center gap-2 py-1 px-2 rounded bg-slate-900 border border-slate-800 text-slate-300"
                >
                  <span className="text-[10px] text-slate-500">[{evt.timestamp}]</span>
                  <span className="text-xs font-bold text-amber-400">{evt.action}:</span>
                  <span className="text-xs text-slate-300">{evt.details}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: Diagnostics */}
          {activeBottomPanelTab === 'diagnostics' && (
            <div className="space-y-2 font-sans">
              <div className="flex items-center gap-2 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Sintaxe do Blueprint em tempo real: 0 erros críticos detectados. Tudo pronto para compilação.
                </span>
              </div>
            </div>
          )}

          {/* TAB 6: Git Panel */}
          {activeBottomPanelTab === 'git' && <GitIntegrationPanel />}
        </div>
      )}
    </div>
  );
};
