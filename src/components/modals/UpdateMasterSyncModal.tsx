import React from 'react';
import { MasterComponent } from '../../types';
import { RefreshCw, CheckCircle2, Clock, XCircle, X } from 'lucide-react';

interface UpdateMasterSyncModalProps {
  master: MasterComponent;
  onConfirmSync: (mode: 'all' | 'new' | 'none') => void;
  onCancel: () => void;
}

export const UpdateMasterSyncModal: React.FC<UpdateMasterSyncModalProps> = ({
  master,
  onConfirmSync,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Atualização Inteligente de Instâncias</h3>
              <p className="text-xs text-slate-400">O Componente Mestre "{master.name}" foi alterado</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Options */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-300">
            Como você deseja aplicar as alterações feitas no componente mestre para as instâncias existentes no seu projeto?
          </p>

          <div className="space-y-2 pt-1">
            {/* Option 1: Update All Instances */}
            <button
              onClick={() => onConfirmSync('all')}
              className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/60 transition group flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition" />
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-blue-300">
                  Atualizar todas as instâncias
                </div>
                <div className="text-[11px] text-slate-400">
                  Sincroniza automaticamente a estrutura, cores e estilos em todas as telas que usam este componente.
                </div>
              </div>
            </button>

            {/* Option 2: Update New Only */}
            <button
              onClick={() => onConfirmSync('new')}
              className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-amber-600/20 border border-slate-800 hover:border-amber-500/60 transition group flex items-start gap-3"
            >
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition" />
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-amber-300">
                  Atualizar apenas novas instâncias
                </div>
                <div className="text-[11px] text-slate-400">
                  Salva as alterações na biblioteca, mas mantém intactas as instâncias já adicionadas às telas.
                </div>
              </div>
            </button>

            {/* Option 3: Do Not Update */}
            <button
              onClick={() => onConfirmSync('none')}
              className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition group flex items-start gap-3"
            >
              <XCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5 group-hover:scale-110 transition" />
              <div>
                <div className="text-xs font-semibold text-white">Não atualizar</div>
                <div className="text-[11px] text-slate-400">
                  Descarta as modificações na biblioteca de componentes para este mestre.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
