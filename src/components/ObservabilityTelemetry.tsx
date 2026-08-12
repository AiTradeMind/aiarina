import React, { useState, useEffect } from 'react';
import { 
  Activity, Server, Database, Cpu, HardDrive, Wifi, ShieldCheck, 
  AlertTriangle, RefreshCcw, Download, Search, CheckCircle2, Clock, 
  Terminal, Globe, Zap, Layers, Filter, Play, Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, LineChart, Line } from 'recharts';

interface ObservabilityTelemetryProps {
  showToast: (msg: string) => void;
}

export function ObservabilityTelemetry({ showToast }: ObservabilityTelemetryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('TRC-9021');
  const [timeRange, setTimeRange] = useState('15m');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Simulated live metric tick
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      // periodic telemetry sync
    }, 4000);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-terminal-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-mono font-bold rounded">
              ENTERPRISE OBSERVABILITY & TELEMETRY
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry Stream Active
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Datadog / Grafana Enterprise Telemetry & Infrastructure Monitor
          </h2>
        </div>
        <div className="flex items-center gap-2.5">
          <select 
            value={timeRange} 
            onChange={(e) => { setTimeRange(e.target.value); showToast(`Time window updated to ${e.target.value}`); }}
            className="bg-slate-900 border border-terminal-border text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="5m">Last 5 Minutes</option>
            <option value="15m">Last 15 Minutes</option>
            <option value="1h">Last 1 Hour</option>
            <option value="24h">Last 24 Hours</option>
          </select>
          <button 
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-2 border rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${isLiveStreaming ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-terminal-border text-slate-400'}`}
          >
            <Zap className="w-3.5 h-3.5" /> {isLiveStreaming ? 'Streaming' : 'Paused'}
          </button>
          <button onClick={() => showToast('Exported enterprise observability metrics bundle.')} className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-terminal-border text-slate-200 text-xs rounded-lg flex items-center gap-1.5 font-mono">
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Export Telemetry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* MAIN CONTENT (3 COLUMNS) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* 1. EXECUTIVE KPI METRICS HEADER (9 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">API Health</div>
              <div className="text-xl font-bold font-mono text-emerald-400">99.99%</div>
              <div className="text-[9px] text-emerald-400">Nominal</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">WebSocket</div>
              <div className="text-xl font-bold font-mono text-cyan-400">2ms</div>
              <div className="text-[9px] text-cyan-400">Sub-ms ping</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Database</div>
              <div className="text-xl font-bold font-mono text-emerald-400">0.8ms</div>
              <div className="text-[9px] text-emerald-400">Pool active</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">AI Health</div>
              <div className="text-xl font-bold font-mono text-purple-400">100%</div>
              <div className="text-[9px] text-purple-400">Gemini 2.5</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Scheduler</div>
              <div className="text-xl font-bold font-mono text-emerald-400">Active</div>
              <div className="text-[9px] text-emerald-400">Cron nominal</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">CPU Usage</div>
              <div className="text-xl font-bold font-mono text-amber-400">34.2%</div>
              <div className="text-[9px] text-amber-400">8 vCPUs</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Memory</div>
              <div className="text-xl font-bold font-mono text-blue-400">4.1 GB</div>
              <div className="text-[9px] text-slate-400">of 16 GB</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Storage</div>
              <div className="text-xl font-bold font-mono text-white">42 GB</div>
              <div className="text-[9px] text-emerald-400">SSD NVMe</div>
            </div>
            <div className="p-3 bg-[#0d121e] border border-terminal-border rounded-xl space-y-1">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Alert Status</div>
              <div className="text-xl font-bold font-mono text-emerald-400">0 P1</div>
              <div className="text-[9px] text-emerald-400">All clear</div>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="p-4 bg-[#0d121e] border border-terminal-border rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search telemetry traces, request hashes, logs..." 
                className="w-full bg-black/60 border border-terminal-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button onClick={() => showToast('Flushed telemetry buffer cache successfully.')} className="px-3 py-2 bg-slate-900 border border-terminal-border text-slate-200 hover:text-white rounded-lg text-xs flex items-center gap-1.5 font-mono">
                <RefreshCcw className="w-3.5 h-3.5 text-cyan-400" /> Flush Buffer
              </button>
              <button onClick={() => showToast('Simulated spike load test across all endpoints.')} className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow">
                <Play className="w-3.5 h-3.5" /> Run Load Test
              </button>
            </div>
          </div>

          {/* 2. REAL-TIME CHARTS (CPU/Memory & Latency Trends) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-terminal-border pb-3">
                <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" /> CPU & Memory Utilization (vCPUs)
                </h3>
                <span className="text-xs text-cyan-400 font-mono">Avg 34.2% Load</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { time: '14:00', cpu: 28, memory: 40 },
                    { time: '14:05', cpu: 32, memory: 42 },
                    { time: '14:10', cpu: 45, memory: 45 },
                    { time: '14:15', cpu: 38, memory: 43 },
                    { time: '14:20', cpu: 30, memory: 41 },
                    { time: '14:25', cpu: 34, memory: 42 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d121e', borderColor: '#334155', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="cpu" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} name="CPU %" />
                    <Area type="monotone" dataKey="memory" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="Memory %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-terminal-border pb-3">
                <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> API Latency & Ingestion Throughput (ms)
                </h3>
                <span className="text-xs text-emerald-400 font-mono">P99: 4.2ms</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { time: '14:00', latency: 3.1, requests: 1200 },
                    { time: '14:05', latency: 4.5, requests: 1850 },
                    { time: '14:10', latency: 5.2, requests: 2400 },
                    { time: '14:15', latency: 3.8, requests: 1950 },
                    { time: '14:20', latency: 2.9, requests: 1400 },
                    { time: '14:25', latency: 3.4, requests: 1650 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d121e', borderColor: '#334155', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} name="Latency (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 3. COMPONENT HEALTH GRID */}
          <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" /> Infrastructure & Subsystem Health Grid
              </h3>
              <span className="text-xs text-emerald-400 font-mono">12/12 Subsystems Nominal</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              {[
                { name: 'REST API Gateway', status: 'Operational', latency: '1.2ms', uptime: '99.99%' },
                { name: 'WebSocket Broadcast', status: 'Operational', latency: '0.9ms', uptime: '100%' },
                { name: 'PostgreSQL / Drizzle ORM', status: 'Operational', latency: '0.8ms', uptime: '99.99%' },
                { name: 'Gemini AI Gateway', status: 'Operational', latency: '145ms', uptime: '100%' },
                { name: 'Cron Scheduler', status: 'Operational', latency: '2.1ms', uptime: '100%' },
                { name: 'Vector Knowledge Graph', status: 'Operational', latency: '4.5ms', uptime: '99.98%' },
                { name: 'Redis Cache Layer', status: 'Operational', latency: '0.4ms', uptime: '100%' },
                { name: 'HSM Cryptographic Signer', status: 'Operational', latency: '12ms', uptime: '100%' }
              ].map((sub, idx) => (
                <div key={idx} className="p-3 bg-black/40 border border-terminal-border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-xs font-sans">{sub.name}</strong>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                    <span>Lat: {sub.latency}</span>
                    <span className="text-emerald-400">{sub.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. LIVE TELEMETRY TRACES DATAGRID */}
          <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" /> Real-Time Traces & Distributed Logs
              </h3>
              <span className="text-xs text-slate-400 font-mono">Showing recent 25 traces</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-terminal-border text-slate-400 text-[10px] uppercase bg-black/40">
                    <th className="p-2.5">Trace Hash</th>
                    <th className="p-2.5">Subsystem</th>
                    <th className="p-2.5">Operation</th>
                    <th className="p-2.5">Duration</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/60 text-[11px]">
                  {[
                    { traceId: 'TRC-9021', sub: 'REST Gateway', op: 'POST /api/gemini/analyze', dur: '142ms', status: '200 OK' },
                    { traceId: 'TRC-9022', sub: 'PostgreSQL', op: 'SELECT * FROM audit_logs', dur: '1.2ms', status: '200 OK' },
                    { traceId: 'TRC-9023', sub: 'WebSocket', op: 'broadcast:telemetry_tick', dur: '0.4ms', status: 'OK' },
                    { traceId: 'TRC-9024', sub: 'HSM Cryptography', op: 'sign:sha256_secp256k1', dur: '12.4ms', status: 'SECURED' },
                    { traceId: 'TRC-9025', sub: 'Vector Graph', op: 'query:embeddings_knn', dur: '4.8ms', status: '200 OK' }
                  ].map((t, idx) => (
                    <tr key={idx} onClick={() => { setSelectedMetric(t.traceId); showToast(`Inspected trace ${t.traceId}`); }} className={`hover:bg-black/40 cursor-pointer ${selectedMetric === t.traceId ? 'bg-cyan-500/10' : ''}`}>
                      <td className="p-2.5 text-cyan-400 font-bold">{t.traceId}</td>
                      <td className="p-2.5 text-slate-300">{t.sub}</td>
                      <td className="p-2.5 text-white">{t.op}</td>
                      <td className="p-2.5 text-amber-300">{t.dur}</td>
                      <td className="p-2.5 text-emerald-400">{t.status}</td>
                      <td className="p-2.5 text-right">
                        <button onClick={(e) => { e.stopPropagation(); showToast(`Inspected trace detail for ${t.traceId}`); }} className="text-cyan-400 hover:underline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* DOCKED OBSERVABILITY INSPECTOR PANEL */}
        <div className="space-y-4">
          <div className="p-5 bg-[#0d121e] border border-terminal-border rounded-xl space-y-4 sticky top-4">
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <h3 className="font-bold text-white text-sm uppercase">Telemetry Inspector</h3>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded">LIVE</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Selected Trace Hash</span>
                <div className="text-cyan-400 font-bold">{selectedMetric}</div>
              </div>

              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Subsystem Route</span>
                <div className="text-white">POST /api/gemini/analyze</div>
              </div>

              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Execution Time</span>
                <div className="text-emerald-400">142.4 milliseconds</div>
              </div>

              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Memory Allocated</span>
                <div className="text-blue-400">24.8 MB Heap</div>
              </div>

              <div className="p-3 bg-black/50 border border-terminal-border rounded-lg space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Container Node</span>
                <div className="text-slate-300">cloud-run-container-01</div>
              </div>

              <div className="space-y-2 pt-2 border-t border-terminal-border">
                <button onClick={() => showToast('Generated flamegraph profile for trace.')} className="w-full py-1.5 bg-slate-900 border border-terminal-border text-slate-200 hover:text-white rounded text-xs font-sans">
                  Generate Flamegraph
                </button>
                <button onClick={() => showToast('Exported raw OpenTelemetry JSON payload.')} className="w-full py-1.5 bg-slate-900 border border-terminal-border text-slate-200 hover:text-white rounded text-xs font-sans">
                  Export OTel JSON
                </button>
              </div>
            </div>

            <button onClick={() => showToast('Marked telemetry trace as verified & optimized.')} className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs rounded font-bold transition-all shadow">
              Acknowledge Trace Event
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
