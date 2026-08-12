import React, { useState } from 'react';
import { 
  ShieldAlert, Shield, ShieldCheck, Activity, BarChart2, PieChart, Layers, XCircle, AlertTriangle, FileText, CheckCircle, Clock
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { SectionHeader, MetricCard, Toolbar, GlobalSummaryItem } from './ui/Base';
import { DataBoundary, LoadingOverlay } from './ui/Feedback';
import { Button } from './ui/Button';

export const RMSWorkspace = React.memo(() => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'RULES' | 'EXPOSURE' | 'MARGIN' | 'POSITION_LIMITS' | 'ORDER_LIMITS' | 'KILL_SWITCH' | 'CERTIFICATES' | 'AUDIT' | 'INSPECTOR'>('DASHBOARD');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: Activity },
    { id: 'RULES', label: 'Risk Rules', icon: FileText },
    { id: 'EXPOSURE', label: 'Exposure', icon: BarChart2 },
    { id: 'MARGIN', label: 'Margin', icon: PieChart },
    { id: 'POSITION_LIMITS', label: 'Position Limits', icon: Layers },
    { id: 'ORDER_LIMITS', label: 'Order Limits', icon: Clock },
    { id: 'KILL_SWITCH', label: 'Kill Switch', icon: XCircle },
    { id: 'CERTIFICATES', label: 'Certificates', icon: ShieldCheck },
    { id: 'AUDIT', label: 'Risk Audit', icon: ShieldAlert },
    { id: 'INSPECTOR', label: 'Inspector', icon: AlertTriangle },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-terminal-bg text-white font-sans">
      <DataBoundary data={{}} title="Enterprise RMS Workspace">
        <Toolbar>
          <div className="flex items-center gap-2 pr-4 border-r border-terminal-border h-full">
            <Shield className="w-3.5 h-3.5 text-terminal-amber" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-terminal-muted italic">RMS: ACTIVE</span>
          </div>
          <GlobalSummaryItem label="Global Risk Level" value="MODERATE" color="text-terminal-amber" />
          <GlobalSummaryItem label="Margin Utilization" value="42%" color="text-terminal-green" />
          <GlobalSummaryItem label="Circuit Breaker" value="NORMAL" color="text-terminal-green" />
        </Toolbar>
        
        <div className="bg-terminal-blue/10 border-b border-terminal-blue/30 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-2 text-terminal-blue">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold uppercase tracking-wider">RMS MANDATE:</span>
            <span className="text-gray-300">Risk ONLY validates. Risk NEVER executes. Risk NEVER modifies portfolio.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={() => {}} className="h-5 text-[9px] px-2 py-0 border border-red-500 bg-red-900/30 text-red-400 hover:bg-red-900/60 uppercase">
              ACTIVATE KILL SWITCH
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative pb-12">
          {loading && <LoadingOverlay message="Loading RMS data..." />}
          
          <div className="w-64 border-r border-terminal-border flex flex-col shrink-0 bg-black/20 overflow-hidden">
            <SectionHeader title="RMS Navigation" icon={Shield} />
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
                  <SectionHeader title="RMS Dashboard" icon={Activity} />
                  <div className="grid grid-cols-4 gap-4">
                     <MetricCard title="Risk Profiles" value="1" />
                     <MetricCard title="Active Rules" value="14" />
                     <MetricCard title="Gross Exposure" value="₹14,402,000" trend="Within Limit" />
                     <MetricCard title="Margin Utilization" value="42%" trend="Healthy" color="text-terminal-green" />
                  </div>
               </div>
            )}
            
            {activeTab === 'RULES' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise Risk Rules" icon={FileText} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Risk Rules List</span>
                  </div>
               </div>
            )}
            
            {activeTab === 'EXPOSURE' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise Exposure Engine" icon={BarChart2} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Exposure Limits</span>
                  </div>
               </div>
            )}

            {activeTab === 'MARGIN' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise Margin Simulator" icon={PieChart} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Margin Calculations</span>
                  </div>
               </div>
            )}
            
            {activeTab === 'POSITION_LIMITS' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise Position Limits" icon={Layers} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Position Validations</span>
                  </div>
               </div>
            )}

            {activeTab === 'ORDER_LIMITS' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise Order Limits" icon={Clock} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Order Validations</span>
                  </div>
               </div>
            )}

            {activeTab === 'KILL_SWITCH' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise Kill Switch Engine" icon={XCircle} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex flex-col items-center justify-center gap-4">
                     <AlertTriangle className="w-12 h-12 text-terminal-red opacity-50" />
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Kill Switch Controls</span>
                  </div>
               </div>
            )}

            {activeTab === 'CERTIFICATES' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise Risk Certificates" icon={ShieldCheck} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">SHA256 Signatures</span>
                  </div>
               </div>
            )}

            {activeTab === 'AUDIT' && (
               <div className="space-y-4">
                  <SectionHeader title="Enterprise Risk Audit" icon={ShieldAlert} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Risk Event Logs</span>
                  </div>
               </div>
            )}

            {activeTab === 'INSPECTOR' && (
               <div className="space-y-4">
                  <SectionHeader title="Risk Inspector" icon={AlertTriangle} />
                  <div className="bg-terminal-panel border border-terminal-border rounded p-4 h-64 flex items-center justify-center">
                     <span className="text-terminal-muted text-xs uppercase tracking-widest">Detailed Inspector</span>
                  </div>
               </div>
            )}
          </div>
        </div>
      </DataBoundary>
    </div>
  );
});
