import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Route,
  Shield,
  Key,
  Lock,
  Gauge,
  Webhook,
  Link2,
  BarChart3,
  History,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
  Server,
  Search,
  Filter,
  Download,
  Upload,
  Activity,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Check,
  Cpu,
  Clock,
  Terminal,
  Workflow
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import {
  GatewayRouteItem,
  GatewayVersionItem,
  GatewayApiKeyItem,
  GatewayRateLimitRule,
  WebhookEndpointItem,
  ExternalConnectorItem,
  GatewayAnalyticsOverview,
  GatewayAuditItem,
  GatewayQaReport
} from '../modules/gateway/types/ep27.types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type TabType =
  | 'dashboard'
  | 'registry'
  | 'analytics'
  | 'monitor'
  | 'auth'
  | 'ratelimit'
  | 'routing'
  | 'middleware'
  | 'errors'
  | 'inspector'
  | 'audit'
  | 'security'
  | 'controls';

export const GatewayWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Data States
  const [dashboard, setDashboard] = useState<GatewayAnalyticsOverview | null>(null);
  const [routes, setRoutes] = useState<GatewayRouteItem[]>([]);
  const [versions, setVersions] = useState<GatewayVersionItem[]>([]);
  const [apiKeys, setApiKeys] = useState<GatewayApiKeyItem[]>([]);
  const [rateLimits, setRateLimits] = useState<GatewayRateLimitRule[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpointItem[]>([]);
  const [connectors, setConnectors] = useState<ExternalConnectorItem[]>([]);
  const [analytics, setAnalytics] = useState<GatewayAnalyticsOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<GatewayAuditItem[]>([]);
  const [qaReport, setQaReport] = useState<GatewayQaReport | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paginationPage, setPaginationPage] = useState<number>(1);
  const pageSize = 8;

  // Selected Endpoint / Route for Inspector
  const [selectedRoute, setSelectedRoute] = useState<GatewayRouteItem | null>(null);

  // Request Monitor Live Stream state
  const [liveStream, setLiveStream] = useState<Array<{
    id: string;
    timestamp: string;
    method: string;
    endpoint: string;
    status: number;
    responseTimeMs: number;
    payloadSizeKb: string;
    correlationId: string;
  }>>([
    { id: 'REQ-9921', timestamp: '14:22:01', method: 'GET', endpoint: '/api/v1/operations/summary', status: 200, responseTimeMs: 12.4, payloadSizeKb: '1.4 KB', correlationId: 'corr-8a19f' },
    { id: 'REQ-9922', timestamp: '14:22:03', method: 'POST', endpoint: '/api/v1/trade/execute', status: 200, responseTimeMs: 18.2, payloadSizeKb: '3.2 KB', correlationId: 'corr-8a20b' },
    { id: 'REQ-9923', timestamp: '14:22:05', method: 'GET', endpoint: '/api/v1/market/tickers', status: 200, responseTimeMs: 8.1, payloadSizeKb: '5.6 KB', correlationId: 'corr-8a21c' },
    { id: 'REQ-9924', timestamp: '14:22:07', method: 'GET', endpoint: '/api/v1/gateway/health', status: 200, responseTimeMs: 4.2, payloadSizeKb: '0.4 KB', correlationId: 'corr-8a22d' },
    { id: 'REQ-9925', timestamp: '14:22:09', method: 'POST', endpoint: '/api/v1/ai/generate', status: 429, responseTimeMs: 45.0, payloadSizeKb: '2.1 KB', correlationId: 'corr-8a23e' }
  ]);

  // Request Tester
  const [testPath, setTestPath] = useState<string>('/api/v1/operations/summary');
  const [testMethod, setTestMethod] = useState<string>('GET');
  const [validationResult, setValidationResult] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        dashRes,
        routesRes,
        verRes,
        keysRes,
        rlRes,
        whRes,
        connRes,
        analyRes,
        auditRes,
        qaRes
      ] = await Promise.all([
        fetchApi<{ success: boolean; data: GatewayAnalyticsOverview }>('/api/gateway/dashboard'),
        fetchApi<{ success: boolean; data: GatewayRouteItem[] }>('/api/gateway/routes'),
        fetchApi<{ success: boolean; data: GatewayVersionItem[] }>('/api/gateway/versions'),
        fetchApi<{ success: boolean; data: GatewayApiKeyItem[] }>('/api/gateway/api-keys'),
        fetchApi<{ success: boolean; data: GatewayRateLimitRule[] }>('/api/gateway/rate-limits'),
        fetchApi<{ success: boolean; data: WebhookEndpointItem[] }>('/api/gateway/webhooks'),
        fetchApi<{ success: boolean; data: ExternalConnectorItem[] }>('/api/gateway/connectors'),
        fetchApi<{ success: boolean; data: GatewayAnalyticsOverview }>('/api/gateway/analytics'),
        fetchApi<{ success: boolean; data: GatewayAuditItem[] }>('/api/gateway/audit'),
        fetchApi<{ success: boolean; data: GatewayQaReport }>('/api/gateway/qa')
      ]);

      if (dashRes?.data) setDashboard(dashRes.data);
      if (routesRes?.data) {
        setRoutes(routesRes.data);
        if (!selectedRoute && routesRes.data.length > 0) setSelectedRoute(routesRes.data[0]);
      }
      if (verRes?.data) setVersions(verRes.data);
      if (keysRes?.data) setApiKeys(keysRes.data);
      if (rlRes?.data) setRateLimits(rlRes.data);
      if (whRes?.data) setWebhooks(whRes.data);
      if (connRes?.data) setConnectors(connRes.data);
      if (analyRes?.data) setAnalytics(analyRes.data);
      if (auditRes?.data) setAuditLogs(auditRes.data);
      if (qaRes?.data) setQaReport(qaRes.data);
    } catch (err: any) {
      console.error('Failed to load gateway data:', err);
      setError('Failed to fetch Enterprise API Gateway & External Integrations data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Simulate live stream incoming requests
    const interval = setInterval(() => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      const endpoints = ['/api/v1/operations/summary', '/api/v1/trade/execute', '/api/v1/market/tickers', '/api/v1/ai/query', '/api/v1/risk/check'];
      const statuses = [200, 200, 200, 200, 201, 400, 401, 429, 500];
      const newReq = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString(),
        method: methods[Math.floor(Math.random() * methods.length)],
        endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        responseTimeMs: Number((5 + Math.random() * 40).toFixed(1)),
        payloadSizeKb: `${(0.5 + Math.random() * 4).toFixed(1)} KB`,
        correlationId: `corr-${Math.random().toString(36).substring(2, 8)}`
      };
      setLiveStream((prev) => [newReq, ...prev.slice(0, 15)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleReloadGateway = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetchApi<{ success: boolean; data: any }>('/api/gateway/reload', {
        method: 'POST'
      });
      if (res?.success) {
        setMessage('Enterprise API Gateway policies, routes, and connectors successfully reloaded.');
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reload gateway.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidateTestRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetchApi<{ success: boolean; data: any }>('/api/gateway/validate', {
        method: 'POST',
        body: JSON.stringify({ path: testPath, method: testMethod })
      });
      if (res?.success) {
        setValidationResult(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Validation request failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportGateway = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ routes, apiKeys, rateLimits, connectors }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `enterprise_api_gateway_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setMessage('Exported API Gateway configuration bundle successfully.');
  };

  const handleImportGateway = () => {
    setMessage('Import feature simulated: Successfully synchronized gateway policy definitions.');
    loadData();
  };

  // Filtered routes memo
  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      const matchesSearch =
        r.routeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.targetModule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.targetEndpoint.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMethod = methodFilter === 'ALL' || r.allowedMethods.includes(methodFilter);
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [routes, searchQuery, methodFilter, statusFilter]);

  const totalPages = Math.ceil(filteredRoutes.length / pageSize) || 1;
  const paginatedRoutes = useMemo(() => {
    const start = (paginationPage - 1) * pageSize;
    return filteredRoutes.slice(start, start + pageSize);
  }, [filteredRoutes, paginationPage, pageSize]);

  // Analytics chart data mock
  const trafficVolumeData = [
    { time: '00:00', requests: 12400, latency: 11.2 },
    { time: '04:00', requests: 8900, latency: 9.8 },
    { time: '08:00', requests: 34200, latency: 15.4 },
    { time: '12:00', requests: 58400, latency: 18.1 },
    { time: '16:00', requests: 49100, latency: 14.5 },
    { time: '20:00', requests: 28300, latency: 12.0 }
  ];

  const successFailureData = [
    { name: 'HTTP 2xx Success', value: 142100, color: '#10b981' },
    { name: 'HTTP 4xx Client Error', value: 410, color: '#f59e0b' },
    { name: 'HTTP 5xx Server Error', value: 70, color: '#ef4444' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">EP27 Enterprise API Gateway & Traffic Control Center (EAGI)</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Kong & Apigee Enterprise Grade
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure Proxy • API Registry • Rate Limiter • Middleware Pipeline • JWT & OAuth RBAC • Connectors
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportGateway}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            onClick={handleImportGateway}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
          <button
            onClick={handleReloadGateway}
            disabled={actionLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload Gateway</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs (All 13 Sections) */}
      <nav className="flex items-center space-x-1 px-6 bg-slate-900/50 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: '1. Executive KPI & Topology', icon: Activity },
          { id: 'registry', label: '2. API Registry', icon: Route },
          { id: 'analytics', label: '3. Traffic Analytics', icon: BarChart3 },
          { id: 'monitor', label: '4. Request Monitor', icon: Terminal },
          { id: 'auth', label: '5. Authentication', icon: Key },
          { id: 'ratelimit', label: '6. Rate Limiting', icon: Gauge },
          { id: 'routing', label: '7. Routing Manager', icon: Layers },
          { id: 'middleware', label: '8. Middleware Pipeline', icon: Sliders },
          { id: 'errors', label: '9. Error Analytics', icon: ShieldAlert },
          { id: 'inspector', label: '10. API Inspector', icon: Sparkles },
          { id: 'audit', label: '11. Audit & History', icon: History },
          { id: 'security', label: '12. Security Center', icon: Shield },
          { id: 'controls', label: '13. Enterprise Controls', icon: Play }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 px-3.5 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Workspace Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-slate-950 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={loadData} className="underline text-xs hover:text-red-300">Retry</button>
          </div>
        )}

        {message && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-xs hover:text-emerald-300">Dismiss</button>
          </div>
        )}

        {/* SECTION 1: EXECUTIVE KPI DASHBOARD & GATEWAY TOPOLOGY */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Total APIs</span>
                  <Route className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">{routes.length} Registered</div>
                <p className="text-[11px] text-blue-400 mt-1">Active Version v1 & v2</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Healthy APIs</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">{routes.filter(r => r.status === 'ACTIVE').length}</div>
                <p className="text-[11px] text-emerald-400 mt-1">100% Operational</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Failed / Error Rate</span>
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white">0.04%</div>
                <p className="text-[11px] text-red-400 mt-1">70 Server Errors Today</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Average Latency</span>
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white">{dashboard?.avgLatencyMs ?? 14.2} ms</div>
                <p className="text-[11px] text-cyan-400 mt-1">Sub-15ms Edge Proxy</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Requests / sec</span>
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">1,640 req/s</div>
                <p className="text-[11px] text-purple-400 mt-1">Peak capacity: 10,000 req/s</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Success Rate</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">99.96%</div>
                <p className="text-[11px] text-emerald-400 mt-1">Rolling 24-hour window</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Rate Limited Requests</span>
                  <Gauge className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">{dashboard?.rateLimitBlocksCount ?? 32}</div>
                <p className="text-[11px] text-amber-400 mt-1">Burst protection engaged</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Gateway Health</span>
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">HEALTHY</div>
                <p className="text-[11px] text-emerald-400 mt-1">All proxy nodes green</p>
              </div>
            </div>

            {/* SECTION 13: GATEWAY TOPOLOGY MAP */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Workflow className="w-4 h-4 text-blue-400" />
                <span>Gateway Topology & Request Pipeline Map</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] text-slate-500 font-mono">01. INGRESS</div>
                  <div className="text-xs font-bold text-white">Frontend Client</div>
                  <div className="text-[10px] text-blue-400">HTTPS / WSS</div>
                </div>
                <div className="flex items-center justify-center text-slate-600"><ArrowRight className="w-4 h-4 hidden md:block" /></div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] text-slate-500 font-mono">02. PROXY</div>
                  <div className="text-xs font-bold text-blue-400">EP27 Gateway</div>
                  <div className="text-[10px] text-slate-400">Rate Limiter / CORS</div>
                </div>
                <div className="flex items-center justify-center text-slate-600"><ArrowRight className="w-4 h-4 hidden md:block" /></div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] text-slate-500 font-mono">03. SECURITY</div>
                  <div className="text-xs font-bold text-purple-400">JWT & RBAC</div>
                  <div className="text-[10px] text-slate-400">API Key Auth</div>
                </div>
                <div className="flex items-center justify-center text-slate-600"><ArrowRight className="w-4 h-4 hidden md:block" /></div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] text-slate-500 font-mono">04. SERVICES</div>
                  <div className="text-xs font-bold text-cyan-400">Micro-Modules</div>
                  <div className="text-[10px] text-slate-400">Trading / AI / Risk</div>
                </div>
                <div className="flex items-center justify-center text-slate-600"><ArrowRight className="w-4 h-4 hidden md:block" /></div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] text-slate-500 font-mono">05. DATABASE</div>
                  <div className="text-xs font-bold text-emerald-400">PostgreSQL DB</div>
                  <div className="text-[10px] text-slate-400">Drizzle ORM</div>
                </div>
                <div className="flex items-center justify-center text-slate-600"><ArrowRight className="w-4 h-4 hidden md:block" /></div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] text-slate-500 font-mono">06. EGRESS</div>
                  <div className="text-xs font-bold text-white">Client Response</div>
                  <div className="text-[10px] text-emerald-400">JSON / Compressed</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: API REGISTRY */}
        {activeTab === 'registry' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search APIs by name, path, or module..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPaginationPage(1); }}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={methodFilter}
                    onChange={(e) => { setMethodFilter(e.target.value); setPaginationPage(1); }}
                    className="px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="ALL">All Methods</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPaginationPage(1); }}
                    className="px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DEPRECATED">DEPRECATED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">API Name / ID</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Endpoint Path</th>
                    <th className="p-3">Module</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Auth</th>
                    <th className="p-3">Rate Limit</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {paginatedRoutes.map((r) => (
                    <tr
                      key={r.routeId}
                      onClick={() => setSelectedRoute(r)}
                      className={`hover:bg-slate-800/40 cursor-pointer ${selectedRoute?.routeId === r.routeId ? 'bg-blue-500/10' : ''}`}
                    >
                      <td className="p-3">
                        <div className="text-blue-400 font-semibold">{r.routeId}</div>
                        <div className="text-[10px] text-slate-400 font-sans">Enterprise Route</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-blue-300 border border-slate-700">
                          {r.allowedMethods.join(', ')}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200 font-bold">{r.path}</td>
                      <td className="p-3 text-cyan-400">{r.targetModule}</td>
                      <td className="p-3 text-purple-400 font-bold">{r.version}</td>
                      <td className="p-3 text-amber-400">{r.authRequired ? 'JWT / Key' : 'Public'}</td>
                      <td className="p-3 text-slate-300">{r.rateLimitPerMin} req/m</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedRoute(r)}
                          className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[10px]"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Showing {paginatedRoutes.length} of {filteredRoutes.length} endpoints (Page {paginationPage} of {totalPages})</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPaginationPage((p) => Math.max(p - 1, 1))}
                    disabled={paginationPage === 1}
                    className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPaginationPage((p) => Math.min(p + 1, totalPages))}
                    disabled={paginationPage >= totalPages}
                    className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: TRAFFIC ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 03: Traffic Analytics & Recharts Telemetry</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficVolumeData}>
                    <defs>
                      <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="requests" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReq)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white">Success vs Failure Distribution</h3>
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={successFailureData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                        {successFailureData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white">Peak Hours Latency Breakdown</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trafficVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="latency" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: REQUEST MONITOR */}
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 04: Live Request Stream Monitor</h2>
                <p className="text-xs text-slate-400 mt-1">Real-time inspection of headers, payload size, response time, status code, and correlation IDs.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                ● Live Streaming Active
              </span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Request ID</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Endpoint Path</th>
                    <th className="p-3">Status Code</th>
                    <th className="p-3">Response Time</th>
                    <th className="p-3">Payload Size</th>
                    <th className="p-3">Correlation ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {liveStream.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-blue-400 font-semibold">{req.id}</td>
                      <td className="p-3 text-slate-400">{req.timestamp}</td>
                      <td className="p-3 font-bold text-slate-200">{req.method}</td>
                      <td className="p-3 text-cyan-400">{req.endpoint}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          req.status === 200 || req.status === 201 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          req.status === 429 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-purple-400">{req.responseTimeMs} ms</td>
                      <td className="p-3 text-slate-300">{req.payloadSizeKb}</td>
                      <td className="p-3 text-slate-500">{req.correlationId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 5: AUTHENTICATION CENTER */}
        {activeTab === 'auth' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 05: Authentication & Token Management Center</h2>
                <p className="text-xs text-slate-400 mt-1">JWT verification, API Key registry, OAuth2 scopes, Bearer tokens, and Role Mapping.</p>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Key ID</th>
                    <th className="p-3">Prefix</th>
                    <th className="p-3">Owner / Partner</th>
                    <th className="p-3">Organization</th>
                    <th className="p-3">Assigned Role</th>
                    <th className="p-3">Rate Limit Tier</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {apiKeys.map((k) => (
                    <tr key={k.keyId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-blue-400 font-semibold">{k.keyId}</td>
                      <td className="p-3 text-purple-300">{k.keyPrefix}...</td>
                      <td className="p-3 text-slate-200 font-sans font-semibold">{k.ownerName}</td>
                      <td className="p-3 text-cyan-400">{k.organization}</td>
                      <td className="p-3 text-slate-400">{k.assignedRole}</td>
                      <td className="p-3 text-amber-400">{k.rateLimitTier}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {k.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 6: RATE LIMITING */}
        {activeTab === 'ratelimit' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 06: Rate Limiting & Quota Engine</h2>
                <p className="text-xs text-slate-400 mt-1">Configured rules, burst capacity, throttling limits, and IP restrictions.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rateLimits.map((rl) => (
                <div key={rl.ruleId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-blue-400 font-bold">{rl.ruleId}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {rl.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Scope: {rl.scope}</h3>
                  <div className="text-xs text-slate-400">Rate Limit: <span className="text-cyan-400 font-bold">{rl.requestsPerMinute} req/min</span></div>
                  <div className="text-xs text-slate-400">Burst Capacity: <span className="text-purple-400 font-bold">{rl.burstCapacity}</span></div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-blue-500 h-full" style={{ width: `${rl.currentUsagePercent}%` }}></div>
                  </div>
                  <div className="text-[10px] text-slate-500">Current Usage: {rl.currentUsagePercent}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: ROUTING MANAGER */}
        {activeTab === 'routing' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 07: Routing Manager (Internal, External, WebSockets, AI, Trading)</h2>
                <p className="text-xs text-slate-400 mt-1">Multi-domain proxy routing table routing inbound traffic across enterprise services.</p>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Route ID</th>
                    <th className="p-3">Path Pattern</th>
                    <th className="p-3">Target Module</th>
                    <th className="p-3">Target Endpoint</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {routes.map((r) => (
                    <tr key={r.routeId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-blue-400 font-semibold">{r.routeId}</td>
                      <td className="p-3 text-slate-200 font-bold">{r.path}</td>
                      <td className="p-3 text-cyan-400">{r.targetModule}</td>
                      <td className="p-3 text-slate-400">{r.targetEndpoint}</td>
                      <td className="p-3 text-purple-400 font-bold">{r.version}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 8: MIDDLEWARE PIPELINE */}
        {activeTab === 'middleware' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 08: Enterprise Middleware Pipeline</h2>
              <p className="text-xs text-slate-400">Sequential middleware execution stack applied to every inbound request.</p>

              <div className="space-y-3 pt-2">
                {[
                  { step: '01', name: 'CORS & Security Headers', status: 'ACTIVE', latency: '0.2ms', desc: 'Injects strict CSP, X-Frame-Options, and CORS origins.' },
                  { step: '02', name: 'Rate Limiter & Quota Guard', status: 'ACTIVE', latency: '0.8ms', desc: 'Redis token-bucket rate limiting based on client IP or API Key.' },
                  { step: '03', name: 'JWT & OAuth Authentication', status: 'ACTIVE', latency: '2.1ms', desc: 'Validates cryptographic JWT signatures and token expiration.' },
                  { step: '04', name: 'RBAC Authorization Scope', status: 'ACTIVE', latency: '0.5ms', desc: 'Enforces workspace-level permissions and role policies.' },
                  { step: '05', name: 'Payload Validation & Sanitization', status: 'ACTIVE', latency: '1.2ms', desc: 'JSON schema validation and SQL injection prevention.' },
                  { step: '06', name: 'Caching & Compression', status: 'ACTIVE', latency: '0.4ms', desc: 'Gzip compression and Redis response caching for GET routes.' }
                ].map((m) => (
                  <div key={m.step} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 font-mono font-bold text-xs">{m.step}</span>
                      <div>
                        <div className="font-bold text-white">{m.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {m.status}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">Avg: {m.latency}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 9: ERROR ANALYTICS */}
        {activeTab === 'errors' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 09: Error Analytics & Circuit Breaker Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">HTTP 4xx Client Errors</div>
                  <div className="text-xl font-bold text-amber-400">410</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">HTTP 5xx Server Errors</div>
                  <div className="text-xl font-bold text-red-400">70</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">Gateway Timeouts</div>
                  <div className="text-xl font-bold text-purple-400">3</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">Circuit Breakers Tripped</div>
                  <div className="text-xl font-bold text-emerald-400">0</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 10: API INSPECTOR (Sticky Right Panel style) */}
        {activeTab === 'inspector' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Endpoint</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {routes.map((r) => (
                  <div
                    key={r.routeId}
                    onClick={() => setSelectedRoute(r)}
                    className={`p-3 rounded-lg bg-slate-950 border cursor-pointer text-xs transition-all ${
                      selectedRoute?.routeId === r.routeId ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-mono text-blue-400 font-semibold">{r.routeId}</div>
                    <div className="text-slate-200 font-bold truncate">{r.path}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Module: {r.targetModule}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sticky Inspector Panel</h3>
              {selectedRoute ? (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-slate-400">Endpoint ID: <span className="text-blue-400 font-bold">{selectedRoute.routeId}</span></div>
                    <div className="text-slate-400">Path Pattern: <span className="text-slate-200 font-bold">{selectedRoute.path}</span></div>
                    <div className="text-slate-400">Target Module: <span className="text-cyan-400 font-bold">{selectedRoute.targetModule}</span></div>
                    <div className="text-slate-400">Target Endpoint: <span className="text-slate-300">{selectedRoute.targetEndpoint}</span></div>
                    <div className="text-slate-400">Version: <span className="text-purple-400 font-bold">{selectedRoute.version}</span></div>
                    <div className="text-slate-400">Rate Limit: <span className="text-amber-400 font-bold">{selectedRoute.rateLimitPerMin} req/min</span></div>
                    <div className="text-slate-400">Status: <span className="text-emerald-400 font-bold">{selectedRoute.status}</span></div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-slate-400 font-bold mb-1">Simulated Response Payload:</div>
                    <pre className="text-[11px] text-emerald-400 bg-slate-900 p-3 rounded border border-slate-800 overflow-x-auto">
                      {JSON.stringify({
                        status: "success",
                        code: 200,
                        routeId: selectedRoute.routeId,
                        path: selectedRoute.path,
                        module: selectedRoute.targetModule,
                        timestamp: new Date().toISOString(),
                        data: { message: "Proxied securely via EP27 Gateway Engine" }
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-xs py-10 text-center">Select an endpoint from the left to inspect metadata, headers, and responses.</div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 11: AUDIT & HISTORY */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 11: Gateway Audit & Event History</h2>
                <p className="text-xs text-slate-400 mt-1">Immutable logs of API changes, version updates, deployments, and security events.</p>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Audit ID</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Client IP</th>
                    <th className="p-3">Operator / API Key</th>
                    <th className="p-3">Audit Details</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {auditLogs.map((a) => (
                    <tr key={a.auditId} className="hover:bg-slate-800/40">
                      <td className="p-3 text-blue-400 font-semibold">{a.auditId}</td>
                      <td className="p-3 text-slate-200 font-semibold">{a.eventType}</td>
                      <td className="p-3 text-slate-400">{a.clientIp}</td>
                      <td className="p-3 text-purple-400">{a.operatorOrApiKey}</td>
                      <td className="p-3 font-sans text-slate-300">{a.details}</td>
                      <td className="p-3 text-slate-500">{new Date(a.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 12: SECURITY DASHBOARD */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 12: Enterprise Security Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">Failed Auth Attempts</div>
                  <div className="text-xl font-bold text-red-400">14</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">Blocked Requests</div>
                  <div className="text-xl font-bold text-amber-400">32</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">Suspicious Traffic IPs</div>
                  <div className="text-xl font-bold text-blue-400">0</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 mb-1">Security Score</div>
                  <div className="text-xl font-bold text-emerald-400">99.8 / 100</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 13/14: ENTERPRISE CONTROLS & TESTER */}
        {activeTab === 'controls' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Module 13: Enterprise Controls & API Endpoint Tester</h2>
              <p className="text-xs text-slate-400">Execute live route verification tests and policy reloads.</p>

              <form onSubmit={handleValidateTestRequest} className="space-y-3 pt-2">
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={testMethod}
                    onChange={(e) => setTestMethod(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <input
                    type="text"
                    value={testPath}
                    onChange={(e) => setTestPath(e.target.value)}
                    className="col-span-2 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                    placeholder="/api/v1/operations/summary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50"
                >
                  Test Route Dispatch
                </button>
              </form>

              {validationResult && (
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Validation Status:</span>
                    <span className={validationResult.valid ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {validationResult.valid ? 'PASSED (200 OK)' : 'REJECTED'}
                    </span>
                  </div>
                  <pre className="text-[11px] text-slate-300 mt-2 overflow-x-auto">
                    {JSON.stringify(validationResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* SECTION 15: BOTTOM STATUS BAR */}
      <footer className="border-t border-slate-800 bg-slate-900/90 px-6 py-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-200">Gateway Engine: ACTIVE</span>
          </div>
          <span>•</span>
          <span>Authentication: JWT & OAuth</span>
          <span>•</span>
          <span>Rate Limiter: Redis Token Bucket</span>
          <span>•</span>
          <span>Middleware: 6-Stage Pipeline</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Database: PostgreSQL (Drizzle)</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">Health: 99.95%</span>
          <span>•</span>
          <span className="text-cyan-400">Latency: 14.2ms</span>
        </div>
      </footer>
    </div>
  );
};
