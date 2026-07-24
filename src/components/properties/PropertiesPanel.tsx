import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { IconPickerModal } from './IconPickerModal';
import { SaveMasterComponentModal } from '../modals/SaveMasterComponentModal';
import { EventsPanel } from './EventsPanel';
import {
  Sliders,
  Type,
  Palette,
  Square,
  Sparkles,
  Link,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Plus,
  Smile,
  Zap,
  ChevronsUp,
  ChevronsDown,
  Layers,
  Focus,
  Unlink,
  LayoutGrid,
  Maximize2,
  MoveHorizontal,
  MoveVertical,
  Box,
  Columns,
  Rows,
  Grid,
  WrapText,
  Anchor,
} from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const {
    selectedComponent,
    selectedComponentIds,
    updateSelectedComponents,
    changeComponentZIndex,
    activeScreen,
    setScreenBackgroundColor,
    project,
    deleteSelectedComponents,
    duplicateSelectedComponents,
    enterIsolationMode,
    unlinkInstance,
  } = useEditor();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [openSection, setOpenSection] = useState<Record<string, boolean>>({
    geometry: true,
    autolayout: true,
    constraints: true,
    typography: true,
    appearance: true,
    border: true,
    shadow: false,
    specific: true,
    interaction: true,
    events: false,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSection((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // If no component selected, show Screen Properties
  if (!selectedComponent || selectedComponentIds.length === 0) {
    return (
      <aside className="w-72 h-[calc(100vh-3.5rem)] bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto text-slate-200 shrink-0 z-20">
        <div className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-800 pb-2">
          Propriedades da Tela
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Nome da Tela</label>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white">
              {activeScreen.name}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Cor de Fundo da Tela</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={activeScreen.backgroundColor || '#FFFFFF'}
                onChange={(e) => setScreenBackgroundColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={activeScreen.backgroundColor || '#FFFFFF'}
                onChange={(e) => setScreenBackgroundColor(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            💡 Dica: Clique ou arraste qualquer elemento do menu esquerdo para a tela do celular para começar a construir!
          </div>
        </div>
      </aside>
    );
  }

  const isMulti = selectedComponentIds.length > 1;

  return (
    <aside className="w-72 h-[calc(100vh-3.5rem)] bg-slate-900 border-l border-slate-800 p-3 overflow-y-auto text-slate-200 shrink-0 z-20 space-y-3">
      {/* Top Component Title & Quick Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="font-bold text-xs text-white truncate max-w-[160px]">
          {isMulti ? `${selectedComponentIds.length} selecionados` : selectedComponent.name}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={duplicateSelectedComponents}
            title="Duplicar"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={deleteSelectedComponents}
            title="Excluir"
            className="p-1 rounded bg-red-600/30 hover:bg-red-600 text-red-300 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Master Component / Instance Status & Actions */}
      {selectedComponent.masterComponentId ? (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instância de Mestre</span>
            </span>
          </div>

          <div className="flex gap-1.5 pt-0.5">
            <button
              onClick={() => enterIsolationMode(selectedComponent.id)}
              className="flex-1 py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition"
            >
              <Focus className="w-3 h-3" />
              <span>Isolamento</span>
            </button>

            <button
              onClick={() => unlinkInstance(selectedComponent.id)}
              className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition border border-slate-700"
            >
              <Unlink className="w-3 h-3 text-amber-400" />
              <span>Desvincular</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="w-full p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Salvar como Componente Mestre</span>
        </button>
      )}

      {/* Save Modal */}
      {isSaveModalOpen && (
        <SaveMasterComponentModal
          componentId={selectedComponent.id}
          defaultName={selectedComponent.name}
          onClose={() => setIsSaveModalOpen(false)}
        />
      )}

      {/* 1. GEOMETRY & POSITION */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
        <button
          onClick={() => toggleSection('geometry')}
          className="w-full px-3 py-2 flex items-center justify-between font-semibold text-xs text-slate-300 bg-slate-800/40 hover:bg-slate-800 transition"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Geometria e Posição</span>
          </span>
          {openSection.geometry ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSection.geometry && (
          <div className="p-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 font-mono">X (px)</label>
              <input
                type="number"
                value={selectedComponent.x}
                onChange={(e) => updateSelectedComponents({ x: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-mono">Y (px)</label>
              <input
                type="number"
                value={selectedComponent.y}
                onChange={(e) => updateSelectedComponents({ y: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-mono">Largura (W)</label>
              <input
                type="number"
                value={selectedComponent.width}
                onChange={(e) => updateSelectedComponents({ width: Math.max(10, Number(e.target.value)) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-mono">Altura (H)</label>
              <input
                type="number"
                value={selectedComponent.height}
                onChange={(e) => updateSelectedComponents({ height: Math.max(10, Number(e.target.value)) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-mono">Rotação (°)</label>
              <input
                type="number"
                value={selectedComponent.rotation || 0}
                onChange={(e) => updateSelectedComponents({ rotation: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-mono">Opacidade</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={selectedComponent.opacity ?? 1}
                onChange={(e) => updateSelectedComponents({ opacity: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Layer Order (Z-Index) Controls */}
            <div className="col-span-2 pt-2 border-t border-slate-800/80">
              <label className="block text-[10px] text-slate-400 font-medium mb-1.5 flex items-center justify-between">
                <span>Ordem de Camada (Z-Index: {selectedComponent.zIndex})</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => changeComponentZIndex(selectedComponent.id, 'top')}
                  title="Trazer para o Topo (Shift+])"
                  className="p-1.5 bg-slate-900 hover:bg-blue-600 border border-slate-800 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition"
                >
                  <ChevronsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => changeComponentZIndex(selectedComponent.id, 'up')}
                  title="Trazer para Frente (])"
                  className="p-1.5 bg-slate-900 hover:bg-blue-600 border border-slate-800 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => changeComponentZIndex(selectedComponent.id, 'down')}
                  title="Enviar para Trás ([)"
                  className="p-1.5 bg-slate-900 hover:bg-blue-600 border border-slate-800 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => changeComponentZIndex(selectedComponent.id, 'bottom')}
                  title="Enviar para o Fundo (Shift+[)"
                  className="p-1.5 bg-slate-900 hover:bg-blue-600 border border-slate-800 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition"
                >
                  <ChevronsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. AUTO LAYOUT */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
        <button
          onClick={() => toggleSection('autolayout')}
          className="w-full px-3 py-2 flex items-center justify-between font-semibold text-xs text-slate-300 bg-slate-800/40 hover:bg-slate-800 transition"
        >
          <span className="flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
            <span>Auto Layout</span>
          </span>
          {openSection.autolayout ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSection.autolayout && (
          <div className="p-3 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-slate-300 font-medium">Ativar Auto Layout</label>
              <input
                type="checkbox"
                checked={selectedComponent.autoLayout ?? false}
                onChange={(e) =>
                  updateSelectedComponents({
                    autoLayout: e.target.checked,
                    layoutDirection: e.target.checked ? (selectedComponent.layoutDirection || 'vertical') : 'none',
                  })
                }
                className="w-4 h-4 rounded accent-blue-600 bg-slate-900 border-slate-800 cursor-pointer"
              />
            </div>

            {(selectedComponent.autoLayout ||
              ['container', 'card', 'row', 'column', 'grid'].includes(selectedComponent.type)) && (
              <>
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">
                    Direção do Layout
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onClick={() => updateSelectedComponents({ autoLayout: true, layoutDirection: 'horizontal' })}
                      title="Horizontal (Row)"
                      className={`p-1.5 rounded-lg border text-[10px] flex flex-col items-center gap-0.5 transition ${
                        selectedComponent.layoutDirection === 'horizontal'
                          ? 'bg-blue-600 border-blue-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>Horiz.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSelectedComponents({ autoLayout: true, layoutDirection: 'vertical' })}
                      title="Vertical (Column)"
                      className={`p-1.5 rounded-lg border text-[10px] flex flex-col items-center gap-0.5 transition ${
                        selectedComponent.layoutDirection === 'vertical' || !selectedComponent.layoutDirection
                          ? 'bg-blue-600 border-blue-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Rows className="w-3.5 h-3.5" />
                      <span>Vert.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSelectedComponents({ autoLayout: true, layoutDirection: 'grid' })}
                      title="Grade (Grid)"
                      className={`p-1.5 rounded-lg border text-[10px] flex flex-col items-center gap-0.5 transition ${
                        selectedComponent.layoutDirection === 'grid'
                          ? 'bg-blue-600 border-blue-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Grade</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSelectedComponents({ autoLayout: true, layoutDirection: 'wrap' })}
                      title="Quebra de Linha (Wrap)"
                      className={`p-1.5 rounded-lg border text-[10px] flex flex-col items-center gap-0.5 transition ${
                        selectedComponent.layoutDirection === 'wrap'
                          ? 'bg-blue-600 border-blue-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <WrapText className="w-3.5 h-3.5" />
                      <span>Wrap</span>
                    </button>
                  </div>
                </div>

                {/* Distribution */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">
                    Distribuição dos Filhos
                  </label>
                  <select
                    value={selectedComponent.layoutDistribution || 'start'}
                    onChange={(e) =>
                      updateSelectedComponents({ layoutDistribution: e.target.value as any })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="start">Início</option>
                    <option value="center">Centro</option>
                    <option value="end">Final</option>
                    <option value="space-between">Espaço Entre (Space Between)</option>
                    <option value="space-around">Espaço Ao Redor (Space Around)</option>
                    <option value="space-evenly">Espaço Uniforme (Space Evenly)</option>
                  </select>
                </div>

                {/* Alignment */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">
                    Alinhamento Transversal
                  </label>
                  <select
                    value={selectedComponent.layoutAlignment || 'start'}
                    onChange={(e) =>
                      updateSelectedComponents({ layoutAlignment: e.target.value as any })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="start">Início</option>
                    <option value="center">Centro</option>
                    <option value="end">Final</option>
                    <option value="stretch">Esticar (Stretch)</option>
                  </select>
                </div>

                {/* Gaps & Grid columns */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono">Espaçamento (Gap px)</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedComponent.itemGap ?? 8}
                      onChange={(e) =>
                        updateSelectedComponents({ itemGap: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  {selectedComponent.layoutDirection === 'grid' && (
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono">Colunas</label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={selectedComponent.gridColumns ?? 2}
                        onChange={(e) =>
                          updateSelectedComponents({ gridColumns: Math.max(1, Number(e.target.value)) })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Padding */}
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">
                    Padding Interno (px)
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    <div>
                      <span className="text-[9px] text-slate-500 block text-center">Top</span>
                      <input
                        type="number"
                        min="0"
                        value={selectedComponent.paddingTop ?? 0}
                        onChange={(e) =>
                          updateSelectedComponents({ paddingTop: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1 font-mono text-center text-white outline-none text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block text-center">Right</span>
                      <input
                        type="number"
                        min="0"
                        value={selectedComponent.paddingRight ?? 0}
                        onChange={(e) =>
                          updateSelectedComponents({ paddingRight: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1 font-mono text-center text-white outline-none text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block text-center">Bottom</span>
                      <input
                        type="number"
                        min="0"
                        value={selectedComponent.paddingBottom ?? 0}
                        onChange={(e) =>
                          updateSelectedComponents({ paddingBottom: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1 font-mono text-center text-white outline-none text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block text-center">Left</span>
                      <input
                        type="number"
                        min="0"
                        value={selectedComponent.paddingLeft ?? 0}
                        onChange={(e) =>
                          updateSelectedComponents({ paddingLeft: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1 font-mono text-center text-white outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. RESPONSIVE CONSTRAINTS */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
        <button
          onClick={() => toggleSection('constraints')}
          className="w-full px-3 py-2 flex items-center justify-between font-semibold text-xs text-slate-300 bg-slate-800/40 hover:bg-slate-800 transition"
        >
          <span className="flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restrições Responsivas</span>
          </span>
          {openSection.constraints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSection.constraints && (
          <div className="p-3 space-y-3 text-xs">
            {/* Horizontal constraint */}
            <div>
              <label className="block text-[10px] text-slate-400 font-medium mb-1">
                Restrição Horizontal
              </label>
              <select
                value={selectedComponent.constraints?.horizontal || 'left'}
                onChange={(e) =>
                  updateSelectedComponents({
                    constraints: {
                      ...(selectedComponent.constraints || { vertical: 'top' }),
                      horizontal: e.target.value as any,
                    },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white outline-none focus:border-blue-500 text-xs"
              >
                <option value="left">Fixar à Esquerda</option>
                <option value="right">Fixar à Direita</option>
                <option value="center">Centralizar Horizontalmente</option>
                <option value="stretch">Esticar Horizontalmente</option>
                <option value="scale">Escalar Proporcionalmente</option>
              </select>
            </div>

            {/* Vertical constraint */}
            <div>
              <label className="block text-[10px] text-slate-400 font-medium mb-1">
                Restrição Vertical
              </label>
              <select
                value={selectedComponent.constraints?.vertical || 'top'}
                onChange={(e) =>
                  updateSelectedComponents({
                    constraints: {
                      ...(selectedComponent.constraints || { horizontal: 'left' }),
                      vertical: e.target.value as any,
                    },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white outline-none focus:border-blue-500 text-xs"
              >
                <option value="top">Fixar ao Topo</option>
                <option value="bottom">Fixar à Base</option>
                <option value="center">Centralizar Verticalmente</option>
                <option value="stretch">Esticar Verticalmente</option>
                <option value="scale">Escalar Proporcionalmente</option>
              </select>
            </div>

            {/* Toggles: Fill Parent & Maintain Aspect Ratio */}
            <div className="space-y-2 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-300 font-medium">Preencher Container</label>
                <input
                  type="checkbox"
                  checked={selectedComponent.constraints?.fillParent ?? false}
                  onChange={(e) =>
                    updateSelectedComponents({
                      constraints: {
                        ...(selectedComponent.constraints || { horizontal: 'left', vertical: 'top' }),
                        fillParent: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded accent-emerald-600 bg-slate-900 border-slate-800 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-300 font-medium">Manter Proporção</label>
                <input
                  type="checkbox"
                  checked={selectedComponent.constraints?.maintainAspectRatio ?? false}
                  onChange={(e) =>
                    updateSelectedComponents({
                      constraints: {
                        ...(selectedComponent.constraints || { horizontal: 'left', vertical: 'top' }),
                        maintainAspectRatio: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded accent-emerald-600 bg-slate-900 border-slate-800 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. TYPOGRAPHY & TEXT (if component supports text) */}
      {selectedComponent.content !== undefined && (
        <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
          <button
            onClick={() => toggleSection('typography')}
            className="w-full px-3 py-2 flex items-center justify-between font-semibold text-xs text-slate-300 bg-slate-800/40 hover:bg-slate-800 transition"
          >
            <span className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tipografia e Conteúdo</span>
            </span>
            {openSection.typography ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openSection.typography && (
            <div className="p-3 space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">Texto do Elemento</label>
                <textarea
                  value={selectedComponent.content || ''}
                  onChange={(e) => updateSelectedComponents({ content: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Tamanho Fonte</label>
                  <input
                    type="number"
                    value={selectedComponent.fontSize || 14}
                    onChange={(e) => updateSelectedComponents({ fontSize: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Peso (Weight)</label>
                  <select
                    value={selectedComponent.fontWeight || '400'}
                    onChange={(e) => updateSelectedComponents({ fontWeight: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white outline-none focus:border-blue-500"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">SemiBold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">ExtraBold (800)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">Cor do Texto</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedComponent.color || '#000000'}
                    onChange={(e) => updateSelectedComponents({ color: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={selectedComponent.color || '#000000'}
                    onChange={(e) => updateSelectedComponents({ color: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. BACKGROUND & GRADIENT */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
        <button
          onClick={() => toggleSection('appearance')}
          className="w-full px-3 py-2 flex items-center justify-between font-semibold text-xs text-slate-300 bg-slate-800/40 hover:bg-slate-800 transition"
        >
          <span className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            <span>Fundo e Preenchimento</span>
          </span>
          {openSection.appearance ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSection.appearance && (
          <div className="p-3 space-y-3 text-xs">
            <div>
              <label className="block text-[10px] text-slate-400 font-medium mb-1">Cor Solida</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedComponent.backgroundColor || '#FFFFFF'}
                  onChange={(e) => updateSelectedComponents({ backgroundColor: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={selectedComponent.backgroundColor || '#FFFFFF'}
                  onChange={(e) => updateSelectedComponents({ backgroundColor: e.target.value })}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white outline-none"
                />
              </div>
            </div>

            {/* Gradient Switcher */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="flex items-center justify-between text-[11px] text-slate-300 font-medium cursor-pointer">
                <span>Ativar Gradiente</span>
                <input
                  type="checkbox"
                  checked={selectedComponent.gradient?.enabled || false}
                  onChange={(e) =>
                    updateSelectedComponents({
                      gradient: {
                        ...(selectedComponent.gradient || {
                          type: 'linear',
                          angle: 90,
                          startColor: '#2563EB',
                          endColor: '#7C3AED',
                        }),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="accent-blue-600 cursor-pointer"
                />
              </label>

              {selectedComponent.gradient?.enabled && (
                <div className="mt-2 space-y-2 pl-2 border-l-2 border-blue-500">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedComponent.gradient.startColor}
                      onChange={(e) =>
                        updateSelectedComponents({
                          gradient: { ...selectedComponent.gradient, startColor: e.target.value },
                        })
                      }
                      className="w-6 h-6 rounded cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400">Até</span>
                    <input
                      type="color"
                      value={selectedComponent.gradient.endColor}
                      onChange={(e) =>
                        updateSelectedComponents({
                          gradient: { ...selectedComponent.gradient, endColor: e.target.value },
                        })
                      }
                      className="w-6 h-6 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. BORDERS & CANTOS */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
        <button
          onClick={() => toggleSection('border')}
          className="w-full px-3 py-2 flex items-center justify-between font-semibold text-xs text-slate-300 bg-slate-800/40 hover:bg-slate-800 transition"
        >
          <span className="flex items-center gap-1.5">
            <Square className="w-3.5 h-3.5 text-emerald-400" />
            <span>Borda e Cantos</span>
          </span>
          {openSection.border ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSection.border && (
          <div className="p-3 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Estilo Borda</label>
                <select
                  value={selectedComponent.border?.style || 'none'}
                  onChange={(e) =>
                    updateSelectedComponents({
                      border: { ...selectedComponent.border, style: e.target.value as any },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white outline-none"
                >
                  <option value="none">Nenhuma</option>
                  <option value="solid">Sólida</option>
                  <option value="dashed">Tracejada</option>
                  <option value="dotted">Pontilhada</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium">Raio Canto (px)</label>
                <input
                  type="number"
                  value={selectedComponent.border?.radiusTopLeft || 0}
                  onChange={(e) => {
                    const r = Number(e.target.value);
                    updateSelectedComponents({
                      border: {
                        ...selectedComponent.border,
                        radiusTopLeft: r,
                        radiusTopRight: r,
                        radiusBottomRight: r,
                        radiusBottomLeft: r,
                      },
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono text-white outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. INTERACTION & NAVIGATION (PROTOTYPING) */}
      <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
        <button
          onClick={() => toggleSection('interaction')}
          className="w-full px-3 py-2 flex items-center justify-between font-semibold text-xs text-slate-300 bg-slate-800/40 hover:bg-slate-800 transition"
        >
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Ação ao Clicar (Protótipo)</span>
          </span>
          {openSection.interaction ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {openSection.interaction && (
          <div className="p-3 space-y-3 text-xs">
            <div>
              <label className="block text-[10px] text-slate-400 font-medium mb-1">Ação do Clique</label>
              <select
                value={selectedComponent.interaction?.onClickAction || 'none'}
                onChange={(e) =>
                  updateSelectedComponents({
                    interaction: {
                      ...selectedComponent.interaction,
                      onClickAction: e.target.value as any,
                    },
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-blue-500"
              >
                <option value="none">Nenhuma Ação</option>
                <option value="navigate">Navegar para Outra Tela</option>
                <option value="show_toast">Exibir Mensagem Toast</option>
                <option value="go_back">Voltar Tela Anterior</option>
              </select>
            </div>

            {selectedComponent.interaction?.onClickAction === 'navigate' && (
              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">Tela Destino</label>
                <select
                  value={selectedComponent.interaction?.targetScreenId || ''}
                  onChange={(e) =>
                    updateSelectedComponents({
                      interaction: {
                        ...selectedComponent.interaction,
                        targetScreenId: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-blue-500"
                >
                  <option value="">Selecione a tela...</option>
                  {project.screens.map((scr) => (
                    <option key={scr.id} value={scr.id}>
                      {scr.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedComponent.interaction?.onClickAction === 'show_toast' && (
              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">Texto do Mensagem</label>
                <input
                  type="text"
                  value={selectedComponent.interaction?.toastMessage || ''}
                  onChange={(e) =>
                    updateSelectedComponents({
                      interaction: {
                        ...selectedComponent.interaction,
                        toastMessage: e.target.value,
                      },
                    })
                  }
                  placeholder="Ex: Item adicionado com sucesso!"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white outline-none"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. UNIVERSAL EVENTS SYSTEM */}
      <EventsPanel
        isOpen={openSection.events}
        onToggle={() => toggleSection('events')}
      />

      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelectIcon={(iconName) => updateSelectedComponents({ iconName })}
      />
    </aside>
  );
};
