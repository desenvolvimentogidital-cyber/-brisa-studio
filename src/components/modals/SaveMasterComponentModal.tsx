import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { X, Sparkles, FolderPlus, Tag } from 'lucide-react';

interface SaveMasterComponentModalProps {
  componentId: string;
  defaultName?: string;
  onClose: () => void;
}

export const SaveMasterComponentModal: React.FC<SaveMasterComponentModalProps> = ({
  componentId,
  defaultName = 'Novo Componente Mestre',
  onClose,
}) => {
  const { masterCategories, saveAsMasterComponent, createMasterCategory } = useEditor();

  const [name, setName] = useState(defaultName);
  const [category, setCategory] = useState(masterCategories[0] || 'Geral');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      createMasterCategory(newCategoryName.trim());
      setCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    saveAsMasterComponent(componentId, name.trim(), category, description.trim(), tags);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Salvar como Componente Mestre</h3>
              <p className="text-xs text-slate-400">Crie um elemento reutilizável para sua biblioteca</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Nome do Componente</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Card de Produto, Header Principal..."
              required
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Category Select & Add */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Categoria</label>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <FolderPlus className="w-3 h-3" />
                <span>{isCreatingCategory ? 'Selecionar existente' : '+ Nova Categoria'}</span>
              </button>
            </div>

            {isCreatingCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da nova categoria..."
                  className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition"
                >
                  Criar
                </button>
              </div>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
              >
                {masterCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Descrição (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste componente..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Tags / Etiquetas (separadas por vírgula)</span>
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="ex: card, e-commerce, produto, botão"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Salvar na Biblioteca</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
