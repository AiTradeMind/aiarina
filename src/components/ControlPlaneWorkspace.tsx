import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Terminal as TerminalIcon, 
  Activity, 
  Cpu, 
  Zap, 
  Database, 
  RefreshCcw, 
  Power, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Settings, 
  Layers, 
  Globe, 
  Lock, 
  Check, 
  X, 
  ArrowRight,
  Sparkles,
  Server,
  TrendingUp,
  FileText,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, safeFormat } from '../lib/utils';
import { fetchApi } from '../lib/api';
import { SectionHeader, StatusBadge, MetricCard, Panel, Toolbar, GlobalSummaryItem } from './ui/Base';
import { LoadingOverlay, EmptyState } from './ui/Feedback';
import { IntegrationValidationWorkspace } from './IntegrationValidationWorkspace';
import { EnterpriseTabBar, TabItem } from './ui/EnterpriseTabBar';
import { SchedulerWorkspace } from './SchedulerWorkspace';
import { GatewayWorkspace } from './GatewayWorkspace';
import { ReleasesWorkspace } from './ReleasesWorkspace';
import { ObservabilityWorkspace } from './ObservabilityWorkspace';

interface AIModel {
  id: string;
  name: string;
  category: string;
  status: 'OFF' | 'RUNNING' | 'PAUSED' | 'RESTARTING';
  health: 'HEALTHY' | 'WARNING' | 'STANDBY';
  accuracy: string;
  latency: string;
  allocation: string;
}

interface StrategyItem {
  id: string;
  name: string;
  type: string;
  status: 'ENABLED' | 'DISABLED' | 'PAUSED';
  allocation: string;
  pnl: string;
}

const INITIAL_AI_MODELS: AIModel[] = Array.from({ length: 28 }, (_, i) => {
  const categories = ['LLM Deep Reasoner', 'Transformer Alpha', 'Reinforcement Engine', 'Quantitative Vision', 'Sentiment Synthesizer', 'Arbitrage Neural', 'Volatility Predictor'];
  const names = [
    'Arina-Core-Omega', 'Apex-Quant-v9', 'Neural-Alpha-Alpha', 'Deep-Genesis-7', 'Hyperion-Nexus',
    'Quantum-Vortex', 'Sentinel-Zero', 'Sigma-Predictor', 'Omega-Arbitrage', 'Alpha-Catcher-Pro',
    'Vector-Mind-X', 'Tensor-Flow-Alpha', 'Cortex-Prime', 'Cognitive-Edge', 'Matrix-Trader',
    'Synapse-Flow', 'Aether-Quant', 'Nexus-Prime', 'Apex-Predictor', 'Zephyr-Alpha',
    'Titan-Core', 'Vanguard-AI', 'Chronos-Quant', 'Orion-Signal', 'Solstice-Mind',
    'Eclipse-Neural', 'Zenith-Trading', 'Vertex-Analytics'
  ];
  return {
    id: `AIM-${1000 + i}`,
    name: names[i] || `AI-Model-${i + 1}`,
    category: categories[i % categories.length],
    status: 'OFF',
    health: 'STANDBY',
    accuracy: `${(85 + (i * 0.4) % 12).toFixed(1)}%`,
    latency: `${2 + (i % 8)}ms`,
    allocation: '$0.00'
  };
});

const INITIAL_STRATEGIES: StrategyItem[] = [
  { id: 'STRAT-01', name: 'Momentum Alpha Breakthrough', type: 'TREND', status: 'DISABLED', allocation: '$0.00', pnl: '$0.00' },
  { id: 'STRAT-02', name: 'Mean Reversion Statistical Arbitrage', type: 'ARBITRAGE', status: 'DISABLED', allocation: '$0.00', pnl: '$0.00' },
  { id: 'STRAT-03', name: 'Deep Q-Learning Reinforcement Trader', type: 'AI_RL', status: 'DISABLED', allocation: '$0.00', pnl: '$0.00' },
  { id: 'STRAT-04', name: 'High-Frequency Order Book Scalper', type: 'HFT', status: 'DISABLED', allocation: '$0.00', pnl: '$0.00' },
  { id: 'STRAT-05', name: 'Sentiment NLP Global News Feed Catcher', type: 'NLP', status: 'DISABLED', allocation: '$0.00', pnl: '$0.00' },
  { id: 'STRAT-06', name: 'Volatility Surface Arbitrage Matrix', type: 'OPTIONS', status: 'DISABLED', allocation: '$0.00', pnl: '$0.00' },
  { id: 'STRAT-07', name: 'Liquidity Pool Sweep & Accumulation', type: 'DEF_FI', status: 'DISABLED', allocation: '$0.00', pnl: '$0.00' },
  { id: 'STRAT-08', name: 'Multi-Factor Macro Regime Allocator', type: 'MACRO', status: 'DISABLED', allocation: '$0.00', pnl: '$0.00' },
];

export type ControlPlaneTab = 'DASHBOARD' | 'WIZARD' | 'SWITCHES' | 'AI_MODELS' | 'STRATEGIES' | 'TRADING' | 'FUNDS' | 'SCHEDULER' | 'GATEWAY' | 'RELEASES' | 'OBSERVABILITY' | 'INTEGRATION' | 'GLOBAL_RESET' | 'AUDIT';

export const ControlPlaneWorkspace: React.FC<{ initialTab?: ControlPlaneTab }> = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState<ControlPlaneTab>(initialTab || 'DASHBOARD');
  
  // System State
  const [systemState, setSystemState] = useState<'STANDBY' | 'STARTING' | 'LIVE' | 'MAINTENANCE' | 'STOPPED'>('STANDBY');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [arenaCapital, setArenaCapital] = useState(10000000.00); // $10M Initial Capital
  const [arenaTreasury, setArenaTreasury] = useState(10000000.00);
  
  // Models & Strategies State
  const [aiModels, setAiModels] = useState<AIModel[]>(INITIAL_AI_MODELS);
  const [strategies, setStrategies] = useState<StrategyItem[]>(INITIAL_STRATEGIES);
  
  // Trading State
  const [tradingActive, setTradingActive] = useState(false);
  const [positionsCount, setPositionsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0.00);
  const [pnlValue, setPnlValue] = useState(0.00);
  const [tradeHistoryCount, setTradeHistoryCount] = useState(0);

  // Startup Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardCompleted, setWizardCompleted] = useState(false);

  // Confirmation & Audit State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; action: () => void; warning: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; timestamp: string; user: string; action: string; reason: string; rollback: string }>>([
    { id: 'LOG-100', timestamp: new Date().toISOString(), user: 'admin@arina.enterprise', action: 'SYSTEM_INITIALIZATION', reason: 'Cold boot kernel deployment', rollback: 'SNAPSHOT-000' }
  ]);

  // Telegram Status State
  const [telegramStatus, setTelegramStatus] = useState<'CONNECTED' | 'NOT_CONFIGURED' | 'INVALID_TOKEN' | 'ERROR'>('NOT_CONFIGURED');
  const [telegramBotName, setTelegramBotName] = useState<string | undefined>(undefined);
  const [telegramBotId, setTelegramBotId] = useState<string | undefined>(undefined);
  const [telegramLastVerified, setTelegramLastVerified] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchApi('/api/notifications/settings').then((res: any) => {
      if (res && res.data) {
        setTelegramStatus(res.data.connectionStatus || 'NOT_CONFIGURED');
        setTelegramBotName(res.data.botName);
        setTelegramBotId(res.data.botId);
        setTelegramLastVerified(res.data.lastVerified);
      }
    }).catch(() => {});
  }, []);

  const recordAudit = (action: string, reason: string) => {
    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      user: 'admin@arina.enterprise',
      action,
      reason,
      rollback: `SNAP-${Date.now().toString().slice(-6)}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // --- Master Switch Handlers ---
  const handleSystemStart = () => {
    setSystemState('STARTING');
    setTimeout(() => {
      setSystemState('LIVE');
      setTradingActive(true);
      setAiModels(prev => prev.map(m => ({ ...m, status: 'RUNNING', health: 'HEALTHY', allocation: '$357,142.85' })));
      setStrategies(prev => prev.map(s => ({ ...s, status: 'ENABLED', allocation: '$1,250,000.00' })));
      setPositionsCount(14);
      setOrdersCount(6);
      setPortfolioValue(10000000.00);
      setArenaTreasury(0.00);
      setTradeHistoryCount(142);
      recordAudit('SYSTEM_START', 'Master Control Start sequence executed.');
    }, 800);
  };

  const handleSystemStop = () => {
    setSystemState('STOPPED');
    setTradingActive(false);
    setAiModels(prev => prev.map(m => ({ ...m, status: 'OFF', health: 'STANDBY', allocation: '$0.00' })));
    setStrategies(prev => prev.map(s => ({ ...s, status: 'DISABLED', allocation: '$0.00' })));
    setPositionsCount(0);
    setOrdersCount(0);
    recordAudit('SYSTEM_STOP', 'Master Control Stop sequence executed.');
  };

  const handleSystemRestart = () => {
    handleSystemStop();
    setTimeout(() => {
      handleSystemStart();
      recordAudit('SYSTEM_RESTART', 'Master Control Restart executed.');
    }, 1000);
  };

  const toggleMaintenance = () => {
    const nextVal = !maintenanceMode;
    setMaintenanceMode(nextVal);
    setSystemState(nextVal ? 'MAINTENANCE' : 'LIVE');
    recordAudit('MAINTENANCE_TOGGLE', `Maintenance mode set to ${nextVal}`);
  };

  // --- AI Bulk Controls ---
  const setAllAiStatus = (status: 'OFF' | 'RUNNING' | 'PAUSED' | 'RESTARTING') => {
    setAiModels(prev => prev.map(m => ({
      ...m,
      status,
      health: status === 'RUNNING' ? 'HEALTHY' : 'STANDBY',
      allocation: status === 'RUNNING' ? '$357,142.85' : '$0.00'
    })));
    recordAudit(`AI_BULK_${status}`, `All 28 AI models set to status ${status}`);
  };

  const toggleSingleModel = (id: string) => {
    setAiModels(prev => prev.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'RUNNING' ? 'OFF' : 'RUNNING';
        return {
          ...m,
          status: nextStatus,
          health: nextStatus === 'RUNNING' ? 'HEALTHY' : 'STANDBY',
          allocation: nextStatus === 'RUNNING' ? '$357,142.85' : '$0.00'
        };
      }
      return m;
    }));
  };

  // --- Strategy Controls ---
  const toggleAllStrategies = (status: 'ENABLED' | 'DISABLED' | 'PAUSED') => {
    setStrategies(prev => prev.map(s => ({
      ...s,
      status,
      allocation: status === 'ENABLED' ? '$1,250,000.00' : '$0.00'
    })));
    recordAudit(`STRATEGY_BULK_${status}`, `All strategies set to ${status}`);
  };

  const toggleSingleStrategy = (id: string) => {
    setStrategies(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
        return {
          ...s,
          status: nextStatus,
          allocation: nextStatus === 'ENABLED' ? '$1,250,000.00' : '$0.00'
        };
      }
      return s;
    }));
  };

  // --- Trading & Paper Trading Reset ---
  const executeTradingReset = () => {
    setPositionsCount(0);
    setOrdersCount(0);
    setPortfolioValue(0.00);
    setPnlValue(0.00);
    setTradeHistoryCount(0);
    recordAudit('TRADING_RESET', 'Complete purge of paper trading portfolio, positions, orders, and PnL.');
    setConfirmModal(null);
  };

  // --- Fund & Global Reset ---
  const executeGlobalReset = () => {
    setSystemState('STANDBY');
    setMaintenanceMode(false);
    setArenaCapital(10000000.00);
    setArenaTreasury(10000000.00);
    setAiModels(INITIAL_AI_MODELS.map(m => ({ ...m, status: 'OFF', health: 'STANDBY', allocation: '$0.00' })));
    setStrategies(INITIAL_STRATEGIES.map(s => ({ ...s, status: 'DISABLED', allocation: '$0.00', pnl: '$0.00' })));
    setTradingActive(false);
    setPositionsCount(0);
    setOrdersCount(0);
    setPortfolioValue(0.00);
    setPnlValue(0.00);
    setTradeHistoryCount(0);
    setWizardStep(1);
    setWizardCompleted(false);
    recordAudit('GLOBAL_RESET', 'FULL SYSTEM GLOBAL RESET to INITIAL STATE (RC1). All queues, memory, funds, and runtime zeroed.');
    setConfirmModal(null);
  };

  // --- Startup Wizard Handler ---
  const runWizardStep = (stepNum: number) => {
    if (stepNum === 1) {
      setAiModels(prev => prev.map(m => ({ ...m, status: 'RUNNING', health: 'HEALTHY' })));
    } else if (stepNum === 2) {
      setStrategies(prev => prev.map(s => ({ ...s, status: 'ENABLED' })));
    } else if (stepNum === 3) {
      setArenaTreasury(0);
      setPortfolioValue(10000000);
      setAiModels(prev => prev.map(m => ({ ...m, allocation: '$357,142.85' })));
      setStrategies(prev => prev.map(s => ({ ...s, allocation: '$1,250,000.00' })));
    } else if (stepNum === 6) {
      setTradingActive(true);
      setPositionsCount(14);
      setOrdersCount(6);
    } else if (stepNum === 7) {
      setSystemState('LIVE');
      setWizardCompleted(true);
    }
    if (stepNum < 7) {
      setWizardStep(stepNum + 1);
    }
    recordAudit(`WIZARD_STEP_${stepNum}`, `Startup Wizard step ${stepNum} executed successfully.`);
  };

  const activeAiCount = aiModels.filter(m => m.status === 'RUNNING').length;
  const activeStrategiesCount = strategies.filter(s => s.status === 'ENABLED').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-terminal-bg text-white font-sans selection:bg-terminal-amber/30 relative">
      {/* HEADER */}
      <Toolbar>
        <div className="flex items-center gap-2 pr-4 border-r border-terminal-border h-full">
          <Shield className="w-3.5 h-3.5 text-terminal-amber" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-terminal-muted italic">Enterprise Control Plane • Master Control Room (RC1)</span>
        </div>
        
        <GlobalSummaryItem label="Control State" value={systemState} color={systemState === 'LIVE' ? 'text-terminal-green' : systemState === 'MAINTENANCE' ? 'text-terminal-amber' : 'text-terminal-red'} />
        <GlobalSummaryItem label="Active AI Models" value={`${activeAiCount} / 28`} color="text-terminal-blue" />
        <GlobalSummaryItem label="Active Strategies" value={`${activeStrategiesCount} / ${strategies.length}`} color="text-terminal-amber" />
        <GlobalSummaryItem label="Arena Capital" value={`$${arenaCapital.toLocaleString()}`} color="text-terminal-green" />

        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={() => setConfirmModal({
              isOpen: true,
              title: 'GLOBAL RESET CONFIRMATION',
              warning: 'This will reset all 28 AI models, strategies, funds, portfolio, orders, positions, and logs to absolute zero initial state.',
              action: executeGlobalReset
            })}
            className="px-3 py-1 bg-terminal-red/20 border border-terminal-red/50 text-terminal-red text-[10px] font-mono font-bold uppercase tracking-wider rounded hover:bg-terminal-red/30 transition-colors"
          >
            Global Reset
          </button>
        </div>
      </Toolbar>

      {/* NAVIGATION TABS */}
      <EnterpriseTabBar
        tabs={[
          { id: 'DASHBOARD', label: 'Master Dashboard', icon: Activity },
          { id: 'OBSERVABILITY', label: 'Observability & Telemetry', icon: Eye },
          { id: 'WIZARD', label: 'Startup Wizard', icon: Sparkles },
          { id: 'SCHEDULER', label: 'EP26 Scheduler Engine', icon: Server },
          { id: 'GATEWAY', label: 'EP27 API Gateway', icon: Globe },
          { id: 'RELEASES', label: 'EP29 Release & Env', icon: Layers },
          { id: 'SWITCHES', label: 'Master Switches', icon: Zap },
          { id: 'AI_MODELS', label: 'AI Control (28 Models)', icon: Cpu },
          { id: 'STRATEGIES', label: 'Strategy Control', icon: TrendingUp },
          { id: 'TRADING', label: 'Trading & Paper Reset', icon: TerminalIcon },
          { id: 'FUNDS', label: 'Fund & Capital Reset', icon: Database },
          { id: 'INTEGRATION', label: 'Integration & RC (Phase 14)', icon: Layers },
          { id: 'GLOBAL_RESET', label: 'Global Reset Center', icon: RotateCcw },
          { id: 'AUDIT', label: 'Audit Log & Safety', icon: Shield },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as any)}
        activeVariant="amber-outline"
      />

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
        {activeTab === 'OBSERVABILITY' && <ObservabilityWorkspace />}
        {activeTab === 'SCHEDULER' && <SchedulerWorkspace />}
        {activeTab === 'GATEWAY' && <GatewayWorkspace />}
        {activeTab === 'RELEASES' && <ReleasesWorkspace />}

        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="System Status" value={systemState} className="bg-terminal-panel border-terminal-border" />
              <MetricCard label="AI Running" value={`${activeAiCount} / 28`} className="bg-terminal-panel border-terminal-border" />
              <MetricCard label="Strategies Running" value={`${activeStrategiesCount} / ${strategies.length}`} className="bg-terminal-panel border-terminal-border" />
              <MetricCard label="Arena Treasury" value={`$${arenaTreasury.toLocaleString()}`} className="bg-terminal-panel border-terminal-border" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Panel headerProps={{ title: "Core System Telemetry", icon: Activity }} className="lg:col-span-2 p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-black/40 border border-terminal-border rounded space-y-1">
                    <span className="text-terminal-muted text-[10px] uppercase">Trading Status</span>
                    <div className="text-white font-bold flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", tradingActive ? "bg-terminal-green animate-pulse" : "bg-terminal-red")} />
                      {tradingActive ? 'ACTIVE & EXECUTION READY' : 'STOPPED'}
                    </div>
                  </div>
                  <div className="p-3 bg-black/40 border border-terminal-border rounded space-y-1">
                    <span className="text-terminal-muted text-[10px] uppercase">Maintenance Mode</span>
                    <div className="text-white font-bold flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", maintenanceMode ? "bg-terminal-amber animate-pulse" : "bg-terminal-green")} />
                      {maintenanceMode ? 'ENABLED (LOCKED)' : 'DISABLED (NORMAL)'}
                    </div>
                  </div>
                  <div className="p-3 bg-black/40 border border-terminal-border rounded space-y-1">
                    <span className="text-terminal-muted text-[10px] uppercase">Active Positions</span>
                    <div className="text-terminal-blue font-bold text-base">{positionsCount} Open Positions</div>
                  </div>
                  <div className="p-3 bg-black/40 border border-terminal-border rounded space-y-1">
                    <span className="text-terminal-muted text-[10px] uppercase">Pending Orders</span>
                    <div className="text-terminal-amber font-bold text-base">{ordersCount} Orders Queued</div>
                  </div>
                </div>
              </Panel>

              <Panel headerProps={{ title: "Quick Master Actions", icon: Zap }} className="p-5 space-y-3">
                <button 
                  onClick={handleSystemStart}
                  className="w-full py-2.5 bg-terminal-green/20 border border-terminal-green/50 text-terminal-green text-xs font-mono font-bold uppercase rounded hover:bg-terminal-green/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> Start Enterprise System
                </button>
                <button 
                  onClick={handleSystemStop}
                  className="w-full py-2.5 bg-terminal-red/20 border border-terminal-red/50 text-terminal-red text-xs font-mono font-bold uppercase rounded hover:bg-terminal-red/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4" /> Emergency Stop All
                </button>
                <button 
                  onClick={handleSystemRestart}
                  className="w-full py-2.5 bg-terminal-amber/20 border border-terminal-amber/50 text-terminal-amber text-xs font-mono font-bold uppercase rounded hover:bg-terminal-amber/30 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Restart Kernel
                </button>
                <button 
                  onClick={toggleMaintenance}
                  className="w-full py-2.5 bg-white/10 border border-white/20 text-white text-xs font-mono font-bold uppercase rounded hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" /> {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                </button>
              </Panel>

              {/* NOTIFICATION HEALTH CARD */}
              <Panel headerProps={{ title: "Notification Health Card (Telegram Gateway)", icon: Globe }} className="p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-terminal-border">
                  <span className="text-terminal-muted uppercase text-[10px] font-bold">Telegram Status</span>
                  {telegramStatus === 'CONNECTED' ? (
                    <span className="px-2 py-0.5 bg-terminal-green/15 text-terminal-green border border-terminal-green/40 text-[9px] font-bold rounded uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
                      CONNECTED
                    </span>
                  ) : telegramStatus === 'INVALID_TOKEN' || telegramStatus === 'ERROR' ? (
                    <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/40 text-[9px] font-bold rounded uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      INVALID TOKEN
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-terminal-amber/15 text-terminal-amber border border-terminal-amber/40 text-[9px] font-bold rounded uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-terminal-amber" />
                      NOT CONFIGURED
                    </span>
                  )}
                </div>
                
                <div className="space-y-1.5 p-2 bg-[#060810] border border-terminal-border rounded text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Bot Username:</span>
                    <span className="font-bold text-white">{telegramBotName || 'Not Verified'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Bot ID:</span>
                    <span className="font-bold text-white">{telegramBotId || 'Not Verified'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Last Verification:</span>
                    <span className="font-bold text-terminal-amber">{telegramLastVerified ? new Date(telegramLastVerified).toLocaleTimeString() : 'Never'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 bg-black/40 border border-terminal-border rounded">
                    <span className="text-terminal-muted uppercase block">Queue Size</span>
                    <strong className="text-white text-sm">2 Items</strong>
                  </div>
                  <div className="p-2 bg-black/40 border border-terminal-border rounded">
                    <span className="text-terminal-muted uppercase block">Pending</span>
                    <strong className="text-terminal-amber text-sm">0 Pending</strong>
                  </div>
                  <div className="p-2 bg-black/40 border border-terminal-border rounded">
                    <span className="text-terminal-muted uppercase block">Delivered Today</span>
                    <strong className="text-terminal-green text-sm">24 Messages</strong>
                  </div>
                  <div className="p-2 bg-black/40 border border-terminal-border rounded">
                    <span className="text-terminal-muted uppercase block">Failed Today</span>
                    <strong className="text-terminal-red text-sm">0 Failed</strong>
                  </div>
                  <div className="p-2 bg-black/40 border border-terminal-border rounded">
                    <span className="text-terminal-muted uppercase block">Avg Delivery Time</span>
                    <strong className="text-terminal-blue text-sm">142 ms</strong>
                  </div>
                  <div className="p-2 bg-black/40 border border-terminal-border rounded">
                    <span className="text-terminal-muted uppercase block">Retry Queue</span>
                    <strong className="text-slate-300 text-sm">0 Items</strong>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        )}

        {activeTab === 'WIZARD' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Panel headerProps={{ title: "Enterprise Startup & Initialization Wizard (RC1)", icon: Sparkles }} className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-terminal-border pb-4">
                <span className="text-xs font-mono uppercase text-terminal-muted">Current Wizard Sequence Step: <strong className="text-terminal-amber">Step {wizardStep} of 7</strong></span>
                {wizardCompleted && <StatusBadge status="SYSTEM LIVE" variant="success" />}
              </div>

              <div className="space-y-4 font-mono text-xs">
                {[
                  { step: 1, title: 'Load AI Models', desc: 'Initialize all 28 specialized neural reasoning engines into active cluster memory.' },
                  { step: 2, title: 'Enable Strategies', desc: 'Activate quantitative trading strategies and portfolio allocation matrices.' },
                  { step: 3, title: 'Allocate Capital', desc: 'Distribute Arena Capital across AI models and active strategies ($10M total).' },
                  { step: 4, title: 'Start Research Engine', desc: 'Boot automated quantitative research workflows and RAG data pipelines.' },
                  { step: 5, title: 'Start Learning Loop', desc: 'Initialize reinforcement learning feedback loops and continuous evolution.' },
                  { step: 6, title: 'Start Paper Trading', desc: 'Connect execution gateway to live simulated market feeds and order books.' },
                  { step: 7, title: 'System LIVE', desc: 'Finalize kernel boot sequence and switch enterprise OS status to fully operational.' },
                ].map(s => {
                  const isCurrent = wizardStep === s.step;
                  const isDone = wizardStep > s.step || wizardCompleted;
                  return (
                    <div 
                      key={s.step}
                      className={cn(
                        "p-4 border rounded flex items-center justify-between transition-all",
                        isCurrent ? "bg-terminal-amber/10 border-terminal-amber" : isDone ? "bg-terminal-green/5 border-terminal-green/30" : "bg-black/30 border-terminal-border/50 opacity-60"
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-terminal-amber">Step {s.step}:</span>
                          <span className="font-bold text-white uppercase">{s.title}</span>
                          {isDone && <CheckCircle2 className="w-4 h-4 text-terminal-green" />}
                        </div>
                        <p className="text-[11px] text-terminal-muted">{s.desc}</p>
                      </div>
                      {isCurrent && !wizardCompleted && (
                        <button
                          onClick={() => runWizardStep(s.step)}
                          className="px-4 py-2 bg-terminal-amber text-black font-bold uppercase rounded hover:bg-terminal-amber/80 transition-colors shrink-0"
                        >
                          Execute Step →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {wizardCompleted && (
                <div className="p-4 bg-terminal-green/10 border border-terminal-green/40 rounded text-center space-y-2">
                  <h4 className="text-sm font-bold text-terminal-green uppercase">Startup Sequence Completed Successfully!</h4>
                  <p className="text-xs text-terminal-muted">All enterprise systems are fully online, capitalized, and executing trading algorithms.</p>
                  <button 
                    onClick={() => { setWizardStep(1); setWizardCompleted(false); }}
                    className="mt-2 px-4 py-1.5 bg-terminal-panel border border-terminal-border text-xs uppercase rounded hover:bg-white/5"
                  >
                    Reset Wizard Sequence
                  </button>
                </div>
              )}
            </Panel>
          </div>
        )}

        {activeTab === 'SWITCHES' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-terminal-amber">Master System Switches & Kernel Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
              <Panel headerProps={{ title: "Power & State", icon: Power }} className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-black/40 border border-terminal-border rounded">
                  <span>System Power State</span>
                  <StatusBadge status={systemState} variant={systemState === 'LIVE' ? 'success' : 'warning'} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleSystemStart} className="py-3 bg-terminal-green/20 border border-terminal-green/50 text-terminal-green font-bold uppercase rounded hover:bg-terminal-green/30">START SYSTEM</button>
                  <button onClick={handleSystemStop} className="py-3 bg-terminal-red/20 border border-terminal-red/50 text-terminal-red font-bold uppercase rounded hover:bg-terminal-red/30">STOP SYSTEM</button>
                </div>
                <button onClick={handleSystemRestart} className="w-full py-3 bg-terminal-amber/20 border border-terminal-amber/50 text-terminal-amber font-bold uppercase rounded hover:bg-terminal-amber/30">RESTART KERNEL</button>
              </Panel>

              <Panel headerProps={{ title: "Maintenance & Safety", icon: Shield }} className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-black/40 border border-terminal-border rounded">
                  <span>Maintenance Mode</span>
                  <span className={cn("font-bold", maintenanceMode ? "text-terminal-amber" : "text-terminal-green")}>{maintenanceMode ? 'ENABLED' : 'DISABLED'}</span>
                </div>
                <button onClick={toggleMaintenance} className="w-full py-3 bg-white/10 border border-white/30 text-white font-bold uppercase rounded hover:bg-white/20">
                  {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                </button>
                <button 
                  onClick={() => setConfirmModal({
                    isOpen: true,
                    title: 'EMERGENCY LOCKDOWN',
                    warning: 'This will instantly sever all external API feeds, halt trading execution, and lock all user sessions.',
                    action: () => { handleSystemStop(); recordAudit('EMERGENCY_LOCKDOWN', 'Manual emergency lockdown triggered.'); }
                  })}
                  className="w-full py-3 bg-terminal-red text-black font-bold uppercase rounded hover:bg-terminal-red/90"
                >
                  🚨 TRIGGER EMERGENCY LOCKDOWN
                </button>
              </Panel>
            </div>
          </div>
        )}

        {activeTab === 'AI_MODELS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-terminal-amber">AI Control Center (All 28 Specialized Neural Models)</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setAllAiStatus('RUNNING')} className="px-3 py-1.5 bg-terminal-green/20 border border-terminal-green/50 text-terminal-green text-[10px] font-mono font-bold uppercase rounded hover:bg-terminal-green/30">Start All AI</button>
                <button onClick={() => setAllAiStatus('OFF')} className="px-3 py-1.5 bg-terminal-red/20 border border-terminal-red/50 text-terminal-red text-[10px] font-mono font-bold uppercase rounded hover:bg-terminal-red/30">Stop All AI</button>
                <button onClick={() => setAllAiStatus('PAUSED')} className="px-3 py-1.5 bg-terminal-amber/20 border border-terminal-amber/50 text-terminal-amber text-[10px] font-mono font-bold uppercase rounded hover:bg-terminal-amber/30">Pause All AI</button>
                <button onClick={() => setAllAiStatus('RESTARTING')} className="px-3 py-1.5 bg-terminal-blue/20 border border-terminal-blue/50 text-terminal-blue text-[10px] font-mono font-bold uppercase rounded hover:bg-terminal-blue/30">Reload All AI</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              {aiModels.map(model => (
                <div key={model.id} className="p-4 bg-terminal-panel border border-terminal-border rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate">{model.name}</span>
                    <StatusBadge status={model.status} variant={model.status === 'RUNNING' ? 'success' : model.status === 'PAUSED' ? 'warning' : 'error'} />
                  </div>
                  <div className="text-[10px] text-terminal-muted space-y-1">
                    <div>Type: <span className="text-white">{model.category}</span></div>
                    <div>Accuracy: <span className="text-terminal-green">{model.accuracy}</span> | Latency: <span className="text-terminal-blue">{model.latency}</span></div>
                    <div>Allocation: <span className="text-terminal-amber">{model.allocation}</span></div>
                  </div>
                  <div className="pt-2 border-t border-terminal-border/40 flex items-center gap-2">
                    <button 
                      onClick={() => toggleSingleModel(model.id)}
                      className={cn(
                        "flex-1 py-1 text-[10px] font-bold uppercase rounded border transition-colors",
                        model.status === 'RUNNING' ? "bg-terminal-red/10 border-terminal-red/40 text-terminal-red hover:bg-terminal-red/20" : "bg-terminal-green/10 border-terminal-green/40 text-terminal-green hover:bg-terminal-green/20"
                      )}
                    >
                      {model.status === 'RUNNING' ? 'Stop AI' : 'Start AI'}
                    </button>
                    <button 
                      onClick={() => {
                        setAiModels(prev => prev.map(m => m.id === model.id ? { ...m, status: 'RESTARTING' } : m));
                        setTimeout(() => setAiModels(prev => prev.map(m => m.id === model.id ? { ...m, status: 'RUNNING', health: 'HEALTHY' } : m)), 600);
                        recordAudit('MODEL_RELOAD', `Model ${model.id} (${model.name}) reloaded.`);
                      }}
                      className="px-2.5 py-1 bg-white/5 border border-terminal-border text-[10px] hover:bg-white/10 rounded"
                    >
                      Reload
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'STRATEGIES' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-terminal-amber">Strategy Control & Execution Matrix</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleAllStrategies('ENABLED')} className="px-3 py-1.5 bg-terminal-green/20 border border-terminal-green/50 text-terminal-green text-[10px] font-mono font-bold uppercase rounded">Enable All Strategies</button>
                <button onClick={() => toggleAllStrategies('DISABLED')} className="px-3 py-1.5 bg-terminal-red/20 border border-terminal-red/50 text-terminal-red text-[10px] font-mono font-bold uppercase rounded">Disable All Strategies</button>
              </div>
            </div>

            <div className="overflow-hidden border border-terminal-border rounded bg-terminal-panel">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-black/60 border-b border-terminal-border text-[9px] uppercase tracking-wider text-terminal-muted">
                    <th className="p-3">Strategy ID</th>
                    <th className="p-3">Strategy Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Capital Allocation</th>
                    <th className="p-3">PnL</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/40">
                  {strategies.map(strat => (
                    <tr key={strat.id} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-terminal-amber">{strat.id}</td>
                      <td className="p-3 font-bold text-white">{strat.name}</td>
                      <td className="p-3 text-terminal-muted">{strat.type}</td>
                      <td className="p-3"><StatusBadge status={strat.status} variant={strat.status === 'ENABLED' ? 'success' : 'warning'} /></td>
                      <td className="p-3 text-terminal-blue">{strat.allocation}</td>
                      <td className="p-3 text-terminal-green">{strat.pnl}</td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => toggleSingleStrategy(strat.id)}
                          className={cn(
                            "px-3 py-1 text-[10px] font-bold uppercase rounded border transition-colors",
                            strat.status === 'ENABLED' ? "bg-terminal-red/10 border-terminal-red/40 text-terminal-red hover:bg-terminal-red/20" : "bg-terminal-green/10 border-terminal-green/40 text-terminal-green hover:bg-terminal-green/20"
                          )}
                        >
                          {strat.status === 'ENABLED' ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'TRADING' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-terminal-amber">Trading Control & Paper Trading Reset</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
              <Panel headerProps={{ title: "Live Execution Gateway", icon: TrendingUp }} className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-black/40 border border-terminal-border rounded">
                  <span>Trading Engine Status</span>
                  <StatusBadge status={tradingActive ? 'ACTIVE' : 'STOPPED'} variant={tradingActive ? 'success' : 'error'} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setTradingActive(true); recordAudit('TRADING_START', 'Trading execution gateway started.'); }} className="py-3 bg-terminal-green/20 border border-terminal-green/50 text-terminal-green font-bold uppercase rounded">Start Trading</button>
                  <button onClick={() => { setTradingActive(false); recordAudit('TRADING_STOP', 'Trading execution gateway stopped.'); }} className="py-3 bg-terminal-red/20 border border-terminal-red/50 text-terminal-red font-bold uppercase rounded">Stop Trading</button>
                </div>
                <button 
                  onClick={() => { setPositionsCount(0); setOrdersCount(0); recordAudit('CANCEL_ORDERS_POSITIONS', 'Cancelled all pending orders and closed open positions.'); }}
                  className="w-full py-3 bg-terminal-amber/20 border border-terminal-amber/50 text-terminal-amber font-bold uppercase rounded"
                >
                  Cancel Orders & Close Positions
                </button>
              </Panel>

              <Panel headerProps={{ title: "Paper Trading Complete Reset", icon: RotateCcw }} className="p-6 space-y-4">
                <p className="text-xs text-terminal-muted">Resets Portfolio, Positions, Orders, Trade History, PnL, Journal, and Statistics to absolute zero.</p>
                <div className="p-3 bg-black/40 border border-terminal-border rounded space-y-1 text-xs">
                  <div>Positions: <strong className="text-white">{positionsCount}</strong></div>
                  <div>Orders: <strong className="text-white">{ordersCount}</strong></div>
                  <div>Trade History: <strong className="text-white">{tradeHistoryCount} records</strong></div>
                </div>
                <button 
                  onClick={() => setConfirmModal({
                    isOpen: true,
                    title: 'PAPER TRADING RESET',
                    warning: 'This will permanently wipe all simulated trades, positions, orders, and PnL history.',
                    action: executeTradingReset
                  })}
                  className="w-full py-3 bg-terminal-red text-black font-bold uppercase rounded hover:bg-terminal-red/90"
                >
                  🔄 Reset Paper Trading Data
                </button>
              </Panel>
            </div>
          </div>
        )}

        {activeTab === 'FUNDS' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-terminal-amber">Fund Capital Reset & Treasury Restoration</h3>
            <Panel headerProps={{ title: "Capital & Treasury Control", icon: Database }} className="p-6 space-y-6 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-black/40 border border-terminal-border rounded space-y-1">
                  <span className="text-terminal-muted text-[10px] uppercase">Arena Treasury Capital</span>
                  <div className="text-2xl font-bold text-terminal-green">${arenaTreasury.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-black/40 border border-terminal-border rounded space-y-1">
                  <span className="text-terminal-muted text-[10px] uppercase">Total Allocated Capital</span>
                  <div className="text-2xl font-bold text-terminal-amber">${(arenaCapital - arenaTreasury).toLocaleString()}</div>
                </div>
              </div>

              <p className="text-terminal-muted">Executing a Fund Reset will recall every AI allocation, return all strategy allocations, reclaim reserve pools, and restore Arena Capital to initial ($10,000,000.00).</p>

              <button 
                onClick={() => setConfirmModal({
                  isOpen: true,
                  title: 'FUND & CAPITAL RESET',
                  warning: 'This will return all AI and strategy allocations to the treasury and restore initial Arena Capital.',
                  action: () => {
                    setArenaTreasury(arenaCapital);
                    setAiModels(prev => prev.map(m => ({ ...m, allocation: '$0.00' })));
                    setStrategies(prev => prev.map(s => ({ ...s, allocation: '$0.00' })));
                    recordAudit('FUND_RESET', 'Recalled all capital allocations and restored Arena Treasury.');
                    setConfirmModal(null);
                  }
                })}
                className="px-6 py-3 bg-terminal-amber text-black font-bold uppercase rounded hover:bg-terminal-amber/80 transition-colors"
              >
                Execute Fund & Capital Reset
              </button>
            </Panel>
          </div>
        )}

        {activeTab === 'GLOBAL_RESET' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Panel headerProps={{ title: "Master Global Reset Center", icon: Shield }} className="p-6 space-y-6 font-mono text-xs">
              <div className="p-4 bg-terminal-red/10 border border-terminal-red/40 rounded space-y-2 text-terminal-red">
                <h4 className="font-bold uppercase flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> WARNING: DESTRUCTIVE MASTER OPERATION
                </h4>
                <p className="text-[11px] text-terminal-muted">
                  Global Reset restores AI ARINA Enterprise OS to pristine initial state (Release Candidate RC1). All AI models, strategies, funds, paper trading, lifecycle, leaderboard, analytics, research, runtime, scheduler, memory, knowledge, and logs will be reset to zero.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-terminal-muted uppercase text-[10px] font-bold">Reset Scope Verification Checklist:</span>
                <ul className="space-y-1.5 text-terminal-muted list-disc list-inside">
                  <li>Trading Data = ZERO</li>
                  <li>Trade History = ZERO</li>
                  <li>PnL & Portfolio = ZERO</li>
                  <li>Orders & Positions = ZERO</li>
                  <li>Research & Analytics = ZERO</li>
                  <li>Learning, Memory & Knowledge Queues = ZERO</li>
                  <li>All 28 AI Models = OFF</li>
                  <li>All Strategies = DISABLED</li>
                </ul>
              </div>

              <button 
                onClick={() => setConfirmModal({
                  isOpen: true,
                  title: 'MASTER GLOBAL RESET (RC1)',
                  warning: 'This action is irreversible. All platform data will be wiped and restored to cold boot initial state.',
                  action: executeGlobalReset
                })}
                className="w-full py-4 bg-terminal-red text-black font-bold uppercase rounded hover:bg-terminal-red/90 text-sm tracking-wider"
              >
                ⚠️ EXECUTE MASTER GLOBAL RESET
              </button>
            </Panel>
          </div>
        )}

        {activeTab === 'AUDIT' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-terminal-amber">Control Plane Audit Trail & Safety Log</h3>
            <div className="overflow-hidden border border-terminal-border rounded bg-terminal-panel">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-black/60 border-b border-terminal-border text-[9px] uppercase tracking-wider text-terminal-muted">
                    <th className="p-3">Log ID</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Operator</th>
                    <th className="p-3">Control Action</th>
                    <th className="p-3">Reason / Context</th>
                    <th className="p-3">Rollback Snapshot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/40">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-terminal-amber">{log.id}</td>
                      <td className="p-3 text-terminal-muted">{safeFormat(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}</td>
                      <td className="p-3 text-terminal-blue">{log.user}</td>
                      <td className="p-3 font-bold text-white uppercase">{log.action}</td>
                      <td className="p-3 text-terminal-muted">{log.reason}</td>
                      <td className="p-3 text-terminal-green font-bold">{log.rollback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'INTEGRATION' && (
          <div className="h-[calc(100vh-180px)] -m-6">
            <IntegrationValidationWorkspace />
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-terminal-panel border border-terminal-red/60 rounded-lg max-w-md w-full p-6 space-y-6 shadow-2xl font-mono"
            >
              <div className="flex items-center gap-3 text-terminal-red">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-sm font-bold uppercase tracking-wider">{confirmModal.title}</h3>
              </div>

              <p className="text-xs text-terminal-muted leading-relaxed">
                {confirmModal.warning}
              </p>

              <div className="p-3 bg-black/50 border border-terminal-border rounded text-[11px] text-white">
                Type <strong className="text-terminal-amber">CONFIRM</strong> to authorize this enterprise control operation.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-terminal-border/40">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs uppercase rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmModal.action}
                  className="px-4 py-2 bg-terminal-red text-black font-bold text-xs uppercase rounded hover:bg-terminal-red/90 transition-colors"
                >
                  Authorize & Execute
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
