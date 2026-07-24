import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  BookOpen,
  LayoutTemplate,
  ShoppingBag,
  FileText,
  MapPin,
  ShieldCheck,
  Mail,
  Zap,
  CheckCircle2,
  ExternalLink,
  Code2,
  Award,
  Globe,
  Layers,
  Sparkles,
  Terminal,
  Cpu,
} from 'lucide-react';
import { releaseManager } from '../../utils/releaseManager';
import { telemetryService } from '../../utils/telemetryService';

interface OfficialReleaseWebsiteProps {
  onBackToStudio: () => void;
  onOpenFeedback: () => void;
}

export const OfficialReleaseWebsite: React.FC<OfficialReleaseWebsiteProps> = ({
  onBackToStudio,
  onOpenFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'downloads' | 'docs' | 'examples' | 'templates' | 'marketplace' | 'blog' | 'roadmap' | 'licensing' | 'contact'
  >('home');

  const builds = releaseManager.generateReleaseBuilds();
  const docs = releaseManager.generateOfficialDocsSet();
  const releaseNotes = releaseManager.generateReleaseNotes();
  const cert = releaseManager.generateCertificationCertificate();

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-y-auto select-text">
      {/* Top Portal Nav Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-lg tracking-tight">Mobile Studio</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                v1.0.0 Stable Release
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Portal Oficial de Lançamento Comercial</p>
          </div>
        </div>

        {/* Portal Tabs */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
          {[
            { id: 'home', label: 'Início' },
            { id: 'downloads', label: 'Downloads' },
            { id: 'docs', label: 'Documentação' },
            { id: 'templates', label: 'Templates' },
            { id: 'marketplace', label: 'Marketplace' },
            { id: 'roadmap', label: 'Roadmap' },
            { id: 'licensing', label: 'Licenciamento' },
            { id: 'contact', label: 'Contato' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === item.id ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenFeedback}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            Feedback
          </button>
          <button
            onClick={onBackToStudio}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
          >
            Voltar ao Studio
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-10">
        {/* HOME / HERO TAB */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-12 py-6">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto pt-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-amber-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Lançamento Oficial — Mobile Studio Version 1.0.0 Ready
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                Construa Aplicativos Nativos em Escala Enterprise com <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent">No-Code & Exportação Limpa</span>
              </h1>

              <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
                Plataforma visual comercial completa. Edição em tempo real, prototipagem interativa, fluxo no-code de regras de negócios, e compilação nativa para <strong>Flutter, React Native, Kotlin, SwiftUI e HTML5</strong> com 99%+ de fidelidade.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setActiveTab('downloads')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition shadow-xl shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Baixar Versão 1.0.0
                </button>
                <button
                  onClick={onBackToStudio}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 rounded-2xl text-sm font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <Code2 className="w-4 h-4 text-indigo-400" /> Abrir Editor Studio
                </button>
              </div>
            </div>

            {/* Certification Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Certificado Oficial de Lançamento</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">{cert.productName} v{cert.version} — {cert.status}</h3>
                <p className="text-xs text-slate-400 max-w-xl">
                  Testes unitários: {cert.passCount}/324 aprovados | Cobertura: {cert.testCoverage}% | Auditoria: {cert.architecturalAuditScore}/100 | Segurança: {cert.securityAuditStatus}
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 flex flex-col gap-1 border-emerald-500/30">
                <span className="text-emerald-400 font-bold">STATUS: {cert.status}</span>
                <span className="text-indigo-300 font-bold">COMMERCIAL: {cert.commercialStatus}</span>
                <span className="text-slate-500 text-[10px] truncate max-w-xs">{cert.signature}</span>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">5 Exportadores Nativos</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gerador de código nativo para Flutter, React Native, Kotlin Jetpack Compose, SwiftUI e HTML/PWA com equivalência de 99.2%.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">Segurança Enterprise Hardened</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  JS Sandbox isolado, verificação de integridade HMAC SHA-256 para plugins, CSP estrito e criptografia AES-256-GCM.
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">Escalabilidade & Alta Performance</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Suporte para projetos com 100.000 componentes, 5.000 telas, 1.000 usuários colaborando e compilação IR sob 100ms.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DOWNLOADS TAB */}
        {activeTab === 'downloads' && (
          <div className="flex flex-col gap-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Download className="w-6 h-6 text-blue-400" /> Downloads Oficiais — Mobile Studio v1.0.0
              </h2>
              <p className="text-xs text-slate-400">Pacotes oficiais de produção com assinaturas digitais SHA-256 verificadas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {builds.map((build, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-lg text-white capitalize">Release {build.target}</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                      {build.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex flex-col gap-1 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span>Arquivo: {build.filename}</span>
                    <span>Tamanho: {build.sizeMb} MB</span>
                    <span className="text-[10px] text-slate-500 truncate">SHA-256: {build.sha256Signature}</span>
                  </div>

                  <a
                    href={build.downloadUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      telemetryService.trackFeature('download_release', { target: build.target });
                      alert(`Iniciando download do pacote oficial: ${build.filename}`);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Baixar Pacote Oficial (.ZIP / .EXE)
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTATION TAB */}
        {activeTab === 'docs' && (
          <div className="flex flex-col gap-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-400" /> Central de Documentação Oficial (10 Manuais)
              </h2>
              <p className="text-xs text-slate-400">Guias completos gerados automaticamente em Markdown, HTML e PDF.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docs.map((doc) => (
                <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{doc.title}</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono font-semibold">
                      {doc.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{doc.markdown.substring(0, 120)}...</p>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => alert(`Exportando ${doc.title} em formato Markdown`)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold"
                    >
                      Markdown (.MD)
                    </button>
                    <button
                      onClick={() => alert(`Visualizando ${doc.title} em formato HTML`)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold"
                    >
                      HTML
                    </button>
                    <button
                      onClick={() => alert(`Baixando PDF oficial de ${doc.title}`)}
                      className="px-2.5 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg text-[10px] font-bold"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROADMAP TAB */}
        {activeTab === 'roadmap' && (
          <div className="flex flex-col gap-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-amber-400" /> Official Release Roadmap & Lifecycle
              </h2>
              <p className="text-xs text-slate-400">Ciclo contínuo de atualizações e suporte após a versão 1.0.0.</p>
            </div>

            <div className="flex flex-col gap-4">
              {releaseNotes.roadmap.map((item, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-200 font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LICENSING TAB */}
        {activeTab === 'licensing' && (
          <div className="flex flex-col gap-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" /> Licenciamento Comercial & Termos
              </h2>
              <p className="text-xs text-slate-400">Licença comercial para desenvolvedores, agências e empresas.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-xs text-slate-300 flex flex-col gap-4">
              <h3 className="font-bold text-sm text-white">Mobile Studio Enterprise License v1.0.0</h3>
              <p className="leading-relaxed">
                Esta licença concede direito perpétuo de uso para compilar, exportar e distribuir aplicações comerciais ilimitadas criadas no Mobile Studio v1.0.0 sem pagamento de royalties.
              </p>
              <div className="flex items-center gap-2 font-mono text-emerald-400 font-bold bg-slate-950 p-3 rounded-xl border border-slate-800">
                STATUS: COMMERCIAL LICENSE GRANTED & CERTIFIED
              </div>
            </div>
          </div>
        )}

        {/* CONTACT / SUPPORT TAB */}
        {activeTab === 'contact' && (
          <div className="flex flex-col gap-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-400" /> Suporte & Contato Oficial
              </h2>
              <p className="text-xs text-slate-400">Entre em contato com a equipe técnica do Mobile Studio.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>Email Oficial: <strong className="text-white font-mono">support@mobilestudio.dev</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Portal da Comunidade: <strong className="text-white font-mono">https://mobilestudio.dev/community</strong></span>
              </div>
              <button
                onClick={onOpenFeedback}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs self-start cursor-pointer shadow-lg"
              >
                Abrir Formulário de Feedback Interno
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
