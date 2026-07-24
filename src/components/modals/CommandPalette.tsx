import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { COMPONENT_CATALOG } from '../../constants/componentTemplates';
import { Search, Plus, Smartphone, Code2, Play, RotateCcw, X, Sparkles } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    addComponentToCanvas,
    project,
    setActiveScreenId,
    setMode,
    setIsExportModalOpen,
  } = useEditor();

  const [query, setQuery] = useState('');

  if (!isCommandPaletteOpen) return null;

  const filteredComponents = COMPONENT_CATALOG.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredScreens = project.screens.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-24 p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Search Bar */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Digite para adicionar componente ou trocar de tela (Ctrl+K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Studio Actions */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Ações Rápidas
            </div>
            <button
              onClick={() => {
                setIsCommandPaletteOpen(false);
                setMode('prototype');
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-slate-800 text-slate-200"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Testar Protótipo Interativo</span>
            </button>
            <button
              onClick={() => {
                setIsCommandPaletteOpen(false);
                setIsExportModalOpen(true);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-slate-800 text-slate-200"
            >
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>Exportar Código Multi-Framework</span>
            </button>
          </div>

          {/* Screens */}
          {filteredScreens.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Mudar para Tela
              </div>
              {filteredScreens.map((scr) => (
                <button
                  key={scr.id}
                  onClick={() => {
                    setActiveScreenId(scr.id);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-slate-800 text-slate-200"
                >
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>{scr.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Components */}
          {filteredComponents.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Adicionar Componente
              </div>
              {filteredComponents.map((comp) => (
                <button
                  key={comp.type}
                  onClick={() => {
                    addComponentToCanvas(comp.type);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-blue-600/20 hover:text-white text-slate-300"
                >
                  <span className="font-medium">{comp.label}</span>
                  <span className="text-[10px] text-slate-500 capitalize">{comp.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
