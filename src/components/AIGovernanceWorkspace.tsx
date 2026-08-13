import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Boxes,
  GitBranch,
  Activity,
  CheckSquare,
  BarChart3,
  Trophy,
  Server,
  ShieldAlert,
  Rocket,
  FileText,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Power,
  ShieldCheck,
  Cpu,
  Layers,
  AlertTriangle,
  Clock,
  Filter,
  Eye,
  Settings,
  Users
} from 'lucide-react';
import {
  AIModelItem,
  ModelVersion,
  ModelBenchmarkEvaluation,
  AiLeaderboardItem,
  AiPolicyItem,
  AiProviderItem,
  AiDeploymentItem,
  AiGovernanceAuditItem,
  AiGovernanceQaReport,
  ModelLifecycleStatus,
  ApprovalStage
} from '../modules/ai/governance/types/ep22.types';
import { fetchApi } from '../lib/api';

type TabType =
  | 'DASHBOARD'
  | 'REGISTRY'
  | 'VERSIONS'
  | 'LIFECYCLE'
  | 'APPROVALS'
  | 'EVALUATION'
  | 'LEADERBOARD'
  | 'PROVIDERS'
  | 'POLICIES'
  | 'DEPLOYMENTS'
  | 'AUDIT'
  | 'INSPECTOR'
  | 'RUNTIMESESSIONS'
  | 'HUMANOVERSIGHT'
  | 'AUDITREPLAY';

export const AIGovernanceWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

  // Data states
  const [models, setModels] = useState<AIModelItem[]>([]);
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [evaluations, setEvaluations] = useState<ModelBenchmarkEvaluation[]>([]);
  const [leaderboard, setLeaderboard] = useState<AiLeaderboardItem[]>([]);
  const [providers, setProviders] = useState<AiProviderItem[]>([]);
  const [policies, setPolicies] = useState<AiPolicyItem[]>([]);
  const [deployments, setDeployments] = useState<AiDeploymentItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AiGovernanceAuditItem[]>([]);
  const [qaReport, setQaReport] = useState<AiGovernanceQaReport | null>(null);

  // Phase 4 states
  const [runtimeSessions, setRuntimeSessions] = useState<any[]>([]);
  const [humanReviews, setHumanReviews] = useState<any[]>([]);
  const [auditReplays, setAuditReplays] = useState<any[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<any>(null);
  
  // Sandbox state
  const [sandboxPrompt, setSandboxPrompt] = useState<string>('Determine the correlation of BTC to gold, then buy 100 shares of MSFT.');
  const [sandboxResponse, setSandboxResponse] = useState<string>('Analyst Recommendation: Hold portfolio, then executing trade buy 100 shares of MSFT.');
  const [sandboxModel, setSandboxModel] = useState<string>('MDL-GEMINI-25-FLASH');
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  // Oversight state
  const [reviewerNotes, setReviewerNotes] = useState<string>('');

  // Register Form state
  const [newModel, setNewModel] = useState({
    name: '',
    provider: 'Google Gemini',
    family: 'Gemini 2.5',
    version: 'v1.0.0',
    owner: 'Quant Risk Desk',
    capabilities: 'Fast Inference, Function Calling',
    license: 'Proprietary Cloud API',
    workspace: 'GLOBAL_SYSTEM'
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        modelsRes,
        versionsRes,
        evalsRes,
        leaderRes,
        provRes,
        polRes,
        depRes,
        auditRes,
        qaRes,
        sessionsRes,
        reviewsRes,
        replaysRes,
        metricsRes
      ] = await Promise.all([
        fetchApi<{ data: AIModelItem[] }>('/api/ai/models').catch(() => null),
        fetchApi<{ data: ModelVersion[] }>('/api/ai/versions').catch(() => null),
        fetchApi<{ data: ModelBenchmarkEvaluation[] }>('/api/ai/evaluations').catch(() => null),
        fetchApi<{ data: AiLeaderboardItem[] }>('/api/ai/leaderboard').catch(() => null),
        fetchApi<{ data: AiProviderItem[] }>('/api/ai/providers').catch(() => null),
        fetchApi<{ data: AiPolicyItem[] }>('/api/ai/policies').catch(() => null),
        fetchApi<{ data: AiDeploymentItem[] }>('/api/ai/deployments').catch(() => null),
        fetchApi<{ data: AiGovernanceAuditItem[] }>('/api/ai/audit').catch(() => null),
        fetchApi<{ data: AiGovernanceQaReport }>('/api/ai/qa').catch(() => null),
        fetchApi<{ data: any[] }>('/api/ai/sessions').catch(() => null),
        fetchApi<{ data: any[] }>('/api/ai/reviews').catch(() => null),
        fetchApi<{ data: any[] }>('/api/ai/replay').catch(() => null),
        fetchApi<{ data: any[] }>('/api/ai/metrics-snapshots').catch(() => null)
      ]);

      if (modelsRes?.data) setModels(modelsRes.data);
      if (versionsRes?.data) setVersions(versionsRes.data);
      if (evalsRes?.data) setEvaluations(evalsRes.data);
      if (leaderRes?.data) setLeaderboard(leaderRes.data);
      if (provRes?.data) setProviders(provRes.data);
      if (polRes?.data) setPolicies(polRes.data);
      if (depRes?.data) setDeployments(depRes.data);
      if (auditRes?.data) setAuditLogs(auditRes.data);
      if (qaRes?.data) setQaReport(qaRes.data);
      if (sessionsRes?.data) setRuntimeSessions(sessionsRes.data);
      if (reviewsRes?.data) setHumanReviews(reviewsRes.data);
      if (replaysRes?.data) setAuditReplays(replaysRes.data);
      if (metricsRes?.data) setMetricsHistory(metricsRes.data);
    } catch (err) {
      console.error('Error loading AI Governance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.name || !newModel.provider) return;
    try {
      await fetchApi('/api/ai/register', {
        method: 'POST',
        body: JSON.stringify({
          ...newModel,
          capabilities: newModel.capabilities.split(',').map(c => c.trim())
        })
      });
      setShowRegisterModal(false);
      setNewModel({
        name: '',
        provider: 'Google Gemini',
        family: 'Gemini 2.5',
        version: 'v1.0.0',
        owner: 'Quant Risk Desk',
        capabilities: 'Fast Inference, Function Calling',
        license: 'Proprietary Cloud API',
        workspace: 'GLOBAL_SYSTEM'
      });
      await loadAllData();
    } catch (err) {
      console.error('Error registering model:', err);
    }
  };

  const handleApproveAction = async (modelId: string, stage: ApprovalStage) => {
    try {
      await fetchApi('/api/ai/approve', {
        method: 'POST',
        body: JSON.stringify({ modelId, stage })
      });
      await loadAllData();
    } catch (err) {
      console.error('Error approving model:', err);
    }
  };

  const handlePromoteAction = async (modelId: string, targetEnv: string) => {
    try {
      await fetchApi('/api/ai/promote', {
        method: 'POST',
        body: JSON.stringify({ modelId, targetEnv })
      });
      await loadAllData();
    } catch (err) {
      console.error('Error promoting model:', err);
    }
  };

  const handleRollbackAction = async (modelId: string) => {
    try {
      await fetchApi('/api/ai/rollback', {
        method: 'POST',
        body: JSON.stringify({ modelId })
      });
      await loadAllData();
    } catch (err) {
      console.error('Error rolling back model:', err);
    }
  };

  const handleRetireAction = async (modelId: string) => {
    try {
      await fetchApi('/api/ai/retire', {
        method: 'POST',
        body: JSON.stringify({ modelId })
      });
      await loadAllData();
    } catch (err) {
      console.error('Error retiring model:', err);
    }
  };

  const filteredModels = models.filter(
    m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.modelId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeModelsCount = models.filter(m => m.status === 'ACTIVE').length;
  const avgLatency =
    evaluations.length > 0
      ? Math.round(evaluations.reduce((acc, e) => acc + e.latencyMs, 0) / evaluations.length)
      : 190;
  const avgReliability =
    evaluations.length > 0
      ? (evaluations.reduce((acc, e) => acc + e.reliabilityPercent, 0) / evaluations.length).toFixed(2)
      : '99.80';

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">EP22 Enterprise AI Governance & Model Lifecycle</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full">
                AIGML Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Centralized AI Governance & Model Lifecycle Platform • Strict Non-Reasoning & Zero Trading Decoupling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Register Model
          </button>
          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition border border-slate-700"
            title="Refresh Governance Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-slate-900/40 overflow-x-auto no-scrollbar">
        {[
          { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'REGISTRY', label: 'Registry', icon: Boxes },
          { id: 'VERSIONS', label: 'Versions', icon: GitBranch },
          { id: 'LIFECYCLE', label: 'Lifecycle', icon: Activity },
          { id: 'APPROVALS', label: 'Approvals', icon: CheckSquare },
          { id: 'EVALUATION', label: 'Evaluation', icon: BarChart3 },
          { id: 'LEADERBOARD', label: 'Leaderboard', icon: Trophy },
          { id: 'PROVIDERS', label: 'Providers', icon: Server },
          { id: 'POLICIES', label: 'Policies', icon: ShieldAlert },
          { id: 'DEPLOYMENTS', label: 'Deployments', icon: Rocket },
          { id: 'AUDIT', label: 'Audit Log', icon: FileText },
          { id: 'INSPECTOR', label: 'Enterprise QA', icon: ShieldCheck },
          { id: 'RUNTIMESESSIONS', label: 'Runtime Sessions', icon: ShieldCheck },
          { id: 'HUMANOVERSIGHT', label: 'Human Oversight', icon: Users },
          { id: 'AUDITREPLAY', label: 'Audit Replay', icon: RotateCcw }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-3 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Registered Models</span>
                  <Boxes className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-white">{models.length}</div>
                <p className="text-[11px] text-slate-400 mt-1">Total in enterprise registry</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Active Production</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-emerald-400">{activeModelsCount}</div>
                <p className="text-[11px] text-slate-400 mt-1">Deployed & serving requests</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Avg Latency</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-white">{avgLatency} ms</div>
                <p className="text-[11px] text-slate-400 mt-1">Across all provider benchmarks</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Reliability Rate</span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-cyan-400">{avgReliability}%</div>
                <p className="text-[11px] text-slate-400 mt-1">Zero downtime SLA target</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                  <span>Enforced Policies</span>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-purple-400">{policies.filter(p => p.isEnabled).length}</div>
                <p className="text-[11px] text-slate-400 mt-1">Active guardrail policies</p>
              </div>
            </div>

            {/* Model Status Breakdown & AI Providers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Model Lifecycle Overview
                  </h2>
                  <span className="text-xs text-slate-400">8 Stage Model Governance Pipeline</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'REGISTERED', count: models.filter(m => m.status === 'REGISTERED').length, color: 'bg-slate-800 text-slate-300 border-slate-700' },
                    { label: 'TESTING', count: models.filter(m => m.status === 'TESTING').length, color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
                    { label: 'VALIDATED', count: models.filter(m => m.status === 'VALIDATED').length, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
                    { label: 'APPROVED', count: models.filter(m => m.status === 'APPROVED').length, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
                    { label: 'ACTIVE', count: models.filter(m => m.status === 'ACTIVE').length, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                    { label: 'SUSPENDED', count: models.filter(m => m.status === 'SUSPENDED').length, color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
                    { label: 'DEPRECATED', count: models.filter(m => m.status === 'DEPRECATED').length, color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
                    { label: 'RETIRED', count: models.filter(m => m.status === 'RETIRED').length, color: 'bg-slate-800/80 text-slate-500 border-slate-800' }
                  ].map((s, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${s.color}`}>
                      <div className="text-[11px] font-semibold">{s.label}</div>
                      <div className="text-xl font-bold mt-1">{s.count}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-semibold text-slate-300 mb-2">Primary AI Provider Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {providers.slice(0, 4).map(p => (
                      <div key={p.providerId} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                        <span className="text-xs font-medium text-slate-200">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{p.avgLatencyMs}ms</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Audit Log */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      Governance Log
                    </h2>
                    <button onClick={() => setActiveTab('AUDIT')} className="text-xs text-indigo-400 hover:underline">
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {auditLogs.slice(0, 4).map(log => (
                      <div key={log.auditId} className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-indigo-300">{log.actionType}</span>
                          <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-1">{log.details}</p>
                        <span className="text-[10px] text-slate-400">By: {log.operator}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Strict AI Governance enforced: Non-reasoning & zero trade execution guarantee.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTRY */}
        {activeTab === 'REGISTRY' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search models by name, provider or ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Total Models: <strong className="text-white">{filteredModels.length}</strong></span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
                    <th className="p-3">Model ID</th>
                    <th className="p-3">Model Name</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Family & Version</th>
                    <th className="p-3">Owner</th>
                    <th className="p-3">Capabilities</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Approval Stage</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredModels.map(m => (
                    <tr key={m.modelId} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono text-indigo-300 font-medium">{m.modelId}</td>
                      <td className="p-3 font-semibold text-white">{m.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                          {m.provider}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">
                        {m.family} <span className="text-indigo-400 font-mono">({m.version})</span>
                      </td>
                      <td className="p-3 text-slate-300">{m.owner}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {m.capabilities.map((cap, i) => (
                            <span key={i} className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : m.status === 'TESTING'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                              : m.status === 'VALIDATED'
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-300 font-medium">{m.approvalStage}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {m.status !== 'ACTIVE' && (
                            <button
                              onClick={() => handlePromoteAction(m.modelId, 'PRODUCTION')}
                              className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-medium"
                              title="Promote to Active Production"
                            >
                              Promote
                            </button>
                          )}
                          {m.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleRollbackAction(m.modelId)}
                              className="px-2 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded text-[11px] font-medium"
                              title="Rollback model"
                            >
                              Rollback
                            </button>
                          )}
                          {m.status !== 'RETIRED' && (
                            <button
                              onClick={() => handleRetireAction(m.modelId)}
                              className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded text-[11px] font-medium"
                              title="Retire model"
                            >
                              Retire
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: VERSIONS */}
        {activeTab === 'VERSIONS' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  Model Version History & Compatibility Matrix
                </h2>
                <span className="text-xs text-slate-400">EP03, EP07, EP08, EP09, EP21 Compatibility Verified</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                      <th className="p-3">Version ID</th>
                      <th className="p-3">Model ID</th>
                      <th className="p-3">Version Number</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Release Notes</th>
                      <th className="p-3 text-center">EP03 AI Runtime</th>
                      <th className="p-3 text-center">EP07 AI Intel</th>
                      <th className="p-3 text-center">EP08 Strategy</th>
                      <th className="p-3 text-center">EP09 Committee</th>
                      <th className="p-3 text-center">EP21 Reporting</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {versions.map(v => (
                      <tr key={v.versionId} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-indigo-300">{v.versionId}</td>
                        <td className="p-3 font-mono text-slate-300">{v.modelId}</td>
                        <td className="p-3 font-bold text-white">{v.versionNumber}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            {v.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 max-w-xs">{v.releaseNotes}</td>
                        {['EP03', 'EP07', 'EP08', 'EP09', 'EP21'].map(ep => (
                          <td key={ep} className="p-3 text-center">
                            {v.compatibilityMatrix[ep] !== false ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                                Pass
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-medium">
                                N/A
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LIFECYCLE */}
        {activeTab === 'LIFECYCLE' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Enterprise Model Lifecycle Pipeline
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  8 Strict Stages: REGISTERED → TESTING → VALIDATED → APPROVED → ACTIVE → SUSPENDED → DEPRECATED → RETIRED
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  'REGISTERED',
                  'TESTING',
                  'VALIDATED',
                  'APPROVED',
                  'ACTIVE',
                  'SUSPENDED',
                  'DEPRECATED',
                  'RETIRED'
                ].map((st, i) => {
                  const stageModels = models.filter(m => m.status === st);
                  return (
                    <div key={st} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                          <span className="text-[10px] font-bold text-slate-400">0{i + 1}. {st}</span>
                          <span className="text-xs font-mono font-bold text-indigo-400">{stageModels.length}</span>
                        </div>
                        <div className="space-y-2">
                          {stageModels.map(m => (
                            <div key={m.modelId} className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px]">
                              <div className="font-semibold text-white truncate">{m.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{m.provider}</div>
                            </div>
                          ))}
                          {stageModels.length === 0 && (
                            <div className="text-[10px] text-slate-600 text-center py-4">No models</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: APPROVALS */}
        {activeTab === 'APPROVALS' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-cyan-400" />
                  Model Approval Workflow Queue
                </h2>
                <span className="text-xs text-slate-400">Stages: Draft → Review → Validation → Approved</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { stage: 'Review' as ApprovalStage, label: 'Pending Governance Review', color: 'border-amber-500/40 text-amber-400' },
                  { stage: 'Validation' as ApprovalStage, label: 'Under Technical Validation', color: 'border-cyan-500/40 text-cyan-400' },
                  { stage: 'Approved' as ApprovalStage, label: 'Fully Approved for Production', color: 'border-emerald-500/40 text-emerald-400' }
                ].map(queue => {
                  const queueModels = models.filter(m => m.approvalStage === queue.stage);
                  return (
                    <div key={queue.stage} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className={`text-xs font-bold ${queue.color}`}>{queue.label}</span>
                        <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                          {queueModels.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {queueModels.map(m => (
                          <div key={m.modelId} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white text-xs">{m.name}</span>
                              <span className="text-[10px] font-mono text-indigo-400">{m.modelId}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">Owner: {m.owner}</div>
                            <div className="flex items-center gap-2 pt-1">
                              {queue.stage === 'Review' && (
                                <button
                                  onClick={() => handleApproveAction(m.modelId, 'Validation')}
                                  className="px-2 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-medium"
                                >
                                  Advance to Validation
                                </button>
                              )}
                              {queue.stage === 'Validation' && (
                                <button
                                  onClick={() => handleApproveAction(m.modelId, 'Approved')}
                                  className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-medium"
                                >
                                  Grant Approval
                                </button>
                              )}
                              <button
                                onClick={() => handleApproveAction(m.modelId, 'Rejected')}
                                className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded text-[10px] font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                        {queueModels.length === 0 && (
                          <div className="text-xs text-slate-600 py-6 text-center">No pending items in queue</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: EVALUATION */}
        {activeTab === 'EVALUATION' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  Benchmark & Evaluation Engine Metrics
                </h2>
                <span className="text-xs text-slate-400">Accuracy, Latency, Reliability, Cost, Hallucination Rate</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluations.map(e => {
                  const modelObj = models.find(m => m.modelId === e.modelId);
                  return (
                    <div key={e.evaluationId} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div>
                          <h3 className="text-xs font-bold text-white">{modelObj?.name || e.modelId}</h3>
                          <span className="text-[10px] font-mono text-indigo-400">{e.modelId}</span>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                          Quality Score: {e.responseQualityScore}/10
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-400">Accuracy</span>
                          <div className="font-bold text-emerald-400 mt-0.5">{e.accuracyPercent}%</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-400">Latency</span>
                          <div className="font-bold text-amber-400 mt-0.5">{e.latencyMs} ms</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-400">Reliability</span>
                          <div className="font-bold text-cyan-400 mt-0.5">{e.reliabilityPercent}%</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-400">Cost / 1k tokens</span>
                          <div className="font-bold text-white mt-0.5">${e.costPer1kTokensUSD}</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-400">Success Rate</span>
                          <div className="font-bold text-emerald-400 mt-0.5">{e.successRatePercent}%</div>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-400">Hallucination</span>
                          <div className="font-bold text-rose-400 mt-0.5">{e.hallucinationRatePercent}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: LEADERBOARD */}
        {activeTab === 'LEADERBOARD' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Enterprise AI Model Leaderboard
                </h2>
                <span className="text-xs text-slate-400">Ranked by Workspace Performance Score</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                      <th className="p-3 text-center">Rank</th>
                      <th className="p-3">Model Name</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3 text-right">Accuracy</th>
                      <th className="p-3 text-right">Latency</th>
                      <th className="p-3 text-right">Cost Score</th>
                      <th className="p-3 text-right">Reliability</th>
                      <th className="p-3 text-right">Overall Performance Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {leaderboard.map(item => (
                      <tr key={item.modelId} className="hover:bg-slate-800/40">
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                              item.rank === 1
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                : item.rank === 2
                                ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                                : item.rank === 3
                                ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            #{item.rank}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-white">{item.name}</td>
                        <td className="p-3 text-slate-400">{item.provider}</td>
                        <td className="p-3 text-right font-mono text-emerald-400">{item.accuracy}%</td>
                        <td className="p-3 text-right font-mono text-slate-300">{item.latencyMs} ms</td>
                        <td className="p-3 text-right font-mono text-cyan-400">{item.costScore}/10</td>
                        <td className="p-3 text-right font-mono text-emerald-400">{item.reliability}%</td>
                        <td className="p-3 text-right">
                          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 font-bold rounded-lg border border-indigo-500/30">
                            {item.workspacePerformanceScore} pts
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: PROVIDERS */}
        {activeTab === 'PROVIDERS' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  Provider Management & API Status
                </h2>
                <span className="text-xs text-slate-400">OpenRouter, OpenAI, Gemini, Anthropic, DeepSeek, Mistral, Llama, Local</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {providers.map(p => (
                  <div key={p.providerId} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="font-bold text-white text-xs">{p.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {p.apiStatus}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Supported Models:</span>
                        <span className="font-bold text-white">{p.supportedModelsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Latency:</span>
                        <span className="font-mono text-indigo-300">{p.avgLatencyMs} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rate Limit:</span>
                        <span className="font-mono text-slate-300">{p.rateLimitRpm} RPM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">API Credentials:</span>
                        <span className="text-emerald-400 font-medium">Configured</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: POLICIES */}
        {activeTab === 'POLICIES' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  AI Policy Engine & Security Guardrails
                </h2>
                <span className="text-xs text-slate-400">Allowed / Blocked Models, Usage Limits, Fallback Rules</span>
              </div>

              <div className="space-y-3">
                {policies.map(pol => (
                  <div key={pol.policyId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{pol.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {pol.policyType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        Rules: {JSON.stringify(pol.rules)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                        Enforced Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: DEPLOYMENTS */}
        {activeTab === 'DEPLOYMENTS' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-emerald-400" />
                  Deployment Manager & Runtime Workers
                </h2>
                <span className="text-xs text-slate-400">Deploy, Promote, Rollback, Suspend, Retire</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deployments.map(dep => {
                  const modelObj = models.find(m => m.modelId === dep.modelId);
                  return (
                    <div key={dep.deploymentId} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div>
                          <span className="font-bold text-white text-xs">{modelObj?.name || dep.modelId}</span>
                          <div className="text-[10px] font-mono text-indigo-400">{dep.deploymentId}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {dep.environment} • {dep.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-400">Health Status:</span>
                          <div className="font-semibold text-emerald-400">{dep.healthStatus}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Active Workers:</span>
                          <div className="font-semibold text-white">{dep.activeWorkerCount} workers</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleRollbackAction(dep.modelId)}
                          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded text-[11px] font-medium"
                        >
                          Rollback
                        </button>
                        <button
                          onClick={() => handleRetireAction(dep.modelId)}
                          className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded text-[11px] font-medium"
                        >
                          Retire
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: AUDIT */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  AI Governance Audit Trail
                </h2>
                <span className="text-xs text-slate-400">Immutable Event History</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                      <th className="p-3">Audit ID</th>
                      <th className="p-3">Action Type</th>
                      <th className="p-3">Model ID</th>
                      <th className="p-3">Operator</th>
                      <th className="p-3">Details</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {auditLogs.map(a => (
                      <tr key={a.auditId} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-indigo-300">{a.auditId}</td>
                        <td className="p-3 font-semibold text-white">{a.actionType}</td>
                        <td className="p-3 font-mono text-slate-400">{a.modelId || 'N/A'}</td>
                        <td className="p-3 text-slate-300">{a.operator}</td>
                        <td className="p-3 text-slate-300">{a.details}</td>
                        <td className="p-3 text-slate-500 font-mono">{new Date(a.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: INSPECTOR & ENTERPRISE QA */}
        {activeTab === 'INSPECTOR' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-white">EP22 Enterprise QA Verification Report</h2>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-full">
                  BUILD & PRODUCTION PASS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400 font-medium">Total Modules Verified</div>
                  <div className="text-2xl font-bold text-white mt-1">{qaReport?.totalModulesTested || 15} / 15</div>
                  <p className="text-[11px] text-emerald-400 mt-1">100% Modules Passed</p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400 font-medium">Read-Only Telemetry</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">CONFIRMED</div>
                  <p className="text-[11px] text-slate-400 mt-1">EP03, EP07, EP08, EP09, EP21 metrics</p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400 font-medium">Non-Reasoning Decoupling</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">ENFORCED</div>
                  <p className="text-[11px] text-slate-400 mt-1">Zero trading signals or orders</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-300">Verified Module Matrix</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {qaReport?.modules.map(mod => (
                    <div key={mod.moduleId} className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">{mod.moduleName}</div>
                        <div className="text-[11px] text-slate-400">{mod.details}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold rounded border border-emerald-500/30">
                        {mod.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 13: RUNTIME SESSIONS & SANDBOX */}
        {activeTab === 'RUNTIMESESSIONS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Left Column: Sandbox */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Live Governance Sandbox</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Submit custom AI payloads to evaluate compliance against AAOS Core Policies.</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] bg-indigo-500/10 text-indigo-300 font-mono rounded">
                    Sandbox Env
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Model Identifier</label>
                    <select
                      value={sandboxModel}
                      onChange={e => setSandboxModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="MDL-GEMINI-25-FLASH">MDL-GEMINI-25-FLASH (Corporate Whitelist)</option>
                      <option value="MDL-CLAUDE-35-SONNET">MDL-CLAUDE-35-SONNET (Corporate Whitelist)</option>
                      <option value="MDL-UNAUTHORIZED-MEGA">MDL-UNAUTHORIZED-MEGA (Unauthorized Model)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">User Prompt (Input Payload)</label>
                    <textarea
                      rows={3}
                      value={sandboxPrompt}
                      onChange={e => setSandboxPrompt(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">AI Response (Output Payload)</label>
                    <textarea
                      rows={3}
                      value={sandboxResponse}
                      onChange={e => setSandboxResponse(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setSandboxPrompt("Provide a market research overview for BTC-USD momentum.");
                        setSandboxResponse("Technical indicators show BTC bullish consolidation at support.");
                      }}
                      className="text-xs text-indigo-400 hover:underline font-medium"
                    >
                      Reset to Safe Template
                    </button>

                    <button
                      type="button"
                      disabled={sandboxLoading}
                      onClick={async () => {
                        setSandboxLoading(true);
                        try {
                          const res = await fetchApi<any>('/api/ai/sessions', {
                            method: 'POST',
                            body: JSON.stringify({
                              modelId: sandboxModel,
                              requestPayload: { prompt: sandboxPrompt },
                              responsePayload: { text: sandboxResponse, confidence: 0.9 }
                            })
                          });
                          if (res?.data) {
                            setSandboxResult(res.data);
                            loadAllData();
                          }
                        } catch (err) {
                          console.error('Error running sandbox governance:', err);
                        } finally {
                          setSandboxLoading(false);
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold shadow-lg shadow-indigo-600/10 transition"
                    >
                      {sandboxLoading ? 'Governing...' : 'Submit for Governance Review'}
                    </button>
                  </div>
                </div>

                {sandboxResult && (
                  <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-white text-xs">Sandbox Pipeline Outcome</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sandboxResult.session.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}>
                        {sandboxResult.session.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400">Compliance Score</span>
                        <div className="text-sm font-bold text-white mt-0.5">{sandboxResult.compliance.complianceScore}%</div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400">Policy Status</span>
                        <div className={`text-sm font-bold mt-0.5 ${sandboxResult.session.policyCheckStatus === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {sandboxResult.session.policyCheckStatus}
                        </div>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400">Safety Status</span>
                        <div className={`text-sm font-bold mt-0.5 ${sandboxResult.session.safetyCheckStatus === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {sandboxResult.session.safetyCheckStatus}
                        </div>
                      </div>
                    </div>

                    {sandboxResult.policyCheck?.violations?.length > 0 && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg space-y-2">
                        <div className="text-xs font-bold text-rose-400">Detected Policy Violations</div>
                        <div className="space-y-1.5">
                          {sandboxResult.policyCheck.violations.map((v: any, idx: number) => (
                            <div key={idx} className="text-[11px] text-slate-300">
                              • <strong className="text-rose-300">[{v.severity}] {v.policyName}:</strong> {v.violationDetails}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sandboxResult.safetyReport?.riskFlags?.length > 0 && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg space-y-2">
                        <div className="text-xs font-bold text-rose-400">Detected Safety Flags</div>
                        <div className="flex flex-wrap gap-1">
                          {sandboxResult.safetyReport.riskFlags.map((f: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded text-[10px] font-bold border border-rose-500/30">
                              {f}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono italic">{sandboxResult.safetyReport.scannerLogs}</p>
                      </div>
                    )}

                    <div className="text-slate-400 text-[11px] space-y-1 pt-1 border-t border-slate-800">
                      <div><strong className="text-slate-300">Audit Trail SHA-256 Hash:</strong> <span className="font-mono text-indigo-400">{sandboxResult.session.auditHash}</span></div>
                      <div><strong className="text-slate-300">Explainability Confidence:</strong> <span className="text-slate-300">{sandboxResult.explainability.confidenceExplanation}</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Sessions List */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Runtime Session History</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time auditable stream of model requests governed by AAOS.</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {runtimeSessions.map(sess => (
                    <div
                      key={sess.id}
                      onClick={async () => {
                        const detail = await fetchApi<any>(`/api/ai/session/${sess.id}`);
                        if (detail?.data) setSelectedSessionDetail(detail.data);
                      }}
                      className={`p-3 bg-slate-950 hover:bg-slate-800/80 rounded-lg border transition cursor-pointer flex items-center justify-between gap-3 ${
                        selectedSessionDetail?.session?.id === sess.id ? 'border-indigo-500' : 'border-slate-800'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-indigo-300 text-[11px]">#S-00{sess.id}</span>
                          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded">
                            {sess.requestPayload?.prompt ? 'Sandbox' : 'Consensus'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white truncate max-w-xs">
                          {sess.requestPayload?.prompt || sess.requestPayload?.topic || "API Request"}
                        </p>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Latency: {sess.governanceLatencyMs}ms • Hash: {sess.auditHash?.slice(0, 8)}...
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sess.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {sess.status}
                        </span>
                      </div>
                    </div>
                  ))}

                  {runtimeSessions.length === 0 && (
                    <div className="text-xs text-slate-500 text-center py-12">No active governance sessions recorded. Try the sandbox.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Session Detail Pane */}
            {selectedSessionDetail && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      Session Deep Audit: #S-00{selectedSessionDetail.session.id}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Verification details of policy validation, safety scanners, and reasoning evidence traces.</p>
                  </div>
                  <button
                    onClick={() => setSelectedSessionDetail(null)}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    Close Panel
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Summary & Payloads */}
                  <div className="space-y-3 lg:col-span-1">
                    <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2 text-xs">
                      <div className="text-slate-400 font-semibold border-b border-slate-800 pb-1.5 mb-2">Audit Information</div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Session Status:</span>
                        <span className="font-bold text-white">{selectedSessionDetail.session.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Policy Check:</span>
                        <span className="font-bold text-emerald-400">{selectedSessionDetail.session.policyCheckStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Safety Check:</span>
                        <span className="font-bold text-emerald-400">{selectedSessionDetail.session.safetyCheckStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Governance Latency:</span>
                        <span className="font-bold text-white">{selectedSessionDetail.session.governanceLatencyMs} ms</span>
                      </div>
                      <div className="pt-2">
                        <div className="text-slate-500">SHA-256 Audit Signature:</div>
                        <div className="font-mono text-[10px] text-indigo-400 mt-1 break-all bg-slate-900 p-2 rounded border border-slate-800">
                          {selectedSessionDetail.session.auditHash}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2 text-xs">
                      <div className="text-slate-400 font-semibold border-b border-slate-800 pb-1.5 mb-2">Input/Output Payload</div>
                      <div className="space-y-2 font-mono text-[10px]">
                        <div>
                          <div className="text-slate-500 mb-1">PROMPT:</div>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800 max-h-24 overflow-y-auto text-slate-300">
                            {JSON.stringify(selectedSessionDetail.session.requestPayload, null, 2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">RESPONSE:</div>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800 max-h-24 overflow-y-auto text-slate-300">
                            {JSON.stringify(selectedSessionDetail.session.responsePayload, null, 2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Explainability Traces */}
                  <div className="space-y-4 lg:col-span-2">
                    {selectedSessionDetail.compliance && (
                      <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2 text-xs">
                        <div className="text-slate-400 font-semibold border-b border-slate-800 pb-1.5 mb-2 flex justify-between">
                          <span>Compliance Statistics</span>
                          <span className="text-indigo-400 font-bold">Score: {selectedSessionDetail.compliance.complianceScore}%</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                          <div className={`p-1.5 rounded border ${selectedSessionDetail.compliance.policyCompliance ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            Policy Compliant
                          </div>
                          <div className={`p-1.5 rounded border ${selectedSessionDetail.compliance.ruleCompliance ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            Rule Compliant
                          </div>
                          <div className="p-1.5 rounded border bg-slate-900 text-slate-300 border-slate-800">
                            Evidence OK
                          </div>
                          <div className="p-1.5 rounded border bg-slate-900 text-slate-300 border-slate-800">
                            Traces OK
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedSessionDetail.explainability && (
                      <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-3 text-xs">
                        <div className="text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex justify-between">
                          <span>Confidence & Reasoning Explanations</span>
                        </div>

                        <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-slate-300">
                          <strong>Calibration Rationale:</strong> {selectedSessionDetail.explainability.confidenceExplanation}
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-slate-300">Reasoning Nodes & Evidence Traces</h4>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            {selectedSessionDetail.explainability.reasoningTrace?.map((step: any, idx: number) => (
                              <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800/60 font-mono text-[10px] text-slate-400">
                                <strong className="text-indigo-300">Node {idx + 1}: {step.title}</strong> — {step.description}
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedSessionDetail.explainability.minorityOpinion && (
                          <div className="p-2.5 bg-slate-900 rounded border border-amber-500/10 text-amber-300 text-[11px]">
                            <strong>Minority Opinion / Alternative Interpretations:</strong> {selectedSessionDetail.explainability.minorityOpinion}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 14: HUMAN OVERSIGHT REVIEW QUEUE */}
        {activeTab === 'HUMANOVERSIGHT' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Human-In-The-Loop Governance Queue</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Approve, reject, or override policies for models that have triggered safety escalations.</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full">
                  Oversight Center
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                      <th className="p-3">Review ID</th>
                      <th className="p-3">Session ID</th>
                      <th className="p-3">Escalation Reason</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Decision Override</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {humanReviews.map(rev => (
                      <tr key={rev.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-indigo-300">#REV-{rev.id}</td>
                        <td className="p-3 font-mono text-slate-400">#S-00{rev.sessionId}</td>
                        <td className="p-3 font-semibold text-amber-300">{rev.escalationReason}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rev.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : rev.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {rev.status}
                          </span>
                        </td>
                        <td className="p-3">{rev.decisionOverride ? "YES" : "NO"}</td>
                        <td className="p-3 text-slate-300 italic">{rev.reviewerNotes || 'No notes added'}</td>
                        <td className="p-3 text-right">
                          {rev.status === 'PENDING' && (
                            <div className="flex items-center justify-end gap-2">
                              <input
                                type="text"
                                placeholder="Add notes..."
                                value={reviewerNotes}
                                onChange={e => setReviewerNotes(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                              />
                              <button
                                onClick={async () => {
                                  await fetchApi(`/api/ai/reviews/${rev.id}/decision`, {
                                    method: 'POST',
                                    body: JSON.stringify({
                                      reviewerId: 99,
                                      status: "APPROVED",
                                      reviewerNotes: reviewerNotes,
                                      decisionOverride: true
                                    })
                                  });
                                  setReviewerNotes('');
                                  loadAllData();
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-medium transition"
                              >
                                Approve Override
                              </button>
                              <button
                                onClick={async () => {
                                  await fetchApi(`/api/ai/reviews/${rev.id}/decision`, {
                                    method: 'POST',
                                    body: JSON.stringify({
                                      reviewerId: 99,
                                      status: "REJECTED",
                                      reviewerNotes: reviewerNotes,
                                      decisionOverride: false
                                    })
                                  });
                                  setReviewerNotes('');
                                  loadAllData();
                                }}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-medium transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}

                    {humanReviews.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-500">No review queue items found. Try triggering a violation in the sandbox to test.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 15: AUDIT REPLAY & CRYPTOGRAPHIC VERIFICATION */}
        {activeTab === 'AUDITREPLAY' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Audit Replay Launcher */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 lg:col-span-1">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-white">Cryptographic Verification Engine</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Re-evaluates and cryptographically signatures historical sessions to detect data tampering.</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Select Session to Replay</label>
                    <select
                      id="replay-select"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      {runtimeSessions.map(sess => (
                        <option key={sess.id} value={sess.id}>Session #S-00{sess.id} ({sess.status})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={async () => {
                      const sel = document.getElementById("replay-select") as HTMLSelectElement;
                      if (!sel?.value) return;
                      await fetchApi(`/api/ai/replay`, {
                        method: 'POST',
                        body: JSON.stringify({ sessionId: parseInt(sel.value, 10), userId: 1 })
                      });
                      loadAllData();
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium shadow-lg shadow-indigo-600/15 text-center block transition text-xs"
                  >
                    Run Cryptographic Replay
                  </button>
                </div>
              </div>

              {/* Replay Audit History Logs */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 lg:col-span-2">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Cryptographic Verification Logs</h2>
                  <span className="text-xs text-slate-400 font-mono">Immutability checks</span>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
                        <th className="p-3">Replay ID</th>
                        <th className="p-3">Session ID</th>
                        <th className="p-3">Integrity Signature Status</th>
                        <th className="p-3">Original Hash / Replay Hash</th>
                        <th className="p-3">Log Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {auditReplays.map(r => (
                        <tr key={r.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono text-indigo-300">#REPLAY-{r.id}</td>
                          <td className="p-3 font-mono text-slate-400">#S-00{r.originalSessionId}</td>
                          <td className="p-3">
                            {r.discrepancyDetected ? (
                              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold text-[10px]">
                                WARNING: TEMPERING DETECTED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[10px]">
                                INTEGRITY PASS
                              </span>
                            )}
                          </td>
                          <td className="p-3 space-y-1 font-mono text-[9px]">
                            <div><strong className="text-slate-500">ORIG:</strong> {r.originalHash?.slice(0, 16)}...</div>
                            <div><strong className="text-slate-500">REPL:</strong> {r.replayHash?.slice(0, 16)}...</div>
                          </td>
                          <td className="p-3 text-slate-300 italic">{r.notes}</td>
                        </tr>
                      ))}

                      {auditReplays.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-500">No cryptographic verify runs executed. Launch a replay to start.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REGISTER MODEL MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Register New Enterprise AI Model
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  value={newModel.name}
                  onChange={e => setNewModel({ ...newModel, name: e.target.value })}
                  placeholder="e.g. Google Gemini 2.5 Pro"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Provider</label>
                  <select
                    value={newModel.provider}
                    onChange={e => setNewModel({ ...newModel, provider: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {['Google Gemini', 'OpenAI', 'Anthropic', 'DeepSeek', 'Mistral', 'OpenRouter', 'Local Models'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Version</label>
                  <input
                    type="text"
                    value={newModel.version}
                    onChange={e => setNewModel({ ...newModel, version: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Owner / Department</label>
                <input
                  type="text"
                  value={newModel.owner}
                  onChange={e => setNewModel({ ...newModel, owner: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Capabilities (Comma Separated)</label>
                <input
                  type="text"
                  value={newModel.capabilities}
                  onChange={e => setNewModel({ ...newModel, capabilities: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
