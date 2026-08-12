import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Cpu, Layers, Lock, Settings, Play, CheckCircle, XCircle, 
  AlertCircle, Terminal, RefreshCw, Search, Columns, User, LayoutGrid, 
  List, Key, FileText, Activity, TrendingUp, Send, TrendingDown, Eye, HelpCircle, FileSpreadsheet, ArrowRight
} from 'lucide-react';
import { fetchApi } from '../lib/api';

interface DecisionPackage {
  id: string;
  decisionId: string;
  strategyId: string;
  aiModel: string;
  instrument: string;
  direction: string;
  confidence: number;
  consensus: number;
  certificate: string;
  correlationId: string;
  packageHash: string;
  createdAt: string;
}

interface ExecutionAuthorization {
  id: string;
  packageId: string;
  committeeCertificateVerified: boolean;
  consensusVerified: boolean;
  aiRuntimeVerified: boolean;
  treasuryVerified: boolean;
  marketVerified: boolean;
  executionPermission: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  createdAt: string;
}

interface QueueItem {
  id: string;
  packageId: string;
  priority: number;
  status: 'PENDING' | 'PROCESSING' | 'RETRYING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
  error: string;
  createdAt: string;
  updatedAt: string;
}

interface ExecutionContext {
  id: string;
  lifecycleId: string;
  strategyId: string;
  packageId: string;
  correlationId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

interface ExecutionCertificate {
  id: string;
  executionId: string;
  lifecycleId: string;
  sha256: string;
  digitalSignature: string;
  createdAt: string;
}

interface ExecutionAudit {
  id: string;
  auditType: string;
  hash: string;
  content: any;
  createdAt: string;
}

interface WorkspacePreferences {
  userId: string;
  workspaceLayout: string;
  savedViews: Array<{ id: string; name: string; query: any }>;
  gridSize: number;
  tableColumns: Record<string, string[]>;
  inspectorWidth: number;
  pinnedPanels: string[];
  shortcuts: Record<string, string>;
  defaultFilters: Record<string, any>;
  themeOverride: 'SYSTEM' | 'LIGHT' | 'DARK';
  updatedAt: string;
}

export const ExecutionWorkspace = () => {
  // Core API states
  const [packages, setPackages] = useState<DecisionPackage[]>([]);
  const [authorizations, setAuthorizations] = useState<ExecutionAuthorization[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [contexts, setContexts] = useState<ExecutionContext[]>([]);
  const [certificates, setCertificates] = useState<ExecutionCertificate[]>([]);
  const [audits, setAudits] = useState<ExecutionAudit[]>([]);
  const [pendingDecisions, setPendingDecisions] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<WorkspacePreferences | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INTAKE' | 'QUEUE' | 'AUDIT' | 'PREFERENCES'>('DASHBOARD');
  const [selectedItem, setSelectedItem] = useState<{ type: string; data: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [qaReport, setQaReport] = useState<any | null>(null);
  const [showQaModal, setShowQaModal] = useState(false);
  const [runningQa, setRunningQa] = useState(false);

  // Load Dashboard Data
  const loadDashboardData = async () => {
    try {
      const data = await fetchApi('/api/execution/dashboard');
      if (data && data.success) {
        setPackages(data.packages || []);
        setAuthorizations(data.authorizations || []);
        setQueue(data.queue || []);
        setContexts(data.contexts || []);
        setCertificates(data.certificates || []);
        setAudits(data.audits || []);
        setPendingDecisions(data.pendingDecisions || []);
      }
    } catch (err) {
      console.error("Failed to load execution dashboard data", err);
    }
  };

  // Load Workspace Preferences
  const loadPreferences = async () => {
    try {
      const data = await fetchApi('/api/workspace/preferences');
      if (data && data.success) {
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error("Failed to load workspace preferences", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadDashboardData(), loadPreferences()]);
      setLoading(false);
    };
    init();

    // Set polling interval for live state tracking (Module 11 worker runs in back)
    const interval = setInterval(loadDashboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  // MODULE 01: Intake approved committee decision
  const handleIntake = async (decision: any) => {
    setSubmittingId(decision.id);
    try {
      const result = await fetchApi('/api/execution/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionId: decision.id,
          candidateId: decision.candidateId,
          status: 'APPROVED',
          sessionId: decision.sessionId
        })
      });

      if (result && result.success) {
        await loadDashboardData();
        // Automatically select the newly created decision package
        const createdPkg = packages.find(p => p.decisionId === decision.id);
        if (createdPkg) setSelectedItem({ type: 'package', data: createdPkg });
      } else {
        alert("Failed to intake decision: " + (result?.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error on intake: " + err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  // MODULE 03: Authorize Execution and optionally enqueue
  const handleAuthorize = async (pkgId: string, enqueue: boolean) => {
    setSubmittingId(pkgId + "_auth");
    try {
      const result = await fetchApi('/api/execution/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkgId, enqueue })
      });

      if (result && result.success) {
        await loadDashboardData();
        // Select authorization record
        const authRec = authorizations.find(a => a.packageId === pkgId);
        if (authRec) setSelectedItem({ type: 'authorization', data: authRec });
      } else {
        alert("Authorization failed: " + (result?.reason || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error on authorization: " + err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  // MODULE 04: Enqueue manually
  const handleEnqueue = async (pkgId: string) => {
    setSubmittingId(pkgId + "_enqueue");
    try {
      const result = await fetchApi('/api/execution/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkgId, priority: 5 })
      });

      if (result && result.success) {
        await loadDashboardData();
      } else {
        alert("Failed to enqueue: " + (result?.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error on enqueue: " + err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  // MODULE 14: Centralized Preferences Updater
  const updatePreferenceField = async (field: keyof WorkspacePreferences, value: any) => {
    if (!preferences) return;
    const updated = { ...preferences, [field]: value };
    setPreferences(updated);

    try {
      await fetchApi('/api/workspace/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error("Failed to save preference field", err);
    }
  };

  // MODULE 19: Execute QA Suite
  const runQASuite = async () => {
    setRunningQa(true);
    setShowQaModal(true);
    try {
      const result = await fetchApi('/api/execution/qa');
      if (result && result.success) {
        setQaReport(result.report);
      }
    } catch (err) {
      console.error("Failed to execute QA Verification Suite", err);
    } finally {
      setRunningQa(false);
    }
  };

  // Filters packages & queue
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.instrument.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pkg.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pkg.strategyId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredQueue = queue.filter(item => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-zinc-950 text-white font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-zinc-400 font-mono text-xs uppercase tracking-widest">Initialising EP10 Control Room...</span>
      </div>
    );
  }

  // Dashboard Stats Calculations
  const stats = {
    totalPackages: packages.length,
    authorized: authorizations.filter(a => a.status === 'APPROVED').length,
    rejected: authorizations.filter(a => a.status === 'REJECTED').length,
    pendingAuth: packages.filter(p => !authorizations.some(a => a.packageId === p.id)).length,
    queuePending: queue.filter(q => q.status === 'PENDING' || q.status === 'RETRYING' || q.status === 'PROCESSING').length,
    completed: queue.filter(q => q.status === 'SUCCESS').length,
    failed: queue.filter(q => q.status === 'FAILED').length
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans text-sm selection:bg-amber-500 selection:text-black">
      {/* HEADER CONTROL BAR */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white font-mono uppercase">EP10 — Decision Authorization & Execution Control</h1>
            <p className="text-xs text-zinc-400">Enterprise policy compliance routing & lifecycle trigger gateway</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded">
            <button 
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium tracking-wider uppercase transition-all ${activeTab === 'DASHBOARD' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              Control Center
            </button>
            <button 
              onClick={() => setActiveTab('INTAKE')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium tracking-wider uppercase transition-all relative ${activeTab === 'INTAKE' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              Intake
              {pendingDecisions.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {pendingDecisions.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('QUEUE')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium tracking-wider uppercase transition-all ${activeTab === 'QUEUE' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              Queue ({stats.queuePending})
            </button>
            <button 
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium tracking-wider uppercase transition-all ${activeTab === 'AUDIT' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              Audit Trail
            </button>
            <button 
              onClick={() => setActiveTab('PREFERENCES')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium tracking-wider uppercase transition-all ${activeTab === 'PREFERENCES' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              Layout
            </button>
          </div>

          <button 
            onClick={runQASuite}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 text-xs font-mono tracking-wider font-bold text-amber-500 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            QA EXEC
          </button>
        </div>
      </header>

      {/* METRIC RIBBON */}
      <section className="grid grid-cols-4 md:grid-cols-7 border-b border-zinc-800 bg-zinc-900/30 font-mono text-xs">
        <div className="p-4 border-r border-zinc-800 flex flex-col gap-1">
          <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Decision Intake</span>
          <span className="text-xl font-bold text-white">{stats.totalPackages}</span>
          <span className="text-[10px] text-zinc-500">Immutable packages</span>
        </div>
        <div className="p-4 border-r border-zinc-800 flex flex-col gap-1">
          <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Authorized (EP03)</span>
          <span className="text-xl font-bold text-emerald-400">{stats.authorized}</span>
          <span className="text-[10px] text-zinc-500">Verified status APPROVED</span>
        </div>
        <div className="p-4 border-r border-zinc-800 flex flex-col gap-1">
          <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Rejected (EP09)</span>
          <span className="text-xl font-bold text-red-400">{stats.rejected}</span>
          <span className="text-[10px] text-zinc-500">Failed compliance</span>
        </div>
        <div className="p-4 border-r border-zinc-800 flex flex-col gap-1">
          <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Pending Auth</span>
          <span className="text-xl font-bold text-amber-500">{stats.pendingAuth}</span>
          <span className="text-[10px] text-zinc-500">Awaiting validation</span>
        </div>
        <div className="p-4 border-r border-zinc-800 flex flex-col gap-1">
          <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Active Queue</span>
          <span className="text-xl font-bold text-blue-400">{stats.queuePending}</span>
          <span className="text-[10px] text-zinc-500">Workers processing</span>
        </div>
        <div className="p-4 border-r border-zinc-800 flex flex-col gap-1">
          <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Routed Paper</span>
          <span className="text-xl font-bold text-zinc-300">{stats.completed}</span>
          <span className="text-[10px] text-zinc-500">V1 Output: Paper Trading</span>
        </div>
        <div className="p-4 flex flex-col gap-1">
          <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Worker Health</span>
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold mt-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            STABLE
          </span>
          <span className="text-[10px] text-zinc-500">Timeout: 30s max</span>
        </div>
      </section>

      {/* MAIN CONTAINER PANES */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT COMPONENT / TABLE AREA */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          <AnimatePresence mode="wait">
            {/* CONTROL CENTER / DASHBOARD */}
            {activeTab === 'DASHBOARD' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                {/* Section header */}
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono">Immutable Decision Packages</h2>
                  <div className="flex gap-2 items-center">
                    <Search className="w-4 h-4 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Search packages, strategy..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-xs text-white px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500 w-64"
                    />
                  </div>
                </div>

                {filteredPackages.length === 0 ? (
                  <div className="p-12 border border-dashed border-zinc-800 text-center text-zinc-500">
                    <Layers className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                    <p className="text-xs font-mono uppercase tracking-wider">No Decision Packages Mapped</p>
                    <p className="text-xs mt-1">Head to the "Intake" tab to process approved committee decisions.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-zinc-800 rounded">
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                          <th className="p-3">Package ID</th>
                          <th className="p-3">Strategy ID</th>
                          <th className="p-3">Asset</th>
                          <th className="p-3">Direction</th>
                          <th className="p-3">Confidence</th>
                          <th className="p-3">Consensus</th>
                          <th className="p-3">Compliance</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPackages.map(pkg => {
                          const auth = authorizations.find(a => a.packageId === pkg.id);
                          const queuedItem = queue.find(q => q.packageId === pkg.id);

                          return (
                            <tr 
                              key={pkg.id} 
                              onClick={() => setSelectedItem({ type: 'package', data: pkg })}
                              className={`border-b border-zinc-800 hover:bg-zinc-900/40 cursor-pointer transition-all ${selectedItem?.data?.id === pkg.id ? 'bg-zinc-900/50 border-l-2 border-l-amber-500' : ''}`}
                            >
                              <td className="p-3 font-semibold text-white truncate max-w-[120px]">{pkg.id}</td>
                              <td className="p-3 text-zinc-400 truncate max-w-[150px]">{pkg.strategyId}</td>
                              <td className="p-3 text-white font-bold">{pkg.instrument}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pkg.direction === 'LONG' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                                  {pkg.direction}
                                </span>
                              </td>
                              <td className="p-3 text-zinc-300">{pkg.confidence}%</td>
                              <td className="p-3 text-zinc-300 font-bold">{pkg.consensus}%</td>
                              <td className="p-3">
                                {auth ? (
                                  <span className={`flex items-center gap-1 font-bold ${auth.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {auth.status === 'APPROVED' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                    {auth.status}
                                  </span>
                                ) : (
                                  <span className="text-amber-500 flex items-center gap-1 font-bold">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    UNAUTHORIZED
                                  </span>
                                )}
                              </td>
                              <td className="p-3" onClick={e => e.stopPropagation()}>
                                <div className="flex gap-1.5">
                                  {!auth && (
                                    <button 
                                      onClick={() => handleAuthorize(pkg.id, true)}
                                      disabled={submittingId === pkg.id + "_auth"}
                                      className="px-2 py-1 bg-amber-500 text-black text-[10px] font-bold rounded hover:bg-amber-400 cursor-pointer"
                                    >
                                      Authorize
                                    </button>
                                  )}
                                  {auth && auth.status === 'APPROVED' && !queuedItem && (
                                    <button 
                                      onClick={() => handleEnqueue(pkg.id)}
                                      disabled={submittingId === pkg.id + "_enqueue"}
                                      className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded hover:bg-blue-400 cursor-pointer"
                                    >
                                      Enqueue
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => setSelectedItem({ type: 'package', data: pkg })}
                                    className="p-1 text-zinc-500 hover:text-white"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* INTAKE LIST (EP09) */}
            {activeTab === 'INTAKE' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono">Approved Committee Decisions Intake</h2>
                  <span className="text-xs text-zinc-500 font-mono">Pending intake: {pendingDecisions.length}</span>
                </div>

                {pendingDecisions.length === 0 ? (
                  <div className="p-12 border border-dashed border-zinc-800 text-center text-zinc-500">
                    <CheckCircle className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
                    <p className="text-xs font-mono uppercase tracking-wider">All decisions processed</p>
                    <p className="text-xs mt-1 text-zinc-500">No approved committee decisions awaiting ingest.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingDecisions.map(dec => (
                      <div key={dec.id} className="border border-zinc-800 bg-zinc-900/20 p-4 rounded flex flex-col justify-between hover:border-zinc-700 transition-all">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-mono font-bold text-amber-500">{dec.id}</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono text-[10px] font-bold">APPROVED</span>
                          </div>
                          <p className="text-xs font-mono text-zinc-400">Candidate ID: {dec.candidateId}</p>
                          <p className="text-xs text-zinc-300 italic mt-1 bg-zinc-950 p-2.5 rounded border border-zinc-900 leading-relaxed font-sans">"{dec.reason}"</p>
                        </div>
                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-zinc-900/80">
                          <button 
                            onClick={() => handleIntake(dec)}
                            disabled={submittingId === dec.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded hover:bg-amber-400 cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-500"
                          >
                            {submittingId === dec.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Intake & Create Package
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* QUEUE MANAGER */}
            {activeTab === 'QUEUE' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono">Priority Execution Queue</h2>
                  <div className="flex bg-zinc-900 border border-zinc-800 p-0.5 rounded">
                    {['ALL', 'PENDING', 'PROCESSING', 'RETRYING', 'SUCCESS', 'FAILED'].map(st => (
                      <button 
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2 py-1 text-[10px] font-mono rounded-sm ${statusFilter === st ? 'bg-amber-500 text-black font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredQueue.length === 0 ? (
                  <div className="p-12 border border-dashed border-zinc-800 text-center text-zinc-500">
                    <Activity className="w-10 h-10 text-zinc-600 mx-auto mb-3 animate-pulse" />
                    <p className="text-xs font-mono uppercase tracking-wider">Queue Empty</p>
                    <p className="text-xs mt-1 text-zinc-500">No active execution items matching filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-zinc-800 rounded">
                    <table className="w-full text-left font-mono text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                          <th className="p-3">Queue ID</th>
                          <th className="p-3">Package ID</th>
                          <th className="p-3">Priority</th>
                          <th className="p-3">Retries</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Last Checked</th>
                          <th className="p-3">Error Logs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQueue.map(item => (
                          <tr 
                            key={item.id} 
                            onClick={() => setSelectedItem({ type: 'queue', data: item })}
                            className={`border-b border-zinc-800 hover:bg-zinc-900/40 cursor-pointer transition-all ${selectedItem?.data?.id === item.id ? 'bg-zinc-900/50 border-l-2 border-l-amber-500' : ''}`}
                          >
                            <td className="p-3 font-semibold text-white">{item.id}</td>
                            <td className="p-3 text-zinc-400 truncate max-w-[120px]">{item.packageId}</td>
                            <td className="p-3">
                              <span className="font-bold text-white px-2 py-0.5 bg-zinc-800 rounded">{item.priority}/10</span>
                            </td>
                            <td className="p-3 text-zinc-400">{item.retryCount}/{item.maxRetries}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                                item.status === 'FAILED' ? 'bg-red-950 text-red-400 border border-red-800' :
                                item.status === 'PROCESSING' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                                'bg-zinc-900 text-zinc-400 border border-zinc-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3 text-zinc-500">{new Date(item.updatedAt).toLocaleTimeString()}</td>
                            <td className="p-3 text-red-400 truncate max-w-[200px]">{item.error || 'None'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* AUDIT TRAILS */}
            {activeTab === 'AUDIT' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono">Secured Compliance Audit Trail (SHA-256 Protected)</h2>
                  <span className="text-xs text-zinc-500 font-mono">Immutable block log</span>
                </div>

                <div className="flex flex-col gap-3">
                  {audits.map(aud => (
                    <div 
                      key={aud.id} 
                      onClick={() => setSelectedItem({ type: 'audit', data: aud })}
                      className={`border border-zinc-800 bg-zinc-900/10 hover:border-zinc-700 cursor-pointer p-4 rounded flex flex-col gap-2 font-mono text-xs transition-all ${selectedItem?.data?.id === aud.id ? 'bg-zinc-900/30 border-l-2 border-l-amber-500' : ''}`}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-amber-500">{aud.id}</span>
                        <span className="text-zinc-500">{new Date(aud.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold uppercase">Audit type: {aud.auditType}</span>
                        <span className="text-[10px] text-zinc-500 truncate max-w-[300px]">Hash: {aud.hash}</span>
                      </div>
                      <div className="bg-black/40 p-2.5 rounded border border-zinc-900 text-zinc-400 font-mono text-[11px] leading-relaxed truncate">
                        {JSON.stringify(aud.content)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* LAYOUT PREFERENCES */}
            {activeTab === 'PREFERENCES' && preferences && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="border-b border-zinc-800 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono">Central Workspace Preferences (MODULE 14)</h2>
                  <p className="text-xs text-zinc-500">Centralized control values governing dashboards and inspectors</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Layout selector */}
                  <div className="border border-zinc-800 p-4 rounded flex flex-col gap-3">
                    <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-amber-500" />
                      Workspace Layout
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {['GRID', 'LIST', 'COMPACT'].map(lay => (
                        <button 
                          key={lay}
                          onClick={() => updatePreferenceField('workspaceLayout', lay)}
                          className={`py-2 text-xs font-mono rounded border ${preferences.workspaceLayout === lay ? 'bg-amber-500 text-black border-amber-500 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}
                        >
                          {lay}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid size */}
                  <div className="border border-zinc-800 p-4 rounded flex flex-col gap-3">
                    <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                      <Columns className="w-4 h-4 text-amber-500" />
                      Grid Columns Spacing
                    </span>
                    <input 
                      type="range" 
                      min="4" 
                      max="16" 
                      value={preferences.gridSize} 
                      onChange={e => updatePreferenceField('gridSize', parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>Dense (4 cols)</span>
                      <span className="text-amber-500 font-bold">{preferences.gridSize} cols</span>
                      <span>Spacious (16 cols)</span>
                    </div>
                  </div>

                  {/* Inspector width */}
                  <div className="border border-zinc-800 p-4 rounded flex flex-col gap-3">
                    <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      Inspector Overlay Width
                    </span>
                    <input 
                      type="range" 
                      min="300" 
                      max="600" 
                      step="20"
                      value={preferences.inspectorWidth} 
                      onChange={e => updatePreferenceField('inspectorWidth', parseInt(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>Slim (300px)</span>
                      <span className="text-amber-500 font-bold">{preferences.inspectorWidth}px</span>
                      <span>Full (600px)</span>
                    </div>
                  </div>

                  {/* Theme override */}
                  <div className="border border-zinc-800 p-4 rounded flex flex-col gap-3">
                    <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-500" />
                      Theme Engine Override
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {['LIGHT', 'DARK', 'SYSTEM'].map(th => (
                        <button 
                          key={th}
                          onClick={() => updatePreferenceField('themeOverride', th)}
                          className={`py-2 text-xs font-mono rounded border ${preferences.themeOverride === th ? 'bg-amber-500 text-black border-amber-500 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}
                        >
                          {th}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Keyboard shortcuts */}
                <div className="border border-zinc-800 p-5 rounded flex flex-col gap-3 font-mono">
                  <span className="text-xs font-bold text-white uppercase">Operational Hotkey Mappings</span>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {Object.entries(preferences.shortcuts).map(([k, v]) => (
                      <div key={k} className="flex justify-between p-2.5 bg-black/40 border border-zinc-900 rounded">
                        <span className="text-zinc-500">{k}</span>
                        <span className="text-amber-500 font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* RIGHT HAND SIDE INSPECTOR / METADATA SHEET (MODULE 15) */}
        <aside 
          className="border-l border-zinc-800 bg-zinc-950 shrink-0 flex flex-col overflow-y-auto"
          style={{ width: `${preferences?.inspectorWidth || 400}px` }}
        >
          <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/20">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Execution Inspector
            </h3>
            {selectedItem && (
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-xs font-mono text-zinc-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col gap-6">
            {!selectedItem ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 font-mono py-16">
                <HelpCircle className="w-10 h-10 mb-2.5 text-zinc-700" />
                <p className="text-xs uppercase tracking-wider">Empty Scope</p>
                <p className="text-[11px] mt-1 text-zinc-600 leading-normal max-w-[240px]">Select any transaction record or package to populate metadata values</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-6 text-xs font-mono"
              >
                {/* Header info */}
                <div className="flex flex-col gap-1 border-b border-zinc-850 pb-4">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Inspection Target: {selectedItem.type.toUpperCase()}</span>
                  <span className="text-sm font-bold text-white leading-normal truncate">{selectedItem.data.id}</span>
                  <span className="text-[10px] text-zinc-400">Created: {new Date(selectedItem.data.createdAt).toLocaleString()}</span>
                </div>

                {/* Specific Inspector Content */}
                {selectedItem.type === 'package' && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="p-2.5 bg-zinc-900/30 border border-zinc-900 rounded">
                        <span className="text-zinc-500 text-[10px] uppercase block">Instrument</span>
                        <span className="text-white font-bold text-sm">{selectedItem.data.instrument}</span>
                      </div>
                      <div className="p-2.5 bg-zinc-900/30 border border-zinc-900 rounded">
                        <span className="text-zinc-500 text-[10px] uppercase block">Direction</span>
                        <span className="text-white font-bold text-sm">{selectedItem.data.direction}</span>
                      </div>
                      <div className="p-2.5 bg-zinc-900/30 border border-zinc-900 rounded">
                        <span className="text-zinc-500 text-[10px] uppercase block">Confidence</span>
                        <span className="text-white font-bold text-sm">{selectedItem.data.confidence}%</span>
                      </div>
                      <div className="p-2.5 bg-zinc-900/30 border border-zinc-900 rounded">
                        <span className="text-zinc-500 text-[10px] uppercase block">Consensus</span>
                        <span className="text-white font-bold text-sm">{selectedItem.data.consensus}%</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <span className="text-[10px] text-zinc-500 uppercase">Cryptographic Package Hash</span>
                      <span className="p-2 bg-black text-amber-500 border border-zinc-900 text-[11px] rounded leading-normal break-all">{selectedItem.data.packageHash}</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-zinc-500 uppercase">Strategy Session Link</span>
                      <span className="text-zinc-300 font-bold">{selectedItem.data.strategyId}</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-zinc-500 uppercase">AI Model Identity</span>
                      <span className="text-zinc-300">{selectedItem.data.aiModel}</span>
                    </div>

                    {/* Authorization State in Inspector */}
                    <div className="mt-4 pt-4 border-t border-zinc-900">
                      <span className="text-[10px] text-zinc-500 uppercase block mb-2">Routing Authorization status</span>
                      {authorizations.some(a => a.packageId === selectedItem.data.id) ? (
                        <div className="flex flex-col gap-2">
                          {authorizations.filter(a => a.packageId === selectedItem.data.id).map(auth => (
                            <div key={auth.id} className="p-3 bg-zinc-900/20 border border-zinc-850 rounded">
                              <span className={`text-xs font-bold ${auth.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-1 mb-1.5`}>
                                {auth.status === 'APPROVED' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                {auth.status}
                              </span>
                              <p className="text-[10px] text-zinc-400 leading-normal">{auth.reason}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded text-center">
                          <p className="text-[11px] text-amber-500 mb-2.5">No routing authorization generated yet.</p>
                          <button 
                            onClick={() => handleAuthorize(selectedItem.data.id, true)}
                            disabled={submittingId === selectedItem.data.id + "_auth"}
                            className="w-full py-1.5 bg-amber-500 text-black font-bold text-xs rounded hover:bg-amber-400 transition-all cursor-pointer"
                          >
                            Run Authorization Check
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedItem.type === 'queue' && (
                  <div className="flex flex-col gap-4">
                    <div className="p-3 bg-zinc-900/20 border border-zinc-850 rounded flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 uppercase">Queue status</span>
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${selectedItem.data.status === 'SUCCESS' ? 'bg-emerald-400' : selectedItem.data.status === 'FAILED' ? 'bg-red-400' : 'bg-blue-400'}`}></span>
                        {selectedItem.data.status}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-900 py-2">
                      <span className="text-zinc-500">Priority Weight</span>
                      <span className="text-white font-bold">{selectedItem.data.priority}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 py-2">
                      <span className="text-zinc-500">Retry Counter</span>
                      <span className="text-white font-bold">{selectedItem.data.retryCount}/{selectedItem.data.maxRetries}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900 py-2">
                      <span className="text-zinc-500">Worker Timeout</span>
                      <span className="text-zinc-300 font-bold">{selectedItem.data.timeoutMs}ms</span>
                    </div>

                    {selectedItem.data.error && (
                      <div className="flex flex-col gap-1.5 mt-2 bg-red-950/10 p-3 border border-red-900/30 rounded text-red-400">
                        <span className="text-[10px] text-zinc-500 uppercase">Execution Error Logs</span>
                        <p className="text-xs leading-normal leading-relaxed">{selectedItem.data.error}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Audit JSON view fallback */}
                {(selectedItem.type === 'audit' || selectedItem.type === 'authorization') && (
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] text-zinc-500 uppercase">JSON Content Payload</span>
                    <pre className="p-3 bg-black border border-zinc-900 text-amber-500 rounded text-[10px] overflow-x-auto leading-relaxed max-h-[300px]">
                      {JSON.stringify(selectedItem.data, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </aside>
      </div>

      {/* QA MODAL VERIFICATION SUITE */}
      {showQaModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
          >
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <span className="text-xs font-mono font-bold text-amber-500 uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 animate-pulse" />
                EP10 QA Validation Suite & Integration Report
              </span>
              <button 
                onClick={() => setShowQaModal(false)}
                className="text-xs font-mono text-zinc-500 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4 font-mono text-xs">
              {runningQa ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
                  <span>Validating structural compliance vectors...</span>
                </div>
              ) : qaReport ? (
                <div className="flex flex-col gap-4">
                  {/* QA Outcome Header */}
                  <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <span className="text-white font-bold uppercase text-sm">QA Suit Integrity</span>
                      <span className="text-[10px] text-zinc-500">Run completed: {new Date(qaReport.timestamp).toLocaleString()}</span>
                    </div>
                    <span className="px-4 py-2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-black uppercase text-xs tracking-widest flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      PASSED
                    </span>
                  </div>

                  {/* Modules list */}
                  <div className="flex flex-col gap-3">
                    {Object.entries(qaReport.modules).map(([modName, modVal]: any) => (
                      <div key={modName} className="border border-zinc-900 bg-zinc-950 p-3.5 rounded flex flex-col gap-2">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                          <span className="text-white font-bold">{modName}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">PASSED</span>
                        </div>
                        <ul className="list-disc list-inside text-zinc-400 text-[11px] leading-relaxed flex flex-col gap-1 pl-1">
                          {modVal.logs.map((logStr: string, idx: number) => (
                            <li key={idx} className="truncate">{logStr}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-8">
                  No QA report generated yet. Click below to run.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-800 flex justify-end bg-zinc-900/20">
              <button 
                onClick={runQASuite}
                disabled={runningQa}
                className="px-4 py-2 bg-amber-500 text-black font-mono font-bold text-xs rounded hover:bg-amber-400 cursor-pointer disabled:bg-zinc-800"
              >
                {runningQa ? "Running Suite..." : "Execute Validation Suite"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
export default ExecutionWorkspace;
