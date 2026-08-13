import React, { useState, useMemo, useEffect } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  RefreshCcw, 
  Download, 
  Power, 
  Sliders, 
  Search, 
  Filter, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldAlert, 
  Lock, 
  Zap,
  Check,
  Plus,
  Play,
  Pause,
  Server,
  Layers,
  Database,
  GitBranch,
  RotateCw,
  ArrowRight,
  Network,
  Terminal as TerminalIcon,
  ArrowDown,
  Sparkles,
  Radio,
  HardDrive,
  BarChart3,
  Brain,
  Boxes,
  FileText,
  ListFilter,
  SlidersHorizontal,
  Share2,
  LifeBuoy,
  Workflow,
  Crosshair,
  RotateCcw,
  History,
  Send,
  Command,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AICentralBrainProps {
  showToast: (msg: string) => void;
}

// Data Models
interface QueueNode {
  id: string;
  name: string;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  avgTimeMs: number;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  iconName: string;
  description: string;
}

interface SchedulerTask {
  id: string;
  name: string;
  model: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  status: 'RUNNING' | 'WAITING' | 'RETRY' | 'BLOCKED' | 'COMPLETED';
  eta: string;
  dependencies: string;
  retryCount: number;
  executionTimeMs: number;
  category: string;
}

interface ModuleCommunicationStep {
  id: string;
  from: string;
  to: string;
  request: string;
  response: string;
  latencyMs: number;
  healthPct: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'BUSY';
}

interface SystemEvent {
  id: string;
  timestamp: string;
  category: 'RESEARCH' | 'DECISION' | 'COMMITTEE' | 'MEMORY' | 'KNOWLEDGE' | 'MODEL' | 'EVOLUTION' | 'RECOVERY';
  severity: 'SUCCESS' | 'WARN' | 'CRITICAL' | 'INFO';
  title: string;
  details: string;
  module: string;
  aiModel?: string;
}

interface FailureProtocol {
  id: string;
  type: string;
  triggerCondition: string;
  status: 'STANDBY' | 'ARMED' | 'RECOVERING' | 'RESOLVED';
  recoveryAction: string;
  rollbackStrategy: string;
  retryPolicy: string;
  lastIncident: string;
}

interface ArchNode {
  id: string;
  title: string;
  subtext: string;
  type: 'SOURCE' | 'CORE' | 'PROCESSOR' | 'STORAGE' | 'EVALUATOR';
  status: 'ACTIVE' | 'SYNCED' | 'PROCESSING';
  inboundRate: string;
  outboundRate: string;
  assignedModels: string[];
}

interface ConsensusVote {
  model: string;
  vote: 'ACCEPTED' | 'REJECTED' | 'ABSTAIN';
  weight: number;
  confidence: number;
  rationale: string;
}

interface ModelTokenMetric {
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  status: 'ONLINE' | 'STANDBY' | 'HIGH_LOAD';
}

export const AICentralBrainWorkspace: React.FC<AICentralBrainProps> = ({ showToast }) => {
  // Global States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSchedulerPaused, setIsSchedulerPaused] = useState(false);
  const [failureDrillActive, setFailureDrillActive] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  // Section 2: Pipeline State
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);

  // Section 3: Scheduler Filters & Controls
  const [schedulerSearch, setSchedulerSearch] = useState('');
  const [schedulerPriorityFilter, setSchedulerPriorityFilter] = useState<string>('ALL');
  const [schedulerStatusFilter, setSchedulerStatusFilter] = useState<string>('ALL');

  // Section 5: Work Dispatcher Tabs & Custom Dispatch Modal
  const [dispatcherTab, setDispatcherTab] = useState<'CURRENT' | 'WAITING' | 'BLOCKED' | 'RETRY' | 'COMPLETED'>('CURRENT');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [newJobModel, setNewJobModel] = useState('Gemini 2.5 Pro Enterprise');
  const [newJobPriority, setNewJobPriority] = useState<'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW'>('HIGH');
  const [newJobCategory, setNewJobCategory] = useState('Research');

  // Section 6: Event Timeline Filters
  const [eventFilterCategory, setEventFilterCategory] = useState<string>('ALL');
  const [eventFilterSeverity, setEventFilterSeverity] = useState<string>('ALL');
  const [eventSearch, setEventSearch] = useState('');

  // Section 7: Resource Allocation Adjustments
  const [cpuCap, setCpuCap] = useState(64);
  const [gpuCap, setGpuCap] = useState(16);
  const [learningBandwidth, setLearningBandwidth] = useState(90);

  // Modal / Drawer States
  const [inspectTask, setInspectTask] = useState<SchedulerTask | null>(null);
  const [inspectCommStep, setInspectCommStep] = useState<ModuleCommunicationStep | null>(null);
  const [inspectArchNode, setInspectArchNode] = useState<ArchNode | null>(null);

  // Keyboard shortcut for command palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Actions
  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Central Brain master orchestration telemetry re-synchronized across 10 queues.');
    }, 600);
  };

  const handleRestartCluster = () => {
    showToast('Orchestration Kernel cluster restarted. All 64 threads re-aligned in 11ms.');
  };

  const handleToggleScheduler = () => {
    setIsSchedulerPaused(!isSchedulerPaused);
    showToast(isSchedulerPaused ? 'Central Brain Scheduler RESUMED.' : 'Central Brain Scheduler PAUSED.');
  };

  const handleToggleFailureDrill = () => {
    setFailureDrillActive(!failureDrillActive);
    showToast(failureDrillActive ? 'Failure Drill Mode deactivated.' : 'Failure Drill Mode ACTIVATED — Injecting synthetic fault tests.');
  };

  const handleExportSnapshot = () => {
    showToast('Central Brain system snapshot & kernel execution graph exported (JSON).');
  };

  const handleFlushCache = () => {
    showToast('Vector memory & OpenRouter context caches flushed successfully (0.0ms latency).');
  };

  const handleEmergencyStop = () => {
    setIsSchedulerPaused(true);
    showToast('EMERGENCY STOP TRIGGERED: All active AI worker threads suspended. Safety lockdown enforced.');
  };

  // Section 2 Data: Pipeline Queues
  const queues: QueueNode[] = [
    { id: 'Q1_RESEARCH', name: 'Research Queue', pending: 2, running: 1, completed: 4210, failed: 0, avgTimeMs: 18.4, priority: 'HIGH', iconName: 'Search', description: 'Raw market feeds, macro sentiment & vector signal discovery' },
    { id: 'Q2_ANALYTICS', name: 'Analytics Queue', pending: 3, running: 2, completed: 3890, failed: 1, avgTimeMs: 12.1, priority: 'HIGH', iconName: 'BarChart3', description: 'Multi-factor risk scoring, volatility surface & correlation matrix' },
    { id: 'Q3_STRATEGY', name: 'Strategy Queue', pending: 1, running: 1, completed: 3410, failed: 0, avgTimeMs: 14.8, priority: 'NORMAL', iconName: 'Workflow', description: 'Alpha strategy matching, entry/exit signal derivation' },
    { id: 'Q4_DECISION', name: 'Decision Queue', pending: 2, running: 1, completed: 3120, failed: 0, avgTimeMs: 9.6, priority: 'CRITICAL', iconName: 'Brain', description: 'Primary decision proposal generation & trade parameter packaging' },
    { id: 'Q5_COMMITTEE', name: 'Committee Queue', pending: 1, running: 1, completed: 2980, failed: 2, avgTimeMs: 24.5, priority: 'CRITICAL', iconName: 'ShieldCheck', description: 'Multi-agent voting, constitutional veto evaluation & quorum verification' },
    { id: 'Q6_EXECUTION', name: 'Execution Queue', pending: 0, running: 1, completed: 2840, failed: 0, avgTimeMs: 4.2, priority: 'CRITICAL', iconName: 'Zap', description: 'Smart order routing, DMA gateway dispatch & paper trading execution' },
    { id: 'Q7_MEMORY', name: 'Memory Queue', pending: 4, running: 2, completed: 5120, failed: 0, avgTimeMs: 8.1, priority: 'NORMAL', iconName: 'Database', description: 'Short-term context caching, working memory & trade state logging' },
    { id: 'Q8_LEARNING', name: 'Learning Queue', pending: 2, running: 1, completed: 1890, failed: 0, avgTimeMs: 32.0, priority: 'HIGH', iconName: 'Sparkles', description: 'Post-trade loss/gain attribution, reward scaling & pattern indexing' },
    { id: 'Q9_EVOLUTION', name: 'Evolution Queue', pending: 1, running: 0, completed: 410, failed: 0, avgTimeMs: 145.0, priority: 'NORMAL', iconName: 'GitBranch', description: 'Prompt weight tuning, neural mutation & strategy evolution' },
    { id: 'Q10_TOURNAMENT', name: 'Tournament Queue', pending: 0, running: 0, completed: 180, failed: 0, avgTimeMs: 210.0, priority: 'NORMAL', iconName: 'Crosshair', description: 'Model ELO leaderboard updates, competitive arena matches & ranking' },
  ];

  // Section 3 Data: Real-time Tasks
  const [tasks, setTasks] = useState<SchedulerTask[]>([
    { id: 'TSK-90101', name: 'NIFTY50 Volatility Surface Calibration', model: 'Gemini 2.5 Pro', priority: 'CRITICAL', status: 'RUNNING', eta: '0.2s', dependencies: 'Q1-RES-881', retryCount: 0, executionTimeMs: 142, category: 'Analytics' },
    { id: 'TSK-90102', name: 'Constitutional Invariant Check #412', model: 'Claude 3.5 Sonnet', priority: 'CRITICAL', status: 'RUNNING', eta: '0.1s', dependencies: 'Q4-DEC-109', retryCount: 0, executionTimeMs: 88, category: 'Committee' },
    { id: 'TSK-90103', name: 'MCX Gold / Crude Spread Arbitrage Scan', model: 'DeepSeek R1', priority: 'HIGH', status: 'WAITING', eta: '0.8s', dependencies: 'Q2-ANA-312', retryCount: 0, executionTimeMs: 0, category: 'Research' },
    { id: 'TSK-90104', name: 'Order Book Imbalance Audit (NSE Top 20)', model: 'GPT-4o', priority: 'HIGH', status: 'WAITING', eta: '1.2s', dependencies: 'NONE', retryCount: 0, executionTimeMs: 0, category: 'Analytics' },
    { id: 'TSK-90105', name: 'LMEOS Vector Embedding Index Sync', model: 'Llama 3.3 70B', priority: 'NORMAL', status: 'RUNNING', eta: '0.4s', dependencies: 'Q7-MEM-990', retryCount: 0, executionTimeMs: 210, category: 'Memory' },
    { id: 'TSK-90106', name: 'BankNifty Straddle Volatility Rebalance', model: 'Mistral Large 2', priority: 'HIGH', status: 'BLOCKED', eta: 'WAITING_QUORUM', dependencies: 'Q5-COM-004', retryCount: 1, executionTimeMs: 0, category: 'Strategy' },
    { id: 'TSK-90107', name: 'Loss Attribution Post-Mortem #8821', model: 'ARINA-Omni-v3', priority: 'NORMAL', status: 'RETRY', eta: '2.0s', dependencies: 'Q6-EXEC-112', retryCount: 2, executionTimeMs: 410, category: 'Learning' },
    { id: 'TSK-90108', name: 'Daily Checkpoint Snapshot Compression', model: 'Kernel Cron Scheduler', priority: 'LOW', status: 'WAITING', eta: '4.5s', dependencies: 'NONE', retryCount: 0, executionTimeMs: 0, category: 'System' },
    { id: 'TSK-90109', name: 'Macro Economic Interest Rate Ingestion', model: 'Perplexity Sonar Deep', priority: 'HIGH', status: 'COMPLETED', eta: 'DONE', dependencies: 'NONE', retryCount: 0, executionTimeMs: 312, category: 'Research' },
    { id: 'TSK-90110', name: 'Multi-Agent ELO Tournament Round #42', model: 'Tournament Master Engine', priority: 'LOW', status: 'COMPLETED', eta: 'DONE', dependencies: 'Q9-EVO-088', retryCount: 0, executionTimeMs: 1240, category: 'Tournament' }
  ]);

  // Section 4 Data: Inter-Module Matrix
  const commMatrix: ModuleCommunicationStep[] = [
    { id: 'BUS-01', from: 'Research', to: 'Analytics', request: 'REQ-9012: Alpha Feature Vectors', response: 'RESP-9012: Factor Matrix Verified', latencyMs: 3.4, healthPct: 100, status: 'OPTIMAL' },
    { id: 'BUS-02', from: 'Analytics', to: 'Decision Engine', request: 'REQ-9013: Volatility & VaR Limits', response: 'RESP-9013: 0.04% VaR Boundary Approved', latencyMs: 2.8, healthPct: 100, status: 'OPTIMAL' },
    { id: 'BUS-03', from: 'Decision Engine', to: 'Committee', request: 'REQ-9014: Long RELIANCE Trade Proposal', response: 'RESP-9014: 7/7 Votes Approved (100% Quorum)', latencyMs: 8.2, healthPct: 99, status: 'OPTIMAL' },
    { id: 'BUS-04', from: 'Committee', to: 'Paper Trading', request: 'REQ-9015: Dispatch DMA Order #8821', response: 'RESP-9015: Order Executed at ₹3,145.00', latencyMs: 4.1, healthPct: 100, status: 'OPTIMAL' },
    { id: 'BUS-05', from: 'Paper Trading', to: 'Learning', request: 'REQ-9016: Trade Fill Telemetry & Slippage', response: 'RESP-9016: Slippage 0.2 bps Logged', latencyMs: 1.9, healthPct: 100, status: 'OPTIMAL' },
    { id: 'BUS-06', from: 'Learning', to: 'Memory', request: 'REQ-9017: Index Trade Outcome Vector', response: 'RESP-9017: Vector Graph Hash #9981 Saved', latencyMs: 2.2, healthPct: 100, status: 'OPTIMAL' },
    { id: 'BUS-07', from: 'Memory', to: 'Knowledge Graph', request: 'REQ-9018: Connect Reliance-Crude Edge', response: 'RESP-9018: Edge Weight Updated (+0.14)', latencyMs: 5.6, healthPct: 98, status: 'OPTIMAL' },
    { id: 'BUS-08', from: 'Knowledge Graph', to: 'Evolution', request: 'REQ-9019: Feed High-Score Pattern Matrix', response: 'RESP-9019: Prompt Weights Mutated v3.2.1', latencyMs: 14.2, healthPct: 96, status: 'DEGRADED' },
    { id: 'BUS-09', from: 'Evolution', to: 'Tournament', request: 'REQ-9020: Submit Mutated Model Candidate', response: 'RESP-9020: Candidate Entered Season Match', latencyMs: 11.0, healthPct: 100, status: 'OPTIMAL' }
  ];

  // Section 6 Data: Events Timeline
  const [events, setEvents] = useState<SystemEvent[]>([
    { id: 'EV-801', timestamp: '10:48:12.412', category: 'RESEARCH', severity: 'SUCCESS', title: 'Macro Sentiment Research Completed', details: 'Ingested 1,200 financial headlines; sentiment index score 0.74 (Bullish).', module: 'Research Center', aiModel: 'Gemini 2.5 Pro' },
    { id: 'EV-802', timestamp: '10:47:55.109', category: 'DECISION', severity: 'SUCCESS', title: 'Trade Proposal Formulated: RELIANCE_AUG_FUT', details: 'Long entry @ ₹3,120, target ₹3,276, adaptive stop ₹3,120. Confidence: 94.8%.', module: 'Decision Engine', aiModel: 'DeepSeek R1' },
    { id: 'EV-803', timestamp: '10:47:10.892', category: 'COMMITTEE', severity: 'WARN', title: 'High Leverage Trade Vetoed by Quorum', details: 'Proposal for 10x BankNifty Futures rejected due to Article IV CSI risk cap.', module: 'Committee Core', aiModel: 'Claude 3.5 Sonnet' },
    { id: 'EV-804', timestamp: '10:46:22.001', category: 'MEMORY', severity: 'SUCCESS', title: 'LMEOS Vector Memory Cluster Updated', details: 'Committed 18 new embedding nodes to high-speed RAM vector database.', module: 'Memory Manager', aiModel: 'Llama 3.3 70B' },
    { id: 'EV-805', timestamp: '10:45:00.120', category: 'KNOWLEDGE', severity: 'SUCCESS', title: 'Cross-Market Commodity Correlation Indexed', details: 'MCX Crude Oil ↔ NIFTY Energy sector correlation recalculated at +0.81.', module: 'Knowledge Graph', aiModel: 'GPT-4o' },
    { id: 'EV-806', timestamp: '10:42:15.500', category: 'MODEL', severity: 'WARN', title: 'Model Quarantined: Llama-3.1-8B-Deprecated', details: 'Transient inference latency exceeded 60ms threshold. Moved to Staging.', module: 'Orchestrator Kernel', aiModel: 'Orchestrator' },
    { id: 'EV-807', timestamp: '10:38:00.000', category: 'EVOLUTION', severity: 'INFO', title: 'Neural Evolution Cycle #41 Completed', details: 'Mutated prompt weights for momentum strategies; top candidate achieved +1.4% gain.', module: 'Evolution Engine', aiModel: 'Tournament Engine' },
    { id: 'EV-808', timestamp: '10:30:12.000', category: 'RECOVERY', severity: 'SUCCESS', title: 'Circuit Breaker Auto-Recovery Verified', details: 'OpenRouter fallback route restored to primary endpoint after 100% health check.', module: 'Failure Center', aiModel: 'Recovery Agent' }
  ]);

  // Section 8 Data: Failure Recovery Center
  const [failureProtocols, setFailureProtocols] = useState<FailureProtocol[]>([
    { id: 'F1', type: 'Timeout (Inference Latency > 50ms)', triggerCondition: 'P99 Latency > 50ms over 3 consecutive calls', status: 'STANDBY', recoveryAction: 'Auto-fallback to lightweight secondary model & circuit break', rollbackStrategy: 'Cancel active token request & re-queue with high priority', retryPolicy: 'Exponential backoff (100ms, 200ms, 400ms)', lastIncident: '14 hrs ago (Resolved)' },
    { id: 'F2', type: 'Model Process Crash / Exception', triggerCondition: 'Worker process exit code != 0 or silent drop', status: 'STANDBY', recoveryAction: 'Spawn fresh worker container thread & restore state from memory', rollbackStrategy: 'Rollback current task transaction to checkpoint', retryPolicy: 'Immediate single retry, then isolate model if failure repeats', lastIncident: '2 days ago (Resolved)' },
    { id: 'F3', type: 'Memory / VRAM Overflow (>85%)', triggerCondition: 'Allocated RAM > 85% or VRAM leak detected', status: 'STANDBY', recoveryAction: 'Trigger aggressive garbage collection & flush cold vector cache', rollbackStrategy: 'Offload non-critical knowledge graphs to persistent disk', retryPolicy: 'Continuous memory monitoring until RAM < 60%', lastIncident: '5 days ago (Resolved)' },
    { id: 'F4', type: 'API Provider Failure / 5xx Error', triggerCondition: '3 consecutive 502/503 HTTP responses from provider', status: 'STANDBY', recoveryAction: 'Reroute model calls via OpenRouter backup endpoint', rollbackStrategy: 'Preserve prompt state & re-dispatch to alternate LLM', retryPolicy: '3 retries with 500ms jitter', lastIncident: '1 day ago (Resolved)' },
    { id: 'F5', type: 'Queue Overflow (>100 Jobs)', triggerCondition: 'Pending queue length exceeds max capacity limit', status: 'STANDBY', recoveryAction: 'Shed low-priority background jobs & expand thread worker pool', rollbackStrategy: 'Move LOW priority jobs to persistent queue file', retryPolicy: 'Resume queued jobs as thread load drops < 40%', lastIncident: 'Never' },
    { id: 'F6', type: 'Consensus Veto / Split Vote Failure', triggerCondition: 'Committee voting quorum < 85% or deadlock', status: 'STANDBY', recoveryAction: 'Escalate to AI Trade Constitution for deterministic tie-breaker', rollbackStrategy: 'Reject trade proposal & log dissenting model rationales', retryPolicy: 'No retry without new research input packet', lastIncident: '2 hrs ago (Handled)' }
  ]);

  // Section 9 Data: AI Consensus & Voting Matrix
  const consensusVotes: ConsensusVote[] = [
    { model: 'Gemini 2.5 Pro Enterprise', vote: 'ACCEPTED', weight: 0.25, confidence: 96.5, rationale: 'High bullish momentum & stellar order book liquidity detected.' },
    { model: 'Claude 3.5 Sonnet Sentinel', vote: 'ACCEPTED', weight: 0.20, confidence: 94.0, rationale: 'Constitutional risk parameters fully respected; VaR < 0.05%.' },
    { model: 'DeepSeek R1 Quantitative', vote: 'ACCEPTED', weight: 0.20, confidence: 92.8, rationale: 'Quantitative arbitrage spread confirms positive expectancy.' },
    { model: 'GPT-4o Enterprise', vote: 'ACCEPTED', weight: 0.15, confidence: 91.2, rationale: 'Macro sentiment and news sentiment align favorably.' },
    { model: 'Llama 3.3 70B Tactical', vote: 'REJECTED', weight: 0.10, confidence: 68.0, rationale: 'Dissent: Minor intraday volatility resistance at ₹3,160.' },
    { model: 'Mistral Large 2', vote: 'ACCEPTED', weight: 0.10, confidence: 89.5, rationale: 'Technical breakout confirmed on 15m candle close.' }
  ];

  // Section 11 Data: Per-Model Token Consumption
  const modelTokenMetrics: ModelTokenMetric[] = [
    { model: 'Gemini 2.5 Pro Enterprise', inputTokens: 1420500, outputTokens: 380400, costUsd: 4.28, latencyMs: 18.4, status: 'ONLINE' },
    { model: 'Claude 3.5 Sonnet Sentinel', inputTokens: 980200, outputTokens: 210100, costUsd: 3.45, latencyMs: 22.1, status: 'ONLINE' },
    { model: 'DeepSeek R1 Quantitative', inputTokens: 1890000, outputTokens: 490000, costUsd: 2.10, latencyMs: 14.2, status: 'ONLINE' },
    { model: 'GPT-4o Enterprise', inputTokens: 850000, outputTokens: 195000, costUsd: 3.12, latencyMs: 28.5, status: 'ONLINE' },
    { model: 'Llama 3.3 70B Tactical', inputTokens: 2400000, outputTokens: 620000, costUsd: 1.20, latencyMs: 9.6, status: 'ONLINE' },
    { model: 'Mistral Large 2', inputTokens: 620000, outputTokens: 140000, costUsd: 1.05, latencyMs: 16.8, status: 'STANDBY' }
  ];

  // Section 10 Data: Architecture Topology Nodes
  const archNodes: ArchNode[] = [
    { id: 'ARCH_1', title: 'AI Models Fleet', subtext: '14 Active Models', type: 'SOURCE', status: 'ACTIVE', inboundRate: '1,420 RPM', outboundRate: '1,420 RPM', assignedModels: ['Gemini 2.5 Pro', 'Claude 3.5 Sonnet', 'DeepSeek R1', 'GPT-4o'] },
    { id: 'ARCH_2', title: 'Central Brain Kernel', subtext: 'Master Orchestrator', type: 'CORE', status: 'ACTIVE', inboundRate: '1,420 RPM', outboundRate: '3,890 RPM', assignedModels: ['Orchestrator Kernel v3.2'] },
    { id: 'ARCH_3', title: 'Decision Engine', subtext: 'Trade Proposal Generator', type: 'PROCESSOR', status: 'PROCESSING', inboundRate: '880 RPM', outboundRate: '880 RPM', assignedModels: ['Decision Engine v3.2'] },
    { id: 'ARCH_4', title: 'Committee Core', subtext: 'Quorum & Veto Control', type: 'EVALUATOR', status: 'ACTIVE', inboundRate: '880 RPM', outboundRate: '850 RPM', assignedModels: ['7-Agent Quorum Node'] },
    { id: 'ARCH_5', title: 'Paper Trading Workspace', subtext: 'Isolated Lab Execution', type: 'PROCESSOR', status: 'ACTIVE', inboundRate: '850 RPM', outboundRate: '850 RPM', assignedModels: ['NSE/BSE/MCX DMA Gateway'] },
    { id: 'ARCH_6', title: 'Learning Engine', subtext: 'Post-Trade Attribution', type: 'EVALUATOR', status: 'SYNCED', inboundRate: '850 RPM', outboundRate: '850 RPM', assignedModels: ['Reward Scaling Model'] },
    { id: 'ARCH_7', title: 'Memory Manager', subtext: 'LMEOS Vector Memory', type: 'STORAGE', status: 'SYNCED', inboundRate: '1,200 RPM', outboundRate: '2,400 RPM', assignedModels: ['Vector DB Engine'] },
    { id: 'ARCH_8', title: 'Knowledge Graph', subtext: 'Cross-Market Graph DB', type: 'STORAGE', status: 'SYNCED', inboundRate: '1,420 RPM', outboundRate: '1,420 RPM', assignedModels: ['Graph Neural Network'] },
    { id: 'ARCH_9', title: 'Evolution Engine', subtext: 'Prompt & Weight Mutation', type: 'EVALUATOR', status: 'SYNCED', inboundRate: '120 RPM', outboundRate: '120 RPM', assignedModels: ['Mutation Engine'] },
    { id: 'ARCH_10', title: 'Tournament Arena', subtext: 'ELO Ranking Leaderboard', type: 'EVALUATOR', status: 'SYNCED', inboundRate: '40 RPM', outboundRate: '40 RPM', assignedModels: ['Arena Master'] }
  ];

  // Filtering Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(schedulerSearch.toLowerCase()) || 
                          t.id.toLowerCase().includes(schedulerSearch.toLowerCase()) ||
                          t.model.toLowerCase().includes(schedulerSearch.toLowerCase());
      const matchPriority = schedulerPriorityFilter === 'ALL' || t.priority === schedulerPriorityFilter;
      const matchStatus = schedulerStatusFilter === 'ALL' || t.status === schedulerStatusFilter;
      return matchSearch && matchPriority && matchStatus;
    });
  }, [tasks, schedulerSearch, schedulerPriorityFilter, schedulerStatusFilter]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchCategory = eventFilterCategory === 'ALL' || e.category === eventFilterCategory;
      const matchSeverity = eventFilterSeverity === 'ALL' || e.severity === eventFilterSeverity;
      const matchSearch = e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
                          e.details.toLowerCase().includes(eventSearch.toLowerCase()) ||
                          e.module.toLowerCase().includes(eventSearch.toLowerCase());
      return matchCategory && matchSeverity && matchSearch;
    });
  }, [events, eventFilterCategory, eventFilterSeverity, eventSearch]);

  const dispatcherTasks = useMemo(() => {
    if (dispatcherTab === 'CURRENT') return tasks.filter(t => t.status === 'RUNNING');
    if (dispatcherTab === 'WAITING') return tasks.filter(t => t.status === 'WAITING');
    if (dispatcherTab === 'BLOCKED') return tasks.filter(t => t.status === 'BLOCKED');
    if (dispatcherTab === 'RETRY') return tasks.filter(t => t.status === 'RETRY');
    return tasks.filter(t => t.status === 'COMPLETED');
  }, [tasks, dispatcherTab]);

  const handleDispatchJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobName.trim()) {
      showToast('Task name is required.');
      return;
    }
    const newTask: SchedulerTask = {
      id: `TSK-${Math.floor(10000 + Math.random() * 90000)}`,
      name: newJobName.trim(),
      model: newJobModel,
      priority: newJobPriority,
      status: 'WAITING',
      eta: '0.5s',
      dependencies: 'NONE',
      retryCount: 0,
      executionTimeMs: 0,
      category: newJobCategory
    };
    setTasks([newTask, ...tasks]);
    setNewJobName('');
    setIsDispatchModalOpen(false);
    showToast(`Task ${newTask.id} dispatches to Central Brain Queue!`);
  };

  const handleTaskAction = (taskId: string, action: 'RUN' | 'PAUSE' | 'RETRY' | 'CANCEL') => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (action === 'RUN') return { ...t, status: 'RUNNING', eta: '0.2s' };
        if (action === 'PAUSE') return { ...t, status: 'BLOCKED', eta: 'PAUSED' };
        if (action === 'RETRY') return { ...t, status: 'RETRY', retryCount: t.retryCount + 1 };
        if (action === 'CANCEL') return { ...t, status: 'COMPLETED', eta: 'CANCELLED' };
      }
      return t;
    }));
    showToast(`Task ${taskId} updated: ${action}`);
  };

  const handleRunRecovery = (protocolId: string) => {
    setFailureProtocols(prev => prev.map(p => {
      if (p.id === protocolId) {
        return { ...p, status: 'RECOVERING' };
      }
      return p;
    }));
    showToast(`Executing recovery action for Protocol ${protocolId}...`);
    setTimeout(() => {
      setFailureProtocols(prev => prev.map(p => {
        if (p.id === protocolId) {
          return { ...p, status: 'STANDBY', lastIncident: 'Just now (Handled)' };
        }
        return p;
      }));
      showToast(`Protocol ${protocolId} recovered and restored to STANDBY!`);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 text-slate-100 p-4 lg:p-6 space-y-6 font-mono text-xs">
      
      {/* ========================================================== */}
      {/* HEADER: MASTER CENTRAL BRAIN ORCHESTRATOR                  */}
      {/* ========================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" /> AI ARINA V3.2
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold uppercase tracking-wider">Central Brain Enterprise Kernel</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg lg:text-xl font-bold font-mono tracking-tight text-white uppercase flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-400 animate-pulse" />
              Central Brain Master Orchestrator
            </h1>
            <span className={cn(
              "px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border flex items-center gap-1.5",
              isSchedulerPaused ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", isSchedulerPaused ? "bg-amber-400" : "bg-emerald-400 animate-ping")} />
              {isSchedulerPaused ? 'SCHEDULER PAUSED' : 'KERNEL ACTIVE / ORCHESTRATING'}
            </span>
            {failureDrillActive && (
              <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded text-[10px] font-bold uppercase flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> FAILURE DRILL ACTIVE
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Enterprise AI Orchestration Kernel • Ray Cluster Scheduler, OpenRouter Gateway & Multi-Agent Committee. Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-emerald-400 rounded border border-slate-700">Ctrl+K</kbd> for Command Palette.
          </p>
        </div>

        {/* SECTION 16: KERNEL ACTION CENTER BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefreshTelemetry}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded font-bold flex items-center gap-1.5 transition-colors"
            title="Refresh Central Brain Telemetry"
          >
            <RefreshCcw className={cn("w-3.5 h-3.5 text-emerald-400", isRefreshing && "animate-spin")} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRestartCluster}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded font-bold flex items-center gap-1.5 transition-colors"
            title="Restart Orchestration Kernel Cluster"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Restart Kernel</span>
          </button>

          <button
            onClick={handleToggleScheduler}
            className={cn(
              "px-3 py-1.5 border font-bold rounded flex items-center gap-1.5 transition-colors",
              isSchedulerPaused
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30"
                : "bg-slate-950 border-slate-700 text-slate-200 hover:bg-slate-800"
            )}
          >
            {isSchedulerPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isSchedulerPaused ? 'Resume Scheduler' : 'Pause Scheduler'}</span>
          </button>

          <button
            onClick={handleFlushCache}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded flex items-center gap-1.5 transition-colors"
            title="Flush Cache & Redis State"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Flush Cache</span>
          </button>

          <button
            onClick={handleEmergencyStop}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold rounded flex items-center gap-1.5 transition-colors"
            title="Emergency Stop"
          >
            <Power className="w-3.5 h-3.5 text-rose-400" />
            <span>Emergency Stop</span>
          </button>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold rounded flex items-center gap-1.5 transition-colors"
          >
            <Command className="w-3.5 h-3.5 text-purple-400" />
            <span>Command Palette (Ctrl+K)</span>
          </button>

          <button
            onClick={handleExportSnapshot}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold rounded flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Snapshot</span>
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 1: ENTERPRISE BRAIN STATUS (20 KEY METRICS)          */}
      {/* ========================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" /> Section 1: Enterprise Kernel Status & Subsystem Telemetry
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">Leader Node: node-us-east-01 &bull; Heartbeat: 4ms</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12 gap-2">
          {[
            { label: 'Kernel State', val: 'HEALTHY', sub: 'Ray Master v3', color: 'text-emerald-400', border: 'border-emerald-500/30' },
            { label: 'Scheduler', val: 'RUNNING', sub: '64 Active Threads', color: 'text-emerald-400', border: 'border-emerald-500/30' },
            { label: 'Inference Engine', val: '14 Models', sub: 'OpenRouter Gateway', color: 'text-purple-300', border: 'border-purple-500/30' },
            { label: 'Committee', val: '7/7 Quorum', sub: '100% Consensus', color: 'text-emerald-400', border: 'border-slate-800' },
            { label: 'Memory Engine', val: 'LMEOS Vector', sub: '34.2 GB RAM', color: 'text-blue-400', border: 'border-slate-800' },
            { label: 'Lifecycle Engine', val: 'SYNCHRONIZED', sub: 'Epoch #42', color: 'text-emerald-400', border: 'border-slate-800' },
            { label: 'Strategy Engine', val: '18 Alphas', sub: 'Active Scan', color: 'text-amber-400', border: 'border-amber-500/30' },
            { label: 'Risk Engine', val: '0.04% VaR', sub: 'Article IV Pass', color: 'text-emerald-400', border: 'border-slate-800' },
            { label: 'Market Feed', val: '1,420 RPM', sub: 'NSE/MCX Live', color: 'text-emerald-400', border: 'border-slate-800' },
            { label: 'Paper Trading', val: 'ISOLATED', sub: 'DMA Gateway', color: 'text-blue-300', border: 'border-blue-500/30' },
            { label: 'Knowledge Graph', val: '18,400 Edges', sub: 'GNN Active', color: 'text-emerald-400', border: 'border-slate-800' },
            { label: 'Redis / Bus', val: 'CONNECTED', sub: 'Sub-ms Latency', color: 'text-emerald-400', border: 'border-emerald-500/30' }
          ].map((m, i) => (
            <div key={i} className={cn("p-2.5 bg-slate-900/90 border rounded-lg flex flex-col justify-between space-y-1 shadow-md hover:border-slate-700 transition-colors", m.border)}>
              <span className="text-[9px] text-slate-400 uppercase font-bold truncate">{m.label}</span>
              <div className={cn("text-sm font-bold font-mono tracking-tight", m.color)}>{m.val}</div>
              <span className="text-[8px] text-slate-500 truncate">{m.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 2 & SECTION 7: PIPELINE & AI THINKING PIPELINE      */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* SECTION 2: LIVE ORCHESTRATION MAP (7 COLS) */}
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 2: Live Orchestration Map & Pipeline Queues</h2>
            </div>
            <span className="text-[10px] text-slate-400">10 Sequential Stage Queues &bull; Click Node for Health & Latency</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
            {queues.map((q, idx) => (
              <div
                key={q.id}
                onClick={() => setSelectedQueueId(q.id)}
                className={cn(
                  "p-2.5 rounded border transition-all cursor-pointer flex flex-col justify-between space-y-2 relative group",
                  selectedQueueId === q.id 
                    ? "bg-slate-800 border-emerald-400 shadow-lg ring-1 ring-emerald-400" 
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                )}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">0{idx + 1}.</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border",
                    q.priority === 'CRITICAL' && "bg-rose-500/20 text-rose-300 border-rose-500/40",
                    q.priority === 'HIGH' && "bg-amber-500/20 text-amber-300 border-amber-500/40",
                    q.priority === 'NORMAL' && "bg-blue-500/20 text-blue-300 border-blue-500/40"
                  )}>
                    {q.priority}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-white leading-tight truncate">{q.name.replace(' Queue', '')}</div>
                  <p className="text-[9px] text-slate-500 truncate mt-0.5">{q.description}</p>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-900 text-[10px]">
                  <div className="flex justify-between"><span>Pending:</span><strong className="text-amber-400">{q.pending}</strong></div>
                  <div className="flex justify-between"><span>Running:</span><strong className="text-emerald-400">{q.running}</strong></div>
                  <div className="flex justify-between"><span>Completed:</span><strong className="text-white">{q.completed}</strong></div>
                  <div className="flex justify-between text-[9px] text-slate-400 pt-0.5 border-t border-slate-900">
                    <span>Avg Latency:</span><span className="text-blue-300 font-bold">{q.avgTimeMs} ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7: AI THINKING PIPELINE (5 COLS) */}
        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 7: AI Complete Reasoning Pipeline</h2>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">12-Step Chain Active</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {[
                { step: '01', name: 'Market Feed Ingestion', model: 'Perplexity Sonar', latency: '4.2ms', confidence: '99%' },
                { step: '02', name: 'Research & Macro Analysis', model: 'Gemini 2.5 Pro', latency: '18.4ms', confidence: '96.5%' },
                { step: '03', name: 'Signal Generation', model: 'DeepSeek R1 Quant', latency: '12.1ms', confidence: '94.2%' },
                { step: '04', name: 'Memory Retrieval (LMEOS)', model: 'Vector DB v3', latency: '8.1ms', confidence: '98.0%' },
                { step: '05', name: 'Committee Discussion', model: '7-Agent Quorum', latency: '24.5ms', confidence: '92.4%' },
                { step: '06', name: 'Constitution Validation', model: 'Claude 3.5 Sonnet', latency: '9.2ms', confidence: '100%' },
                { step: '07', name: 'Risk Validation (VaR)', model: 'Risk Engine v3', latency: '3.1ms', confidence: '99.5%' },
                { step: '08', name: 'Decision & Order Sizing', model: 'Decision Engine', latency: '9.6ms', confidence: '95.1%' },
                { step: '09', name: 'Paper Trading Execution', model: 'DMA Gateway', latency: '4.2ms', confidence: '100%' },
                { step: '10', name: 'Post-Trade Learning', model: 'Reward Scaling', latency: '32.0ms', confidence: '91.0%' },
                { step: '11', name: 'Memory Vector Update', model: 'Graph DB', latency: '5.6ms', confidence: '99.8%' },
                { step: '12', name: 'Evolution Queue Mutate', model: 'Mutation Engine', latency: '145.0ms', confidence: '88.0%' }
              ].map((p, idx) => (
                <div key={idx} className="p-2 bg-slate-950 border border-slate-800 rounded flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{p.step}.</span>
                    <div>
                      <span className="text-white font-bold">{p.name}</span>
                      <span className="text-slate-500 block text-[9px]">{p.model}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-blue-300 font-bold">{p.latency}</span>
                    <span className="text-emerald-400 block text-[9px]">Conf: {p.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================== */}
      {/* SECTION 3 & SECTION 5 GRID (SCHEDULER & DISPATCHER)      */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* SECTION 3: REAL-TIME BRAIN SCHEDULER (7 COLS) */}
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 3: Real-Time Brain Task Scheduler</h2>
              </div>
              <span className="text-[10px] text-slate-400">{filteredTasks.length} Tasks Scheduled</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2 rounded border border-slate-800">
              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 ml-1" />
                <input
                  type="text"
                  placeholder="Filter tasks by ID, name, or model..."
                  value={schedulerSearch}
                  onChange={(e) => setSchedulerSearch(e.target.value)}
                  className="bg-transparent text-white text-xs placeholder-slate-500 focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={schedulerPriorityFilter}
                  onChange={(e) => setSchedulerPriorityFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[11px]"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="NORMAL">Normal</option>
                  <option value="LOW">Low</option>
                </select>

                <select
                  value={schedulerStatusFilter}
                  onChange={(e) => setSchedulerStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[11px]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="RUNNING">Running</option>
                  <option value="WAITING">Waiting</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="RETRY">Retry</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2">Task ID</th>
                    <th className="p-2">Task Name</th>
                    <th className="p-2">Assigned Model</th>
                    <th className="p-2">Priority</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">ETA</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTasks.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-2 text-slate-400 font-bold whitespace-nowrap">{t.id}</td>
                      <td className="p-2 text-white font-bold">{t.name}</td>
                      <td className="p-2 text-purple-300 whitespace-nowrap">{t.model}</td>
                      <td className="p-2 whitespace-nowrap">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border",
                          t.priority === 'CRITICAL' && "bg-rose-500/20 text-rose-300 border-rose-500/40",
                          t.priority === 'HIGH' && "bg-amber-500/20 text-amber-300 border-amber-500/40",
                          t.priority === 'NORMAL' && "bg-blue-500/20 text-blue-300 border-blue-500/40",
                          t.priority === 'LOW' && "bg-slate-800 text-slate-400 border-slate-700"
                        )}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border",
                          t.status === 'RUNNING' && "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse",
                          t.status === 'WAITING' && "bg-amber-500/20 text-amber-300 border-amber-500/40",
                          t.status === 'BLOCKED' && "bg-rose-500/20 text-rose-300 border-rose-500/40",
                          t.status === 'RETRY' && "bg-purple-500/20 text-purple-300 border-purple-500/40",
                          t.status === 'COMPLETED' && "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        )}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-2 text-slate-300 whitespace-nowrap">{t.eta}</td>
                      <td className="p-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setInspectTask(t)}
                            className="p-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[9px]"
                            title="Inspect Task Details"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 5: AI WORK DISPATCHER (5 COLS) */}
        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 5: AI Work Dispatcher</h2>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(true)}
                className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold rounded text-[10px] uppercase flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-purple-400" /> Dispatch Job
              </button>
            </div>

            <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded border border-slate-800 text-[10px] font-bold">
              {[
                { id: 'CURRENT', label: 'Running', count: tasks.filter(t => t.status === 'RUNNING').length },
                { id: 'WAITING', label: 'Waiting', count: tasks.filter(t => t.status === 'WAITING').length },
                { id: 'BLOCKED', label: 'Blocked', count: tasks.filter(t => t.status === 'BLOCKED').length },
                { id: 'RETRY', label: 'Retry', count: tasks.filter(t => t.status === 'RETRY').length },
                { id: 'COMPLETED', label: 'Completed', count: tasks.filter(t => t.status === 'COMPLETED').length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDispatcherTab(tab.id as any)}
                  className={cn(
                    "px-2.5 py-1 rounded transition-colors uppercase flex items-center gap-1",
                    dispatcherTab === tab.id 
                      ? "bg-purple-500 text-black font-bold" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  )}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {dispatcherTasks.map(dt => (
                <div key={dt.id} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">{dt.name}</span>
                    <span className="text-[10px] text-purple-300 font-bold">{dt.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Model: <strong className="text-slate-200">{dt.model}</strong></span>
                    <span>Category: <strong className="text-emerald-400">{dt.category}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 4 & SECTION 9: MESSAGE BUS & AI CONSENSUS ENGINE   */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* SECTION 4: ENTERPRISE MESSAGE BUS (6 COLS) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 4: Enterprise Message Bus</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">9 Active Inter-Module Streams</span>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {commMatrix.map((comm) => (
              <div
                key={comm.id}
                onClick={() => setInspectCommStep(comm)}
                className="p-2.5 bg-slate-950 border border-slate-800 rounded space-y-1 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold">{comm.id} &bull; {comm.from} &rarr; {comm.to}</span>
                  <span className="text-emerald-400 font-bold">{comm.latencyMs} ms</span>
                </div>
                <div className="text-[11px] text-white font-bold truncate">{comm.request}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 9: AI CONSENSUS & VOTING MATRIX (6 COLS) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 9: AI Consensus & Committee Voting Matrix</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Quorum: 83.3% Accepted (5/6 Votes)</span>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {consensusVotes.map((v, i) => (
              <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded flex items-center justify-between text-[11px]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{v.model}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border",
                      v.vote === 'ACCEPTED' ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    )}>
                      {v.vote}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-[280px]">{v.rationale}</p>
                </div>
                <div className="text-right">
                  <span className="text-purple-300 font-bold">{v.confidence}% Conf</span>
                  <span className="text-slate-500 block text-[9px]">Wt: {v.weight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================== */}
      {/* SECTION 11: RESOURCE MANAGER & MODEL TOKEN CONSUMPTION     */}
      {/* ========================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 11: Resource Manager & Per-Model Token Consumption</h2>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">Total Cost Today: $15.05 &bull; 7.8M Tokens</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[10px]">
              <tr>
                <th className="p-2">AI Model</th>
                <th className="p-2">Input Tokens</th>
                <th className="p-2">Output Tokens</th>
                <th className="p-2">Cost (USD)</th>
                <th className="p-2">P99 Latency</th>
                <th className="p-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {modelTokenMetrics.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-2 text-white font-bold">{m.model}</td>
                  <td className="p-2 text-slate-300">{m.inputTokens.toLocaleString()}</td>
                  <td className="p-2 text-slate-300">{m.outputTokens.toLocaleString()}</td>
                  <td className="p-2 text-emerald-400 font-bold">${m.costUsd.toFixed(2)}</td>
                  <td className="p-2 text-blue-300">{m.latencyMs} ms</td>
                  <td className="p-2 text-right">
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-bold uppercase">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 6 & SECTION 8: SYSTEM LOGS & FAILURE RECOVERY      */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* SECTION 8: LIVE SYSTEM LOGS & AUDIT TRAIL (6 COLS) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 8: Enterprise System Log Explorer</h2>
            </div>
            <span className="text-[10px] text-slate-400">{filteredEvents.length} Events Logged</span>
          </div>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{ev.timestamp}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border",
                    ev.severity === 'SUCCESS' && "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
                    ev.severity === 'WARN' && "bg-amber-500/20 text-amber-300 border-amber-500/40",
                    ev.severity === 'CRITICAL' && "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  )}>
                    {ev.category}
                  </span>
                </div>
                <div className="text-[11px] text-white font-bold">{ev.title}</div>
                <p className="text-[10px] text-slate-400">{ev.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 12: FAILOVER CONTROL CONSOLE (6 COLS) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 12: Enterprise Failover & Recovery Console</h2>
            </div>
            <span className="text-[10px] text-rose-400 font-bold">6 Recovery Playbooks Active</span>
          </div>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {failureProtocols.map(p => (
              <div key={p.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded flex items-center justify-between text-[11px]">
                <div className="space-y-0.5 max-w-[280px]">
                  <div className="text-white font-bold">{p.id} &bull; {p.type}</div>
                  <p className="text-[10px] text-slate-400 truncate">{p.recoveryAction}</p>
                </div>
                <button
                  onClick={() => handleRunRecovery(p.id)}
                  disabled={p.status === 'RECOVERING'}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded text-[9px] uppercase transition-colors shrink-0"
                >
                  {p.status === 'RECOVERING' ? 'Running...' : 'Recover'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================== */}
      {/* SECTION 15: COMMAND PALETTE MODAL (CTRL+K)                 */}
      {/* ========================================================== */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandPaletteOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            />
            <div className="fixed inset-x-4 top-20 max-w-xl mx-auto z-50">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden font-mono text-xs"
              >
                <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <input
                    type="text"
                    placeholder="Type a command or search subsystem (e.g. restart, flush, snapshot)..."
                    autoFocus
                    className="w-full bg-transparent text-white text-xs focus:outline-none placeholder-slate-500"
                  />
                  <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-[9px]">ESC</span>
                </div>

                <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                  {[
                    { cmd: 'Restart Central Brain Kernel', desc: 'Re-align all 64 thread workers and clean session cache', action: handleRestartCluster },
                    { cmd: 'Flush Vector Memory Cache', desc: 'Clear Redis cache & LMEOS short-term memory pool', action: handleFlushCache },
                    { cmd: 'Pause / Resume Scheduler', desc: 'Toggle background queue processing state', action: handleToggleScheduler },
                    { cmd: 'Trigger Emergency Stop', desc: 'Suspend all active AI executions & enforce safety lockdown', action: handleEmergencyStop },
                    { cmd: 'Export System Snapshot (JSON)', desc: 'Download kernel execution graph & telemetry metrics', action: handleExportSnapshot },
                    { cmd: 'Run Synthetic Failure Drill', desc: 'Inject test anomaly to verify recovery playbooks', action: handleToggleFailureDrill }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        item.action();
                        setCommandPaletteOpen(false);
                      }}
                      className="p-2.5 rounded hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="text-white font-bold">{item.cmd}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* TASK INSPECTOR DRAWER */}
      <AnimatePresence>
        {inspectTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectTask(null)}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 p-6 flex flex-col justify-between font-mono text-xs overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scheduler Task Inspector</h3>
                      <p className="text-[10px] text-slate-400">ID: {inspectTask.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setInspectTask(null)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase">Task Name</span>
                    <h4 className="text-sm font-bold text-white">{inspectTask.name}</h4>
                    <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                      <span>Category: <strong className="text-emerald-400">{inspectTask.category}</strong></span>
                      <span>Priority: <strong className="text-amber-400">{inspectTask.priority}</strong></span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-[11px]">
                    <div className="flex justify-between"><span>Assigned AI Model:</span><span className="text-purple-300 font-bold">{inspectTask.model}</span></div>
                    <div className="flex justify-between"><span>Status:</span><span className="text-emerald-400 font-bold">{inspectTask.status}</span></div>
                    <div className="flex justify-between"><span>ETA / Duration:</span><span className="text-white font-bold">{inspectTask.eta}</span></div>
                    <div className="flex justify-between"><span>Dependencies:</span><span className="text-slate-300 font-bold">{inspectTask.dependencies}</span></div>
                    <div className="flex justify-between"><span>Retry Count:</span><span className="text-amber-400 font-bold">{inspectTask.retryCount}</span></div>
                    <div className="flex justify-between"><span>Elapsed Execution:</span><span className="text-blue-300 font-bold">{inspectTask.executionTimeMs} ms</span></div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button onClick={() => setInspectTask(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase rounded">
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
