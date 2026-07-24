import React from 'react';
import { TEMPLATE_PROJECTS } from '../../constants/templates';
import { useEditor } from '../../context/EditorContext';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

export const TemplatesPanel: React.FC = () => {
  const { loadTemplateProject, resetProjectToBlank } = useEditor();

  return (
    <div className="p-3 flex flex-col h-full overflow-hidden text-slate-200">
      <div className="mb-3">
        <button
          onClick={resetProjectToBlank}
          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium text-xs text-slate-300 flex items-center justify-center gap-2 transition border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Iniciar Projeto do Zero (Blank)</span>
        </button>
      </div>

      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Templates Prontos
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-12">
        {TEMPLATE_PROJECTS.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => loadTemplateProject(tmpl.id)}
            className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/60 rounded-xl overflow-hidden cursor-pointer transition shadow-md"
          >
            <div className="h-28 w-full bg-slate-950 overflow-hidden relative">
              <img
                src={tmpl.previewUrl}
                alt={tmpl.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80 group-hover:opacity-100"
              />
              <span className="absolute top-2 left-2 bg-blue-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs">
                {tmpl.category}
              </span>
            </div>

            <div className="p-3">
              <div className="font-semibold text-xs text-white group-hover:text-blue-400 transition mb-1">
                {tmpl.name}
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed mb-3">
                {tmpl.description}
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                <span>Carregar Layout</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
