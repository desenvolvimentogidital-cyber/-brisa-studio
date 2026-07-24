import React, { useRef, useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { AssetFile } from '../../types';
import { validateUpload } from '../../utils/enterpriseSecurity';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Copy,
  Plus,
  Search,
  Folder,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const STOCK_ASSETS: AssetFile[] = [
  {
    id: 'stock_1',
    name: 'Avatar Feminino UI',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    type: 'image/jpeg',
    size: '180 KB',
    createdAt: '2026-07-22',
  },
  {
    id: 'stock_2',
    name: 'Banner Moda Verão',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
    type: 'image/jpeg',
    size: '320 KB',
    createdAt: '2026-07-22',
  },
  {
    id: 'stock_3',
    name: 'Tênis Esportivo Red',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    type: 'image/jpeg',
    size: '280 KB',
    createdAt: '2026-07-22',
  },
  {
    id: 'stock_4',
    name: 'Card de Crédito Moderno',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
    type: 'image/jpeg',
    size: '210 KB',
    createdAt: '2026-07-22',
  },
  {
    id: 'stock_5',
    name: 'Abstract 3D Shape',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    type: 'image/jpeg',
    size: '410 KB',
    createdAt: '2026-07-22',
  },
];

export const AssetsPanel: React.FC = () => {
  const { project, addAsset, deleteAsset, addComponentToCanvas, updateComponentProperties, selectedComponent, showToast } =
    useEditor();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'my' | 'stock'>('my');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    (Array.from(files) as File[]).forEach((file: File) => {
      const validation = validateUpload({ name: file.name, mimeType: file.type, sizeBytes: file.size });
      if (!validation.valid) {
        showToast(`Upload blocked: ${validation.reason}`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newAsset: AssetFile = {
          id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          url: dataUrl,
          type: file.type,
          size: `${Math.round(file.size / 1024)} KB`,
          createdAt: new Date().toISOString().split('T')[0],
        };
        addAsset(newAsset);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleInsertAsset = (asset: AssetFile) => {
    if (selectedComponent && selectedComponent.type === 'image') {
      updateComponentProperties(selectedComponent.id, { imageSrc: asset.url });
      showToast(`Imagem do elemento atualizada`);
    } else {
      addComponentToCanvas('image');
      showToast(`Nova imagem adicionada ao canvas`);
    }
  };

  const displayAssets =
    activeTab === 'my'
      ? project.assets.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : STOCK_ASSETS.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-3 flex flex-col h-full overflow-hidden text-slate-200">
      {/* Top Upload Dropzone Button */}
      <div className="mb-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/60 hover:bg-slate-900/90 rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition text-slate-400 hover:text-white"
        >
          <Upload className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold">Upload de Imagem (PNG, JPG, SVG)</span>
          <span className="text-[10px] text-slate-500">Ou cole com CTRL+V no app</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-3 text-xs font-medium">
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-2 px-3 border-b-2 transition ${
            activeTab === 'my'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Meus Arquivos ({project.assets.length})
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1 ${
            activeTab === 'stock'
              ? 'border-blue-500 text-blue-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Biblioteca Stock</span>
        </button>
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pr-1 pb-12">
        {displayAssets.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-xs text-slate-500">
            Nenhuma imagem encontrada.
            <br />
            Faça upload ou escolha da biblioteca stock!
          </div>
        ) : (
          displayAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => handleInsertAsset(asset)}
              className="group relative bg-slate-800/80 border border-slate-700/60 hover:border-blue-500/60 rounded-xl overflow-hidden cursor-pointer transition shadow-sm"
            >
              <div className="h-24 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              <div className="p-2 bg-slate-900/90">
                <div className="text-[11px] font-medium text-slate-200 truncate">{asset.name}</div>
                <div className="text-[10px] text-slate-500">{asset.size}</div>
              </div>

              {/* Overlay hover action */}
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center gap-2 transition duration-150">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInsertAsset(asset);
                  }}
                  title="Inserir no canvas"
                  className="p-1.5 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-500"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                {activeTab === 'my' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAsset(asset.id);
                    }}
                    title="Excluir arquivo"
                    className="p-1.5 rounded-lg bg-red-600 text-white shadow hover:bg-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
