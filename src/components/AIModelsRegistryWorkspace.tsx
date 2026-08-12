import React, { useState, useMemo } from 'react';
import { AIModelProfileView } from './AIModelProfileView';
import { 
  Cpu, 
  Search, 
  Filter, 
  Sliders, 
  Download, 
  Plus, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Eye, 
  Pause, 
  Play, 
  Archive, 
  Star, 
  RefreshCcw, 
  TrendingUp, 
  Clock, 
  Lock, 
  Server, 
  Check, 
  AlertCircle, 
  BarChart3, 
  Layers, 
  Tag, 
  Activity, 
  FileText, 
  ChevronLeft, 
  ChevronsLeft, 
  ChevronsRight, 
  Database, 
  Sparkles, 
  ShieldCheck, 
  Scale, 
  Brain, 
  Users, 
  FileCheck,
  Zap,
  ArrowUpDown,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { 
  AIModelRegistryFullItem, 
  ENTERPRISE_AI_MODELS_REGISTRY, 
  getModelWithDefaults 
} from '../data/aiModelsRegistry';

export type { AIModelRegistryFullItem };

export const AIModelsRegistryWorkspace: React.FC<{
  onOpenProfile?: (model: any) => void;
  showToast?: (msg: string) => void;
}> = ({ onOpenProfile, showToast }) => {
  // Master-Detail State: Selected model for Digital Passport Detail View
  const [selectedModelDetail, setSelectedModelDetail] = useState<AIModelRegistryFullItem | null>(null);

  // Sub-Navigation Tab State for Enterprise Fleet Management
  const [activeSubTab, setActiveSubTab] = useState<'FLEET' | 'DOMAIN_MATRIX' | 'CAPABILITIES' | 'PROVIDER_HEALTH' | 'DEPENDENCIES' | 'FLEET_OPS'>('FLEET');

  // Models State
  const [models, setModels] = useState<AIModelRegistryFullItem[]>(() => ENTERPRISE_AI_MODELS_REGISTRY.map(getModelWithDefaults));
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [deploymentFilter, setDeploymentFilter] = useState<string>('ALL');
  const [quickFilter, setQuickFilter] = useState<string>('ALL');

  // Sorting State
  const [sortField, setSortField] = useState<keyof AIModelRegistryFullItem>('accuracy');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Multi-select & Bulk Actions
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);

  // Column Visibility Chooser
  const [isColumnChooserOpen, setIsColumnChooserOpen] = useState(false);
  const [columns, setColumns] = useState({
    provider: true,
    version: true,
    category: true,
    status: true,
    deployment: true,
    accuracy: true,
    latency: true,
    confidence: true,
    health: true,
    tokenLimit: true,
    contextWindow: true,
    cost: true,
    lastActivity: true
  });

  // Display Density Mode
  const [densityMode, setDensityMode] = useState<'NORMAL' | 'COMPACT'>('NORMAL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Inspector Drawer State
  const [inspectedModel, setInspectedModel] = useState<AIModelRegistryFullItem | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'GENERAL' | 'SPECS' | 'HEALTH' | 'PERFORMANCE' | 'LINKED'>('GENERAL');

  // Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newModelForm, setNewModelForm] = useState({
    name: '',
    provider: 'Google DeepMind',
    version: 'v1.0.0-prod',
    category: 'Trend & Momentum',
    status: 'ACTIVE' as const,
    deployment: 'PRODUCTION' as const,
    contextWindow: '128,000',
    tokenLimit: '1,000,000',
    cost: '$0.0020 / 1k',
    tags: 'Core, NewModel'
  });

  const notify = (msg: string) => {
    if (showToast) {
      showToast(msg);
    } else {
      alert(msg);
    }
  };

  const handleOpenDigitalPassport = (model: AIModelRegistryFullItem) => {
    const enriched = getModelWithDefaults(model);
    setSelectedModelDetail(enriched);
    setIsInspectorOpen(false);
    if (onOpenProfile) {
      onOpenProfile(enriched);
    }
  };

  // Domain Toggle Handler
  const toggleDomainToggle = (modelId: string, key: keyof NonNullable<AIModelRegistryFullItem['domainToggles']>) => {
    setModels(prev => prev.map(m => {
      if (m.id !== modelId) return m;
      const current = m.domainToggles || {
        global: m.status !== 'DISABLED',
        research: true,
        decision: m.status === 'ACTIVE',
        committee: true,
        memory: true,
        paperTrading: m.status === 'PAPER' || m.status === 'ACTIVE',
        liveTradingV2: false,
      };
      const updated = { ...current, [key]: !current[key] };
      return {
        ...m,
        domainToggles: updated,
        status: key === 'global' ? (!current.global ? 'ACTIVE' : 'DISABLED') : m.status
      };
    }));
    notify(`Updated ${key} sub-domain toggle for model ${modelId}.`);
  };

  // Deployment Mode Handler
  const updateDeploymentMode = (modelId: string, newMode: AIModelRegistryFullItem['deployment']) => {
    setModels(prev => prev.map(m => {
      if (m.id !== modelId) return m;
      let newStatus: AIModelRegistryFullItem['status'] = m.status;
      if (newMode === 'PRODUCTION') newStatus = 'ACTIVE';
      else if (newMode === 'PAPER') newStatus = 'PAPER';
      else if (newMode === 'SANDBOX') newStatus = 'SANDBOX';
      else if (newMode === 'MAINTENANCE') newStatus = 'MAINTENANCE';
      else if (newMode === 'DISABLED') newStatus = 'DISABLED';

      return {
        ...m,
        deployment: newMode,
        status: newStatus
      };
    }));
    notify(`Updated deployment mode to ${newMode} for model ${modelId}.`);
  };

  // Bulk Operations Handlers
  const runBulkHealthCheck = () => {
    setModels(prev => prev.map(m => ({
      ...m,
      health: 'OPTIMAL',
      providerStatus: 'ONLINE',
      providerLatency: Math.floor(Math.random() * 8) + 8,
      lastActivity: 'Just now'
    })));
    notify('Fleet-wide provider health check completed. All provider endpoints ONLINE.');
  };

  const runBulkSync = () => {
    notify('Model weights, context windows, and capability matrices synchronized across fleet.');
  };

  // Quick Filter Handler
  const handleQuickFilterChange = (filterKey: string) => {
    setQuickFilter(filterKey);
    setCurrentPage(1);
  };

  // Toggle Favorite
  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setModels(prev => prev.map(m => m.id === id ? { ...m, favorite: !m.favorite } : m));
    notify('Model favorite status updated.');
  };

  // Sort Handler
  const handleSort = (field: keyof AIModelRegistryFullItem) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filtered & Sorted Models Computation
  const filteredModels = useMemo(() => {
    return models.filter(m => {
      // Text Search
      const query = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        m.name.toLowerCase().includes(query) ||
        m.provider.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query) ||
        m.strategy.toLowerCase().includes(query) ||
        m.tags.some(t => t.toLowerCase().includes(query));

      // Dropdown Filters
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
      const matchesProvider = providerFilter === 'ALL' || m.provider === providerFilter;
      const matchesDeployment = deploymentFilter === 'ALL' || m.deployment === deploymentFilter;

      // Quick Filters
      let matchesQuick = true;
      if (quickFilter === 'FAVORITES') matchesQuick = m.favorite;
      else if (quickFilter === 'ACTIVE') matchesQuick = m.status === 'ACTIVE';
      else if (quickFilter === 'PAPER') matchesQuick = m.status === 'PAPER';
      else if (quickFilter === 'SANDBOX') matchesQuick = m.status === 'SANDBOX';
      else if (quickFilter === 'HIGH_ACCURACY') matchesQuick = m.accuracy >= 94.0;
      else if (quickFilter === 'DISABLED') matchesQuick = m.status === 'DISABLED';

      return matchesSearch && matchesStatus && matchesCategory && matchesProvider && matchesDeployment && matchesQuick;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        const cmp = (valA as string).localeCompare(valB as string);
        return sortDirection === 'asc' ? cmp : -cmp;
      } else if (typeof valA === 'number') {
        return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      }
      return 0;
    });
  }, [models, searchQuery, statusFilter, categoryFilter, providerFilter, deploymentFilter, quickFilter, sortField, sortDirection]);

  // Paginated Models
  const totalPages = Math.ceil(filteredModels.length / pageSize) || 1;
  const paginatedModels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredModels.slice(start, start + pageSize);
  }, [filteredModels, currentPage, pageSize]);

  // Calculate Top KPIs
  const kpis = useMemo(() => {
    const total = models.length;
    const active = models.filter(m => m.status === 'ACTIVE').length;
    const production = models.filter(m => m.deployment === 'PRODUCTION').length;
    const paper = models.filter(m => m.status === 'PAPER').length;
    const sandbox = models.filter(m => m.status === 'SANDBOX').length;
    const disabled = models.filter(m => m.status === 'DISABLED').length;

    const avgAccuracy = (models.reduce((sum, m) => sum + m.accuracy, 0) / (total || 1)).toFixed(1);
    const avgLatency = (models.reduce((sum, m) => sum + m.latency, 0) / (total || 1)).toFixed(1);
    const avgConfidence = (models.reduce((sum, m) => sum + m.confidence, 0) / (total || 1)).toFixed(1);

    return {
      total,
      active,
      production,
      paper,
      sandbox,
      disabled,
      avgAccuracy,
      avgLatency,
      avgConfidence
    };
  }, [models]);

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedModelIds.length === paginatedModels.length) {
      setSelectedModelIds([]);
    } else {
      setSelectedModelIds(paginatedModels.map(m => m.id));
    }
  };

  const toggleSelectRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedModelIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkActivate = () => {
    setModels(prev => prev.map(m => selectedModelIds.includes(m.id) ? { ...m, status: 'ACTIVE', health: 'OPTIMAL' } : m));
    notify(`Activated ${selectedModelIds.length} selected models into active inference.`);
    setSelectedModelIds([]);
  };

  const handleBulkPause = () => {
    setModels(prev => prev.map(m => selectedModelIds.includes(m.id) ? { ...m, status: 'DISABLED', health: 'STANDBY' } : m));
    notify(`Disabled ${selectedModelIds.length} selected models.`);
    setSelectedModelIds([]);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Provider', 'Version', 'Category', 'Status', 'Deployment', 'Accuracy', 'Latency', 'Confidence', 'Cost'];
    const rows = filteredModels.map(m => [
      m.id, `"${m.name}"`, `"${m.provider}"`, m.version, `"${m.category}"`, m.status, m.deployment, `${m.accuracy}%`, `${m.latency}ms`, `${m.confidence}%`, `"${m.cost}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai_models_registry_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Enterprise CSV export completed successfully.');
  };

  // Open Digital Passport
  const openInspector = (e: React.MouseEvent, model: AIModelRegistryFullItem) => {
    e.stopPropagation();
    handleOpenDigitalPassport(model);
  };

  // Register New Model Handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelForm.name) {
      alert('Model Name is required');
      return;
    }

    const newId = `REG-${1000 + models.length + 1}`;
    const newEntry: AIModelRegistryFullItem = {
      id: newId,
      name: newModelForm.name,
      provider: newModelForm.provider,
      version: newModelForm.version,
      category: newModelForm.category,
      status: newModelForm.status,
      deployment: newModelForm.deployment,
      accuracy: 94.5,
      latency: 12,
      confidence: 95.8,
      health: 'OPTIMAL',
      tokenLimit: newModelForm.tokenLimit,
      contextWindow: newModelForm.contextWindow,
      cost: newModelForm.cost,
      lastActivity: 'Just now',
      lastEvaluation: new Date().toISOString().slice(0, 16).replace('T', ' '),
      favorite: false,
      tags: newModelForm.tags.split(',').map(t => t.trim()),
      description: 'Newly registered enterprise AI model initialized in registry fleet.',
      strategy: `${newModelForm.category} Strategy`,
      winRate: '75.0%',
      pnl: '+$0',
      parameters: {
        temperature: 0.1,
        topP: 0.9,
        maxOutputTokens: '4,096',
        sharpeRatio: 2.8,
        maxDrawdown: '2.0%',
        uptimePct: 100,
        instanceCount: 2,
        region: 'us-east1'
      },
      linkedStrategies: [`${newModelForm.category} Strategy`],
      linkedDecisions: [],
      linkedMemory: [],
      linkedLifecycle: 'Registered Stage',
      linkedCommitteeVotes: ['Awaiting Initial Quorum'],
      recentActivity: ['Model registered into AI ARINA Registry']
    };

    setModels(prev => [newEntry, ...prev]);
    setIsRegisterModalOpen(false);
    setNewModelForm({
      name: '',
      provider: 'Google DeepMind',
      version: 'v1.0.0-prod',
      category: 'Trend & Momentum',
      status: 'ACTIVE',
      deployment: 'PRODUCTION',
      contextWindow: '128,000',
      tokenLimit: '1,000,000',
      cost: '$0.0020 / 1k',
      tags: 'Core, NewModel'
    });
    notify(`New model "${newEntry.name}" registered successfully into fleet.`);
  };

  // If a model is selected for detail view, render the Digital Passport Detail View (Master-Detail)
  if (selectedModelDetail) {
    return (
      <AIModelProfileView
        model={selectedModelDetail}
        onBack={() => setSelectedModelDetail(null)}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* ========================================================== */}
      {/* TOP HEADER & ACTIONS                                       */}
      {/* ========================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
            <span>AI Intelligence</span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span className="text-emerald-400 font-bold">AI Models Registry</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
              AI Models Registry
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold rounded uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3 h-3" />
              {models.length} MODELS REGISTERED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Single Source of Truth for every AI model registered in AI ARINA — Fleet status, specifications, and telemetry.
          </p>
        </div>

        {/* TOP BUTTON BAR */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => notify('Registry telemetry refreshed.')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded flex items-center gap-1.5 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Register Model</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsColumnChooserOpen(prev => !prev)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Columns ({Object.values(columns).filter(Boolean).length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 9 TOP ENTERPRISE KPI CARDS                                 */}
      {/* ========================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Models</span>
          <div className="text-lg font-bold text-white">{kpis.total}</div>
          <span className="text-[9px] text-slate-500">Registered Fleet</span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 p-3 rounded space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase font-bold">Active</span>
          <div className="text-lg font-bold text-emerald-400">{kpis.active}</div>
          <span className="text-[9px] text-emerald-500/80">Inference Live</span>
        </div>

        <div className="bg-slate-900 border border-blue-500/30 p-3 rounded space-y-1">
          <span className="text-[10px] text-blue-400 uppercase font-bold">Production</span>
          <div className="text-lg font-bold text-blue-400">{kpis.production}</div>
          <span className="text-[9px] text-blue-500/80">Prod Tier</span>
        </div>

        <div className="bg-slate-900 border border-purple-500/30 p-3 rounded space-y-1">
          <span className="text-[10px] text-purple-400 uppercase font-bold">Paper</span>
          <div className="text-lg font-bold text-purple-400">{kpis.paper}</div>
          <span className="text-[9px] text-purple-500/80">Shadow Mode</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 p-3 rounded space-y-1">
          <span className="text-[10px] text-amber-400 uppercase font-bold">Sandbox</span>
          <div className="text-lg font-bold text-amber-400">{kpis.sandbox}</div>
          <span className="text-[9px] text-amber-500/80">Staging Test</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Disabled</span>
          <div className="text-lg font-bold text-slate-400">{kpis.disabled}</div>
          <span className="text-[9px] text-slate-500">Standby Vault</span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 p-3 rounded space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase font-bold">Avg Accuracy</span>
          <div className="text-lg font-bold text-emerald-400">{kpis.avgAccuracy}%</div>
          <span className="text-[9px] text-slate-400">High Conviction</span>
        </div>

        <div className="bg-slate-900 border border-blue-500/30 p-3 rounded space-y-1">
          <span className="text-[10px] text-blue-400 uppercase font-bold">Avg Latency</span>
          <div className="text-lg font-bold text-blue-400">{kpis.avgLatency}ms</div>
          <span className="text-[9px] text-slate-400">Sub-15ms Target</span>
        </div>

        <div className="bg-slate-900 border border-purple-500/30 p-3 rounded space-y-1">
          <span className="text-[10px] text-purple-300 uppercase font-bold">Avg Confidence</span>
          <div className="text-lg font-bold text-purple-300">{kpis.avgConfidence}%</div>
          <span className="text-[9px] text-slate-400">Quorum Score</span>
        </div>
      </div>

      {/* ========================================================== */}
      {/* ENTERPRISE FLEET MANAGEMENT SUB-NAVIGATION BAR             */}
      {/* ========================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex items-center gap-2 overflow-x-auto text-[11px] font-bold font-mono shadow-md">
        {[
          { id: 'FLEET', label: '1. Fleet Directory', icon: Server, badge: `${models.length}` },
          { id: 'DOMAIN_MATRIX', label: '2. Domain ON/OFF & Deployment', icon: Zap, badge: 'Matrix' },
          { id: 'CAPABILITIES', label: '3. Capability Matrix', icon: Layers, badge: '8 Specs' },
          { id: 'HEALTH_COST', label: '4. Provider Health & Cost', icon: Activity, badge: 'Telemetry' },
          { id: 'DEPENDENCIES', label: '5. Dependency Inspector', icon: Network, badge: 'Links' },
          { id: 'FLEET_OPS', label: '6. Fleet Operations', icon: Sliders, badge: 'Control' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-md font-bold uppercase transition-all flex items-center gap-2.5 whitespace-nowrap text-[11px] shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg ring-1 ring-amber-400'
                  : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* 1. FLEET DIRECTORY TAB VIEW                                */}
      {/* ========================================================== */}
      {activeSubTab === 'FLEET' && (
        <>
          {/* QUICK FILTERS CHIPS STRIP */}
      {/* ========================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-bold">
        <span className="text-slate-500 uppercase text-[10px] shrink-0">Quick Filters:</span>
        {[
          { id: 'ALL', label: 'All Models' },
          { id: 'FAVORITES', label: '★ Favorites' },
          { id: 'ACTIVE', label: 'Production / Active' },
          { id: 'PAPER', label: 'Paper Mode' },
          { id: 'SANDBOX', label: 'Sandbox' },
          { id: 'HIGH_ACCURACY', label: 'High Accuracy (>94%)' },
          { id: 'DISABLED', label: 'Disabled' }
        ].map(q => (
          <button
            key={q.id}
            onClick={() => handleQuickFilterChange(q.id)}
            className={`px-3 py-1 rounded-full border transition-all whitespace-nowrap ${
              quickFilter === q.id 
                ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md' 
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* ========================================================== */}
      {/* SEARCH AND MULTI-FILTER CONTROL TOOLBAR                    */}
      {/* ========================================================== */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* SEARCH BAR */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, provider, category, strategy, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* STATUS FILTER */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PAPER">Paper</option>
              <option value="SANDBOX">Sandbox</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          {/* CATEGORY FILTER */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">CATEGORY:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Trend & Momentum">Trend & Momentum</option>
              <option value="Volatility & Risk">Volatility & Risk</option>
              <option value="High-Frequency Order Flow">High-Frequency Order Flow</option>
              <option value="Macro & Sentiment">Macro & Sentiment</option>
              <option value="Multi-Asset Execution">Multi-Asset Execution</option>
              <option value="Social Alpha">Social Alpha</option>
              <option value="Regional Arbitrage">Regional Arbitrage</option>
            </select>
          </div>

          {/* PROVIDER FILTER */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">PROVIDER:</span>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="ALL">All Providers</option>
              <option value="Google DeepMind">Google DeepMind</option>
              <option value="Anthropic">Anthropic</option>
              <option value="DeepSeek">DeepSeek</option>
              <option value="Meta AI">Meta AI</option>
              <option value="Mistral AI">Mistral AI</option>
              <option value="OpenAI">OpenAI</option>
              <option value="xAI">xAI</option>
              <option value="Alibaba Cloud">Alibaba Cloud</option>
              <option value="Cohere">Cohere</option>
              <option value="Scale AI">Scale AI</option>
            </select>
          </div>
        </div>

        {/* DENSITY MODE SWITCHER */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-500 text-[10px]">DENSITY:</span>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setDensityMode('NORMAL')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold ${densityMode === 'NORMAL' ? 'bg-slate-800 text-amber-400' : 'text-slate-500'}`}
            >
              Normal
            </button>
            <button
              onClick={() => setDensityMode('COMPACT')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold ${densityMode === 'COMPACT' ? 'bg-slate-800 text-amber-400' : 'text-slate-500'}`}
            >
              Compact
            </button>
          </div>
        </div>
      </div>

      {/* COLUMN CHOOSER DRAWER / PANEL */}
      {isColumnChooserOpen && (
        <div className="p-3 bg-slate-900 border border-amber-500/30 rounded flex flex-wrap items-center gap-3 text-[11px]">
          <span className="text-amber-400 font-bold uppercase">Toggle Columns:</span>
          {Object.keys(columns).map((col) => (
            <label key={col} className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={(columns as any)[col]}
                onChange={() => setColumns(prev => ({ ...prev, [col]: !(prev as any)[col] }))}
                className="accent-amber-500 rounded"
              />
              <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
            </label>
          ))}
        </div>
      )}

      {/* BULK ACTIONS BAR (When items are selected) */}
      {selectedModelIds.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded text-[10px]">
              {selectedModelIds.length} SELECTED
            </span>
            <span className="text-slate-300">Bulk operations available:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkActivate}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-[10px] uppercase"
            >
              Bulk Activate
            </button>

            <button
              onClick={handleBulkPause}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded text-[10px] uppercase"
            >
              Bulk Disable
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-bold rounded text-[10px] uppercase"
            >
              Bulk Export CSV
            </button>

            <button
              onClick={() => setSelectedModelIds([])}
              className="p-1 text-slate-400 hover:text-white"
              title="Clear Selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MAIN ENTERPRISE AI MODEL GRID / TABLE                      */}
      {/* ========================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider sticky top-0 z-10">
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={selectedModelIds.length === paginatedModels.length && paginatedModels.length > 0}
                    onChange={toggleSelectAll}
                    className="accent-amber-500 rounded"
                  />
                </th>
                <th className="py-3 px-3 w-8 text-center">★</th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Model Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                {columns.provider && (
                  <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('provider')}>
                    <div className="flex items-center gap-1">
                      <span>Provider</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                )}
                {columns.category && (
                  <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                )}
                {columns.status && (
                  <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                )}
                {columns.deployment && <th className="py-3 px-4">Deployment</th>}
                {columns.accuracy && (
                  <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('accuracy')}>
                    <div className="flex items-center gap-1">
                      <span>Accuracy</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                )}
                {columns.latency && (
                  <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('latency')}>
                    <div className="flex items-center gap-1">
                      <span>Latency</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                )}
                {columns.confidence && <th className="py-3 px-4">Confidence</th>}
                {columns.health && <th className="py-3 px-4">Health</th>}
                {columns.tokenLimit && <th className="py-3 px-4">Context / Limit</th>}
                {columns.cost && <th className="py-3 px-4">Cost</th>}
                {columns.lastActivity && <th className="py-3 px-4">Last Activity</th>}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedModels.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-slate-500 font-mono">
                    No registered AI models match the current search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedModels.map((m) => {
                  const isSelected = selectedModelIds.includes(m.id);
                  return (
                    <tr
                      key={m.id}
                      onClick={(e) => openInspector(e, m)}
                      className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-500/10' : ''
                      } ${densityMode === 'COMPACT' ? 'py-1.5' : 'py-3'}`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectRow(e as any, m.id)}
                          className="accent-amber-500 rounded"
                        />
                      </td>

                      <td className="py-3 px-3 text-center" onClick={(e) => toggleFavorite(e, m.id)}>
                        <Star className={`w-4 h-4 transition-colors ${m.favorite ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-amber-400'}`} />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded bg-slate-800 border border-slate-700 text-amber-400 shrink-0">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{m.name}</span>
                              <span className="text-[9px] text-slate-500 font-mono">{m.version}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {m.tags.map(t => (
                                <span key={t} className="px-1.5 py-0.2 bg-slate-800 text-slate-400 text-[8px] rounded border border-slate-700">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>

                      {columns.provider && (
                        <td className="py-3 px-4 font-bold text-slate-200">{m.provider}</td>
                      )}

                      {columns.category && (
                        <td className="py-3 px-4 text-slate-300">{m.category}</td>
                      )}

                      {columns.status && (
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase border ${
                            m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            m.status === 'PAPER' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                            m.status === 'SANDBOX' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                      )}

                      {columns.deployment && (
                        <td className="py-3 px-4 text-slate-300 font-semibold">{m.deployment}</td>
                      )}

                      {columns.accuracy && (
                        <td className="py-3 px-4 font-bold text-emerald-400">{m.accuracy}%</td>
                      )}

                      {columns.latency && (
                        <td className="py-3 px-4 font-bold text-blue-400">{m.latency}ms</td>
                      )}

                      {columns.confidence && (
                        <td className="py-3 px-4 text-purple-300 font-bold">{m.confidence}%</td>
                      )}

                      {columns.health && (
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                            m.health === 'OPTIMAL' ? 'text-emerald-400' :
                            m.health === 'CALIBRATING' ? 'text-amber-400' : 'text-slate-400'
                          }`}>
                            ● {m.health}
                          </span>
                        </td>
                      )}

                      {columns.tokenLimit && (
                        <td className="py-3 px-4 text-slate-400 text-[10px]">
                          {m.contextWindow} / {m.tokenLimit}
                        </td>
                      )}

                      {columns.cost && (
                        <td className="py-3 px-4 text-slate-300">{m.cost}</td>
                      )}

                      {columns.lastActivity && (
                        <td className="py-3 px-4 text-slate-400 text-[10px]">{m.lastActivity}</td>
                      )}

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDigitalPassport(m)}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
                            title="Open Digital Passport Detail View"
                          >
                            Digital Passport
                          </button>

                          <button
                            onClick={(e) => openInspector(e, m)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors cursor-pointer"
                            title="Inspect Model Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-white">{filteredModels.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong className="text-white">{Math.min(currentPage * pageSize, filteredModels.length)}</strong> of <strong className="text-white">{filteredModels.length}</strong> registered models
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage <= 1 || totalPages <= 1}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded disabled:opacity-30 disabled:hover:bg-slate-900 cursor-pointer disabled:cursor-not-allowed"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1 || totalPages <= 1}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded disabled:opacity-30 disabled:hover:bg-slate-900 cursor-pointer disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-white font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || totalPages <= 1}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded disabled:opacity-30 disabled:hover:bg-slate-900 cursor-pointer disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages || totalPages <= 1}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded disabled:opacity-30 disabled:hover:bg-slate-900 cursor-pointer disabled:cursor-not-allowed"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
        </>
      )}

      {/* ========================================================== */}
      {/* 2. AI MODEL ON/OFF & DEPLOYMENT MODE MATRIX                */}
      {/* ========================================================== */}
      {activeSubTab === 'DOMAIN_MATRIX' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                AI Model Sub-Domain ON/OFF & Deployment Mode Matrix
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Granular sub-domain activation switches and deployment stage configuration per model.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded font-bold">Live Inference Active</span>
              <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded font-bold">V2 Placeholder Ready</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-200">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Model Name</th>
                  <th className="py-3 px-4">Deployment Mode</th>
                  <th className="py-3 px-3 text-center">Global</th>
                  <th className="py-3 px-3 text-center">Research</th>
                  <th className="py-3 px-3 text-center">Decision</th>
                  <th className="py-3 px-3 text-center">Committee</th>
                  <th className="py-3 px-3 text-center">Memory</th>
                  <th className="py-3 px-3 text-center">Paper</th>
                  <th className="py-3 px-3 text-center">Live V2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {models.map(m => {
                  const toggles = m.domainToggles || {
                    global: m.status !== 'DISABLED',
                    research: true,
                    decision: m.status === 'ACTIVE',
                    committee: true,
                    memory: true,
                    paperTrading: m.status === 'PAPER' || m.status === 'ACTIVE',
                    liveTradingV2: false,
                  };

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.id} • {m.provider}</div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={m.deployment}
                          onChange={(e) => updateDeploymentMode(m.id, e.target.value as any)}
                          className="bg-slate-950 border border-slate-700 text-white text-[11px] font-bold rounded px-2.5 py-1 focus:outline-none focus:border-amber-400"
                        >
                          <option value="PRODUCTION">PRODUCTION</option>
                          <option value="PAPER">PAPER</option>
                          <option value="SANDBOX">SANDBOX</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                          <option value="DISABLED">DISABLED</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleDomainToggle(m.id, 'global')}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                            toggles.global ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {toggles.global ? 'ON' : 'OFF'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleDomainToggle(m.id, 'research')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            toggles.research ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {toggles.research ? 'ON' : 'OFF'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleDomainToggle(m.id, 'decision')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            toggles.decision ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {toggles.decision ? 'ON' : 'OFF'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleDomainToggle(m.id, 'committee')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            toggles.committee ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {toggles.committee ? 'ON' : 'OFF'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleDomainToggle(m.id, 'memory')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            toggles.memory ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {toggles.memory ? 'ON' : 'OFF'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleDomainToggle(m.id, 'paperTrading')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            toggles.paperTrading ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {toggles.paperTrading ? 'ON' : 'OFF'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 bg-slate-800/80 text-slate-500 border border-slate-700/60 text-[9px] font-bold rounded" title="Live Trading V2 Placeholder">
                          V2 SOON
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3. CAPABILITY MATRIX                                       */}
      {/* ========================================================== */}
      {activeSubTab === 'CAPABILITIES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              AI Model Capability Matrix
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Comprehensive evaluation of modalities, context limits, reasoning, and JSON execution capabilities.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-200">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Model & Provider</th>
                  <th className="py-3 px-3 text-center">Context</th>
                  <th className="py-3 px-3 text-center">Vision</th>
                  <th className="py-3 px-3 text-center">Text</th>
                  <th className="py-3 px-3 text-center">Reasoning</th>
                  <th className="py-3 px-3 text-center">Code</th>
                  <th className="py-3 px-3 text-center">Func Call</th>
                  <th className="py-3 px-3 text-center">JSON</th>
                  <th className="py-3 px-3 text-center">Stream</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {models.map(m => {
                  const caps = m.capabilities || {
                    vision: m.tags.includes('Vision') || m.name.includes('Pro') || m.name.includes('Sonnet'),
                    text: true,
                    reasoning: true,
                    code: true,
                    functionCalling: true,
                    jsonOutput: true,
                    contextWindow: m.contextWindow,
                    streaming: true
                  };

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.provider}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-400">{caps.contextWindow}</td>
                      <td className="py-3 px-3 text-center">{caps.vision ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{caps.text ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{caps.reasoning ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{caps.code ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{caps.functionCalling ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{caps.jsonOutput ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                      <td className="py-3 px-3 text-center">{caps.streaming ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 4. PROVIDER HEALTH, USAGE & COST                           */}
      {/* ========================================================== */}
      {activeSubTab === 'HEALTH_COST' && (
        <div className="space-y-6">
          {/* PROVIDER HEALTH OVERVIEW CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { name: 'Google DeepMind', status: 'ONLINE', latency: '11ms', errorRate: '0.01%', models: 3 },
              { name: 'Anthropic', status: 'ONLINE', latency: '14ms', errorRate: '0.02%', models: 2 },
              { name: 'DeepSeek', status: 'ONLINE', latency: '8ms', errorRate: '0.01%', models: 2 },
              { name: 'OpenAI / Meta / Cohere', status: 'ONLINE', latency: '15ms', errorRate: '0.03%', models: 3 }
            ].map((p, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white uppercase text-xs">{p.name}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
                    ● {p.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-400">
                  <div>Latency: <strong className="text-blue-400 block">{p.latency}</strong></div>
                  <div>Error Rate: <strong className="text-emerald-400 block">{p.errorRate}</strong></div>
                  <div>Fleet Size: <strong className="text-amber-400 block">{p.models} Models</strong></div>
                </div>
              </div>
            ))}
          </div>

          {/* USAGE & COST TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Model Usage, Inferred Latency & Daily Cost Telemetry
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-slate-200">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Model</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Total Requests</th>
                    <th className="py-3 px-4">Tokens Processed</th>
                    <th className="py-3 px-4">Inferred Latency</th>
                    <th className="py-3 px-4">Success Rate</th>
                    <th className="py-3 px-4">Daily Run Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {models.map(m => {
                    const stats = m.usageStats || {
                      totalRequests: '1.4M',
                      totalTokens: '48.2M',
                      dailyCost: '$142.80',
                      latencyMs: m.latency,
                      successRatePct: m.accuracy
                    };

                    return (
                      <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">{m.name}</td>
                        <td className="py-3 px-4 text-slate-400">{m.provider}</td>
                        <td className="py-3 px-4 text-blue-400 font-bold">{stats.totalRequests}</td>
                        <td className="py-3 px-4 text-purple-300 font-bold">{stats.totalTokens}</td>
                        <td className="py-3 px-4 text-amber-400 font-bold">{stats.latencyMs}ms</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">{stats.successRatePct}%</td>
                        <td className="py-3 px-4 text-emerald-300 font-black">{stats.dailyCost}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 5. DEPENDENCY INSPECTOR                                   */}
      {/* ========================================================== */}
      {activeSubTab === 'DEPENDENCIES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Network className="w-4 h-4 text-amber-400" />
              AI Fleet Dependency Inspector
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live topology mapping each AI model to Central Brain, Decision Engine, AI Committee, AI Memory, and Trading Strategies.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-200">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-3 text-center">Central Brain</th>
                  <th className="py-3 px-3 text-center">Decision Engine</th>
                  <th className="py-3 px-3 text-center">AI Committee</th>
                  <th className="py-3 px-3 text-center">AI Memory</th>
                  <th className="py-3 px-3 text-center">AI Lifecycle</th>
                  <th className="py-3 px-4">Connected Strategies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {models.map(m => {
                  const deps = m.dependencies || {
                    centralBrain: true,
                    decisionEngine: m.status === 'ACTIVE',
                    aiCommittee: true,
                    aiMemory: true,
                    aiLifecycle: true,
                    strategies: [m.strategy]
                  };

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.id}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {deps.centralBrain ? (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold rounded">CONNECTED</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {deps.decisionEngine ? (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-bold rounded">CONNECTED</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {deps.aiCommittee ? (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold rounded">CONNECTED</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {deps.aiMemory ? (
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold rounded">CONNECTED</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {deps.aiLifecycle ? (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[9px] font-bold rounded">CONNECTED</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {deps.strategies.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-800 text-amber-300 border border-slate-700 text-[10px] rounded font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 6. FLEET OPERATIONS                                        */}
      {/* ========================================================== */}
      {activeSubTab === 'FLEET_OPS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Fleet Operations Control Center
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Execute bulk fleet-wide lifecycle operations, health pings, and configuration synchronization.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={runBulkHealthCheck}
                className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>Bulk Health Check</span>
              </button>

              <button
                onClick={runBulkSync}
                className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCcw className="w-5 h-5 text-blue-400" />
                <span>Bulk Sync Weights</span>
              </button>

              <button
                onClick={() => {
                  setModels(prev => prev.map(m => ({ ...m, status: 'ACTIVE', health: 'OPTIMAL' })));
                  notify('Bulk Enabled all models across fleet.');
                }}
                className="p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-5 h-5 text-amber-400" />
                <span>Bulk Enable Fleet</span>
              </button>

              <button
                onClick={() => {
                  setModels(prev => prev.map(m => ({ ...m, status: 'DISABLED', health: 'STANDBY' })));
                  notify('Bulk Disabled all models across fleet.');
                }}
                className="p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Pause className="w-5 h-5 text-rose-400" />
                <span>Bulk Standby Lock</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-5 h-5 text-purple-300" />
                <span>Export Manifest</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase">Fleet Operations Audit Stream</h3>
            <div className="space-y-2 text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-emerald-400 font-bold">[SYNC-OK] Sync completed across 10 registered models.</span>
                <span className="text-slate-500 text-[10px]">Just now</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-blue-400 font-bold">[HEALTH-PING] Latency benchmark sweep verified sub-15ms endpoints.</span>
                <span className="text-slate-500 text-[10px]">1m ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">[DEPLOYMENT] Gemini 2.5 Pro verified for PRODUCTION stage.</span>
                <span className="text-slate-500 text-[10px]">5m ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* REGISTER NEW AI MODEL MODAL                                */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegisterModalOpen(false)}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-lg p-6 w-full max-w-lg shadow-2xl font-mono text-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Register AI Model to Fleet</h3>
                  </div>
                  <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Model Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gemini 3.0 Pro Ultra"
                      value={newModelForm.name}
                      onChange={(e) => setNewModelForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Provider</label>
                      <select
                        value={newModelForm.provider}
                        onChange={(e) => setNewModelForm(prev => ({ ...prev, provider: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                      >
                        <option>Google DeepMind</option>
                        <option>Anthropic</option>
                        <option>DeepSeek</option>
                        <option>Meta AI</option>
                        <option>Mistral AI</option>
                        <option>OpenAI</option>
                        <option>xAI</option>
                        <option>Alibaba Cloud</option>
                        <option>Cohere</option>
                        <option>Scale AI</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Category</label>
                      <select
                        value={newModelForm.category}
                        onChange={(e) => setNewModelForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                      >
                        <option>Trend & Momentum</option>
                        <option>Volatility & Risk</option>
                        <option>High-Frequency Order Flow</option>
                        <option>Macro & Sentiment</option>
                        <option>Multi-Asset Execution</option>
                        <option>Social Alpha</option>
                        <option>Regional Arbitrage</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Status</label>
                      <select
                        value={newModelForm.status}
                        onChange={(e) => setNewModelForm(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                      >
                        <option value="ACTIVE">ACTIVE (Inference Live)</option>
                        <option value="PAPER">PAPER (Shadow Test)</option>
                        <option value="SANDBOX">SANDBOX (Staging)</option>
                        <option value="DISABLED">DISABLED (Standby)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Deployment Tier</label>
                      <select
                        value={newModelForm.deployment}
                        onChange={(e) => setNewModelForm(prev => ({ ...prev, deployment: e.target.value as any }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                      >
                        <option value="PRODUCTION">PRODUCTION</option>
                        <option value="STAGING">STAGING</option>
                        <option value="PAPER">PAPER</option>
                        <option value="SANDBOX">SANDBOX</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Context Window</label>
                      <input
                        type="text"
                        value={newModelForm.contextWindow}
                        onChange={(e) => setNewModelForm(prev => ({ ...prev, contextWindow: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Cost Per 1k Tokens</label>
                      <input
                        type="text"
                        value={newModelForm.cost}
                        onChange={(e) => setNewModelForm(prev => ({ ...prev, cost: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Tags (Comma Separated)</label>
                    <input
                      type="text"
                      value={newModelForm.tags}
                      onChange={(e) => setNewModelForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsRegisterModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded"
                    >
                      Confirm Registration
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
