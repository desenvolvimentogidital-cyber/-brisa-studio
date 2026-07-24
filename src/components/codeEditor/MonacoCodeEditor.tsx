// ==========================================
// Monaco Code Editor - Fully Optimized
// ==========================================
// Fixes: worker loading, CDN dependency, infinite "Initializing...",
// memory leaks, orphaned models, ResizeObserver, error isolation.

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import { useEditor } from '../../context/EditorContext';
import { createStudioAppApi } from '../../utils/studioAppApi';
import { MonacoErrorBoundary } from './MonacoErrorBoundary';
import {
  Code2,
  Copy,
  AlignLeft,
  AlertCircle,
  FileCode,
  RefreshCw,
  Play,
  Bug,
} from 'lucide-react';

// Import Monaco setup to configure workers and pre-initialize
import './monacoSetup';

interface MonacoCodeEditorProps {
  filePath: string;
  language: string;
  content: string;
  onChange: (value: string) => void;
}

// Cache for editor models to avoid recreation on every render
const modelCache = new Map<string, { uri: string; language: string }>();

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  filePath,
  language,
  content,
  onChange,
}) => {
  const {
    theme,
    showToast,
    addConsoleLog,
    project,
    setProject,
    logEvent,
    setActiveScreenId,
    setSelectedComponentId,
  } = useEditor();

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const modelRef = useRef<any>(null);
  const contentRef = useRef<string>(content);
  const isUpdatingRef = useRef(false);

  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const [monacoError, setMonacoError] = useState<string | null>(null);
  const [useFallbackEditor, setUseFallbackEditor] = useState(false);
  const [initTime, setInitTime] = useState<number>(0);
  const [editorReady, setEditorReady] = useState(false);

  // Keep content ref in sync
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // FIX 1: Pre-initialize Monaco from the setup module
  // The setup module already calls loader.init() so Monaco is ready when we mount

  // FIX 2: Auto fallback with proper timeout (increased to 8s for first load)
  useEffect(() => {
    const startTime = performance.now();
    const timer = setTimeout(() => {
      if (!monacoLoaded && !monacoError) {
        const elapsed = performance.now() - startTime;
        addConsoleLog?.('warn', `Monaco Editor não carregou em ${Math.round(elapsed)}ms. Ativando editor leve.`, 'IDE');
        setUseFallbackEditor(true);
        setMonacoError('Timeout');
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
    };
  }, [monacoLoaded, monacoError, addConsoleLog]);

  // FIX 3: ResizeObserver to handle container dimension changes
  useEffect(() => {
    if (!containerRef.current || useFallbackEditor) return;

    const container = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (editorRef.current && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          try {
            editorRef.current.layout();
          } catch {
            // Ignore layout errors during resize
          }
        }
      }
    });

    observer.observe(container);
    resizeObserverRef.current = observer;

    return () => {
      observer.disconnect();
      resizeObserverRef.current = null;
    };
  }, [useFallbackEditor]);

  // FIX 4: Clean up editor model on unmount
  useEffect(() => {
    return () => {
      // Dispose editor model to prevent memory leaks
      if (modelRef.current) {
        try {
          modelRef.current.dispose();
        } catch {
          // Ignore dispose errors
        }
        modelRef.current = null;
      }
      // Dispose editor instance
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch {
          // Ignore dispose errors
        }
        editorRef.current = null;
      }
    };
  }, []);

  const handleRunJS = useCallback(() => {
    const appApi = createStudioAppApi(project, setProject, {
      showToast,
      addConsoleLog,
      logEvent,
      setActiveScreenId,
      setSelectedComponentId,
    });
    const res = appApi.evalCode(content);
    if (res.success) {
      showToast('Código JavaScript executado e sincronizado no Canvas!');
    } else {
      showToast(`Erro de execução: ${res.error}`);
    }
  }, [project, setProject, showToast, addConsoleLog, logEvent, setActiveScreenId, setSelectedComponentId, content]);

  // FIX 5: beforeMount - configure Monaco before editor creation
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    monacoRef.current = monaco;
    try {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        jsxFactory: 'React.createElement',
        reactNamespace: 'React',
      });
    } catch {
      // Ignore config errors in sandboxed environments
    }
  }, []);

  // FIX 6: onMount - proper editor initialization with dimension validation
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    const startTime = performance.now();
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Store model reference for cleanup
    modelRef.current = editor.getModel();

    // Validate container dimensions
    const container = editor.getContainerDomNode();
    if (container) {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        addConsoleLog?.('warn', 'Monaco Editor container has zero dimensions. Forcing layout...', 'IDE');
        // Force a layout after a short delay
        setTimeout(() => {
          try {
            editor.layout();
          } catch {
            // Ignore
          }
        }, 100);
      }
    }

    setMonacoLoaded(true);
    setEditorReady(true);
    setUseFallbackEditor(false);
    setMonacoError(null);

    const elapsed = performance.now() - startTime;
    setInitTime(elapsed);
    addConsoleLog?.('info', `Monaco Editor inicializado em ${Math.round(elapsed)}ms (${language})`, 'IDE');
  }, [language, addConsoleLog]);

  // FIX 7: Handle Monaco loading error
  const handleMonacoError = useCallback((error: Error) => {
    setMonacoError(error.message);
    setUseFallbackEditor(true);
    addConsoleLog?.('error', `Monaco Editor error: ${error.message}`, 'IDE');
  }, [addConsoleLog]);

  const handleFormatCode = useCallback(() => {
    if (editorRef.current && !useFallbackEditor) {
      try {
        editorRef.current.getAction('editor.action.formatDocument')?.run();
        showToast('Código formatado!');
        return;
      } catch {
        // fallback below
      }
    }

    if (language === 'json' || filePath.endsWith('.json')) {
      try {
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        onChange(formatted);
        showToast('JSON formatado com sucesso!');
      } catch {
        showToast('Erro ao formatar JSON: verifique a sintaxe.');
      }
    } else {
      showToast('Código pronto.');
    }
  }, [language, filePath, content, onChange, showToast, useFallbackEditor]);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(content);
    showToast('Código copiado para a área de transferência!');
  }, [content, showToast]);

  const toggleEditorMode = useCallback(() => {
    setUseFallbackEditor((prev) => !prev);
    if (useFallbackEditor) {
      // Switching TO Monaco - reset error state
      setMonacoError(null);
    }
  }, [useFallbackEditor]);

  // Fallback editor handlers
  const handleScrollFallback = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  }, []);

  const handleKeyDownFallback = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newContent);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  }, [content, onChange]);

  const lineCount = useMemo(() => content.split('\n').length || 1, [content]);
  const lineNumbers = useMemo(() => Array.from({ length: lineCount }, (_, i) => i + 1), [lineCount]);

  // FIX 8: Determine if Monaco should be used
  const shouldUseMonaco = !useFallbackEditor && !monacoError;

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-900 border-r border-slate-800 overflow-hidden">
      {/* Code Editor Header Toolbar */}
      <div className="h-9 bg-slate-950 border-b border-slate-800/80 px-3 flex items-center justify-between text-xs text-slate-400 select-none shrink-0">
        <div className="flex items-center gap-2 font-mono text-[11px] text-blue-400">
          <Code2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="font-semibold truncate max-w-xs">{filePath}</span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase font-mono">
            {language}
          </span>
          {initTime > 0 && (
            <span className="text-[9px] text-slate-600 font-mono">{initTime}ms</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {(language === 'javascript' || filePath.endsWith('.js') || filePath.endsWith('.ts')) && (
            <button
              onClick={handleRunJS}
              title="Executar código JavaScript e refletir no Canvas (Ctrl+Enter)"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition text-[11px] shadow-sm"
            >
              <Play className="w-3 h-3 text-white fill-current shrink-0" />
              <span>Executar JS</span>
            </button>
          )}

          <button
            onClick={toggleEditorMode}
            title={useFallbackEditor ? 'Usar Monaco Editor' : 'Usar Editor Leve'}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            <RefreshCw className="w-3 h-3 text-amber-400" />
            <span>{useFallbackEditor ? 'Modo Monaco' : 'Modo Leve'}</span>
          </button>

          <button
            onClick={handleFormatCode}
            title="Formatar Código (Alt+Shift+F)"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
          >
            <AlignLeft className="w-3 h-3 text-emerald-400" />
            <span>Formatar</span>
          </button>

          <button
            onClick={handleCopyCode}
            title="Copiar Código"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div ref={containerRef} className="flex-1 w-full min-h-0 relative overflow-hidden bg-slate-950">
        {shouldUseMonaco ? (
          <MonacoErrorBoundary onError={handleMonacoError}>
            <Editor
              height="100%"
              language={language}
              value={content}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              onChange={(val) => {
                if (!isUpdatingRef.current) {
                  onChange(val || '');
                }
              }}
              beforeMount={handleBeforeMount}
              onMount={handleEditorMount}
              loading={
                <div className="flex flex-col items-center justify-center h-full space-y-3 text-slate-400 bg-slate-950">
                  <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono">Iniciando Editor de Código...</span>
                </div>
              }
              options={{
                minimap: { enabled: true, scale: 0.75 },
                fontSize: 13,
                lineNumbers: 'on',
                roundedSelection: true,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                folding: true,
                glyphMargin: false,
                fixedOverflowWidgets: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                bracketPairColorization: { enabled: true },
                padding: { top: 8 },
              }}
            />
          </MonacoErrorBoundary>
        ) : (
          /* High Performance Fallback Code Editor with Line Numbers */
          <div className="flex h-full w-full bg-slate-950 text-slate-200 font-mono text-xs overflow-hidden">
            {/* Line Numbers Column */}
            <div
              ref={lineNumbersRef}
              className="w-12 bg-slate-900/60 border-r border-slate-800 text-slate-600 text-right pr-2.5 py-3 select-none overflow-hidden shrink-0 font-mono text-xs leading-relaxed"
            >
              {lineNumbers.map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>

            {/* Editable Code Area */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleScrollFallback}
              onKeyDown={handleKeyDownFallback}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="flex-1 h-full w-full bg-transparent p-3 text-slate-100 font-mono text-xs leading-relaxed outline-none resize-none selection:bg-blue-600/40 custom-scrollbar"
              placeholder="// Escreva seu código aqui..."
            />
          </div>
        )}
      </div>
    </div>
  );
};