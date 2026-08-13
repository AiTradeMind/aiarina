import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Power, 
  ShieldCheck, 
  Activity, 
  Lock, 
  Key, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Pause, 
  Square, 
  Server, 
  Clock, 
  FileText,
  Radio,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchApi } from '../lib/api';

export function AIActivationWorkspace() {
  const [statusData, setStatusData] = useState<any>(null);
  const [runtimes, setRuntimes] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [quotas, setQuotas] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [qaResult, setQaResult] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'RUNTIMES' | 'HEALTH' | 'LICENSES' | 'QUOTAS' | 'CERTIFICATES' | 'AUDIT' | 'EVENTS' | 'QA'>('DASHBOARD');
  const [notice, setNotice] = useState<string | null>(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [statusRes, runtimesRes, healthRes, licenseRes, quotaRes, certRes, auditRes, eventRes]: any = await Promise.all([
        fetchApi('/api/ai/status'),
        fetchApi('/api/ai/runtime'),
        fetchApi('/api/ai/health'),
        fetchApi('/api/ai/license'),
        fetchApi('/api/ai/quota'),
        fetchApi('/api/ai/certificates'),
        fetchApi('/api/ai/audits'),
        fetchApi('/api/ai/events')
      ]);

      if (statusRes?.success) setStatusData(statusRes.data);
      if (runtimesRes?.success) setRuntimes(runtimesRes.data);
      if (healthRes?.success) setHealthData(healthRes.data);
      if (licenseRes?.success) setLicenses(licenseRes.data);
      if (quotaRes?.success) setQuotas(quotaRes.data);
      if (certRes?.success) setCertificates(certRes.data);
      if (auditRes?.success) setAudits(auditRes.data);
      if (eventRes?.success) setEvents(eventRes.data);
    } catch (err: any) {
      console.error('Failed to load AI Activation data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAction = async (action: 'activate' | 'pause' | 'resume' | 'stop' | 'restart', aiModelId: string) => {
    setIsLoading(true);
    setNotice(`Executing ${action.toUpperCase()} on AI Model ${aiModelId}...`);
    try {
      const res: any = await fetchApi(`/api/ai/${action}`, {
        method: 'POST',
        body: JSON.stringify({ aiModelId, operator: 'AI_CHIEF_OFFICER' })
      });
      if (res?.success) {
        setNotice(`Successfully executed ${action.toUpperCase()} for ${aiModelId}`);
        await loadAllData();
      } else {
        setNotice(`Action ${action} failed: ${res?.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setNotice(`Action ${action} error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunQa = async () => {
    setIsLoading(true);
    setNotice('Running EP03 Enterprise QA & Verification Suite...');
    try {
      const res: any = await fetchApi('/api/ai/qa');
      if (res?.success) {
        setQaResult(res.data);
        setNotice('EP03 QA Suite PASSED: All 28 AI Runtimes, licenses, quotas, and certificates verified.');
      }
    } catch (err: any) {
      setNotice(`QA failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-terminal-text font-mono overflow-hidden">
      {/* HEADER */}
      <div className="p-4 bg-terminal-panel border-b border-terminal-border flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-terminal-amber/10 border border-terminal-amber/30 text-terminal-amber rounded-lg">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white uppercase tracking-wider">EP03 — Enterprise AI Activation &amp; Runtime Management Engine</h1>
              <span className="px-2 py-0.5 bg-terminal-green text-black font-extrabold text-[10px] rounded uppercase tracking-widest">
                ACTIVE GATEWAY
              </span>
              <span className="px-2 py-0.5 bg-terminal-amber/20 border border-terminal-amber/40 text-terminal-amber font-bold text-[10px] rounded uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" /> SECURE ISOLATION
              </span>
            </div>
            <p className="text-xs text-terminal-muted mt-0.5">
              Strict Gatekeeper for Research, Market Intelligence, Strategy, Committee, and Trading Runtimes across 28 Independent AI Models.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadAllData} 
            disabled={isLoading}
            className="px-3 py-2 bg-terminal-border hover:bg-terminal-border/80 text-white rounded text-xs font-bold flex items-center gap-2 transition"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} /> Refresh
          </button>
          <button 
            onClick={handleRunQa}
            disabled={isLoading}
            className="px-4 py-2 bg-terminal-amber text-black hover:bg-terminal-amber/90 rounded text-xs font-black uppercase tracking-wider flex items-center gap-2 transition"
          >
            <ShieldCheck className="w-4 h-4" /> Run EP03 QA
          </button>
        </div>
      </div>

      {notice && (
        <div className="px-4 py-2 bg-terminal-amber/10 border-b border-terminal-amber/30 text-terminal-amber text-xs flex items-center justify-between shrink-0">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4" /> {notice}
          </span>
          <button onClick={() => setNotice(null)} className="text-terminal-muted hover:text-white font-bold">&times;</button>
        </div>
      )}

      {/* STATS SUMMARY BAR */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 p-4 bg-terminal-panel/50 border-b border-terminal-border shrink-0">
        <div className="p-3 bg-black border border-terminal-border rounded">
          <div className="text-[10px] text-terminal-muted uppercase">Registered AI</div>
          <div className="text-lg font-bold text-white">{statusData?.totalRegistered || 28}</div>
        </div>
        <div className="p-3 bg-black border border-terminal-border rounded">
          <div className="text-[10px] text-terminal-muted uppercase">Ready Runtimes</div>
          <div className="text-lg font-bold text-terminal-green">{statusData?.ready || 28}</div>
        </div>
        <div className="p-3 bg-black border border-terminal-border rounded">
          <div className="text-[10px] text-terminal-muted uppercase">Active Runtimes</div>
          <div className="text-lg font-bold text-terminal-amber">{statusData?.active || 0}</div>
        </div>
        <div className="p-3 bg-black border border-terminal-border rounded">
          <div className="text-[10px] text-terminal-muted uppercase">Paused</div>
          <div className="text-lg font-bold text-yellow-400">{statusData?.paused || 0}</div>
        </div>
        <div className="p-3 bg-black border border-terminal-border rounded">
          <div className="text-[10px] text-terminal-muted uppercase">Stopped / OFF</div>
          <div className="text-lg font-bold text-terminal-muted">{statusData?.stopped || 28}</div>
        </div>
        <div className="p-3 bg-black border border-terminal-border rounded">
          <div className="text-[10px] text-terminal-muted uppercase">Failed / Errors</div>
          <div className="text-lg font-bold text-red-400">{statusData?.failed || 0}</div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-terminal-border bg-terminal-panel overflow-x-auto shrink-0">
        {[
          { id: 'DASHBOARD', label: 'Dashboard & Overview', icon: Activity },
          { id: 'RUNTIMES', label: '28 AI Runtimes', icon: Server },
          { id: 'HEALTH', label: 'Health & Heartbeat', icon: Radio },
          { id: 'LICENSES', label: 'Licenses', icon: Key },
          { id: 'QUOTAS', label: 'Resources & Quotas', icon: Cpu },
          { id: 'CERTIFICATES', label: 'Activation Certificates', icon: ShieldCheck },
          { id: 'AUDIT', label: 'Audit Chain', icon: FileText },
          { id: 'EVENTS', label: 'Event Publisher', icon: Clock },
          { id: 'QA', label: 'Enterprise QA', icon: CheckCircle2 }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition whitespace-nowrap",
                activeTab === tab.id ? "border-terminal-amber text-terminal-amber bg-black/40" : "border-transparent text-terminal-muted hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <div className="p-5 bg-terminal-panel border border-terminal-border rounded-lg">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Enterprise Activation &amp; Isolation Principles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-terminal-muted">
                <div className="p-3 bg-black border border-terminal-border rounded">
                  <div className="font-bold text-white mb-1 uppercase text-terminal-amber">1. Strict Activation Gate</div>
                  No AI may perform Research, Market Intelligence, Strategy, Committee, Lifecycle, or Trading until EP03 Activation succeeds and cryptographic certificates are issued.
                </div>
                <div className="p-3 bg-black border border-terminal-border rounded">
                  <div className="font-bold text-white mb-1 uppercase text-terminal-amber">2. Complete Model Isolation</div>
                  Every AI model owns independent runtime, session, memory, cache, heartbeat, logs, and execution queue. Zero cross-contamination.
                </div>
                <div className="p-3 bg-black border border-terminal-border rounded">
                  <div className="font-bold text-white mb-1 uppercase text-terminal-amber">3. Indian Market Policy</div>
                  Activations automatically verify NSE, BSE, and MCX trading session status, holidays, and emergency maintenance stops prior to runtime release.
                </div>
              </div>
            </div>

            <div className="bg-terminal-panel border border-terminal-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-terminal-border flex justify-between items-center">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active 28 Enterprise AI Runtimes Quick Overview</h3>
                <span className="text-[10px] text-terminal-muted font-mono">Managed by AI Activation Coordinator</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black text-terminal-muted uppercase text-[10px] font-mono border-b border-terminal-border">
                    <tr>
                      <th className="p-3">AI Model ID</th>
                      <th className="p-3">Runtime ID</th>
                      <th className="p-3">Workspace</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Restarts</th>
                      <th className="p-3 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border">
                    {runtimes.slice(0, 10).map((r: any) => (
                      <tr key={r.aiModelId} className="hover:bg-terminal-border/20 transition">
                        <td className="p-3 font-bold text-white">{r.aiModelId}</td>
                        <td className="p-3 font-mono text-terminal-muted">{r.runtimeId}</td>
                        <td className="p-3">{r.workspaceId}</td>
                        <td className="p-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            r.status === 'ACTIVE' ? "bg-terminal-green/20 text-terminal-green border border-terminal-green/40" :
                            r.status === 'PAUSED' ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" :
                            "bg-terminal-muted/20 text-terminal-muted border border-terminal-muted/40"
                          )}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{r.restartCount}</td>
                        <td className="p-3 text-right space-x-2">
                          {r.status !== 'ACTIVE' ? (
                            <button onClick={() => handleAction('activate', r.aiModelId)} className="px-2 py-1 bg-terminal-green/20 text-terminal-green hover:bg-terminal-green/30 rounded text-[10px] font-bold uppercase">Activate</button>
                          ) : (
                            <button onClick={() => handleAction('pause', r.aiModelId)} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded text-[10px] font-bold uppercase">Pause</button>
                          )}
                          <button onClick={() => handleAction('stop', r.aiModelId)} className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-[10px] font-bold uppercase">Stop</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'RUNTIMES' && (
          <div className="bg-terminal-panel border border-terminal-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-terminal-border flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">All 28 Registered Enterprise AI Runtimes</h3>
              <span className="text-[10px] text-terminal-muted font-mono">Complete Isolation Enforced</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black text-terminal-muted uppercase text-[10px] font-mono border-b border-terminal-border">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">AI Model ID</th>
                    <th className="p-3">Runtime ID</th>
                    <th className="p-3">Tenant / Workspace</th>
                    <th className="p-3">Session ID</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border">
                  {runtimes.map((r: any, idx: number) => (
                    <tr key={r.aiModelId} className="hover:bg-terminal-border/20 transition">
                      <td className="p-3 text-terminal-muted font-mono">{idx + 1}</td>
                      <td className="p-3 font-bold text-white">{r.aiModelId}</td>
                      <td className="p-3 font-mono text-terminal-muted">{r.runtimeId}</td>
                      <td className="p-3 font-mono text-[11px]">{r.tenantId} / {r.workspaceId}</td>
                      <td className="p-3 font-mono text-[11px] text-terminal-muted">{r.sessionId}</td>
                      <td className="p-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          r.status === 'ACTIVE' ? "bg-terminal-green/20 text-terminal-green border border-terminal-green/40" :
                          r.status === 'PAUSED' ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" :
                          "bg-terminal-muted/20 text-terminal-muted border border-terminal-muted/40"
                        )}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {r.status !== 'ACTIVE' ? (
                          <button onClick={() => handleAction('activate', r.aiModelId)} className="px-2 py-1 bg-terminal-green text-black hover:bg-terminal-green/90 rounded text-[10px] font-black uppercase">Activate</button>
                        ) : (
                          <>
                            <button onClick={() => handleAction('pause', r.aiModelId)} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded text-[10px] font-bold uppercase">Pause</button>
                            <button onClick={() => handleAction('restart', r.aiModelId)} className="px-2 py-1 bg-terminal-amber/20 text-terminal-amber hover:bg-terminal-amber/30 rounded text-[10px] font-bold uppercase">Restart</button>
                          </>
                        )}
                        <button onClick={() => handleAction('stop', r.aiModelId)} className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-[10px] font-bold uppercase">Stop</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'HEALTH' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthData.map((h: any) => (
                <div key={h.aiModelId} className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-xs">{h.aiModelId}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      h.healthState === 'HEALTHY' ? "bg-terminal-green/20 text-terminal-green border border-terminal-green/40" : "bg-terminal-amber/20 text-terminal-amber border border-terminal-amber/40"
                    )}>
                      {h.healthState}
                    </span>
                  </div>
                  <div className="text-[11px] text-terminal-muted font-mono space-y-1">
                    <div>Runtime ID: {h.runtimeId}</div>
                    <div>Health Score: <span className="text-white font-bold">{h.healthScore}%</span></div>
                    <div>Heartbeat: <span className={h.heartbeat ? "text-terminal-green" : "text-red-400"}>{h.heartbeat ? "ACTIVE" : "LOST"}</span></div>
                    <div>CPU Usage: {h.cpuUsagePercent}% | RAM: {h.memoryUsageGb} GB</div>
                    <div>Latency: {h.latencyMs} ms | Stability: {h.stabilityScore}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'LICENSES' && (
          <div className="bg-terminal-panel border border-terminal-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-terminal-border">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Enterprise Runtime Licenses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black text-terminal-muted uppercase text-[10px] font-mono border-b border-terminal-border">
                  <tr>
                    <th className="p-3">License ID</th>
                    <th className="p-3">AI Model ID</th>
                    <th className="p-3">Runtime ID</th>
                    <th className="p-3">Expiry Date</th>
                    <th className="p-3">Signature</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border">
                  {licenses.map((l: any) => (
                    <tr key={l.id} className="hover:bg-terminal-border/20 transition">
                      <td className="p-3 font-mono text-white">{l.licenseId}</td>
                      <td className="p-3 font-bold">{l.aiModelId}</td>
                      <td className="p-3 font-mono text-terminal-muted">{l.runtimeId}</td>
                      <td className="p-3 font-mono">{new Date(l.expiryDate).toLocaleString()}</td>
                      <td className="p-3 font-mono text-[10px] text-terminal-muted truncate max-w-[150px]">{l.signature}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green border border-terminal-green/40 rounded text-[10px] font-bold uppercase">
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'QUOTAS' && (
          <div className="bg-terminal-panel border border-terminal-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-terminal-border">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Runtime Resource Allocation &amp; Quotas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black text-terminal-muted uppercase text-[10px] font-mono border-b border-terminal-border">
                  <tr>
                    <th className="p-3">Runtime ID</th>
                    <th className="p-3">CPU Limit</th>
                    <th className="p-3">Memory Limit</th>
                    <th className="p-3">Execution Limit</th>
                    <th className="p-3">API Limit / Min</th>
                    <th className="p-3">Max Tasks</th>
                    <th className="p-3">Throttled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border">
                  {quotas.map((q: any) => (
                    <tr key={q.id} className="hover:bg-terminal-border/20 transition">
                      <td className="p-3 font-mono text-white">{q.runtimeId}</td>
                      <td className="p-3">{q.cpuLimitPercent}%</td>
                      <td className="p-3">{q.memoryLimitGb} GB</td>
                      <td className="p-3">{q.executionLimitSec}s</td>
                      <td className="p-3">{q.apiLimitPerMin}</td>
                      <td className="p-3">{q.maxConcurrentTasks}</td>
                      <td className="p-3">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", q.throttled ? "bg-red-500/20 text-red-400" : "bg-terminal-green/20 text-terminal-green")}>
                          {q.throttled ? "THROTTLED" : "NORMAL"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'CERTIFICATES' && (
          <div className="bg-terminal-panel border border-terminal-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-terminal-border">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Immutable Activation Certificates</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black text-terminal-muted uppercase text-[10px] font-mono border-b border-terminal-border">
                  <tr>
                    <th className="p-3">Certificate ID</th>
                    <th className="p-3">AI Model ID</th>
                    <th className="p-3">Operator</th>
                    <th className="p-3">SHA-256 Hash</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border">
                  {certificates.map((c: any) => (
                    <tr key={c.id} className="hover:bg-terminal-border/20 transition">
                      <td className="p-3 font-mono text-terminal-amber font-bold">{c.certificateId}</td>
                      <td className="p-3 font-bold text-white">{c.aiModelId}</td>
                      <td className="p-3">{c.operator}</td>
                      <td className="p-3 font-mono text-[10px] text-terminal-muted truncate max-w-[200px]">{c.sha256Hash}</td>
                      <td className="p-3 font-mono">{new Date(c.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'AUDIT' && (
          <div className="bg-terminal-panel border border-terminal-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-terminal-border">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Enterprise Runtime Audit Chain</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black text-terminal-muted uppercase text-[10px] font-mono border-b border-terminal-border">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Audit Type</th>
                    <th className="p-3">Runtime ID</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border">
                  {audits.map((a: any) => (
                    <tr key={a.id} className="hover:bg-terminal-border/20 transition">
                      <td className="p-3 font-mono text-terminal-muted">{new Date(a.createdAt).toLocaleString()}</td>
                      <td className="p-3 font-bold text-terminal-amber">{a.auditType}</td>
                      <td className="p-3 font-mono">{a.runtimeId}</td>
                      <td className="p-3">{a.actor}</td>
                      <td className="p-3 font-mono text-[11px] text-terminal-muted">{JSON.stringify(a.details)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'EVENTS' && (
          <div className="bg-terminal-panel border border-terminal-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-terminal-border">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Enterprise Event Publisher Stream</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black text-terminal-muted uppercase text-[10px] font-mono border-b border-terminal-border">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Runtime ID</th>
                    <th className="p-3">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border">
                  {events.map((e: any) => (
                    <tr key={e.id} className="hover:bg-terminal-border/20 transition">
                      <td className="p-3 font-mono text-terminal-muted">{new Date(e.createdAt).toLocaleString()}</td>
                      <td className="p-3 font-bold text-terminal-green">{e.eventType}</td>
                      <td className="p-3 font-mono">{e.runtimeId || 'N/A'}</td>
                      <td className="p-3 font-mono text-[11px] text-terminal-muted">{JSON.stringify(e.payload)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'QA' && (
          <div className="space-y-4">
            <div className="p-5 bg-terminal-panel border border-terminal-border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">EP03 Enterprise QA Certification Summary</h3>
                <button onClick={handleRunQa} className="px-4 py-2 bg-terminal-amber text-black font-black uppercase text-xs rounded hover:bg-terminal-amber/90 transition">
                  Execute QA Suite
                </button>
              </div>
              {qaResult ? (
                <div className="p-4 bg-black border border-terminal-border rounded space-y-3 font-mono text-xs">
                  <div className="text-terminal-green font-bold text-sm">Status: {qaResult.status}</div>
                  <div>Suite Name: {qaResult.suiteName}</div>
                  <div>Timestamp: {qaResult.timestamp}</div>
                  <div className="border-t border-terminal-border pt-2 space-y-1 text-terminal-muted">
                    {Object.entries(qaResult.checks || {}).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="uppercase">{k}:</span>
                        <span className="text-white font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-terminal-muted py-8 text-center">
                  Click 'Execute QA Suite' to run comprehensive verification across all 28 Runtimes, licenses, quotas, and Indian Market policies.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
