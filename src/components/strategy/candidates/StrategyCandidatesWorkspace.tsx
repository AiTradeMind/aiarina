import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, Search, Filter, 
  Eye, ThumbsUp, ThumbsDown, Copy, Download, Archive, RefreshCw, Layers, 
  ArrowUpRight, ArrowDownRight, FileText, CheckSquare, Square, ChevronLeft, ChevronRight, 
  BarChart2, Zap, Lock, Database, GitBranch
} from 'lucide-react';
import { StrategyCandidate, CandidatesOverview, EMPTY_CANDIDATES_OVERVIEW } from '../../../modules/strategy/candidates/types/index.ts';

interface StrategyCandidatesWorkspaceProps {
  selectedStrategyId?: string;
  selectedStrategyName?: string;
  availableStrategies?: Array<{ id: string; name: string }>;
  onSelectStrategy?: (id: string) => void;
}

export const StrategyCandidatesWorkspace: React.FC<StrategyCandidatesWorkspaceProps> = ({
  selectedStrategyId = 'STRAT-001',
  selectedStrategyName = 'NIFTY Alpha Trend Momentum',
  availableStrategies = [{ id: 'STRAT-001', name: 'NIFTY Alpha Trend Momentum' }],
  onSelectStrategy
}) => {
  const [overview, setOverview] = useState<CandidatesOverview>(EMPTY_CANDIDATES_OVERVIEW);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [assetFilter, setAssetFilter] = useState('ALL');
  const [modelFilter, setModelFilter] = useState('ALL');
  const [directionFilter, setDirectionFilter] = useState('ALL');

  // Selection & Bulk Actions
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Inspector Drawer State
  const [inspectingCandidate, setInspectingCandidate] = useState<StrategyCandidate | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'overview' | 'reasoning' | 'indicators' | 'research' | 'market' | 'risk' | 'validation' | 'history' | 'json' | 'sha'>('overview');

  // Comparison State
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchCandidates();
  }, [selectedStrategyId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`/api/strategy/candidates?strategyId=${selectedStrategyId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch strategy trade candidates');
      }
      const json = await res.json();
      const data = json.success && json.data ? json.data : json;
      setOverview(data || EMPTY_CANDIDATES_OVERVIEW);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading trade candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (candidateId: string, status: string, reason?: string) => {
    try {
      const res = await fetch(`/api/strategy/candidates/${candidateId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, operator: 'Enterprise Officer', reason })
      });
      if (!res.ok) throw new Error('Failed to update candidate status');
      const json = await res.json();
      if (json.success && json.data) {
        setOverview(json.data);
      } else {
        fetchCandidates();
      }
      setSuccessMsg(`Candidate ${candidateId} status updated to ${status}`);
      setTimeout(() => setSuccessMsg(null), 4000);
      if (inspectingCandidate && inspectingCandidate.candidateId === candidateId) {
        const updated = (json.data?.candidates || []).find((c: StrategyCandidate) => c.candidateId === candidateId);
        if (updated) setInspectingCandidate(updated);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Action failed');
    }
  };

  const handleVote = async (candidateId: string, vote: 'APPROVE' | 'REJECT' | 'ABSTAIN', comment?: string) => {
    try {
      const res = await fetch(`/api/strategy/candidates/${candidateId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ committeeMember: 'Chief Risk Officer / Committee Chair', vote, comment })
      });
      if (!res.ok) throw new Error('Failed to submit committee vote');
      const json = await res.json();
      if (json.success && json.data) {
        setOverview(json.data);
      } else {
        fetchCandidates();
      }
      setSuccessMsg(`Vote ${vote} recorded for candidate ${candidateId}`);
      setTimeout(() => setSuccessMsg(null), 4000);
      if (inspectingCandidate && inspectingCandidate.candidateId === candidateId) {
        const updated = (json.data?.candidates || []).find((c: StrategyCandidate) => c.candidateId === candidateId);
        if (updated) setInspectingCandidate(updated);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Vote failed');
    }
  };

  const handleBulkAction = async (operation: 'APPROVE' | 'REJECT' | 'ARCHIVE') => {
    if (selectedCandidateIds.length === 0) return;
    try {
      const res = await fetch(`/api/strategy/candidates/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          operation,
          candidateIds: selectedCandidateIds,
          operator: 'Enterprise Committee Officer'
        })
      });
      if (!res.ok) throw new Error('Bulk operation failed');
      const json = await res.json();
      if (json.success && json.data) {
        setOverview(json.data);
      } else {
        fetchCandidates();
      }
      setSelectedCandidateIds([]);
      setSuccessMsg(`Successfully executed bulk ${operation} on selected candidates`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Bulk operation failed');
    }
  };

  const handleClone = (cand: StrategyCandidate) => {
    const cloneCandidate: StrategyCandidate = {
      ...cand,
      candidateId: `CAND-${Math.floor(1000 + Math.random() * 9000)}`,
      candidateStatus: 'COMMITTEE_PENDING',
      createdTime: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    // Submit clone
    fetch('/api/strategy/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cloneCandidate)
    }).then(() => fetchCandidates());
  };

  // Filter logic
  const filteredCandidates = (overview.candidates || []).filter(c => {
    const matchesSearch = c.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.aiModelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.reasoning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.candidateStatus === statusFilter;
    const matchesAsset = assetFilter === 'ALL' || c.assetClass === assetFilter;
    const matchesModel = modelFilter === 'ALL' || c.aiModelId === modelFilter;
    const matchesDirection = directionFilter === 'ALL' || c.direction === directionFilter;
    return matchesSearch && matchesStatus && matchesAsset && matchesModel && matchesDirection;
  });

  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
  const paginatedCandidates = filteredCandidates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = overview.statistics || {
    totalCandidates: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    expiredCount: 0,
    committeePendingCount: 0,
    averageConfidence: 0,
    averageRisk: 0,
    averageQuality: 0,
    averageRR: 0
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Enterprise Trade Candidates Engine</h1>
              <p className="text-xs text-slate-500">AI-generated trade proposals waiting for Enterprise Committee approval (Module 7). NO execution or order placement.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200">
            <Layers className="w-4 h-4 text-slate-500" />
            <select
              value={selectedStrategyId}
              onChange={(e) => onSelectStrategy && onSelectStrategy(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 outline-none cursor-pointer"
            >
              {availableStrategies.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchCandidates}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Top Cards Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Committee Pending</div>
          <div className="text-xl font-bold text-amber-600 mt-1">{stats.committeePendingCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Approved</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{stats.approvedCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Rejected</div>
          <div className="text-xl font-bold text-rose-600 mt-1">{stats.rejectedCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Expired</div>
          <div className="text-xl font-bold text-slate-600 mt-1">{stats.expiredCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Avg Confidence</div>
          <div className="text-xl font-bold text-indigo-600 mt-1">{stats.averageConfidence}%</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Avg Risk Score</div>
          <div className="text-xl font-bold text-orange-600 mt-1">{stats.averageRisk}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Avg Quality</div>
          <div className="text-xl font-bold text-blue-600 mt-1">{stats.averageQuality}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Avg RR Ratio</div>
          <div className="text-xl font-bold text-teal-600 mt-1">{stats.averageRR}x</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate ID, symbol, AI model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMMITTEE_PENDING">Committee Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
          </select>

          <select
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Asset Classes</option>
            <option value="Equity">Equity</option>
            <option value="ETF">ETF</option>
            <option value="Commodity">Commodity</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Crude Oil">Crude Oil</option>
            <option value="Natural Gas">Natural Gas</option>
          </select>

          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All AI Models</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          </select>

          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Directions</option>
            <option value="BUY">BUY (Long)</option>
            <option value="SELL">SELL (Short)</option>
          </select>

          {selectedCandidateIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-indigo-700">{selectedCandidateIds.length} selected</span>
              <button onClick={() => handleBulkAction('APPROVE')} className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700">Approve</button>
              <button onClick={() => handleBulkAction('REJECT')} className="px-2 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700">Reject</button>
            </div>
          )}

          {comparingIds.length > 0 && (
            <button
              onClick={() => setShowComparisonModal(true)}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-indigo-700"
            >
              <BarChart2 className="w-3.5 h-3.5" /> Compare ({comparingIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Grid / Enterprise Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedCandidateIds.length === paginatedCandidates.length && paginatedCandidates.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCandidateIds(paginatedCandidates.map(c => c.candidateId));
                      } else {
                        setSelectedCandidateIds([]);
                      }
                    }}
                    className="rounded text-indigo-600"
                  />
                </th>
                <th className="p-4">Compare</th>
                <th className="p-4">Candidate ID</th>
                <th className="p-4">AI Model</th>
                <th className="p-4">Strategy</th>
                <th className="p-4">Symbol / Asset</th>
                <th className="p-4">Direction</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">R/R</th>
                <th className="p-4">Risk</th>
                <th className="p-4">Quality</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-12 text-slate-400">
                    No trade candidates found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((cand) => (
                  <tr key={cand.candidateId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCandidateIds.includes(cand.candidateId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCandidateIds([...selectedCandidateIds, cand.candidateId]);
                          } else {
                            setSelectedCandidateIds(selectedCandidateIds.filter(id => id !== cand.candidateId));
                          }
                        }}
                        className="rounded text-indigo-600"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={comparingIds.includes(cand.candidateId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (comparingIds.length >= 3) {
                              alert('You can compare at most 3 candidates simultaneously.');
                              return;
                            }
                            setComparingIds([...comparingIds, cand.candidateId]);
                          } else {
                            setComparingIds(comparingIds.filter(id => id !== cand.candidateId));
                          }
                        }}
                        className="rounded text-indigo-600"
                        title="Select for comparison"
                      />
                    </td>
                    <td className="p-4 font-mono font-bold text-indigo-600 cursor-pointer" onClick={() => setInspectingCandidate(cand)}>
                      {cand.candidateId}
                    </td>
                    <td className="p-4 font-medium text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {cand.aiModelId}
                    </td>
                    <td className="p-4 text-slate-600">{cand.strategyId}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{cand.symbol}</div>
                      <div className="text-[10px] text-slate-500">{cand.assetClass}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        cand.direction === 'BUY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {cand.direction === 'BUY' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {cand.direction}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{cand.confidence}%</td>
                    <td className="p-4 font-mono font-medium text-slate-700">{cand.riskReward}x</td>
                    <td className="p-4 font-mono font-medium text-orange-600">{cand.riskScore}</td>
                    <td className="p-4 font-mono font-medium text-blue-600">{cand.qualityScore}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        cand.candidateStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        cand.candidateStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        cand.candidateStatus === 'EXPIRED' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {cand.candidateStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setInspectingCandidate(cand)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                        title="Open Inspector"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {cand.candidateStatus === 'COMMITTEE_PENDING' && (
                        <>
                          <button
                            onClick={() => handleAction(cand.candidateId, 'APPROVED', 'Approved by Committee Quorum')}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg"
                            title="Approve Candidate"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAction(cand.candidateId, 'REJECTED', 'Rejected by Committee Quorum')}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg"
                            title="Reject Candidate"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleClone(cand)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg"
                        title="Clone Proposal"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>Showing {filteredCandidates.length} trade candidates (Page {currentPage} of {totalPages})</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspector Drawer Modal */}
      {inspectingCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-600 text-base">{inspectingCandidate.candidateId}</span>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {inspectingCandidate.aiModelId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Strategy: {inspectingCandidate.strategyId} | Symbol: {inspectingCandidate.symbol} ({inspectingCandidate.assetClass})</p>
              </div>
              <button
                onClick={() => setInspectingCandidate(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-medium">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'reasoning', label: 'Reasoning' },
                { id: 'indicators', label: 'Indicators' },
                { id: 'research', label: 'Research' },
                { id: 'market', label: 'Market Context' },
                { id: 'risk', label: 'Risk Analysis' },
                { id: 'validation', label: 'Validation' },
                { id: 'history', label: 'History' },
                { id: 'json', label: 'JSON' },
                { id: 'sha', label: 'SHA256' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveInspectorTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    activeInspectorTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              {activeInspectorTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-500">Direction</div>
                      <div className={`text-sm font-bold mt-1 ${inspectingCandidate.direction === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {inspectingCandidate.direction}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-500">Entry Price</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">${inspectingCandidate.entryPrice}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-500">Stop Loss</div>
                      <div className="text-sm font-bold text-rose-600 mt-1">${inspectingCandidate.stopLoss}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-500">Risk / Reward</div>
                      <div className="text-sm font-bold text-indigo-600 mt-1">{inspectingCandidate.riskReward}x</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900">Price Targets</div>
                    <div className="flex gap-2">
                      {inspectingCandidate.targets.map((t, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-mono font-bold">
                          Target {idx + 1}: ${t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900">Committee Voting & Quorum</div>
                    <div className="space-y-2">
                      {(inspectingCandidate.votes || []).map(v => (
                        <div key={v.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                          <div>
                            <span className="font-bold text-slate-800">{v.committeeMember}</span>
                            <p className="text-slate-500 mt-0.5">{v.comment}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            v.vote === 'APPROVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {v.vote}
                          </span>
                        </div>
                      ))}
                    </div>
                    {inspectingCandidate.candidateStatus === 'COMMITTEE_PENDING' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleVote(inspectingCandidate.candidateId, 'APPROVE', 'Approved by Committee Reviewer')}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-1"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Vote Approve
                        </button>
                        <button
                          onClick={() => handleVote(inspectingCandidate.candidateId, 'REJECT', 'Rejected by Committee Reviewer')}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold flex items-center gap-1"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> Vote Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeInspectorTab === 'reasoning' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900">AI Model Reasoning</div>
                    <p className="text-slate-700 leading-relaxed">{inspectingCandidate.reasoning}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">Technical Summary</div>
                      <p className="text-slate-600">{inspectingCandidate.technicalSummary}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">Fundamental Summary</div>
                      <p className="text-slate-600">{inspectingCandidate.fundamentalSummary}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeInspectorTab === 'indicators' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900">Indicator Snapshot</div>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                      {JSON.stringify(inspectingCandidate.indicatorSnapshot, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {activeInspectorTab === 'research' && (
                <div className="space-y-4">
                  {(inspectingCandidate.research || []).map(r => (
                    <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{r.researchSource}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">{r.sentiment}</span>
                      </div>
                      <p className="text-slate-600">{r.summary}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeInspectorTab === 'market' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900">Market Context</div>
                    <p className="text-slate-700">{inspectingCandidate.marketContext}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">Volume Summary</div>
                      <p className="text-slate-600">{inspectingCandidate.volumeSummary}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">Volatility Summary</div>
                      <p className="text-slate-600">{inspectingCandidate.volatilitySummary}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeInspectorTab === 'risk' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="text-orange-700 font-medium">Risk Score</div>
                      <div className="text-xl font-bold text-orange-800 mt-1">{inspectingCandidate.riskScore}</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-blue-700 font-medium">Quality Score</div>
                      <div className="text-xl font-bold text-blue-800 mt-1">{inspectingCandidate.qualityScore}</div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                      <div className="text-indigo-700 font-medium">Priority Score</div>
                      <div className="text-xl font-bold text-indigo-800 mt-1">{inspectingCandidate.priorityScore}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeInspectorTab === 'validation' && (
                <div className="space-y-4">
                  {(inspectingCandidate.validations || []).map(v => (
                    <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{v.ruleName}</span>
                        <p className="text-slate-500 mt-0.5">{v.message}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        v.isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {v.isValid ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeInspectorTab === 'history' && (
                <div className="space-y-3">
                  {(inspectingCandidate.history || []).map(h => (
                    <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{h.action}</span>
                        <p className="text-slate-500 mt-0.5">By: {h.operator} | {h.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeInspectorTab === 'json' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Raw Candidate JSON Package</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(inspectingCandidate, null, 2))}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold"
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                    {JSON.stringify(inspectingCandidate, null, 2)}
                  </pre>
                </div>
              )}

              {activeInspectorTab === 'sha' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900">Cryptographic SHA256 Reference</div>
                    <div className="font-mono bg-white p-3 rounded-lg border border-slate-200 text-xs text-indigo-600 break-all">
                      {inspectingCandidate.sha256Reference}
                    </div>
                    <p className="text-slate-500 text-[11px]">Immutable verification hash generated upon candidate proposal ingestion.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Proposal generated: {new Date(inspectingCandidate.createdTime).toLocaleString()}</span>
              <button
                onClick={() => setInspectingCandidate(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">Side-by-Side Candidate Comparison</h2>
              <button onClick={() => setShowComparisonModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-x-auto flex-1">
              <div className="grid grid-cols-3 gap-6 min-w-[700px]">
                {comparingIds.map(id => {
                  const cand = overview.candidates.find(c => c.candidateId === id);
                  if (!cand) return null;
                  return (
                    <div key={id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <span className="font-mono font-bold text-indigo-600 text-sm">{cand.candidateId}</span>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold">{cand.aiModelId}</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-slate-500">Symbol:</span><span className="font-bold">{cand.symbol} ({cand.assetClass})</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Direction:</span><span className={`font-bold ${cand.direction === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>{cand.direction}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Entry Price:</span><span className="font-mono">${cand.entryPrice}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Stop Loss:</span><span className="font-mono text-rose-600">${cand.stopLoss}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Confidence:</span><span className="font-bold text-indigo-600">{cand.confidence}%</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Risk/Reward:</span><span className="font-mono">{cand.riskReward}x</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Risk Score:</span><span className="font-mono text-orange-600">{cand.riskScore}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Quality Score:</span><span className="font-mono text-blue-600">{cand.qualityScore}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Status:</span><span className="font-bold">{cand.candidateStatus}</span></div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-800 text-[11px]">Reasoning</div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{cand.reasoning}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
