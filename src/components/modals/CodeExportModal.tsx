import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { ExportFramework } from '../../types';
import { generateCode } from '../../utils/codeGenerators';
import { copyToClipboard } from '../../utils/storage';
import {
  X,
  Copy,
  Download,
  Check,
  Code2,
  FileCode,
  CheckCircle,
} from 'lucide-react';

export const CodeExportModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen, project, activeScreen, showToast } = useEditor();
  const [selectedFramework, setSelectedFramework] = useState<ExportFramework>('flutter');
  const [hasCopied, setHasCopied] = useState(false);

  if (!isExportModalOpen) return null;

  const codeOutput = generateCode(project, activeScreen, selectedFramework);

  const frameworks: { id: ExportFramework; label: string; tag: string }[] = [
    { id: 'flutter', label: 'Flutter (Dart)', tag: 'Dart' },
    { id: 'flutterflow', label: 'FlutterFlow', tag: 'JSON' },
    { id: 'react_native', label: 'React Native', tag: 'TSX' },
    { id: 'jetpack_compose', label: 'Jetpack Compose', tag: 'Kotlin' },
    { id: 'swiftui', label: 'SwiftUI', tag: 'Swift' },
    { id: 'html_tailwind', label: 'HTML & Tailwind', tag: 'HTML' },
    { id: 'json', label: 'JSON Schema', tag: 'JSON' },
    { id: 'xml', label: 'Android Layout XML', tag: 'XML' },
  ];

  const handleCopyCode = () => {
    copyToClipboard(codeOutput);
    setHasCopied(true);
    showToast('Código copiado para a área de transferência!');
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const extensions: Record<ExportFramework, string> = {
      flutter: 'dart',
      flutterflow: 'json',
      react_native: 'tsx',
      jetpack_compose: 'kt',
      swiftui: 'swift',
      html_tailwind: 'html',
      json: 'json',
      xml: 'xml',
    };

    const ext = extensions[selectedFramework] || 'txt';
    const fileName = `${activeScreen.name.toLowerCase().replace(/\s+/g, '_')}_screen.${ext}`;

    const element = document.createElement('a');
    const file = new Blob([codeOutput], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    element.remove();
    showToast(`Arquivo "${fileName}" baixado com sucesso!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] text-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Gerador & Exportador de Código</h3>
              <p className="text-[11px] text-slate-400">
                Código limpo, modular e reutilizável da tela "{activeScreen.name}"
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Framework Selector Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 border-b border-slate-800 overflow-x-auto no-scrollbar">
          {frameworks.map((fw) => (
            <button
              key={fw.id}
              onClick={() => setSelectedFramework(fw.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                selectedFramework === fw.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span>{fw.label}</span>
              <span className="text-[10px] opacity-70 font-mono bg-black/20 px-1.5 py-0.5 rounded">
                {fw.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Code Viewport */}
        <div className="flex-1 bg-slate-950 p-4 overflow-auto font-mono text-xs leading-relaxed text-slate-300 relative">
          <pre className="select-text whitespace-pre-wrap font-mono">{codeOutput}</pre>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Código pronto para copiar e rodar em produção!</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCode}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-2 border border-slate-700 transition"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition"
            >
              {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{hasCopied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
