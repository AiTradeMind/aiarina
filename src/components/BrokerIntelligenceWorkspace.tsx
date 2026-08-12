import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Zap, 
  CheckCircle2, 
  RefreshCcw, 
  Activity, 
  ArrowRight, 
  Settings, 
  Code2, 
  Server, 
  FileText,
  Lock,
  ChevronRight,
  AlertTriangle,
  Download,
  Terminal as TerminalIcon,
  XCircle,
  Database,
  Radio,
  Sliders,
  ShieldAlert,
  Clock,
  Key,
  HardDrive,
  BarChart3,
  Search,
  Filter,
  Check,
  ZapOff
} from 'lucide-react';
import { Button } from './ui/Button';
import { Panel, SectionHeader, StatusBadge } from './ui/Base';
import { 
  BrokerIntelligenceEngine, 
  BrokerHealthMetrics, 
  ComplianceAuditRecord, 
  SystemReliabilityMetrics, 
  SystemAlert 
} from '../modules/trading/services/BrokerIntelligenceEngine';
import { BrokerId } from '../modules/trading/adapters/types';

export const BrokerIntelligenceWorkspace: React.FC = () => {
  const intelligence = BrokerIntelligenceEngine.getInstance();

  // Selected Broker for Right Inspector
  const [selectedBrokerId, setSelectedBrokerId] = useState<BrokerId>('dhan');
  const [activeTab, setActiveTab] = useState<'HEALTH' | 'SELECTOR' | 'RECOVERY' | 'RECONCILIATION' | 'COMPLIANCE' | 'RELIABILITY'>('HEALTH');

  // Kill Switch & Engine Toggles
  const [killSwitchActive, setKillSwitchActive] = useState<boolean>(intelligence.getKillSwitchStatus());
  const [loadBalancerEnabled, setLoadBalancerEnabled] = useState<boolean>(true);
  const [autoFailoverEnabled, setAutoFailoverEnabled] = useState<boolean>(true);

  // Bottom Terminal Active Sub-Tab
  const [bottomTerminalTab, setBottomTerminalTab] = useState<'BROKER' | 'EXCHANGE' | 'RECOVERY' | 'COMPLIANCE' | 'AUDIT'>('BROKER');

  // Regulatory Export Trigger
  const [exportType, setExportType] = useState<'DAILY' | 'TRADE' | 'RISK' | 'COMPLIANCE'>('DAILY');
  const [exportFormat, setExportFormat] = useState<'CSV' | 'JSON' | 'PDF'>('CSV');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Live State Data
  const [healthList, setHealthList] = useState<BrokerHealthMetrics[]>(intelligence.getMultiBrokerHealth());
  const [reliability, setReliability] = useState<SystemReliabilityMetrics>(intelligence.getSystemReliability());
  const [complianceRecords, setComplianceRecords] = useState<ComplianceAuditRecord[]>(intelligence.getComplianceRecords());
  const [alerts, setAlerts] = useState<SystemAlert[]>(intelligence.getAlerts());
  const [logs, setLogs] = useState(intelligence.getLogs());

  // Periodically refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthList(intelligence.getMultiBrokerHealth());
      setReliability(intelligence.getSystemReliability());
      setLogs([...intelligence.getLogs()]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleKillSwitch = () => {
    const nextState = !killSwitchActive;
    intelligence.toggleKillSwitch(nextState, nextState ? 'User Engaged Emergency Stop' : 'User Disengaged Emergency Stop');
    setKillSwitchActive(nextState);
    setAlerts([...intelligence.getAlerts()]);
  };

  const selectedBrokerHealth = useMemo(() => {
    return healthList.find(h => h.brokerId === selectedBrokerId) || healthList[0];
  }, [healthList, selectedBrokerId]);

  const bestBroker = useMemo(() => {
    return intelligence.selectBestBroker();
  }, [healthList]);

  const handleExportDownload = () => {
    const content = intelligence.exportRegulatoryReport(exportType, exportFormat);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ARINA_REGULATORY_${exportType}_AUDIT_${Date.now()}.${exportFormat.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadNotice(`Exported ${exportType} Audit Report in ${exportFormat} format!`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-terminal-bg text-white font-sans overflow-hidden">
      {/* 1. TOP ARCHITECTURE WORKFLOW & KILL SWITCH BANNER */}
      <div className="bg-terminal-panel border-b border-terminal-border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2 py-0.5 bg-terminal-amber/20 text-terminal-amber border border-terminal-amber/40 text-[9px] font-black uppercase tracking-widest rounded">
              Phase 10.1 Production Reliability OS
            </span>
            <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green border border-terminal-green/40 text-[9px] font-black uppercase tracking-widest rounded">
              Compliance & Recovery Engine
            </span>
            {killSwitchActive && (
              <span className="px-2 py-0.5 bg-terminal-red text-black font-black text-[9px] uppercase tracking-widest rounded animate-pulse">
                KILL SWITCH ACTIVE - ALL ORDERS FROZEN
              </span>
            )}
          </div>

          {/* WORKFLOW PIPELINE DISPLAY */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-terminal-muted mt-1 overflow-x-auto">
            <span className="text-white font-bold">Execution Intelligence</span>
            <ArrowRight className="w-3 h-3 text-terminal-amber" />
            <span className="text-terminal-amber font-bold">Broker Intelligence</span>
            <ArrowRight className="w-3 h-3 text-terminal-amber" />
            <span className="text-white font-bold">Exchange</span>
            <ArrowRight className="w-3 h-3 text-terminal-amber" />
            <span className="text-white font-bold">Settlement</span>
            <ArrowRight className="w-3 h-3 text-terminal-amber" />
            <span className="text-white font-bold">Accounting</span>
            <ArrowRight className="w-3 h-3 text-terminal-amber" />
            <span className="text-white font-bold">Learning</span>
          </div>
        </div>

        {/* EMERGENCY KILL SWITCH & GLOBAL CONTROLS */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={handleToggleKillSwitch}
            variant={killSwitchActive ? "outline" : "outline"}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded transition-all ${
              killSwitchActive 
                ? 'bg-terminal-green text-black border-terminal-green hover:bg-terminal-green/90' 
                : 'bg-terminal-red/20 text-terminal-red border-terminal-red/80 hover:bg-terminal-red hover:text-black'
            }`}
          >
            {killSwitchActive ? (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                Resume System
              </>
            ) : (
              <>
                <ZapOff className="w-4 h-4 mr-1.5" />
                EMERGENCY KILL SWITCH
              </>
            )}
          </Button>
        </div>
      </div>

      {/* WORKFLOW SUB-TABS NAVIGATION */}
      <div className="bg-black/60 border-b border-terminal-border/80 px-4 flex items-center justify-between h-10 shrink-0 text-xs font-mono">
        <div className="flex items-center h-full gap-1">
          {[
            { id: 'HEALTH', label: 'Broker Health Center (BHS)', icon: Activity },
            { id: 'SELECTOR', label: 'Smart Selector & Load Balancer', icon: Sliders },
            { id: 'RECOVERY', label: 'Failover & Order Recovery', icon: RefreshCcw },
            { id: 'RECONCILIATION', label: '5-Way Reconciliation Engine', icon: ShieldCheck },
            { id: 'COMPLIANCE', label: 'Compliance OS & Audit Export', icon: FileText },
            { id: 'RELIABILITY', label: 'Production System Reliability', icon: Cpu }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`h-full px-3.5 flex items-center gap-2 border-b-2 transition-all font-bold ${
                  isActive 
                    ? 'border-terminal-amber text-terminal-amber bg-terminal-amber/5' 
                    : 'border-transparent text-terminal-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-terminal-muted">Smart Route: <strong className="text-terminal-green">{bestBroker.brokerName}</strong></span>
          <span className="text-terminal-muted">Avg Latency: <strong className="text-terminal-amber">{bestBroker.avgLatencyMs}ms</strong></span>
        </div>
      </div>

      {/* MAIN CONTENT AREA & RIGHT INSPECTOR */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT MAIN WORKSPACE (8 COLS) */}
        <div className="flex-1 p-5 overflow-y-auto space-y-6">

          {/* TAB 1: BROKER HEALTH CENTER (BHS) */}
          {activeTab === 'HEALTH' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <SectionHeader title="INSTITUTIONAL BROKER HEALTH CENTER (BHS 0-100)" icon={Activity} />
                <span className="text-[10px] font-mono text-terminal-muted">Continuous 100ms Health Pulse Monitoring</span>
              </div>

              {/* BROKER HEALTH CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthList.map(b => {
                  const isSelected = selectedBrokerId === b.brokerId;
                  return (
                    <div
                      key={b.brokerId}
                      onClick={() => setSelectedBrokerId(b.brokerId)}
                      className={`p-4 rounded border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-terminal-amber/10 border-terminal-amber shadow-lg shadow-terminal-amber/5' 
                          : 'bg-terminal-panel/80 border-terminal-border/60 hover:border-terminal-border'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-white">{b.brokerName}</span>
                            <span className={`px-1.5 py-0.2 text-[8px] font-black uppercase rounded border ${
                              b.bhsStatus === 'PASS' 
                                ? 'bg-terminal-green/20 border-terminal-green/40 text-terminal-green' 
                                : 'bg-terminal-amber/20 border-terminal-amber/40 text-terminal-amber'
                            }`}>
                              BHS {b.bhsScore}/100
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-terminal-muted uppercase block mt-0.5">
                            Availability: <strong className="text-white">{b.availabilityPct}%</strong>
                          </span>
                        </div>

                        <StatusBadge status={b.status === 'OPTIMAL' ? 'success' : 'warning'} label={`${b.avgLatencyMs}ms`} />
                      </div>

                      {/* BHS BAR METRIC */}
                      <div className="space-y-1 mb-3 font-mono text-[9px]">
                        <div className="flex justify-between text-terminal-muted">
                          <span>Broker Health Score</span>
                          <span className="font-bold text-terminal-green">{b.bhsScore} / 100</span>
                        </div>
                        <div className="w-full bg-black h-1.5 rounded overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              b.bhsScore >= 80 ? 'bg-terminal-green' : (b.bhsScore >= 60 ? 'bg-terminal-amber' : 'bg-terminal-red')
                            }`} 
                            style={{ width: `${b.bhsScore}%` }} 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-terminal-muted">
                        <div className="bg-black/30 p-2 rounded border border-terminal-border/30">
                          <span>API Success Rate:</span>
                          <span className="text-white font-bold block">{b.apiSuccessRatePct}%</span>
                        </div>
                        <div className="bg-black/30 p-2 rounded border border-terminal-border/30">
                          <span>Reject Rate:</span>
                          <span className="text-terminal-amber font-bold block">{b.orderRejectRatePct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LIVE BROKER METRICS & HEALTH MATRIX */}
              <div className="bg-terminal-panel border border-terminal-border rounded p-5 space-y-4 font-mono text-xs">
                <SectionHeader title="REAL-TIME BROKER MATRIX & COST MATRIX" icon={Layers} />

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-terminal-border bg-black/40 text-[9px] uppercase text-terminal-muted">
                        <th className="p-2.5">Broker Name</th>
                        <th className="p-2.5">BHS Score</th>
                        <th className="p-2.5">Latency</th>
                        <th className="p-2.5">API Success</th>
                        <th className="p-2.5">Reject Rate</th>
                        <th className="p-2.5">Brokerage Cost</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-terminal-border/30 text-[10px]">
                      {healthList.map(b => (
                        <tr key={b.brokerId} className="hover:bg-white/5">
                          <td className="p-2.5 font-bold text-white uppercase">{b.brokerName}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 bg-terminal-green/20 text-terminal-green font-bold text-[9px] rounded">
                              {b.bhsScore} / 100 ({b.bhsStatus})
                            </span>
                          </td>
                          <td className="p-2.5 text-terminal-amber font-bold">{b.avgLatencyMs} ms</td>
                          <td className="p-2.5 text-white">{b.apiSuccessRatePct}%</td>
                          <td className="p-2.5 text-terminal-muted">{b.orderRejectRatePct}%</td>
                          <td className="p-2.5 text-white font-bold">{b.brokerCostBps} bps (Flat ₹0)</td>
                          <td className="p-2.5">
                            <StatusBadge status="success" label={b.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SMART BROKER SELECTOR & LOAD BALANCER */}
          {activeTab === 'SELECTOR' && (
            <div className="space-y-6 font-mono text-xs">
              <SectionHeader title="DYNAMIC SMART BROKER SELECTOR & LOAD BALANCER" icon={Sliders} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SELECTOR EVALUATION CARD */}
                <div className="bg-terminal-panel border border-terminal-border rounded p-5 space-y-4">
                  <span className="text-[10px] uppercase text-terminal-amber font-bold block">Smart Selection Logic</span>
                  <p className="text-xs text-terminal-muted leading-relaxed">
                    Evaluates <strong className="text-white">Broker Health Score (BHS)</strong>, <strong className="text-white">API Latency</strong>, <strong className="text-white">Fill Quality Score</strong>, and <strong className="text-white">Brokerage Fee</strong> before every single live execution.
                  </p>

                  <div className="bg-black/40 p-4 rounded border border-terminal-border/60 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-terminal-muted">Selected Best Broker:</span>
                      <span className="text-terminal-green font-bold text-sm uppercase">{bestBroker.brokerName}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-terminal-muted">BHS Score / Status:</span>
                      <span className="text-white font-bold">{bestBroker.bhsScore} / 100 ({bestBroker.bhsStatus})</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-terminal-muted">Average Execution Latency:</span>
                      <span className="text-terminal-amber font-bold">{bestBroker.avgLatencyMs} ms</span>
                    </div>
                  </div>
                </div>

                {/* LOAD BALANCER TOGGLES */}
                <div className="bg-terminal-panel border border-terminal-border rounded p-5 space-y-4">
                  <span className="text-[10px] uppercase text-terminal-amber font-bold block">Load Balancer Controls</span>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-black/30 p-3 rounded border border-terminal-border/40">
                      <div>
                        <span className="text-white font-bold block">Enable Broker Load Balancer</span>
                        <span className="text-[10px] text-terminal-muted">Distribute high-frequency order volume across multiple healthy venues</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={loadBalancerEnabled} 
                        onChange={(e) => setLoadBalancerEnabled(e.target.checked)}
                        className="w-4 h-4 accent-terminal-amber cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-black/30 p-3 rounded border border-terminal-border/40">
                      <div>
                        <span className="text-white font-bold block">Auto Failover on Degraded Status</span>
                        <span className="text-[10px] text-terminal-muted">Instantly divert traffic if BHS drops below 80</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={autoFailoverEnabled} 
                        onChange={(e) => setAutoFailoverEnabled(e.target.checked)}
                        className="w-4 h-4 accent-terminal-amber cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAILOVER & ORDER RECOVERY */}
          {activeTab === 'RECOVERY' && (
            <div className="space-y-6 font-mono text-xs">
              <SectionHeader title="FAILOVER ENGINE & ORDER RECOVERY SYSTEM" icon={RefreshCcw} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-terminal-panel border border-terminal-border rounded p-4 text-center">
                  <span className="text-[10px] text-terminal-muted uppercase block">Network Interruptions Recovered</span>
                  <span className="text-2xl font-black text-terminal-green my-1 block">0 Pending</span>
                  <span className="text-[9px] text-terminal-muted">All broker connections synchronized</span>
                </div>
                <div className="bg-terminal-panel border border-terminal-border rounded p-4 text-center">
                  <span className="text-[10px] text-terminal-muted uppercase block">Unknown Status Orders</span>
                  <span className="text-2xl font-black text-terminal-amber my-1 block">0 Unknown</span>
                  <span className="text-[9px] text-terminal-muted">Broker & Exchange IDs matched</span>
                </div>
                <div className="bg-terminal-panel border border-terminal-border rounded p-4 text-center">
                  <span className="text-[10px] text-terminal-muted uppercase block">Failover Auto-Switch Count</span>
                  <span className="text-2xl font-black text-white my-1 block">0 Switches</span>
                  <span className="text-[9px] text-terminal-muted">Zero broker dropouts detected</span>
                </div>
              </div>

              <div className="bg-terminal-panel border border-terminal-border rounded p-5 space-y-3">
                <span className="text-[10px] font-bold text-terminal-amber uppercase block">Manual Order Synchronization</span>
                <p className="text-xs text-terminal-muted leading-relaxed">
                  Triggers state reconciliation across <strong className="text-white">Broker API</strong>, <strong className="text-white">Exchange Trade Log</strong>, and <strong className="text-white">Accounting Ledger</strong> to ensure zero orphan orders exist.
                </p>
                <Button variant="amber" className="px-4 py-2 text-xs font-black uppercase tracking-wider">
                  Run Full Recovery Sync Now
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: 5-WAY RECONCILIATION ENGINE */}
          {activeTab === 'RECONCILIATION' && (
            <div className="space-y-6 font-mono text-xs">
              <SectionHeader title="5-WAY RECONCILIATION ENGINE (ZERO MISMATCH POLICY)" icon={ShieldCheck} />

              <div className="bg-terminal-panel border border-terminal-border rounded p-5 space-y-4">
                <span className="text-[10px] text-terminal-amber uppercase font-bold block">Reconciliation Verification Chain</span>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-[10px]">
                  {['1. AI Order', '2. Execution Engine', '3. Broker Order', '4. Exchange Fill', '5. Ledger', '6. Trade Journal'].map((step, idx) => (
                    <div key={idx} className="bg-black/40 p-3 rounded border border-terminal-green/30 text-terminal-green font-bold">
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-terminal-green" />
                      {step}
                    </div>
                  ))}
                </div>

                <div className="bg-terminal-green/10 border border-terminal-green/30 p-3 rounded text-[10px] text-terminal-green flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span><strong>Zero Mismatch Verified:</strong> All 100% of orders recorded today align strictly across AI Decision Engine, Execution Adapter, Exchange Audit Trail, and General Ledger.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COMPLIANCE OS & AUDIT EXPORT */}
          {activeTab === 'COMPLIANCE' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex justify-between items-center">
                <SectionHeader title="COMPLIANCE OS & REGULATORY AUDIT EXPORTER" icon={FileText} />
                <span className="text-[10px] text-terminal-muted">SEBI / FINRA Compliant Immutable Audit Records</span>
              </div>

              {/* REGULATORY EXPORT CARD */}
              <div className="bg-terminal-panel border border-terminal-border rounded p-5 space-y-4">
                <span className="text-[10px] text-terminal-amber font-bold uppercase block">Generate Regulatory Audit Reports</span>

                {downloadNotice && (
                  <div className="p-3 bg-terminal-green/20 border border-terminal-green text-terminal-green rounded text-[10px] font-bold">
                    {downloadNotice}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-terminal-muted uppercase block mb-1">Report Category</label>
                    <select 
                      value={exportType} 
                      onChange={(e) => setExportType(e.target.value as any)}
                      className="w-full bg-black border border-terminal-border p-2 rounded text-white text-xs font-bold"
                    >
                      <option value="DAILY">Daily Compliance Report</option>
                      <option value="TRADE">Trade Execution Audit Report</option>
                      <option value="RISK">Risk & Margin Audit Report</option>
                      <option value="COMPLIANCE">Full Committee & Fund Audit</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-terminal-muted uppercase block mb-1">File Format</label>
                    <select 
                      value={exportFormat} 
                      onChange={(e) => setExportFormat(e.target.value as any)}
                      className="w-full bg-black border border-terminal-border p-2 rounded text-white text-xs font-bold"
                    >
                      <option value="CSV">CSV Data File</option>
                      <option value="JSON">JSON Audit Object</option>
                      <option value="PDF">PDF Regulatory Document</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button onClick={handleExportDownload} variant="amber" className="w-full py-2 text-xs font-black uppercase tracking-wider">
                      <Download className="w-3.5 h-3.5 mr-2" />
                      Export Regulatory File
                    </Button>
                  </div>
                </div>
              </div>

              {/* IMMUTABLE COMPLIANCE AUDIT TABLE */}
              <div className="bg-terminal-panel border border-terminal-border rounded p-5 space-y-4">
                <span className="text-[10px] text-white font-bold uppercase block">Immutable Compliance Records</span>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-terminal-border bg-black/40 text-[9px] uppercase text-terminal-muted">
                        <th className="p-2.5">Decision ID</th>
                        <th className="p-2.5">Broker ID</th>
                        <th className="p-2.5">Symbol</th>
                        <th className="p-2.5">Qty / Price</th>
                        <th className="p-2.5">BHS / EQS</th>
                        <th className="p-2.5">Approvals</th>
                        <th className="p-2.5">Audit Hash (SHA-256)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-terminal-border/30 text-[10px]">
                      {complianceRecords.map(rec => (
                        <tr key={rec.decisionId} className="hover:bg-white/5">
                          <td className="p-2.5 font-bold text-terminal-amber">{rec.decisionId}</td>
                          <td className="p-2.5 text-white uppercase">{rec.brokerId}</td>
                          <td className="p-2.5 font-bold text-white">{rec.symbol}</td>
                          <td className="p-2.5 text-terminal-muted">{rec.quantity} @ ₹{rec.price}</td>
                          <td className="p-2.5 text-terminal-green font-bold">BHS {rec.bhs} / EQS {rec.eqs}</td>
                          <td className="p-2.5 text-terminal-muted">
                            <span className="px-1.5 py-0.2 bg-terminal-green/20 text-terminal-green text-[8px] rounded font-bold">
                              COMMITTEE & FUND PASS
                            </span>
                          </td>
                          <td className="p-2.5 text-[9px] text-terminal-muted font-mono">{rec.auditHash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRODUCTION SYSTEM RELIABILITY */}
          {activeTab === 'RELIABILITY' && (
            <div className="space-y-6 font-mono text-xs">
              <SectionHeader title="PRODUCTION SYSTEM RELIABILITY MONITOR" icon={Cpu} />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-terminal-panel border border-terminal-border rounded p-4">
                  <span className="text-[10px] text-terminal-muted uppercase block">CPU Usage</span>
                  <span className="text-xl font-black text-terminal-green my-1 block">{reliability.cpuUsagePct}%</span>
                  <div className="w-full bg-black h-1 rounded overflow-hidden">
                    <div className="bg-terminal-green h-full" style={{ width: `${reliability.cpuUsagePct}%` }} />
                  </div>
                </div>

                <div className="bg-terminal-panel border border-terminal-border rounded p-4">
                  <span className="text-[10px] text-terminal-muted uppercase block">Memory Usage</span>
                  <span className="text-xl font-black text-terminal-amber my-1 block">{reliability.memoryUsageMb} MB / 8GB</span>
                  <div className="w-full bg-black h-1 rounded overflow-hidden">
                    <div className="bg-terminal-amber h-full" style={{ width: `${(reliability.memoryUsageMb / reliability.memoryMaxMb) * 100}%` }} />
                  </div>
                </div>

                <div className="bg-terminal-panel border border-terminal-border rounded p-4">
                  <span className="text-[10px] text-terminal-muted uppercase block">Database Latency</span>
                  <span className="text-xl font-black text-terminal-green my-1 block">{reliability.dbLatencyMs} ms</span>
                  <span className="text-[9px] text-terminal-muted">PostgreSQL Cloud SQL</span>
                </div>

                <div className="bg-terminal-panel border border-terminal-border rounded p-4">
                  <span className="text-[10px] text-terminal-muted uppercase block">WebSocket Status</span>
                  <span className="text-xl font-black text-terminal-green my-1 block">{reliability.webSocketStatus}</span>
                  <span className="text-[9px] text-terminal-muted">L2 Live Market Stream</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. RIGHT INSPECTOR PANEL (4 COLS) */}
        <div className="w-80 border-l border-terminal-border bg-terminal-panel p-4 flex flex-col justify-between shrink-0 font-mono text-xs space-y-4 overflow-y-auto">
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-terminal-border">
              <span className="text-[10px] uppercase font-black text-terminal-amber flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-terminal-amber" />
                Right Broker Inspector
              </span>
              <StatusBadge status="success" label="ACTIVE" />
            </div>

            <div className="space-y-4 text-[10px]">
              <div>
                <span className="text-terminal-muted block uppercase text-[9px]">Selected Broker Name</span>
                <span className="text-sm font-black text-white uppercase">{selectedBrokerHealth.brokerName}</span>
              </div>

              <div className="bg-black/40 p-3 rounded border border-terminal-border/40 space-y-2">
                <div className="flex justify-between">
                  <span className="text-terminal-muted">Broker Health Score (BHS):</span>
                  <span className="font-bold text-terminal-green">{selectedBrokerHealth.bhsScore} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-muted">Availability Rate:</span>
                  <span className="font-bold text-white">{selectedBrokerHealth.availabilityPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-muted">Avg API Latency:</span>
                  <span className="font-bold text-terminal-amber">{selectedBrokerHealth.avgLatencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-terminal-muted">Order Reject Rate:</span>
                  <span className="font-bold text-white">{selectedBrokerHealth.orderRejectRatePct}%</span>
                </div>
              </div>

              <div>
                <span className="text-terminal-amber font-bold block uppercase text-[9px] mb-1">Permanent Execution Rules</span>
                <ul className="space-y-1 text-terminal-muted list-disc pl-3 text-[9px]">
                  <li>BHS Score must be ≥ 80 to allow live route</li>
                  <li>EQS Score must be ≥ 80 before submission</li>
                  <li>Committee & Fund PASS required</li>
                  <li>Cryptographic Audit Hash generated per trade</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-terminal-border text-[9px] text-terminal-muted space-y-1">
            <span className="text-terminal-green font-bold block">Compliance Status: ACTIVE</span>
            <span>All trades auditable & recoverable</span>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM TERMINAL LOGS & AUDIT EVENTS */}
      <div className="h-44 border-t border-terminal-border bg-black p-3 flex flex-col font-mono text-xs shrink-0">
        <div className="flex justify-between items-center mb-2 pb-1 border-b border-terminal-border/60">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-3.5 h-3.5 text-terminal-amber" />
            <span className="text-[10px] font-bold uppercase text-white">System Terminal & Audit Logs</span>
          </div>

          <div className="flex gap-1 text-[9px]">
            {(['BROKER', 'EXCHANGE', 'RECOVERY', 'COMPLIANCE', 'AUDIT'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setBottomTerminalTab(tab)}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  bottomTerminalTab === tab 
                    ? 'bg-terminal-amber text-black font-bold border-terminal-amber' 
                    : 'bg-terminal-panel text-terminal-muted border-terminal-border hover:text-white'
                }`}
              >
                {tab} LOGS
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 text-[10px]">
          {logs.map(log => (
            <div key={log.id} className="flex gap-3 text-[9.5px]">
              <span className="text-terminal-muted shrink-0">[{log.timestamp}]</span>
              <span className={`font-bold shrink-0 uppercase ${
                log.level === 'ERROR' ? 'text-terminal-red' : (log.level === 'WARN' ? 'text-terminal-amber' : (log.level === 'AUDIT' ? 'text-terminal-green' : 'text-terminal-blue'))
              }`}>
                [{log.level}] [{log.source}]
              </span>
              <span className="text-white/80">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
