import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { FileExplorer } from './FileExplorer';
import { MonacoCodeEditor } from './MonacoCodeEditor';
import { DebugConsolePanel } from './DebugConsolePanel';
import { CanvasContainer } from '../canvas/CanvasContainer';
import { buildVirtualFileSystem } from '../../utils/projectFileSystem';
import { FileCode, FileJson, FileText, X, ChevronRight, Search, Replace } from 'lucide-react';

export const CodeWorkspace: React.FC = () => {
  const {
    project,
    customFileContents,
    selectedFileId,
    setSelectedFileId,
    updateFileContent,
    devMode,
  } = useEditor();

  const [openTabs, setOpenTabs] = useState<string[]>(['src/app.js', 'src/events/handlers.js']);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');

  const fileTree = buildVirtualFileSystem(project, customFileContents);

  // Keep openTabs synced with selectedFileId
  React.useEffect(() => {
    if (selectedFileId && !openTabs.includes(selectedFileId)) {
      setOpenTabs((prev) => [...prev, selectedFileId]);
    }
  }, [selectedFileId, openTabs]);

  const closeTab = (e: React.MouseEvent, tabPath: string) => {
    e.stopPropagation();
    const nextTabs = openTabs.filter((t) => t !== tabPath);
    setOpenTabs(nextTabs);
    if (selectedFileId === tabPath && nextTabs.length > 0) {
      setSelectedFileId(nextTabs[nextTabs.length - 1]);
    }
  };

  // Helper to find virtual file by path recursively
  const findFileByPath = (path: string): any => {
    let result: any = null;
    const search = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.path === path || node.id === path) {
          result = node;
          return;
        }
        if (node.children) {
          search(node.children);
        }
      }
    };
    search(fileTree);
    return result;
  };

  const activeFile = findFileByPath(selectedFileId) || {
    path: selectedFileId || 'project.json',
    language: selectedFileId?.endsWith('.json') ? 'json' : 'typescript',
    content: selectedFileId === 'project.json' ? JSON.stringify(project, null, 2) : '',
  };

  const fileContent =
    customFileContents[activeFile.path] !== undefined
      ? customFileContents[activeFile.path]
      : activeFile.content || '';

  const handleSearchReplace = () => {
    if (!searchQuery) return;
    const regex = new RegExp(searchQuery, 'g');
    const updated = fileContent.replace(regex, replaceQuery);
    updateFileContent(activeFile.path, updated);
  };

  const pathBreadcrumbs = (activeFile.path || 'project.json').split('/');

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-slate-950">
      {/* Top Main Workspace Split: File Explorer + Monaco Code Editor + Canvas Preview */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* File Explorer Sidebar */}
        <FileExplorer />

        {/* Code Workspace Column */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-slate-800 overflow-hidden">
          {/* File Tabs Bar */}
          <div className="h-9 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between px-2 overflow-x-auto select-none shrink-0 custom-scrollbar">
            <div className="flex items-center gap-1">
              {openTabs.map((tabPath) => {
                const isActive = selectedFileId === tabPath;
                const fileName = tabPath.split('/').pop() || tabPath;
                return (
                  <div
                    key={tabPath}
                    onClick={() => setSelectedFileId(tabPath)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-mono cursor-pointer transition border-t border-x ${
                      isActive
                        ? 'bg-slate-900 border-slate-700 text-blue-400 font-bold'
                        : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    {fileName.endsWith('.json') ? (
                      <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    )}
                    <span>{fileName}</span>
                    <button
                      onClick={(e) => closeTab(e, tabPath)}
                      className="p-0.5 rounded hover:bg-slate-800 hover:text-rose-400 text-slate-500 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pr-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                title="Localizar e Substituir (Ctrl+F)"
                className={`p-1.5 rounded text-xs transition ${
                  isSearchOpen ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Breadcrumb Path Bar */}
          <div className="h-6 bg-slate-900/60 border-b border-slate-800/60 px-3 flex items-center gap-1 text-[11px] font-mono text-slate-400 select-none shrink-0">
            <span className="text-slate-500">projeto</span>
            {pathBreadcrumbs.map((part, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                <span className={idx === pathBreadcrumbs.length - 1 ? 'text-blue-400 font-semibold' : ''}>
                  {part}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Search & Replace Panel */}
          {isSearchOpen && (
            <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-300 select-none shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded px-2 py-1">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Localizar no arquivo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-white w-36 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded px-2 py-1">
                <Replace className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Substituir por..."
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  className="bg-transparent outline-none text-white w-36 font-mono text-xs"
                />
              </div>

              <button
                onClick={handleSearchReplace}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-xs transition"
              >
                Substituir
              </button>
            </div>
          )}

          {/* Monaco Code Editor */}
          <MonacoCodeEditor
            filePath={activeFile.path}
            language={activeFile.language}
            content={fileContent}
            onChange={(newVal) => updateFileContent(activeFile.path, newVal)}
          />
        </div>

        {/* Visual Canvas Panel (Live Sync Preview) */}
        <div
          className={`h-full border-l border-slate-800 flex flex-col min-h-0 ${
            devMode === 'hybrid' ? 'w-1/2' : 'w-96'
          }`}
        >
          <div className="h-8 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 select-none">
            <span>Visual Canvas & Live Sync</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
              Sincronizado
            </span>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <CanvasContainer />
          </div>
        </div>
      </div>

      {/* Bottom Console & Debug Panel */}
      <DebugConsolePanel />
    </div>
  );
};

