import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import {
  Zap,
  Play,
  Plus,
  Trash2,
  Code,
  ArrowRight,
  Layers,
  Sparkles,
  MousePointer,
  Clock,
  Database,
  Navigation,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { NoCodeFlowRule, NoCodeBlockAction, compileNoCodeFlowToJS } from '../../utils/nocodeEngine';
import { createStudioAppApi } from '../../utils/studioAppApi';

export const NoCodeLogicBuilder: React.FC = () => {
  const { project, setProject, showToast, addConsoleLog, logEvent, setActiveScreenId, setSelectedComponentId } = useEditor();

  const [flows, setFlows] = useState<NoCodeFlowRule[]>([
    {
      id: 'flow_1',
      name: 'Ao Clicar no Botão de Login',
      triggerEvent: 'onClick',
      targetComponentId: 'btnLogin',
      actions: [
        { id: 'act_1', type: 'SHOW_TOAST', params: { message: 'Iniciando autenticação...' } },
        { id: 'act_2', type: 'NAVIGATE', params: { targetScreen: 'Home' } },
      ],
    },
  ]);

  const [activeFlowId, setActiveFlowId] = useState<string>('flow_1');
  const [newActionType, setNewActionType] = useState<NoCodeBlockAction['type']>('SHOW_TOAST');

  const activeFlow = flows.find((f) => f.id === activeFlowId) || flows[0];

  const handleAddFlow = () => {
    const newRule: NoCodeFlowRule = {
      id: `flow_${Date.now()}`,
      name: `Novo Fluxo de Lógica ${flows.length + 1}`,
      triggerEvent: 'onClick',
      targetComponentId: 'btnLogin',
      actions: [{ id: `act_${Date.now()}`, type: 'SHOW_TOAST', params: { message: 'Ação executada!' } }],
    };
    setFlows([...flows, newRule]);
    setActiveFlowId(newRule.id);
    showToast('Novo fluxo de lógica No-Code criado.');
  };

  const handleAddAction = () => {
    if (!activeFlow) return;
    const newAct: NoCodeBlockAction = {
      id: `act_${Date.now()}`,
      type: newActionType,
      params:
        newActionType === 'SHOW_TOAST'
          ? { message: 'Alerta enviado!' }
          : newActionType === 'NAVIGATE'
          ? { targetScreen: 'Home' }
          : { componentId: 'btnLogin', color: '#0066FF' },
    };

    const updatedFlows = flows.map((f) => {
      if (f.id === activeFlow.id) {
        return { ...f, actions: [...f.actions, newAct] };
      }
      return f;
    });

    setFlows(updatedFlows);
    showToast(`Ação '${newActionType}' adicionada ao fluxo.`);
  };

  const handleDeleteAction = (actId: string) => {
    if (!activeFlow) return;
    const updatedFlows = flows.map((f) => {
      if (f.id === activeFlow.id) {
        return { ...f, actions: f.actions.filter((a) => a.id !== actId) };
      }
      return f;
    });
    setFlows(updatedFlows);
  };

  const handleRunFlow = () => {
    if (!activeFlow) return;
    const jsCode = compileNoCodeFlowToJS(activeFlow);
    const appApi = createStudioAppApi(project, setProject, {
      showToast,
      addConsoleLog,
      logEvent,
      setActiveScreenId,
      setSelectedComponentId,
    });

    const res = appApi.evalCode(jsCode);
    if (res.success) {
      showToast(`Fluxo '${activeFlow.name}' executado com sucesso no Canvas!`);
    } else {
      showToast(`Erro na execução: ${res.error}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <div className="h-11 border-b border-slate-800 bg-slate-900/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-sm">Motor de Lógica Visual (No-Code Flow Builder)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddFlow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Fluxo</span>
          </button>

          <button
            onClick={handleRunFlow}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded shadow transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Executar Fluxo</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Flow Rules Sidebar */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/50 p-3 flex flex-col gap-2 shrink-0 overflow-y-auto">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
            Fluxos de Eventos ({flows.length})
          </span>
          {flows.map((f) => (
            <div
              key={f.id}
              onClick={() => setActiveFlowId(f.id)}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition flex flex-col gap-1 ${
                f.id === activeFlowId
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-medium'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{f.name}</span>
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Evento: {f.triggerEvent} ({f.actions.length} ações)
              </span>
            </div>
          ))}
        </div>

        {/* Visual Logic Canvas */}
        {activeFlow && (
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
            {/* Event Trigger Block */}
            <div className="p-4 bg-slate-900 border border-amber-500/30 rounded-xl shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <MousePointer className="w-4 h-4" />
                <span>BLOCO DE EVENTO GATILHO</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Tipo de Evento</label>
                  <select
                    value={activeFlow.triggerEvent}
                    onChange={(e) =>
                      setFlows(
                        flows.map((f) =>
                          f.id === activeFlow.id
                            ? { ...f, triggerEvent: e.target.value as any }
                            : f
                        )
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono outline-none"
                  >
                    <option value="onClick">onClick (Clique)</option>
                    <option value="onLoad">onLoad (Carregamento)</option>
                    <option value="onChange">onChange (Alteração)</option>
                    <option value="onTimer">onTimer (Temporizador)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">ID do Componente Alvo</label>
                  <input
                    type="text"
                    value={activeFlow.targetComponentId || ''}
                    onChange={(e) =>
                      setFlows(
                        flows.map((f) =>
                          f.id === activeFlow.id ? { ...f, targetComponentId: e.target.value } : f
                        )
                      )
                    }
                    placeholder="ex: btnLogin"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-amber-400 rotate-90" />
            </div>

            {/* Actions Stack */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Ações Sequenciais do Fluxo
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={newActionType}
                    onChange={(e) => setNewActionType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none"
                  >
                    <option value="SHOW_TOAST">Mostrar Mensagem Toast</option>
                    <option value="NAVIGATE">Navegar de Tela</option>
                    <option value="SHOW_MODAL">Exibir Modal</option>
                    <option value="SET_TEXT">Alterar Texto de Componente</option>
                    <option value="SET_BACKGROUND">Alterar Cor de Fundo</option>
                    <option value="ANIMATE">Executar Animação</option>
                  </select>

                  <button
                    onClick={handleAddAction}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar Ação</span>
                  </button>
                </div>
              </div>

              {activeFlow.actions.map((act, index) => (
                <div
                  key={act.id}
                  className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-amber-300 font-mono">{act.type}</span>
                      <span className="text-[11px] text-slate-400">
                        {JSON.stringify(act.params)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAction(act.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Generated JavaScript Code Preview */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-2 font-mono text-xs text-sky-400">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Code className="w-3.5 h-3.5" />
                <span>Código JavaScript Gerado Automaticamente (Sincronizado)</span>
              </div>
              <pre className="whitespace-pre-wrap bg-slate-900 p-3 rounded text-sky-300">
                {compileNoCodeFlowToJS(activeFlow)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
