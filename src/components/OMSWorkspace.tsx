import React, { useState, useEffect } from 'react';
import { 
  Activity, Server, Database, Shield, Box, FileText, CheckCircle, Clock, CheckSquare, CheckCircle2, PlayCircle, Eye, AlertCircle, RefreshCcw
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { SectionHeader, StatusBadge, MetricCard, Toolbar, GlobalSummaryItem } from './ui/Base';
import { DataBoundary, LoadingOverlay } from './ui/Feedback';
import { Button } from './ui/Button';

export const OMSWorkspace = React.memo(() => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'BOOK' | 'QUEUE' | 'RUNTIME' | 'LIFECYCLE' | 'AUDIT' | 'CERTIFICATES' | 'INSPECTOR'>('DASHBOARD');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: Activity },
    { id: 'BOOK', label: 'Order Book', icon: Database },
    { id: 'QUEUE', label: 'Queue', icon: Server },
    { id: 'RUNTIME', label: 'Runtime', icon: PlayCircle },
    { id: 'LIFECYCLE', label: 'Lifecycle', icon: RefreshCcw },
    { id: 'AUDIT', label: 'Audit Engine', icon: Shield },
    { id: 'CERTIFICATES', label: 'Certificates', icon: FileText },
    { id: 'INSPECTOR', label: 'Inspector', icon: Eye },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-terminal-bg text-white font-sans">
      <DataBoundary data={{}} title="Enterprise OMS Workspace">
        <Toolbar>
          <div className="flex items-center gap-2 pr-4 border-r border-terminal-border h-full">
            <Server className="w-3.5 h-3.5 text-terminal-amber" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-terminal-muted italic">OMS: ACTIVE</span>
          </div>
          <GlobalSummaryItem label="Queue Status" value="HEALTHY" color="text-terminal-green" />
          <GlobalSummaryItem label="Paper Router" value="CONNECTED" color="text-terminal-green" />
          <GlobalSummaryItem label="Unprocessed" value="0" color="text-terminal-muted" />
        </Toolbar>
        
        <div className="bg-terminal-blue/10 border-b border-terminal-blue/30 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-2 text-terminal-blue">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold uppercase tracking-wider">OMS MANDATE:</span>
            <span className="text-gray-300">Converts Decision Packages to Orders. Paper Trading Only.</span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative pb-12">
          {loading && <LoadingOverlay message="Loading OMS data..." />}
          
          <div className="w-64 border-r border-terminal-border flex flex-col shrink-0 bg-black/20 overflow-hidden">
            <SectionHeader title="OMS Navigation" icon={Box} />
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
                  <SectionHeader title="OMS Dashboard" icon={Activity} />
                  <div className="grid grid-cols-4 gap-4">
                     <MetricCard title="Total Orders" value="1,204" trend="+4" />
                     <MetricCard title="Queued" value="0" trend="0" />
                     <MetricCard title="Filled" value="1,190" trend="+4" />
                     <MetricCard title="Rejected" value="14" trend="0" color="text-terminal-red" />
                  </div>
               </div>
            )}
            
            {activeTab === 'BOOK' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise Order Book" icon={Database} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Order Book View</span>
                  </div>
               </div>
            )}
            
            {activeTab === 'QUEUE' && (
               <div className="space-y-4">
                  <SectionHeader title="Order Execution Queue" icon={Server} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Queue Status View</span>
                  </div>
               </div>
            )}

            {activeTab === 'RUNTIME' && (
               <div className="space-y-4">
                  <SectionHeader title="OMS Runtime Engine" icon={PlayCircle} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Runtime Metrics</span>
                  </div>
               </div>
            )}
            
            {activeTab === 'LIFECYCLE' && (
               <div className="space-y-4">
                  <SectionHeader title="Order Lifecycle Engine" icon={RefreshCcw} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Lifecycle Tracking</span>
                  </div>
               </div>
            )}

            {activeTab === 'AUDIT' && (
               <div className="space-y-4">
                  <SectionHeader title="Order Audit Engine" icon={Shield} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Audit Logs</span>
                  </div>
               </div>
            )}

            {activeTab === 'CERTIFICATES' && (
               <div className="space-y-4">
                  <SectionHeader title="Order Certificate Engine" icon={FileText} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Execution Certificates</span>
                  </div>
               </div>
            )}

            {activeTab === 'INSPECTOR' && (
               <div className="space-y-4">
                  <SectionHeader title="Order Inspector" icon={Eye} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Order Inspector</span>
                  </div>
               </div>
            )}
          </div>
        </div>
      </DataBoundary>
    </div>
  );
});
