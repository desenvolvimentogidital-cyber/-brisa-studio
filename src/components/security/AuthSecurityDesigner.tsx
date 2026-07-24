import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Key,
  Lock,
  UserPlus,
  LogOut,
  Globe,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Users,
} from 'lucide-react';
import {
  identityManager,
  User,
  Session,
  Role,
  SecurityRule,
} from '../../utils/identitySecurityLayer';

export const AuthSecurityDesigner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'rules' | 'providers'>('users');

  // Auth & User State
  const [currentUser, setCurrentUser] = useState<User | null>(identityManager.getCurrentUser());
  const [currentSession, setCurrentSession] = useState<Session | null>(identityManager.getSession());

  // Form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Roles State
  const [roles, setRoles] = useState<Role[]>([
    { name: 'Admin', permissions: ['*'] },
    { name: 'Editor', permissions: ['create', 'read', 'update'] },
    { name: 'User', permissions: ['read', 'update_own'] },
    { name: 'Guest', permissions: ['read_public'] },
  ]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePerm, setNewRolePerm] = useState('');

  // Rules State
  const [rules, setRules] = useState<SecurityRule[]>([
    { id: 'rule_1', resource: 'table:users', action: 'read', condition: 'authenticated' },
    { id: 'rule_2', resource: 'table:orders', action: 'write', condition: 'hasRole', requiredRole: 'User' },
  ]);
  const [newResource, setNewResource] = useState('');
  const [newAction, setNewAction] = useState<SecurityRule['action']>('read');
  const [newCondition, setNewCondition] = useState<SecurityRule['condition']>('authenticated');
  const [newReqRole, setNewReqRole] = useState('User');

  // Providers state
  const [providers, setProviders] = useState([
    { id: 'email', name: 'E-mail / Senha', enabled: true },
    { id: 'anon', name: 'Login Anônimo', enabled: true },
    { id: 'google', name: 'Google OAuth 2.0', enabled: false },
    { id: 'apple', name: 'Apple Sign In', enabled: false },
    { id: 'github', name: 'GitHub OAuth', enabled: false },
  ]);

  useEffect(() => {
    const unsub = identityManager.onAuthStateChanged((u) => {
      setCurrentUser(u);
      setCurrentSession(identityManager.getSession());
    });
    return () => unsub();
  }, []);

  const handleRegister = async () => {
    setAuthError(null);
    try {
      if (!regName || !regEmail) throw new Error('Preencha os campos obrigatórios.');
      await identityManager.register({ name: regName, email: regEmail, password: regPass });
      setRegName('');
      setRegEmail('');
      setRegPass('');
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao cadastrar');
    }
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      if (!loginEmail) throw new Error('Informe o e-mail.');
      await identityManager.login(loginEmail, loginPass);
      setLoginEmail('');
      setLoginPass('');
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao entrar');
    }
  };

  const handleLoginAnon = async () => {
    setAuthError(null);
    try {
      await identityManager.loginAnonymous();
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao entrar como convidado');
    }
  };

  const handleLogout = async () => {
    await identityManager.logout();
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    const name = newRoleName.trim();
    if (roles.some((r) => r.name === name)) return;
    setRoles([...roles, { name, permissions: newRolePerm ? [newRolePerm.trim()] : ['read'] }]);
    setNewRoleName('');
    setNewRolePerm('');
  };

  const handleAddRule = () => {
    if (!newResource.trim()) return;
    const newR: SecurityRule = {
      id: `rule_${Date.now()}`,
      resource: newResource.trim(),
      action: newAction,
      condition: newCondition,
      requiredRole: newCondition === 'hasRole' ? newReqRole : undefined,
    };
    setRules([...rules, newR]);
    identityManager.addSecurityRule(newR);
    setNewResource('');
  };

  const toggleProvider = (id: string) => {
    setProviders(providers.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  return (
    <div className="w-full h-full bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-slate-100 text-base">Identity & Security Layer Universal</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
            Fase 6 Ready
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Usuários & Sessões
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'roles' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Roles & Permissões
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'rules' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Security Rules Engine
          </button>

          <button
            onClick={() => setActiveTab('providers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'providers' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Auth Providers
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-6 overflow-y-auto">
        {authError && (
          <div className="mb-4 bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>{authError}</span>
            </div>
            <button onClick={() => setAuthError(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active User Panel */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Sessão Ativa no Runtime
                </span>
                {currentUser ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    AUTENTICADO
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                    NÃO AUTENTICADO
                  </span>
                )}
              </div>

              {currentUser ? (
                <div className="flex flex-col gap-3 text-xs">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 font-mono">
                    <div><span className="text-slate-500">ID:</span> <span className="text-amber-300">{currentUser.id}</span></div>
                    <div><span className="text-slate-500">Nome:</span> <span className="text-slate-200 font-bold">{currentUser.name}</span></div>
                    <div><span className="text-slate-500">E-mail:</span> <span className="text-slate-300">{currentUser.email}</span></div>
                    <div><span className="text-slate-500">Roles:</span> <span className="text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-md font-sans font-bold">{currentUser.roles.join(', ')}</span></div>
                  </div>

                  {currentSession && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 text-[11px] font-mono text-slate-400">
                      <div><span className="text-slate-500">Session Token:</span> <span className="text-slate-300 truncate">{currentSession.token}</span></div>
                      <div><span className="text-slate-500">Dispositivo:</span> {currentSession.deviceInfo}</div>
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className="bg-red-600/80 hover:bg-red-600 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow mt-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Encerrar Sessão (Logout)
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 text-xs py-8 gap-3">
                  <Lock className="w-8 h-8 opacity-40 text-slate-400" />
                  <span>Nenhum usuário logado no momento.</span>
                  <button
                    onClick={handleLoginAnon}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    Entrar como Convidado (Anônimo)
                  </button>
                </div>
              )}
            </div>

            {/* Test Login & Register Form */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-5 shadow-xl">
              <div>
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  Testar Autenticação (Visual Auth Engine)
                </span>
                <p className="text-xs text-slate-400 mt-1">Simule o fluxo de cadastro e login de usuários.</p>
              </div>

              {/* Login box */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-300">Login</span>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="E-mail ex: admin@studio.app"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500"
                  />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500"
                  />
                  <button
                    onClick={handleLogin}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition"
                  >
                    Entrar
                  </button>
                </div>
              </div>

              {/* Register box */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-300">Novo Cadastro</span>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500"
                  />
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Senha"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500"
                    />
                    <button
                      onClick={handleRegister}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition"
                    >
                      Cadastrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="flex flex-col gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  Gerenciador de Roles e Permissões
                </span>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Nome da Role ex: Supervisor"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Permissão ex: edit_orders"
                  value={newRolePerm}
                  onChange={(e) => setNewRolePerm(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500"
                />
                <button
                  onClick={handleAddRole}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Role
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                {roles.map((r) => (
                  <div key={r.name} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                    <span className="font-bold text-emerald-300 text-sm">{r.name}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {r.permissions.map((p) => (
                        <span key={p} className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="flex flex-col gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Security Rules Engine (Regras de Segurança)
                </span>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  placeholder="Recurso ex: table:users ou screen:Admin"
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500 min-w-[200px]"
                />
                <select
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="read">read</option>
                  <option value="write">write</option>
                  <option value="delete">delete</option>
                  <option value="execute">execute</option>
                </select>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="authenticated">Autenticado</option>
                  <option value="hasRole">Requer Role</option>
                  <option value="isOwner">Dono do Registro</option>
                </select>
                {newCondition === 'hasRole' && (
                  <select
                    value={newReqRole}
                    onChange={(e) => setNewReqRole(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  >
                    {roles.map((r) => (
                      <option key={r.name} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={handleAddRule}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Criar Regra
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-2">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Recurso</th>
                      <th className="px-4 py-3">Ação</th>
                      <th className="px-4 py-3">Condição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {rules.map((rule) => (
                      <tr key={rule.id}>
                        <td className="px-4 py-3 font-mono text-slate-500">{rule.id}</td>
                        <td className="px-4 py-3 font-mono font-bold text-amber-300">{rule.resource}</td>
                        <td className="px-4 py-3"><span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono">{rule.action}</span></td>
                        <td className="px-4 py-3 font-mono text-emerald-400">
                          {rule.condition} {rule.requiredRole ? `(${rule.requiredRole})` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="flex flex-col gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Provedores de Autenticação Habilitados
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
                  >
                    <span className="font-bold text-xs text-slate-200">{p.name}</span>
                    <button
                      onClick={() => toggleProvider(p.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                        p.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {p.enabled ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
