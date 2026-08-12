import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, Search, Filter, 
  Eye, ThumbsUp, ThumbsDown, Copy, Download, Archive, RefreshCw, Layers, 
  ArrowUpRight, ArrowDownRight, FileText, CheckSquare, Square, ChevronLeft, ChevronRight, 
  BarChart2, Zap, Lock, Database, Award, Activity, Sparkles
} from 'lucide-react';
import { StrategyRankingItem, RankingOverview, EMPTY_RANKING_OVERVIEW } from '../../../modules/strategy/ranking/types/index.ts';

interface StrategyRankingWorkspaceProps {
  selectedStrategyId?: string;
  selectedStrategyName?: string;
  availableStrategies?: Array<{ id: string; name: string }>;
  onSelectStrategy?: (id: string) => void;
}

export const StrategyRankingWorkspace: React.FC<StrategyRankingWorkspaceProps> = ({
  selectedStrategyId = 'STRAT-001',
  selectedStrategyName = 'NIFTY Alpha Trend Momentum',
  availableStrategies = [{ id: 'STRAT-001', name: 'NIFTY Alpha Trend Momentum' }],
  onSelectStrategy
}) => {
  const [overview, setOverview] = useState<RankingOverview>(EMPTY_RANKING_OVERVIEW);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [runtimeStatusFilter, setRuntimeStatusFilter] = useState('ALL');
  const [assetFilter, setAssetFilter] = useState('ALL');
  const [directionFilter, setDirectionFilter] = useState('ALL');

  // Selection & Bulk Actions
  const [selectedRankingIds, setSelectedRankingIds] = useState<string[]>([]);

  // Inspector Drawer State
  const [inspectingRanking, setInspectingRanking] = useState<StrategyRankingItem | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'overview' | 'breakdown' | 'reasoning' | 'committee' | 'history' | 'research' | 'indicators' | 'risk' | 'validation' | 'json' | 'sha'>('overview');

  // Comparison State
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchRankings();
  }, [selectedStrategyId]);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`/api/strategy/ranking?strategyId=${selectedStrategyId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch strategy ranking scores');
      }
      const json = await res.json();
      const data = json.success && json.data ? json.data : json;
      setOverview(data || EMPTY_RANKING_OVERVIEW);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading rankings');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (rankingId: string, status: string, reason?: string) => {
    try {
      const res = await fetch(`/api/strategy/ranking/${rankingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, operator: 'Enterprise Ranking Committee', comment: reason })
      });
      if (!res.ok) throw new Error('Failed to update ranking status');
      const json = await res.json();
      if (json.success && json.data) {
        setOverview(json.data);
      } else {
        fetchRankings();
      }
      setSuccessMsg(`Ranking item ${rankingId} status updated to ${status}`);
      setTimeout(() => setSuccessMsg(null), 4000);
      if (inspectingRanking && (inspectingRanking.rankingId === rankingId || inspectingRanking.candidateId === rankingId)) {
        const updated = (json.data?.rankings || []).find((r: StrategyRankingItem) => r.rankingId === rankingId || r.candidateId === rankingId);
        if (updated) setInspectingRanking(updated);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Action failed');
    }
  };

  const handleBulkAction = async (operation: 'APPROVE' | 'REJECT' | 'ARCHIVE') => {
    if (selectedRankingIds.length === 0) return;
    try {
      const res = await fetch(`/api/strategy/ranking/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          operation,
          rankingIds: selectedRankingIds,
          operator: 'Enterprise Committee Officer'
        })
      });
      if (!res.ok) throw new Error('Bulk operation failed');
      const json = await res.json();
      if (json.success && json.data) {
        setOverview(json.data);
      } else {
        fetchRankings();
      }
      setSelectedRankingIds([]);
      setSuccessMsg(`Successfully executed bulk ${operation} on selected items`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Bulk operation failed');
    }
  };

  const handleExport = (format: 'CSV' | 'JSON') => {
    const dataStr = format === 'JSON' 
      ? JSON.stringify(overview.rankings, null, 2)
      : 'Rank,CandidateID,Strategy,Model,Symbol,FinalScore,Tier,Status\n' + 
        overview.rankings.map(r => `${r.rankOrder},${r.candidateId},${r.strategyId},${r.aiModelId},${r.symbol},${r.finalScore},${r.tier},${r.committeeStatus}`).join('\n');
    
    const blob = new Blob([dataStr], { type: format === 'JSON' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategy-rankings-${selectedStrategyId}.${format.toLowerCase()}`;
    a.click();
  };

  // Filter logic
  const filteredRankings = (overview.rankings || []).filter(r => {
    const matchesSearch = r.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.strategyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.aiModelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || r.tier === tierFilter;
    const matchesStatus = statusFilter === 'ALL' || r.committeeStatus === statusFilter;
    const matchesRuntime = runtimeStatusFilter === 'ALL' || r.runtimeStatus === runtimeStatusFilter;
    const matchesAsset = assetFilter === 'ALL' || r.assetClass === assetFilter;
    const matchesDirection = directionFilter === 'ALL' || r.direction === directionFilter;
    return matchesSearch && matchesTier && matchesStatus && matchesRuntime && matchesAsset && matchesDirection;
  });

  const totalPages = Math.ceil(filteredRankings.length / pageSize) || 1;
  const paginatedRankings = filteredRankings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = overview.statistics || {
    totalRanked: 0,
    runtimeReadyCount: 0,
    pendingRankingCount: 0,
    rejectedCount: 0,
    watchlistCount: 0,
    averageFinalScore: 0,
    averageConfidence: 0,
    averageRisk: 0,
    averageQuality: 0,
    averageProfitFactor: 0,
    averageWinRate: 0,
    highestRankedStrategy: 'None'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Enterprise Strategy Ranking Engine (Module 8)</h1>
              <p className="text-xs text-slate-500">Algorithmic SQS multi-factor scoring, weighting, prioritization & runtime handoff for approved candidates.</p>
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
            onClick={fetchRankings}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={() => handleExport('CSV')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export
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

      {/* Top Dashboard Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total Ranked</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{stats.totalRanked}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Runtime Ready</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{stats.runtimeReadyCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Pending Review</div>
          <div className="text-xl font-bold text-amber-600 mt-1">{stats.pendingRankingCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Rejected</div>
          <div className="text-xl font-bold text-rose-600 mt-1">{stats.rejectedCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Avg Final Score</div>
          <div className="text-xl font-bold text-teal-600 mt-1">{stats.averageFinalScore}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Avg Confidence</div>
          <div className="text-xl font-bold text-indigo-600 mt-1">{stats.averageConfidence}%</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Avg Profit Factor</div>
          <div className="text-xl font-bold text-blue-600 mt-1">{stats.averageProfitFactor}x</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Avg Win Rate</div>
          <div className="text-xl font-bold text-teal-700 mt-1">{stats.averageWinRate}%</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate, strategy, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Tiers</option>
            <option value="Enterprise Grade">Enterprise Grade (≥95)</option>
            <option value="Tier A+">Tier A+ (90-94)</option>
            <option value="Tier A">Tier A (80-89)</option>
            <option value="Tier B">Tier B (70-79)</option>
            <option value="Tier C">Tier C (&lt;70)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Committee Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="WATCHLIST">Watchlist</option>
          </select>

          <select
            value={runtimeStatusFilter}
            onChange={(e) => setRuntimeStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Runtime Statuses</option>
            <option value="READY">Ready</option>
            <option value="QUEUED">Queued</option>
            <option value="DEPLOYED">Deployed</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {selectedRankingIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-teal-700">{selectedRankingIds.length} selected</span>
              <button onClick={() => handleBulkAction('APPROVE')} className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700">Approve Runtime</button>
              <button onClick={() => handleBulkAction('REJECT')} className="px-2 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700">Reject</button>
            </div>
          )}

          {comparingIds.length > 0 && (
            <button
              onClick={() => setShowComparisonModal(true)}
              className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-teal-700"
            >
              <BarChart2 className="w-3.5 h-3.5" /> Compare ({comparingIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Enterprise Virtual Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRankingIds.length === paginatedRankings.length && paginatedRankings.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRankingIds(paginatedRankings.map(r => r.rankingId));
                      } else {
                        setSelectedRankingIds([]);
                      }
                    }}
                    className="rounded text-teal-600"
                  />
                </th>
                <th className="p-4">Compare</th>
                <th className="p-4">Rank</th>
                <th className="p-4">Candidate ID</th>
                <th className="p-4">AI Model</th>
                <th className="p-4">Symbol / Asset</th>
                <th className="p-4">Direction</th>
                <th className="p-4">Final Score</th>
                <th className="p-4">Tier</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">Win Rate</th>
                <th className="p-4">Committee</th>
                <th className="p-4">Runtime</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRankings.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-12 text-slate-400">
                    No strategy ranking items found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedRankings.map((item) => (
                  <tr key={item.rankingId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRankingIds.includes(item.rankingId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRankingIds([...selectedRankingIds, item.rankingId]);
                          } else {
                            setSelectedRankingIds(selectedRankingIds.filter(id => id !== item.rankingId));
                          }
                        }}
                        className="rounded text-teal-600"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={comparingIds.includes(item.rankingId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (comparingIds.length >= 5) {
                              alert('You can compare at most 5 items simultaneously.');
                              return;
                            }
                            setComparingIds([...comparingIds, item.rankingId]);
                          } else {
                            setComparingIds(comparingIds.filter(id => id !== item.rankingId));
                          }
                        }}
                        className="rounded text-teal-600"
                        title="Select for comparison"
                      />
                    </td>
                    <td className="p-4 font-mono font-bold text-teal-600 text-sm">#{item.rankOrder}</td>
                    <td className="p-4 font-mono font-bold text-slate-900 cursor-pointer" onClick={() => setInspectingRanking(item)}>
                      {item.candidateId}
                    </td>
                    <td className="p-4 font-medium text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {item.aiModelId}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{item.symbol}</div>
                      <div className="text-[10px] text-slate-500">{item.assetClass}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.direction === 'BUY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.direction === 'BUY' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {item.direction}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-teal-600 text-sm">{item.finalScore}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.tier === 'Enterprise Grade' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        item.tier === 'Tier A+' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.tier === 'Tier A' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.tier}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{item.confidence}%</td>
                    <td className="p-4 font-mono font-medium text-slate-700">{item.historicalPerformance.winRate}%</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.committeeStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.committeeStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.committeeStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.runtimeStatus === 'READY' || item.runtimeStatus === 'DEPLOYED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.runtimeStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => setInspectingRanking(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                        title="Open Inspector"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {item.committeeStatus !== 'APPROVED' && (
                        <button
                          onClick={() => handleAction(item.rankingId, 'APPROVED', 'Approved for runtime deployment')}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg"
                          title="Approve for Runtime"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>Showing {filteredRankings.length} ranking items (Page {currentPage} of {totalPages})</div>
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
      {inspectingRanking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-teal-600 text-base">Rank #{inspectingRanking.rankOrder} - {inspectingRanking.candidateId}</span>
                  <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                    Score: {inspectingRanking.finalScore}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Strategy: {inspectingRanking.strategyId} | Symbol: {inspectingRanking.symbol} ({inspectingRanking.assetClass})</p>
              </div>
              <button
                onClick={() => setInspectingRanking(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-medium">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'breakdown', label: 'Score Breakdown' },
                { id: 'reasoning', label: 'AI Reasoning' },
                { id: 'committee', label: 'Committee Votes' },
                { id: 'history', label: 'History' },
                { id: 'research', label: 'Research' },
                { id: 'indicators', label: 'Indicators' },
                { id: 'risk', label: 'Risk Analysis' },
                { id: 'validation', label: 'Validation' },
                { id: 'json', label: 'JSON' },
                { id: 'sha', label: 'SHA256' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveInspectorTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    activeInspectorTab === tab.id ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
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
                      <div className="text-slate-500">Final Score</div>
                      <div className="text-sm font-bold text-teal-600 mt-1">{inspectingRanking.finalScore} / 100</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-500">Ranking Tier</div>
                      <div className="text-sm font-bold text-indigo-600 mt-1">{inspectingRanking.tier}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-500">Win Rate</div>
                      <div className="text-sm font-bold text-emerald-600 mt-1">{inspectingRanking.historicalPerformance.winRate}%</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-500">Profit Factor</div>
                      <div className="text-sm font-bold text-blue-600 mt-1">{inspectingRanking.historicalPerformance.profitFactor}x</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900">Runtime Deployment Status</div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Current Status: <strong>{inspectingRanking.runtimeStatus}</strong></span>
                      {inspectingRanking.committeeStatus !== 'APPROVED' && (
                        <button
                          onClick={() => handleAction(inspectingRanking.rankingId, 'APPROVED', 'Approved via Inspector')}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700"
                        >
                          Approve Runtime Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeInspectorTab === 'breakdown' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900">Weighted Multi-Factor SQS Score Breakdown</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                        <span>Confidence Score:</span> <strong className="text-teal-600">{inspectingRanking.confidence}</strong>
                      </div>
                      <div className="flex justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                        <span>Quality Score:</span> <strong className="text-blue-600">{inspectingRanking.qualityScore}</strong>
                      </div>
                      <div className="flex justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                        <span>Research Score:</span> <strong className="text-indigo-600">{inspectingRanking.researchScore}</strong>
                      </div>
                      <div className="flex justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                        <span>Consensus Score:</span> <strong className="text-emerald-600">{inspectingRanking.consensusScore}</strong>
                      </div>
                      <div className="flex justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                        <span>Historical Score:</span> <strong className="text-purple-600">{inspectingRanking.historicalScore}</strong>
                      </div>
                      <div className="flex justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                        <span>Execution Readiness:</span> <strong className="text-teal-700">{inspectingRanking.executionReadinessScore}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeInspectorTab === 'reasoning' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900">AI Model Reasoning & Catalyst</div>
                    <p className="text-slate-700 leading-relaxed">{inspectingRanking.aiReasoning}</p>
                  </div>
                </div>
              )}

              {activeInspectorTab === 'committee' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900">Committee Votes & Quorum Log</div>
                    <div className="space-y-2">
                      {(inspectingRanking.committeeVotes || []).map(v => (
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
                  </div>
                </div>
              )}

              {activeInspectorTab === 'history' && (
                <div className="space-y-3">
                  {(inspectingRanking.history || []).map(h => (
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

              {activeInspectorTab === 'research' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900">Research Summary</div>
                    <p className="text-slate-700">{inspectingRanking.researchSummary}</p>
                  </div>
                </div>
              )}

              {activeInspectorTab === 'indicators' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900">Indicator Snapshot</div>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                      {JSON.stringify(inspectingRanking.indicatorSnapshot, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {activeInspectorTab === 'risk' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="text-orange-700 font-medium">Risk Score</div>
                      <div className="text-xl font-bold text-orange-800 mt-1">{inspectingRanking.riskScore}</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-blue-700 font-medium">Volatility Risk</div>
                      <div className="text-sm font-bold text-blue-800 mt-1">{inspectingRanking.riskAnalysis.volatilityRisk}</div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                      <div className="text-indigo-700 font-medium">VaR (99%)</div>
                      <div className="text-sm font-bold text-indigo-800 mt-1">{inspectingRanking.riskAnalysis.var99}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeInspectorTab === 'validation' && (
                <div className="space-y-4">
                  {(inspectingRanking.validationChecks || []).map(v => (
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

              {activeInspectorTab === 'json' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Raw Ranking JSON Object</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(inspectingRanking, null, 2))}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold"
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                    {JSON.stringify(inspectingRanking, null, 2)}
                  </pre>
                </div>
              )}

              {activeInspectorTab === 'sha' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900">Cryptographic SHA256 Reference</div>
                    <div className="font-mono bg-white p-3 rounded-lg border border-slate-200 text-xs text-teal-600 break-all">
                      {inspectingRanking.sha256Reference}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Updated: {new Date(inspectingRanking.updatedTime).toLocaleString()}</span>
              <button
                onClick={() => setInspectingRanking(null)}
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
              <h2 className="text-base font-bold text-slate-900">Side-by-Side Ranking Comparison</h2>
              <button onClick={() => setShowComparisonModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-x-auto flex-1">
              <div className="grid grid-cols-3 gap-6 min-w-[700px]">
                {comparingIds.map(id => {
                  const item = overview.rankings.find(r => r.rankingId === id || r.candidateId === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <span className="font-mono font-bold text-teal-600 text-sm">Rank #{item.rankOrder}</span>
                        <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-[10px] font-bold">{item.tier}</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-slate-500">Candidate:</span><span className="font-mono font-bold">{item.candidateId}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Model:</span><span className="font-bold">{item.aiModelId}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Symbol:</span><span className="font-bold">{item.symbol}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Final Score:</span><span className="font-mono font-bold text-teal-600">{item.finalScore}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Confidence:</span><span className="font-bold">{item.confidence}%</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Win Rate:</span><span className="font-mono">{item.historicalPerformance.winRate}%</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Profit Factor:</span><span className="font-mono">{item.historicalPerformance.profitFactor}x</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Committee:</span><span className="font-bold">{item.committeeStatus}</span></div>
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
