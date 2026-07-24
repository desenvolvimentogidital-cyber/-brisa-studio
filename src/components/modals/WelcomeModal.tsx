import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { TEMPLATE_PROJECTS } from '../../constants/templates';
import {
  Sparkles,
  FolderPlus,
  FileUp,
  Layout,
  Clock,
  Component,
  Zap,
  ChevronRight,
  X,
  Smartphone,
  Tablet,
  CheckCircle2,
  ArrowRight,
  Layers,
  Star,
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const {
    project,
    loadTemplate,
    masterComponents,
    instantiateMasterComponent,
    importProjectJson,
    createNewProject,
  } = useEditor();

  const [activeTab, setActiveTab] = useState<'home' | 'templates' | 'masters' | 'updates'>('home');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importProjectJson(content);
          onClose();
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[680px] flex flex-col overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Bem-vindo ao MobileUI Studio
              </h2>
              <p className="text-xs text-slate-400">
                Plataforma profissional de prototipagem e design visual mobile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-60 border-r border-slate-800 bg-slate-900/50 p-4 space-y-1.5 flex flex-col justify-between">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('home')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'home'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Zap className="w-4 h-4" />
                Início & Ações
              </button>

              <button
                onClick={() => setActiveTab('templates')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'templates'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Layout className="w-4 h-4" />
                Modelos Prontos
              </button>

              <button
                onClick={() => setActiveTab('masters')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'masters'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Component className="w-4 h-4" />
                Componentes Mestres
              </button>

              <button
                onClick={() => setActiveTab('updates')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'updates'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Clock className="w-4 h-4" />
                Últimas Atualizações
              </button>
            </div>

            {/* Current Project Info Badge */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Projeto Ativo
              </span>
              <p className="text-xs font-semibold text-slate-200 truncate">{project.name}</p>
              <p className="text-[11px] text-slate-400">{project.screens.length} tela(s)</p>
            </div>
          </div>

          {/* Main Tab View Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950/40">
            {activeTab === 'home' && (
              <div className="space-y-6">
                {/* Create New Project Grid */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Criar Novo Projeto
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        createNewProject('Novo App Mobile', 'iphone');
                        onClose();
                      }}
                      className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between h-32"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <FolderPlus className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">App iOS / Mobile</h4>
                        <p className="text-xs text-slate-400">393 × 852px • iPhone Pro</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        createNewProject('Novo App Tablet', 'tablet');
                        onClose();
                      }}
                      className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between h-32"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                          <Tablet className="w-5 h-5" />
                        </div>
                        <FolderPlus className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">App Tablet</h4>
                        <p className="text-xs text-slate-400">820 × 1180px • iPad Air</p>
                      </div>
                    </button>

                    <label className="group p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between h-32 cursor-pointer">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                          <FileUp className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">Abrir Arquivo JSON</h4>
                        <p className="text-xs text-slate-400">Importar projeto existente</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Projetos Recentes */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Projetos Recentes na Sessão
                  </h3>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-800 text-blue-400">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100">{project.name}</h4>
                        <p className="text-xs text-slate-400">
                          {project.screens.length} tela(s) • Atualizado recentemente
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                    >
                      Continuar Editando
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Popular Templates Quick Row */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Modelos de Destaque
                    </h3>
                    <button
                      onClick={() => setActiveTab('templates')}
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Ver todos ({TEMPLATE_PROJECTS.length})
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATE_PROJECTS.slice(0, 2).map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => {
                          loadTemplate(tpl.id);
                          onClose();
                        }}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                            📱
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                              {tpl.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {tpl.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Galeria de Modelos Prontos</h3>
                    <p className="text-xs text-slate-400">
                      Escolha um modelo inicial completo para acelerar seu desenvolvimento
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {TEMPLATE_PROJECTS.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                            {tpl.category}
                          </span>
                          <span className="text-xs text-slate-400">
                            {tpl.project.screens.length} tela(s)
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-200 group-hover:text-blue-400 transition-colors">
                          {tpl.name}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          loadTemplate(tpl.id);
                          onClose();
                        }}
                        className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        Usar Este Modelo
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'masters' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">
                      Biblioteca de Componentes Mestres
                    </h3>
                    <p className="text-xs text-slate-400">
                      Reutilize e instancie elementos com sincronização automática
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {masterComponents.map((master) => (
                    <div
                      key={master.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Component className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-slate-200">{master.name}</h4>
                          {master.isFavorite && (
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {master.description || `${master.itemCount} elemento(s)`}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          instantiateMasterComponent(master.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-medium transition-colors"
                      >
                        Inserir
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'updates' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Últimas Atualizações do Editor</h3>
                  <p className="text-xs text-slate-400">
                    Recursos mais recentes implementados nesta versão
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        v2.4 - Sistema de Componentes Mestres & Isolamento
                      </span>
                      <span className="text-[11px] text-slate-500">Recente</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Crie componentes reaproveitáveis estilo Figma/FlutterFlow com
                      sincronização inteligente de instâncias e navegação breadcrumb em Modo de Isolamento duplo-clique.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        v2.3 - Guias Inteligentes & Alinhamento
                      </span>
                      <span className="text-[11px] text-slate-500">Atualizado</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Guias magnéticas automáticas em roxo durante o arrasto de elementos no canvas, com encaixe preciso em bordas e centros de outros componentes.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        v2.2 - Gerador de Código React & Flutter
                      </span>
                      <span className="text-[11px] text-slate-500">Estável</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Exportação direta com 1-clique do projeto visual para código limpo em React (Tailwind) ou Flutter (Dart Widgets).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
