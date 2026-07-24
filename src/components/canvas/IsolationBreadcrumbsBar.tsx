import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { Focus, ChevronRight, LogOut, Layers } from 'lucide-react';

export const IsolationBreadcrumbsBar: React.FC = () => {
  const { isolatedComponentId, isolationBreadcrumbs, exitIsolationMode, enterIsolationMode } = useEditor();

  if (!isolatedComponentId || isolationBreadcrumbs.length === 0) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 border border-blue-500/50 backdrop-blur-md rounded-2xl px-4 py-2 shadow-2xl flex items-center gap-3 text-xs text-white max-w-[90vw] overflow-x-auto animate-in fade-in slide-in-from-top-4 duration-200 ring-2 ring-blue-500/20">
      {/* Indicator Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold shrink-0">
        <Focus className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        <span>Modo Isolamento</span>
      </div>

      {/* Breadcrumb Path Trail */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {isolationBreadcrumbs.map((crumb, idx) => {
          const isLast = idx === isolationBreadcrumbs.length - 1;

          return (
            <React.Fragment key={crumb.id}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}

              <button
                onClick={() => {
                  if (crumb.id === 'screen_root') {
                    exitIsolationMode();
                  } else {
                    enterIsolationMode(crumb.id);
                  }
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition font-medium whitespace-nowrap ${
                  isLast
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={`Navegar para ${crumb.name}`}
              >
                {idx === 0 && <Layers className="w-3 h-3 text-slate-400 shrink-0" />}
                <span>{crumb.name}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Exit Button */}
      <div className="pl-2 border-l border-slate-700/80 shrink-0">
        <button
          onClick={exitIsolationMode}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-red-600/30 hover:border-red-500/50 border border-slate-700 text-slate-300 hover:text-red-200 transition font-medium"
          title="Sair do modo isolamento (Pressione ESC)"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair (ESC)</span>
        </button>
      </div>
    </div>
  );
};
