import React, { useState } from 'react';
import { 
  FileCheck, RefreshCcw, Download, ExternalLink, Search, Filter, Cpu, CheckCircle2, AlertTriangle, Layers, Brain, ArrowRight, ShieldCheck, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIExplainabilityProps {
  showToast: (msg: string) => void;
}

interface DecisionTraceRecord {
  id: string;
  decisionId: string;
  symbol: string;
  timestamp: string;
  action: 'BUY' | 'SELL' | 'HOLD' | 'REBALANCE';
  confidencePct: number;
  tokensConsumed: number;
  latencyMs: number;
  primaryModel: string;
  provider: string;
  version: string;
  shaps: { factor: string; weight: number; impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' }[];
  reasoningSteps: { step: number; title: string; description: string }[];
  modelContributions: { modelName: string; sharePct: number }[];
}

export const AIExplainabilityWorkspace: React.FC<AIExplainabilityProps> = ({ showToast }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DecisionTraceRecord | null>(null);

  // Decision trace records source
  const [records] = useState<DecisionTraceRecord[]>([
    {
      id: 'TRC-901',
      decisionId: 'DEC-8041',
      symbol: 'RELIANCE.NS',
      timestamp: '2026-08-02 10:42:15',
      action: 'BUY',
      confidencePct: 96.4,
      tokensConsumed: 4120,
      latencyMs: 11,
      primaryModel: 'Google Gemini 2.5 Pro',
      provider: 'Google DeepMind',
      version: 'v2.5.4',
      shaps: [
        { factor: 'L2 Orderbook Bid Delta (+24.5k)', weight: +0.42, impact: 'POSITIVE' },
        { factor: '15m Ascending Triangle Breakout', weight: +0.35, impact: 'POSITIVE' },
        { factor: 'FII Institutional Net Inflows', weight: +0.18, impact: 'POSITIVE' },
        { factor: 'Near-term Option IV Skew', weight: -0.08, impact: 'NEGATIVE' }
      ],
      reasoningSteps: [
        { step: 1, title: 'Orderbook Depth Scan', description: 'Detected +24,500 buy volume delta at ₹2,920 support level.' },
        { step: 2, title: 'Multi-Factor Alpha Convergence', description: 'Momentum vector cross-validated across 15m and 1h timeframe graphs.' },
        { step: 3, title: 'Constitutional Safety Gate', description: 'Verified Article IV VaR threshold (0.042% < 0.50% max limit).' }
      ],
      modelContributions: [
        { modelName: 'Google Gemini 2.5 Pro (v2.5.4)', sharePct: 45 },
        { modelName: 'Anthropic Claude 3.5 Sonnet (v3.5.1)', sharePct: 30 },
        { modelName: 'OpenAI GPT-4o (v4.0)', sharePct: 25 }
      ]
    },
    {
      id: 'TRC-902',
      decisionId: 'DEC-8039',
      symbol: 'TCS.NS',
      timestamp: '2026-08-02 10:38:00',
      action: 'BUY',
      confidencePct: 94.2,
      tokensConsumed: 3850,
      latencyMs: 14,
      primaryModel: 'Anthropic Claude 3.5 Sonnet',
      provider: 'Anthropic',
      version: 'v3.5.1',
      shaps: [
        { factor: 'IT Sector Export Revenue Sentiment', weight: +0.48, impact: 'POSITIVE' },
        { factor: 'USD/INR Currency Pair Correlation', weight: +0.31, impact: 'POSITIVE' },
        { factor: 'Intraday VWAP Hold', weight: +0.15, impact: 'POSITIVE' }
      ],
      reasoningSteps: [
        { step: 1, title: 'Macro Sentiment Ingestion', description: 'Parsed 1,200 wire news items for IT export guidance.' },
        { step: 2, title: 'Options Volatility Check', description: 'Assessed gamma risk on near-expiry contracts.' }
      ],
      modelContributions: [
        { modelName: 'Anthropic Claude 3.5 Sonnet (v3.5.1)', sharePct: 50 },
        { modelName: 'DeepSeek R1 (v1.2.0)', sharePct: 35 },
        { modelName: 'Meta Llama 3.3 70B (v3.3.0)', sharePct: 15 }
      ]
    }
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('AI Decision Trace telemetry & feature attributions refreshed.');
    }, 600);
  };

  const handleExport = () => {
    showToast('Exported AI Decision Trace & Attribution Ledger (JSON/CSV).');
  };

  const filteredRecords = records.filter(r => 
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.decisionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.primaryModel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* CANONICAL EXPLAINABILITY OS LINK BANNER */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl flex items-center justify-between font-mono text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-amber-300 block text-sm">AI Decision Trace & Attribution Local Workspace</strong>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Local decision attribution, feature SHAP weights, prompt/reasoning traces, and token telemetry for AI Intelligence.
            </p>
          </div>
        </div>

        <button 
          onClick={() => showToast('Redirecting to Canonical Top-Level Explainability OS...')}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <span>Canonical Explainability OS</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">08 AI Decision Trace & Attribution Ledger</h2>
            <p className="text-xs text-slate-400 font-mono">Immutable auditability & SHAP feature decomposition per decision</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search traces, symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded font-mono focus:outline-none focus:border-amber-500 w-48"
            />
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <RefreshCcw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* TRACES TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-slate-300 uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            Decision Traces ({filteredRecords.length})
          </span>
          <span className="text-slate-500 text-[10px]">Click any trace row to open deep SHAP decomposition</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold bg-slate-950/40">
                <th className="p-3">Trace ID & Decision</th>
                <th className="p-3">Symbol</th>
                <th className="p-3">Primary Model</th>
                <th className="p-3">Action</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Tokens</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3 text-right">Attribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-mono text-xs">
                    NO CURRENT DECISION TRACES FOUND
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${selectedRecord?.id === r.id ? 'bg-amber-500/10' : ''}`}
                  >
                    <td className="p-3 font-bold text-white">
                      <span className="text-amber-400 mr-2">{r.id}</span>
                      <span className="text-slate-400 font-normal">({r.decisionId})</span>
                    </td>
                    <td className="p-3 font-bold text-amber-300">{r.symbol}</td>
                    <td className="p-3 text-slate-200">
                      <div>{r.primaryModel}</div>
                      <span className="text-[9px] text-slate-500">{r.provider} • {r.version}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded border border-emerald-500/30">
                        {r.action}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">{r.confidencePct}%</td>
                    <td className="p-3 text-purple-300">{r.tokensConsumed.toLocaleString()} tks</td>
                    <td className="p-3 text-blue-400 font-bold">{r.latencyMs}ms</td>
                    <td className="p-3 text-slate-400 text-[10px]">{r.timestamp}</td>
                    <td className="p-3 text-right">
                      <button className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold text-[10px]">
                        Inspect SHAP →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SELECTED RECORD DEEP-DIVE PASSPORT */}
      {selectedRecord && (
        <div className="p-5 bg-slate-900 border border-amber-500/40 rounded-xl space-y-5 font-mono text-xs shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase">
                  SHAP Feature Attribution & Reasoning Trace — <span className="text-amber-400">{selectedRecord.id}</span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Symbol: <strong className="text-amber-300">{selectedRecord.symbol}</strong> • Primary AI: <strong className="text-slate-200">{selectedRecord.primaryModel} ({selectedRecord.version})</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="text-slate-500 hover:text-white text-xs px-2 py-1 bg-slate-950 border border-slate-800 rounded"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SHAP DECOMPOSITION */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                SHAP Feature Weights
              </h4>
              <div className="space-y-2">
                {selectedRecord.shaps.map((s, idx) => (
                  <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{s.factor}</span>
                    <span className={`font-bold ${s.weight > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.weight > 0 ? `+${s.weight}` : s.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* REASONING STEPS */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-blue-400 uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Reasoning Trace Steps
              </h4>
              <div className="space-y-2">
                {selectedRecord.reasoningSteps.map((st) => (
                  <div key={st.step} className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px]">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded text-[9px]">Step {st.step}</span>
                      <span>{st.title}</span>
                    </div>
                    <p className="text-slate-400 text-[10px] mt-1">{st.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* MULTI-AI CONTRIBUTIONS */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-purple-300 uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-300" />
                Multi-AI Voting Contribution
              </h4>
              <div className="space-y-2">
                {selectedRecord.modelContributions.map((mc, idx) => (
                  <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] flex items-center justify-between">
                    <span className="text-slate-300">{mc.modelName}</span>
                    <strong className="text-purple-300">{mc.sharePct}% share</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
