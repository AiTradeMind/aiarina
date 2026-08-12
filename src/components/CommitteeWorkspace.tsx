import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  Info, 
  FileCheck, 
  RotateCw, 
  Activity, 
  Terminal, 
  Cpu, 
  Layers, 
  Plus, 
  Check, 
  AlertTriangle,
  Play,
  Lock,
  Search
} from 'lucide-react';
import { fetchApi } from '../lib/api';

// Types matching backend models
interface CommitteeSession {
  id: string;
  aiModelId: string;
  workspaceId: string;
  candidateId: string;
  correlationId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

interface CommitteeMember {
  id: string;
  sessionId: string;
  role: 'PRIMARY_AI' | 'SECONDARY_AI' | 'RISK_REVIEWER' | 'MARKET_REVIEWER' | 'COMPLIANCE_REVIEWER' | 'HUMAN_OBSERVER';
  weight: number;
  vote: 'APPROVE' | 'REJECT' | 'HOLD' | 'ABSTAIN';
  status: 'PENDING' | 'READY';
  createdAt: string;
}

interface CommitteeVote {
  id: string;
  sessionId: string;
  memberId: string;
  role: string;
  vote: 'APPROVE' | 'REJECT' | 'HOLD' | 'ABSTAIN';
  weight: number;
  reason: string;
  createdAt: string;
}

interface CommitteeConsensus {
  id: string;
  sessionId: string;
  consensusScore: number;
  approvalPercent: number;
  conflictPercent: number;
  confidence: number;
  decisionStability: 'STABLE' | 'UNSTABLE' | 'MARGINAL';
  createdAt: string;
}

interface CommitteeDecision {
  id: string;
  sessionId: string;
  candidateId: string;
  status: 'APPROVED' | 'REJECTED' | 'ON_HOLD';
  reason: string;
  createdAt: string;
}

interface CommitteeCertificate {
  id: string;
  decisionId: string;
  consensusScore: number;
  sha256Hash: string;
  digitalSignature: string;
  createdAt: string;
}

interface CommitteeRuntime {
  id: string;
  sessionId: string;
  queueName: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  timeoutMs: number;
  logs: string;
  startedAt?: string;
  finishedAt?: string;
}

interface CommitteeEvent {
  id: string;
  sessionId: string;
  eventType: 'CommitteeStarted' | 'VotingStarted' | 'ConsensusCompleted' | 'DecisionApproved' | 'DecisionRejected' | 'DecisionHeld';
  payload: Record<string, any>;
  createdAt: string;
}

interface CommitteeAudit {
  id: string;
  sessionId: string;
  auditType: 'Voting' | 'Decision' | 'Consensus' | 'Certificate' | 'Runtime';
  hash: string;
  content: Record<string, any>;
  createdAt: string;
}

interface StrategyCandidate {
  id: string;
  strategyId: string;
  aiModelId: string;
  instrument: string;
  direction: string;
  confidence: number;
  status: string;
}

export default function CommitteeWorkspace() {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INSPECTOR' | 'AUDIT'>('DASHBOARD');

  // Backend States
  const [sessions, setSessions] = useState<CommitteeSession[]>([]);
  const [votes, setVotes] = useState<CommitteeVote[]>([]);
  const [consensusList, setConsensusList] = useState<CommitteeConsensus[]>([]);
  const [decisions, setDecisions] = useState<CommitteeDecision[]>([]);
  const [certificates, setCertificates] = useState<CommitteeCertificate[]>([]);
  const [runtimes, setRuntimes] = useState<CommitteeRuntime[]>([]);
  const [events, setEvents] = useState<CommitteeEvent[]>([]);
  const [audits, setAudits] = useState<CommitteeAudit[]>([]);
  const [candidates, setCandidates] = useState<StrategyCandidate[]>([]);

  // Selection state
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedRuntimeId, setSelectedRuntimeId] = useState<string>('');

  // Queue triggers
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [selectedAiModel, setSelectedAiModel] = useState<string>('gemini-1.5-pro');

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Load everything
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [
        sessRes,
        votesRes,
        consRes,
        decRes,
        certsRes,
        runRes,
        evtRes,
        auditRes,
        candsRes
      ] = await Promise.all([
        fetchApi<CommitteeSession[]>('/api/committee/sessions'),
        fetchApi<CommitteeVote[]>('/api/committee/votes'),
        fetchApi<CommitteeConsensus[]>('/api/committee/consensus'),
        fetchApi<CommitteeDecision[]>('/api/committee/decisions'),
        fetchApi<CommitteeCertificate[]>('/api/committee/certificates'),
        fetchApi<CommitteeRuntime[]>('/api/committee/runtime'),
        fetchApi<CommitteeEvent[]>('/api/committee/events'),
        fetchApi<CommitteeAudit[]>('/api/committee/audit'),
        fetchApi<StrategyCandidate[]>('/api/strategy/candidates').catch(() => [])
      ]);

      if (sessRes) {
        setSessions(sessRes);
        if (sessRes.length > 0 && !selectedSessionId) {
          setSelectedSessionId(sessRes[0].id);
        }
      }
      if (votesRes) setVotes(votesRes);
      if (consRes) setConsensusList(consRes);
      if (decRes) setDecisions(decRes);
      if (certsRes) setCertificates(certsRes);
      if (runRes) {
        setRuntimes(runRes);
        if (runRes.length > 0 && !selectedRuntimeId) {
          setSelectedRuntimeId(runRes[0].id);
        }
      }
      if (evtRes) setEvents(evtRes);
      if (auditRes) setAudits(auditRes);
      if (candsRes) {
        setCandidates(candsRes);
        if (candsRes.length > 0 && !selectedCandidateId) {
          setSelectedCandidateId(candsRes[0].id);
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to sync committee database state');
    } finally {
      setLoading(false);
    }
  }, [selectedSessionId, selectedRuntimeId, selectedCandidateId]);

  // Periodic Refresh
  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refreshAll, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshAll]);

  // Trigger Queue
  const handleQueueSession = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!selectedCandidateId) {
      setErrorMsg('No strategy candidate selected to evaluate.');
      return;
    }
    try {
      const res = await fetchApi<CommitteeRuntime>('/api/committee/runtime', {
        method: 'POST',
        body: JSON.stringify({
          candidateId: selectedCandidateId,
          aiModelId: selectedAiModel
        })
      });
      if (res) {
        setSuccessMsg(`Session ${res.sessionId} created and queued!`);
        refreshAll();
        setActiveTab('AUDIT');
        setSelectedRuntimeId(res.id);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to submit candidate to committee queue');
    }
  };

  // Helper selectors
  const activeSession = sessions.find(s => s.id === selectedSessionId);
  const activeSessionVotes = votes.filter(v => v.sessionId === selectedSessionId);
  const activeSessionConsensus = consensusList.find(c => c.sessionId === selectedSessionId);
  const activeSessionDecision = decisions.find(d => d.sessionId === selectedSessionId);
  const activeSessionCertificate = certificates.find(c => c.decisionId === activeSessionDecision?.id);
  const activeRuntime = runtimes.find(r => r.id === selectedRuntimeId);

  // Status badging styles
  const getDecisionBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'COMMITTEE_APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
      case 'COMMITTEE_REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ON_HOLD':
      case 'COMMITTEE_HELD':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-zinc-50 text-zinc-600 border-zinc-200';
    }
  };

  return (
    <div id="committee-workspace-root" className="min-h-screen bg-zinc-50/50 p-6 font-sans">
      {/* Upper Navigation & Headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200/80 pb-5 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            EP09 — Enterprise Committee Workspace
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Ultimate governance consensus layer. Authorizes candidates; executes zero trades.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-2 ${
              autoRefresh ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-indigo-600' : ''}`} />
            {autoRefresh ? 'Live Sync Active' : 'Pause Live Sync'}
          </button>
          <button 
            onClick={refreshAll}
            disabled={loading}
            className="p-2 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 text-zinc-600 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error / Success Notifications */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-800">Operational Failure</h4>
              <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
            </div>
          </motion.div>
        )}
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-3"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-800">Operation Succeeded</h4>
              <p className="text-xs text-emerald-700 mt-0.5">{successMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Tabs Layout */}
      <div className="flex border-b border-zinc-200/80 mb-6">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-4 py-2 border-b-2 text-sm font-semibold transition-all -mb-[2px] ${
            activeTab === 'DASHBOARD'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Consensus Dashboard
        </button>
        <button
          onClick={() => setActiveTab('INSPECTOR')}
          className={`px-4 py-2 border-b-2 text-sm font-semibold transition-all -mb-[2px] ${
            activeTab === 'INSPECTOR'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Decision Inspector
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 border-b-2 text-sm font-semibold transition-all -mb-[2px] ${
            activeTab === 'AUDIT'
              ? 'border-zinc-900 text-zinc-900'
              : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Audit Logs & Queues
        </button>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'DASHBOARD' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Action Component: Queue New Candidate */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white border border-zinc-200/80 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <Plus className="w-5 h-5 text-zinc-800" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Convene Enterprise Committee Quorum</h3>
                  <p className="text-zinc-500 text-xs">Evaluate and certify candidates generated inside EP08 Strategy Workspace.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Select Strategy Candidate</label>
                  <select 
                    value={selectedCandidateId}
                    onChange={(e) => setSelectedCandidateId(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  >
                    {candidates.length === 0 ? (
                      <option value="">-- No Candidates Found (Dynamic Mock Seeding Fallback Ready) --</option>
                    ) : (
                      candidates.map(cand => (
                        <option key={cand.id} value={cand.id}>
                          {cand.id} - {cand.instrument} ({cand.direction}) [Conf: {cand.confidence}%]
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Primary AI Reasoning Core</label>
                  <select 
                    value={selectedAiModel}
                    onChange={(e) => setSelectedAiModel(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  >
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t border-zinc-100 pt-4">
                <button
                  onClick={handleQueueSession}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Convene Quorum Vote
                </button>
              </div>
            </div>

            {/* Live Sessions Overview */}
            <div className="bg-white border border-zinc-200/80 rounded-xl p-6">
              <h3 className="text-base font-bold text-zinc-900 mb-4">Live Committee Sessions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 text-xs uppercase font-bold">
                      <th className="pb-3">Session ID</th>
                      <th className="pb-3">Candidate ID</th>
                      <th className="pb-3">Core AI Model</th>
                      <th className="pb-3">Quorum Status</th>
                      <th className="pb-3">Date Convened</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(sess => {
                      const dec = decisions.find(d => d.sessionId === sess.id);
                      return (
                        <tr key={sess.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-all">
                          <td className="py-3.5 font-mono text-xs text-zinc-600 font-semibold">{sess.id}</td>
                          <td className="py-3.5 font-mono text-xs text-zinc-600">{sess.candidateId}</td>
                          <td className="py-3.5 text-zinc-600 text-xs">{sess.aiModelId}</td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                              dec?.status ? getDecisionBadge(dec.status) : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {dec?.status || 'VOTING'}
                            </span>
                          </td>
                          <td className="py-3.5 text-zinc-500 text-xs">{new Date(sess.createdAt).toLocaleString()}</td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedSessionId(sess.id);
                                setActiveTab('INSPECTOR');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 rounded transition-colors"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {sessions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs">
                          No sessions created yet. Convene a quorum above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Metrics & Sidebar Stats */}
          <div className="space-y-6">
            {/* High-Contrast KPI Cards */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white border border-zinc-200/80 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Approved Decisions</span>
                  <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-zinc-900 mt-2">
                  {decisions.filter(d => d.status === 'APPROVED').length}
                </div>
                <div className="text-zinc-400 text-[11px] mt-1 font-medium">Certified & signed ready for life cycle execution.</div>
              </div>

              <div className="bg-white border border-zinc-200/80 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Rejected Decisions</span>
                  <div className="p-1.5 bg-rose-50 text-rose-700 rounded-md">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-zinc-900 mt-2">
                  {decisions.filter(d => d.status === 'REJECTED').length}
                </div>
                <div className="text-zinc-400 text-[11px] mt-1 font-medium">Bypassed and blocked from all market operations.</div>
              </div>

              <div className="bg-white border border-zinc-200/80 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Consensus Stability</span>
                  <div className="p-1.5 bg-amber-50 text-amber-700 rounded-md">
                    <Info className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-zinc-900 mt-2">
                  {consensusList.length > 0 ? `${Math.round(consensusList.reduce((acc, c) => acc + c.consensusScore, 0) / consensusList.length)}%` : '0%'}
                </div>
                <div className="text-zinc-400 text-[11px] mt-1 font-medium">Average weighted committee confidence rating.</div>
              </div>
            </div>

            {/* Quorum Composition Specs */}
            <div className="bg-white border border-zinc-200/80 rounded-xl p-5">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4">Enterprise Quorum Allocation</h3>
              <div className="space-y-3.5">
                {[
                  { role: 'Primary AI Evaluation', weight: 3, percent: '33%', color: 'bg-indigo-600' },
                  { role: 'Risk & Volatility Reviewer', weight: 2, percent: '22%', color: 'bg-emerald-600' },
                  { role: 'Market Liquidity Reviewer', weight: 1, percent: '11%', color: 'bg-blue-600' },
                  { role: 'Indian Exchange Compliance', weight: 1, percent: '11%', color: 'bg-orange-600' },
                  { role: 'Secondary Verification AI', weight: 1, percent: '11%', color: 'bg-rose-600' },
                  { role: 'Human Observer Logs', weight: 1, percent: '11%', color: 'bg-purple-600' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-medium text-zinc-700 mb-1">
                      <span>{item.role}</span>
                      <span className="text-zinc-400">Weight: {item.weight} ({item.percent})</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.percent }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTOR TAB */}
      {activeTab === 'INSPECTOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Session Selector */}
          <div className="lg:col-span-1 bg-white border border-zinc-200/80 rounded-xl p-5 h-[calc(100vh-280px)] flex flex-col">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">Select Committee Session</h3>
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {sessions.map(sess => {
                const dec = decisions.find(d => d.sessionId === sess.id);
                const isSelected = sess.id === selectedSessionId;
                return (
                  <button
                    key={sess.id}
                    onClick={() => setSelectedSessionId(sess.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' 
                        : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold">{sess.id}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        isSelected 
                          ? 'bg-white/10 text-white border-white/20' 
                          : dec?.status ? getDecisionBadge(dec.status) : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {dec?.status || 'VOTING'}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-2 font-mono ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>Candidate ID: {sess.candidateId}</p>
                    <div className="flex items-center justify-between mt-3 text-[10px]">
                      <span className={isSelected ? 'text-zinc-300' : 'text-zinc-500'}>Model: {sess.aiModelId}</span>
                      <span className={isSelected ? 'text-zinc-300' : 'text-zinc-500'}>{new Date(sess.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </button>
                );
              })}
              {sessions.length === 0 && (
                <div className="text-center py-12 text-zinc-400 text-xs">No active or historic sessions.</div>
              )}
            </div>
          </div>

          {/* Detail View of Selected Session */}
          <div className="lg:col-span-2 space-y-6">
            {activeSession ? (
              <>
                {/* Upper Details Banner */}
                <div className="bg-white border border-zinc-200/80 rounded-xl p-6">
                  <div className="flex justify-between items-start border-b border-zinc-100 pb-4 mb-4">
                    <div>
                      <span className="text-[10px] font-bold bg-zinc-100 border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded uppercase">Session Node Overview</span>
                      <h2 className="text-xl font-bold text-zinc-900 mt-2 font-mono">{activeSession.id}</h2>
                      <div className="flex gap-4 mt-1.5 text-xs text-zinc-400 font-medium">
                        <span>Workspace: {activeSession.workspaceId}</span>
                        <span>Correlation: {activeSession.correlationId}</span>
                      </div>
                    </div>
                    {activeSessionDecision && (
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getDecisionBadge(activeSessionDecision.status)}`}>
                        {activeSessionDecision.status}
                      </span>
                    )}
                  </div>

                  {/* Validate Core Dependencies Verification checklist */}
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">Governance Prerequisites</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 p-2.5 bg-zinc-50 border border-zinc-200/50 rounded-lg text-xs">
                        <Check className="w-4 h-4 text-emerald-600 bg-emerald-50 rounded-full p-0.5 border border-emerald-200" />
                        <span className="text-zinc-700 font-semibold">EP06 Research Base Integrated</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 bg-zinc-50 border border-zinc-200/50 rounded-lg text-xs">
                        <Check className="w-4 h-4 text-emerald-600 bg-emerald-50 rounded-full p-0.5 border border-emerald-200" />
                        <span className="text-zinc-700 font-semibold">EP07 Reasoning Engine Active</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 bg-zinc-50 border border-zinc-200/50 rounded-lg text-xs">
                        <Check className="w-4 h-4 text-emerald-600 bg-emerald-50 rounded-full p-0.5 border border-emerald-200" />
                        <span className="text-zinc-700 font-semibold">EP08 Candidate Found</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 bg-zinc-50 border border-zinc-200/50 rounded-lg text-xs">
                        <Check className="w-4 h-4 text-emerald-600 bg-emerald-50 rounded-full p-0.5 border border-emerald-200" />
                        <span className="text-zinc-700 font-semibold">EP05 Market Liquid Hours Open</span>
                      </div>
                    </div>
                  </div>

                  {/* Consensus Computation Specs */}
                  {activeSessionConsensus && (
                    <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-5 mb-6">
                      <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4">Consensus Analysis Engine</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-zinc-400 text-[10px] font-bold uppercase">Consensus Score</div>
                          <div className="text-2xl font-extrabold text-zinc-900 mt-1">{activeSessionConsensus.consensusScore}%</div>
                        </div>
                        <div>
                          <div className="text-zinc-400 text-[10px] font-bold uppercase">Approval Weight</div>
                          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{Math.round(activeSessionConsensus.approvalPercent * 100)}%</div>
                        </div>
                        <div>
                          <div className="text-zinc-400 text-[10px] font-bold uppercase">Conflict Matrix</div>
                          <div className="text-2xl font-extrabold text-rose-600 mt-1">{Math.round(activeSessionConsensus.conflictPercent * 100)}%</div>
                        </div>
                        <div>
                          <div className="text-zinc-400 text-[10px] font-bold uppercase">Decision Stability</div>
                          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{activeSessionConsensus.decisionStability}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Explanations & Evidentiary Base (Module 6) */}
                  {activeSessionDecision && (
                    <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50/50 mb-6">
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                        <Info className="w-4 h-4 text-zinc-700" />
                        Explainability & Evidentiary Base
                      </div>
                      <p className="text-xs text-zinc-700 leading-relaxed font-mono">
                        {activeSessionDecision.reason}
                      </p>
                    </div>
                  )}

                  {/* Decision Quorum Ballots casted */}
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4">Quorum Voting Ledger</h3>
                    <div className="space-y-3">
                      {activeSessionVotes.map((v, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-center justify-between border border-zinc-100 rounded-lg p-3.5 bg-white shadow-xs">
                          <div className="flex items-center gap-3">
                            <span className={`p-1 rounded text-white ${
                              v.vote === 'APPROVE' ? 'bg-emerald-600' : (v.vote === 'REJECT' ? 'bg-rose-600' : 'bg-amber-600')
                            }`}>
                              {v.vote === 'APPROVE' ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-zinc-800">{v.role}</div>
                              <div className="text-[11px] text-zinc-500 mt-0.5">{v.reason}</div>
                            </div>
                          </div>
                          <div className="mt-3 md:mt-0 text-right shrink-0">
                            <span className="text-xs font-bold bg-zinc-50 border border-zinc-200/50 text-zinc-600 px-2 py-0.5 rounded font-mono">
                              Vote weight: {v.weight}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Digital Decision Certificate Card (Module 11) */}
                {activeSessionCertificate && (
                  <div className="bg-white border-2 border-dashed border-zinc-300 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute right-6 top-6 opacity-10">
                      <Lock className="w-24 h-24 text-zinc-900" />
                    </div>
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <FileCheck className="w-4 h-4 text-zinc-700" />
                      SECURE DECISION COMPLIANCE CERTIFICATE
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-zinc-400 font-bold uppercase">Certificate Node ID</div>
                        <div className="font-mono mt-1 text-zinc-700">{activeSessionCertificate.id}</div>
                      </div>
                      <div>
                        <div className="text-zinc-400 font-bold uppercase">SHA-256 Decision Hash</div>
                        <div className="font-mono mt-1 text-zinc-700 text-[10px] break-all">{activeSessionCertificate.sha256Hash}</div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-zinc-400 font-bold uppercase">Cryptographic Signature</div>
                        <div className="font-mono mt-1 text-zinc-700 bg-zinc-50 p-3 rounded.md border border-zinc-200/50 text-[10px] tracking-tight whitespace-pre-wrap select-all">
                          {activeSessionCertificate.digitalSignature}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-zinc-200/80 rounded-xl p-12 text-center text-zinc-400 text-sm">
                No active session selected.Convening committee quorum...
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUDIT & RUNTIME TAB */}
      {activeTab === 'AUDIT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Runtime worker lists */}
          <div className="lg:col-span-1 bg-white border border-zinc-200/80 rounded-xl p-5 h-[calc(100vh-280px)] flex flex-col">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">Runtime Worker Queues</h3>
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {runtimes.map(r => {
                const isSelected = r.id === selectedRuntimeId;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRuntimeId(r.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' 
                        : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold">{r.id}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        r.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        r.status === 'PROCESSING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[10px] mt-2 font-mono text-zinc-400">Queue: {r.queueName}</p>
                    <div className="flex items-center justify-between mt-3 text-[10px]">
                      <span className="text-zinc-500">Retries: {r.retryCount}</span>
                      {r.finishedAt && <span className="text-zinc-500">{new Date(r.finishedAt).toLocaleTimeString()}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Console logger & audit trail */}
          <div className="lg:col-span-2 space-y-6">
            {/* Terminal console logger */}
            {activeRuntime ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 font-mono text-xs text-zinc-300">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-400 font-semibold">Active Worker console</span>
                  </div>
                  <span className="text-zinc-500">Node thread: {activeRuntime.id}</span>
                </div>
                <div className="bg-zinc-950 p-4 rounded border border-zinc-800 h-[280px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text scrollbar-thin">
                  {activeRuntime.logs}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500 font-mono text-xs">
                Select an active runner queue node to fetch logs.
              </div>
            )}

            {/* SHA-256 protected append only audit logs ledger */}
            <div className="bg-white border border-zinc-200/80 rounded-xl p-5">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-800" />
                Append-Only SHA-256 Audit Trail
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {audits.map((a, idx) => (
                  <div key={idx} className="border border-zinc-100 rounded-lg p-3.5 bg-zinc-50/50">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-800 uppercase tracking-tight">{a.auditType} Audit Node</span>
                      <span className="text-zinc-500 font-mono text-[10px]">{new Date(a.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-mono text-[10px] text-zinc-400 mt-1 select-all">SHA-256: {a.hash}</div>
                    <div className="text-[11px] text-zinc-600 mt-2 bg-white border border-zinc-100 rounded p-2 overflow-x-auto max-h-[80px]">
                      <pre>{JSON.stringify(a.content, null, 2)}</pre>
                    </div>
                  </div>
                ))}
                {audits.length === 0 && (
                  <div className="text-center py-6 text-zinc-400 text-xs">No audited blocks created yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
