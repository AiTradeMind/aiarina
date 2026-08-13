import React, { useState, useMemo } from 'react';
import {
  Crown,
  Swords,
  ShieldCheck,
  ShieldAlert,
  Users,
  Activity,
  BarChart3,
  Search,
  Filter,
  RefreshCcw,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  GitBranch,
  Layers,
  Clock,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Trophy,
  Lock,
  Unlock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  X,
  Check,
  Network,
  PieChart,
  History,
  FileCheck,
  Share2,
  Award,
  BookOpen,
  Scale,
  Brain,
  MessageSquare,
  HelpCircle,
  Zap,
  SlidersHorizontal,
  Flame,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AICommitteeGovernanceWorkspaceProps {
  showToast?: (msg: string) => void;
}

// ==========================================
// TYPES & DATA STRUCTURES FOR COMMITTEE GOVERNANCE
// ==========================================

export interface CommitteeMember {
  id: string;
  name: string;
  provider: string;
  contextTask: string;
  hierarchyLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  authority: string;
  vote: 'BUY' | 'SELL' | 'HOLD' | 'WAIT' | 'ABSTAIN' | 'NO_TRADE';
  confidence: number;
  csiScore: number;
  votingWeight: number;
  status: 'CHAMPION' | 'ELITE' | 'PRODUCTION' | 'PAPER' | 'SANDBOX' | 'QUARANTINED' | 'SUSPENDED' | 'BLACKLISTED';
  historicalAccuracy: number;
  recentAccuracy: number;
  drawdownPct: number;
  riskDisciplineScore: number;
  governanceTrustScore: number;
  learningScore: number;
  requiredScoreForPromotion: number;
  rationale: string;
  evidence: string;
  counterArguments: string;
  riskNotes: string;
  validatedArticles: string[];
  rejectedArticles: string[];
}

export interface MinorityReportItem {
  id: string;
  aiModel: string;
  vote: 'SELL' | 'HOLD' | 'NO_TRADE';
  reason: string;
  rejectedArguments: string;
  futureLearningFlag: boolean;
  confidenceDifference: string;
}

export interface CommitteeMemoryRecord {
  id: string;
  similarDecision: string;
  date: string;
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  profit: string;
  loss: string;
  winningAi: string;
  failedAi: string;
  lessonsLearned: string;
  knowledgeNode: string;
}

export interface RelationshipItem {
  modelA: string;
  modelB: string;
  agreementPct: number;
  relationship: 'ALLIANCE' | 'INDEPENDENT' | 'CONFLICT';
  votingSimilarity: number;
  historicalAlignment: number;
  trustIndex: number;
}

export interface GovernanceEventStream {
  id: string;
  timestamp: string;
  committee: string;
  decision: string;
  ai: string;
  action: string;
  severity: 'INFO' | 'SUCCESS' | 'WARN' | 'CRITICAL' | 'OVERRIDE';
  reason: string;
  rule: string;
  article: string;
  result: string;
}

// ==========================================
// MOCK DATASETS FOR COMMITTEE V3.2
// ==========================================

const COMMITTEE_HIERARCHY_MEMBERS: CommitteeMember[] = [
  {
    id: 'MEM-01',
    name: 'OpenAI GPT-5 (v5.0)',
    provider: 'OpenAI',
    contextTask: 'Executive Decision Quorum',
    hierarchyLevel: 1,
    authority: 'Tie-Breaking Vote & Executive Veto',
    vote: 'BUY',
    confidence: 96.5,
    csiScore: 98.2,
    votingWeight: 1.85,
    status: 'CHAMPION',
    historicalAccuracy: 94.2,
    recentAccuracy: 96.0,
    drawdownPct: 1.1,
    riskDisciplineScore: 99.0,
    governanceTrustScore: 99.5,
    learningScore: 96.8,
    requiredScoreForPromotion: 95.0,
    rationale: 'Breakout confirmed above VWAP resistance with 2.8x volume surge and bullish Order Flow Imbalance.',
    evidence: 'L2 Book Depth +42% Bid Side, Delta Volume +14.2k, VaR 0.038% safely below 2.0% ceiling.',
    counterArguments: 'Minor resistance at 22,480 strike level; mitigated by tight 1.2x ATR trailing stop.',
    riskNotes: 'Delta risk managed. Sector concentration 14.2% well below 20% limit.',
    validatedArticles: ['Article I', 'Article II', 'Article III', 'Article IV', 'Article X'],
    rejectedArticles: []
  },
  {
    id: 'MEM-02',
    name: 'Anthropic Claude 3.5 Sonnet (v3.5)',
    provider: 'Anthropic',
    contextTask: 'Risk Analysis & VaR Review',
    hierarchyLevel: 2,
    authority: 'Risk Intercept & VaR Enforcement',
    vote: 'BUY',
    confidence: 94.2,
    csiScore: 96.4,
    votingWeight: 1.65,
    status: 'CHAMPION',
    historicalAccuracy: 92.8,
    recentAccuracy: 95.1,
    drawdownPct: 1.0,
    riskDisciplineScore: 98.5,
    governanceTrustScore: 98.8,
    learningScore: 95.2,
    requiredScoreForPromotion: 92.0,
    rationale: 'Macro regime is High Volatility Bullish; risk-reward ratio 3.79:1 satisfies Article III.',
    evidence: 'Macro VIX 14.2, Sector Heatmap 88% Positive, Zero sector correlation overlap.',
    counterArguments: 'Overnight gap-up risk evaluated; mitigated by intraday profit-lock trigger.',
    riskNotes: 'Stop-loss envelope auto-scaled via 1.2x ATR. Max drawdown capped at 1.0%.',
    validatedArticles: ['Article III', 'Article V', 'Article VI', 'Article VII'],
    rejectedArticles: []
  },
  {
    id: 'MEM-03',
    name: 'DeepSeek R1 (v1.0)',
    provider: 'DeepSeek',
    contextTask: 'Strategy Optimization',
    hierarchyLevel: 3,
    authority: 'Strategy Optimization & Alpha Synthesis',
    vote: 'BUY',
    confidence: 92.0,
    csiScore: 95.1,
    votingWeight: 1.50,
    status: 'ELITE',
    historicalAccuracy: 91.5,
    recentAccuracy: 93.4,
    drawdownPct: 1.4,
    riskDisciplineScore: 96.0,
    governanceTrustScore: 96.5,
    learningScore: 94.0,
    requiredScoreForPromotion: 90.0,
    rationale: 'Statistical arbitrage vector aligns across 15-min and 1-hour timeframes.',
    evidence: 'Mean reversion residual z-score = +2.4; option implied skew favors call expansion.',
    counterArguments: 'Theta decay impact 0.12% NAV/day; manageable under 4-hour holding expectation.',
    riskNotes: 'Position sizing restricted to $450,000 (90% of max $500,000 cap).',
    validatedArticles: ['Article II', 'Article VIII', 'Article IX'],
    rejectedArticles: []
  },
  {
    id: 'MEM-04',
    name: 'Google Gemini 2.5 Pro (v2.5)',
    provider: 'Google AI',
    contextTask: 'Research & Event Evaluation',
    hierarchyLevel: 4,
    authority: 'Fundamental & Event Intelligence',
    vote: 'BUY',
    confidence: 89.5,
    csiScore: 94.8,
    votingWeight: 1.40,
    status: 'PRODUCTION',
    historicalAccuracy: 89.8,
    recentAccuracy: 91.2,
    drawdownPct: 0.9,
    riskDisciplineScore: 97.2,
    governanceTrustScore: 95.0,
    learningScore: 93.5,
    requiredScoreForPromotion: 88.0,
    rationale: 'Earnings momentum and institutional flow sentiment score +88/100.',
    evidence: 'NLP Sentiment analysis on 1,400 news feeds indicates strong institutional accumulation.',
    counterArguments: 'RBI interest rate decision scheduled in 5 days; short-term trade unaffected.',
    riskNotes: 'No news blackout trigger hit.',
    validatedArticles: ['Article I', 'Article VI', 'Article X'],
    rejectedArticles: []
  },
  {
    id: 'MEM-05',
    name: 'Meta Llama 3.3 70B (v3.3)',
    provider: 'Meta AI',
    contextTask: 'Order Execution Routing',
    hierarchyLevel: 5,
    authority: 'Slippage & Smart Order Routing',
    vote: 'BUY',
    confidence: 88.5,
    csiScore: 92.0,
    votingWeight: 1.20,
    status: 'PRODUCTION',
    historicalAccuracy: 88.0,
    recentAccuracy: 90.0,
    drawdownPct: 1.2,
    riskDisciplineScore: 94.0,
    governanceTrustScore: 92.5,
    learningScore: 91.0,
    requiredScoreForPromotion: 85.0,
    rationale: 'Adaptive execution algorithm estimates optimal execution with < 0.08% slippage.',
    evidence: 'Smart order router connected across 4 liquidity pools; passive liquidity available.',
    counterArguments: 'Spread widened by 2 ticks during momentum pulse; handled via dark pool slicing.',
    riskNotes: 'Execution SLA checked.',
    validatedArticles: ['Article IX'],
    rejectedArticles: []
  },
  {
    id: 'MEM-06',
    name: 'Mistral Large (v2.0)',
    provider: 'Mistral AI',
    contextTask: 'Regulatory & Constitutional Audit',
    hierarchyLevel: 6,
    authority: 'Regulatory & Constitutional Audit',
    vote: 'BUY',
    confidence: 91.0,
    csiScore: 93.5,
    votingWeight: 1.10,
    status: 'PRODUCTION',
    historicalAccuracy: 90.2,
    recentAccuracy: 92.0,
    drawdownPct: 1.1,
    riskDisciplineScore: 98.0,
    governanceTrustScore: 97.0,
    learningScore: 92.0,
    requiredScoreForPromotion: 85.0,
    rationale: 'All 42 constitutional rules verified 100% compliant. Zero regulatory violations.',
    evidence: 'Cryptographic pre-execution audit hash 0x9f8b7a6c5d4e3f2a generated.',
    counterArguments: 'None.',
    riskNotes: 'Audit trail locked.',
    validatedArticles: ['Article I', 'Article II', 'Article III', 'Article IV', 'Article V', 'Article VI', 'Article VII', 'Article VIII', 'Article IX', 'Article X', 'Article XI', 'Article XII'],
    rejectedArticles: []
  },
  {
    id: 'MEM-07',
    name: 'Alibaba Qwen 2.5 (v2.5)',
    provider: 'Alibaba AI',
    contextTask: 'Non-Binding Monitoring',
    hierarchyLevel: 7,
    authority: 'Non-Binding Monitoring & Anomaly Detection',
    vote: 'HOLD',
    confidence: 72.4,
    csiScore: 84.5,
    votingWeight: 0.45,
    status: 'PAPER',
    historicalAccuracy: 82.0,
    recentAccuracy: 83.5,
    drawdownPct: 2.8,
    riskDisciplineScore: 88.0,
    governanceTrustScore: 82.0,
    learningScore: 84.0,
    requiredScoreForPromotion: 88.0,
    rationale: 'Advises caution due to minor volatility spike in secondary sector indices.',
    evidence: 'Vol index divergence +1.2%.',
    counterArguments: 'Main index momentum is strong.',
    riskNotes: 'Observer weight 0.45x non-blocking.',
    validatedArticles: ['Article III'],
    rejectedArticles: []
  },
  {
    id: 'MEM-08',
    name: 'Mistral Mixtral 8x22B (v0.1)',
    provider: 'Mistral AI',
    contextTask: 'Shadow Monitoring',
    hierarchyLevel: 7,
    authority: 'Quarantined Shadow Monitoring',
    vote: 'SELL',
    confidence: 68.0,
    csiScore: 78.4,
    votingWeight: 0.10,
    status: 'QUARANTINED',
    historicalAccuracy: 79.5,
    recentAccuracy: 76.0,
    drawdownPct: 3.2,
    riskDisciplineScore: 75.0,
    governanceTrustScore: 72.0,
    learningScore: 80.0,
    requiredScoreForPromotion: 88.0,
    rationale: 'Model predicts temporary pullback; vote heavily down-weighted due to quarantine.',
    evidence: 'Drawdown event on 2026-07-28.',
    counterArguments: 'Consensus is overwhelmingly bullish.',
    riskNotes: 'Restricted voting weight 0.10x.',
    validatedArticles: [],
    rejectedArticles: ['Article III']
  }
];

const MINORITY_REPORTS: MinorityReportItem[] = [
  {
    id: 'MIN-01',
    aiModel: 'Mixtral 8x22B Quarantined',
    vote: 'SELL',
    reason: 'Identified temporary gamma squeeze resistance at 22,480 strike level.',
    rejectedArguments: 'Majority concluded volume surge will absorb resistance within 15 minutes.',
    futureLearningFlag: true,
    confidenceDifference: '-28.5% vs Chairman'
  },
  {
    id: 'MIN-02',
    aiModel: 'Qwen 2.5 Risk Observer',
    vote: 'HOLD',
    reason: 'Recommended waiting for 11:00 AM Europe market open confirmation.',
    rejectedArguments: 'Slippage and momentum models confirmed immediate entry offers +12bps better pricing.',
    futureLearningFlag: false,
    confidenceDifference: '-24.1% vs Chairman'
  }
];

const COMMITTEE_MEMORY_LOGS: CommitteeMemoryRecord[] = [
  {
    id: 'MEM-DEC-842',
    similarDecision: 'DEC-2026-782 (NIFTY Call Option Breakout)',
    date: '2026-07-18',
    result: 'WIN',
    profit: '+$18,450 (+4.8%)',
    loss: '$0',
    winningAi: 'GPT-5 Institutional Chairman & Claude 3.5 Sonnet',
    failedAi: 'Mixtral 8x22B (Dissenting SELL)',
    lessonsLearned: 'Breakout signals accompanied by L2 book delta > +10k have 91.2% win probability.',
    knowledgeNode: 'NODE-OPT-BREAKOUT-91'
  },
  {
    id: 'MEM-DEC-810',
    similarDecision: 'DEC-2026-640 (BANKNIFTY Short Hedge)',
    date: '2026-06-29',
    result: 'WIN',
    profit: '+$12,200 (+3.2%)',
    loss: '$0',
    winningAi: 'DeepSeek R1 CSO & Gemini 2.5 Pro',
    failedAi: 'None (Unanimous Consensus)',
    lessonsLearned: 'Unanimous committee votes (>90% weighted consensus) achieve 96.4% success rate.',
    knowledgeNode: 'NODE-CONSENSUS-UNANIMOUS'
  }
];

const RELATIONSHIP_GRAPH: RelationshipItem[] = [
  { modelA: 'GPT-5 Chairman', modelB: 'Claude 3.5 CRO', agreementPct: 94.8, relationship: 'ALLIANCE', votingSimilarity: 95.2, historicalAlignment: 96.0, trustIndex: 99.2 },
  { modelA: 'GPT-5 Chairman', modelB: 'DeepSeek R1 CSO', agreementPct: 91.2, relationship: 'ALLIANCE', votingSimilarity: 90.5, historicalAlignment: 92.4, trustIndex: 97.5 },
  { modelA: 'Claude 3.5 CRO', modelB: 'Gemini 2.5 Pro', agreementPct: 88.5, relationship: 'ALLIANCE', votingSimilarity: 89.0, historicalAlignment: 90.1, trustIndex: 95.8 },
  { modelA: 'GPT-5 Chairman', modelB: 'Mixtral 8x22B', agreementPct: 42.0, relationship: 'CONFLICT', votingSimilarity: 40.5, historicalAlignment: 45.0, trustIndex: 72.0 }
];

const GOVERNANCE_EVENT_STREAM_LOGS: GovernanceEventStream[] = [
  { id: 'GOV-EV-901', timestamp: '10:48:12', committee: 'Supreme Council', decision: 'DEC-2026-901 (RELIANCE)', ai: 'GPT-5 Chairman', action: 'QUORUM_PASSED', severity: 'SUCCESS', reason: 'Weighted consensus reached 68.2% (Required >= 60.0%).', rule: 'RULE-GOV-01', article: 'Article I', result: 'AUTHORIZED_FOR_OMS' },
  { id: 'GOV-EV-902', timestamp: '10:45:00', committee: 'Supreme Council', decision: 'DEC-2026-901 (RELIANCE)', ai: 'Claude 3.5 CRO', action: 'VOTE_CAST_BUY', severity: 'INFO', reason: 'Risk validation cleared. R:R 3.79:1 satisfies Article III.', rule: 'RULE-VAR-01', article: 'Article III', result: 'VOTE_RECORDED' },
  { id: 'GOV-EV-903', timestamp: '09:15:10', committee: 'Supreme Council', decision: 'DEC-2026-904 (BANKNIFTY)', ai: 'Claude 3.5 CRO', action: 'DECISION_BLOCKED', severity: 'CRITICAL', reason: 'Risk reward ratio 1.08:1 failed required 2.50:1 constitutional rule.', rule: 'RULE-RR-05', article: 'Article III', result: 'REJECTED' },
  { id: 'GOV-EV-904', timestamp: '08:30:00', committee: 'Supreme Council', decision: 'PROMOTION-REQ', ai: 'Llama 3.3 70B', action: 'PROMOTION_EVAL', severity: 'WARN', reason: 'Promotion score 91.2/100 exceeds 85.0 threshold. Eligible for Champion.', rule: 'RULE-PROM-02', article: 'Article XII', result: 'PENDING_APPROVAL' }
];

// ==========================================
// MAIN COMPONENT DEFINITION
// ==========================================

export const AICommitteeGovernanceWorkspace: React.FC<AICommitteeGovernanceWorkspaceProps> = ({ showToast }) => {
  // Navigation Tabs for Committee Council
  const [activeTab, setActiveTab] = useState<
    'COMMAND_CENTER' | 'HIERARCHY' | 'QUORUM' | 'DISCUSSION' | 'MINORITY' | 
    'VOTING_WEIGHTS' | 'MEMORY' | 'CONSTITUTION_LINK' | 'PROMOTION' | 'DEADLOCK' | 
    'ANALYTICS' | 'EVENT_STREAM' | 'RELATIONSHIPS' | 'WEEKLY_REVIEW' | 'EXPORT'
  >('COMMAND_CENTER');

  // Committee Controls & Session State
  const [committeeStatus, setCommitteeStatus] = useState<'ACTIVE' | 'PAUSED' | 'FROZEN'>('ACTIVE');
  const [activeSessionId, setActiveSessionId] = useState('SESS-2026-0801-A');
  const [currentDecisionId] = useState('DEC-2026-901 (NIFTY26JUL22400CE)');
  const [quorumPct] = useState(88.4);
  const [autoCloseSeconds, setAutoCloseSeconds] = useState(145);
  const [emergencyOverrideActive, setEmergencyOverrideActive] = useState(false);

  // Data State
  const [members, setMembers] = useState<CommitteeMember[]>(COMMITTEE_HIERARCHY_MEMBERS);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('MEM-01');
  const [minorityReports] = useState<MinorityReportItem[]>(MINORITY_REPORTS);
  const [memoryLogs] = useState<CommitteeMemoryRecord[]>(COMMITTEE_MEMORY_LOGS);
  const [eventLogs] = useState<GovernanceEventStream[]>(GOVERNANCE_EVENT_STREAM_LOGS);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Inspector Modal State
  const [showWeightInspector, setShowWeightInspector] = useState(false);
  const [inspectedMember, setInspectedMember] = useState<CommitteeMember | null>(null);

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
  };

  const selectedMember = useMemo(() => {
    return members.find(m => m.id === selectedMemberId) || members[0];
  }, [members, selectedMemberId]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.contextTask.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [members, searchQuery, statusFilter]);

  const openWeightInspector = (m: CommitteeMember) => {
    setInspectedMember(m);
    setShowWeightInspector(true);
  };

  // Quick Actions Handlers
  const handlePauseResume = () => {
    if (committeeStatus === 'ACTIVE') {
      setCommitteeStatus('PAUSED');
      notify('Committee Voting PAUSED by Executive Chairman.');
    } else {
      setCommitteeStatus('ACTIVE');
      notify('Committee Voting RESUMED.');
    }
  };

  const handleForceRevote = () => {
    notify(`Force Revote initiated for ${currentDecisionId}. Recalibrating agent weights...`);
  };

  const handleFreezeDecision = () => {
    setCommitteeStatus('FROZEN');
    notify(`Decision ${currentDecisionId} FROZEN. Transferred to High-Level Governance Review.`);
  };

  const handleEmergencyReject = () => {
    notify(`EMERGENCY REJECT executed for ${currentDecisionId}. Order cancelled and logged.`);
  };

  const handleEmergencyApprove = () => {
    if (!emergencyOverrideActive) {
      setEmergencyOverrideActive(true);
      notify(`EMERGENCY APPROVAL OVERRIDE activated by Supreme AI Chairman!`);
    } else {
      setEmergencyOverrideActive(false);
      notify(`Emergency Approval Override disarmed.`);
    }
  };

  const handlePromoteDemote = (memberId: string, action: 'PROMOTE' | 'DEMOTE' | 'QUARANTINE' | 'REQUALIFY') => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        if (action === 'PROMOTE') {
          return { ...m, status: 'CHAMPION', votingWeight: 1.50 };
        } else if (action === 'DEMOTE') {
          return { ...m, status: 'PAPER', votingWeight: 0.65 };
        } else if (action === 'QUARANTINE') {
          return { ...m, status: 'QUARANTINED', votingWeight: 0.10 };
        } else if (action === 'REQUALIFY') {
          return { ...m, status: 'PRODUCTION', votingWeight: 1.10 };
        }
      }
      return m;
    }));
    notify(`Model ${memberId} state updated to ${action}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 text-slate-100 p-4 lg:p-6 space-y-6 font-mono text-xs">
      
      {/* ========================================================== */}
      {/* HEADER: SUPREME DECISION GOVERNANCE COUNCIL V3.2           */}
      {/* ========================================================== */}
      <div className={`border p-4 rounded-lg flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-2xl transition-colors ${
        emergencyOverrideActive ? 'bg-amber-950/80 border-amber-500 animate-pulse' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> AI ARINA GOVERNANCE COUNCIL
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold uppercase tracking-wider">Supreme Institutional Decision Governance Council V3.2</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg lg:text-xl font-bold font-mono tracking-tight text-white uppercase flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              Multi-Agent AI Voting Committee & Consensus Engine
            </h1>
            <span className={`px-2.5 py-0.5 border rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 ${
              emergencyOverrideActive 
                ? 'bg-amber-500/30 text-amber-200 border-amber-400' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {emergencyOverrideActive ? 'EMERGENCY OVERRIDE ENGAGED' : 'COMMITTEE GOVERNANCE SCORE: 98.4/100 (OPTIMAL)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Multi-model AI Council presiding over trade authorizations and constitutional compliance.
          </p>
        </div>

        {/* TOP STATUS BADGES */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold rounded text-[10px]">
            28 VOTING AGENTS
          </span>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold rounded text-[10px]">
            CONSENSUS: 68.2% BUY
          </span>
          <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold rounded text-[10px]">
            QUORUM: {quorumPct}%
          </span>
          <button
            onClick={() => notify('Exporting Committee Audit Ledger v3.2 (PDF/CSV/JSON)...')}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold rounded flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Audit Ledger</span>
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 1 — EXECUTIVE COMMITTEE COMMAND CENTER             */}
      {/* ========================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 1: Executive Committee Command Center</h2>
          </div>
          
          {/* QUICK ACTIONS BUTTON BAR */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePauseResume}
              className={`px-2.5 py-1 text-[10px] font-bold rounded border flex items-center gap-1 transition-all ${
                committeeStatus === 'PAUSED' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              {committeeStatus === 'PAUSED' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              <span>{committeeStatus === 'PAUSED' ? 'RESUME VOTING' : 'PAUSE VOTING'}</span>
            </button>

            <button
              onClick={handleForceRevote}
              className="px-2.5 py-1 text-[10px] font-bold bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-blue-400" />
              <span>FORCE REVOTE</span>
            </button>

            <button
              onClick={handleFreezeDecision}
              className="px-2.5 py-1 text-[10px] font-bold bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 rounded flex items-center gap-1 transition-colors"
            >
              <Lock className="w-3 h-3 text-purple-400" />
              <span>FREEZE DECISION</span>
            </button>

            <button
              onClick={handleEmergencyReject}
              className="px-2.5 py-1 text-[10px] font-bold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded flex items-center gap-1 transition-colors"
            >
              <XCircle className="w-3 h-3 text-rose-400" />
              <span>EMERGENCY REJECT</span>
            </button>

            <button
              onClick={handleEmergencyApprove}
              className={`px-2.5 py-1 text-[10px] font-bold rounded border flex items-center gap-1 transition-colors ${
                emergencyOverrideActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{emergencyOverrideActive ? 'DISARM OVERRIDE' : 'EMERGENCY APPROVE'}</span>
            </button>
          </div>
        </div>

        {/* EXECUTIVE COMMAND METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2.5 text-mono">
          {[
            { label: 'Committee Status', val: committeeStatus, color: committeeStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400' },
            { label: 'Active Session', val: activeSessionId, color: 'text-white' },
            { label: 'Current Decision', val: 'DEC-2026-901', color: 'text-amber-400' },
            { label: 'Quorum %', val: `${quorumPct}%`, color: 'text-emerald-400' },
            { label: 'Required Votes', val: '18 / 28', color: 'text-blue-400' },
            { label: 'Voting Time', val: '00:04:12', color: 'text-slate-300' },
            { label: 'Auto Close', val: `${autoCloseSeconds}s`, color: 'text-purple-400' },
            { label: 'Emergency Status', val: emergencyOverrideActive ? 'ENGAGED' : 'STANDBY', color: emergencyOverrideActive ? 'text-amber-400' : 'text-slate-400' },
            { label: 'Committee Health', val: '100% OPTIMAL', color: 'text-emerald-400' },
            { label: 'Governance Score', val: '98.4 / 100', color: 'text-emerald-300' }
          ].map((m, i) => (
            <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded flex flex-col justify-between space-y-1">
              <span className="text-[8px] text-slate-500 uppercase font-bold truncate">{m.label}</span>
              <div className={`text-xs font-bold font-mono ${m.color} truncate`}>{m.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================== */}
      {/* NAVIGATION TABS FOR ALL 15 GOVERNANCE SECTIONS           */}
      {/* ========================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex flex-wrap gap-1.5 overflow-x-auto text-[10px] font-bold">
        {[
          { id: 'COMMAND_CENTER', label: '1. Command Center', icon: Crown },
          { id: 'HIERARCHY', label: '2. Hierarchy Chart', icon: Network },
          { id: 'QUORUM', label: '3. Quorum Wheel', icon: PieChart },
          { id: 'DISCUSSION', label: '4. Discussion Chamber', icon: MessageSquare },
          { id: 'MINORITY', label: '5. Minority Report', icon: AlertTriangle },
          { id: 'VOTING_WEIGHTS', label: '6. Weight Explainer', icon: SlidersHorizontal },
          { id: 'MEMORY', label: '7. Committee Memory', icon: History },
          { id: 'CONSTITUTION_LINK', label: '8. Constitution Link', icon: Scale },
          { id: 'PROMOTION', label: '9. Promotion Engine', icon: Trophy },
          { id: 'DEADLOCK', label: '10. Deadlock Resolution', icon: Flame },
          { id: 'ANALYTICS', label: '11. Council Analytics', icon: BarChart3 },
          { id: 'EVENT_STREAM', label: '12. Event Stream', icon: Terminal },
          { id: 'RELATIONSHIPS', label: '13. AI Relationships', icon: Share2 },
          { id: 'WEEKLY_REVIEW', label: '14. Weekly Review', icon: FileCheck },
          { id: 'EXPORT', label: '15. Export & Audit', icon: Download }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1.5 rounded font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* SECTION 2 — COMMITTEE HIERARCHY CHART                     */}
      {/* ========================================================== */}
      {activeTab === 'HIERARCHY' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 2: Supreme AI Committee Organizational Hierarchy</h2>
            </div>
            <span className="text-[10px] text-slate-400">Strict Command Flow & Authority Delegation</span>
          </div>

          {/* VISUAL HIERARCHY FLOW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {members.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMemberId(m.id)}
                className={`p-3 rounded border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  selectedMemberId === m.id
                    ? 'bg-amber-500/10 border-amber-400 ring-1 ring-amber-400 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold">
                    L{m.hierarchyLevel} • {m.contextTask}
                  </span>
                  <span className="text-emerald-400 font-bold font-mono">{m.votingWeight}x Weight</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{m.name}</h3>
                  <p className="text-[10px] text-slate-400">{m.provider} • Authority: {m.authority}</p>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-800/80 pt-2 font-mono">
                  <span>CSI: {m.csiScore}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                    m.vote === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' :
                    m.vote === 'SELL' ? 'bg-rose-500/20 text-rose-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    Vote: {m.vote}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 3 — LIVE QUORUM VISUALIZATION & BREAKDOWN         */}
      {/* ========================================================== */}
      {(activeTab === 'COMMAND_CENTER' || activeTab === 'QUORUM') && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 3: Live Quorum Visualization & Consensus Breakdown</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Consensus Threshold Required: 60.0% Weighted</span>
          </div>

          {/* QUORUM METRICS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">BUY Votes</div>
              <div className="text-xl font-bold text-emerald-400 font-mono">18 / 28</div>
              <div className="text-[10px] text-emerald-300 font-bold">68.2% Weighted</div>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">SELL Votes</div>
              <div className="text-xl font-bold text-rose-400 font-mono">2 / 28</div>
              <div className="text-[10px] text-rose-300 font-bold">6.5% Weighted</div>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">HOLD Votes</div>
              <div className="text-xl font-bold text-amber-400 font-mono">5 / 28</div>
              <div className="text-[10px] text-amber-300 font-bold">18.0% Weighted</div>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/40 rounded space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">WAIT Votes</div>
              <div className="text-xl font-bold text-purple-400 font-mono">1 / 28</div>
              <div className="text-[10px] text-purple-300 font-bold">2.3% Weighted</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">ABSTAIN Votes</div>
              <div className="text-xl font-bold text-slate-400 font-mono">0 / 28</div>
              <div className="text-[10px] text-slate-500 font-bold">0.0% Weighted</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">NO TRADE</div>
              <div className="text-xl font-bold text-white font-mono">2 / 28</div>
              <div className="text-[10px] text-slate-400 font-bold">5.0% Weighted</div>
            </div>
          </div>

          {/* CONSENSUS BANNER */}
          <div className="p-3 bg-emerald-500/15 border border-emerald-500 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-sm text-emerald-300 uppercase">FINAL COMMITTEE CONSENSUS: AUTHORIZED BUY TRADE</span>
                <p className="text-[10px] text-slate-300">
                  Weighted consensus 68.2% clears required 60.0% threshold. Authorized for OMS dispatch.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] text-slate-400 uppercase">WEIGHTED CONFIDENCE</div>
              <div className="text-base font-bold text-emerald-400 font-mono">94.8%</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 4 — AI DISCUSSION CHAMBER                          */}
      {/* ========================================================== */}
      {(activeTab === 'COMMAND_CENTER' || activeTab === 'DISCUSSION') && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 4: AI Discussion Chamber & Debate Timeline</h2>
            </div>
            <span className="text-[10px] text-slate-400">Click voter to inspect weight formula</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="p-2.5">AI Model</th>
                  <th className="p-2.5">Task Context</th>
                  <th className="p-2.5">Vote</th>
                  <th className="p-2.5">Confidence</th>
                  <th className="p-2.5">CSI Score</th>
                  <th className="p-2.5">Voter Weight</th>
                  <th className="p-2.5">Governance Status</th>
                  <th className="p-2.5">Vote Rationale & Evidence</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredMembers.map(m => (
                  <tr key={m.id} className="hover:bg-slate-800/50">
                    <td className="p-2.5 font-bold text-white whitespace-nowrap">{m.name}</td>
                    <td className="p-2.5 text-slate-400 text-[10px] whitespace-nowrap">{m.contextTask}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                        m.vote === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        m.vote === 'SELL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                        'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {m.vote}
                      </span>
                    </td>
                    <td className="p-2.5 text-blue-400 font-bold">{m.confidence}%</td>
                    <td className="p-2.5 text-emerald-400 font-bold">{m.csiScore}</td>
                    <td className="p-2.5">
                      <button
                        onClick={() => openWeightInspector(m)}
                        className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded font-bold underline"
                      >
                        {m.votingWeight}x
                      </button>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        m.status === 'CHAMPION' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        m.status === 'QUARANTINED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                        'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-300 max-w-xs truncate">{m.rationale}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => openWeightInspector(m)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 5 — MINORITY REPORT                                */}
      {/* ========================================================== */}
      {activeTab === 'MINORITY' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 5: Automated Minority Dissent Report</h2>
            </div>
            <span className="text-[10px] text-slate-400">Preserves Dissenting Hypotheses for Post-Trade Audit</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {minorityReports.map((report) => (
              <div key={report.id} className="p-3 bg-slate-950 border border-amber-500/40 rounded space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-300 text-xs">{report.aiModel}</span>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[9px] font-bold">
                    DISSENT VOTE: {report.vote}
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div><strong className="text-slate-400">Dissent Reason:</strong> <span className="text-slate-200">{report.reason}</span></div>
                  <div><strong className="text-slate-400">Rejected Arguments:</strong> <span className="text-slate-300">{report.rejectedArguments}</span></div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-blue-400">Confidence Delta: {report.confidenceDifference}</span>
                    <span className="text-emerald-400 font-bold">
                      {report.futureLearningFlag ? '✓ Flagged for Post-Trade Learning' : 'Standard Logged'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 6 — VOTING WEIGHT EXPLAINER MODAL & INSPECTOR      */}
      {/* ========================================================== */}
      {showWeightInspector && inspectedMember && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-lg max-w-xl w-full p-4 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase">Section 6: Voting Weight Mathematical Formula Inspector</h3>
              </div>
              <button onClick={() => setShowWeightInspector(false)} className="p-1 hover:bg-slate-800 rounded">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2 bg-slate-950 p-3 rounded border border-slate-800">
              <div className="text-sm font-bold text-amber-400">{inspectedMember.name}</div>
              <div className="text-[10px] text-slate-400">{inspectedMember.provider} • Task Context: {inspectedMember.contextTask}</div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] pt-2">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Historical Accuracy</span>
                  <span className="text-emerald-400 font-bold">{inspectedMember.historicalAccuracy}%</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Recent 30D Accuracy</span>
                  <span className="text-emerald-400 font-bold">{inspectedMember.recentAccuracy}%</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">CSI Score</span>
                  <span className="text-emerald-400 font-bold">{inspectedMember.csiScore}</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Max Drawdown</span>
                  <span className="text-amber-400 font-bold">{inspectedMember.drawdownPct}%</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Risk Discipline</span>
                  <span className="text-blue-400 font-bold">{inspectedMember.riskDisciplineScore}/100</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-500 block">Governance Trust</span>
                  <span className="text-purple-400 font-bold">{inspectedMember.governanceTrustScore}/100</span>
                </div>
              </div>

              <div className="p-2.5 bg-amber-500/10 border border-amber-500/40 rounded text-[10px] space-y-1">
                <span className="text-amber-300 font-bold uppercase block">Weight Calculation Formula:</span>
                <p className="text-slate-200">
                  Weight = (CSI / 100) * 0.40 + (Acc30D / 100) * 0.35 + (RiskDisc / 100) * 0.25 = <strong className="text-emerald-400">{inspectedMember.votingWeight}x</strong>
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowWeightInspector(false)}
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-400 text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 7 — COMMITTEE MEMORY                                */}
      {/* ========================================================== */}
      {activeTab === 'MEMORY' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 7: Historical Committee Memory & Precedent Analysis</h2>
            </div>
            <span className="text-[10px] text-slate-400">Matched Vector Memory Nodes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memoryLogs.map(log => (
              <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
                  <span className="text-white">{log.similarDecision}</span>
                  <span className="text-emerald-400 font-mono">{log.profit}</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="text-slate-400">Date: <strong className="text-slate-200">{log.date}</strong></div>
                  <div className="text-slate-400">Winning AI: <strong className="text-emerald-300">{log.winningAi}</strong></div>
                  <div className="text-slate-400">Lessons Learned: <span className="text-slate-200">{log.lessonsLearned}</span></div>
                  <div className="text-[9px] text-purple-400 font-mono pt-1">Vector Node: {log.knowledgeNode}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 8 — GOVERNANCE CONSTITUTION LINK                   */}
      {/* ========================================================== */}
      {activeTab === 'CONSTITUTION_LINK' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 8: Pre-Execution Constitutional Compliance Validation</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">100% Interception Before OMS Dispatch</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-3 font-mono text-xs">
            <h3 className="text-amber-400 font-bold uppercase">Decision DEC-2026-901 Constitutional Validation Certificate</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
              {['Article I (Market Eligibility)', 'Article II (Capital Allocation)', 'Article III (Risk & VaR)', 'Article IV (Margin Utilization)'].map((art, idx) => (
                <div key={idx} className="p-2 bg-emerald-500/10 border border-emerald-500/40 rounded flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300 font-bold">{art}: PASSED</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              All 42 constitutional rules verified 100% compliant before committee consensus was declared.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 9 — AI PROMOTION ENGINE                           */}
      {/* ========================================================== */}
      {activeTab === 'PROMOTION' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 9: Champion vs Challenger Model Promotion Engine</h2>
            </div>
            <span className="text-[10px] text-slate-400">Automated Promotion & Quarantine Controls</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map(m => (
              <div key={m.id} className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between gap-3 font-mono">
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs">{m.name}</div>
                  <div className="text-[10px] text-slate-400">Status: <strong className="text-amber-300">{m.status}</strong> • CSI: {m.csiScore}</div>
                  <div className="text-[9px] text-slate-500">Required Score for Champion: {m.requiredScoreForPromotion}</div>
                </div>

                <div className="flex flex-col gap-1 text-[9px] font-bold">
                  {m.status !== 'CHAMPION' && (
                    <button
                      onClick={() => handlePromoteDemote(m.id, 'PROMOTE')}
                      className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500 text-emerald-300 hover:text-slate-950 rounded transition-colors"
                    >
                      PROMOTE TO CHAMPION
                    </button>
                  )}
                  {m.status === 'CHAMPION' && (
                    <button
                      onClick={() => handlePromoteDemote(m.id, 'DEMOTE')}
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500 border border-amber-500 text-amber-300 hover:text-slate-950 rounded transition-colors"
                    >
                      DEMOTE TO PAPER
                    </button>
                  )}
                  <button
                    onClick={() => handlePromoteDemote(m.id, 'QUARANTINE')}
                    className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500 border border-rose-500 text-rose-300 hover:text-white rounded transition-colors"
                  >
                    QUARANTINE MODEL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 10 — DEADLOCK RESOLUTION ENGINE                   */}
      {/* ========================================================== */}
      {activeTab === 'DEADLOCK' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 10: Committee Deadlock Resolution Protocol</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">0 Active Deadlocks</span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-3 text-xs font-mono">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Deadlock Probability</span>
                <span className="text-emerald-400 font-bold text-sm">0.0%</span>
              </div>
              <div className="p-3 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Tie Breaking AI</span>
                <span className="text-amber-400 font-bold text-sm">GPT-5 Chairman (1.85x)</span>
              </div>
              <div className="p-3 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Escalation Path</span>
                <span className="text-blue-400 font-bold text-sm">Level 1: Chairman Veto</span>
              </div>
              <div className="p-3 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Emergency Override</span>
                <span className="text-purple-400 font-bold text-sm">Ready (Sub-1s)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 11 — COUNCIL ANALYTICS                            */}
      {/* ========================================================== */}
      {activeTab === 'ANALYTICS' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 11: Governance Performance Analytics</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Historical Accuracy 96.4%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            {[
              { label: 'Committee Accuracy', val: '96.4%', sub: 'Last 1,420 trades' },
              { label: 'Avg Consensus Time', val: '0.8s', sub: 'Sub-second voting' },
              { label: 'Deadlocks Resolved', val: '12 / 12', sub: '100% resolution' },
              { label: 'Risk Saved', val: '+$420,000', sub: 'Pre-execution intercepts' }
            ].map((a, i) => (
              <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                <span className="text-slate-500 text-[10px] uppercase block">{a.label}</span>
                <div className="text-base font-bold text-amber-400">{a.val}</div>
                <span className="text-[9px] text-slate-400">{a.sub}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 12 — EVENT STREAM                                  */}
      {/* ========================================================== */}
      {activeTab === 'EVENT_STREAM' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 12: Governance Event Stream Log</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Live Stream Connected</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded">
            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Committee</th>
                  <th className="p-2.5">Decision ID</th>
                  <th className="p-2.5">AI Model</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Reason & Details</th>
                  <th className="p-2.5 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {eventLogs.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-800/50">
                    <td className="p-2.5 text-slate-400">{ev.timestamp}</td>
                    <td className="p-2.5 text-white font-bold">{ev.committee}</td>
                    <td className="p-2.5 text-amber-400 font-bold">{ev.decision}</td>
                    <td className="p-2.5 text-slate-300">{ev.ai}</td>
                    <td className="p-2.5 text-emerald-400 font-bold">{ev.action}</td>
                    <td className="p-2.5 text-slate-300 max-w-xs truncate">{ev.reason}</td>
                    <td className="p-2.5 text-right text-emerald-300 font-bold">{ev.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 13 — AI RELATIONSHIP GRAPH                        */}
      {/* ========================================================== */}
      {activeTab === 'RELATIONSHIPS' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 13: Inter-Model Voting Relationship Graph</h2>
            </div>
            <span className="text-[10px] text-slate-400">Cross-Agent Agreement Index</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {RELATIONSHIP_GRAPH.map((rel, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">{rel.modelA} <span className="text-slate-500">↔</span> {rel.modelB}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    rel.relationship === 'ALLIANCE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {rel.relationship} ({rel.agreementPct}%)
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Voting Similarity: {rel.votingSimilarity}%</span>
                  <span>Trust Index: {rel.trustIndex}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 14 — WEEKLY REVIEW                                 */}
      {/* ========================================================== */}
      {activeTab === 'WEEKLY_REVIEW' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 14: Weekly Governance Review & Self-Evolution Audit</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Review Completed (Sunday)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
              <span className="text-amber-400 font-bold block">Top Performing Model</span>
              <div className="text-white font-bold">GPT-5 Institutional (CSI 98.2)</div>
              <p className="text-[10px] text-slate-400">Suggested Action: Maintain 1.85x Chairman Voting Weight.</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
              <span className="text-rose-400 font-bold block">Model Requiring Calibration</span>
              <div className="text-white font-bold">Mixtral 8x22B (Drawdown 3.2%)</div>
              <p className="text-[10px] text-slate-400">Suggested Action: Retain in Quarantine until backtest completes.</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
              <span className="text-blue-400 font-bold block">Knowledge Added</span>
              <div className="text-white font-bold">+342 Vector Patterns</div>
              <p className="text-[10px] text-slate-400">Added to Committee Vector Memory Nodes.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* SECTION 15 — EXPORT & AUDIT                                */}
      {/* ========================================================== */}
      {activeTab === 'EXPORT' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 15: Committee Knowledge & Audit Report Export</h2>
            </div>
            <span className="text-[10px] text-slate-400">Cryptographically Signed Governance Reports</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => notify('Exporting Committee Audit PDF...')}
              className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left space-y-1"
            >
              <FileText className="w-5 h-5 text-amber-400" />
              <div className="font-bold text-white">Export Audit PDF</div>
              <div className="text-[10px] text-slate-400">Executive Committee Governance Report</div>
            </button>

            <button
              onClick={() => notify('Exporting Voting Ledger CSV...')}
              className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left space-y-1"
            >
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <div className="font-bold text-white">Export Voting CSV</div>
              <div className="text-[10px] text-slate-400">Complete Raw Member Vote Matrix</div>
            </button>

            <button
              onClick={() => notify('Exporting Audit Ledger JSON...')}
              className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-left space-y-1"
            >
              <Terminal className="w-5 h-5 text-blue-400" />
              <div className="font-bold text-white">Export JSON Ledger</div>
              <div className="text-[10px] text-slate-400">Cryptographic Pre-Execution Ledger</div>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
