import React, { useState, useMemo } from 'react';
import { useEditor } from '../../context/EditorContext';
import { MasterComponent } from '../../types';
import { SaveMasterComponentModal } from '../modals/SaveMasterComponentModal';
import {
  Sparkles,
  Search,
  Star,
  Plus,
  Copy,
  Trash2,
  FolderPlus,
  Download,
  Upload,
  Layers,
  Edit2,
  Box,
  Eye,
  Info,
  Clock,
  Maximize2,
  Check,
} from 'lucide-react';

export const MasterComponentsPanel: React.FC = () => {
  const {
    masterComponents,
    masterCategories,
    selectedComponentIds,
    instantiateMasterComponent,
    deleteMasterComponent,
    duplicateMasterComponent,
    toggleFavoriteMasterComponent,
    exportMasterComponentsJson,
    importMasterComponentsJson,
    createMasterCategory,
    updateComponentProperties,
  } = useEditor();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredMaster, setHoveredMaster] = useState<MasterComponent | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const [newCatName, setNewCatName] = useState('');
  const [showCatInput, setShowCatInput] = useState(false);

  // Filtered master components
  const filteredMasters = useMemo(() => {
    return masterComponents.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'favorites') return m.isFavorite;
      return m.category === selectedCategory;
    });
  }, [masterComponents, searchTerm, selectedCategory]);

  const handleDragStart = (e: React.DragEvent, masterId: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ isMaster: true, masterId }));
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importMasterComponentsJson(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportJson = () => {
    const jsonStr = exportMasterComponentsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biblioteca_componentes_mestre_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      createMasterCategory(newCatName.trim());
      setNewCatName('');
      setShowCatInput(false);
    }
  };

  const handleStartRename = (master: MasterComponent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(master.id);
    setEditName(master.name);
  };

  const handleSaveRename = (masterId: string) => {
    if (editName.trim()) {
      // Renames master in context state
      const master = masterComponents.find((m) => m.id === masterId);
      if (master) {
        master.name = editName.trim();
        master.updatedAt = new Date().toISOString();
      }
    }
    setEditingId(null);
  };

  return (
    <div className="p-3 flex flex-col h-full overflow-hidden text-slate-200 relative">
      {/* Top Header Controls */}
      <div className="flex flex-col gap-2.5 mb-3">
        {/* Title & Import/Export */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Componentes Mestre</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleExportJson}
              title="Exportar Biblioteca em JSON"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <label
              title="Importar Biblioteca em JSON"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>

            <button
              onClick={() => setIsSaveModalOpen(true)}
              disabled={selectedComponentIds.length === 0}
              title={
                selectedComponentIds.length > 0
                  ? 'Salvar seleção como Componente Mestre'
                  : 'Selecione um componente no Canvas para salvar'
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-sm ${
                selectedComponentIds.length > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Mestre</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar componentes mestre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Category Pills & Folder Creation */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({masterComponents.length})
          </button>

          <button
            onClick={() => setSelectedCategory('favorites')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition flex items-center gap-1 ${
              selectedCategory === 'favorites'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Favoritos</span>
          </button>

          {masterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setShowCatInput(!showCatInput)}
            title="Criar Nova Categoria"
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* New Category Input Row */}
        {showCatInput && (
          <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
            <input
              type="text"
              placeholder="Nome da categoria..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAddCategory}
              className="px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500"
            >
              Adicionar
            </button>
          </div>
        )}
      </div>

      {/* Grid List of Master Components */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pb-12">
        {filteredMasters.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
            <Box className="w-8 h-8 text-slate-600 mx-auto mb-2 stroke-[1.5]" />
            Nenhum componente mestre encontrado.
            <br />
            Selecione elementos na tela e clique em <strong className="text-blue-400">+ Mestre</strong> para criar o seu primeiro!
          </div>
        ) : (
          filteredMasters.map((master) => (
            <div
              key={master.id}
              draggable
              onDragStart={(e) => handleDragStart(e, master.id)}
              onClick={() => instantiateMasterComponent(master.id)}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoverPos({ x: rect.right + 10, y: rect.top });
                setHoveredMaster(master);
              }}
              onMouseLeave={() => setHoveredMaster(null)}
              className="group relative p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 transition duration-150 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-amber-500/10 flex flex-col gap-2"
            >
              {/* Card Header: Name, Category Badge & Favorite */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate flex-1">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Sparkles className="w-3 h-3" />
                  </div>

                  {editingId === master.id ? (
                    <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(master.id)}
                        autoFocus
                        className="bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white outline-none w-full"
                      />
                      <button
                        onClick={() => handleSaveRename(master.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold text-xs text-white truncate font-sans group-hover:text-amber-300 transition">
                      {master.name}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteMasterComponent(master.id);
                  }}
                  className={`p-1 rounded-lg transition ${
                    master.isFavorite
                      ? 'text-amber-400 fill-amber-400 hover:text-amber-300'
                      : 'text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                  }`}
                  title={master.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Visual Card Preview Box */}
              <div className="w-full h-24 rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-hidden flex items-center justify-center relative p-2 group-hover:border-slate-700 transition">
                <div
                  className="pointer-events-none transform origin-center scale-[0.6] flex items-center justify-center"
                  style={{
                    width: `${master.width}px`,
                    height: `${master.height}px`,
                  }}
                >
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-center text-xs text-slate-300 shadow-lg">
                    <span className="font-bold text-amber-400">{master.rootComponent.name}</span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {master.childrenComponents.length + 1} elemento(s)
                    </div>
                  </div>
                </div>

                {/* Drag / Click Overlay Banner */}
                <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-1 rounded-lg shadow-md">
                    + Inserir Instância
                  </span>
                </div>
              </div>

              {/* Info Badges & Action Buttons Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[10px]">
                  {master.category}
                </span>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <span className="text-[10px] text-slate-500 mr-1">
                    {master.width}x{master.height}px
                  </span>

                  <button
                    onClick={(e) => handleStartRename(master, e)}
                    title="Renomear"
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateMasterComponent(master.id);
                    }}
                    title="Duplicar Mestre"
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMasterComponent(master.id);
                    }}
                    title="Excluir Mestre"
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Hover Preview Card */}
      {hoveredMaster && (
        <div
          className="fixed z-50 w-64 bg-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md pointer-events-none text-slate-100 animate-in fade-in duration-150 space-y-3"
          style={{
            left: `${Math.min(hoverPos.x, window.innerWidth - 270)}px`,
            top: `${Math.min(hoverPos.y, window.innerHeight - 300)}px`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs text-white">{hoveredMaster.name}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              {hoveredMaster.category}
            </span>
          </div>

          {hoveredMaster.description && (
            <p className="text-xs text-slate-300 line-clamp-2">{hoveredMaster.description}</p>
          )}

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">Dimensões</span>
              <span className="font-mono text-slate-200">{hoveredMaster.width} × {hoveredMaster.height}px</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Elementos</span>
              <span className="font-semibold text-slate-200">{hoveredMaster.childrenComponents.length + 1} itens</span>
            </div>
          </div>

          {hoveredMaster.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hoveredMaster.tags.map((t) => (
                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(hoveredMaster.updatedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
            <span className="text-amber-400 font-semibold">Mestre Vinculado</span>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {isSaveModalOpen && selectedComponentIds.length > 0 && (
        <SaveMasterComponentModal
          componentId={selectedComponentIds[0]}
          onClose={() => setIsSaveModalOpen(false)}
        />
      )}
    </div>
  );
};
