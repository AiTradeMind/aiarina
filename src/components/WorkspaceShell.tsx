import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Bell,
  Settings,
  LucideIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { GlobalSummaryItem, GlobalFooter } from './ui/Base';

export type WorkspaceType = string;

interface NavItem {
  id: WorkspaceType;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

interface WorkspaceShellProps {
  activeWorkspace: WorkspaceType;
  onWorkspaceChange: (id: WorkspaceType) => void;
  children: React.ReactNode;
  navItems: NavItem[];
  systemStatus: any;
  portfolio: any;
  balance: any;
  notificationsCount: number;
}

export const WORKSPACE_CATEGORY_MAP: Record<string, string> = {
  HOME: 'CORE',
  DASHBOARD: 'CORE',
  NOTIFICATIONS: 'CORE',
  MARKET: 'CORE',
  INDIAN_MARKET: 'CORE',
  TRADING: 'CORE',
  PAPER_TRADING: 'CORE',
  OMS: 'CORE',
  PMS: 'CORE',
  RMS: 'CORE',
  PAPER_EXECUTION: 'CORE',
  TRADE_JOURNAL: 'CORE',
  EXECUTION: 'CORE',
  AI: 'QUANT & AI',
  AI_INTELLIGENCE: 'QUANT & AI',
  AI_MEMORY: 'QUANT & AI',
  LIFECYCLE: 'QUANT & AI',
  AI_ACTIVATION: 'QUANT & AI',
  RESEARCH: 'QUANT & AI',
  ANALYTICS: 'QUANT & AI',
  STRATEGY: 'QUANT & AI',
  AI_GOVERNANCE: 'QUANT & AI',
  AI_EXPLAINABILITY: 'QUANT & AI',
  CONSTITUTION: 'QUANT & AI',
  COMMITTEE: 'QUANT & AI',
  FUND_MANAGER: 'TREASURY & FUND',
  FINANCE: 'TREASURY & FUND',
  ACCOUNTING: 'TREASURY & FUND',
  TREASURY: 'TREASURY & FUND',
  ADMINISTRATION: 'OPERATIONS & COMPLIANCE',
  OPERATIONS: 'OPERATIONS & COMPLIANCE',
  REPORTING: 'OPERATIONS & COMPLIANCE',
  COMPLIANCE: 'OPERATIONS & COMPLIANCE',
  SECURITY: 'OPERATIONS & COMPLIANCE',
  GENESIS: 'OPERATIONS & COMPLIANCE',
  LEADERBOARD: 'OPERATIONS & COMPLIANCE',
  CONTROL_PLANE: 'SYSTEM & INFRASTRUCTURE',
  OBSERVABILITY: 'SYSTEM & INFRASTRUCTURE',
  BACKUP: 'SYSTEM & INFRASTRUCTURE',
  SCHEDULER: 'SYSTEM & INFRASTRUCTURE',
  GATEWAY: 'SYSTEM & INFRASTRUCTURE',
  RELEASES: 'SYSTEM & INFRASTRUCTURE',
  CERTIFICATION: 'SYSTEM & INFRASTRUCTURE',
  QA: 'SYSTEM & INFRASTRUCTURE',
  INTEGRATION: 'SYSTEM & INFRASTRUCTURE',
  SETTINGS: 'SYSTEM & INFRASTRUCTURE'
};

export const WorkspaceShell = ({
  activeWorkspace,
  onWorkspaceChange,
  children,
  navItems,
  systemStatus,
  portfolio,
  balance,
  notificationsCount
}: WorkspaceShellProps) => {
  const [searchFilter, setSearchFilter] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aaos_sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aaos_sidebar_collapsed', JSON.stringify(isCollapsed));
    } catch {}
  }, [isCollapsed]);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus workspace search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isCollapsed) setIsCollapsed(false);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed]);

  const filteredNavItems = navItems.filter((item) => 
    !searchFilter.trim() || 
    item.label.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
    item.id.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  const currentCategory = WORKSPACE_CATEGORY_MAP[activeWorkspace] || 'WORKSPACE';

  return (
    <div className="flex h-screen w-full bg-terminal-bg text-white overflow-hidden font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={cn(
          "border-r border-terminal-border flex flex-col py-4 gap-4 bg-black shrink-0 transition-all duration-300 relative z-20",
          isCollapsed ? "w-[72px]" : "w-[280px]"
        )}
      >
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-terminal-amber/10 rounded-sm shrink-0">
              <Terminal className="w-5 h-5 text-terminal-amber" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-black uppercase tracking-widest text-white">AI ARINA</span>
                <span className="text-[9px] font-mono text-terminal-muted uppercase">Enterprise OS v3.2</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-terminal-muted hover:text-white rounded hover:bg-white/5 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <div className="px-3">
          <div className="h-px bg-terminal-border w-full" />
        </div>

        {!isCollapsed && (
          <div className="px-3">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-terminal-muted absolute left-2.5 pointer-events-none" />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Search Workspaces... (Ctrl+K)"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-terminal-panel border border-terminal-border/60 rounded-sm pl-8 pr-7 py-1.5 text-[10px] text-white placeholder-terminal-muted font-mono focus:outline-none focus:border-terminal-amber focus-visible:ring-1 focus-visible:ring-terminal-amber transition-colors"
                aria-label="Filter workspaces"
              />
              {searchFilter && (
                <button 
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2 text-terminal-muted hover:text-white p-0.5"
                  aria-label="Clear filter"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        <div 
          className="flex flex-col gap-1.5 flex-1 overflow-y-auto overflow-x-hidden px-3 scrollbar-hide" 
          role="tablist" 
          aria-label="Main Navigation"
        >
          {filteredNavItems.length === 0 ? (
            <div className="text-[10px] text-terminal-muted italic px-2 py-4 text-center">
              No matching workspaces
            </div>
          ) : (
            filteredNavItems.map((item) => {
              const isActive = activeWorkspace === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${item.id.toLowerCase()}-workspace`}
                  disabled={item.disabled}
                  onClick={() => onWorkspaceChange(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-sm transition-all relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-terminal-amber",
                    isActive ? "bg-terminal-amber text-black font-bold shadow-md" : "text-terminal-muted hover:text-white hover:bg-white/5",
                    item.disabled && "opacity-30 cursor-not-allowed"
                  )}
                  title={isCollapsed ? item.label : undefined}
                  aria-label={item.label}
                >
                  <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-black" : "text-terminal-amber")} />
                  {!isCollapsed && (
                    <span className="text-[11px] uppercase font-bold tracking-wider truncate">
                      {item.label}
                    </span>
                  )}
                  {/* Tooltip when collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-terminal-panel border border-terminal-border text-[10px] uppercase font-bold tracking-widest text-white invisible group-hover:visible z-50 whitespace-nowrap shadow-xl">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <div className="h-10 border-b border-terminal-border flex items-center justify-between px-4 bg-terminal-bg shrink-0">
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-terminal-muted">
            <span>AI ARINA OS</span>
            <span>/</span>
            <span className="text-terminal-amber font-mono">{currentCategory}</span>
            <span>/</span>
            <span className="text-white font-mono">{activeWorkspace}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-terminal-muted">
            <button
              onClick={() => onWorkspaceChange('NOTIFICATIONS')}
              className="hover:text-terminal-amber flex items-center gap-1.5 transition-colors"
              title="View Notifications"
            >
              <Bell className="w-3.5 h-3.5 text-terminal-amber" />
              <span>ALERTS: {notificationsCount}</span>
            </button>
            <span className="hidden sm:inline">SECURE-ENTERPRISE-GATEWAY</span>
            <span className="text-terminal-green">● ONLINE</span>
          </div>
        </div>

        {/* CONTEXT-SPECIFIC WORKSPACE TOP HEADER STRIP */}
        <div className="h-10 border-b border-[#1e293b] bg-[#0b0f19] flex items-center shrink-0 overflow-x-auto no-scrollbar px-2">
          {activeWorkspace === 'DASHBOARD' ? (
            <>
              <GlobalSummaryItem 
                label="Capital" 
                value={formatCurrency(balance?.cashBalance || 1000000, 0)} 
                color="text-terminal-amber font-bold"
              />
              <GlobalSummaryItem 
                label="Cash" 
                value={formatCurrency(balance?.cashBalance || 1000000, 0)} 
                color="text-white font-bold"
              />
              <GlobalSummaryItem 
                label="Buying Power" 
                value={formatCurrency(balance?.buyingPower || 420000, 0)} 
                color="text-white font-bold"
              />
              <GlobalSummaryItem 
                label="Margin" 
                value="$0" 
                color="text-slate-400 font-bold"
              />
              <GlobalSummaryItem 
                label="Realized P&L" 
                value={formatCurrency(portfolio?.realizedPnl || 0, 0)}
                color={(portfolio?.realizedPnl || 0) >= 0 ? 'text-terminal-green font-bold' : 'text-terminal-red font-bold'}
              />
              <GlobalSummaryItem 
                label="Unrealized P&L" 
                value={formatCurrency(portfolio?.unrealizedPnl || 0, 0)}
                color={(portfolio?.unrealizedPnl || 0) >= 0 ? 'text-terminal-green font-bold' : 'text-terminal-red font-bold'}
              />
              <GlobalSummaryItem 
                label="AI Cost" 
                value="$1.24" 
                color="text-terminal-blue font-bold"
              />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Market Status:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-green uppercase">● Open (NSE)</span>
              </div>
            </>
          ) : activeWorkspace === 'RESEARCH' ? (
            <>
              <GlobalSummaryItem label="Research Status" value="CRAWLING" color="text-terminal-blue font-bold" />
              <GlobalSummaryItem label="Documents" value="1,420 Parsed" color="text-white font-bold" />
              <GlobalSummaryItem label="Knowledge Sync" value="99.8% Synced" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="News Queue" value="3 Filings Pending" color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="SEC Edgar Feed" value="ACTIVE" color="text-terminal-green font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">NLP Parser:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-blue uppercase">Gemini 1.5 Pro</span>
              </div>
            </>
          ) : activeWorkspace === 'TRADING' ? (
            <>
              <GlobalSummaryItem label="Buying Power" value={formatCurrency(balance?.buyingPower || 420000, 0)} color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="Margin" value="$0 Used" color="text-slate-400 font-bold" />
              <GlobalSummaryItem label="Active Orders" value="3 Executing" color="text-terminal-blue font-bold" />
              <GlobalSummaryItem label="Positions" value="4 Open" color="text-white font-bold" />
              <GlobalSummaryItem label="Broker Latency" value="12ms FIX" color="text-terminal-green font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Routing Mode:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-green uppercase">SMART-ORDER-ROUTER</span>
              </div>
            </>
          ) : activeWorkspace === 'PAPER_TRADING' ? (
            <>
              <GlobalSummaryItem label="Paper Capital" value="$1,000,000" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Simulation Mode" value="TICK-REPLAY" color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="Paper PnL" value="+$18,450 (+1.8%)" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Virtual Ledger" value="SYNCED" color="text-terminal-blue font-bold" />
              <GlobalSummaryItem label="Labs Benchmark" value="72.4% Win Rate" color="text-white font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Risk Factor:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-green uppercase">ZERO RISK (SANDBOX)</span>
              </div>
            </>
          ) : activeWorkspace === 'ACCOUNTING' ? (
            <>
              <GlobalSummaryItem label="General Ledger" value="DOUBLE-ENTRY" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Cash Flow" value="+$45,200/mo" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="NAV" value="$1,018,450" color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="Tax Reserves" value="$12,300 (Q3)" color="text-white font-bold" />
              <GlobalSummaryItem label="Audit Status" value="100% RECONCILED" color="text-terminal-blue font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Compliance:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-green uppercase">IFRS / GAAP OK</span>
              </div>
            </>
          ) : activeWorkspace === 'AI' ? (
            <>
              <GlobalSummaryItem label="Quant Models" value="28 Active" color="text-terminal-blue font-bold" />
              <GlobalSummaryItem label="Learning Epoch" value="Gen 14 (Epoch 4/10)" color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="Knowledge Memory" value="1.2M Vectors" color="text-white font-bold" />
              <GlobalSummaryItem label="Consensus Rate" value="94.2% Agreement" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Evolution Lineage" value="STABLE" color="text-terminal-purple font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">AI Engine:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-blue uppercase">Arina Multi-Agent</span>
              </div>
            </>
          ) : activeWorkspace === 'MARKET' ? (
            <>
              <GlobalSummaryItem label="Market Status" value="OPEN (NSE/BSE)" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Feed Latency" value="6ms Direct" color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="Exchange Pipes" value="3 Connected" color="text-terminal-blue font-bold" />
              <GlobalSummaryItem label="Order Book Depth" value="L1/L2 Active" color="text-white font-bold" />
              <GlobalSummaryItem label="Volatility Index" value="14.2 (VIX Normal)" color="text-terminal-green font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Data Provider:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-amber uppercase">NSE/BSE DIRECT</span>
              </div>
            </>
          ) : activeWorkspace === 'STRATEGY' ? (
            <>
              <GlobalSummaryItem label="Active Algorithms" value="12 Running" color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="Strategy Capital" value="$580,000 Allocated" color="text-white font-bold" />
              <GlobalSummaryItem label="Sharpe Ratio" value="2.84 Avg" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Max Drawdown" value="0.14% (Cap 2.0%)" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Deploy Status" value="12/12 Live" color="text-terminal-blue font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Governor:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-green uppercase">STRICT RISK ENFORCED</span>
              </div>
            </>
          ) : activeWorkspace === 'ANALYTICS' ? (
            <>
              <GlobalSummaryItem label="Portfolio Beta" value="0.62" color="text-terminal-blue font-bold" />
              <GlobalSummaryItem label="Alpha Generation" value="+4.8%" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Sharpe Ratio" value="2.84" color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="Value at Risk (VaR)" value="1.12% ($11.4k)" color="text-white font-bold" />
              <GlobalSummaryItem label="Risk Score" value="LOW (14/100)" color="text-terminal-green font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Model:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-purple uppercase">MONTE CARLO 10k</span>
              </div>
            </>
          ) : activeWorkspace === 'FUND_MANAGER' ? (
            <>
              <GlobalSummaryItem label="Total AUM" value="$1,000,000" color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="Liquidity Reserve" value="15.0% ($150,000)" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Allocated Capital" value="85.0% ($850,000)" color="text-white font-bold" />
              <GlobalSummaryItem label="Treasury Lock" value="ACTIVE" color="text-terminal-blue font-bold" />
              <GlobalSummaryItem label="Fund Health" value="100% STABLE" color="text-terminal-green font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Treasury:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-amber uppercase">MULTI-SIG LOCK</span>
              </div>
            </>
          ) : activeWorkspace === 'LIFECYCLE' ? (
            <>
              <GlobalSummaryItem label="Model Lineage" value="Generation 14" color="text-terminal-purple font-bold" />
              <GlobalSummaryItem label="Training Epoch" value="4 / 10" color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="Loss Delta" value="-0.012 (Improving)" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Mutations" value="12 Candidates" color="text-white font-bold" />
              <GlobalSummaryItem label="Auto-Tuning" value="ACTIVE" color="text-terminal-blue font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Trainer:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-purple uppercase">PYTORCH VECTOR ENGINE</span>
              </div>
            </>
          ) : activeWorkspace === 'CONTROL_PLANE' ? (
            <>
              <GlobalSummaryItem label="FIX Gateways" value="3 Connected" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Cluster Nodes" value="8 / 8 Healthy" color="text-terminal-blue font-bold" />
              <GlobalSummaryItem label="Killswitch" value="READY (ARMED)" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Memory Usage" value="2.4 GB / 16 GB" color="text-white font-bold" />
              <GlobalSummaryItem label="API Gateways" value="100% Uptime" color="text-terminal-amber font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Node Status:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-green uppercase">ZERO DRIFT</span>
              </div>
            </>
          ) : activeWorkspace === 'INTEGRATION' ? (
            <>
              <GlobalSummaryItem label="Release Candidate" value="v3.2 RC-14" color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="12-Stage Pipeline" value="100% PASSING" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="14 Quality Gates" value="14 / 14 VERIFIED" color="text-terminal-blue font-bold" />
              <GlobalSummaryItem label="Event Bus Sync" value="0ms Lag" color="text-white font-bold" />
              <GlobalSummaryItem label="Load Tests" value="10,000 req/s OK" color="text-terminal-green font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Phase 14:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-green uppercase">READY FOR PRODUCTION</span>
              </div>
            </>
          ) : activeWorkspace === 'CONSTITUTION' ? (
            <>
              <GlobalSummaryItem label="Governance Rules" value="16 Rules Active" color="text-terminal-blue font-bold" />
              <GlobalSummaryItem label="Risk Ceilings" value="2.0% Max Drawdown" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Violations" value="0 Detected" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Audit Hash" value="0x9A4F...E812" color="text-white font-bold" />
              <GlobalSummaryItem label="Compliance" value="SEC / FINRA OK" color="text-terminal-amber font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Security:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-green uppercase">HARDENED</span>
              </div>
            </>
          ) : activeWorkspace === 'ADMINISTRATION' ? (
            <>
              <GlobalSummaryItem label="RBAC Roles" value="4 Active Roles" color="text-terminal-blue font-bold" />
              <GlobalSummaryItem label="Active Users" value="1 Operator" color="text-white font-bold" />
              <GlobalSummaryItem label="Security Logs" value="CLEAN (Zero Alerts)" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Credentials" value="Encrypted (AES-256)" color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="System Uptime" value="99.99%" color="text-terminal-green font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Session:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-green uppercase">CEO ACCESS</span>
              </div>
            </>
          ) : activeWorkspace === 'SETTINGS' ? (
            <>
              <GlobalSummaryItem label="API Keys" value="Configured" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Environment" value="PRODUCTION (CLOUDRUN)" color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="Alert Channels" value="Telegram / Email" color="text-white font-bold" />
              <GlobalSummaryItem label="Database Hooks" value="Firestore Active" color="text-terminal-blue font-bold" />
              <GlobalSummaryItem label="System Mode" value="ENTERPRISE v3.2" color="text-terminal-purple font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Config:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-green uppercase">VERIFIED</span>
              </div>
            </>
          ) : (
            <>
              <GlobalSummaryItem label="Workspace" value={activeWorkspace} color="text-terminal-amber font-bold" />
              <GlobalSummaryItem label="System Status" value="ONLINE" color="text-terminal-green font-bold" />
              <GlobalSummaryItem label="Gateway" value="SECURE" color="text-terminal-blue font-bold" />
              <div className="ml-auto flex items-center px-4 gap-2 shrink-0">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Mode:</span>
                <span className="text-[9px] font-mono font-bold text-terminal-green uppercase">OPERATIONAL</span>
              </div>
            </>
          )}
        </div>

        <main 
          id={`${activeWorkspace.toLowerCase()}-workspace`}
          role="tabpanel"
          aria-labelledby={activeWorkspace}
          className="flex-1 overflow-hidden relative flex flex-col min-w-0"
        >
          {children}
        </main>

        <GlobalFooter systemStatus={systemStatus} />
      </div>
    </div>
  );
};

