import React, { useState } from 'react';
import {
  Database,
  Plus,
  Table,
  Key,
  Globe,
  Trash2,
  Edit2,
  Save,
  Layers,
  Filter,
  RefreshCw,
  Zap,
  HardDrive,
  ShieldAlert,
  Search,
} from 'lucide-react';
import {
  universalDatabase,
  universalApi,
  DataCollection,
  DataField,
  DataRelation,
  QueryFilter,
} from '../../utils/dataLayer';

export const DatabaseDesigner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schema' | 'query' | 'api' | 'data'>('schema');
  const [collections, setCollections] = useState<DataCollection[]>([
    {
      name: 'users',
      fields: [
        { name: 'id', type: 'string', required: true, unique: true },
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'string', required: true, unique: true },
        { name: 'createdAt', type: 'date' },
      ],
      relations: [],
    },
    {
      name: 'products',
      fields: [
        { name: 'id', type: 'string', required: true, unique: true },
        { name: 'title', type: 'string', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'imageUrl', type: 'image' },
      ],
      relations: [],
    },
  ]);

  const [selectedCol, setSelectedCol] = useState<string>('users');
  const [newColName, setNewColName] = useState<string>('');
  const [newFieldName, setNewFieldName] = useState<string>('');
  const [newFieldType, setNewFieldType] = useState<any>('string');

  // Query state
  const [queryCollection, setQueryCollection] = useState<string>('users');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [isLoadingQuery, setIsLoadingQuery] = useState<boolean>(false);

  // API Manager state
  const [apiEndpoints, setApiEndpoints] = useState<
    { id: string; name: string; url: string; method: string }[]
  >([
    { id: 'ep_1', name: 'Get Weather Forecast', url: 'https://api.open-meteo.com/v1/forecast', method: 'GET' },
    { id: 'ep_2', name: 'Create User Account', url: 'https://api.studio.app/users', method: 'POST' },
  ]);
  const [newApiName, setNewApiName] = useState<string>('');
  const [newApiUrl, setNewApiUrl] = useState<string>('');
  const [newApiMethod, setNewApiMethod] = useState<string>('GET');

  const handleAddCollection = () => {
    if (!newColName.trim()) return;
    const name = newColName.trim().toLowerCase().replace(/\s+/g, '_');
    if (collections.some((c) => c.name === name)) return;

    const newCol: DataCollection = {
      name,
      fields: [{ name: 'id', type: 'string', required: true, unique: true }],
      relations: [],
    };

    setCollections([...collections, newCol]);
    setSelectedCol(name);
    setNewColName('');
  };

  const handleAddField = () => {
    if (!newFieldName.trim() || !selectedCol) return;
    const fName = newFieldName.trim();

    setCollections(
      collections.map((c) => {
        if (c.name === selectedCol) {
          if (c.fields.some((f) => f.name === fName)) return c;
          return {
            ...c,
            fields: [...c.fields, { name: fName, type: newFieldType }],
          };
        }
        return c;
      })
    );

    setNewFieldName('');
  };

  const handleRunQuery = async () => {
    setIsLoadingQuery(true);
    try {
      const res = await universalDatabase.query(queryCollection, {});
      setQueryResults(res);
    } catch (e) {
      setQueryResults([]);
    } finally {
      setIsLoadingQuery(false);
    }
  };

  const handleAddApiEndpoint = () => {
    if (!newApiName.trim() || !newApiUrl.trim()) return;
    const newEp = {
      id: `ep_${Date.now()}`,
      name: newApiName.trim(),
      url: newApiUrl.trim(),
      method: newApiMethod,
    };
    setApiEndpoints([...apiEndpoints, newEp]);
    setNewApiName('');
    setNewApiUrl('');
  };

  const currentCollectionObj = collections.find((c) => c.name === selectedCol);

  return (
    <div className="w-full h-full bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Header Tabs */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-slate-100 text-base">Universal Data Layer Engine</span>
          <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-semibold border border-amber-500/30">
            Fase 5 Ready
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Schema Builder
          </button>

          <button
            onClick={() => setActiveTab('query')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'query'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Query Builder
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            API Manager
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'schema' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar: Collections */}
            <div className="w-64 bg-slate-850 border-r border-slate-800 p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Coleções / Tabelas</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nova tabela..."
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleAddCollection}
                  className="bg-amber-600 hover:bg-amber-500 text-white p-1.5 rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1">
                {collections.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedCol(col.name)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                      selectedCol === col.name
                        ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table className="w-3.5 h-3.5" />
                      <span>{col.name}</span>
                    </div>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full text-slate-400">
                      {col.fields.length} campos
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Area: Schema Editor */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
              {currentCollectionObj ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Table className="w-5 h-5 text-amber-400" />
                        Tabela: <span className="text-amber-300">{currentCollectionObj.name}</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Defina a estrutura de dados e os tipos suportados para o projeto.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nome do campo..."
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="date">Date</option>
                        <option value="image">Image</option>
                        <option value="json">JSON</option>
                      </select>
                      <button
                        onClick={handleAddField}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar Campo
                      </button>
                    </div>
                  </div>

                  {/* Field Table */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                        <tr>
                          <th className="px-4 py-3">Campo</th>
                          <th className="px-4 py-3">Tipo</th>
                          <th className="px-4 py-3">Obrigatório</th>
                          <th className="px-4 py-3">Único</th>
                          <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {currentCollectionObj.fields.map((f) => (
                          <tr key={f.name} className="hover:bg-slate-900/50 transition">
                            <td className="px-4 py-3 font-mono font-semibold text-amber-200 flex items-center gap-2">
                              {f.name === 'id' && <Key className="w-3.5 h-3.5 text-amber-400" />}
                              {f.name}
                            </td>
                            <td className="px-4 py-3">
                              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono text-[11px]">
                                {f.type}
                              </span>
                            </td>
                            <td className="px-4 py-3">{f.required ? 'Sim' : 'Não'}</td>
                            <td className="px-4 py-3">{f.unique ? 'Sim' : 'Não'}</td>
                            <td className="px-4 py-3 text-right">
                              {f.name !== 'id' && (
                                <button
                                  onClick={() => {
                                    setCollections(
                                      collections.map((c) =>
                                        c.name === selectedCol
                                          ? { ...c, fields: c.fields.filter((item) => item.name !== f.name) }
                                          : c
                                      )
                                    );
                                  }}
                                  className="text-slate-500 hover:text-red-400 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                  Selecione ou crie uma coleção para editar a estrutura.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'query' && (
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-amber-400" />
                  Visual Query Builder
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Monte consultas visuais reativas para alimentar seus componentes.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={queryCollection}
                  onChange={(e) => setQueryCollection(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {collections.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleRunQuery}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuery ? 'animate-spin' : ''}`} />
                  Executar Consulta
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 min-h-[250px] flex flex-col">
              <span className="text-xs uppercase font-bold text-slate-400 mb-3">
                Resultados da Consulta ({queryResults.length} registros)
              </span>

              {queryResults.length > 0 ? (
                <pre className="flex-1 bg-slate-900 p-4 rounded-xl text-xs font-mono text-amber-300 overflow-x-auto border border-slate-800">
                  {JSON.stringify(queryResults, null, 2)}
                </pre>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-12">
                  <Search className="w-8 h-8 mb-2 opacity-40" />
                  Nenhum registro retornado ou consulta ainda não executada.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  Universal API Manager
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure REST/GraphQL endpoints de forma totalmente compatível com o Universal Runtime.
                </p>
              </div>
            </div>

            {/* Add API Form */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Adicionar Endpoint de API
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Nome ex: Get Users"
                  value={newApiName}
                  onChange={(e) => setNewApiName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <select
                  value={newApiMethod}
                  onChange={(e) => setNewApiMethod(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input
                  type="text"
                  placeholder="URL ex: https://api.example.com/data"
                  value={newApiUrl}
                  onChange={(e) => setNewApiUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 min-w-[200px]"
                />
                <button
                  onClick={handleAddApiEndpoint}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Salvar Endpoint
                </button>
              </div>
            </div>

            {/* Endpoints List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiEndpoints.map((ep) => (
                <div
                  key={ep.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-lg hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-100">{ep.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ep.method === 'GET'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {ep.method}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-2 truncate">{ep.url}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-3">
                    <button
                      onClick={async () => {
                        const res = await universalApi.request(ep.url, { method: ep.method as any });
                        alert(`Resposta da API (${ep.name}):\n` + JSON.stringify(res, null, 2));
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Testar Requisição
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
