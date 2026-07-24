import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { ComponentRenderer } from '../canvas/ComponentRenderer';
import {
  X,
  RotateCcw,
  Smartphone,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const PrototypeModal: React.FC = () => {
  const { mode, setMode, project, showToast } = useEditor();

  const [currentScreenId, setCurrentScreenId] = useState<string>(() => {
    const initial = project.screens.find((s) => s.isInitialScreen);
    return initial ? initial.id : project.screens[0]?.id || '';
  });

  const [screenHistoryStack, setScreenHistoryStack] = useState<string[]>([]);
  const [activeToastMsg, setActiveToastMsg] = useState<string | null>(null);

  if (mode !== 'prototype') return null;

  const currentScreen =
    project.screens.find((s) => s.id === currentScreenId) || project.screens[0];

  const handleInteractiveClick = (compInteraction: any) => {
    if (!compInteraction || compInteraction.onClickAction === 'none') return;

    if (compInteraction.onClickAction === 'navigate' && compInteraction.targetScreenId) {
      setScreenHistoryStack((prev) => [...prev, currentScreenId]);
      setCurrentScreenId(compInteraction.targetScreenId);
    } else if (compInteraction.onClickAction === 'go_back') {
      if (screenHistoryStack.length > 0) {
        const prevId = screenHistoryStack[screenHistoryStack.length - 1];
        setScreenHistoryStack((prev) => prev.slice(0, -1));
        setCurrentScreenId(prevId);
      }
    } else if (compInteraction.onClickAction === 'show_toast' && compInteraction.toastMessage) {
      setActiveToastMsg(compInteraction.toastMessage);
      setTimeout(() => setActiveToastMsg(null), 3000);
    }
  };

  const handleRestart = () => {
    const initial = project.screens.find((s) => s.isInitialScreen);
    setCurrentScreenId(initial ? initial.id : project.screens[0]?.id || '');
    setScreenHistoryStack([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex flex-col items-center justify-center p-4">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2 shadow-2xl flex items-center gap-4 text-xs z-50">
        <div className="flex items-center gap-2 font-semibold text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Modo Protótipo Interativo</span>
        </div>

        <div className="w-px h-4 bg-slate-800" />

        <div className="text-slate-400">
          Tela Atual: <span className="text-blue-400 font-bold">{currentScreen.name}</span>
        </div>

        <div className="w-px h-4 bg-slate-800" />

        {screenHistoryStack.length > 0 && (
          <button
            onClick={() => handleInteractiveClick({ onClickAction: 'go_back' })}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar Tela</span>
          </button>
        )}

        <button
          onClick={handleRestart}
          title="Reiniciar Protótipo"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setMode('editor')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition"
        >
          <X className="w-4 h-4" />
          <span>Sair do Protótipo</span>
        </button>
      </div>

      {/* Simulator Device Box */}
      <div
        className="relative bg-slate-900 border-[10px] border-slate-800 shadow-2xl rounded-[44px] overflow-hidden transition-all duration-300 shadow-blue-500/20"
        style={{
          width: `${project.device.width}px`,
          height: `${project.device.height}px`,
        }}
      >
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-40 flex items-center justify-between px-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
          <div className="w-2.5 h-2.5 rounded-full bg-blue-950/60" />
        </div>

        {/* Screen Canvas */}
        <div
          className="w-full h-full relative overflow-y-auto pt-11 pb-6 transition-all duration-300"
          style={{ backgroundColor: currentScreen.backgroundColor || '#FFFFFF' }}
        >
          {currentScreen.components.map((comp) => (
            <div
              key={comp.id}
              onClick={() => handleInteractiveClick(comp.interaction)}
              className={`absolute ${
                comp.interaction && comp.interaction.onClickAction !== 'none'
                  ? 'cursor-pointer hover:opacity-90 active:scale-98 transition'
                  : ''
              }`}
              style={{
                left: `${comp.x}px`,
                top: `${comp.y}px`,
                width: `${comp.width}px`,
                height: `${comp.height}px`,
                zIndex: comp.zIndex,
                transform: comp.rotation ? `rotate(${comp.rotation}deg)` : undefined,
              }}
            >
              <ComponentRenderer component={comp} isInteractive={true} />
            </div>
          ))}
        </div>

        {/* Toast Notification inside Simulator */}
        {activeToastMsg && (
          <div className="absolute bottom-8 left-4 right-4 bg-slate-900/95 text-white border border-slate-700/80 p-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2.5 text-xs font-medium animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{activeToastMsg}</span>
          </div>
        )}

        {/* Home Bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400 rounded-full z-40 opacity-60" />
      </div>
    </div>
  );
};
