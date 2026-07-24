import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { X, Command, Keyboard } from 'lucide-react';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, setIsShortcutsModalOpen } = useEditor();

  if (!isShortcutsModalOpen) return null;

  const shortcuts = [
    { key: '⌘ + C', desc: 'Copiar elemento selecionado' },
    { key: '⌘ + V', desc: 'Colar elemento no canvas' },
    { key: '⌘ + X', desc: 'Recortar elemento' },
    { key: '⌘ + D', desc: 'Duplicar elemento' },
    { key: '⌘ + Z', desc: 'Desfazer (Undo)' },
    { key: '⌘ + Y / ⌘ + Shift + Z', desc: 'Refazer (Redo)' },
    { key: '⌘ + A', desc: 'Selecionar todos os componentes' },
    { key: '⌘ + G', desc: 'Agrupar componentes selecionados' },
    { key: '⌘ + K', desc: 'Abrir Busca Rápida / Command Palette' },
    { key: 'Seta Cima / Baixo / Esq / Dir', desc: 'Mover elemento selecionado (1px)' },
    { key: 'Shift + Setas', desc: 'Mover elemento rapidamente (10px)' },
    { key: 'Delete / Backspace', desc: 'Excluir elemento selecionado' },
    { key: 'Esc', desc: 'Desfazer seleção atual' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-5 text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm text-white">Atalhos de Teclado do Studio</h3>
          </div>
          <button
            onClick={() => setIsShortcutsModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
            >
              <span className="text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-blue-400 font-mono rounded font-semibold text-[11px]">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
