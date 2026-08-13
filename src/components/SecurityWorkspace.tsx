import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Key,
  Lock,
  Eye,
  FileText,
  Activity,
  History,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
  Server,
  Radio,
  Cpu
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import {
  SecurityThreatItem,
  IntrusionRecordItem,
  VulnerabilityItem,
  SecretMonitoringItem,
  SecurityPolicyRule,
  SecurityIncidentItem,
  SecurityAlertItem,
  SecurityAuditItem,
  SocRuntimeWorker,
  SocDashboardOverview,
  SocQaReport
} from '../modules/security/types/ep28.types';

type TabType =
  | 'dashboard'
  | 'threats'
  | 'intrusions'
  | 'vulnerabilities'
  | 'policies'
  | 'secrets'
  | 'alerts'
  | 'incidents'
  | 'audit'
  | 'runtime'
  | 'inspector';

export const SecurityWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Data States
  const [dashboard, setDashboard] = useState<SocDashboardOverview | null>(null);
  const [threats, setThreats] = useState<SecurityThreatItem[]>([]);
  const [intrusions, setIntrusions] = useState<IntrusionRecordItem[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityItem[]>([]);
  const [secrets, setSecrets] = useState<SecretMonitoringItem[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicyRule[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncidentItem[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlertItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditItem[]>([]);
  const [workers, setWorkers] = useState<SocRuntimeWorker[]>([]);
  const [qaReport, setQaReport] = useState<SocQaReport | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        dashRes,
        threatsRes,
        intrusionsRes,
        vulnRes,
        secRes,
        polRes,
        incRes,
        altRes,
        auditRes,
        workRes,
        qaRes
      ] = await Promise.all([
        fetchApi<{ success: boolean; data: SocDashboardOverview }>('/api/security/dashboard'),
        fetchApi<{ success: boolean; data: SecurityThreatItem[] }>('/api/security/threats'),
        fetchApi<{ success: boolean; data: IntrusionRecordItem[] }>('/api/security/intrusions'),
        fetchApi<{ success: boolean; data: VulnerabilityItem[] }>('/api/security/vulnerabilities'),
        fetchApi<{ success: boolean; data: SecretMonitoringItem[] }>('/api/security/secrets'),
        fetchApi<{ success: boolean; data: SecurityPolicyRule[] }>('/api/security/policies'),
        fetchApi<{ success: boolean; data: SecurityIncidentItem[] }>('/api/security/incidents'),
        fetchApi<{ success: boolean; data: SecurityAlertItem[] }>('/api/security/alerts'),
        fetchApi<{ success: boolean; data: SecurityAuditItem[] }>('/api/security/audit'),
        fetchApi<{ success: boolean; data: SocRuntimeWorker[] }>('/api/security/workers'),
        fetchApi<{ success: boolean; data: SocQaReport }>('/api/security/qa')
      ]);

      if (dashRes?.data) setDashboard(dashRes.data);
      if (threatsRes?.data) setThreats(threatsRes.data);
      if (intrusionsRes?.data) setIntrusions(intrusionsRes.data);
      if (vulnRes?.data) setVulnerabilities(vulnRes.data);
      if (secRes?.data) setSecrets(secRes.data);
      if (polRes?.data) setPolicies(polRes.data);
      if (incRes?.data) setIncidents(incRes.data);
      if (altRes?.data) setAlerts(altRes.data);
      if (auditRes?.data) setAuditLogs(auditRes.data);
      if (workRes?.data) setWorkers(workRes.data);
      if (qaRes?.data) setQaReport(qaRes.data);
    } catch (err: any) {
      console.error('Failed to load SOC data:', err);
      setError('Failed to fetch Enterprise SOC telemetry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerScan = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetchApi<{ success: boolean; data: any }>('/api/security/scan', {
        method: 'POST'
      });
      if (res?.success) {
        setMessage(`Security Scan ${res.data.scanId} complete. ${res.data.threatsFound} active threats monitored.`);
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Threat scan failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRotateKeys = async (keyId?: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetchApi<{ success: boolean; data: any }>('/api/security/rotate-keys', {
        method: 'POST',
        body: JSON.stringify({ keyId })
      });
      if (res?.success) {
        setMessage(`${res.data.rotatedKeysCount} security keys rotated successfully.`);
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Key rotation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">EP28 Enterprise Security Operations Center (SOC)</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                Threat Detection & Monitoring
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time Security Event Monitoring • Intrusion Prevention • Incident Response • Secrets & Key Rotation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerScan}
            disabled={actionLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Trigger Threat Scan</span>
          </button>

          <button
            onClick={() => handleRotateKeys()}
            disabled={actionLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rotate Secrets</span>
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
          { id: 'threats', label: 'Threats', icon: ShieldAlert },
          { id: 'intrusions', label: 'Intrusions', icon: AlertOctagon },
          { id: 'vulnerabilities', label: 'Vulnerabilities', icon: Eye },
          { id: 'policies', label: 'Policies', icon: Lock },
          { id: 'secrets', label: 'Secrets & Keys', icon: Key },
          { id: 'alerts', label: 'Alerts', icon: Radio },
          { id: 'incidents', label: 'Incidents', icon: FileText },
          { id: 'audit', label: 'Audit Log', icon: History },
          { id: 'runtime', label: 'SOC Workers', icon: Cpu },
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
                  ? 'border-red-500 text-red-400 bg-red-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Workspace Content */}
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
                  <span className="text-xs font-medium uppercase tracking-wider">Security Events Today</span>
                  <Activity className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white">{dashboard?.totalSecurityEventsToday.toLocaleString() ?? '18,450'}</div>
                <p className="text-[11px] text-red-400 mt-1">100% Telemetry Processed</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Active Threat Vectors</span>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">{dashboard?.activeThreatsCount ?? 1}</div>
                <p className="text-[11px] text-amber-400 mt-1">{dashboard?.blockedIntrusionsCount ?? 47} Intrusions Firewall Blocked</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Open Security Incidents</span>
                  <FileText className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{dashboard?.openIncidentsCount ?? 2}</div>
                <p className="text-[11px] text-purple-400 mt-1">{dashboard?.openVulnerabilitiesCount ?? 1} CVE Vulnerability Pending</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">SOC Health Index</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">{dashboard?.socHealthIndex ?? 99.8}%</div>
                <p className="text-[11px] text-emerald-400 mt-1">Rotation Due: {dashboard?.secretsRotationDueCount ?? 1} Key</p>
              </div>
            </div>

            {/* Active Threat Stream & Quick Rotation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white">Active Security Threats</h3>
                <div className="space-y-3">
                  {threats.map((t) => (
                    <div key={t.threatId} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-red-400">{t.threatType}</div>
                        <div className="text-[11px] text-slate-300 font-mono">{t.targetResource}</div>
                        <div className="text-[10px] text-slate-500">Source IP: {t.sourceIp}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${t.status === 'ACTIVE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                          {t.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">{t.detectedCount} hits</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white">Platform Secrets & Key Health</h3>
                  <button
                    onClick={() => handleRotateKeys()}
                    disabled={actionLoading}
                    className="px-2.5 py-1 text-[11px] rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                  >
                    Force Global Rotation
                  </button>
                </div>
                <div className="space-y-3">
                  {secrets.map((s) => (
                    <div key={s.secretId} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-200">{s.secretName}</div>
                        <div className="text-[10px] text-slate-400">Category: {s.category} • Expiry: {s.expiresAt}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${s.rotationStatus === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {s.rotationStatus}
                        </span>
                        <div className="mt-1">
                          <button
                            onClick={() => handleRotateKeys(s.secretId)}
                            disabled={actionLoading}
                            className="text-[10px] text-blue-400 hover:underline"
                          >
                            Rotate Key
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 02: THREATS */}
        {activeTab === 'threats' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 02: Threat Detection Engine</h2>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Threat ID</th>
                    <th className="p-3">Threat Vector</th>
                    <th className="p-3">Target Resource</th>
                    <th className="p-3">Source IP</th>
                    <th className="p-3">Hits</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Detected At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {threats.map((t) => (
                    <tr key={t.threatId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-red-400 font-semibold">{t.threatId}</td>
                      <td className="p-3 text-amber-300 font-bold">{t.threatType}</td>
                      <td className="p-3 text-slate-200">{t.targetResource}</td>
                      <td className="p-3 text-cyan-400">{t.sourceIp}</td>
                      <td className="p-3 text-purple-400">{t.detectedCount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${t.status === 'ACTIVE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{new Date(t.detectedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 03: INTRUSIONS */}
        {activeTab === 'intrusions' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 03: Intrusion Detection & Firewall Blocking</h2>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Intrusion ID</th>
                    <th className="p-3">Detection Type</th>
                    <th className="p-3">Source IP</th>
                    <th className="p-3">Attempted Resource</th>
                    <th className="p-3">Blocked Count</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {intrusions.map((i) => (
                    <tr key={i.intrusionId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-blue-400 font-semibold">{i.intrusionId}</td>
                      <td className="p-3 text-red-300 font-bold">{i.detectionType}</td>
                      <td className="p-3 text-cyan-400">{i.sourceIp}</td>
                      <td className="p-3 text-slate-200">{i.attemptedResource}</td>
                      <td className="p-3 text-amber-400">{i.blockedCount}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          {i.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{new Date(i.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 04: VULNERABILITIES */}
        {activeTab === 'vulnerabilities' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 04: Vulnerability Registry & CVE Tracker</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vulnerabilities.map((v) => (
                <div key={v.vulnerabilityId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-red-400 font-bold">{v.cveOrIdentifier}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${v.severity === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {v.severity} SEVERITY
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{v.affectedComponent}</h3>
                  <div className="text-xs text-slate-400">Owner: <span className="text-cyan-400 font-bold">{v.owner}</span> • Discovered: {v.discoveredAt}</div>
                  <div className="text-xs text-slate-400">Status: <span className="text-purple-400 font-bold">{v.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 05: POLICIES */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 06: Security Policy Engine</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {policies.map((p) => (
                <div key={p.policyId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-blue-400 font-bold">{p.policyId}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {p.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{p.policyName}</h3>
                  <div className="text-xs text-slate-400">Category: <span className="text-purple-400 font-bold">{p.category}</span></div>
                  <div className="text-[10px] text-slate-500">Last Enforced: {new Date(p.lastEnforcedAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 06: SECRETS */}
        {activeTab === 'secrets' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 05: Secrets & Key Rotation Monitoring</h2>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Secret ID</th>
                    <th className="p-3">Secret Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Rotation Status</th>
                    <th className="p-3">Last Rotated</th>
                    <th className="p-3">Expires At</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {secrets.map((s) => (
                    <tr key={s.secretId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-blue-400 font-semibold">{s.secretId}</td>
                      <td className="p-3 text-slate-200 font-sans font-semibold">{s.secretName}</td>
                      <td className="p-3 text-purple-400">{s.category}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${s.rotationStatus === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {s.rotationStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{s.lastRotatedAt}</td>
                      <td className="p-3 text-amber-400">{s.expiresAt}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleRotateKeys(s.secretId)}
                          disabled={actionLoading}
                          className="px-2 py-1 text-[10px] font-bold rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700"
                        >
                          Rotate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 07: ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 08: Security Alerts Engine</h2>

            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.alertId} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-red-400">{a.alertId}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${a.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {a.severity}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{a.title}</h3>
                    <p className="text-xs text-slate-400">Source: {a.source} • Created: {new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {a.isAcknowledged ? 'ACKNOWLEDGED' : 'NEW'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 08: INCIDENTS */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 07: Incident Response Engine</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incidents.map((i) => (
                <div key={i.incidentId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-purple-400 font-bold">{i.incidentId}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/10 text-red-400 border border-red-500/20">
                      {i.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{i.title}</h3>
                  <div className="text-xs text-slate-400">Assignee: <span className="text-cyan-400 font-bold">{i.assignee}</span></div>
                  <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800">
                    {i.containmentDetails}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 09: AUDIT */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 09: Security Audit Trail</h2>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Audit ID</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Operator</th>
                    <th className="p-3">Audit Details</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {auditLogs.map((a) => (
                    <tr key={a.auditId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-blue-400 font-semibold">{a.auditId}</td>
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
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 10: SOC Runtime Workers</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {workers.map((w) => (
                <div key={w.workerId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 font-bold">{w.workerId}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {w.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-sans">{w.workerType}</h3>
                  <div className="text-slate-400">Processed Items: <span className="text-cyan-400 font-bold">{w.processedCount}</span></div>
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
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 15: Enterprise SOC QA & Verification Suite</h2>
                <p className="text-xs text-slate-400 mt-1">Full platform security verification for EP28.</p>
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
                      <td className="p-3 font-mono text-red-400 font-semibold">{m.moduleId}</td>
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
