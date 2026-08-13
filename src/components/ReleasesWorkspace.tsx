import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Server,
  Tag,
  GitCommit,
  Sliders,
  CheckCircle2,
  RotateCcw,
  History,
  Cpu,
  Sparkles,
  RefreshCw,
  Play,
  AlertTriangle,
  Activity,
  Layers,
  FileText,
  ShieldCheck,
  CheckSquare,
  XCircle,
  Zap,
  Globe
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import {
  ReleaseEnvironmentItem,
  ReleaseRegistryItem,
  ReleaseVersionItem,
  ReleaseDeploymentItem,
  ReleaseConfigProfileItem,
  ReleaseApprovalItem,
  ReleaseRollbackItem,
  ReleaseAuditItem,
  ReleaseRuntimeWorker,
  ReleaseDashboardOverview,
  ReleaseQaReport
} from '../modules/releases/types/ep29.types';

type TabType =
  | 'dashboard'
  | 'environments'
  | 'releases'
  | 'versions'
  | 'deployments'
  | 'configurations'
  | 'approvals'
  | 'rollbacks'
  | 'audit'
  | 'runtime'
  | 'inspector';

export const ReleasesWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form states for actions
  const [selectedEnv, setSelectedEnv] = useState<string>('STAGING');
  const [selectedVer, setSelectedVer] = useState<string>('v2.0.8-rc.2');

  // Data States
  const [dashboard, setDashboard] = useState<ReleaseDashboardOverview | null>(null);
  const [environments, setEnvironments] = useState<ReleaseEnvironmentItem[]>([]);
  const [releases, setReleases] = useState<ReleaseRegistryItem[]>([]);
  const [versions, setVersions] = useState<ReleaseVersionItem[]>([]);
  const [deployments, setDeployments] = useState<ReleaseDeploymentItem[]>([]);
  const [configurations, setConfigurations] = useState<ReleaseConfigProfileItem[]>([]);
  const [approvals, setApprovals] = useState<ReleaseApprovalItem[]>([]);
  const [rollbacks, setRollbacks] = useState<ReleaseRollbackItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<ReleaseAuditItem[]>([]);
  const [workers, setWorkers] = useState<ReleaseRuntimeWorker[]>([]);
  const [qaReport, setQaReport] = useState<ReleaseQaReport | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        dashRes,
        envRes,
        relRes,
        verRes,
        depRes,
        cfgRes,
        appRes,
        rolRes,
        audRes,
        wrkRes,
        qaRes
      ] = await Promise.all([
        fetchApi<{ success: boolean; data: ReleaseDashboardOverview }>('/api/releases/dashboard'),
        fetchApi<{ success: boolean; data: ReleaseEnvironmentItem[] }>('/api/releases/environments'),
        fetchApi<{ success: boolean; data: ReleaseRegistryItem[] }>('/api/releases/releases'),
        fetchApi<{ success: boolean; data: ReleaseVersionItem[] }>('/api/releases/versions'),
        fetchApi<{ success: boolean; data: ReleaseDeploymentItem[] }>('/api/releases/deployments'),
        fetchApi<{ success: boolean; data: ReleaseConfigProfileItem[] }>('/api/releases/configurations'),
        fetchApi<{ success: boolean; data: ReleaseApprovalItem[] }>('/api/releases/approvals'),
        fetchApi<{ success: boolean; data: ReleaseRollbackItem[] }>('/api/releases/rollbacks'),
        fetchApi<{ success: boolean; data: ReleaseAuditItem[] }>('/api/releases/audit'),
        fetchApi<{ success: boolean; data: ReleaseRuntimeWorker[] }>('/api/releases/workers'),
        fetchApi<{ success: boolean; data: ReleaseQaReport }>('/api/releases/qa')
      ]);

      if (dashRes?.data) setDashboard(dashRes.data);
      if (envRes?.data) setEnvironments(envRes.data);
      if (relRes?.data) setReleases(relRes.data);
      if (verRes?.data) setVersions(verRes.data);
      if (depRes?.data) setDeployments(depRes.data);
      if (cfgRes?.data) setConfigurations(cfgRes.data);
      if (appRes?.data) setApprovals(appRes.data);
      if (rolRes?.data) setRollbacks(rolRes.data);
      if (audRes?.data) setAuditLogs(audRes.data);
      if (wrkRes?.data) setWorkers(wrkRes.data);
      if (qaRes?.data) setQaReport(qaRes.data);
    } catch (err: any) {
      console.error('Failed to load Release EREM data:', err);
      setError('Failed to fetch Enterprise Release & Environment telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeploy = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetchApi<{ success: boolean; data: any }>('/api/releases/deploy', {
        method: 'POST',
        body: JSON.stringify({
          environment: selectedEnv,
          version: selectedVer
        })
      });
      if (res?.success) {
        setMessage(`Deployment ${res.data.deploymentId} triggered successfully for ${selectedEnv} (${selectedVer}).`);
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Deployment trigger failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRollback = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetchApi<{ success: boolean; data: any }>('/api/releases/rollback', {
        method: 'POST',
        body: JSON.stringify({
          environment: selectedEnv,
          targetVersion: 'v2.0.7'
        })
      });
      if (res?.success) {
        setMessage(`Rollback ${res.data.rollbackId} executed for ${selectedEnv}. Target version applied: v2.0.7.`);
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Rollback execution failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (releaseId: string, role: 'QA_LEAD' | 'SECURITY_LEAD' | 'RELEASE_MANAGER', decision: 'APPROVED' | 'REJECTED') => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetchApi<{ success: boolean; data: any }>('/api/releases/approve', {
        method: 'POST',
        body: JSON.stringify({
          releaseId,
          approverRole: role,
          decision,
          comments: `${role} verification passed for release ${releaseId}.`
        })
      });
      if (res?.success) {
        setMessage(`Approval decision ${decision} registered by ${role} for release ${releaseId}.`);
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Approval registration failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">EP29 Enterprise Release & Environment Management (EREM)</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Release & Deploy Pipelines
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Environments Registry • Release Management • CI/CD Deployment Pipeline • Rollback Engine • Multi-gate Approvals
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDeploy}
            disabled={actionLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Trigger Deployment</span>
          </button>

          <button
            onClick={handleRollback}
            disabled={actionLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rollback Env</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex items-center space-x-1 px-6 bg-slate-900/50 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'environments', label: 'Environments', icon: Server },
          { id: 'releases', label: 'Releases', icon: Rocket },
          { id: 'versions', label: 'Versions', icon: Tag },
          { id: 'deployments', label: 'Deployments', icon: Layers },
          { id: 'configurations', label: 'Configurations', icon: Sliders },
          { id: 'approvals', label: 'Approvals', icon: CheckSquare },
          { id: 'rollbacks', label: 'Rollbacks', icon: RotateCcw },
          { id: 'audit', label: 'Audit Log', icon: History },
          { id: 'runtime', label: 'EREM Workers', icon: Cpu },
          { id: 'inspector', label: 'Enterprise Inspector', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 px-3.5 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={loadData} className="underline text-xs hover:text-red-300">Retry</button>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-xs hover:text-emerald-300">Dismiss</button>
          </div>
        )}

        {/* TAB 01: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Environments Count</span>
                  <Server className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white">{dashboard?.totalEnvironmentsCount ?? 6}</div>
                <p className="text-[11px] text-emerald-400 mt-1">{dashboard?.healthyEnvironmentsCount ?? 6} Healthy Environments</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Active Releases</span>
                  <Rocket className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{dashboard?.totalReleasesCount ?? 2}</div>
                <p className="text-[11px] text-amber-400 mt-1">{dashboard?.pendingApprovalsCount ?? 1} Pending Approval Gate</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Deployments Today</span>
                  <Layers className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">{dashboard?.totalDeploymentsToday ?? 5}</div>
                <p className="text-[11px] text-blue-400 mt-1">{dashboard?.successfulDeploymentsCount ?? 5} Successful Deployments</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Release Health Index</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">{dashboard?.releaseHealthIndex ?? 100.0}%</div>
                <p className="text-[11px] text-amber-400 mt-1">{dashboard?.rollbacksExecutedCount ?? 1} Historic Rollback Logged</p>
              </div>
            </div>

            {/* Quick Action Deployment Controls */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-semibold text-white">Manual Deployment & Rollback Execution Gate</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Target Environment</label>
                  <select
                    value={selectedEnv}
                    onChange={(e) => setSelectedEnv(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono"
                  >
                    {environments.map(e => (
                      <option key={e.envId} value={e.envName}>{e.displayName} ({e.envName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Target Version Tag</label>
                  <select
                    value={selectedVer}
                    onChange={(e) => setSelectedVer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono"
                  >
                    {versions.map(v => (
                      <option key={v.versionId} value={v.releaseTag}>{v.releaseTag} (Semver: {v.semver})</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end space-x-2">
                  <button
                    onClick={handleDeploy}
                    disabled={actionLoading}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-3 rounded transition-all disabled:opacity-50"
                  >
                    Trigger Deploy
                  </button>
                  <button
                    onClick={handleRollback}
                    disabled={actionLoading}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-3 rounded transition-all disabled:opacity-50"
                  >
                    Rollback
                  </button>
                </div>
              </div>
            </div>

            {/* Environments Active Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {environments.map((env) => (
                <div key={env.envId} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{env.displayName}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {env.status}
                    </span>
                  </div>
                  <div className="text-xs text-cyan-400 font-mono">Active Version: {env.activeVersion}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Host: {env.hostUrl}</div>
                  <div className="text-[10px] text-slate-400">Deployed: {new Date(env.lastDeployedAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 02: ENVIRONMENTS */}
        {activeTab === 'environments' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 01: Environments Registry</h2>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Env ID</th>
                    <th className="p-3">Environment</th>
                    <th className="p-3">Display Name</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Active Version</th>
                    <th className="p-3">Host Endpoint</th>
                    <th className="p-3">Last Deployed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {environments.map((e) => (
                    <tr key={e.envId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-cyan-400 font-semibold">{e.envId}</td>
                      <td className="p-3 text-purple-400 font-bold">{e.envName}</td>
                      <td className="p-3 font-sans text-slate-200 font-semibold">{e.displayName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {e.status}
                        </span>
                      </td>
                      <td className="p-3 text-amber-300">{e.activeVersion}</td>
                      <td className="p-3 text-blue-400">{e.hostUrl}</td>
                      <td className="p-3 text-slate-500">{new Date(e.lastDeployedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 03: RELEASES */}
        {activeTab === 'releases' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 02: Release Registry</h2>

            <div className="space-y-4">
              {releases.map((r) => (
                <div key={r.releaseId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-cyan-400 font-bold">{r.releaseId}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {r.version}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${r.approvalStatus === 'PRODUCTION_APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {r.approvalStatus}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{r.releaseName}</h3>
                  <p className="text-xs text-slate-300">{r.releaseNotes}</p>
                  <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <div>Owner: <span className="text-cyan-400 font-bold">{r.owner}</span> • Target Env: {r.targetEnvironment}</div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleApprove(r.releaseId, 'QA_LEAD', 'APPROVED')}
                        className="px-2 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700"
                      >
                        Approve QA
                      </button>
                      <button
                        onClick={() => handleApprove(r.releaseId, 'SECURITY_LEAD', 'APPROVED')}
                        className="px-2 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-purple-300 rounded border border-slate-700"
                      >
                        Approve Security
                      </button>
                      <button
                        onClick={() => handleApprove(r.releaseId, 'RELEASE_MANAGER', 'APPROVED')}
                        className="px-2 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700"
                      >
                        Approve Production
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 04: VERSIONS */}
        {activeTab === 'versions' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 04: Version Management & Rollback Targets</h2>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Version ID</th>
                    <th className="p-3">SemVer</th>
                    <th className="p-3">Release Tag</th>
                    <th className="p-3">Commit Hash</th>
                    <th className="p-3">Compatibility</th>
                    <th className="p-3">Rollback Target</th>
                    <th className="p-3">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {versions.map((v) => (
                    <tr key={v.versionId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-cyan-400 font-semibold">{v.versionId}</td>
                      <td className="p-3 text-slate-200 font-bold">{v.semver}</td>
                      <td className="p-3 text-purple-400 font-bold">{v.releaseTag}</td>
                      <td className="p-3 text-blue-400">{v.commitHash}</td>
                      <td className="p-3 text-emerald-400">{v.compatibilityStatus}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {v.isRollbackTarget ? 'VALIDATED TARGET' : 'NO'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{new Date(v.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 05: DEPLOYMENTS */}
        {activeTab === 'deployments' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 03: CI/CD Deployment Pipeline</h2>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Deployment ID</th>
                    <th className="p-3">Release ID</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Environment</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Pipeline Step</th>
                    <th className="p-3">Triggered By</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Deployed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {deployments.map((d) => (
                    <tr key={d.deploymentId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-cyan-400 font-semibold">{d.deploymentId}</td>
                      <td className="p-3 text-slate-300">{d.releaseId}</td>
                      <td className="p-3 text-purple-400 font-bold">{d.version}</td>
                      <td className="p-3 text-blue-400 font-bold">{d.environment}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3 text-amber-300">{d.pipelineStep}</td>
                      <td className="p-3 text-slate-300">{d.triggeredBy}</td>
                      <td className="p-3 text-slate-400">{d.durationSeconds}s</td>
                      <td className="p-3 text-slate-500">{new Date(d.deployedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 06: CONFIGURATIONS */}
        {activeTab === 'configurations' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 05: Configuration Profiles & Secrets Reference</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configurations.map((c) => (
                <div key={c.configId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-cyan-400 font-bold">{c.configId}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {c.environment}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{c.profileName}</h3>
                  <div className="text-xs text-slate-400">Secrets Referenced: <span className="text-amber-400 font-bold">{c.secretsReferenceCount} Keys</span></div>
                  <div className="text-xs text-slate-500">Updated By: {c.lastUpdatedBy} • {new Date(c.updatedAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 07: APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 06: Release Approval Workflow</h2>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Approval ID</th>
                    <th className="p-3">Release ID</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Approver Role</th>
                    <th className="p-3">Approver Name</th>
                    <th className="p-3">Decision</th>
                    <th className="p-3">Comments</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {approvals.map((a) => (
                    <tr key={a.approvalId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-cyan-400 font-semibold">{a.approvalId}</td>
                      <td className="p-3 text-slate-300">{a.releaseId}</td>
                      <td className="p-3 text-purple-400">{a.version}</td>
                      <td className="p-3 text-blue-400 font-bold">{a.approverRole}</td>
                      <td className="p-3 text-slate-200">{a.approverName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${a.decision === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {a.decision}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-300">{a.comments}</td>
                      <td className="p-3 text-slate-500">{new Date(a.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 08: ROLLBACKS */}
        {activeTab === 'rollbacks' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 07: Rollback Management Engine</h2>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Rollback ID</th>
                    <th className="p-3">Deployment ID</th>
                    <th className="p-3">Environment</th>
                    <th className="p-3">From Version</th>
                    <th className="p-3">To Version</th>
                    <th className="p-3">Rollback Type</th>
                    <th className="p-3">Executed By</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {rollbacks.map((r) => (
                    <tr key={r.rollbackId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-amber-400 font-semibold">{r.rollbackId}</td>
                      <td className="p-3 text-slate-400">{r.deploymentId}</td>
                      <td className="p-3 text-cyan-400 font-bold">{r.environment}</td>
                      <td className="p-3 text-red-400">{r.fromVersion}</td>
                      <td className="p-3 text-emerald-400 font-bold">{r.toVersion}</td>
                      <td className="p-3 text-purple-400">{r.rollbackType}</td>
                      <td className="p-3 text-slate-300">{r.executedBy}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{new Date(r.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 09: AUDIT */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 09: Release Audit Log</h2>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Audit ID</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Operator</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {auditLogs.map((a) => (
                    <tr key={a.auditId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-cyan-400 font-semibold">{a.auditId}</td>
                      <td className="p-3 text-slate-200 font-semibold">{a.eventType}</td>
                      <td className="p-3 text-purple-400">{a.operator}</td>
                      <td className="p-3 font-sans text-slate-300">{a.details}</td>
                      <td className="p-3 text-slate-500">{new Date(a.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 10: RUNTIME WORKERS */}
        {activeTab === 'runtime' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 10: Environment Runtime Workers</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {workers.map((w) => (
                <div key={w.workerId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-400 font-bold">{w.workerId}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {w.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-sans">{w.workerType}</h3>
                  <div className="text-slate-400">Processed Jobs: <span className="text-purple-400 font-bold">{w.processedJobs}</span></div>
                  <div className="text-slate-500 text-[10px]">Uptime: {w.uptimeSeconds}s</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 11: INSPECTOR / QA */}
        {activeTab === 'inspector' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 15: Enterprise EREM QA & Verification Suite</h2>
                <p className="text-xs text-slate-400 mt-1">Full platform release & environment verification for EP29.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {qaReport?.buildStatus || 'PRODUCTION_READY_PASS'}
              </span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Module ID</th>
                    <th className="p-3">Module Name</th>
                    <th className="p-3">Verification Result</th>
                    <th className="p-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {qaReport?.modules.map((m) => (
                    <tr key={m.moduleId} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-cyan-400 font-semibold">{m.moduleId}</td>
                      <td className="p-3 font-semibold text-slate-200">{m.moduleName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{m.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
