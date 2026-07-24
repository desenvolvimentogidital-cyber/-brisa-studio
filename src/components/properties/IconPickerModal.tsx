import React, { useState } from 'react';
import { POPULAR_ICONS } from '../../constants/componentTemplates';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredIcons = POPULAR_ICONS.filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col max-h-[80vh] text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-sm text-white">Selecionar Ícone</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative my-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar ícones (ex: Heart, Search, User)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* Icons Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-5 gap-2 pr-1">
          {filteredIcons.map((iconName) => {
            const IconComp = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;

            return (
              <button
                key={iconName}
                onClick={() => {
                  onSelectIcon(iconName);
                  onClose();
                }}
                className="p-3 bg-slate-800/80 hover:bg-blue-600/30 hover:border-blue-500 border border-slate-700/60 rounded-xl flex flex-col items-center justify-center gap-1.5 transition group"
              >
                <IconComp className="w-5 h-5 text-slate-300 group-hover:text-blue-400 group-hover:scale-110 transition" />
                <span className="text-[9px] text-slate-400 truncate w-full text-center">{iconName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
