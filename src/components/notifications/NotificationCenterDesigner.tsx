import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Radio,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle,
  Trash2,
  Plus,
  RefreshCw,
  Zap,
  Sliders,
  Globe,
  ShieldCheck,
  AlertCircle,
  Inbox,
  Filter,
} from 'lucide-react';
import {
  notificationManager,
  realtimeManager,
  AppNotification,
  NotificationType,
  NotificationPriority,
} from '../../utils/notificationCommunicationLayer';

export const NotificationCenterDesigner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'push' | 'realtime' | 'builder' | 'adapters'>('notifications');

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(notificationManager.list());
  const [filterType, setFilterType] = useState<string>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<NotificationType>('info');
  const [newPriority, setNewPriority] = useState<NotificationPriority>('normal');

  // Push State
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [deviceToken, setDeviceToken] = useState('token_web_applet_123');
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  // Realtime State
  const [rtConnected, setRtConnected] = useState(realtimeManager.isConnected());
  const [rtEvent, setRtEvent] = useState('chat_message');
  const [rtPayload, setRtPayload] = useState('{"user": "Carlos", "text": "Olá do Mobile Studio!"}');
  const [rtLogs, setRtLogs] = useState<{ event: string; data: any; time: string }[]>([]);

  // Communication Builder Flows State
  const [flows, setFlows] = useState([
    { id: 'f1', trigger: 'Usuário Cadastrado', action: 'Enviar E-mail de Boas-Vindas', active: true },
    { id: 'f2', trigger: 'Novo Pedido Criado', action: 'Enviar Push Notification para o Dono', active: true },
    { id: 'f3', trigger: 'Pagamento Aprovado', action: 'Emitir Evento Realtime & WhatsApp', active: false },
  ]);
  const [newTrigger, setNewTrigger] = useState('');
  const [newAction, setNewAction] = useState('');

  useEffect(() => {
    const unsubNotif = notificationManager.onNotificationsChanged((list) => {
      setNotifications([...list]);
    });

    const unsubRt = realtimeManager.on(rtEvent, (data) => {
      setRtLogs((prev) => [
        { event: rtEvent, data, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 20),
      ]);
    });

    return () => {
      unsubNotif();
      unsubRt();
    };
  }, [rtEvent]);

  const handleCreateNotification = async () => {
    if (!newTitle.trim() || !newMessage.trim()) return;
    await notificationManager.create({
      title: newTitle,
      message: newMessage,
      type: newType,
      priority: newPriority,
    });
    setNewTitle('');
    setNewMessage('');
  };

  const handleSendPush = async () => {
    if (!pushTitle.trim() || !pushMessage.trim()) return;
    setPushStatus('Enviando via FCM / APNs / Web Push...');
    const ok = await notificationManager.sendPushNotification(pushTitle, pushMessage);
    if (ok) {
      setPushStatus('Notificação Push disparada com sucesso!');
      setPushTitle('');
      setPushMessage('');
    } else {
      setPushStatus('Falha ao disparar notificação push.');
    }
  };

  const handleRegisterToken = () => {
    if (!deviceToken.trim()) return;
    notificationManager.registerDeviceToken(deviceToken, 'web');
    alert('Device Token registrado no Push Engine!');
  };

  const handleToggleRtConnect = () => {
    if (rtConnected) {
      realtimeManager.disconnect();
      setRtConnected(false);
    } else {
      realtimeManager.connect();
      setRtConnected(true);
    }
  };

  const handleEmitRt = () => {
    try {
      const parsed = JSON.parse(rtPayload);
      realtimeManager.emit(rtEvent, parsed);
    } catch (e) {
      realtimeManager.emit(rtEvent, { message: rtPayload });
    }
  };

  const handleAddFlow = () => {
    if (!newTrigger.trim() || !newAction.trim()) return;
    setFlows([
      ...flows,
      { id: `f_${Date.now()}`, trigger: newTrigger, action: newAction, active: true },
    ]);
    setNewTrigger('');
    setNewAction('');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'unread') return !n.read;
    if (filterType !== 'all') return n.type === filterType;
    return true;
  });

  return (
    <div className="w-full h-full bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-slate-100 text-base">Notification & Communication Layer Universal</span>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-500/30">
            Fase 7 Ready
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            In-App Center ({notificationManager.getUnreadCount()})
          </button>

          <button
            onClick={() => setActiveTab('push')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'push' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Push Engine (FCM/APNs)
          </button>

          <button
            onClick={() => setActiveTab('realtime')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'realtime' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Realtime (WebSockets)
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'builder' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Communication Builder
          </button>

          <button
            onClick={() => setActiveTab('adapters')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'adapters' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email & SMS Adapters
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Create Notification */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" />
                Criar Notificação In-App
              </span>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Título da Notificação"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
                />

                <textarea
                  placeholder="Conteúdo da mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 resize-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">TIPO</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as NotificationType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="info">Info</option>
                      <option value="success">Sucesso</option>
                      <option value="warning">Aviso</option>
                      <option value="error">Erro</option>
                      <option value="message">Mensagem</option>
                      <option value="system">Sistema</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">PRIORIDADE</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as NotificationPriority)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="low">Baixa</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleCreateNotification}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition shadow mt-1 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Disparar Notificação
                </button>
              </div>
            </div>

            {/* Right: In-App Notification Center List */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-indigo-400" />
                  In-App Notification Center ({filteredNotifications.length})
                </span>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                  >
                    <option value="all">Todas</option>
                    <option value="unread">Não Lidas</option>
                    <option value="info">Info</option>
                    <option value="success">Sucesso</option>
                    <option value="warning">Aviso</option>
                    <option value="system">Sistema</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
                    <Bell className="w-8 h-8 opacity-30 text-slate-400" />
                    <span>Nenhuma notificação encontrada no momento.</span>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between transition ${
                        n.read
                          ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                          : 'bg-slate-900 border-indigo-500/40 text-slate-100 shadow-lg'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              n.type === 'success'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : n.type === 'error'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : n.type === 'warning'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {n.type}
                          </span>
                          <span className="font-bold text-xs">{n.title}</span>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300">{n.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {!n.read && (
                          <button
                            onClick={() => notificationManager.markAsRead(n.id)}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-400 transition"
                            title="Marcar como lida"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => notificationManager.delete(n.id)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-red-400 transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'push' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                Simulador de Push Notification (FCM / APNs)
              </span>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Título Push ex: Promoção Imperdível!"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
                />

                <textarea
                  placeholder="Mensagem da notificação push..."
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                  rows={3}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 resize-none"
                />

                <button
                  onClick={handleSendPush}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Disparar Push
                </button>

                {pushStatus && (
                  <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800">
                    {pushStatus}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Device Tokens & Permissões
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Device Push Token"
                  value={deviceToken}
                  onChange={(e) => setDeviceToken(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
                <button
                  onClick={handleRegisterToken}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-xl text-xs font-bold transition"
                >
                  Registrar Device
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 text-xs text-slate-300">
                <span className="font-bold text-slate-200">Provedores Push Ativos:</span>
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Firebase Cloud Messaging (Android/Web)</span>
                    <span className="text-emerald-400 font-bold">● Ativo</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Apple Push Notification Service (iOS)</span>
                    <span className="text-emerald-400 font-bold">● Ativo</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Web Push Standard API</span>
                    <span className="text-emerald-400 font-bold">● Ativo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'realtime' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-indigo-400" />
                  Conexão Realtime (PubSub / WebSockets)
                </span>
                <button
                  onClick={handleToggleRtConnect}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    rtConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}
                >
                  {rtConnected ? 'Conectado' : 'Desconectado'}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Nome do Evento ex: chat_message"
                  value={rtEvent}
                  onChange={(e) => setRtEvent(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />

                <textarea
                  placeholder="Payload JSON"
                  value={rtPayload}
                  onChange={(e) => setRtPayload(e.target.value)}
                  rows={3}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono resize-none"
                />

                <button
                  onClick={handleEmitRt}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Emitir Evento Realtime
                </button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Stream Log de Eventos em Tempo Real ({rtLogs.length})
              </span>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-[350px] overflow-y-auto font-mono text-[11px] flex flex-col gap-2">
                {rtLogs.length === 0 ? (
                  <span className="text-slate-500 text-center py-8">Nenhum evento emitido ainda.</span>
                ) : (
                  rtLogs.map((log, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5">
                      <div className="flex items-center justify-between text-indigo-300 font-bold">
                        <span>[{log.event}]</span>
                        <span className="text-slate-500 text-[10px]">{log.time}</span>
                      </div>
                      <pre className="text-emerald-400 mt-1 whitespace-pre-wrap">{JSON.stringify(log.data, null, 2)}</pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="flex flex-col gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
              <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                Communication Builder Visual (Fluxos de Evento)
              </span>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Gatilho ex: Usuário Cadastrado"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Ação ex: Enviar E-mail de Boas-Vindas"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  onClick={handleAddFlow}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Criar Fluxo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {flows.map((f) => (
                  <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-400">EVENTO:</span>
                    <span className="text-sm font-bold text-indigo-300">{f.trigger}</span>
                    <span className="text-xs font-bold text-slate-400 mt-1">AÇÃO:</span>
                    <span className="text-xs text-emerald-400 font-bold bg-slate-950 p-2 rounded-lg border border-slate-800">{f.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'adapters' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              Adapters de E-mail & Mensageria (SendGrid / Twilio / WhatsApp API)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <span className="font-bold text-xs text-slate-200">SendGrid / SMTP Email</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 w-fit">CONFIGURADO</span>
                <p className="text-xs text-slate-400">Disparo automático de e-mails transacionais e alertas de sistema.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <span className="font-bold text-xs text-slate-200">Twilio SMS Gateway</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 w-fit">CONFIGURADO</span>
                <p className="text-xs text-slate-400">Envio de códigos OTP e alertas curtos via SMS.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
                <span className="font-bold text-xs text-slate-200">WhatsApp Business API</span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800 w-fit">PRONTO PARA KEY</span>
                <p className="text-xs text-slate-400">Mensagens e notificações diretas no WhatsApp do usuário.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
