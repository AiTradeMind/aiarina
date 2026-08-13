import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Swords, 
  Crown, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  Layers, 
  Eye, 
  FileText, 
  Terminal as TerminalIcon,
  Award,
  Sparkles,
  Share2,
  Workflow
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { DataTable } from './ui/Table';
import { ENTERPRISE_AI_MODELS_REGISTRY, AIModelRegistryFullItem } from '../data/aiModelsRegistry';

interface TournamentMatch {
  id: string;
  season: string;
  round: 'Quarter Finals' | 'Semi Finals' | 'Finals' | 'Group Stage';
  modelA: { id: string; name: string; strategy: string; elo: number; winRate: string };
  modelB: { id: string; name: string; strategy: string; elo: number; winRate: string };
  winner?: string;
  market: string;
  status: 'COMPLETED' | 'LIVE' | 'SCHEDULED';
  score: string;
  duration: string;
  timestamp: string;
  rationale: string;
}

export const AITournamentArenaWorkspace = React.memo(({ showToast }: { showToast?: (msg: string) => void }) => {
  const [subTab, setSubTab] = useState<'REGISTRY' | 'BATTLES' | 'CHAMPIONSHIPS' | 'LEADERBOARD' | 'ANALYTICS'>('REGISTRY');
  const [selectedModel, setSelectedModel] = useState<AIModelRegistryFullItem | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Map all 28 models into tournament items with derived stats
  const tournamentModels = useMemo(() => {
    return ENTERPRISE_AI_MODELS_REGISTRY.map((model, index) => {
      const rank = index + 1;
      const elo = Math.max(1500, 1980 - (index * 16));
      const wins = Math.max(2, 24 - index);
      const losses = Math.max(1, index % 6);
      const draws = index % 3;
      const tier = rank <= 2 ? 'Champion' : rank <= 8 ? 'Elite' : rank <= 20 ? 'Candidate' : 'Sandbox';
      const championStatus = rank === 1 ? '👑 Season Champion' : rank === 2 ? '⭐ Runner-up' : rank <= 4 ? '🔥 Semi-Finalist' : 'Active Contender';
      
      return {
        ...model,
        rank,
        elo,
        season: 'Season 2026 Q3',
        wins,
        losses,
        draws,
        tier,
        championStatus,
        lastMatch: `MATCH-2026-Q3-${String((index % 15) + 1).padStart(2, '0')}`,
        nextMatch: `MATCH-2026-Q3-${String(((index + 5) % 15) + 1).padStart(2, '0')}`,
        healthScore: model.health === 'OPTIMAL' ? '99.8%' : model.health === 'CALIBRATING' ? '97.2%' : '94.5%'
      };
    });
  }, []);

  const filteredModels = useMemo(() => {
    return tournamentModels.filter(m => {
      const matchesSearch = searchQuery === '' || 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = tierFilter === 'ALL' || m.tier === tierFilter;
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [tournamentModels, searchQuery, tierFilter, statusFilter]);

  const paginatedModels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredModels.slice(start, start + pageSize);
  }, [filteredModels, currentPage]);

  const totalPages = Math.ceil(filteredModels.length / pageSize);

  const mockMatches: TournamentMatch[] = useMemo(() => [
    {
      id: 'MATCH-2026-Q3-01',
      season: 'Season 2026 Q3',
      round: 'Finals',
      modelA: { id: 'MOD-001', name: 'Gemini 2.5 Pro', strategy: 'Multi-Factor Alpha', elo: 1980, winRate: '78.5%' },
      modelB: { id: 'MOD-002', name: 'GPT-4o', strategy: 'Orderflow Momentum', elo: 1945, winRate: '75.2%' },
      winner: 'Gemini 2.5 Pro',
      market: 'NIFTY 50 Index Options',
      status: 'COMPLETED',
      score: '4 - 2',
      duration: '45m 12s',
      timestamp: '2026-08-01 14:30',
      rationale: 'Gemini secured superior Sharpe ratio during high-volatility afternoon bank expiry.'
    },
    {
      id: 'MATCH-2026-Q3-02',
      season: 'Season 2026 Q3',
      round: 'Semi Finals',
      modelA: { id: 'MOD-003', name: 'Claude 3.5 Sonnet', strategy: 'Statistical Arbitrage', elo: 1910, winRate: '74.1%' },
      modelB: { id: 'MOD-002', name: 'GPT-4o', strategy: 'Orderflow Momentum', elo: 1945, winRate: '75.2%' },
      winner: 'GPT-4o',
      market: 'BANKNIFTY Futures',
      status: 'COMPLETED',
      score: '3 - 1',
      duration: '38m 40s',
      timestamp: '2026-08-01 11:00',
      rationale: 'Momentum breakout capture yielded +4.2% return over stat-arb range.'
    },
    {
      id: 'MATCH-2026-Q3-03',
      season: 'Season 2026 Q3',
      round: 'Semi Finals',
      modelA: { id: 'MOD-001', name: 'Gemini 2.5 Pro', strategy: 'Multi-Factor Alpha', elo: 1980, winRate: '78.5%' },
      modelB: { id: 'MOD-004', name: 'DeepSeek R1', strategy: 'Intermarket Flow', elo: 1890, winRate: '72.9%' },
      winner: 'Gemini 2.5 Pro',
      market: 'IT vs Auto Index Spread',
      status: 'COMPLETED',
      score: '5 - 0',
      duration: '41m 15s',
      timestamp: '2026-08-01 10:15',
      rationale: 'Clean sweep via robust sector divergence capture and strict risk guardrails.'
    }
  ], []);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* TOURNAMENT ARENA HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider text-white">AI ELO Tournament Arena & Enterprise Operating Hub</h1>
            <p className="text-[10px] text-slate-400">Complete AI Model Tournament Registry (All 28 Models), Head-to-Head Battles, Digital Passports & ELO Rankings</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-black/60 p-1 rounded border border-slate-800">
            {(['REGISTRY', 'BATTLES', 'CHAMPIONSHIPS', 'LEADERBOARD', 'ANALYTICS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setSubTab(tab); setSelectedMatch(null); }}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors",
                  subTab === tab ? "bg-amber-500 text-black font-black" : "text-slate-400 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => showToast && showToast('Tournament matrices re-computed across all 28 registered AI models.')}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Recalculate Matrix</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tournament Fleet', val: '28 AI Models', sub: 'Registered in Season 2026 Q3', color: 'text-amber-400', border: 'border-amber-500/30' },
          { label: 'Peak ELO Rating', val: '1,980 ELO', sub: 'Gemini 2.5 Pro Enterprise', color: 'text-emerald-400', border: 'border-emerald-500/30' },
          { label: 'Active Matches', val: '142 Battles', sub: '100% Immutable Audit Trail', color: 'text-blue-400', border: 'border-blue-500/30' },
          { label: 'Promotion Quorum', val: '7 / 7 Unanimous', sub: 'Trade Constitution Compliant', color: 'text-purple-400', border: 'border-purple-500/30' }
        ].map((m, i) => (
          <div key={i} className={cn("p-3 bg-slate-900 border rounded-lg flex flex-col justify-between space-y-1 shadow-md", m.border)}>
            <span className="text-[10px] text-slate-400 uppercase font-bold">{m.label}</span>
            <div className={cn("text-base font-bold font-mono", m.color)}>{m.val}</div>
            <span className="text-[9px] text-slate-500">{m.sub}</span>
          </div>
        ))}
      </div>

      {/* SUB-VIEW CONTENT: REGISTRY (ALL 28 MODELS + INLINE DIGITAL PASSPORT) */}
      {subTab === 'REGISTRY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: TOURNAMENT REGISTRY TABLE (ALL 28 MODELS) */}
          <div className={cn("space-y-4", selectedModel ? "lg:col-span-2" : "lg:col-span-3")}>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-white">Enterprise Tournament Registry ({filteredModels.length} of 28 Models)</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search 28 models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 w-44"
                    />
                  </div>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                  >
                    <option value="ALL">All Tiers</option>
                    <option value="Champion">Champion</option>
                    <option value="Elite">Elite</option>
                    <option value="Candidate">Candidate</option>
                    <option value="Sandbox">Sandbox</option>
                  </select>
                </div>
              </div>

              <DataTable
                data={paginatedModels}
                columns={[
                  { header: 'Rank', accessor: (m: any) => <span className="font-bold text-amber-400">#{m.rank}</span> },
                  { header: 'AI Name', accessor: (m: any) => <span className="font-bold text-white hover:text-amber-300 cursor-pointer">{m.name}</span> },
                  { header: 'Provider', accessor: 'provider', className: "text-slate-400" },
                  { header: 'ELO', accessor: (m: any) => <span className="font-bold text-emerald-400 font-mono">{m.elo}</span> },
                  { header: 'Season', accessor: 'season', className: "text-slate-300 text-[10px]" },
                  { header: 'W / L / D', accessor: (m: any) => <span className="text-slate-300 font-mono">{m.wins}W/{m.losses}L/{m.draws}D</span> },
                  { header: 'Tier', accessor: (m: any) => <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[9px] font-bold">{m.tier}</span> },
                  { header: 'Status', accessor: (m: any) => <span className="text-emerald-400 text-[10px]">{m.status}</span> },
                  { header: 'Health', accessor: (m: any) => <span className="text-blue-300 font-mono">{m.healthScore}</span> },
                  { header: 'Passport', accessor: (m: any) => (
                    <button
                      onClick={() => setSelectedModel(m)}
                      className={cn(
                        "px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors",
                        selectedModel?.id === m.id ? "bg-amber-500 text-black font-black" : "bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700"
                      )}
                    >
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>View →</span>
                    </button>
                  ), align: 'right' }
                ]}
              />

              {/* PAGINATION CONTROLS */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-400">
                <span className="text-[10px]">Showing page {currentPage} of {totalPages} ({filteredModels.length} models total)</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 bg-slate-950 border border-slate-800 rounded disabled:opacity-40 text-white text-xs font-bold"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1 bg-slate-950 border border-slate-800 rounded disabled:opacity-40 text-white text-xs font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: INLINE DIGITAL PASSPORT (NO POPUPS, NO MODALS, NO DRAWERS) */}
          {selectedModel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 border border-amber-500/40 p-4 rounded-lg space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Tournament Digital Passport</h3>
                    <p className="text-[10px] text-amber-400">{selectedModel.name} ({selectedModel.id})</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="p-1 text-slate-400 hover:text-white rounded bg-slate-950 border border-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 max-h-[700px] overflow-y-auto pr-1">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Model Core Metadata</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Provider: <strong className="text-white">{selectedModel.provider}</strong></div>
                    <div>Version: <strong className="text-amber-300">{selectedModel.version}</strong></div>
                    <div>Category: <strong className="text-blue-300">{selectedModel.category}</strong></div>
                    <div>ELO Rating: <strong className="text-emerald-400 font-mono">1,942 ELO</strong></div>
                    <div>Promotion Tier: <strong className="text-amber-400">{selectedModel.tier}</strong></div>
                    <div>Champion Status: <strong className="text-emerald-300">{selectedModel.championStatus}</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Tournament & Battle History</div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between border-b border-slate-800 pb-1"><span>Season Battles:</span><strong className="text-white">22 Matches</strong></div>
                    <div className="flex justify-between border-b border-slate-800 pb-1"><span>Win / Loss / Draw:</span><strong className="text-emerald-400">18W / 3L / 1D</strong></div>
                    <div className="flex justify-between border-b border-slate-800 pb-1"><span>Last Match Opponent:</span><strong className="text-blue-300">Claude Sonnet 5 Apex</strong></div>
                    <div className="flex justify-between"><span>Next Scheduled Round:</span><strong className="text-amber-400">Semi-Finals Rematch</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">ELO Timeline & Promotion History</div>
                  <div className="space-y-1 text-[10px] text-slate-300">
                    <div>• 2026-08-01: Promoted to Champion Tier (+42 ELO Δ)</div>
                    <div>• 2026-07-28: Quarter Finals Victory vs AlphaFlow V3.2</div>
                    <div>• 2026-07-20: Initial Entry into Season 2026 Q3 Arena</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Constitution Compliance & Explainability</div>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div>Trade Constitution: <strong className="text-emerald-400">100% Compliant (Rule IV)</strong></div>
                    <div>Committee Votes: <strong className="text-emerald-400">7 / 7 Unanimous Quorum</strong></div>
                    <div>Explainability Summary: <p className="text-slate-400 text-[10px] italic mt-1">"Model weights verified against risk guardrails. Multi-factor alpha attribution confirmed through immutable audit log."</p></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Knowledge Graph & Memory Links</div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[9px]">KG-Node: MultiFactorAlpha</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[9px]">Memory: RAM-Vector-991</span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[9px]">Brain: Central-Core-V3</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {subTab === 'BATTLES' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Head-to-Head AI Battle History</h2>
            </div>
            <span className="text-[10px] text-slate-400">Audited Championship Matchups</span>
          </div>

          <DataTable
            data={mockMatches}
            columns={[
              { header: 'Match ID', accessor: (m: TournamentMatch) => <span className="font-bold text-amber-400">{m.id}</span> },
              { header: 'Round', accessor: (m: TournamentMatch) => <span className="text-slate-300">{m.round}</span> },
              { header: 'Contenders (AI vs AI)', accessor: (m: TournamentMatch) => (
                <div className="flex items-center gap-2 text-xs">
                  <span className={cn("font-bold", m.winner === m.modelA.name ? "text-emerald-400 underline" : "text-slate-300")}>{m.modelA.name}</span>
                  <span className="text-amber-500 font-black">VS</span>
                  <span className={cn("font-bold", m.winner === m.modelB.name ? "text-emerald-400 underline" : "text-slate-300")}>{m.modelB.name}</span>
                </div>
              )},
              { header: 'Market', accessor: (m: TournamentMatch) => <span className="text-blue-300">{m.market}</span> },
              { header: 'Score', accessor: (m: TournamentMatch) => <span className="font-bold text-white font-mono">{m.score}</span> },
              { header: 'Winner', accessor: (m: TournamentMatch) => <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">{m.winner}</span> }
            ]}
          />
        </div>
      )}

      {subTab === 'CHAMPIONSHIPS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-lg space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-bold uppercase text-white">Season 2026 Q3 Championship Bracket</h2>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
                Grand Finals Completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div className="text-[10px] uppercase font-bold text-slate-400">Quarter Finals</div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded flex justify-between">
                    <span>Gemini 2.5 vs DeepSeek R1</span>
                    <span className="text-emerald-400 font-bold">5 - 0</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded flex justify-between">
                    <span>Claude Sonnet vs GPT-5</span>
                    <span className="text-emerald-400 font-bold">3 - 1</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div className="text-[10px] uppercase font-bold text-slate-400">Semi Finals</div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded flex justify-between">
                    <span>Gemini 2.5 Pro Enterprise</span>
                    <span className="text-emerald-400 font-bold">Winner</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded flex justify-between">
                    <span>GPT-5 Institutional Alpha</span>
                    <span className="text-emerald-400 font-bold">Winner</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-amber-500/50 rounded-lg space-y-3 bg-gradient-to-b from-amber-500/10 to-transparent">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="text-[10px] uppercase font-bold text-amber-400">Grand Champion</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-white text-base">Gemini 2.5 Pro Enterprise</div>
                  <div className="text-[11px] text-slate-300">Strategy: Multi-Factor Alpha</div>
                  <div className="text-[11px] text-emerald-400 font-bold">Rating: 1,980 ELO (+48 Δ)</div>
                  <div className="text-[10px] text-slate-400 pt-1">Automated promotion token issued for live production capital scaling.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'LEADERBOARD' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">AI ELO Leaderboard (All 28 Models Ranked)</h2>
            </div>
            <span className="text-[10px] text-slate-400">Fully Paginated Enterprise Leaderboard</span>
          </div>

          <DataTable
            data={paginatedModels}
            columns={[
              { header: 'Championship Rank', accessor: (m: any) => <span className="font-bold text-amber-400">Rank #{m.rank}</span> },
              { header: 'AI Model Name', accessor: (m: any) => <span className="font-bold text-white">{m.name}</span> },
              { header: 'Provider', accessor: 'provider', className: "text-slate-400" },
              { header: 'Tournament ELO', accessor: (m: any) => <span className="font-bold text-emerald-400 font-mono">{m.elo} ELO</span> },
              { header: 'Season Standing', accessor: (m: any) => <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold">{m.tier}</span> },
              { header: 'Tournament Win %', accessor: (m: any) => <span className="text-blue-300 font-mono">{m.winRate}</span> },
              { header: 'Head-to-Head (W/L/D)', accessor: (m: any) => <span className="text-slate-300 font-mono">{m.wins}W / {m.losses}L / {m.draws}D</span> },
              { header: 'Brackets / Status', accessor: (m: any) => <span className="text-amber-300 font-bold">{m.championStatus}</span> },
              { header: 'Tournament History', accessor: (m: any) => <span className="text-slate-400 text-[10px]">Quarter-Finals & Semi-Finals Audited</span> }
            ]}
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-400">
            <span className="text-[10px]">Showing page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1 bg-slate-950 border border-slate-800 rounded disabled:opacity-40 text-white text-xs font-bold"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1 bg-slate-950 border border-slate-800 rounded disabled:opacity-40 text-white text-xs font-bold"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3 shadow-xl">
            <div className="text-[10px] uppercase font-bold text-slate-400">Tournament Win Rate Distribution (All 28 Models)</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] mb-1"><span>Gemini 2.5 Pro Enterprise</span><span className="text-emerald-400">78.5%</span></div>
                <div className="h-2 bg-slate-950 rounded overflow-hidden"><div className="h-full bg-amber-500" style={{ width: '78.5%' }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1"><span>GPT-5 Institutional Alpha</span><span className="text-emerald-400">75.2%</span></div>
                <div className="h-2 bg-slate-950 rounded overflow-hidden"><div className="h-full bg-blue-500" style={{ width: '75.2%' }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1"><span>Claude 3.5 Sonnet Apex</span><span className="text-emerald-400">74.1%</span></div>
                <div className="h-2 bg-slate-950 rounded overflow-hidden"><div className="h-full bg-purple-500" style={{ width: '74.1%' }} /></div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3 shadow-xl">
            <div className="text-[10px] uppercase font-bold text-slate-400">Tournament Governance & Integrity</div>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1"><span>Immutable Audit Trail:</span><strong className="text-emerald-400">Active (SHA-256)</strong></div>
              <div className="flex justify-between border-b border-slate-800 pb-1"><span>Constitution Validation:</span><strong className="text-emerald-400">100% Compliant</strong></div>
              <div className="flex justify-between border-b border-slate-800 pb-1"><span>Committee Signoff:</span><strong className="text-emerald-400">7 / 7 Unanimous</strong></div>
              <div className="flex justify-between"><span>Auto-Promotion Status:</span><strong className="text-amber-400">Ready for Live Capital</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
