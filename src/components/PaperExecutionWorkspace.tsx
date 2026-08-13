import React, { useState } from 'react';
import { 
  Activity, Play, CheckCircle, Clock, Zap, Shield, ShieldCheck, PieChart, Layers, Settings, FastForward
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { SectionHeader, MetricCard, Toolbar, GlobalSummaryItem } from './ui/Base';
import { DataBoundary, LoadingOverlay } from './ui/Feedback';
import { Button } from './ui/Button';

export const PaperExecutionWorkspace = React.memo(() => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'QUEUE' | 'EXCHANGE' | 'FILL_MONITOR' | 'LATENCY' | 'SLIPPAGE' | 'CERTIFICATES' | 'AUDIT' | 'RUNTIME' | 'INSPECTOR'>('DASHBOARD');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: Activity },
    { id: 'QUEUE', label: 'Execution Queue', icon: Layers },
    { id: 'EXCHANGE', label: 'Exchange Simulator', icon: Play },
    { id: 'FILL_MONITOR', label: 'Fill Monitor', icon: CheckCircle },
    { id: 'LATENCY', label: 'Latency Engine', icon: Clock },
    { id: 'SLIPPAGE', label: 'Slippage Engine', icon: FastForward },
    { id: 'CERTIFICATES', label: 'Certificates', icon: ShieldCheck },
    { id: 'AUDIT', label: 'Execution Audit', icon: Shield },
    { id: 'RUNTIME', label: 'Runtime Engine', icon: Zap },
    { id: 'INSPECTOR', label: 'Inspector', icon: Settings },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-terminal-bg text-white font-sans">
      <DataBoundary data={{}} title="Enterprise Paper Trading Execution Engine">
        <Toolbar>
          <div className="flex items-center gap-2 pr-4 border-r border-terminal-border h-full">
            <Zap className="w-3.5 h-3.5 text-terminal-amber" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-terminal-muted italic">EXECUTION: ACTIVE</span>
          </div>
          <GlobalSummaryItem label="Execution Runtime" value="OPERATIONAL" color="text-terminal-green" />
          <GlobalSummaryItem label="Avg Latency" value="12ms" color="text-terminal-amber" />
          <GlobalSummaryItem label="Fill Rate" value="100%" color="text-terminal-green" />
        </Toolbar>
        
        <div className="bg-terminal-blue/10 border-b border-terminal-blue/30 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-2 text-terminal-blue">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold uppercase tracking-wider">EXECUTION MANDATE:</span>
            <span className="text-gray-300">Execution ONLY. No live trading. No Portfolio Updates. No Risk Validation.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {}} className="h-5 text-[9px] px-2 py-0 border border-terminal-blue text-terminal-blue hover:bg-terminal-blue/20 uppercase">
              FORCE SYNC
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative pb-12">
          {loading && <LoadingOverlay message="Loading Execution data..." />}
          
          <div className="w-64 border-r border-terminal-border flex flex-col shrink-0 bg-black/20 overflow-hidden">
            <SectionHeader title="Execution Navigation" icon={Zap} />
            <div className="flex-1 overflow-y-auto py-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 transition-colors relative text-left",
                    activeTab === tab.id ? "bg-terminal-amber/10 text-terminal-amber border-r-2 border-terminal-amber font-bold" : "text-terminal-muted hover:text-white hover:bg-white/5"
                  )}
                >
                  <tab.icon className={cn("w-4 h-4 shrink-0", activeTab === tab.id ? "text-terminal-amber" : "text-terminal-muted")} />
                  <span className="text-[10px] uppercase tracking-wider truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-black/40">
            {activeTab === 'DASHBOARD' && (
               <div className="space-y-4">
                  <SectionHeader title="Execution Dashboard" icon={Activity} />
                  <div className="grid grid-cols-4 gap-4">
                     <MetricCard title="Queued Orders" value="0" />
                     <MetricCard title="Completed Fills" value="142" />
                     <MetricCard title="Avg Slippage" value="0.00%" trend="Perfect" color="text-terminal-green" />
                     <MetricCard title="Avg Latency" value="12ms" trend="Fast" color="text-terminal-green" />
                  </div>
               </div>
            )}
            
            {activeTab === 'QUEUE' && (
               <div className="space-y-4">
                  <SectionHeader title="Execution Queue" icon={Layers} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Order Queue</span>
                  </div>
               </div>
            )}
            
            {activeTab === 'EXCHANGE' && (
               <div className="space-y-4">
                  <SectionHeader title="Paper Exchange Simulator" icon={Play} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Exchange Matching Engine</span>
                  </div>
               </div>
            )}

            {activeTab === 'FILL_MONITOR' && (
               <div className="space-y-4">
                  <SectionHeader title="Fill Engine Monitor" icon={CheckCircle} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Fill History</span>
                  </div>
               </div>
            )}
            
            {activeTab === 'LATENCY' && (
               <div className="space-y-4">
                  <SectionHeader title="Latency Simulator Engine" icon={Clock} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Latency Configuration & Logs</span>
                  </div>
               </div>
            )}

            {activeTab === 'SLIPPAGE' && (
               <div className="space-y-4">
                  <SectionHeader title="Slippage Engine" icon={FastForward} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Slippage Rules</span>
                  </div>
               </div>
            )}

            {activeTab === 'CERTIFICATES' && (
               <div className="space-y-4">
                  <SectionHeader title="Execution Certificate Engine" icon={ShieldCheck} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex flex-col items-center justify-center gap-4">
                     <ShieldCheck className="w-12 h-12 text-terminal-green opacity-50" />
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">SHA256 Execution Proofs</span>
                  </div>
               </div>
            )}

            {activeTab === 'AUDIT' && (
               <div className="space-y-4">
                  <SectionHeader title="Execution Audit Engine" icon={Shield} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Execution Event Audit Log</span>
                  </div>
               </div>
            )}

            {activeTab === 'RUNTIME' && (
               <div className="space-y-4">
                  <SectionHeader title="Execution Runtime Engine" icon={Zap} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Workers & Recovery</span>
                  </div>
               </div>
            )}

            {activeTab === 'INSPECTOR' && (
               <div className="space-y-4">
                  <SectionHeader title="Execution Inspector" icon={Settings} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Detailed Execution View</span>
                  </div>
               </div>
            )}
          </div>
        </div>
      </DataBoundary>
    </div>
  );
});
