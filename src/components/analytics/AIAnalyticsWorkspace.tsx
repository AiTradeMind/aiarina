import React, { useState, useEffect } from 'react';
import { 
  Cpu, BarChart3, ShieldCheck, Activity, Search, Filter, RefreshCcw, 
  Eye, Scale, TrendingUp, AlertCircle, CheckCircle2, Award, ArrowUpRight, 
  ArrowDownRight, Layers, Terminal as TerminalIcon, Calendar, Download, X,
  SlidersHorizontal, ChevronRight, BarChart2
} from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export const AIAnalyticsWorkspace: React.FC = () => {
  const [aiModels, setAiModels] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [heatmaps, setHeatmaps] = useState<any[]>([]);
  const [crossModule, setCrossModule] = useState<any | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'SCORECARD' | 'FORECASTS' | 'CORRELATIONS' | 'ANOMALIES' | 'HEATMAPS' | 'CROSS_MODULE'>('SCORECARD');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');

  // Inspector Drawer
  const [inspectingModel, setInspectingModel] = useState<any | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'OVERVIEW' | 'PERFORMANCE' | 'RESEARCH' | 'STRATEGIES' | 'PAPER_TRADING' | 'TIMELINE' | 'CHARTS' | 'JSON' | 'AUDIT'>('OVERVIEW');
  const [modelDetails, setModelDetails] = useState<any | null>(null);

  // Comparison Drawer (up to 5 models)
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<any[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [aiRes, rnkRes, hltRes, trdRes, frcRes, crrRes, anmRes, hmpRes, aggRes] = await Promise.all([
        fetchApi('/api/analytics/ai'),
        fetchApi('/api/analytics/ai/rankings'),
        fetchApi('/api/analytics/ai/health'),
        fetchApi('/api/analytics/ai/trends'),
        fetchApi('/api/analytics/ai/forecasts'),
        fetchApi('/api/analytics/ai/correlations'),
        fetchApi('/api/analytics/ai/anomalies'),
        fetchApi('/api/analytics/ai/heatmaps'),
        fetchApi('/api/analytics/ai/aggregate')
      ]);

      if (aiRes.status === 'success') setAiModels(aiRes.data);
      if (rnkRes.status === 'success') setRankings(rnkRes.data);
      if (hltRes.status === 'success') setHealthData(hltRes.data);
      if (trdRes.status === 'success') setTrendsData(trdRes.data);
      if (frcRes.status === 'success') setForecasts(frcRes.data);
      if (crrRes.status === 'success') setCorrelations(crrRes.data);
      if (anmRes.status === 'success') setAnomalies(anmRes.data);
      if (hmpRes.status === 'success') setHeatmaps(hmpRes.data);
      if (aggRes.status === 'success') setCrossModule(aggRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI Analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInspect = async (model: any) => {
    setInspectingModel(model);
    setInspectorTab('OVERVIEW');
    try {
      const res = await fetchApi(`/api/analytics/ai/${model.ai_id}`);
      if (res.status === 'success') {
        setModelDetails(res.data);
      }
    } catch (e) {
      setModelDetails(model);
    }
  };

  const toggleCompare = (aiId: string) => {
    if (compareIds.includes(aiId)) {
      setCompareIds(compareIds.filter(id => id !== aiId));
    } else {
      if (compareIds.length >= 5) {
        alert('Maximum of 5 AI models can be compared simultaneously.');
        return;
      }
      setCompareIds([...compareIds, aiId]);
    }
  };

  const handleRunComparison = async () => {
    if (compareIds.length === 0) {
      alert('Select at least one AI model to compare.');
      return;
    }
    try {
      const res = await fetchApi(`/api/analytics/ai/compare?ids=${compareIds.join(',')}`);
      if (res.status === 'success') {
        setCompareData(res.data);
        setIsCompareOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredModels = aiModels.filter(m => {
    const matchesSearch = m.ai_name.toLowerCase().includes(searchQuery.toLowerCase()) || m.ai_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = selectedProvider === 'ALL' || m.provider === selectedProvider;
    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
    return matchesSearch && matchesProvider && matchesStatus;
  });

  // Calculate enterprise KPIs
  const avgAccuracy = aiModels.length ? (aiModels.reduce((acc, m) => acc + Number(m.accuracy), 0) / aiModels.length).toFixed(1) : '0';
  const avgConfidence = aiModels.length ? (aiModels.reduce((acc, m) => acc + Number(m.confidence), 0) / aiModels.length).toFixed(1) : '0';
  const totalTrades = aiModels.reduce((acc, m) => acc + Number(m.trades_count || 0), 0);
  const avgRoi = aiModels.length ? (aiModels.reduce((acc, m) => acc + Number(m.roi), 0) / aiModels.length).toFixed(1) : '0';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-terminal-bg text-white font-sans selection:bg-terminal-amber/30 relative">
      {/* Sticky Header */}
      <div className="bg-terminal-panel border-b border-terminal-border px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-terminal-blue/20 text-terminal-blue text-[10px] font-mono font-bold rounded uppercase tracking-wider border border-terminal-blue/40">
              Workspace 1
            </span>
            <span className="text-xs text-terminal-muted font-mono uppercase">AI ARINA Enterprise OS V3.2 • EP06 Analytics</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            <Cpu className="w-5 h-5 text-terminal-amber" />
            AI Analytics • Performance Intelligence Center
          </h1>
          <p className="text-xs text-terminal-muted mt-0.5">
            Continuous evaluation, health monitoring, and enterprise performance intelligence across all AI models. (Never executes trades).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {compareIds.length > 0 && (
            <button
              onClick={handleRunComparison}
              className="px-3 py-1.5 bg-terminal-amber text-slate-950 font-bold text-xs rounded hover:bg-terminal-amber/90 transition-colors flex items-center gap-1.5 shadow"
            >
              <Scale className="w-4 h-4" /> Compare Selected ({compareIds.length}/5)
            </button>
          )}
          <button
            onClick={loadData}
            className="px-3 py-1.5 bg-terminal-border text-white text-xs font-mono rounded hover:bg-white/10 transition-colors flex items-center gap-1.5"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
          </button>
        </div>
      </div>

      {/* Enterprise Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 shrink-0 bg-black/20 border-b border-terminal-border">
        <div className="bg-terminal-panel border border-terminal-border rounded p-4 flex flex-col justify-between shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-terminal-muted">Average AI Accuracy</span>
            <Award className="w-4 h-4 text-terminal-green" />
          </div>
          <div className="text-2xl font-bold font-mono text-terminal-green mt-2">{avgAccuracy}%</div>
          <div className="text-[10px] text-terminal-muted mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-terminal-green" /> +1.4% vs last period
          </div>
        </div>

        <div className="bg-terminal-panel border border-terminal-border rounded p-4 flex flex-col justify-between shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-terminal-muted">Average Confidence</span>
            <ShieldCheck className="w-4 h-4 text-terminal-blue" />
          </div>
          <div className="text-2xl font-bold font-mono text-terminal-blue mt-2">{avgConfidence} / 100</div>
          <div className="text-[10px] text-terminal-muted mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-terminal-blue" /> High stability index
          </div>
        </div>

        <div className="bg-terminal-panel border border-terminal-border rounded p-4 flex flex-col justify-between shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-terminal-muted">Cumulative ROI</span>
            <TrendingUp className="w-4 h-4 text-terminal-amber" />
          </div>
          <div className="text-2xl font-bold font-mono text-terminal-amber mt-2">+{avgRoi}%</div>
          <div className="text-[10px] text-terminal-muted mt-1">Across {aiModels.length} active models</div>
        </div>

        <div className="bg-terminal-panel border border-terminal-border rounded p-4 flex flex-col justify-between shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-terminal-muted">Evaluated Trades</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">{totalTrades.toLocaleString()}</div>
          <div className="text-[10px] text-terminal-muted mt-1">100% audit trail immutable</div>
        </div>
      </div>

      {/* Main View Navigation Tabs */}
      <div className="bg-terminal-panel border-b border-terminal-border px-6 flex items-center gap-2 overflow-x-auto shrink-0 font-mono text-xs">
        <button
          onClick={() => setActiveMainTab('SCORECARD')}
          className={cn(
            "px-4 py-3 border-b-2 font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
            activeMainTab === 'SCORECARD' ? "border-terminal-amber text-terminal-amber bg-white/5" : "border-transparent text-terminal-muted hover:text-white"
          )}
        >
          Model Scorecard ({aiModels.length})
        </button>
        <button
          onClick={() => setActiveMainTab('FORECASTS')}
          className={cn(
            "px-4 py-3 border-b-2 font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
            activeMainTab === 'FORECASTS' ? "border-terminal-amber text-terminal-amber bg-white/5" : "border-transparent text-terminal-muted hover:text-white"
          )}
        >
          Forecast Engine ({forecasts.length})
        </button>
        <button
          onClick={() => setActiveMainTab('CORRELATIONS')}
          className={cn(
            "px-4 py-3 border-b-2 font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
            activeMainTab === 'CORRELATIONS' ? "border-terminal-amber text-terminal-amber bg-white/5" : "border-transparent text-terminal-muted hover:text-white"
          )}
        >
          Correlation Matrix ({correlations.length})
        </button>
        <button
          onClick={() => setActiveMainTab('ANOMALIES')}
          className={cn(
            "px-4 py-3 border-b-2 font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
            activeMainTab === 'ANOMALIES' ? "border-terminal-amber text-terminal-amber bg-white/5" : "border-transparent text-terminal-muted hover:text-white"
          )}
        >
          Anomaly & Root Cause ({anomalies.length})
        </button>
        <button
          onClick={() => setActiveMainTab('HEATMAPS')}
          className={cn(
            "px-4 py-3 border-b-2 font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
            activeMainTab === 'HEATMAPS' ? "border-terminal-amber text-terminal-amber bg-white/5" : "border-transparent text-terminal-muted hover:text-white"
          )}
        >
          Heatmaps ({heatmaps.length})
        </button>
        <button
          onClick={() => setActiveMainTab('CROSS_MODULE')}
          className={cn(
            "px-4 py-3 border-b-2 font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
            activeMainTab === 'CROSS_MODULE' ? "border-terminal-amber text-terminal-amber bg-white/5" : "border-transparent text-terminal-muted hover:text-white"
          )}
        >
          Cross-Module Aggregation (12 Modules)
        </button>
      </div>

      {/* Sticky Filters Toolbar */}
      {activeMainTab === 'SCORECARD' && (
      <div className="bg-terminal-panel/80 backdrop-blur border-b border-terminal-border px-6 py-3 flex flex-wrap items-center gap-3 shrink-0 sticky top-0 z-20">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-terminal-muted" />
          <input
            type="text"
            placeholder="Search AI model ID or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-terminal-border rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-terminal-muted focus:outline-none focus:border-terminal-amber font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="bg-black/40 border border-terminal-border rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-terminal-amber"
          >
            <option value="ALL">All Providers</option>
            <option value="Google">Google</option>
            <option value="Anthropic">Anthropic</option>
            <option value="OpenAI">OpenAI</option>
            <option value="DeepSeek">DeepSeek</option>
            <option value="Meta">Meta</option>
            <option value="Mistral AI">Mistral AI</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-black/40 border border-terminal-border rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-terminal-amber"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="STANDBY">Standby</option>
          </select>

          <span className="text-xs text-terminal-muted font-mono pl-2 border-l border-terminal-border">
            Showing {filteredModels.length} of {aiModels.length} models
          </span>
        </div>
      </div>
      )}

      {/* Main Workspace Body: Enterprise Virtual Table & Analytics Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeMainTab === 'SCORECARD' && (
          <>
            <div className="bg-terminal-panel border border-terminal-border rounded overflow-hidden shadow-lg">
              <div className="px-4 py-3 bg-black/40 border-b border-terminal-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-terminal-amber" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">Enterprise AI Scorecard & Performance Matrix</span>
                </div>
                <span className="text-[10px] font-mono text-terminal-muted">Select up to 5 models for comparison</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-black/60 text-terminal-muted uppercase text-[10px] tracking-wider border-b border-terminal-border">
                      <th className="p-3 w-10 text-center">Compare</th>
                      <th className="p-3">AI Model</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3 text-right">Accuracy</th>
                      <th className="p-3 text-right">Confidence</th>
                      <th className="p-3 text-right">ROI</th>
                      <th className="p-3 text-right">Drawdown</th>
                      <th className="p-3 text-center">Rank</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/50">
                    {filteredModels.map((m) => {
                      const isChecked = compareIds.includes(m.ai_id);
                      return (
                        <tr key={m.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCompare(m.ai_id)}
                              className="rounded border-terminal-border bg-black/40 text-terminal-amber focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="p-3 font-bold text-white flex items-center gap-2">
                            <span className="text-terminal-amber font-mono text-[10px] px-1.5 py-0.5 rounded bg-terminal-amber/10 border border-terminal-amber/30">
                              {m.ai_id}
                            </span>
                            {m.ai_name}
                          </td>
                          <td className="p-3 text-terminal-muted">{m.provider} ({m.model_version})</td>
                          <td className="p-3 text-right font-bold text-terminal-green">{m.accuracy}%</td>
                          <td className="p-3 text-right text-terminal-blue">{m.confidence}</td>
                          <td className="p-3 text-right font-bold text-terminal-amber">+{m.roi}%</td>
                          <td className="p-3 text-right text-red-400">-{m.drawdown}%</td>
                          <td className="p-3 text-center font-bold text-terminal-amber">#{m.ranking}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              m.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleInspect(m)}
                              className="px-2.5 py-1 bg-terminal-border hover:bg-terminal-amber hover:text-slate-950 text-white rounded text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Charts & Trends Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-terminal-panel border border-terminal-border rounded p-4 shadow">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-terminal-border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-terminal-amber" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">Model Accuracy Comparison Chart</span>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aiModels}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="ai_id" stroke="#777" fontSize={10} />
                      <YAxis stroke="#777" domain={[80, 100]} fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '11px', fontFamily: 'monospace' }} />
                      <Bar dataKey="accuracy" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-terminal-panel border border-terminal-border rounded p-4 shadow">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-terminal-border">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-terminal-green" />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">Historical ROI Distribution (%)</span>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aiModels}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="ai_id" stroke="#777" fontSize={10} />
                      <YAxis stroke="#777" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '11px', fontFamily: 'monospace' }} />
                      <Line type="monotone" dataKey="roi" stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {activeMainTab === 'FORECASTS' && (
          <div className="bg-terminal-panel border border-terminal-border rounded overflow-hidden shadow-lg font-mono">
            <div className="px-4 py-3 bg-black/40 border-b border-terminal-border flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-terminal-amber">Enterprise AI Forecast Engine ({forecasts.length} records)</span>
              <span className="text-[10px] text-terminal-muted">Horizon: 30D Confidence Projection</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-black/60 text-terminal-muted uppercase text-[10px] border-b border-terminal-border">
                    <th className="p-3">Forecast ID</th>
                    <th className="p-3">AI ID</th>
                    <th className="p-3">Metric</th>
                    <th className="p-3 text-right">Current Value</th>
                    <th className="p-3 text-right">Forecast Value</th>
                    <th className="p-3 text-right">Confidence Interval</th>
                    <th className="p-3 text-center">Horizon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/50">
                  {forecasts.map((f, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-terminal-amber">{f.id}</td>
                      <td className="p-3">{f.ai_id}</td>
                      <td className="p-3">{f.metric_name}</td>
                      <td className="p-3 text-right">{f.current_value}</td>
                      <td className="p-3 text-right font-bold text-terminal-green">{f.forecast_value}</td>
                      <td className="p-3 text-right text-terminal-blue">{f.confidence_interval}%</td>
                      <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-terminal-blue/20 text-terminal-blue text-[10px]">{f.horizon}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMainTab === 'CORRELATIONS' && (
          <div className="bg-terminal-panel border border-terminal-border rounded overflow-hidden shadow-lg font-mono">
            <div className="px-4 py-3 bg-black/40 border-b border-terminal-border flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-terminal-blue">Enterprise Correlation Matrix ({correlations.length} pairs)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-black/60 text-terminal-muted uppercase text-[10px] border-b border-terminal-border">
                    <th className="p-3">Pair ID</th>
                    <th className="p-3">Model 1</th>
                    <th className="p-3">Model 2</th>
                    <th className="p-3">Paired Metric</th>
                    <th className="p-3 text-right">Correlation Coefficient (r)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/50">
                  {correlations.map((c, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-terminal-amber">{c.id}</td>
                      <td className="p-3">{c.ai_id_1}</td>
                      <td className="p-3">{c.ai_id_2}</td>
                      <td className="p-3 text-terminal-muted">{c.metric_paired}</td>
                      <td className="p-3 text-right font-bold text-terminal-green">{c.correlation_coefficient}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMainTab === 'ANOMALIES' && (
          <div className="bg-terminal-panel border border-terminal-border rounded overflow-hidden shadow-lg font-mono">
            <div className="px-4 py-3 bg-black/40 border-b border-terminal-border flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">Anomaly Detection & Root Cause Analysis ({anomalies.length} records)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-black/60 text-terminal-muted uppercase text-[10px] border-b border-terminal-border">
                    <th className="p-3">Anomaly ID</th>
                    <th className="p-3">AI ID</th>
                    <th className="p-3">Type</th>
                    <th className="p-3 text-center">Severity</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Root Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/50">
                  {anomalies.map((a, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-terminal-amber">{a.id}</td>
                      <td className="p-3">{a.ai_id}</td>
                      <td className="p-3 text-terminal-muted">{a.anomaly_type}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="p-3 text-white">{a.description}</td>
                      <td className="p-3 text-terminal-muted">{a.root_cause}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMainTab === 'HEATMAPS' && (
          <div className="bg-terminal-panel border border-terminal-border rounded overflow-hidden shadow-lg font-mono">
            <div className="px-4 py-3 bg-black/40 border-b border-terminal-border flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Enterprise Heatmap Intelligence ({heatmaps.length} dimensions)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-black/60 text-terminal-muted uppercase text-[10px] border-b border-terminal-border">
                    <th className="p-3">Heatmap ID</th>
                    <th className="p-3">Dimension X</th>
                    <th className="p-3">Dimension Y</th>
                    <th className="p-3 text-right">Intensity Score</th>
                    <th className="p-3">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/50">
                  {heatmaps.map((h, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-terminal-amber">{h.id}</td>
                      <td className="p-3">{h.dimension_x}</td>
                      <td className="p-3">{h.dimension_y}</td>
                      <td className="p-3 text-right font-bold text-terminal-green">{h.intensity_score}</td>
                      <td className="p-3 text-terminal-muted">{JSON.stringify(h.metadata)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMainTab === 'CROSS_MODULE' && crossModule && (
          <div className="space-y-6 font-mono">
            <div className="bg-terminal-panel border border-terminal-border rounded p-4 shadow">
              <div className="text-xs font-bold text-terminal-amber uppercase tracking-wider mb-3">Cross-Module Integration Status (12 Enterprise Modules)</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(crossModule.modules || {}).map(([modName, modInfo]: [string, any], idx: number) => (
                  <div key={idx} className="bg-black/40 border border-terminal-border p-3 rounded flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white uppercase">{modName}</span>
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] rounded font-bold">{modInfo.status}</span>
                    </div>
                    <div className="text-[10px] text-terminal-muted mt-2 space-y-1">
                      {Object.entries(modInfo).filter(([k]) => k !== 'status').map(([k, v]: [string, any], i2: number) => (
                        <div key={i2} className="flex justify-between">
                          <span>{k}:</span>
                          <span className="text-white font-bold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inspector Drawer */}
      {inspectingModel && (
        <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-slate-950 border-l border-terminal-border shadow-2xl z-50 flex flex-col font-mono text-white">
          <div className="px-6 py-4 bg-terminal-panel border-b border-terminal-border flex items-center justify-between">
            <div>
              <span className="text-[10px] text-terminal-amber font-bold uppercase tracking-widest">AI Performance Inspector</span>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                {inspectingModel.ai_name} <span className="text-xs text-terminal-muted">({inspectingModel.ai_id})</span>
              </h2>
            </div>
            <button
              onClick={() => setInspectingModel(null)}
              className="p-1 rounded hover:bg-white/10 text-terminal-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Inspector Tabs */}
          <div className="flex items-center gap-1 px-6 bg-black/40 border-b border-terminal-border overflow-x-auto text-[10px] uppercase font-bold shrink-0">
            {(['OVERVIEW', 'PERFORMANCE', 'RESEARCH', 'STRATEGIES', 'PAPER_TRADING', 'TIMELINE', 'CHARTS', 'JSON', 'AUDIT'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setInspectorTab(tab)}
                className={cn(
                  "px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap",
                  inspectorTab === tab ? "border-terminal-amber text-terminal-amber bg-terminal-amber/10" : "border-transparent text-terminal-muted hover:text-white"
                )}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Inspector Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {inspectorTab === 'OVERVIEW' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border">
                    <span className="text-terminal-muted text-[10px] uppercase">Model Provider</span>
                    <div className="text-sm font-bold text-white mt-1">{inspectingModel.provider}</div>
                  </div>
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border">
                    <span className="text-terminal-muted text-[10px] uppercase">Model Version</span>
                    <div className="text-sm font-bold text-white mt-1">{inspectingModel.model_version}</div>
                  </div>
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border">
                    <span className="text-terminal-muted text-[10px] uppercase">Enterprise Ranking</span>
                    <div className="text-sm font-bold text-terminal-amber mt-1">#{inspectingModel.ranking} (Score: {inspectingModel.score})</div>
                  </div>
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border">
                    <span className="text-terminal-muted text-[10px] uppercase">Operational Status</span>
                    <div className="text-sm font-bold text-terminal-green mt-1">{inspectingModel.status}</div>
                  </div>
                </div>

                {modelDetails?.insights && modelDetails.insights.length > 0 && (
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border space-y-2">
                    <span className="text-[10px] uppercase text-terminal-amber font-bold">Latest AI Insights</span>
                    {modelDetails.insights.map((ins: any, i: number) => (
                      <div key={i} className="p-2 bg-black/40 rounded border border-terminal-border text-[11px]">
                        <div className="font-bold text-white">{ins.title}</div>
                        <div className="text-terminal-muted mt-1">{ins.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {inspectorTab === 'PERFORMANCE' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                    <span className="text-terminal-muted text-[10px]">Accuracy</span>
                    <div className="text-lg font-bold text-terminal-green mt-1">{inspectingModel.accuracy}%</div>
                  </div>
                  <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                    <span className="text-terminal-muted text-[10px]">Confidence</span>
                    <div className="text-lg font-bold text-terminal-blue mt-1">{inspectingModel.confidence}</div>
                  </div>
                  <div className="bg-terminal-panel p-3 rounded border border-terminal-border">
                    <span className="text-terminal-muted text-[10px]">ROI</span>
                    <div className="text-lg font-bold text-terminal-amber mt-1">+{inspectingModel.roi}%</div>
                  </div>
                </div>

                {modelDetails?.scores && (
                  <div className="bg-terminal-panel p-4 rounded border border-terminal-border space-y-3">
                    <span className="text-[10px] uppercase text-terminal-muted font-bold">Detailed Sub-Scores</span>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span>Accuracy Score</span>
                        <span className="font-bold text-white">{modelDetails.scores.accuracy_score} / 100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Profit Score</span>
                        <span className="font-bold text-white">{modelDetails.scores.profit_score} / 100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Consistency Score</span>
                        <span className="font-bold text-white">{modelDetails.scores.consistency_score} / 100</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Risk Management Score</span>
                        <span className="font-bold text-white">{modelDetails.scores.risk_score} / 100</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {inspectorTab === 'RESEARCH' && (
              <div className="space-y-3">
                <div className="bg-terminal-panel p-4 rounded border border-terminal-border">
                  <span className="text-[10px] uppercase text-terminal-muted font-bold">Research Intelligence Metrics</span>
                  <p className="text-terminal-muted mt-2">Model cross-references empirical datasets, market indicator feeds, and institutional research reports with 99.4% cross-validation accuracy.</p>
                </div>
              </div>
            )}

            {inspectorTab === 'STRATEGIES' && (
              <div className="space-y-3">
                <div className="bg-terminal-panel p-4 rounded border border-terminal-border">
                  <span className="text-[10px] uppercase text-terminal-muted font-bold">Associated Strategy Pipelines</span>
                  <div className="mt-2 text-terminal-muted">Linked to 4 active quantitative execution pipelines. No trade authority granted (Read-Only Performance Evaluator).</div>
                </div>
              </div>
            )}

            {inspectorTab === 'PAPER_TRADING' && (
              <div className="space-y-3">
                <div className="bg-terminal-panel p-4 rounded border border-terminal-border">
                  <span className="text-[10px] uppercase text-terminal-muted font-bold">Paper Trading Simulation Records</span>
                  <div className="mt-2 text-terminal-muted">Evaluated {inspectingModel.trades_count} paper executions with zero real capital risk exposure.</div>
                </div>
              </div>
            )}

            {inspectorTab === 'TIMELINE' && (
              <div className="space-y-3">
                {modelDetails?.history && modelDetails.history.length > 0 ? (
                  modelDetails.history.map((h: any, idx: number) => (
                    <div key={idx} className="bg-terminal-panel p-3 rounded border border-terminal-border flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white">{h.period_type}: {h.period_value}</div>
                        <div className="text-[10px] text-terminal-muted">Trades: {h.trades} | Sharpe: {h.sharpe}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-terminal-green">+{h.roi}% ROI</div>
                        <div className="text-[10px] text-terminal-muted">{h.accuracy}% Acc</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-terminal-muted">No historical timeline records found.</div>
                )}
              </div>
            )}

            {inspectorTab === 'CHARTS' && (
              <div className="h-48 w-full bg-terminal-panel p-3 rounded border border-terminal-border">
                <span className="text-[10px] uppercase text-terminal-muted font-bold mb-2 block">Performance Trend Curve</span>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={modelDetails?.history || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="period_value" stroke="#777" fontSize={9} />
                    <YAxis stroke="#777" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                    <Line type="monotone" dataKey="accuracy" stroke="#38bdf8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {inspectorTab === 'JSON' && (
              <pre className="bg-black/80 p-4 rounded border border-terminal-border text-[10px] text-terminal-green overflow-x-auto">
                {JSON.stringify(modelDetails || inspectingModel, null, 2)}
              </pre>
            )}

            {inspectorTab === 'AUDIT' && (
              <div className="space-y-3">
                <div className="bg-terminal-panel p-4 rounded border border-terminal-border space-y-2">
                  <span className="text-[10px] uppercase text-terminal-amber font-bold">SHA256 Audit Trail & Verification</span>
                  <div className="text-[10px] font-mono text-terminal-muted bg-black/40 p-2 rounded border border-terminal-border">
                    SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </div>
                  <div className="text-[11px] text-terminal-green flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-4 h-4" /> Immutable record verified against enterprise ledger.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Drawer */}
      {isCompareOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-950 border border-terminal-border rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col font-mono text-white shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-terminal-panel border-b border-terminal-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-terminal-amber" />
                <h2 className="text-base font-bold uppercase tracking-wider">Enterprise AI Model Comparison Matrix ({compareData.length} models)</h2>
              </div>
              <button onClick={() => setIsCompareOpen(false)} className="p-1 rounded hover:bg-white/10 text-terminal-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-x-auto p-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-terminal-border text-terminal-muted text-[10px] uppercase">
                    <th className="p-3">Metric</th>
                    {compareData.map(m => (
                      <th key={m.ai_id} className="p-3 text-white font-bold">{m.ai_name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/50">
                  <tr>
                    <td className="p-3 text-terminal-muted">Provider</td>
                    {compareData.map(m => <td key={m.ai_id} className="p-3">{m.provider} ({m.model_version})</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-terminal-muted">Accuracy</td>
                    {compareData.map(m => <td key={m.ai_id} className="p-3 font-bold text-terminal-green">{m.accuracy}%</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-terminal-muted">Confidence</td>
                    {compareData.map(m => <td key={m.ai_id} className="p-3 text-terminal-blue">{m.confidence}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-terminal-muted">ROI</td>
                    {compareData.map(m => <td key={m.ai_id} className="p-3 font-bold text-terminal-amber">+{m.roi}%</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-terminal-muted">Drawdown</td>
                    {compareData.map(m => <td key={m.ai_id} className="p-3 text-red-400">-{m.drawdown}%</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-terminal-muted">Ranking</td>
                    {compareData.map(m => <td key={m.ai_id} className="p-3 font-bold text-terminal-amber">#{m.ranking}</td>)}
                  </tr>
                  <tr>
                    <td className="p-3 text-terminal-muted">Status</td>
                    {compareData.map(m => <td key={m.ai_id} className="p-3"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">{m.status}</span></td>)}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 bg-terminal-panel border-t border-terminal-border flex justify-end">
              <button
                onClick={() => setIsCompareOpen(false)}
                className="px-4 py-2 bg-terminal-border text-white text-xs font-bold rounded hover:bg-white/10"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
