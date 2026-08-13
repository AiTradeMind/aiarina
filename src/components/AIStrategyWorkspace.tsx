import { StrategyRegistryWorkspace } from './StrategyRegistryWorkspace';
import { EnterpriseStrategyCommandCenter } from './strategy/EnterpriseStrategyCommandCenter';
import { StrategyParametersWorkspace } from './strategy/parameters/StrategyParametersWorkspace';
import { StrategyCandidatesWorkspace } from './strategy/candidates/StrategyCandidatesWorkspace';
import { StrategyRankingWorkspace } from './strategy/ranking/StrategyRankingWorkspace';
import { StrategyRuntimeWorkspace } from './strategy/runtime/StrategyRuntimeWorkspace';
import { StrategyVersioningWorkspace } from './strategy/versioning/StrategyVersioningWorkspace';
import { StrategyAuditWorkspace } from './strategy/audit/StrategyAuditWorkspace';
import { StrategyPipelineInspectorWorkspace } from './strategy/inspector/StrategyPipelineInspectorWorkspace';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useStrategyContext } from '../contexts/StrategyContext';
import { ActiveStrategyHeader } from './strategy/ActiveStrategyHeader';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Play, 
  RotateCw, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  Settings, 
  Sliders, 
  CheckCircle, 
  XCircle, 
  Activity, 
  ListOrdered, 
  Terminal, 
  FileText, 
  Lock, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  Database,
  ArrowUp,
  ArrowDown,
  Edit2,
  Save,
  X,
  Filter,
  Check,
  AlertCircle,
  Eye,
  Tag,
  Info,
  FileEdit,
  ChevronRight,
  AlertTriangle,
  Copy,
  Archive,
  CheckSquare,
  Square,
  History,
  Hash,
  ChevronUp,
  ChevronDown,
  Star,
  Download,
  Upload,
  Bookmark,
  ListFilter,
  Zap,
  Share2,
  BookOpen,
  Wrench
} from 'lucide-react';
import { fetchApi, resolveArrayData } from '../lib/api';

// Types matched to backend models
interface Strategy {
  id: string;
  name: string;
  category: string;
  version: string;
  owner: string;
  status: 'ENABLED' | 'DISABLED';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface LibraryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  isEnabled: boolean;
  rules: string[];
}

interface StrategyParameters {
  id: string;
  strategyId: string;
  version: string;
  riskProfile: string;
  timeframe: string;
  volumeRules: Record<string, any>;
  liquidityRules: Record<string, any>;
  volatilityRules: Record<string, any>;
  trendRules: Record<string, any>;
  sessionRules: Record<string, any>;
  marketConditions: string[];
}

interface Evaluation {
  id: string;
  strategyId: string;
  sessionId: string;
  score: number;
  marketStatusValid: boolean;
  contextValid: boolean;
  reasoningValid: boolean;
  confidenceValid: boolean;
  evaluationDetails: Record<string, any>;
  createdAt: string;
}

interface Ranking {
  id: string;
  strategyId: string;
  score: number;
  confidence: number;
  suitability: string;
  priority: number;
  rankOrder: number;
}

interface Candidate {
  id: string;
  strategyId: string;
  aiModelId: string;
  instrument: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  reasoningRef: string;
  status: string;
  createdAt: string;
}

interface Runtime {
  id: string;
  strategyId: string;
  queueName: string;
  priority: number;
  executionStatus: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  timeoutMs: number;
  logs: string;
  startedAt?: string;
  finishedAt?: string;
}

interface AuditLog {
  id: string;
  strategyId: string;
  auditType: string;
  hash: string;
  content: Record<string, any>;
  createdAt: string;
}

interface StrategyEvent {
  id: string;
  strategyId: string;
  eventType: string;
  payload: Record<string, any>;
  createdAt: string;
}

export interface BuilderStrategyItem {
  id: string;
  strategyId: string;
  name: string;
  category: string;
  tags?: string[] | null;
  description?: string | null;
  rules?: string[] | null;
  riskLevel?: string | null;
  marketType?: string | null;
  instrumentType?: string | null;
  timeframe?: string | null;
  status: string;
  version: string;
  approvalStatus?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdTime: string;
  updatedTime: string;
}

export function AIStrategyWorkspace() {
  const { 
    activeStrategy, 
    activeStrategyId, 
    activeStage, 
    setActiveStrategy, 
    updateActiveStrategy, 
    setStage, 
    instantiateTemplate, 
    saveBuilderCopy 
  } = useStrategyContext();

  // Tabs State
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'BUILDER' | 'LIBRARY' | 'PARAMETERS' | 'CANDIDATES' | 'RANKING' | 'RUNTIME' | 'VERSION' | 'AUDIT' | 'INSPECTOR'>('DASHBOARD');

  // Sync selectedStrategyId with activeStrategyId
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(activeStrategyId || 'STRAT-001');

  useEffect(() => {
    if (activeStrategyId && activeStrategyId !== selectedStrategyId) {
      setSelectedStrategyId(activeStrategyId);
    }
  }, [activeStrategyId]);

  // Backend Synchronized States
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [runtimes, setRuntimes] = useState<Runtime[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [events, setEvents] = useState<StrategyEvent[]>([]);
  const [builderStrategies, setBuilderStrategies] = useState<BuilderStrategyItem[]>([]);

  const [parameters, setParameters] = useState<StrategyParameters | null>(null);
  
  // Builder form & edit state
  const [editingBuilderId, setEditingBuilderId] = useState<string | null>(null);
  const [newStratName, setNewStratName] = useState('');
  const [newStratCategory, setNewStratCategory] = useState('Trend Following');
  const [newStratTags, setNewStratTags] = useState('AUTO, NEW');
  const [newStratDescription, setNewStratDescription] = useState('');
  const [newStratStatus, setNewStratStatus] = useState<string>('DRAFT');
  const [newStratRiskLevel, setNewStratRiskLevel] = useState<string>('MEDIUM');
  const [newStratTimeframe, setNewStratTimeframe] = useState<string>('15M');
  const [newStratMarketType, setNewStratMarketType] = useState<string>('EQUITY');
  const [newStratInstrumentType, setNewStratInstrumentType] = useState<string>('SPOT');
  const [builderRules, setBuilderRules] = useState<string[]>(['RSI between 30 and 70', 'Price above 50 SMA']);
  const [newRuleInput, setNewRuleInput] = useState('');

  // Inline Rule Editing & Validation State
  const [editingRuleIdx, setEditingRuleIdx] = useState<number | null>(null);
  const [editingRuleText, setEditingRuleText] = useState<string>('');
  const [ruleError, setRuleError] = useState<string>('');

  // Right Panel Filters, Search & Sorting State
  const [builderSearchQuery, setBuilderSearchQuery] = useState<string>('');
  const [builderCategoryFilter, setBuilderCategoryFilter] = useState<string>('ALL');
  const [builderStatusFilter, setBuilderStatusFilter] = useState<string>('ALL');
  const [builderRiskFilter, setBuilderRiskFilter] = useState<string>('ALL');
  const [builderTimeframeFilter, setBuilderTimeframeFilter] = useState<string>('ALL');
  const [builderSortKey, setBuilderSortKey] = useState<'NAME' | 'DATE' | 'STATUS' | 'RISK' | 'CATEGORY'>('DATE');
  const [builderSortDir, setBuilderSortDir] = useState<'ASC' | 'DESC'>('DESC');

  // Delete Confirm Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string | null>(null);

  // Multi-Select Bulk Operations State
  const [selectedBuilderIds, setSelectedBuilderIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);

  // View Strategy Details Modal State
  const [viewingDetailItem, setViewingDetailItem] = useState<BuilderStrategyItem | null>(null);

  // Strategy History Timeline Modal State
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  const [viewingHistoryName, setViewingHistoryName] = useState<string>('');
  const [historyTimeline, setHistoryTimeline] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Operation indicators
  const [isSavingBuilder, setIsSavingBuilder] = useState<boolean>(false);
  const [isDeletingBuilder, setIsDeletingBuilder] = useState<boolean>(false);
  const [isCloningBuilder, setIsCloningBuilder] = useState<boolean>(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // ================================================
  // MODULE 2: ENTERPRISE STRATEGY TEMPLATE LIBRARY
  // ================================================
  interface StrategyTemplateItem {
    id: string;
    templateId: string;
    name: string;
    description: string;
    category: string;
    marketType: 'EQUITY' | 'CRYPTO' | 'FOREX' | 'COMMODITY' | 'DERIVATIVES';
    instrumentType: 'SPOT' | 'FUTURES' | 'OPTIONS' | 'SWAP';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    timeframe: '1M' | '5M' | '15M' | '1H' | '1D';
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'INSTITUTIONAL';
    tier?: 'CORE' | 'INSTITUTIONAL';
    certifiedDate?: string;
    certifiedBy?: string;
    winRate?: number;
    profitFactor?: number;
    maxDrawdown?: number;
    sharpeRatio?: number;
    aiCompatibilityScore?: number;
    entryPhilosophy?: string;
    exitPhilosophy?: string;
    riskPhilosophy?: string;
    author: string;
    version: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DEPRECATED';
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    isFavorite: boolean;
    tags: string[];
    rules: string[];
    ruleCount: number;
    usageCount: number;
    rating: number;
    sha256Reference: string;
    createdTime: string;
    updatedTime: string;
  }

  const [templates, setTemplates] = useState<StrategyTemplateItem[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
  const [tplSearchQuery, setTplSearchQuery] = useState<string>('');
  const [tplCategoryFilter, setTplCategoryFilter] = useState<string>('ALL');
  const [tplMarketFilter, setTplMarketFilter] = useState<string>('ALL');
  const [tplRiskFilter, setTplRiskFilter] = useState<string>('ALL');
  const [tplTimeframeFilter, setTplTimeframeFilter] = useState<string>('ALL');
  const [tplStatusFilter, setTplStatusFilter] = useState<string>('ALL');
  const [tplTierFilter, setTplTierFilter] = useState<string>('ALL');
  const [tplSortKey, setTplSortKey] = useState<string>('NEWEST');
  const [tplFavoritesOnly, setTplFavoritesOnly] = useState<boolean>(false);

  // Modals & Action States
  const [selectedTemplateForDetail, setSelectedTemplateForDetail] = useState<StrategyTemplateItem | null>(null);
  const [selectedTemplateForHistory, setSelectedTemplateForHistory] = useState<StrategyTemplateItem | null>(null);
  const [tplHistoryLogs, setTplHistoryLogs] = useState<any[]>([]);
  const [isLoadingTplHistory, setIsLoadingTplHistory] = useState<boolean>(false);

  const [isCreateTplModalOpen, setIsCreateTplModalOpen] = useState<boolean>(false);
  const [isImportTplModalOpen, setIsImportTplModalOpen] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');

  const [isCloningTplId, setIsCloningTplId] = useState<string | null>(null);
  const [isArchivingTplId, setIsArchivingTplId] = useState<string | null>(null);
  const [isFavoritingTplId, setIsFavoritingTplId] = useState<string | null>(null);
  const [isUsingTplId, setIsUsingTplId] = useState<string | null>(null);
  const [isDeletingTplConfirmId, setIsDeletingTplConfirmId] = useState<string | null>(null);
  const [isDeletingTplConfirmName, setIsDeletingTplConfirmName] = useState<string | null>(null);
  const [isDeletingTpl, setIsDeletingTpl] = useState<boolean>(false);

  // Form State
  const [newTplName, setNewTplName] = useState<string>('');
  const [newTplDesc, setNewTplDesc] = useState<string>('');
  const [newTplCat, setNewTplCat] = useState<string>('Trend Following');
  const [newTplMarket, setNewTplMarket] = useState<string>('EQUITY');
  const [newTplInst, setNewTplInst] = useState<string>('SPOT');
  const [newTplRisk, setNewTplRisk] = useState<string>('MEDIUM');
  const [newTplTimeframe, setNewTplTimeframe] = useState<string>('15M');
  const [newTplDifficulty, setNewTplDifficulty] = useState<string>('INTERMEDIATE');
  const [newTplTier, setNewTplTier] = useState<string>('INSTITUTIONAL');
  const [newTplTags, setNewTplTags] = useState<string>('INSTITUTIONAL, QUANT');
  const [newTplRules, setNewTplRules] = useState<string[]>(['RSI(14) < 30 (Oversold)', 'Price > 200 SMA (Trend Filter)']);
  const [newTplRuleInput, setNewTplRuleInput] = useState<string>('');
  const [isSavingTpl, setIsSavingTpl] = useState<boolean>(false);
  const [tplFormError, setTplFormError] = useState<string | null>(null);

  // Fetch Strategy Templates from Database
  const fetchLibraryTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const params = new URLSearchParams();
      if (tplSearchQuery.trim()) params.append('searchQuery', tplSearchQuery.trim());
      if (tplCategoryFilter !== 'ALL') params.append('category', tplCategoryFilter);
      if (tplMarketFilter !== 'ALL') params.append('marketType', tplMarketFilter);
      if (tplRiskFilter !== 'ALL') params.append('riskLevel', tplRiskFilter);
      if (tplTimeframeFilter !== 'ALL') params.append('timeframe', tplTimeframeFilter);
      if (tplStatusFilter !== 'ALL') params.append('status', tplStatusFilter);
      if (tplTierFilter === 'CORE') params.append('coreOnly', 'true');
      if (tplTierFilter === 'INSTITUTIONAL') params.append('institutionalOnly', 'true');
      if (tplSortKey) params.append('sortKey', tplSortKey);
      if (tplFavoritesOnly) params.append('favoritesOnly', 'true');

      const url = `/api/strategy/library?${params.toString()}`;
      const res = await fetchApi<any>(url);
      if (res && res.data && Array.isArray(res.data)) {
        setTemplates(res.data);
      } else if (Array.isArray(res)) {
        setTemplates(res);
      }
    } catch (err: any) {
      console.error("Failed to fetch library templates:", err);
      setErrorMessage("Failed to load strategy templates: " + err.message);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [
    tplSearchQuery,
    tplCategoryFilter,
    tplMarketFilter,
    tplRiskFilter,
    tplTimeframeFilter,
    tplStatusFilter,
    tplTierFilter,
    tplSortKey,
    tplFavoritesOnly
  ]);

  // Load templates on tab change or filter update
  useEffect(() => {
    if (activeTab === 'LIBRARY') {
      fetchLibraryTemplates();
    }
  }, [activeTab, fetchLibraryTemplates]);

  // Create Template Handler
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setTplFormError(null);

    if (!newTplName.trim()) {
      setTplFormError("Template name is required.");
      return;
    }
    if (!newTplDesc.trim()) {
      setTplFormError("Template description is required.");
      return;
    }
    const cleanRules = newTplRules.map(r => r.trim()).filter(r => r.length > 0);
    if (cleanRules.length === 0) {
      setTplFormError("At least one validation rule is required.");
      return;
    }

    setIsSavingTpl(true);
    try {
      const payload = {
        name: newTplName.trim(),
        description: newTplDesc.trim(),
        category: newTplCat,
        marketType: newTplMarket,
        instrumentType: newTplInst,
        riskLevel: newTplRisk,
        timeframe: newTplTimeframe,
        difficulty: newTplDifficulty,
        tags: newTplTags.split(',').map(t => t.trim()).filter(Boolean),
        rules: cleanRules
      };

      const res = await fetchApi<any>('/api/strategy/library/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.error) {
        throw new Error(res.error);
      }

      setSuccessMessage(`Strategy template "${newTplName.trim()}" successfully registered to database.`);
      setIsCreateTplModalOpen(false);
      
      // Reset form
      setNewTplName('');
      setNewTplDesc('');
      setNewTplCat('Trend Following');
      setNewTplMarket('EQUITY');
      setNewTplInst('SPOT');
      setNewTplRisk('MEDIUM');
      setNewTplTimeframe('15M');
      setNewTplDifficulty('INTERMEDIATE');
      setNewTplTags('INSTITUTIONAL, QUANT');
      setNewTplRules(['RSI(14) < 30 (Oversold)', 'Price > 200 SMA (Trend Filter)']);

      fetchLibraryTemplates();
    } catch (err: any) {
      setTplFormError(err.message || "Failed to create strategy template.");
    } finally {
      setIsSavingTpl(false);
    }
  };

  // Use Template (Instantiate into Builder Working Copy)
  const handleUseTemplate = async (template: StrategyTemplateItem) => {
    setIsUsingTplId(template.id);
    try {
      const workingCopy = await instantiateTemplate(template);

      setEditingBuilderId(workingCopy.id);
      setNewStratName(workingCopy.name);
      setNewStratCategory(workingCopy.category);
      setNewStratTags(Array.isArray(workingCopy.tags) ? workingCopy.tags.join(', ') : 'WORKING_COPY');
      setNewStratDescription(workingCopy.description);
      setNewStratStatus(workingCopy.currentStatus);
      setNewStratRiskLevel(workingCopy.riskLevel);
      setNewStratTimeframe(workingCopy.timeframe);
      setNewStratMarketType(workingCopy.marketType);
      setNewStratInstrumentType(workingCopy.instrumentType);
      setBuilderRules([...workingCopy.rules]);

      setSuccessMessage(`Instantiated Working Copy "${workingCopy.name}" into Active Strategy Context. Navigating to Builder.`);
      
      // Auto-navigate to Builder stage
      setActiveTab('BUILDER');
      setStage('BUILDER');

      fetchLibraryTemplates();
      refreshAllData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to instantiate template.");
    } finally {
      setIsUsingTplId(null);
    }
  };

  // Clone Template
  const handleCloneTemplate = async (template: StrategyTemplateItem) => {
    setIsCloningTplId(template.id);
    try {
      const res = await fetchApi<any>(`/api/strategy/library/${template.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: `${template.name} (Copy)` })
      });

      if (res && res.error) {
        throw new Error(res.error);
      }

      setSuccessMessage(`Template "${template.name}" cloned successfully.`);
      fetchLibraryTemplates();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to clone template.");
    } finally {
      setIsCloningTplId(null);
    }
  };

  // Archive / Restore Template
  const handleArchiveTemplate = async (template: StrategyTemplateItem) => {
    setIsArchivingTplId(template.id);
    try {
      const res = await fetchApi<any>(`/api/strategy/library/${template.id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res && res.error) {
        throw new Error(res.error);
      }

      const actionText = template.status === 'ARCHIVED' ? 'restored to Published status' : 'archived';
      setSuccessMessage(`Template "${template.name}" ${actionText}.`);
      fetchLibraryTemplates();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update archive status.");
    } finally {
      setIsArchivingTplId(null);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (template: StrategyTemplateItem) => {
    setIsFavoritingTplId(template.id);
    try {
      const res = await fetchApi<any>(`/api/strategy/library/${template.id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res && res.error) {
        throw new Error(res.error);
      }

      fetchLibraryTemplates();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to favorite template.");
    } finally {
      setIsFavoritingTplId(null);
    }
  };

  // Export Template JSON
  const handleExportTemplate = async (template: StrategyTemplateItem) => {
    try {
      const res = await fetchApi<any>(`/api/strategy/library/${template.id}/export`);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `strategy_template_${template.templateId.toLowerCase()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setSuccessMessage(`Exported template package for "${template.name}".`);
    } catch (err: any) {
      setErrorMessage("Failed to export template: " + err.message);
    }
  };

  // Import Template JSON
  const handleImportTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) {
      setErrorMessage("Please paste valid JSON template data.");
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      const payload = parsed.template ? parsed.template : parsed;

      const res = await fetchApi<any>('/api/strategy/library/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.error) {
        throw new Error(res.error);
      }

      setSuccessMessage(`Successfully imported strategy template "${res.name}".`);
      setIsImportTplModalOpen(false);
      setImportJsonText('');
      fetchLibraryTemplates();
    } catch (err: any) {
      setErrorMessage("Import error: " + err.message);
    }
  };

  // Delete Template
  const handleConfirmDeleteTemplate = async () => {
    if (!isDeletingTplConfirmId) return;
    setIsDeletingTpl(true);
    try {
      const res = await fetchApi<any>(`/api/strategy/library/${isDeletingTplConfirmId}`, {
        method: 'DELETE'
      });

      if (res && res.error) {
        throw new Error(res.error);
      }

      setSuccessMessage(res.message || `Template deleted from database.`);
      setIsDeletingTplConfirmId(null);
      setIsDeletingTplConfirmName(null);
      fetchLibraryTemplates();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete strategy template.");
    } finally {
      setIsDeletingTpl(false);
    }
  };

  // View Template History
  const handleViewTemplateHistory = async (template: StrategyTemplateItem) => {
    setSelectedTemplateForHistory(template);
    setIsLoadingTplHistory(true);
    try {
      const res = await fetchApi<any>(`/api/strategy/library/${template.id}/history`);
      if (Array.isArray(res)) {
        setTplHistoryLogs(res);
      } else if (res && res.data) {
        setTplHistoryLogs(res.data);
      } else {
        setTplHistoryLogs([]);
      }
    } catch (err: any) {
      console.error("Failed to load template history:", err);
      setTplHistoryLogs([]);
    } finally {
      setIsLoadingTplHistory(false);
    }
  };

  // Fetch all backend state
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [stratsRes, libRes, evalsRes, ranksRes, candsRes, runRes, auditRes, evtsRes, builderRes] = await Promise.all([
        fetchApi<Strategy[]>('/api/strategy/all'),
        fetchApi<LibraryItem[]>('/api/strategy/library'),
        fetchApi<Evaluation[]>('/api/strategy/evaluation'),
        fetchApi<Ranking[]>('/api/strategy/ranking'),
        fetchApi<Candidate[]>('/api/strategy/candidates'),
        fetchApi<Runtime[]>('/api/strategy/runtime'),
        fetchApi<AuditLog[]>('/api/strategy/audits'),
        fetchApi<StrategyEvent[]>('/api/strategy/events'),
        fetchApi<any>('/api/strategy/builder')
      ]);

      if (stratsRes) setStrategies(resolveArrayData<Strategy>(stratsRes));
      if (libRes) setLibraryItems(resolveArrayData<LibraryItem>(libRes));
      if (evalsRes) setEvaluations(resolveArrayData<Evaluation>(evalsRes));
      if (ranksRes) setRankings(resolveArrayData<Ranking>(ranksRes));
      if (candsRes) setCandidates(resolveArrayData<Candidate>(candsRes));
      if (runRes) setRuntimes(resolveArrayData<Runtime>(runRes));
      if (auditRes) setAudits(resolveArrayData<AuditLog>(auditRes));
      if (evtsRes) setEvents(resolveArrayData<StrategyEvent>(evtsRes));

      if (builderRes) {
        if (builderRes.success && Array.isArray(builderRes.data)) {
          setBuilderStrategies(builderRes.data);
        } else if (Array.isArray(builderRes)) {
          setBuilderStrategies(builderRes);
        }
      }

      // Default first selected strategy
      if (stratsRes && stratsRes.length > 0 && !selectedStrategyId) {
        setSelectedStrategyId(stratsRes[0].id);
      }
    } catch (err: any) {
      setErrorMessage('Failed to connect to Strategy engine APIs: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedStrategyId]);

  // Fetch parameters when selection changes
  const fetchSelectedParameters = useCallback(async () => {
    if (!selectedStrategyId) return;
    try {
      const paramsRes = await fetchApi<StrategyParameters>(`/api/strategy/parameters/${selectedStrategyId}`);
      if (paramsRes) {
        setParameters(paramsRes);
      } else {
        setParameters(null);
      }
    } catch (e) {
      console.error("Failed fetching parameters", e);
    }
  }, [selectedStrategyId]);

  // Initial and auto-refresh hook
  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    fetchSelectedParameters();
  }, [selectedStrategyId, fetchSelectedParameters]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refreshAllData();
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshAllData]);

  // Handlers
  const handleToggleStatus = async (strategyId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    try {
      await fetchApi('/api/strategy/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategyId, status: nextStatus })
      });
      setSuccessMessage(`Strategy toggled successfully to ${nextStatus}`);
      refreshAllData();
    } catch (err: any) {
      setErrorMessage('Error toggling strategy status: ' + err.message);
    }
  };

  // Builder Filtered and Sorted List Calculation
  const filteredBuilderStrategies = useMemo(() => {
    const list = builderStrategies.filter(item => {
      const q = builderSearchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        item.name.toLowerCase().includes(q) ||
        (item.strategyId && item.strategyId.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));
      
      const matchesCategory = builderCategoryFilter === 'ALL' || item.category === builderCategoryFilter;
      const matchesStatus = builderStatusFilter === 'ALL' || item.status === builderStatusFilter;
      const matchesRisk = builderRiskFilter === 'ALL' || item.riskLevel === builderRiskFilter;
      const matchesTf = builderTimeframeFilter === 'ALL' || item.timeframe === builderTimeframeFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesRisk && matchesTf;
    });

    list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (builderSortKey === 'NAME') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (builderSortKey === 'DATE') {
        valA = new Date(a.updatedTime || a.createdTime).getTime();
        valB = new Date(b.updatedTime || b.createdTime).getTime();
      } else if (builderSortKey === 'STATUS') {
        valA = a.status || '';
        valB = b.status || '';
      } else if (builderSortKey === 'RISK') {
        valA = a.riskLevel || '';
        valB = b.riskLevel || '';
      } else if (builderSortKey === 'CATEGORY') {
        valA = a.category || '';
        valB = b.category || '';
      }

      if (valA < valB) return builderSortDir === 'ASC' ? -1 : 1;
      if (valA > valB) return builderSortDir === 'ASC' ? 1 : -1;
      return 0;
    });

    return list;
  }, [
    builderStrategies, builderSearchQuery, builderCategoryFilter,
    builderStatusFilter, builderRiskFilter, builderTimeframeFilter,
    builderSortKey, builderSortDir
  ]);

  // Unsaved Changes Detection
  const loadedStrategy = useMemo(() => {
    return builderStrategies.find(s => s.id === editingBuilderId) || null;
  }, [builderStrategies, editingBuilderId]);

  const hasUnsavedChanges = useMemo(() => {
    if (editingBuilderId && loadedStrategy) {
      const origTags = Array.isArray(loadedStrategy.tags) ? loadedStrategy.tags.join(', ') : (loadedStrategy.tags || '');
      const origRules = Array.isArray(loadedStrategy.rules) ? loadedStrategy.rules : [];
      
      const isNameDiff = newStratName.trim() !== (loadedStrategy.name || '').trim();
      const isCategoryDiff = newStratCategory !== (loadedStrategy.category || 'Trend Following');
      const isTagsDiff = newStratTags.trim() !== origTags.trim();
      const isDescDiff = newStratDescription.trim() !== (loadedStrategy.description || '').trim();
      const isStatusDiff = newStratStatus !== (loadedStrategy.status || 'DRAFT');
      const isRiskDiff = newStratRiskLevel !== (loadedStrategy.riskLevel || 'MEDIUM');
      const isTfDiff = newStratTimeframe !== (loadedStrategy.timeframe || '15M');
      const isMarketDiff = newStratMarketType !== (loadedStrategy.marketType || 'EQUITY');
      const isInstDiff = newStratInstrumentType !== (loadedStrategy.instrumentType || 'SPOT');
      const isRulesDiff = JSON.stringify(builderRules) !== JSON.stringify(origRules);

      return isNameDiff || isCategoryDiff || isTagsDiff || isDescDiff || isStatusDiff || isRiskDiff || isTfDiff || isMarketDiff || isInstDiff || isRulesDiff;
    } else {
      return newStratName.trim().length > 0 || newStratDescription.trim().length > 0;
    }
  }, [
    editingBuilderId, loadedStrategy, newStratName, newStratCategory, newStratTags,
    newStratDescription, newStratStatus, newStratRiskLevel, newStratTimeframe,
    newStratMarketType, newStratInstrumentType, builderRules
  ]);

  // Reload Strategy Handler
  const handleReloadStrategy = () => {
    if (editingBuilderId && loadedStrategy) {
      handleSelectForEdit(loadedStrategy);
      setSuccessMessage(`Reloaded original strategy data for "${loadedStrategy.name}".`);
    } else {
      handleCancelEdit();
    }
  };

  // Clone Handler
  const handleCloneStrategy = async (item: BuilderStrategyItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsCloningBuilder(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetchApi<{ success: boolean; message: string; data?: any; errors?: string[] }>(
        `/api/strategy/builder/${item.id}/clone`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }
      );
      if (res && res.success === false) {
        setErrorMessage(res.message || 'Failed cloning strategy model.');
      } else {
        const clonedName = res?.data?.name || `${item.name} (Copy)`;
        setSuccessMessage(`Successfully cloned strategy: "${clonedName}"`);
        await refreshAllData();
      }
    } catch (err: any) {
      setErrorMessage('Error cloning strategy: ' + (err.message || String(err)));
    } finally {
      setIsCloningBuilder(false);
    }
  };

  // Archive / Restore Handler
  const handleArchiveToggle = async (item: BuilderStrategyItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSuccessMessage('');
    const nextStatus = item.status === 'ARCHIVED' ? 'DRAFT' : 'ARCHIVED';
    try {
      const res = await fetchApi<{ success: boolean; message: string; data?: any; errors?: string[] }>(
        `/api/strategy/builder/${item.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        }
      );
      if (res && res.success === false) {
        setErrorMessage(res.message || 'Failed updating status.');
      } else {
        setSuccessMessage(`Strategy "${item.name}" set to ${nextStatus}.`);
        if (editingBuilderId === item.id) {
          setNewStratStatus(nextStatus);
        }
        await refreshAllData();
      }
    } catch (err: any) {
      setErrorMessage('Error updating status: ' + (err.message || String(err)));
    }
  };

  // Multi-Select Handlers
  const handleToggleSelectBuilder = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBuilderIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFilteredBuilders = () => {
    const allFilteredIds = filteredBuilderStrategies.map(s => s.id);
    const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedBuilderIds.includes(id));
    if (isAllSelected) {
      setSelectedBuilderIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedBuilderIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleBulkAction = async (action: 'DELETE' | 'ARCHIVE' | 'RESTORE' | 'PUBLISH' | 'VALIDATE') => {
    if (selectedBuilderIds.length === 0) return;
    setIsBulkProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetchApi<{ success: boolean; message: string; affectedCount?: number; errors?: string[] }>(
        '/api/strategy/builder/bulk',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            ids: selectedBuilderIds,
            updatedBy: 'ENTERPRISE_STRATEGY_BUILDER'
          })
        }
      );
      if (res && res.success === false) {
        setErrorMessage(res.message || `Bulk ${action} failed.`);
      } else {
        setSuccessMessage(`Bulk ${action} executed successfully for ${res?.affectedCount || selectedBuilderIds.length} items.`);
        setSelectedBuilderIds([]);
        await refreshAllData();
      }
    } catch (err: any) {
      setErrorMessage(`Error executing bulk ${action}: ` + (err.message || String(err)));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Open Details Modal Handler
  const handleOpenViewDetailModal = (item: BuilderStrategyItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingDetailItem(item);
  };

  // History Modal Handler
  const handleOpenHistoryModal = async (item: BuilderStrategyItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingHistoryId(item.id);
    setViewingHistoryName(item.name);
    setHistoryTimeline([]);
    setIsLoadingHistory(true);
    try {
      const res = await fetchApi<{ success: boolean; data?: any[] }>(`/api/strategy/builder/${item.id}/history`);
      if (res && res.success && Array.isArray(res.data)) {
        setHistoryTimeline(res.data);
      }
    } catch (err: any) {
      console.error("Error loading history timeline:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Builder Core Handlers (Create / Update / Select / Cancel / Delete)
  const handleSaveOrUpdateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setRuleError('');

    const trimmedName = newStratName.trim();
    if (!trimmedName) {
      setErrorMessage('Strategy Identifier Name is required.');
      return;
    }
    if (trimmedName.length < 3) {
      setErrorMessage('Strategy Identifier Name must be at least 3 characters long.');
      return;
    }
    if (trimmedName.length > 100) {
      setErrorMessage('Strategy Identifier Name cannot exceed 100 characters.');
      return;
    }
    const reservedWords = ["CON", "PRN", "AUX", "NUL", "NULL", "SELECT", "DELETE", "DROP", "INSERT", "UPDATE", "ALTER", "TRUNCATE", "TABLE", "SYSTEM", "ROOT", "ADMIN"];
    if (reservedWords.includes(trimmedName.toUpperCase())) {
      setErrorMessage(`"${trimmedName}" is a system reserved keyword and cannot be used as a Strategy Name.`);
      return;
    }
    if (/[<>{};]/g.test(trimmedName)) {
      setErrorMessage('Strategy Name contains invalid characters (<, >, {, }, ;).');
      return;
    }
    if (!builderRules || builderRules.length === 0) {
      setErrorMessage('At least one rule specification is required to register a strategy.');
      return;
    }

    // Duplicate check in local state
    const duplicate = builderStrategies.find(
      s => s.name.toLowerCase() === trimmedName.toLowerCase() && s.id !== editingBuilderId
    );
    if (duplicate) {
      setErrorMessage(`A strategy model named "${trimmedName}" is already registered in the database.`);
      return;
    }

    setIsSavingBuilder(true);

    try {
      const payload = {
        name: trimmedName,
        category: newStratCategory.trim(),
        tags: newStratTags,
        description: newStratDescription.trim() || `Enterprise strategy definition for ${trimmedName}`,
        rules: builderRules,
        riskLevel: newStratRiskLevel,
        timeframe: newStratTimeframe,
        marketType: newStratMarketType,
        instrumentType: newStratInstrumentType,
        status: newStratStatus,
        updatedBy: 'ENTERPRISE_STRATEGY_BUILDER'
      };

      let res: any;
      if (editingBuilderId) {
        res = await fetchApi<{ success: boolean; message: string; data?: any; errors?: string[]; _isApiError?: boolean }>(
          `/api/strategy/builder/${editingBuilderId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );
      } else {
        res = await fetchApi<{ success: boolean; message: string; data?: any; errors?: string[]; _isApiError?: boolean }>(
          '/api/strategy/builder',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...payload,
              createdBy: 'ENTERPRISE_STRATEGY_BUILDER'
            })
          }
        );
      }

      if (res && (res._isApiError || res.success === false)) {
        const errorDetail = res.errors && res.errors.length > 0 ? res.errors.join(' ') : (res.message || 'Error processing strategy model.');
        setErrorMessage(errorDetail);
      } else {
        const registeredName = res?.data?.name || trimmedName;
        const registeredId = res?.data?.id || editingBuilderId || 'STRAT-001';

        await saveBuilderCopy({
          id: registeredId,
          strategyId: registeredId,
          name: registeredName,
          category: newStratCategory,
          tags: newStratTags.split(',').map(t => t.trim()).filter(Boolean),
          description: newStratDescription,
          rules: builderRules,
          riskLevel: newStratRiskLevel,
          timeframe: newStratTimeframe,
          marketType: newStratMarketType,
          instrumentType: newStratInstrumentType
        });

        setSuccessMessage(`Saved strategy model "${registeredName}" to Active Context. Transitioning to Parameters stage.`);
        
        // Auto transition to Parameters stage
        setActiveTab('PARAMETERS');
        setStage('PARAMETERS');

        await refreshAllData();
      }
    } catch (err: any) {
      setErrorMessage('Failed saving strategy model: ' + (err.message || String(err)));
    } finally {
      setIsSavingBuilder(false);
    }
  };

  const handleSelectForEdit = (item: BuilderStrategyItem) => {
    setEditingBuilderId(item.id);
    setNewStratName(item.name || '');
    setNewStratCategory(item.category || 'Trend Following');
    setNewStratTags(Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''));
    setNewStratDescription(item.description || '');
    setNewStratStatus(item.status || 'DRAFT');
    setNewStratRiskLevel(item.riskLevel || 'MEDIUM');
    setNewStratTimeframe(item.timeframe || '15M');
    setNewStratMarketType(item.marketType || 'EQUITY');
    setNewStratInstrumentType(item.instrumentType || 'SPOT');
    setBuilderRules(Array.isArray(item.rules) ? [...item.rules] : []);
    setEditingRuleIdx(null);
    setEditingRuleText('');
    setRuleError('');
    setErrorMessage('');
    setSuccessMessage(`Loaded "${item.name}" into Builder.`);
  };

  const handleCancelEdit = () => {
    setEditingBuilderId(null);
    setNewStratName('');
    setNewStratCategory('Trend Following');
    setNewStratTags('AUTO, NEW');
    setNewStratDescription('');
    setNewStratStatus('DRAFT');
    setNewStratRiskLevel('MEDIUM');
    setNewStratTimeframe('15M');
    setNewStratMarketType('EQUITY');
    setNewStratInstrumentType('SPOT');
    setBuilderRules(['RSI between 30 and 70', 'Price above 50 SMA']);
    setNewRuleInput('');
    setEditingRuleIdx(null);
    setEditingRuleText('');
    setRuleError('');
    setErrorMessage('');
  };

  const handlePromptDelete = (item: BuilderStrategyItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirmId(item.id);
    setDeleteConfirmName(item.name);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeletingBuilder(true);
    setErrorMessage('');
    try {
      const res = await fetchApi<{ success: boolean; message: string; errors?: string[] }>(
        `/api/strategy/builder/${deleteConfirmId}`,
        { method: 'DELETE' }
      );

      if (res && res.success === false) {
        setErrorMessage(res.message || 'Failed deleting strategy model');
      } else {
        setSuccessMessage(`Successfully deleted strategy model: ${deleteConfirmName}`);
        if (editingBuilderId === deleteConfirmId) {
          handleCancelEdit();
        }
        setDeleteConfirmId(null);
        setDeleteConfirmName(null);
        await refreshAllData();
      }
    } catch (err: any) {
      setErrorMessage('Error deleting strategy model: ' + (err.message || String(err)));
    } finally {
      setIsDeletingBuilder(false);
    }
  };

  // Rule Engine Methods
  const handleAddRule = () => {
    setRuleError('');
    const trimmed = newRuleInput.trim();
    if (!trimmed) {
      setRuleError('Rule specification cannot be empty.');
      return;
    }
    if (builderRules.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
      setRuleError('Duplicate rule specification detected.');
      return;
    }
    setBuilderRules(prev => [...prev, trimmed]);
    setNewRuleInput('');
  };

  const handleStartEditRule = (idx: number, currentText: string) => {
    setEditingRuleIdx(idx);
    setEditingRuleText(currentText);
    setRuleError('');
  };

  const handleSaveEditRule = () => {
    if (editingRuleIdx === null) return;
    setRuleError('');
    const trimmed = editingRuleText.trim();
    if (!trimmed) {
      setRuleError('Rule specification cannot be empty.');
      return;
    }
    const dup = builderRules.some((r, i) => i !== editingRuleIdx && r.toLowerCase() === trimmed.toLowerCase());
    if (dup) {
      setRuleError('Duplicate rule specification detected.');
      return;
    }
    setBuilderRules(prev => prev.map((r, i) => (i === editingRuleIdx ? trimmed : r)));
    setEditingRuleIdx(null);
    setEditingRuleText('');
  };

  const handleMoveRule = (idx: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && idx === 0) return;
    if (direction === 'DOWN' && idx === builderRules.length - 1) return;
    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    const nextRules = [...builderRules];
    const temp = nextRules[idx];
    nextRules[idx] = nextRules[targetIdx];
    nextRules[targetIdx] = temp;
    setBuilderRules(nextRules);
  };

  const handleUpdateParameters = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parameters || !selectedStrategyId) return;
    setLoading(true);
    try {
      await fetchApi('/api/strategy/parameters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          riskProfile: parameters.riskProfile,
          timeframe: parameters.timeframe,
          volumeRules: parameters.volumeRules,
          liquidityRules: parameters.liquidityRules,
          volatilityRules: parameters.volatilityRules,
          trendRules: parameters.trendRules,
          sessionRules: parameters.sessionRules,
          marketConditions: parameters.marketConditions
        })
      });
      setSuccessMessage('Strategy parameters updated & audit logged successfully');
      refreshAllData();
    } catch (err: any) {
      setErrorMessage('Failed updating parameters: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQueueRuntimeJob = async (strategyId: string) => {
    try {
      await fetchApi('/api/strategy/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategyId, priority: 80 })
      });
      setSuccessMessage('Strategy analysis job successfully queued on the high-priority worker.');
      refreshAllData();
    } catch (err: any) {
      setErrorMessage('Failed to queue strategy runtime job: ' + err.message);
    }
  };

  // Safe parameters updates
  const updateParamField = (section: string, field: string, value: any) => {
    if (!parameters) return;
    setParameters(prev => {
      if (!prev) return null;
      if (section === 'root') {
        return { ...prev, [field]: value };
      }
      return {
        ...prev,
        [section]: {
          ...((prev as any)[section] || {}),
          [field]: value
        }
      };
    });
  };

  return (
    <div className="w-full h-[100dvh] overflow-hidden flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* SINGLE COMPRESSED HEADER & WORKFLOW NAVIGATION (MAX HEIGHT <= 140px) */}
      <div className="shrink-0 max-h-[140px] flex flex-col bg-slate-900 border-b border-slate-800">
        <ActiveStrategyHeader activeTab={activeTab} onSelectTab={(tab) => { setActiveTab(tab); setStage(tab); }} />
      </div>

      {/* STATUS TOAST MESSAGES */}
      {successMessage && (
        <div className="mx-4 mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> {successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="font-bold hover:text-emerald-950">✕</button>
        </div>
      )}
      {errorMessage && (
        <div className="mx-4 mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5"><XCircle className="w-4 h-4 text-rose-600" /> {errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="font-bold hover:text-rose-950">✕</button>
        </div>
      )}

      {/* MAIN CONTENT WORKSPACE (SINGLE SCROLL CONTAINER - ONLY DATA AREA SCROLLS) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'DASHBOARD' && (
            <motion.div key="dashboard-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full">
              <EnterpriseStrategyCommandCenter onNavigateWorkspace={(ws) => {
                if (ws === 'REGISTRY') setActiveTab('LIBRARY');
                else if (ws === 'BUILDER') setActiveTab('BUILDER');
                else if (ws === 'PARAMETERS') setActiveTab('PARAMETERS');
                else if (ws === 'CANDIDATES') setActiveTab('CANDIDATES');
                else if (ws === 'RANKING') setActiveTab('RANKING');
                else if (ws === 'RUNTIME') setActiveTab('RUNTIME');
                else if (ws === 'ANALYTICS') setActiveTab('INSPECTOR');
                else if (ws === 'LIFECYCLE') setActiveTab('VERSION');
              }} />
            </motion.div>
          )}

          {activeTab === 'LIBRARY' && (
            <motion.div key="library-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              
              {/* Header Banner */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          Strategy Template Repository <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono font-bold">Module 2</span>
                        </h2>
                        <p className="text-xs text-slate-500">
                          Database-driven institutional template repository with validation rule expressions, sha256 checksums, versioning, and lifecycle management.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5 shadow-xs">
                      <Database className="w-3.5 h-3.5" />
                      {templates.length} Templates Active
                    </span>

                    <button
                      onClick={fetchLibraryTemplates}
                      disabled={isLoadingTemplates}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      title="Refresh templates from database"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTemplates ? 'animate-spin text-indigo-600' : ''}`} />
                      Sync
                    </button>

                    <button
                      onClick={() => setIsImportTplModalOpen(true)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      Import JSON
                    </button>

                    <button
                      onClick={() => setIsCreateTplModalOpen(true)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Create Template
                    </button>
                  </div>
                </div>

                {/* Filter and Control Toolbar */}
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={tplSearchQuery}
                        onChange={(e) => setTplSearchQuery(e.target.value)}
                        placeholder="Search name, tag, ID, rule..."
                        className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      {tplSearchQuery && (
                        <button
                          onClick={() => setTplSearchQuery('')}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter */}
                    <div>
                      <select
                        value={tplCategoryFilter}
                        onChange={(e) => setTplCategoryFilter(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
                      >
                        <option value="ALL">All Categories</option>
                        <option value="Trend Following">Trend Following</option>
                        <option value="Mean Reversion">Mean Reversion</option>
                        <option value="Volatility Breakout">Volatility Breakout</option>
                        <option value="Liquidity Arbitrage">Liquidity Arbitrage</option>
                        <option value="Statistical Arbitrage">Statistical Arbitrage</option>
                        <option value="Market Making">Market Making</option>
                        <option value="Algorithmic Execution">Algorithmic Execution</option>
                      </select>
                    </div>

                    {/* Market Type Filter */}
                    <div>
                      <select
                        value={tplMarketFilter}
                        onChange={(e) => setTplMarketFilter(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
                      >
                        <option value="ALL">All Markets</option>
                        <option value="EQUITY">EQUITY</option>
                        <option value="CRYPTO">CRYPTO</option>
                        <option value="FOREX">FOREX</option>
                        <option value="COMMODITY">COMMODITY</option>
                        <option value="DERIVATIVES">DERIVATIVES</option>
                      </select>
                    </div>

                    {/* Tier Filter */}
                    <div>
                      <select
                        value={tplTierFilter}
                        onChange={(e) => setTplTierFilter(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-indigo-700"
                      >
                        <option value="ALL">All Repository Tiers</option>
                        <option value="CORE">CORE Tier (Templates 1-10)</option>
                        <option value="INSTITUTIONAL">INSTITUTIONAL Tier (11-25)</option>
                      </select>
                    </div>

                    {/* Risk Filter */}
                    <div>
                      <select
                        value={tplRiskFilter}
                        onChange={(e) => setTplRiskFilter(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
                      >
                        <option value="ALL">All Risk Levels</option>
                        <option value="LOW">LOW Risk</option>
                        <option value="MEDIUM">MEDIUM Risk</option>
                        <option value="HIGH">HIGH Risk</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* Timeframe Select */}
                      <select
                        value={tplTimeframeFilter}
                        onChange={(e) => setTplTimeframeFilter(e.target.value)}
                        className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="ALL">Timeframe: All</option>
                        <option value="1M">1M</option>
                        <option value="5M">5M</option>
                        <option value="15M">15M</option>
                        <option value="1H">1H</option>
                        <option value="1D">1D</option>
                      </select>

                      {/* Status Select */}
                      <select
                        value={tplStatusFilter}
                        onChange={(e) => setTplStatusFilter(e.target.value)}
                        className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="ALL">Status: All</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>

                      {/* Sort Select */}
                      <select
                        value={tplSortKey}
                        onChange={(e) => setTplSortKey(e.target.value)}
                        className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="NEWEST">Sort: Newest</option>
                        <option value="HIGHEST_WIN_RATE">Sort: Highest Win Rate</option>
                        <option value="HIGHEST_PROFIT_FACTOR">Sort: Highest Profit Factor</option>
                        <option value="LOWEST_DRAWDOWN">Sort: Lowest Drawdown</option>
                        <option value="MOST_USED">Sort: Most Used</option>
                        <option value="HIGHEST_RATED">Sort: Highest Rated</option>
                        <option value="ALPHABETICAL">Sort: Alphabetical</option>
                      </select>

                      {/* Starred Favorites Toggle */}
                      <button
                        onClick={() => setTplFavoritesOnly(!tplFavoritesOnly)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md border flex items-center gap-1 transition-colors ${
                          tplFavoritesOnly
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${tplFavoritesOnly ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                        Favorites
                      </button>
                    </div>

                    {/* Reset Filters */}
                    {(tplSearchQuery || tplCategoryFilter !== 'ALL' || tplMarketFilter !== 'ALL' || tplRiskFilter !== 'ALL' || tplTimeframeFilter !== 'ALL' || tplStatusFilter !== 'ALL' || tplTierFilter !== 'ALL' || tplFavoritesOnly) && (
                      <button
                        onClick={() => {
                          setTplSearchQuery('');
                          setTplCategoryFilter('ALL');
                          setTplMarketFilter('ALL');
                          setTplRiskFilter('ALL');
                          setTplTimeframeFilter('ALL');
                          setTplStatusFilter('ALL');
                          setTplTierFilter('ALL');
                          setTplSortKey('NEWEST');
                          setTplFavoritesOnly(false);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" /> Reset Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Templates Grid */}
                {isLoadingTemplates ? (
                  <div className="p-12 text-center bg-slate-50/50 rounded-xl border border-slate-200 space-y-3">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">Querying strategy template database repository...</p>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-300 space-y-3">
                    <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">No Strategy Templates Found</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      No template records match your search criteria or active filters. Try adjusting your filters or register a new strategy template.
                    </p>
                    <button
                      onClick={() => setIsCreateTplModalOpen(true)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Create New Template
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {templates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
                      >
                        <div className="space-y-3">
                          
                          {/* Card Top Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleToggleFavorite(tpl)}
                                disabled={isFavoritingTplId === tpl.id}
                                className="text-slate-300 hover:text-amber-400 transition-colors"
                                title="Toggle favorite"
                              >
                                <Star className={`w-4 h-4 ${tpl.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                              </button>
                              <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                {tpl.templateId}
                              </span>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                                tpl.tier === 'INSTITUTIONAL' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {tpl.tier || 'CORE'}
                              </span>
                              <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full uppercase">
                                {tpl.category}
                              </span>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              tpl.approvalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {tpl.approvalStatus}
                            </span>
                          </div>

                          {/* Template Name & Description */}
                          <div>
                            <h3
                              onClick={() => setSelectedTemplateForDetail(tpl)}
                              className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors cursor-pointer flex items-center justify-between"
                            >
                              <span>{tpl.name}</span>
                              <Eye className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">
                              {tpl.description}
                            </p>
                          </div>

                          {/* Badges Strip */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {tpl.marketType}
                            </span>
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {tpl.instrumentType}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              tpl.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-800' :
                              tpl.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {tpl.riskLevel} Risk
                            </span>
                            <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                              {tpl.timeframe}
                            </span>
                          </div>

                          {/* Certified Performance Metrics Bar */}
                          {tpl.winRate !== undefined && (
                            <div className="grid grid-cols-4 gap-1 bg-slate-900 text-white p-2.5 rounded-lg text-center font-mono text-[10px]">
                              <div>
                                <span className="text-slate-400 text-[8px] block uppercase">Win Rate</span>
                                <span className="font-bold text-emerald-400">{tpl.winRate}%</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[8px] block uppercase">Profit Factor</span>
                                <span className="font-bold text-teal-300">{tpl.profitFactor}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[8px] block uppercase">Max DD</span>
                                <span className="font-bold text-rose-400">{tpl.maxDrawdown}%</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[8px] block uppercase">AI Score</span>
                                <span className="font-bold text-amber-300">{tpl.aiCompatibilityScore}</span>
                              </div>
                            </div>
                          )}

                          {/* Validation Rules Container */}
                          <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-lg border border-slate-200/70">
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Validation Rules
                              </span>
                              <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                {tpl.ruleCount} Rules
                              </span>
                            </div>
                            <div className="space-y-1">
                              {tpl.rules.slice(0, 3).map((rule, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-mono truncate">
                                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                                  <span className="truncate">{rule}</span>
                                </div>
                              ))}
                              {tpl.rules.length > 3 && (
                                <div className="text-[10px] text-indigo-600 font-semibold pt-0.5">
                                  + {tpl.rules.length - 3} additional validation rules
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Metadata Footer */}
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                              v{tpl.version}
                            </span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Zap className="w-3 h-3 text-amber-500" /> Used {tpl.usageCount}x
                            </span>
                            <span className="text-amber-600 font-bold flex items-center gap-0.5">
                              ★ {tpl.rating ? tpl.rating.toFixed(2) : '5.00'}
                            </span>
                          </div>

                          {/* Card Action Buttons Bar */}
                          <div className="grid grid-cols-4 gap-1 pt-1">
                            <button
                              onClick={() => handleUseTemplate(tpl)}
                              disabled={isUsingTplId === tpl.id}
                              className="col-span-2 px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                              title="Instantiate template into strategy builder"
                            >
                              <Play className={`w-3.5 h-3.5 ${isUsingTplId === tpl.id ? 'animate-spin' : ''}`} />
                              Use Template
                            </button>

                            <button
                              onClick={() => handleCloneTemplate(tpl)}
                              disabled={isCloningTplId === tpl.id}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                              title="Clone strategy template"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleViewTemplateHistory(tpl)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="View Version & Audit History"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleExportTemplate(tpl)}
                                className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                title="Export JSON package"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleArchiveTemplate(tpl)}
                                disabled={isArchivingTplId === tpl.id}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  tpl.status === 'ARCHIVED' ? 'text-amber-600 bg-amber-50' : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                                }`}
                                title={tpl.status === 'ARCHIVED' ? 'Restore template' : 'Archive template'}
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setIsDeletingTplConfirmId(tpl.id);
                                  setIsDeletingTplConfirmName(tpl.name);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete template"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

            </motion.div>
          )}

          {activeTab === 'PARAMETERS' && (
            <motion.div key="parameters-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <StrategyParametersWorkspace
                selectedStrategyId={activeStrategy?.id || selectedStrategyId || 'STRAT-001'}
                selectedStrategyName={activeStrategy?.name || strategies.find(s => s.id === selectedStrategyId)?.name || 'Active Strategy'}
                availableStrategies={strategies.length > 0 ? strategies : [
                  {
                    id: activeStrategy?.id || 'STRAT-001',
                    name: activeStrategy?.name || 'NIFTY Alpha Trend Momentum',
                    category: activeStrategy?.category || 'Trend Following',
                    version: activeStrategy?.version || '1.0.0',
                    owner: 'ARINA_QUANT_COMMITTEE',
                    status: 'ENABLED',
                    tags: ['INSTITUTIONAL'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                ]}
                onSelectStrategy={(id) => {
                  setSelectedStrategyId(id);
                  const found = strategies.find(s => s.id === id);
                  if (found) {
                    updateActiveStrategy({
                      id: found.id,
                      strategyId: found.id,
                      name: found.name,
                      category: found.category
                    });
                  }
                }}
              />
            </motion.div>
          )}

          {activeTab === 'CANDIDATES' && (
            <motion.div key="candidates-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <StrategyCandidatesWorkspace
                selectedStrategyId={activeStrategy?.id || selectedStrategyId || 'STRAT-001'}
                selectedStrategyName={activeStrategy?.name || strategies.find(s => s.id === selectedStrategyId)?.name || 'Active Strategy'}
                availableStrategies={strategies.length > 0 ? strategies : [
                  {
                    id: activeStrategy?.id || 'STRAT-001',
                    name: activeStrategy?.name || 'NIFTY Alpha Trend Momentum'
                  }
                ]}
                onSelectStrategy={(id) => {
                  setSelectedStrategyId(id);
                  const found = strategies.find(s => s.id === id);
                  if (found) {
                    updateActiveStrategy({
                      id: found.id,
                      strategyId: found.id,
                      name: found.name,
                      category: found.category
                    });
                  }
                }}
              />
            </motion.div>
          )}

          {activeTab === 'RANKING' && (
            <motion.div key="ranking-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <StrategyRankingWorkspace
                selectedStrategyId={activeStrategy?.id || selectedStrategyId || 'STRAT-001'}
                selectedStrategyName={activeStrategy?.name || strategies.find(s => s.id === selectedStrategyId)?.name || 'Active Strategy'}
                availableStrategies={strategies.length > 0 ? strategies : [
                  {
                    id: activeStrategy?.id || 'STRAT-001',
                    name: activeStrategy?.name || 'NIFTY Alpha Trend Momentum'
                  }
                ]}
                onSelectStrategy={(id) => {
                  setSelectedStrategyId(id);
                  const found = strategies.find(s => s.id === id);
                  if (found) {
                    updateActiveStrategy({
                      id: found.id,
                      strategyId: found.id,
                      name: found.name,
                      category: found.category
                    });
                  }
                }}
              />
            </motion.div>
          )}

          {activeTab === 'RUNTIME' && (
            <motion.div key="runtime-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <StrategyRuntimeWorkspace
                selectedStrategyId={activeStrategy?.id || selectedStrategyId || 'STRAT-001'}
                selectedStrategyName={activeStrategy?.name || strategies.find(s => s.id === selectedStrategyId)?.name || 'Active Strategy'}
                availableStrategies={strategies.length > 0 ? strategies : [
                  {
                    id: activeStrategy?.id || 'STRAT-001',
                    name: activeStrategy?.name || 'NIFTY Alpha Trend Momentum'
                  }
                ]}
                onSelectStrategy={(id) => {
                  setSelectedStrategyId(id);
                  const found = strategies.find(s => s.id === id);
                  if (found) {
                    updateActiveStrategy({
                      id: found.id,
                      strategyId: found.id,
                      name: found.name,
                      category: found.category
                    });
                  }
                }}
              />
            </motion.div>
          )}

          {activeTab === 'VERSION' && (
            <motion.div key="version-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <StrategyVersioningWorkspace strategyId={activeStrategy?.id || 'STRAT-001'} strategyName={activeStrategy?.name || 'Enterprise Strategy'} />
            </motion.div>
          )}

          {activeTab === 'AUDIT' && (
            <motion.div key="audit-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <StrategyAuditWorkspace strategyId={activeStrategy?.id || 'STRAT-001'} strategyName={activeStrategy?.name || 'Enterprise Strategy'} />
            </motion.div>
          )}

          {activeTab === 'INSPECTOR' && (
            <motion.div key="inspector-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <StrategyPipelineInspectorWorkspace strategyId={activeStrategy?.id || 'STRAT-001'} strategyName={activeStrategy?.name || 'Enterprise Strategy'} />
            </motion.div>
          )}

          
          {activeTab === 'BUILDER' && (
            <>
              {/* DELETE CONFIRMATION MODAL */}
              {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                  <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
                    <div className="flex items-center gap-3 text-rose-600">
                      <AlertTriangle className="w-6 h-6" />
                      <h3 className="font-bold text-base text-slate-900">Delete Strategy Model</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Are you sure you want to permanently delete strategy model <strong className="text-slate-900">{deleteConfirmName}</strong> from the database? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setDeleteConfirmId(null); setDeleteConfirmName(null); }}
                        className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isDeletingBuilder}
                        onClick={handleConfirmDelete}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        {isDeletingBuilder ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            Confirm Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <motion.div 
                key="builder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* LEFT COLUMN: STRATEGY BUILDER FORM */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5 relative">
                  {/* LOCK OVERLAY DURING SAVE/DELETE */}
                  {(isSavingBuilder || isDeletingBuilder || isCloningBuilder) && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-10 rounded-xl flex flex-col items-center justify-center p-4 gap-2">
                      <RefreshCw className="w-7 h-7 text-teal-600 animate-spin" />
                      <span className="text-xs font-bold text-slate-800">
                        {isSavingBuilder ? 'Persisting Strategy to Database...' : isDeletingBuilder ? 'Removing Strategy...' : 'Cloning Strategy Model...'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        {editingBuilderId ? <FileEdit className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-teal-600" />}
                        {editingBuilderId ? 'Edit Strategy Model' : 'Strategy Registration & Builder'}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {editingBuilderId 
                          ? 'Modify strategy parameters, market profile, tags, and rules in database.'
                          : 'Assemble rule conditions, entry filters, and metadata for registration.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasUnsavedChanges && (
                        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full uppercase flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3 h-3" /> Unsaved
                        </span>
                      )}
                      {editingBuilderId ? (
                        <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                          <Edit2 className="w-3 h-3" /> Edit Mode
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Create Mode
                        </span>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSaveOrUpdateStrategy} className="space-y-4">
                    <div className="space-y-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] uppercase font-bold text-slate-500">
                            Strategy Identifier Name <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">
                            {newStratName.trim().length}/100
                          </span>
                        </div>
                        <input 
                          type="text" 
                          placeholder="e.g. Volume Momentum Index Breakout"
                          value={newStratName}
                          onChange={(e) => setNewStratName(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 font-medium"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Category</label>
                          <select 
                            value={newStratCategory}
                            onChange={(e) => setNewStratCategory(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 font-medium bg-white"
                          >
                            <option value="Trend Following">Trend Following</option>
                            <option value="Mean Reversion">Mean Reversion</option>
                            <option value="Momentum">Momentum Swings</option>
                            <option value="Statistical">Statistical Arbitrage</option>
                            <option value="Scalping">Intraday Scalper</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Status Lifecycle</label>
                          <select 
                            value={newStratStatus}
                            onChange={(e) => setNewStratStatus(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 font-medium bg-white"
                          >
                            <option value="DRAFT">DRAFT</option>
                            <option value="READY">READY</option>
                            <option value="VALIDATED">VALIDATED</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="PUBLISHED">PUBLISHED</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Market Type</label>
                          <select 
                            value={newStratMarketType}
                            onChange={(e) => setNewStratMarketType(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 font-medium bg-white"
                          >
                            <option value="EQUITY">EQUITY</option>
                            <option value="CRYPTO">CRYPTO</option>
                            <option value="FOREX">FOREX</option>
                            <option value="COMMODITY">COMMODITY</option>
                            <option value="INDEX">INDEX</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Instrument Type</label>
                          <select 
                            value={newStratInstrumentType}
                            onChange={(e) => setNewStratInstrumentType(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 font-medium bg-white"
                          >
                            <option value="SPOT">SPOT</option>
                            <option value="FUTURES">FUTURES</option>
                            <option value="OPTIONS">OPTIONS</option>
                            <option value="SWAP">SWAP</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Risk Profile</label>
                          <select 
                            value={newStratRiskLevel}
                            onChange={(e) => setNewStratRiskLevel(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 font-medium bg-white"
                          >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Timeframe</label>
                          <select 
                            value={newStratTimeframe}
                            onChange={(e) => setNewStratTimeframe(e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 font-medium bg-white"
                          >
                            <option value="1M">1 Minute (1M)</option>
                            <option value="5M">5 Minutes (5M)</option>
                            <option value="15M">15 Minutes (15M)</option>
                            <option value="1H">1 Hour (1H)</option>
                            <option value="1D">Daily (1D)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tags (Comma Separated)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. INTRADAY, BREAKOUT, VOLUME"
                          value={newStratTags}
                          onChange={(e) => setNewStratTags(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Strategy Description</label>
                        <textarea 
                          rows={2}
                          placeholder="Provide architectural summary of entry/exit criteria and market conditions..."
                          value={newStratDescription}
                          onChange={(e) => setNewStratDescription(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 resize-none"
                        />
                      </div>

                      {/* RULE SPECIFICATIONS EDITOR */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1.5">
                            <ListOrdered className="w-3.5 h-3.5 text-teal-600" />
                            Rule Specifications
                          </label>
                          <span className="text-[10px] font-mono font-bold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {builderRules.length} {builderRules.length === 1 ? 'Rule' : 'Rules'}
                          </span>
                        </div>

                        {ruleError && (
                          <div className="flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{ruleError}</span>
                          </div>
                        )}

                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {builderRules.length === 0 ? (
                            <div className="p-3 border border-dashed border-slate-200 rounded-lg text-center text-[11px] text-slate-400">
                              No rule conditions defined. Add at least one rule below.
                            </div>
                          ) : (
                            builderRules.map((rule, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs shadow-2xs gap-2">
                                {editingRuleIdx === idx ? (
                                  <div className="flex-1 flex items-center gap-1.5">
                                    <input 
                                      type="text"
                                      value={editingRuleText}
                                      onChange={(e) => setEditingRuleText(e.target.value)}
                                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEditRule(); }}
                                      className="flex-1 text-xs px-2 py-1 border border-teal-500 rounded bg-white font-mono"
                                      autoFocus
                                    />
                                    <button 
                                      type="button" 
                                      onClick={handleSaveEditRule} 
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                      title="Save Rule"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => { setEditingRuleIdx(null); setEditingRuleText(''); }} 
                                      className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <span className="text-[10px] font-mono text-slate-400 w-4 font-bold">{idx + 1}.</span>
                                      <span className="font-mono text-slate-800 truncate text-[11px]">{rule}</span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button 
                                        type="button" 
                                        disabled={idx === 0}
                                        onClick={() => handleMoveRule(idx, 'UP')}
                                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                                        title="Move Rule Up"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button 
                                        type="button" 
                                        disabled={idx === builderRules.length - 1}
                                        onClick={() => handleMoveRule(idx, 'DOWN')}
                                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                                        title="Move Rule Down"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                      <button 
                                        type="button" 
                                        onClick={() => handleStartEditRule(idx, rule)}
                                        className="p-1 text-slate-400 hover:text-teal-600 transition-colors"
                                        title="Edit Rule"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button 
                                        type="button" 
                                        onClick={() => setBuilderRules(prev => prev.filter((_, i) => i !== idx))}
                                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                        title="Delete Rule"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Add rule (e.g. ATR(14) > 1.5)"
                            value={newRuleInput}
                            onChange={(e) => setNewRuleInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRule(); } }}
                            className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                          />
                          <button 
                            type="button" 
                            onClick={handleAddRule}
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {editingBuilderId ? (
                          <>
                            <button 
                              type="button"
                              onClick={handleCancelEdit}
                              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded transition-colors"
                            >
                              Cancel Edit
                            </button>
                            {hasUnsavedChanges && (
                              <button 
                                type="button"
                                onClick={handleReloadStrategy}
                                className="text-xs text-amber-700 hover:bg-amber-50 font-semibold px-2 py-1 rounded border border-amber-200 transition-colors flex items-center gap-1"
                                title="Discard unsaved changes"
                              >
                                Discard / Reload
                              </button>
                            )}
                          </>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        {editingBuilderId && (
                          <button
                            type="button"
                            onClick={() => {
                              const curr = builderStrategies.find(s => s.id === editingBuilderId);
                              if (curr) handlePromptDelete(curr);
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        )}

                        <button 
                          type="submit"
                          disabled={isSavingBuilder}
                          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                        >
                          {isSavingBuilder ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              {editingBuilderId ? 'Updating...' : 'Registering...'}
                            </>
                          ) : (
                            <>
                              {editingBuilderId ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                              {editingBuilderId ? 'Update Strategy Model' : 'Register Strategy Model'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* RIGHT COLUMN: REGISTERED STRATEGIES GRID & TEMPLATES */}
                <div className="lg:col-span-7 space-y-6">
                  {/* LIVE DATABASE STRATEGIES GRID */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-teal-600" /> Registered Strategy Models Grid
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Live database-driven strategies persisted in the registry store. Click any row to load into Builder.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => refreshAllData()}
                          disabled={loading}
                          className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg border border-slate-200 transition-colors"
                          title="Refresh Database"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full">
                          {filteredBuilderStrategies.length} / {builderStrategies.length} Models
                        </span>
                      </div>
                    </div>

                    {/* SEARCH, FILTERS & SORT TOOLBAR */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-6 relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          <input 
                            type="text" 
                            placeholder="Search strategy name, ID, or rules..."
                            value={builderSearchQuery}
                            onChange={(e) => setBuilderSearchQuery(e.target.value)}
                            className="w-full text-xs pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <select 
                            value={builderCategoryFilter}
                            onChange={(e) => setBuilderCategoryFilter(e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white text-slate-700"
                          >
                            <option value="ALL">All Categories</option>
                            <option value="Trend Following">Trend Following</option>
                            <option value="Mean Reversion">Mean Reversion</option>
                            <option value="Momentum">Momentum Swings</option>
                            <option value="Statistical">Statistical Arbitrage</option>
                            <option value="Scalping">Intraday Scalper</option>
                          </select>
                        </div>
                        <div className="sm:col-span-3">
                          <select 
                            value={builderStatusFilter}
                            onChange={(e) => setBuilderStatusFilter(e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white text-slate-700"
                          >
                            <option value="ALL">All Statuses</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="READY">READY</option>
                            <option value="VALIDATED">VALIDATED</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="PUBLISHED">PUBLISHED</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-3">
                          <select 
                            value={builderRiskFilter}
                            onChange={(e) => setBuilderRiskFilter(e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white text-slate-700"
                          >
                            <option value="ALL">All Risk Levels</option>
                            <option value="LOW">LOW Risk</option>
                            <option value="MEDIUM">MEDIUM Risk</option>
                            <option value="HIGH">HIGH Risk</option>
                          </select>
                        </div>
                        <div className="sm:col-span-3">
                          <select 
                            value={builderTimeframeFilter}
                            onChange={(e) => setBuilderTimeframeFilter(e.target.value)}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white text-slate-700"
                          >
                            <option value="ALL">All Timeframes</option>
                            <option value="1M">1M</option>
                            <option value="5M">5M</option>
                            <option value="15M">15M</option>
                            <option value="1H">1H</option>
                            <option value="1D">1D</option>
                          </select>
                        </div>
                        <div className="sm:col-span-4">
                          <select 
                            value={builderSortKey}
                            onChange={(e) => setBuilderSortKey(e.target.value as any)}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white text-slate-700"
                          >
                            <option value="DATE">Sort by Date Updated</option>
                            <option value="NAME">Sort by Name</option>
                            <option value="STATUS">Sort by Status</option>
                            <option value="RISK">Sort by Risk</option>
                            <option value="CATEGORY">Sort by Category</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={() => setBuilderSortDir(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
                            className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                          >
                            {builderSortDir === 'ASC' ? '▲ Asc' : '▼ Desc'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* MULTI-SELECT BULK OPERATIONS ACTION BAR */}
                    {selectedBuilderIds.length > 0 && (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-800">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-teal-400" />
                          <span className="text-xs font-bold font-mono text-teal-300">
                            {selectedBuilderIds.length} {selectedBuilderIds.length === 1 ? 'strategy' : 'strategies'} selected
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedBuilderIds([])}
                            className="text-[10px] text-slate-400 hover:text-white underline ml-2"
                          >
                            Deselect all
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            disabled={isBulkProcessing}
                            onClick={() => handleBulkAction('VALIDATE')}
                            className="bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            Bulk Validate
                          </button>
                          <button
                            type="button"
                            disabled={isBulkProcessing}
                            onClick={() => handleBulkAction('PUBLISH')}
                            className="bg-teal-950 hover:bg-teal-900 text-teal-200 border border-teal-800 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            Bulk Publish
                          </button>
                          <button
                            type="button"
                            disabled={isBulkProcessing}
                            onClick={() => handleBulkAction('ARCHIVE')}
                            className="bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            Bulk Archive
                          </button>
                          <button
                            type="button"
                            disabled={isBulkProcessing}
                            onClick={() => handleBulkAction('RESTORE')}
                            className="bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-800 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            Bulk Restore
                          </button>
                          <button
                            type="button"
                            disabled={isBulkProcessing}
                            onClick={() => handleBulkAction('DELETE')}
                            className="bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            Bulk Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STRATEGIES GRID TABLE */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      {filteredBuilderStrategies.length > 0 && (
                        <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSelectAllFilteredBuilders}
                              className="p-0.5 text-slate-500 hover:text-teal-600 transition-colors"
                              title="Select / Deselect All Filtered"
                            >
                              {filteredBuilderStrategies.length > 0 && filteredBuilderStrategies.every(s => selectedBuilderIds.includes(s.id)) ? (
                                <CheckSquare className="w-4 h-4 text-teal-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <span>Select All Shown</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">Database Table: strategy_builders</span>
                        </div>
                      )}

                      {filteredBuilderStrategies.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                          <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                          <div className="text-xs font-semibold text-slate-600">
                            {builderStrategies.length === 0 
                              ? 'No custom strategy models registered in database yet.' 
                              : 'No strategy models match your current filter criteria.'}
                          </div>
                          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                            {builderStrategies.length === 0 
                              ? 'Use the registration form on the left to create and persist your first strategy model.' 
                              : 'Try adjusting your search keywords or resetting category and status filters.'}
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                          {filteredBuilderStrategies.map((bStrat) => {
                            const isEditingThis = editingBuilderId === bStrat.id;
                            const isChecked = selectedBuilderIds.includes(bStrat.id);
                            const rulesArr = Array.isArray(bStrat.rules) ? bStrat.rules : [];
                            return (
                              <div 
                                key={bStrat.id || bStrat.strategyId}
                                onClick={() => handleSelectForEdit(bStrat)}
                                className={`p-3.5 transition-all cursor-pointer group ${
                                  isEditingThis 
                                    ? 'bg-teal-50/80 border-l-4 border-l-teal-600' 
                                    : isChecked
                                    ? 'bg-slate-50 border-l-4 border-l-indigo-500'
                                    : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleSelectBuilder(bStrat.id, e)}
                                      className="p-0.5 text-slate-400 hover:text-teal-600 transition-colors shrink-0"
                                    >
                                      {isChecked ? (
                                        <CheckSquare className="w-4 h-4 text-teal-600" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                                      )}
                                    </button>

                                    <h3 className="font-bold text-slate-900 text-xs group-hover:text-teal-700 transition-colors">
                                      {bStrat.name}
                                    </h3>
                                    <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                      {bStrat.strategyId}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-400 hidden sm:inline" title="UUID">
                                      {bStrat.id ? `${bStrat.id.substring(0, 8)}...` : ''}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                                      bStrat.status === 'PUBLISHED' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                                      bStrat.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                      bStrat.status === 'VALIDATED' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                                      bStrat.status === 'READY' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                      bStrat.status === 'ARCHIVED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                      'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>
                                      {bStrat.status || 'DRAFT'}
                                    </span>

                                    {/* ACTION BUTTONS */}
                                    <button 
                                      type="button"
                                      onClick={(e) => handleOpenViewDetailModal(bStrat, e)}
                                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors rounded"
                                      title="Open / View Details & Rules"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>

                                    <button 
                                      type="button"
                                      onClick={(e) => handleOpenHistoryModal(bStrat, e)}
                                      className="p-1 text-slate-400 hover:text-purple-600 transition-colors rounded"
                                      title="View History Timeline"
                                    >
                                      <History className="w-3.5 h-3.5" />
                                    </button>

                                    <button 
                                      type="button"
                                      onClick={(e) => handleCloneStrategy(bStrat, e)}
                                      className="p-1 text-slate-400 hover:text-teal-600 transition-colors rounded"
                                      title="Clone / Duplicate Strategy"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>

                                    <button 
                                      type="button"
                                      onClick={(e) => handleArchiveToggle(bStrat, e)}
                                      className="p-1 text-slate-400 hover:text-amber-600 transition-colors rounded"
                                      title={bStrat.status === 'ARCHIVED' ? 'Restore Strategy' : 'Archive Strategy'}
                                    >
                                      <Archive className="w-3.5 h-3.5" />
                                    </button>

                                    <button 
                                      type="button" 
                                      onClick={(e) => handlePromptDelete(bStrat, e)}
                                      className="p-1 text-slate-300 hover:text-rose-600 transition-colors rounded"
                                      title="Delete Strategy"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {bStrat.description && (
                                  <p className="text-[11px] text-slate-500 mb-2 line-clamp-1">{bStrat.description}</p>
                                )}

                                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {bStrat.category}
                                    </span>
                                    <span className="bg-slate-50 text-slate-600 px-1 py-0.5 rounded border border-slate-200">
                                      {bStrat.marketType || 'EQUITY'} · {bStrat.instrumentType || 'SPOT'}
                                    </span>
                                    <span className="bg-slate-50 text-slate-600 px-1 py-0.5 rounded border border-slate-200">
                                      {bStrat.timeframe || '15M'}
                                    </span>
                                    <span className={`px-1 py-0.5 rounded font-bold ${
                                      bStrat.riskLevel === 'HIGH' ? 'text-rose-700 bg-rose-50' :
                                      bStrat.riskLevel === 'LOW' ? 'text-emerald-700 bg-emerald-50' :
                                      'text-amber-700 bg-amber-50'
                                    }`}>
                                      {bStrat.riskLevel || 'MEDIUM'}
                                    </span>
                                    <span>v{bStrat.version || '1.0.0'}</span>
                                    <span>{rulesArr.length} {rulesArr.length === 1 ? 'rule' : 'rules'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-slate-400 shrink-0">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(bStrat.updatedTime || bStrat.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PRECONFIGURED SYSTEM STRATEGY TEMPLATES */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-600" /> System Certified Strategy Reference Library
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-1">
                      {libraryItems.map((libItem) => (
                        <div 
                          key={libItem.id}
                          className="border border-slate-200 rounded-xl p-3 hover:border-indigo-300 transition-all bg-slate-50/40"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-slate-900 text-xs truncate">{libItem.name}</h3>
                            <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full uppercase shrink-0">
                              {libItem.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{libItem.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {activeTab === 'INSPECTOR' && (
            <motion.div 
              key="inspector"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* PIPELINE INSPECTOR CONTROL */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ListOrdered className="w-5 h-5 text-teal-600" /> Strategy Pipeline Inspector (Module 12)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Audit previous evaluation scores, structural verification diagnostics, and real-time rank orders.
                    </p>
                  </div>
                </div>

                {/* HISTORICAL EVALUATIONS */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Historical Evaluation Outputs (Module 5)</h3>
                  {evaluations.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                      No evaluation history matches current session logs. Run pipeline executions to produce evaluations.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {evaluations.map((ev) => {
                        const strat = strategies.find(s => s.id === ev.strategyId);
                        return (
                          <div key={ev.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/30 text-xs space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{strat?.name || ev.strategyId}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  ev.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  Score: {ev.score}%
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-100 font-mono text-[10px]">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Market Open Status:</span>
                                <span className={ev.marketStatusValid ? 'text-emerald-600 font-bold' : 'text-rose-500'}>
                                  {ev.marketStatusValid ? 'VALID' : 'INVALID'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">EP06 Fact Context:</span>
                                <span className={ev.contextValid ? 'text-emerald-600 font-bold' : 'text-rose-500'}>
                                  {ev.contextValid ? 'VERIFIED' : 'FAILED'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">EP07 Reason Matrix:</span>
                                <span className={ev.reasoningValid ? 'text-emerald-600 font-bold' : 'text-rose-500'}>
                                  {ev.reasoningValid ? 'MAPPED' : 'EMPTY'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Confidence Score:</span>
                                <span className={ev.confidenceValid ? 'text-emerald-600 font-bold' : 'text-rose-500'}>
                                  {ev.confidenceValid ? 'SECURED' : 'UNSTABLE'}
                                </span>
                              </div>
                            </div>

                            <div className="text-[10px] text-slate-400 flex items-center justify-between">
                              <span>EVAL_ID: {ev.id}</span>
                              <span>Timestamp: {new Date(ev.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CURRENT RANKS LIST */}
                <div className="space-y-4 mt-6 border-t border-slate-100 pt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Strategy Rankings (Module 6)</h3>
                  {rankings.length === 0 ? (
                    <div className="text-slate-500 text-xs italic">
                      Execute a ranking update to generate ranking lists.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <div className="bg-slate-50/50 px-4 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider grid grid-cols-5 gap-4">
                        <span>Rank</span>
                        <span className="col-span-2">Strategy Model</span>
                        <span>Comp Score</span>
                        <span>Priority Level</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {rankings.map((rank) => {
                          const strat = strategies.find(s => s.id === rank.strategyId);
                          return (
                            <div key={rank.id} className="px-4 py-3 text-xs grid grid-cols-5 gap-4 items-center">
                              <span className="font-bold text-slate-800 font-mono">#{rank.rankOrder}</span>
                              <span className="col-span-2 font-semibold text-slate-950">{strat?.name || rank.strategyId}</span>
                              <span className="font-mono text-teal-600 font-semibold">{rank.score}%</span>
                              <span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  rank.priority === 1 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  Priority {rank.priority}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'AUDIT' && (
            <motion.div 
              key="audit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* AUDIT LOG COMPONENT */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-indigo-600" /> Secure Append-Only Audit Ledger (Module 11)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Cryptographically tracked SHA-256 state blocks representing changes to strategy configurations, evaluations, and trade candidate generations.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {audits.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No security audit ledger recorded yet. Any status change or parameter modification will generate ledger entries.
                    </div>
                  ) : (
                    audits.map((item) => (
                      <div 
                        key={item.id}
                        className="bg-slate-950 text-slate-300 font-mono text-[10px] p-3 rounded-lg border border-slate-800 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                          <span className="text-indigo-400 uppercase font-bold">[{item.auditType}] State Ledger Commit</span>
                          <span className="text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2">
                          <div className="flex-1 text-[9px] text-slate-400 select-all">
                            SHA-256 HASH: <span className="text-emerald-400">{item.hash}</span>
                          </div>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded text-[9px] text-slate-300 overflow-x-auto max-h-24">
                          {JSON.stringify(item.content, null, 2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW DETAIL INSPECTOR MODAL */}
        <AnimatePresence>
          {viewingDetailItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden"
              >
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-teal-400" />
                    <h3 className="font-bold text-sm">Strategy Detail Inspector</h3>
                  </div>
                  <button
                    onClick={() => setViewingDetailItem(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{viewingDetailItem.name}</h2>
                      <p className="text-slate-500 font-mono text-[11px] mt-0.5">ID: {viewingDetailItem.strategyId} | UUID: {viewingDetailItem.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                      viewingDetailItem.status === 'PUBLISHED' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                      viewingDetailItem.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      viewingDetailItem.status === 'VALIDATED' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {viewingDetailItem.status || 'DRAFT'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Category</span>
                      <span className="font-bold text-slate-800">{viewingDetailItem.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Risk Level</span>
                      <span className="font-bold text-slate-800">{viewingDetailItem.riskLevel || 'MEDIUM'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Timeframe</span>
                      <span className="font-bold text-slate-800">{viewingDetailItem.timeframe || '15M'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Market / Instrument</span>
                      <span className="font-bold text-slate-800">{viewingDetailItem.marketType || 'EQUITY'} · {viewingDetailItem.instrumentType || 'SPOT'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Version</span>
                      <span className="font-bold text-teal-700">v{viewingDetailItem.version || '1.0.0'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Approval</span>
                      <span className="font-bold text-slate-800">{viewingDetailItem.approvalStatus || 'PENDING'}</span>
                    </div>
                  </div>

                  {viewingDetailItem.sha256Reference && (
                    <div className="bg-slate-950 text-slate-300 p-3 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1">
                      <div className="flex items-center gap-1.5 text-teal-400 font-bold">
                        <Hash className="w-3.5 h-3.5" /> SHA-256 Cryptographic Hash Reference
                      </div>
                      <div className="text-emerald-400 break-all select-all font-semibold">
                        {viewingDetailItem.sha256Reference}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Description</h4>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {viewingDetailItem.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-1.5">Rule Specifications ({Array.isArray(viewingDetailItem.rules) ? viewingDetailItem.rules.length : 0})</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {Array.isArray(viewingDetailItem.rules) && viewingDetailItem.rules.length > 0 ? (
                        viewingDetailItem.rules.map((rule, idx) => (
                          <div key={idx} className="bg-white border border-slate-200 p-2 rounded-lg font-mono text-[11px] flex items-center gap-2">
                            <span className="text-teal-600 font-bold">#{idx + 1}</span>
                            <span className="text-slate-800">{rule}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 italic">No rules defined.</div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Created By: {viewingDetailItem.createdBy || 'SYSTEM'}</span>
                    <span>Updated: {new Date(viewingDetailItem.updatedTime || viewingDetailItem.createdTime).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setViewingDetailItem(null)}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    Close Inspector
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* HISTORY TIMELINE MODAL */}
        <AnimatePresence>
          {viewingHistoryId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden"
              >
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-sm">Strategy Audit & History Timeline</h3>
                  </div>
                  <button
                    onClick={() => { setViewingHistoryId(null); setHistoryTimeline([]); }}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  <div className="border-b border-slate-100 pb-2">
                    <h2 className="text-sm font-bold text-slate-900">{viewingHistoryName}</h2>
                    <p className="text-[11px] text-slate-500 font-mono">Database History Records (strategy_builder_history)</p>
                  </div>

                  {isLoadingHistory ? (
                    <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                      Loading history timeline from database...
                    </div>
                  ) : historyTimeline.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-xs">
                      No history timeline snapshots logged for this strategy yet.
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pl-4 my-2">
                      {historyTimeline.map((item, idx) => (
                        <div key={item.id || idx} className="relative group">
                          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-purple-600 border-2 border-white ring-2 ring-purple-100" />
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                            <div className="flex items-center justify-between font-mono text-[10px]">
                              <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                {item.reason || 'Database Snapshot'}
                              </span>
                              <span className="text-slate-500">
                                {new Date(item.createdTime).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-[11px] font-medium text-slate-700">
                              User / Operator: <span className="font-mono text-slate-900 font-bold">{item.userId || 'SYSTEM'}</span>
                            </div>
                            {item.snapshot && (
                              <details className="text-[10px] font-mono text-slate-600 bg-white p-2 rounded border border-slate-200 cursor-pointer">
                                <summary className="font-semibold text-purple-700 hover:underline">View Snapshot Payload</summary>
                                <pre className="mt-2 whitespace-pre-wrap overflow-x-auto text-[9px] text-slate-800 bg-slate-950 text-emerald-400 p-2 rounded">
                                  {JSON.stringify(item.snapshot, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => { setViewingHistoryId(null); setHistoryTimeline([]); }}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    Close History
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* CREATE STRATEGY TEMPLATE MODAL */}
          {isCreateTplModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">Register Strategy Template</h3>
                      <p className="text-xs text-slate-400">Create a reusable institutional strategy template record in database</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCreateTplModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateTemplate} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                  {tplFormError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{tplFormError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-700">Template Name *</label>
                      <input
                        type="text"
                        value={newTplName}
                        onChange={(e) => setNewTplName(e.target.value)}
                        placeholder="e.g., Institutional Volume Breakout Alpha"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-700">Description *</label>
                      <textarea
                        value={newTplDesc}
                        onChange={(e) => setNewTplDesc(e.target.value)}
                        placeholder="Describe trading mechanism, indicators, and market edge..."
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Category</label>
                      <select
                        value={newTplCat}
                        onChange={(e) => setNewTplCat(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="Trend Following">Trend Following</option>
                        <option value="Mean Reversion">Mean Reversion</option>
                        <option value="Volatility Breakout">Volatility Breakout</option>
                        <option value="Liquidity Arbitrage">Liquidity Arbitrage</option>
                        <option value="Statistical Arbitrage">Statistical Arbitrage</option>
                        <option value="Market Making">Market Making</option>
                        <option value="Algorithmic Execution">Algorithmic Execution</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Market Type</label>
                      <select
                        value={newTplMarket}
                        onChange={(e) => setNewTplMarket(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="EQUITY">EQUITY</option>
                        <option value="CRYPTO">CRYPTO</option>
                        <option value="FOREX">FOREX</option>
                        <option value="COMMODITY">COMMODITY</option>
                        <option value="DERIVATIVES">DERIVATIVES</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Instrument Type</label>
                      <select
                        value={newTplInst}
                        onChange={(e) => setNewTplInst(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="SPOT">SPOT</option>
                        <option value="FUTURES">FUTURES</option>
                        <option value="OPTIONS">OPTIONS</option>
                        <option value="SWAP">SWAP</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Risk Level</label>
                      <select
                        value={newTplRisk}
                        onChange={(e) => setNewTplRisk(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Timeframe</label>
                      <select
                        value={newTplTimeframe}
                        onChange={(e) => setNewTplTimeframe(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="1M">1M</option>
                        <option value="5M">5M</option>
                        <option value="15M">15M</option>
                        <option value="1H">1H</option>
                        <option value="1D">1D</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Difficulty</label>
                      <select
                        value={newTplDifficulty}
                        onChange={(e) => setNewTplDifficulty(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                      >
                        <option value="BEGINNER">BEGINNER</option>
                        <option value="INTERMEDIATE">INTERMEDIATE</option>
                        <option value="ADVANCED">ADVANCED</option>
                        <option value="INSTITUTIONAL">INSTITUTIONAL</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-700">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={newTplTags}
                        onChange={(e) => setNewTplTags(e.target.value)}
                        placeholder="ALPHA, QUANT, VOLUME"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Validation Rules Section */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800">Validation Rules ({newTplRules.length})</label>
                      <span className="text-[10px] text-slate-500">Each rule is checked during evaluation</span>
                    </div>

                    <div className="space-y-1.5">
                      {newTplRules.map((rule, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700">
                          <span className="truncate">{rule}</span>
                          <button
                            type="button"
                            onClick={() => setNewTplRules(newTplRules.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-600 ml-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newTplRuleInput}
                        onChange={(e) => setNewTplRuleInput(e.target.value)}
                        placeholder="Add rule e.g. Volume > 1.5 * 20 SMA"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTplRuleInput.trim()) {
                              setNewTplRules([...newTplRules, newTplRuleInput.trim()]);
                              setNewTplRuleInput('');
                            }
                          }
                        }}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newTplRuleInput.trim()) {
                            setNewTplRules([...newTplRules, newTplRuleInput.trim()]);
                            setNewTplRuleInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                      >
                        Add Rule
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateTplModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingTpl}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSavingTpl ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Register Template
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* IMPORT TEMPLATE MODAL */}
          {isImportTplModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
              >
                <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-base">Import Strategy Template Package</h3>
                  </div>
                  <button onClick={() => setIsImportTplModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleImportTemplate} className="p-6 space-y-4">
                  <p className="text-xs text-slate-600">
                    Paste a valid JSON template payload exported from AI ARINA or compliant schema:
                  </p>
                  <textarea
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder='{"name": "My Template", "description": "...", "category": "Trend Following", "rules": ["RSI < 30"]}'
                    rows={8}
                    className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50"
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsImportTplModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" /> Import Package
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* DETAIL INSPECTOR MODAL */}
          {selectedTemplateForDetail && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded">
                        {selectedTemplateForDetail.templateId}
                      </span>
                      <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded uppercase">
                        {selectedTemplateForDetail.tier || 'CORE'} TIER
                      </span>
                      <span className="text-xs font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded uppercase">
                        {selectedTemplateForDetail.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-base">{selectedTemplateForDetail.name}</h3>
                  </div>
                  <button onClick={() => setSelectedTemplateForDetail(null)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Description</h4>
                    <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {selectedTemplateForDetail.description}
                    </p>
                  </div>

                  {/* Certified Performance Scorecard Grid */}
                  {selectedTemplateForDetail.winRate !== undefined && (
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-600" /> Institutional Certified Performance Metrics
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-950 text-white p-3 rounded-xl font-mono text-center">
                        <div className="p-2 bg-slate-900 rounded-lg">
                          <span className="text-[9px] text-slate-400 block">WIN RATE</span>
                          <span className="font-bold text-emerald-400 text-sm">{selectedTemplateForDetail.winRate}%</span>
                        </div>
                        <div className="p-2 bg-slate-900 rounded-lg">
                          <span className="text-[9px] text-slate-400 block">PROFIT FACTOR</span>
                          <span className="font-bold text-teal-300 text-sm">{selectedTemplateForDetail.profitFactor}</span>
                        </div>
                        <div className="p-2 bg-slate-900 rounded-lg">
                          <span className="text-[9px] text-slate-400 block">MAX DRAWDOWN</span>
                          <span className="font-bold text-rose-400 text-sm">{selectedTemplateForDetail.maxDrawdown}%</span>
                        </div>
                        <div className="p-2 bg-slate-900 rounded-lg">
                          <span className="text-[9px] text-slate-400 block">SHARPE RATIO</span>
                          <span className="font-bold text-purple-300 text-sm">{selectedTemplateForDetail.sharpeRatio}</span>
                        </div>
                        <div className="p-2 bg-slate-900 rounded-lg">
                          <span className="text-[9px] text-slate-400 block">AI COMPATIBILITY</span>
                          <span className="font-bold text-amber-300 text-sm">{selectedTemplateForDetail.aiCompatibilityScore}/100</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Philosophies */}
                  {(selectedTemplateForDetail.entryPhilosophy || selectedTemplateForDetail.riskPhilosophy) && (
                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-900">Trading & Risk Philosophy Framework</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                          <span className="font-bold text-indigo-700 block">Entry Philosophy</span>
                          <p className="text-slate-600 leading-normal">{selectedTemplateForDetail.entryPhilosophy || 'N/A'}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                          <span className="font-bold text-emerald-700 block">Exit Philosophy</span>
                          <p className="text-slate-600 leading-normal">{selectedTemplateForDetail.exitPhilosophy || 'N/A'}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                          <span className="font-bold text-rose-700 block">Risk Philosophy</span>
                          <p className="text-slate-600 leading-normal">{selectedTemplateForDetail.riskPhilosophy || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Market</span>
                      <span className="font-bold text-slate-800">{selectedTemplateForDetail.marketType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Instrument</span>
                      <span className="font-bold text-slate-800">{selectedTemplateForDetail.instrumentType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Risk Level</span>
                      <span className="font-bold text-slate-800">{selectedTemplateForDetail.riskLevel}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Timeframe</span>
                      <span className="font-bold text-slate-800">{selectedTemplateForDetail.timeframe}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center justify-between">
                      <span>Validation Rule Expressions</span>
                      <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {selectedTemplateForDetail.rules.length} Rules
                      </span>
                    </h4>
                    <div className="space-y-1.5 bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs">
                      {selectedTemplateForDetail.rules.map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-slate-500 font-bold">{idx + 1}.</span>
                          <span className="text-emerald-400">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedTemplateForDetail.sha256Reference && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                        <Hash className="w-3 h-3 text-indigo-600" /> SHA-256 Audit Reference
                      </span>
                      <p className="font-mono text-[11px] text-slate-600 break-all select-all">
                        {selectedTemplateForDetail.sha256Reference}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Author: <span className="font-bold text-slate-700">{selectedTemplateForDetail.author}</span> | Version: <span className="font-bold text-slate-700">v{selectedTemplateForDetail.version}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const tpl = selectedTemplateForDetail;
                        setSelectedTemplateForDetail(null);
                        handleUseTemplate(tpl);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" /> Use Template
                    </button>
                    <button
                      onClick={() => setSelectedTemplateForDetail(null)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* TEMPLATE VERSION & AUDIT HISTORY MODAL */}
          {selectedTemplateForHistory && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <History className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="font-bold text-base">Template Version & Audit History</h3>
                      <p className="text-xs text-slate-400">{selectedTemplateForHistory.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTemplateForHistory(null)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                  {isLoadingTplHistory ? (
                    <div className="p-12 text-center text-slate-500 space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                      <p>Loading template history from database...</p>
                    </div>
                  ) : tplHistoryLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      No version history logs registered for this template.
                    </div>
                  ) : (
                    <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                      {tplHistoryLogs.map((log, idx) => (
                        <div key={idx} className="relative pl-8 space-y-1">
                          <span className="absolute left-2 top-1.5 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white ring-2 ring-indigo-100" />
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 uppercase">{log.action || 'UPDATE'}</span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {new Date(log.created_time || log.timestamp || Date.now()).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-slate-600">{log.summary || log.message || 'Template record modified.'}</p>
                            {log.user_id && (
                              <p className="font-mono text-[10px] text-slate-400">By User: {log.user_id}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setSelectedTemplateForHistory(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Close History
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* DELETE CONFIRMATION MODAL */}
          {isDeletingTplConfirmId && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4"
              >
                <div className="flex items-center gap-3 text-rose-600">
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Delete Strategy Template</h3>
                    <p className="text-xs text-slate-500">Database deletion action</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete template <strong className="text-slate-900">"{isDeletingTplConfirmName}"</strong> from the repository?
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsDeletingTplConfirmId(null);
                      setIsDeletingTplConfirmName(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDeleteTemplate}
                    disabled={isDeletingTpl}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isDeletingTpl ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Delete Template
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
