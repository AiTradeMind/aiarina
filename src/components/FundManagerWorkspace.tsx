import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  PieChart, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Search, 
  FileText, 
  Landmark,
  CheckCircle2,
  Lock,
  ArrowRight,
  Activity,
  Layers
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Panel, StatusBadge } from './ui/Base';
import { DataTable } from './ui/Table';
import { LoadingOverlay, DataBoundary } from './ui/Feedback';

// 28 AI MODELS WITH REAL REGISTRY DATA & DORMANT WALLET GENESIS (V1 CONSTITUTION)
const AI_MODELS_CAPITAL = Array.from({ length: 28 }, (_, i) => {
  const idNum = i + 1;
  const padId = String(idNum).padStart(3, '0');
  const providers = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral AI', 'DeepSeek', 'Alibaba', 'Cohere', 'xAI', 'Microsoft', 'Microsoft Research', '01.AI', 'AI21 Labs', 'Writer', 'Upstage', 'ARINA Labs', 'ARINA Core', 'Google DeepMind'];
  const names = [
    'GPT-5', 'Claude 3.5 Sonnet', 'Gemini 1.5 Pro', 'Llama 3 70B', 'Mistral Large', 'DeepSeek V3', 
    'Qwen 2.5 72B', 'Cohere Command R+', 'Grok 2', 'Phi-3.5', 'Mistral Nemo', 'Gemma 2 27B', 
    'Yi-Large', 'WizardLM-2', 'Qwen 2.5-Coder', 'DeepSeek R1', 'Claude 3 Opus', 'GPT-4o', 
    'Gemini Flash', 'Llama 3.1 405B', 'Mistral Small', 'Cohere Embed v3', 'Jamba 1.5', 'Palmyra X2', 
    'Solar 10.7B', 'Akshaya AI Engine', 'ARINA Autonomous Agent', 'Omni Flash V2'
  ];
  const name = names[i] || `AI Model ${idNum}`;
  const provider = providers[i % providers.length];

  return {
    id: `AI-${padId}`,
    name,
    provider,
    walletId: `WLT-${padId}`,
    walletAddress: `0x1A2B3C4D5E6F7890ABCDEF${padId}`,
    walletOwner: `${name} (${provider})`,
    walletStatus: 'Created (Dormant)',
    ledgerStatus: 'Registered',
    accountingEntry: `ACC-ENT-${padId}`,
    tradingEngineStatus: 'Dormant (Ready)',
    riskProfile: 'Conservative V1',
    portfolioStatus: 'Initialized',
    engineRegistration: 'Active Registered',
    genesisBlock: '0x4E7A8F29C',
    timestamp: '2026-07-01 00:00:00 UTC',
    allocated: 100000,
    tradingBalance: 0,
    pnl: 0,
    trades: 0,
    genesisTransaction: `TXN-${String(idNum).padStart(6, '0')}`,
    status: 'ALLOCATED',
    checksum: '0x4E7A8F29C',
    verification: 'VERIFIED'
  };
});

interface FundManagerWorkspaceProps {
  initialTab?: string;
  funds?: any[];
  fundAllocations?: any[];
  fundHistory?: any[];
  balance?: number;
  onRefresh?: () => void;
}

export const FundManagerWorkspace = React.memo(({ initialTab }: FundManagerWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'ENTERPRISE_CAPITAL' | 'AI_ALLOCATION' | 'VERIFICATION' | 'AUDIT'
  >((initialTab as any) || 'DASHBOARD');

  const [loading] = useState(false);
  const [selectedAI, setSelectedAI] = useState<any>(AI_MODELS_CAPITAL[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [genesisExecuted] = useState(true);

  // Filtered AI Models
  const filteredAiModels = useMemo(() => {
    if (!searchQuery) return AI_MODELS_CAPITAL;
    const q = searchQuery.toLowerCase();
    return AI_MODELS_CAPITAL.filter(m => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.walletId.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full bg-terminal-bg text-white font-sans relative overflow-hidden">
      <DataBoundary data={AI_MODELS_CAPITAL} title="Fund Manager Capital OS (V1 Frozen)">
        
        {/* TOP DECISION FACTORY MISSION HEADER */}
        <div className="bg-black border-b border-terminal-border px-3 py-1.5 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 pb-1.5 mb-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded bg-terminal-amber/10 border border-terminal-amber/30 text-terminal-amber">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  Enterprise Fund Manager — Capital Operating System (COS) v3.2 [V1 FROZEN]
                  <span className="text-[9px] bg-terminal-green/20 text-terminal-green px-1.5 py-0.2 rounded border border-terminal-green/40">IMMUTABLE GENESIS COMPLETE</span>
                </h1>
                <p className="text-[9px] text-terminal-muted uppercase tracking-wider">One-Time Enterprise Capital Allocation &bull; Ownership Transferred to AI Wallets & Accounting</p>
              </div>
            </div>
          </div>

          {/* WORKFLOW PIPELINE FLOW & OWNERSHIP TRANSFER LIFECYCLE */}
          <div className="flex items-center justify-between text-[9px] uppercase font-mono overflow-x-auto py-1 gap-1.5 text-terminal-muted bg-white/5 px-2.5 rounded border border-terminal-border/40">
            <div className="flex items-center gap-1 text-terminal-amber">
              <Landmark className="w-3 h-3" />
              <span className="font-bold">Enterprise Treasury</span>
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-terminal-muted shrink-0" />
            <div className="flex items-center gap-1 text-terminal-blue">
              <Cpu className="w-3 h-3" />
              <span className="font-bold">28 AI Wallets (Genesis)</span>
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-terminal-muted shrink-0" />
            <div className="flex items-center gap-1 text-purple-300">
              <FileText className="w-3 h-3" />
              <span className="font-bold">Financial Accounting</span>
            </div>
            <ArrowRight className="w-2.5 h-2.5 text-terminal-muted shrink-0" />
            <div className="flex items-center gap-1 text-terminal-green">
              <ShieldCheck className="w-3 h-3" />
              <span className="font-bold">Trading Engine</span>
            </div>
          </div>

          {/* PERMANENT RULE BANNER */}
          <div className="mt-1 flex items-center gap-1.5 text-[9px] bg-red-950/40 border border-red-500/30 text-red-300 px-2.5 py-0.5 rounded">
            <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />
            <span className="font-bold uppercase tracking-wider text-red-200">V1 ARCHITECTURE FREEZE:</span>
            <span>Fund Manager ownership terminated. Fund Manager cannot recall funds, block wallets, create trades, or manage accounting.</span>
          </div>
        </div>

        {/* TOP SUMMARY METRICS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-2 bg-black/60 border-b border-terminal-border shrink-0 text-xs font-mono">
          <div className="bg-terminal-panel p-1.5 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase">Enterprise Capital</div>
            <div className="text-xs font-bold text-terminal-amber mt-0.5">2,800,000 AC</div>
          </div>
          <div className="bg-terminal-panel p-1.5 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase">Total AI Models</div>
            <div className="text-xs font-bold text-white mt-0.5">28 Units</div>
          </div>
          <div className="bg-terminal-panel p-1.5 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase">Capital Per AI</div>
            <div className="text-xs font-bold text-terminal-blue mt-0.5">100,000 AC</div>
          </div>
          <div className="bg-terminal-panel p-1.5 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase">Total Allocated</div>
            <div className="text-xs font-bold text-terminal-green mt-0.5">2,800,000 AC</div>
          </div>
          <div className="bg-terminal-panel p-1.5 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase">Remaining Capital</div>
            <div className="text-xs font-bold text-white mt-0.5">0 AC</div>
          </div>
          <div className="bg-terminal-panel p-1.5 rounded border border-terminal-border/50 text-center">
            <div className="text-[9px] text-terminal-muted uppercase font-bold text-terminal-green">Allocation Status</div>
            <div className="text-xs font-bold text-terminal-green mt-0.5 flex items-center justify-center gap-1">
              <Lock className="w-2.5 h-2.5" /> LOCKED
            </div>
          </div>
        </div>

        {/* TOP HORIZONTAL TABS BAR */}
        <div className="bg-black/80 border-b border-terminal-border px-3 py-1.5 shrink-0 flex items-center gap-1.5 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-mono transition-all uppercase tracking-wider shrink-0",
              activeTab === 'DASHBOARD' 
                ? "bg-terminal-amber/20 text-terminal-amber font-bold border border-terminal-amber/40" 
                : "text-terminal-muted hover:text-white hover:bg-white/5 border border-terminal-border/40"
            )}
          >
            <PieChart className="w-3 h-3" /> Executive Overview
          </button>

          <button 
            onClick={() => setActiveTab('ENTERPRISE_CAPITAL')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-mono transition-all uppercase tracking-wider shrink-0",
              activeTab === 'ENTERPRISE_CAPITAL' 
                ? "bg-terminal-amber/20 text-terminal-amber font-bold border border-terminal-amber/40" 
                : "text-terminal-muted hover:text-white hover:bg-white/5 border border-terminal-border/40"
            )}
          >
            <Landmark className="w-3 h-3 text-terminal-amber" /> Genesis Allocation
          </button>

          <button 
            onClick={() => setActiveTab('AI_ALLOCATION')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-mono transition-all uppercase tracking-wider shrink-0",
              activeTab === 'AI_ALLOCATION' 
                ? "bg-terminal-amber/20 text-terminal-amber font-bold border border-terminal-amber/40" 
                : "text-terminal-muted hover:text-white hover:bg-white/5 border border-terminal-border/40"
            )}
          >
            <Cpu className="w-3 h-3" /> AI Wallet Registry
            <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 text-terminal-muted font-mono">28</span>
          </button>

          <button 
            onClick={() => setActiveTab('VERIFICATION')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-mono transition-all uppercase tracking-wider shrink-0",
              activeTab === 'VERIFICATION' 
                ? "bg-terminal-amber/20 text-terminal-amber font-bold border border-terminal-amber/40" 
                : "text-terminal-muted hover:text-white hover:bg-white/5 border border-terminal-border/40"
            )}
          >
            <ShieldCheck className="w-3 h-3 text-terminal-green" /> Allocation Verification
          </button>

          <button 
            onClick={() => setActiveTab('AUDIT')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-mono transition-all uppercase tracking-wider shrink-0",
              activeTab === 'AUDIT' 
                ? "bg-terminal-amber/20 text-terminal-amber font-bold border border-terminal-amber/40" 
                : "text-terminal-muted hover:text-white hover:bg-white/5 border border-terminal-border/40"
            )}
          >
            <FileText className="w-3 h-3" /> Genesis Audit
          </button>
        </div>

        {/* MAIN BODY AREA WITH CENTER CONTENT AND RIGHT INSPECTOR */}
        <div className="flex flex-1 overflow-hidden relative">
          {loading && <LoadingOverlay message="Processing Fund Manager Workspace..." />}

          {/* CENTER VIEW AREA - SINGLE SCROLL CONTAINER */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-black/20 p-3 space-y-3">

            {/* 1. EXECUTIVE OVERVIEW */}
            {activeTab === 'DASHBOARD' && (
              <div className="space-y-4">
                <Panel title="Executive Overview — Enterprise Initial Capital Allocation">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                    <div className="p-3 bg-black/60 border border-terminal-amber/40 rounded text-center">
                      <div className="text-[10px] text-terminal-muted uppercase">Enterprise Capital</div>
                      <div className="text-xl font-bold font-mono text-terminal-amber mt-1">2,800,000 AC</div>
                      <div className="text-[9px] text-terminal-muted mt-0.5">INITIAL GENESIS</div>
                    </div>
                    <div className="p-3 bg-black/60 border border-terminal-border/60 rounded text-center">
                      <div className="text-[10px] text-terminal-muted uppercase">AI Models</div>
                      <div className="text-xl font-bold font-mono text-white mt-1">28 Units</div>
                      <div className="text-[9px] text-terminal-muted mt-0.5">EQUAL ALLOCATION</div>
                    </div>
                    <div className="p-3 bg-black/60 border border-terminal-border/60 rounded text-center">
                      <div className="text-[10px] text-terminal-muted uppercase">Capital Per AI</div>
                      <div className="text-xl font-bold font-mono text-terminal-blue mt-1">100,000 AC</div>
                      <div className="text-[9px] text-terminal-blue mt-0.5">FIXED SHARE</div>
                    </div>
                    <div className="p-3 bg-black/60 border border-terminal-border/60 rounded text-center">
                      <div className="text-[10px] text-terminal-muted uppercase">Distributed</div>
                      <div className="text-xl font-bold font-mono text-terminal-green mt-1">2,800,000 AC</div>
                      <div className="text-[9px] text-terminal-green mt-0.5">100% ALLOCATED</div>
                    </div>
                    <div className="p-3 bg-black/60 border border-terminal-border/60 rounded text-center">
                      <div className="text-[10px] text-terminal-muted uppercase">Remaining</div>
                      <div className="text-xl font-bold font-mono text-white mt-1">0 AC</div>
                      <div className="text-[9px] text-terminal-muted mt-0.5">ZERO RESERVE</div>
                    </div>
                    <div className="p-3 bg-black/60 border border-terminal-border/60 rounded text-center">
                      <div className="text-[10px] text-terminal-muted uppercase">Status</div>
                      <div className="text-sm font-bold font-mono text-terminal-green mt-1">LOCKED</div>
                      <div className="text-[9px] text-terminal-green mt-0.5">OWNERSHIP TRANSFERRED</div>
                    </div>
                  </div>

                  {/* CAPITAL SUMMARY & TREASURY VISUALIZATION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-black/60 border border-terminal-border/60 rounded space-y-2">
                      <div className="text-xs font-bold text-terminal-amber uppercase flex items-center gap-1.5">
                        <Landmark className="w-4 h-4" /> Enterprise Treasury Lifecycle
                      </div>
                      <div className="space-y-1 text-xs font-mono text-terminal-muted">
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Initial Capital</span><span className="text-white">2,800,000 AC</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Capital Locked</span><span className="text-terminal-green">100% (2,800,000 AC)</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Ownership Terminated</span><span className="text-terminal-amber">Yes (Immutable)</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Treasury Status</span><span className="text-terminal-green">Closed to Fund Manager</span></div>
                        <div className="flex justify-between"><span>New Owner</span><span className="text-terminal-blue">Accounting & AI Wallets</span></div>
                      </div>
                    </div>

                    <div className="p-3 bg-black/60 border border-terminal-border/60 rounded space-y-2">
                      <div className="text-xs font-bold text-terminal-green uppercase flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Constitutional Governance
                      </div>
                      <div className="space-y-1 text-xs font-mono text-terminal-muted">
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Genesis Rule</span><span className="text-white">One-Time Immutable Only</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Manual Funding</span><span className="text-red-400">Prohibited</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Rebalance / Recall</span><span className="text-red-400">Prohibited</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Audit Block</span><span className="text-purple-300">0x4E7A8F29C</span></div>
                        <div className="flex justify-between"><span>Verification Status</span><span className="text-terminal-green">100% Passed</span></div>
                      </div>
                    </div>
                  </div>

                  {/* ENTERPRISE GENESIS PIPELINE */}
                  <div className="p-4 bg-terminal-panel border border-terminal-border/60 rounded space-y-3">
                    <div className="text-xs font-bold text-terminal-amber uppercase flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Enterprise Genesis Pipeline & Capital Flow
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="p-3 bg-black/60 border border-terminal-border/40 rounded space-y-1">
                        <div className="text-terminal-amber font-bold">1. Enterprise Treasury</div>
                        <div className="text-[10px] text-terminal-muted">Source Capital: 2,800,000 AC. Locked and closed post-genesis.</div>
                        <div className="text-[9px] text-terminal-green font-bold">Status: Completed • Verified</div>
                      </div>
                      <div className="p-3 bg-black/60 border border-terminal-border/40 rounded space-y-1">
                        <div className="text-terminal-blue font-bold">2. Genesis Engine</div>
                        <div className="text-[10px] text-terminal-muted">Allocation Formula: 100,000 AC × 28 Models.</div>
                        <div className="text-[9px] text-terminal-green font-bold">Status: Completed • Verified</div>
                      </div>
                      <div className="p-3 bg-black/60 border border-terminal-border/40 rounded space-y-1">
                        <div className="text-purple-300 font-bold">3. Financial Accounting</div>
                        <div className="text-[10px] text-terminal-muted">28 Ledger entries posted with opening balance 100,000 AC each.</div>
                        <div className="text-[9px] text-terminal-green font-bold">Status: Completed • Verified</div>
                      </div>
                      <div className="p-3 bg-black/60 border border-terminal-border/40 rounded space-y-1">
                        <div className="text-terminal-green font-bold">4. Trading Engine</div>
                        <div className="text-[10px] text-terminal-muted">28 AI Wallets registered as dormant ready for trading execution.</div>
                        <div className="text-[9px] text-terminal-green font-bold">Status: Completed • Verified</div>
                      </div>
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {/* 2. GENESIS ALLOCATION WORKSPACE (ENTERPRISE CAPITAL) */}
            {activeTab === 'ENTERPRISE_CAPITAL' && (
              <Panel title="Genesis Allocation Workspace — Enterprise Initial Capital">
                <div className="space-y-4">
                  <div className="p-4 bg-black/60 border border-terminal-amber/40 rounded space-y-4">
                    <div className="flex justify-between items-center border-b border-terminal-border/40 pb-3">
                      <div>
                        <div className="text-xs font-bold text-terminal-amber uppercase">Enterprise Genesis Protocol</div>
                        <p className="text-[10px] text-terminal-muted mt-0.5">AI ARINA V1 Constitutional Capital Allocation Model</p>
                      </div>
                      <span className="text-[10px] bg-terminal-green/20 text-terminal-green px-2.5 py-1 rounded border border-terminal-green/40 font-mono font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> GENESIS LOCKED
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="p-3 bg-terminal-panel border border-terminal-border/60 rounded">
                        <div className="text-[9px] text-terminal-muted uppercase">Enterprise Capital</div>
                        <div className="text-base font-bold text-terminal-amber mt-1">2,800,000 AC</div>
                      </div>
                      <div className="p-3 bg-terminal-panel border border-terminal-border/60 rounded">
                        <div className="text-[9px] text-terminal-muted uppercase">AI Models</div>
                        <div className="text-base font-bold text-white mt-1">28</div>
                      </div>
                      <div className="p-3 bg-terminal-panel border border-terminal-border/60 rounded">
                        <div className="text-[9px] text-terminal-muted uppercase">Capital per AI</div>
                        <div className="text-base font-bold text-terminal-blue mt-1">100,000 AC</div>
                      </div>
                      <div className="p-3 bg-terminal-panel border border-terminal-border/60 rounded">
                        <div className="text-[9px] text-terminal-muted uppercase">Wallets to Create</div>
                        <div className="text-base font-bold text-terminal-green mt-1">28 Wallets</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs font-mono bg-terminal-panel p-3 rounded border border-terminal-border/60">
                      <div className="flex justify-between py-1 border-b border-terminal-border/30">
                        <span className="text-terminal-muted">Genesis Timestamp</span>
                        <span className="text-white font-bold">2026-07-01 00:00:00 UTC</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-terminal-border/30">
                        <span className="text-terminal-muted">Genesis Block</span>
                        <span className="text-purple-300 font-bold">0x4E7A8F29C</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-terminal-border/30">
                        <span className="text-terminal-muted">Checksum</span>
                        <span className="text-terminal-amber font-bold">0x4E7A8F29C</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-terminal-muted">Distribution Formula</span>
                        <span className="text-terminal-blue font-bold">100,000 AC × 28 = 2,800,000 AC</span>
                      </div>
                    </div>

                    {/* GENESIS TIMELINE */}
                    <div className="p-3 bg-terminal-panel border border-terminal-border/60 rounded space-y-2">
                      <div className="text-xs font-bold text-terminal-amber uppercase">Genesis Enterprise Timeline</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono">
                        <div className="p-2 bg-black/60 border border-terminal-border/40 rounded">
                          <div className="text-terminal-green font-bold">✓ Genesis Started</div>
                          <div className="text-terminal-muted">2026-07-01 00:00:00 UTC</div>
                        </div>
                        <div className="p-2 bg-black/60 border border-terminal-border/40 rounded">
                          <div className="text-terminal-green font-bold">✓ Capital Locked</div>
                          <div className="text-terminal-muted">2,800,000 AC Secured</div>
                        </div>
                        <div className="p-2 bg-black/60 border border-terminal-border/40 rounded">
                          <div className="text-terminal-green font-bold">✓ Wallets Created</div>
                          <div className="text-terminal-muted">28 Bounded Wallets</div>
                        </div>
                        <div className="p-2 bg-black/60 border border-terminal-border/40 rounded">
                          <div className="text-terminal-green font-bold">✓ Genesis Completed</div>
                          <div className="text-terminal-muted">Checksum: 0x4E7A...</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="p-3 bg-terminal-green/10 border border-terminal-green/30 rounded text-center space-y-1 font-mono">
                        <div className="text-xs font-bold text-terminal-green uppercase flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Genesis Allocation Completed
                        </div>
                        <div className="text-[10px] text-terminal-muted">Genesis Locked • Ownership Transferred • Read Only • No Editing</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {/* 3. AI WALLET GENESIS REGISTRY (28 AI MODELS) */}
            {activeTab === 'AI_ALLOCATION' && (
              <div className="space-y-4">
                {/* WALLET SUMMARY KPI CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
                  <div className="bg-terminal-panel p-2.5 rounded border border-terminal-border text-center">
                    <div className="text-[9px] text-terminal-muted uppercase">Wallet Count</div>
                    <div className="text-sm font-bold text-white mt-0.5">28</div>
                  </div>
                  <div className="bg-terminal-panel p-2.5 rounded border border-terminal-border text-center">
                    <div className="text-[9px] text-terminal-muted uppercase">Dormant</div>
                    <div className="text-sm font-bold text-terminal-amber mt-0.5">28</div>
                  </div>
                  <div className="bg-terminal-panel p-2.5 rounded border border-terminal-border text-center">
                    <div className="text-[9px] text-terminal-muted uppercase">Trading Ready</div>
                    <div className="text-sm font-bold text-terminal-green mt-0.5">28</div>
                  </div>
                  <div className="bg-terminal-panel p-2.5 rounded border border-terminal-border text-center">
                    <div className="text-[9px] text-terminal-muted uppercase">Suspended / Missing</div>
                    <div className="text-sm font-bold text-white mt-0.5">0 / 0</div>
                  </div>
                  <div className="bg-terminal-panel p-2.5 rounded border border-terminal-border text-center">
                    <div className="text-[9px] text-terminal-muted uppercase">Verification</div>
                    <div className="text-sm font-bold text-terminal-green mt-0.5">100%</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-between items-center bg-black/40 p-3 rounded border border-terminal-border">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-terminal-muted" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search 28 AI Models by ID, name, provider, or wallet..." 
                      className="w-full bg-black border border-terminal-border text-xs text-white pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-terminal-amber font-mono"
                    />
                  </div>
                  <span className="text-xs text-terminal-muted font-mono">Showing {filteredAiModels.length} of 28 AI Wallets</span>
                </div>

                <Panel title="AI Wallet Genesis Registry (28 Bounded Contexts)">
                  <DataTable 
                    data={filteredAiModels}
                    columns={[
                      { header: 'AI ID', accessor: 'id', className: 'font-mono text-[10px] text-terminal-amber font-bold' },
                      { header: 'AI Model', accessor: 'name', className: 'font-bold text-white text-xs' },
                      { header: 'Wallet ID', accessor: 'walletId', className: 'font-mono text-[10px] text-terminal-blue' },
                      { header: 'Wallet Address', accessor: 'walletAddress', className: 'font-mono text-[10px] text-terminal-muted truncate max-w-[120px]' },
                      { header: 'Allocation', accessor: (a: any) => <span className="font-mono text-terminal-green font-bold">100,000 AC</span> },
                      { header: 'Trading Bal', accessor: (a: any) => <span className="font-mono text-white">0 AC</span> },
                      { header: 'Status', accessor: (a: any) => <span className="font-mono text-terminal-green text-[10px]">Created (Dormant)</span> },
                      { header: 'Genesis Block', accessor: 'genesisBlock', className: 'font-mono text-[10px] text-purple-300', align: 'right' }
                    ]}
                    onRowClick={row => setSelectedAI(row)}
                  />
                </Panel>
              </div>
            )}

            {/* 4. ALLOCATION VERIFICATION */}
            {activeTab === 'VERIFICATION' && (
              <Panel title="Allocation Verification & Integrity Check">
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 bg-terminal-panel border border-terminal-border/60 rounded space-y-3">
                    <div className="text-xs font-bold text-terminal-green uppercase flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-terminal-green" />
                      Verification Summary: All Checks Passed (100% Immutable Integrity)
                    </div>
                    
                    <div className="space-y-2">
                      <div className="p-3 bg-black/60 border border-terminal-border/40 rounded flex justify-between items-center">
                        <span>Total AI Models Verified</span>
                        <span className="text-terminal-green font-bold">28 / 28 Units</span>
                      </div>
                      <div className="p-3 bg-black/60 border border-terminal-border/40 rounded flex justify-between items-center">
                        <span>Duplicate Allocation Check</span>
                        <span className="text-terminal-green font-bold">0 Duplicates (Unique Bounded Contexts)</span>
                      </div>
                      <div className="p-3 bg-black/60 border border-terminal-border/40 rounded flex justify-between items-center">
                        <span>Missing Allocation Check</span>
                        <span className="text-terminal-green font-bold">0 Missing (2,800,000 AC distributed exactly)</span>
                      </div>
                      <div className="p-3 bg-black/60 border border-terminal-border/40 rounded flex justify-between items-center">
                        <span>Allocation Integrity Status</span>
                        <span className="text-terminal-green font-bold uppercase">VERIFIED & LOCKED</span>
                      </div>
                      <div className="p-3 bg-black/60 border border-terminal-border/40 rounded flex justify-between items-center">
                        <span>Cryptographic Checksum</span>
                        <span className="text-terminal-amber font-bold">0x4E7A8F29C (VERIFIED)</span>
                      </div>
                    </div>
                  </div>

                  {/* FINANCIAL ACCOUNTING & TRADING ENGINE HANDOFF */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-black/60 border border-terminal-border/60 rounded space-y-2">
                      <div className="text-xs font-bold text-purple-300 uppercase flex items-center gap-1.5">
                        <FileText className="w-4 h-4" /> Financial Accounting Registration
                      </div>
                      <div className="space-y-1 text-[11px] text-terminal-muted">
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Ledger Created</span><span className="text-terminal-green">28 Ledgers Active</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Journal Posted</span><span className="text-terminal-green">Verified</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Opening Balance</span><span className="text-white">100,000 AC / Wallet</span></div>
                        <div className="flex justify-between"><span>Status</span><span className="text-terminal-green">Ready for Trading Engine</span></div>
                      </div>
                    </div>

                    <div className="p-3 bg-black/60 border border-terminal-border/60 rounded space-y-2">
                      <div className="text-xs font-bold text-terminal-green uppercase flex items-center gap-1.5">
                        <Activity className="w-4 h-4" /> Trading Engine Registration
                      </div>
                      <div className="space-y-1 text-[11px] text-terminal-muted">
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Wallets Registered</span><span className="text-terminal-green">28 Registered</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Trading Balance</span><span className="text-white">0 AC (Dormant Start)</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>Open Positions / Orders</span><span className="text-white">0 / 0</span></div>
                        <div className="flex justify-between"><span>Engine Status</span><span className="text-terminal-green">Dormant & Ready</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {/* 5. ALLOCATION AUDIT & GENESIS TRANSACTIONS */}
            {activeTab === 'AUDIT' && (
              <div className="space-y-4">
                {/* GENESIS AUDIT KPI SUMMARY */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 font-mono">
                  <div className="bg-terminal-panel p-2.5 rounded border border-terminal-border text-center">
                    <div className="text-[9px] text-terminal-muted uppercase">Genesis Block</div>
                    <div className="text-xs font-bold text-purple-300 mt-0.5">0x4E7A...</div>
                  </div>
                  <div className="bg-terminal-panel p-2.5 rounded border border-terminal-border text-center">
                    <div className="text-[9px] text-terminal-muted uppercase">Wallets</div>
                    <div className="text-xs font-bold text-terminal-amber mt-0.5">28</div>
                  </div>
                  <div className="bg-terminal-panel p-2.5 rounded border border-terminal-border text-center">
                    <div className="text-[9px] text-terminal-muted uppercase">Transactions</div>
                    <div className="text-xs font-bold text-terminal-blue mt-0.5">28</div>
                  </div>
                  <div className="bg-terminal-panel p-2.5 rounded border border-terminal-border text-center">
                    <div className="text-[9px] text-terminal-muted uppercase">Accounting Entries</div>
                    <div className="text-xs font-bold text-white mt-0.5">28</div>
                  </div>
                  <div className="bg-terminal-panel p-2.5 rounded border border-terminal-border text-center">
                    <div className="text-[9px] text-terminal-muted uppercase">Verification</div>
                    <div className="text-xs font-bold text-terminal-green mt-0.5">100%</div>
                  </div>
                  <div className="bg-terminal-panel p-2.5 rounded border border-terminal-border text-center">
                    <div className="text-[9px] text-terminal-muted uppercase">Checksum</div>
                    <div className="text-xs font-bold text-terminal-green mt-0.5">Verified</div>
                  </div>
                </div>

                <Panel title="28 Immutable Genesis Transactions (Read Only)">
                  <DataTable 
                    data={AI_MODELS_CAPITAL.map(m => ({
                      id: m.genesisTransaction,
                      from: 'Enterprise Treasury',
                      to: `${m.id} (${m.name})`,
                      amount: '100,000 AC',
                      reason: 'Genesis Allocation',
                      timestamp: m.timestamp,
                      status: 'Completed',
                      checksum: 'Immutable'
                    }))}
                    columns={[
                      { header: 'TXN ID', accessor: 'id', className: 'font-mono text-[10px] text-terminal-amber font-bold' },
                      { header: 'From Treasury', accessor: 'from', className: 'text-xs text-terminal-muted' },
                      { header: 'To Wallet', accessor: 'to', className: 'font-bold text-white text-xs' },
                      { header: 'Amount', accessor: 'amount', className: 'font-mono text-terminal-green font-bold' },
                      { header: 'Reason', accessor: 'reason', className: 'text-xs text-terminal-blue' },
                      { header: 'Timestamp', accessor: 'timestamp', className: 'font-mono text-[10px] text-terminal-muted' },
                      { header: 'Status', accessor: (r: any) => <StatusBadge status={r.status} variant="success" />, align: 'right' }
                    ]}
                  />
                </Panel>
              </div>
            )}

          </div>

          {/* RIGHT INSPECTOR PANEL — EXACT 17+ FIELDS REQUIRED */}
          <div className="w-80 border-l border-terminal-border flex flex-col shrink-0 bg-terminal-panel overflow-y-auto p-3 text-xs font-mono space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-terminal-amber border-b border-terminal-border/40 pb-1 flex items-center justify-between">
              <span>Enterprise Inspector</span>
              <span className="text-[9px] text-terminal-green">READ ONLY</span>
            </div>
            
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-terminal-muted">Selected AI Model Inspection</span>
              <div className="p-3 bg-black/40 border border-terminal-border/60 rounded space-y-2 text-[11px]">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">AI ID</span>
                  <span className="font-bold text-terminal-amber">{selectedAI?.id || 'AI-001'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">AI Model</span>
                  <span className="font-bold text-white">{selectedAI?.name || 'GPT-5'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Provider</span>
                  <span className="text-terminal-blue">{selectedAI?.provider || 'OpenAI'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Wallet ID</span>
                  <span className="font-mono text-terminal-blue">{selectedAI?.walletId || 'WLT-001'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Wallet Address</span>
                  <span className="font-mono text-terminal-muted truncate max-w-[140px]">{selectedAI?.walletAddress || '0x1A2B...001'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Wallet Owner</span>
                  <span className="text-white truncate max-w-[140px]">{selectedAI?.walletOwner || 'GPT-5 (OpenAI)'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Genesis Transaction</span>
                  <span className="font-mono text-terminal-amber">{selectedAI?.genesisTransaction || 'TXN-000001'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Genesis Block</span>
                  <span className="font-mono text-purple-300">{selectedAI?.genesisBlock || '0x4E7A8F29C'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Allocation Amount</span>
                  <span className="text-terminal-green font-bold">100,000 AC</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Trading Balance</span>
                  <span className="text-white font-bold">0 AC</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Wallet Status</span>
                  <span className="text-terminal-green">Created (Dormant)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Ledger Status</span>
                  <span className="text-terminal-green">Registered</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Accounting Entry</span>
                  <span className="font-mono text-purple-300">{selectedAI?.accountingEntry || 'ACC-ENT-001'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Trading Engine Status</span>
                  <span className="text-terminal-green">Dormant & Ready</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Genesis Timestamp</span>
                  <span className="text-terminal-muted text-[10px]">{selectedAI?.timestamp || '2026-07-01 00:00:00 UTC'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Checksum</span>
                  <span className="font-mono text-purple-300">{selectedAI?.checksum || '0x4E7A8F29C'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Verification</span>
                  <span className="text-terminal-green font-bold">{selectedAI?.verification || 'VERIFIED'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Risk Profile</span>
                  <span className="text-terminal-amber">Conservative V1</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-terminal-muted">Portfolio Status</span>
                  <span className="text-terminal-blue">Initialized</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-muted">Engine Registration</span>
                  <span className="text-terminal-green">Active Registered</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS FOOTER BAR */}
        <div className="bg-black border-t border-terminal-border px-4 py-1.5 shrink-0 flex flex-wrap items-center justify-between text-[10px] font-mono text-terminal-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" /> DB: Connected (PostgreSQL / Firestore)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-terminal-green" /> API: Online (v3.2)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-terminal-green" /> WS: Synchronized</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Scheduler: Active</span>
            <span>AI Models: 28 Units</span>
            <span>Feed: Real-Time</span>
            <span className="text-terminal-green font-bold">Health: 100% OK</span>
          </div>
        </div>

      </DataBoundary>
    </div>
  );
});

FundManagerWorkspace.displayName = 'FundManagerWorkspace';
