import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  RefreshCcw, 
  Download, 
  Plus, 
  Sliders, 
  Search, 
  Filter, 
  Clock, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldAlert, 
  Lock, 
  Zap,
  Check,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Award,
  GitBranch,
  RotateCw,
  Eye,
  FileText,
  Layers,
  Network,
  ArrowLeft,
  CheckSquare,
  BarChart3,
  PieChart,
  Cpu,
  Globe,
  Server,
  Shield,
  Terminal,
  Settings,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AICommitteeProps {
  showToast: (msg: string) => void;
}

export const AICommitteeWorkspace: React.FC<AICommitteeProps> = ({ showToast }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'COMMITTEES' | 'MEMBERS' | 'MOTIONS' | 'DISCUSSION' | 'VOTING' | 'GRAPH' | 'AUDIT' | 'BENCHMARK'>('DASHBOARD');
  
  // Master-Detail Navigation States (Zero Popups)
  const [currentView, setCurrentView] = useState<'LIST' | 'COMMITTEE_PASSPORT' | 'MEMBER_PASSPORT' | 'MOTION_PASSPORT' | 'REPLAY'>('LIST');
  const [selectedCommittee, setSelectedCommittee] = useState<any | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [selectedMotion, setSelectedMotion] = useState<any | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('AI Committee Governance telemetry & quorum state refreshed.');
    }, 700);
  };

  const committees = [
    { id: 'COM-01', name: 'Research Committee', purpose: 'Ingestion & multi-source sentiment synthesis', owner: 'Research Engine', chair: 'Gemini 2.5 Pro', members: 6, quorum: '4/6', health: '99.8%', pendingMotions: 2, successRate: '96.4%', version: 'v3.2' },
    { id: 'COM-02', name: 'Decision Committee', purpose: 'Strategic alpha & signal generation review', owner: 'Central Brain', chair: 'GPT-4o', members: 7, quorum: '5/7', health: '99.5%', pendingMotions: 4, successRate: '94.2%', version: 'v3.1' },
    { id: 'COM-03', name: 'Risk Committee', purpose: 'Constitutional VaR & drawdown constraint guard', owner: 'Risk Management', chair: 'Claude 3.5 Sonnet', members: 5, quorum: '4/5', health: '100.0%', pendingMotions: 1, successRate: '98.9%', version: 'v3.4' },
    { id: 'COM-04', name: 'Execution Committee', purpose: 'DMA routing, slippage & pre-trade gates', owner: 'OMS Gateway', chair: 'DeepSeek R1', members: 6, quorum: '4/6', health: '99.1%', pendingMotions: 3, successRate: '92.5%', version: 'v3.0' },
    { id: 'COM-05', name: 'Memory & Learning Committee', purpose: 'Vector embeddings & weight feedback loops', owner: 'AI Memory Store', chair: 'Mistral Large 2', members: 4, quorum: '3/4', health: '98.9%', pendingMotions: 0, successRate: '97.1%', version: 'v2.8' },
    { id: 'COM-06', name: 'Lifecycle Committee', purpose: 'Position aging, rotation & sunset gating', owner: 'Lifecycle Manager', chair: 'Llama 3.3 70B', members: 5, quorum: '3/5', health: '99.4%', pendingMotions: 2, successRate: '95.0%', version: 'v3.1' },
    { id: 'COM-07', name: 'Constitution Committee', purpose: 'Rule compliance, article auditing & overrides', owner: 'Compliance Engine', chair: 'Grok 2', members: 4, quorum: '4/4', health: '100.0%', pendingMotions: 1, successRate: '99.5%', version: 'v4.0' },
    { id: 'COM-08', name: 'Analytics Committee', purpose: 'Multi-factor alpha & factor attribution score', owner: 'Analytics Engine', chair: 'Qwen 2.5 Max', members: 5, quorum: '3/5', health: '99.3%', pendingMotions: 2, successRate: '93.8%', version: 'v3.2' },
    { id: 'COM-09', name: 'Paper Trading Committee', purpose: 'Simulated execution validation & stress tests', owner: 'Paper OMS', chair: 'Gemini 2.5 Pro', members: 6, quorum: '4/6', health: '99.7%', pendingMotions: 1, successRate: '96.0%', version: 'v3.1' }
  ];

  const members = [
    { id: 'MEM-01', model: 'Google Gemini 2.5 Pro (v2.5)', contextTask: 'Swing Strategy Analysis & Quorum Participation', weight: '25%', confidence: '98.2%', votingPower: '1.5x', attendance: '100%', approvalPct: '94.0%', rejectionPct: '4.5%', conflictPct: '1.5%', status: 'ACTIVE' },
    { id: 'MEM-02', model: 'Anthropic Claude 3.5 Sonnet (v3.5)', contextTask: 'Options Gamma & Risk Evaluation', weight: '20%', confidence: '96.5%', votingPower: '1.2x', attendance: '99.1%', approvalPct: '91.2%', rejectionPct: '7.8%', conflictPct: '1.0%', status: 'ACTIVE' },
    { id: 'MEM-03', model: 'DeepSeek R1 (v1.0)', contextTask: 'Orderbook Imbalance Analysis', weight: '18%', confidence: '95.4%', votingPower: '1.1x', attendance: '98.5%', approvalPct: '95.1%', rejectionPct: '3.9%', conflictPct: '1.0%', status: 'ACTIVE' },
    { id: 'MEM-04', model: 'OpenAI GPT-4o (v4.0)', contextTask: 'Synthesis & Consensus Quorum', weight: '22%', confidence: '97.8%', votingPower: '1.4x', attendance: '100%', approvalPct: '93.5%', rejectionPct: '5.2%', conflictPct: '1.3%', status: 'ACTIVE' },
    { id: 'MEM-05', model: 'Meta Llama 3.3 70B (v3.3)', contextTask: 'Constitutional Compliance Verification', weight: '15%', confidence: '94.9%', votingPower: '1.0x', attendance: '97.8%', approvalPct: '88.4%', rejectionPct: '10.2%', conflictPct: '1.4%', status: 'ACTIVE' }
  ];

  const motions = [
    {
      id: 'MOT-412',
      created: '2026-08-02 10:42:01',
      author: 'Gemini 2.5 Pro',
      committee: 'Decision Committee',
      priority: 'HIGH',
      status: 'CONSENSUS_REACHED',
      risk: 'LOW (0.042% VaR)',
      deadline: '2026-08-02 12:00:00',
      currentVotes: '5/7 (Consensus)',
      proposal: 'Approve 15% equity reallocation toward banking cluster in NIFTY50 index',
      research: '15m Ascending Triangle breakout confirmed with +24,500 net bid volume imbalance.',
      supportingData: ['News sentiment: 84.2% positive', 'Crude oil spread futures stabilizing', 'FII net institutional inflows +₹1,420 Cr'],
      opposingData: ['Near-term IV skew on banking options calls for strict 0.9% hard stop loss'],
      constitutionValidation: { status: 'PASSED', violations: 0, warnings: 0, linkedRule: 'Article IV: Sector Concentration & VaR Limits' },
      riskReport: 'VaR impact is negligible (+0.004%). Expected return +12.2 bps.',
      decisionResult: 'APPROVED (5/7 Majority Support)',
      orderMapping: 'ORD-2026-8812 (DISPATCHED)',
      hash: '0x9a8f4c2e11d67098f4e21a89b76c5041'
    },
    {
      id: 'MOT-411',
      created: '2026-08-02 09:30:15',
      author: 'Claude 3.5 Sonnet',
      committee: 'Risk Committee',
      priority: 'CRITICAL',
      status: 'DEBATING',
      risk: 'MEDIUM',
      deadline: '2026-08-02 14:00:00',
      currentVotes: '2/5 (Deadlocked)',
      proposal: 'Increase max portfolio VaR tolerance from 1.8% to 2.0% during high volatility regimes',
      research: 'India VIX seasonal spikes require dynamic variance band widening to avoid false stop-outs.',
      supportingData: ['Backtest over 5 years shows +4.2% Sharpe ratio improvement'],
      opposingData: ['Exceeds default Article II capital preservation threshold; requires override vote'],
      constitutionValidation: { status: 'WARNING', violations: 0, warnings: 1, linkedRule: 'Article II: Maximum Allowable Drawdown' },
      riskReport: 'Drawdown potential increases by 1.2% under stressed market conditions.',
      decisionResult: 'PENDING QUORUM',
      orderMapping: 'NONE (Pre-Approval Stage)',
      hash: '0x3c2b1a9e8f7d6c5b4a3f2e1d0c9b8a7f'
    },
    {
      id: 'MOT-410',
      created: '2026-08-02 08:15:00',
      author: 'GPT-4o Enterprise',
      committee: 'Execution Committee',
      priority: 'HIGH',
      status: 'CONSENSUS_REACHED',
      risk: 'LOW',
      deadline: '2026-08-02 10:00:00',
      currentVotes: '6/6 (Unanimous)',
      proposal: 'Mandate 10% emergency stablecoin cash buffer for flash crash insulation',
      research: 'Simulated flash crash scenarios indicate instant liquidity availability prevents forced liquidation.',
      supportingData: ['100% test success in historical 2024 liquidity crunch replay'],
      opposingData: ['Opportunity cost of holding idle cash estimated at -15 bps annually'],
      constitutionValidation: { status: 'PASSED', violations: 0, warnings: 0, linkedRule: 'Article V: Liquidity Reserves & Capital Adequacy' },
      riskReport: 'Zero insolvency risk under black swan volatility scenarios.',
      decisionResult: 'APPROVED (Unanimous Quorum)',
      orderMapping: 'ORD-2026-8801 (EXECUTED)',
      hash: '0x112233445566778899aabbccddeeff00'
    }
  ];

  const liveDiscussionLog = [
    { id: 'd-1', model: 'Google Gemini 2.5 Pro (v2.5)', contextTask: 'Swing Strategy Analysis', time: '10:42:01', confidence: '98.2%', opinion: 'Bullish thesis confirmed on 15m Ascending Triangle breakout. Target ₹3,275 is mathematically supported by L2 orderbook buy wall.', article: 'Article IV (Alpha Generation)', vote: 'APPROVE' },
    { id: 'd-2', model: 'Anthropic Claude 3.5 Sonnet (v3.5)', contextTask: 'Options Gamma Review', time: '10:42:03', confidence: '95.4%', opinion: 'Concern about IV skew on near-term options expiry. Advise strict 0.9% hard stop loss to insulate against gamma spikes.', article: 'Article II (Risk Insulation)', vote: 'APPROVE' },
    { id: 'd-3', model: 'OpenAI GPT-4o (v4.0)', contextTask: 'Synthesis & Quorum Review', time: '10:42:06', confidence: '97.8%', opinion: 'Supports momentum thesis. Multi-factor alpha score 8.9/10 outweighs implied volatility risk when combined with FII net inflows.', article: 'Article I (Multi-Factor Quorum)', vote: 'APPROVE' },
    { id: 'd-4', model: 'DeepSeek R1 (v1.0)', contextTask: 'Scalper Evaluation', time: '10:42:08', confidence: '94.1%', opinion: 'Sub-second orderbook imbalance detected +24,500 net bid volume. Instantaneous buying pressure confirmed.', article: 'Article III (Execution Speed)', vote: 'APPROVE' },
    { id: 'd-5', model: 'Meta Llama 3.3 70B (v3.3)', contextTask: 'Constitutional Audit', time: '10:42:10', confidence: '94.9%', opinion: 'All constitutional checks passed with zero threshold violations. Approved for pre-trade dispatch.', article: 'Article VI (Compliance Audit)', vote: 'APPROVE' }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 text-slate-100 p-6 space-y-6 font-mono">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-emerald-400 font-bold uppercase">AI Intelligence</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-bold">AI Committee & Governance OS</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
              Enterprise Governance Operating System
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Constitutional Quorum Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Palantir-grade decentralized AI deliberation, quorum voting, constitutional validation, and audit trail ledger.
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh State</span>
          </button>

          <button
            onClick={() => showToast('New committee motion wizard initialized.')}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs rounded flex items-center gap-1.5 transition-colors font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Motion</span>
          </button>

          <button
            onClick={() => showToast('Committee minutes and immutable ledger exported.')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Audit</span>
          </button>
        </div>
      </div>

      {/* VIEW RENDERER SWITCHER (MASTER-DETAIL ZERO POPUPS) */}
      {currentView === 'LIST' && (
        <>
          {/* SECTION 1: EXECUTIVE GOVERNANCE DASHBOARD KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Committees</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase">9 ONLINE</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">9 Committees</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Constitutional quorum verified</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Motions</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase">DELIBERATING</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-400">16 Motions</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Avg approval time: 42s</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Consensus</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase">OPTIMAL</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-emerald-400">95.4%</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Confidence rating: 97.2%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Constitution Status</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-purple-500/10 text-purple-400 border-purple-500/20 uppercase">COMPLIANT</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-300">Article I-VI OK</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                  <span>Zero constitutional breaches</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABS NAVIGATION BAR */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
            {[
              { id: 'DASHBOARD', label: 'Executive Dashboard', icon: BarChart3 },
              { id: 'COMMITTEES', label: 'Committee Directory', icon: Users },
              { id: 'MEMBERS', label: 'AI Member Directory', icon: Cpu },
              { id: 'MOTIONS', label: 'Motion Center', icon: FileText },
              { id: 'DISCUSSION', label: 'Live AI Discussion', icon: MessageSquare },
              { id: 'VOTING', label: 'Voting Engine', icon: ShieldCheck },
              { id: 'GRAPH', label: 'Dependency Graph', icon: Network },
              { id: 'AUDIT', label: 'Audit Trail & Versioning', icon: Lock },
              { id: 'BENCHMARK', label: 'Benchmark & Analytics', icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded text-xs font-mono font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* SEARCH & FILTERS */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search committees, AI members, or motions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 text-[11px]">Filter:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONSENSUS_REACHED">Consensus Reached</option>
                <option value="DEBATING">Debating</option>
              </select>
            </div>
          </div>

          {/* TAB CONTENT VIEWS */}
          {activeTab === 'DASHBOARD' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Active Committee Health & Quorum Status
                </h3>
                <div className="space-y-3">
                  {committees.slice(0, 5).map(c => (
                    <div key={c.id} onClick={() => { setSelectedCommittee(c); setCurrentView('COMMITTEE_PASSPORT'); }} className="p-3 bg-slate-950 border border-slate-800 rounded hover:border-slate-700 cursor-pointer flex items-center justify-between">
                      <div>
                        <strong className="text-white block">{c.name}</strong>
                        <span className="text-[10px] text-slate-400">Chair: {c.chair} | Quorum: {c.quorum}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">{c.health}</span>
                        <span className="text-[10px] text-slate-500 block">Success: {c.successRate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Recent Constitutional Motions
                </h3>
                <div className="space-y-3">
                  {motions.map(m => (
                    <div key={m.id} onClick={() => { setSelectedMotion(m); setCurrentView('MOTION_PASSPORT'); }} className="p-3 bg-slate-950 border border-slate-800 rounded hover:border-slate-700 cursor-pointer space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-bold">{m.id}: {m.committee}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">{m.status}</span>
                      </div>
                      <p className="text-xs text-slate-200">{m.proposal}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>Author: {m.author}</span>
                        <span className="text-cyan-400 font-bold">Votes: {m.currentVotes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'COMMITTEES' && (
            <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Enterprise Committee Directory (Click Row for Committee Digital Passport)
                </h3>
                <span className="text-[10px] text-slate-400">{committees.length} Registered Committees</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                      <th className="p-3">Committee ID & Name</th>
                      <th className="p-3">Purpose</th>
                      <th className="p-3">Owner Service</th>
                      <th className="p-3">Chair AI Model</th>
                      <th className="p-3">Quorum</th>
                      <th className="p-3">Health</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {committees.map(c => (
                      <tr key={c.id} onClick={() => { setSelectedCommittee(c); setCurrentView('COMMITTEE_PASSPORT'); }} className="hover:bg-slate-950/60 cursor-pointer transition-colors">
                        <td className="p-3 font-bold text-white">
                          <span className="text-amber-400 mr-2">{c.id}</span> {c.name}
                        </td>
                        <td className="p-3 text-slate-300">{c.purpose}</td>
                        <td className="p-3 text-blue-400 font-mono">{c.owner}</td>
                        <td className="p-3 text-emerald-400">{c.chair}</td>
                        <td className="p-3 font-mono">{c.quorum}</td>
                        <td className="p-3 text-emerald-300 font-bold">{c.health}</td>
                        <td className="p-3 text-right">
                          <button className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold text-[10px]">
                            Open Passport →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'MEMBERS' && (
            <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  Enterprise AI Member Directory (Click for AI Model Passport)
                </h3>
                <span className="text-[10px] text-slate-400">{members.length} Active AI Members</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                      <th className="p-3">Model Name</th>
                      <th className="p-3">Temporary Task Context</th>
                      <th className="p-3">Weight</th>
                      <th className="p-3">Confidence</th>
                      <th className="p-3">Voting Power</th>
                      <th className="p-3">Approval %</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {members.map(m => (
                      <tr key={m.id} onClick={() => { setSelectedMember(m); setCurrentView('MEMBER_PASSPORT'); }} className="hover:bg-slate-950/60 cursor-pointer transition-colors">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          {m.model}
                        </td>
                        <td className="p-3 text-slate-300">{m.contextTask}</td>
                        <td className="p-3 text-amber-400 font-bold">{m.weight}</td>
                        <td className="p-3 text-cyan-400">{m.confidence}</td>
                        <td className="p-3 text-purple-300 font-mono">{m.votingPower}</td>
                        <td className="p-3 text-emerald-400 font-bold">{m.approvalPct}</td>
                        <td className="p-3 text-right">
                          <button className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded font-bold text-[10px]">
                            Model Passport →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'MOTIONS' && (
            <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Enterprise Motion Center (Click Motion for Proposal Passport)
                </h3>
                <span className="text-[10px] text-slate-400">{motions.length} Active Proposals</span>
              </div>

              <div className="space-y-3">
                {motions.map(m => (
                  <div key={m.id} onClick={() => { setSelectedMotion(m); setCurrentView('MOTION_PASSPORT'); }} className="p-4 bg-slate-950 border border-slate-800 rounded hover:border-slate-700 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 font-bold">{m.id}</span>
                        <span className="text-slate-400 text-[10px]">Created: {m.created}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold uppercase">{m.status}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{m.proposal}</h4>
                      <p className="text-slate-400 text-xs">Committee: <strong className="text-blue-400">{m.committee}</strong> | Author: {m.author} | Risk: {m.risk}</p>
                    </div>
                    <button className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded text-xs shrink-0">
                      Open Proposal Passport →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'DISCUSSION' && (
            <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Live Multi-AI Committee Deliberation Log
                </h3>
                <span className="text-[10px] text-blue-400">Verbatim Reasoning Stream</span>
              </div>

              <div className="space-y-3">
                {liveDiscussionLog.map(d => (
                  <div key={d.id} className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <strong className="text-white text-xs">{d.model}</strong>
                        <span className="text-slate-500 text-[10px]">({d.contextTask})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400 text-[10px]">Confidence: {d.confidence}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">{d.vote}</span>
                        <span className="text-slate-500 text-[10px]">{d.time}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 bg-slate-900/60 p-3 rounded border border-slate-800 font-sans">"{d.opinion}"</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Linked Rule: <strong className="text-purple-400">{d.article}</strong></span>
                      <span className="text-emerald-400">Constitutional Compliance Validated</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'VOTING' && (
            <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Voting Engine & Consensus Distribution Matrix
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <span className="text-slate-400 text-[10px] uppercase">Weighted Quorum Tally</span>
                  <div className="text-2xl font-bold text-emerald-400">85.7% Quorum</div>
                  <p className="text-xs text-slate-300">Supermajority threshold met (min 70% required for capital reallocation).</p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <span className="text-slate-400 text-[10px] uppercase">Consensus Dispersion</span>
                  <div className="text-2xl font-bold text-cyan-400">0.08 Variance</div>
                  <p className="text-xs text-slate-300">Extremely tight clustering across all 5 participating AI models.</p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <span className="text-slate-400 text-[10px] uppercase">Chair Override Status</span>
                  <div className="text-2xl font-bold text-amber-400">READY (Unused)</div>
                  <p className="text-xs text-slate-300">Gemini 2.5 Pro Chair override available for deadlocked motions.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'GRAPH' && (
            <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-400" />
                Enterprise Dependency & Knowledge Graph Connection Matrix
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['Decision Engine', 'Central Brain', 'AI Registry', 'AI Memory', 'AI Lifecycle', 'Research Feed', 'Strategy Builder', 'Analytics Engine', 'Knowledge Graph', 'Paper Trading OMS'].map((node, i) => (
                  <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded text-center space-y-1">
                    <Server className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <strong className="text-white text-xs block">{node}</strong>
                    <span className="text-emerald-400 text-[9px] block">SYNCED & ACTIVE</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                Immutable Audit Trail & Versioning Ledger
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                  <div>
                    <strong className="text-white">Version v3.2 (Current Active State)</strong>
                    <span className="text-slate-400 block text-[10px]">Modified by: Compliance Guardian AI (2026-08-02 10:42:15)</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-bold">VERIFIED HASH</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                  <div>
                    <strong className="text-white">Version v3.1</strong>
                    <span className="text-slate-400 block text-[10px]">Modified by: OpenAI GPT-4o (v3.2) (2026-08-01 14:20:00)</span>
                  </div>
                  <button onClick={() => showToast('Rolled back committee policy to v3.1 successfully.')} className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold text-[10px]">Rollback</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'BENCHMARK' && (
            <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Committee Performance & Benchmark Rankings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-slate-500 uppercase text-[10px]">Fastest Committee</span>
                  <strong className="text-white text-base block">Execution Committee (45ms latency)</strong>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-slate-500 uppercase text-[10px]">Highest Consensus</span>
                  <strong className="text-emerald-400 text-base block">Risk Committee (99.5% agreement)</strong>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-slate-500 uppercase text-[10px]">Lowest Risk Profile</span>
                  <strong className="text-purple-300 text-base block">Constitution Committee (0.01% VaR impact)</strong>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MASTER-DETAIL: COMMITTEE DIGITAL PASSPORT */}
      {currentView === 'COMMITTEE_PASSPORT' && selectedCommittee && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentView('LIST')} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-amber-400 font-mono text-xs uppercase font-bold">Committee Digital Passport</span>
                <h2 className="text-lg font-bold text-white">{selectedCommittee.id}: {selectedCommittee.name}</h2>
              </div>
            </div>
            <button onClick={() => setCurrentView('LIST')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs">
              ← Return to Committee Directory
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 text-[10px] uppercase">Purpose</span>
              <strong className="text-white text-xs block mt-1">{selectedCommittee.purpose}</strong>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 text-[10px] uppercase">Owner Service</span>
              <strong className="text-blue-400 text-xs block mt-1">{selectedCommittee.owner}</strong>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 text-[10px] uppercase">Chair AI</span>
              <strong className="text-emerald-400 text-xs block mt-1">{selectedCommittee.chair}</strong>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 text-[10px] uppercase">Committee Health</span>
              <strong className="text-emerald-300 text-xs block mt-1">{selectedCommittee.health}</strong>
            </div>
          </div>

          <div className="p-5 bg-slate-950 border border-slate-800 rounded space-y-3">
            <h3 className="font-bold text-amber-400 uppercase text-xs">Constitutional Rules & Active Quorum Parameters</h3>
            <p className="text-slate-300 text-xs">This committee operates under stringent decentralized quorum rules requiring a minimum 70% weighted agreement score and mandatory pre-trade risk validation.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => showToast('Committee constitution parameters audited.')} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-bold text-xs">
                Audit Constitution
              </button>
              <button onClick={() => showToast('Committee performance history exported.')} className="px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded font-bold text-xs">
                Export Meeting History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MASTER-DETAIL: AI MODEL PASSPORT */}
      {currentView === 'MEMBER_PASSPORT' && selectedMember && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentView('LIST')} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-blue-400 font-mono text-xs uppercase font-bold">AI Model Passport</span>
                <h2 className="text-lg font-bold text-white">{selectedMember.model}</h2>
              </div>
            </div>
            <button onClick={() => setCurrentView('LIST')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold rounded text-xs">
              ← Return to Member Directory
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 text-[10px] uppercase">Task Context</span>
              <strong className="text-white text-xs block mt-1">{selectedMember.contextTask}</strong>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 text-[10px] uppercase">Voting Weight</span>
              <strong className="text-amber-400 text-xs block mt-1">{selectedMember.weight}</strong>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 text-[10px] uppercase">Confidence Score</span>
              <strong className="text-cyan-400 text-xs block mt-1">{selectedMember.confidence}</strong>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 text-[10px] uppercase">Approval Rate</span>
              <strong className="text-emerald-400 text-xs block mt-1">{selectedMember.approvalPct}</strong>
            </div>
          </div>
        </div>
      )}

      {/* MASTER-DETAIL: PROPOSAL PASSPORT */}
      {currentView === 'MOTION_PASSPORT' && selectedMotion && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentView('LIST')} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-amber-400 font-mono text-xs uppercase font-bold">Proposal Passport: {selectedMotion.id}</span>
                <h2 className="text-lg font-bold text-white">{selectedMotion.proposal}</h2>
              </div>
            </div>
            <button onClick={() => setCurrentView('LIST')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs">
              ← Return to Motion Center
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded space-y-3">
              <h3 className="font-bold text-amber-400 uppercase text-xs">Research & Supporting Evidence</h3>
              <p className="text-slate-200 text-xs">{selectedMotion.research}</p>
              <div className="space-y-1 pt-2">
                <span className="text-slate-400 text-[10px] uppercase">Supporting Data Points:</span>
                {selectedMotion.supportingData.map((d, i) => (
                  <div key={i} className="text-xs text-emerald-400 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" /> {d}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded space-y-3">
              <h3 className="font-bold text-purple-400 uppercase text-xs">Constitution Validation & Risk</h3>
              <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase">Linked Rule:</span>
                <strong className="text-purple-300 text-xs block">{selectedMotion.constitutionValidation.linkedRule}</strong>
              </div>
              <p className="text-slate-300 text-xs">{selectedMotion.riskReport}</p>
              <div className="pt-2 flex gap-2">
                <button onClick={() => showToast('Proposal replay simulation initialized.')} className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded text-xs">
                  Replay Decision Flow
                </button>
                <button onClick={() => showToast('Proposal audit hash verified against immutable ledger.')} className="px-3 py-1.5 bg-slate-800 text-slate-200 rounded text-xs">
                  Verify Audit Hash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
