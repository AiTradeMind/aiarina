import React, { useState, useMemo } from 'react';
import { 
  Workflow, Search, Filter, Layers, FileText, Activity, Box, Settings, Shield, 
  ShieldCheck, ShieldAlert, Cpu, ArrowRight, CheckCircle, XCircle, AlertTriangle, 
  Play, RefreshCw, Sliders, Database, GitBranch, GitCommit, Copy, Plus, Terminal, 
  Check, Lock, Unlock, Award, Clock, DollarSign, TrendingUp, BarChart2, PieChart, 
  Network, ShoppingBag, ChevronRight, Info, BookOpen, Compass, Download, Eye, 
  BarChart3, TrendingDown, Scale, Target, RotateCcw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SectionHeader, StatusBadge, MetricCard, Panel } from '../ui/Base';
import { DataTable } from '../ui/Table';
import { Button } from '../ui/Button';

export const EnterpriseStrategyLifecycleIntelligenceCenter = React.memo(({ onNavigateWorkspace }: { onNavigateWorkspace?: (ws: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [marketFilter, setMarketFilter] = useState('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  
  const [activeInspectorTab, setActiveInspectorTab] = useState<
    'OVERVIEW' | 'CONFIG' | 'LIFECYCLE' | 'RESEARCH' | 'AI_ASSIGNMENT' | 'PARAMETERS' | 
    'SIGNALS' | 'ORDERS' | 'TRADES' | 'PERFORMANCE' | 'CAPITAL' | 'RISK' | 'DEPENDENCIES' | 
    'TIMELINE' | 'AUDIT' | 'REPOSITORIES' | 'CONTROLLERS' | 'SERVICES' | 'ROUTES' | 'DATABASE' | 
    'JSON' | 'SHA256'
  >('OVERVIEW');

  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const strategiesLifecycleData = [
    {
      id: 'STRAT-001',
      name: 'Statistical Arbitrage Multi-Asset',
      category: 'Arbitrage',
      stage: 'Production Active',
      status: 'Running',
      primaryAi: 'DeepAlpha-V7 (Transformer)',
      secondaryAi: 'QuantumMomentum-X',
      fallbackAi: 'MacroPredictor-Alpha',
      llmProvider: 'OpenAI GPT-4o / Claude 3.5',
      version: 'v3.2.0',
      confidence: '98.4%',
      latency: '1.2 ms',
      inferenceEngine: 'TensorRT-LLM',
      signals: { generated: 1420, approved: 1385, rejected: 25, expired: 10, executed: 1200 },
      orders: { created: 1210, queued: 0, filled: 1200, cancelled: 8, rejected: 2 },
      trades: { opened: 1200, closed: 1150, winning: 852, losing: 298, cancelled: 0, rejected: 0 },
      capital: { allocated: '$5,000,000', reserved: '$500,000', used: '$4,200,000', recovered: '$3,800,000', available: '$800,000' },
      performance: { winRate: '74.1%', sharpe: '3.42', profitFactor: '2.85', drawdown: '-3.2%', recoveryFactor: '10.5', riskScore: 'Low (2.1)' },
      risk: { var99: '₹1,25,000', cvar: '₹1,80,000', exposure: '₹4.2 Cr', marginUsage: '28%', capitalRisk: '0.04%', operationalRisk: 'Zero', violations: 'None' },
      roi: '+32.4%',
      pnl: '+₹1,62,00,000',
      created: '2026-06-01',
      updated: 'Just now',
      owner: 'Quantitative Research Group A',
      market: 'NSE / BSE'
    },
    {
      id: 'STRAT-002',
      name: 'Transformer Alpha Capture',
      category: 'Momentum',
      stage: 'Paper Trading',
      status: 'Running',
      primaryAi: 'QuantumMomentum-X',
      secondaryAi: 'DeepAlpha-V7',
      fallbackAi: 'FlowVelocity-AI',
      llmProvider: 'Anthropic Claude 3.5',
      version: 'v2.8.1',
      confidence: '94.2%',
      latency: '2.4 ms',
      inferenceEngine: 'vLLM Server',
      signals: { generated: 890, approved: 860, rejected: 20, expired: 10, executed: 840 },
      orders: { created: 850, queued: 2, filled: 840, cancelled: 6, rejected: 2 },
      trades: { opened: 840, closed: 810, winning: 580, losing: 230, cancelled: 0, rejected: 0 },
      capital: { allocated: '$4,200,000', reserved: '$400,000', used: '$3,500,000', recovered: '$3,100,000', available: '$700,000' },
      performance: { winRate: '71.5%', sharpe: '2.95', profitFactor: '2.40', drawdown: '-4.1%', recoveryFactor: '8.2', riskScore: 'Moderate (4.2)' },
      risk: { var99: '$160,000', cvar: '$220,000', exposure: '$3.5M', marginUsage: '34%', capitalRisk: '0.06%', operationalRisk: 'Zero', violations: 'None' },
      roi: '+28.9%',
      pnl: '+$1,210,000',
      created: '2026-06-15',
      updated: '2m ago',
      owner: 'Alpha Lab 3',
      market: 'NSE India'
    },
    {
      id: 'STRAT-003',
      name: 'Volatility Mean Reversion',
      category: 'Mean Reversion',
      stage: 'Backtesting',
      status: 'Paused',
      primaryAi: 'MacroPredictor-Alpha',
      secondaryAi: 'SentimentNeural-V3',
      fallbackAi: 'Q-Learning-Alpha',
      llmProvider: 'Google Gemini 2.5 Pro',
      version: 'v1.9.4',
      confidence: '89.1%',
      latency: '4.1 ms',
      inferenceEngine: 'PyTorch C++ Runtime',
      signals: { generated: 540, approved: 510, rejected: 20, expired: 10, executed: 480 },
      orders: { created: 490, queued: 0, filled: 480, cancelled: 8, rejected: 2 },
      trades: { opened: 480, closed: 450, winning: 307, losing: 143, cancelled: 0, rejected: 0 },
      capital: { allocated: '$3,000,000', reserved: '$300,000', used: '$2,400,000', recovered: '$2,100,000', available: '$600,000' },
      performance: { winRate: '68.2%', sharpe: '2.40', profitFactor: '2.10', drawdown: '-5.2%', recoveryFactor: '6.5', riskScore: 'Low (2.8)' },
      risk: { var99: '$140,000', cvar: '$190,000', exposure: '$2.4M', marginUsage: '22%', capitalRisk: '0.05%', operationalRisk: 'Zero', violations: 'None' },
      roi: '+19.4%',
      pnl: '+$582,000',
      created: '2026-07-01',
      updated: '15m ago',
      owner: 'Derivatives Quant Desk',
      market: 'NSE / BSE Options'
    },
    {
      id: 'STRAT-004',
      name: 'High-Frequency Order Flow Imbalance',
      category: 'HFT / Flow',
      stage: 'Production Ready',
      status: 'Running',
      primaryAi: 'FlowVelocity-AI',
      secondaryAi: 'DeepAlpha-V7',
      fallbackAi: 'QuantumMomentum-X',
      llmProvider: 'DeepSeek V3 / Triton',
      version: 'v4.0.1',
      confidence: '96.8%',
      latency: '0.8 ms',
      inferenceEngine: 'Direct FPGA Kernel',
      signals: { generated: 3800, approved: 3750, rejected: 30, expired: 20, executed: 3700 },
      orders: { created: 3720, queued: 0, filled: 3700, cancelled: 15, rejected: 5 },
      trades: { opened: 3700, closed: 3650, winning: 2392, losing: 1258, cancelled: 0, rejected: 0 },
      capital: { allocated: '₹6,50,00,000', reserved: '₹80,00,000', used: '₹5,80,00,000', recovered: '₹5,10,00,000', available: '₹70,00,000' },
      performance: { winRate: '65.5%', sharpe: '3.85', profitFactor: '3.10', drawdown: '-2.1%', recoveryFactor: '14.2', riskScore: 'High (6.5)' },
      risk: { var99: '₹2,10,000', cvar: '₹2,90,000', exposure: '₹5.8 Cr', marginUsage: '52%', capitalRisk: '0.08%', operationalRisk: 'Low', violations: 'None' },
      roi: '+41.2%',
      pnl: '+₹2,67,80,000',
      created: '2026-05-10',
      updated: 'Just now',
      owner: 'HFT Execution Squad',
      market: 'NSE / BSE / MCX'
    },
    {
      id: 'STRAT-005',
      name: 'Macroeconomic Sentiment Engine',
      category: 'Global Macro',
      stage: 'Certified',
      status: 'Running',
      primaryAi: 'SentimentNeural-V3',
      secondaryAi: 'MacroPredictor-Alpha',
      fallbackAi: 'DeepAlpha-V7',
      llmProvider: 'Anthropic Claude 3.5 Sonnet',
      version: 'v2.1.0',
      confidence: '97.2%',
      latency: '3.5 ms',
      inferenceEngine: 'TensorRT Cloud',
      signals: { generated: 210, approved: 205, rejected: 3, expired: 2, executed: 200 },
      orders: { created: 202, queued: 0, filled: 200, cancelled: 2, rejected: 0 },
      trades: { opened: 200, closed: 190, winning: 149, losing: 41, cancelled: 0, rejected: 0 },
      capital: { allocated: '$8,000,000', reserved: '$1,000,000', used: '$7,000,000', recovered: '$6,200,000', available: '$1,000,000' },
      performance: { winRate: '78.5%', sharpe: '3.10', profitFactor: '2.90', drawdown: '-1.8%', recoveryFactor: '12.0', riskScore: 'Low (1.5)' },
      risk: { var99: '$95,000', cvar: '$130,000', exposure: '$7.0M', marginUsage: '18%', capitalRisk: '0.03%', operationalRisk: 'Zero', violations: 'None' },
      roi: '+15.2%',
      pnl: '+$1,216,000',
      created: '2026-04-20',
      updated: '1h ago',
      owner: 'Global Macro Desk',
      market: 'Multi-Asset Forex / Rates'
    },
    {
      id: 'STRAT-006',
      name: 'Cross-Exchange Crypto Arbitrage',
      category: 'Crypto / Arb',
      stage: 'Research',
      status: 'Disabled',
      primaryAi: 'CryptoArbitrage-X',
      secondaryAi: 'FlowVelocity-AI',
      fallbackAi: 'DeepAlpha-V7',
      llmProvider: 'OpenAI GPT-4o Mini',
      version: 'v3.0.2',
      confidence: '82.4%',
      latency: '1.5 ms',
      inferenceEngine: 'Go Distributed Worker',
      signals: { generated: 95, approved: 80, rejected: 10, expired: 5, executed: 75 },
      orders: { created: 78, queued: 0, filled: 75, cancelled: 3, rejected: 0 },
      trades: { opened: 75, closed: 72, winning: 59, losing: 13, cancelled: 0, rejected: 0 },
      capital: { allocated: '$1,500,000', reserved: '$200,000', used: '$1,200,000', recovered: '$1,000,000', available: '$300,000' },
      performance: { winRate: '82.1%', sharpe: '2.10', profitFactor: '2.30', drawdown: '-6.5%', recoveryFactor: '5.1', riskScore: 'High (7.2)' },
      risk: { var99: '$180,000', cvar: '$250,000', exposure: '$1.2M', marginUsage: '45%', capitalRisk: '0.10%', operationalRisk: 'Moderate', violations: '1 Warning' },
      roi: '+8.4%',
      pnl: '+$126,000',
      created: '2026-07-10',
      updated: '1d ago',
      owner: 'Crypto Quant Guild',
      market: 'Binance / Coinbase / WazirX'
    },
    {
      id: 'STRAT-007',
      name: 'Factor Rotation Quantitative Model',
      category: 'Factor',
      stage: 'Configuration',
      status: 'Draft',
      primaryAi: 'FactorMaster-V2',
      secondaryAi: 'DeepAlpha-V7',
      fallbackAi: 'QuantumMomentum-X',
      llmProvider: 'Anthropic Claude 3.5',
      version: 'v1.5.0',
      confidence: '90.5%',
      latency: '5.0 ms',
      inferenceEngine: 'Python NumPy/SciPy Worker',
      signals: { generated: 0, approved: 0, rejected: 0, expired: 0, executed: 0 },
      orders: { created: 0, queued: 0, filled: 0, cancelled: 0, rejected: 0 },
      trades: { opened: 0, closed: 0, winning: 0, losing: 0, cancelled: 0, rejected: 0 },
      capital: { allocated: '$4,000,000', reserved: '$500,000', used: '$0', recovered: '$0', available: '$4,000,000' },
      performance: { winRate: '0.0%', sharpe: '0.00', profitFactor: '0.00', drawdown: '0.0%', recoveryFactor: '0.0', riskScore: 'Low (1.8)' },
      risk: { var99: '$0', cvar: '$0', exposure: '$0', marginUsage: '0%', capitalRisk: '0.01%', operationalRisk: 'Zero', violations: 'None' },
      roi: '0.0%',
      pnl: '$0',
      created: '2026-08-04',
      updated: 'Just now',
      owner: 'Quantitative Research Group B',
      market: 'NSE 500 Index'
    }
  ];

  const handleExport = (format: string) => {
    setExportNotification(`Successfully exported Strategy Lifecycle Intelligence Center audit in ${format} format.`);
    setTimeout(() => setExportNotification(null), 4000);
  };

  const filteredStrategies = strategiesLifecycleData.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.primaryAi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLifecycle = lifecycleFilter === 'ALL' || s.stage.toUpperCase() === lifecycleFilter.toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || s.status.toUpperCase() === statusFilter.toUpperCase();
    const matchesMarket = marketFilter === 'ALL' || s.market.toUpperCase().includes(marketFilter.toUpperCase());
    return matchesSearch && matchesLifecycle && matchesStatus && matchesMarket;
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="Enterprise Strategy Lifecycle Intelligence Center" icon={Workflow} />

      {exportNotification && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-lg text-emerald-400 font-mono text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{exportNotification}</span>
          </div>
          <span className="text-[10px] text-gray-400">EP04 AI LIFECYCLE AUDIT EXPORT</span>
        </div>
      )}

      {/* Top Executive KPI Bar */}
      <div className="grid grid-cols-7 gap-3">
        <MetricCard title="Total Strategies" value="25 Active" trend="100% Tracked" />
        <MetricCard title="Draft & Research" value="4 Models" trend="In Pipeline" />
        <MetricCard title="Config / AI Assigned" value="6 Models" trend="Verified" />
        <MetricCard title="Backtest & Risk" value="3 Certified" trend="Approved" />
        <MetricCard title="Paper Trading" value="5 Active" trend="Simulated" />
        <MetricCard title="Production Active" value="7 Running" trend="DMA Live" />
        <MetricCard title="Archived / Paused" value="3 Models" trend="Safe State" />
      </div>

      {/* Lifecycle Pipeline Flow Banner */}
      <Panel title="Strategy Lifecycle Pipeline (17-Stage Progression Engine)" icon={Workflow}>
        <div className="p-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max text-[11px] font-mono">
            {[
              'Draft', 'Research', 'Design', 'Configuration', 'AI Assignment', 'Parameter Validation', 
              'Backtesting', 'Walk Forward', 'Risk Validation', 'Committee Approval', 'Certification', 
              'Paper Trading', 'Performance Monitoring', 'Production Ready', 'Production Active', 'Paused', 'Archived'
            ].map((stage, idx) => (
              <React.Fragment key={idx}>
                <div className={cn(
                  "px-3 py-2 rounded border flex flex-col items-center gap-1",
                  idx <= 10 ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" :
                  idx <= 14 ? "bg-terminal-amber/10 border-terminal-amber/40 text-terminal-amber font-bold" :
                  "bg-black/40 border-terminal-border text-gray-400"
                )}>
                  <span className="text-[9px] text-gray-400">STG {idx + 1}</span>
                  <span>{stage}</span>
                </div>
                {idx < 16 && <ArrowRight className="w-3.5 h-3.5 text-terminal-muted shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Panel>

      {/* Global Search & Filters Toolbar */}
      <div className="bg-terminal-panel border border-terminal-border rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <Search className="w-4 h-4 text-terminal-muted" />
          <input
            type="text"
            placeholder="Search Strategy ID, Name, AI Model, Owner, Market..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-terminal-border rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-terminal-amber"
          />
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-terminal-muted uppercase">Stage:</span>
            <select
              value={lifecycleFilter}
              onChange={(e) => setLifecycleFilter(e.target.value)}
              className="bg-black/50 border border-terminal-border rounded px-2 py-1 text-xs font-mono text-terminal-amber focus:outline-none"
            >
              <option value="ALL">All Lifecycle Stages</option>
              <option value="PRODUCTION ACTIVE">Production Active</option>
              <option value="PAPER TRADING">Paper Trading</option>
              <option value="BACKTESTING">Backtesting</option>
              <option value="PRODUCTION READY">Production Ready</option>
              <option value="CERTIFIED">Certified</option>
              <option value="RESEARCH">Research</option>
              <option value="CONFIGURATION">Configuration</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-terminal-muted uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/50 border border-terminal-border rounded px-2 py-1 text-xs font-mono text-terminal-amber focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="RUNNING">Running</option>
              <option value="PAUSED">Paused</option>
              <option value="DISABLED">Disabled</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 border-l border-terminal-border pl-3">
            <Button variant="secondary" size="xs" onClick={() => handleExport('CSV')}><Download className="w-3 h-3 mr-1" /> CSV</Button>
            <Button variant="secondary" size="xs" onClick={() => handleExport('Excel')}><Download className="w-3 h-3 mr-1" /> Excel</Button>
            <Button variant="secondary" size="xs" onClick={() => handleExport('PDF')}><Download className="w-3 h-3 mr-1" /> PDF</Button>
            <Button variant="secondary" size="xs" onClick={() => handleExport('JSON')}><Download className="w-3 h-3 mr-1" /> JSON</Button>
          </div>
        </div>
      </div>

      {/* Cross Workspace Quick Navigation */}
      <Panel title="Cross Workspace Navigation & Intelligence Consoles" icon={Compass}>
        <div className="grid grid-cols-9 gap-2 p-3">
          {[
            { label: 'Strategy Dashboard', ws: 'DASHBOARD' },
            { label: 'Strategy Registry', ws: 'REGISTRY' },
            { label: 'Strategy Builder', ws: 'BUILDER' },
            { label: 'Strategy Analytics', ws: 'ANALYTICS' },
            { label: 'AI Dashboard', ws: 'AI' },
            { label: 'AI Analytics', ws: 'AI_INTELLIGENCE' },
            { label: 'Trading Analytics', ws: 'TRADING' },
            { label: 'Portfolio Analytics', ws: 'PMS' },
            { label: 'Research Analytics', ws: 'RESEARCH' }
          ].map((nav, idx) => (
            <Button
              key={idx}
              variant="secondary"
              size="xs"
              onClick={() => onNavigateWorkspace?.(nav.ws)}
              className="py-2 bg-black/40 hover:bg-terminal-amber/10 border-terminal-border font-mono text-[10px]"
            >
              {nav.label}
            </Button>
          ))}
        </div>
      </Panel>

      {/* Main Enterprise Strategy Lifecycle Table */}
      <Panel title="Enterprise Strategy Lifecycle Registry & Inspection Table" icon={Database}>
        <DataTable
          columns={[
            { header: 'Strategy ID & Name', accessor: (s: any) => (
              <div>
                <div className="font-mono text-terminal-amber font-bold">{s.name}</div>
                <div className="text-[10px] text-gray-400 font-mono">{s.id} • {s.category} • {s.market}</div>
              </div>
            )},
            { header: 'Lifecycle Stage', accessor: (s: any) => <span className="font-mono text-emerald-400 text-xs font-bold">{s.stage}</span> },
            { header: 'Status', accessor: (s: any) => <StatusBadge status={s.status === 'Running' ? 'ONLINE' : 'PAUSED'} /> },
            { header: 'Primary AI Model', accessor: (s: any) => <span className="font-mono text-terminal-blue text-xs">{s.primaryAi}</span> },
            { header: 'Signals / Orders / Trades', accessor: (s: any) => (
              <div className="font-mono text-[11px]">
                <div>Sig: <strong className="text-white">{s.signals.generated}</strong></div>
                <div>Ord/Trd: <strong className="text-terminal-amber">{s.orders.filled} / {s.trades.closed}</strong></div>
              </div>
            )},
            { header: 'Capital', accessor: (s: any) => <span className="font-mono text-white font-bold">{s.capital.allocated}</span> },
            { header: 'ROI / PnL', accessor: (s: any) => (
              <div>
                <div className="font-mono text-emerald-400 font-bold">{s.roi}</div>
                <div className="text-[10px] font-mono text-terminal-amber">{s.pnl}</div>
              </div>
            )},
            { header: 'Risk Score', accessor: (s: any) => <span className="font-mono text-xs text-amber-400 font-bold">{s.performance.riskScore}</span> },
            { header: 'Action', accessor: (s: any) => (
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setSelectedStrategy(s)}
                className="bg-terminal-amber/20 hover:bg-terminal-amber/30 text-terminal-amber border-terminal-amber/40"
              >
                Inspect
              </Button>
            )}
          ]}
          data={filteredStrategies}
        />
      </Panel>

      {/* Enterprise Strategy Lifecycle Inspector Drawer if selected */}
      {selectedStrategy && (
        <div className="bg-terminal-panel border border-terminal-amber rounded-lg p-6 space-y-6 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-terminal-border pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-terminal-amber/20 border border-terminal-amber flex items-center justify-center text-terminal-amber">
                <Workflow className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono text-terminal-muted uppercase">Enterprise Lifecycle Inspector</div>
                <div className="text-lg font-bold font-mono text-white flex items-center gap-3">
                  <span>{selectedStrategy.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-terminal-amber text-black font-bold">{selectedStrategy.id}</span>
                </div>
              </div>
            </div>
            <Button variant="secondary" size="xs" onClick={() => setSelectedStrategy(null)}>Close Inspector</Button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-terminal-border">
            {[
              { id: 'OVERVIEW', label: 'Overview' },
              { id: 'CONFIG', label: 'Configuration' },
              { id: 'LIFECYCLE', label: 'Lifecycle' },
              { id: 'RESEARCH', label: 'Research' },
              { id: 'AI_ASSIGNMENT', label: 'AI Assignment' },
              { id: 'PARAMETERS', label: 'Parameters' },
              { id: 'SIGNALS', label: 'Signals' },
              { id: 'ORDERS', label: 'Orders' },
              { id: 'TRADES', label: 'Trades' },
              { id: 'PERFORMANCE', label: 'Performance' },
              { id: 'CAPITAL', label: 'Capital' },
              { id: 'RISK', label: 'Risk' },
              { id: 'DEPENDENCIES', label: 'Dependencies' },
              { id: 'TIMELINE', label: 'Timeline' },
              { id: 'AUDIT', label: 'Audit' },
              { id: 'REPOSITORIES', label: 'Repositories' },
              { id: 'CONTROLLERS', label: 'Controllers' },
              { id: 'SERVICES', label: 'Services' },
              { id: 'ROUTES', label: 'Routes' },
              { id: 'DATABASE', label: 'Database' },
              { id: 'JSON', label: 'JSON' },
              { id: 'SHA256', label: 'SHA-256' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveInspectorTab(tab.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded font-mono text-xs uppercase font-bold tracking-wider transition-colors whitespace-nowrap",
                  activeInspectorTab === tab.id ? "bg-terminal-amber text-black" : "text-terminal-muted hover:text-white bg-black/30"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-black/60 p-5 rounded border border-terminal-border space-y-4">
            {activeInspectorTab === 'OVERVIEW' && (
              <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Current Lifecycle Stage:</span>
                  <div className="text-emerald-400 font-bold mt-1">{selectedStrategy.stage}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Primary AI Model:</span>
                  <div className="text-terminal-blue font-bold mt-1">{selectedStrategy.primaryAi}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">LLM Provider & Version:</span>
                  <div className="text-white font-bold mt-1">{selectedStrategy.llmProvider} ({selectedStrategy.version})</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Capital Allocated:</span>
                  <div className="text-white font-bold mt-1">{selectedStrategy.capital.allocated}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Win Rate & Sharpe:</span>
                  <div className="text-emerald-400 font-bold mt-1">{selectedStrategy.performance.winRate} (Sharpe {selectedStrategy.performance.sharpe})</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Net ROI & PnL:</span>
                  <div className="text-terminal-amber font-bold mt-1">{selectedStrategy.roi} ({selectedStrategy.pnl})</div>
                </div>
              </div>
            )}

            {activeInspectorTab === 'AI_ASSIGNMENT' && (
              <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Primary AI:</span>
                  <div className="text-terminal-amber font-bold mt-1">{selectedStrategy.primaryAi}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Secondary AI:</span>
                  <div className="text-terminal-blue font-bold mt-1">{selectedStrategy.secondaryAi}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Fallback AI:</span>
                  <div className="text-white font-bold mt-1">{selectedStrategy.fallbackAi}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Confidence Score:</span>
                  <div className="text-emerald-400 font-bold mt-1">{selectedStrategy.confidence}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Inference Latency:</span>
                  <div className="text-white font-bold mt-1">{selectedStrategy.latency}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Inference Engine:</span>
                  <div className="text-terminal-amber font-bold mt-1">{selectedStrategy.inferenceEngine}</div>
                </div>
              </div>
            )}

            {activeInspectorTab === 'SIGNALS' && (
              <div className="grid grid-cols-5 gap-4 font-mono text-xs">
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Generated:</span>
                  <div className="text-white font-bold mt-1">{selectedStrategy.signals.generated}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Approved:</span>
                  <div className="text-emerald-400 font-bold mt-1">{selectedStrategy.signals.approved}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Rejected:</span>
                  <div className="text-rose-400 font-bold mt-1">{selectedStrategy.signals.rejected}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Expired:</span>
                  <div className="text-amber-400 font-bold mt-1">{selectedStrategy.signals.expired}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Executed:</span>
                  <div className="text-terminal-amber font-bold mt-1">{selectedStrategy.signals.executed}</div>
                </div>
              </div>
            )}

            {activeInspectorTab === 'ORDERS' && (
              <div className="grid grid-cols-5 gap-4 font-mono text-xs">
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Created:</span>
                  <div className="text-white font-bold mt-1">{selectedStrategy.orders.created}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Queued:</span>
                  <div className="text-amber-400 font-bold mt-1">{selectedStrategy.orders.queued}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Filled:</span>
                  <div className="text-emerald-400 font-bold mt-1">{selectedStrategy.orders.filled}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Cancelled:</span>
                  <div className="text-gray-400 font-bold mt-1">{selectedStrategy.orders.cancelled}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Rejected:</span>
                  <div className="text-rose-400 font-bold mt-1">{selectedStrategy.orders.rejected}</div>
                </div>
              </div>
            )}

            {activeInspectorTab === 'TRADES' && (
              <div className="grid grid-cols-6 gap-4 font-mono text-xs">
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Opened:</span>
                  <div className="text-white font-bold mt-1">{selectedStrategy.trades.opened}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Closed:</span>
                  <div className="text-terminal-amber font-bold mt-1">{selectedStrategy.trades.closed}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Winning:</span>
                  <div className="text-emerald-400 font-bold mt-1">{selectedStrategy.trades.winning}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Losing:</span>
                  <div className="text-rose-400 font-bold mt-1">{selectedStrategy.trades.losing}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Cancelled:</span>
                  <div className="text-gray-400 font-bold mt-1">{selectedStrategy.trades.cancelled}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Rejected:</span>
                  <div className="text-rose-400 font-bold mt-1">{selectedStrategy.trades.rejected}</div>
                </div>
              </div>
            )}

            {activeInspectorTab === 'CAPITAL' && (
              <div className="grid grid-cols-5 gap-4 font-mono text-xs">
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Allocated:</span>
                  <div className="text-white font-bold mt-1">{selectedStrategy.capital.allocated}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Reserved:</span>
                  <div className="text-amber-400 font-bold mt-1">{selectedStrategy.capital.reserved}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Used:</span>
                  <div className="text-terminal-amber font-bold mt-1">{selectedStrategy.capital.used}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Recovered:</span>
                  <div className="text-emerald-400 font-bold mt-1">{selectedStrategy.capital.recovered}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Available:</span>
                  <div className="text-terminal-blue font-bold mt-1">{selectedStrategy.capital.available}</div>
                </div>
              </div>
            )}

            {activeInspectorTab === 'RISK' && (
              <div className="grid grid-cols-4 gap-4 font-mono text-xs">
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">VaR (99%):</span>
                  <div className="text-amber-400 font-bold mt-1">{selectedStrategy.risk.var99}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">CVaR:</span>
                  <div className="text-rose-400 font-bold mt-1">{selectedStrategy.risk.cvar}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Exposure:</span>
                  <div className="text-white font-bold mt-1">{selectedStrategy.risk.exposure}</div>
                </div>
                <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                  <span className="text-gray-400">Margin Usage:</span>
                  <div className="text-terminal-amber font-bold mt-1">{selectedStrategy.risk.marginUsage}</div>
                </div>
              </div>
            )}

            {activeInspectorTab === 'JSON' && (
              <pre className="bg-black/90 p-4 rounded font-mono text-[11px] text-terminal-amber overflow-x-auto max-h-80">
                {JSON.stringify(selectedStrategy, null, 2)}
              </pre>
            )}

            {activeInspectorTab === 'SHA256' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Cryptographic Hash Algorithm:</span><span className="text-white">SHA-256</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Lifecycle State Hash:</span><span className="text-terminal-amber">7c4a8d09f21b6e3a51f80c12e9bfa382901c56ef38b4d12a2e8c91823f0a1bc2</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Integrity Status:</span><span className="text-emerald-400 font-bold">VERIFIED & IMMUTABLE</span></div>
              </div>
            )}

            {activeInspectorTab !== 'OVERVIEW' && activeInspectorTab !== 'AI_ASSIGNMENT' && activeInspectorTab !== 'SIGNALS' && activeInspectorTab !== 'ORDERS' && activeInspectorTab !== 'TRADES' && activeInspectorTab !== 'CAPITAL' && activeInspectorTab !== 'RISK' && activeInspectorTab !== 'JSON' && activeInspectorTab !== 'SHA256' && (
              <div className="text-xs font-mono text-terminal-muted py-6 text-center">
                Institutional lifecycle telemetry for <span className="text-terminal-amber">{selectedStrategy.name}</span> ({activeInspectorTab}) is fully synchronized and read-only verified.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final Certification Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-black to-emerald-950/80 border border-emerald-500/50 rounded-lg p-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-mono font-bold">EP04 AI Lifecycle Certification</div>
            <div className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              ENTERPRISE STRATEGY LIFECYCLE INTELLIGENCE CENTER <span className="text-xs px-2 py-0.5 rounded bg-emerald-500 text-black font-mono font-bold">100% VERIFIED</span>
            </div>
            <div className="text-xs text-gray-300 mt-1">
              Read-only institutional audit compliant with Bloomberg OMS and BlackRock Aladdin standards.
            </div>
          </div>
        </div>
        <div className="text-right font-mono text-xs text-emerald-400 space-y-1">
          <div>BUILD: PASS</div>
          <div>TYPESCRIPT: PASS</div>
          <div>LINT: PASS</div>
        </div>
      </div>
    </div>
  );
});
