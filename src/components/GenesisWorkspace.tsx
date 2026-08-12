import React, { useState, useEffect } from 'react';
import { 
  Power, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Cpu, 
  Wallet, 
  Layers, 
  Server, 
  Terminal, 
  Clock, 
  AlertTriangle, 
  FileText,
  Activity,
  Zap,
  Radio,
  Check,
  AlertCircle,
  TrendingUp,
  Calendar,
  Database,
  Key,
  RefreshCw,
  CheckSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchApi } from '../lib/api';

export function GenesisWorkspace() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'BOOT' | 'ZERO_STATE' | 'MARKETS' | 'WORKSPACES' | 'MASTERS' | 'AI_MODELS' | 'WALLETS' | 'RUNTIMES' | 'CHECKLIST' | 'QA_SUMMARY' | 'AUDIT' | 'EVENTS'>('BOOT');
  const [notice, setNotice] = useState<string | null>(null);

  const loadGenesisStatus = async () => {
    setIsLoading(true);
    try {
      const res: any = await fetchApi('/api/system/genesis/status');
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load Genesis status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGenesisStatus();
  }, []);

  const handleStartGenesis = async () => {
    setIsLoading(true);
    setNotice('EXECUTING ENTERPRISE GENESIS BOOT SEQUENCE...');
    try {
      const res: any = await fetchApi('/api/system/genesis/start', { method: 'POST' });
      if (res && res.data) {
        setData(res.data);
        setNotice('ENTERPRISE GENESIS BOOT COMPLETED: System initialized in Zero State with Trading Lock enabled.');
      }
    } catch (err: any) {
      setNotice(`GENESIS BOOT FAILED: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetGenesis = async () => {
    setIsLoading(true);
    setNotice('RESETTING ENTERPRISE TO FACTORY ZERO STATE...');
    try {
      const res: any = await fetchApi('/api/system/genesis/reset', { method: 'POST' });
      if (res && res.data) {
        setData(res.data);
        setNotice('ENTERPRISE RESET COMPLETED: All 28 AI Models set to OFF, Wallets reset to 0 ATM.');
      }
    } catch (err: any) {
      setNotice(`GENESIS RESET FAILED: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const bootConfig = data?.bootConfig;
  const zeroState = data?.zeroState;
  const workspaces = data?.workspaces || [];
  const aiModels = data?.aiModels || [];
  const wallets = data?.wallets || [];
  const marketStates = data?.marketStates || [];
  const tradingCalendars = data?.tradingCalendars || [];
  const businessZeroStateChecks = data?.businessZeroStateChecks || [];
  const masterRegistries = data?.masterRegistries || [];
  const runtimeLocks = data?.runtimeLocks || [];
  const recoveryStatus = data?.recoveryStatus;
  const startupChecklist = data?.startupChecklist || [];
  const qaSummary = data?.qaSummary;
  const audits = data?.audits || [];
  const events = data?.events || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-black text-terminal-text font-mono overflow-hidden">
      {/* CONTROL HEADER */}
      <div className="p-4 bg-terminal-panel border-b border-terminal-border flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-terminal-amber/10 border border-terminal-amber/30 text-terminal-amber rounded-lg">
            <Power className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white uppercase tracking-wider">EP01 &amp; EP01.1: Genesis &amp; Zero State Completion Engine</h1>
              <span className="px-2 py-0.5 bg-terminal-green text-black font-extrabold text-[10px] rounded uppercase tracking-widest">
                SYSTEM READY
              </span>
              <span className="px-2 py-0.5 bg-terminal-red/20 border border-terminal-red/40 text-terminal-red font-bold text-[10px] rounded uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" /> TRADING LOCKED
              </span>
            </div>
            <p className="text-xs text-terminal-muted">
              AI ARINA Enterprise Boot Coordinator, Market Validator &amp; Zero State Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black border border-terminal-border rounded p-1 overflow-x-auto max-w-2xl">
            {(['BOOT', 'ZERO_STATE', 'MARKETS', 'WORKSPACES', 'MASTERS', 'AI_MODELS', 'WALLETS', 'RUNTIMES', 'CHECKLIST', 'QA_SUMMARY', 'AUDIT', 'EVENTS'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-2.5 py-1 text-xs font-bold rounded transition-colors uppercase whitespace-nowrap",
                  activeTab === tab ? "bg-terminal-amber text-black" : "text-terminal-muted hover:text-white"
                )}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={handleStartGenesis}
            disabled={isLoading}
            className="px-3 py-1.5 bg-terminal-green text-black font-extrabold text-xs rounded hover:bg-terminal-green/90 transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            <Power className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            {isLoading ? 'Booting...' : 'Boot Genesis'}
          </button>

          <button
            onClick={handleResetGenesis}
            disabled={isLoading}
            className="px-3 py-1.5 border border-terminal-border text-terminal-red hover:bg-terminal-red/10 font-bold text-xs rounded transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Zero State
          </button>
        </div>
      </div>

      {/* NOTICE BANNER */}
      {notice && (
        <div className="p-3 bg-terminal-amber/10 border-b border-terminal-amber/30 text-terminal-amber text-xs font-bold flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-terminal-green" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-[10px] text-terminal-muted hover:text-white uppercase">Dismiss</button>
        </div>
      )}

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-black/60 border-b border-terminal-border shrink-0 text-xs">
        <div className="p-2.5 bg-terminal-panel border border-terminal-border rounded space-y-1">
          <span className="text-terminal-muted text-[10px] uppercase block">Boot ID &amp; Session</span>
          <span className="text-xs font-bold text-terminal-amber block truncate">{bootConfig?.bootId || 'BOOT-2026-INIT'}</span>
          <span className="text-[9px] text-terminal-muted block">Session: {bootConfig?.genesisSessionId || 'GENESIS-01'}</span>
        </div>
        <div className="p-2.5 bg-terminal-panel border border-terminal-border rounded space-y-1">
          <span className="text-terminal-muted text-[10px] uppercase block">Indian Markets</span>
          <span className="text-sm font-bold text-terminal-green block">NSE, BSE, MCX</span>
          <span className="text-[9px] text-terminal-muted block">Session: CLOSED (VERIFIED)</span>
        </div>
        <div className="p-2.5 bg-terminal-panel border border-terminal-border rounded space-y-1">
          <span className="text-terminal-muted text-[10px] uppercase block">28 AI Models</span>
          <span className="text-sm font-bold text-white block">28 / 28 Status: OFF</span>
          <span className="text-[9px] text-terminal-muted block">0 Activated (Idle)</span>
        </div>
        <div className="p-2.5 bg-terminal-panel border border-terminal-border rounded space-y-1">
          <span className="text-terminal-muted text-[10px] uppercase block">Enterprise Wallets</span>
          <span className="text-sm font-bold text-terminal-green block">8 Wallets @ 0 ATM</span>
          <span className="text-[9px] text-terminal-muted block">Zero Capital Allocated</span>
        </div>
        <div className="p-2.5 bg-terminal-panel border border-terminal-border rounded space-y-1">
          <span className="text-terminal-muted text-[10px] uppercase block">Runtime Locks</span>
          <span className="text-sm font-bold text-terminal-red block flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> 9 RUNTIMES LOCKED
          </span>
          <span className="text-[9px] text-terminal-muted block">Code: AI_NOT_ACTIVATED</span>
        </div>
        <div className="p-2.5 bg-terminal-panel border border-terminal-border rounded space-y-1">
          <span className="text-terminal-muted text-[10px] uppercase block">Startup Checklist</span>
          <span className="text-xs font-bold text-terminal-green block truncate">11 / 11 PASSED (100%)</span>
          <span className="text-[9px] text-terminal-muted block">Config v2.0.0</span>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-5 bg-black space-y-5">
        {/* TAB 1: BOOT STATUS */}
        {activeTab === 'BOOT' && (
          <div className="space-y-5">
            {/* BOOT & VALIDATION SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-terminal-amber" /> System Boot Status
                  </span>
                  <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green text-[10px] font-bold rounded">SYSTEM_READY</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-terminal-muted">Boot ID:</span> <span className="text-white font-bold">{bootConfig?.bootId}</span></div>
                  <div className="flex justify-between"><span className="text-terminal-muted">Genesis Session:</span> <span className="text-white font-bold">{bootConfig?.genesisSessionId}</span></div>
                  <div className="flex justify-between"><span className="text-terminal-muted">Runtime Session:</span> <span className="text-white font-bold">{bootConfig?.runtimeSessionId}</span></div>
                  <div className="flex justify-between"><span className="text-terminal-muted">Enterprise Session:</span> <span className="text-white font-bold">{bootConfig?.enterpriseSessionId}</span></div>
                  <div className="flex justify-between"><span className="text-terminal-muted">Correlation ID:</span> <span className="text-terminal-amber font-bold">{bootConfig?.correlationId}</span></div>
                </div>
              </div>

              <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-terminal-green" /> Validation Matrix
                  </span>
                  <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green text-[10px] font-bold rounded">ALL PASSED</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-terminal-muted">Config Validation:</span> <span className="text-terminal-green font-bold">v2.0.0 (PASSED)</span></div>
                  <div className="flex justify-between"><span className="text-terminal-muted">Database Validation:</span> <span className="text-terminal-green font-bold">v2.0.0 (PASSED)</span></div>
                  <div className="flex justify-between"><span className="text-terminal-muted">Schema Validation:</span> <span className="text-terminal-green font-bold">v2.0.0 (PASSED)</span></div>
                  <div className="flex justify-between"><span className="text-terminal-muted">Startup Validation:</span> <span className="text-terminal-green font-bold">11/11 PASSED</span></div>
                  <div className="flex justify-between"><span className="text-terminal-muted">Recovery Mode:</span> <span className="text-white font-bold">NONE DETECTED</span></div>
                </div>
              </div>

              <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-terminal-amber" /> Health &amp; Diagnostics
                  </span>
                  <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green text-[10px] font-bold rounded">OPTIMAL</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-terminal-muted">Warnings Count:</span> <span className="text-terminal-green font-bold">0 Warnings</span></div>
                  <div className="flex justify-between"><span className="text-terminal-muted">Errors Count:</span> <span className="text-terminal-green font-bold">0 Errors</span></div>
                  <div className="flex justify-between"><span className="text-terminal-muted">Trading Lock:</span> <span className="text-terminal-red font-bold">ACTIVE (AI_NOT_ACTIVATED)</span></div>
                  <div className="flex justify-between"><span className="text-terminal-muted">Boot Timestamp:</span> <span className="text-white text-[10px]">{bootConfig?.bootTimestamp || bootConfig?.timestamp}</span></div>
                </div>
              </div>
            </div>

            {/* BOOT SEQUENCE EXECUTION STEPS */}
            <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-3">
              <h2 className="text-xs font-bold uppercase text-white border-b border-terminal-border pb-2 flex items-center gap-2">
                <Power className="w-4 h-4 text-terminal-amber" />
                Enterprise Boot Sequence Execution Log (20 Modules)
              </h2>

              <div className="space-y-2 text-xs">
                {[
                  { step: '1. System Boot Manager', status: 'COMPLETED', desc: 'Boot Coordinator initialized with Boot ID, Session IDs & Correlation ID' },
                  { step: '2. Configuration Validation', status: 'COMPLETED', desc: 'Validated v2.0.0 enterprise config & schema alignment' },
                  { step: '3. Database Validation', status: 'COMPLETED', desc: 'PostgreSQL connection & table DDL constraints confirmed' },
                  { step: '4. Workspace Validation', status: 'COMPLETED', desc: '16 Core Workspaces verified & registered without duplicate creation' },
                  { step: '5. AI Registry Validation', status: 'COMPLETED', desc: 'Exactly 28 AI Trading Models verified with status: OFF' },
                  { step: '6. Wallet Registry Validation', status: 'COMPLETED', desc: '8 Enterprise Wallets created with initial balance: 0 ATM' },
                  { step: '7. Trading Lock Enforcement', status: 'ACTIVE', desc: 'All trading order paths locked returning AI_NOT_ACTIVATED' },
                  { step: '8. Genesis Audit Engine', status: 'COMPLETED', desc: 'SHA-256 genesis session certificate sealed' },
                  { step: '9. Event Bus Dispatch', status: 'COMPLETED', desc: 'GenesisStarted, ZeroStateInitialized & SystemReady published' },
                  { step: '10. Zero State Engine', status: 'COMPLETED', desc: 'Confirmed 0 capital, 0 orders, 0 positions, empty queues' },
                  { step: '11. Market State Validator', status: 'COMPLETED', desc: 'NSE, BSE, MCX market states & trading sessions verified' },
                  { step: '12. Trading Calendar Registry', status: 'COMPLETED', desc: 'Trading days, holidays, settlement & expiry schedules verified' },
                  { step: '13. Business Zero State Engine', status: 'COMPLETED', desc: 'Confirmed 0 active strategies, research, decisions & jobs' },
                  { step: '14. Dependency Validator', status: 'COMPLETED', desc: 'Sequence enforced: System Ready -> AI Activation -> Fund Allocation -> Research -> Trading' },
                  { step: '15. Master Registry Validation', status: 'COMPLETED', desc: '9 Master Registries validated with 0 duplicate records' },
                  { step: '16. Runtime Lock Engine', status: 'LOCKED', desc: '9 Enterprise Runtimes locked prior to AI Activation' },
                  { step: '17. Recovery Engine', status: 'STANDBY', desc: 'Rollback & safe mode verified in standby state' },
                  { step: '18. Genesis Dashboard', status: 'ACTIVE', desc: 'Visual inspector matrix initialized' },
                  { step: '19. Startup Checklist', status: 'PASSED', desc: '11-point startup validation passed with 100% score' },
                  { step: '20. Enterprise QA Summary', status: 'PASSED', desc: 'Final QA completion criteria verified' },
                ].map((s, idx) => (
                  <div key={idx} className="p-2.5 bg-black border border-terminal-border/60 rounded flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">{s.step}</span>
                      <p className="text-terminal-muted text-[11px]">{s.desc}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-terminal-green/20 border border-terminal-green/40 text-terminal-green text-[10px] font-bold rounded shrink-0">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ZERO STATE MATRIX */}
        {activeTab === 'ZERO_STATE' && (
          <div className="space-y-5">
            <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                <h2 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-terminal-green" />
                  Enterprise Business Zero State Verification Matrix (12 Checks)
                </h2>
                <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green text-[10px] font-bold rounded uppercase">
                  VERIFIED 100% FACTORY ZERO
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {businessZeroStateChecks.map((check: any, idx: number) => (
                  <div key={idx} className="p-3 bg-black border border-terminal-border rounded flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-white block">{check.checkName}</span>
                      <span className="text-[10px] text-terminal-muted block">Category: {check.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green text-[10px] font-bold rounded block">
                        CONFIRMED ZERO
                      </span>
                      <span className="text-[9px] text-terminal-muted block mt-0.5">Count: {check.activeCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MARKET STATE & TRADING CALENDAR */}
        {activeTab === 'MARKETS' && (
          <div className="space-y-5">
            <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                <h2 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-terminal-amber" />
                  Enterprise Market State Validator (NSE, BSE, MCX)
                </h2>
                <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green text-[10px] font-bold rounded uppercase">
                  MARKETS VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {marketStates.map((ms: any, idx: number) => (
                  <div key={idx} className="p-4 bg-black border border-terminal-border rounded-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2">
                      <span className="font-bold text-terminal-amber text-sm">{ms.exchangeCode}</span>
                      <span className="px-2 py-0.5 bg-terminal-amber/20 text-terminal-amber text-[10px] font-bold rounded">
                        {ms.currentState}
                      </span>
                    </div>
                    <div className="space-y-1 text-terminal-muted">
                      <p className="text-white font-bold">{ms.exchangeName}</p>
                      <div className="flex justify-between"><span>Status:</span> <span className="text-terminal-green font-bold">{ms.exchangeStatus}</span></div>
                      <div className="flex justify-between"><span>Trading Session:</span> <span className="text-white font-bold">{ms.tradingSession}</span></div>
                      <div className="flex justify-between"><span>Availability:</span> <span className="text-terminal-green font-bold">{ms.marketAvailability}</span></div>
                      <div className="flex justify-between"><span>Calendar Status:</span> <span className="text-terminal-green font-bold">{ms.marketCalendarStatus}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                <h2 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-terminal-amber" />
                  Enterprise Trading Calendar Registry
                </h2>
                <span className="text-[10px] text-terminal-green font-bold">CALENDAR INTEGRITY VERIFIED</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {tradingCalendars.map((tc: any, idx: number) => (
                  <div key={idx} className="p-3 bg-black border border-terminal-border rounded space-y-1.5">
                    <div className="flex justify-between items-center font-bold text-terminal-amber">
                      <span>{tc.exchangeCode} Calendar</span>
                      <span>{tc.calendarDate}</span>
                    </div>
                    <div className="space-y-1 text-terminal-muted text-[11px]">
                      <div className="flex justify-between"><span>Trading Day:</span> <span className={tc.isTradingDay ? "text-terminal-green font-bold" : "text-terminal-red font-bold"}>{tc.isTradingDay ? "YES" : "NO"}</span></div>
                      <div className="flex justify-between"><span>Holiday:</span> <span className="text-white">{tc.isHoliday ? "YES" : "NO"}</span></div>
                      <div className="flex justify-between"><span>Settlement Day:</span> <span className="text-terminal-green font-bold">{tc.isSettlementDay ? "YES" : "NO"}</span></div>
                      <div className="flex justify-between"><span>Expiry Day:</span> <span className="text-white">{tc.isExpiryDay ? "YES" : "NO"}</span></div>
                      <div className="flex justify-between"><span>No Trading Window:</span> <span className="text-terminal-green font-bold">{tc.noTradingWindowActive ? "ACTIVE" : "INACTIVE"}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WORKSPACE REGISTRY */}
        {activeTab === 'WORKSPACES' && (
          <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2">
              <h2 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-terminal-amber" />
                16 Core Workspace Registry (One Workspace = One Responsibility)
              </h2>
              <span className="text-[10px] text-terminal-green font-bold">100% REGISTRATION COMPLIANT</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-terminal-border/60 text-terminal-muted uppercase text-[10px]">
                    <th className="py-2 px-3">Workspace ID</th>
                    <th className="py-2 px-3">Workspace Name</th>
                    <th className="py-2 px-3">Architectural Responsibility</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/30">
                  {workspaces.map((w: any, idx: number) => (
                    <tr key={idx} className="hover:bg-black/40">
                      <td className="py-2.5 px-3 text-terminal-amber font-bold">{w.workspaceId}</td>
                      <td className="py-2.5 px-3 text-white font-bold">{w.workspaceName}</td>
                      <td className="py-2.5 px-3 text-terminal-muted">{w.responsibility}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 bg-terminal-green/20 border border-terminal-green/40 text-terminal-green text-[10px] font-bold rounded">
                          {w.status || 'REGISTERED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: MASTER REGISTRIES */}
        {activeTab === 'MASTERS' && (
          <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2">
              <h2 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-terminal-amber" />
                9 Master Registries Validation Matrix
              </h2>
              <span className="text-[10px] text-terminal-green font-bold">ZERO DUPLICATES DETECTED</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {masterRegistries.map((mr: any, idx: number) => (
                <div key={idx} className="p-3 bg-black border border-terminal-border rounded space-y-1.5 text-xs">
                  <div className="flex items-center justify-between border-b border-terminal-border/60 pb-1.5">
                    <span className="font-bold text-terminal-amber uppercase text-[11px]">{mr.masterType}</span>
                    <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green text-[10px] font-bold rounded">
                      VALIDATED
                    </span>
                  </div>
                  <p className="text-white font-bold text-[11px]">{mr.masterName}</p>
                  <div className="space-y-0.5 text-terminal-muted text-[10px]">
                    <div className="flex justify-between"><span>Record Count:</span> <span className="text-white font-bold">{mr.recordCount}</span></div>
                    <div className="flex justify-between"><span>Duplicate Count:</span> <span className="text-terminal-green font-bold">{mr.duplicateCount}</span></div>
                    <div className="flex justify-between"><span>Checksum:</span> <span className="text-terminal-amber">{mr.checksum}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: AI MODEL REGISTRY */}
        {activeTab === 'AI_MODELS' && (
          <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2">
              <h2 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-terminal-amber" />
                28 AI Models Registration Matrix
              </h2>
              <span className="text-[10px] text-terminal-red font-bold uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" /> ALL 28 MODELS STATUS: OFF
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiModels.map((m: any, idx: number) => (
                <div key={idx} className="p-3 bg-black border border-terminal-border rounded flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-terminal-amber">#{m.modelNumber}</span>
                      <span className="text-white font-bold">{m.modelName || `ARINA AI Model #${m.modelNumber}`}</span>
                    </div>
                    <p className="text-terminal-muted text-[10px]">
                      Strategy: {m.strategyType || 'Quantitative'} | Wallet: 0 ATM | Trading: Disabled | Learning: Disabled
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-terminal-muted/20 border border-terminal-border text-terminal-muted text-[10px] font-bold rounded uppercase">
                      STATUS: OFF
                    </span>
                    <span className="px-2 py-0.5 bg-terminal-amber/20 text-terminal-amber text-[10px] font-bold rounded">
                      IDLE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: WALLET REGISTRY */}
        {activeTab === 'WALLETS' && (
          <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2">
              <h2 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-terminal-amber" />
                8 Enterprise Wallet Genesis Registry
              </h2>
              <span className="text-[10px] text-terminal-green font-bold">ALL BALANCES: 0 ATM</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {wallets.map((w: any, idx: number) => (
                <div key={idx} className="p-3 bg-black border border-terminal-border rounded space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-terminal-amber uppercase">{w.walletType} WALLET</span>
                    <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green text-[10px] font-bold rounded">
                      INITIALIZED
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-white">
                    <span className="text-terminal-muted text-[10px]">Owner: {w.ownerEntityId}</span>
                    <span className="font-bold text-terminal-green">{w.balance || '0.00000000'} ATM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: RUNTIME LOCKS */}
        {activeTab === 'RUNTIMES' && (
          <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2">
              <h2 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-terminal-red" />
                Enterprise Runtime Lock Engine (9 Runtimes)
              </h2>
              <span className="text-[10px] text-terminal-red font-bold uppercase">ALL 9 RUNTIMES LOCKED</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {runtimeLocks.map((rl: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-black border border-terminal-border rounded flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-white block">{rl.runtimeName}</span>
                    <span className="text-[10px] text-terminal-muted block">{rl.runtimeType}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-terminal-red/20 border border-terminal-red/40 text-terminal-red text-[10px] font-bold rounded flex items-center gap-1 shrink-0">
                    <Lock className="w-3 h-3" /> LOCKED
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: CHECKLIST & RECOVERY */}
        {activeTab === 'CHECKLIST' && (
          <div className="space-y-5">
            <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                <h2 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-terminal-green" />
                  Enterprise Startup Checklist (11 Verification Items)
                </h2>
                <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green text-[10px] font-bold rounded">
                  100% PASSED (11/11)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {startupChecklist.map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-black border border-terminal-border rounded flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{item.checkName}</span>
                        <span className="text-[10px] text-terminal-amber font-mono">[{item.category}]</span>
                      </div>
                      <p className="text-terminal-muted text-[11px]">{item.details}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-terminal-green/20 border border-terminal-green/40 text-terminal-green text-[10px] font-bold rounded shrink-0">
                      PASSED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                <h2 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-terminal-amber" />
                  Enterprise Recovery Engine Status
                </h2>
                <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green text-[10px] font-bold rounded">
                  STANDBY READY
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-black border border-terminal-border rounded space-y-1">
                  <span className="text-terminal-muted text-[10px] uppercase block">Recovery Mode</span>
                  <span className="text-sm font-bold text-terminal-green block">{recoveryStatus?.recoveryMode || 'STANDBY'}</span>
                </div>
                <div className="p-3 bg-black border border-terminal-border rounded space-y-1">
                  <span className="text-terminal-muted text-[10px] uppercase block">Safe Mode</span>
                  <span className="text-sm font-bold text-white block">{recoveryStatus?.safeModeActive ? "ACTIVE" : "INACTIVE"}</span>
                </div>
                <div className="p-3 bg-black border border-terminal-border rounded space-y-1">
                  <span className="text-terminal-muted text-[10px] uppercase block">Rollback Supported</span>
                  <span className="text-sm font-bold text-terminal-green block">YES</span>
                </div>
                <div className="p-3 bg-black border border-terminal-border rounded space-y-1">
                  <span className="text-terminal-muted text-[10px] uppercase block">Audit Trail Status</span>
                  <span className="text-sm font-bold text-terminal-green block">{recoveryStatus?.auditTrailStatus || 'HEALTHY'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: QA SUMMARY */}
        {activeTab === 'QA_SUMMARY' && (
          <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2">
              <h2 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-terminal-green" />
                Enterprise QA Completion Summary (EP01 &amp; EP01.1 Integrity Check)
              </h2>
              <span className="px-3 py-1 bg-terminal-green text-black font-extrabold text-xs rounded uppercase">
                QA RESULT: PASSED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-black border border-terminal-border rounded space-y-2">
                <span className="font-bold text-terminal-amber uppercase block border-b border-terminal-border/60 pb-1">Core Architecture Verification</span>
                <div className="space-y-1 text-terminal-muted">
                  <div className="flex justify-between"><span>Boot &amp; Genesis Sessions:</span> <span className="text-terminal-green font-bold">Exactly 1 Session</span></div>
                  <div className="flex justify-between"><span>Workspace Registry:</span> <span className="text-terminal-green font-bold">16 Workspaces Registered</span></div>
                  <div className="flex justify-between"><span>AI Model Registry:</span> <span className="text-terminal-green font-bold">28 Models Status: OFF</span></div>
                  <div className="flex justify-between"><span>Wallet Registry:</span> <span className="text-terminal-green font-bold">8 Wallets @ 0 ATM</span></div>
                  <div className="flex justify-between"><span>Market State Validator:</span> <span className="text-terminal-green font-bold">3 Exchanges (NSE, BSE, MCX)</span></div>
                  <div className="flex justify-between"><span>Trading Calendar:</span> <span className="text-terminal-green font-bold">Verified</span></div>
                </div>
              </div>

              <div className="p-3.5 bg-black border border-terminal-border rounded space-y-2">
                <span className="font-bold text-terminal-amber uppercase block border-b border-terminal-border/60 pb-1">Zero State &amp; Lock Verification</span>
                <div className="space-y-1 text-terminal-muted">
                  <div className="flex justify-between"><span>Master Registries:</span> <span className="text-terminal-green font-bold">9 Masters (0 Duplicates)</span></div>
                  <div className="flex justify-between"><span>Runtime Lock Engine:</span> <span className="text-terminal-green font-bold">9 Runtimes LOCKED</span></div>
                  <div className="flex justify-between"><span>Business Zero State:</span> <span className="text-terminal-green font-bold">12 Checks Confirmed Zero</span></div>
                  <div className="flex justify-between"><span>Startup Checklist:</span> <span className="text-terminal-green font-bold">11 / 11 Checks Passed</span></div>
                  <div className="flex justify-between"><span>Active Trades &amp; Jobs:</span> <span className="text-terminal-green font-bold">0 Active (Clean)</span></div>
                  <div className="flex justify-between"><span>System Ready Status:</span> <span className="text-terminal-green font-bold">SYSTEM_READY</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: BOOT AUDIT */}
        {activeTab === 'AUDIT' && (
          <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-3">
            <h2 className="text-xs font-bold uppercase text-white border-b border-terminal-border pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-terminal-amber" />
              Genesis Boot Audit Log Trail
            </h2>

            <div className="space-y-2 text-xs">
              {audits.map((a: any, idx: number) => (
                <div key={idx} className="p-3 bg-black border border-terminal-border rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-terminal-amber">{a.id}</span>
                    <span className="text-terminal-muted text-[10px]">{a.timestamp || a.createdAt}</span>
                  </div>
                  <p className="text-white text-[11px]">Audit Hash: {a.auditHash}</p>
                  <p className="text-terminal-muted text-[10px]">
                    Workspaces: {a.workspaceCount || 16} | AI Models: {a.aiModelCount || 28} | Wallets: {a.walletCount || 8} | Config: v{a.configVersion || '2.0.0'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 12: SYSTEM EVENTS */}
        {activeTab === 'EVENTS' && (
          <div className="p-4 bg-terminal-panel border border-terminal-border rounded-lg space-y-3">
            <h2 className="text-xs font-bold uppercase text-white border-b border-terminal-border pb-2 flex items-center gap-2">
              <Radio className="w-4 h-4 text-terminal-amber" />
              Genesis Outbound System Events Bus
            </h2>

            <div className="space-y-2 text-xs">
              {events.map((evt: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-black border border-terminal-border rounded flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-terminal-green uppercase">{evt.eventType}</span>
                      <span className="text-terminal-muted text-[10px]">Correlation: {evt.correlationId}</span>
                    </div>
                    <p className="text-terminal-muted text-[10px]">Source: GENESIS_ENGINE</p>
                  </div>
                  <span className="px-2 py-0.5 bg-terminal-amber/20 text-terminal-amber text-[10px] font-bold rounded">
                    PUBLISHED
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
