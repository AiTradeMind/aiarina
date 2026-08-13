import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Swords, 
  Crown, 
  Activity, 
  BarChart2, 
  Network, 
  Zap, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Cpu, 
  Filter, 
  Clock, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  Terminal as TerminalIcon,
  ChevronRight,
  Flame,
  Star,
  Layers,
  ArrowUpRight,
  Search,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';
import { SectionHeader, StatusBadge, MetricCard, Panel, Toolbar, GlobalSummaryItem } from './ui/Base';
import { DataTable } from './ui/Table';
import { LoadingOverlay } from './ui/Feedback';
import { ENTERPRISE_AI_MODELS_REGISTRY, AIModelRegistryFullItem } from '../data/aiModelsRegistry';

export const LeaderboardWorkspace = React.memo(() => {
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('QUARTER');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [rankingMetric, setRankingMetric] = useState('OVERALL_SCORE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModelRegistryFullItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Map all 28 models into enterprise fleet performance items with weighted overall scores
  const fleetLeaderboardData = useMemo(() => {
    return ENTERPRISE_AI_MODELS_REGISTRY.map((model, index) => {
      const rank = index + 1;
      const markets = ['Stocks', 'ETF', 'Index', 'Futures', 'Options', 'Commodities'];
      const market = markets[index % markets.length];
      const trades = 350 + (index * 42) % 1500;
      const winRateNum = 68 + (index * 1.5) % 25;
      const winRate = `${winRateNum.toFixed(1)}%`;
      const accuracyNum = 85 + (index * 0.8) % 14;
      const accuracy = `${accuracyNum.toFixed(1)}%`;
      const roiNum = 18.5 + (index * 1.8) % 45;
      const roi = `+${roiNum.toFixed(1)}%`;
      const profit = `+$${((15000 + index * 4200)).toLocaleString()}`;
      const riskScoreNum = 1.2 + (index * 0.2) % 3.5;
      const riskScore = `${riskScoreNum.toFixed(1)} (Low)`;
      const tournamentElo = Math.max(1500, 1980 - (index * 16));
      const productionRating = index <= 5 ? 'Stable (99.9%)' : index <= 15 ? 'Optimized (98.5%)' : 'Calibrating (96.2%)';
      const promotionTier = rank <= 2 ? 'Champion' : rank <= 8 ? 'Elite' : rank <= 20 ? 'Candidate' : 'Sandbox';
      const lastTrade = `2026-08-03 ${String(12 - (index % 10)).padStart(2, '0')}:42`;
      const version = model.version || 'v2.5';
      const status = model.status || 'ACTIVE';

      // Weighted Enterprise Overall Score calculation
      const overallScoreNum = (
        (roiNum * 0.3) + 
        (winRateNum * 0.25) + 
        (accuracyNum * 0.15) + 
        ((tournamentElo / 20) * 0.15) + 
        ((10 - riskScoreNum) * 5 * 0.15)
      );
      const overallScore = overallScoreNum.toFixed(1);

      return {
        ...model,
        rank,
        market,
        trades,
        winRate,
        accuracy,
        roi,
        profit,
        riskScore,
        tournamentElo,
        productionRating,
        promotionTier,
        lastTrade,
        version,
        status,
        overallScoreNum,
        overallScore
      };
    });
  }, []);

  const filteredData = useMemo(() => {
    return fleetLeaderboardData.filter(m => {
      const matchesSearch = searchQuery === '' || 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMarket = marketFilter === 'ALL' || m.market.toLowerCase() === marketFilter.toLowerCase();
      const matchesProvider = providerFilter === 'ALL' || m.provider.toLowerCase().includes(providerFilter.toLowerCase());
      return matchesSearch && matchesMarket && matchesProvider;
    }).sort((a, b) => {
      if (rankingMetric === 'ROI') return parseFloat(b.roi) - parseFloat(a.roi);
      if (rankingMetric === 'WIN_RATE') return parseFloat(b.winRate) - parseFloat(a.winRate);
      if (rankingMetric === 'ACCURACY') return parseFloat(b.accuracy) - parseFloat(a.accuracy);
      if (rankingMetric === 'TOURNAMENT_SCORE' || rankingMetric === 'TOURNAMENT_ELO') return b.tournamentElo - a.tournamentElo;
      if (rankingMetric === 'RISK') return parseFloat(a.riskScore) - parseFloat(b.riskScore);
      return b.overallScoreNum - a.overallScoreNum;
    }).map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [fleetLeaderboardData, searchQuery, marketFilter, providerFilter, rankingMetric]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-terminal-bg text-white font-sans selection:bg-terminal-amber/30 relative">
      {/* HEADER (~6% height, compact) */}
      <div className="h-[6%] min-h-[36px] bg-black/50 border-b border-terminal-border px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-terminal-amber" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">Enterprise Fleet Performance Leaderboard (All 28 AI Models)</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-terminal-muted">
          <span>Season: <strong className="text-terminal-amber">2026 Q3</strong></span>
          <span>Top Model: <strong className="text-terminal-green">Gemini 2.5 Pro (98.8)</strong></span>
          <button
            onClick={() => setLoading(true)}
            className="px-2 py-0.5 bg-terminal-panel hover:bg-white/5 border border-terminal-border text-terminal-amber rounded text-[10px] font-mono font-bold flex items-center gap-1"
          >
            <RefreshCcw className="w-3 h-3" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* TOP FILTER BAR (~7% height) */}
      <div className="h-[7%] min-h-[40px] bg-black/30 border-b border-terminal-border px-3 flex flex-wrap items-center gap-3 text-xs font-mono shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-terminal-muted uppercase font-bold">Market:</span>
          <select
            value={marketFilter}
            onChange={(e) => { setMarketFilter(e.target.value); setCurrentPage(1); }}
            className="bg-black/80 border border-terminal-border rounded px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-terminal-amber"
          >
            <option value="ALL">All Markets</option>
            <option value="Stocks">Stocks</option>
            <option value="ETF">ETF</option>
            <option value="Index">Index</option>
            <option value="Futures">Futures</option>
            <option value="Options">Options</option>
            <option value="Commodities">Commodities</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-terminal-muted uppercase font-bold">Time:</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-black/80 border border-terminal-border rounded px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-terminal-amber"
          >
            <option value="TODAY">Today</option>
            <option value="WEEK">Week</option>
            <option value="MONTH">Month</option>
            <option value="QUARTER">Quarter</option>
            <option value="YEAR">Year</option>
            <option value="LIFETIME">Lifetime</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-terminal-muted uppercase font-bold">Provider:</span>
          <select
            value={providerFilter}
            onChange={(e) => { setProviderFilter(e.target.value); setCurrentPage(1); }}
            className="bg-black/80 border border-terminal-border rounded px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-terminal-amber"
          >
            <option value="ALL">All Providers</option>
            <option value="OpenAI">OpenAI</option>
            <option value="Anthropic">Anthropic</option>
            <option value="Google">Google</option>
            <option value="DeepSeek">DeepSeek</option>
            <option value="Meta">Meta</option>
            <option value="Mistral">Mistral</option>
            <option value="xAI">xAI</option>
            <option value="Sarvam">Sarvam</option>
            <option value="OpenRouter">OpenRouter</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-terminal-muted uppercase font-bold">Ranking:</span>
          <select
            value={rankingMetric}
            onChange={(e) => { setRankingMetric(e.target.value); setCurrentPage(1); }}
            className="bg-black/80 border border-terminal-border rounded px-2 py-0.5 text-[11px] text-terminal-amber font-bold focus:outline-none focus:border-terminal-amber"
          >
            <option value="OVERALL_SCORE">Overall Score</option>
            <option value="ROI">ROI</option>
            <option value="WIN_RATE">Win Rate</option>
            <option value="ACCURACY">Accuracy</option>
            <option value="SHARPE">Sharpe</option>
            <option value="RISK">Risk Score</option>
            <option value="TOURNAMENT_SCORE">Tournament Score</option>
            <option value="PRODUCTION">Production</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 text-terminal-muted absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-black/80 border border-terminal-border rounded pl-7 pr-2.5 py-0.5 text-[11px] text-white focus:outline-none focus:border-terminal-amber w-36 font-mono"
            />
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE LAYOUT (~72% height table + 28-30% collapsible passport) */}
      <div className="flex-1 flex overflow-hidden relative">
        {loading && <LoadingOverlay message="Synchronizing Enterprise Fleet Leaderboard..." />}

        {/* LEFT / MAIN TABLE: DENSE ENTERPRISE TABLE */}
        <div className={cn("flex-1 flex flex-col overflow-hidden bg-black/10 transition-all duration-200", selectedModel ? "lg:w-[70%]" : "w-full")}>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="border border-terminal-border rounded bg-terminal-panel shadow-inner">
              <div className="overflow-x-auto">
                <DataTable
                  data={paginatedData}
                  columns={[
                    { header: 'Rank', accessor: (m: any) => <span className="font-bold text-terminal-amber">#{m.rank}</span> },
                    { header: 'AI Model', accessor: (m: any) => <span className="font-bold text-white hover:text-terminal-amber cursor-pointer">{m.name}</span> },
                    { header: 'Provider', accessor: 'provider', className: "text-terminal-muted text-[11px]" },
                    { header: 'Market', accessor: 'market', className: "text-terminal-blue text-[11px]" },
                    { header: 'Status', accessor: (m: any) => <StatusBadge status={m.status} variant="success" /> },
                    { header: 'Overall', accessor: (m: any) => <span className="font-bold text-terminal-green font-mono text-[11px]">{m.overallScore}</span> },
                    { header: 'Win Rate', accessor: (m: any) => <span className="text-terminal-blue font-bold font-mono text-[11px]">{m.winRate}</span> },
                    { header: 'Accuracy', accessor: (m: any) => <span className="text-terminal-amber font-mono text-[11px]">{m.accuracy}</span> },
                    { header: 'ROI', accessor: (m: any) => <span className="text-terminal-green font-bold font-mono text-[11px]">{m.roi}</span> },
                    { header: 'Profit', accessor: (m: any) => <span className="text-terminal-green font-mono text-[11px]">{m.profit}</span> },
                    { header: 'Trades', accessor: (m: any) => <span className="font-mono text-[11px]">{m.trades}</span> },
                    { header: 'Risk', accessor: (m: any) => <span className="text-terminal-muted font-mono text-[10px]">{m.riskScore}</span> },
                    { header: 'ELO', accessor: (m: any) => <span className="text-terminal-amber font-bold font-mono text-[11px]">{m.tournamentElo}</span> },
                    { header: 'Production', accessor: (m: any) => <span className="text-slate-300 text-[10px]">{m.productionRating}</span> },
                    { header: 'Tier', accessor: (m: any) => <span className="px-1.5 py-0.5 bg-terminal-amber/20 text-terminal-amber rounded text-[9px] font-bold">{m.promotionTier}</span> },
                    { header: 'Version', accessor: 'version', className: "text-terminal-muted font-mono text-[10px]" },
                    { header: 'Passport', accessor: (m: any) => (
                      <button
                        onClick={() => setSelectedModel(m)}
                        className={cn(
                          "px-2 py-0.5 border rounded text-[10px] font-bold transition-colors",
                          selectedModel?.id === m.id ? "bg-terminal-amber text-black border-terminal-amber" : "bg-black/60 hover:bg-terminal-amber hover:text-black border-terminal-border text-terminal-amber"
                        )}
                      >
                        Open →
                      </button>
                    ), align: 'right' }
                  ]}
                  onRowClick={(m: any) => setSelectedModel(m)}
                />
              </div>
            </div>

            {/* PAGINATION BAR */}
            <div className="flex items-center justify-between px-3 py-2 bg-black/40 border border-terminal-border rounded mt-2 text-[11px] font-mono">
              <span className="text-terminal-muted">Showing {paginatedData.length} of {filteredData.length} registered models (Page {currentPage} of {totalPages})</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-0.5 bg-terminal-panel border border-terminal-border rounded disabled:opacity-40 text-terminal-amber"
                >
                  Prev
                </button>
                <span className="px-2 text-white">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-0.5 bg-terminal-panel border border-terminal-border rounded disabled:opacity-40 text-terminal-amber"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: INLINE AI CAREER PASSPORT (~28-30% width, master-detail, collapsible) */}
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-[30%] min-w-[320px] max-w-[420px] border-l border-terminal-border flex flex-col shrink-0 bg-terminal-panel overflow-hidden shadow-2xl relative"
          >
            <div className="h-10 border-b border-terminal-border bg-black/50 flex items-center px-3 justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-terminal-amber" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">AI Career Passport</span>
              </div>
              <button
                onClick={() => setSelectedModel(null)}
                className="px-1.5 py-0.5 text-terminal-muted hover:text-white rounded bg-black/40 border border-terminal-border text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
              <div className="p-2.5 bg-black/40 border border-terminal-border rounded space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-terminal-amber font-bold">Rank #{selectedModel.rank} Fleet Unit</span>
                  <StatusBadge status={selectedModel.status} variant="success" />
                </div>
                <h3 className="text-sm font-bold text-white">{selectedModel.name}</h3>
                <p className="text-[10px] text-terminal-muted">{selectedModel.provider} | {selectedModel.version} | {selectedModel.category}</p>
              </div>

              {/* OVERVIEW */}
              <div className="p-2.5 bg-black/30 border border-terminal-border rounded space-y-1.5">
                <div className="text-[9px] uppercase font-bold text-terminal-muted tracking-widest">1. Fleet Overview & Score</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Overall Score: <strong className="text-terminal-green font-bold">{selectedModel.overallScore}</strong></div>
                  <div>ROI: <strong className="text-terminal-green">{selectedModel.roi}</strong></div>
                  <div>Win Rate: <strong className="text-terminal-blue">{selectedModel.winRate}</strong></div>
                  <div>Accuracy: <strong className="text-terminal-amber">{selectedModel.accuracy}</strong></div>
                  <div>Total Profit: <strong className="text-terminal-green">{selectedModel.profit}</strong></div>
                  <div>Trades: <strong className="text-white">{selectedModel.trades}</strong></div>
                </div>
              </div>

              {/* MARKET PERFORMANCE */}
              <div className="p-2.5 bg-black/30 border border-terminal-border rounded space-y-1.5">
                <div className="text-[9px] uppercase font-bold text-terminal-muted tracking-widest">2. Market Performance Breakdown</div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between border-b border-terminal-border/40 pb-0.5"><span>Stocks:</span><strong className="text-terminal-green">+34.2% ROI</strong></div>
                  <div className="flex justify-between border-b border-terminal-border/40 pb-0.5"><span>ETF:</span><strong className="text-terminal-green">+18.5% ROI</strong></div>
                  <div className="flex justify-between border-b border-terminal-border/40 pb-0.5"><span>Index:</span><strong className="text-terminal-green">+42.1% ROI</strong></div>
                  <div className="flex justify-between border-b border-terminal-border/40 pb-0.5"><span>Options:</span><strong className="text-terminal-green">+29.8% ROI</strong></div>
                  <div className="flex justify-between border-b border-terminal-border/40 pb-0.5"><span>Futures:</span><strong className="text-terminal-green">+24.4% ROI</strong></div>
                  <div className="flex justify-between"><span>Commodities:</span><strong className="text-terminal-green">+19.2% ROI</strong></div>
                </div>
              </div>

              {/* TRADE & STRATEGY HISTORY SUMMARY */}
              <div className="p-2.5 bg-black/30 border border-terminal-border rounded space-y-1.5">
                <div className="text-[9px] uppercase font-bold text-terminal-muted tracking-widest">3. Trade & Strategy History</div>
                <div className="text-[11px] text-white font-bold">{selectedModel.strategy}</div>
                <p className="text-[10px] text-terminal-muted">Executed multi-factor orderflow capture with strict risk guardrails.</p>
              </div>

              {/* LIFECYCLE & TOURNAMENT HISTORY */}
              <div className="p-2.5 bg-black/30 border border-terminal-border rounded space-y-1.5">
                <div className="text-[9px] uppercase font-bold text-terminal-muted tracking-widest">4. Lifecycle & Tournament History</div>
                <div className="space-y-1 text-[10px] text-terminal-muted">
                  <div>• Tournament ELO: <strong className="text-terminal-amber">{selectedModel.tournamentElo} ELO</strong></div>
                  <div>• Promotion Tier: <strong className="text-terminal-green">{selectedModel.promotionTier}</strong></div>
                  <div>• Production Rating: <strong className="text-white">{selectedModel.productionRating}</strong></div>
                </div>
              </div>

              {/* KNOWLEDGE GRAPH, MEMORY & EXPLAINABILITY */}
              <div className="p-2.5 bg-black/30 border border-terminal-border rounded space-y-1.5">
                <div className="text-[9px] uppercase font-bold text-terminal-muted tracking-widest">5. Knowledge Graph, Memory & Explainability</div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  <span className="px-1.5 py-0.5 bg-terminal-blue/20 text-terminal-blue border border-terminal-blue/30 rounded text-[9px]">KG-Node: EnterpriseAlpha</span>
                  <span className="px-1.5 py-0.5 bg-terminal-green/20 text-terminal-green border border-terminal-green/30 rounded text-[9px]">Memory: RAM-Vector-991</span>
                  <span className="px-1.5 py-0.5 bg-terminal-amber/20 text-terminal-amber border border-terminal-amber/30 rounded text-[9px]">Constitution: 100% Passed</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* FOOTER STATUS (~3% height, ~28-32px max) */}
      <div className="h-[3%] min-h-[28px] bg-black/60 border-t border-terminal-border px-3 flex items-center justify-between text-[10px] font-mono text-terminal-muted shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
            <strong className="text-white">Enterprise Fleet Active</strong>
          </span>
          <span>Streaming: <strong className="text-terminal-green">LIVE</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span>Latency: <strong className="text-terminal-blue">12ms</strong></span>
          <span>Zero CLS / Optimized Layout</span>
        </div>
      </div>
    </div>
  );
});
