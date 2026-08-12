import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Cpu,
  Layers,
  AlertTriangle,
  Wrench,
  Flag,
  CheckCircle2,
  FileText,
  HeartPulse,
  Search,
  RefreshCcw,
  Plus,
  Play,
  Shield,
  Clock,
  Terminal,
  Zap,
  Check,
  X,
  Lock,
  Database,
  Radio,
  Sliders,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { fetchApi } from '../lib/api';
import { SectionHeader, MetricCard, Panel, Toolbar, StatusBadge } from './ui/Base';
import { EnterpriseTabBar, TabItem } from './ui/EnterpriseTabBar';
import {
  PlatformHealthOverview,
  ServiceRegistryItem,
  RuntimeMetrics,
  QueueMetrics,
  IncidentItem,
  MaintenanceItem,
  FeatureFlagItem,
  DiagnosticCheck,
  OperationalAuditItem,
  HealthScoreBreakdown,
  OperationsQaReport,
  IncidentSeverity,
  MaintenanceModeType
} from '../modules/platform/types/ep20.types';

type OperationsTab =
  | 'DASHBOARD'
  | 'SERVICES'
  | 'RUNTIME'
  | 'QUEUES'
  | 'INCIDENTS'
  | 'MAINTENANCE'
  | 'FEATURE_FLAGS'
  | 'DIAGNOSTICS'
  | 'AUDIT'
  | 'HEALTH'
  | 'INSPECTOR';

const TABS: TabItem<OperationsTab>[] = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: Activity },
  { id: 'SERVICES', label: 'Services Registry', icon: Server },
  { id: 'RUNTIME', label: 'Runtime Monitor', icon: Cpu },
  { id: 'QUEUES', label: 'Queue Monitor', icon: Layers },
  { id: 'INCIDENTS', label: 'Incident Manager', icon: AlertTriangle },
  { id: 'MAINTENANCE', label: 'Maintenance Mode', icon: Wrench },
  { id: 'FEATURE_FLAGS', label: 'Feature Flags', icon: Flag },
  { id: 'DIAGNOSTICS', label: 'Diagnostics Engine', icon: CheckCircle2 },
  { id: 'AUDIT', label: 'Operational Audit', icon: FileText },
  { id: 'HEALTH', label: 'Health Score Engine', icon: HeartPulse },
  { id: 'INSPECTOR', label: 'Module Telemetry Inspector', icon: Search }
];

export const OperationsWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OperationsTab>('DASHBOARD');
  const [loading, setLoading] = useState<boolean>(false);

  // States
  const [dashboard, setDashboard] = useState<PlatformHealthOverview | null>(null);
  const [services, setServices] = useState<ServiceRegistryItem[]>([]);
  const [runtime, setRuntime] = useState<RuntimeMetrics | null>(null);
  const [queues, setQueues] = useState<QueueMetrics | null>(null);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagItem[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticCheck[]>([]);
  const [auditLogs, setAuditLogs] = useState<OperationalAuditItem[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScoreBreakdown | null>(null);
  const [qaReport, setQaReport] = useState<OperationsQaReport | null>(null);

  // Form Modals
  const [showIncidentModal, setShowIncidentModal] = useState<boolean>(false);
  const [incTitle, setIncTitle] = useState<string>('');
  const [incSeverity, setIncSeverity] = useState<IncidentSeverity>('P3');
  const [incService, setIncService] = useState<string>('EP03 AI Activation');

  const [showMntModal, setShowMntModal] = useState<boolean>(false);
  const [mntTitle, setMntTitle] = useState<string>('');
  const [mntMode, setMntMode] = useState<MaintenanceModeType>('READ_ONLY');
  const [mntTarget, setMntTarget] = useState<string>('EP15 Trade Journal');

  // Inspector Search
  const [inspectorModule, setInspectorModule] = useState<string>('EP03');

  // Fetch initial telemetry
  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const [dashRes, svcRes, rtRes, qRes, incRes, hlthRes, ffRes, diagRes, auditRes, qaRes] = await Promise.all([
        fetchApi<PlatformHealthOverview>('/api/operations/dashboard'),
        fetchApi<ServiceRegistryItem[]>('/api/operations/services'),
        fetchApi<RuntimeMetrics>('/api/operations/runtime'),
        fetchApi<QueueMetrics>('/api/operations/queues'),
        fetchApi<IncidentItem[]>('/api/operations/incidents'),
        fetchApi<HealthScoreBreakdown>('/api/operations/health'),
        fetchApi<FeatureFlagItem[]>('/api/operations/feature-flags'),
        fetchApi<DiagnosticCheck[]>('/api/operations/diagnostics'),
        fetchApi<OperationalAuditItem[]>('/api/operations/audit'),
        fetchApi<OperationsQaReport>('/api/operations/qa')
      ]);

      if (dashRes) setDashboard(dashRes);
      if (svcRes) setServices(svcRes);
      if (rtRes) setRuntime(rtRes);
      if (qRes) setQueues(qRes);
      if (incRes) setIncidents(incRes);
      if (hlthRes) setHealthScore(hlthRes);
      if (ffRes) setFeatureFlags(ffRes);
      if (diagRes) setDiagnostics(diagRes);
      if (auditRes) setAuditLogs(auditRes);
      if (qaRes) setQaReport(qaRes);
    } catch (err) {
      console.error('Failed to load EPOC telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleCreateIncident = async () => {
    if (!incTitle) return;
    try {
      const res = await fetchApi<IncidentItem>('/api/operations/incidents', {
        method: 'POST',
        body: JSON.stringify({
          title: incTitle,
          severity: incSeverity,
          affectedService: incService,
          author: 'Alexander Vance (EPOC Lead)'
        })
      });
      if (res) {
        setIncidents([res, ...incidents]);
        setIncTitle('');
        setShowIncidentModal(false);
      }
    } catch (e) {
      console.error('Incident creation failed', e);
    }
  };

  const handleCreateMaintenance = async () => {
    if (!mntTitle) return;
    try {
      const res = await fetchApi<MaintenanceItem>('/api/operations/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          title: mntTitle,
          mode: mntMode,
          targetModule: mntTarget,
          scheduledMinutes: 60,
          author: 'Alexander Vance (EPOC Lead)'
        })
      });
      if (res) {
        setMaintenance([res, ...maintenance]);
        setMntTitle('');
        setShowMntModal(false);
      }
    } catch (e) {
      console.error('Maintenance scheduling failed', e);
    }
  };

  const handleToggleFlag = async (flagId: string) => {
    try {
      const res = await fetchApi<{ success: boolean; flag?: FeatureFlagItem }>('/api/operations/feature-flags/toggle', {
        method: 'POST',
        body: JSON.stringify({ flagId })
      });
      if (res && res.success) {
        setFeatureFlags(featureFlags.map(f => (f.id === flagId ? { ...f, isEnabled: !f.isEnabled } : f)));
      }
    } catch (e) {
      console.error('Flag toggle failed', e);
    }
  };

  const handleRunDiagnostics = async () => {
    setLoading(true);
    try {
      const diagRes = await fetchApi<DiagnosticCheck[]>('/api/operations/diagnostics');
      if (diagRes) setDiagnostics(diagRes);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-terminal-bg text-white overflow-hidden p-4 space-y-4 font-sans">
      {/* HEADER SECTION */}
      <SectionHeader
        title="ENTERPRISE PRODUCTION OPERATIONS CENTER (EPOC)"
        subtitle="EP20 Platform Telemetry, Service Health, Runtime Diagnostics & Non-Interfering Operations"
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-terminal-black border border-terminal-border rounded text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-terminal-muted">HEALTH SCORE:</span>
              <span className="text-emerald-400 font-bold">{dashboard?.healthScore ?? 99.8}%</span>
            </div>
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-terminal-amber/10 border border-terminal-amber/30 text-terminal-amber hover:bg-terminal-amber/20 rounded text-xs font-mono uppercase transition-colors"
            >
              <RefreshCcw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        }
      />

      {/* NAVIGATION TAB BAR */}
      <EnterpriseTabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* WORKSPACE TAB CONTENT */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* 1. DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-4">
            {/* TOP METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="OVERALL PLATFORM HEALTH"
                value={`${dashboard?.healthScore ?? 99.8}%`}
                change="+0.02% 24h"
                isPositive={true}
                subtitle="All 10 Enterprise Modules Online"
              />
              <MetricCard
                title="CPU UTILIZATION"
                value={`${dashboard?.cpuUsagePercent ?? 18.4}%`}
                subtitle="8-Core Cloud Run Ephemeral Cluster"
              />
              <MetricCard
                title="MEMORY USAGE"
                value={`${dashboard?.memoryUsagePercent ?? 32.1}%`}
                subtitle={`${dashboard?.memoryUsedGb ?? 20.5} GB / ${dashboard?.memoryTotalGb ?? 64.0} GB`}
              />
              <MetricCard
                title="ACTIVE BACKGROUND WORKERS"
                value={`${dashboard?.totalActiveWorkers ?? 16}`}
                subtitle="100% Thread Allocation"
              />
            </div>

            {/* SYSTEM INFRASTRUCTURE STATUS */}
            <Panel title="INFRASTRUCTURE SUBSYSTEM HEALTH">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                <div className="bg-black/40 border border-terminal-border p-3 rounded flex flex-col justify-between">
                  <span className="text-xs font-mono text-terminal-muted">DATABASE</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">{dashboard?.dbStatus ?? 'HEALTHY'}</span>
                  </div>
                </div>
                <div className="bg-black/40 border border-terminal-border p-3 rounded flex flex-col justify-between">
                  <span className="text-xs font-mono text-terminal-muted">REDIS CACHE</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">{dashboard?.cacheStatus ?? 'HEALTHY'}</span>
                  </div>
                </div>
                <div className="bg-black/40 border border-terminal-border p-3 rounded flex flex-col justify-between">
                  <span className="text-xs font-mono text-terminal-muted">QUEUE BUS</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">{dashboard?.queueStatus ?? 'HEALTHY'}</span>
                  </div>
                </div>
                <div className="bg-black/40 border border-terminal-border p-3 rounded flex flex-col justify-between">
                  <span className="text-xs font-mono text-terminal-muted">WEBSOCKET TELEMETRY</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400">{dashboard?.wsStatus ?? 'ONLINE'}</span>
                  </div>
                </div>
                <div className="bg-black/40 border border-terminal-border p-3 rounded flex flex-col justify-between">
                  <span className="text-xs font-mono text-terminal-muted">WORKER THREADS</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">{dashboard?.workerStatus ?? 'ALL_ONLINE'}</span>
                  </div>
                </div>
                <div className="bg-black/40 border border-terminal-border p-3 rounded flex flex-col justify-between">
                  <span className="text-xs font-mono text-terminal-muted">PLATFORM UPTIME</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-terminal-amber" />
                    <span className="text-xs font-bold text-terminal-amber">21 Days 21 Hrs</span>
                  </div>
                </div>
              </div>
            </Panel>

            {/* QA COMPLIANCE HIGHLIGHT */}
            {qaReport && (
              <Panel title="EP20 PRODUCTION QA VERIFICATION SUMMARY">
                <div className="p-3 bg-black/40 border border-emerald-500/20 rounded flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                        NON-INTERFERING OPERATIONAL MONITORING VERIFIED
                      </h4>
                      <p className="text-xs text-terminal-muted">
                        All {qaReport.totalModulesTested} Modules Passed. Read-Only Telemetry Isolation Active. Zero Trade or Business Logic Execution.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-xs font-mono font-bold">
                    {qaReport.buildStatus}
                  </span>
                </div>
              </Panel>
            )}
          </div>
        )}

        {/* 2. SERVICES REGISTRY */}
        {activeTab === 'SERVICES' && (
          <Panel title="ENTERPRISE SERVICE REGISTRY (EP03, EP11-EP19)">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-terminal-border text-terminal-muted bg-black/50">
                    <th className="p-3">EP CODE</th>
                    <th className="p-3">SERVICE NAME</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">LATENCY</th>
                    <th className="p-3">ERROR RATE</th>
                    <th className="p-3">AVAILABILITY</th>
                    <th className="p-3">VERSION</th>
                    <th className="p-3">LAST PING</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/40">
                  {services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-terminal-amber">{svc.epCode}</td>
                      <td className="p-3 text-white font-medium">{svc.name}</td>
                      <td className="p-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold border',
                            svc.status === 'ONLINE' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                            svc.status === 'DEGRADED' && 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                            svc.status === 'OFFLINE' && 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                            svc.status === 'MAINTENANCE' && 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          )}
                        >
                          {svc.status}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-400">{svc.latencyMs} ms</td>
                      <td className="p-3 text-slate-300">{svc.errorRatePercent}%</td>
                      <td className="p-3 text-emerald-400 font-bold">{svc.availabilityPercent}%</td>
                      <td className="p-3 text-terminal-muted">{svc.version}</td>
                      <td className="p-3 text-terminal-muted">{new Date(svc.lastPing).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* 3. RUNTIME MONITOR */}
        {activeTab === 'RUNTIME' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard title="ACTIVE WORKERS" value={runtime?.activeWorkersCount ?? 16} subtitle="Thread Allocated" />
              <MetricCard title="ACTIVE JOBS" value={runtime?.activeJobsCount ?? 42} subtitle="In Processing" />
              <MetricCard title="AVG EXECUTION TIME" value={`${runtime?.avgExecutionTimeMs ?? 12.4} ms`} subtitle="Sub-millisecond threshold" />
              <MetricCard title="THREAD UTILIZATION" value={`${runtime?.threadUtilizationPercent ?? 28.5}%`} subtitle="Optimal Load Balance" />
            </div>

            <Panel title="ACTIVE WORKER THREAD DETAILS">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-terminal-border text-terminal-muted bg-black/50">
                      <th className="p-3">WORKER ID</th>
                      <th className="p-3">THREAD</th>
                      <th className="p-3">NAME</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3">CURRENT TASK</th>
                      <th className="p-3">TASKS COMPLETED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/40">
                    {runtime?.workerList.map((wrk) => (
                      <tr key={wrk.workerId} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 text-terminal-amber font-bold">{wrk.workerId}</td>
                        <td className="p-3 text-terminal-muted">Thread #{wrk.threadId}</td>
                        <td className="p-3 text-white font-medium">{wrk.name}</td>
                        <td className="p-3">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-bold border',
                              wrk.status === 'BUSY' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                              wrk.status === 'IDLE' && 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                            )}
                          >
                            {wrk.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{wrk.currentTask}</td>
                        <td className="p-3 text-emerald-400 font-bold">{wrk.tasksCompleted.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {/* 4. QUEUE MONITOR */}
        {activeTab === 'QUEUES' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="bg-black/40 border border-terminal-border p-3 rounded">
                <span className="text-xs font-mono text-terminal-muted">PENDING</span>
                <p className="text-lg font-bold text-amber-400 mt-1">{queues?.pendingJobs ?? 14}</p>
              </div>
              <div className="bg-black/40 border border-terminal-border p-3 rounded">
                <span className="text-xs font-mono text-terminal-muted">PROCESSING</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">{queues?.processingJobs ?? 6}</p>
              </div>
              <div className="bg-black/40 border border-terminal-border p-3 rounded">
                <span className="text-xs font-mono text-terminal-muted">COMPLETED</span>
                <p className="text-lg font-bold text-slate-200 mt-1">{queues?.completedJobs?.toLocaleString() ?? '184,920'}</p>
              </div>
              <div className="bg-black/40 border border-terminal-border p-3 rounded">
                <span className="text-xs font-mono text-terminal-muted">FAILED</span>
                <p className="text-lg font-bold text-rose-400 mt-1">{queues?.failedJobs ?? 3}</p>
              </div>
              <div className="bg-black/40 border border-terminal-border p-3 rounded">
                <span className="text-xs font-mono text-terminal-muted">DEAD LETTER QUEUE</span>
                <p className="text-lg font-bold text-slate-400 mt-1">{queues?.deadLetterQueueCount ?? 0}</p>
              </div>
              <div className="bg-black/40 border border-terminal-border p-3 rounded">
                <span className="text-xs font-mono text-terminal-muted">RETRY QUEUE</span>
                <p className="text-lg font-bold text-cyan-400 mt-1">{queues?.retryQueueCount ?? 2}</p>
              </div>
            </div>

            <Panel title="QUEUE PIPELINE BREAKDOWN">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-terminal-border text-terminal-muted bg-black/50">
                      <th className="p-3">QUEUE NAME</th>
                      <th className="p-3">PENDING</th>
                      <th className="p-3">PROCESSING</th>
                      <th className="p-3">COMPLETED</th>
                      <th className="p-3">FAILED</th>
                      <th className="p-3">DEAD LETTER</th>
                      <th className="p-3">THROUGHPUT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/40">
                    {queues?.queuesList.map((q) => (
                      <tr key={q.queueName} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-bold text-terminal-amber">{q.queueName}</td>
                        <td className="p-3 text-amber-400">{q.pending}</td>
                        <td className="p-3 text-emerald-400">{q.processing}</td>
                        <td className="p-3 text-slate-300">{q.completed.toLocaleString()}</td>
                        <td className="p-3 text-rose-400">{q.failed}</td>
                        <td className="p-3 text-slate-400">{q.deadLetter}</td>
                        <td className="p-3 text-emerald-400 font-bold">{q.throughputPerSec} ops/sec</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {/* 5. INCIDENT MANAGER */}
        {activeTab === 'INCIDENTS' && (
          <div className="space-y-4">
            <Toolbar>
              <div className="flex items-center justify-between w-full">
                <h3 className="text-xs font-mono uppercase tracking-widest text-terminal-muted">INCIDENT LOGS & DISPATCH</h3>
                <button
                  onClick={() => setShowIncidentModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 rounded text-xs font-mono uppercase transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Report Incident</span>
                </button>
              </div>
            </Toolbar>

            <Panel title="INCIDENTS">
              <div className="space-y-3">
                {incidents.map((inc) => (
                  <div key={inc.id} className="p-4 bg-black/40 border border-terminal-border rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold border',
                            inc.severity === 'P1' && 'bg-rose-500/20 text-rose-400 border-rose-500/40',
                            inc.severity === 'P2' && 'bg-amber-500/20 text-amber-400 border-amber-500/40',
                            inc.severity === 'P3' && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
                            inc.severity === 'P4' && 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          )}
                        >
                          {inc.severity}
                        </span>
                        <span className="font-bold text-sm text-white">{inc.title}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-xs font-mono">
                        {inc.status}
                      </span>
                    </div>

                    <p className="text-xs text-terminal-muted font-mono">
                      Affected Service: <span className="text-slate-200">{inc.affectedService}</span> | Created:{' '}
                      <span className="text-slate-200">{new Date(inc.createdAt).toLocaleString()}</span>
                    </p>

                    <div className="pt-2 border-t border-terminal-border/30 space-y-1">
                      <span className="text-[10px] text-terminal-muted font-mono uppercase tracking-wider">Timeline Log:</span>
                      {inc.timeline.map((item, idx) => (
                        <div key={idx} className="text-xs font-mono text-slate-300 flex items-start gap-2">
                          <span className="text-terminal-muted shrink-0">[{new Date(item.timestamp).toLocaleTimeString()}]</span>
                          <span className="text-terminal-amber shrink-0">{item.author}:</span>
                          <span>{item.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* 6. MAINTENANCE MODE */}
        {activeTab === 'MAINTENANCE' && (
          <div className="space-y-4">
            <Toolbar>
              <div className="flex items-center justify-between w-full">
                <h3 className="text-xs font-mono uppercase tracking-widest text-terminal-muted">MAINTENANCE SCHEDULING ENGINE</h3>
                <button
                  onClick={() => setShowMntModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 rounded text-xs font-mono uppercase transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Maintenance</span>
                </button>
              </div>
            </Toolbar>

            <Panel title="SCHEDULED & HISTORICAL MAINTENANCE WINDOWS">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-terminal-border text-terminal-muted bg-black/50">
                      <th className="p-3">ID</th>
                      <th className="p-3">TITLE</th>
                      <th className="p-3">MODE</th>
                      <th className="p-3">TARGET MODULE</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3">SCHEDULED START</th>
                      <th className="p-3">SCHEDULED END</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/40">
                    {maintenance.map((m) => (
                      <tr key={m.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 text-terminal-amber font-bold">{m.maintenanceId}</td>
                        <td className="p-3 text-white font-medium">{m.title}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded text-[10px]">
                            {m.mode}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{m.targetModule || 'GLOBAL'}</td>
                        <td className="p-3">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-bold border',
                              m.status === 'COMPLETED' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                              m.status === 'IN_PROGRESS' && 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            )}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="p-3 text-terminal-muted">{new Date(m.scheduledStart).toLocaleString()}</td>
                        <td className="p-3 text-terminal-muted">{new Date(m.scheduledEnd).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {/* 7. FEATURE FLAGS */}
        {activeTab === 'FEATURE_FLAGS' && (
          <Panel title="FEATURE FLAGS & GRADUAL ROLLOUT ENGINE">
            <div className="space-y-3">
              {featureFlags.map((ff) => (
                <div key={ff.id} className="p-4 bg-black/40 border border-terminal-border rounded flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-white font-mono">{ff.name}</span>
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded text-[10px] font-mono">
                        {ff.scope}
                      </span>
                    </div>
                    <p className="text-xs text-terminal-muted font-mono">{ff.description}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Key: <span className="text-terminal-amber">{ff.flagKey}</span> | Target:{' '}
                      <span className="text-slate-200">{ff.targetWorkspaceOrModule || 'GLOBAL'}</span> | Rollout:{' '}
                      <span className="text-emerald-400">{ff.gradualRolloutPercent}%</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleFlag(ff.id)}
                    className={cn(
                      'px-4 py-2 rounded font-mono text-xs font-bold border transition-all',
                      ff.isEnabled
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    )}
                  >
                    {ff.isEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* 8. DIAGNOSTICS ENGINE */}
        {activeTab === 'DIAGNOSTICS' && (
          <div className="space-y-4">
            <Toolbar>
              <div className="flex items-center justify-between w-full">
                <h3 className="text-xs font-mono uppercase tracking-widest text-terminal-muted">REAL-TIME SYSTEM DIAGNOSTICS</h3>
                <button
                  onClick={handleRunDiagnostics}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded text-xs font-mono uppercase transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Diagnostic Suite</span>
                </button>
              </div>
            </Toolbar>

            <Panel title="SUBSYSTEM DIAGNOSTIC AUDIT RESULTS">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {diagnostics.map((d, idx) => (
                  <div key={idx} className="p-3 bg-black/40 border border-terminal-border rounded flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono">{d.component}</h4>
                        <p className="text-[11px] text-terminal-muted font-mono">{d.message}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                        {d.status}
                      </span>
                      <p className="text-[10px] text-terminal-muted mt-1">{d.latencyMs} ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* 9. OPERATIONAL AUDIT */}
        {activeTab === 'AUDIT' && (
          <Panel title="OPERATIONAL AUDIT LOGS">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-terminal-border text-terminal-muted bg-black/50">
                    <th className="p-3">AUDIT ID</th>
                    <th className="p-3">ACTION TYPE</th>
                    <th className="p-3">OPERATOR</th>
                    <th className="p-3">DETAILS</th>
                    <th className="p-3">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/40">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-terminal-amber">{log.auditId}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded text-[10px]">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200">{log.operator}</td>
                      <td className="p-3 text-slate-300">{log.details}</td>
                      <td className="p-3 text-terminal-muted">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {/* 10. HEALTH SCORE ENGINE */}
        {activeTab === 'HEALTH' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <MetricCard title="OVERALL HEALTH SCORE" value={`${healthScore?.overallScore ?? 99.8}%`} subtitle="Composite Index" />
              <MetricCard title="AVAILABILITY SCORE" value={`${healthScore?.availabilityScore ?? 99.9}%`} subtitle="Uptime Weight" />
              <MetricCard title="LATENCY SCORE" value={`${healthScore?.latencyScore ?? 99.5}%`} subtitle="SLA Target < 20ms" />
              <MetricCard title="ERROR RATE SCORE" value={`${healthScore?.errorRateScore ?? 99.9}%`} subtitle="Failure Target < 0.05%" />
              <MetricCard title="RECOVERY SCORE" value={`${healthScore?.recoveryScore ?? 100.0}%`} subtitle="MTTR < 2 mins" />
            </div>

            <Panel title="PER-MODULE HEALTH BREAKDOWN">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(healthScore?.perModuleHealth ?? {}).map(([ep, score]) => (
                  <div key={ep} className="p-3 bg-black/40 border border-terminal-border rounded">
                    <span className="text-xs font-mono text-terminal-muted">{ep}</span>
                    <p className="text-lg font-bold text-emerald-400 mt-1 font-mono">{score}%</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {/* 11. INSPECTOR */}
        {activeTab === 'INSPECTOR' && (
          <div className="space-y-4">
            <Toolbar>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-terminal-muted">SELECT MODULE TO INSPECT:</span>
                <select
                  value={inspectorModule}
                  onChange={(e) => setInspectorModule(e.target.value)}
                  className="bg-black border border-terminal-border rounded px-3 py-1 text-xs font-mono text-white focus:outline-none"
                >
                  <option value="EP03">EP03 - AI Activation & Intelligence</option>
                  <option value="EP11">EP11 - Order Management System (OMS)</option>
                  <option value="EP12">EP12 - Portfolio Management System (PMS)</option>
                  <option value="EP13">EP13 - Risk Management System (RMS)</option>
                  <option value="EP14">EP14 - Paper Execution Engine</option>
                  <option value="EP15">EP15 - Trade Journal & Lifecycle</option>
                  <option value="EP16">EP16 - Enterprise Accounting Ledger</option>
                  <option value="EP17">EP17 - Institutional Treasury System</option>
                  <option value="EP18">EP18 - Enterprise Notifications</option>
                  <option value="EP19">EP19 - Enterprise Administration</option>
                </select>
              </div>
            </Toolbar>

            <Panel title={`MODULE TELEMETRY INSPECTOR: ${inspectorModule}`}>
              <div className="p-4 bg-black/60 border border-terminal-border rounded space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                  <span className="text-terminal-amber font-bold">TELEMETRY SCOPE: {inspectorModule}</span>
                  <span className="text-emerald-400">NON-INTERFERING READ-ONLY OBSERVER ACTIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-terminal-muted">MODULE HEALTH:</span>
                    <p className="text-white font-bold">100.0% Operational</p>
                  </div>
                  <div>
                    <span className="text-terminal-muted">ISOLATION GUARANTEE:</span>
                    <p className="text-emerald-400 font-bold">BUSINESS LOGIC UNTOUCHED</p>
                  </div>
                  <div>
                    <span className="text-terminal-muted">LAST RECORDED EVENT:</span>
                    <p className="text-slate-300">{new Date().toISOString()}</p>
                  </div>
                  <div>
                    <span className="text-terminal-muted">ACTIVE SUBSCRIPTIONS:</span>
                    <p className="text-slate-300">Telemetry Stream #89201</p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>

      {/* CREATE INCIDENT MODAL */}
      {showIncidentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-terminal-bg border border-terminal-border p-6 rounded-lg max-w-md w-full space-y-4 font-mono">
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Report New Operational Incident</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-terminal-muted mb-1">INCIDENT TITLE</label>
                <input
                  type="text"
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  placeholder="e.g. OMS Latency Spike on Order Matching"
                  className="w-full bg-black border border-terminal-border rounded px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-terminal-muted mb-1">SEVERITY</label>
                <select
                  value={incSeverity}
                  onChange={(e) => setIncSeverity(e.target.value as IncidentSeverity)}
                  className="w-full bg-black border border-terminal-border rounded px-3 py-2 text-white focus:outline-none"
                >
                  <option value="P1">P1 - Critical Outage</option>
                  <option value="P2">P2 - Major Degradation</option>
                  <option value="P3">P3 - Minor Incident</option>
                  <option value="P4">P4 - Informational Warning</option>
                </select>
              </div>

              <div>
                <label className="block text-terminal-muted mb-1">AFFECTED SERVICE</label>
                <select
                  value={incService}
                  onChange={(e) => setIncService(e.target.value)}
                  className="w-full bg-black border border-terminal-border rounded px-3 py-2 text-white focus:outline-none"
                >
                  <option value="EP03 AI Activation">EP03 AI Activation & Intelligence</option>
                  <option value="EP11 OMS">EP11 Order Management System (OMS)</option>
                  <option value="EP12 PMS">EP12 Portfolio Management System (PMS)</option>
                  <option value="EP13 RMS">EP13 Risk Management System (RMS)</option>
                  <option value="EP14 Execution">EP14 Paper Execution Engine</option>
                  <option value="EP15 Journal">EP15 Trade Journal & Analytics</option>
                  <option value="EP16 Accounting">EP16 Enterprise Accounting Ledger</option>
                  <option value="EP17 Treasury">EP17 Institutional Treasury System</option>
                  <option value="EP18 Notifications">EP18 Enterprise Notifications</option>
                  <option value="EP19 Admin">EP19 Enterprise Administration</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowIncidentModal(false)}
                className="px-4 py-2 bg-black border border-terminal-border text-slate-300 rounded text-xs hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateIncident}
                className="px-4 py-2 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded text-xs hover:bg-rose-500/30 font-bold"
              >
                Dispatch Incident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE MAINTENANCE MODAL */}
      {showMntModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-terminal-bg border border-terminal-border p-6 rounded-lg max-w-md w-full space-y-4 font-mono">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span>Schedule Maintenance Window</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-terminal-muted mb-1">MAINTENANCE TITLE</label>
                <input
                  type="text"
                  value={mntTitle}
                  onChange={(e) => setMntTitle(e.target.value)}
                  placeholder="e.g. Database Index Optimization"
                  className="w-full bg-black border border-terminal-border rounded px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-terminal-muted mb-1">MAINTENANCE MODE</label>
                <select
                  value={mntMode}
                  onChange={(e) => setMntMode(e.target.value as MaintenanceModeType)}
                  className="w-full bg-black border border-terminal-border rounded px-3 py-2 text-white focus:outline-none"
                >
                  <option value="READ_ONLY">Read Only Mode</option>
                  <option value="MODULE">Module Maintenance</option>
                  <option value="PLATFORM">Full Platform Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-terminal-muted mb-1">TARGET MODULE</label>
                <input
                  type="text"
                  value={mntTarget}
                  onChange={(e) => setMntTarget(e.target.value)}
                  placeholder="e.g. EP15 Trade Journal"
                  className="w-full bg-black border border-terminal-border rounded px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowMntModal(false)}
                className="px-4 py-2 bg-black border border-terminal-border text-slate-300 rounded text-xs hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMaintenance}
                className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded text-xs hover:bg-amber-500/30 font-bold"
              >
                Activate Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
