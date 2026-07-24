import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import {
  Smartphone,
  Plus,
  Copy,
  Trash2,
  CheckCircle,
  Edit2,
  Check,
  Star,
  ArrowRight,
} from 'lucide-react';

export const ScreensPanel: React.FC = () => {
  const {
    project,
    activeScreen,
    setActiveScreenId,
    addScreen,
    duplicateScreen,
    renameScreen,
    deleteScreen,
    setInitialScreen,
    showToast,
  } = useEditor();

  const [editingScreenId, setEditingScreenId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingScreenId(id);
    setEditName(name);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      renameScreen(id, editName.trim());
    }
    setEditingScreenId(null);
  };

  return (
    <div className="p-3 flex flex-col h-full overflow-hidden text-slate-200">
      {/* Header Add Button */}
      <div className="mb-3">
        <button
          onClick={() => addScreen(`Tela ${project.screens.length + 1}`)}
          className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tela do App</span>
        </button>
      </div>

      {/* Screen List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-12">
        {project.screens.map((scr) => {
          const isActive = scr.id === activeScreen.id;
          const interactiveComponentsCount = scr.components.filter(
            (c) => c.interaction && c.interaction.onClickAction !== 'none'
          ).length;

          return (
            <div
              key={scr.id}
              onClick={() => setActiveScreenId(scr.id)}
              className={`group p-3 rounded-xl border transition cursor-pointer relative ${
                isActive
                  ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                {/* Title */}
                {editingScreenId === scr.id ? (
                  <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(scr.id)}
                      autoFocus
                      className="bg-slate-950 border border-blue-500 rounded px-2 py-0.5 text-xs text-white outline-none w-full"
                    />
                    <button
                      onClick={() => handleSaveRename(scr.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-100 truncate">
                    <Smartphone className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="truncate">{scr.name}</span>
                  </div>
                )}

                {/* Initial Badge */}
                {scr.isInitialScreen && (
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>Inicial</span>
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between mt-2">
                <span>{scr.components.length} componente(s)</span>
                {interactiveComponentsCount > 0 && (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    <span>{interactiveComponentsCount} link(s)</span>
                  </span>
                )}
              </div>

              {/* Quick Actions Hover Bar */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 mt-2 pt-2 border-t border-slate-700/50 transition">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInitialScreen(scr.id);
                  }}
                  title="Definir como Tela Inicial de abertura"
                  className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[10px] text-slate-200 transition"
                >
                  Tornar Inicial
                </button>

                <button
                  onClick={(e) => handleStartEdit(scr.id, scr.name, e)}
                  title="Renomear tela"
                  className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                >
                  <Edit2 className="w-3 h-3" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateScreen(scr.id);
                  }}
                  title="Duplicar tela completa"
                  className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                >
                  <Copy className="w-3 h-3" />
                </button>

                {project.screens.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScreen(scr.id);
                    }}
                    title="Excluir tela"
                    className="p-1 rounded bg-red-600/30 hover:bg-red-600 text-red-300 transition ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
