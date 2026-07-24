import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import {
  GitBranch,
  GitCommit as GitCommitIcon,
  GitMerge,
  GitPullRequest,
  RotateCcw,
  Plus,
  Check,
  User,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const GitIntegrationPanel: React.FC = () => {
  const {
    gitState,
    gitInit,
    gitCommit,
    gitCreateBranch,
    gitSwitchBranch,
    gitMerge,
    gitRevert,
  } = useEditor();

  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchInput, setNewBranchInput] = useState('');
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedMergeBranch, setSelectedMergeBranch] = useState('');

  const handleCommitSubmit = () => {
    if (!commitMessage.trim()) return;
    gitCommit(commitMessage);
    setCommitMessage('');
  };

  const handleCreateBranchSubmit = () => {
    if (!newBranchInput.trim()) return;
    gitCreateBranch(newBranchInput);
    setNewBranchInput('');
    setIsBranchModalOpen(false);
  };

  const handleMergeSubmit = () => {
    if (!selectedMergeBranch) return;
    gitMerge(selectedMergeBranch);
    setIsMergeModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 border-t border-slate-800 p-4 space-y-4 overflow-y-auto select-none">
      {/* Git Header Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <GitBranch className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Branch Ativa:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold">
                {gitState.currentBranch}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {gitState.commits.length} commit(s) gravado(s) no histórico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Branch Selector Dropdown */}
          <select
            value={gitState.currentBranch}
            onChange={(e) => gitSwitchBranch(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500"
          >
            {gitState.branches.map((b) => (
              <option key={b} value={b}>
                Branch: {b}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsBranchModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Nova Branch</span>
          </button>

          <button
            onClick={() => setIsMergeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20"
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>Mesclar</span>
          </button>
        </div>
      </div>

      {/* Commit Box */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <GitCommitIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>Fazer Commit de Alterações</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Mensagem do commit (ex: 'Ajuste no layout e cores do botão')..."
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCommitSubmit()}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCommitSubmit}
            disabled={!commitMessage.trim()}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs transition shadow-md shadow-blue-600/20 shrink-0"
          >
            Commit
          </button>
        </div>
      </div>

      {/* Commit History Timeline */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Histórico de Commits ({gitState.commits.length})</span>
        </h4>

        <div className="space-y-2">
          {gitState.commits.map((commit) => (
            <div
              key={commit.id}
              className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 p-3 rounded-xl flex items-start justify-between gap-3 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold border border-blue-500/30">
                    {commit.hash}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {commit.message}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    {commit.branch}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    {commit.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {commit.date}
                  </span>
                </div>
              </div>

              <button
                onClick={() => gitRevert(commit.hash)}
                title="Reverter projeto para este commit"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-600/20 hover:text-rose-300 text-slate-400 text-xs transition border border-slate-700 shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reverter</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* New Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-80 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span>Criar Nova Branch</span>
            </h3>

            <input
              type="text"
              placeholder="ex: feature/autenticacao"
              value={newBranchInput}
              onChange={(e) => setNewBranchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateBranchSubmit()}
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateBranchSubmit}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
              >
                Criar Branch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Branch Modal */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-80 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-indigo-400" />
              <span>Mesclar Branch em {gitState.currentBranch}</span>
            </h3>

            <p className="text-xs text-slate-400">
              Escolha qual branch deseja incorporar na branch atual ({gitState.currentBranch}):
            </p>

            <select
              value={selectedMergeBranch}
              onChange={(e) => setSelectedMergeBranch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
            >
              <option value="">Selecione uma branch...</option>
              {gitState.branches
                .filter((b) => b !== gitState.currentBranch)
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleMergeSubmit}
                disabled={!selectedMergeBranch}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-40"
              >
                Mesclar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
