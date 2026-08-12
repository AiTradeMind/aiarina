import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  BarChart3, 
  Filter, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Info, 
  Eye, 
  X, 
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { ENTERPRISE_AI_MODELS_REGISTRY, AIModelRegistryFullItem } from '../data/aiModelsRegistry';
import { fetchApi } from '../lib/api';

interface ChartBWorkspaceProps {
  labId?: string;
  selectedInstrument?: string;
  selectedExchange?: string;
}

export interface PaperTradeRecord {
  id: string;
  labId?: string;
  symbol?: string;
  aiModelId?: string;
  modelId?: string;
  modelName?: string;
  side?: 'BUY' | 'SELL';
  quantity?: number;
  entryPrice?: number;
  exitPrice?: number;
  pnl?: number;
  unrealizedPnl?: number;
  status?: 'OPEN' | 'CLOSED' | 'EXECUTED';
  timestamp?: string;
  createdAt?: string;
  metadata?: any;
}

interface ModelStatItem {
  modelId: string;
  modelName: string;
  totalTrades: number;
  winningTrades: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
  equity: number;
  returnPct: number;
  winRatePct: number;
}

const MODEL_COLORS: Record<string, string> = {
  'REG-1001': '#f59e0b', // Gemini 2.5 Pro (Amber)
  'REG-1002': '#3b82f6', // Claude 3.5 Sonnet (Blue)
  'REG-1003': '#10b981', // DeepSeek R1 (Emerald)
  'REG-1006': '#8b5cf6', // GPT-4o (Purple)
  'REG-1010': '#ec4899', // Gemini 2.5 Flash (Pink)
  'gemini-2.5-pro': '#f59e0b',
  'claude-3.5-sonnet': '#3b82f6',
  'deepseek-r1': '#10b981',
  'gpt-4o': '#8b5cf6',
  'gemini-2.5-flash': '#ec4899'
};

const BASE_EQUITY_PER_MODEL = 100000; // 100,000 ATM (₹100,000)

export const ChartBWorkspace: React.FC<ChartBWorkspaceProps> = ({
  labId = 'LAB_01_STOCK',
  selectedInstrument = 'NIFTY 50',
  selectedExchange = 'NSE'
}) => {
  const [selectedAiModel, setSelectedAiModel] = useState<string>('ALL');
  const [selectedLabFilter, setSelectedLabFilter] = useState<string>('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1D' | '5D' | '1M' | '3M' | '6M' | '1Y'>('1M');
  
  const [trades, setTrades] = useState<PaperTradeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inspectingModel, setInspectingModel] = useState<AIModelRegistryFullItem | null>(null);

  // Fetch paper trades from canonical endpoint
  const loadPaperTrades = useCallback(async () => {
    try {
      const endpoint = selectedLabFilter !== 'ALL' 
        ? `/api/paper/trades?labId=${selectedLabFilter}` 
        : `/api/paper/trades`;
      
      const res = await fetchApi(endpoint);
      if (res && Array.isArray(res)) {
        // Idempotent deduplication by trade ID
        const uniqueMap = new Map<string, PaperTradeRecord>();
        res.forEach((t: PaperTradeRecord) => {
          if (t && t.id) {
            uniqueMap.set(t.id, t);
          }
        });
        setTrades(Array.from(uniqueMap.values()));
      } else {
        setTrades([]);
      }
    } catch (err) {
      console.warn('Chart B paper trades fetch warning:', err);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, [selectedLabFilter]);

  useEffect(() => {
    loadPaperTrades();
    const interval = setInterval(loadPaperTrades, 10000);
    return () => clearInterval(interval);
  }, [loadPaperTrades]);

  // Filter trades by Time Range
  const timeFilteredTrades = useMemo(() => {
    if (!trades || trades.length === 0) return [];
    
    const now = Date.now();
    let msRange = 30 * 24 * 3600 * 1000; // Default 1M
    if (selectedTimeRange === '1D') msRange = 1 * 24 * 3600 * 1000;
    if (selectedTimeRange === '5D') msRange = 5 * 24 * 3600 * 1000;
    if (selectedTimeRange === '1M') msRange = 30 * 24 * 3600 * 1000;
    if (selectedTimeRange === '3M') msRange = 90 * 24 * 3600 * 1000;
    if (selectedTimeRange === '6M') msRange = 180 * 24 * 3600 * 1000;
    if (selectedTimeRange === '1Y') msRange = 365 * 24 * 3600 * 1000;

    const cutoff = now - msRange;

    return trades.filter((t) => {
      const tsStr = t.timestamp || t.createdAt;
      if (!tsStr) return true;
      const tTime = new Date(tsStr).getTime();
      return isNaN(tTime) || tTime >= cutoff;
    });
  }, [trades, selectedTimeRange]);

  // Helper to get normalized model ID
  const getTradeModelId = (t: PaperTradeRecord) => {
    return t.aiModelId || t.modelId || t.metadata?.aiModelId || 'REG-1001';
  };

  // Compute Leaderboard and Model Performance Stats from canonical paper trades
  const modelStatsMap = useMemo(() => {
    const stats: Record<string, ModelStatItem> = {};

    // Initialize all registered enterprise AI models
    ENTERPRISE_AI_MODELS_REGISTRY.forEach(m => {
      stats[m.id] = {
        modelId: m.id,
        modelName: m.name,
        totalTrades: 0,
        winningTrades: 0,
        realizedPnl: 0,
        unrealizedPnl: 0,
        totalPnl: 0,
        equity: BASE_EQUITY_PER_MODEL,
        returnPct: 0,
        winRatePct: 0
      };
    });

    // Aggregate paper trade executions
    timeFilteredTrades.forEach(t => {
      const mId = getTradeModelId(t);
      if (!stats[mId]) {
        stats[mId] = {
          modelId: mId,
          modelName: t.modelName || mId,
          totalTrades: 0,
          winningTrades: 0,
          realizedPnl: 0,
          unrealizedPnl: 0,
          totalPnl: 0,
          equity: BASE_EQUITY_PER_MODEL,
          returnPct: 0,
          winRatePct: 0
        };
      }

      const st = stats[mId];
      st.totalTrades += 1;
      const tradePnl = Number(t.pnl || 0);
      const unPnl = Number(t.unrealizedPnl || 0);

      if (t.status === 'CLOSED') {
        st.realizedPnl += tradePnl;
        if (tradePnl > 0) st.winningTrades += 1;
      } else {
        st.unrealizedPnl += unPnl;
        if (unPnl > 0) st.winningTrades += 1;
      }

      st.totalPnl = st.realizedPnl + st.unrealizedPnl;
      st.equity = BASE_EQUITY_PER_MODEL + st.totalPnl;
      st.returnPct = (st.totalPnl / BASE_EQUITY_PER_MODEL) * 100;
      st.winRatePct = st.totalTrades > 0 ? (st.winningTrades / st.totalTrades) * 100 : 0;
    });

    return stats;
  }, [timeFilteredTrades]);

  // Sorted leaderboard array
  const leaderboard = useMemo(() => {
    const list = Object.values(modelStatsMap) as ModelStatItem[];
    return list.sort((a, b) => b.totalPnl - a.totalPnl);
  }, [modelStatsMap]);

  // Cumulative P&L / Equity Time Series Chart Data
  const chartSeriesData = useMemo(() => {
    if (!timeFilteredTrades || timeFilteredTrades.length === 0) return [];

    // Filter by selected AI model if not ALL
    const activeTrades = timeFilteredTrades.filter(t => {
      if (selectedAiModel === 'ALL') return true;
      const mId = getTradeModelId(t);
      return mId === selectedAiModel;
    });

    if (activeTrades.length === 0) return [];

    // Sort trades by timestamp ascending
    const sorted = [...activeTrades].sort((a, b) => {
      const tA = new Date(a.timestamp || a.createdAt || 0).getTime();
      const tB = new Date(b.timestamp || b.createdAt || 0).getTime();
      return tA - tB;
    });

    // Build cumulative time points
    const modelCumulativePnl: Record<string, number> = {};
    ENTERPRISE_AI_MODELS_REGISTRY.forEach(m => {
      modelCumulativePnl[m.id] = 0;
    });

    const seriesPoints: any[] = [];

    sorted.forEach(t => {
      const mId = getTradeModelId(t);
      const tradePnl = Number(t.pnl || t.unrealizedPnl || 0);
      modelCumulativePnl[mId] = (modelCumulativePnl[mId] || 0) + tradePnl;

      const dateStr = t.timestamp || t.createdAt 
        ? new Date(t.timestamp || t.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : 'Execution';

      const point: any = {
        time: dateStr,
        tradeId: t.id
      };

      if (selectedAiModel === 'ALL') {
        Object.keys(modelCumulativePnl).forEach(id => {
          point[id] = Math.round(modelCumulativePnl[id] * 100) / 100;
        });
      } else {
        point[selectedAiModel] = Math.round((modelCumulativePnl[selectedAiModel] || 0) * 100) / 100;
      }

      seriesPoints.push(point);
    });

    return seriesPoints;
  }, [timeFilteredTrades, selectedAiModel]);

  return (
    <div className="flex flex-col h-full bg-black text-terminal-text overflow-y-auto font-mono text-xs">
      {/* CHART B HEADER / CONTROLS BAR */}
      <div className="bg-black/90 border-b border-terminal-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-terminal-amber/10 border border-terminal-amber/30 rounded">
            <TrendingUp className="w-4 h-4 text-terminal-amber" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              AI MODEL PERFORMANCE & COMPARISON
              <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/30 px-1.5 py-0.5 rounded font-mono">
                CHART B
              </span>
            </div>
            <div className="text-[10px] text-terminal-muted">
              Canonical Paper Execution Records — Real-time P&L Accounting (1 ATM = ₹1)
            </div>
          </div>
        </div>

        {/* CONTROLS: MODEL FILTER, LAB FILTER, TIME RANGE */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI MODEL SELECTOR */}
          <div className="flex items-center gap-1.5 bg-black/80 border border-terminal-border/80 px-2 py-1 rounded">
            <Zap className="w-3 h-3 text-terminal-amber" />
            <span className="text-[10px] text-gray-400 uppercase font-bold">MODEL:</span>
            <select
              value={selectedAiModel}
              onChange={(e) => setSelectedAiModel(e.target.value)}
              className="bg-transparent text-white font-bold text-[10px] focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-neutral-900 text-white">ALL MODELS</option>
              {ENTERPRISE_AI_MODELS_REGISTRY.map(m => (
                <option key={m.id} value={m.id} className="bg-neutral-900 text-white">
                  {m.name} ({m.id})
                </option>
              ))}
            </select>
          </div>

          {/* LAB SELECTOR */}
          <div className="flex items-center gap-1.5 bg-black/80 border border-terminal-border/80 px-2 py-1 rounded">
            <Layers className="w-3 h-3 text-teal-400" />
            <span className="text-[10px] text-gray-400 uppercase font-bold">LAB:</span>
            <select
              value={selectedLabFilter}
              onChange={(e) => setSelectedLabFilter(e.target.value)}
              className="bg-transparent text-white font-bold text-[10px] focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-neutral-900 text-white">ALL LABS</option>
              <option value="LAB_01_STOCK" className="bg-neutral-900 text-white">LAB 01 (STOCK)</option>
              <option value="LAB_02_ETF" className="bg-neutral-900 text-white">LAB 02 (ETF)</option>
              <option value="LAB_03_COMMODITY" className="bg-neutral-900 text-white">LAB 03 (COMMODITY)</option>
            </select>
          </div>

          {/* TIME RANGE SELECTOR */}
          <div className="flex bg-black/80 border border-terminal-border/80 rounded p-0.5 text-[10px]">
            {(['1D', '5D', '1M', '3M', '6M', '1Y'] as const).map(tr => (
              <button
                key={tr}
                onClick={() => setSelectedTimeRange(tr)}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  selectedTimeRange === tr
                    ? 'bg-terminal-amber text-black'
                    : 'text-terminal-muted hover:text-white'
                }`}
              >
                {tr}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadPaperTrades()}
            className="p-1.5 bg-black/80 border border-terminal-border/80 hover:border-terminal-amber rounded text-terminal-muted hover:text-white transition cursor-pointer"
            title="Refresh Canonical Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN CHART VISUALIZATION CANVAS */}
      <div className="flex-1 p-4 flex flex-col gap-4 min-h-[360px]">
        <div className="bg-neutral-950 border border-terminal-border/80 rounded p-4 flex flex-col flex-1 min-h-[300px] relative">
          <div className="flex items-center justify-between mb-3 border-b border-terminal-border/40 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-terminal-amber" />
              <span className="font-bold text-white text-xs uppercase tracking-wide">
                CUMULATIVE P&L PERFORMANCE CURVE
              </span>
              <span className="text-[10px] text-terminal-muted font-normal">
                ({selectedAiModel === 'ALL' ? 'Comparative Multi-Model Analysis' : `Single Model: ${selectedAiModel}`})
              </span>
            </div>
            <div className="text-[10px] text-terminal-amber font-mono">
              Base Equity: ₹100,000 / Model
            </div>
          </div>

          {chartSeriesData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-terminal-border/50 rounded bg-black/40 my-2">
              <Info className="w-8 h-8 text-terminal-amber/60 mb-2" />
              <div className="text-white font-bold text-sm uppercase tracking-wide mb-1">
                NO PAPER PERFORMANCE DATA AVAILABLE
              </div>
              <p className="text-terminal-muted text-xs max-w-md">
                No canonical paper execution records found for the selected Lab filter ({selectedLabFilter}) and Time Range ({selectedTimeRange}).
                Execute paper trading strategies to populate real-time performance curves.
              </p>
            </div>
          ) : (
            <div className="w-full flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                <LineChart data={chartSeriesData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="time" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
                  <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333', color: '#fff', fontSize: '11px' }}
                    formatter={(value: any) => [`₹${value}`, 'Cumulative P&L']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  
                  {selectedAiModel === 'ALL' ? (
                    ENTERPRISE_AI_MODELS_REGISTRY.slice(0, 8).map(m => (
                      <Line
                        key={m.id}
                        type="monotone"
                        dataKey={m.id}
                        name={m.name}
                        stroke={MODEL_COLORS[m.id] || '#14b8a6'}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))
                  ) : (
                    <Line
                      type="monotone"
                      dataKey={selectedAiModel}
                      name={ENTERPRISE_AI_MODELS_REGISTRY.find(m => m.id === selectedAiModel)?.name || selectedAiModel}
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* AI MODEL LEADERBOARD TABLE */}
        <div className="bg-neutral-950 border border-terminal-border/80 rounded p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-terminal-border/40 pb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-terminal-amber" />
              <span className="font-bold text-white text-xs uppercase tracking-wide">
                AI MODEL LEADERBOARD & PERFORMANCE METRICS
              </span>
            </div>
            <span className="text-[10px] text-terminal-muted">
              Ranked by Total P&L from Canonical Paper Trades
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead>
                <tr className="border-b border-terminal-border/60 text-terminal-muted uppercase text-[9px] tracking-wider bg-black/60">
                  <th className="p-2">Rank / Model</th>
                  <th className="p-2">Provider</th>
                  <th className="p-2 text-right">Trades</th>
                  <th className="p-2 text-right">Win Rate</th>
                  <th className="p-2 text-right">Realized P&L</th>
                  <th className="p-2 text-right">Unrealized P&L</th>
                  <th className="p-2 text-right">Total P&L</th>
                  <th className="p-2 text-right">Return %</th>
                  <th className="p-2 text-right">Current Equity</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border/30">
                {leaderboard.map((item, idx) => {
                  const regModel = ENTERPRISE_AI_MODELS_REGISTRY.find(m => m.id === item.modelId);
                  const isPositive = item.totalPnl >= 0;

                  return (
                    <tr key={item.modelId} className="hover:bg-white/5 transition">
                      <td className="p-2 font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-terminal-amber/10 border border-terminal-amber/30 text-terminal-amber text-[10px] flex items-center justify-center font-black">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="text-white font-bold">{item.modelName}</div>
                          <div className="text-[9px] text-terminal-muted">{item.modelId}</div>
                        </div>
                      </td>
                      <td className="p-2 text-gray-300">{regModel?.provider || 'Enterprise'}</td>
                      <td className="p-2 text-right font-bold text-white">{item.totalTrades}</td>
                      <td className="p-2 text-right font-bold text-teal-400">{item.winRatePct.toFixed(1)}%</td>
                      <td className={`p-2 text-right font-bold ${item.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ₹{item.realizedPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`p-2 text-right font-bold ${item.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ₹{item.unrealizedPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`p-2 text-right font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ₹{item.totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`p-2 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : ''}{item.returnPct.toFixed(2)}%
                      </td>
                      <td className="p-2 text-right font-bold text-white">
                        ₹{item.equity.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => setInspectingModel(regModel || null)}
                          className="px-2 py-1 bg-terminal-amber/10 hover:bg-terminal-amber/20 border border-terminal-amber/30 text-terminal-amber text-[10px] font-bold rounded flex items-center gap-1 mx-auto transition cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          INSPECT
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* READ-ONLY MODEL INSPECTOR MODAL */}
      {inspectingModel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-950 border border-terminal-border w-full max-w-2xl rounded-lg shadow-2xl p-6 flex flex-col gap-4 font-mono">
            <div className="flex items-center justify-between border-b border-terminal-border/60 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-terminal-amber" />
                <span className="font-black text-white text-sm uppercase tracking-wide">
                  AI MODEL FORENSIC INSPECTOR — READ ONLY
                </span>
              </div>
              <button
                onClick={() => setInspectingModel(null)}
                className="p-1 text-terminal-muted hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-black border border-terminal-border/60 rounded">
                <span className="text-terminal-muted text-[10px] uppercase">Model Name</span>
                <div className="text-white font-black text-sm">{inspectingModel.name}</div>
                <div className="text-terminal-amber text-[10px]">{inspectingModel.id}</div>
              </div>
              <div className="p-3 bg-black border border-terminal-border/60 rounded">
                <span className="text-terminal-muted text-[10px] uppercase">Provider & Version</span>
                <div className="text-white font-bold">{inspectingModel.provider}</div>
                <div className="text-teal-400 text-[10px]">{inspectingModel.version}</div>
              </div>
            </div>

            <div className="p-3 bg-black border border-terminal-border/60 rounded flex flex-col gap-1">
              <span className="text-terminal-muted text-[10px] uppercase font-bold">Strategy & Architecture</span>
              <div className="text-white font-bold">{inspectingModel.strategy}</div>
              <p className="text-gray-400 text-[11px] leading-relaxed">{inspectingModel.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 bg-black border border-terminal-border/60 rounded">
                <span className="text-[9px] text-terminal-muted uppercase">Status</span>
                <div className="text-teal-400 font-bold">{inspectingModel.status}</div>
              </div>
              <div className="p-2.5 bg-black border border-terminal-border/60 rounded">
                <span className="text-[9px] text-terminal-muted uppercase">Accuracy</span>
                <div className="text-terminal-amber font-bold">{inspectingModel.accuracy}%</div>
              </div>
              <div className="p-2.5 bg-black border border-terminal-border/60 rounded">
                <span className="text-[9px] text-terminal-muted uppercase">Latency</span>
                <div className="text-white font-bold">{inspectingModel.latency} ms</div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded text-[10px] text-amber-300 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                READ ONLY INSPECTOR MODE — No live order execution, broker mutation, or parameter alteration is permitted from this view.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingModel(null)}
                className="px-4 py-1.5 bg-terminal-amber text-black font-black uppercase text-xs rounded hover:bg-terminal-amber/90 transition cursor-pointer"
              >
                CLOSE INSPECTOR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
