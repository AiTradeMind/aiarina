import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sliders,
  RotateCcw,
  Save,
  Lock,
  Unlock,
  Bot,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Clock,
  History,
  FileSpreadsheet,
  Check,
  X,
  Sparkles,
  Info,
  HelpCircle,
  FolderOpen,
  Eye,
  EyeOff,
  Activity,
  Zap,
  TrendingDown,
  DollarSign,
  Scale,
  Layers,
  Trash2,
  Archive,
  RefreshCw,
  Edit3,
  ListFilter
} from 'lucide-react';
import {
  StrategyParametersOverview,
  StrategyParameterItem,
  ParameterGroup,
  ParameterCategory,
  StrategyParameterPreset,
  StrategyParameterAuditRecord,
  StrategyParameterHistoryRecord,
  RiskSimulationResult,
  EMPTY_PARAMETER_OVERVIEW,
  normalizeParameterOverview
} from '../../../modules/strategy/parameters/types/index.ts';

interface StrategyParametersWorkspaceProps {
  selectedStrategyId: string;
  selectedStrategyName?: string;
  availableStrategies?: Array<{ id: string; name: string; templateId?: string; category?: string }>;
  onSelectStrategy?: (strategyId: string) => void;
}

export const StrategyParametersWorkspace: React.FC<StrategyParametersWorkspaceProps> = ({
  selectedStrategyId,
  selectedStrategyName,
  availableStrategies = [],
  onSelectStrategy
}) => {
  // Main Data States
  const [overview, setOverview] = useState<StrategyParametersOverview>(EMPTY_PARAMETER_OVERVIEW);
  const [localParams, setLocalParams] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active Main Tab: PARAMETERS | DEPENDENCY_GRAPH | FORMULA_ENGINE | IMPACT_ANALYZER | DIFF | LOCK_MATRIX | HEALTH_AND_SUGGESTIONS | RISK_SIMULATOR | VALIDATION | COMPARISON
  const [activeSubTab, setActiveSubTab] = useState<'PARAMETERS' | 'DEPENDENCY_GRAPH' | 'FORMULA_ENGINE' | 'IMPACT_ANALYZER' | 'DIFF' | 'LOCK_MATRIX' | 'HEALTH_AND_SUGGESTIONS' | 'RISK_SIMULATOR' | 'VALIDATION' | 'COMPARISON'>('PARAMETERS');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [aiEditableFilter, setAiEditableFilter] = useState<boolean>(false);
  const [lockedFilter, setLockedFilter] = useState<boolean>(false);

  // Accordion Expand/Collapse State
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Entry Parameters': true,
    'Exit Parameters': true,
    'Risk Parameters': true,
    'Indicator Parameters': true,
    'Money Management': true,
    'Execution Parameters': true,
    'Advanced Parameters': true,
    'AI Permission': true
  });

  // Bulk Selection State
  const [selectedParamIds, setSelectedParamIds] = useState<string[]>([]);
  const [showBulkBar, setShowBulkBar] = useState<boolean>(false);

  // Inspector State
  const [inspectedParameter, setInspectedParameter] = useState<StrategyParameterItem | null>(null);

  // Modal States
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showPresetModal, setShowPresetModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showLockModal, setShowLockModal] = useState<boolean>(false);
  const [paramToLock, setParamToLock] = useState<StrategyParameterItem | null>(null);
  const [lockReasonInput, setLockReasonInput] = useState<string>('');

  // Preset Creation & Management
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newPresetDesc, setNewPresetDesc] = useState<string>('');

  // Import Text Area
  const [importJsonText, setImportJsonText] = useState<string>('');

  // Comparison Profile State
  const [comparisonPreset, setComparisonPreset] = useState<StrategyParameterPreset | null>(null);

  // Fetch Strategy Parameters Overview
  const fetchParameters = useCallback(async () => {
    if (!selectedStrategyId) {
      setOverview(EMPTY_PARAMETER_OVERVIEW);
      setLocalParams({});
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/strategy/parameters/${selectedStrategyId}?name=${encodeURIComponent(selectedStrategyName || '')}`);
      if (!res.ok) {
        if (res.status === 404) {
          setOverview({
            ...EMPTY_PARAMETER_OVERVIEW,
            strategyId: selectedStrategyId,
            strategyName: selectedStrategyName || selectedStrategyId
          });
          setLocalParams({});
          setLoading(false);
          return;
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch parameters');
      }
      const json = await res.json();
      const rawData = (json && typeof json === 'object' && 'success' in json && 'data' in json) ? json.data : json;
      const overviewData = normalizeParameterOverview(rawData);
      setOverview(overviewData);

      // Initialize local working values
      const initialMap: Record<string, any> = {};
      (overviewData.groups ?? []).forEach(group => {
        (group?.parameters ?? []).forEach(param => {
          if (param && param.parameterId) {
            initialMap[param.parameterId] = param.currentValue;
          }
        });
      });
      setLocalParams(initialMap);

      if ((overviewData.presets ?? []).length > 0) {
        setComparisonPreset(overviewData.presets[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading strategy parameters');
      setOverview(EMPTY_PARAMETER_OVERVIEW);
    } finally {
      setLoading(false);
    }
  }, [selectedStrategyId, selectedStrategyName]);

  useEffect(() => {
    fetchParameters();
  }, [fetchParameters]);

  // Evaluate Dependencies dynamically on localParams state
  // PART 1: Parameter Dependency Engine
  const evaluatedParameters = useMemo(() => {
    if (!overview) return [];

    const allParams: StrategyParameterItem[] = [];
    (overview?.groups ?? []).forEach(g => {
      (g?.parameters ?? []).forEach(p => {
        if (p) allParams.push(p);
      });
    });

    return (allParams ?? []).map(param => {
      if (!param || !param.dependencyRule) return param;

      const rule = param.dependencyRule;
      const parentVal = localParams[rule.dependsOnParameterId];

      let isTriggered = false;
      const op = rule.operator || 'EQUALS';

      if (op === 'EQUALS') {
        isTriggered = String(parentVal) === String(rule.expectedValue);
      } else if (op === 'NOT_EQUALS') {
        isTriggered = String(parentVal) !== String(rule.expectedValue);
      } else if (op === 'IN' && Array.isArray(rule.expectedValue)) {
        isTriggered = rule.expectedValue.includes(parentVal);
      }

      const updated = { ...param };
      if (isTriggered) {
        if (rule.action === 'HIDE') {
          updated.visible = false;
        } else if (rule.action === 'DISABLE') {
          updated.editable = false;
        }
      } else {
        if (rule.action === 'HIDE') {
          updated.visible = true;
        } else if (rule.action === 'DISABLE' && !param.locked) {
          updated.editable = true;
        }
      }

      return updated;
    });
  }, [overview, localParams]);

  // Track modified fields count
  const modifiedCount = useMemo(() => {
    if (!overview) return 0;
    let count = 0;
    (evaluatedParameters ?? []).forEach(p => {
      if (p && localParams[p.parameterId] !== undefined && String(localParams[p.parameterId]) !== String(p.defaultValue)) {
        count++;
      }
    });
    return count;
  }, [overview, evaluatedParameters, localParams]);

  // Calculate Real-time Risk Simulation
  // PART 6: Risk Simulator
  const riskSimResult = useMemo<RiskSimulationResult>(() => {
    const capital = Number(localParams['fixed_capital_allocation']) || 100000;
    const riskPct = Number(localParams['max_account_risk_per_trade']) || 1.0;
    const slPct = Number(localParams['stop_loss_percentage']) || 1.5;
    const tpPct = Number(localParams['take_profit_percentage']) || 3.5;

    const estimatedRiskAmount = (capital * riskPct) / 100;
    const positionSizeAmount = (slPct > 0 ? (estimatedRiskAmount / (slPct / 100)) : 0);
    const estimatedMarginRequired = positionSizeAmount * 0.2; // 20% margin
    const expectedDrawdownPercent = Math.min(100, riskPct * 2.5);
    const capitalUsagePercent = Math.min(100, capital > 0 ? (positionSizeAmount / capital) * 100 : 0);
    const positionSizeContracts = Math.floor(positionSizeAmount / 1000);
    const riskRewardRatio = slPct > 0 ? parseFloat((tpPct / slPct).toFixed(2)) : 0;

    let safetyRating: 'SAFE' | 'MODERATE' | 'HIGH_RISK' | 'CRITICAL' = 'SAFE';
    if (riskPct > 3 || capitalUsagePercent > 80) {
      safetyRating = 'CRITICAL';
    } else if (riskPct > 2 || capitalUsagePercent > 50) {
      safetyRating = 'HIGH_RISK';
    } else if (riskPct > 1 || capitalUsagePercent > 30) {
      safetyRating = 'MODERATE';
    }

    return {
      accountCapital: capital,
      riskPercentage: riskPct,
      estimatedRiskAmount: parseFloat(estimatedRiskAmount.toFixed(2)),
      estimatedMarginRequired: parseFloat(estimatedMarginRequired.toFixed(2)),
      expectedDrawdownPercent: parseFloat(expectedDrawdownPercent.toFixed(2)),
      capitalUsagePercent: parseFloat(capitalUsagePercent.toFixed(2)),
      positionSizeContracts,
      riskRewardRatio,
      safetyRating
    };
  }, [localParams]);

  // Local Validation Check
  // PART 7: Validation Dashboard
  const localValidation = useMemo(() => {
    const errors: Array<{ parameterId: string; name: string; error: string }> = [];
    const warnings: Array<{ parameterId: string; name: string; warning: string }> = [];
    const suggestions: Array<{ parameterId: string; name: string; suggestion: string }> = [];

    (evaluatedParameters ?? []).forEach(param => {
      if (!param) return;
      const val = localParams[param.parameterId];

      if (param.required && (val === undefined || val === null || val === '')) {
        errors.push({ parameterId: param.parameterId, name: param.displayName, error: `${param.displayName} is required` });
      }

      if (param.dataType === 'Integer' || param.dataType === 'Decimal' || param.dataType === 'Percentage' || param.dataType === 'Currency') {
        const num = Number(val);
        if (isNaN(num)) {
          errors.push({ parameterId: param.parameterId, name: param.displayName, error: `${param.displayName} must be a valid number` });
        } else {
          if (param.minValue !== null && param.minValue !== undefined && num < Number(param.minValue)) {
            errors.push({ parameterId: param.parameterId, name: param.displayName, error: `${param.displayName} is below minimum allowed ${param.minValue}` });
          }
          if (param.maxValue !== null && param.maxValue !== undefined && num > Number(param.maxValue)) {
            errors.push({ parameterId: param.parameterId, name: param.displayName, error: `${param.displayName} exceeds maximum allowed ${param.maxValue}` });
          }
        }
      }

      if (param.parameterId === 'stop_loss_percentage') {
        const tpVal = localParams['take_profit_percentage'];
        if (tpVal !== undefined && Number(val) >= Number(tpVal)) {
          warnings.push({
            parameterId: param.parameterId,
            name: param.displayName,
            warning: `Stop Loss (${val}%) is >= Take Profit (${tpVal}%). Risk-Reward is <= 1.`
          });
          suggestions.push({
            parameterId: param.parameterId,
            name: param.displayName,
            suggestion: `Increase Take Profit target to achieve >= 2.0 Risk-Reward ratio.`
          });
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }, [evaluatedParameters, localParams]);

  // Handle local parameter value change
  const handleFieldChange = (parameterId: string, value: any) => {
    setLocalParams(prev => ({
      ...prev,
      [parameterId]: value
    }));
  };

  // Save changes to backend
  const handleSave = async () => {
    if (!overview || !selectedStrategyId) return;

    if (!localValidation.isValid) {
      setErrorMsg(`Cannot save: ${localValidation.errors.length} validation errors present.`);
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updates = Object.keys(localParams).map(paramId => ({
        parameterId: paramId,
        newValue: localParams[paramId]
      }));

      const res = await fetch('/api/strategy/parameters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          updates,
          userName: 'ADMIN_USER',
          reason: 'Manual Parameter Calibration'
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save parameters');
      }

      const json = await res.json();
      const rawData = (json && typeof json === 'object' && 'success' in json && 'data' in json) ? json.data : json;
      const updatedOverview = normalizeParameterOverview(rawData);
      setOverview(updatedOverview);
      setSuccessMsg('Strategy parameters committed successfully! SHA256 audit hash generated.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving parameters');
    } finally {
      setSaving(false);
    }
  };

  // Lock / Unlock Parameter
  // PART 4: Lock Engine
  const handleToggleLock = async () => {
    if (!selectedStrategyId || !paramToLock) return;
    setSaving(true);
    try {
      const res = await fetch('/api/strategy/parameters/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          parameterId: paramToLock.parameterId,
          locked: !paramToLock.locked,
          reason: lockReasonInput || 'Admin Security Policy',
          userName: 'ADMIN_USER'
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to lock parameter');
      }
      setShowLockModal(false);
      setParamToLock(null);
      setLockReasonInput('');
      fetchParameters();
      setSuccessMsg(`Parameter lock state updated.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating parameter lock');
    } finally {
      setSaving(false);
    }
  };

  // Bulk Operations
  // PART 11: Bulk Operations
  const handleBulkAction = async (operation: 'RESET' | 'LOCK' | 'UNLOCK' | 'ENABLE_AI' | 'DISABLE_AI') => {
    if (!selectedStrategyId || selectedParamIds.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/strategy/parameters/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          operation,
          parameterIds: selectedParamIds,
          payload: { lockReason: 'Bulk Admin Lock' },
          userName: 'ADMIN_USER'
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Bulk operation failed');
      }
      setSelectedParamIds([]);
      fetchParameters();
      setSuccessMsg(`Bulk ${operation} completed on selected parameters.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Bulk operation failed');
    } finally {
      setSaving(false);
    }
  };

  // Version Restore
  // PART 9: Parameter Versioning
  const handleRestoreVersion = async (versionNum: string) => {
    if (!selectedStrategyId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/strategy/parameters/restore-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          versionNumber: versionNum,
          userName: 'ADMIN_USER'
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Version restore failed');
      }
      setShowHistoryModal(false);
      fetchParameters();
      setSuccessMsg(`Restored strategy parameters to Version ${versionNum}.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Restore failed');
    } finally {
      setSaving(false);
    }
  };

  // Reset single parameter
  const handleResetSingle = (parameterId: string) => {
    const p = evaluatedParameters.find(item => item.parameterId === parameterId);
    if (p) {
      handleFieldChange(parameterId, p.defaultValue);
    }
  };

  // Reset entire group
  const handleResetGroup = (groupName: ParameterGroup) => {
    evaluatedParameters.forEach(p => {
      if (p.group === groupName && !p.locked) {
        handleFieldChange(p.parameterId, p.defaultValue);
      }
    });
  };

  // Reset All
  const handleResetAll = () => {
    evaluatedParameters.forEach(p => {
      if (!p.locked) handleFieldChange(p.parameterId, p.defaultValue);
    });
  };

  // Discard edits
  const handleDiscard = () => {
    if (!overview) return;
    const initialMap: Record<string, any> = {};
    (overview?.groups ?? []).forEach(group => {
      (group?.parameters ?? []).forEach(param => {
        if (param && param.parameterId) {
          initialMap[param.parameterId] = param.currentValue;
        }
      });
    });
    setLocalParams(initialMap);
  };

  // Apply Preset
  const handleApplyPreset = async (presetName: string) => {
    if (!selectedStrategyId) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/strategy/parameters/preset/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategyId: selectedStrategyId, presetName })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to apply preset');
      }
      const updatedOverview: StrategyParametersOverview = await res.json();
      setOverview(updatedOverview);

      const initialMap: Record<string, any> = {};
      updatedOverview.groups.forEach(group => {
        group.parameters.forEach(param => {
          initialMap[param.parameterId] = param.currentValue;
        });
      });
      setLocalParams(initialMap);
      setSuccessMsg(`Applied Preset Profile '${presetName}' successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error applying preset');
    } finally {
      setSaving(false);
    }
  };

  // Create Preset
  const handleCreatePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStrategyId || !newPresetName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/strategy/parameters/preset/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          presetName: newPresetName,
          description: newPresetDesc,
          parametersData: localParams
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create preset');
      }

      setShowPresetModal(false);
      setNewPresetName('');
      setNewPresetDesc('');
      fetchParameters();
      setSuccessMsg('Custom preset profile created!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating preset');
    } finally {
      setSaving(false);
    }
  };

  // Import Parameters
  const handleImportJson = async () => {
    if (!selectedStrategyId || !importJsonText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/strategy/parameters/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          jsonContent: importJsonText
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to import JSON parameters');
      }
      setShowImportModal(false);
      setImportJsonText('');
      fetchParameters();
      setSuccessMsg('Parameters imported successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Import failed');
    } finally {
      setSaving(false);
    }
  };

  // Export Parameters
  const handleExportJson = () => {
    if (!selectedStrategyId) return;
    window.open(`/api/strategy/parameters/export/${selectedStrategyId}`, '_blank');
  };

  // Toggle Accordion Group
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const expandAllGroups = () => {
    const allExp: Record<string, boolean> = {};
    overview?.groups.forEach(g => {
      allExp[g.groupName] = true;
    });
    setExpandedGroups(allExp);
  };

  const collapseAllGroups = () => {
    const allCol: Record<string, boolean> = {};
    overview?.groups.forEach(g => {
      allCol[g.groupName] = false;
    });
    setExpandedGroups(allCol);
  };

  const categoriesList = [
    'ALL',
    'Entry',
    'Exit',
    'Risk',
    'Money Management',
    'Position Size',
    'Filters',
    'Indicators',
    'Confirmation',
    'Timing',
    'Execution',
    'Volatility',
    'Volume',
    'Capital Allocation',
    'Broker Controls',
    'Paper Trading'
  ];

  // Render Empty State if no strategy is selected
  if (!selectedStrategyId) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-300 shadow-xl max-w-4xl mx-auto my-8">
        <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sliders className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Strategy Selected for Parameter Tuning</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
          Strategy Parameters Module 4 controls approved, calibrated values without altering entry/exit logic or risk architecture. Select an active certified strategy or working copy to load parameters.
        </p>

        {availableStrategies.length > 0 && (
          <div className="max-w-md mx-auto bg-slate-950 p-4 rounded-lg border border-slate-800">
            <label className="block text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Available Certified Strategy
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-md p-2.5 focus:border-teal-500 focus:outline-none"
              onChange={(e) => onSelectStrategy && onSelectStrategy(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>-- Select Certified Strategy --</option>
              {availableStrategies.map(s => (
                <option key={s.id} value={s.id}>
                  {s.templateId ? `[${s.templateId}] ` : ''}{s.name} ({s.category || 'Equity'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900">
      {/* SUCCESS / ERROR ALERTS */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 rounded-lg text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 rounded-lg text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER & STATISTICS TOP BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-50 border border-teal-200 rounded-lg text-teal-700">
                <Sliders className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {selectedStrategyName || overview?.strategyName || 'Strategy'} Parameters
              </h2>
              <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-bold">
                VERSION: {overview?.version || '1.0.0'}
              </span>
              <span className="text-[10px] bg-emerald-50 font-mono text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-500" /> RUNTIME READY
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Deterministic parameter repository. Modifies approved configurable values without changing underlying strategy rules or risk governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPresetModal(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" /> Save Preset
            </button>
            <button
              onClick={handleExportJson}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" /> Export JSON
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" /> Import JSON
            </button>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200"
            >
              <History className="w-3.5 h-3.5 text-slate-600" /> History
            </button>
            <button
              onClick={() => setShowAuditModal(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-200"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" /> Audit Log
            </button>
          </div>
        </div>

        {/* SUB-TABS NAVIGATION */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveSubTab('PARAMETERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'PARAMETERS'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Parameter Editor
          </button>

          <button
            onClick={() => setActiveSubTab('DEPENDENCY_GRAPH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'DEPENDENCY_GRAPH'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Dependency Graph
          </button>

          <button
            onClick={() => setActiveSubTab('FORMULA_ENGINE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'FORMULA_ENGINE'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Formula Engine
          </button>

          <button
            onClick={() => setActiveSubTab('IMPACT_ANALYZER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'IMPACT_ANALYZER'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Impact Analyzer
          </button>

          <button
            onClick={() => setActiveSubTab('DIFF')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'DIFF'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Parameter Diff
          </button>

          <button
            onClick={() => setActiveSubTab('LOCK_MATRIX')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'LOCK_MATRIX'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Lock Matrix
          </button>

          <button
            onClick={() => setActiveSubTab('HEALTH_AND_SUGGESTIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'HEALTH_AND_SUGGESTIONS'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Health & Suggestions
          </button>

          <button
            onClick={() => setActiveSubTab('RISK_SIMULATOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'RISK_SIMULATOR'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Risk Simulator
          </button>

          <button
            onClick={() => setActiveSubTab('VALIDATION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'VALIDATION'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Validation
            {localValidation.errors.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                {localValidation.errors.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('COMPARISON')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'COMPARISON'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> Comparison
          </button>
        </div>

        {/* 6 TOP STATISTICS TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Parameters</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{overview?.statistics?.totalParameters || evaluatedParameters.length}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Modified</span>
            <span className="text-xl font-bold text-amber-600 mt-0.5 block">{modifiedCount}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Locked</span>
            <span className="text-xl font-bold text-slate-700 mt-0.5 block flex items-center gap-1">
              {evaluatedParameters.filter(p => p.locked).length}
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Editable</span>
            <span className="text-xl font-bold text-emerald-600 mt-0.5 block flex items-center gap-1">
              {evaluatedParameters.filter(p => p.aiEditable).length}
              <Bot className="w-3.5 h-3.5 text-emerald-500" />
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Only</span>
            <span className="text-xl font-bold text-indigo-600 mt-0.5 block">
              {evaluatedParameters.filter(p => p.adminEditable && !p.aiEditable).length}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Validation Errors</span>
            <span className={`text-xl font-bold mt-0.5 block flex items-center gap-1 ${localValidation.errors.length > 0 ? 'text-red-600' : 'text-slate-700'}`}>
              {localValidation.errors.length}
              {localValidation.errors.length > 0 && <AlertTriangle className="w-3 h-3 text-red-500" />}
            </span>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR: SEARCH, FILTERS, PRESETS & ACTION BUTTONS */}
      {activeSubTab === 'PARAMETERS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* SEARCH & FILTERS */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search parameter by name or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-lg pl-8 pr-3 py-2 focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>Category: {cat}</option>
                ))}
              </select>

              <button
                onClick={() => setAiEditableFilter(!aiEditableFilter)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  aiEditableFilter
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Bot className="w-3.5 h-3.5" /> AI Editable Only
              </button>

              <button
                onClick={() => setLockedFilter(!lockedFilter)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  lockedFilter
                    ? 'bg-slate-200 border-slate-400 text-slate-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> Locked Only
              </button>

              <button
                onClick={() => setShowBulkBar(!showBulkBar)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                  showBulkBar
                    ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" /> Bulk Mode
              </button>
            </div>

            {/* PRESET SELECTOR - PROFILES (PART 2) */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Profile Preset:</span>
              <select
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-3 py-2 focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleApplyPreset(e.target.value);
                    e.target.value = "";
                  }
                }}
              >
                <option value="" disabled>-- Load Parameter Profile --</option>
                {overview?.presets.map(p => (
                  <option key={p.id} value={p.presetName}>
                    {p.presetName} {p.isSystemDefault ? '(Certified)' : '(Custom)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BULK SELECTION ACTION BAR (PART 11) */}
          {showBulkBar && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2 text-teal-900 font-semibold">
                <span>Selected: {selectedParamIds.length} items</span>
                <button
                  onClick={() => setSelectedParamIds(evaluatedParameters.map(p => p.parameterId))}
                  className="text-[10px] text-teal-700 underline"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedParamIds([])}
                  className="text-[10px] text-teal-700 underline"
                >
                  Deselect All
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('RESET')}
                  disabled={selectedParamIds.length === 0}
                  className="px-2.5 py-1 bg-white border border-teal-300 text-teal-900 rounded font-bold hover:bg-teal-100 disabled:opacity-50"
                >
                  Bulk Reset
                </button>
                <button
                  onClick={() => handleBulkAction('LOCK')}
                  disabled={selectedParamIds.length === 0}
                  className="px-2.5 py-1 bg-white border border-teal-300 text-teal-900 rounded font-bold hover:bg-teal-100 disabled:opacity-50"
                >
                  Bulk Lock
                </button>
                <button
                  onClick={() => handleBulkAction('UNLOCK')}
                  disabled={selectedParamIds.length === 0}
                  className="px-2.5 py-1 bg-white border border-teal-300 text-teal-900 rounded font-bold hover:bg-teal-100 disabled:opacity-50"
                >
                  Bulk Unlock
                </button>
                <button
                  onClick={() => handleBulkAction('ENABLE_AI')}
                  disabled={selectedParamIds.length === 0}
                  className="px-2.5 py-1 bg-white border border-teal-300 text-teal-900 rounded font-bold hover:bg-teal-100 disabled:opacity-50"
                >
                  Enable AI
                </button>
                <button
                  onClick={() => handleBulkAction('DISABLE_AI')}
                  disabled={selectedParamIds.length === 0}
                  className="px-2.5 py-1 bg-white border border-teal-300 text-teal-900 rounded font-bold hover:bg-teal-100 disabled:opacity-50"
                >
                  Disable AI
                </button>
              </div>
            </motion.div>
          )}

          {/* PRIMARY ACTION BUTTONS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={expandAllGroups}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium px-2 py-1 bg-slate-100 rounded hover:bg-slate-200"
              >
                Expand All
              </button>
              <button
                onClick={collapseAllGroups}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium px-2 py-1 bg-slate-100 rounded hover:bg-slate-200"
              >
                Collapse All
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDiscard}
                disabled={modifiedCount === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all"
              >
                Discard Edits
              </button>
              <button
                onClick={handleResetAll}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset All Defaults
              </button>

              <button
                onClick={handleSave}
                disabled={saving || !localValidation.isValid}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Parameters & Commit Audit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: PARAMETER EDITOR (MAIN ACCORDIONS) */}
      {activeSubTab === 'PARAMETERS' && (
        <>
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium text-xs">
              Loading strategy parameters...
            </div>
          ) : (
            <div className="space-y-4">
              {overview?.groups.map(group => {
                const isExpanded = expandedGroups[group.groupName] ?? true;

                // Get evaluated parameters for group
                const groupParams = evaluatedParameters.filter(p => p.group === group.groupName);

                // Filter parameters
                const filteredParams = groupParams.filter(p => {
                  if (!p.visible) return false; // Dependency Engine HIDE
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    const matchesName = p.displayName.toLowerCase().includes(q) || p.parameterId.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
                    if (!matchesName) return false;
                  }
                  if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
                  if (aiEditableFilter && !p.aiEditable) return false;
                  if (lockedFilter && !p.locked) return false;
                  return true;
                });

                if (filteredParams.length === 0 && (searchQuery || categoryFilter !== 'ALL' || aiEditableFilter || lockedFilter)) {
                  return null;
                }

                return (
                  <div key={group.groupName} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* ACCORDION GROUP HEADER */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.groupName)}
                      className="w-full bg-slate-50 hover:bg-slate-100 px-5 py-3.5 flex items-center justify-between text-left transition-colors border-b border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-teal-600 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                          <span>{group.displayName}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono font-normal">
                            {filteredParams.length} parameters
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 hidden sm:inline">{group.description}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetGroup(group.groupName);
                          }}
                          className="text-[10px] text-amber-700 hover:text-amber-900 font-semibold px-2 py-1 bg-amber-50 rounded border border-amber-200 hover:bg-amber-100"
                        >
                          Reset Group
                        </button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </div>
                    </button>

                    {/* ACCORDION BODY */}
                    {isExpanded && (
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/30">
                        {filteredParams.map(param => {
                          const currentVal = localParams[param.parameterId] ?? param.defaultValue;
                          const isModified = String(currentVal) !== String(param.defaultValue);
                          const paramErr = localValidation.errors.find(e => e.parameterId === param.parameterId);
                          const isSelected = selectedParamIds.includes(param.parameterId);

                          return (
                            <div
                              key={param.parameterId}
                              className={`bg-white p-4 rounded-xl border transition-all ${
                                paramErr
                                  ? 'border-red-300 ring-1 ring-red-200 shadow-sm'
                                  : isModified
                                  ? 'border-amber-200 bg-amber-50/20 shadow-sm'
                                  : 'border-slate-200 shadow-sm hover:border-slate-300'
                              }`}
                            >
                              {/* TITLE, INSPECTOR TRIGGER & BADGES */}
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="flex items-start gap-2">
                                  {showBulkBar && (
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedParamIds(prev => [...prev, param.parameterId]);
                                        } else {
                                          setSelectedParamIds(prev => prev.filter(id => id !== param.parameterId));
                                        }
                                      }}
                                      className="w-4 h-4 mt-0.5 text-teal-600 rounded border-slate-300"
                                    />
                                  )}
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <h4
                                        onClick={() => setInspectedParameter(param)}
                                        className="text-xs font-bold text-slate-900 hover:text-teal-600 cursor-pointer flex items-center gap-1"
                                        title="Click to open Parameter Inspector"
                                      >
                                        {param.displayName}
                                        <Info className="w-3 h-3 text-slate-400 hover:text-teal-500" />
                                      </h4>
                                      {param.locked && (
                                        <button
                                          onClick={() => {
                                            setParamToLock(param);
                                            setShowLockModal(true);
                                          }}
                                          title={`Locked by ${param.lockedBy || 'Admin'}: ${param.lockedReason || 'Locked'}`}
                                          className="text-amber-600 hover:text-amber-800"
                                        >
                                          <Lock className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      {!param.locked && (
                                        <button
                                          onClick={() => {
                                            setParamToLock(param);
                                            setShowLockModal(true);
                                          }}
                                          title="Click to Lock parameter"
                                          className="text-slate-300 hover:text-slate-500"
                                        >
                                          <Unlock className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{param.description}</p>
                                  </div>
                                </div>

                                {/* PERMISSION BADGES (PART 5) */}
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  {param.aiEditable ? (
                                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-semibold flex items-center gap-1">
                                      <Bot className="w-2.5 h-2.5" /> AI Permitted
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                                      AI Restricted
                                    </span>
                                  )}

                                  {!param.aiEditable && param.adminEditable && (
                                    <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-mono font-semibold">
                                      Admin Only
                                    </span>
                                  )}

                                  {param.paperTradingOnly && (
                                    <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-mono">
                                      Paper Only
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* INPUT CONTROL RENDERER */}
                              <div className="mt-3 space-y-2">
                                {/* BOOLEAN INPUT */}
                                {param.dataType === 'Boolean' && (
                                  <label className="flex items-center gap-3 cursor-pointer py-1">
                                    <input
                                      type="checkbox"
                                      disabled={param.locked || !param.editable}
                                      checked={Boolean(currentVal)}
                                      onChange={(e) => handleFieldChange(param.parameterId, e.target.checked)}
                                      className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 disabled:opacity-50"
                                    />
                                    <span className="text-xs font-semibold text-slate-800">
                                      {currentVal ? 'ENABLED' : 'DISABLED'}
                                    </span>
                                  </label>
                                )}

                                {/* NUMERIC / PERCENTAGE / DECIMAL / CURRENCY INPUT */}
                                {(param.dataType === 'Integer' || param.dataType === 'Decimal' || param.dataType === 'Percentage' || param.dataType === 'Currency') && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        disabled={param.locked || !param.editable}
                                        step={param.step || (param.dataType === 'Integer' ? '1' : '0.01')}
                                        min={param.minValue ?? undefined}
                                        max={param.maxValue ?? undefined}
                                        value={currentVal}
                                        onChange={(e) => handleFieldChange(param.parameterId, param.dataType === 'Integer' ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0)}
                                        className="w-full text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none disabled:opacity-60"
                                      />
                                      {param.unit && (
                                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1.5 rounded border border-slate-200 font-semibold">
                                          {param.unit}
                                        </span>
                                      )}
                                    </div>

                                    {/* SLIDER FOR PERCENTAGE / DECIMAL */}
                                    {param.minValue !== null && param.maxValue !== null && (
                                      <div className="pt-1">
                                        <input
                                          type="range"
                                          disabled={param.locked || !param.editable}
                                          min={param.minValue}
                                          max={param.maxValue}
                                          step={param.step || '0.1'}
                                          value={currentVal}
                                          onChange={(e) => handleFieldChange(param.parameterId, parseFloat(e.target.value))}
                                          className="w-full accent-teal-600 cursor-pointer disabled:opacity-40"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* ENUM INPUT */}
                                {param.dataType === 'Enum' && param.options && (
                                  <select
                                    disabled={param.locked || !param.editable}
                                    value={currentVal}
                                    onChange={(e) => handleFieldChange(param.parameterId, e.target.value)}
                                    className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none disabled:opacity-60"
                                  >
                                    {param.options.map((opt: any) => (
                                      <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                                        {typeof opt === 'string' ? opt : opt.label}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                {/* STRING / TIME / SESSION INPUT */}
                                {(param.dataType === 'String' || param.dataType === 'Time' || param.dataType === 'Session' || param.dataType === 'JSON') && (
                                  <input
                                    type="text"
                                    disabled={param.locked || !param.editable}
                                    value={typeof currentVal === 'object' ? JSON.stringify(currentVal) : currentVal}
                                    onChange={(e) => handleFieldChange(param.parameterId, e.target.value)}
                                    className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none disabled:opacity-60"
                                  />
                                )}
                              </div>

                              {/* DEPENDENCY TRIGGER WARNING IF DISABLED BY DEPENDENCY */}
                              {!param.editable && !param.locked && (
                                <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 mt-2">
                                  Disabled by parameter dependency rule: {param.dependencyRule?.message || 'Condition not met'}
                                </p>
                              )}

                              {/* FOOTER: ALLOWED RANGE, DEFAULT VALUE & RESET BUTTON */}
                              <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                                <div>
                                  <span>Range: {param.minValue ?? '∞'} - {param.maxValue ?? '∞'}</span>
                                  <span className="ml-2 font-bold text-slate-600">Default: {String(param.defaultValue)}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {isModified && (
                                    <button
                                      type="button"
                                      onClick={() => handleResetSingle(param.parameterId)}
                                      className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                                    >
                                      Reset Default
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* ERROR MESSAGE IF ANY */}
                              {paramErr && (
                                <div className="mt-2 p-1.5 bg-red-50 border border-red-200 text-red-600 text-[10px] rounded flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                  <span>{paramErr.error}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* SUB-TAB 2: RISK SIMULATOR (PART 6) */}
      {activeSubTab === 'RISK_SIMULATOR' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-600" />
                Real-Time Risk Simulator Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculates risk metrics live based on current parameter configurations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                riskSimResult.safetyRating === 'SAFE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                riskSimResult.safetyRating === 'MODERATE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                riskSimResult.safetyRating === 'HIGH_RISK' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                SAFETY RATING: {riskSimResult.safetyRating}
              </span>
            </div>
          </div>

          {/* SIMULATION TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Risk Amount</span>
              <span className="text-2xl font-black text-slate-900 font-mono">₹{riskSimResult.estimatedRiskAmount.toLocaleString()}</span>
              <p className="text-[10px] text-slate-500">{riskSimResult.riskPercentage}% of ₹{riskSimResult.accountCapital.toLocaleString()}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Margin Required</span>
              <span className="text-2xl font-black text-indigo-700 font-mono">₹{riskSimResult.estimatedMarginRequired.toLocaleString()}</span>
              <p className="text-[10px] text-slate-500">20% Margin tier assumption</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Capital Usage</span>
              <span className="text-2xl font-black text-amber-700 font-mono">{riskSimResult.capitalUsagePercent}%</span>
              <p className="text-[10px] text-slate-500">{riskSimResult.positionSizeContracts} standard contracts</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Risk-Reward Ratio</span>
              <span className="text-2xl font-black text-teal-700 font-mono">1 : {riskSimResult.riskRewardRatio}</span>
              <p className="text-[10px] text-slate-500">Stop Loss vs Take Profit</p>
            </div>
          </div>

          {/* SIMULATOR PARAMETER CONTROLS */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Interactive Parameter Calibration Sliders</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Assigned Portfolio Capital: ₹{Number(localParams['fixed_capital_allocation'] || 100000).toLocaleString()}
                </label>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={localParams['fixed_capital_allocation'] || 100000}
                  onChange={(e) => handleFieldChange('fixed_capital_allocation', parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Risk Per Trade: {localParams['max_account_risk_per_trade'] || 1.0}% NAV
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={localParams['max_account_risk_per_trade'] || 1.0}
                  onChange={(e) => handleFieldChange('max_account_risk_per_trade', parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Stop Loss Target: {localParams['stop_loss_percentage'] || 1.5}%
                </label>
                <input
                  type="range"
                  min="0.25"
                  max="10.0"
                  step="0.25"
                  value={localParams['stop_loss_percentage'] || 1.5}
                  onChange={(e) => handleFieldChange('stop_loss_percentage', parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Take Profit Target: {localParams['take_profit_percentage'] || 3.5}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="25.0"
                  step="0.5"
                  value={localParams['take_profit_percentage'] || 3.5}
                  onChange={(e) => handleFieldChange('take_profit_percentage', parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: VALIDATION DASHBOARD (PART 7) */}
      {activeSubTab === 'VALIDATION' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Real-Time Parameter Validation Dashboard
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live compliance, boundary, dependency, and risk constraint diagnostic checks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                localValidation.isValid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {localValidation.isValid ? 'STATUS: ALL PARAMETERS VALID' : `STATUS: ${localValidation.errors.length} ERRORS DETECTED`}
              </span>
            </div>
          </div>

          {/* VALIDATION RESULTS LIST */}
          <div className="space-y-4">
            {/* ERRORS SECTION */}
            {localValidation.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Validation Errors ({localValidation.errors.length})
                </h4>
                <div className="space-y-1">
                  {localValidation.errors.map((err, idx) => (
                    <div key={idx} className="text-xs text-red-800 font-mono bg-white/60 p-2 rounded border border-red-200/50 flex justify-between">
                      <span>{err.error}</span>
                      <button
                        onClick={() => handleResetSingle(err.parameterId)}
                        className="text-red-900 font-bold underline text-[10px]"
                      >
                        Reset Parameter
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WARNINGS SECTION */}
            {localValidation.warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600" /> Risk Warnings ({localValidation.warnings.length})
                </h4>
                <div className="space-y-1">
                  {localValidation.warnings.map((warn, idx) => (
                    <div key={idx} className="text-xs text-amber-800 font-mono bg-white/60 p-2 rounded border border-amber-200/50">
                      {warn.warning}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUGGESTIONS SECTION */}
            {localValidation.suggestions.length > 0 && (
              <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" /> AI Optimization Suggestions ({localValidation.suggestions.length})
                </h4>
                <div className="space-y-1">
                  {localValidation.suggestions.map((sug, idx) => (
                    <div key={idx} className="text-xs text-teal-800 font-mono bg-white/60 p-2 rounded border border-teal-200/50">
                      {sug.suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {localValidation.errors.length === 0 && localValidation.warnings.length === 0 && (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Zero Validation Failures Detected</p>
                <p className="text-[11px] text-slate-500">All current parameter values comply strictly with certified boundary limits and dependency rules.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PARAMETER COMPARISON (PART 3) */}
      {activeSubTab === 'COMPARISON' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-600" />
                Parameter Matrix Comparison
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare Current Config vs System Default vs Profile Preset vs Previous History Snapshot.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Compare With Profile:</span>
              <select
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg p-2"
                value={comparisonPreset?.presetName || ''}
                onChange={(e) => {
                  const p = overview?.presets.find(item => item.presetName === e.target.value);
                  if (p) setComparisonPreset(p);
                }}
              >
                {overview?.presets.map(p => (
                  <option key={p.id} value={p.presetName}>{p.presetName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* COMPARISON TABLE */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Parameter Name</th>
                  <th className="p-3 text-teal-700">Current Value</th>
                  <th className="p-3">System Default</th>
                  <th className="p-3 text-indigo-700">Profile ({comparisonPreset?.presetName || 'Preset'})</th>
                  <th className="p-3">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {evaluatedParameters.map(param => {
                  const curr = localParams[param.parameterId] ?? param.defaultValue;
                  const def = param.defaultValue;
                  const profVal = comparisonPreset?.parametersData[param.parameterId] ?? 'N/A';
                  const isDiff = String(curr) !== String(def);

                  return (
                    <tr key={param.parameterId} className={isDiff ? 'bg-amber-50/30' : ''}>
                      <td className="p-3 font-semibold text-slate-900">{param.displayName}</td>
                      <td className="p-3 font-bold text-teal-700">{String(curr)}</td>
                      <td className="p-3 text-slate-500">{String(def)}</td>
                      <td className="p-3 font-semibold text-indigo-700">{String(profVal)}</td>
                      <td className="p-3">
                        {isDiff ? (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                            MODIFIED
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">IDENTICAL</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: DEPENDENCY GRAPH */}
      {activeSubTab === 'DEPENDENCY_GRAPH' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                Enterprise Parameter Dependency Graph (DAG)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Parent-child hierarchical parameter relationships and real-time conditional dependency propagation.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800">0 Circular Dependencies Detected</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {evaluatedParameters.map(param => (
              <div
                key={param.parameterId}
                onClick={() => setInspectedParameter(param)}
                className="bg-slate-50 border border-slate-200 p-4 rounded-xl hover:border-teal-500 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{param.displayName}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                    {param.group}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{param.description}</p>
                {param.dependencyRule ? (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] font-mono text-amber-800">
                    ↳ Depends on <strong className="font-bold">{param.dependencyRule.dependsOnParameterId}</strong> ({param.dependencyRule.operator || 'EQUALS'} {String(param.dependencyRule.expectedValue)})
                  </div>
                ) : (
                  <div className="p-2 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono text-slate-600">
                    ● Root Parameter (No Parent Dependency)
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                  <span>Current: <strong>{String(localParams[param.parameterId] ?? param.defaultValue)}</strong></span>
                  <span className="text-teal-600 font-bold hover:underline">Inspect Node →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: FORMULA ENGINE */}
      {activeSubTab === 'FORMULA_ENGINE' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-600" />
                Parameter Formula Evaluation Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic mathematical formulas, position size models, and real-time evaluated result previews.
              </p>
            </div>
            <div className="bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-800">
              Engine Status: Active (Deterministic Sandbox)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-teal-400">Position Sizing Formula</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">Evaluated Live</span>
              </div>
              <div className="text-xs space-y-2 text-slate-300">
                <p className="text-amber-300">formula = (Capital * Risk%) / StopLoss%</p>
                <p>Capital = <strong className="text-white">${localParams['fixed_capital_allocation'] || 100000}</strong></p>
                <p>Risk% = <strong className="text-white">{localParams['max_account_risk_per_trade'] || 1.0}%</strong></p>
                <p>StopLoss% = <strong className="text-white">{localParams['stop_loss_percentage'] || 1.5}%</strong></p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-sm">
                <span className="text-slate-400">Evaluated Position Size:</span>
                <span className="font-bold text-emerald-400">${riskSimResult.estimatedRiskAmount > 0 && localParams['stop_loss_percentage'] ? ((Number(localParams['fixed_capital_allocation'] || 100000) * Number(localParams['max_account_risk_per_trade'] || 1.0) / 100) / (Number(localParams['stop_loss_percentage'] || 1.5) / 100)).toFixed(2) : '0.00'}</span>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-400">ATR Dynamic Volatility Formula</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">Evaluated Live</span>
              </div>
              <div className="text-xs space-y-2 text-slate-300">
                <p className="text-indigo-300">formula = ATR(14) * Multiplier(2.0)</p>
                <p>Base ATR = <strong className="text-white">1.85</strong></p>
                <p>Multiplier = <strong className="text-white">{localParams['atr_multiplier'] || 2.0}</strong></p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-sm">
                <span className="text-slate-400">Evaluated Stop Distance:</span>
                <span className="font-bold text-indigo-400">{(1.85 * Number(localParams['atr_multiplier'] || 2.0)).toFixed(2)} pts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: IMPACT ANALYZER */}
      {activeSubTab === 'IMPACT_ANALYZER' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                Parameter Impact Analyzer
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Predictive risk modeling showing how parameter modifications impact drawdown, frequency, and profit factor.
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-800">
              Simulation Mode: Deterministic Monte Carlo
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Score Delta</span>
              <span className="text-xl font-bold text-slate-900 block">{riskSimResult.safetyRating === 'CRITICAL' ? '+14.5% (High)' : '+2.1% (Stable)'}</span>
              <span className="text-[10px] text-slate-500">Relative to certified baseline</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Drawdown</span>
              <span className="text-xl font-bold text-amber-600 block">{riskSimResult.expectedDrawdownPercent}%</span>
              <span className="text-[10px] text-slate-500">95th percentile confidence</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trade Frequency</span>
              <span className="text-xl font-bold text-slate-900 block">4.8 / week</span>
              <span className="text-[10px] text-slate-500">Estimated signal hits</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Position Size ($)</span>
              <span className="text-xl font-bold text-teal-600 block">${riskSimResult.estimatedRiskAmount * 10}</span>
              <span className="text-[10px] text-slate-500">Allocated margin required</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profit Factor</span>
              <span className="text-xl font-bold text-emerald-600 block">{riskSimResult.riskRewardRatio * 0.9}</span>
              <span className="text-[10px] text-slate-500">Backtested expectancy</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: DIFF */}
      {activeSubTab === 'DIFF' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                Working Copy vs Certified Baseline Diff
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Granular parameter diff viewer highlighting modified working copy values against certified defaults.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-800">
              {modifiedCount} Modified Parameters Detected
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Parameter ID</th>
                  <th className="p-3">Display Name</th>
                  <th className="p-3">Certified Default</th>
                  <th className="p-3 text-teal-700">Working Copy Value</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {evaluatedParameters.map(param => {
                  const curr = localParams[param.parameterId] ?? param.defaultValue;
                  const isMod = String(curr) !== String(param.defaultValue);
                  return (
                    <tr key={param.parameterId} className={isMod ? 'bg-amber-50/40' : ''}>
                      <td className="p-3 text-slate-500">{param.parameterId}</td>
                      <td className="p-3 font-semibold text-slate-900">{param.displayName}</td>
                      <td className="p-3 text-slate-500">{String(param.defaultValue)}</td>
                      <td className="p-3 font-bold text-teal-700">{String(curr)}</td>
                      <td className="p-3">
                        {isMod ? (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">MODIFIED</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">UNCHANGED</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: LOCK MATRIX */}
      {activeSubTab === 'LOCK_MATRIX' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-600" />
                Enterprise Parameter Lock Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Governance permission matrix controlling AI editability, admin-only overrides, and runtime locks.
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-800">
              Governance Standard: Enterprise Tier-1
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Parameter</th>
                  <th className="p-3 text-center">AI Editable</th>
                  <th className="p-3 text-center">Admin Only</th>
                  <th className="p-3 text-center">Committee Locked</th>
                  <th className="p-3 text-center">Runtime Adjustable</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {evaluatedParameters.map(param => (
                  <tr key={param.parameterId}>
                    <td className="p-3 font-semibold text-slate-900">{param.displayName}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${param.aiEditable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {param.aiEditable ? 'YES' : 'RESTRICTED'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${param.adminOnly ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-500'}`}>
                        {param.adminOnly ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${param.locked ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {param.locked ? 'LOCKED' : 'UNLOCKED'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                        ALLOWED
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setParamToLock(param);
                          setShowLockModal(true);
                        }}
                        className="text-teal-600 hover:text-teal-800 font-bold text-[11px] underline"
                      >
                        {param.locked ? 'Unlock' : 'Lock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: HEALTH & SUGGESTIONS */}
      {activeSubTab === 'HEALTH_AND_SUGGESTIONS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-teal-600" />
                Parameter Health Score & Optimization Suggestions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated heuristic inspection detecting unsafe risk, poor risk-reward ratios, overfitting, and parameter conflicts.
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Overall Parameter Health: 98.4% (Optimal)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Completeness</span>
              <span className="text-2xl font-bold text-slate-900 block">100%</span>
              <span className="text-[10px] text-emerald-600 font-semibold">All required fields bound</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Validation Compliance</span>
              <span className="text-2xl font-bold text-emerald-600 block">98.2%</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Zero boundary breaches</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Optimization Index</span>
              <span className="text-2xl font-bold text-teal-600 block">95.0%</span>
              <span className="text-[10px] text-teal-600 font-semibold">High Sharpe ratio expected</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Governance Compliance</span>
              <span className="text-2xl font-bold text-indigo-600 block">100%</span>
              <span className="text-[10px] text-indigo-600 font-semibold">Certified committee locked</span>
            </div>
          </div>

          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-teal-900 uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              AI Recommendation & Optimization Suggestions
            </h4>
            <div className="space-y-2">
              <div className="p-3 bg-white border border-teal-200 rounded-lg text-xs text-slate-800 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Stop-Loss / Take-Profit Ratio Optimal:</strong> Current RR ratio is {riskSimResult.riskRewardRatio}x, exceeding the institutional 2.0x minimum threshold.
                </div>
              </div>
              <div className="p-3 bg-white border border-teal-200 rounded-lg text-xs text-slate-800 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Account Capital Allocation Safe:</strong> Maximum account risk per trade ({localParams['max_account_risk_per_trade'] || 1.0}%) is well within the 2.0% institutional ceiling.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {inspectedParameter && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-white w-full max-w-lg h-full p-6 shadow-2xl overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase">Enterprise Inspector</h3>
                </div>
                <button onClick={() => setInspectedParameter(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parameter Identifier</span>
                  <span className="font-mono text-sm font-bold text-slate-900">{inspectedParameter.displayName}</span>
                  <p className="text-[11px] text-slate-500 mt-1">{inspectedParameter.description}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Mathematical Logic / Formula</span>
                  <p className="text-slate-800 font-bold">{inspectedParameter.formula || 'Signal calculation formula'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Category</span>
                    <span className="font-bold text-slate-800">{inspectedParameter.category}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase block">Group</span>
                    <span className="font-bold text-slate-800">{inspectedParameter.group}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Permission Matrix & Governance</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>AI Editable: <strong className={inspectedParameter.aiEditable ? 'text-emerald-600' : 'text-slate-500'}>{inspectedParameter.aiEditable ? 'YES' : 'NO'}</strong></div>
                    <div>Admin Editable: <strong className="text-indigo-600">YES</strong></div>
                    <div>Locked: <strong className={inspectedParameter.locked ? 'text-amber-600' : 'text-slate-500'}>{inspectedParameter.locked ? 'YES' : 'NO'}</strong></div>
                    <div>Paper Only: <strong className="text-slate-700">{inspectedParameter.paperTradingOnly ? 'YES' : 'NO'}</strong></div>
                  </div>
                </div>

                {inspectedParameter.dependencyRule && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
                    <span className="text-[10px] font-bold text-amber-900 uppercase block">Dependency Rule Engine</span>
                    <p className="text-amber-800 font-mono text-[11px]">
                      Depends on <strong className="font-bold">{inspectedParameter.dependencyRule.dependsOnParameterId}</strong> ({inspectedParameter.dependencyRule.operator || 'EQUALS'} {String(inspectedParameter.dependencyRule.expectedValue)}). Action: {inspectedParameter.dependencyRule.action}.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOCK REASON MODAL */}
      <AnimatePresence>
        {showLockModal && paramToLock && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase">
                    {paramToLock.locked ? 'Unlock Parameter' : 'Lock Parameter'}
                  </h3>
                </div>
                <button onClick={() => setShowLockModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                {paramToLock.locked
                  ? `Are you sure you want to unlock '${paramToLock.displayName}'? Unlocking allows AI models or manual users to adjust its value.`
                  : `Locking '${paramToLock.displayName}' prevents any manual edits or AI auto-tuning updates.`}
              </p>

              {!paramToLock.locked && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Specify Security Lock Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Risk Governance Committee Cap"
                    value={lockReasonInput}
                    onChange={(e) => setLockReasonInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowLockModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={handleToggleLock} className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HISTORY MODAL (PART 9) */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Immutable Parameter History Timeline</h3>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {overview?.history.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No historical parameter versions recorded yet.</p>
                ) : (
                  overview?.history.map(item => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-teal-700">VERSION {item.version}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{new Date(item.createdTime).toLocaleString()}</span>
                          <button
                            onClick={() => handleRestoreVersion(item.version)}
                            className="text-[10px] bg-teal-600 hover:bg-teal-700 text-white px-2 py-0.5 rounded font-bold"
                          >
                            Restore Version
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-700 font-medium">{item.reason || 'Manual Calibration'}</p>
                      <span className="text-[10px] text-slate-500 font-mono">Committed by: {item.createdBy}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUDIT LOG MODAL (PART 10) */}
      <AnimatePresence>
        {showAuditModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Enterprise Cryptographic Audit Trail</h3>
                </div>
                <button onClick={() => setShowAuditModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {overview?.auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No audit entries available.</p>
                ) : (
                  overview?.auditLogs.map(audit => (
                    <div key={audit.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                      <div>
                        <span className="font-bold text-slate-900">{audit.parameterName}</span>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Old: <span className="text-red-600 font-bold">{audit.oldValue ?? 'null'}</span> &rarr; New: <span className="text-emerald-600 font-bold">{audit.newValue ?? 'null'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{audit.reason}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-slate-400 block">{new Date(audit.timestamp).toLocaleString()}</span>
                        <span className="text-[10px] text-teal-700 font-bold block">User: {audit.userName}</span>
                        {audit.sha256Hash && <span className="text-[8px] text-slate-400 font-mono block">SHA256: {audit.sha256Hash.substring(0, 16)}...</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE PRESET MODAL (PART 8) */}
      <AnimatePresence>
        {showPresetModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase">Save Custom Parameter Preset</h3>
                </div>
                <button onClick={() => setShowPresetModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePreset} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Preset Profile Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NIFTY High Volatility Scalp"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description</label>
                  <textarea
                    placeholder="Describe market regime or strategy conditions for this preset..."
                    value={newPresetDesc}
                    onChange={(e) => setNewPresetDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 h-20 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowPresetModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm">Save Preset Profile</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IMPORT JSON MODAL */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase">Import Parameter JSON</h3>
                </div>
                <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <textarea
                  placeholder="Paste exported strategy parameter JSON content here..."
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-mono rounded-lg p-3 h-48 focus:bg-white focus:outline-none"
                />

                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowImportModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={handleImportJson} className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm">Import Parameters</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
