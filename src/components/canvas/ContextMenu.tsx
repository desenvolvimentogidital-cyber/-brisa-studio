import React, { useEffect, useRef, useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { SaveMasterComponentModal } from '../modals/SaveMasterComponentModal';
import {
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Lock,
  Unlock,
  Eye,
  Folder,
  FolderPlus,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Layers,
  Sparkles,
  Focus,
  Unlink,
} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose }) => {
  const {
    selectedComponent,
    copySelectedComponents,
    cutSelectedComponents,
    pasteComponents,
    duplicateSelectedComponents,
    deleteSelectedComponents,
    groupSelectedComponents,
    ungroupSelectedComponents,
    toggleLockComponent,
    toggleHideComponent,
    changeComponentZIndex,
    enterIsolationMode,
    unlinkInstance,
  } = useEditor();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && !isSaveModalOpen) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, isSaveModalOpen]);

  return (
    <>
      <div
        ref={menuRef}
        style={{ left: `${x}px`, top: `${y}px` }}
        className="fixed z-50 w-56 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1 text-slate-200 text-xs font-medium select-none"
      >
        <button
          onClick={() => {
            copySelectedComponents();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-600 hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar</span>
          </span>
          <kbd className="text-[10px] text-slate-400 font-mono">⌘C</kbd>
        </button>

        <button
          onClick={() => {
            cutSelectedComponents();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-600 hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <Scissors className="w-3.5 h-3.5" />
            <span>Recortar</span>
          </span>
          <kbd className="text-[10px] text-slate-400 font-mono">⌘X</kbd>
        </button>

        <button
          onClick={() => {
            pasteComponents();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-600 hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <Clipboard className="w-3.5 h-3.5" />
            <span>Colar</span>
          </span>
          <kbd className="text-[10px] text-slate-400 font-mono">⌘V</kbd>
        </button>

        <button
          onClick={() => {
            duplicateSelectedComponents();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-600 hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicar</span>
          </span>
          <kbd className="text-[10px] text-slate-400 font-mono">⌘D</kbd>
        </button>

        <div className="border-t border-slate-800 my-1" />

        {selectedComponent && (
          <>
            {/* Master Component & Isolation Mode Actions */}
            <button
              onClick={() => {
                enterIsolationMode(selectedComponent.id);
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 text-blue-300 hover:bg-blue-600 hover:text-white transition font-semibold"
            >
              <Focus className="w-3.5 h-3.5 text-blue-400 group-hover:text-white" />
              <span>Entrar no Modo de Isolamento</span>
            </button>

            <button
              onClick={() => {
                setIsSaveModalOpen(true);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 text-amber-300 hover:bg-amber-600 hover:text-slate-950 transition font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Salvar como Componente Mestre</span>
            </button>

            {selectedComponent.masterComponentId && (
              <button
                onClick={() => {
                  unlinkInstance(selectedComponent.id);
                  onClose();
                }}
                className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 hover:text-white transition"
              >
                <Unlink className="w-3.5 h-3.5 text-amber-400" />
                <span>Desvincular Instância Mestre</span>
              </button>
            )}

            <div className="border-t border-slate-800 my-1" />

            <button
              onClick={() => {
                toggleLockComponent(selectedComponent.id);
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-blue-600 hover:text-white transition"
            >
              {selectedComponent.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{selectedComponent.locked ? 'Desbloquear' : 'Bloquear'}</span>
            </button>

            <button
              onClick={() => {
                toggleHideComponent(selectedComponent.id);
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-blue-600 hover:text-white transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{selectedComponent.hidden ? 'Mostrar' : 'Ocultar'}</span>
            </button>

            <button
              onClick={() => {
                groupSelectedComponents();
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-600 hover:text-white transition"
            >
              <span className="flex items-center gap-2">
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Agrupar</span>
              </span>
              <kbd className="text-[10px] text-slate-400 font-mono">⌘G</kbd>
            </button>

            <div className="border-t border-slate-800 my-1" />

            <button
              onClick={() => {
                changeComponentZIndex(selectedComponent.id, 'top');
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-600 hover:text-white transition"
            >
              <span className="flex items-center gap-2">
                <ChevronsUp className="w-3.5 h-3.5 text-blue-400 group-hover:text-white" />
                <span>Trazer para o Topo</span>
              </span>
              <kbd className="text-[10px] text-slate-400 font-mono">⇧]</kbd>
            </button>

            <button
              onClick={() => {
                changeComponentZIndex(selectedComponent.id, 'up');
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-600 hover:text-white transition"
            >
              <span className="flex items-center gap-2">
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Trazer para Frente</span>
              </span>
              <kbd className="text-[10px] text-slate-400 font-mono">]</kbd>
            </button>

            <button
              onClick={() => {
                changeComponentZIndex(selectedComponent.id, 'down');
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-600 hover:text-white transition"
            >
              <span className="flex items-center gap-2">
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Enviar para Trás</span>
              </span>
              <kbd className="text-[10px] text-slate-400 font-mono">[</kbd>
            </button>

            <button
              onClick={() => {
                changeComponentZIndex(selectedComponent.id, 'bottom');
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-600 hover:text-white transition"
            >
              <span className="flex items-center gap-2">
                <ChevronsDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Enviar para o Fundo</span>
              </span>
              <kbd className="text-[10px] text-slate-400 font-mono">⇧[</kbd>
            </button>

            <div className="border-t border-slate-800 my-1" />
          </>
        )}

        <button
          onClick={() => {
            deleteSelectedComponents();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center justify-between text-red-400 hover:bg-red-600 hover:text-white transition font-semibold"
        >
          <span className="flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir</span>
          </span>
          <kbd className="text-[10px] text-red-300 font-mono">DEL</kbd>
        </button>
      </div>

      {/* Modal render */}
      {isSaveModalOpen && selectedComponent && (
        <SaveMasterComponentModal
          componentId={selectedComponent.id}
          defaultName={selectedComponent.name}
          onClose={() => {
            setIsSaveModalOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
};
