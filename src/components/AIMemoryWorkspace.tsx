import React, { useState, useMemo } from 'react';
import {
  Brain,
  Database,
  ShieldCheck,
  RefreshCcw,
  Download,
  Search,
  ChevronRight,
  X,
  AlertTriangle,
  Lock,
  Zap,
  Cpu,
  Play,
  Pause,
  Terminal,
  Sparkles,
  FileCheck,
  Crown,
  Compass,
  Network,
  Scale,
  GitBranch,
  Binary,
  CornerDownRight,
  Info,
  CheckCircle2
} from 'lucide-react';

export interface AIMemoryWorkspaceProps {
  showToast?: (msg: string) => void;
}

// ==========================================
// TYPES & TYPESAFE DATA STRUCTURES
// ==========================================

export type AmosWorkspaceTab =
  | 'EXECUTIVE_OVERVIEW'
  | 'WORKING_MEMORY'
  | 'LONG_TERM_MEMORY'
  | 'DECISION_MEMORY'
  | 'PATTERN_INTELLIGENCE_V2'
  | 'VECTOR_ENGINE_V2'
  | 'KNOWLEDGE_GRAPH_V2'
  | 'CONSOLIDATION_ENGINE_V2'
  | 'RAG_RETRIEVAL_V2'
  | 'MEMORY_GOVERNANCE_V2';

// Working Memory Data Structures (Volatile RAM)
export interface WorkingMemoryItem {
  id: string;
  model: string;
  provider: string;
  version: string;
  sourceModule: string;
  threadId: string;
  tokenUsage: number;
  maxTokens: number;
  decaySeconds: number;
  attentionWeight: number; // 0.00 - 1.00
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  activePromptSummary: string;
  rawBufferSnippet: string;
  createdTime: string;
  status: 'HOT_RAM' | 'SWAPPING' | 'EPHEMERAL';
  temporaryObjects: string[];
}

// Long-Term Memory Data Structures (Durable Persistent Vault)
export interface LongTermMemoryItem {
  id: string;
  category: 'STRATEGIC_MODEL' | 'EXCHANGE_TELEMETRY' | 'RISK_CONSTITUTION' | 'HISTORICAL_REGIME';
  title: string;
  sourceModel: string;
  provider: string;
  version: string;
  sourceModule: string;
  importanceScore: number; // 0-100
  recallFreqHz: number;
  ageDays: number;
  growthPct: number;
  compressionRatio: string;
  sourceTrustScore: number;
  lastAccessed: string;
  reinforcementCount: number;
  originProvenance: string;
  summary: string;
  businessImpact: string;
  isPinned: boolean;
  linkedDecisions: string[];
  lineageParentId?: string;
  integrityStatus: 'VERIFIED_HASH' | 'AUDITED' | 'ENCRYPTED';
}

// Decision Memory Data Structures (Historical Decision Store)
export interface DecisionMemoryItem {
  id: string;
  decisionId: string;
  symbol: string;
  aiModel: string;
  provider: string;
  version: string;
  sourceModule: string;
  voteAction: 'BUY' | 'SELL' | 'HOLD' | 'REJECT';
  promptInputs: string;
  modelThoughtProcess: string;
  voteConsensusPct: number;
  committeeVotes: { model: string; vote: string; weight: number }[];
  realizedOutcome: 'WIN (+4.2%)' | 'WIN (+2.8%)' | 'LOSS (-0.8%)' | 'EXPIRED';
  profitAttributionUsd: number;
  explainabilityScore: number; // 0-100
  postTradeAnalysis: string;
  rewardSignalDelta: number;
  timestamp: string;
  provenance: string;
  auditReference: string;
}

// ==========================================
// CANONICAL INITIAL DATA (V1 CORE)
// ==========================================

const INITIAL_WORKING_MEMORY: WorkingMemoryItem[] = [
  {
    id: 'WM-801',
    model: 'GPT-4o',
    provider: 'OpenAI',
    version: 'v4o-2026',
    sourceModule: 'Analytics Engine',
    threadId: 'TH-2026-901A',
    tokenUsage: 142500,
    maxTokens: 200000,
    decaySeconds: 42,
    attentionWeight: 0.98,
    priority: 'CRITICAL',
    activePromptSummary: 'NIFTY 22400CE Order Book Imbalance Analysis & Volatility Breakout Check',
    rawBufferSnippet: 'Bid/Ask Ratio = 1.42. Cumulative delta volume +14,200 contracts. VaR ceiling 0.038%.',
    createdTime: '10:48:10',
    status: 'HOT_RAM',
    temporaryObjects: ['l2_depth_matrix_v2', 'delta_skew_cache', 'var_calc_temp']
  },
  {
    id: 'WM-802',
    model: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    version: 'v3.5-prod',
    sourceModule: 'Risk Management',
    threadId: 'TH-2026-901B',
    tokenUsage: 98000,
    maxTokens: 200000,
    decaySeconds: 110,
    attentionWeight: 0.95,
    priority: 'HIGH',
    activePromptSummary: 'Sector Risk Correlation & Macro VIX Threshold Evaluation',
    rawBufferSnippet: 'Sector correlation overlap = 0.12. Max sector capacity 35.0%. Stop envelope 1.2x ATR.',
    createdTime: '10:47:55',
    status: 'HOT_RAM',
    temporaryObjects: ['sector_corr_vector', 'atr_envelope_temp']
  },
  {
    id: 'WM-803',
    model: 'DeepSeek R1',
    provider: 'DeepSeek',
    version: 'v1.2-prod',
    sourceModule: 'Execution OMS',
    threadId: 'TH-2026-901C',
    tokenUsage: 185000,
    maxTokens: 200000,
    decaySeconds: 15,
    attentionWeight: 0.99,
    priority: 'CRITICAL',
    activePromptSummary: 'Options Gamma Squeeze & Theta Decay Curve Calculation',
    rawBufferSnippet: 'Gamma expansion velocity +0.042/min. Implied volatility skew skewed heavily to calls.',
    createdTime: '10:48:12',
    status: 'HOT_RAM',
    temporaryObjects: ['gamma_velocity_array', 'iv_skew_matrix']
  },
  {
    id: 'WM-804',
    model: 'Gemini 2.5 Pro',
    provider: 'Google DeepMind',
    version: 'v2.5-prod',
    sourceModule: 'Research Engine',
    threadId: 'TH-2026-901D',
    tokenUsage: 45000,
    maxTokens: 200000,
    decaySeconds: 240,
    attentionWeight: 0.88,
    priority: 'NORMAL',
    activePromptSummary: 'Central Bank Rate Decision Ingestion & Macro Corpus Synthesis',
    rawBufferSnippet: 'NLP sentiment corpus score +88/100. News stream blackout trigger disarmed.',
    createdTime: '10:45:00',
    status: 'EPHEMERAL',
    temporaryObjects: ['nlp_token_stream']
  }
];

const INITIAL_LONG_TERM_MEMORY: LongTermMemoryItem[] = [
  {
    id: 'LTM-1001',
    category: 'STRATEGIC_MODEL',
    title: 'Macro Rate Sensitivity & Sector Rotation Model',
    sourceModel: 'Gemini 2.5 Pro',
    provider: 'Google DeepMind',
    version: 'v2.5-prod',
    sourceModule: 'Research Engine',
    importanceScore: 98,
    recallFreqHz: 94.2,
    ageDays: 142,
    growthPct: 18.4,
    compressionRatio: '42:1',
    sourceTrustScore: 99.8,
    lastAccessed: '10:48:00',
    reinforcementCount: 1420,
    originProvenance: 'Q2-Q3 Institutional Macro Telemetry Corpus',
    summary: 'Defines sector rotation shifts during central bank interest rate inflection cycles.',
    businessImpact: 'Prevents misallocation in rate-sensitive banking and real estate sectors.',
    isPinned: true,
    linkedDecisions: ['DEC-2026-901', 'DEC-2026-880'],
    lineageParentId: 'LTM-ROOT-MACRO',
    integrityStatus: 'VERIFIED_HASH'
  },
  {
    id: 'LTM-1002',
    category: 'EXCHANGE_TELEMETRY',
    title: 'India VIX Spike Arbitrage Spread Tolerance',
    sourceModel: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    version: 'v3.5-prod',
    sourceModule: 'Risk Management',
    importanceScore: 96,
    recallFreqHz: 88.7,
    ageDays: 89,
    growthPct: 12.1,
    compressionRatio: '38:1',
    sourceTrustScore: 99.4,
    lastAccessed: '10:42:15',
    reinforcementCount: 890,
    originProvenance: 'Live L3 Exchange Execution Logs 2026',
    summary: 'Optimal execution spread parameters during rapid VIX expansion (>18.0).',
    businessImpact: 'Protects against slippage up to $500,000 order size.',
    isPinned: true,
    linkedDecisions: ['DEC-2026-890'],
    lineageParentId: 'LTM-ROOT-VOL',
    integrityStatus: 'VERIFIED_HASH'
  },
  {
    id: 'LTM-1003',
    category: 'RISK_CONSTITUTION',
    title: 'Intraday Block Trade Imbalance Decay Curve',
    sourceModel: 'DeepSeek R1',
    provider: 'DeepSeek',
    version: 'v1.2-prod',
    sourceModule: 'Analytics Engine',
    importanceScore: 89,
    recallFreqHz: 64.5,
    ageDays: 45,
    growthPct: 8.5,
    compressionRatio: '31:1',
    sourceTrustScore: 98.9,
    lastAccessed: '10:15:22',
    reinforcementCount: 450,
    originProvenance: 'High-Frequency Order Book Stream Analyzer',
    summary: 'Quantifies decay time of institutional buy imbalance in top 50 equities.',
    businessImpact: 'Ensures optimal entry timing within 3-minute execution windows.',
    isPinned: false,
    linkedDecisions: ['DEC-2026-842'],
    lineageParentId: 'LTM-ROOT-ORDERBOOK',
    integrityStatus: 'AUDITED'
  }
];

const INITIAL_DECISION_MEMORY: DecisionMemoryItem[] = [
  {
    id: 'DM-901',
    decisionId: 'DEC-2026-901',
    symbol: 'NIFTY26JUL22400CE',
    aiModel: 'GPT-4o',
    provider: 'OpenAI',
    version: 'v4o-2026',
    sourceModule: 'Decision Engine',
    voteAction: 'BUY',
    promptInputs: 'NIFTY 22400CE breakout above VWAP with L2 volume surge',
    modelThoughtProcess: 'Evaluated L2 book depth (+42% bid), VaR 0.038%, R:R ratio 3.79:1. Unanimous 68.2% quorum pass.',
    voteConsensusPct: 68.2,
    committeeVotes: [
      { model: 'GPT-4o', vote: 'BUY', weight: 1.85 },
      { model: 'Claude 3.5 Sonnet', vote: 'BUY', weight: 1.60 },
      { model: 'DeepSeek R1', vote: 'BUY', weight: 1.40 }
    ],
    realizedOutcome: 'WIN (+4.2%)',
    profitAttributionUsd: 14250,
    explainabilityScore: 98,
    postTradeAnalysis: 'Trade hit Target 1 within 18 minutes. Zero slippage recorded.',
    rewardSignalDelta: +0.082,
    timestamp: '10:48:12',
    provenance: 'Decision Committee Quorum #412',
    auditReference: 'AUD-DEC-2026-901'
  },
  {
    id: 'DM-890',
    decisionId: 'DEC-2026-890',
    symbol: 'RELIANCE26JUL2900CE',
    aiModel: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    version: 'v3.5-prod',
    sourceModule: 'Risk Management',
    voteAction: 'BUY',
    promptInputs: 'Breakout above key resistance level 2,880',
    modelThoughtProcess: 'Confirmed momentum vector alignment across 15m/1h timeframes.',
    voteConsensusPct: 74.5,
    committeeVotes: [
      { model: 'Claude 3.5 Sonnet', vote: 'BUY', weight: 1.60 },
      { model: 'Gemini 2.5 Pro', vote: 'BUY', weight: 1.50 }
    ],
    realizedOutcome: 'WIN (+2.8%)',
    profitAttributionUsd: 8900,
    explainabilityScore: 95,
    postTradeAnalysis: 'Trailing stop locked profit at 2.8% return.',
    rewardSignalDelta: +0.054,
    timestamp: '10:12:00',
    provenance: 'Risk Committee Approval #388',
    auditReference: 'AUD-DEC-2026-890'
  },
  {
    id: 'DM-842',
    decisionId: 'DEC-2026-842',
    symbol: 'BANKNIFTY26JUL48000PE',
    aiModel: 'DeepSeek R1',
    provider: 'DeepSeek',
    version: 'v1.2-prod',
    sourceModule: 'Execution OMS',
    voteAction: 'REJECT',
    promptInputs: 'Short hedge candidate during market pullback',
    modelThoughtProcess: 'Risk-reward ratio 1.08:1 failed Article III requirement (>= 2.5:1).',
    voteConsensusPct: 12.0,
    committeeVotes: [
      { model: 'DeepSeek R1', vote: 'REJECT', weight: 1.40 },
      { model: 'GPT-4o', vote: 'REJECT', weight: 1.85 }
    ],
    realizedOutcome: 'EXPIRED',
    profitAttributionUsd: 0,
    explainabilityScore: 99,
    postTradeAnalysis: 'Rejection saved estimated 1.8% drawdown.',
    rewardSignalDelta: +0.095,
    timestamp: '09:15:10',
    provenance: 'Constitution Guard VETO #104',
    auditReference: 'AUD-DEC-2026-842'
  }
];

// ==========================================
// V2 RESERVED WORKSPACE UI CARD
// ==========================================

const V2ReservedWorkspaceCard: React.FC<{
  tabNumber: string;
  title: string;
  reservedCapabilities: string[];
}> = ({ tabNumber, title, reservedCapabilities }) => (
  <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg space-y-4 shadow-xl font-mono">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">{tabNumber}. {title}</h3>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-bold rounded uppercase">
              V2 — FUTURE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Architecturally reserved for AI ARINA OS V2 release.</p>
        </div>
      </div>
      <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
        <span className="text-xs font-bold text-amber-400 uppercase">NO CURRENT V2 DATA</span>
      </div>
    </div>

    <div className="space-y-3">
      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <Lock className="w-3.5 h-3.5 text-slate-500" /> Reserved Capability Specification (V2)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {reservedCapabilities.map((cap, idx) => (
          <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded flex items-center gap-2.5 text-[11px] text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>{cap}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded flex items-center justify-between text-[10px] text-slate-500">
      <span>AI ARINA OS V1 Runtime Boundary Enforced</span>
      <span className="text-slate-400 font-mono">No Mock Data / No Execution</span>
    </div>
  </div>
);

// ==========================================
// MAIN COMPONENT DEFINITION
// ==========================================

export const AIMemoryWorkspace: React.FC<AIMemoryWorkspaceProps> = ({ showToast }) => {
  // Navigation State across exact 10 AMOS Workspaces
  const [activeTab, setActiveTab] = useState<AmosWorkspaceTab>('EXECUTIVE_OVERVIEW');
  const [memoryRuntimeStatus, setMemoryRuntimeStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');

  // V1 Core State Management
  const [workingMemory, setWorkingMemory] = useState<WorkingMemoryItem[]>(INITIAL_WORKING_MEMORY);
  const [longTermMemory, setLongTermMemory] = useState<LongTermMemoryItem[]>(INITIAL_LONG_TERM_MEMORY);
  const [decisionMemory] = useState<DecisionMemoryItem[]>(INITIAL_DECISION_MEMORY);

  // Modal & Inspector States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmedToggle, setResetConfirmedToggle] = useState(false);
  const [selectedLongTerm, setSelectedLongTerm] = useState<LongTermMemoryItem | null>(null);
  const [showLongTermInspector, setShowLongTermInspector] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Decision Comparison Replay State
  const [compareDecisionA] = useState<DecisionMemoryItem | null>(INITIAL_DECISION_MEMORY[0] || null);
  const [compareDecisionB] = useState<DecisionMemoryItem | null>(INITIAL_DECISION_MEMORY[1] || null);

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
  };

  // Module-Local RESET Handling
  const handleExecuteReset = () => {
    if (!resetConfirmedToggle) return;
    setWorkingMemory([]);
    setShowResetModal(false);
    setResetConfirmedToggle(false);
    notify('[01 RESET] Volatile Working Memory cleared. Long-Term Vault and Decision Memory preserved intact.');
  };

  const handleTogglePinLongTerm = (id: string) => {
    setLongTermMemory(prev => prev.map(m => m.id === id ? { ...m, isPinned: !m.isPinned } : m));
    notify(`Long-Term Memory ${id} pin status updated.`);
  };

  // Filtered Long-Term Memories
  const filteredLongTerm = useMemo(() => {
    return longTermMemory.filter(m => {
      const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || m.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [longTermMemory, searchQuery, categoryFilter]);

  const totalRecordsCount = workingMemory.length + longTermMemory.length + decisionMemory.length;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 text-slate-100 p-4 lg:p-6 space-y-6 font-mono text-xs">
      
      {/* ========================================================== */}
      {/* GLOBAL HEADER: ENTERPRISE AI MEMORY OPERATING SYSTEM       */}
      {/* ========================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-amber-400" /> AI ARINA MEMORY OS
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold uppercase tracking-wider">Enterprise Cognitive Memory Engine V1</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg lg:text-xl font-bold font-mono tracking-tight text-white uppercase flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              AI Memory Workspace
            </h1>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 border ${
              memoryRuntimeStatus === 'ACTIVE'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${memoryRuntimeStatus === 'ACTIVE' ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
              RUNNING STATUS: {memoryRuntimeStatus}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Persistent, working, and historical decision memory store powering AI model context and auditability.
          </p>
        </div>

        {/* MODULE-LOCAL CONTROLS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 01 RESET */}
          <button
            onClick={() => {
              setResetConfirmedToggle(false);
              setShowResetModal(true);
            }}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold rounded flex items-center gap-1.5 transition-colors text-[10px] cursor-pointer"
            title="Module-Local Control: Reset AI Memory Working State"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>01 RESET</span>
          </button>

          {/* 02 ON */}
          <button
            onClick={() => {
              setMemoryRuntimeStatus('ACTIVE');
              notify('[02 ON] AI Memory runtime processing started.');
            }}
            disabled={memoryRuntimeStatus === 'ACTIVE'}
            className={`px-3 py-1.5 font-bold rounded flex items-center gap-1.5 transition-colors text-[10px] cursor-pointer ${
              memoryRuntimeStatus === 'ACTIVE'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-slate-950 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
            title="Module-Local Control: Start Memory Workers"
          >
            <Play className="w-3.5 h-3.5" />
            <span>02 ON</span>
          </button>

          {/* 03 OFF */}
          <button
            onClick={() => {
              setMemoryRuntimeStatus('PAUSED');
              notify('[03 OFF] AI Memory runtime processing paused.');
            }}
            disabled={memoryRuntimeStatus === 'PAUSED'}
            className={`px-3 py-1.5 font-bold rounded flex items-center gap-1.5 transition-colors text-[10px] cursor-pointer ${
              memoryRuntimeStatus === 'PAUSED'
                ? 'bg-rose-500 text-slate-950 font-black'
                : 'bg-slate-950 hover:bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
            title="Module-Local Control: Pause Memory Workers"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>03 OFF</span>
          </button>

          <button
            onClick={() => {
              const exportData = JSON.stringify({ workingMemory, longTermMemory, decisionMemory }, null, 2);
              const blob = new Blob([exportData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `ai-memory-export-${Date.now()}.json`;
              a.click();
              notify('AI Memory export download initiated.');
            }}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded flex items-center gap-1.5 transition-colors text-[10px]"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Memory Dump</span>
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* WORKSPACE NAVIGATION BAR (EXACT 10 WORKSPACES)             */}
      {/* ========================================================== */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border border-slate-800 p-2 rounded-lg flex flex-wrap gap-1.5 overflow-x-auto text-[10px] font-bold shadow-xl shrink-0 min-h-[50px] items-center">
        {[
          { id: 'EXECUTIVE_OVERVIEW', label: '01 Executive Overview', icon: Crown, v2: false },
          { id: 'WORKING_MEMORY', label: '02 Working Memory (RAM)', icon: Zap, v2: false },
          { id: 'LONG_TERM_MEMORY', label: '03 Long-Term Vault', icon: Database, v2: false },
          { id: 'DECISION_MEMORY', label: '04 Decision Memory', icon: FileCheck, v2: false },
          { id: 'PATTERN_INTELLIGENCE_V2', label: '05 Pattern Intelligence — V2', icon: Compass, v2: true },
          { id: 'VECTOR_ENGINE_V2', label: '06 Vector Engine — V2', icon: Binary, v2: true },
          { id: 'KNOWLEDGE_GRAPH_V2', label: '07 Knowledge Graph — V2', icon: Network, v2: true },
          { id: 'CONSOLIDATION_ENGINE_V2', label: '08 Consolidation Engine — V2', icon: GitBranch, v2: true },
          { id: 'RAG_RETRIEVAL_V2', label: '09 RAG Retrieval Sandbox — V2', icon: Search, v2: true },
          { id: 'MEMORY_GOVERNANCE_V2', label: '10 Memory Governance — V2', icon: Scale, v2: true }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg scale-[1.02]' 
                  : tab.v2 
                    ? 'bg-slate-950 text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 border border-slate-800/80'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.v2 && <span className="px-1 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[8px] rounded">V2</span>}
            </button>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* 01 EXECUTIVE OVERVIEW                                      */}
      {/* ========================================================== */}
      {activeTab === 'EXECUTIVE_OVERVIEW' && (
        <div className="space-y-6">
          {totalRecordsCount === 0 ? (
            <div className="p-8 bg-slate-900 border border-amber-500/30 rounded-lg text-center space-y-2">
              <Info className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-sm font-bold text-white uppercase">NO CURRENT DATA</h3>
              <p className="text-xs text-slate-400">All memory stores are currently unpopulated.</p>
            </div>
          ) : (
            <>
              {/* REAL DATA KPIS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {[
                  { label: 'Total Memory Records', value: `${totalRecordsCount} Records`, sub: 'Combined Storage', color: 'text-amber-400', border: 'border-amber-500/40' },
                  { label: 'Working RAM Status', value: `${workingMemory.length} Buffers`, sub: memoryRuntimeStatus === 'ACTIVE' ? 'Active Ingest' : 'Paused', color: 'text-emerald-400', border: 'border-emerald-500/40' },
                  { label: 'Long-Term Vault', value: `${longTermMemory.length} Persisted`, sub: 'Durable Knowledge', color: 'text-blue-400', border: 'border-blue-500/40' },
                  { label: 'Decision Memory', value: `${decisionMemory.length} Records`, sub: 'Audited Decisions', color: 'text-purple-400', border: 'border-purple-500/40' },
                  { label: 'Storage Health', value: '100% HEALTHY', sub: 'Zero Faults', color: 'text-emerald-300', border: 'border-emerald-500/40' },
                  { label: 'Runtime Mode', value: memoryRuntimeStatus, sub: 'Module Local', color: 'text-amber-300', border: 'border-amber-500/40' }
                ].map((kpi, idx) => (
                  <div key={idx} className={`p-3 bg-slate-900 border ${kpi.border} rounded-lg space-y-1 shadow-lg`}>
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">{kpi.label}</span>
                    <span className={`text-sm font-bold font-mono ${kpi.color} block`}>{kpi.value}</span>
                    <span className="text-[9px] text-slate-400 block">{kpi.sub}</span>
                  </div>
                ))}
              </div>

              {/* ARCHITECTURE OVERVIEW CARDS */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-white">Operational AI Memory Tiers (V1 Scope)</h2>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">Read-Only Aggregation</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: '02 Working Memory (RAM)',
                      desc: 'Volatile high-speed RAM context used during live inference and active prompt sessions.',
                      count: `${workingMemory.length} Active Buffers`,
                      color: 'border-amber-500/40 text-amber-300 bg-amber-500/10'
                    },
                    {
                      title: '03 Long-Term Vault',
                      desc: 'Persistent semantic store containing macro models, market regime templates, and constitutional rules.',
                      count: `${longTermMemory.length} Stored Records`,
                      color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                    },
                    {
                      title: '04 Decision Memory',
                      desc: 'Historical decision archive preserving exact model inputs, outputs, committee votes, and profit attribution.',
                      count: `${decisionMemory.length} Decision Logs`,
                      color: 'border-purple-500/40 text-purple-300 bg-purple-500/10'
                    }
                  ].map((card, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${card.color.split(' ')[0]} bg-slate-950 space-y-2 flex flex-col justify-between`}>
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-white">{card.title}</h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{card.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${card.color}`}>
                          {card.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CANONICAL AI MODEL MEMORY BINDING TABLE */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-400" /> Canonical AI Model Memory Usage
                  </h3>
                  <span className="text-[10px] text-slate-400">Canonical Registry Bindings</span>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded">
                  <table className="w-full text-left border-collapse text-[11px] font-mono">
                    <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[10px]">
                      <tr>
                        <th className="p-2.5">Canonical AI Model</th>
                        <th className="p-2.5">Provider</th>
                        <th className="p-2.5">Exact Version</th>
                        <th className="p-2.5">Working RAM Tokens</th>
                        <th className="p-2.5">Long-Term Links</th>
                        <th className="p-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {[
                        { model: 'GPT-4o', provider: 'OpenAI', version: 'v4o-2026', tokens: '142,500 / 200,000', links: '420 Nodes', status: 'HOT RAM' },
                        { model: 'Claude 3.5 Sonnet', provider: 'Anthropic', version: 'v3.5-prod', tokens: '98,000 / 200,000', links: '380 Nodes', status: 'HOT RAM' },
                        { model: 'DeepSeek R1', provider: 'DeepSeek', version: 'v1.2-prod', tokens: '185,000 / 200,000', links: '510 Nodes', status: 'HOT RAM' },
                        { model: 'Gemini 2.5 Pro', provider: 'Google DeepMind', version: 'v2.5-prod', tokens: '45,000 / 200,000', links: '290 Nodes', status: 'EPHEMERAL' }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50">
                          <td className="p-2.5 font-bold text-white">{row.model}</td>
                          <td className="p-2.5 text-slate-400">{row.provider}</td>
                          <td className="p-2.5 text-amber-300 font-mono">{row.version}</td>
                          <td className="p-2.5 text-amber-400 font-bold">{row.tokens}</td>
                          <td className="p-2.5 text-purple-300">{row.links}</td>
                          <td className="p-2.5 text-right">
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-bold">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* 02 WORKING MEMORY (RAM)                                    */}
      {/* ========================================================== */}
      {activeTab === 'WORKING_MEMORY' && (
        <div className="space-y-6">
          {workingMemory.length === 0 ? (
            <div className="p-12 bg-slate-900 border border-amber-500/30 rounded-lg text-center space-y-3">
              <Zap className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">NO CURRENT WORKING MEMORY</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Volatile RAM context buffers are currently clear. Active AI inference threads will populate temporary working memory items.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" /> Live Working Context Session Buffers (Volatile RAM)
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold">{workingMemory.length} Active Buffers</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workingMemory.map((wm) => (
                  <div key={wm.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{wm.model}</span>
                          <span className="text-[9px] text-slate-400 font-mono">({wm.provider} • {wm.version})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Module: <strong className="text-amber-300">{wm.sourceModule}</strong> • Priority: <strong className="text-rose-400">{wm.priority}</strong>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold">
                        {wm.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span>Tokens: <strong>{wm.tokenUsage.toLocaleString()} / {wm.maxTokens.toLocaleString()}</strong></span>
                        <span className="text-purple-300 font-bold">Expiry TTL: {wm.decaySeconds}s</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                        <div className="bg-amber-400 h-full" style={{ width: `${(wm.tokenUsage / wm.maxTokens) * 100}%` }} />
                      </div>
                    </div>

                    <div className="p-2 bg-slate-900 border border-slate-800 rounded space-y-1 text-[10px]">
                      <span className="text-amber-400 font-bold uppercase block">Current Active Focus:</span>
                      <p className="text-slate-200">{wm.activePromptSummary}</p>
                    </div>

                    <div className="p-2 bg-black border border-slate-800 rounded space-y-1 text-[10px] text-emerald-400 font-mono">
                      <span className="text-slate-500 block uppercase font-bold text-[8px]">RAM Buffer Snippet:</span>
                      <code>{wm.rawBufferSnippet}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* 03 LONG-TERM VAULT                                         */}
      {/* ========================================================== */}
      {activeTab === 'LONG_TERM_MEMORY' && (
        <div className="space-y-6">
          {longTermMemory.length === 0 ? (
            <div className="p-12 bg-slate-900 border border-amber-500/30 rounded-lg text-center space-y-3">
              <Database className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">NO CURRENT LONG-TERM MEMORY</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                The persistent Long-Term Knowledge Vault is currently empty.
              </p>
            </div>
          ) : (
            <>
              {/* SEARCH & FILTER BAR */}
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                  <span className="text-slate-400 uppercase mr-1">Category Filter:</span>
                  {['ALL', 'STRATEGIC_MODEL', 'EXCHANGE_TELEMETRY', 'RISK_CONSTITUTION', 'HISTORICAL_REGIME'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                        categoryFilter === cat ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search persistent vault..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* LONG-TERM CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredLongTerm.map(mem => (
                  <div key={mem.id} className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3 flex flex-col justify-between shadow-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-bold">
                          {mem.category}
                        </span>
                        <button
                          onClick={() => handleTogglePinLongTerm(mem.id)}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border cursor-pointer ${
                            mem.isPinned ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {mem.isPinned ? 'PINNED' : 'PIN'}
                        </button>
                      </div>
                      <h3 className="text-xs font-bold text-white">{mem.title}</h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{mem.summary}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800 font-mono text-[10px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Source Model: <strong className="text-white">{mem.sourceModel}</strong></span>
                        <span>Age: <strong className="text-amber-400">{mem.ageDays} Days</strong></span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Recall Freq: <strong className="text-emerald-400">{mem.recallFreqHz} Hz</strong></span>
                        <span>Compression: <strong className="text-purple-300">{mem.compressionRatio}</strong></span>
                      </div>
                      <button
                        onClick={() => { setSelectedLongTerm(mem); setShowLongTermInspector(true); }}
                        className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold rounded text-[10px] transition-colors cursor-pointer"
                      >
                        INSPECT MEMORY PROVENANCE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* LONG-TERM INSPECTOR MODAL */}
      {showLongTermInspector && selectedLongTerm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-lg max-w-xl w-full p-4 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase">Long-Term Memory Provenance Inspector</h3>
              </div>
              <button onClick={() => setShowLongTermInspector(false)} className="p-1 hover:bg-slate-800 rounded cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-sm font-bold text-amber-400">{selectedLongTerm.title}</div>
              <div className="text-[10px] text-slate-400">
                ID: {selectedLongTerm.id} • Canonical Model: <strong className="text-white">{selectedLongTerm.sourceModel}</strong> ({selectedLongTerm.provider} • {selectedLongTerm.version})
              </div>

              <div className="p-2 bg-slate-900 rounded border border-slate-800 space-y-1 text-[11px]">
                <strong className="text-slate-400 block">Origin Provenance:</strong>
                <p className="text-slate-200">{selectedLongTerm.originProvenance}</p>
              </div>

              <div className="p-2 bg-slate-900 rounded border border-slate-800 space-y-1 text-[11px]">
                <strong className="text-slate-400 block">Business Impact:</strong>
                <p className="text-emerald-300">{selectedLongTerm.businessImpact}</p>
              </div>

              <div className="p-2 bg-slate-900 rounded border border-slate-800 space-y-1 text-[11px]">
                <strong className="text-slate-400 block">Source Trust Score:</strong>
                <p className="text-amber-400 font-bold">{selectedLongTerm.sourceTrustScore}% Verified ({selectedLongTerm.integrityStatus})</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowLongTermInspector(false)}
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-400 text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 04 DECISION MEMORY                                         */}
      {/* ========================================================== */}
      {activeTab === 'DECISION_MEMORY' && (
        <div className="space-y-6">
          {decisionMemory.length === 0 ? (
            <div className="p-12 bg-slate-900 border border-amber-500/30 rounded-lg text-center space-y-3">
              <FileCheck className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">NO CURRENT DECISION MEMORY</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No historical AI decisions are recorded in memory.
              </p>
            </div>
          ) : (
            <>
              {/* SIDE-BY-SIDE REPLAY COMPARISON */}
              {compareDecisionA && compareDecisionB && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-amber-400 uppercase flex items-center gap-2">
                      <FileCheck className="w-4 h-4" /> Decision Memory Context Comparison
                    </h3>
                    <span className="text-[10px] text-slate-400">Historical Decision Context & Outcomes</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                        <span className="font-bold text-amber-300">DECISION A: {compareDecisionA.decisionId}</span>
                        <span className="text-emerald-400 font-bold">{compareDecisionA.realizedOutcome}</span>
                      </div>
                      <div className="space-y-1 text-[10px]">
                        <div>Symbol: <strong className="text-white">{compareDecisionA.symbol}</strong></div>
                        <div>Canonical Model: <strong className="text-slate-300">{compareDecisionA.aiModel}</strong> ({compareDecisionA.provider})</div>
                        <div>Vote Action: <strong className="text-emerald-300">{compareDecisionA.voteAction}</strong> ({compareDecisionA.voteConsensusPct}% Quorum)</div>
                        <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-300 mt-1">
                          <span className="text-amber-400 block font-bold">Decision Thought Process:</span>
                          {compareDecisionA.modelThoughtProcess}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                        <span className="font-bold text-amber-300">DECISION B: {compareDecisionB.decisionId}</span>
                        <span className="text-amber-300 font-bold">{compareDecisionB.realizedOutcome}</span>
                      </div>
                      <div className="space-y-1 text-[10px]">
                        <div>Symbol: <strong className="text-white">{compareDecisionB.symbol}</strong></div>
                        <div>Canonical Model: <strong className="text-slate-300">{compareDecisionB.aiModel}</strong> ({compareDecisionB.provider})</div>
                        <div>Vote Action: <strong className="text-emerald-300">{compareDecisionB.voteAction}</strong> ({compareDecisionB.voteConsensusPct}% Quorum)</div>
                        <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-300 mt-1">
                          <span className="text-amber-400 block font-bold">Decision Thought Process:</span>
                          {compareDecisionB.modelThoughtProcess}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* HISTORICAL DECISION MEMORY TABLE */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-3 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" /> Persistent Historical Decision Records
                </h3>
                <div className="overflow-x-auto border border-slate-800 rounded">
                  <table className="w-full text-left border-collapse text-[11px] font-mono">
                    <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[10px]">
                      <tr>
                        <th className="p-2.5">Decision ID</th>
                        <th className="p-2.5">Symbol</th>
                        <th className="p-2.5">Canonical AI Model</th>
                        <th className="p-2.5">Vote</th>
                        <th className="p-2.5">Consensus</th>
                        <th className="p-2.5">Realized Outcome</th>
                        <th className="p-2.5">Profit Attribution</th>
                        <th className="p-2.5 text-right">Provenance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {decisionMemory.map(dm => (
                        <tr key={dm.id} className="hover:bg-slate-800/50">
                          <td className="p-2.5 font-bold text-amber-400">{dm.decisionId}</td>
                          <td className="p-2.5 text-white font-bold">{dm.symbol}</td>
                          <td className="p-2.5 text-slate-300">{dm.aiModel} ({dm.provider})</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] border ${
                              dm.voteAction === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                              dm.voteAction === 'SELL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                              'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}>
                              {dm.voteAction}
                            </span>
                          </td>
                          <td className="p-2.5 text-blue-400 font-bold">{dm.voteConsensusPct}%</td>
                          <td className="p-2.5 text-emerald-400 font-bold">{dm.realizedOutcome}</td>
                          <td className="p-2.5 text-amber-300 font-bold">+${dm.profitAttributionUsd.toLocaleString()}</td>
                          <td className="p-2.5 text-right font-bold text-slate-400">{dm.provenance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* 05 PATTERN INTELLIGENCE — V2 (FUTURE V2 ONLY)              */}
      {/* ========================================================== */}
      {activeTab === 'PATTERN_INTELLIGENCE_V2' && (
        <V2ReservedWorkspaceCard
          tabNumber="05"
          title="Pattern Intelligence — V2"
          reservedCapabilities={[
            'Pattern extraction across high volatility regimes',
            'Repeated behavior and order book signature identification',
            'Historical pattern detection & match confidence scoring',
            'Pattern relationships & similarity vector indexing',
            'Cross-regime pattern intelligence clustering'
          ]}
        />
      )}

      {/* ========================================================== */}
      {/* 06 VECTOR ENGINE — V2 (FUTURE V2 ONLY)                     */}
      {/* ========================================================== */}
      {activeTab === 'VECTOR_ENGINE_V2' && (
        <V2ReservedWorkspaceCard
          tabNumber="06"
          title="Vector Engine — V2"
          reservedCapabilities={[
            'High-dimensional vector embedding generation',
            'HNSW & IVFFlat vector index management',
            'Similarity search & cosine distance calculations',
            'Vector storage layout & memory mapping',
            'High-throughput vector retrieval pipeline'
          ]}
        />
      )}

      {/* ========================================================== */}
      {/* 07 KNOWLEDGE GRAPH — V2 (FUTURE V2 ONLY)                   */}
      {/* ========================================================== */}
      {activeTab === 'KNOWLEDGE_GRAPH_V2' && (
        <V2ReservedWorkspaceCard
          tabNumber="07"
          title="Knowledge Graph — V2"
          reservedCapabilities={[
            'Concept and entity relation synthesis',
            'Entity relationship link prediction',
            'Knowledge graph node and property indexing',
            'Graph edge weighting and causal influence links',
            'Multi-hop relationship graph traversal'
          ]}
        />
      )}

      {/* ========================================================== */}
      {/* 08 CONSOLIDATION ENGINE — V2 (FUTURE V2 ONLY)              */}
      {/* ========================================================== */}
      {activeTab === 'CONSOLIDATION_ENGINE_V2' && (
        <V2ReservedWorkspaceCard
          tabNumber="08"
          title="Consolidation Engine — V2"
          reservedCapabilities={[
            'Working memory to durable long-term vault promotion',
            'Off-market memory consolidation cycles',
            'Memory deduplication & semantic compression',
            'Importance score evaluation & memory pruning',
            'Retention state transition processing'
          ]}
        />
      )}

      {/* ========================================================== */}
      {/* 09 RAG RETRIEVAL SANDBOX — V2 (FUTURE V2 ONLY)            */}
      {/* ========================================================== */}
      {activeTab === 'RAG_RETRIEVAL_V2' && (
        <V2ReservedWorkspaceCard
          tabNumber="09"
          title="RAG Retrieval Sandbox — V2"
          reservedCapabilities={[
            'Multi-stage retrieval experiments',
            'BM25 lexical + dense vector hybrid search testing',
            'Cross-encoder reranking strategy evaluation',
            'Context assembly & prompt injection tuning',
            'Retrieval accuracy & relevance scoring evaluation'
          ]}
        />
      )}

      {/* ========================================================== */}
      {/* 10 MEMORY GOVERNANCE — V2 (FUTURE V2 ONLY)                 */}
      {/* ========================================================== */}
      {activeTab === 'MEMORY_GOVERNANCE_V2' && (
        <V2ReservedWorkspaceCard
          tabNumber="10"
          title="Memory Governance — V2"
          reservedCapabilities={[
            'Memory retention policies & automated compliance rules',
            'Sensitivity classification & access control policies',
            'Protected memory locking & immutable record flags',
            'Lifecycle governance & regulatory deletion standards',
            'Cryptographic audit trails & SEC/FINRA compliance verification'
          ]}
        />
      )}

      {/* ========================================================== */}
      {/* DEDICATED MODULE-LOCAL RESET CONFIRMATION MODAL            */}
      {/* ========================================================== */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-lg max-w-md w-full p-5 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase">AI Memory System Reset</h3>
              </div>
              <button
                onClick={() => { setShowResetModal(false); setResetConfirmedToggle(false); }}
                className="p-1 hover:bg-slate-800 rounded cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
              <p className="text-[11px] leading-relaxed">
                This operation will clear only eligible <strong>volatile working memory (RAM context)</strong>.
              </p>
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] space-y-1 text-amber-300">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Protected Record Boundaries:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[10px]">
                  <li>Long-Term Knowledge Vault remains intact.</li>
                  <li>Decision Memory remains intact.</li>
                  <li>Audit trails and other modules are untouched.</li>
                </ul>
              </div>

              {/* REQUIRE RESET ON TOGGLE */}
              <label className="flex items-center gap-2.5 pt-2 cursor-pointer border-t border-slate-800">
                <input
                  type="checkbox"
                  checked={resetConfirmedToggle}
                  onChange={(e) => setResetConfirmedToggle(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span className="text-[11px] font-bold text-white">RESET ON (Enable Reset)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => { setShowResetModal(false); setResetConfirmedToggle(false); }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                disabled={!resetConfirmedToggle}
                className={`px-4 py-1.5 font-bold rounded text-xs transition-all cursor-pointer ${
                  resetConfirmedToggle
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg'
                    : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                }`}
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
