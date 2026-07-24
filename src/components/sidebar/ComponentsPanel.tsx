import React, { useState } from 'react';
import { COMPONENT_CATALOG } from '../../constants/componentTemplates';
import { useEditor } from '../../context/EditorContext';
import { ComponentType } from '../../types';
import { MasterComponentsPanel } from './MasterComponentsPanel';
import {
  Type,
  MousePointerClick,
  Image,
  Smile,
  Tag,
  Bookmark,
  User,
  Minus,
  SquareCode,
  Lock,
  CheckSquare,
  ToggleRight,
  Sliders,
  BarChart2,
  Square,
  LayoutGrid,
  Rows,
  Columns,
  PanelTop,
  PanelBottom,
  PlusCircle,
  FolderKanban,
  GalleryHorizontal,
  Map,
  Calendar,
  Video,
  Music,
  Maximize2,
  Search,
  Plus,
  Sparkles,
  Boxes,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Type,
  MousePointerClick,
  Image,
  Smile,
  Tag,
  Bookmark,
  User,
  Minus,
  SquareCode,
  Lock,
  CheckSquare,
  ToggleRight,
  Sliders,
  BarChart2,
  Square,
  LayoutGrid,
  Rows,
  Columns,
  PanelTop,
  PanelBottom,
  PlusCircle,
  FolderKanban,
  GalleryHorizontal,
  Map,
  Calendar,
  Video,
  Music,
  Maximize2,
};

export const ComponentsPanel: React.FC = () => {
  const { addComponentToCanvas } = useEditor();
  const [panelTab, setPanelTab] = useState<'elements' | 'masters'>('elements');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'basic', label: 'Básicos' },
    { id: 'input', label: 'Campos' },
    { id: 'layout', label: 'Layout' },
    { id: 'navigation', label: 'Navegação' },
    { id: 'media', label: 'Mídia' },
    { id: 'advanced', label: 'Avançados' },
  ];

  const filteredComponents = COMPONENT_CATALOG.filter((comp) => {
    const matchesSearch = comp.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || comp.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200">
      {/* Top Toggle Bar: Elements vs Master Components Library */}
      <div className="p-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1 shrink-0">
        <button
          onClick={() => setPanelTab('elements')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            panelTab === 'elements'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Elementos</span>
        </button>

        <button
          onClick={() => setPanelTab('masters')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            panelTab === 'masters'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Mestres</span>
        </button>
      </div>

      {panelTab === 'masters' ? (
        <MasterComponentsPanel />
      ) : (
        <div className="p-3 flex flex-col h-full overflow-hidden">
          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar componentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-3 no-scrollbar shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid of Components */}
          <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 pb-12 flex-1">
            {filteredComponents.map((comp) => {
              const IconComponent = ICON_MAP[comp.icon] || Square;

              return (
                <div
                  key={comp.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, comp.type)}
                  onClick={() => addComponentToCanvas(comp.type)}
                  className="group p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-blue-500/50 rounded-xl cursor-grab active:cursor-grabbing transition duration-150 flex flex-col items-center text-center gap-1.5 relative shadow-sm hover:shadow-blue-500/10"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:text-blue-300 transition">
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate w-full">
                    {comp.label}
                  </span>

                  <button
                    title="Clique para adicionar ao canvas"
                    className="opacity-0 group-hover:opacity-100 absolute top-1.5 right-1.5 p-0.5 rounded bg-blue-600 text-white transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
