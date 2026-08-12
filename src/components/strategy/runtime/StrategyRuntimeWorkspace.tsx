import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Play, Pause, Square, RefreshCw, Filter, Search, Download, ShieldCheck, 
  CheckCircle2, AlertTriangle, Clock, Layers, ArrowUpRight, ArrowDownRight, FileText, 
  CheckSquare, ChevronLeft, ChevronRight, BarChart2, Zap, Lock, Database, Award, 
  Cpu, HardDrive, Terminal, ShieldAlert, Check, X, Sliders, Eye, History, Hash
} from 'lucide-react';
import { StrategyRuntimeSession, RuntimeOverview, EMPTY_RUNTIME_OVERVIEW, RuntimeState, RuntimePriority } from '../../../modules/strategy/runtime/types/index.ts';

interface StrategyRuntimeWorkspaceProps {
  selectedStrategyId: string;
  selectedStrategyName: string;
  availableStrategies: Array<{ id: string; name: string }>;
  onSelectStrategy: (id: string) => void;
}

export const StrategyRuntimeWorkspace: React.FC<StrategyRuntimeWorkspaceProps> = ({
  selectedStrategyId,
  selectedStrategyName,
  availableStrategies,
  onSelectStrategy
}) => {
  const [overview, setOverview] = useState<RuntimeOverview>(EMPTY_RUNTIME_OVERVIEW);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [aiModelFilter, setAiModelFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'health' | 'latency' | 'created' | 'updated'>('priority');

  // Selected Session for Inspector
  const [selectedSession, setSelectedSession] = useState<StrategyRuntimeSession | null>(null);
  const [inspectorTab, setInspectorTab] = useState<
    'OVERVIEW' | 'STATE' | 'STRATEGY' | 'PARAMETERS' | 'RANKING' | 'CANDIDATE' | 'VALIDATION' | 'HEALTH' | 'METRICS' | 'LOGS' | 'JSON' | 'SHA256'
  >('OVERVIEW');

  // Selection for Bulk Actions
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);

  const fetchRuntimeData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/strategy/runtime?strategyId=${selectedStrategyId}`);
      const json = await res.json();
      if (json.success) {
        setOverview(json.data);
        if (!selectedSession && json.data.sessions.length > 0) {
          setSelectedSession(json.data.sessions[0]);
        }
      } else {
        setError(json.error || 'Failed to fetch runtime sessions');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuntimeData();
  }, [selectedStrategyId]);

  const handleUpdateState = async (sessionId: string, newState: RuntimeState, comment?: string) => {
    try {
      const res = await fetch(`/api/strategy/runtime/${sessionId}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState, operator: 'Enterprise Supervisor', comment })
      });
      const json = await res.json();
      if (json.success) {
        setOverview(json.data);
        const updated = json.data.sessions.find((s: StrategyRuntimeSession) => s.sessionId === sessionId);
        if (updated) setSelectedSession(updated);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdatePriority = async (sessionId: string, priority: RuntimePriority) => {
    try {
      const res = await fetch(`/api/strategy/runtime/${sessionId}/priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority, operator: 'Enterprise Supervisor' })
      });
      const json = await res.json();
      if (json.success) {
        setOverview(json.data);
        const updated = json.data.sessions.find((s: StrategyRuntimeSession) => s.sessionId === sessionId);
        if (updated) setSelectedSession(updated);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleBulkOp = async (operation: string) => {
    if (selectedSessionIds.length === 0) return;
    try {
      const res = await fetch('/api/strategy/runtime/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategyId: selectedStrategyId, operation, sessionIds: selectedSessionIds, operator: 'Enterprise Operator' })
      });
      const json = await res.json();
      if (json.success) {
        setOverview(json.data);
        setSelectedSessionIds([]);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Filtered and Sorted Sessions
  const filteredSessions = useMemo(() => {
    return overview.sessions.filter(s => {
      const matchesSearch = s.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.strategyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.candidateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.aiModelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || s.runtimeState === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || s.priority === priorityFilter;
      const matchesModel = aiModelFilter === 'ALL' || s.aiModelId === aiModelFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesModel;
    }).sort((a, b) => {
      if (sortBy === 'priority') {
        const rank: Record<RuntimePriority, number> = { CRITICAL: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
        return rank[b.priority] - rank[a.priority];
      }
      if (sortBy === 'health') return b.healthScore - a.healthScore;
      if (sortBy === 'latency') return a.latencyMs - b.latencyMs;
      if (sortBy === 'created') return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
      return new Date(b.updatedTime).getTime() - new Date(a.updatedTime).getTime();
    });
  }, [overview.sessions, searchQuery, statusFilter, priorityFilter, aiModelFilter, sortBy]);

  const stats = overview.statistics;

  const getStateBadgeClass = (state: RuntimeState) => {
    switch (state) {
      case 'RUNNING': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'READY': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'QUEUED': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PAUSED': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'COMPLETED': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'FAILED': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* NO EXECUTION BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-5 border border-indigo-900/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-indigo-300 font-bold">Enterprise Runtime Decision Engine (Module 9)</div>
            <p className="text-xs text-slate-300 mt-0.5">
              Runtime receives ONLY approved ranked candidates. Runtime NEVER sends broker orders. Runtime NEVER modifies portfolios. Runtime ONLY prepares execution-ready strategy sessions for the Paper Trading Engine.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedStrategyId}
            onChange={(e) => onSelectStrategy(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {availableStrategies.map(st => (
              <option key={st.id} value={st.id}>{st.name} ({st.id})</option>
            ))}
          </select>
          <button
            onClick={fetchRuntimeData}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* TOP DASHBOARD METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Active & Queued</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{stats.activeSessionsCount + stats.queuedCount}</div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="text-emerald-600 font-bold">{stats.runningCount} Running</span> • 
            <span className="text-amber-600 font-bold">{stats.queuedCount} Queued</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Runtime Health</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">{stats.averageRuntimeHealth}%</div>
          <div className="text-[10px] text-slate-500">System Heartbeat OK</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>AI Confidence</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 font-mono">{stats.averageConfidence}%</div>
          <div className="text-[10px] text-slate-500">Multi-Model Ensemble</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Avg Latency</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{stats.averageLatencyMs} ms</div>
          <div className="text-[10px] text-slate-500">Sub-millisecond pipeline</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Readiness Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">{stats.averageExecutionReadiness}%</div>
          <div className="text-[10px] text-slate-500">Paper Trading Certified</div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search session ID, candidate, AI model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All States</option>
              <option value="QUEUED">Queued</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="RUNNING">Running</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="priority">Sort: Priority</option>
              <option value="health">Sort: Health</option>
              <option value="latency">Sort: Latency</option>
              <option value="created">Sort: Created Time</option>
            </select>

            {selectedSessionIds.length > 0 && (
              <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-1.5 text-xs text-indigo-700 font-bold">
                <span>{selectedSessionIds.length} Selected</span>
                <button onClick={() => handleBulkOp('PAUSE')} className="hover:underline">Pause</button>
                <span>•</span>
                <button onClick={() => handleBulkOp('RESUME')} className="hover:underline">Resume</button>
                <span>•</span>
                <button onClick={() => handleBulkOp('CANCEL')} className="hover:underline text-rose-600">Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RUNTIME SESSION TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) setSelectedSessionIds(filteredSessions.map(s => s.sessionId));
                else setSelectedSessionIds([]);
              }}
              checked={selectedSessionIds.length === filteredSessions.length && filteredSessions.length > 0}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="uppercase tracking-wider font-mono">Enterprise Runtime Session Registry ({filteredSessions.length})</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Queue Engine: Priority FIFO Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="p-3"></th>
                <th className="p-3">Session & Strategy</th>
                <th className="p-3">Candidate / AI Model</th>
                <th className="p-3">Market / Asset</th>
                <th className="p-3">State</th>
                <th className="p-3">Queue / Priority</th>
                <th className="p-3">Health / Conf</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.map((session) => {
                const isSelected = selectedSession?.sessionId === session.sessionId;
                const isChecked = selectedSessionIds.includes(session.sessionId);
                return (
                  <tr 
                    key={session.sessionId}
                    onClick={() => setSelectedSession(session)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedSessionIds([...selectedSessionIds, session.sessionId]);
                          else setSelectedSessionIds(selectedSessionIds.filter(id => id !== session.sessionId));
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                        {session.sessionId}
                        <span className="text-[10px] text-slate-400 font-normal">({session.symbol})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{session.strategyName}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-indigo-600 font-semibold">{session.candidateId}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{session.aiModelId}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{session.market}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{session.asset}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${getStateBadgeClass(session.runtimeState)}`}>
                        {session.runtimeState}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      <div className="text-slate-900 font-bold">Pos #{session.queuePosition}</div>
                      <select
                        value={session.priority}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleUpdatePriority(session.sessionId, e.target.value as RuntimePriority);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] bg-slate-100 border border-slate-200 rounded px-1 py-0.5 mt-0.5 font-bold text-slate-700"
                      >
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="NORMAL">Normal</option>
                        <option value="LOW">Low</option>
                      </select>
                    </td>
                    <td className="p-3 font-mono">
                      <div className="text-emerald-600 font-bold">{session.healthScore}% Health</div>
                      <div className="text-[10px] text-indigo-600 font-semibold">{session.confidence}% Conf</div>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {session.runtimeState === 'RUNNING' ? (
                          <button
                            onClick={() => handleUpdateState(session.sessionId, 'PAUSED', 'Paused by operator')}
                            title="Pause Session"
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateState(session.sessionId, 'RUNNING', 'Resumed by operator')}
                            title="Start / Resume Session"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedSession(session);
                            setInspectorTab('OVERVIEW');
                          }}
                          title="Inspect Session"
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SESSION INSPECTOR (12 TABS) */}
      {selectedSession && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-mono">Session Inspector: {selectedSession.sessionId}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getStateBadgeClass(selectedSession.runtimeState)}`}>
                  {selectedSession.runtimeState}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Strategy: <strong className="text-slate-800">{selectedSession.strategyName}</strong> | Candidate: <strong className="text-indigo-600 font-mono">{selectedSession.candidateId}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateState(selectedSession.sessionId, 'COMPLETED', 'Marked completed for paper trading')}
                className="bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-teal-200 transition-colors"
              >
                Complete & Bridge
              </button>
              <button
                onClick={() => handleUpdateState(selectedSession.sessionId, 'FAILED', 'Manually failed')}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-200 transition-colors"
              >
                Abort / Fail
              </button>
            </div>
          </div>

          {/* INSPECTOR TABS NAVIGATION */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-100 pb-2 text-xs font-medium">
            {[
              { id: 'OVERVIEW', label: 'Overview' },
              { id: 'STATE', label: 'Runtime State' },
              { id: 'STRATEGY', label: 'Strategy Snapshot' },
              { id: 'PARAMETERS', label: 'Parameters Snapshot' },
              { id: 'RANKING', label: 'Ranking Snapshot' },
              { id: 'CANDIDATE', label: 'Candidate Snapshot' },
              { id: 'VALIDATION', label: 'Validation' },
              { id: 'HEALTH', label: 'Health' },
              { id: 'METRICS', label: 'Metrics' },
              { id: 'LOGS', label: 'Logs' },
              { id: 'JSON', label: 'JSON' },
              { id: 'SHA256', label: 'SHA-256' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setInspectorTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors font-mono text-[11px] ${
                  inspectorTab === tab.id
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="pt-2">
            {inspectorTab === 'OVERVIEW' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Execution Parameters</div>
                  <div>Market: <strong className="text-slate-900">{selectedSession.market}</strong></div>
                  <div>Asset: <strong className="text-slate-900">{selectedSession.asset}</strong></div>
                  <div>Symbol: <strong className="text-indigo-600">{selectedSession.symbol}</strong></div>
                  <div>Direction: <strong className="text-emerald-600">{selectedSession.direction}</strong></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">AI & Scoring</div>
                  <div>AI Model: <strong className="text-indigo-600">{selectedSession.aiModelId}</strong></div>
                  <div>Confidence: <strong className="text-indigo-600">{selectedSession.confidence}%</strong></div>
                  <div>Risk Score: <strong className="text-amber-600">{selectedSession.riskScore} / 100</strong></div>
                  <div>Readiness: <strong className="text-emerald-600">{selectedSession.executionReadinessScore}%</strong></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Timestamps</div>
                  <div>Created: {new Date(selectedSession.createdTime).toLocaleTimeString()}</div>
                  <div>Started: {new Date(selectedSession.startTime).toLocaleTimeString()}</div>
                  <div>Updated: {new Date(selectedSession.updatedTime).toLocaleTimeString()}</div>
                  <div>Queue Delay: {selectedSession.queueDelayMs} ms</div>
                </div>
              </div>
            )}

            {inspectorTab === 'STATE' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <div className="font-bold text-slate-900 font-mono text-xs">Current State: {selectedSession.runtimeState}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Session lifecycle history and state machine transitions.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateState(selectedSession.sessionId, 'RUNNING', 'Started')} className="px-3 py-1 bg-emerald-600 text-white rounded text-xs">Set Running</button>
                    <button onClick={() => handleUpdateState(selectedSession.sessionId, 'PAUSED', 'Paused')} className="px-3 py-1 bg-amber-600 text-white rounded text-xs">Set Paused</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedSession.history.map((h) => (
                    <div key={h.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="font-bold text-indigo-600">[{h.action}]</span> <span className="text-slate-800">{h.details}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Operator: {h.operator}</div>
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inspectorTab === 'STRATEGY' && (
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-96">
                {JSON.stringify(selectedSession.strategySnapshot, null, 2)}
              </pre>
            )}

            {inspectorTab === 'PARAMETERS' && (
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-96">
                {JSON.stringify(selectedSession.parametersSnapshot, null, 2)}
              </pre>
            )}

            {inspectorTab === 'RANKING' && (
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-96">
                {JSON.stringify(selectedSession.rankingSnapshot, null, 2)}
              </pre>
            )}

            {inspectorTab === 'CANDIDATE' && (
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-96">
                {JSON.stringify(selectedSession.candidateSnapshot, null, 2)}
              </pre>
            )}

            {inspectorTab === 'VALIDATION' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 font-mono">Mandatory enterprise pre-runtime checks required before handoff to Paper Trading.</div>
                <div className="space-y-2">
                  {selectedSession.validationChecks.map((v) => (
                    <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        {v.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                        <span className="font-bold text-slate-900">{v.ruleName}</span>
                      </div>
                      <span className="text-slate-600">{v.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inspectorTab === 'HEALTH' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-slate-400 uppercase text-[10px]">CPU Usage</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{selectedSession.cpuUsagePercent}%</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-slate-400 uppercase text-[10px]">Memory Usage</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{selectedSession.memoryUsageMb} MB</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-slate-400 uppercase text-[10px]">Latency</div>
                  <div className="text-xl font-bold text-indigo-600 mt-1">{selectedSession.latencyMs} ms</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-slate-400 uppercase text-[10px]">Queue Delay</div>
                  <div className="text-xl font-bold text-teal-600 mt-1">{selectedSession.queueDelayMs} ms</div>
                </div>
              </div>
            )}

            {inspectorTab === 'METRICS' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-slate-400 uppercase text-[10px]">Queue Time</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">{selectedSession.metrics.queueTimeMs} ms</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-slate-400 uppercase text-[10px]">Duration</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">{selectedSession.metrics.runtimeDurationSec} sec</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-slate-400 uppercase text-[10px]">Validation Rate</div>
                  <div className="text-lg font-bold text-emerald-600 mt-1">{selectedSession.metrics.validationSuccessRate}%</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-slate-400 uppercase text-[10px]">Heartbeats</div>
                  <div className="text-lg font-bold text-indigo-600 mt-1">{selectedSession.metrics.heartbeatCount}</div>
                </div>
              </div>
            )}

            {inspectorTab === 'LOGS' && (
              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
                <div className="text-teal-400 font-bold uppercase text-[10px]">Runtime Event Log Stream</div>
                {selectedSession.logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-400">[{log.timestamp}] <strong className={log.level === 'SUCCESS' ? 'text-emerald-400' : 'text-indigo-400'}>{log.level}</strong>: {log.message}</span>
                  </div>
                ))}
              </div>
            )}

            {inspectorTab === 'JSON' && (
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-96">
                {JSON.stringify(selectedSession, null, 2)}
              </pre>
            )}

            {inspectorTab === 'SHA256' && (
              <div className="bg-slate-950 text-white p-4 rounded-xl space-y-2 border border-slate-800 font-mono">
                <div className="text-teal-400 font-bold text-xs">Cryptographic SHA-256 Session Signature</div>
                <div className="text-emerald-400 text-xs break-all bg-black/60 p-3 rounded border border-slate-800">
                  {selectedSession.sha256Reference}
                </div>
                <div className="text-[11px] text-slate-400">Verified immutable pipeline handoff from Ranking module to Runtime.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
