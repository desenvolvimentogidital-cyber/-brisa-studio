import React, { useState, useMemo } from 'react';
import { useEditor } from '../../context/EditorContext';
import { buildComponentTree, ComponentTreeNode } from '../../utils/hierarchy';
import { CanvasComponent } from '../../types';
import {
  Folder,
  FolderPlus,
  FolderMinus,
  Search,
  Edit2,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronsUp,
  ChevronsDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  GripVertical,
  Type,
  Square,
  Image,
  CheckSquare,
  FileText,
  MousePointer,
  Box,
  Copy,
  Trash2,
  LayoutGrid,
} from 'lucide-react';

export const LayersPanel: React.FC = () => {
  const {
    activeScreen,
    selectedComponentIds,
    selectComponent,
    toggleLockComponent,
    toggleHideComponent,
    changeComponentZIndex,
    groupSelectedComponents,
    ungroupSelectedComponents,
    updateComponentProperties,
    duplicateSelectedComponents,
    deleteSelectedComponents,
    reparentComponent,
  } = useEditor();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // Set of expanded container node IDs
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Expand containers by default
    const set = new Set<string>();
    activeScreen.components.forEach((c) => {
      if (c.type === 'container' || c.type === 'card' || c.type === 'row' || c.type === 'column') {
        set.add(c.id);
      }
    });
    return set;
  });

  // Drag state for tree drag-and-drop reparenting
  const [draggedCompId, setDraggedCompId] = useState<string | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | 'ROOT' | null>(null);

  // Build tree structure
  const treeNodes = useMemo(() => {
    return buildComponentTree(activeScreen.components);
  }, [activeScreen.components]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStartRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      updateComponentProperties(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'button':
        return <MousePointer className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
      case 'image':
        return <Image className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'container':
      case 'card':
      case 'row':
      case 'column':
      case 'grid':
        return <Square className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'input':
      case 'password':
        return <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case 'checkbox':
      case 'radio':
      case 'switch':
        return <CheckSquare className="w-3.5 h-3.5 text-teal-400 shrink-0" />;
      default:
        return <Box className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  // Drag-and-drop handlers for tree nodes
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    setDraggedCompId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string | 'ROOT') => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTargetId !== targetId) {
      setDragOverTargetId(targetId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string | 'ROOT') => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedCompId) {
      const destinationParentId = targetId === 'ROOT' ? undefined : targetId;
      if (draggedCompId !== destinationParentId) {
        reparentComponent(draggedCompId, destinationParentId);
        if (destinationParentId) {
          setExpandedIds((prev) => new Set(prev).add(destinationParentId));
        }
      }
    }

    setDraggedCompId(null);
    setDragOverTargetId(null);
  };

  // Recursive Tree Node component
  const renderTreeNode = (node: ComponentTreeNode) => {
    const { component: comp, children, depth } = node;
    const isSelected = selectedComponentIds.includes(comp.id);
    const isContainer =
      comp.type === 'container' ||
      comp.type === 'card' ||
      comp.type === 'row' ||
      comp.type === 'column' ||
      comp.type === 'grid' ||
      children.length > 0;
    const isExpanded = expandedIds.has(comp.id) || searchTerm.length > 0;
    const isDragTarget = dragOverTargetId === comp.id;

    // Filter by search term
    const matchesSearch =
      searchTerm === '' || comp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const hasMatchingDescendants = children.some(function check(c): boolean {
      return (
        c.component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.children.some(check)
      );
    });

    if (!matchesSearch && !hasMatchingDescendants) return null;

    return (
      <div key={comp.id} className="flex flex-col">
        {/* Node Bar */}
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, comp.id)}
          onDragOver={(e) => handleDragOver(e, comp.id)}
          onDrop={(e) => handleDrop(e, comp.id)}
          onDragLeave={() => setDragOverTargetId(null)}
          onClick={(e) => selectComponent(comp.id, e.shiftKey || e.metaKey)}
          onDoubleClick={(e) => handleStartRename(comp.id, comp.name, e)}
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
          className={`group py-1.5 pr-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer my-0.5 border ${
            isDragTarget
              ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500/50'
              : isSelected
              ? 'bg-blue-600/20 border-blue-500 text-white font-medium'
              : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800/80 text-slate-300'
          } ${draggedCompId === comp.id ? 'opacity-40 border-dashed border-blue-400' : ''}`}
        >
          {/* Left: Drag grip, expand arrow, icon, name */}
          <div className="flex items-center gap-1.5 truncate flex-1 pr-1">
            <GripVertical className="w-3 h-3 text-slate-600 group-hover:text-slate-400 shrink-0 cursor-grab" />

            {isContainer ? (
              <button
                onClick={(e) => toggleExpand(comp.id, e)}
                className="p-0.5 hover:bg-slate-700/60 rounded text-slate-400 hover:text-white transition shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-3.5 shrink-0" />
            )}

            {isContainer ? (
              <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              getComponentIcon(comp.type)
            )}

            {editingId === comp.id ? (
              <div
                className="flex items-center gap-1 flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(comp.id)}
                  autoFocus
                  className="bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white outline-none w-full"
                />
                <button
                  onClick={() => handleSaveRename(comp.id)}
                  className="p-1 text-emerald-400 hover:text-emerald-300"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="truncate flex-1 font-sans">{comp.name}</span>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                changeComponentZIndex(comp.id, 'up');
              }}
              title="Trazer para frente"
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <ChevronUp className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                changeComponentZIndex(comp.id, 'down');
              }}
              title="Enviar para trás"
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <ChevronDown className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => handleStartRename(comp.id, comp.name, e)}
              title="Renomear"
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <Edit2 className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLockComponent(comp.id);
              }}
              title={comp.locked ? 'Desbloquear' : 'Bloquear'}
              className={`p-1 rounded hover:bg-slate-700 ${
                comp.locked ? 'text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {comp.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleHideComponent(comp.id);
              }}
              title={comp.hidden ? 'Mostrar' : 'Ocultar'}
              className={`p-1 rounded hover:bg-slate-700 ${
                comp.hidden ? 'text-red-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {comp.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Render Children inside container if expanded */}
        {isContainer && isExpanded && children.length > 0 && (
          <div className="flex flex-col relative">
            {/* Indent Guide Line */}
            <div
              className="absolute left-0 top-0 bottom-0 border-l border-slate-800/80 pointer-events-none"
              style={{ left: `${depth * 14 + 12}px` }}
            />
            {children.map((childNode) => renderTreeNode(childNode))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-3 flex flex-col h-full overflow-hidden text-slate-200">
      {/* Top Header & Search */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
            <LayoutGrid className="w-4 h-4 text-blue-400" />
            <span>Árvore de Camadas</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={groupSelectedComponents}
              title="Criar Container com Selecionados (⌘G)"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[11px]"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Agrupar</span>
            </button>

            <button
              onClick={ungroupSelectedComponents}
              title="Desagrupar Container (⇧⌘G)"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[11px]"
            >
              <FolderMinus className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar componentes na árvore..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Root Drop Zone Indicator */}
      <div
        onDragOver={(e) => handleDragOver(e, 'ROOT')}
        onDrop={(e) => handleDrop(e, 'ROOT')}
        onDragLeave={() => setDragOverTargetId(null)}
        className={`mb-2 p-1.5 rounded-lg border border-dashed text-[11px] text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
          dragOverTargetId === 'ROOT'
            ? 'border-blue-500 bg-blue-600/20 text-blue-300 font-bold'
            : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:text-slate-400'
        }`}
      >
        <span>Tela (Raiz) — Solte aqui para retirar do Container</span>
      </div>

      {/* Component Tree View */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 pb-12 select-none">
        {treeNodes.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            Nenhum componente nesta tela.
            <br />
            Arraste elementos da biblioteca para começar!
          </div>
        ) : (
          treeNodes.map((node) => renderTreeNode(node))
        )}
      </div>
    </div>
  );
};
