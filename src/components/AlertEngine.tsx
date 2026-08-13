import React, { useState } from 'react';
import { 
  Search, RefreshCcw, Download, Sliders, CheckCircle2, ShieldAlert, Activity, Server, Clock, BarChart2
} from 'lucide-react';
import { motion } from 'motion/react';

interface AlertEngineProps {
  showToast: (msg: string) => void;
}

export function AlertEngine({ showToast }: AlertEngineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRule, setSelectedRule] = useState('RULE-301');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-terminal-border">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" /> AI ARINA Alert Engine (/alert-engine)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise rule automation, workflows, escalation pathways, notification routing, and trigger execution engines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => showToast('Compiled and deployed rule triggers to runtime.')} className="px-3 py-2 bg-slate-900 border border-terminal-border text-slate-200 hover:text-white rounded-lg text-xs flex items-center gap-1.5 font-mono">
            <RefreshCcw className="w-3.5 h-3.5 text-emerald-400" /> Deploy Rules
          </button>
          <button onClick={() => showToast('Exported alert engine schema and routing config.')} className="px-3 py-2 bg-slate-900 border border-terminal-border text-slate-200 hover:text-white rounded-lg text-xs flex items-center gap-1.5 font-mono">
            <Download className="w-3.5 h-3.5 text-blue-400" /> Export Rules
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* MAIN CONTENT (3 Columns) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* EXECUTIVE RULE CONTROL KPI HEADER */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Active Rules</div>
              <div className="text-xl font-bold font-mono text-cyan-400">48</div>
              <div className="text-[9px] text-cyan-400">Deployed rules</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Workflows</div>
              <div className="text-xl font-bold font-mono text-amber-400">12</div>
              <div className="text-[9px] text-amber-400">Active pipelines</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Escalation Routes</div>
              <div className="text-xl font-bold font-mono text-purple-400">8</div>
              <div className="text-[9px] text-purple-400">Multi-tier</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Trigger Latency</div>
              <div className="text-xl font-bold font-mono text-emerald-400">1.2ms</div>
              <div className="text-[9px] text-emerald-400">Real-time eval</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Success Rate</div>
              <div className="text-xl font-bold font-mono text-emerald-400">99.9%</div>
              <div className="text-[9px] text-emerald-400">Routing success</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Active Triggers</div>
              <div className="text-xl font-bold font-mono text-blue-400">342/m</div>
              <div className="text-[9px] text-slate-500">Evaluated</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Dead-Letter</div>
              <div className="text-xl font-bold font-mono text-rose-400">0</div>
              <div className="text-[9px] text-slate-500">Zero drop</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Version</div>
              <div className="text-xl font-bold font-mono text-white">v4.8</div>
              <div className="text-[9px] text-emerald-400">Latest schema</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Engine Status</div>
              <div className="text-xl font-bold font-mono text-emerald-400">Active</div>
              <div className="text-[9px] text-emerald-400">Synchronized</div>
            </div>
          </div>

          {/* SEARCH & RULE ACTIONS BAR */}
          <div className="p-4 bg-[#0d121e] border border-terminal-border rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alert rules, triggers, workflows..." 
                className="w-full bg-black/60 border border-terminal-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button onClick={() => showToast('Created new alert automation rule successfully.')} className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow">
                <Sliders className="w-3.5 h-3.5" /> + New Alert Rule
              </button>
            </div>
          </div>

          {/* ALERT RULES & AUTOMATION MATRIX */}
          <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Alert Rules & Automation Matrix
              </h3>
              <span className="text-xs text-cyan-400 font-mono">48 Active Rules Compiled</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-terminal-border text-slate-400 text-[10px] uppercase bg-black/40">
                    <th className="p-2.5">Rule ID</th>
                    <th className="p-2.5">Rule Name & Objective</th>
                    <th className="p-2.5">Trigger Condition</th>
                    <th className="p-2.5">Target Module</th>
                    <th className="p-2.5">Severity</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/60 text-[11px]">
                  {[
                    { ruleId: 'RULE-301', name: 'RSI Volatility Breached', cond: 'RSI > 85.0 on EUR/USD', mod: 'Trading Engine', sev: 'CRITICAL', status: 'ACTIVE' },
                    { ruleId: 'RULE-302', name: 'Knowledge Graph Delta High', cond: 'Sync delta > 500ms', mod: 'Knowledge Graph', sev: 'HIGH', status: 'ACTIVE' },
                    { ruleId: 'RULE-303', name: 'HSM Signature Delay', cond: 'Signing time > 120ms', mod: 'Crypto Audit', sev: 'CRITICAL', status: 'ACTIVE' },
                    { ruleId: 'RULE-304', name: 'AI Committee Dissent Rate', cond: 'Dissent > 25.0%', mod: 'AI Consensus', sev: 'MEDIUM', status: 'MONITORING' },
                    { ruleId: 'RULE-305', name: 'Paper Trading Capital Variance', cond: 'Variance > $10,000', mod: 'Paper Trading', sev: 'LOW', status: 'ACTIVE' }
                  ].map((r, idx) => (
                    <tr key={idx} onClick={() => setSelectedRule(r.ruleId)} className={`hover:bg-black/40 cursor-pointer ${selectedRule === r.ruleId ? 'bg-cyan-500/10' : ''}`}>
                      <td className="p-2.5 text-cyan-400 font-bold">{r.ruleId}</td>
                      <td className="p-2.5 text-white font-bold">{r.name}</td>
                      <td className="p-2.5 text-slate-300">{r.cond}</td>
                      <td className="p-2.5 text-amber-300">{r.mod}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${r.sev === 'CRITICAL' || r.sev === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                          {r.sev}
                        </span>
                      </td>
                      <td className="p-2.5 text-emerald-400">{r.status}</td>
                      <td className="p-2.5 text-right">
                        <button onClick={(e) => { e.stopPropagation(); showToast(`Configuring rule ${r.ruleId}`); }} className="text-cyan-400 hover:underline">Configure</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* WORKFLOWS & ESCALATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4">
              <h3 className="font-bold text-white text-sm uppercase">Workflow Automation Pipelines</h3>
              <p className="text-xs text-slate-400">Automated multi-step event processing pipelines.</p>
              <div className="space-y-2.5 text-xs font-mono">
                {[
                  { flow: 'Pipeline Alpha: Critical Trading Halt', steps: 'Trigger -> Isolate -> Webhook -> PagerDuty', status: 'Running' },
                  { flow: 'Pipeline Beta: Crypto HSM Failover', steps: 'Trigger -> Verify Backup -> Switch HSM Key', status: 'Running' },
                  { flow: 'Pipeline Gamma: Audit Log Seal', steps: 'Trigger -> Hash Chain -> Immutable Register', status: 'Running' }
                ].map((w, idx) => (
                  <div key={idx} className="p-3 bg-black/40 border border-terminal-border rounded-lg space-y-1">
                    <div className="flex justify-between">
                      <strong className="text-white">{w.flow}</strong>
                      <span className="text-emerald-400 font-bold">{w.status}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Sequence: {w.steps}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4">
              <h3 className="font-bold text-white text-sm uppercase">Escalation & Routing Pathways</h3>
              <p className="text-xs text-slate-400">Multi-tier tier assignment and notification dispatch rules.</p>
              <div className="space-y-2.5 text-xs font-mono">
                {[
                  { tier: 'Tier 1: Automated Triage', target: 'AI Neural Filter (Immediate)', sla: '< 1s' },
                  { tier: 'Tier 2: SOC Analyst Watch', target: 'Security Operations Center (Rotation)', sla: '< 5m' },
                  { tier: 'Tier 3: Executive Duty Officer', target: 'Primary On-Call Duty Engineer', sla: '< 15m' }
                ].map((e, idx) => (
                  <div key={idx} className="p-3 bg-black/40 border border-terminal-border rounded-lg space-y-1">
                    <div className="flex justify-between">
                      <strong className="text-white">{e.tier}</strong>
                      <span className="text-cyan-400 font-bold">SLA: {e.sla}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Target Endpoint: {e.target}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NOTIFICATION CHANNELS & TRIGGER ENGINE STATS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4">
              <h3 className="font-bold text-white text-sm uppercase">Notification Routing Channels</h3>
              <div className="space-y-2 text-xs font-mono">
                {[
                  { channel: 'PagerDuty Enterprise Integration', status: 'Connected (P1 Only)', rate: '100%' },
                  { channel: 'Slack #ai-arina-soc Webhook', status: 'Connected (Live Stream)', rate: '99.9%' },
                  { channel: 'Enterprise SIEM (Splunk/Elastic)', status: 'Connected (Syslog)', rate: '100%' },
                  { channel: 'SMS Gateway (Twilio Primary)', status: 'Standby', rate: '99.8%' }
                ].map((c, idx) => (
                  <div key={idx} className="p-2.5 bg-black/40 border border-terminal-border rounded flex justify-between items-center">
                    <div>
                      <strong className="text-white block">{c.channel}</strong>
                      <span className="text-[10px] text-slate-400">{c.status}</span>
                    </div>
                    <span className="text-emerald-400 font-bold">{c.rate}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4">
              <h3 className="font-bold text-white text-sm uppercase">Trigger Engine Runtime Analytics</h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-black/40 border border-terminal-border rounded flex justify-between">
                  <span className="text-slate-400">Total Evaluations (24h)</span>
                  <strong className="text-white">492,810</strong>
                </div>
                <div className="p-3 bg-black/40 border border-terminal-border rounded flex justify-between">
                  <span className="text-slate-400">Trigger Match Rate</span>
                  <strong className="text-cyan-400">0.07% (342 matched)</strong>
                </div>
                <div className="p-3 bg-black/40 border border-terminal-border rounded flex justify-between">
                  <span className="text-slate-400">Average Execution Latency</span>
                  <strong className="text-emerald-400">1.2ms</strong>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* DOCKED INSPECTOR */}
        <div className="space-y-4">
          <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4 sticky top-4">
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <h3 className="font-bold text-white text-sm uppercase">Alert Engine Inspector</h3>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded">ACTIVE</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Selected Rule ID</span>
                <div className="text-cyan-400 font-bold">{selectedRule}</div>
              </div>

              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Execution Engine</span>
                <div className="text-emerald-400">v4.8 Real-Time Stream</div>
              </div>

              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Routing Destination</span>
                <div className="text-amber-300">PagerDuty + Slack #soc</div>
              </div>

              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Throttle Limit</span>
                <div className="text-slate-300">1 alert per 300s</div>
              </div>

              <div className="space-y-2 pt-2 border-t border-terminal-border">
                <button onClick={() => showToast('Simulated test trigger successfully.')} className="w-full py-1.5 bg-slate-900 border border-terminal-border text-slate-200 hover:text-white rounded text-xs font-sans">
                  Run Test Trigger
                </button>
                <button onClick={() => showToast('Toggled alert rule status.')} className="w-full py-1.5 bg-slate-900 border border-terminal-border text-slate-200 hover:text-white rounded text-xs font-sans">
                  Disable Rule Temporarily
                </button>
              </div>
            </div>

            <button onClick={() => showToast(`Saved and compiled rule ${selectedRule} successfully.`)} className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs rounded font-bold transition-all shadow">
              Save & Compile Rules
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
