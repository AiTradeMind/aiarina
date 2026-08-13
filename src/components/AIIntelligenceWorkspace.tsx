import React, { useState, useEffect } from 'react';
import { GlobalResetControlModal } from './common/GlobalResetControlModal';
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
  X, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldAlert, 
  Lock, 
  Zap,
  Check,
  Plus,
  Upload,
  Eye,
  Pause,
  Play,
  Archive,
  Layers,
  Grid,
  List,
  Server,
  Crown,
  Brain,
  Users,
  Scale,
  Network,
  FileCheck,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AICentralBrainWorkspace } from './AICentralBrainWorkspace';
import { AICommitteeWorkspace } from './AICommitteeWorkspace';
import { AIDecisionEngineWorkspace } from './AIDecisionEngineWorkspace';
import { AITradeConstitutionWorkspace } from './AITradeConstitutionWorkspace';
import { AIKnowledgeGraphWorkspace } from './AIKnowledgeGraphWorkspace';
import { AIModelsRegistryWorkspace } from './AIModelsRegistryWorkspace';
import { AIExplainabilityWorkspace } from './AIExplainabilityWorkspace';
import { AIIntelligenceDashboardView } from './AIIntelligenceDashboardView';

interface AIModelPerformance {
  id: string;
  name: string;
  strategy: string;
  winRate: string;
  pnl: string;
  status: 'OPTIMAL' | 'DEGRADED' | 'CALIBRATING';
}

interface ExecutionStreamItem {
  id: string;
  timestamp: string;
  model: string;
  decision: string;
  status: 'EXECUTED' | 'VERIFIED' | 'REVIEW';
  strategy?: string;
}

interface ActivityEvent {
  id: string;
  type: 'ALERT' | 'CONSTITUTIONAL' | 'ACTIVITY';
  title: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
}

interface AIModelRegistryItem {
  id: string;
  name: string;
  provider: string;
  strategy: string;
  version: string;
  status: 'PRODUCTION' | 'STAGING' | 'TESTING' | 'INACTIVE';
  health: 'OPTIMAL' | 'DEGRADED' | 'CALIBRATING' | 'STANDBY';
  winRate: string;
  pnl: string;
  latency: string;
  description: string;
  recentActivity: string[];
}

export const AIIntelligenceWorkspace = React.memo(() => {
  // Navigation tabs within AI Intelligence
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'REGISTRY' | 'KNOWLEDGE' | 'BRAIN' | 'DECISION' | 'COMMITTEE' | 'CONSTITUTION' | 'OVERVIEW' | 'EXPLAINABILITY'>('DASHBOARD');

  // Executive Overview States
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('24H');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Registry States
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryStatusFilter, setRegistryStatusFilter] = useState('ALL');
  const [registryProviderFilter, setRegistryProviderFilter] = useState('ALL');
  const [registryStrategyFilter, setRegistryStrategyFilter] = useState('ALL');
  const [registrySort, setRegistrySort] = useState('winRate');
  const [densityMode, setDensityMode] = useState<'COMFORTABLE' | 'COMPACT'>('COMFORTABLE');
  const [selectedColumns, setSelectedColumns] = useState({
    provider: true,
    strategy: true,
    version: true,
    status: true,
    health: true,
    winRate: true,
    pnl: true,
    latency: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // AI Intelligence Module-Local Controls State
  const [runtimeStatus, setRuntimeStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');

  // Module-Local Controls Handlers
  const handleReset = () => {
    if (window.confirm('RESET AI INTELLIGENCE TEST STATE?\n\nThis will reset local AI Intelligence test/runtime buffers (test execution stream logs, active test sessions, draft decisions). Production model registry, RBAC, database schema, and other modules (Research, Market, AI Memory, Strategy, Trading) remain completely untouched.')) {
      setSelectedItem(null);
      setIsDrawerOpen(false);
      showToast('RESET COMPLETE: AI Intelligence test/runtime state cleared. Other modules & production data remained isolated.');
    }
  };

  const handleTurnOn = () => {
    setRuntimeStatus('ACTIVE');
    showToast('AI INTELLIGENCE RUNTIME: ON — Processing & worker execution started.');
  };

  const handleTurnOff = () => {
    setRuntimeStatus('PAUSED');
    showToast('AI INTELLIGENCE RUNTIME: OFF — Worker processing & stream evaluation stopped.');
  };

  // Trigger loading or refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      setIsLoading(false);
      showToast('AI Intelligence telemetry refreshed successfully.');
    }, 800);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExport = () => {
    showToast('Enterprise AI telemetry report exported (PDF/CSV).');
  };

  const handleEmergencyHalt = () => {
    if (window.confirm('WARNING: Are you sure you want to trigger an Emergency System Halt across the AI Model Fleet?')) {
      showToast('EMERGENCY HALT TRIGGERED: All autonomous execution streams secured.');
    }
  };

  const openDrawer = (item: any) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleActionClick = (e: React.MouseEvent, action: string, model: AIModelRegistryItem) => {
    e.stopPropagation();
    if (action === 'pause') {
      showToast(`Model ${model.name} paused successfully.`);
    } else if (action === 'resume') {
      showToast(`Model ${model.name} resumed and re-calibrated.`);
    } else if (action === 'archive') {
      if (window.confirm(`Are you sure you want to archive ${model.name}?`)) {
        showToast(`Model ${model.name} archived to immutable cold storage.`);
      }
    } else if (action === 'inspect') {
      openDrawer(model);
    }
  };

  // Mock data for Executive Overview
  const kpiData = [
    {
      id: 'kpi-1',
      title: 'Platform AI Health',
      value: '99.8%',
      trend: '+0.2% vs last 24h',
      status: 'STABLE',
      chipColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Core neural inference latency averaged 12ms across 24 regional nodes.'
    },
    {
      id: 'kpi-2',
      title: 'Active Model Fleet',
      value: '24 / 24',
      trend: '0 Offline / 0 Degraded',
      status: 'OPTIMAL',
      chipColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description: 'All constitutional reasoning engines operating within verified parameters.'
    },
    {
      id: 'kpi-3',
      title: 'Consensus Accuracy',
      value: '96.4%',
      trend: '+1.2% this session',
      status: 'HIGH',
      chipColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Multi-model voting committees achieving high confidence convergence.'
    },
    {
      id: 'kpi-4',
      title: 'System Risk Exposure',
      value: '1.8%',
      trend: 'Well below 5.0% threshold',
      status: 'SAFE',
      chipColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Dynamic portfolio value-at-risk governed by strict constitutional limits.'
    }
  ];

  const topModels: AIModelPerformance[] = [
    { id: 'm-1', name: 'Gemini 2.5 Pro', strategy: 'Multi-Factor Momentum', winRate: '78.4%', pnl: '+$428,500', status: 'OPTIMAL' },
    { id: 'm-2', name: 'Claude 3.5 Sonnet', strategy: 'Risk-Adjusted Arbitrage', winRate: '74.2%', pnl: '+$312,100', status: 'OPTIMAL' },
    { id: 'm-3', name: 'DeepSeek R1', strategy: 'Order Flow Imbalance', winRate: '71.9%', pnl: '+$245,800', status: 'OPTIMAL' },
    { id: 'm-4', name: 'Llama 3.3 70B', strategy: 'Volatility Mean Reversion', winRate: '68.5%', pnl: '+$189,200', status: 'CALIBRATING' },
    { id: 'm-5', name: 'Mistral Large 2', strategy: 'Macro Sentiment Synthesis', winRate: '67.1%', pnl: '+$142,600', status: 'OPTIMAL' }
  ];

  const executionStream: ExecutionStreamItem[] = [
    { id: 'ex-1', timestamp: '08:46:22.104', model: 'Gemini 2.5 Pro', decision: 'Verified equity rebalancing basket for NIFTY50 index cluster', status: 'EXECUTED', strategy: 'Multi-Factor Momentum' },
    { id: 'ex-2', timestamp: '08:45:58.412', model: 'Claude 3.5 Sonnet', decision: 'Constitutional check passed for risk threshold expansion', status: 'VERIFIED', strategy: 'Risk-Adjusted Arbitrage' },
    { id: 'ex-3', timestamp: '08:45:12.890', model: 'DeepSeek R1', decision: 'Signal correlation verified against live order book telemetry', status: 'VERIFIED', strategy: 'Order Flow Imbalance' },
    { id: 'ex-4', timestamp: '08:44:30.155', model: 'Llama 3.3 70B', decision: 'Parameters under calibration review', status: 'REVIEW', strategy: 'Volatility Mean Reversion' },
    { id: 'ex-5', timestamp: '08:43:05.920', model: 'Mistral Large 2', decision: 'Macro sentiment weights updated for banking sector exposure', status: 'EXECUTED', strategy: 'Macro Sentiment Synthesis' }
  ];

  const bottomActivities: ActivityEvent[] = [
    { id: 'act-1', type: 'ALERT', title: 'High Volatility Threshold Warning', timestamp: '08:42:10', severity: 'WARNING', details: 'India VIX crossed 16.5 threshold; automated risk dampeners activated.' },
    { id: 'act-2', type: 'CONSTITUTIONAL', title: 'Article IV Compliance Check Verified', timestamp: '08:35:00', severity: 'INFO', details: 'Daily committee quorum successfully validated across 7 independent models.' },
    { id: 'act-3', type: 'ACTIVITY', title: 'Model Checkpoint Snapshot Saved', timestamp: '08:30.15', severity: 'INFO', details: 'Cryptographic hash block #94821 committed to immutable audit ledger.' },
    { id: 'act-4', type: 'ALERT', title: 'Feed Latency Normalized', timestamp: '08:15:44', severity: 'INFO', details: 'Primary exchange gateway recovered from transient 4ms spike.' }
  ];

  // Mock data for AI Models Registry
  const registryModels: AIModelRegistryItem[] = [
    {
      id: 'reg-1',
      name: 'Gemini 2.5 Pro',
      provider: 'Google DeepMind',
      strategy: 'Multi-Factor Momentum',
      version: 'v2.5.4-prod',
      status: 'PRODUCTION',
      health: 'OPTIMAL',
      winRate: '78.4%',
      pnl: '+$428,500',
      latency: '11ms',
      description: 'Flagship reasoning model handling core algorithmic execution and portfolio rebalancing.',
      recentActivity: ['Executed basket rebalance at 08:46', 'Passed constitutional quorum check', 'Weights optimized via learning engine']
    },
    {
      id: 'reg-2',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      strategy: 'Risk-Adjusted Arbitrage',
      version: 'v3.5.1-prod',
      status: 'PRODUCTION',
      health: 'OPTIMAL',
      winRate: '74.2%',
      pnl: '+$312,100',
      latency: '14ms',
      description: 'Specialized risk oversight model enforcing portfolio safety and latency arbitrage.',
      recentActivity: ['Verified constitutional limits', 'Executed spread arbitrage trade', 'Latency check normal']
    },
    {
      id: 'reg-3',
      name: 'DeepSeek R1',
      provider: 'DeepSeek',
      strategy: 'Order Flow Imbalance',
      version: 'v1.2.0-prod',
      status: 'PRODUCTION',
      health: 'OPTIMAL',
      winRate: '71.9%',
      pnl: '+$245,800',
      latency: '9ms',
      description: 'High-frequency order flow analyzer parsing level 3 market depth.',
      recentActivity: ['Processed 1.2M order book ticks', 'Updated imbalance coefficients', 'Zero slippage reported']
    },
    {
      id: 'reg-4',
      name: 'Llama 3.3 70B',
      provider: 'Meta AI',
      strategy: 'Volatility Mean Reversion',
      version: 'v3.3.0-test',
      status: 'TESTING',
      health: 'CALIBRATING',
      winRate: '68.5%',
      pnl: '+$189,200',
      latency: '18ms',
      description: 'Tactical volatility model currently undergoing shadow testing and backtest validation.',
      recentActivity: ['Running shadow test against live feed', 'Recalibrating Bollinger band thresholds']
    },
    {
      id: 'reg-5',
      name: 'Mistral Large 2',
      provider: 'Mistral AI',
      strategy: 'Macro Sentiment Synthesis',
      version: 'v2.1.4-prod',
      status: 'PRODUCTION',
      health: 'OPTIMAL',
      winRate: '67.1%',
      pnl: '+$142,600',
      latency: '16ms',
      description: 'Multilingual sentiment processor analyzing global news wires and macroeconomic releases.',
      recentActivity: ['Ingested 450 financial news wires', 'Updated sector sentiment matrix']
    },
    {
      id: 'reg-6',
      name: 'GPT-4o Enterprise',
      provider: 'OpenAI',
      strategy: 'Cross-Asset Correlation',
      version: 'v4.2.1-prod',
      status: 'PRODUCTION',
      health: 'OPTIMAL',
      winRate: '72.3%',
      pnl: '+$298,400',
      latency: '13ms',
      description: 'Cross-asset correlation engine monitoring equity, commodity, and FX linkages.',
      recentActivity: ['Mapped yield curve anomaly', 'Generated hedging recommendation']
    },
    {
      id: 'reg-7',
      name: 'Grok 2 Financial',
      provider: 'xAI',
      strategy: 'Social Momentum Alpha',
      version: 'v1.8.2-staging',
      status: 'STAGING',
      health: 'OPTIMAL',
      winRate: '65.8%',
      pnl: '+$98,300',
      latency: '15ms',
      description: 'Real-time social media sentiment and retail flow tracker.',
      recentActivity: ['Staging deployment verified', 'Ready for committee vote integration']
    },
    {
      id: 'reg-8',
      name: 'Qwen 2.5 Max APAC',
      provider: 'Alibaba Cloud',
      strategy: 'Asian Session Breakout',
      version: 'v2.5.0-inactive',
      status: 'INACTIVE',
      health: 'STANDBY',
      winRate: '61.4%',
      pnl: '+$45,200',
      latency: '22ms',
      description: 'Regional specialist model currently in cold standby storage.',
      recentActivity: ['Checkpoint saved to cold storage', 'Awaiting seasonal activation trigger']
    }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 text-slate-100 p-6 space-y-6">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-400 px-4 py-3 rounded shadow-xl flex items-center gap-3 font-mono text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI INTELLIGENCE MODULE RUNTIME CONTROLS BAR */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg flex items-center justify-center shrink-0 ${runtimeStatus === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
            <Power className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white uppercase text-sm tracking-wide">AI INTELLIGENCE OS RUNTIME CONTROLS</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase flex items-center gap-1.5 ${
                runtimeStatus === 'ACTIVE' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${runtimeStatus === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {runtimeStatus === 'ACTIVE' ? 'PROCESSING RUNNING (ON)' : 'PROCESSING PAUSED (OFF)'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Local worker processing: <strong className={runtimeStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}>{runtimeStatus === 'ACTIVE' ? 'ACTIVE & EVALUATING' : 'STOPPED / PAUSED'}</strong> • Isolation: <span className="text-blue-400 font-bold">AI Intelligence Only (Research & Market Untouched)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* 01 RESET */}
          <button
            onClick={() => setShowResetModal(true)}
            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Reset only eligible AI Intelligence test/runtime state"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>01 RESET</span>
          </button>

          {/* 02 ON */}
          <button
            onClick={handleTurnOn}
            disabled={runtimeStatus === 'ACTIVE'}
            className={`px-3.5 py-1.5 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              runtimeStatus === 'ACTIVE'
                ? 'bg-emerald-500 text-slate-950 opacity-90 cursor-default font-black'
                : 'bg-slate-950 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
            title="Start AI Intelligence runtime processing"
          >
            <Play className="w-3.5 h-3.5" />
            <span>02 ON</span>
          </button>

          {/* 03 OFF */}
          <button
            onClick={handleTurnOff}
            disabled={runtimeStatus === 'PAUSED'}
            className={`px-3.5 py-1.5 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              runtimeStatus === 'PAUSED'
                ? 'bg-rose-500 text-slate-950 opacity-90 cursor-default font-black'
                : 'bg-slate-950 hover:bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
            title="Stop AI Intelligence runtime processing"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>03 OFF</span>
          </button>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS FOR AI INTELLIGENCE */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-2 rounded-lg flex items-center flex-wrap gap-1.5 text-[11px] font-bold shadow-xl font-mono w-full shrink-0 min-h-[52px]">
        {[
          { id: 'DASHBOARD', label: '01 AI Intelligence Dashboard', icon: LayoutDashboard },
          { id: 'REGISTRY', label: '02 AI Models Registry', icon: Cpu },
          { id: 'KNOWLEDGE', label: '03 Knowledge Graph', icon: Network },
          { id: 'BRAIN', label: '04 Central Brain', icon: Brain },
          { id: 'DECISION', label: '05 Decision Engine', icon: Activity },
          { id: 'COMMITTEE', label: '06 AI Committee & Governance', icon: Users },
          { id: 'CONSTITUTION', label: '07 Trade Constitution', icon: Scale },
          { id: 'OVERVIEW', label: '08 Executive Overview', icon: Crown },
          { id: 'EXPLAINABILITY', label: '09 AI Decision Trace', icon: FileCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded font-bold uppercase transition-all flex items-center gap-2 whitespace-nowrap text-[11px] shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg scale-[1.02]'
                  : 'bg-slate-950 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
              title={tab.label}
              aria-label={tab.label}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
              <span className="text-[11px] font-bold tracking-wide text-current leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* 01. AI INTELLIGENCE DASHBOARD SCREEN                        */}
      {/* ========================================================== */}
      {activeTab === 'DASHBOARD' && (
        <AIIntelligenceDashboardView
          runtimeStatus={runtimeStatus}
          onNavigateTab={(tab) => setActiveTab(tab)}
          showToast={showToast}
        />
      )}

      {/* ========================================================== */}
      {/* EXECUTIVE OVERVIEW SCREEN                                  */}
      {/* ========================================================== */}
      {activeTab === 'OVERVIEW' && (
        <>
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                <span>AI Intelligence</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-emerald-400 font-bold">Executive Overview</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
                  Executive Overview
                </h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  SYSTEM NORMAL / OPTIMAL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Enterprise AI Command Center — Fleet monitoring, consensus telemetry, and constitutional risk oversight.
              </p>
            </div>

            {/* QUICK ACTIONS */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs rounded flex items-center gap-1.5 transition-colors"
                title="Refresh Telemetry"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleExport}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs rounded flex items-center gap-1.5 transition-colors"
                title="Export Report"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export Report</span>
              </button>

              <button
                onClick={handleEmergencyHalt}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-mono text-xs rounded flex items-center gap-1.5 transition-colors font-bold"
                title="Emergency System Halt"
              >
                <Power className="w-3.5 h-3.5 text-rose-400" />
                <span>Emergency Halt</span>
              </button>

              <button
                onClick={() => showToast('Layout customization mode active')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs rounded flex items-center gap-1.5 transition-colors"
                title="Customize Layout"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Customize</span>
              </button>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search AI models, strategies, telemetry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px]">TIME:</span>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="1H">Last 1 Hour</option>
                  <option value="24H">Last 24 Hours</option>
                  <option value="7D">Last 7 Days</option>
                  <option value="30D">Last 30 Days</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px]">STATUS:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="OPTIMAL">Optimal</option>
                  <option value="DEGRADED">Degraded</option>
                  <option value="CALIBRATING">Calibrating</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[10px]">RISK:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>
            </div>
          </div>

          {/* ERROR STATE / LOADING STATE HANDLING */}
          {isError ? (
            <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded text-center space-y-3 font-mono">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-sm font-bold text-rose-400 uppercase">Telemetry Connection Error</h3>
              <p className="text-xs text-slate-400">Failed to connect to AI Intelligence telemetry stream.</p>
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 bg-rose-500 text-black font-bold text-xs uppercase rounded hover:bg-rose-400 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded h-32 flex flex-col justify-between">
                  <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* 4 KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiData.map((kpi) => (
                  <div
                    key={kpi.id}
                    onClick={() => openDrawer(kpi)}
                    className="bg-slate-900 border border-slate-800 p-5 rounded hover:border-slate-700 transition-colors cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {kpi.title}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${kpi.chipColor} uppercase`}>
                        {kpi.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-2xl font-bold font-mono text-white tracking-tight">
                        {kpi.value}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{kpi.trend}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 group-hover:text-slate-300">
                      <span>Inspect telemetry</span>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>

              {/* TWO COLUMN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT: TOP PERFORMING AI MODELS */}
                <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                        Top Performing AI Models
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Sorted by Win Rate & PnL
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                          <th className="py-2.5 px-3">Model</th>
                          <th className="py-2.5 px-3">Strategy</th>
                          <th className="py-2.5 px-3">Win Rate</th>
                          <th className="py-2.5 px-3">PnL</th>
                          <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {topModels.filter(m => searchQuery === '' || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.strategy.toLowerCase().includes(searchQuery.toLowerCase())).map((model) => (
                          <tr 
                            key={model.id}
                            onClick={() => openDrawer(model)}
                            className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                          >
                            <td className="py-3 px-3 font-bold text-white">
                              {model.name}
                            </td>
                            <td className="py-3 px-3 text-slate-300">
                              {model.strategy}
                            </td>
                            <td className="py-3 px-3 text-emerald-400 font-bold">
                              {model.winRate}
                            </td>
                            <td className="py-3 px-3 text-emerald-400 font-bold">
                              {model.pnl}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${
                                model.status === 'OPTIMAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {model.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RIGHT: LIVE AUTONOMOUS EXECUTION STREAM */}
                <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                        Live Autonomous Execution Stream
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                      Real-Time Feed
                    </span>
                  </div>

                  <div className="space-y-3">
                    {executionStream.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openDrawer(item)}
                        className="p-3 bg-slate-950 border border-slate-800 rounded hover:border-slate-700 cursor-pointer transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-slate-400">{item.timestamp}</span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                            item.status === 'EXECUTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            item.status === 'VERIFIED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        <div className="text-xs font-bold font-mono text-white">
                          {item.model}
                        </div>

                        <p className="text-xs font-mono text-slate-300 leading-relaxed">
                          {item.decision}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* BOTTOM SECTION: RECENT ALERTS, CONSTITUTIONAL EVENTS & AI ACTIVITIES */}
              <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                      Recent Alerts, Constitutional Events & AI Activities
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Immutable Ledger Feed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {bottomActivities.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => openDrawer(act)}
                      className="bg-slate-950 border border-slate-800 p-4 rounded hover:border-slate-700 cursor-pointer transition-colors space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                            act.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            act.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {act.type}
                          </span>
                          <span className="text-slate-500">{act.timestamp}</span>
                        </div>

                        <h4 className="text-xs font-bold font-mono text-white">
                          {act.title}
                        </h4>

                        <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                          {act.details}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>Inspect event</span>
                        <ChevronRight className="w-3 h-3 text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ========================================================== */}
      {/* 2. AI MODELS REGISTRY SCREEN                              */}
      {/* ========================================================== */}
      <div className={activeTab === 'REGISTRY' ? 'contents' : 'hidden'}>
        <AIModelsRegistryWorkspace showToast={showToast} />
      </div>

      {/* ========================================================== */}
      {/* CENTRAL BRAIN SCREEN (PHASE 1.3.4)                        */}
      {/* ========================================================== */}
      {activeTab === 'BRAIN' && (
        <AICentralBrainWorkspace showToast={showToast} />
      )}

      {/* ========================================================== */}
      {/* AI COMMITTEE SCREEN (PHASE 1.3.5)                         */}
      {/* ========================================================== */}
      {activeTab === 'COMMITTEE' && (
        <AICommitteeWorkspace showToast={showToast} />
      )}

      {/* ========================================================== */}
      {/* DECISION ENGINE SCREEN (PHASE 1.3.6)                      */}
      {/* ========================================================== */}
      {activeTab === 'DECISION' && (
        <AIDecisionEngineWorkspace showToast={showToast} />
      )}

      {/* ========================================================== */}
      {/* TRADE CONSTITUTION SCREEN (PHASE 1.3.7)                   */}
      {/* ========================================================== */}
      {activeTab === 'CONSTITUTION' && (
        <AITradeConstitutionWorkspace showToast={showToast} />
      )}

      {/* ========================================================== */}
      {/* KNOWLEDGE GRAPH SCREEN                                    */}
      {/* ========================================================== */}
      {activeTab === 'KNOWLEDGE' && (
        <AIKnowledgeGraphWorkspace showToast={showToast} />
      )}

      {/* ========================================================== */}
      {/* EXPLAINABILITY SCREEN                                      */}
      {/* ========================================================== */}
      {activeTab === 'EXPLAINABILITY' && (
        <AIExplainabilityWorkspace showToast={showToast} />
      )}

      {/* ========================================================== */}
      {/* OTHER FALLBACK VIEWS                                       */}
      {/* ========================================================== */}
      {activeTab !== 'DASHBOARD' && activeTab !== 'OVERVIEW' && activeTab !== 'REGISTRY' && activeTab !== 'PROFILE' && activeTab !== 'BRAIN' && activeTab !== 'COMMITTEE' && activeTab !== 'DECISION' && activeTab !== 'CONSTITUTION' && activeTab !== 'KNOWLEDGE' && activeTab !== 'EXPLAINABILITY' && (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded text-center space-y-4 font-mono">
          <Cpu className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            {activeTab} Workspace Active
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            This enterprise module is part of the approved AI ARINA V3.2 Architecture.
          </p>
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs uppercase rounded transition-colors"
          >
            Return to Executive Overview
          </button>
        </div>
      )}

      {/* RIGHT DRAWER (INSPECTOR PANEL) */}
      <AnimatePresence>
        {isDrawerOpen && selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
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
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Model Fleet Inspector
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Read-only enterprise inspection view
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Model Details</span>
                    <h4 className="text-base font-bold text-white">
                      {selectedItem.name || selectedItem.title}
                    </h4>
                    <p className="text-xs text-slate-300">
                      {selectedItem.description || selectedItem.details || selectedItem.strategy}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Health & Status Summary</h5>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Provider:</span>
                        <span className="text-white font-bold">{selectedItem.provider || 'Enterprise Node'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status / Health:</span>
                        <span className="text-emerald-400 font-bold">{selectedItem.status || 'OPTIMAL'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Version:</span>
                        <span className="text-white">{selectedItem.version || 'v2.5.0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Inference Latency:</span>
                        <span className="text-white">{selectedItem.latency || '12ms'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Performance Metrics</h5>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Win Rate:</span>
                        <span className="text-emerald-400 font-bold">{selectedItem.winRate || '78.4%'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Net PnL:</span>
                        <span className="text-emerald-400 font-bold">{selectedItem.pnl || '+$428,500'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recent Activity Ledger</h5>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400 space-y-2">
                      {selectedItem.recentActivity ? (
                        selectedItem.recentActivity.map((act: string, idx: number) => (
                          <div key={idx}>• {act}</div>
                        ))
                      ) : (
                        <>
                          <div>• Telemetry packet synchronized at {new Date().toLocaleTimeString()}</div>
                          <div>• Multi-model consensus verified via quorum committee</div>
                          <div>• No anomaly flags detected in current execution cycle</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">AI ARINA V1.0 Baseline Locked</span>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs uppercase rounded transition-colors"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* REGISTER MODEL MODAL */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegisterModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-lg p-6 w-full max-w-lg shadow-2xl font-mono text-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Register New AI Model</h3>
                  </div>
                  <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Model Display Name</label>
                    <input type="text" placeholder="e.g. Gemini 3.0 Pro Ultra" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Provider</label>
                      <select className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white">
                        <option>Google DeepMind</option>
                        <option>Anthropic</option>
                        <option>OpenAI</option>
                        <option>DeepSeek</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Strategy Assignment</label>
                      <select className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white">
                        <option>Multi-Factor Momentum</option>
                        <option>Risk-Adjusted Arbitrage</option>
                        <option>Order Flow Imbalance</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Initial Deployment Status</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white">
                      <option>STAGING (Shadow Test)</option>
                      <option>PRODUCTION (Active Inference)</option>
                      <option>TESTING (Backtest)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button onClick={() => setIsRegisterModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold">
                    Cancel
                  </button>
                  <button onClick={() => { setIsRegisterModalOpen(false); showToast('New AI Model registered successfully into fleet.'); }} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded">
                    Confirm Registration
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Global Reset Control Modal */}
      <GlobalResetControlModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        moduleTitle="AI Intelligence Fleet"
        moduleKey="AI_INTELLIGENCE"
        resetApiEndpoint="/api/intelligence/reset"
        protectedAssetsNotice="Resets volatile test evaluations and evaluation logs. All 28 canonical AI Model Registry entries, production parameters, and other workspaces remain completely protected."
        onSuccess={(data) => {
          setSelectedItem(null);
          setIsDrawerOpen(false);
          showToast(`AI Intelligence Reset executed. RunID: ${data.resetRunId} (${data.recordsCleared ?? 0} evaluation records cleared).`);
        }}
        onError={(err) => {
          showToast(`AI Intelligence Reset Failed: ${err}`);
        }}
      />

    </div>
  );
});
