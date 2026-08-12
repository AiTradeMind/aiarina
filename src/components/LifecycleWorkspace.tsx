import React, { useState, useMemo } from 'react';
import { 
  Brain, 
  Cpu, 
  Layers, 
  Activity, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  TrendingUp, 
  Search, 
  Filter, 
  GitBranch, 
  Database, 
  Award, 
  RotateCcw, 
  BarChart3, 
  ChevronRight, 
  Zap, 
  ShieldAlert, 
  FileText, 
  Play, 
  Pause, 
  Plus, 
  Sparkles, 
  Lock, 
  Unlock, 
  ArrowRight, 
  ArrowUpRight, 
  Network, 
  SlidersHorizontal, 
  Sliders, 
  X, 
  Check, 
  History, 
  Download, 
  Crown,
  Trophy,
  FileCheck,
  Workflow, 
  Crosshair, 
  Eye, 
  AlertCircle, 
  Terminal as TerminalIcon,
  HelpCircle,
  Bookmark,
  Share2,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { AITournamentArenaWorkspace } from './AITournamentArenaWorkspace';
import { LeaderboardWorkspace } from './LeaderboardWorkspace';
import { EnterpriseStrategyLifecycleIntelligenceCenter } from './lifecycle/EnterpriseStrategyLifecycleIntelligenceCenter';

// ==========================================
// DATA TYPES & INTERFACES
// ==========================================

export interface AIModelLifecycle {
  id: string;
  name: string;
  role: string;
  provider: string;
  version: string;
  status: 'PRODUCTION' | 'PAPER' | 'TRAINING' | 'LEARNING' | 'EVOLUTION' | 'QUARANTINED' | 'FAILED' | 'PAUSED' | 'RETIRED';
  currentStageIdx: number; // 0..16 for 17 stages
  previousStage: string;
  nextStage: string;
  confidence: string;
  csi: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  capital: string;
  paperTrades: number;
  winRate: string;
  learningScore: number;
  generation: string;
  promotionTier: 'Paper' | 'Candidate' | 'Champion' | 'Elite' | 'Retired';
  rollbackStatus: 'Available' | 'Clean' | 'Restored' | 'Locked';
  runtime: string;
  health: string;
  approvedBy: string;
  entryTime: string;
  durationInStage: string;
  lastEvent: string;
  rationale: string;
  scoreChange: string;
}

export interface LifecycleStageInfo {
  id: number;
  name: string;
  status: 'ACTIVE' | 'PROCESSING' | 'SYNCED' | 'IDLE';
  responsibleEngine: string;
  input: string;
  output: string;
  dependencies: string;
  avgDuration: string;
  activeModelsCount: number;
}

export interface QueueJob {
  id: string;
  modelId: string;
  modelName: string;
  stageName: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  status: 'WAITING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'RETRY' | 'BLOCKED';
  processingTimeMs: number;
  eta: string;
  retryCount: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  modelId: string;
  modelName: string;
  stageName: string;
  eventTitle: string;
  details: string;
  approver: string;
  scoreDelta: string;
  type: 'TRANSITION' | 'APPROVAL' | 'EXECUTION' | 'LEARNING' | 'EVOLUTION' | 'PROMOTION';
}

export interface FailureIncident {
  id: string;
  timestamp: string;
  modelId: string;
  modelName: string;
  stageName: string;
  failureType: 'REJECTED' | 'TIMEOUT' | 'RISK_FAILURE' | 'COMMITTEE_REJECTION' | 'PAPER_FAILURE' | 'LEARNING_FAILURE' | 'MEMORY_FAILURE' | 'EVOLUTION_REJECTED';
  reason: string;
  canRetry: boolean;
  canRollback: boolean;
  resolved: boolean;
}

export interface PromotionRule {
  metric: string;
  requiredValue: string;
  currentSystemAvg: string;
  status: 'MET' | 'PENDING' | 'WARNING';
}

export interface RollbackCheckpoint {
  id: string;
  modelId: string;
  modelName: string;
  currentVersion: string;
  targetVersion: string;
  generation: string;
  reason: string;
  rollbackDate: string;
  csiDelta: string;
  winRateDelta: string;
  status: 'AVAILABLE' | 'RESTORED' | 'ARCHIVED';
}

export interface LearningRecord {
  id: string;
  timestamp: string;
  modelName: string;
  tradesLearned: number;
  patternsLearned: number;
  mistakesFixed: number;
  strategiesImproved: string;
  memoryAddedMb: number;
  knowledgeNodesAdded: number;
  evolutionTrigger: string;
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  modelId: string;
  modelName: string;
  stageName: string;
  severity: 'SUCCESS' | 'WARN' | 'CRITICAL' | 'INFO';
  module: string;
  message: string;
}

export interface DependencyNode {
  id: string;
  name: string;
  feedsTo: string;
  health: number;
  throughputRpm: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'ACTIVE';
}

// ==========================================
// CONSTANTS & INITIAL MOCK DATA
// ==========================================

export const STAGES_17: LifecycleStageInfo[] = [
  { id: 1, name: 'Research', status: 'ACTIVE', responsibleEngine: 'Research Discovery Engine', input: 'Macro sentiment, SEC/NSE wire, raw order flow', output: 'Alpha hypotheses & sentiment vectors', dependencies: 'External API Feeds', avgDuration: '14.2s', activeModelsCount: 2 },
  { id: 2, name: 'Market Scan', status: 'ACTIVE', responsibleEngine: 'Market Scanning Engine', input: 'Real-time L2 orderbook, tick streams', output: 'Candidate anomaly signals', dependencies: 'Stage 1 (Research)', avgDuration: '8.1s', activeModelsCount: 3 },
  { id: 3, name: 'Analytics', status: 'PROCESSING', responsibleEngine: 'Multi-Factor Analytics Core', input: 'Candidate signals, historical ticks', output: 'Volatility surface, correlation matrix', dependencies: 'Stage 2 (Market Scan)', avgDuration: '12.4s', activeModelsCount: 2 },
  { id: 4, name: 'Strategy Generation', status: 'ACTIVE', responsibleEngine: 'Alpha Strategy Synthesizer', input: 'Analytics vectors & factor models', output: 'Trade strategy parameters & entry/exit bounds', dependencies: 'Stage 3 (Analytics)', avgDuration: '18.9s', activeModelsCount: 2 },
  { id: 5, name: 'Risk Validation', status: 'ACTIVE', responsibleEngine: 'Sentinel Risk & VaR Engine', input: 'Strategy proposal & portfolio beta', output: 'Risk clearance certificate or VaR veto', dependencies: 'Stage 4 (Strategy Gen)', avgDuration: '6.2s', activeModelsCount: 2 },
  { id: 6, name: 'Committee Voting', status: 'ACTIVE', responsibleEngine: '7-Agent Committee Quorum Node', input: 'Risk-approved strategy packet', output: 'Constitutional vote record (e.g. 7/7 Quorum)', dependencies: 'Stage 5 (Risk Val)', avgDuration: '22.0s', activeModelsCount: 2 },
  { id: 7, name: 'Decision', status: 'ACTIVE', responsibleEngine: 'Executive Decision Dispatcher', input: 'Quorum consensus packet', output: 'Final actionable trade proposal', dependencies: 'Stage 6 (Committee)', avgDuration: '4.8s', activeModelsCount: 1 },
  { id: 8, name: 'Capital Allocation', status: 'ACTIVE', responsibleEngine: 'Treasury Capital Sizing Core', input: 'Trade proposal & margin limits', output: 'Earmarked capital buffer token', dependencies: 'Stage 7 (Decision)', avgDuration: '3.1s', activeModelsCount: 1 },
  { id: 9, name: 'Paper Entry', status: 'ACTIVE', responsibleEngine: 'Paper Trading Execution Gateway', input: 'Earmarked capital & order specs', output: 'Paper position fill record', dependencies: 'Stage 8 (Capital Alloc)', avgDuration: '5.5s', activeModelsCount: 2 },
  { id: 10, name: 'Paper Monitoring', status: 'PROCESSING', responsibleEngine: 'Paper Position Tracker', input: 'Live market feeds vs paper fills', output: 'Slippage metrics & trailing stop events', dependencies: 'Stage 9 (Paper Entry)', avgDuration: '45.0s', activeModelsCount: 2 },
  { id: 11, name: 'Paper Exit', status: 'ACTIVE', responsibleEngine: 'Paper Order Exit Module', input: 'Target/SL hit or expiry signal', output: 'Closed paper trade PnL summary', dependencies: 'Stage 10 (Monitoring)', avgDuration: '4.2s', activeModelsCount: 1 },
  { id: 12, name: 'Learning', status: 'PROCESSING', responsibleEngine: 'Post-Trade Attribution Engine', input: 'Closed paper trade telemetry & market state', output: 'Reward scaling & weight delta gradient', dependencies: 'Stage 11 (Paper Exit)', avgDuration: '32.1s', activeModelsCount: 2 },
  { id: 13, name: 'Memory Update', status: 'ACTIVE', responsibleEngine: 'LMEOS Vector Memory Manager', input: 'Weight delta & trade pattern outcome', output: 'Vector embedding graph commit', dependencies: 'Stage 12 (Learning)', avgDuration: '9.4s', activeModelsCount: 2 },
  { id: 14, name: 'Knowledge Graph Update', status: 'ACTIVE', responsibleEngine: 'Cross-Market Knowledge Engine', input: 'Vector graph commit & correlation data', output: 'Intermarket node edge weight updates', dependencies: 'Stage 13 (Memory)', avgDuration: '11.8s', activeModelsCount: 1 },
  { id: 15, name: 'Evolution', status: 'PROCESSING', responsibleEngine: 'Neural Prompt Mutation Engine', input: 'Knowledge graph updates & loss history', output: 'Mutated prompt weights & strategy vNext', dependencies: 'Stage 14 (Knowledge Graph)', avgDuration: '112.0s', activeModelsCount: 1 },
  { id: 16, name: 'Tournament', status: 'SYNCED', responsibleEngine: 'ELO Competitive Arena Master', input: 'Mutated candidate vs Champion benchmarks', output: 'ELO score ranking & promotion score', dependencies: 'Stage 15 (Evolution)', avgDuration: '180.0s', activeModelsCount: 1 },
  { id: 17, name: 'Production Promotion', status: 'ACTIVE', responsibleEngine: 'Kernel Promotion Controller', input: 'Tournament winner & human signoff', output: 'Production deployment token & live DMA access', dependencies: 'Stage 16 (Tournament)', avgDuration: '15.0s', activeModelsCount: 2 }
];

const INITIAL_MODELS: AIModelLifecycle[] = [
  { id: 'MOD-001', name: 'OpenAI GPT-4o (v3.2)', role: 'Executive Orchestrator', provider: 'OpenAI', version: 'v3.2', status: 'PRODUCTION', currentStageIdx: 16, previousStage: 'Tournament', nextStage: 'Monitoring', confidence: '98.4%', csi: 99.8, risk: 'LOW', capital: '$1,250,000', paperTrades: 1420, winRate: '78.5%', learningScore: 96.8, generation: 'Gen 5', promotionTier: 'Elite', rollbackStatus: 'Clean', runtime: '241d 14h', health: '99.9%', approvedBy: 'Committee (7/7) + Human Admin', entryTime: '2026-08-01 10:00', durationInStage: '45m', lastEvent: 'Promoted to Production Tier', rationale: 'Flawless paper execution, 78.5% win rate over 1,420 trades, CSI 99.8%', scoreChange: '+1.4% WinRate' },
  { id: 'MOD-002', name: 'Anthropic Claude 3.5 Sonnet (v2.8)', role: 'Macro & Sector Intel', provider: 'Anthropic', version: 'v2.8', status: 'PRODUCTION', currentStageIdx: 1, previousStage: 'Research', nextStage: 'Analytics', confidence: '94.2%', csi: 99.5, risk: 'LOW', capital: '$800,000', paperTrades: 980, winRate: '72.1%', learningScore: 92.4, generation: 'Gen 4', promotionTier: 'Champion', rollbackStatus: 'Available', runtime: '180d 02h', health: '99.5%', approvedBy: 'Committee (7/7)', entryTime: '2026-08-01 10:42', durationInStage: '6m', lastEvent: 'Scanning NIFTY 50 Sector Volatility', rationale: 'High precision macro sentiment extraction from wire news feeds', scoreChange: '+0.8% CSI' },
  { id: 'MOD-003', name: 'Google Gemini 2.5 Pro (v3.0)', role: 'Multi-Day Momentum', provider: 'Google AI', version: 'v3.0', status: 'PRODUCTION', currentStageIdx: 9, previousStage: 'Capital Allocation', nextStage: 'Paper Monitoring', confidence: '91.8%', csi: 98.9, risk: 'MEDIUM', capital: '$650,000', paperTrades: 640, winRate: '68.4%', learningScore: 89.2, generation: 'Gen 4', promotionTier: 'Champion', rollbackStatus: 'Available', runtime: '124d 08h', health: '98.9%', approvedBy: 'Committee (6/7)', entryTime: '2026-08-01 10:40', durationInStage: '8m', lastEvent: 'Entered Paper Position: BUY TCS @ ₹3,840', rationale: 'Multi-factor breakout confirmed across 15m and 1h charts', scoreChange: '+1.2% Conf' },
  { id: 'MOD-004', name: 'DeepSeek V3 (v4.1)', role: 'High-Frequency Order Flow', provider: 'DeepSeek', version: 'v4.1', status: 'PRODUCTION', currentStageIdx: 9, previousStage: 'Paper Entry', nextStage: 'Paper Exit', confidence: '89.5%', csi: 99.1, risk: 'LOW', capital: '$500,000', paperTrades: 3120, winRate: '74.2%', learningScore: 94.1, generation: 'Gen 6', promotionTier: 'Champion', rollbackStatus: 'Clean', runtime: '310d 18h', health: '99.1%', approvedBy: 'Committee (7/7)', entryTime: '2026-08-01 10:47', durationInStage: '1m', lastEvent: 'Monitoring Orderbook Imbalance for INFY', rationale: 'Sub-millisecond orderbook delta tracking with adaptive trailing SL', scoreChange: '+0.5% WinRate' },
  { id: 'MOD-005', name: 'Meta Llama 3.3 70B (v3.5)', role: 'VaR & Drawdown Sentinel', provider: 'Meta AI', version: 'v3.5', status: 'PRODUCTION', currentStageIdx: 4, previousStage: 'Strategy Generation', nextStage: 'Committee Voting', confidence: '99.9%', csi: 100.0, risk: 'LOW', capital: '$2,000,000', paperTrades: 0, winRate: '99.0%', learningScore: 98.5, generation: 'Gen 5', promotionTier: 'Elite', rollbackStatus: 'Clean', runtime: '365d 00h', health: '100%', approvedBy: 'Constitutional Safety Officer', entryTime: '2026-08-01 10:48', durationInStage: '12s', lastEvent: 'Cleared Risk Cert for Reliance Straddle Trade', rationale: '0.04% VaR boundary verified within constitutional envelope', scoreChange: '0.0% VaR Delta' },
  { id: 'MOD-006', name: 'Anthropic Claude 3.5 Sonnet (v1.9)', role: 'Derivatives & Greeks', provider: 'Anthropic', version: 'v1.9', status: 'PAPER', currentStageIdx: 8, previousStage: 'Decision', nextStage: 'Paper Monitoring', confidence: '88.2%', csi: 97.8, risk: 'MEDIUM', capital: '$450,000', paperTrades: 420, winRate: '65.0%', learningScore: 84.0, generation: 'Gen 2', promotionTier: 'Candidate', rollbackStatus: 'Available', runtime: '45d 06h', health: '97.8%', approvedBy: 'Committee (5/7)', entryTime: '2026-08-01 10:35', durationInStage: '13m', lastEvent: 'Paper Order Placed: SELL NIFTY CE 24500', rationale: 'Delta-neutral gamma hedge on implied volatility skew', scoreChange: '+0.3% CSI' },
  { id: 'MOD-007', name: 'DeepSeek R1 (v2.5)', role: 'Deep LSTM Forecasting', provider: 'DeepSeek', version: 'v2.5', status: 'TRAINING', currentStageIdx: 11, previousStage: 'Paper Exit', nextStage: 'Memory Update', confidence: '87.9%', csi: 96.5, risk: 'HIGH', capital: '$600,000', paperTrades: 180, winRate: '67.0%', learningScore: 88.0, generation: 'Gen 3', promotionTier: 'Paper', rollbackStatus: 'Available', runtime: '30d 12h', health: '96.5%', approvedBy: 'Training Controller', entryTime: '2026-08-01 10:20', durationInStage: '28m', lastEvent: 'Backpropagation Loss Gradient -0.014', rationale: 'Updating reward scaling after 180 simulated trades', scoreChange: '-0.014 Loss' },
  { id: 'MOD-008', name: 'Anthropic Claude 3.5 Sonnet (v3.0)', role: 'Multi-Factor Alpha', provider: 'Anthropic', version: 'v3.0', status: 'LEARNING', currentStageIdx: 11, previousStage: 'Paper Exit', nextStage: 'Memory Update', confidence: '93.8%', csi: 99.6, risk: 'LOW', capital: '$850,000', paperTrades: 890, winRate: '75.1%', learningScore: 93.5, generation: 'Gen 4', promotionTier: 'Candidate', rollbackStatus: 'Clean', runtime: '90d 18h', health: '99.6%', approvedBy: 'Committee (7/7)', entryTime: '2026-08-01 10:15', durationInStage: '33m', lastEvent: 'Post-Trade Loss Attribution Completed', rationale: 'Synthesized value and growth factor interactions for LT futures', scoreChange: '+0.6% Score' },
  { id: 'MOD-009', name: 'Meta Llama 3.3 70B (v2.3)', role: 'Intermarket Flow', provider: 'Meta AI', version: 'v2.3', status: 'EVOLUTION', currentStageIdx: 14, previousStage: 'Knowledge Graph', nextStage: 'Tournament', confidence: '91.4%', csi: 99.2, risk: 'LOW', capital: '$700,000', paperTrades: 510, winRate: '72.9%', learningScore: 91.0, generation: 'Gen 3', promotionTier: 'Candidate', rollbackStatus: 'Available', runtime: '75d 04h', health: '99.2%', approvedBy: 'Evolution Engine', entryTime: '2026-08-01 09:50', durationInStage: '58m', lastEvent: 'Mutating Prompt Weights for IT vs BankNifty Rotation', rationale: 'Prompt mutated with ATR-adjusted profit targets', scoreChange: 'v2.3 -> v2.4' },
  { id: 'MOD-010', name: 'OpenAI GPT-3.5 Turbo (v0.9)', role: 'Deprecated High Latency Bot', provider: 'OpenAI', version: 'v0.9', status: 'QUARANTINED', currentStageIdx: 0, previousStage: 'Research', nextStage: 'NONE', confidence: '62.0%', csi: 82.1, risk: 'CRITICAL', capital: '$0', paperTrades: 120, winRate: '51.0%', learningScore: 55.0, generation: 'Gen 1', promotionTier: 'Retired', rollbackStatus: 'Locked', runtime: '10d 00h', health: '82.1%', approvedBy: 'Quarantine Sentinel', entryTime: '2026-07-28 14:00', durationInStage: '4d', lastEvent: 'Quarantined due to > 50ms latency violation', rationale: 'Failed SLA threshold and constitutional safety check', scoreChange: '-12% CSI' },
  { id: 'MOD-011', name: 'Alibaba Qwen 2.5 72B (v1.0)', role: 'Experimental Momentum', provider: 'Alibaba AI', version: 'v1.0', status: 'FAILED', currentStageIdx: 5, previousStage: 'Risk Validation', nextStage: 'RETRY_QUEUE', confidence: '58.4%', csi: 88.0, risk: 'HIGH', capital: '$0', paperTrades: 45, winRate: '42.0%', learningScore: 48.0, generation: 'Gen 1', promotionTier: 'Paper', rollbackStatus: 'Restored', runtime: '5d 02h', health: '88.0%', approvedBy: 'Committee Veto', entryTime: '2026-08-01 08:30', durationInStage: '2h', lastEvent: 'Committee Veto: 2/7 Quorum (Failed)', rationale: 'Exceeded maximum portfolio drawdown allowance during stress test', scoreChange: 'FAILED' },
  { id: 'MOD-012', name: 'OpenAI GPT-4o (v2.7)', role: 'Commodities & Currencies', provider: 'OpenAI', version: 'v2.7', status: 'PAUSED', currentStageIdx: 2, previousStage: 'Market Scan', nextStage: 'Strategy Generation', confidence: '89.9%', csi: 98.9, risk: 'MEDIUM', capital: '$550,000', paperTrades: 340, winRate: '68.2%', learningScore: 87.4, generation: 'Gen 3', promotionTier: 'Candidate', rollbackStatus: 'Available', runtime: '60d 10h', health: '98.9%', approvedBy: 'Human Operator (Paused)', entryTime: '2026-08-01 07:15', durationInStage: '3h', lastEvent: 'Paused for Scheduled Exchange Feed Re-alignment', rationale: 'Awaiting MCX oil vs Gold spread feed synchronization', scoreChange: 'PAUSED' }
];

const INITIAL_QUEUE_JOBS: QueueJob[] = [
  { id: 'JOB-901', modelId: 'MOD-001', modelName: 'OpenAI GPT-4o (v3.2)', stageName: 'Production Promotion', priority: 'CRITICAL', status: 'RUNNING', processingTimeMs: 142, eta: '0.2s', retryCount: 0 },
  { id: 'JOB-902', modelId: 'MOD-005', modelName: 'Meta Llama 3.3 70B (v3.5)', stageName: 'Risk Validation', priority: 'CRITICAL', status: 'RUNNING', processingTimeMs: 88, eta: '0.1s', retryCount: 0 },
  { id: 'JOB-903', modelId: 'MOD-003', modelName: 'Google Gemini 2.5 Pro (v3.0)', stageName: 'Paper Entry', priority: 'HIGH', status: 'WAITING', processingTimeMs: 0, eta: '0.8s', retryCount: 0 },
  { id: 'JOB-904', modelId: 'MOD-004', modelName: 'DeepSeek V3 (v4.1)', stageName: 'Paper Monitoring', priority: 'HIGH', status: 'WAITING', processingTimeMs: 0, eta: '1.2s', retryCount: 0 },
  { id: 'JOB-905', modelId: 'MOD-008', modelName: 'Anthropic Claude 3.5 Sonnet (v3.0)', stageName: 'Learning', priority: 'NORMAL', status: 'RUNNING', processingTimeMs: 410, eta: '0.4s', retryCount: 0 },
  { id: 'JOB-906', modelId: 'MOD-009', modelName: 'Meta Llama 3.3 70B (v2.3)', stageName: 'Evolution', priority: 'NORMAL', status: 'BLOCKED', processingTimeMs: 0, eta: 'WAITING_TOURNAMENT', retryCount: 1 },
  { id: 'JOB-907', modelId: 'MOD-011', modelName: 'Alibaba Qwen 2.5 72B (v1.0)', stageName: 'Committee Voting', priority: 'HIGH', status: 'RETRY', processingTimeMs: 120, eta: '2.0s', retryCount: 2 },
  { id: 'JOB-908', modelId: 'MOD-002', modelName: 'Anthropic Claude 3.5 Sonnet (v2.8)', stageName: 'Market Scan', priority: 'LOW', status: 'COMPLETED', processingTimeMs: 312, eta: 'DONE', retryCount: 0 }
];

const INITIAL_TIMELINE: TimelineEvent[] = [
  { id: 'TL-101', timestamp: '10:48:12', modelId: 'MOD-001', modelName: 'OpenAI GPT-4o (v3.2)', stageName: 'Production Promotion', eventTitle: 'Production Deployment Token Issued', details: 'Promoted to Elite Production tier with $1.25M DMA execution allowance.', approver: 'Committee Quorum 7/7 + Human Admin', scoreDelta: '+1.4% Win Rate', type: 'PROMOTION' },
  { id: 'TL-102', timestamp: '10:45:00', modelId: 'MOD-009', modelName: 'Meta Llama 3.3 70B (v2.3)', stageName: 'Evolution', eventTitle: 'Prompt Mutation v2.4 Created', details: 'Adjusted trailing stop loss distance for IT sector stocks.', approver: 'Neural Evolution Engine', scoreDelta: 'v2.3 -> v2.4', type: 'EVOLUTION' },
  { id: 'TL-103', timestamp: '10:40:15', modelId: 'MOD-003', modelName: 'Google Gemini 2.5 Pro (v3.0)', stageName: 'Paper Entry', eventTitle: 'Paper Trade Executed: BUY TCS', details: 'Filled 100 shares @ ₹3,840 paper account. SL @ ₹3,790.', approver: 'Paper Execution Gateway', scoreDelta: 'Paper Trade #641', type: 'EXECUTION' },
  { id: 'TL-104', timestamp: '10:35:00', modelId: 'MOD-008', modelName: 'DeepAlpha Synthesizer', stageName: 'Learning', eventTitle: 'Loss Attribution Analyzed', details: 'Identified factor decay during high-spread market regimes.', approver: 'Post-Trade Attribution Core', scoreDelta: '+0.6% Learning', type: 'LEARNING' },
  { id: 'TL-105', timestamp: '10:22:10', modelId: 'MOD-005', modelName: 'Risk Management Guardian', stageName: 'Risk Validation', eventTitle: 'VaR Boundary Clearance Certified', details: 'Validated Reliance straddle portfolio risk under 0.05% VaR threshold.', approver: 'Sentinel VaR Engine', scoreDelta: '100% CSI', type: 'APPROVAL' },
  { id: 'TL-106', timestamp: '10:10:00', modelId: 'MOD-002', modelName: 'Market Analyst AI', stageName: 'Research', eventTitle: 'Macro Sentiment Signal Generated', details: 'Ingested RBI policy wire; bullish sentiment score 0.74.', approver: 'Research Discovery Engine', scoreDelta: '+0.8% Confidence', type: 'TRANSITION' }
];

const INITIAL_FAILURES: FailureIncident[] = [
  { id: 'FAIL-801', timestamp: '10:30:12', modelId: 'MOD-011', modelName: 'Failed Alpha Challenger', stageName: 'Committee Voting', failureType: 'COMMITTEE_REJECTION', reason: 'Committee veto (2/7 quorum). Max portfolio drawdown exceeded during 5-year stress test.', canRetry: true, canRollback: true, resolved: false },
  { id: 'FAIL-802', timestamp: '09:15:44', modelId: 'MOD-010', modelName: 'Legacy Arbitrage Bot', stageName: 'Market Scan', failureType: 'TIMEOUT', reason: 'Inference response time exceeded 50ms SLA boundary (clocked 78ms). Quarantined.', canRetry: false, canRollback: true, resolved: true },
  { id: 'FAIL-803', timestamp: '08:45:00', modelId: 'MOD-007', modelName: 'Neural Price Predictor', stageName: 'Paper Exit', failureType: 'PAPER_FAILURE', reason: 'Slippage exceeded 2.5 ticks on illiquid option contract.', canRetry: true, canRollback: false, resolved: true }
];

const PROMOTION_RULES: PromotionRule[] = [
  { metric: 'Constitutional Safety Index (CSI)', requiredValue: '>= 98.0%', currentSystemAvg: '99.1%', status: 'MET' },
  { metric: 'Paper Trade Win Rate', requiredValue: '>= 70.0%', currentSystemAvg: '73.4%', status: 'MET' },
  { metric: 'Portfolio VaR Risk Limit', requiredValue: '< 0.05%', currentSystemAvg: '0.04%', status: 'MET' },
  { metric: 'Model Confidence Score', requiredValue: '>= 90.0%', currentSystemAvg: '92.8%', status: 'MET' },
  { metric: '7-Agent Committee Quorum', requiredValue: '>= 85% (6/7 Votes)', currentSystemAvg: '92.0%', status: 'MET' },
  { metric: 'Human Operator Signoff', requiredValue: 'Required for Production', currentSystemAvg: 'Verified', status: 'MET' }
];

const ROLLBACK_CHECKPOINTS: RollbackCheckpoint[] = [
  { id: 'RB-501', modelId: 'MOD-002', modelName: 'Anthropic Claude 3.5 Sonnet (v2.8)', currentVersion: 'v2.8', targetVersion: 'v2.7', generation: 'Gen 4', reason: 'Transient alpha decay in high volatility regime', rollbackDate: '2026-07-29', csiDelta: '+0.2%', winRateDelta: '+1.1%', status: 'AVAILABLE' },
  { id: 'RB-502', modelId: 'MOD-003', modelName: 'Google Gemini 2.5 Pro (v3.0)', currentVersion: 'v3.0', targetVersion: 'v2.9', generation: 'Gen 4', reason: 'Fine-tuning prompt weight drift', rollbackDate: '2026-07-25', csiDelta: '0.0%', winRateDelta: '+0.5%', status: 'AVAILABLE' },
  { id: 'RB-503', modelId: 'MOD-011', modelName: 'Alibaba Qwen 2.5 72B (v1.0)', currentVersion: 'v1.0', targetVersion: 'v0.9', generation: 'Gen 1', reason: 'Committee veto recovery after failed stress test', rollbackDate: '2026-08-01', csiDelta: '+6.1%', winRateDelta: '+5.0%', status: 'RESTORED' }
];

const LEARNING_RECORDS: LearningRecord[] = [
  { id: 'LRN-01', timestamp: '10:35:00', modelName: 'Anthropic Claude 3.5 Sonnet (v3.0)', tradesLearned: 890, patternsLearned: 142, mistakesFixed: 18, strategiesImproved: 'Factor Alpha Momentum', memoryAddedMb: 12.4, knowledgeNodesAdded: 8, evolutionTrigger: 'Prompt Mutation v3.1' },
  { id: 'LRN-02', timestamp: '10:20:00', modelName: 'DeepSeek R1 (v2.5)', tradesLearned: 180, patternsLearned: 64, mistakesFixed: 9, strategiesImproved: 'Deep LSTM Option Pricing', memoryAddedMb: 8.1, knowledgeNodesAdded: 4, evolutionTrigger: 'Weight Backprop Epoch 42' },
  { id: 'LRN-03', timestamp: '09:50:00', modelName: 'Meta Llama 3.3 70B (v2.3)', tradesLearned: 510, patternsLearned: 98, mistakesFixed: 12, strategiesImproved: 'IT vs BankNifty Intermarket Flow', memoryAddedMb: 15.2, knowledgeNodesAdded: 11, evolutionTrigger: 'Tournament Match Win' }
];

const DEPENDENCY_NODES: DependencyNode[] = [
  { id: 'DEP-1', name: 'Research Discovery Engine', feedsTo: 'Market Scan & Analytics', health: 99.8, throughputRpm: 1420, status: 'OPTIMAL' },
  { id: 'DEP-2', name: 'Multi-Factor Analytics Core', feedsTo: 'Strategy Synthesizer', health: 99.5, throughputRpm: 2100, status: 'OPTIMAL' },
  { id: 'DEP-3', name: 'Alpha Strategy Synthesizer', feedsTo: 'Sentinel Risk Core', health: 99.2, throughputRpm: 1850, status: 'OPTIMAL' },
  { id: 'DEP-4', name: '7-Agent Committee Quorum', feedsTo: 'Executive Decision Engine', health: 99.9, throughputRpm: 880, status: 'OPTIMAL' },
  { id: 'DEP-5', name: 'Paper Trading Execution Gateway', feedsTo: 'Post-Trade Attribution Core', health: 100.0, throughputRpm: 3200, status: 'OPTIMAL' },
  { id: 'DEP-6', name: 'LMEOS Vector Memory Manager', feedsTo: 'Cross-Market Knowledge Engine', health: 98.9, throughputRpm: 4500, status: 'OPTIMAL' },
  { id: 'DEP-7', name: 'Neural Evolution & Mutation', feedsTo: 'ELO Tournament Arena', health: 97.4, throughputRpm: 120, status: 'DEGRADED' },
  { id: 'DEP-8', name: 'Kernel Promotion Controller', feedsTo: 'Production DMA Gateway', health: 100.0, throughputRpm: 40, status: 'OPTIMAL' }
];

const INITIAL_LOGS: EventLogEntry[] = [
  { id: 'LOG-1', timestamp: '10:48:12.412', modelId: 'MOD-001', modelName: 'OpenAI GPT-4o (v3.2)', stageName: 'Production Promotion', severity: 'SUCCESS', module: 'Promotion Controller', message: 'Model promoted to Elite Production Tier. Certificate #PROMO-8821 signed.' },
  { id: 'LOG-2', timestamp: '10:47:55.109', modelId: 'MOD-004', modelName: 'DeepSeek V3 (v4.1)', stageName: 'Paper Monitoring', severity: 'INFO', module: 'Paper Execution', message: 'Orderbook depth imbalance delta 0.18 detected for INFY.' },
  { id: 'LOG-3', timestamp: '10:45:00.001', modelId: 'MOD-009', modelName: 'Meta Llama 3.3 70B (v2.3)', stageName: 'Evolution', severity: 'SUCCESS', module: 'Mutation Engine', message: 'Prompt weights updated to v2.4 with ATR trailing stop modification.' },
  { id: 'LOG-4', timestamp: '10:30:12.892', modelId: 'MOD-011', modelName: 'Alibaba Qwen 2.5 72B (v1.0)', stageName: 'Committee Voting', severity: 'WARN', module: 'Committee Core', message: 'Vetoed by committee (2/7 quorum). Max drawdown constraint violated.' },
  { id: 'LOG-5', timestamp: '10:20:00.120', modelId: 'MOD-007', modelName: 'DeepSeek R1 (v2.5)', stageName: 'Learning', severity: 'INFO', module: 'Backpropagation', message: 'Epoch 42 loss gradient reduced by 0.014.' },
  { id: 'LOG-6', timestamp: '10:10:00.000', modelId: 'MOD-002', modelName: 'Anthropic Claude 3.5 Sonnet (v2.8)', stageName: 'Research', severity: 'SUCCESS', module: 'Research Discovery', message: 'Ingested 1,200 wire headlines; sentiment score 0.74 (Bullish).' }
];

// ==========================================
// MAIN WORKSPACE COMPONENT
// ==========================================

// ==========================================
// V2 FUTURE READY INDICATOR BANNER
// ==========================================

const V2FutureBanner: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="p-4 bg-slate-900 border border-amber-500/30 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono shadow-xl my-4">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded">
        <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-bold rounded uppercase">
            AI ARINA V2 Architecture • Future Ready
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-[10px] font-bold text-amber-400 border border-amber-500/30 px-3 py-1 bg-amber-500/10 rounded">
        Backend Lifecycle API & Stage Handlers Active
      </span>
    </div>
  </div>
);

export const LifecycleWorkspace: React.FC<{ history?: any[]; initialTab?: string }> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CAREER_REGISTRY' | 'PASSPORT' | 'TRADE_JOURNEY' | 'REPORT_CARD' | 'MARKET_PERF' | 'STRATEGY_PERF' | 'LEARNING_PROGRESS' | 'TOURNAMENT' | 'LEADERBOARD' | 'PROMOTION' | 'GOVERNANCE' | 'STRATEGY_LIFECYCLE'>((initialTab as any) || 'OVERVIEW');
  // Global Workspace States
  const [models, setModels] = useState<AIModelLifecycle[]>(INITIAL_MODELS);
  const [selectedModel, setSelectedModel] = useState<AIModelLifecycle | null>(null);
  const [selectedStageIdx, setSelectedStageIdx] = useState<number | null>(null);
  
  // Controls & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  
  // Interactive Section States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [queueJobs, setQueueJobs] = useState<QueueJob[]>(INITIAL_QUEUE_JOBS);
  const [eventLogs, setEventLogs] = useState<EventLogEntry[]>(INITIAL_LOGS);
  const [failures, setFailures] = useState<FailureIncident[]>(INITIAL_FAILURES);
  const [rollbackPoints, setRollbackPoints] = useState<RollbackCheckpoint[]>(ROLLBACK_CHECKPOINTS);

  // Section 10 Log Filters
  const [logSeverity, setLogSeverity] = useState<string>('ALL');
  const [logModule, setLogModule] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Rollback Comparison Modal
  const [compareRollback, setCompareRollback] = useState<RollbackCheckpoint | null>(null);

  // Notifications / Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Actions
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('AI Lifecycle master telemetry re-synchronized across all 17 stages.');
    }, 600);
  };

  const handlePromoteModel = (modelId: string) => {
    setModels(prev => prev.map(m => {
      if (m.id === modelId) {
        const nextTier = m.promotionTier === 'Paper' ? 'Candidate' : m.promotionTier === 'Candidate' ? 'Champion' : 'Elite';
        return {
          ...m,
          promotionTier: nextTier as any,
          status: 'PRODUCTION',
          lastEvent: `Promoted to ${nextTier} Tier by Operator`
        };
      }
      return m;
    }));
    showToast(`Model ${modelId} successfully promoted!`);
  };

  const handleRetryJob = (jobId: string) => {
    setQueueJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return { ...j, status: 'RUNNING', retryCount: j.retryCount + 1, processingTimeMs: 45 };
      }
      return j;
    }));
    showToast(`Queue Job ${jobId} re-dispatched to execution worker!`);
  };

  const handleExecuteRollback = (checkpointId: string) => {
    setRollbackPoints(prev => prev.map(r => {
      if (r.id === checkpointId) {
        return { ...r, status: 'RESTORED' };
      }
      return r;
    }));
    showToast(`Rollback Checkpoint ${checkpointId} executed successfully! Version restored.`);
  };

  // Filtered Models
  const filteredModels = useMemo(() => {
    return models.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.provider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
      const matchStage = stageFilter === 'ALL' || m.currentStageIdx.toString() === stageFilter;
      return matchSearch && matchStatus && matchStage;
    });
  }, [models, searchQuery, statusFilter, stageFilter]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return eventLogs.filter(l => {
      const matchSeverity = logSeverity === 'ALL' || l.severity === logSeverity;
      const matchModule = logModule === 'ALL' || l.module === logModule;
      const matchSearch = l.message.toLowerCase().includes(logSearch.toLowerCase()) ||
                          l.modelName.toLowerCase().includes(logSearch.toLowerCase()) ||
                          l.stageName.toLowerCase().includes(logSearch.toLowerCase());
      return matchSeverity && matchModule && matchSearch;
    });
  }, [eventLogs, logSeverity, logModule, logSearch]);

  // Calculations for Section 1 Top Summary
  const summaryMetrics = useMemo(() => {
    return {
      total: models.length,
      production: models.filter(m => m.status === 'PRODUCTION').length,
      paper: models.filter(m => m.status === 'PAPER').length,
      training: models.filter(m => m.status === 'TRAINING').length,
      learning: models.filter(m => m.status === 'LEARNING').length,
      evolution: models.filter(m => m.status === 'EVOLUTION').length,
      quarantined: models.filter(m => m.status === 'QUARANTINED').length,
      failed: models.filter(m => m.status === 'FAILED').length,
      paused: models.filter(m => m.status === 'PAUSED').length,
      retired: models.filter(m => m.status === 'RETIRED').length,
      avgCycleTime: '14.8m',
      promotionRate: '78.5%',
      rollbackCount: rollbackPoints.length,
      successRate: '96.2%'
    };
  }, [models, rollbackPoints]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 text-slate-100 p-4 lg:p-6 space-y-6 font-mono text-xs">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-amber-500 text-black px-4 py-2.5 rounded shadow-2xl font-bold flex items-center gap-2 border border-amber-300"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* HEADER: ENTERPRISE AI LIFECYCLE MANAGEMENT SYSTEM         */}
      {/* ========================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-amber-400" /> AI ARINA V3.2
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold uppercase tracking-wider">Enterprise AI Lifecycle Management System</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg lg:text-xl font-bold font-mono tracking-tight text-white uppercase flex items-center gap-2">
              <Workflow className="w-5 h-5 text-amber-400 animate-pulse" />
              AI Model Lifecycle Operating System
            </h1>
            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              FULL OPERATIONAL TRACEABILITY
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            End-to-End Lifecycle Management from Research to Production &bull; 17 Deterministic Stages &bull; Strict Governance & Rollback Control
          </p>
        </div>

        {/* TOP SYSTEM ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCcw className={cn("w-3.5 h-3.5 text-amber-400", isRefreshing && "animate-spin")} />
            <span>Sync Telemetry</span>
          </button>
          <button
            onClick={() => showToast('Exporting complete lifecycle audit log in JSON/CSV format...')}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Lifecycle Audit</span>
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* AI LIFECYCLE WORKSPACE NAVIGATION TAB STRIP                */}
      {/* ========================================================== */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border border-slate-800 p-2 rounded-lg flex items-center gap-1.5 overflow-x-auto text-[10px] font-bold shadow-xl shrink-0 min-h-[50px] scrollbar-thin">
        {[
          { id: 'OVERVIEW', label: '1. Executive Overview', icon: Crown },
          { id: 'CAREER_REGISTRY', label: '2. AI Career Registry', icon: Users },
          { id: 'PASSPORT', label: '3. AI Career Passport', icon: FileText },
          { id: 'TRADE_JOURNEY', label: '4. Trade Journey', icon: Workflow },
          { id: 'REPORT_CARD', label: '5. Performance Report Card', icon: BarChart3 },
          { id: 'MARKET_PERF', label: '6. Market Performance', icon: TrendingUp },
          { id: 'STRATEGY_PERF', label: '7. Strategy Performance', icon: Layers },
          { id: 'LEARNING_PROGRESS', label: '8. Learning Progress', icon: Activity },
          { id: 'TOURNAMENT', label: '9. Tournament Arena', icon: Award },
          { id: 'LEADERBOARD', label: '10. AI Leaderboard', icon: Trophy },
          { id: 'PROMOTION', label: '11. Promotion & Ranking', icon: ShieldCheck },
          { id: 'GOVERNANCE', label: '12. Governance & Audit', icon: FileCheck },
          { id: 'STRATEGY_LIFECYCLE', label: '13. Strategy Lifecycle', icon: Workflow }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-3 py-2 rounded font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap text-[10px] shrink-0",
                isActive 
                  ? "bg-amber-500 text-slate-950 font-black shadow-lg scale-[1.02]" 
                  : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'STRATEGY_LIFECYCLE' && (
        <div className="space-y-4">
          <EnterpriseStrategyLifecycleIntelligenceCenter />
        </div>
      )}

      {activeTab === 'CAREER_REGISTRY' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase text-white">AI Career Registry & Master Fleet Directory (28 Active Units)</h2>
              </div>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
                Hyper-Dense Enterprise Table
              </span>
            </div>

            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-950 text-slate-400 uppercase sticky top-0 border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Model Name</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Provider & Version</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Stage</th>
                    <th className="p-2.5">Win Rate</th>
                    <th className="p-2.5">CSI Safety</th>
                    <th className="p-2.5">Capital Allocated</th>
                    <th className="p-2.5">Runtime</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {models.concat(models).map((m, idx) => (
                    <tr key={`${m.id}-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-2.5 font-bold text-amber-400 whitespace-nowrap">{m.id}-{idx + 1}</td>
                      <td className="p-2.5 font-bold text-white whitespace-nowrap">{m.name}</td>
                      <td className="p-2.5 text-slate-300 whitespace-nowrap">{m.role}</td>
                      <td className="p-2.5 text-slate-400 whitespace-nowrap">{m.provider} ({m.version})</td>
                      <td className="p-2.5 whitespace-nowrap"><span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-bold">{m.status}</span></td>
                      <td className="p-2.5 text-amber-300 whitespace-nowrap">Stage #{m.currentStageIdx + 1}</td>
                      <td className="p-2.5 font-bold text-emerald-400 whitespace-nowrap">{m.winRate}</td>
                      <td className="p-2.5 font-bold text-emerald-300 whitespace-nowrap">{m.csi}%</td>
                      <td className="p-2.5 font-bold text-blue-300 whitespace-nowrap">{m.capital}</td>
                      <td className="p-2.5 text-slate-300 whitespace-nowrap">{m.runtime}</td>
                      <td className="p-2.5 text-right whitespace-nowrap">
                        <button onClick={() => setSelectedModel(m)} className="px-2 py-0.5 bg-slate-950 border border-slate-700 text-amber-300 rounded text-[10px] font-bold hover:bg-slate-800">
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PASSPORT' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-900 border border-amber-500/30 p-3 rounded-lg space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase text-white">AI Career Digital Passports & Cryptographic Audit Ledger</h2>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                Immutable SHA-256 Ledger
              </span>
            </div>

            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-950 text-slate-400 uppercase sticky top-0 border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2.5">Model ID</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Generation</th>
                    <th className="p-2.5">Promotion Tier</th>
                    <th className="p-2.5">Safety CSI</th>
                    <th className="p-2.5">Last Event</th>
                    <th className="p-2.5">Approved By</th>
                    <th className="p-2.5">Rollback Status</th>
                    <th className="p-2.5 text-right">Cryptographic Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {models.concat(models).map((m, idx) => (
                    <tr key={`pass-${m.id}-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-2.5 font-bold text-amber-400 whitespace-nowrap">{m.id}</td>
                      <td className="p-2.5 font-bold text-white whitespace-nowrap">{m.name}</td>
                      <td className="p-2.5 text-slate-300 whitespace-nowrap">{m.generation}</td>
                      <td className="p-2.5 whitespace-nowrap"><span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[9px] font-bold">{m.promotionTier}</span></td>
                      <td className="p-2.5 font-bold text-emerald-400 whitespace-nowrap">{m.csi}% CSI</td>
                      <td className="p-2.5 text-slate-200 whitespace-nowrap">{m.lastEvent}</td>
                      <td className="p-2.5 text-emerald-300 whitespace-nowrap">{m.approvedBy}</td>
                      <td className="p-2.5 text-blue-300 whitespace-nowrap">{m.rollbackStatus}</td>
                      <td className="p-2.5 font-mono text-[9px] text-slate-500 text-right whitespace-nowrap">0x88f91c3a9920182b...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TRADE_JOURNEY' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase text-white">AI Trade Journey & Paper Execution Log Table (30+ Rows)</h2>
              </div>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded text-[10px] font-bold">
                100% Real-Time Traced
              </span>
            </div>

            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-950 text-slate-400 uppercase sticky top-0 border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Event ID</th>
                    <th className="p-2.5">Model Name</th>
                    <th className="p-2.5">Stage</th>
                    <th className="p-2.5">Event Title</th>
                    <th className="p-2.5">Details</th>
                    <th className="p-2.5">Approver</th>
                    <th className="p-2.5 text-right">Score Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Array.from({ length: 25 }).map((_, idx) => {
                    const tl = INITIAL_TIMELINE[idx % INITIAL_TIMELINE.length];
                    return (
                      <tr key={`tl-row-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                        <td className="p-2.5 font-mono text-amber-400 whitespace-nowrap">10:48:{String(idx).padStart(2, '0')}</td>
                        <td className="p-2.5 font-bold text-slate-300 whitespace-nowrap">TL-90{idx}</td>
                        <td className="p-2.5 font-bold text-white whitespace-nowrap">{tl.modelName}</td>
                        <td className="p-2.5 text-amber-300 whitespace-nowrap">{tl.stageName}</td>
                        <td className="p-2.5 text-white font-bold whitespace-nowrap">{tl.eventTitle}</td>
                        <td className="p-2.5 text-slate-300 max-w-xs truncate">{tl.details}</td>
                        <td className="p-2.5 text-emerald-300 whitespace-nowrap">{tl.approver}</td>
                        <td className="p-2.5 font-bold text-emerald-400 text-right whitespace-nowrap">{tl.scoreDelta}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'REPORT_CARD' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase text-white">AI Fleet Performance Report Cards & Comparison Grid</h2>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                Overall Fleet Win Rate: 74.8%
              </span>
            </div>

            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-950 text-slate-400 uppercase sticky top-0 border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2.5">Model ID</th>
                    <th className="p-2.5">Model Name</th>
                    <th className="p-2.5">Paper Trades</th>
                    <th className="p-2.5">Win Rate</th>
                    <th className="p-2.5">CSI Safety</th>
                    <th className="p-2.5">Risk Level</th>
                    <th className="p-2.5">Learning Score</th>
                    <th className="p-2.5">Health Status</th>
                    <th className="p-2.5 text-right">Performance Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {models.concat(models).map((m, idx) => (
                    <tr key={`rc-${m.id}-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-2.5 font-bold text-amber-400 whitespace-nowrap">{m.id}</td>
                      <td className="p-2.5 font-bold text-white whitespace-nowrap">{m.name}</td>
                      <td className="p-2.5 text-slate-300 whitespace-nowrap">{m.paperTrades} trades</td>
                      <td className="p-2.5 font-bold text-emerald-400 whitespace-nowrap">{m.winRate}</td>
                      <td className="p-2.5 font-bold text-emerald-300 whitespace-nowrap">{m.csi}%</td>
                      <td className="p-2.5 whitespace-nowrap"><span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[9px] font-bold">{m.risk}</span></td>
                      <td className="p-2.5 text-purple-300 whitespace-nowrap">{m.learningScore}</td>
                      <td className="p-2.5 text-emerald-400 whitespace-nowrap">{m.health}</td>
                      <td className="p-2.5 font-bold text-amber-400 text-right whitespace-nowrap">GRADE A+ (Elite)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'MARKET_PERF' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase text-white">Market Segment Performance Matrix (20 Segments)</h2>
              </div>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
                NSE / BSE / Derivative Segments
              </span>
            </div>

            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-950 text-slate-400 uppercase sticky top-0 border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2.5">Segment ID</th>
                    <th className="p-2.5">Market & Asset Class</th>
                    <th className="p-2.5">Generated Alpha</th>
                    <th className="p-2.5">Win Rate</th>
                    <th className="p-2.5">Active Models</th>
                    <th className="p-2.5">Liquidity Depth</th>
                    <th className="p-2.5">Volatility Index</th>
                    <th className="p-2.5 text-right">Execution Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { id: 'MK-01', name: 'NIFTY 50 Index Options', alpha: '+18.4%', winRate: '78.5%', models: 12, depth: '₹4,500 Cr', vol: '14.2%', latency: '4ms' },
                    { id: 'MK-02', name: 'BANKNIFTY Weekly Futures', alpha: '+22.1%', winRate: '75.2%', models: 10, depth: '₹6,200 Cr', vol: '18.8%', latency: '3ms' },
                    { id: 'MK-03', name: 'FINNIFTY & Midcap Spread', alpha: '+14.2%', winRate: '71.0%', models: 6, depth: '₹1,800 Cr', vol: '16.5%', latency: '5ms' },
                    { id: 'MK-04', name: 'Reliance Industries Equities', alpha: '+24.5%', winRate: '81.2%', models: 8, depth: '₹2,400 Cr', vol: '12.1%', latency: '2ms' },
                    { id: 'MK-05', name: 'TCS & IT Sector Basket', alpha: '+19.8%', winRate: '76.4%', models: 7, depth: '₹1,900 Cr', vol: '15.0%', latency: '3ms' },
                    { id: 'MK-06', name: 'HDFC Bank & Banking Index', alpha: '+21.0%', winRate: '74.8%', models: 9, depth: '₹3,500 Cr', vol: '17.2%', latency: '2ms' },
                    { id: 'MK-07', name: 'MCX Crude Oil Futures', alpha: '+31.4%', winRate: '68.5%', models: 5, depth: '₹950 Cr', vol: '28.4%', latency: '8ms' },
                    { id: 'MK-08', name: 'MCX Gold & Silver Bullion', alpha: '+16.2%', winRate: '77.1%', models: 8, depth: '₹1,500 Cr', vol: '11.8%', latency: '6ms' },
                    { id: 'MK-09', name: 'Nifty IT Index Futures', alpha: '+17.9%', winRate: '73.0%', models: 6, depth: '₹1,100 Cr', vol: '14.5%', latency: '4ms' },
                    { id: 'MK-10', name: 'Nifty Auto Sector Options', alpha: '+20.3%', winRate: '72.4%', models: 7, depth: '₹880 Cr', vol: '16.1%', latency: '4ms' },
                    { id: 'MK-11', name: 'Nifty Metal Index Spread', alpha: '+25.6%', winRate: '69.2%', models: 4, depth: '₹750 Cr', vol: '24.2%', latency: '6ms' },
                    { id: 'MK-12', name: 'Nifty Pharma Index Basket', alpha: '+15.1%', winRate: '79.0%', models: 6, depth: '₹920 Cr', vol: '12.8%', latency: '5ms' },
                    { id: 'MK-13', name: 'USD/INR Currency Futures', alpha: '+11.2%', winRate: '83.4%', models: 5, depth: '₹5,100 Cr', vol: '6.2%', latency: '2ms' },
                    { id: 'MK-14', name: 'Nifty Energy Index Options', alpha: '+22.8%', winRate: '74.1%', models: 7, depth: '₹1,400 Cr', vol: '19.4%', latency: '4ms' },
                    { id: 'MK-15', name: 'Nifty FMCG Defensive Basket', alpha: '+12.4%', winRate: '80.5%', models: 6, depth: '₹1,800 Cr', vol: '9.5%', latency: '3ms' },
                    { id: 'MK-16', name: 'Nifty Realty High-Beta Spread', alpha: '+34.2%', winRate: '66.8%', models: 4, depth: '₹620 Cr', vol: '31.2%', latency: '7ms' },
                    { id: 'MK-17', name: 'India VIX Volatility Arbitrage', alpha: '+42.1%', winRate: '65.0%', models: 5, depth: '₹2,100 Cr', vol: '45.0%', latency: '1ms' },
                    { id: 'MK-18', name: 'Nifty PSE Public Sector Basket', alpha: '+23.5%', winRate: '75.8%', models: 6, depth: '₹1,600 Cr', vol: '18.1%', latency: '4ms' },
                    { id: 'MK-19', name: 'Nifty Smallcap 100 Momentum', alpha: '+38.9%', winRate: '67.4%', models: 8, depth: '₹1,200 Cr', vol: '32.5%', latency: '5ms' },
                    { id: 'MK-20', name: 'Nifty Midcap 150 Breakout', alpha: '+28.1%', winRate: '71.8%', models: 9, depth: '₹2,300 Cr', vol: '22.0%', latency: '3ms' }
                  ].map((mk, idx) => (
                    <tr key={`mk-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-2.5 font-bold text-amber-400 whitespace-nowrap">{mk.id}</td>
                      <td className="p-2.5 font-bold text-white whitespace-nowrap">{mk.name}</td>
                      <td className="p-2.5 font-bold text-emerald-400 whitespace-nowrap">{mk.alpha}</td>
                      <td className="p-2.5 font-bold text-blue-300 whitespace-nowrap">{mk.winRate}</td>
                      <td className="p-2.5 text-slate-300 whitespace-nowrap">{mk.models} Models</td>
                      <td className="p-2.5 text-slate-300 whitespace-nowrap">{mk.depth}</td>
                      <td className="p-2.5 text-slate-400 whitespace-nowrap">{mk.vol}</td>
                      <td className="p-2.5 font-mono text-emerald-300 text-right whitespace-nowrap">{mk.latency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'STRATEGY_PERF' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase text-white">Strategy Performance Analytics Matrix (20 Strategies)</h2>
              </div>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-bold">
                Multi-Factor & Momentum Attribution
              </span>
            </div>

            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-950 text-slate-400 uppercase sticky top-0 border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2.5">Strat ID</th>
                    <th className="p-2.5">Strategy Name</th>
                    <th className="p-2.5">Sharpe Ratio</th>
                    <th className="p-2.5">Max Drawdown</th>
                    <th className="p-2.5">Annualized Return</th>
                    <th className="p-2.5">Win/Loss Ratio</th>
                    <th className="p-2.5">Alpha Attribution</th>
                    <th className="p-2.5 text-right">Execution Core</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { id: 'ST-01', name: 'Multi-Factor Alpha Engine', sharpe: '2.84', dd: '-1.4%', ret: '+34.2%', wl: '2.41', alpha: '+8.5%' },
                    { id: 'ST-02', name: 'Orderflow Momentum Breakout', sharpe: '2.45', dd: '-2.1%', ret: '+28.9%', wl: '2.10', alpha: '+7.2%' },
                    { id: 'ST-03', name: 'Statistical Arbitrage Range', sharpe: '2.10', dd: '-0.9%', ret: '+19.5%', wl: '1.95', alpha: '+5.1%' },
                    { id: 'ST-04', name: 'Intermarket Flow Sector Rotation', sharpe: '2.32', dd: '-1.8%', ret: '+24.1%', wl: '2.05', alpha: '+6.8%' },
                    { id: 'ST-05', name: 'Gamma Skew Options Hedger', sharpe: '2.61', dd: '-2.5%', ret: '+31.0%', wl: '2.25', alpha: '+9.1%' },
                    { id: 'ST-06', name: 'Volatility Mean Reversion Core', sharpe: '1.98', dd: '-3.1%', ret: '+18.4%', wl: '1.80', alpha: '+4.5%' },
                    { id: 'ST-07', name: 'VWAP Execution Scalper', sharpe: '2.75', dd: '-0.8%', ret: '+29.4%', wl: '2.50', alpha: '+7.9%' },
                    { id: 'ST-08', name: 'Twin Momentum Cross-Asset', sharpe: '2.20', dd: '-1.5%', ret: '+22.8%', wl: '1.90', alpha: '+6.1%' },
                    { id: 'ST-09', name: 'Kalman Filter Spread Capturer', sharpe: '2.50', dd: '-1.1%', ret: '+26.5%', wl: '2.15', alpha: '+7.4%' },
                    { id: 'ST-10', name: 'MACD Crossover AI Filter', sharpe: '1.85', dd: '-3.5%', ret: '+15.2%', wl: '1.65', alpha: '+3.8%' },
                    { id: 'ST-11', name: 'RSI Extreme Divergence', sharpe: '2.05', dd: '-2.2%', ret: '+20.1%', wl: '1.85', alpha: '+5.2%' },
                    { id: 'ST-12', name: 'Supertrend Trend Following', sharpe: '2.38', dd: '-2.0%', ret: '+25.4%', wl: '2.08', alpha: '+6.5%' },
                    { id: 'ST-13', name: 'Ichimoku Cloud Breakout', sharpe: '2.15', dd: '-1.9%', ret: '+21.0%', wl: '1.92', alpha: '+5.8%' },
                    { id: 'ST-14', name: 'Bollinger Band Squeeze Alpha', sharpe: '2.68', dd: '-1.6%', ret: '+32.1%', wl: '2.30', alpha: '+8.8%' },
                    { id: 'ST-15', name: 'Orderbook Imbalance Scalper', sharpe: '2.90', dd: '-0.6%', ret: '+36.5%', wl: '2.80', alpha: '+10.2%' },
                    { id: 'ST-16', name: 'Sentiment NLP Wire Breaker', sharpe: '2.25', dd: '-2.4%', ret: '+23.4%', wl: '1.98', alpha: '+6.4%' },
                    { id: 'ST-17', name: 'Yield Curve Steepener Arbitrage', sharpe: '2.01', dd: '-1.0%', ret: '+17.8%', wl: '1.82', alpha: '+4.2%' },
                    { id: 'ST-18', name: 'Opening Range Breakout (ORB)', sharpe: '2.42', dd: '-2.8%', ret: '+27.5%', wl: '2.12', alpha: '+7.1%' },
                    { id: 'ST-19', name: 'Pivot Point Reversal Core', sharpe: '1.92', dd: '-2.9%', ret: '+16.5%', wl: '1.70', alpha: '+3.9%' },
                    { id: 'ST-20', name: 'Deep LSTM Price Predictor', sharpe: '2.80', dd: '-1.2%', ret: '+35.0%', wl: '2.60', alpha: '+9.5%' }
                  ].map((st, idx) => (
                    <tr key={`st-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-2.5 font-bold text-amber-400 whitespace-nowrap">{st.id}</td>
                      <td className="p-2.5 font-bold text-white whitespace-nowrap">{st.name}</td>
                      <td className="p-2.5 font-bold text-emerald-400 whitespace-nowrap">{st.sharpe}</td>
                      <td className="p-2.5 font-bold text-rose-400 whitespace-nowrap">{st.dd}</td>
                      <td className="p-2.5 font-bold text-amber-400 whitespace-nowrap">{st.ret}</td>
                      <td className="p-2.5 text-blue-300 whitespace-nowrap">{st.wl}</td>
                      <td className="p-2.5 text-purple-300 whitespace-nowrap">{st.alpha}</td>
                      <td className="p-2.5 text-slate-400 text-right whitespace-nowrap">Active Pipeline</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'LEARNING_PROGRESS' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase text-white">AI Learning Progress & Evolution Attribution Table (20+ Rows)</h2>
              </div>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
                Autonomous Backpropagation Active
              </span>
            </div>

            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-950 text-slate-400 uppercase sticky top-0 border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2.5">Epoch ID</th>
                    <th className="p-2.5">Model Name</th>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Evolution Event</th>
                    <th className="p-2.5">Trades Learned</th>
                    <th className="p-2.5">Patterns Added</th>
                    <th className="p-2.5">Mistakes Fixed</th>
                    <th className="p-2.5 text-right">Performance Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Array.from({ length: 20 }).map((_, idx) => (
                    <tr key={`lr-row-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-2.5 font-bold text-amber-400 whitespace-nowrap">EPOCH-8{idx}</td>
                      <td className="p-2.5 font-bold text-white whitespace-nowrap">Sector Rotation Specialist</td>
                      <td className="p-2.5 text-slate-400 whitespace-nowrap">10:3{idx}:00 IST</td>
                      <td className="p-2.5 text-slate-300 whitespace-nowrap">Prompt weights mutated to v2.{idx} with ATR trailing stop</td>
                      <td className="p-2.5 text-blue-300 whitespace-nowrap">{50 + idx * 12} trades</td>
                      <td className="p-2.5 text-emerald-400 whitespace-nowrap">+{8 + idx} nodes</td>
                      <td className="p-2.5 text-amber-400 whitespace-nowrap">+{2 + (idx % 4)} fixes</td>
                      <td className="p-2.5 font-bold text-emerald-400 text-right whitespace-nowrap">+{1.2 + (idx * 0.1).toFixed(1)}% WinRate</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TOURNAMENT' && (
        <AITournamentArenaWorkspace showToast={showToast} />
      )}

      {activeTab === 'LEADERBOARD' && (
        <LeaderboardWorkspace />
      )}

      {activeTab === 'PROMOTION' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase text-white">Production Promotion Pipeline Audit Table (28 Units)</h2>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                100% Committee Quorum Enforced
              </span>
            </div>

            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-950 text-slate-400 uppercase sticky top-0 border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2.5">Model ID</th>
                    <th className="p-2.5">Model Name</th>
                    <th className="p-2.5">Current Tier</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Committee Signoff</th>
                    <th className="p-2.5">Safety CSI</th>
                    <th className="p-2.5">Win Rate</th>
                    <th className="p-2.5 text-right">Promotion Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {models.concat(models).map((m, idx) => (
                    <tr key={`promo-${m.id}-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-2.5 font-bold text-amber-400 whitespace-nowrap">{m.id}</td>
                      <td className="p-2.5 font-bold text-white whitespace-nowrap">{m.name}</td>
                      <td className="p-2.5 whitespace-nowrap"><span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[9px] font-bold">{m.promotionTier}</span></td>
                      <td className="p-2.5 whitespace-nowrap"><span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-bold">{m.status}</span></td>
                      <td className="p-2.5 text-emerald-300 whitespace-nowrap">{m.approvedBy}</td>
                      <td className="p-2.5 font-bold text-emerald-400 whitespace-nowrap">{m.csi}%</td>
                      <td className="p-2.5 text-blue-300 whitespace-nowrap">{m.winRate}</td>
                      <td className="p-2.5 text-right whitespace-nowrap">
                        <button onClick={() => handlePromoteModel(m.id)} className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                          Promote Tier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'GOVERNANCE' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase text-white">Lifecycle Governance & Cryptographic Audit Table (20 Rules)</h2>
              </div>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
                SHA-256 Immutable Ledger
              </span>
            </div>

            <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-950 text-slate-400 uppercase sticky top-0 border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2.5">Rule ID</th>
                    <th className="p-2.5">Constitution Article</th>
                    <th className="p-2.5">Compliance Requirement</th>
                    <th className="p-2.5">System Status</th>
                    <th className="p-2.5">Verifier Engine</th>
                    <th className="p-2.5 text-right">Cryptographic Root Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Array.from({ length: 20 }).map((_, idx) => (
                    <tr key={`gov-${idx}`} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-2.5 font-bold text-amber-400 whitespace-nowrap">GOV-RULE-{idx + 1}</td>
                      <td className="p-2.5 font-bold text-white whitespace-nowrap">Article {idx + 1}: Risk & VaR Envelope</td>
                      <td className="p-2.5 text-slate-300">Mandatory max 0.05% portfolio VaR limit with 7-agent quorum approval</td>
                      <td className="p-2.5 whitespace-nowrap"><span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-bold">100% COMPLIANT</span></td>
                      <td className="p-2.5 text-purple-300 whitespace-nowrap">Sentinel VaR Engine</td>
                      <td className="p-2.5 font-mono text-[9px] text-slate-500 text-right whitespace-nowrap">0x88f91c3a9920182b{idx}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'OVERVIEW' && (
        <>

      {/* ========================================================== */}
      {/* SECTION 1: AI LIFECYCLE OVERVIEW (TOP SUMMARY METRICS)     */}
      {/* ========================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-400" /> Section 1: AI Lifecycle Master Summary
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">100% Operational Traceability</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 xl:grid-cols-14 gap-2">
          {[
            { label: 'Total Models', val: summaryMetrics.total, sub: 'Fleet Count', color: 'text-white', border: 'border-slate-800' },
            { label: 'Production', val: summaryMetrics.production, sub: 'Live Execution', color: 'text-emerald-400', border: 'border-emerald-500/30' },
            { label: 'Paper', val: summaryMetrics.paper, sub: 'Forward Testing', color: 'text-blue-400', border: 'border-blue-500/30' },
            { label: 'Training', val: summaryMetrics.training, sub: 'Backpropagation', color: 'text-purple-400', border: 'border-purple-500/30' },
            { label: 'Learning', val: summaryMetrics.learning, sub: 'Attribution', color: 'text-amber-400', border: 'border-amber-500/30' },
            { label: 'Evolution', val: summaryMetrics.evolution, sub: 'Prompt Mutate', color: 'text-cyan-400', border: 'border-cyan-500/30' },
            { label: 'Quarantined', val: summaryMetrics.quarantined, sub: 'SLA Violation', color: 'text-rose-400', border: 'border-rose-500/30' },
            { label: 'Failed', val: summaryMetrics.failed, sub: 'Rejections', color: 'text-rose-500', border: 'border-rose-500/40' },
            { label: 'Paused', val: summaryMetrics.paused, sub: 'Maintenance', color: 'text-slate-400', border: 'border-slate-800' },
            { label: 'Retired', val: summaryMetrics.retired, sub: 'Archived', color: 'text-slate-500', border: 'border-slate-800' },
            { label: 'Avg Cycle Time', val: summaryMetrics.avgCycleTime, sub: 'Stage 1 -> 17', color: 'text-white', border: 'border-slate-800' },
            { label: 'Promotion Rate', val: summaryMetrics.promotionRate, sub: 'Tier Growth', color: 'text-emerald-400', border: 'border-emerald-500/30' },
            { label: 'Rollback Count', val: summaryMetrics.rollbackCount, sub: 'Checkpoints', color: 'text-amber-400', border: 'border-amber-500/30' },
            { label: 'Success Rate', val: summaryMetrics.successRate, sub: 'System Wide', color: 'text-emerald-400', border: 'border-emerald-500/30' },
          ].map((m, idx) => (
            <div key={idx} className={cn("p-2.5 bg-slate-900 border rounded flex flex-col justify-between space-y-1 shadow-md hover:border-slate-700 transition-colors", m.border)}>
              <span className="text-[9px] text-slate-400 uppercase font-bold truncate">{m.label}</span>
              <div className={cn("text-base font-bold font-mono tracking-tight", m.color)}>{m.val}</div>
              <span className="text-[8px] text-slate-500 truncate">{m.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 2: 17-STAGE ENTERPRISE LIFECYCLE                   */}
      {/* ========================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 2: 17-Stage Enterprise Lifecycle Visual Matrix</h2>
          </div>
          <span className="text-[10px] text-slate-400">Click any stage to filter models or view stage specifications</span>
        </div>

        {/* 17 STAGES GRID / SEQUENTIAL FLOW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-17 gap-2">
          {STAGES_17.map((st) => {
            const isSelected = selectedStageIdx === st.id - 1;
            return (
              <div
                key={st.id}
                onClick={() => {
                  if (selectedStageIdx === st.id - 1) {
                    setSelectedStageIdx(null);
                    setStageFilter('ALL');
                  } else {
                    setSelectedStageIdx(st.id - 1);
                    setStageFilter((st.id - 1).toString());
                  }
                }}
                className={cn(
                  "p-2 rounded border transition-all cursor-pointer flex flex-col justify-between space-y-2 relative group",
                  isSelected 
                    ? "bg-slate-800 border-amber-400 shadow-lg ring-1 ring-amber-400" 
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                )}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-amber-400 font-bold">#{st.id.toString().padStart(2, '0')}</span>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    st.status === 'ACTIVE' && "bg-emerald-400 animate-pulse",
                    st.status === 'PROCESSING' && "bg-amber-400 animate-ping",
                    st.status === 'SYNCED' && "bg-blue-400",
                    st.status === 'IDLE' && "bg-slate-600"
                  )} />
                </div>

                <div>
                  <div className="text-[10px] font-bold text-white leading-tight truncate">{st.name}</div>
                  <div className="text-[8px] text-slate-400 truncate mt-0.5">{st.responsibleEngine}</div>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-900 text-[9px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Models:</span>
                    <span className="text-amber-400 font-bold">{st.activeModelsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avg Duration:</span>
                    <span className="text-slate-300 font-bold">{st.avgDuration}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SELECTED STAGE DETAILED SPEC CARD */}
        {selectedStageIdx !== null && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-slate-950 border border-amber-500/40 rounded space-y-2 text-[11px]"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-amber-400" /> Stage #{STAGES_17[selectedStageIdx].id}: {STAGES_17[selectedStageIdx].name} Specification
              </span>
              <button onClick={() => { setSelectedStageIdx(null); setStageFilter('ALL'); }} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-slate-300">
              <div><strong className="text-slate-400 block">Responsible Engine:</strong> <span className="text-white">{STAGES_17[selectedStageIdx].responsibleEngine}</span></div>
              <div><strong className="text-slate-400 block">Input Spec:</strong> <span className="text-amber-300">{STAGES_17[selectedStageIdx].input}</span></div>
              <div><strong className="text-slate-400 block">Output Spec:</strong> <span className="text-emerald-300">{STAGES_17[selectedStageIdx].output}</span></div>
              <div><strong className="text-slate-400 block">Dependencies:</strong> <span className="text-blue-300">{STAGES_17[selectedStageIdx].dependencies}</span></div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ========================================================== */}
      {/* SECTION 3 & SECTION 5 GRID (LIVE PIPELINE & TIMELINE)      */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* SECTION 3: LIVE PIPELINE QUEUE (XL: 6 COLS) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 3: Live Pipeline Queue</h2>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">{queueJobs.length} Active Queue Tasks</span>
            </div>

            {/* QUEUE STATUS STATS */}
            <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1.5 rounded border border-slate-800 text-center text-[10px]">
              <div><span className="text-slate-500 block">Waiting</span><strong className="text-amber-400">{queueJobs.filter(j => j.status === 'WAITING').length}</strong></div>
              <div><span className="text-slate-500 block">Running</span><strong className="text-emerald-400">{queueJobs.filter(j => j.status === 'RUNNING').length}</strong></div>
              <div><span className="text-slate-500 block">Completed</span><strong className="text-white">{queueJobs.filter(j => j.status === 'COMPLETED').length}</strong></div>
              <div><span className="text-slate-500 block">Failed</span><strong className="text-rose-400">{queueJobs.filter(j => j.status === 'FAILED').length}</strong></div>
              <div><span className="text-slate-500 block">Retry</span><strong className="text-purple-400">{queueJobs.filter(j => j.status === 'RETRY').length}</strong></div>
              <div><span className="text-slate-500 block">Blocked</span><strong className="text-slate-400">{queueJobs.filter(j => j.status === 'BLOCKED').length}</strong></div>
            </div>

            {/* QUEUE TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="p-2">Job ID</th>
                    <th className="p-2">Model</th>
                    <th className="p-2">Target Stage</th>
                    <th className="p-2">Priority</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">ETA / Latency</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {queueJobs.map(j => (
                    <tr key={j.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-2 font-bold text-amber-400 whitespace-nowrap">{j.id}</td>
                      <td className="p-2 text-white font-bold">{j.modelName}</td>
                      <td className="p-2 text-slate-300">{j.stageName}</td>
                      <td className="p-2">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border",
                          j.priority === 'CRITICAL' && "bg-rose-500/20 text-rose-300 border-rose-500/40",
                          j.priority === 'HIGH' && "bg-amber-500/20 text-amber-300 border-amber-500/40",
                          j.priority === 'NORMAL' && "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        )}>{j.priority}</span>
                      </td>
                      <td className="p-2">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border",
                          j.status === 'RUNNING' && "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse",
                          j.status === 'WAITING' && "bg-amber-500/20 text-amber-300 border-amber-500/40",
                          j.status === 'BLOCKED' && "bg-slate-800 text-slate-400 border-slate-700",
                          j.status === 'RETRY' && "bg-purple-500/20 text-purple-300 border-purple-500/40",
                          j.status === 'COMPLETED' && "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        )}>{j.status}</span>
                      </td>
                      <td className="p-2 text-slate-400">{j.status === 'RUNNING' ? `${j.processingTimeMs}ms` : j.eta}</td>
                      <td className="p-2 text-right">
                        {j.status !== 'RUNNING' && j.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleRetryJob(j.id)}
                            className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold"
                          >
                            Dispatch
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 5: LIFECYCLE TIMELINE (XL: 6 COLS) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 5: Lifecycle Chronological Timeline</h2>
              </div>
              <span className="text-[10px] text-slate-400">Live Stage Transition History</span>
            </div>

            {/* TIMELINE LIST */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {INITIAL_TIMELINE.map((tl) => (
                <div key={tl.id} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {tl.timestamp} IST
                    </span>
                    <span className="text-slate-400 font-bold">{tl.modelName} ({tl.modelId})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">{tl.eventTitle}</span>
                    <span className="text-emerald-400 font-bold">{tl.scoreDelta}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{tl.details}</p>
                  <div className="flex justify-between text-[9px] text-slate-500 border-t border-slate-900 pt-1">
                    <span>Approved by: <strong className="text-slate-300">{tl.approver}</strong></span>
                    <span className="text-amber-300 uppercase font-bold">{tl.stageName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 4: MODEL LIFECYCLE MASTER TABLE                   */}
      {/* ========================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 4: Model Lifecycle Master Matrix</h2>
          </div>
          <span className="text-[10px] text-slate-400">Complete row-by-row lifecycle state &bull; Click model row to open detailed drawer</span>
        </div>

        {/* TABLE SEARCH & FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2 rounded border border-slate-800">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <input
              type="text"
              placeholder="Search by model ID, name, provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white text-xs placeholder-slate-500 focus:outline-none w-full font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[11px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRODUCTION">Production</option>
              <option value="PAPER">Paper</option>
              <option value="TRAINING">Training</option>
              <option value="LEARNING">Learning</option>
              <option value="EVOLUTION">Evolution</option>
              <option value="QUARANTINED">Quarantined</option>
              <option value="FAILED">Failed</option>
              <option value="PAUSED">Paused</option>
            </select>

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[11px]"
            >
              <option value="ALL">All 17 Stages</option>
              {STAGES_17.map(s => (
                <option key={s.id} value={(s.id - 1).toString()}>Stage #{s.id}: {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* MASTER MODEL TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 text-[10px]">
              <tr>
                <th className="p-2.5">Model</th>
                <th className="p-2.5">Current Stage</th>
                <th className="p-2.5">Prev / Next Stage</th>
                <th className="p-2.5">Confidence</th>
                <th className="p-2.5">CSI Safety</th>
                <th className="p-2.5">Risk</th>
                <th className="p-2.5">Capital</th>
                <th className="p-2.5">Paper Win %</th>
                <th className="p-2.5">Learning Score</th>
                <th className="p-2.5">Gen</th>
                <th className="p-2.5">Tier</th>
                <th className="p-2.5">Rollback</th>
                <th className="p-2.5">Health</th>
                <th className="p-2.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredModels.map(m => {
                const currentStageObj = STAGES_17[m.currentStageIdx];
                return (
                  <tr 
                    key={m.id} 
                    onClick={() => setSelectedModel(m)}
                    className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    <td className="p-2.5 whitespace-nowrap">
                      <div className="font-bold text-white group-hover:text-amber-400 transition-colors">{m.name}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{m.id} &bull; {m.provider} ({m.version})</div>
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold text-[10px]">
                        #{currentStageObj.id} {currentStageObj.name}
                      </span>
                    </td>
                    <td className="p-2.5 whitespace-nowrap text-[10px] text-slate-400">
                      <div>Prev: <span className="text-slate-300">{m.previousStage}</span></div>
                      <div>Next: <span className="text-slate-300">{m.nextStage}</span></div>
                    </td>
                    <td className="p-2.5 font-bold text-emerald-400 whitespace-nowrap">{m.confidence}</td>
                    <td className="p-2.5 font-bold text-emerald-300 whitespace-nowrap">{m.csi}%</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border",
                        m.risk === 'LOW' && "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
                        m.risk === 'MEDIUM' && "bg-amber-500/20 text-amber-300 border-amber-500/40",
                        m.risk === 'HIGH' && "bg-rose-500/20 text-rose-300 border-rose-500/40",
                        m.risk === 'CRITICAL' && "bg-rose-600/30 text-rose-200 border-rose-600/50"
                      )}>{m.risk}</span>
                    </td>
                    <td className="p-2.5 font-bold text-white whitespace-nowrap">{m.capital}</td>
                    <td className="p-2.5 font-bold text-emerald-400 whitespace-nowrap">{m.winRate} <span className="text-[9px] text-slate-500">({m.paperTrades}t)</span></td>
                    <td className="p-2.5 font-bold text-purple-300 whitespace-nowrap">{m.learningScore}</td>
                    <td className="p-2.5 text-slate-300 whitespace-nowrap">{m.generation}</td>
                    <td className="p-2.5 whitespace-nowrap">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border",
                        m.promotionTier === 'Elite' && "bg-purple-500/20 text-purple-300 border-purple-500/40",
                        m.promotionTier === 'Champion' && "bg-amber-500/20 text-amber-300 border-amber-500/40",
                        m.promotionTier === 'Candidate' && "bg-blue-500/20 text-blue-300 border-blue-500/40",
                        m.promotionTier === 'Paper' && "bg-slate-800 text-slate-400 border-slate-700"
                      )}>{m.promotionTier}</span>
                    </td>
                    <td className="p-2.5 text-slate-400 whitespace-nowrap">{m.rollbackStatus}</td>
                    <td className="p-2.5 font-bold text-emerald-400 whitespace-nowrap">{m.health}</td>
                    <td className="p-2.5 text-right whitespace-nowrap">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedModel(m); }}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-amber-300 rounded text-[10px] font-bold flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3 h-3 text-amber-400" />
                        <span>Drawer</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 6 & SECTION 7 GRID (FAILURE CENTER & PROMOTION)   */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* SECTION 6: FAILURE CENTER (XL: 6 COLS) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 6: Failure & Exception Center</h2>
              </div>
              <span className="text-[10px] text-rose-400 font-bold">{failures.length} Recorded Incidents</span>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {failures.map(f => (
                <div key={f.id} className="p-3 bg-slate-950 border border-rose-500/30 rounded space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-rose-400 font-bold uppercase border border-rose-500/40 px-1.5 py-0.5 rounded bg-rose-500/10">
                      {f.failureType.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400">{f.timestamp} &bull; {f.modelName}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono leading-relaxed">{f.reason}</p>
                  <div className="flex justify-between items-center border-t border-slate-900 pt-1.5">
                    <span className="text-[9px] text-slate-500">Stage: <strong className="text-slate-300">{f.stageName}</strong></span>
                    <div className="flex items-center gap-2">
                      {f.canRetry && (
                        <button onClick={() => showToast(`Initiating automated retry for ${f.modelName}...`)} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold">
                          Retry Transition
                        </button>
                      )}
                      {f.canRollback && (
                        <button onClick={() => showToast(`Initiating state rollback for ${f.modelName}...`)} className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[9px] font-bold">
                          Rollback Version
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 7: PROMOTION ENGINE (XL: 6 COLS) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 7: Promotion Engine & Tier Rules</h2>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Paper &rarr; Candidate &rarr; Champion &rarr; Elite</span>
            </div>

            {/* PROMOTION RULES GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-slate-950 p-2 rounded border border-slate-800 text-[10px]">
              {PROMOTION_RULES.map((rule, idx) => (
                <div key={idx} className="p-2 border border-slate-800 rounded space-y-1">
                  <span className="text-slate-400 block truncate">{rule.metric}</span>
                  <div className="flex justify-between items-center">
                    <strong className="text-amber-400">{rule.requiredValue}</strong>
                    <span className="text-emerald-400 font-bold">{rule.currentSystemAvg}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* PROMOTION CANDIDATES LIST */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Candidate Models Eligible for Tier Promotion:</span>
              <div className="space-y-2 max-h-[160px] overflow-y-auto">
                {models.filter(m => m.promotionTier === 'Candidate' || m.promotionTier === 'Paper').map(cm => (
                  <div key={cm.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                    <div>
                      <strong className="text-white block">{cm.name} ({cm.id})</strong>
                      <span className="text-[9px] text-slate-400">Current Tier: <span className="text-amber-400">{cm.promotionTier}</span> &bull; Win Rate: <span className="text-emerald-400">{cm.winRate}</span> &bull; CSI: <span className="text-emerald-400">{cm.csi}%</span></span>
                    </div>
                    <button
                      onClick={() => handlePromoteModel(cm.id)}
                      className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold uppercase"
                    >
                      Promote Tier
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 8 & SECTION 9 GRID (ROLLBACK CENTER & LEARNING)   */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* SECTION 8: ROLLBACK CENTER (XL: 6 COLS) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 8: Model State Rollback Center</h2>
              </div>
              <span className="text-[10px] text-slate-400">Version Checkpoint Recovery</span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {rollbackPoints.map(rb => (
                <div key={rb.id} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-amber-400 font-bold">{rb.modelName} ({rb.modelId})</span>
                    <span className="text-slate-400">{rb.rollbackDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span>Current: <strong className="text-rose-400">{rb.currentVersion}</strong> &rarr; Target: <strong className="text-emerald-400">{rb.targetVersion}</strong></span>
                    <span className="text-emerald-400 font-bold">CSI Delta: {rb.csiDelta}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{rb.reason}</p>
                  <div className="flex justify-between items-center border-t border-slate-900 pt-1.5">
                    <button
                      onClick={() => setCompareRollback(rb)}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-[9px] font-bold"
                    >
                      Compare Versions
                    </button>
                    {rb.status === 'AVAILABLE' ? (
                      <button
                        onClick={() => handleExecuteRollback(rb.id)}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold"
                      >
                        Execute Rollback
                      </button>
                    ) : (
                      <span className="text-[9px] text-emerald-400 font-bold uppercase border border-emerald-500/40 px-2 py-0.5 rounded bg-emerald-500/10">
                        Version Restored
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 9: LEARNING IMPACT (XL: 6 COLS) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 9: Learning Impact & Attribution</h2>
              </div>
              <span className="text-[10px] text-purple-300 font-bold">Post-Trade Model Evolution</span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {LEARNING_RECORDS.map(lr => (
                <div key={lr.id} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-purple-300 font-bold">{lr.modelName}</span>
                    <span className="text-slate-400">{lr.timestamp} IST</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-900 p-2 rounded border border-slate-800 text-[10px]">
                    <div><span className="text-slate-500 block">Trades Learned</span><strong className="text-white">{lr.tradesLearned}</strong></div>
                    <div><span className="text-slate-500 block">Patterns</span><strong className="text-emerald-400">+{lr.patternsLearned}</strong></div>
                    <div><span className="text-slate-500 block">Mistakes Fixed</span><strong className="text-amber-400">{lr.mistakesFixed}</strong></div>
                    <div><span className="text-slate-500 block">Nodes Added</span><strong className="text-purple-300">+{lr.knowledgeNodesAdded}</strong></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 border-t border-slate-900 pt-1">
                    <span>Strategy: <strong className="text-slate-200">{lr.strategiesImproved}</strong></span>
                    <span className="text-cyan-400 font-bold">{lr.evolutionTrigger}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 10: EVENT LOG                                      */}
      {/* ========================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 10: Real-Time Lifecycle Event Stream</h2>
          </div>
          <span className="text-[10px] text-slate-400">{filteredLogs.length} Filtered Log Entries</span>
        </div>

        {/* LOG FILTERS */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2 rounded border border-slate-800">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <input
              type="text"
              placeholder="Filter log output..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="bg-transparent text-white text-xs placeholder-slate-500 focus:outline-none w-full font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={logSeverity}
              onChange={(e) => setLogSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[11px]"
            >
              <option value="ALL">All Severities</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>

            <select
              value={logModule}
              onChange={(e) => setLogModule(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 text-[11px]"
            >
              <option value="ALL">All Modules</option>
              <option value="Promotion Controller">Promotion Controller</option>
              <option value="Paper Execution">Paper Execution</option>
              <option value="Mutation Engine">Mutation Engine</option>
              <option value="Committee Core">Committee Core</option>
              <option value="Backpropagation">Backpropagation</option>
              <option value="Research Discovery">Research Discovery</option>
            </select>
          </div>
        </div>

        {/* LOG STREAM TABLE */}
        <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-[10px] font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase sticky top-0 border-b border-slate-800">
              <tr>
                <th className="p-2">Timestamp</th>
                <th className="p-2">Severity</th>
                <th className="p-2">Model</th>
                <th className="p-2">Stage</th>
                <th className="p-2">Module</th>
                <th className="p-2">Log Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-2 text-slate-400 whitespace-nowrap">{l.timestamp}</td>
                  <td className="p-2 whitespace-nowrap">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border",
                      l.severity === 'SUCCESS' && "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
                      l.severity === 'INFO' && "bg-blue-500/20 text-blue-300 border-blue-500/40",
                      l.severity === 'WARN' && "bg-amber-500/20 text-amber-300 border-amber-500/40",
                      l.severity === 'CRITICAL' && "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    )}>{l.severity}</span>
                  </td>
                  <td className="p-2 text-white font-bold whitespace-nowrap">{l.modelName}</td>
                  <td className="p-2 text-amber-300 whitespace-nowrap">{l.stageName}</td>
                  <td className="p-2 text-purple-300 whitespace-nowrap">{l.module}</td>
                  <td className="p-2 text-slate-300">{l.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SECTION 11 & SECTION 12 GRID (DEPENDENCY MAP & ANALYTICS) */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* SECTION 11: DEPENDENCY MAP (XL: 6 COLS) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 11: Lifecycle Subsystem Dependency Map</h2>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">8 Master Feeds Operational</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEPENDENCY_NODES.map(dn => (
                <div key={dn.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded space-y-1 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-center text-[10px]">
                    <strong className="text-white">{dn.name}</strong>
                    <span className="text-emerald-400 font-bold">{dn.health}% Health</span>
                  </div>
                  <div className="text-[9px] text-slate-400">Feeds To: <span className="text-amber-300">{dn.feedsTo}</span></div>
                  <div className="flex justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-900">
                    <span>Throughput: <strong className="text-slate-300">{dn.throughputRpm} RPM</strong></span>
                    <span className="text-emerald-400 uppercase font-bold">{dn.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 12: ANALYTICS (XL: 6 COLS) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Section 12: Lifecycle System Analytics</h2>
              </div>
              <span className="text-[10px] text-slate-400">Quantitative System Efficiency</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Avg Promotion Time', val: '14.8 Hours', sub: 'Stage 1 -> Prod', color: 'text-amber-400' },
                { label: 'Avg Learning Time', val: '32.1 Seconds', sub: 'Post-Trade', color: 'text-purple-300' },
                { label: 'Failure Rate', val: '2.4%', sub: 'System Wide', color: 'text-rose-400' },
                { label: 'Rollback %', val: '1.2%', sub: 'Version Recovery', color: 'text-blue-400' },
                { label: 'Paper Success %', val: '74.8%', sub: 'Stage 9..11', color: 'text-emerald-400' },
                { label: 'Champion Success %', val: '92.4%', sub: 'Production Tier', color: 'text-emerald-400' },
              ].map((an, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">{an.label}</span>
                  <div className={cn("text-lg font-bold font-mono", an.color)}>{an.val}</div>
                  <span className="text-[9px] text-slate-500 block">{an.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* DETAILED MODEL DRAWER / INSPECTOR MODAL                   */}
      {/* ========================================================== */}
      <AnimatePresence>
        {selectedModel && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-6 text-xs text-slate-200"
            >
              {/* DRAWER HEADER */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold text-[10px]">
                      {selectedModel.id}
                    </span>
                    <span className="text-white font-bold text-base">{selectedModel.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{selectedModel.role} &bull; {selectedModel.provider} ({selectedModel.version})</p>
                </div>
                <button 
                  onClick={() => setSelectedModel(null)}
                  className="p-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* CURRENT STAGE HIGHLIGHT */}
              <div className="p-3 bg-slate-950 border border-amber-500/40 rounded space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Current Lifecycle Stage:</span>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-amber-400">
                    Stage #{STAGES_17[selectedModel.currentStageIdx].id}: {STAGES_17[selectedModel.currentStageIdx].name}
                  </div>
                  <span className="text-emerald-400 font-bold">{selectedModel.durationInStage} in stage</span>
                </div>
                <p className="text-[10px] text-slate-300">Rationale: {selectedModel.rationale}</p>
              </div>

              {/* MODEL METRICS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center bg-slate-950 p-3 rounded border border-slate-800">
                <div><span className="text-slate-500 block text-[9px]">Confidence</span><strong className="text-emerald-400 text-sm">{selectedModel.confidence}</strong></div>
                <div><span className="text-slate-500 block text-[9px]">CSI Safety</span><strong className="text-emerald-300 text-sm">{selectedModel.csi}%</strong></div>
                <div><span className="text-slate-500 block text-[9px]">Win Rate</span><strong className="text-white text-sm">{selectedModel.winRate}</strong></div>
                <div><span className="text-slate-500 block text-[9px]">Capital</span><strong className="text-amber-400 text-sm">{selectedModel.capital}</strong></div>
              </div>

              {/* FULL TRACEABILITY DATA */}
              <div className="space-y-3">
                <h3 className="font-bold text-white uppercase text-[11px] border-b border-slate-800 pb-2">Full Lifecycle Traceability Packet</h3>
                
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span className="text-slate-400">Approved By:</span>
                    <strong className="text-white">{selectedModel.approvedBy}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span className="text-slate-400">Previous Stage:</span>
                    <strong className="text-slate-300">{selectedModel.previousStage}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span className="text-slate-400">Next Target Stage:</span>
                    <strong className="text-amber-300">{selectedModel.nextStage}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span className="text-slate-400">Generation & Tier:</span>
                    <strong className="text-purple-300">{selectedModel.generation} &bull; {selectedModel.promotionTier}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span className="text-slate-400">Rollback Status:</span>
                    <strong className="text-emerald-400">{selectedModel.rollbackStatus}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1">
                    <span className="text-slate-400">Total System Runtime:</span>
                    <strong className="text-white">{selectedModel.runtime}</strong>
                  </div>
                </div>
              </div>

              {/* DRAWER ACTION BUTTONS */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                <button
                  onClick={() => { handlePromoteModel(selectedModel.id); setSelectedModel(null); }}
                  className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded font-bold uppercase text-[10px]"
                >
                  Promote Model Tier
                </button>
                <button
                  onClick={() => { showToast(`Initiating state rollback check for ${selectedModel.id}...`); setSelectedModel(null); }}
                  className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded font-bold uppercase text-[10px]"
                >
                  Rollback Version
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* VERSION COMPARISON MODAL                                  */}
      {/* ========================================================== */}
      <AnimatePresence>
        {compareRollback && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-xl w-full space-y-4 shadow-2xl text-xs"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  Version Diff Comparison: {compareRollback.modelName}
                </h3>
                <button onClick={() => setCompareRollback(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950 border border-rose-500/30 rounded space-y-2">
                  <strong className="text-rose-400 block uppercase">Current Version ({compareRollback.currentVersion})</strong>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div>Win Rate: <strong className="text-rose-400">68.2%</strong></div>
                    <div>CSI Safety: <strong className="text-rose-400">97.8%</strong></div>
                    <div>VaR Limit: <strong className="text-rose-400">0.06%</strong></div>
                    <div>Inference Latency: <strong>38ms</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded space-y-2">
                  <strong className="text-emerald-400 block uppercase">Target Version ({compareRollback.targetVersion})</strong>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div>Win Rate: <strong className="text-emerald-400">73.5% ({compareRollback.winRateDelta})</strong></div>
                    <div>CSI Safety: <strong className="text-emerald-400">99.2% ({compareRollback.csiDelta})</strong></div>
                    <div>VaR Limit: <strong className="text-emerald-400">0.04%</strong></div>
                    <div>Inference Latency: <strong>14ms</strong></div>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 border-t border-slate-800 pt-2">
                Rollback Reason: {compareRollback.reason}
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setCompareRollback(null)} className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded font-bold">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleExecuteRollback(compareRollback.id);
                    setCompareRollback(null);
                  }}
                  className="px-4 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold uppercase"
                >
                  Confirm Rollback to {compareRollback.targetVersion}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      )}

    </div>
  );
};

export default LifecycleWorkspace;
