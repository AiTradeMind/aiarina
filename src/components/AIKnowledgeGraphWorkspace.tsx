import React, { useState } from 'react';
import { 
  Network, 
  Share2, 
  ShieldCheck, 
  Activity, 
  RefreshCcw, 
  Download, 
  Sliders, 
  Search, 
  Filter, 
  Clock, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Lock, 
  Zap,
  Check,
  FileText,
  GitBranch,
  RotateCw,
  Eye,
  SlidersHorizontal,
  Layers,
  Link,
  Compass,
  ArrowLeft,
  BarChart3,
  PieChart,
  Cpu,
  Globe,
  Server,
  Shield,
  Terminal,
  Settings,
  Key,
  Award
} from 'lucide-react';

interface AIKnowledgeGraphProps {
  showToast: (msg: string) => void;
}

export const AIKnowledgeGraphWorkspace: React.FC<AIKnowledgeGraphProps> = ({ showToast }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'REGISTRY' | 'VISUALIZATION' | 'SEMANTIC' | 'COMMUNITY' | 'HEALTH' | 'REPLAY' | 'DEPENDENCIES' | 'AUDIT'>('REGISTRY');
  
  // Master-Detail Navigation States (Zero Popups, Zero Drawers, Zero Overlays)
  const [currentView, setCurrentView] = useState<'LIST' | 'ENTITY_PASSPORT' | 'RELATIONSHIP_PASSPORT' | 'REPLAY_VIEW'>('LIST');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [importanceFilter, setImportanceFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Knowledge graph relationship matrix and entity telemetry refreshed.');
    }, 700);
  };

  const handleExportKnowledge = () => {
    showToast('Enterprise Knowledge Graph export completed successfully (RDF/JSON/CSV snapshot).');
  };

  const knowledgeNodes = [
    {
      id: 'K-NODE-501',
      entity: 'Federal Reserve Rate Corridor',
      category: 'Economic Relationships',
      importance: 'CRITICAL',
      updated: '08:45:00',
      status: 'ACTIVE',
      summary: 'Central bank rate corridor governing overnight repo rates and banking liquidity reserve ratios.',
      businessMeaning: 'Directly dictates capital cost across all equity baskets and fixed-income portfolios.',
      impact: 'High Portfolio-wide Impact (Tier 1 Macro Driver)',
      confidence: '99.2%',
      version: 'v3.2',
      owner: 'Macro Intelligence Engine',
      connectedEntities: [
        { name: 'NIFTY Bank Index', type: 'Symbol', relation: 'Direct Monetary Sensitivity (-0.84)', weight: 0.95 },
        { name: 'Treasury Yield Curve', type: 'Economic', relation: 'Primary Yield Anchor', weight: 0.98 },
        { name: 'Gemini 2.5 Pro Strategy', type: 'AI Model', relation: 'Core Macro Input Vector', weight: 0.91 }
      ],
      affectedModels: ['Gemini 2.5 Pro', 'Claude 3.5 Sonnet', 'Mistral Large 2'],
      relationshipHistory: [
        { time: '08:45:00', event: 'Connection weight recalibrated after Fed minutes release.', author: 'Macro Intelligence' },
        { time: 'Yesterday', event: 'New derivative dependency edge added for banking basket.', author: 'Risk Management' }
      ],
      auditNotes: 'Verified against official central bank wire transmissions via secure API feed.'
    },
    {
      id: 'K-NODE-502',
      entity: 'IT Services Sector Export Revenue Stream',
      category: 'Sector Relationships',
      importance: 'HIGH',
      updated: '08:30:15',
      status: 'ACTIVE',
      summary: 'Aggregate USD revenue dependency and enterprise cloud IT spending velocity for tier-1 tech exporters.',
      businessMeaning: 'Determines cash flow valuations and foreign exchange hedging requirements for tech equities.',
      impact: 'Medium-High Impact on Tech Basket Allocations',
      confidence: '95.8%',
      version: 'v3.0',
      owner: 'Sector Intelligence Engine',
      connectedEntities: [
        { name: 'USD/INR Currency Pair', type: 'Economic', relation: 'Positive FX Correlation (+0.76)', weight: 0.88 },
        { name: 'Nasdaq 100 Index', type: 'Symbol', relation: 'Global Tech Sentiment Link', weight: 0.85 },
        { name: 'DeepSeek R1', type: 'AI Model', relation: 'Tactical Allocation Target', weight: 0.82 }
      ],
      affectedModels: ['DeepSeek R1', 'Qwen 2.5 Max'],
      relationshipHistory: [
        { time: '08:30:15', event: 'Quarterly earnings telemetry ingestion completed.', author: 'Research Engine' }
      ],
      auditNotes: 'Cross-checked with quarterly SEC/SEBI financial filings.'
    },
    {
      id: 'K-NODE-503',
      entity: 'Crude Oil Import Price Parity',
      category: 'Commodity Relationships',
      importance: 'MEDIUM',
      updated: '08:15:00',
      status: 'ACTIVE',
      summary: 'Global Brent crude spot pricing impact on domestic energy import deficit and inflationary pressure.',
      businessMeaning: 'Drives macroeconomic inflation expectations and energy sector margin compressions.',
      impact: 'Localized Impact on Energy & OMCs',
      confidence: '91.4%',
      version: 'v2.8',
      owner: 'Commodity Desk',
      connectedEntities: [
        { name: 'Domestic OMCs Basket', type: 'Symbol', relation: 'Inverse Margin Correlation', weight: 0.79 },
        { name: 'Consumer Price Index (CPI)', type: 'Economic', relation: 'Primary Inflation Component', weight: 0.83 }
      ],
      affectedModels: ['Mistral Large 2', 'Llama 3.3 70B'],
      relationshipHistory: [
        { time: '08:15:00', event: 'OPEC supply quota adjustment link updated.', author: 'Commodity Engine' }
      ],
      auditNotes: 'Real-time commodity exchange feed synchronized.'
    },
    {
      id: 'K-NODE-504',
      entity: 'Semiconductor Supply Chain Node',
      category: 'Event Relationships',
      importance: 'CRITICAL',
      updated: '07:50:00',
      status: 'ACTIVE',
      summary: 'Global fab capacity utilization rates and advanced packaging lead times.',
      businessMeaning: 'Bottleneck indicator for hardware-dependent technology manufacturers and AI infrastructure.',
      impact: 'Critical Supply Chain Dependency',
      confidence: '97.1%',
      version: 'v3.5',
      owner: 'Supply Chain Intelligence',
      connectedEntities: [
        { name: 'Global Tech Hardware Basket', type: 'Symbol', relation: 'Direct Capacity Constraint', weight: 0.94 },
        { name: 'AI Infrastructure Fund', type: 'Strategy', relation: 'Capital Expenditure Link', weight: 0.90 }
      ],
      affectedModels: ['Gemini 2.5 Pro', 'Claude 3.5 Sonnet'],
      relationshipHistory: [
        { time: '07:50:00', event: 'Fab capacity index refreshed.', author: 'Supply Chain Bot' }
      ],
      auditNotes: 'Verified via industry semiconductor association bulletin.'
    }
  ];

  const filteredNodes = knowledgeNodes.filter(n => {
    const matchesSearch = n.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || n.category === categoryFilter;
    const matchesImportance = importanceFilter === 'ALL' || n.importance === importanceFilter;
    const matchesStatus = statusFilter === 'ALL' || n.status === statusFilter;
    return matchesSearch && matchesCategory && matchesImportance && matchesStatus;
  });

  const knowledgeHealth = {
    coverage: '98.6% (1,420 Active Entity Nodes)',
    orphanNodes: '0 Isolated Nodes',
    brokenLinks: '0 Broken Edges Detected',
    recentUpdates: [
      { time: '08:45:00', event: 'Federal Reserve rate corridor edge re-weighted.' },
      { time: '08:30:15', event: 'IT export revenue correlation matrix updated.' }
    ],
    auditSummary: '100% cryptographic graph integrity verified.'
  };

  const knowledgeTimeline = [
    { id: 'k-t1', time: '08:45:00', type: 'VALIDATED', title: 'Knowledge Node Validated', desc: 'K-NODE-501 correlation weights verified against live market telemetry.' },
    { id: 'k-t2', time: '08:15:00', type: 'UPDATED', title: 'Relationship Edge Added', desc: 'New dependency edge linked between Crude Oil and OMC basket.' },
    { id: 'k-t3', time: 'Yesterday', type: 'CREATED', title: 'New Macro Entity Ingested', desc: 'Supply chain semiconductor node integrated into knowledge graph.' },
    { id: 'k-t4', time: 'Last Week', type: 'ARCHIVED', title: 'Legacy Correlation Purged', desc: 'Obsolete pandemic-era liquidity correlation node archived.' }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 text-slate-100 p-6 space-y-6 font-mono">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-emerald-400 font-bold uppercase">AI Intelligence</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-bold">Knowledge Intelligence OS</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
              Enterprise Knowledge Graph Intelligence OS
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Graph Engine Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Palantir Gotham + Microsoft Fabric grade semantic relationship mapping, entity lineage, and community detection.
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh State</span>
          </button>

          <button
            onClick={handleExportKnowledge}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Snapshot</span>
          </button>

          <button
            onClick={() => showToast('Semantic embedding search index re-indexed.')}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs rounded flex items-center gap-1.5 transition-colors font-bold"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Re-Index Vectors</span>
          </button>
        </div>
      </div>

      {/* MASTER-DETAIL VIEW RENDERER (ZERO POPUPS, ZERO DRAWERS) */}
      {currentView === 'LIST' && (
        <>
          {/* EXACTLY 4 KNOWLEDGE KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Knowledge Nodes</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase">INDEXED</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-white">1,420 Nodes</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Global market entity map</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Relationships</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase">CONNECTED</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-400">8,940 Edges</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Multi-dimensional correlation</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Dependencies</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase">MONITORED</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-amber-400">142 Chains</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>High impact causal links</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Knowledge Coverage</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase">COMPLETE</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-emerald-400">98.6%</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time graph synchronization</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABS NAVIGATION BAR */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
            {[
              { id: 'REGISTRY', label: 'Enterprise Node Registry', icon: Network },
              { id: 'VISUALIZATION', label: 'Graph Visualization', icon: Share2 },
              { id: 'SEMANTIC', label: 'Semantic & Vector Search', icon: Search },
              { id: 'COMMUNITY', label: 'Community Detection', icon: Layers },
              { id: 'HEALTH', label: 'Knowledge Health Engine', icon: Activity },
              { id: 'REPLAY', label: 'Knowledge Replay', icon: RotateCw },
              { id: 'DEPENDENCIES', label: 'Dependency Explorer', icon: GitBranch },
              { id: 'AUDIT', label: 'Audit & Compliance', icon: Lock }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded text-xs font-mono font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT: REGISTRY */}
          {activeTab === 'REGISTRY' && (
            <div className="space-y-4">
              {/* SEARCH & FILTERS BAR */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search node ID, entity or summary..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400 text-[11px]">Category:</span>
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Economic Relationships">Economic Relationships</option>
                    <option value="Sector Relationships">Sector Relationships</option>
                    <option value="Commodity Relationships">Commodity Relationships</option>
                    <option value="Event Relationships">Event Relationships</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Importance:</span>
                  </div>
                  <select
                    value={importanceFilter}
                    onChange={(e) => setImportanceFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="ALL">All Importances</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>
              </div>

              {/* TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Network className="w-4 h-4 text-emerald-400" />
                    Enterprise Knowledge Node Registry (Click row for Entity Digital Passport)
                  </h3>
                  <span className="text-[10px] text-slate-400">{filteredNodes.length} Nodes Indexed</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                        <th className="p-3">Node ID & Entity</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Importance</th>
                        <th className="p-3">Confidence</th>
                        <th className="p-3">Owner</th>
                        <th className="p-3">Updated</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredNodes.map(node => (
                        <tr 
                          key={node.id} 
                          onClick={() => { setSelectedNode(node); setCurrentView('ENTITY_PASSPORT'); }}
                          className="hover:bg-slate-950/60 cursor-pointer transition-colors"
                        >
                          <td className="p-3 font-bold text-white">
                            <span className="text-amber-400 mr-2">{node.id}</span> {node.entity}
                          </td>
                          <td className="p-3 text-slate-300">{node.category}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${
                              node.importance === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              node.importance === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {node.importance}
                            </span>
                          </td>
                          <td className="p-3 text-emerald-400 font-bold">{node.confidence}</td>
                          <td className="p-3 text-blue-400">{node.owner}</td>
                          <td className="p-3 text-slate-400">{node.updated}</td>
                          <td className="p-3 text-right">
                            <button className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold text-[10px]">
                              Entity Passport →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'VISUALIZATION' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  Interactive Knowledge Graph Visualization & Critical Path Explorer
                </h3>
                <span className="text-[10px] text-blue-400">Node-Edge Matrix Rendered</span>
              </div>
              <div className="p-8 bg-slate-950 border border-slate-800 rounded text-center space-y-4">
                <div className="flex justify-center items-center gap-6 flex-wrap">
                  {knowledgeNodes.map((n, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => { setSelectedNode(n); setCurrentView('ENTITY_PASSPORT'); }}
                      className="p-4 bg-slate-900 border border-slate-700 rounded-xl w-60 text-left space-y-2 cursor-pointer hover:border-emerald-500 transition-colors"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-amber-400 font-bold">{n.id}</span>
                        <span className="text-emerald-400">{n.confidence}</span>
                      </div>
                      <div className="text-white font-bold text-xs">{n.entity}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{n.category}</div>
                      <div className="pt-2 border-t border-slate-800 text-[10px] text-blue-400 font-bold">
                        Click for Passport →
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">Interactive zoom, pan, and causal cluster selection fully active.</p>
              </div>
            </div>
          )}

          {activeTab === 'SEMANTIC' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                Semantic Vector Embedding Search & Cluster Analysis
              </h3>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-3">
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter semantic query (e.g., 'inflation sensitivity and banking reserve ratios')..." className="flex-1 bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded text-xs" />
                  <button onClick={() => showToast('Semantic vector similarity search completed.')} className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded text-xs">Run Vector Query</button>
                </div>
                <div className="text-xs text-slate-400">Indexed via text-embedding-004 cosine similarity matrix.</div>
              </div>
            </div>
          )}

          {activeTab === 'COMMUNITY' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Community Detection & Influence Clustering
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase">Macro Cluster A</span>
                  <strong className="text-white text-sm block">Central Bank & Yield Curve</strong>
                  <span className="text-emerald-400 text-xs">Density: 0.94 (High Influence)</span>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase">Sector Cluster B</span>
                  <strong className="text-white text-sm block">IT Export & FX Correlation</strong>
                  <span className="text-blue-400 text-xs">Density: 0.88 (Stable)</span>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase">Supply Chain Cluster C</span>
                  <strong className="text-white text-sm block">Semiconductors & Hardware</strong>
                  <span className="text-amber-400 text-xs">Density: 0.91 (Critical Path)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'HEALTH' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Knowledge Health Engine & Auto-Repair Diagnostics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">Graph Coverage</span>
                  <strong className="text-emerald-400 text-base block">{knowledgeHealth.coverage}</strong>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">Orphan Nodes</span>
                  <strong className="text-white text-base block">{knowledgeHealth.orphanNodes}</strong>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">Broken Links</span>
                  <strong className="text-blue-400 text-base block">{knowledgeHealth.brokenLinks}</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'REPLAY' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-amber-400" />
                Knowledge Replay & Version Timeline
              </h3>
              <div className="space-y-3">
                {knowledgeTimeline.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-bold">{t.time}</span>
                        <span className="text-white font-bold">{t.title}</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">{t.desc}</p>
                    </div>
                    <button onClick={() => showToast(`Replayed state for ${t.title}`)} className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-xs font-bold">Replay State</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'DEPENDENCIES' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                Cross-Module Dependency Explorer
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Decision Engine', 'AI Committee', 'AI Memory', 'AI Lifecycle', 'Research Feed', 'Strategy Builder', 'Paper Trading OMS', 'Analytics Engine'].map((mod, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded text-center">
                    <Server className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <strong className="text-white font-bold block">{mod}</strong>
                    <span className="text-emerald-400 text-[9px]">FULLY LINKED</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                Cryptographic Knowledge Audit Ledger
              </h3>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="text-emerald-400 font-bold">100% Graph Integrity Verified</div>
                <p className="text-xs text-slate-300">All 1,420 entity nodes and 8,940 relationship edges possess SHA-256 cryptographic signatures tied to the centralized event ledger.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* MASTER-DETAIL: ENTITY DIGITAL PASSPORT */}
      {currentView === 'ENTITY_PASSPORT' && selectedNode && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentView('LIST')} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-amber-400 font-mono text-xs uppercase font-bold">Entity Digital Passport: {selectedNode.id}</span>
                <h2 className="text-lg font-bold text-white">{selectedNode.entity}</h2>
              </div>
            </div>
            <button onClick={() => setCurrentView('LIST')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs">
              ← Return to Registry
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 text-[10px] uppercase">Category</span>
              <strong className="text-white text-xs block mt-1">{selectedNode.category}</strong>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 text-[10px] uppercase">Importance</span>
              <strong className="text-amber-400 text-xs block mt-1">{selectedNode.importance}</strong>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 text-[10px] uppercase">Confidence</span>
              <strong className="text-emerald-400 text-xs block mt-1">{selectedNode.confidence}</strong>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded">
              <span className="text-slate-500 text-[10px] uppercase">Owner Service</span>
              <strong className="text-blue-400 text-xs block mt-1">{selectedNode.owner}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded space-y-3">
              <h3 className="font-bold text-amber-400 uppercase text-xs">Business Meaning & Impact</h3>
              <p className="text-slate-200 text-xs">{selectedNode.businessMeaning}</p>
              <div className="p-3 bg-slate-900 rounded border border-slate-800 text-xs text-slate-300">
                {selectedNode.impact}
              </div>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded space-y-3">
              <h3 className="font-bold text-blue-400 uppercase text-xs">Connected Entities & Edges</h3>
              <div className="space-y-2">
                {selectedNode.connectedEntities.map((conn: any, i: number) => (
                  <div key={i} className="p-2.5 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-white">{conn.name}</strong>
                      <span className="text-slate-400 block text-[10px]">{conn.relation}</span>
                    </div>
                    <span className="text-emerald-400 font-bold">{conn.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-950 border border-slate-800 rounded space-y-3">
            <h3 className="font-bold text-purple-400 uppercase text-xs">Affected AI Models & Audit Trail</h3>
            <div className="flex flex-wrap gap-2">
              {selectedNode.affectedModels.map((m: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono">
                  {m}
                </span>
              ))}
            </div>
            <p className="text-slate-400 text-xs pt-2">Audit Notes: {selectedNode.auditNotes}</p>
          </div>
        </div>
      )}

    </div>
  );
};
