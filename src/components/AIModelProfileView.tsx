import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Activity, 
  RefreshCcw, 
  Download, 
  Check,
  ChevronRight,
  X,
  Sliders,
  Layers,
  Award,
  GitBranch,
  FileText,
  Terminal,
  DollarSign,
  BarChart3,
  Vote,
  Server,
  ArrowLeft,
  TrendingUp,
  Database,
  Lock,
  Key,
  Play,
  Pause,
  RotateCw,
  Copy,
  FileCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIModelProfileViewProps {
  model?: any;
  onBack: () => void;
  showToast?: (msg: string) => void;
}

export const AIModelProfileView: React.FC<AIModelProfileViewProps> = ({ model, onBack, showToast }) => {
  const [activeProfileTab, setActiveProfileTab] = useState<'PASSPORT' | 'RESPONSIBILITIES' | 'SPECS' | 'TELEMETRY' | 'GOVERNANCE' | 'LIFECYCLE' | 'SECURITY' | 'COSTS' | 'BENCHMARKS'>('PASSPORT');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const notify = (msg: string) => {
    if (showToast) showToast(msg);
  };

  // Active Model Data with fallback defaults for complete Digital Passport
  const activeModel = model || {
    id: 'REG-1001',
    name: 'Gemini 2.5 Pro Enterprise',
    provider: 'Google DeepMind',
    strategy: 'Multi-Factor Momentum',
    version: 'v2.5.4-prod',
    category: 'Core Reasoning',
    status: 'ACTIVE',
    deployment: 'PRODUCTION',
    health: 'OPTIMAL',
    winRate: '78.4%',
    pnl: '+$428,500',
    latency: '11ms',
    accuracy: 96.4,
    confidence: 98.2,
    trades: 1420,
    owner: 'Quantitative Research Group A',
    createdDate: '2026-01-15',
    description: 'Flagship reasoning model handling core algorithmic execution, constitutional risk verification, and portfolio rebalancing.',
    tags: ['Core Reasoning', 'MoE', 'Low Latency', 'Vision'],
    providerStatus: 'ONLINE',
    providerLatency: 11,
    errorRate: 0.01,
    capabilities: {
      vision: true,
      text: true,
      reasoning: true,
      code: true,
      functionCalling: true,
      jsonOutput: true,
      contextWindow: '2,000,000',
      streaming: true
    },
    usageStats: {
      totalRequests: '1.4M',
      totalTokens: '48.2M',
      dailyCost: '$142.80',
      latencyMs: 11,
      successRatePct: 99.98
    },
    dependencies: {
      centralBrain: true,
      decisionEngine: true,
      aiCommittee: true,
      aiMemory: true,
      aiLifecycle: true,
      strategies: ['Multi-Factor Momentum', 'NIFTY Alpha Sector']
    },
    domainToggles: {
      global: true,
      research: true,
      decision: true,
      committee: true,
      memory: true,
      paperTrading: true,
      liveTradingV2: false
    }
  };

  const caps = activeModel.capabilities || {
    vision: true,
    text: true,
    reasoning: true,
    code: true,
    functionCalling: true,
    jsonOutput: true,
    contextWindow: activeModel.contextWindow || '2,000,000',
    streaming: true
  };

  const usage = activeModel.usageStats || {
    totalRequests: '1.4M',
    totalTokens: '48.2M',
    dailyCost: '$142.80',
    latencyMs: activeModel.latency || 11,
    successRatePct: activeModel.accuracy || 99.98
  };

  const toggles = activeModel.domainToggles || {
    global: activeModel.status !== 'DISABLED',
    research: true,
    decision: activeModel.status === 'ACTIVE' || activeModel.status === 'PRODUCTION',
    committee: true,
    memory: true,
    paperTrading: true,
    liveTradingV2: false
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      notify(`Digital Passport telemetry for ${activeModel.name} refreshed.`);
    }, 500);
  };

  const handleExport = () => {
    notify(`Full Digital Passport report for ${activeModel.name} exported.`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 text-slate-100 p-6 space-y-6">
      
      {/* MASTER-DETAIL NAVIGATION BAR & HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
            <button 
              onClick={onBack} 
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/50 rounded font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Return to Fleet Grid View"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to AI Models Registry Fleet</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-white font-bold">{activeModel.name}</span>
            <span className="text-slate-500 text-[10px]">({activeModel.id})</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <span>{activeModel.name}</span>
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold rounded uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {activeModel.deployment || activeModel.status || 'PRODUCTION'} / {activeModel.health || 'OPTIMAL'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Provider: <strong className="text-slate-200">{activeModel.provider}</strong> | Strategy: <strong className="text-amber-300">{activeModel.strategy || 'Multi-Factor Alpha'}</strong> | Version: <strong className="text-blue-300">{activeModel.version}</strong>
          </p>
        </div>

        {/* HEADER ACTIONS (SECTION 27: ENTERPRISE ACTION CENTER) */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => notify(`${activeModel.name} activated for live execution session.`)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Activate</span>
          </button>

          <button
            onClick={() => notify(`${activeModel.name} paused successfully.`)}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded flex items-center gap-1.5 cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause</span>
          </button>

          <button
            onClick={() => notify(`Benchmark test initiated for ${activeModel.name}.`)}
            className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Benchmark</span>
          </button>

          <button
            onClick={() => setIsInspectorOpen(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Inspector</span>
          </button>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* DIGITAL PASSPORT SUMMARY CARD */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs shadow-xl">
        <div className="flex items-center gap-4 md:col-span-1 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
          <div className="w-14 h-14 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 font-bold shrink-0 shadow-inner">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Digital Passport ID</div>
            <div className="text-sm font-bold text-white mt-0.5">{activeModel.id}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5 font-bold">{activeModel.version}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:col-span-3">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Provider & Owner</span>
            <div className="text-white font-bold">{activeModel.provider}</div>
            <div className="text-[11px] text-slate-400">{activeModel.owner || 'Quantitative Research Group A'}</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Strategy Assignment</span>
            <div className="text-amber-300 font-bold">{activeModel.strategy || 'Multi-Factor Alpha'}</div>
            <div className="text-[11px] text-slate-400">Category: {activeModel.category || 'Core Reasoning'}</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Deployment Mode</span>
            <div className="text-emerald-400 font-bold uppercase">{activeModel.deployment || activeModel.status || 'PRODUCTION'}</div>
            <div className="text-[11px] text-slate-400">Inferred Latency: {activeModel.latency ? `${activeModel.latency}ms` : '11ms'}</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Health & Quorum</span>
            <div className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {activeModel.health || 'OPTIMAL'}
            </div>
            <div className="text-[11px] text-slate-400">Quorum: 100% Signed</div>
          </div>
        </div>
      </div>

      {/* 4 TOP TELEMETRY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Overall Health Score</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">99.8%</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">OPTIMAL</div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Zero constitutional breaches</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Win Rate Alpha</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">HIGH ALPHA</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{activeModel.winRate || '78.4%'}</div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Across {activeModel.trades || 1420} executed trades</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Realized PnL</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">NET GAIN</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-300">{activeModel.pnl || '+$428,500'}</div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-400" />
              <span>Top decile fleet performer</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Decision Accuracy</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-blue-500/10 text-blue-400 border-blue-500/30">VERIFIED</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{activeModel.accuracy || 96.4}%</div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-400" />
              <span>Confidence Index: {activeModel.confidence || 98.2}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS WITHIN DIGITAL PASSPORT VIEW */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2 font-mono text-xs">
          {[
            { id: 'PASSPORT', label: '1. Executive Passport', icon: FileText },
            { id: 'RESPONSIBILITIES', label: '2. Responsibilities & Relations', icon: Layers },
            { id: 'SPECS', label: '3. Specs & Capabilities', icon: Sliders },
            { id: 'TELEMETRY', label: '4. Live Runtime & Health', icon: Activity },
            { id: 'GOVERNANCE', label: '5. Constitution & Committee', icon: Vote },
            { id: 'LIFECYCLE', label: '6. Lifecycle & Versions', icon: GitBranch },
            { id: 'SECURITY', label: '7. Security & Audit Logs', icon: ShieldCheck },
            { id: 'COSTS', label: '8. Cost Analytics', icon: DollarSign },
            { id: 'BENCHMARKS', label: '9. Benchmarks & History', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeProfileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveProfileTab(tab.id as any)}
                className={`px-3.5 py-2 rounded transition-all whitespace-nowrap uppercase tracking-wider font-bold flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg font-black'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================== */}
        {/* SUB-TAB 1: EXECUTIVE PASSPORT & SUMMARY                   */}
        {/* ========================================================== */}
        {activeProfileTab === 'PASSPORT' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Executive Passport Summary & Metadata
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800">
                  {activeModel.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Architecture Family</span>
                    <div className="text-white font-bold">Transformer MoE v2.5</div>
                    <div className="text-[11px] text-emerald-400">Checkpoint ID: chk_2026_01_15</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Registration Date</span>
                    <div className="text-white font-bold">{activeModel.createdDate || '2026-01-15'}</div>
                    <div className="text-[11px] text-blue-400">Owner: {activeModel.owner}</div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Sub-Domain Activation Switches
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'global', label: 'Global Fleet', active: toggles.global },
                      { key: 'research', label: 'Research Pipeline', active: toggles.research },
                      { key: 'decision', label: 'Decision Engine', active: toggles.decision },
                      { key: 'committee', label: 'AI Committee', active: toggles.committee },
                      { key: 'memory', label: 'AI Memory', active: toggles.memory },
                      { key: 'paperTrading', label: 'Paper Trading', active: toggles.paperTrading },
                    ].map((t, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                        <span className="text-[11px] text-slate-300 font-bold">{t.label}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          t.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {t.active ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Server className="w-4 h-4 text-blue-400" />
                  Provider Infrastructure & Endpoint
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400">Provider:</span>
                    <span className="text-white font-bold">{activeModel.provider}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400">Endpoint:</span>
                    <span className="text-emerald-400 font-bold">grpc://ai-node.internal:443</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400">Deployment Region:</span>
                    <span className="text-emerald-400 font-bold">asia-east1 / us-east1</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400">SLA Uptime:</span>
                    <span className="text-emerald-400 font-bold">99.98% Guarantee</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-400">Error Rate:</span>
                    <span className="text-emerald-400 font-bold">0.01%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUB-TAB 2: AI RESPONSIBILITIES & RELATIONSHIP MAP         */}
        {/* ========================================================== */}
        {activeProfileTab === 'RESPONSIBILITIES' && (
          <div className="space-y-6 font-mono text-xs">
            {/* SECTION 18: AI RESPONSIBILITIES */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers className="w-4 h-4 text-emerald-400" />
                Current AI Responsibilities & Scope Assignment
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Primary Role</span>
                  <div className="text-white font-bold">Momentum Alpha Engine</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Assigned Market</span>
                  <div className="text-amber-300 font-bold">NSE Equity & Derivatives</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Assigned Capital</span>
                  <div className="text-emerald-400 font-bold">₹1,00,00,000 Virtual</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Execution Priority</span>
                  <div className="text-purple-300 font-bold">High (Tier 1 Core)</div>
                </div>
              </div>
            </div>

            {/* SECTION 19: ENTERPRISE RELATIONSHIP MAP */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <GitBranch className="w-4 h-4 text-blue-400" />
                Enterprise Relationship Map (Connected Objects)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: 'Connected Strategies', count: '4 Active', status: 'SYNCHRONIZED' },
                  { name: 'Connected Orders', count: '1,420 Filled', status: 'ACTIVE' },
                  { name: 'Decision Engine', count: 'Module v3', status: 'LINKED' },
                  { name: 'AI Committee', count: '4/4 Quorum', status: 'SIGNED' },
                  { name: 'AI Memory', count: '1.2M Vectors', status: 'INDEXED' },
                  { name: 'AI Lifecycle', count: 'Production #1', status: 'VERIFIED' },
                  { name: 'Knowledge Graph', count: '840 Nodes', status: 'CONNECTED' },
                  { name: 'Risk Engine', count: 'Article IV', status: 'ENFORCED' }
                ].map((obj, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase">{obj.name}</span>
                      <div className="text-white font-bold mt-0.5">{obj.count}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold rounded w-fit">
                      {obj.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUB-TAB 3: SPECS & CAPABILITIES                           */}
        {/* ========================================================== */}
        {activeProfileTab === 'SPECS' && (
          <div className="space-y-6 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers className="w-4 h-4 text-emerald-400" />
                Model Capabilities & Modality Matrix
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Vision Modality', enabled: caps.vision },
                  { name: 'Text Generation', enabled: caps.text },
                  { name: 'Complex Reasoning', enabled: caps.reasoning },
                  { name: 'Code Execution', enabled: caps.code },
                  { name: 'Function Calling', enabled: caps.functionCalling },
                  { name: 'Structured JSON', enabled: caps.jsonOutput },
                  { name: 'Token Streaming', enabled: caps.streaming },
                  { name: 'Context Caching', enabled: true },
                ].map((c, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                    <span className="text-slate-300 font-bold">{c.name}</span>
                    {c.enabled ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUB-TAB 4: LIVE RUNTIME & TELEMETRY                       */}
        {/* ========================================================== */}
        {activeProfileTab === 'TELEMETRY' && (
          <div className="space-y-6 font-mono text-xs">
            {/* SECTION 21: LIVE RUNTIME */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Live Runtime Telemetry & Resource Monitor
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Real-time container performance metrics and hardware utilization.</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded">
                  Live Stream Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">CPU Usage</span>
                  <div className="text-xl font-bold text-white">18.4%</div>
                  <div className="text-[10px] text-slate-400">16 vCPUs allocated</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">GPU VRAM</span>
                  <div className="text-xl font-bold text-emerald-400">14.2 GB</div>
                  <div className="text-[10px] text-slate-400">NVIDIA H100 Tensor Core</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Inference Queue</span>
                  <div className="text-xl font-bold text-blue-400">0 msgs</div>
                  <div className="text-[10px] text-slate-400">Zero latency backlog</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Current TPS / RPM</span>
                  <div className="text-xl font-bold text-amber-400">240 tps / 120 rpm</div>
                  <div className="text-[10px] text-slate-400">Throughput optimal</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUB-TAB 5: CONSTITUTION & COMMITTEE (GOVERNANCE)          */}
        {/* ========================================================== */}
        {activeProfileTab === 'GOVERNANCE' && (
          <div className="space-y-6 font-mono text-xs">
            {/* SECTION 20: AI CONSTITUTION SUMMARY */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  AI Constitution & Risk Governance Summary
                </h3>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded">
                  Article IV Verified (100%)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Risk Grade</span>
                  <div className="text-xl font-bold text-emerald-400">AAA (Enterprise)</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Daily Loss Limit</span>
                  <div className="text-xl font-bold text-white">₹5,00,000 max</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Circuit Protection</span>
                  <div className="text-xl font-bold text-blue-400">Enabled (5%)</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Constitution Version</span>
                  <div className="text-xl font-bold text-amber-300">v4.2-final</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUB-TAB 6: LIFECYCLE & VERSIONS                           */}
        {/* ========================================================== */}
        {activeProfileTab === 'LIFECYCLE' && (
          <div className="space-y-6 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <GitBranch className="w-4 h-4 text-amber-400" />
                AI Lifecycle Pipeline & Version History
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { stage: '1. Activation', status: 'COMPLETED' },
                  { stage: '2. Validation', status: 'COMPLETED' },
                  { stage: '3. Training', status: 'COMPLETED' },
                  { stage: '4. Paper Trading', status: 'COMPLETED' },
                  { stage: '5. Production Ready', status: 'ACTIVE' }
                ].map((s, idx) => (
                  <div key={idx} className={`p-3.5 rounded border flex flex-col justify-between space-y-2 ${
                    s.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[11px]">{s.stage}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        s.status === 'ACTIVE' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-emerald-400'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUB-TAB 7: SECURITY & AUDIT LOGS                          */}
        {/* ========================================================== */}
        {activeProfileTab === 'SECURITY' && (
          <div className="space-y-6 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Security, API Credentials & Audit Log Stream
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">API Access Token Hash</span>
                  <div className="text-emerald-400 font-mono font-bold truncate">sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">mTLS Client Certificate</span>
                  <div className="text-blue-400 font-mono font-bold">CN=ai-arina-node-01.internal</div>
                </div>
              </div>

              {/* SECTION 26: AUDIT FOOTER */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-400 space-y-1">
                <div className="text-white font-bold mb-2 uppercase">Digital Passport Audit Footer</div>
                <div>Passport Version: <strong className="text-emerald-400">v3.2-enterprise</strong></div>
                <div>Generated Timestamp: <strong className="text-slate-200">2026-08-02T08:50:29Z</strong></div>
                <div>Checksum Signature: <strong className="text-purple-300">0x8f92a14e7c3b2f10</strong></div>
                <div>Verified By: <strong className="text-blue-400">AI ARINA Governance Board</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUB-TAB 8: COST ANALYTICS (SECTION 25)                    */}
        {/* ========================================================== */}
        {activeProfileTab === 'COSTS' && (
          <div className="space-y-6 font-mono text-xs">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Enterprise Cost Analytics & Token Billing
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Today's Cost</span>
                  <div className="text-xl font-bold text-emerald-400">$142.80</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Weekly Bill</span>
                  <div className="text-xl font-bold text-white">$984.20</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Monthly Projected</span>
                  <div className="text-xl font-bold text-blue-400">$4,250.00</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">ROI Multiplier</span>
                  <div className="text-xl font-bold text-amber-400">100.8x</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUB-TAB 9: BENCHMARKS & PERFORMANCE HISTORY (SECTIONS 23, 24) */}
        {/* ========================================================== */}
        {activeProfileTab === 'BENCHMARKS' && (
          <div className="space-y-6 font-mono text-xs">
            {/* SECTION 23: PERFORMANCE HISTORY TABLE */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Performance History (Last 30 Sessions)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Trades</th>
                      <th className="py-2 px-3">PnL</th>
                      <th className="py-2 px-3">Win Rate</th>
                      <th className="py-2 px-3">Accuracy</th>
                      <th className="py-2 px-3">Latency</th>
                      <th className="py-2 px-3">Sharpe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {[
                      { date: '2026-08-02', trades: '142', pnl: '+$24,500', winRate: '81.2%', accuracy: '96.8%', latency: '9ms', sharpe: '3.62' },
                      { date: '2026-08-01', trades: '138', pnl: '+$19,200', winRate: '78.5%', accuracy: '96.1%', latency: '11ms', sharpe: '3.45' },
                      { date: '2026-07-31', trades: '150', pnl: '+$31,400', winRate: '82.0%', accuracy: '97.2%', latency: '8ms', sharpe: '3.80' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-950/50">
                        <td className="py-2.5 px-3 font-bold text-white">{row.date}</td>
                        <td className="py-2.5 px-3">{row.trades}</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">{row.pnl}</td>
                        <td className="py-2.5 px-3">{row.winRate}</td>
                        <td className="py-2.5 px-3">{row.accuracy}</td>
                        <td className="py-2.5 px-3 text-amber-300">{row.latency}</td>
                        <td className="py-2.5 px-3">{row.sharpe}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 24: BENCHMARK COMPARISON */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <GitBranch className="w-4 h-4 text-blue-400" />
                Fleet Benchmark Comparison Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                      <th className="py-2 px-3">Model</th>
                      <th className="py-2 px-3">Accuracy</th>
                      <th className="py-2 px-3">Latency</th>
                      <th className="py-2 px-3">PnL</th>
                      <th className="py-2 px-3">Rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr className="bg-emerald-500/5">
                      <td className="py-2.5 px-3 font-bold text-emerald-400">{activeModel.name} (Selected)</td>
                      <td className="py-2.5 px-3">{activeModel.accuracy || 96.4}%</td>
                      <td className="py-2.5 px-3">{activeModel.latency || '11ms'}</td>
                      <td className="py-2.5 px-3 text-emerald-400">{activeModel.pnl || '+$428,500'}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">Rank #1 (Champion)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">Claude 3.5 Sonnet Sentinel</td>
                      <td className="py-2.5 px-3">95.8%</td>
                      <td className="py-2.5 px-3">14ms</td>
                      <td className="py-2.5 px-3 text-emerald-400">+$312,100</td>
                      <td className="py-2.5 px-3">Rank #2</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-white">DeepSeek R1 Reasoning Core</td>
                      <td className="py-2.5 px-3">94.1%</td>
                      <td className="py-2.5 px-3">8ms</td>
                      <td className="py-2.5 px-3 text-emerald-400">+$245,800</td>
                      <td className="py-2.5 px-3">Rank #3</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* INSPECTOR DRAWER */}
      <AnimatePresence>
        {isInspectorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInspectorOpen(false)}
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
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Raw Model Inspector</h3>
                      <p className="text-[10px] text-slate-400">Digital Passport Raw Telemetry</p>
                    </div>
                  </div>
                  <button onClick={() => setIsInspectorOpen(false)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase">Model Object JSON</span>
                    <pre className="text-[10px] text-emerald-400 bg-slate-900 p-3 rounded overflow-x-auto max-h-60 border border-slate-800">
                      {JSON.stringify(activeModel, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">AI ARINA Digital Passport View</span>
                <button
                  onClick={() => setIsInspectorOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase rounded cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* COMPARE MODELS MODAL */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompareModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-lg p-6 w-full max-w-2xl shadow-2xl font-mono text-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fleet Model Comparison Matrix</h3>
                  </div>
                  <button onClick={() => setIsCompareModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                        <th className="py-2 px-3">Metric</th>
                        <th className="py-2 px-3 text-emerald-400">{activeModel.name}</th>
                        <th className="py-2 px-3">Claude 3.5 Sonnet</th>
                        <th className="py-2 px-3">DeepSeek R1</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-white">Win Rate</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">{activeModel.winRate || '78.4%'}</td>
                        <td className="py-2.5 px-3">74.2%</td>
                        <td className="py-2.5 px-3">71.9%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-white">Latency</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">{activeModel.latency ? `${activeModel.latency}ms` : '11ms'}</td>
                        <td className="py-2.5 px-3">14ms</td>
                        <td className="py-2.5 px-3">8ms</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-white">Accuracy</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">{activeModel.accuracy || 96.4}%</td>
                        <td className="py-2.5 px-3">95.8%</td>
                        <td className="py-2.5 px-3">94.1%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsCompareModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase rounded cursor-pointer"
                  >
                    Close Comparison
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
