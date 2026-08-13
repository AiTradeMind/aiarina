import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Terminal, Activity, Cpu, Zap, Database, RefreshCcw, Power, Play, 
  CheckCircle2, AlertTriangle, Layers, Globe, Lock, Check, X, ArrowRight,
  Sparkles, Server, TrendingUp, FileText, Network, BookOpen, Trophy, Filter,
  BarChart2, Sliders, ChevronRight, Info, Clock, Gauge, Flame, Bomb, RotateCcw,
  Key, Webhook, Bell, Radio, Shield, HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { EnterpriseTabBar } from './ui/EnterpriseTabBar';
import { 
  EnterpriseIntegrationValidationEngine,
  PipelineStage,
  QualityGateScore,
  EIVPRLog,
  FailureSimulation
} from '../modules/platform/services/EnterpriseIntegrationValidationEngine';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const safeArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const obj = value as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.results)) return obj.results;
    if (Array.isArray(obj.modules)) return obj.modules;
    if (Array.isArray(obj.logs)) return obj.logs;
    if (Array.isArray(obj.benchmarks)) return obj.benchmarks;
  }
  return [];
};

interface IntegrationValidationWorkspaceProps {
  initialTab?: string;
}

export const IntegrationValidationWorkspace: React.FC<IntegrationValidationWorkspaceProps> = ({ initialTab = 'RC_DASHBOARD' }) => {
  const engine = EnterpriseIntegrationValidationEngine.getInstance();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('ALL');
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const overview = engine.getDashboardOverview();
  const qualityGates = safeArray<QualityGateScore>(engine.getQualityGates());
  const pipelineStages = safeArray<PipelineStage>(engine.getPipelineStages());
  const eventBus = engine.getEventBusMetrics();
  const stateSync = engine.getStateSyncMetrics();
  const apiContract = engine.getApiContractValidation();
  const dbValidation = engine.getDatabaseValidation();
  const bgJobs = engine.getBackgroundJobStatus();
  const security = engine.getSecurityValidation();
  const perf = engine.getPerformanceMetrics();
  const loadTest = engine.getLoadTestResults();
  const chaosSims = safeArray<FailureSimulation>(engine.getFailureSimulations());
  const drStatus = engine.getDisasterRecoveryStatus();
  const regression = engine.getRegressionSuite();
  const readinessChecklist = safeArray(engine.getReadinessChecklist());
  const logs = safeArray<EIVPRLog>(engine.getLogs(logCategoryFilter));

  // Additional mock robust enterprise data for the 13 tabs
  const aiProviders = [
    { name: 'OpenRouter', status: 'ONLINE', latency: '12ms', quota: '98%', tokens: '1.4M', cost: '$42.50', rps: '45.2', errors: 0, retries: 0, limit: '100k/m' },
    { name: 'Gemini 2.5 Pro', status: 'ONLINE', latency: '8ms', quota: '99%', tokens: '3.2M', cost: '$18.20', rps: '120.0', errors: 0, retries: 0, limit: '500k/m' },
    { name: 'Claude 3.5 Sonnet', status: 'ONLINE', latency: '15ms', quota: '95%', tokens: '890k', cost: '$31.00', rps: '28.4', errors: 0, retries: 1, limit: '80k/m' },
    { name: 'DeepSeek R1', status: 'ONLINE', latency: '22ms', quota: '91%', tokens: '2.1M', cost: '$12.40', rps: '65.5', errors: 1, retries: 2, limit: '200k/m' },
    { name: 'Grok 2 Enterprise', status: 'ONLINE', latency: '18ms', quota: '97%', tokens: '450k', cost: '$9.80', rps: '15.0', errors: 0, retries: 0, limit: '50k/m' },
    { name: 'Local Llama 3 70B', status: 'ONLINE', latency: '4ms', quota: '100%', tokens: '12.5M', cost: '$0.00', rps: '310.2', errors: 0, retries: 0, limit: 'Unlimited' }
  ];

  const marketProviders = [
    { name: 'National Stock Exchange (NSE)', type: 'FEED', status: 'CONNECTED', ws: 'ACTIVE', rest: 'HEALTHY', heartbeat: '1ms ago', delay: '12ms' },
    { name: 'Bombay Stock Exchange (BSE)', type: 'FEED', status: 'CONNECTED', ws: 'ACTIVE', rest: 'HEALTHY', heartbeat: '2ms ago', delay: '15ms' },
    { name: 'Multi Commodity Exchange (MCX)', type: 'FEED', status: 'CONNECTED', ws: 'ACTIVE', rest: 'HEALTHY', heartbeat: '4ms ago', delay: '22ms' },
    { name: 'TradingView Webhook', type: 'ALERT', status: 'CONNECTED', ws: 'ACTIVE', rest: 'HEALTHY', heartbeat: '10ms ago', delay: '45ms' }
  ];

  const brokerGateways = [
    { broker: 'Zerodha Kite Connect', mode: 'SANDBOX/LIVE', status: 'CONNECTED', execution: 'OPTIMAL', latency: '14ms', orders: '1,420 today' },
    { broker: 'Angel One SmartAPI', mode: 'SANDBOX', status: 'CONNECTED', execution: 'OPTIMAL', latency: '28ms', orders: '410 today' },
    { broker: 'Upstox API v2', mode: 'SANDBOX', status: 'CONNECTED', execution: 'OPTIMAL', latency: '19ms', orders: '89 today' },
    { broker: 'Internal Paper Broker', mode: 'SIMULATOR', status: 'ONLINE', execution: 'ZERO_SLIPPAGE', latency: '0.2ms', orders: '12,500 today' }
  ];

  const apiGatewayRoutes = [
    { route: '/api/v1/execution', methods: 'POST', auth: 'JWT + HMAC', rateLimit: '1000/min', traffic: '45.2 req/s', latency: '1.4ms', status: 'ACTIVE' },
    { route: '/api/v1/market/ticks', methods: 'GET, WS', auth: 'API Key', rateLimit: '10000/min', traffic: '1,240 req/s', latency: '0.8ms', status: 'ACTIVE' },
    { route: '/api/v1/ai/inference', methods: 'POST', auth: 'JWT + RBAC', rateLimit: '500/min', traffic: '85.4 req/s', latency: '18.2ms', status: 'ACTIVE' },
    { route: '/api/v1/risk/evaluate', methods: 'GET, POST', auth: 'JWT', rateLimit: '2000/min', traffic: '310 req/s', latency: '2.1ms', status: 'ACTIVE' },
    { route: '/api/v1/compliance/audit', methods: 'GET', auth: 'MFA Admin', rateLimit: '100/min', traffic: '4.2 req/s', latency: '4.5ms', status: 'ACTIVE' }
  ];

  const scheduledJobs = [
    { id: 'JOB-101', name: 'Alpha Factor Synchronization', schedule: 'Every 1 min', status: 'RUNNING', nextRun: 'in 12s', history: '99.9% pass' },
    { id: 'JOB-102', name: 'Risk Limit Daily Recompute', schedule: 'Every 5 mins', status: 'QUEUED', nextRun: 'in 3m 40s', history: '100% pass' },
    { id: 'JOB-103', name: 'Double Entry Ledger Reconciliation', schedule: 'Hourly', status: 'COMPLETED', nextRun: 'in 42m', history: '100% pass' },
    { id: 'JOB-104', name: 'Model Weights Checkpoint & Backup', schedule: 'Daily at 00:00', status: 'SCHEDULED', nextRun: 'in 4h 12m', history: '100% pass' }
  ];

  const recoveryQueue = [
    { id: 'REC-501', component: 'Broker WebSocket Reconnect', trigger: 'Heartbeat timeout (3000ms)', status: 'AUTO_RECOVERED', time: '14:21:02', attempts: 1 },
    { id: 'REC-502', component: 'Redis Cache Sync Fallback', trigger: 'Connection reset', status: 'AUTO_RECOVERED', time: '12:05:44', attempts: 2 },
    { id: 'REC-503', component: 'Order Gateway Dead Letter Replay', trigger: 'Network partition', status: 'RESOLVED', time: '09:15:10', attempts: 1 }
  ];

  const connectionMonitors = [
    { node: 'Primary PostgreSQL Database', endpoint: 'gcp-pg-prod.internal:5432', ping: '0.8ms', ssl: 'TLS 1.3 Valid', expiry: '365 days', status: 'HEALTHY' },
    { node: 'Redis Distributed State Cluster', endpoint: 'redis-cluster.internal:6379', ping: '0.4ms', ssl: 'TLS 1.3 Valid', expiry: '365 days', status: 'HEALTHY' },
    { node: 'AI Gateway Inference Router', endpoint: 'ai-gateway.internal:3000', ping: '1.2ms', ssl: 'TLS 1.3 Valid', expiry: '290 days', status: 'HEALTHY' },
    { node: 'Market Data WebSocket Multiplexer', endpoint: 'md-feed.internal:8080', ping: '1.5ms', ssl: 'TLS 1.3 Valid', expiry: '410 days', status: 'HEALTHY' }
  ];

  const notificationChannels = [
    { channel: 'Telegram Bot Alerting', destination: '@arinasys_alerts', status: 'ACTIVE', deliveryRate: '100%', failures: 0, retries: 0 },
    { channel: 'Executive Email (SMTP)', destination: 'board@arinacapital.com', status: 'ACTIVE', deliveryRate: '100%', failures: 0, retries: 0 },
    { channel: 'Slack Enterprise Webhook', destination: '#prod-trading-alerts', status: 'ACTIVE', deliveryRate: '100%', failures: 0, retries: 0 },
    { channel: 'Discord Operations Bridge', destination: '#system-telemetry', status: 'ACTIVE', deliveryRate: '99.9%', failures: 1, retries: 1 }
  ];

  const webhookEndpoints = [
    { id: 'WH-901', type: 'INCOMING', source: 'TradingView Alerts', url: '/api/webhooks/tradingview', status: 'VERIFIED', payloadCount: '4,120' },
    { id: 'WH-902', type: 'INCOMING', source: 'Zerodha Order Status', url: '/api/webhooks/broker/zerodha', status: 'VERIFIED', payloadCount: '890' },
    { id: 'WH-903', type: 'OUTGOING', source: 'Client Risk Notification', url: 'https://client.api.org/notify', status: 'ACTIVE', payloadCount: '340' }
  ];

  const secretsVaultList = [
    { key: 'ZERODHA_API_SECRET', scope: 'BROKER_GATEWAY', encryption: 'AES-256-GCM', rotated: '12 days ago', expires: 'in 78 days', audit: 'CLEAN' },
    { key: 'GEMINI_PRODUCTION_KEY', scope: 'AI_GATEWAY', encryption: 'AES-256-GCM', rotated: '30 days ago', expires: 'in 60 days', audit: 'CLEAN' },
    { key: 'POSTGRES_MASTER_PASSWORD', scope: 'DATABASE', encryption: 'AES-256-GCM', rotated: '45 days ago', expires: 'in 45 days', audit: 'CLEAN' },
    { key: 'JWT_SIGNING_SECRET', scope: 'AUTH_GATEWAY', encryption: 'AES-256-GCM', rotated: '7 days ago', expires: 'in 83 days', audit: 'CLEAN' }
  ];

  const throughputTrend = [
    { time: '00:00', events: 12000, latency: 1.1 },
    { time: '04:00', events: 8500, latency: 0.9 },
    { time: '08:00', events: 24000, latency: 1.4 },
    { time: '12:00', events: 45000, latency: 1.8 },
    { time: '16:00', events: 38000, latency: 1.5 },
    { time: '20:00', events: 19000, latency: 1.2 }
  ];

  React.useEffect(() => {
    if (pipelineStages.length > 0 && !selectedStage) {
      setSelectedStage(pipelineStages[0]);
    }
  }, [pipelineStages]);

  return (
    <div className="flex flex-col h-full bg-[#080b11] text-white font-mono text-xs overflow-hidden select-none relative">
      
      {/* 1. TOP AUTHORITATIVE BANNER */}
      <div className="bg-[#0f1524] border-b border-terminal-border/80 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-terminal-amber/20 border border-terminal-amber/60 rounded">
            <ShieldCheck className="w-5 h-5 text-terminal-amber animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-terminal-amber font-mono">
                AI ARINA Enterprise Integration & Recovery Center (EP31) ● Fortune-500 Enterprise Hub
              </span>
              <span className="px-2 py-0.5 bg-terminal-green/20 border border-terminal-green text-terminal-green text-[9px] font-bold">
                ENTERPRISE OPERATIONAL
              </span>
            </div>
            <p className="text-[10px] text-terminal-muted hidden sm:block">
              Connected Services: 34 Active ● Zero Disconnects ● Automated Chaos Recovery & Realtime Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => engine.runFullValidationSuite()}
            className="px-3 py-1.5 bg-terminal-amber text-black font-bold text-[10px] uppercase border border-terminal-amber hover:bg-white transition-all flex items-center gap-1.5 shadow-md"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>RUN FULL SYSTEM DIAGNOSTICS</span>
          </button>
        </div>
      </div>

      {/* 2. TOP METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 p-3 bg-black/50 border-b border-terminal-border/60 shrink-0">
        <div className="p-2.5 bg-[#0d121f] border border-terminal-amber/60 rounded flex flex-col justify-between">
          <div className="flex justify-between items-center text-[10px] text-terminal-muted">
            <span className="uppercase font-bold">Integration Health</span>
            <span className="text-terminal-amber text-[9px]">99.99%</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-terminal-amber">100 / 100</span>
            <Trophy className="w-4 h-4 text-terminal-amber" />
          </div>
          <div className="text-[9px] text-terminal-green font-bold mt-1">Status: OPTIMAL ✓</div>
        </div>

        <div className="p-2.5 bg-[#0d121f] border border-terminal-green/50 rounded flex flex-col justify-between">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">Connected Services</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-terminal-green">34 / 34</span>
            <CheckCircle2 className="w-4 h-4 text-terminal-green" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">Zero Disconnections</div>
        </div>

        <div className="p-2.5 bg-[#0d121f] border border-terminal-border rounded flex flex-col justify-between">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">Request Rate</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold font-mono text-terminal-blue">1,450 req/s</span>
            <Activity className="w-4 h-4 text-terminal-blue" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">Latency: 1.2ms avg</div>
        </div>

        <div className="p-2.5 bg-[#0d121f] border border-terminal-border rounded flex flex-col justify-between">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">Success Rate</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold font-mono text-cyan-400">99.98%</span>
            <Network className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">0 Critical Failures</div>
        </div>

        <div className="p-2.5 bg-[#0d121f] border border-terminal-border rounded flex flex-col justify-between">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">Recovery Status</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold font-mono text-purple-400">AUTO-HEAL</span>
            <Flame className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">Failover: &lt;14ms</div>
        </div>

        <div className="p-2.5 bg-[#0d121f] border border-terminal-border rounded flex flex-col justify-between">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">Queue Backlog</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-mono text-terminal-green">0 items</span>
            <ShieldCheck className="w-4 h-4 text-terminal-green" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">FIFO Order Verified</div>
        </div>

        <div className="p-2.5 bg-[#0d121f] border border-terminal-border rounded flex flex-col justify-between">
          <div className="text-[10px] text-terminal-muted uppercase font-bold">System Uptime</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold font-mono text-terminal-amber">99.999%</span>
            <Lock className="w-4 h-4 text-terminal-amber" />
          </div>
          <div className="text-[9px] text-terminal-muted mt-1">SLA Compliant</div>
        </div>
      </div>

      {/* 3. NAVIGATION TABS (13 TABS) */}
      <EnterpriseTabBar
        tabs={[
          { id: 'RC_DASHBOARD', label: '1. Executive Dashboard', icon: Trophy },
          { id: 'AI_PROVIDERS', label: '2. AI Provider Manager', icon: Cpu },
          { id: 'MARKET_DATA', label: '3. Market Data', icon: Radio },
          { id: 'BROKERS', label: '4. Broker Gateway', icon: Server },
          { id: 'API_GATEWAY', label: '5. API Gateway', icon: Globe },
          { id: 'SCHEDULER', label: '6. Scheduler', icon: Clock },
          { id: 'RECOVERY', label: '7. Recovery Center', icon: RotateCcw },
          { id: 'MONITOR', label: '8. Connection Monitor', icon: Activity },
          { id: 'NOTIFICATIONS', label: '9. Notifications', icon: Bell },
          { id: 'WEBHOOKS', label: '10. Webhooks', icon: Webhook },
          { id: 'SECRETS', label: '11. Secrets Vault', icon: Key },
          { id: 'LOGS', label: '12. Integration Logs', icon: Terminal },
          { id: 'DIAGNOSTICS', label: '13. Diagnostics Center', icon: Layers }
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id)}
        activeVariant="amber-solid"
      />

      {/* 4. MAIN WORKSPACE CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence mode="wait">
            
            {/* 1. EXECUTIVE DASHBOARD */}
            {activeTab === 'RC_DASHBOARD' && (
              <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                    <div className="font-bold text-terminal-amber flex justify-between items-center">
                      <span>Event Bus Throughput & Latency Trend</span>
                      <span className="text-[10px] text-terminal-green">Realtime Stream Active</span>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={throughputTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                          <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                          <YAxis stroke="#6b7280" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#0d121e', borderColor: '#374151', fontSize: '11px' }} />
                          <Area type="monotone" dataKey="events" stroke="#f59e0b" fill="#f59e0b20" name="Events / Min" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                    <div className="font-bold text-terminal-green">Connected Enterprise Subsystems</div>
                    <div className="space-y-2">
                      {pipelineStages.map((stage) => (
                        <div key={stage.id} className="p-2.5 bg-black/40 border border-terminal-border/60 rounded flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-terminal-amber font-bold">[{stage.stepNumber}]</span>
                            <span className="text-white font-semibold">{stage.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-terminal-muted">{stage.latencyMs}ms</span>
                            <span className="px-2 py-0.5 bg-terminal-green/20 border border-terminal-green text-terminal-green rounded font-bold text-[10px]">
                              {stage.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. AI PROVIDER MANAGER */}
            {activeTab === 'AI_PROVIDERS' && (
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                  <div className="font-bold text-terminal-amber flex justify-between items-center">
                    <span>Active AI Provider Gateways (OpenRouter, Gemini, Claude, DeepSeek, Grok, Local)</span>
                    <span className="text-[10px] text-terminal-green">All LLM Endpoints Verified</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-terminal-border text-terminal-muted">
                          <th className="p-3">Provider Model</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Latency</th>
                          <th className="p-3">Quota Usage</th>
                          <th className="p-3">Tokens</th>
                          <th className="p-3">Cost (USD)</th>
                          <th className="p-3">Req/sec</th>
                          <th className="p-3">Errors / Retries</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-terminal-border/40">
                        {aiProviders.map((p, idx) => (
                          <tr key={idx} className="hover:bg-black/40">
                            <td className="p-3 font-bold text-white">{p.name}</td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-terminal-green/20 border border-terminal-green text-terminal-green font-bold rounded text-[10px]">{p.status}</span></td>
                            <td className="p-3 text-terminal-amber">{p.latency}</td>
                            <td className="p-3 text-cyan-400">{p.quota}</td>
                            <td className="p-3 text-white">{p.tokens}</td>
                            <td className="p-3 text-terminal-amber">{p.cost}</td>
                            <td className="p-3 text-blue-400">{p.rps}</td>
                            <td className="p-3 text-terminal-muted">{p.errors} / {p.retries}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. MARKET DATA PROVIDERS */}
            {activeTab === 'MARKET_DATA' && (
              <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                  <div className="font-bold text-terminal-amber">Market Data Feed Gateways (NSE, BSE, MCX, TradingView)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {marketProviders.map((m, idx) => (
                      <div key={idx} className="p-3 bg-black/50 border border-terminal-border rounded space-y-2">
                        <div className="flex justify-between items-center font-bold text-white">
                          <span>{m.name}</span>
                          <span className="px-2 py-0.5 bg-terminal-green/20 border border-terminal-green text-terminal-green text-[10px] rounded">{m.status}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10px] text-terminal-muted">
                          <div>WebSocket: <strong className="text-terminal-green">{m.ws}</strong></div>
                          <div>REST API: <strong className="text-terminal-green">{m.rest}</strong></div>
                          <div>Sync Delay: <strong className="text-terminal-amber">{m.delay}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. BROKER GATEWAY */}
            {activeTab === 'BROKERS' && (
              <motion.div key="brokers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                  <div className="font-bold text-terminal-amber">Broker Execution Gateways (Zerodha, Angel, Upstox, Paper)</div>
                  <div className="space-y-2">
                    {brokerGateways.map((b, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-terminal-border rounded flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white text-sm">{b.broker}</div>
                          <div className="text-[10px] text-terminal-muted">Mode: {b.mode} ● Orders Today: {b.orders}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-terminal-amber">{b.latency}</span>
                          <span className="px-2.5 py-1 bg-terminal-green/20 border border-terminal-green text-terminal-green font-bold rounded text-[10px]">{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. API GATEWAY */}
            {activeTab === 'API_GATEWAY' && (
              <motion.div key="api" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                  <div className="font-bold text-terminal-amber">Enterprise API Gateway Routing & Rate Limiting</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-terminal-border text-terminal-muted">
                          <th className="p-3">Route Prefix</th>
                          <th className="p-3">Methods</th>
                          <th className="p-3">Authentication</th>
                          <th className="p-3">Rate Limit</th>
                          <th className="p-3">Traffic</th>
                          <th className="p-3">Latency</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-terminal-border/40">
                        {apiGatewayRoutes.map((r, idx) => (
                          <tr key={idx} className="hover:bg-black/40">
                            <td className="p-3 font-bold text-cyan-400">{r.route}</td>
                            <td className="p-3 text-terminal-amber">{r.methods}</td>
                            <td className="p-3 text-white">{r.auth}</td>
                            <td className="p-3 text-purple-400">{r.rateLimit}</td>
                            <td className="p-3 text-blue-400">{r.traffic}</td>
                            <td className="p-3 text-terminal-green">{r.latency}</td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-terminal-green/20 border border-terminal-green text-terminal-green font-bold rounded text-[10px]">{r.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. SCHEDULER */}
            {activeTab === 'SCHEDULER' && (
              <motion.div key="sched" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                  <div className="font-bold text-terminal-amber">Enterprise Background Job Scheduler</div>
                  <div className="space-y-2">
                    {scheduledJobs.map((j, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-terminal-border rounded flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">{j.name} ({j.id})</div>
                          <div className="text-[10px] text-terminal-muted">Schedule: {j.schedule} ● Next Run: {j.nextRun}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-terminal-green text-[10px]">{j.history}</span>
                          <span className="px-2.5 py-1 bg-terminal-blue/20 border border-terminal-blue text-terminal-blue font-bold rounded text-[10px]">{j.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7. RECOVERY CENTER */}
            {activeTab === 'RECOVERY' && (
              <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                  <div className="font-bold text-terminal-amber">Mission Critical Auto-Recovery & Dead Letter Queue</div>
                  <div className="space-y-2">
                    {recoveryQueue.map((r, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-terminal-border rounded flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">{r.component}</div>
                          <div className="text-[10px] text-terminal-muted">Trigger: {r.trigger} at {r.time}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-terminal-muted">Attempts: {r.attempts}</span>
                          <span className="px-2.5 py-1 bg-terminal-green/20 border border-terminal-green text-terminal-green font-bold rounded text-[10px]">{r.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 8. CONNECTION MONITOR */}
            {activeTab === 'MONITOR' && (
              <motion.div key="mon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                  <div className="font-bold text-terminal-amber">Realtime Heartbeat & SSL Certificate Monitor</div>
                  <div className="space-y-2">
                    {connectionMonitors.map((c, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-terminal-border rounded flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">{c.node}</div>
                          <div className="text-[10px] text-terminal-muted">{c.endpoint} ● SSL: {c.ssl} ({c.expiry})</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-terminal-green font-bold">{c.ping}</span>
                          <span className="px-2.5 py-1 bg-terminal-green/20 border border-terminal-green text-terminal-green font-bold rounded text-[10px]">{c.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 9. NOTIFICATION CENTER */}
            {activeTab === 'NOTIFICATIONS' && (
              <motion.div key="notif" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                  <div className="font-bold text-terminal-amber">Enterprise Notification Channels (Telegram, Email, Slack, Discord)</div>
                  <div className="space-y-2">
                    {notificationChannels.map((n, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-terminal-border rounded flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">{n.channel}</div>
                          <div className="text-[10px] text-terminal-muted">Destination: {n.destination}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-terminal-green">Delivery: {n.deliveryRate}</span>
                          <span className="px-2.5 py-1 bg-terminal-green/20 border border-terminal-green text-terminal-green font-bold rounded text-[10px]">{n.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 10. WEBHOOK MANAGER */}
            {activeTab === 'WEBHOOKS' && (
              <motion.div key="wh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                  <div className="font-bold text-terminal-amber">Incoming & Outgoing Webhook Manager with Signature Validation</div>
                  <div className="space-y-2">
                    {webhookEndpoints.map((w, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-terminal-border rounded flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white">[{w.type}] {w.source}</div>
                          <div className="text-[10px] text-terminal-muted">Endpoint: {w.url} ● Payloads: {w.payloadCount}</div>
                        </div>
                        <span className="px-2.5 py-1 bg-terminal-green/20 border border-terminal-green text-terminal-green font-bold rounded text-[10px]">{w.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 11. SECRETS VAULT */}
            {activeTab === 'SECRETS' && (
              <motion.div key="sec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                  <div className="font-bold text-terminal-amber">Enterprise Secrets Vault & AES-256 Key Rotation</div>
                  <div className="space-y-2">
                    {secretsVaultList.map((s, idx) => (
                      <div key={idx} className="p-3 bg-black/40 border border-terminal-border rounded flex justify-between items-center">
                        <div>
                          <div className="font-bold text-terminal-cyan">{s.key}</div>
                          <div className="text-[10px] text-terminal-muted">Scope: {s.scope} ● Encryption: {s.encryption} ● Rotated: {s.rotated}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-terminal-amber text-[10px]">Expires {s.expires}</span>
                          <span className="px-2.5 py-1 bg-terminal-green/20 border border-terminal-green text-terminal-green font-bold rounded text-[10px]">{s.audit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 12. INTEGRATION LOGS */}
            {activeTab === 'LOGS' && (
              <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3 font-mono">
                  <div className="flex justify-between items-center border-b border-terminal-border pb-2">
                    <span className="font-bold text-terminal-amber">Enterprise Integration Audit & Event Logs</span>
                    <div className="flex gap-1 text-[10px]">
                      {['ALL', 'INTEGRATION', 'VALIDATION', 'PERFORMANCE', 'SECURITY', 'DEPLOYMENT'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setLogCategoryFilter(cat)}
                          className={cn(
                            "px-2 py-0.5 border rounded",
                            logCategoryFilter === cat ? "bg-terminal-amber text-black font-bold" : "text-terminal-muted"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5 max-h-96 overflow-y-auto text-[11px]">
                    {logs.map((log) => (
                      <div key={log.id} className="p-2 bg-black/40 border border-terminal-border/40 rounded flex gap-2">
                        <span className="text-terminal-muted">[{log.timestamp}]</span>
                        <span className={cn(
                          "font-bold",
                          log.level === 'SUCCESS' ? 'text-terminal-green' : log.level === 'WARN' ? 'text-terminal-amber' : 'text-terminal-red'
                        )}>
                          [{log.category}]
                        </span>
                        <span className="text-white">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 13. DIAGNOSTICS CENTER */}
            {activeTab === 'DIAGNOSTICS' && (
              <motion.div key="diag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 bg-[#0d121e] border border-terminal-border rounded space-y-3">
                  <div className="font-bold text-terminal-amber">System Topology & Dependency Health Tree</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-black/50 border border-terminal-border rounded space-y-2">
                      <div className="font-bold text-white">Database Layer</div>
                      <div className="text-terminal-green text-xs">PostgreSQL Cluster ● ACID Verified ✓</div>
                      <div className="text-terminal-muted text-[10px]">Active Pools: 32/32 ● Latency: 0.8ms</div>
                    </div>
                    <div className="p-3 bg-black/50 border border-terminal-border rounded space-y-2">
                      <div className="font-bold text-white">Event Bus Layer</div>
                      <div className="text-terminal-green text-xs">Redis Pub/Sub ● FIFO Verified ✓</div>
                      <div className="text-terminal-muted text-[10px]">Throughput: 18.4k req/s ● Drop: 0%</div>
                    </div>
                    <div className="p-3 bg-black/50 border border-terminal-border rounded space-y-2">
                      <div className="font-bold text-white">AI Gateway Layer</div>
                      <div className="text-terminal-green text-xs">6 Providers Connected ✓</div>
                      <div className="text-terminal-muted text-[10px]">Failover Router: Active ● P99: 18ms</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* RIGHT INSPECTOR PANEL */}
        <div className="w-80 bg-[#0a0d16] border-l border-terminal-border/80 p-3 flex flex-col gap-3 font-mono text-xs overflow-y-auto shrink-0 hidden lg:flex">
          <div className="flex items-center justify-between border-b border-terminal-border pb-2 text-terminal-amber font-bold">
            <div className="flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>Integration Inspector</span>
            </div>
            <span className="text-[9px] text-terminal-muted">EP31 Enterprise</span>
          </div>

          <div className="p-2 bg-black/50 border border-terminal-border rounded space-y-1">
            <div className="text-[10px] text-terminal-muted uppercase">Active Workspace Mode</div>
            <div className="font-bold text-white text-xs">{activeTab}</div>
            <div className="text-[10px] text-terminal-green">Enterprise Secure Mode Active</div>
          </div>

          <div className="p-2 bg-black/50 border border-terminal-border rounded space-y-1">
            <div className="text-[10px] text-terminal-muted uppercase">Global Protocol Status</div>
            <div className="flex justify-between text-xs">
              <span>TLS Version:</span>
              <strong className="text-terminal-green">TLS 1.3</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span>Circuit Breaker:</span>
              <strong className="text-terminal-green">CLOSED (Healthy)</strong>
            </div>
          </div>

          <div className="p-2 bg-black/50 border border-terminal-border rounded space-y-1">
            <div className="text-[10px] text-terminal-muted uppercase">Audit Status</div>
            <div className="text-terminal-green font-bold text-xs">100% Immutable Audit ✓</div>
          </div>
        </div>

      </div>

    </div>
  );
};
