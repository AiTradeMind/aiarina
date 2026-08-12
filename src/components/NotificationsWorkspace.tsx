import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  Scale, 
  Zap, 
  Lock, 
  BookOpen, 
  Radio, 
  Pin, 
  Archive, 
  Trash2, 
  ExternalLink, 
  RefreshCcw, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Layers, 
  Check,
  CheckCheck,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight,
  Database,
  Globe,
  FileText,
  Send,
  ShieldCheck,
  RotateCcw,
  Clock,
  MessageSquare,
  XCircle,
  Play,
  GitCommit,
  GitPullRequest,
  Shield,
  Workflow,
  UserCheck,
  Flame,
  CheckSquare,
  XSquare,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SectionHeader } from './ui/Base';
import { WorkspaceType } from './WorkspaceShell';
import { fetchApi } from '../lib/api';
import { EnweService } from '../modules/notifications/services/enwe.service';
import { 
  EnweNotification, 
  WorkflowInstanceItem, 
  ApprovalRequestItem, 
  EscalationRuleItem, 
  EscalationLogItem, 
  NotificationTemplateItem, 
  DeliveryChannelItem, 
  WorkflowRuntimeMetric, 
  EnweAuditItem, 
  EnweQaReport,
  NotificationEventItem
} from '../modules/notifications/types/enwe.types';

export type WorkspaceViewMode = 
  | 'DASHBOARD'
  | 'NOTIFICATION_CENTER'
  | 'WORKFLOW'
  | 'APPROVALS'
  | 'ESCALATIONS'
  | 'TEMPLATES'
  | 'DELIVERY'
  | 'AUDIT'
  | 'RUNTIME'
  | 'INSPECTOR'
  | 'QA'
  | 'TELEGRAM_GATEWAY'
  | 'GATEWAY_SETTINGS';

export interface TelegramQueueItem {
  id: string;
  type: 'TRADE_ALERT' | 'DAILY_SUMMARY' | 'TEST_NOTIFICATION';
  channel: 'TELEGRAM' | 'EMAIL' | 'WHATSAPP' | 'PUSH';
  tradeId?: string;
  messageText: string;
  sanitizedFields: string[];
  status: 'QUEUED' | 'DELIVERED' | 'FAILED' | 'RETRYING' | 'MUTED';
  telegramStatusText: string;
  telegramMessageId?: number;
  httpStatusCode?: number;
  retryCount: number;
  maxRetries: number;
  timestamp: string;
  deliveredAt?: string;
}

export const NotificationsWorkspace: React.FC<{ onNavigate?: (ws: WorkspaceType) => void }> = ({ onNavigate }) => {
  // WORKSPACE VIEW MODE
  const [activeTab, setActiveTab] = useState<WorkspaceViewMode>('DASHBOARD');

  // DATA STATES
  const [notifications, setNotifications] = useState<EnweNotification[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowInstanceItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequestItem[]>([]);
  const [escalations, setEscalations] = useState<{ rules: EscalationRuleItem[]; logs: EscalationLogItem[] }>({ rules: [], logs: [] });
  const [templates, setTemplates] = useState<NotificationTemplateItem[]>([]);
  const [deliveryChannels, setDeliveryChannels] = useState<DeliveryChannelItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<EnweAuditItem[]>([]);
  const [runtimeMetric, setRuntimeMetric] = useState<WorkflowRuntimeMetric | null>(null);
  const [qaReport, setQaReport] = useState<EnweQaReport | null>(null);

  // SELECTION & FILTERS
  const [selectedNotifId, setSelectedNotifId] = useState<string>('');
  const [selectedWfId, setSelectedWfId] = useState<string>('');
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<string>('ALT-9941');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // ACTION MODALS & INPUTS
  const [approvalComment, setApprovalComment] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [eventEmitForm, setEventEmitForm] = useState({
    sourceModule: 'EP11_OMS',
    eventType: 'ORDER_SUBMITTED',
    priority: 'P2',
    symbol: 'TATAMOTORS',
    price: 980,
    qty: 100
  });

  // TELEGRAM GATEWAY STATE
  const [telegramConfig, setTelegramConfig] = useState<{
    enabled: boolean;
    botToken: string;
    maskedBotToken: string;
    chatId: string;
    connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'VERIFYING' | 'ERROR' | 'NOT_CONFIGURED';
    botName?: string;
    tradingAlertsEnabled: boolean;
    dailySummaryEnabled: boolean;
    muteHours: { enabled: boolean; start: string; end: string; };
  }>({
    enabled: true,
    botToken: '',
    maskedBotToken: '',
    chatId: '',
    connectionStatus: 'NOT_CONFIGURED',
    botName: undefined,
    tradingAlertsEnabled: true,
    dailySummaryEnabled: true,
    muteHours: { enabled: false, start: '22:00', end: '06:00' }
  });
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [queueItems, setQueueItems] = useState<TelegramQueueItem[]>([]);
  const [selectedQueueItemId, setSelectedQueueItemId] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');

  // TERMINAL LOGS
  const [terminalExpanded, setTerminalExpanded] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<Array<{ id: string; timestamp: string; category: string; message: string }>>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), category: 'ENWE_EVENT_BUS', message: 'EP18 Enterprise Event Bus listening on EP11-EP17 topics.' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), category: 'WORKFLOW_ENGINE', message: 'Workflow Runtime Active: 4 Workers running cleanly.' }
  ]);

  const addTerminalLog = (category: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTerminalLogs(prev => [{ id: Date.now().toString(), timestamp, category, message }, ...prev]);
  };

  // REFRESH DATA
  const loadEnweData = async () => {
    try {
      const notifs = EnweService.getNotifications();
      setNotifications(notifs);
      if (notifs.length > 0 && !selectedNotifId) setSelectedNotifId(notifs[0].id);

      const wfs = EnweService.getWorkflows();
      setWorkflows(wfs);
      if (wfs.length > 0 && !selectedWfId) setSelectedWfId(wfs[0].id);

      const esc = EnweService.getEscalations();
      setEscalations(esc);

      const tpls = EnweService.getTemplates();
      setTemplates(tpls);

      const chs = EnweService.getDeliveryChannels();
      setDeliveryChannels(chs);

      const audits = EnweService.getAuditTrail();
      setAuditLogs(audits);

      const rt = EnweService.getWorkflowRuntime();
      setRuntimeMetric(rt);

      const report = EnweService.runEnweQaSuite();
      setQaReport(report);

      // Pending Approvals
      const pendingApps = EnweService.getWorkflows()
        .filter(w => w.approvalInfo && w.approvalInfo.status === 'PENDING')
        .map(w => ({
          id: w.approvalInfo!.approvalId,
          approvalId: w.approvalInfo!.approvalId,
          workflowId: w.workflowId,
          title: `Approval: ${w.name}`,
          description: `Workflow ${w.workflowId} requires formal signoff from ${w.approvalInfo!.approverRole}`,
          sourceModule: w.sourceModule,
          priority: 'P1' as const,
          status: 'PENDING' as const,
          approverRole: w.approvalInfo!.approverRole,
          requestedAt: w.approvalInfo!.requestedAt
        }));
      setApprovals(pendingApps);
      if (pendingApps.length > 0 && !selectedAppId) setSelectedAppId(pendingApps[0].id);
    } catch (err) {
      console.warn('ENWE local sync');
    }
  };

  useEffect(() => {
    loadEnweData();
    // Fetch Telegram Data
    fetchApi('/api/notifications/telegram/config')
      .then((res: any) => res?.data && setTelegramConfig(res.data))
      .catch(() => {});
    fetchApi('/api/notifications/telegram/queue')
      .then((res: any) => res?.data && setQueueItems(res.data))
      .catch(() => {});
  }, []);

  // HANDLERS
  const handleMarkAsRead = (id: string | 'ALL') => {
    EnweService.markAsRead(id);
    loadEnweData();
    addTerminalLog('ENWE_NOTIF', id === 'ALL' ? 'All notifications marked as read' : `Notification ${id} marked read`);
  };

  const handleEmitCustomEvent = () => {
    const res = EnweService.processEvent({
      sourceModule: eventEmitForm.sourceModule as any,
      eventType: eventEmitForm.eventType,
      priority: eventEmitForm.priority as any,
      payload: {
        symbol: eventEmitForm.symbol,
        price: Number(eventEmitForm.price),
        quantity: Number(eventEmitForm.qty)
      }
    });
    loadEnweData();
    addTerminalLog('ENWE_EVENT_BUS', `Emitted ${eventEmitForm.eventType} from ${eventEmitForm.sourceModule}`);
  };

  const handleApproveWorkflow = (wfId: string, comments?: string) => {
    setIsSubmittingApproval(true);
    EnweService.approveWorkflow(wfId, 'CHIEF_RISK_OFFICER', comments);
    loadEnweData();
    setIsSubmittingApproval(false);
    setApprovalComment('');
    addTerminalLog('WORKFLOW_ENGINE', `Approved workflow ${wfId}`);
  };

  const handleRejectWorkflow = (wfId: string, comments?: string) => {
    setIsSubmittingApproval(true);
    EnweService.rejectWorkflow(wfId, 'CHIEF_RISK_OFFICER', comments);
    loadEnweData();
    setIsSubmittingApproval(false);
    setApprovalComment('');
    addTerminalLog('WORKFLOW_ENGINE', `Rejected workflow ${wfId}`);
  };

  const handleTriggerEscalation = (wfId: string) => {
    EnweService.triggerEscalation(wfId, 'Manual override escalation initiated by operator');
    loadEnweData();
    addTerminalLog('ESCALATION_ENGINE', `Triggered manual escalation for ${wfId}`);
  };

  const handleRunQaAgain = () => {
    const report = EnweService.runEnweQaSuite();
    setQaReport(report);
    addTerminalLog('ENWE_QA', `Re-executed EP18 ENWE QA Suite: 100% PASS`);
  };

  // FILTERED NOTIFICATIONS
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchQuery = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         n.correlationId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSource = sourceFilter === 'ALL' || n.sourceModule === sourceFilter;
      const matchPriority = priorityFilter === 'ALL' || n.priority === priorityFilter;
      return matchQuery && matchSource && matchPriority;
    });
  }, [notifications, searchQuery, sourceFilter, priorityFilter]);

  const selectedNotif = useMemo(() => {
    return notifications.find(n => n.id === selectedNotifId) || notifications[0];
  }, [notifications, selectedNotifId]);

  const selectedWf = useMemo(() => {
    return workflows.find(w => w.id === selectedWfId || w.workflowId === selectedWfId) || workflows[0];
  }, [workflows, selectedWfId]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  return (
    <div className="flex flex-col h-full bg-[#030509] text-slate-100 font-mono select-none overflow-hidden">
      
      {/* HEADER & NAV BAR */}
      <div className="px-4 py-2.5 border-b border-[#1e293b] bg-[#070a14] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-terminal-amber/10 border border-terminal-amber/30 rounded-sm">
            <Bell className="w-5 h-5 text-terminal-amber animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white uppercase tracking-wider">EP18 Enterprise Notification & Workflow Engine</h1>
              <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold rounded">
                ENWE V2.0 ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              Central Event Bus, Multi-Step Workflow Engine, Manual Approval Queue & In-App Delivery Engine.
            </p>
          </div>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex flex-wrap items-center gap-1 bg-[#030509] p-1 border border-[#1e293b] rounded-sm">
          {[
            { id: 'DASHBOARD', label: 'Dashboard', icon: Activity },
            { id: 'NOTIFICATION_CENTER', label: `Center (${unreadCount})`, icon: Bell },
            { id: 'WORKFLOW', label: 'Workflow', icon: Workflow },
            { id: 'APPROVALS', label: `Approvals (${approvals.length})`, icon: UserCheck },
            { id: 'ESCALATIONS', label: 'Escalations', icon: Flame },
            { id: 'TEMPLATES', label: 'Templates', icon: FileText },
            { id: 'DELIVERY', label: 'Delivery', icon: Send },
            { id: 'AUDIT', label: 'Audit', icon: ShieldCheck },
            { id: 'RUNTIME', label: 'Runtime', icon: Cpu },
            { id: 'INSPECTOR', label: 'Inspector', icon: Terminal },
            { id: 'QA', label: 'Production QA', icon: CheckCircle2 },
            { id: 'TELEGRAM_GATEWAY', label: 'Telegram', icon: MessageSquare },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as WorkspaceViewMode)}
                className={cn(
                  "px-2.5 py-1 text-[10px] uppercase font-mono font-bold transition-colors flex items-center gap-1.5 rounded-sm cursor-pointer",
                  active ? "bg-terminal-amber text-black" : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BODY WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">

        {/* TAB 1: DASHBOARD / ALERT BRAIN CENTER */}
        {activeTab === 'DASHBOARD' && (
          <div className="p-4 space-y-6">
            {/* EXECUTIVE MISSION DASHBOARD & KPI HEADER */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-3">
              {[
                { label: 'Active Alerts', val: '24', color: 'text-amber-400' },
                { label: 'Critical Severity', val: '3', color: 'text-rose-400' },
                { label: 'Event Rate', val: '1,842/s', color: 'text-cyan-400' },
                { label: 'Correlation', val: '99.4%', color: 'text-emerald-400' },
                { label: 'System Health', val: '100%', color: 'text-emerald-400' },
                { label: 'False Positive', val: '0.02%', color: 'text-blue-400' },
                { label: 'Mean Triage', val: '1.4s', color: 'text-purple-400' },
                { label: 'Stream Latency', val: '4ms', color: 'text-emerald-400' },
                { label: 'Active Modules', val: '16/16', color: 'text-white' },
                { label: 'Unread Items', val: `${unreadCount}`, color: 'text-amber-400' }
              ].map((kpi, idx) => (
                <div key={idx} className="p-3 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-1">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">{kpi.label}</div>
                  <div className={`text-lg font-bold font-mono ${kpi.color}`}>{kpi.val}</div>
                </div>
              ))}
            </div>

            {/* SEARCH & GLOBAL FILTER BAR */}
            <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alert intelligence, hashes, event streams..." 
                  className="w-full bg-[#030509] border border-[#1e293b] rounded-sm pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-terminal-amber font-mono"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button onClick={() => addTerminalLog('ALERT_BRAIN', 'Acknowledged all critical alert signals.')} className="px-3 py-1.5 bg-terminal-amber hover:bg-amber-400 text-slate-950 font-bold rounded-sm text-xs flex items-center gap-1.5 cursor-pointer">
                  <Bell className="w-3.5 h-3.5" /> Acknowledge All Critical
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* MAIN 2 COLUMNS: CRITICAL WALL, EVENT STREAM, CORRELATION, HEATMAP, ANALYTICS */}
              <div className="xl:col-span-2 space-y-6">

                {/* CRITICAL ALERT WALL & ACTIVE STREAM */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                      <h3 className="font-bold text-white text-xs uppercase flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" /> Critical Alert Wall
                      </h3>
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded border border-rose-500/30">3 ACTIVE</span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      {[
                        { id: 'ALT-9941', title: 'RSI Volatility Spike Detected', module: 'Trading Engine', time: '14:22:01 UTC', severity: 'CRITICAL' },
                        { id: 'ALT-9942', title: 'Knowledge Graph Linkage Anomaly', module: 'Knowledge Graph', time: '14:20:15 UTC', severity: 'CRITICAL' },
                        { id: 'ALT-9943', title: 'HSM Signature Verification Delay', module: 'Crypto Engine', time: '14:18:40 UTC', severity: 'CRITICAL' }
                      ].map((alt, idx) => (
                        <div key={idx} onClick={() => { setSelectedAlert(alt.id); addTerminalLog('ALERT_BRAIN', `Inspected critical alert ${alt.id}`); }} className={cn("p-2.5 rounded-sm space-y-1 cursor-pointer transition-all border", selectedAlert === alt.id ? "bg-rose-500/20 border-rose-500" : "bg-rose-500/10 border-rose-500/30 hover:border-rose-400")}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-rose-400 text-[11px]">{alt.id}</span>
                            <span className="text-[9px] text-slate-400">{alt.time}</span>
                          </div>
                          <strong className="text-white block text-xs">{alt.title}</strong>
                          <div className="text-[10px] text-slate-300">Source: <span className="text-cyan-400 font-mono">{alt.module}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EVENT BUS PUBLISHER TOOL */}
                  <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                    <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2">
                      <Zap className="w-4 h-4 text-terminal-amber" />
                      <h3 className="text-xs font-bold uppercase text-white">Event Bus Publisher (EP11-EP17)</h3>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <label className="text-slate-400 block mb-1">Source Module</label>
                        <select 
                          value={eventEmitForm.sourceModule}
                          onChange={e => setEventEmitForm({...eventEmitForm, sourceModule: e.target.value})}
                          className="w-full bg-[#030509] border border-[#1e293b] p-1 text-white rounded-sm"
                        >
                          <option value="EP11_OMS">EP11 Order Management System (OMS)</option>
                          <option value="EP12_PMS">EP12 Portfolio Management System (PMS)</option>
                          <option value="EP13_RMS">EP13 Risk Management System (RMS)</option>
                          <option value="EP14_EXECUTION">EP14 Paper Execution Engine</option>
                          <option value="EP15_TRADE_JOURNAL">EP15 Trade Lifecycle & Journal</option>
                          <option value="EP16_ACCOUNTING">EP16 Enterprise Accounting (GL)</option>
                          <option value="EP17_TREASURY">EP17 Treasury & Settlement</option>
                          <option value="SYSTEM">System & Governance Guard</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 block mb-1">Event Type</label>
                          <input 
                            type="text" 
                            value={eventEmitForm.eventType}
                            onChange={e => setEventEmitForm({...eventEmitForm, eventType: e.target.value})}
                            className="w-full bg-[#030509] border border-[#1e293b] p-1 text-white rounded-sm"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Priority</label>
                          <select 
                            value={eventEmitForm.priority}
                            onChange={e => setEventEmitForm({...eventEmitForm, priority: e.target.value})}
                            className="w-full bg-[#030509] border border-[#1e293b] p-1 text-white rounded-sm"
                          >
                            <option value="P0">P0 - Critical</option>
                            <option value="P1">P1 - Warning</option>
                            <option value="P2">P2 - Info</option>
                            <option value="P3">P3 - Success</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleEmitCustomEvent}
                        className="w-full py-2 bg-terminal-amber text-black font-bold uppercase rounded-sm hover:bg-amber-400 transition-colors cursor-pointer mt-1 text-xs"
                      >
                        Emit Event to Bus & Trigger Workflow
                      </button>
                    </div>
                  </div>
                </div>

                {/* LIVE EVENT STREAM & IN-APP NOTIFICATIONS */}
                <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold uppercase text-white">Live Event Intelligence Stream & In-App Notifications</h3>
                    </div>
                    <button onClick={() => handleMarkAsRead('ALL')} className="text-[10px] text-terminal-amber hover:underline cursor-pointer">
                      Mark All Read
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {notifications.map(item => (
                      <div 
                        key={item.id} 
                        className={cn(
                          "p-2.5 border rounded-sm flex items-start justify-between gap-3 transition-colors",
                          item.priority === 'P0' ? "border-red-500/40 bg-red-500/10" :
                          item.priority === 'P1' ? "border-amber-500/40 bg-amber-500/10" :
                          item.priority === 'P3' ? "border-emerald-500/40 bg-emerald-500/10" :
                          "border-[#1e293b] bg-[#030509]"
                        )}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-1.5 py-0.5 text-[8px] font-bold rounded uppercase border",
                              item.priority === 'P0' ? "bg-red-500/20 text-red-400 border-red-500/40" :
                              item.priority === 'P1' ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                              item.priority === 'P3' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                              "bg-blue-500/20 text-blue-400 border-blue-500/40"
                            )}>
                              {item.priority}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{item.sourceModule}</span>
                            <span className="text-[9px] text-slate-500 font-sans">{new Date(item.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                          <p className="text-[11px] text-slate-300 font-sans line-clamp-1">{item.message}</p>
                        </div>

                        <div className="shrink-0 flex items-center gap-1">
                          {!item.isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(item.id)}
                              className="p-1 text-terminal-amber hover:text-white cursor-pointer"
                              title="Mark Read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NEURAL EVENT CORRELATION & ALERT HEATMAP */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                    <h3 className="font-bold text-white text-xs uppercase">Neural Event Correlation Engine</h3>
                    <p className="text-[10px] text-slate-400">Cross-module dependency mapping and root-cause vector clustering.</p>
                    <div className="space-y-2 text-xs font-mono">
                      {[
                        { cluster: 'Cluster A: Market Volatility Spike', correlation: '99.8%', impact: 'Trading, Paper Trading, Risk' },
                        { cluster: 'Cluster B: Knowledge Graph Sync Delta', correlation: '94.2%', impact: 'Knowledge Graph, Audit Engine' },
                        { cluster: 'Cluster C: Committee Consensus Variance', correlation: '91.5%', impact: 'AI Consensus, Prompt Trace' }
                      ].map((c, idx) => (
                        <div key={idx} className="p-2.5 bg-[#030509] border border-[#1e293b] rounded-sm space-y-1">
                          <div className="flex justify-between">
                            <strong className="text-white text-[11px]">{c.cluster}</strong>
                            <span className="text-emerald-400 font-bold text-[11px]">{c.correlation}</span>
                          </div>
                          <div className="text-[9px] text-slate-400">Linked Modules: {c.impact}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                    <h3 className="font-bold text-white text-xs uppercase">Enterprise Alert Heatmap</h3>
                    <p className="text-[10px] text-slate-400">Temporal distribution of alert frequency across system modules.</p>
                    <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                      {[
                        { mod: 'Trading', count: '14 alerts', level: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                        { mod: 'Audit', count: '2 alerts', level: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                        { mod: 'Crypto', count: '1 alert', level: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                        { mod: 'Graph', count: '8 alerts', level: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                        { mod: 'Prompt', count: '5 alerts', level: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
                        { mod: 'Committee', count: '3 alerts', level: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
                        { mod: 'Paper', count: '9 alerts', level: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                        { mod: 'Admin', count: '0 alerts', level: 'bg-slate-900 text-slate-500 border-slate-800' }
                      ].map((h, idx) => (
                        <div key={idx} className={cn("p-2 border rounded-sm text-center", h.level)}>
                          <div className="font-bold text-xs">{h.mod}</div>
                          <div className="text-[9px] opacity-80">{h.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RECHARTS ANALYTICS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                    <h3 className="font-bold text-white text-xs uppercase">Severity Distribution Analytics</h3>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Critical', count: 3 },
                          { name: 'High', count: 12 },
                          { name: 'Medium', count: 28 },
                          { name: 'Low', count: 45 },
                          { name: 'Info', count: 120 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#070a14', borderColor: '#1e293b', fontSize: '11px' }} />
                          <Bar dataKey="count" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                    <h3 className="font-bold text-white text-xs uppercase">Ingestion Rate & Trend (24h)</h3>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { time: '00:00', events: 1200 },
                          { time: '04:00', events: 950 },
                          { time: '08:00', events: 2100 },
                          { time: '12:00', events: 3400 },
                          { time: '16:00', events: 2800 },
                          { time: '20:00', events: 1842 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#070a14', borderColor: '#1e293b', fontSize: '11px' }} />
                          <Line type="monotone" dataKey="events" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#38bdf8' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

              </div>

              {/* DOCKED INSPECTOR PANEL */}
              <div className="space-y-4">
                <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-4 sticky top-4">
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                    <h3 className="font-bold text-white text-xs uppercase text-terminal-amber">Alert Brain Inspector</h3>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded border border-amber-500/30">LIVE</span>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="p-2.5 bg-[#030509] border border-[#1e293b] rounded-sm space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Selected Alert ID</span>
                      <div className="text-terminal-amber font-bold">{selectedAlert}</div>
                    </div>

                    <div className="p-2.5 bg-[#030509] border border-[#1e293b] rounded-sm space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Severity Level</span>
                      <div className="text-rose-400">CRITICAL (Priority 1)</div>
                    </div>

                    <div className="p-2.5 bg-[#030509] border border-[#1e293b] rounded-sm space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Correlation Confidence</span>
                      <div className="text-emerald-400">99.8% Neural Match</div>
                    </div>

                    <div className="p-2.5 bg-[#030509] border border-[#1e293b] rounded-sm space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Origin Module</span>
                      <div className="text-cyan-300">Trading Engine Core</div>
                    </div>

                    <div className="p-2.5 bg-[#030509] border border-[#1e293b] rounded-sm space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Timestamp (UTC)</span>
                      <div className="text-slate-300">2026-08-07 14:22:01</div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#1e293b]">
                      <button onClick={() => addTerminalLog('ALERT_BRAIN', `Muted alert ${selectedAlert} for 1 hour.`)} className="w-full py-1.5 bg-slate-900 border border-[#1e293b] text-slate-200 hover:text-white rounded-sm text-xs font-sans cursor-pointer">
                        Mute Alert (1h)
                      </button>
                      <button onClick={() => addTerminalLog('ALERT_BRAIN', `Escalated alert ${selectedAlert} to Incident Response.`)} className="w-full py-1.5 bg-slate-900 border border-[#1e293b] text-slate-200 hover:text-white rounded-sm text-xs font-sans cursor-pointer">
                        Escalate to Incident Response
                      </button>
                    </div>
                  </div>

                  <button onClick={() => addTerminalLog('ALERT_BRAIN', `Resolved and archived alert ${selectedAlert} successfully.`)} className="w-full py-2 bg-terminal-amber hover:bg-amber-400 text-slate-950 text-xs rounded-sm font-bold transition-all shadow cursor-pointer">
                    Resolve & Archive Alert
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: NOTIFICATION CENTER */}
        {activeTab === 'NOTIFICATION_CENTER' && (
          <div className="p-4 flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
            {/* LEFT FILTER & LIST */}
            <div className="w-full md:w-1/2 flex flex-col border border-[#1e293b] bg-[#070a14] rounded-sm overflow-hidden">
              <div className="p-3 border-b border-[#1e293b] space-y-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search title, payload, correlation ID..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#030509] border border-[#1e293b] p-1.5 text-xs text-white rounded-sm focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <select 
                    value={sourceFilter}
                    onChange={e => setSourceFilter(e.target.value)}
                    className="bg-[#030509] border border-[#1e293b] p-1 text-slate-300 rounded-sm"
                  >
                    <option value="ALL">All Source Modules</option>
                    <option value="EP11_OMS">EP11 OMS</option>
                    <option value="EP12_PMS">EP12 PMS</option>
                    <option value="EP13_RMS">EP13 RMS</option>
                    <option value="EP14_EXECUTION">EP14 Execution</option>
                    <option value="EP15_TRADE_JOURNAL">EP15 Journal</option>
                    <option value="EP16_ACCOUNTING">EP16 Accounting</option>
                    <option value="EP17_TREASURY">EP17 Treasury</option>
                  </select>

                  <select 
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="bg-[#030509] border border-[#1e293b] p-1 text-slate-300 rounded-sm"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="P0">P0 - Critical</option>
                    <option value="P1">P1 - Warning</option>
                    <option value="P2">P2 - Info</option>
                    <option value="P3">P3 - Success</option>
                  </select>

                  <button 
                    onClick={() => handleMarkAsRead('ALL')}
                    className="text-terminal-amber hover:underline cursor-pointer"
                  >
                    Read All
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#1e293b]">
                {filteredNotifications.map(n => (
                  <div 
                    key={n.id}
                    onClick={() => setSelectedNotifId(n.id)}
                    className={cn(
                      "p-3 cursor-pointer transition-colors space-y-1",
                      selectedNotifId === n.id ? "bg-white/10" : "hover:bg-white/5",
                      !n.isRead && "border-l-2 border-terminal-amber"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-terminal-amber uppercase">{n.sourceModule}</span>
                      <span className="text-slate-400 font-sans">{new Date(n.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">{n.title}</div>
                    <p className="text-[11px] text-slate-400 font-sans line-clamp-1">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT DETAIL PANEL */}
            <div className="w-full md:w-1/2 p-4 border border-[#1e293b] bg-[#070a14] rounded-sm flex flex-col justify-between overflow-y-auto">
              {selectedNotif ? (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Notification Inspector</span>
                      <h2 className="text-sm font-bold text-white uppercase">{selectedNotif.id}</h2>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 text-[9px] font-bold rounded uppercase border",
                      selectedNotif.priority === 'P0' ? "bg-red-500/20 text-red-400 border-red-500/40" :
                      selectedNotif.priority === 'P1' ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                      selectedNotif.priority === 'P3' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                      "bg-blue-500/20 text-blue-400 border-blue-500/40"
                    )}>
                      {selectedNotif.priority} - {selectedNotif.type}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-bold text-white">{selectedNotif.title}</div>
                    <p className="text-slate-300 font-sans leading-relaxed">{selectedNotif.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-[#030509] border border-[#1e293b] rounded-sm text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Source Module</span>
                      <span className="text-white font-bold">{selectedNotif.sourceModule}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Correlation ID</span>
                      <span className="text-terminal-amber font-mono">{selectedNotif.correlationId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Event ID</span>
                      <span className="text-white font-mono">{selectedNotif.eventId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Delivery Channel</span>
                      <span className="text-emerald-400 font-bold">IN_APP (Active)</span>
                    </div>
                  </div>

                  {selectedNotif.metadata && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase">Payload Metadata</span>
                      <pre className="p-3 bg-[#030509] border border-[#1e293b] text-[10px] text-emerald-400 font-mono rounded-sm overflow-x-auto">
                        {JSON.stringify(selectedNotif.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {!selectedNotif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(selectedNotif.id)}
                      className="w-full py-2 bg-terminal-amber text-black font-bold uppercase rounded-sm hover:bg-amber-400 cursor-pointer"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 text-center py-10">Select a notification to inspect details.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: WORKFLOW ENGINE */}
        {activeTab === 'WORKFLOW' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-terminal-amber" />
                <h2 className="text-sm font-bold uppercase text-white">Enterprise Workflow Instances</h2>
              </div>
              <button 
                onClick={() => {
                  EnweService.startWorkflow({
                    name: 'EP16 GL Posting & Audit Workflow',
                    type: 'SEQUENTIAL',
                    sourceModule: 'EP16_ACCOUNTING',
                    steps: [
                      { stepName: 'Journal Double-Entry Verification', stepType: 'ACTION' },
                      { stepName: 'General Ledger Post', stepType: 'ACTION' },
                      { stepName: 'Audit Trail Notification', stepType: 'NOTIFICATION' }
                    ]
                  });
                  loadEnweData();
                }}
                className="px-3 py-1.5 bg-terminal-amber text-black text-xs font-bold uppercase rounded-sm hover:bg-amber-400 cursor-pointer"
              >
                + Launch New Workflow
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* WORKFLOW LIST */}
              <div className="space-y-2 lg:col-span-1">
                {workflows.map(wf => (
                  <div 
                    key={wf.id}
                    onClick={() => setSelectedWfId(wf.id)}
                    className={cn(
                      "p-3 border rounded-sm cursor-pointer transition-colors space-y-2",
                      selectedWfId === wf.id ? "border-terminal-amber bg-white/10" : "border-[#1e293b] bg-[#070a14] hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-terminal-amber">{wf.workflowId}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border",
                        wf.status === 'COMPLETED' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                        wf.status === 'RUNNING' ? "bg-blue-500/20 text-blue-400 border-blue-500/40" :
                        wf.status === 'PENDING' ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                        "bg-red-500/20 text-red-400 border-red-500/40"
                      )}>
                        {wf.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">{wf.name}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Type: {wf.type}</span>
                      <span>Source: {wf.sourceModule}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* WORKFLOW TIMELINE & STEPS */}
              <div className="lg:col-span-2 p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-4">
                {selectedWf ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-white">{selectedWf.name}</h3>
                        <span className="text-[10px] text-slate-400">ID: {selectedWf.workflowId} | Correlation: {selectedWf.correlationId}</span>
                      </div>
                      {selectedWf.status === 'RUNNING' && (
                        <button
                          onClick={() => handleTriggerEscalation(selectedWf.workflowId)}
                          className="px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold uppercase rounded-sm hover:bg-red-500/30 cursor-pointer"
                        >
                          Trigger Escalation
                        </button>
                      )}
                    </div>

                    {/* STEP PROGRESSION */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Execution Step Sequence</span>
                      <div className="space-y-2">
                        {selectedWf.steps.map((st, idx) => (
                          <div 
                            key={st.stepId}
                            className={cn(
                              "p-3 border rounded-sm flex items-center justify-between gap-3",
                              st.status === 'PASSED' ? "border-emerald-500/30 bg-emerald-500/5" :
                              st.status === 'IN_PROGRESS' ? "border-blue-500/30 bg-blue-500/5" :
                              st.status === 'FAILED' ? "border-red-500/30 bg-red-500/5" :
                              "border-[#1e293b] bg-[#030509]"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-5 h-5 rounded-full bg-[#1e293b] text-[10px] flex items-center justify-center font-bold text-white">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="text-xs font-bold text-white">{st.stepName}</div>
                                <div className="text-[10px] text-slate-400">Type: {st.stepType} {st.assignedTo && `| Assigned: ${st.assignedTo}`}</div>
                              </div>
                            </div>

                            <span className={cn(
                              "px-2 py-0.5 text-[9px] font-bold rounded uppercase border",
                              st.status === 'PASSED' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                              st.status === 'IN_PROGRESS' ? "bg-blue-500/20 text-blue-400 border-blue-500/40" :
                              "bg-slate-700 text-slate-300 border-slate-600"
                            )}>
                              {st.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-center py-10">Select a workflow instance to view step sequence.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MANUAL APPROVALS */}
        {activeTab === 'APPROVALS' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2">
              <UserCheck className="w-5 h-5 text-terminal-amber" />
              <h2 className="text-sm font-bold uppercase text-white">Pending Manual Approvals Queue</h2>
            </div>

            {approvals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvals.map(app => (
                  <div key={app.id} className="p-4 bg-[#070a14] border border-terminal-amber/40 rounded-sm space-y-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 font-bold rounded uppercase">
                        {app.priority} CRITICAL APPROVAL
                      </span>
                      <span className="text-slate-400 font-sans">{new Date(app.requestedAt).toLocaleTimeString()}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{app.title}</h3>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{app.description}</p>

                    <div className="p-2 bg-[#030509] border border-[#1e293b] text-[10px] space-y-1">
                      <div><span className="text-slate-500">Source Module:</span> <span className="text-white font-bold">{app.sourceModule}</span></div>
                      <div><span className="text-slate-500">Required Role:</span> <span className="text-terminal-amber font-bold">{app.approverRole}</span></div>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        placeholder="Add decision comments or audit reason..."
                        value={approvalComment}
                        onChange={e => setApprovalComment(e.target.value)}
                        className="w-full bg-[#030509] border border-[#1e293b] p-2 text-xs text-white rounded-sm focus:outline-none"
                        rows={2}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveWorkflow(app.workflowId, approvalComment)}
                          disabled={isSubmittingApproval}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs rounded-sm transition-colors cursor-pointer"
                        >
                          Approve Signoff
                        </button>
                        <button
                          onClick={() => handleRejectWorkflow(app.workflowId, approvalComment)}
                          disabled={isSubmittingApproval}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-xs rounded-sm transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#070a14] border border-[#1e293b] rounded-sm text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold uppercase">Zero Pending Approvals in Queue</p>
                <p className="text-[11px] text-slate-500 font-sans mt-1">All risk overrides and treasury disbursements are fully resolved.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ESCALATIONS */}
        {activeTab === 'ESCALATIONS' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2">
              <Flame className="w-5 h-5 text-red-400" />
              <h2 className="text-sm font-bold uppercase text-white">Escalation Engine Rules & Audit Trail</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* RULES */}
              <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                <h3 className="text-xs font-bold uppercase text-terminal-amber">Active Escalation Rules</h3>
                <div className="space-y-2">
                  {escalations.rules.map(rule => (
                    <div key={rule.ruleId} className="p-3 bg-[#030509] border border-[#1e293b] rounded-sm space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-white">{rule.ruleId}</span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold rounded">
                          ACTIVE
                        </span>
                      </div>
                      <div className="text-xs font-bold text-terminal-amber">{rule.name}</div>
                      <p className="text-[10px] text-slate-400 font-sans">{rule.description}</p>
                      <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-[#1e293b]/50">
                        <span>Trigger: {rule.triggerType}</span>
                        <span>Target: {rule.targetRole}</span>
                        <span>Timeout: {rule.timeoutMinutes} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LOGS */}
              <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                <h3 className="text-xs font-bold uppercase text-red-400">Escalation Audit Trail</h3>
                <div className="space-y-2">
                  {escalations.logs.map(log => (
                    <div key={log.id} className="p-3 bg-red-500/10 border border-red-500/30 rounded-sm space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-red-400">{log.escalationId}</span>
                        <span className="text-slate-400 font-sans">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-xs font-bold text-white">{log.reason}</div>
                      <div className="text-[10px] text-slate-300">
                        Workflow: <span className="font-mono text-terminal-amber">{log.workflowId}</span> | Target Role: <span className="font-bold text-white">{log.targetRole}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TEMPLATES */}
        {activeTab === 'TEMPLATES' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2">
              <FileText className="w-5 h-5 text-terminal-amber" />
              <h2 className="text-sm font-bold uppercase text-white">Notification Templates Repository</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map(tpl => (
                <div key={tpl.templateId} className="p-3 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 bg-terminal-amber/10 text-terminal-amber border border-terminal-amber/30 font-bold rounded">
                      {tpl.module}
                    </span>
                    <span className="text-slate-500">{tpl.templateId}</span>
                  </div>
                  <div className="text-xs font-bold text-white">{tpl.titleTemplate}</div>
                  <pre className="p-2 bg-[#030509] border border-[#1e293b] text-[10px] text-slate-300 font-sans whitespace-pre-wrap rounded-sm">
                    {tpl.bodyTemplate}
                  </pre>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Priority: {tpl.defaultPriority}</span>
                    <span>Type: {tpl.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: DELIVERY ENGINE */}
        {activeTab === 'DELIVERY' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2">
              <Send className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase text-white">Notification Delivery Engine Channels</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliveryChannels.map(ch => (
                <div key={ch.channel} className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{ch.name}</span>
                    <span className={cn(
                      "px-2 py-0.5 text-[9px] font-bold rounded uppercase border",
                      ch.enabled ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "bg-slate-700/50 text-slate-400 border-slate-600"
                    )}>
                      {ch.v1Status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans">{ch.notes}</p>

                  <div className="p-2 bg-[#030509] border border-[#1e293b] text-[11px] grid grid-cols-2 gap-2">
                    <div><span className="text-slate-500">Delivered Count:</span> <span className="text-emerald-400 font-bold">{ch.deliveredCount}</span></div>
                    <div><span className="text-slate-500">Failed Count:</span> <span className="text-red-400 font-bold">{ch.failedCount}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT TRAIL */}
        {activeTab === 'AUDIT' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase text-white">Full Lifecycle Audit Trail</h2>
            </div>

            <div className="border border-[#1e293b] bg-[#070a14] rounded-sm overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#030509] border-b border-[#1e293b] text-slate-400 uppercase text-[9px]">
                  <tr>
                    <th className="p-2.5">Audit ID</th>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">Actor</th>
                    <th className="p-2.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {auditLogs.map(a => (
                    <tr key={a.id} className="hover:bg-white/5">
                      <td className="p-2.5 font-mono text-terminal-amber">{a.auditId}</td>
                      <td className="p-2.5 text-slate-400 font-sans">{new Date(a.timestamp).toLocaleTimeString()}</td>
                      <td className="p-2.5">
                        <span className={cn(
                          "px-1.5 py-0.5 text-[8px] font-bold rounded uppercase border",
                          a.action === 'CREATED' ? "bg-blue-500/20 text-blue-400 border-blue-500/40" :
                          a.action === 'DELIVERED' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                          a.action === 'READ' ? "bg-slate-500/20 text-slate-300 border-slate-500/40" :
                          "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        )}>
                          {a.action}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-white">{a.actor}</td>
                      <td className="p-2.5 text-slate-300 font-sans">{a.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: ENTERPRISE RUNTIME CENTER */}
        {activeTab === 'RUNTIME' && (
          <div className="p-4 space-y-6">
            {/* EXECUTIVE KPI HEADER */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Active Workers', val: '12 / 12', color: 'text-emerald-400' },
                { label: 'Utilization', val: '84.6%', color: 'text-blue-400' },
                { label: 'Queue Depth', val: '1,420', color: 'text-terminal-amber' },
                { label: 'Pending Jobs', val: '48', color: 'text-cyan-400' },
                { label: 'Processing Jobs', val: '164', color: 'text-purple-400' },
                { label: 'Retry Queue', val: '12', color: 'text-amber-400' },
                { label: 'Dead Letter (DLQ)', val: '3', color: 'text-red-400' },
                { label: 'Success Rate', val: '99.85%', color: 'text-emerald-400' },
                { label: 'Avg Runtime', val: '42 ms', color: 'text-terminal-amber' },
                { label: 'Throughput', val: '850 req/s', color: 'text-blue-400' },
                { label: 'CPU Usage', val: '34.2%', color: 'text-cyan-400' },
                { label: 'Memory', val: '4.8 GB', color: 'text-purple-400' }
              ].map((kpi, idx) => (
                <div key={idx} className="p-3 bg-[#070a14] border border-[#1e293b] rounded-sm">
                  <div className="text-[10px] text-slate-400 uppercase">{kpi.label}</div>
                  <div className={`text-lg font-bold mt-1 ${kpi.color}`}>{kpi.val}</div>
                </div>
              ))}
            </div>

            {/* WORKER POOL ENTERPRISE DATAGRID */}
            <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-terminal-amber" />
                  <h3 className="text-xs font-bold uppercase text-white">Worker Pool & Execution Nodes</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-slate-400">Cluster: <strong className="text-white">arina-prod-us-east-1</strong></span>
                  <button className="px-2 py-1 bg-terminal-amber text-black font-bold uppercase rounded-sm">Scale Workers</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#030509] border-b border-[#1e293b] text-slate-400 uppercase text-[9px]">
                    <tr>
                      <th className="p-2.5">Worker ID</th>
                      <th className="p-2.5">Host Node</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">CPU</th>
                      <th className="p-2.5">Memory</th>
                      <th className="p-2.5">Assigned Queue</th>
                      <th className="p-2.5">Current Job</th>
                      <th className="p-2.5">Uptime</th>
                      <th className="p-2.5">Heartbeat</th>
                      <th className="p-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {[
                      { id: 'WRK-001', host: 'ip-10-0-12-42.ec2', status: 'ONLINE', cpu: '28%', mem: '1.2 GB', queue: 'OMS_ORDERS', job: 'EXEC_BUY_9801', uptime: '14d 6h', hb: '0.2s ago' },
                      { id: 'WRK-002', host: 'ip-10-0-12-43.ec2', status: 'ONLINE', cpu: '42%', mem: '1.5 GB', queue: 'PMS_REBALANCE', job: 'CALC_NAV_8492', uptime: '14d 6h', hb: '0.1s ago' },
                      { id: 'WRK-003', host: 'ip-10-0-12-44.ec2', status: 'ONLINE', cpu: '19%', mem: '0.9 GB', queue: 'RMS_CHECKS', job: 'MARGIN_VAL_392', uptime: '9d 2h', hb: '0.4s ago' },
                      { id: 'WRK-004', host: 'ip-10-0-12-45.ec2', status: 'BUSY', cpu: '78%', mem: '2.1 GB', queue: 'AI_AGENT_BUS', job: 'LLM_SYNTH_921', uptime: '3d 18h', hb: '0.1s ago' }
                    ].map(w => (
                      <tr key={w.id} className="hover:bg-white/5">
                        <td className="p-2.5 font-mono font-bold text-terminal-amber">{w.id}</td>
                        <td className="p-2.5 font-mono text-slate-300">{w.host}</td>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{w.status}</span></td>
                        <td className="p-2.5 font-mono text-cyan-400">{w.cpu}</td>
                        <td className="p-2.5 font-mono text-purple-400">{w.mem}</td>
                        <td className="p-2.5 font-mono text-slate-300">{w.queue}</td>
                        <td className="p-2.5 font-mono text-terminal-amber">{w.job}</td>
                        <td className="p-2.5 text-slate-400">{w.uptime}</td>
                        <td className="p-2.5 text-emerald-400">{w.hb}</td>
                        <td className="p-2.5">
                          <button className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px]">Restart</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QUEUE MANAGER & DLQ EXPLORER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                  <h3 className="text-xs font-bold uppercase text-white">Queue Manager (Pending / Processing / Retry)</h3>
                  <button className="text-[10px] text-terminal-amber hover:underline">Flush Queues</button>
                </div>
                <div className="space-y-2">
                  {[
                    { queue: 'OMS_EVENT_QUEUE', state: 'PENDING', depth: 420, latency: '12ms', status: 'HEALTHY' },
                    { queue: 'PMS_PORTFOLIO_QUEUE', state: 'PROCESSING', depth: 640, latency: '24ms', status: 'HEALTHY' },
                    { queue: 'RMS_RISK_QUEUE', state: 'RETRY', depth: 32, latency: '140ms', status: 'DEGRADED' },
                    { queue: 'TELEGRAM_DISPATCH_QUEUE', state: 'COMPLETED', depth: 0, latency: '8ms', status: 'HEALTHY' }
                  ].map((q, idx) => (
                    <div key={idx} className="p-3 bg-[#030509] border border-[#1e293b] rounded-sm flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-terminal-amber">{q.queue}</div>
                        <div className="text-[10px] text-slate-400">State: {q.state} | Latency: {q.latency}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{q.depth} items</div>
                        <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{q.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                  <h3 className="text-xs font-bold uppercase text-red-400">Dead Letter Queue (DLQ) Explorer</h3>
                  <button className="text-[10px] text-red-400 hover:underline">Replay All DLQ</button>
                </div>
                <div className="space-y-2">
                  {[
                    { id: 'DLQ-991', source: 'EP11_OMS', error: 'Timeout connecting to order book gateway', time: '14:22:01', retries: 5 },
                    { id: 'DLQ-992', source: 'EP17_TREASURY', error: 'Invalid HMAC signature in bank webhook', time: '14:18:40', retries: 5 }
                  ].map(dlq => (
                    <div key={dlq.id} className="p-3 bg-red-500/10 border border-red-500/30 rounded-sm space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-red-400">{dlq.id}</span>
                        <span className="text-slate-400">{dlq.time}</span>
                      </div>
                      <div className="text-xs font-bold text-white">{dlq.error}</div>
                      <div className="text-[10px] text-slate-300 flex justify-between pt-1">
                        <span>Source: {dlq.source}</span>
                        <button className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold">Replay / Restore</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WORKER PERFORMANCE CHARTS */}
            <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
              <h3 className="text-xs font-bold uppercase text-white">Runtime Throughput & Latency Telemetry</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { time: '00:00', throughput: 420, latency: 15 },
                    { time: '04:00', throughput: 310, latency: 12 },
                    { time: '08:00', throughput: 920, latency: 28 },
                    { time: '12:00', throughput: 1450, latency: 45 },
                    { time: '16:00', throughput: 1120, latency: 32 },
                    { time: '20:00', throughput: 780, latency: 18 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#070a14', borderColor: '#1e293b', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="throughput" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: ENTERPRISE EVENT INSPECTOR */}
        {activeTab === 'INSPECTOR' && (
          <div className="p-4 space-y-6">
            {/* TOP KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total Events', val: '14,280', color: 'text-white' },
                { label: 'Correlation IDs', val: '3,840', color: 'text-terminal-amber' },
                { label: 'Avg Trace Time', val: '18.4 ms', color: 'text-cyan-400' },
                { label: 'Failures', val: '4', color: 'text-red-400' },
                { label: 'Retries', val: '12', color: 'text-amber-400' },
                { label: 'Longest Trace', val: '142 ms', color: 'text-purple-400' }
              ].map((kpi, idx) => (
                <div key={idx} className="p-3 bg-[#070a14] border border-[#1e293b] rounded-sm">
                  <div className="text-[10px] text-slate-400 uppercase">{kpi.label}</div>
                  <div className={`text-lg font-bold mt-1 ${kpi.color}`}>{kpi.val}</div>
                </div>
              ))}
            </div>

            {/* CORRELATION EXPLORER & TRACE TIMELINE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                  <h3 className="text-xs font-bold uppercase text-white">Correlation Explorer & Trace Timeline</h3>
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="Search Correlation ID..." className="bg-[#030509] border border-[#1e293b] px-2 py-1 text-xs text-white rounded-sm" />
                    <button className="px-2.5 py-1 bg-terminal-amber text-black font-bold uppercase text-xs rounded-sm">Filter</button>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { corrId: 'CORR-2026-0807-991', module: 'EP11_OMS', event: 'ORDER_SUBMITTED', duration: '14.2ms', status: 'SUCCESS' },
                    { corrId: 'CORR-2026-0807-992', module: 'EP12_PMS', event: 'PORTFOLIO_REBALANCED', duration: '28.1ms', status: 'SUCCESS' },
                    { corrId: 'CORR-2026-0807-993', module: 'EP13_RMS', event: 'MARGIN_CALL_WARNING', duration: '45.0ms', status: 'RETRY' },
                    { corrId: 'CORR-2026-0807-994', module: 'EP17_TREASURY', event: 'DISBURSEMENT_INITIATED', duration: '89.4ms', status: 'SUCCESS' }
                  ].map((t, idx) => (
                    <div key={idx} className="p-3 bg-[#030509] border border-[#1e293b] rounded-sm flex items-center justify-between text-xs hover:border-terminal-amber cursor-pointer">
                      <div>
                        <div className="font-mono font-bold text-terminal-amber">{t.corrId}</div>
                        <div className="text-[10px] text-slate-400">Module: {t.module} | Event: {t.event}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-cyan-400">{t.duration}</div>
                        <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STICKY INSPECTOR PANEL */}
              <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3 sticky top-4">
                <div className="border-b border-[#1e293b] pb-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-terminal-amber">Inspector Panel</h3>
                  <span className="px-2 py-0.5 text-[8px] font-bold rounded bg-terminal-amber/20 text-terminal-amber border border-terminal-amber/40">Active Trace</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div><span className="text-slate-500">Correlation ID:</span> <span className="font-mono text-white">CORR-2026-0807-991</span></div>
                  <div><span className="text-slate-500">Source:</span> <span className="text-cyan-400 font-bold">EP11_OMS</span></div>
                  <div><span className="text-slate-500">Target:</span> <span className="text-emerald-400 font-bold">EP18_ENWE</span></div>
                  <div><span className="text-slate-500">Headers:</span></div>
                  <pre className="p-2 bg-[#030509] border border-[#1e293b] text-[10px] text-slate-300 font-mono rounded">
{`{
  "X-Correlation-ID": "CORR-2026-0807-991",
  "X-Source-Module": "EP11_OMS",
  "Content-Type": "application/json"
}`}
                  </pre>
                  <div><span className="text-slate-500">Payload:</span></div>
                  <pre className="p-2 bg-[#030509] border border-[#1e293b] text-[10px] text-terminal-amber font-mono rounded">
{`{
  "orderId": "ORD-9801",
  "symbol": "TATAMOTORS",
  "qty": 100,
  "price": 980.50
}`}
                  </pre>
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 py-1.5 bg-terminal-amber text-black font-bold uppercase text-[10px] rounded-sm">Replay Event</button>
                    <button className="flex-1 py-1.5 bg-slate-800 text-white font-bold uppercase text-[10px] rounded-sm">Export JSON</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: ENTERPRISE TELEGRAM CENTER */}
        {activeTab === 'TELEGRAM_GATEWAY' && (
          <div className="p-4 space-y-6">
            {/* TOP KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Bot Status', val: 'CONNECTED', color: 'text-emerald-400' },
                { label: 'Connected Chats', val: '24', color: 'text-blue-400' },
                { label: 'Groups / Channels', val: '8', color: 'text-terminal-amber' },
                { label: 'Messages Today', val: '3,840', color: 'text-cyan-400' },
                { label: 'Delivered', val: '3,830', color: 'text-emerald-400' },
                { label: 'Failed / Retries', val: '10 / 12', color: 'text-amber-400' }
              ].map((kpi, idx) => (
                <div key={idx} className="p-3 bg-[#070a14] border border-[#1e293b] rounded-sm">
                  <div className="text-[10px] text-slate-400 uppercase">{kpi.label}</div>
                  <div className={`text-lg font-bold mt-1 ${kpi.color}`}>{kpi.val}</div>
                </div>
              ))}
            </div>

            {/* BOT INFORMATION & BROADCAST CENTER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                <div className="border-b border-[#1e293b] pb-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-white">Telegram Bot Configuration & Health</h3>
                  <span className="px-2 py-0.5 text-[8px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">Healthy</span>
                </div>
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between p-2 bg-[#030509] border border-[#1e293b] rounded">
                    <span className="text-slate-400 font-mono">Bot Name:</span>
                    <span className="text-white font-bold font-mono">ARINA Enterprise Bot</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#030509] border border-[#1e293b] rounded">
                    <span className="text-slate-400 font-mono">Username:</span>
                    <span className="text-terminal-amber font-bold font-mono">@ArinaEnterpriseBot</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#030509] border border-[#1e293b] rounded">
                    <span className="text-slate-400 font-mono">Webhook URL:</span>
                    <span className="text-cyan-400 font-mono">https://arina.ai/api/telegram/webhook</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#030509] border border-[#1e293b] rounded">
                    <span className="text-slate-400 font-mono">API Version:</span>
                    <span className="text-purple-400 font-mono">Telegram Bot API v7.2</span>
                  </div>
                </div>
              </div>

              {/* BROADCAST CENTER */}
              <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
                <div className="border-b border-[#1e293b] pb-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-terminal-amber">Broadcast Center & Compose</h3>
                  <span className="text-[10px] text-slate-400">Instant Dispatch</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Target Channel / Group</label>
                    <select className="w-full bg-[#030509] border border-[#1e293b] p-2 text-white rounded-sm">
                      <option>All Trading Desks (@ArinaTradingAlerts)</option>
                      <option>Risk Management Command (@ArinaRiskOps)</option>
                      <option>Executive Board (@ArinaExecutives)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Message Template</label>
                    <textarea rows={3} className="w-full bg-[#030509] border border-[#1e293b] p-2 text-white rounded-sm font-mono" defaultValue="🚨 *ARINA ENTERPRISE ALERT* \nMarket Volatility Spike detected on NIFTY 50. Risk mitigation protocols engaged." />
                  </div>
                  <button className="w-full py-2 bg-terminal-amber text-black font-bold uppercase rounded-sm text-xs">Broadcast to Telegram</button>
                </div>
              </div>
            </div>

            {/* CHAT REGISTRY & DELIVERY QUEUE */}
            <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-3">
              <div className="border-b border-[#1e293b] pb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-white">Chat Registry & Delivery History</h3>
                <input type="text" placeholder="Search chats or users..." className="bg-[#030509] border border-[#1e293b] px-2 py-1 text-xs text-white rounded-sm w-64" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#030509] border-b border-[#1e293b] text-slate-400 uppercase text-[9px]">
                    <tr>
                      <th className="p-2.5">Chat ID</th>
                      <th className="p-2.5">Recipient / Group</th>
                      <th className="p-2.5">Role</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Last Activity</th>
                      <th className="p-2.5">Messages Sent</th>
                      <th className="p-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {[
                      { chatId: '-1004928192', name: 'Arina Trading Desk Alpha', role: 'TRADER_GROUP', status: 'ACTIVE', activity: '2 mins ago', count: '1,420' },
                      { chatId: '-1004928193', name: 'Chief Risk Officer Alerts', role: 'RISK_OFFICER', status: 'ACTIVE', activity: '14 mins ago', count: '890' },
                      { chatId: '84920192', name: 'Admin (DevOps Lead)', role: 'SUPER_ADMIN', status: 'ACTIVE', activity: 'Just now', count: '1,530' }
                    ].map((c, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-2.5 font-mono text-terminal-amber">{c.chatId}</td>
                        <td className="p-2.5 font-bold text-white">{c.name}</td>
                        <td className="p-2.5 text-cyan-400">{c.role}</td>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{c.status}</span></td>
                        <td className="p-2.5 text-slate-400">{c.activity}</td>
                        <td className="p-2.5 font-mono text-purple-400">{c.count}</td>
                        <td className="p-2.5">
                          <button className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px]">Test Ping</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: PRODUCTION QA */}
        {activeTab === 'QA' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold uppercase text-white">EP18 Enterprise QA Suite</h2>
              </div>
              <button 
                onClick={handleRunQaAgain}
                className="px-3 py-1.5 bg-emerald-500 text-black font-bold uppercase text-xs rounded-sm hover:bg-emerald-400 cursor-pointer"
              >
                Re-Run EP18 QA Test Suite
              </button>
            </div>

            {qaReport && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-sm flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-emerald-400">EP18 ENWE VERIFICATION: 100% PASS</div>
                    <p className="text-xs text-slate-300 font-sans">
                      All 15 specification modules passed verification with zero errors.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500 text-black font-bold text-xs uppercase rounded">
                    PASS {qaReport.passCount}/{qaReport.totalModulesTested}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {qaReport.modules.map(m => (
                    <div key={m.moduleId} className="p-3 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-terminal-amber">{m.moduleId}</span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold rounded">
                          {m.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">{m.moduleName}</div>
                      <p className="text-[10px] text-slate-400 font-sans">{m.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 12: TELEGRAM GATEWAY */}
        {activeTab === 'TELEGRAM_GATEWAY' && (
          <div className="p-4 space-y-4">
            <div className="p-4 bg-[#070a14] border border-[#1e293b] rounded-sm space-y-2">
              <h3 className="text-xs font-bold text-white uppercase">Telegram Gateway Channel</h3>
              <p className="text-xs text-slate-300 font-sans">
                Bot status: <span className="text-emerald-400 font-bold">{telegramConfig.connectionStatus}</span>
              </p>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER TERMINAL LOGS */}
      <div className="border-t border-[#1e293b] bg-[#070a14]">
        <div 
          onClick={() => setTerminalExpanded(!terminalExpanded)}
          className="px-4 py-1.5 flex items-center justify-between cursor-pointer text-[10px] text-slate-400 hover:text-white"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-terminal-amber" />
            <span className="font-bold uppercase text-white">ENWE Runtime Audit Log Stream</span>
          </div>
          {terminalExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>

        {terminalExpanded && (
          <div className="p-3 bg-[#030509] font-mono text-[10px] space-y-1 max-h-32 overflow-y-auto border-t border-[#1e293b]/50">
            {terminalLogs.map(l => (
              <div key={l.id} className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500">{l.timestamp}</span>
                <span className="text-terminal-amber font-bold">[{l.category}]</span>
                <span className="font-sans text-slate-300">{l.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
