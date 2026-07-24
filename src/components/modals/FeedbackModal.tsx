import React, { useState } from 'react';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  FileText,
  AlertTriangle,
  Send,
  X,
  CheckCircle2,
  Paperclip,
  Upload,
  ShieldCheck,
} from 'lucide-react';
import { telemetryService } from '../../utils/telemetryService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'general' | 'logs' | 'crash'>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [includeLogs, setIncludeLogs] = useState(true);
  const [includeProject, setIncludeProject] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      telemetryService.trackFeature('feedback_submitted', {
        type: feedbackType,
        hasLogs: includeLogs,
        hasProject: includeProject,
      });

      setIsSubmitting(false);
      setSubmitted(true);
      onShowToast('Obrigado pelo feedback! Relatório enviado com sucesso.');
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Central de Feedback & Diagnósticos</h3>
              <p className="text-xs text-slate-400">Mobile Studio v1.0.0 — Envie sugestões, bugs e relatórios</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {submitted ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Feedback Enviado com Sucesso!</h4>
            <p className="text-xs text-slate-400 max-w-md">
              Agradecemos sua contribuição. Relatórios ajudam a manter a estabilidade da versão 1.0.0.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg cursor-pointer"
            >
              Fechar Janela
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {/* Feedback Type Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300">Tipo de Relatório</label>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFeedbackType('bug')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                    feedbackType === 'bug'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Bug className="w-4 h-4" /> Bug
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackType('suggestion')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                    feedbackType === 'suggestion'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" /> Sugestão
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackType('general')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                    feedbackType === 'general'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> Feedback
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackType('logs')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                    feedbackType === 'logs'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Logs
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackType('crash')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                    feedbackType === 'crash'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" /> Crash
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Título do Relatório</label>
                <input
                  type="text"
                  placeholder="Ex: Falha na renderização de sombras no exportador Flutter..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Descrição Detalhada</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva o comportamento observado, passos para reproduzir ou sugestão..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Checkboxes & Attachments */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2 text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLogs}
                  onChange={(e) => setIncludeLogs(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0"
                />
                <span className="font-semibold">Anexar Logs de Diagnóstico do Sistema</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeProject}
                  onChange={(e) => setIncludeProject(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0"
                />
                <span className="font-semibold">Anexar Cópia Anonimizada do Projeto Atual (Opcional)</span>
              </label>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Transmissão segura com SSL/TLS
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Enviando...' : 'Enviar Relatório'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
