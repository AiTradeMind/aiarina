import React, { useState, useMemo } from 'react';
import { 
  Cpu,
  ShieldCheck,
  Target,
  FileText,
  CheckCircle2,
  Info,
  ChevronUp,
  ChevronDown,
  Terminal as TerminalIcon,
  Search,
  Layers,
  Radio,
  Zap,
  Globe,
  Database,
  ArrowRight,
  Activity,
  Layers3,
  Server,
  AlertCircle
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { SectionHeader, StatusBadge, GlobalSummaryItem } from './ui/Base';
import { BrokerCapabilityRegistry } from '../modules/trading/adapters/BrokerCapabilityRegistry';

export interface DashboardWorkspaceProps {
  events?: any[];
  portfolio?: any;
  balance?: any;
  trades?: any[];
  positions?: any[];
  orders?: any[];
  recommendations?: any[];
  models?: any[];
  analytics?: any;
  riskEvents?: any[];
  systemStatus?: any;
  notifications?: any[];
  onNavigate?: (workspaceId: string) => void;
}

export const DashboardWorkspace: React.FC<DashboardWorkspaceProps> = ({
  portfolio,
  balance,
  models = [],
  notifications = [],
  systemStatus
}) => {
  // Resolved dynamic broker capabilities
  const brokerCaps = useMemo(() => BrokerCapabilityRegistry.resolveCapabilities(), []);

  // Selected Inspector State (null by default = AI ARINA OS OVERVIEW)
  const [selectedInspectorItem, setSelectedInspectorItem] = useState<{
    id: string;
    title: string;
    status: string;
    description: string;
    details: { label: string; value: string }[];
  } | null>(null);

  const [terminalExpanded, setTerminalExpanded] = useState<boolean>(false);
  const [terminalFilter, setTerminalFilter] = useState<string>('ALL');

  // Derive metrics safely from real state
  const totalCapital = balance?.cashBalance;
  const todayPnL = balance?.dailyPnL;
  const hasModels = Array.isArray(models) && models.length > 0;
  const activeModelsCount = hasModels ? models.length : 0;

  // System status items
  const systemStatusItems = [
    { id: 'MARKET', name: 'MARKET DATA', status: 'ONLINE', variant: 'success' },
    { id: 'RESEARCH', name: 'RESEARCH', status: 'ACTIVE', variant: 'info' },
    { id: 'AI', name: 'AI INTELLIGENCE', status: 'ACTIVE', variant: 'info' },
    { id: 'STRATEGY', name: 'STRATEGY', status: 'ACTIVE', variant: 'info' },
    { id: 'PAPER', name: 'PAPER TRADING', status: 'READY', variant: 'success' },
    { id: 'MEMORY', name: 'AI MEMORY', status: 'ACTIVE', variant: 'info' }
  ];

  // Core ARINA Workflow steps (purely visual presentation, non-clickable)
  const workflowSteps = [
    { step: '01', name: 'MARKET DATA', desc: 'NSE/BSE L1/L2 Ingestion' },
    { step: '02', name: 'RESEARCH', desc: 'Corporate Filings & NLP' },
    { step: '03', name: 'AI INTELLIGENCE', desc: 'Multi-Agent Consensus' },
    { step: '04', name: 'STRATEGY', desc: 'Rule & Signal Evaluation' },
    { step: '05', name: 'PAPER TRADING', desc: 'Isolated Lab Replay' },
    { step: '06', name: 'ANALYTICS', desc: 'Performance & Risk Matrix' },
    { step: '07', name: 'AI MEMORY', desc: 'Knowledge Graph Persistence' }
  ];

  // Enterprise logs stream
  const enterpriseLogs = [
    { id: 'log-1', timestamp: '09:15:00', category: 'SYSTEM', message: 'AI ARINA OS Enterprise Kernel online. Market: INDIA V1 (INR ₹).' },
    { id: 'log-2', timestamp: '09:15:02', category: 'MARKET', message: 'Indian Market data feed connected (NSE / BSE).' },
    { id: 'log-3', timestamp: '09:15:05', category: 'AI', message: `Enterprise AI Registry: ${activeModelsCount > 0 ? `${activeModelsCount} active models loaded.` : 'No models registered in ENTERPRISE_AI_MODELS_REGISTRY.'}` },
    { id: 'log-4', timestamp: '09:15:10', category: 'PAPER', message: 'Paper Trading Labs (Stock, ETF, Commodity) initialized in virtual mode.' },
    { id: 'log-5', timestamp: '09:15:15', category: 'MEMORY', message: 'AI Vector Memory graph synchronized.' }
  ];

  const filteredLogs = terminalFilter === 'ALL' ? enterpriseLogs : enterpriseLogs.filter(l => l.category === terminalFilter);

  return (
    <div className="flex flex-col h-full w-full bg-[#060810] text-slate-200 overflow-hidden select-none relative font-sans">
      
      {/* 1. TOP SYSTEM TELEMETRY STRIP */}
      <div className="bg-[#080b12] border-b border-[#1e293b] px-4 py-1.5 shrink-0 overflow-x-auto no-scrollbar flex items-center justify-between">
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 pr-3 border-r border-[#1e293b]">
            <Radio className="w-3.5 h-3.5 text-terminal-green animate-pulse" />
            <span className="font-mono text-[10px] font-black tracking-wider text-white uppercase">AI ARINA OS TELEMETRY</span>
          </div>

          <GlobalSummaryItem label="OS Status" value="ONLINE" color="text-terminal-green font-bold" />
          <GlobalSummaryItem label="Market Scope" value="INDIAN MARKET — V1" color="text-terminal-amber font-bold" />
          <GlobalSummaryItem label="Currency" value="INR (₹)" color="text-white font-bold" />
          <GlobalSummaryItem label="Active AI Models" value={hasModels ? `${activeModelsCount} Registered` : 'NO CURRENT AI MODEL'} color={hasModels ? "text-terminal-blue font-bold" : "text-slate-400"} />
          <GlobalSummaryItem label="Total Capital" value={totalCapital !== undefined ? formatCurrency(totalCapital, 0) : 'NO CURRENT DATA'} color="text-terminal-amber font-bold" />
          <GlobalSummaryItem label="Today's PnL" value={todayPnL !== undefined ? formatCurrency(todayPnL, 0) : 'NO CURRENT DATA'} color={todayPnL && todayPnL >= 0 ? "text-terminal-green font-bold" : "text-slate-400"} />
          <GlobalSummaryItem label="Alerts" value={`${notifications.length} Active`} color="text-terminal-amber font-bold" />
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0 pl-4 border-l border-[#1e293b]">
          <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
          <span>Asia/Kolkata (IST)</span>
        </div>
      </div>

      {/* 2. PRIMARY AI ARINA OS HEADER & PURPOSE */}
      <div className="bg-[#080b12] border-b border-[#1e293b] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-terminal-amber/10 border border-terminal-amber/30 text-terminal-amber rounded-sm shrink-0 mt-0.5">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
              <span className="text-terminal-amber font-bold">ENTERPRISE AI OPERATING SYSTEM</span>
              <span>/</span>
              <span className="text-white font-bold">INDIAN MARKET — V1 (INR ₹)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wider uppercase flex items-center gap-3">
              <span>AI ARINA OS</span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-terminal-amber/15 text-terminal-amber border border-terminal-amber/40 rounded-sm uppercase tracking-normal">
                ENTERPRISE AI OPERATING SYSTEM
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-1.5 max-w-3xl leading-relaxed font-sans">
              AI-powered research, intelligence, strategy evaluation and paper-trading decision platform for Indian markets.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 font-mono text-xs shrink-0 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#060810] border border-[#1e293b] rounded-sm text-[10px]">
            <Globe className="w-3.5 h-3.5 text-terminal-amber" />
            <span className="text-slate-400">MARKET SCOPE:</span>
            <span className="text-white font-bold">INDIA ONLY (V1)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#060810] border border-[#1e293b] rounded-sm text-[10px]">
            <span className="text-slate-400">BASE CURRENCY:</span>
            <span className="text-terminal-amber font-bold">INR (₹ — Rupee)</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* LEFT / CENTER: WORKFLOW & OVERVIEW MODULES */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#060810]">
          
          {/* 3. ARINA CORE WORKFLOW (VISUAL ONLY, NON-CLICKABLE) */}
          <div className="bg-[#0b0f19] border border-[#1e293b] p-4 rounded-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
              <div className="flex items-center gap-2">
                <Layers3 className="w-4 h-4 text-terminal-amber" />
                <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">ARINA CORE WORKFLOW</h2>
              </div>
              <span className="text-[9px] font-mono text-slate-400">System Processing Pipeline (Conceptual Flow — Non-Navigational)</span>
            </div>

            {/* VISUAL WORKFLOW PIPELINE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
              {workflowSteps.map((step, idx) => (
                <div key={step.step} className="flex items-center gap-2">
                  <div className="flex-1 bg-[#060810] border border-[#1e293b] p-2.5 rounded-sm relative">
                    <div className="text-[9px] font-mono text-terminal-amber font-bold mb-0.5">STEP {step.step}</div>
                    <div className="text-xs font-mono font-bold text-white uppercase tracking-tight truncate">{step.name}</div>
                    <div className="text-[9px] text-slate-400 mt-1 line-clamp-1">{step.desc}</div>
                  </div>
                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block text-slate-600 font-mono text-xs font-bold">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. OVERVIEW GRID (SYSTEM STATUS, INDIAN MARKET V1, AI RUNTIME, PAPER TRADING) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* SYSTEM STATUS CARD */}
            <div 
              onClick={() => setSelectedInspectorItem({
                id: 'SYS_STATUS',
                title: 'SYSTEM STATUS',
                status: 'ONLINE',
                description: 'Overall operating state of all core AI ARINA OS processing modules.',
                details: systemStatusItems.map(s => ({ label: s.name, value: s.status }))
              })}
              className="bg-[#0b0f19] border border-[#1e293b] hover:border-slate-500 p-4 rounded-sm transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-terminal-green" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">SYSTEM STATUS</h3>
                </div>
                <span className="text-[9px] font-mono text-terminal-green font-bold">OPERATIONAL</span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {systemStatusItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-[#060810] border border-[#1e293b] rounded-sm">
                    <span className="text-slate-400 text-[10px] font-bold">{item.name}</span>
                    <StatusBadge status={item.status} variant={item.variant as any} />
                  </div>
                ))}
              </div>
            </div>

            {/* INDIAN MARKET V1 CARD */}
            <div 
              onClick={() => setSelectedInspectorItem({
                id: 'INDIAN_MARKET_V1',
                title: 'INDIAN MARKET — V1 SCOPE',
                status: 'ACTIVE',
                description: 'Canonical V1 architecture configured exclusively for Indian exchange segments and INR currency.',
                details: [
                  { label: 'Primary Equity Exchanges', value: 'NSE / BSE' },
                  { label: 'ETF Segments', value: 'Indian Equity & Debt ETFs' },
                  { label: 'Commodity Exchanges', value: brokerCaps.commodityExchangeLabel },
                  { label: 'Base Currency', value: 'INR (₹ — Indian Rupee)' },
                  { label: 'System Timezone', value: 'Asia/Kolkata (IST)' }
                ]
              })}
              className="bg-[#0b0f19] border border-[#1e293b] hover:border-slate-500 p-4 rounded-sm transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-terminal-amber" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">INDIAN MARKET — V1</h3>
                </div>
                <span className="text-[9px] font-mono text-terminal-amber font-bold">INR ₹</span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center p-1.5 bg-[#060810] border border-[#1e293b] rounded-sm">
                  <span className="text-slate-400 text-[10px]">Equity & Derivatives</span>
                  <span className="text-white font-bold text-[10px]">NSE / BSE</span>
                </div>
                <div className="flex justify-between items-center p-1.5 bg-[#060810] border border-[#1e293b] rounded-sm">
                  <span className="text-slate-400 text-[10px]">ETF Segments</span>
                  <span className="text-white font-bold text-[10px]">Supported Indian ETFs</span>
                </div>
                <div className="flex justify-between items-center p-1.5 bg-[#060810] border border-[#1e293b] rounded-sm">
                  <span className="text-slate-400 text-[10px]">Commodity Exchanges</span>
                  <span className="text-terminal-amber font-bold text-[10px]">{brokerCaps.commodityExchangeLabel}</span>
                </div>
                <div className="flex justify-between items-center p-1.5 bg-[#060810] border border-[#1e293b] rounded-sm">
                  <span className="text-slate-400 text-[10px]">Reporting Currency</span>
                  <span className="text-terminal-green font-bold text-[10px]">INR (₹)</span>
                </div>
              </div>
            </div>

            {/* AI RUNTIME CARD */}
            <div 
              onClick={() => setSelectedInspectorItem({
                id: 'AI_RUNTIME',
                title: 'AI RUNTIME STATUS',
                status: hasModels ? 'ACTIVE' : 'NO CURRENT AI MODEL',
                description: 'Registered AI reasoning models in ENTERPRISE_AI_MODELS_REGISTRY.',
                details: hasModels 
                  ? models.map((m: any, idx: number) => ({ label: m.name || `Model ${idx+1}`, value: m.provider || 'Gemini AI' }))
                  : [{ label: 'Registry State', value: 'NO CURRENT AI MODEL' }]
              })}
              className="bg-[#0b0f19] border border-[#1e293b] hover:border-slate-500 p-4 rounded-sm transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-terminal-blue" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">AI RUNTIME</h3>
                </div>
                <span className="text-[9px] font-mono text-terminal-blue font-bold">
                  {hasModels ? `${activeModelsCount} MODELS` : 'NO CURRENT AI MODEL'}
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center p-1.5 bg-[#060810] border border-[#1e293b] rounded-sm">
                  <span className="text-slate-400 text-[10px]">Active Models Count</span>
                  <span className="text-white font-bold text-[10px]">{hasModels ? activeModelsCount : 'NO CURRENT AI MODEL'}</span>
                </div>
                <div className="flex justify-between items-center p-1.5 bg-[#060810] border border-[#1e293b] rounded-sm">
                  <span className="text-slate-400 text-[10px]">Registry Identifier</span>
                  <span className="text-terminal-amber font-bold text-[10px]">ENTERPRISE_AI_MODELS_REGISTRY</span>
                </div>
                <div className="flex justify-between items-center p-1.5 bg-[#060810] border border-[#1e293b] rounded-sm">
                  <span className="text-slate-400 text-[10px]">Inference Status</span>
                  <span className={hasModels ? "text-terminal-green font-bold text-[10px]" : "text-slate-400 font-bold text-[10px]"}>
                    {hasModels ? 'ACTIVE' : 'READY / OFF'}
                  </span>
                </div>
              </div>
            </div>

            {/* PAPER TRADING SUMMARY CARD */}
            <div 
              onClick={() => setSelectedInspectorItem({
                id: 'PAPER_SUMMARY',
                title: 'PAPER TRADING SUMMARY',
                status: 'READY',
                description: 'Virtual isolated simulation sandboxes for Indian stock, ETF, and commodity testing.',
                details: [
                  { label: 'LAB 01 — STOCK', value: 'READY' },
                  { label: 'LAB 02 — ETF', value: 'READY' },
                  { label: 'LAB 03 — COMMODITY', value: brokerCaps.hasCommoditySupport ? 'READY' : 'NOT CONFIGURED' },
                  { label: 'Virtual Currency', value: 'INR (₹)' }
                ]
              })}
              className="bg-[#0b0f19] border border-[#1e293b] hover:border-slate-500 p-4 rounded-sm transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-terminal-green" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">PAPER TRADING SUMMARY</h3>
                </div>
                <span className="text-[9px] font-mono text-terminal-green font-bold">READY</span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center p-1.5 bg-[#060810] border border-[#1e293b] rounded-sm">
                  <span className="text-slate-400 text-[10px]">LAB 01 — STOCK</span>
                  <span className="text-terminal-green font-bold text-[10px]">READY</span>
                </div>
                <div className="flex justify-between items-center p-1.5 bg-[#060810] border border-[#1e293b] rounded-sm">
                  <span className="text-slate-400 text-[10px]">LAB 02 — ETF</span>
                  <span className="text-terminal-green font-bold text-[10px]">READY</span>
                </div>
                <div className="flex justify-between items-center p-1.5 bg-[#060810] border border-[#1e293b] rounded-sm">
                  <span className="text-slate-400 text-[10px]">LAB 03 — COMMODITY</span>
                  <span className={brokerCaps.hasCommoditySupport ? "text-terminal-green font-bold text-[10px]" : "text-slate-400 font-bold text-[10px]"}>
                    {brokerCaps.hasCommoditySupport ? 'READY' : 'NOT CONFIGURED'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: ENTERPRISE INSPECTOR */}
        <div className="w-full lg:w-80 border-l border-[#1e293b] bg-[#0b0f19] flex flex-col shrink-0 overflow-y-auto">
          <SectionHeader title="Enterprise Inspector" icon={Search} />

          <div className="p-4 space-y-4 font-mono text-xs">
            {selectedInspectorItem === null ? (
              /* DEFAULT STATE: AI ARINA OS OVERVIEW */
              <>
                <div className="p-3 bg-[#060810] border border-[#1e293b] space-y-2 rounded-sm">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                    <span>SYSTEM OVERVIEW</span>
                    <span className="text-terminal-amber">AI ARINA OS</span>
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-terminal-amber" />
                    AI ARINA OS OVERVIEW
                  </h3>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                    System overview monitoring 10 core subsystems, market connectivity, AI reasoning pipelines, and paper execution sandboxes.
                  </p>
                </div>

                {/* HIGH-LEVEL OS HEALTH MATRIX */}
                <div className="space-y-1.5">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI ARINA OS HEALTH</div>
                  
                  <div className="flex justify-between items-center p-2 bg-[#060810] border border-[#1e293b] rounded-sm">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">OS STATUS</span>
                    <span className="font-bold text-terminal-green flex items-center gap-1 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
                      ONLINE
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-[#060810] border border-[#1e293b] rounded-sm">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">DATABASE</span>
                    <span className="font-bold text-terminal-blue text-[10px]">CONNECTED</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-[#060810] border border-[#1e293b] rounded-sm">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">MARKET CONNECTION</span>
                    <span className="font-bold text-terminal-amber text-[10px]">READY (NSE/BSE)</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-[#060810] border border-[#1e293b] rounded-sm">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">AI RUNTIME</span>
                    <span className="font-bold text-white text-[10px]">
                      {hasModels ? `${activeModelsCount} Models Active` : 'NO CURRENT AI MODEL'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-[#060810] border border-[#1e293b] rounded-sm">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">RESEARCH</span>
                    <span className="font-bold text-terminal-green text-[10px]">ACTIVE</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-[#060810] border border-[#1e293b] rounded-sm">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">STRATEGY</span>
                    <span className="font-bold text-terminal-green text-[10px]">ACTIVE</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-[#060810] border border-[#1e293b] rounded-sm">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">PAPER TRADING</span>
                    <span className="font-bold text-terminal-green text-[10px]">READY</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-[#060810] border border-[#1e293b] rounded-sm">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">AI MEMORY</span>
                    <span className="font-bold text-terminal-blue text-[10px]">ACTIVE</span>
                  </div>

                  <div className="flex justify-between items-center p-2 bg-[#060810] border border-[#1e293b] rounded-sm">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">ALERTS</span>
                    <span className="font-bold text-terminal-amber text-[10px]">{notifications.length}</span>
                  </div>
                </div>

                <div className="p-3 bg-terminal-amber/10 border border-terminal-amber/30 rounded-sm space-y-1.5">
                  <span className="text-[9px] font-bold text-terminal-amber uppercase block tracking-wider">Operational Status</span>
                  <p className="text-[10px] text-slate-200 leading-relaxed font-sans">
                    AI ARINA OS V1 operating in nominal state for Indian Markets (INR ₹). All core pipelines running with clean telemetry.
                  </p>
                </div>
              </>
            ) : (
              /* SELECTED SUBSYSTEM INSPECTOR STATE */
              <>
                <button
                  onClick={() => setSelectedInspectorItem(null)}
                  className="w-full py-1.5 px-2 bg-[#060810] hover:bg-white/5 border border-[#1e293b] text-terminal-amber text-[10px] font-mono font-bold flex items-center justify-between rounded-sm transition-colors cursor-pointer"
                >
                  <span>← Return to OS Overview</span>
                </button>

                <div className="p-3 bg-[#060810] border border-[#1e293b] space-y-2 rounded-sm">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                    <span>SUBSYSTEM INSPECTION</span>
                    <span className="text-terminal-amber">{selectedInspectorItem.id}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {selectedInspectorItem.title}
                  </h3>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                    {selectedInspectorItem.description}
                  </p>
                </div>

                <div className="space-y-1.5 font-mono">
                  {selectedInspectorItem.details.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-[#060810] border border-[#1e293b] rounded-sm text-[10px]">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* 5. BOTTOM LOG TERMINAL */}
      <div className="border-t border-[#1e293b] bg-[#05070c] shrink-0 flex flex-col transition-all">
        <div className="h-8 px-3 border-b border-[#1e293b] flex items-center justify-between text-xs font-mono bg-[#0b0f19]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTerminalExpanded(!terminalExpanded)}
              className="p-1 hover:text-terminal-amber text-slate-400 cursor-pointer"
            >
              {terminalExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <TerminalIcon className="w-3.5 h-3.5 text-terminal-amber" />
            <span className="font-bold text-white uppercase text-[10px] tracking-wider">Enterprise Log Terminal</span>
          </div>

          <div className="flex items-center gap-1">
            {['ALL', 'SYSTEM', 'MARKET', 'AI', 'PAPER', 'MEMORY'].map(filter => (
              <button
                key={filter}
                onClick={() => {
                  setTerminalFilter(filter);
                  if (!terminalExpanded) setTerminalExpanded(true);
                }}
                className={cn(
                  "px-2 py-0.5 text-[9px] font-mono border rounded-sm transition-colors cursor-pointer uppercase font-bold",
                  terminalFilter === filter
                    ? "bg-terminal-amber text-black border-terminal-amber"
                    : "border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-500"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {terminalExpanded && (
          <div className="h-36 p-3 overflow-y-auto font-mono text-[10px] space-y-1.5 bg-[#05070c]">
            {filteredLogs.map(log => (
              <div key={log.id} className="flex items-start gap-2 text-slate-300">
                <span className="text-slate-500 font-semibold">{log.timestamp}</span>
                <span className="text-terminal-amber font-bold">[{log.category}]</span>
                <span className="text-slate-200">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
