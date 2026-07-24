// ==========================================
// Mobile Studio - Real-time Event Inspector
// ==========================================
// Debug panel showing live event execution.

import React, { useState, useEffect, useRef } from 'react';
import { eventEngine, EventExecutionResult, EventLogEntry } from '../EventEngine';
import { ComponentEventType, EVENT_LABELS } from '../ComponentEvents';
import { studioEventBus } from '../../utils/eventBus';
import { X, Trash2, Play, AlertTriangle, CheckCircle, Clock, Bug, Eye, EyeOff } from 'lucide-react';

interface InspectorEvent {
  id: string;
  timestamp: number;
  componentId: string;
  eventType: ComponentEventType;
  result: EventExecutionResult | null;
  duration: number;
}

export const EventInspector: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<InspectorEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [maxEvents, setMaxEvents] = useState(100);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = studioEventBus.subscribe('NoCodeBlockExecuted', (payload) => {
      if (isPaused) return;
      if (payload.data?.type === 'EVENT_EXECUTED') {
        const inspectorEvent: InspectorEvent = {
          id: `insp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          timestamp: Date.now(),
          componentId: payload.data.componentId || 'unknown',
          eventType: payload.data.eventType || 'onClick',
          result: payload.data,
          duration: payload.data.duration || 0,
        };
        setEvents((prev) => {
          const next = [inspectorEvent, ...prev];
          if (next.length > maxEvents) next.pop();
          return next;
        });
      }
    });

    return () => unsubscribe();
  }, [isOpen, isPaused, maxEvents]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events]);

  const clearEvents = () => setEvents([]);

  const getFilteredEvents = () => {
    if (filter === 'all') return events;
    if (filter === 'success') return events.filter((e) => e.result?.success);
    if (filter === 'error') return events.filter((e) => !e.result?.success);
    return events;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 w-96 h-80 bg-slate-900 border border-slate-700 rounded-tl-xl shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded-tl-xl border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white">Event Inspector</span>
          <span className="text-[10px] text-slate-400 font-mono">({events.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1 rounded ${isPaused ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'}`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button onClick={clearEvents} className="p-1 rounded text-slate-400 hover:text-red-400" title="Clear">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-slate-800">
        {['all', 'success', 'error'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'success' ? 'Sucesso' : 'Erro'}
          </button>
        ))}
        <select
          value={maxEvents}
          onChange={(e) => setMaxEvents(Number(e.target.value))}
          className="ml-auto bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-300 outline-none"
        >
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>
      </div>

      {/* Event List */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
        {getFilteredEvents().length === 0 && (
          <div className="text-[10px] text-slate-500 text-center py-4 italic">
            {isPaused ? 'Inspector paused' : 'No events yet. Interact with components...'}
          </div>
        )}
        {getFilteredEvents().map((evt) => (
          <div
            key={evt.id}
            className={`p-2 rounded-lg border text-[10px] ${
              evt.result?.success
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {evt.result?.success ? (
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                )}
                <span className="font-medium text-white">{EVENT_LABELS[evt.eventType] || evt.eventType}</span>
                <span className="text-slate-500 font-mono">({evt.eventType})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-2.5 h-2.5" />
                <span>{evt.duration}ms</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-slate-400">
              <span>Component: {evt.componentId}</span>
              <span>•</span>
              <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
            </div>
            {evt.result && evt.result.actionResults.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {evt.result.actionResults.map((ar, i) => (
                  <div key={i} className="flex items-center gap-1 text-[9px]">
                    {ar.success ? (
                      <CheckCircle className="w-2 h-2 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-2 h-2 text-red-400" />
                    )}
                    <span className="text-slate-500">Action {i + 1}:</span>
                    <span className={ar.success ? 'text-emerald-300' : 'text-red-300'}>
                      {ar.success ? 'OK' : ar.error || 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};