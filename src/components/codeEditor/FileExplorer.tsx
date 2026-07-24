import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { buildVirtualFileSystem, VirtualFile } from '../../utils/projectFileSystem';
import {
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  FileJson,
  Plus,
  Search,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  FilePlus,
  MoreVertical,
} from 'lucide-react';

export const FileExplorer: React.FC = () => {
  const {
    project,
    customFileContents,
    selectedFileId,
    setSelectedFileId,
    createFile,
    createFolder,
    deleteFileOrFolder,
    renameFileOrFolder,
  } = useEditor();

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    'src/screens': true,
    'src/components': true,
    'src/services': true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [newItemModal, setNewItemModal] = useState<{
    isOpen: boolean;
    type: 'file' | 'folder';
    parentFolder: string;
  }>({ isOpen: false, type: 'file', parentFolder: 'src' });

  const [itemNameInput, setItemNameInput] = useState('');

  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const fileTree = buildVirtualFileSystem(project, customFileContents);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleCreateSubmit = () => {
    if (!itemNameInput.trim()) return;
    const cleanName = itemNameInput.trim();
    const fullPath = `${newItemModal.parentFolder}/${cleanName}`;

    if (newItemModal.type === 'file') {
      createFile(fullPath, `// New file: ${cleanName}\n`);
    } else {
      createFolder(fullPath);
    }

    setNewItemModal({ isOpen: false, type: 'file', parentFolder: 'src' });
    setItemNameInput('');
  };

  const handleRenameSubmit = (oldPath: string) => {
    if (renameInput.trim() && renameInput !== oldPath) {
      renameFileOrFolder(oldPath, renameInput.trim());
    }
    setRenamingPath(null);
  };

  const renderFileIcon = (file: VirtualFile) => {
    if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      return <FileCode className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    if (file.name.endsWith('.json')) {
      return <FileJson className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (file.name.endsWith('.css')) {
      return <FileText className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  const renderTreeItem = (file: VirtualFile, depth = 0) => {
    const isExpanded = expandedFolders[file.id];
    const isSelected = selectedFileId === file.id;

    if (searchQuery && !file.isFolder) {
      const match =
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.path.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return null;
    }

    if (file.isFolder) {
      return (
        <div key={file.id} className="select-none">
          <div
            className="flex items-center justify-between px-2 py-1 hover:bg-slate-800/80 rounded cursor-pointer group text-xs text-slate-300 transition"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => toggleFolder(file.id)}
          >
            <div className="flex items-center gap-1.5 truncate">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className="font-medium truncate">{file.name}</span>
            </div>

            <div className="hidden group-hover:flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNewItemModal({ isOpen: true, type: 'file', parentFolder: file.path });
                }}
                title="Novo Arquivo nesta pasta"
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
              >
                <FilePlus className="w-3 h-3 text-blue-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNewItemModal({ isOpen: true, type: 'folder', parentFolder: file.path });
                }}
                title="Nova Pasta nesta pasta"
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
              >
                <FolderPlus className="w-3 h-3 text-amber-400" />
              </button>
            </div>
          </div>

          {isExpanded && file.children && (
            <div>
              {file.children.map((child) => renderTreeItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={file.id}
        className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer group text-xs transition select-none ${
          isSelected
            ? 'bg-blue-600/20 text-blue-300 font-semibold border-l-2 border-blue-500'
            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        }`}
        style={{ paddingLeft: `${depth * 12 + 20}px` }}
        onClick={() => setSelectedFileId(file.id)}
      >
        <div className="flex items-center gap-2 truncate">
          {renderFileIcon(file)}
          {renamingPath === file.id ? (
            <input
              type="text"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              onBlur={() => handleRenameSubmit(file.id)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(file.id)}
              autoFocus
              className="bg-slate-950 border border-blue-500 rounded px-1 text-xs text-white outline-none w-28"
            />
          ) : (
            <span className="truncate">{file.name}</span>
          )}
        </div>

        <div className="hidden group-hover:flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRenamingPath(file.id);
              setRenameInput(file.path);
            }}
            title="Renomear"
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFileOrFolder(file.id);
            }}
            title="Excluir"
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-rose-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none shrink-0">
      {/* File Explorer Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-400" />
          Explorador
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setNewItemModal({ isOpen: true, type: 'file', parentFolder: 'src' })
            }
            title="Novo Arquivo na raiz 'src'"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <FilePlus className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={() =>
              setNewItemModal({ isOpen: true, type: 'folder', parentFolder: 'src' })
            }
            title="Nova Pasta na raiz 'src'"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Filter Search Input */}
      <div className="p-2 border-b border-slate-800/80">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
          <input
            type="text"
            placeholder="Pesquisar arquivos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
        {fileTree.map((item) => renderTreeItem(item, 0))}
      </div>

      {/* Create New File/Folder Modal Dialog */}
      {newItemModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-80 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {newItemModal.type === 'file' ? (
                <FilePlus className="w-4 h-4 text-blue-400" />
              ) : (
                <FolderPlus className="w-4 h-4 text-amber-400" />
              )}
              <span>
                Criar Novo {newItemModal.type === 'file' ? 'Arquivo' : 'Pasta'}
              </span>
            </h3>

            <div className="text-xs text-slate-400 font-mono bg-slate-950 p-2 rounded border border-slate-800 truncate">
              Pasta pai: {newItemModal.parentFolder}/
            </div>

            <input
              type="text"
              placeholder={
                newItemModal.type === 'file' ? 'ex: UserCard.tsx' : 'ex: hooks'
              }
              value={itemNameInput}
              onChange={(e) => setItemNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSubmit()}
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() =>
                  setNewItemModal({ isOpen: false, type: 'file', parentFolder: 'src' })
                }
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateSubmit}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-md shadow-blue-600/20"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
