import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Brain, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Server, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Terminal as TerminalIcon,
  Trophy, 
  FileText, 
  Link, 
  RefreshCcw,
  List,
  LayoutGrid,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Wallet, 
  Swords, 
  Network, 
  Crown, 
  BarChart2, 
  Dna, 
  Fingerprint, 
  BrainCircuit, 
  Share2, 
  Boxes,
  Power,
  Pause,
  Play,
  RotateCcw,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Database,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency, ensureArray, safeDate, safeFormat, safeToLocaleString, safeToLocaleDateString, safeToLocaleTimeString } from '../lib/utils';
import { SectionHeader, StatusBadge, MetricCard, Panel, Toolbar, GlobalSummaryItem } from './ui/Base';
import { DataTable, SearchBar } from './ui/Table';
import { LoadingOverlay, EmptyState, DataBoundary } from './ui/Feedback';
import { IconButton } from './ui/Button';
import { LearningEvolutionWorkspace } from './LearningEvolutionWorkspace';
import { AICentralBrainWorkspace } from './AICentralBrainWorkspace';
import { AIDecisionEngineWorkspace } from './AIDecisionEngineWorkspace';
import { AITradeConstitutionWorkspace } from './AITradeConstitutionWorkspace';
import { AICommitteeGovernanceWorkspace } from './AICommitteeGovernanceWorkspace';
import { AIMemoryWorkspace } from './AIMemoryWorkspace';

// --- Interfaces ---
interface AIModel {
  id: number;
  displayName: string;
  version: string;
  provider: string;
  health: string;
  status: 'PRODUCTION' | 'STAGING' | 'BACKTEST' | 'PAPER' | 'HALTED' | 'PAUSED' | 'RUNNING';
  strategy: string;
  confidence: string;
  accuracy: string;
  winRate: string;
  capital: string;
  risk: string;
  currentTask: string;
  currentTrade: string;
  lastDecision: string;
  lifecycleStage: string;
}

interface Decision {
  id: number;
  type: string;
  confidence: string;
  status: string;
  createdAt: string;
  ticker?: string;
  action?: string;
  rationale?: string;
  votes?: any[];
  rejected?: boolean;
}

export const AIWorkspace = React.memo(({
  onRefresh,
  models,
  recommendations,
  providers,
  history,
  patterns,
  aiMemory,
  aiLearning,
  usage,
  health,
  brainStatus,
  brainTasks,
  leaderboard,
  performanceTests,
  performanceBenchmarks,
  performanceReports,
  funds,
  fundAllocations,
  fundRecommendations,
  fundHistory,
  seasons,
  tournaments,
  matches,
  scoreboards,
  evolutionProfiles,
  evolutionPatterns,
  evolutionHistory,
  knowledgeNodes,
  knowledgeEdges,
  knowledgeSnapshots,
  collabs,
  collabSessions,
  initialTab
}: {
  onRefresh: () => void;
  models: any[];
  recommendations: any[];
  providers: any[];
  history: any[];
  patterns: any[];
  aiMemory?: any[];
  aiLearning?: any[];
  usage: any[];
  health: any;
  brainStatus: any;
  brainTasks: any[];
  leaderboard?: any;
  performanceTests?: any[];
  performanceBenchmarks?: any[];
  performanceReports?: any[];
  funds?: any[];
  fundAllocations?: any[];
  fundRecommendations?: any[];
  fundHistory?: any[];
  seasons?: any[];
  tournaments?: any[];
  matches?: any[];
  scoreboards?: any[];
  evolutionProfiles: any[];
  evolutionPatterns: any[];
  evolutionHistory: any[];
  knowledgeNodes: any[];
  knowledgeEdges: any[];
  knowledgeSnapshots: any[];
  collabs: any[];
  collabSessions: any[];
  initialTab?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const resolveTab = (tab?: string) => {
    if (tab === 'COMMITTEE' || tab === 'GOVERNANCE') return 'GOVERNANCE';
    if (tab === 'DECISION' || tab === 'DECISION_ENGINE' || tab === 'EXECUTION') return 'DECISION';
    if (tab === 'CONSTITUTION') return 'CONSTITUTION';
    if (tab === 'MEMORY') return 'MEMORY';
    return 'HOME';
  };
  const [activeTab, setActiveTab] = useState<'HOME' | 'MODELS' | 'MODEL_DETAIL' | 'BRAIN' | 'LIFECYCLE' | 'DECISION' | 'CONSTITUTION' | 'GOVERNANCE' | 'MEMORY' | 'KNOWLEDGE' | 'LEARNING' | 'EVOLUTION' | 'LEADERBOARD'>(resolveTab(initialTab));
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [modelDetailTab, setModelDetailTab] = useState<'OVERVIEW' | 'PERFORMANCE' | 'LIFECYCLE' | 'TRADES' | 'MEMORY' | 'LEARNING' | 'KNOWLEDGE' | 'HISTORY' | 'SETTINGS'>('OVERVIEW');
  
  // Model selector and search state
  const [modelSearch, setModelSearch] = useState('');
  const [modelFilterStatus, setModelFilterStatus] = useState('ALL');
  const [modelFilterProvider, setModelFilterProvider] = useState('ALL');
  const [modelFilterCategory, setModelFilterCategory] = useState('ALL');

  // Subsystem inner tabs
  const [memoryTab, setMemoryTab] = useState<'WORKING' | 'LONG' | 'PATTERN' | 'DECISION'>('WORKING');
  const [memorySearch, setMemorySearch] = useState('');

  const [knowledgeTab, setKnowledgeTab] = useState<'GRAPH' | 'NODES' | 'RELATIONS' | 'CONTEXT' | 'SOURCES'>('GRAPH');
  const [knowledgeSearch, setKnowledgeSearch] = useState('');

  const [decisionTab, setDecisionTab] = useState<'SIGNALS' | 'CONSENSUS' | 'CONFIDENCE' | 'VOTES' | 'REJECTED' | 'EXECUTED'>('SIGNALS');
  const [decisionSearch, setDecisionSearch] = useState('');
  const [selectedDecision, setSelectedDecision] = useState<any | null>(null);

  const [learningTab, setLearningTab] = useState<'CURRENT' | 'COMPLETED' | 'FAILURES' | 'PENDING'>('CURRENT');
  
  const [evolutionTab, setEvolutionTab] = useState<'GENERATION' | 'MUTATION' | 'IMPROVEMENT' | 'ROLLBACK'>('GENERATION');

  // Terminal & Toast
  const [consoleTab, setConsoleTab] = useState<'MATRIX' | 'RUNTIME_LOGS' | 'SCHEDULER_LOGS' | 'AI_EVENTS' | 'EXECUTION_EVENTS' | 'MEMORY_EVENTS' | 'DECISION_EVENTS'>('MATRIX');
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 28 Authoritative Enterprise AI Models
  const initial28Models: AIModel[] = [
    { id: 1, displayName: 'GPT-5', version: 'v5.0', provider: 'OpenAI', health: '99.9%', status: 'PRODUCTION', strategy: 'AlphaFlow-v3', confidence: '94.8%', accuracy: '91.2%', winRate: '68.4%', capital: '$250,000', risk: 'Low', currentTask: 'Optimizing volatility weights for NIFTY', currentTrade: 'BUY 500 NIFTY 22400 CE', lastDecision: 'STRONG BUY (Conf: 94.8%)', lifecycleStage: 'Position Open (Step 8/17)' },
    { id: 2, displayName: 'Claude Sonnet 5', version: 'v5.0', provider: 'Anthropic', health: '99.8%', status: 'PRODUCTION', strategy: 'RiskGuardian-v2', confidence: '92.3%', accuracy: '89.5%', winRate: '64.1%', capital: '$200,000', risk: 'Very Low', currentTask: 'Auditing portfolio VAR limits', currentTrade: 'HOLD BANKNIFTY Position', lastDecision: 'MAINTAIN RISK LIMITS', lifecycleStage: 'Monitoring (Step 9/17)' },
    { id: 3, displayName: 'Gemini 2.5 Pro', version: 'v2.5', provider: 'Google AI', health: '100%', status: 'STAGING', strategy: 'OmniTrade-v2', confidence: '90.1%', accuracy: '88.0%', winRate: '62.0%', capital: '$150,000', risk: 'Medium', currentTask: 'Processing earnings call transcripts', currentTrade: 'PENDING SIGNAL', lastDecision: 'WAIT FOR LIQUIDITY', lifecycleStage: 'Signal Analysis (Step 3/17)' },
    { id: 4, displayName: 'DeepSeek R1', version: 'v1.0', provider: 'DeepSeek', health: '98.5%', status: 'BACKTEST', strategy: 'DeepReason-v1', confidence: '87.6%', accuracy: '85.4%', winRate: '59.5%', capital: '$100,000', risk: 'Medium', currentTask: 'Backtesting multi-factor breakout', currentTrade: 'PAPER SHORT NVDA', lastDecision: 'SELL SIGNAL (Conf: 87.6%)', lifecycleStage: 'Paper Order (Step 6/17)' },
    { id: 5, displayName: 'GLM-4.5', version: 'v4.5', provider: 'Zhipu AI', health: '99.1%', status: 'PRODUCTION', strategy: 'MacroPulse-v3', confidence: '85.4%', accuracy: '83.2%', winRate: '60.2%', capital: '$120,000', risk: 'Low', currentTask: 'Analyzing Fed rate trajectory', currentTrade: 'BUY 1000 TLT @ $92.40', lastDecision: 'BUY (Conf: 85.4%)', lifecycleStage: 'Fund Reserved (Step 5/17)' },
    { id: 6, displayName: 'Grok 3', version: 'v3.0', provider: 'xAI', health: '97.8%', status: 'STAGING', strategy: 'X-Flow-v1', confidence: '83.2%', accuracy: '81.0%', winRate: '57.8%', capital: '$90,000', risk: 'High', currentTask: 'Streaming global financial chatter', currentTrade: 'BUY TSLA @ $245.00', lastDecision: 'MOMENTUM BUY', lifecycleStage: 'Market Scan (Step 1/17)' },
    { id: 7, displayName: 'Phi-4', version: 'v4.0', provider: 'Microsoft', health: '99.4%', status: 'PAPER', strategy: 'MicroEdge-v1', confidence: '78.7%', accuracy: '76.5%', winRate: '55.0%', capital: '$50,000', risk: 'Low', currentTask: 'Low-latency order book routing', currentTrade: 'PAPER BUY AMZN', lastDecision: 'HOLD', lifecycleStage: 'Paper Order (Step 6/17)' },
    { id: 8, displayName: 'Llama 3.3 70B', version: 'v3.3', provider: 'Meta', health: '98.9%', status: 'PRODUCTION', strategy: 'MetaAlpha-v4', confidence: '89.0%', accuracy: '87.1%', winRate: '63.5%', capital: '$180,000', risk: 'Low', currentTask: 'Evaluating cross-asset correlation matrix', currentTrade: 'BUY 300 SPY @ $510.00', lastDecision: 'BUY (Conf: 89.0%)', lifecycleStage: 'Position Open (Step 8/17)' },
    { id: 9, displayName: 'Mistral Large 2', version: 'v2.0', provider: 'Mistral AI', health: '99.0%', status: 'PRODUCTION', strategy: 'EuroAlpha-v2', confidence: '86.5%', accuracy: '84.2%', winRate: '61.2%', capital: '$130,000', risk: 'Medium', currentTask: 'Scanning EuroStoxx volatility arbitrage', currentTrade: 'LONG ASML', lastDecision: 'BUY', lifecycleStage: 'Order Filled (Step 7/17)' },
    { id: 10, displayName: 'Qwen 2.5 Max', version: 'v2.5', provider: 'Alibaba', health: '98.2%', status: 'BACKTEST', strategy: 'SilkRoad-v2', confidence: '81.0%', accuracy: '79.3%', winRate: '56.4%', capital: '$75,000', risk: 'Medium', currentTask: 'Cross-exchange liquidity sweep', currentTrade: 'BACKTEST HANG SENG', lastDecision: 'WAIT', lifecycleStage: 'Signal (Step 2/17)' },
    { id: 11, displayName: 'Command R+', version: 'v1.0', provider: 'Cohere', health: '99.5%', status: 'PRODUCTION', strategy: 'RAG-Quant-v3', confidence: '84.2%', accuracy: '82.0%', winRate: '59.8%', capital: '$110,000', risk: 'Low', currentTask: 'Vector search on 10-K filings', currentTrade: 'LONG GOOGL', lastDecision: 'BUY (Conf: 84.2%)', lifecycleStage: 'Journal (Step 14/17)' },
    { id: 12, displayName: 'Perplexity Sonar', version: 'v1.0', provider: 'Perplexity', health: '97.5%', status: 'STAGING', strategy: 'SonarLive-v1', confidence: '76.4%', accuracy: '74.1%', winRate: '53.1%', capital: '$60,000', risk: 'High', currentTask: 'Real-time breaking news indexing', currentTrade: 'PENDING', lastDecision: 'MONITOR', lifecycleStage: 'Market Scan (Step 1/17)' },
    { id: 13, displayName: 'Jamba 1.5 Large', version: 'v1.5', provider: 'AI21', health: '98.6%', status: 'BACKTEST', strategy: 'MambaFlow-v1', confidence: '82.1%', accuracy: '80.0%', winRate: '57.0%', capital: '$85,000', risk: 'Medium', currentTask: 'Long context sequence modeling', currentTrade: 'PAPER SHORT', lastDecision: 'SELL', lifecycleStage: 'Paper Order (Step 6/17)' },
    { id: 14, displayName: 'DBRX Advanced', version: 'v1.0', provider: 'Databricks', health: '99.2%', status: 'PRODUCTION', strategy: 'MoE-Trade-v2', confidence: '88.3%', accuracy: '86.2%', winRate: '61.8%', capital: '$140,000', risk: 'Low', currentTask: 'Routing sub-tasks across expert pool', currentTrade: 'BUY 400 META @ $490.00', lastDecision: 'BUY (Conf: 88.3%)', lifecycleStage: 'Position Open (Step 8/17)' },
    { id: 15, displayName: 'Falcon 180B', version: 'v1.0', provider: 'TII', health: '96.8%', status: 'HALTED', strategy: 'FalconLegacy-v1', confidence: '71.5%', accuracy: '69.0%', winRate: '51.0%', capital: '$40,000', risk: 'High', currentTask: 'System maintenance & audit', currentTrade: 'FLAT', lastDecision: 'HALT', lifecycleStage: 'Halted' },
    { id: 16, displayName: 'Vicuna 33B v1.5', version: 'v1.5', provider: 'LMSYS', health: '98.1%', status: 'BACKTEST', strategy: 'ChatQuant-v1', confidence: '74.0%', accuracy: '72.1%', winRate: '52.4%', capital: '$30,000', risk: 'Medium', currentTask: 'Simulating trader chat feedback', currentTrade: 'PAPER HOLD', lastDecision: 'HOLD', lifecycleStage: 'Market Scan (Step 1/17)' },
    { id: 17, displayName: 'StableLM 2 12B', version: 'v2.0', provider: 'Stability', health: '98.7%', status: 'STAGING', strategy: 'StableFlow-v1', confidence: '77.9%', accuracy: '75.8%', winRate: '54.2%', capital: '$45,000', risk: 'Medium', currentTask: 'Low-resource edge execution', currentTrade: 'PAPER BUY', lastDecision: 'BUY', lifecycleStage: 'Analysis (Step 3/17)' },
    { id: 18, displayName: 'Yi-Large', version: 'v1.0', provider: '01.AI', health: '99.3%', status: 'PRODUCTION', strategy: 'YiAlpha-v3', confidence: '90.5%', accuracy: '88.9%', winRate: '62.9%', capital: '$160,000', risk: 'Low', currentTask: 'Multi-factor quantitative screening', currentTrade: 'BUY 250 NFLX @ $620.00', lastDecision: 'BUY (Conf: 90.5%)', lifecycleStage: 'Position Open (Step 8/17)' },
    { id: 19, displayName: 'Gemma 2 27B', version: 'v2.0', provider: 'Google AI', health: '99.7%', status: 'PRODUCTION', strategy: 'GemmaQuant-v2', confidence: '83.9%', accuracy: '81.5%', winRate: '58.3%', capital: '$95,000', risk: 'Low', currentTask: 'Portfolio risk scoring', currentTrade: 'HOLD PORTFOLIO', lastDecision: 'HOLD', lifecycleStage: 'Risk Validation (Step 4/17)' },
    { id: 20, displayName: 'Phi-3.5 Vision', version: 'v3.5', provider: 'Microsoft', health: '99.0%', status: 'STAGING', strategy: 'VisionTrade-v1', confidence: '79.2%', accuracy: '77.0%', winRate: '55.6%', capital: '$65,000', risk: 'Medium', currentTask: 'Technical candlestick pattern detection', currentTrade: 'PAPER BUY BTC', lastDecision: 'BUY', lifecycleStage: 'Paper Order (Step 6/17)' },
    { id: 21, displayName: 'WizardLM 2', version: 'v2.0', provider: 'WizardLM', health: '98.4%', status: 'BACKTEST', strategy: 'WizardFlow-v1', confidence: '75.1%', accuracy: '73.2%', winRate: '53.8%', capital: '$55,000', risk: 'Medium', currentTask: 'Complex prompt constraint validation', currentTrade: 'PAPER FLAT', lastDecision: 'WAIT', lifecycleStage: 'Signal (Step 2/17)' },
    { id: 22, displayName: 'NeuralChat 7B', version: 'v2.0', provider: 'Intel', health: '99.6%', status: 'PRODUCTION', strategy: 'IntelChat-v2', confidence: '81.4%', accuracy: '79.1%', winRate: '57.9%', capital: '$80,000', risk: 'Low', currentTask: 'Real-time trader query response', currentTrade: 'ACTIVE ROUTING', lastDecision: 'BUY', lifecycleStage: 'Monitoring (Step 9/17)' },
    { id: 23, displayName: 'OpenChat 3.6', version: 'v3.6', provider: 'OpenChat', health: '98.8%', status: 'STAGING', strategy: 'OpenFlow-v1', confidence: '74.8%', accuracy: '72.5%', winRate: '52.9%', capital: '$50,000', risk: 'Medium', currentTask: 'Interactive strategy refinement', currentTrade: 'PAPER HOLD', lastDecision: 'HOLD', lifecycleStage: 'Analysis (Step 3/17)' },
    { id: 24, displayName: 'DeepSeek V3', version: 'v3.0', provider: 'DeepSeek', health: '99.8%', status: 'PRODUCTION', strategy: 'DeepMoE-v3', confidence: '93.1%', accuracy: '91.0%', winRate: '66.5%', capital: '$220,000', risk: 'Low', currentTask: 'High-frequency arbitrage execution', currentTrade: 'BUY 1000 AMD @ $160.00', lastDecision: 'STRONG BUY (Conf: 93.1%)', lifecycleStage: 'Position Open (Step 8/17)' },
    { id: 25, displayName: 'Claude 3 Haiku', version: 'v3.0', provider: 'Anthropic', health: '99.9%', status: 'PRODUCTION', strategy: 'HaikuSpeed-v2', confidence: '85.9%', accuracy: '83.8%', winRate: '60.1%', capital: '$115,000', risk: 'Low', currentTask: 'Sub-second risk check validation', currentTrade: 'BUY QQQ @ $440.00', lastDecision: 'BUY', lifecycleStage: 'Risk Validation (Step 4/17)' },
    { id: 26, displayName: 'GPT-4o Mini', version: 'v4.0', provider: 'OpenAI', health: '99.9%', status: 'PRODUCTION', strategy: 'MiniRoute-v3', confidence: '87.2%', accuracy: '85.1%', winRate: '61.4%', capital: '$135,000', risk: 'Low', currentTask: 'Routing lightweight inference queries', currentTrade: 'HOLD POSITION', lastDecision: 'HOLD', lifecycleStage: 'Monitoring (Step 9/17)' },
    { id: 27, displayName: 'Qwen 2.5 72B', version: 'v2.5', provider: 'Alibaba', health: '99.1%', status: 'STAGING', strategy: 'QwenEnterprise-v2', confidence: '86.1%', accuracy: '84.0%', winRate: '60.8%', capital: '$125,000', risk: 'Medium', currentTask: 'Global multi-currency risk analysis', currentTrade: 'PENDING', lastDecision: 'WAIT', lifecycleStage: 'Market Scan (Step 1/17)' },
    { id: 28, displayName: 'Llama 3.1 405B', version: 'v3.1', provider: 'Meta', health: '99.5%', status: 'PRODUCTION', strategy: 'SuperCluster-v4', confidence: '96.0%', accuracy: '94.5%', winRate: '70.2%', capital: '$300,000', risk: 'Low', currentTask: 'Enterprise macroeconomic synthesis', currentTrade: 'BUY 1000 SPY @ $512.00', lastDecision: 'STRONG BUY (Conf: 96.0%)', lifecycleStage: 'Learning & Evolution (Step 16/17)' }
  ];

  // Model state management for dynamic controls (ON, OFF, PAUSE, RESUME, RESTART, EMERGENCY STOP, HEALTH CHECK)
  const [modelStateMap, setModelStateMap] = useState<Record<number, AIModel>>(() => {
    const map: Record<number, AIModel> = {};
    initial28Models.forEach(m => { map[m.id] = m; });
    return map;
  });

  const modelList = useMemo(() => Object.values(modelStateMap), [modelStateMap]);

  // Model Control Handlers
  const handleModelControl = (modelId: number, action: 'ON' | 'OFF' | 'PAUSE' | 'RESUME' | 'RESTART' | 'EMERGENCY_STOP' | 'HEALTH_CHECK') => {
    setModelStateMap(prev => {
      const target = prev[modelId];
      if (!target) return prev;
      let newStatus: AIModel['status'] = target.status;

      if (action === 'ON' || action === 'RESUME') newStatus = 'PRODUCTION';
      if (action === 'OFF' || action === 'EMERGENCY_STOP') newStatus = 'HALTED';
      if (action === 'PAUSE') newStatus = 'PAUSED';
      if (action === 'RESTART') newStatus = 'PRODUCTION';

      const updated = {
        ...target,
        status: newStatus,
        health: action === 'HEALTH_CHECK' ? '100% HEALTHY' : target.health
      };

      showToast(`Model ${target.displayName}: ${action} executed successfully.`);
      if (selectedModel && selectedModel.id === modelId) {
        setSelectedModel(updated);
      }
      return { ...prev, [modelId]: updated };
    });
  };

  const handleGlobalControl = (action: 'ALL_ON' | 'ALL_OFF' | 'ALL_PAUSE' | 'EMERGENCY_HALT') => {
    setModelStateMap(prev => {
      const nextMap = { ...prev };
      Object.keys(nextMap).forEach(key => {
        const id = Number(key);
        if (action === 'ALL_ON') nextMap[id].status = 'PRODUCTION';
        if (action === 'ALL_OFF' || action === 'EMERGENCY_HALT') nextMap[id].status = 'HALTED';
        if (action === 'ALL_PAUSE') nextMap[id].status = 'PAUSED';
      });
      return nextMap;
    });
    showToast(`GLOBAL ACTION EXECUTED: ${action}`);
  };

  const lifecycleSteps = [
    'Market Scan',
    'Signal',
    'Analysis',
    'Risk Validation',
    'Fund Reserved',
    'Paper Order',
    'Order Filled',
    'Position Open',
    'Monitoring',
    'SL Update',
    'Target Update',
    'Partial Exit',
    'Exit',
    'Journal',
    'Performance Update',
    'Learning',
    'Evolution'
  ];

  // Calculated Stats for Overview
  const runningCount = useMemo(() => modelList.filter(m => m.status === 'PRODUCTION' || m.status === 'RUNNING' || m.status === 'STAGING').length, [modelList]);
  const stoppedCount = useMemo(() => modelList.filter(m => m.status === 'HALTED' || m.status === 'PAUSED').length, [modelList]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-terminal-bg text-white font-sans selection:bg-terminal-amber/30 relative select-none">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="absolute top-14 right-6 z-50 bg-terminal-amber text-black px-4 py-2 font-mono text-xs font-bold shadow-2xl flex items-center gap-2 border border-black animate-in fade-in slide-in-from-top-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP AI INTELLIGENCE HEADER */}
      <div className="h-12 border-b border-terminal-border bg-black/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-terminal-amber/10 border border-terminal-amber/30 rounded text-terminal-amber">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-wider uppercase">AI INTELLIGENCE OS</h1>
            <p className="text-[10px] text-terminal-muted font-mono">Enterprise AI Operating System v3.2 • 28 Active Quant Models</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-terminal-muted">
          <span>RUNNING MODELS: <strong className="text-terminal-green">{runningCount}/28</strong></span>
          <span>STOPPED: <strong className="text-terminal-red">{stoppedCount}</strong></span>
          <span>BRAIN HEALTH: <strong className="text-terminal-green">99.9%</strong></span>
          <IconButton icon={RefreshCcw} onClick={onRefresh} variant="ghost" size="xs" />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-black/10 relative">
          {loading && <LoadingOverlay message="AI Engine Syncing..." />}
          
          {/* HORIZONTAL MODULE TOOLBAR */}
          <div className="h-11 border-b border-terminal-border bg-black/60 flex items-center px-3 justify-between shrink-0">
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  const el = document.getElementById('ai-horizontal-tabs');
                  if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                }}
                className="p-1.5 text-terminal-muted hover:text-white hover:bg-white/5 rounded transition-colors"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('ai-horizontal-tabs');
                  if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                }}
                className="p-1.5 text-terminal-muted hover:text-white hover:bg-white/5 rounded transition-colors"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div 
              id="ai-horizontal-tabs"
              className="flex gap-1.5 h-full items-center overflow-x-auto whitespace-nowrap scrollbar-hide flex-1 mx-2 px-1"
            >
              {[
                { id: 'HOME', label: 'Executive Overview', icon: LayoutGrid },
                { id: 'MODELS', label: 'AI Models Registry', icon: Cpu },
                { id: 'BRAIN', label: 'Central Brain', icon: Brain },
                { id: 'DECISION', label: 'Decision Engine', icon: Activity },
                { id: 'GOVERNANCE', label: 'AI Committee & Governance', icon: Crown },
                { id: 'CONSTITUTION', label: 'Trade Constitution', icon: ShieldCheck },
                { id: 'KNOWLEDGE', label: 'Knowledge Graph', icon: Network },
                { id: 'EXPLAINABILITY', label: 'Explainability', icon: FileText },
              ].map((mod) => {
                const Icon = mod.icon;
                const isActive = activeTab === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveTab(mod.id as any)}
                    className={cn(
                      "px-3 h-8 text-[11px] font-bold uppercase tracking-widest transition-all rounded flex items-center gap-2 shrink-0 border cursor-pointer",
                      isActive 
                        ? "bg-terminal-amber/15 border-terminal-amber text-terminal-amber shadow-sm" 
                        : "bg-transparent border-transparent text-terminal-muted hover:text-white hover:bg-white/5"
                    )}
                    title={mod.label}
                    aria-label={mod.label}
                  >
                    <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-terminal-amber" : "text-terminal-muted")} />
                    <span className="inline-block text-[11px] font-bold tracking-wide text-current visible opacity-100">{mod.label}</span>
                  </button>
                );
              })}
            </div>

            {/* GLOBAL MASTER CONTROLS */}
            <div className="shrink-0 flex items-center gap-1.5 font-mono text-[9px]">
              <button 
                onClick={() => handleGlobalControl('ALL_ON')}
                className="px-2 py-1 bg-terminal-green/20 border border-terminal-green text-terminal-green hover:bg-terminal-green/30 font-bold rounded"
              >
                ALL ON
              </button>
              <button 
                onClick={() => handleGlobalControl('ALL_PAUSE')}
                className="px-2 py-1 bg-terminal-amber/20 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber/30 font-bold rounded"
              >
                PAUSE ALL
              </button>
              <button 
                onClick={() => handleGlobalControl('EMERGENCY_HALT')}
                className="px-2 py-1 bg-terminal-red/30 border border-terminal-red text-terminal-red hover:bg-terminal-red/40 font-bold rounded flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>EMERGENCY STOP</span>
              </button>
            </div>
          </div>

          {/* ACTIVE MODULE CONTENT AREA */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              
              {/* HOME / EXECUTIVE OVERVIEW */}
              {activeTab === 'HOME' ? (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex-1 overflow-y-auto p-4 space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
                    <div>
                      <h1 className="text-base font-bold text-white tracking-wider uppercase">Executive AI Operating System Overview</h1>
                      <p className="text-xs text-terminal-muted mt-0.5">Master enterprise AI runtime, queue telemetry & system health overview.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-terminal-green/10 text-terminal-green border border-terminal-green/30 rounded font-mono text-xs font-bold">SYSTEM HEALTH: 100% OPERATIONAL</span>
                      <span className="px-3 py-1 bg-terminal-amber/10 text-terminal-amber border border-terminal-amber/30 rounded font-mono text-xs font-bold">28/28 MODELS ACTIVE</span>
                    </div>
                  </div>

                  {/* EXECUTIVE TELEMETRY METRICS */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 font-mono">
                    <MetricCard label="AI Runtime" value="ACTIVE" color="text-terminal-green" icon={<Cpu className="w-3.5 h-3.5 text-terminal-green" />} />
                    <MetricCard label="Running Models" value={runningCount.toString()} color="text-terminal-amber" icon={<Play className="w-3.5 h-3.5 text-terminal-amber" />} />
                    <MetricCard label="Stopped Models" value={stoppedCount.toString()} color={stoppedCount > 0 ? "text-terminal-red" : "text-terminal-muted"} icon={<Pause className="w-3.5 h-3.5" />} />
                    <MetricCard label="Learning Queue" value="14 Cycles" color="text-terminal-blue" icon={<Dna className="w-3.5 h-3.5 text-terminal-blue" />} />
                    <MetricCard label="Decision Queue" value="18 Active" color="text-terminal-green" icon={<Activity className="w-3.5 h-3.5 text-terminal-green" />} />
                    <MetricCard label="Memory Queue" value="1,420 Items" color="text-terminal-amber" icon={<BrainCircuit className="w-3.5 h-3.5 text-terminal-amber" />} />
                    <MetricCard label="Knowledge Queue" value="32 Nodes" color="text-terminal-blue" icon={<Network className="w-3.5 h-3.5 text-terminal-blue" />} />
                    <MetricCard label="System Health" value="99.9%" color="text-terminal-green" icon={<ShieldCheck className="w-3.5 h-3.5 text-terminal-green" />} />
                  </div>

                  {/* MASTER MODULE WORKSPACE TILES */}
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-terminal-muted font-mono">Enterprise AI OS Core Subsystems</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { id: 'MODELS', title: 'AI Models Registry', desc: 'Displaying all 28 AI Models with status, strategy, capital, risk, trade, and lifecycle stage.', icon: Cpu, count: '28 Models' },
                        { id: 'BRAIN', title: 'Central Brain', desc: 'Consensus scheduler, running tasks, reasoning queue, execution queue, and brain health.', icon: Brain, count: 'Online' },
                        { id: 'LIFECYCLE', title: 'AI Lifecycle Pipeline', desc: '17-stage visual lifecycle tracking every trade from market scan to learning and evolution.', icon: RefreshCcw, count: '17 Stages' },
                        { id: 'DECISION', title: 'Decision Engine', desc: 'Real-time signals, consensus quorum, votes, confidence scoring, rejected & executed decisions.', icon: Activity, count: '18 Decisions' },
                        { id: 'MEMORY', title: 'AI Memory Core', desc: 'Working memory, long-term memory, pattern recognition, decision logs & failure analysis.', icon: BrainCircuit, count: '4 Memory Banks' },
                        { id: 'KNOWLEDGE', title: 'Knowledge Graph', desc: 'Nodes, relations, context, sources, indicators, strategies & graph topology explorer.', icon: Network, count: '32 Nodes' },
                        { id: 'LEARNING', title: 'Learning Engine', desc: 'Current learning queue, completed cycles, failures analysis & model improvement tasks.', icon: Dna, count: '14 Queue Items' },
                        { id: 'EVOLUTION', title: 'Evolution Engine', desc: 'Generational lineage, mutation history, improvement profiles & rollback controls.', icon: Dna, count: 'Gen 14' },
                      ].map((card) => {
                        const Icon = card.icon;
                        return (
                          <div 
                            key={card.id}
                            onClick={() => setActiveTab(card.id as any)}
                            className="p-4 bg-terminal-panel border border-terminal-border hover:border-terminal-amber cursor-pointer transition-all group flex flex-col justify-between min-h-[120px]"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="p-2 bg-terminal-amber/10 border border-terminal-amber/30 rounded text-terminal-amber group-hover:scale-105 transition-transform">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-[9px] font-mono text-terminal-muted px-2 py-0.5 bg-black/40 border border-terminal-border">{card.count}</span>
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-white group-hover:text-terminal-amber transition-colors">{card.title}</h3>
                                <p className="text-[10px] text-terminal-muted mt-1 leading-relaxed line-clamp-2">{card.desc}</p>
                              </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-terminal-border/40 flex items-center justify-between text-[9px] font-mono text-terminal-amber uppercase font-bold">
                              <span>LAUNCH SUBSYSTEM</span>
                              <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* LIVE EXECUTIVE SUMMARY QUEUES & HEALTH */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Panel headerProps={{ title: "Learning & Decision Queue Telemetry", icon: Activity }}>
                      <div className="p-3 space-y-2 font-mono text-xs">
                        <div className="flex justify-between items-center p-2 bg-black/40 border border-terminal-border">
                          <span className="text-terminal-muted">Learning Queue</span>
                          <span className="text-terminal-blue font-bold">14 Active Tasks</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/40 border border-terminal-border">
                          <span className="text-terminal-muted">Decision Queue</span>
                          <span className="text-terminal-amber font-bold">18 Decisions Pending</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/40 border border-terminal-border">
                          <span className="text-terminal-muted">Memory Queue</span>
                          <span className="text-terminal-green font-bold">1,420 Items Synced</span>
                        </div>
                      </div>
                    </Panel>

                    <Panel headerProps={{ title: "Knowledge & Memory Status", icon: Network }}>
                      <div className="p-3 space-y-2 font-mono text-xs">
                        <div className="flex justify-between items-center p-2 bg-black/40 border border-terminal-border">
                          <span className="text-terminal-muted">Knowledge Graph</span>
                          <span className="text-terminal-blue font-bold">32 Nodes / 48 Edges</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/40 border border-terminal-border">
                          <span className="text-terminal-muted">Working Memory</span>
                          <span className="text-terminal-green font-bold">Optimal (Cache 94%)</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/40 border border-terminal-border">
                          <span className="text-terminal-muted">Pattern Recognition</span>
                          <span className="text-terminal-amber font-bold">12 Patterns Match</span>
                        </div>
                      </div>
                    </Panel>

                    <Panel headerProps={{ title: "System Health & Kernel Status", icon: ShieldCheck }}>
                      <div className="p-3 space-y-2 font-mono text-xs">
                        <div className="flex justify-between items-center p-2 bg-black/40 border border-terminal-border">
                          <span className="text-terminal-muted">PostgreSQL Pool</span>
                          <span className="text-terminal-green font-bold">Connected (12ms)</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/40 border border-terminal-border">
                          <span className="text-terminal-muted">WebSocket Stream</span>
                          <span className="text-terminal-green font-bold">Active (Port 3000)</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-black/40 border border-terminal-border">
                          <span className="text-terminal-muted">Kernel Version</span>
                          <span className="text-terminal-amber font-bold">v3.2 Enterprise</span>
                        </div>
                      </div>
                    </Panel>
                  </div>
                </motion.div>
              ) : activeTab === 'MODELS' ? (
                /* AI MODEL REGISTRY (ALL 28 MODELS) */
                <motion.div 
                  key="models"
                  initial={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {/* SEARCH & FILTERS SELECTOR BAR */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-3 bg-black/50 border border-terminal-border">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-terminal-amber font-mono uppercase">AI Models Registry ({modelList.length} Models)</span>
                      <div className="h-4 w-px bg-terminal-border mx-1" />
                      <div className="flex flex-wrap gap-1">
                        {['ALL', 'PRODUCTION', 'STAGING', 'BACKTEST', 'PAPER', 'HALTED', 'PAUSED'].map(status => (
                          <button
                            key={status}
                            onClick={() => setModelFilterStatus(status)}
                            className={cn(
                              "px-2 py-0.5 text-[9px] font-mono border uppercase transition-colors",
                              modelFilterStatus === status 
                                ? "bg-terminal-amber text-black font-bold border-terminal-amber" 
                                : "bg-black/40 border-terminal-border text-terminal-muted hover:text-white"
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      <select
                        value={modelFilterProvider}
                        onChange={(e) => setModelFilterProvider(e.target.value)}
                        className="bg-black border border-terminal-border px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-terminal-amber"
                      >
                        <option value="ALL">All Providers</option>
                        <option value="OpenAI">OpenAI</option>
                        <option value="Anthropic">Anthropic</option>
                        <option value="Google AI">Google AI</option>
                        <option value="DeepSeek">DeepSeek</option>
                        <option value="Meta">Meta</option>
                        <option value="Alibaba">Alibaba</option>
                        <option value="Microsoft">Microsoft</option>
                        <option value="xAI">xAI</option>
                      </select>

                      <div className="relative w-64">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-terminal-muted" />
                        <input 
                          type="text"
                          placeholder="Search 28 models, roles, trades..."
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          className="w-full bg-black border border-terminal-border pl-8 pr-3 py-1 text-xs text-white focus:outline-none focus:border-terminal-amber font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 28 MODEL CARDS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {modelList
                      .filter((m) => {
                        const matchStatus = modelFilterStatus === 'ALL' || m.status === modelFilterStatus;
                        const matchProvider = modelFilterProvider === 'ALL' || m.provider === modelFilterProvider;
                        const matchSearch = modelSearch === '' || 
                          m.displayName.toLowerCase().includes(modelSearch.toLowerCase()) ||
                          m.version.toLowerCase().includes(modelSearch.toLowerCase()) ||
                          m.currentTask.toLowerCase().includes(modelSearch.toLowerCase()) ||
                          m.strategy.toLowerCase().includes(modelSearch.toLowerCase()) ||
                          m.currentTrade.toLowerCase().includes(modelSearch.toLowerCase());
                        return matchStatus && matchProvider && matchSearch;
                      })
                      .map((model) => (
                        <div 
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model);
                            setActiveTab('MODEL_DETAIL');
                          }}
                          className="p-3 bg-terminal-panel border border-terminal-border hover:border-terminal-amber cursor-pointer transition-all space-y-2.5 group flex flex-col justify-between min-h-[160px]"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[9px] font-mono text-terminal-muted block">{model.provider}</span>
                                <h3 className="text-xs font-bold text-white group-hover:text-terminal-amber transition-colors">
                                  #{model.id} {model.displayName}
                                </h3>
                              </div>
                              <StatusBadge status={model.status} variant={model.status === 'PRODUCTION' || model.status === 'RUNNING' ? 'success' : model.status === 'STAGING' ? 'info' : model.status === 'PAUSED' ? 'warning' : 'error'} />
                            </div>

                            <p className="text-[10px] text-terminal-muted italic line-clamp-1 mt-1">Version: {model.version} • Task: {model.currentTask}</p>
                            <div className="text-[9px] font-mono text-terminal-amber/90 mt-1">
                              Strategy: {model.strategy}
                            </div>
                            <div className="text-[9px] font-mono text-terminal-green mt-0.5 line-clamp-1">
                              Trade: {model.currentTrade}
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-terminal-border/40 font-mono text-[9px]">
                            <div className="grid grid-cols-3 gap-1 text-center bg-black/40 p-1 border border-terminal-border/60">
                              <div>
                                <span className="text-terminal-muted block text-[8px]">CAPITAL</span>
                                <span className="text-terminal-blue font-bold">{model.capital}</span>
                              </div>
                              <div>
                                <span className="text-terminal-muted block text-[8px]">WIN RATE</span>
                                <span className="text-terminal-green font-bold">{model.winRate}</span>
                              </div>
                              <div>
                                <span className="text-terminal-muted block text-[8px]">HEALTH</span>
                                <span className="text-white font-bold">{model.health}</span>
                              </div>
                            </div>

                            {/* QUICK ACTION CONTROLS */}
                            <div className="flex items-center justify-between gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => handleModelControl(model.id, 'ON')}
                                className="flex-1 py-1 bg-terminal-green/20 hover:bg-terminal-green/30 text-terminal-green border border-terminal-green/40 font-bold text-[8px] text-center"
                              >
                                ON
                              </button>
                              <button 
                                onClick={() => handleModelControl(model.id, 'PAUSE')}
                                className="flex-1 py-1 bg-terminal-amber/20 hover:bg-terminal-amber/30 text-terminal-amber border border-terminal-amber/40 font-bold text-[8px] text-center"
                              >
                                PAUSE
                              </button>
                              <button 
                                onClick={() => handleModelControl(model.id, 'OFF')}
                                className="flex-1 py-1 bg-terminal-red/20 hover:bg-terminal-red/30 text-terminal-red border border-terminal-red/40 font-bold text-[8px] text-center"
                              >
                                OFF
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              ) : activeTab === 'MODEL_DETAIL' && selectedModel ? (
                /* MODEL DETAILS (9 KEY TABS + FULL AI CONTROLS) */
                <motion.div 
                  key="model-detail"
                  initial={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-terminal-border">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setActiveTab('MODELS')}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-terminal-border text-xs font-mono text-terminal-muted hover:text-white"
                      >
                        ← Back to Registry
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-white uppercase font-mono">#{selectedModel.id} {selectedModel.displayName}</h2>
                          <StatusBadge status={selectedModel.status} variant={selectedModel.status === 'PRODUCTION' ? 'success' : 'warning'} />
                        </div>
                        <p className="text-xs text-terminal-muted font-mono">{selectedModel.role} • Strategy: {selectedModel.strategy} • Provider: {selectedModel.provider}</p>
                      </div>
                    </div>

                    {/* AI CONTROLS BAR FOR INDIVIDUAL MODEL */}
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                      <button 
                        onClick={() => handleModelControl(selectedModel.id, 'ON')}
                        className="px-2.5 py-1 bg-terminal-green/20 border border-terminal-green text-terminal-green hover:bg-terminal-green/30 font-bold"
                      >
                        ON
                      </button>
                      <button 
                        onClick={() => handleModelControl(selectedModel.id, 'OFF')}
                        className="px-2.5 py-1 bg-terminal-red/20 border border-terminal-red text-terminal-red hover:bg-terminal-red/30 font-bold"
                      >
                        OFF
                      </button>
                      <button 
                        onClick={() => handleModelControl(selectedModel.id, 'PAUSE')}
                        className="px-2.5 py-1 bg-terminal-amber/20 border border-terminal-amber text-terminal-amber hover:bg-terminal-amber/30 font-bold"
                      >
                        PAUSE
                      </button>
                      <button 
                        onClick={() => handleModelControl(selectedModel.id, 'RESUME')}
                        className="px-2.5 py-1 bg-terminal-blue/20 border border-terminal-blue text-terminal-blue hover:bg-terminal-blue/30 font-bold"
                      >
                        RESUME
                      </button>
                      <button 
                        onClick={() => handleModelControl(selectedModel.id, 'RESTART')}
                        className="px-2.5 py-1 bg-white/10 border border-white/30 text-white hover:bg-white/20 font-bold"
                      >
                        RESTART
                      </button>
                      <button 
                        onClick={() => handleModelControl(selectedModel.id, 'EMERGENCY_STOP')}
                        className="px-2.5 py-1 bg-terminal-red/40 border border-terminal-red text-terminal-red font-bold flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>EMERGENCY STOP</span>
                      </button>
                      <button 
                        onClick={() => handleModelControl(selectedModel.id, 'HEALTH_CHECK')}
                        className="px-2.5 py-1 bg-terminal-green/10 border border-terminal-green/40 text-terminal-green font-bold"
                      >
                        HEALTH CHECK
                      </button>
                    </div>
                  </div>

                  {/* 9 MODEL DETAIL TABS */}
                  <div className="flex gap-1 border-b border-terminal-border pb-2 overflow-x-auto scrollbar-hide font-mono text-[10px]">
                    {[
                      { id: 'OVERVIEW', label: 'Overview' },
                      { id: 'PERFORMANCE', label: 'Performance' },
                      { id: 'LIFECYCLE', label: 'Lifecycle' },
                      { id: 'TRADES', label: 'Trades' },
                      { id: 'MEMORY', label: 'Memory' },
                      { id: 'LEARNING', label: 'Learning' },
                      { id: 'KNOWLEDGE', label: 'Knowledge' },
                      { id: 'HISTORY', label: 'History' },
                      { id: 'SETTINGS', label: 'Settings' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setModelDetailTab(tab.id as any)}
                        className={cn(
                          "px-3 py-1.5 font-bold uppercase tracking-widest rounded border transition-colors",
                          modelDetailTab === tab.id ? "bg-terminal-amber/20 border-terminal-amber text-terminal-amber" : "bg-transparent border-transparent text-terminal-muted hover:text-white hover:bg-white/5"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {modelDetailTab === 'OVERVIEW' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                      <MetricCard label="Current Task" value={selectedModel.currentTask} icon={<Activity className="w-4 h-4 text-terminal-amber" />} />
                      <MetricCard label="Current Trade" value={selectedModel.currentTrade} icon={<TrendingUp className="w-4 h-4 text-terminal-green" />} />
                      <MetricCard label="Last Decision" value={selectedModel.lastDecision} icon={<Brain className="w-4 h-4 text-terminal-blue" />} />
                    </div>
                  )}

                  {modelDetailTab === 'PERFORMANCE' && (
                    <div className="grid grid-cols-4 gap-4 font-mono">
                      <MetricCard label="Win Rate" value={selectedModel.winRate} color="text-terminal-green" icon={<Trophy className="w-4 h-4 text-terminal-green" />} />
                      <MetricCard label="Confidence" value={selectedModel.confidence} color="text-terminal-blue" icon={<Activity className="w-4 h-4 text-terminal-blue" />} />
                      <MetricCard label="Accuracy" value={selectedModel.accuracy} color="text-terminal-blue" icon={<ShieldCheck className="w-4 h-4 text-terminal-blue" />} />
                      <MetricCard label="Allocated Capital" value={selectedModel.capital} color="text-terminal-amber" icon={<Wallet className="w-4 h-4 text-terminal-amber" />} />
                    </div>
                  )}

                  {modelDetailTab === 'LIFECYCLE' && (
                    <Panel headerProps={{ title: `Lifecycle Tracker: ${selectedModel.displayName}`, icon: RefreshCcw }}>
                      <div className="p-4 space-y-4 font-mono text-xs">
                        <p className="text-terminal-muted">Current Pipeline Stage: <strong className="text-terminal-green">{selectedModel.lifecycleStage}</strong></p>
                        <div className="grid grid-cols-6 gap-2">
                          {lifecycleSteps.map((step, idx) => (
                            <div key={step} className={cn("p-2 border text-center text-[9px]", idx < 8 ? "bg-terminal-green/10 border-terminal-green text-terminal-green font-bold" : idx === 8 ? "bg-terminal-amber/20 border-terminal-amber text-terminal-amber font-bold animate-pulse" : "bg-black/30 border-terminal-border text-terminal-muted")}>
                              #{idx+1} {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Panel>
                  )}

                  {modelDetailTab === 'TRADES' && (
                    <Panel headerProps={{ title: "Current & Active Trade Executions", icon: TrendingUp }}>
                      <div className="p-4 space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center p-3 bg-black/40 border border-terminal-border">
                          <div>
                            <span className="text-terminal-green font-bold">{selectedModel.currentTrade}</span>
                            <p className="text-terminal-muted text-[10px] mt-0.5">Execution Confidence: {selectedModel.confidence} • Risk: {selectedModel.risk}</p>
                          </div>
                          <StatusBadge status="ACTIVE" variant="success" />
                        </div>
                      </div>
                    </Panel>
                  )}

                  {modelDetailTab === 'MEMORY' && (
                    <Panel headerProps={{ title: "Model Memory Cache", icon: BrainCircuit }}>
                      <div className="p-4 space-y-2 font-mono text-xs text-terminal-muted">
                        <div>Working Memory: Volatility matrix cached cleanly. Pattern Match Score: {selectedModel.confidence}.</div>
                        <div>Long-term Memory: 142 historical trades indexed.</div>
                      </div>
                    </Panel>
                  )}

                  {modelDetailTab === 'LEARNING' && (
                    <Panel headerProps={{ title: "Learning & Evolutionary Cycle", icon: Dna }}>
                      <div className="p-4 space-y-2 font-mono text-xs text-terminal-muted">
                        <div>Generation: 14 • Mutation Rate: 1.4% • Convergence: Optimal</div>
                        <div>Model accuracy benchmark score: {selectedModel.accuracy}</div>
                      </div>
                    </Panel>
                  )}

                  {modelDetailTab === 'KNOWLEDGE' && (
                    <Panel headerProps={{ title: "Knowledge Graph Connections", icon: Network }}>
                      <div className="p-4 space-y-2 font-mono text-xs text-terminal-muted">
                        <div>Linked Graph Nodes: Fed Rate Policy, Sector ETF Liquidity, Options Delta Index.</div>
                      </div>
                    </Panel>
                  )}

                  {modelDetailTab === 'HISTORY' && (
                    <Panel headerProps={{ title: "Decision Telemetry History", icon: FileText }}>
                      <div className="p-4 space-y-1 font-mono text-xs text-terminal-muted">
                        <div>[03:41:00] Signal generated: {selectedModel.lastDecision}</div>
                        <div>[03:40:00] Task executed: {selectedModel.currentTask}</div>
                      </div>
                    </Panel>
                  )}

                  {modelDetailTab === 'SETTINGS' && (
                    <Panel headerProps={{ title: "Model System Configuration", icon: Server }}>
                      <div className="p-4 space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center">
                          <span>Assigned Strategy</span>
                          <span className="text-terminal-amber">{selectedModel.strategy}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Capital Limit</span>
                          <span className="text-terminal-blue">{selectedModel.capital}</span>
                        </div>
                      </div>
                    </Panel>
                  )}
                </motion.div>
              ) : activeTab === 'MEMORY' ? (
                <AIMemoryWorkspace showToast={showToast} />
              ) : activeTab === 'KNOWLEDGE' ? (
                /* KNOWLEDGE SUBSYSTEM */
                <motion.div 
                  key="knowledge"
                  initial={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-terminal-blue" />
                      <h2 className="text-xs font-bold uppercase font-mono tracking-widest text-terminal-blue">Enterprise Knowledge Subsystem</h2>
                    </div>
                    <div className="flex gap-1 font-mono text-[10px]">
                      {(['GRAPH', 'NODES', 'RELATIONS', 'CONTEXT', 'SOURCES'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setKnowledgeTab(tab)}
                          className={cn(
                            "px-2.5 py-1 border transition-colors font-bold",
                            knowledgeTab === tab 
                              ? "bg-terminal-blue text-black border-terminal-blue" 
                              : "border-terminal-border text-terminal-muted hover:text-white"
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
                    <Panel headerProps={{ title: "Knowledge Nodes", icon: Boxes }}>
                      <DataTable 
                        data={ensureArray(knowledgeNodes).length > 0 ? knowledgeNodes : [
                          { id: 'n1', name: 'NIFTY 50 Index', type: 'MARKET_ENTITY', status: 'ACTIVE' },
                          { id: 'n2', name: 'Fed Policy Rates', type: 'MACRO_INDICATOR', status: 'ACTIVE' },
                          { id: 'n3', name: 'IT Sector ETF', type: 'SECTOR', status: 'ACTIVE' },
                          { id: 'n4', name: 'Volatility VIX', type: 'RISK_FACTOR', status: 'ACTIVE' }
                        ]}
                        columns={[
                          { header: 'Node ID', accessor: 'id', className: "text-terminal-muted w-16" },
                          { header: 'Node Name', accessor: 'name', className: "font-bold text-white" },
                          { header: 'Type', accessor: (r: any) => <span className="text-terminal-blue">{r.type}</span> },
                          { header: 'Status', accessor: (r: any) => <StatusBadge status={r.status} variant="success" />, align: 'right' }
                        ]}
                      />
                    </Panel>

                    <Panel headerProps={{ title: "Relations & Edges", icon: Share2 }}>
                      <DataTable 
                        data={ensureArray(knowledgeEdges).length > 0 ? knowledgeEdges : [
                          { id: 'e1', source: 'Fed Policy Rates', edgeType: 'INFLUENCES', target: 'IT Sector ETF' },
                          { id: 'e2', source: 'NIFTY 50 Index', edgeType: 'CORRELATED_WITH', target: 'Volatility VIX' },
                          { id: 'e3', source: 'IT Sector ETF', edgeType: 'COMPONENT_OF', target: 'NIFTY 50 Index' }
                        ]}
                        columns={[
                          { header: 'Source', accessor: 'source', className: "font-bold text-white" },
                          { header: 'Relation', accessor: (r: any) => <span className="text-terminal-amber">{r.edgeType}</span> },
                          { header: 'Target', accessor: 'target', className: "text-terminal-blue" }
                        ]}
                      />
                    </Panel>
                  </div>
                </motion.div>
              ) : activeTab === 'DECISION' ? (
                <AIDecisionEngineWorkspace showToast={showToast} />
              ) : activeTab === 'CONSTITUTION' ? (
                <AITradeConstitutionWorkspace showToast={showToast} />
              ) : activeTab === 'GOVERNANCE' ? (
                <AICommitteeGovernanceWorkspace showToast={showToast} />
              ) : activeTab === 'LEARNING' ? (
                <LearningEvolutionWorkspace initialTab="POST_TRADE" />
              ) : activeTab === 'MEMORY' ? (
                <AIMemoryWorkspace showToast={showToast} />
              ) : activeTab === 'KNOWLEDGE' ? (
                <LearningEvolutionWorkspace initialTab="KNOWLEDGE" />
              ) : activeTab === 'EVOLUTION' ? (
                <LearningEvolutionWorkspace initialTab="EVOLUTION" />
              ) : activeTab === 'BRAIN' ? (
                <AICentralBrainWorkspace showToast={showToast} />
              ) : activeTab === 'LIFECYCLE' ? (
                /* AI LIFECYCLE PIPELINE */
                <motion.div 
                  key="lifecycle"
                  initial={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-terminal-amber font-mono">Official 17-Step Trading Lifecycle Protocol</h2>
                    <span className="px-3 py-1 bg-terminal-green/10 text-terminal-green border border-terminal-green/30 rounded font-mono text-xs">PIPELINE: ACTIVE</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {lifecycleSteps.map((step, idx) => (
                      <div key={step} className="p-3 bg-terminal-panel border border-terminal-border rounded flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-1 font-mono text-[9px] text-terminal-muted">
                          <span>STAGE {idx + 1}</span>
                          <div className={cn("w-2 h-2 rounded-full", idx < 8 ? "bg-terminal-green" : idx === 8 ? "bg-terminal-amber animate-pulse" : "bg-terminal-muted/40")} />
                        </div>
                        <h4 className="text-xs font-bold text-white font-mono">{step}</h4>
                        <span className="text-[9px] font-mono text-terminal-muted mt-2">{idx < 8 ? 'COMPLETED' : idx === 8 ? 'ACTIVE' : 'QUEUED'}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : activeTab === 'LEADERBOARD' ? (
                /* LEADERBOARD */
                <motion.div 
                  key="leaderboard"
                  initial={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  <Panel headerProps={{ title: "Institutional Model Tournament Rankings", icon: Trophy }}>
                    <DataTable 
                      data={modelList.map((m, idx) => ({ ...m, rank: idx + 1 })).sort((a,b) => parseFloat(b.winRate) - parseFloat(a.winRate))}
                      columns={[
                        { header: 'Rank', accessor: (m: any) => <span className="font-mono text-terminal-amber font-bold">#{m.rank}</span>, className: "w-16" },
                        { header: 'Model Name', accessor: 'displayName', className: "font-bold text-white" },
                        { header: 'Role', accessor: 'role', className: "text-terminal-muted italic" },
                        { header: 'Win Rate', accessor: 'winRate', className: "text-terminal-green font-bold font-mono" },
                        { header: 'Confidence', accessor: 'confidence', className: "text-terminal-blue font-mono" },
                        { header: 'Capital', accessor: 'capital', className: "text-white font-mono" }
                      ]}
                    />
                  </Panel>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

      {/* FLOATING GLASS ENTERPRISE BOTTOM TERMINAL */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 z-30 transition-all duration-250 ease-in-out backdrop-blur-md bg-terminal-panel/95 border-t border-terminal-border/60 shadow-2xl flex flex-col overflow-hidden",
        isConsoleExpanded ? "h-64" : "h-10"
      )}>
        {/* Compact Strip Header */}
        <div className="h-10 px-4 flex items-center justify-between shrink-0 select-none cursor-pointer" onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
              <span className="text-[10px] font-mono text-white font-bold uppercase tracking-wider">Kernel Terminal ● AI Ready</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-terminal-muted">
              <span>WS: <strong className="text-terminal-blue">CONNECTED</strong></span>
              <span>Health: <strong className="text-terminal-green">99.9%</strong></span>
              <span>Active Queue: <strong className="text-terminal-amber">14</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isConsoleExpanded && (
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide mr-4" onClick={(e) => e.stopPropagation()}>
                {[
                  { id: 'MATRIX', label: 'Resource Matrix' },
                  { id: 'RUNTIME_LOGS', label: 'Runtime Logs' },
                  { id: 'SCHEDULER_LOGS', label: 'Scheduler Logs' },
                  { id: 'AI_EVENTS', label: 'AI Events' },
                  { id: 'EXECUTION_EVENTS', label: 'Execution Events' },
                  { id: 'MEMORY_EVENTS', label: 'Memory Events' },
                  { id: 'DECISION_EVENTS', label: 'Decision Events' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setConsoleTab(tab.id as any)}
                    className={cn(
                      "px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest transition-colors rounded",
                      consoleTab === tab.id 
                        ? "bg-terminal-amber/20 text-terminal-amber border border-terminal-amber/40" 
                        : "text-terminal-muted hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
            <button className="flex items-center gap-1 text-[10px] font-mono text-terminal-amber hover:text-white transition-colors px-2 py-0.5 bg-terminal-amber/10 border border-terminal-amber/30 rounded">
              <span>{isConsoleExpanded ? 'Collapse ↓' : 'Expand ↑'}</span>
            </button>
          </div>
        </div>

        {/* Expanded Content Body */}
        {isConsoleExpanded && (
          <div className="flex-1 overflow-auto p-3 border-t border-terminal-border/40">
            {consoleTab === 'MATRIX' && (
              <DataBoundary data={usage} title="Resource Usage">
                <DataTable 
                  data={ensureArray(usage).length > 0 ? usage : [
                    { id: 1, timestamp: Date.now() - 5000, modelName: 'GPT-5', promptTokens: 1240, completionTokens: 320, totalTokens: 1560, latencyMs: 142 },
                    { id: 2, timestamp: Date.now() - 15000, modelName: 'Claude Sonnet 5', promptTokens: 890, completionTokens: 210, totalTokens: 1100, latencyMs: 118 },
                    { id: 3, timestamp: Date.now() - 30000, modelName: 'DeepSeek R1', promptTokens: 2400, completionTokens: 520, totalTokens: 2920, latencyMs: 185 }
                  ]}
                  columns={[
                    { header: 'Timestamp', accessor: (u) => safeFormat(u.timestamp, 'HH:mm:ss'), className: "text-terminal-muted" },
                    { header: 'Model', accessor: (u) => <span className="font-bold text-white uppercase">{u.modelName}</span> },
                    { header: 'P-Tokens', accessor: (u) => (u.promptTokens ?? 0).toLocaleString(), align: 'right', className: "tabular-nums opacity-80" },
                    { header: 'C-Tokens', accessor: (u) => (u.completionTokens ?? 0).toLocaleString(), align: 'right', className: "tabular-nums opacity-80" },
                    { header: 'Total', accessor: (u) => (u.totalTokens ?? 0).toLocaleString(), align: 'right', className: "tabular-nums font-bold" },
                    { header: 'Latency', accessor: (u) => `${u.latencyMs}ms`, align: 'right', className: "tabular-nums text-terminal-blue" }
                  ]}
                />
              </DataBoundary>
            )}

            {consoleTab === 'RUNTIME_LOGS' && (
              <div className="space-y-1 font-mono text-[10px] text-terminal-muted p-2">
                <div className="flex items-center gap-2 text-terminal-green"><span className="opacity-60">[03:42:01]</span><span>[INFO] AI Kernel runtime supervisor initialized successfully.</span></div>
                <div className="flex items-center gap-2 text-terminal-blue"><span className="opacity-60">[03:42:15]</span><span>[DEBUG] Model weights synchronized across all 28 active models.</span></div>
                <div className="flex items-center gap-2 text-terminal-green"><span className="opacity-60">[03:42:30]</span><span>[INFO] Decision consensus loop executed with 99.4% confidence score.</span></div>
              </div>
            )}

            {consoleTab === 'SCHEDULER_LOGS' && (
              <div className="space-y-1 font-mono text-[10px] text-terminal-muted p-2">
                <div className="flex items-center gap-2 text-terminal-amber"><span className="opacity-60">[03:40:00]</span><span>[SCHEDULER] Periodic model rebalancing task triggered.</span></div>
                <div className="flex items-center gap-2 text-terminal-green"><span className="opacity-60">[03:40:02]</span><span>[SCHEDULER] Task ID t-9182 completed in 1.4s. Status: SUCCESS.</span></div>
              </div>
            )}

            {consoleTab === 'AI_EVENTS' && (
              <div className="space-y-1 font-mono text-[10px] text-terminal-muted p-2">
                <div className="flex items-center gap-2 text-terminal-blue"><span className="opacity-60">[03:41:10]</span><span>[EVENT] AI Model AlphaFlow-v3.2 mutated generation 14 successfully.</span></div>
                <div className="flex items-center gap-2 text-white"><span className="opacity-60">[03:41:50]</span><span>[EVENT] Consensus reached between GPT-5 and Claude Sonnet 5 on NIFTY buy signal.</span></div>
              </div>
            )}

            {consoleTab === 'EXECUTION_EVENTS' && (
              <div className="space-y-1 font-mono text-[10px] text-terminal-muted p-2">
                <div className="flex items-center gap-2 text-terminal-green"><span className="opacity-60">[03:39:12]</span><span>[EXECUTION] Order executed: BUY 500 NIFTY 22400 CE @ $185.50 (Confidence: 94.8%).</span></div>
              </div>
            )}

            {consoleTab === 'MEMORY_EVENTS' && (
              <div className="space-y-1 font-mono text-[10px] text-terminal-muted p-2">
                <div className="flex items-center gap-2 text-terminal-blue"><span className="opacity-60">[03:38:00]</span><span>[MEMORY] Long-term working memory checkpoint saved.</span></div>
              </div>
            )}

            {consoleTab === 'DECISION_EVENTS' && (
              <div className="space-y-1 font-mono text-[10px] text-terminal-muted p-2">
                <div className="flex items-center gap-2 text-terminal-green"><span className="opacity-60">[03:41:00]</span><span>[DECISION] Signal approved for execution by RiskGuardian-v2. Risk score: 0.12.</span></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
