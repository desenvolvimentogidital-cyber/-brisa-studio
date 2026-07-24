// ==========================================
// Mobile Studio - Universal Events Panel
// ==========================================
// Visual editor for component events.
// Supports No-Code flows, JavaScript, and chaining.

import React, { useState, useMemo } from 'react';
import { useEditor } from '../../context/EditorContext';
import {
  ComponentEventType,
  ALL_COMPONENT_EVENTS,
  EVENT_LABELS,
  EVENT_CATEGORIES,
  ComponentEventConfig,
  EventAction,
  EventActionType,
  ComponentEvents,
  createDefaultEventConfig,
  createEventAction,
  componentSupportsEvent,
  getEventsForComponent,
} from '../../events/ComponentEvents';
import {
  Zap,
  Plus,
  Trash2,
  Copy,
  Play,
  X,
  ChevronDown,
  ChevronUp,
  Code,
  GitBranch,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Clock,
  ArrowDown,
  Layers,
  Terminal,
  FileJson,
  ExternalLink,
  Navigation,
  MessageSquare,
  Settings,
} from 'lucide-react';

interface EventsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({ isOpen, onToggle }) => {
  const { selectedComponent, updateComponentProperties } = useEditor();
  const [expandedEvent, setExpandedEvent] = useState<ComponentEventType | null>(null);
  const [editingAction, setEditingAction] = useState<string | null>(null);

  if (!selectedComponent) return null;

  const componentType = selectedComponent.type;
  const supportedEvents = getEventsForComponent(componentType);
  const componentEvents: ComponentEvents = (selectedComponent as any).events || {};

  const toggleEventExpand = (evt: ComponentEventType) => {
    setExpandedEvent(expandedEvent === evt ? null : evt);
  };

  const updateEventConfig = (eventType: ComponentEventType, config: ComponentEventConfig) => {
    const currentEvents: ComponentEvents = { ...componentEvents };
    currentEvents[eventType] = config;
    updateComponentProperties(selectedComponent.id, {
      events: currentEvents,
    } as any);
  };

  const toggleEventEnabled = (eventType: ComponentEventType) => {
    const current = componentEvents[eventType];
    if (current) {
      updateEventConfig(eventType, { ...current, enabled: !current.enabled });
    } else {
      const config = createDefaultEventConfig();
      config.enabled = true;
      updateEventConfig(eventType, config);
    }
  };

  const addAction = (eventType: ComponentEventType) => {
    const current = componentEvents[eventType] || createDefaultEventConfig();
    const action = createEventAction('no_code_flow', { label: `Ação ${current.actions.length + 1}` });
    updateEventConfig(eventType, {
      ...current,
      enabled: true,
      actions: [...current.actions, action],
    });
    setEditingAction(action.id);
  };

  const removeAction = (eventType: ComponentEventType, actionId: string) => {
    const current = componentEvents[eventType];
    if (!current) return;
    updateEventConfig(eventType, {
      ...current,
      actions: current.actions.filter((a) => a.id !== actionId),
    });
  };

  const duplicateAction = (eventType: ComponentEventType, action: EventAction) => {
    const current = componentEvents[eventType];
    if (!current) return;
    const newAction: EventAction = {
      ...action,
      id: `evt_action_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      createdAt: Date.now(),
      label: `${action.label || 'Ação'} (Cópia)`,
    };
    const idx = current.actions.findIndex((a) => a.id === action.id);
    const newActions = [...current.actions];
    newActions.splice(idx + 1, 0, newAction);
    updateEventConfig(eventType, { ...current, actions: newActions });
  };

  const toggleActionDisabled = (eventType: ComponentEventType, actionId: string) => {
    const current = componentEvents[eventType];
    if (!current) return;
    updateEventConfig(eventType, {
      ...current,
      actions: current.actions.map((a) =>
        a.id === actionId ? { ...a, disabled: !a.disabled } : a
      ),
    });
  };

  const updateAction = (eventType: ComponentEventType, actionId: string, updates: Partial<EventAction>) => {
    const current = componentEvents[eventType];
    if (!current) return;
    updateEventConfig(eventType, {
      ...current,
      actions: current.actions.map((a) =>
        a.id === actionId ? { ...a, ...updates } : a
      ),
    });
  };

  const updateDebounce = (eventType: ComponentEventType, debounceMs: number | undefined) => {
    const current = componentEvents[eventType] || createDefaultEventConfig();
    updateEventConfig(eventType, { ...current, debounceMs });
  };

  const updateThrottle = (eventType: ComponentEventType, throttleMs: number | undefined) => {
    const current = componentEvents[eventType] || createDefaultEventConfig();
    updateEventConfig(eventType, { ...current, throttleMs });
  };

  const getEventActionIcon = (type: EventActionType) => {
    switch (type) {
      case 'no_code_flow': return <GitBranch className="w-3 h-3 text-blue-400" />;
      case 'javascript': return <Code className="w-3 h-3 text-amber-400" />;
      case 'both': return <Layers className="w-3 h-3 text-purple-400" />;
      case 'navigation': return <Navigation className="w-3 h-3 text-emerald-400" />;
      case 'toast': return <MessageSquare className="w-3 h-3 text-pink-400" />;
      case 'custom': return <Settings className="w-3 h-3 text-slate-400" />;
    }
  };

  const getEnabledCount = () => {
    return supportedEvents.filter((evt) => componentEvents[evt]?.enabled).length;
  };

  return (
    <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 flex items-center justify-between font-semibold text-xs text-slate-300 bg-slate-800/40 hover:bg-slate-800 transition"
      >
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Eventos</span>
        </span>
        <div className="flex items-center gap-2">
          {getEnabledCount() > 0 && (
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {getEnabledCount()} ativo(s)
            </span>
          )}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
          {supportedEvents.length === 0 && (
            <div className="text-[10px] text-slate-500 italic text-center py-2">
              Nenhum evento disponível para este componente
            </div>
          )}

          {Object.entries(EVENT_CATEGORIES).map(([category, events]) => {
            const availableEvents = events.filter((evt) => supportedEvents.includes(evt));
            if (availableEvents.length === 0) return null;

            return (
              <div key={category}>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1 mt-2 first:mt-0">
                  {category}
                </div>
                {availableEvents.map((eventType) => {
                  const config = componentEvents[eventType] || createDefaultEventConfig();
                  const isExpanded = expandedEvent === eventType;
                  const isEnabled = config.enabled;

                  return (
                    <div
                      key={eventType}
                      className={`rounded-lg border transition-all text-xs ${
                        isEnabled
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : 'bg-slate-900/60 border-slate-800/60'
                      }`}
                    >
                      {/* Event Header */}
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleEventEnabled(eventType)}
                            className={`p-0.5 rounded transition ${
                              isEnabled ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                            }`}
                            title={isEnabled ? 'Desabilitar evento' : 'Habilitar evento'}
                          >
                            {isEnabled ? (
                              <ToggleRight className="w-3.5 h-3.5" />
                            ) : (
                              <ToggleLeft className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => toggleEventExpand(eventType)}
                            className="font-medium text-slate-300 hover:text-white transition flex items-center gap-1"
                          >
                            <span className="text-[11px]">{EVENT_LABELS[eventType]}</span>
                            <span className="text-[10px] text-slate-600 font-mono">({eventType})</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {isEnabled && config.actions.length > 0 && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-full font-mono">
                              {config.actions.length}
                            </span>
                          )}
                          <button
                            onClick={() => toggleEventExpand(eventType)}
                            className="p-0.5 text-slate-500 hover:text-white transition"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Event Config */}
                      {isExpanded && (
                        <div className="px-2 pb-2 space-y-2 border-t border-slate-800/40 pt-1.5">
                          {/* Advanced Options */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 flex-1">
                              <Clock className="w-2.5 h-2.5 text-slate-500" />
                              <input
                                type="number"
                                placeholder="Debounce ms"
                                value={config.debounceMs || ''}
                                onChange={(e) =>
                                  updateDebounce(eventType, e.target.value ? Number(e.target.value) : undefined)
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white outline-none focus:border-blue-500"
                                title="Debounce (ms)"
                              />
                            </div>
                            <div className="flex items-center gap-1 flex-1">
                              <Play className="w-2.5 h-2.5 text-slate-500" />
                              <input
                                type="number"
                                placeholder="Throttle ms"
                                value={config.throttleMs || ''}
                                onChange={(e) =>
                                  updateThrottle(eventType, e.target.value ? Number(e.target.value) : undefined)
                                }
                                className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white outline-none focus:border-blue-500"
                                title="Throttle (ms)"
                              />
                            </div>
                          </div>

                          {/* Parallel/Halt toggle */}
                          <div className="flex items-center gap-3 text-[10px]">
                            <label className="flex items-center gap-1 text-slate-400 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={config.parallel}
                                onChange={(e) => updateEventConfig(eventType, { ...config, parallel: e.target.checked })}
                                className="w-3 h-3 accent-blue-600"
                              />
                              Paralelo
                            </label>
                            <label className="flex items-center gap-1 text-slate-400 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={config.haltOnError}
                                onChange={(e) => updateEventConfig(eventType, { ...config, haltOnError: e.target.checked })}
                                className="w-3 h-3 accent-red-600"
                              />
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Parar no erro
                            </label>
                          </div>

                          {/* Actions List */}
                          {config.actions.map((action, idx) => (
                            <div
                              key={action.id}
                              className={`rounded-lg border p-2 ${
                                action.disabled
                                  ? 'bg-slate-900/30 border-slate-800/30 opacity-60'
                                  : 'bg-slate-900/50 border-slate-700/50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                  {getEventActionIcon(action.type)}
                                  <span className="text-[10px] font-medium text-slate-300 truncate max-w-[80px]">
                                    {action.label || `Ação ${idx + 1}`}
                                  </span>
                                  <span className="text-[9px] text-slate-600 font-mono">{action.type}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={() => toggleActionDisabled(eventType, action.id)}
                                    className={`p-0.5 rounded ${
                                      action.disabled
                                        ? 'text-slate-500 hover:text-slate-300'
                                        : 'text-slate-600 hover:text-slate-400'
                                    }`}
                                    title={action.disabled ? 'Habilitar ação' : 'Desabilitar ação'}
                                  >
                                    {action.disabled ? (
                                      <ToggleLeft className="w-3 h-3" />
                                    ) : (
                                      <ToggleRight className="w-3 h-3" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => duplicateAction(eventType, action)}
                                    className="p-0.5 rounded text-slate-600 hover:text-blue-400"
                                    title="Duplicar ação"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => removeAction(eventType, action.id)}
                                    className="p-0.5 rounded text-slate-600 hover:text-red-400"
                                    title="Remover ação"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                  {editingAction === action.id ? (
                                    <button
                                      onClick={() => setEditingAction(null)}
                                      className="p-0.5 rounded text-blue-400 hover:text-blue-300"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setEditingAction(action.id)}
                                      className="p-0.5 rounded text-slate-600 hover:text-blue-400"
                                      title="Editar ação"
                                    >
                                      <Settings className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Action Editor */}
                              {editingAction === action.id && (
                                <div className="space-y-1.5 mt-1 border-t border-slate-800/40 pt-1.5">
                                  {/* Action Type */}
                                  <div className="grid grid-cols-3 gap-1">
                                    {(['no_code_flow', 'javascript', 'both'] as EventActionType[]).map((type) => (
                                      <button
                                        key={type}
                                        onClick={() => updateAction(eventType, action.id, { type })}
                                        className={`p-1 rounded text-[9px] font-medium border transition ${
                                          action.type === type
                                            ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        {type === 'no_code_flow' ? 'Fluxo' : type === 'javascript' ? 'JS' : 'Ambos'}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Action Label */}
                                  <input
                                    type="text"
                                    value={action.label || ''}
                                    onChange={(e) => updateAction(eventType, action.id, { label: e.target.value })}
                                    placeholder="Nome da ação"
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-white outline-none focus:border-blue-500"
                                  />

                                  {/* No-Code Flow */}
                                  {(action.type === 'no_code_flow' || action.type === 'both') && (
                                    <div>
                                      {action.type === 'no_code_flow' ? (
                                        <input
                                          type="text"
                                          value={action.flowId || ''}
                                          onChange={(e) => updateAction(eventType, action.id, { flowId: e.target.value })}
                                          placeholder="ID do fluxo No-Code"
                                          className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white outline-none focus:border-blue-500"
                                        />
                                      ) : (
                                        <>
                                          <input
                                            type="text"
                                            value={action.chainFlowId || ''}
                                            onChange={(e) => updateAction(eventType, action.id, { chainFlowId: e.target.value })}
                                            placeholder="Fluxo No-Code (primeiro)"
                                            className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white outline-none focus:border-blue-500 mb-1"
                                          />
                                          <textarea
                                            value={action.chainJavaScript || ''}
                                            onChange={(e) => updateAction(eventType, action.id, { chainJavaScript: e.target.value })}
                                            placeholder="JavaScript (depois do fluxo)"
                                            rows={2}
                                            className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white outline-none focus:border-blue-500 resize-none"
                                          />
                                        </>
                                      )}
                                    </div>
                                  )}

                                  {/* JavaScript */}
                                  {action.type === 'javascript' && (
                                    <textarea
                                      value={action.javaScript || ''}
                                      onChange={(e) => updateAction(eventType, action.id, { javaScript: e.target.value })}
                                      placeholder="app.toast('Hello World');"
                                      rows={3}
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white outline-none focus:border-blue-500 resize-none"
                                    />
                                  )}

                                  {/* Extra action types */}
                                  <div className="flex flex-wrap gap-1">
                                    <button
                                      onClick={() => updateAction(eventType, action.id, { type: 'navigation', targetScreenId: '' })}
                                      className={`p-1 rounded text-[9px] border transition flex items-center gap-0.5 ${
                                        action.type === 'navigation'
                                          ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
                                      }`}
                                    >
                                      <Navigation className="w-2.5 h-2.5" />
                                      Navegar
                                    </button>
                                    <button
                                      onClick={() => updateAction(eventType, action.id, { type: 'toast', toastMessage: '' })}
                                      className={`p-1 rounded text-[9px] border transition flex items-center gap-0.5 ${
                                        action.type === 'toast'
                                          ? 'bg-pink-600/30 border-pink-500/50 text-pink-300'
                                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
                                      }`}
                                    >
                                      <MessageSquare className="w-2.5 h-2.5" />
                                      Toast
                                    </button>
                                  </div>

                                  {action.type === 'navigation' && (
                                    <input
                                      type="text"
                                      value={action.targetScreenId || ''}
                                      onChange={(e) => updateAction(eventType, action.id, { targetScreenId: e.target.value })}
                                      placeholder="ID da tela destino"
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white outline-none focus:border-blue-500"
                                    />
                                  )}

                                  {action.type === 'toast' && (
                                    <input
                                      type="text"
                                      value={action.toastMessage || ''}
                                      onChange={(e) => updateAction(eventType, action.id, { toastMessage: e.target.value })}
                                      placeholder="Mensagem Toast"
                                      className="w-full bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-white outline-none focus:border-blue-500"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Add Action Button */}
                          <button
                            onClick={() => addAction(eventType)}
                            className="w-full py-1.5 rounded-lg border border-dashed border-slate-700 text-[10px] text-slate-400 hover:text-white hover:border-slate-500 flex items-center justify-center gap-1 transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Adicionar Ação</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Missing Check icon from lucide - adding inline
const Check: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);