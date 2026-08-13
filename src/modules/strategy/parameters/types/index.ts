export type ParameterCategory =
  | 'Entry'
  | 'Exit'
  | 'Risk'
  | 'Money Management'
  | 'Position Size'
  | 'Filters'
  | 'Indicators'
  | 'Confirmation'
  | 'Timing'
  | 'Execution'
  | 'Volatility'
  | 'Volume'
  | 'Capital Allocation'
  | 'Broker Controls'
  | 'Paper Trading';

export type ParameterGroup =
  | 'Entry Parameters'
  | 'Exit Parameters'
  | 'Risk Parameters'
  | 'Indicator Parameters'
  | 'Money Management'
  | 'Execution Parameters'
  | 'Advanced Parameters'
  | 'AI Permission';

export type ParameterDataType =
  | 'Integer'
  | 'Decimal'
  | 'Boolean'
  | 'String'
  | 'Enum'
  | 'Percentage'
  | 'Currency'
  | 'Time'
  | 'Session'
  | 'JSON';

export interface ParameterDependencyRule {
  dependsOnParameterId: string;
  expectedValue: any;
  operator?: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'IN';
  action: 'HIDE' | 'DISABLE';
  message?: string;
}

export interface StrategyParameterItem {
  id: string;
  parameterId: string;
  strategyId: string;
  name: string;
  displayName: string;
  description: string;
  formula?: string | null;
  category: ParameterCategory;
  group: ParameterGroup;
  dataType: ParameterDataType;
  currentValue: any;
  defaultValue: any;
  minValue?: number | string | null;
  maxValue?: number | string | null;
  step?: number | string | null;
  unit?: string | null;
  required: boolean;
  visible: boolean;
  editable: boolean;
  locked: boolean;
  lockedReason?: string | null;
  lockedBy?: string | null;
  lockedTimestamp?: string | null;

  // AI & Permission Flags
  aiEditable: boolean;
  adminEditable: boolean;
  readOnly: boolean;
  runtimeAdjustable: boolean;
  paperTradingOnly: boolean;
  productionEnabled: boolean;

  dependencyRule?: ParameterDependencyRule | null;
  validationRule?: string | null;
  options?: any[];
  lastModified: string;
  modifiedBy: string;
  version: string;
  sha256Reference: string;
}

export interface StrategyParameterGroupInfo {
  id: string;
  strategyId: string;
  groupName: ParameterGroup;
  displayName: string;
  description: string;
  displayOrder: number;
  isCollapsed: boolean;
}

export interface StrategyParameterHistoryRecord {
  id: string;
  strategyId: string;
  presetName?: string | null;
  parametersSnapshot: Record<string, any>;
  version: string;
  reason?: string | null;
  createdBy: string;
  createdTime: string;
}

export interface StrategyParameterPreset {
  id: string;
  strategyId: string;
  presetName: string; // Conservative, Balanced, Aggressive, Scalping, Swing, Intraday, Commodity, ETF, Custom
  presetType: string;
  description?: string | null;
  parametersData: Record<string, any>;
  isSystemDefault: boolean;
  isArchived?: boolean;
  createdBy: string;
  createdTime: string;
  updatedTime: string;
}

export interface StrategyParameterValidationError {
  parameterId: string;
  name: string;
  error: string;
  rule: string;
}

export interface StrategyParameterValidationWarning {
  parameterId: string;
  name: string;
  warning: string;
}

export interface StrategyParameterValidationSuggestion {
  parameterId: string;
  name: string;
  suggestion: string;
}

export interface StrategyParameterValidationResult {
  id: string;
  strategyId: string;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  errors: StrategyParameterValidationError[];
  warnings: StrategyParameterValidationWarning[];
  suggestions: StrategyParameterValidationSuggestion[];
  dependencyFailures: string[];
  missingRequired: string[];
  validatedAt: string;
}

export interface StrategyParameterAuditRecord {
  id: string;
  strategyId: string;
  parameterId: string;
  parameterName: string;
  oldValue: string | null;
  newValue: string | null;
  userName: string;
  reason: string;
  sha256Hash?: string;
  timestamp: string;
}

export interface RiskSimulationInput {
  accountCapital: number;
  riskPercentage: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  atrMultiplier: number;
  positionSizingModel: string;
  assetClass?: string;
  leverageMultiplier?: number;
}

export interface RiskSimulationResult {
  accountCapital: number;
  riskPercentage: number;
  estimatedRiskAmount: number;
  estimatedMarginRequired: number;
  expectedDrawdownPercent: number;
  capitalUsagePercent: number;
  positionSizeContracts: number;
  riskRewardRatio: number;
  safetyRating: 'SAFE' | 'MODERATE' | 'HIGH_RISK' | 'CRITICAL';
}

export interface StrategyParametersOverview {
  strategyId: string;
  strategyName: string;
  version: string;
  sha256Reference: string;
  statistics: {
    totalParameters: number;
    modifiedCount: number;
    lockedCount: number;
    aiEditableCount: number;
    adminOnlyCount: number;
    validationErrorCount: number;
  };
  groups: Array<{
    groupName: ParameterGroup;
    displayName: string;
    description: string;
    parameters: StrategyParameterItem[];
  }>;
  presets: StrategyParameterPreset[];
  history: StrategyParameterHistoryRecord[];
  auditLogs: StrategyParameterAuditRecord[];
  validation: StrategyParameterValidationResult;
  riskSimulation?: RiskSimulationResult;
}

export const EMPTY_PARAMETER_OVERVIEW: StrategyParametersOverview = {
  strategyId: '',
  strategyName: '',
  version: '1.0.0',
  sha256Reference: '',
  statistics: {
    totalParameters: 0,
    modifiedCount: 0,
    lockedCount: 0,
    aiEditableCount: 0,
    adminOnlyCount: 0,
    validationErrorCount: 0
  },
  groups: [],
  presets: [],
  history: [],
  auditLogs: [],
  validation: {
    id: '',
    strategyId: '',
    isValid: true,
    errorCount: 0,
    warningCount: 0,
    errors: [],
    warnings: [],
    suggestions: [],
    dependencyFailures: [],
    missingRequired: [],
    validatedAt: new Date().toISOString()
  },
  riskSimulation: {
    accountCapital: 100000,
    riskPercentage: 1,
    estimatedRiskAmount: 1000,
    estimatedMarginRequired: 20000,
    expectedDrawdownPercent: 2.5,
    capitalUsagePercent: 20,
    positionSizeContracts: 1,
    riskRewardRatio: 2.33,
    safetyRating: 'SAFE'
  }
};

export function normalizeParameterOverview(raw: any): StrategyParametersOverview {
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(EMPTY_PARAMETER_OVERVIEW));
  }
  const stats = raw.statistics || {};
  const validation = raw.validation || {};
  const riskSimulation = raw.riskSimulation || {};

  return {
    strategyId: String(raw.strategyId || ''),
    strategyName: String(raw.strategyName || ''),
    version: String(raw.version || '1.0.0'),
    sha256Reference: String(raw.sha256Reference || ''),
    statistics: {
      totalParameters: Number(stats.totalParameters ?? 0),
      modifiedCount: Number(stats.modifiedCount ?? 0),
      lockedCount: Number(stats.lockedCount ?? 0),
      aiEditableCount: Number(stats.aiEditableCount ?? 0),
      adminOnlyCount: Number(stats.adminOnlyCount ?? 0),
      validationErrorCount: Number(stats.validationErrorCount ?? stats.validationErrors ?? 0),
    },
    groups: Array.isArray(raw.groups) ? raw.groups.map((g: any) => ({
      groupName: g?.groupName || 'CORE',
      displayName: String(g?.displayName || g?.groupName || 'Core'),
      description: String(g?.description || ''),
      parameters: Array.isArray(g?.parameters) ? g.parameters.map((p: any) => ({
        parameterId: String(p?.parameterId || ''),
        name: String(p?.name || ''),
        displayName: String(p?.displayName || p?.name || ''),
        description: String(p?.description || ''),
        groupName: p?.groupName || g?.groupName || 'CORE',
        type: p?.type || 'NUMBER',
        currentValue: p?.currentValue ?? p?.defaultValue ?? 0,
        defaultValue: p?.defaultValue ?? 0,
        minValue: p?.minValue,
        maxValue: p?.maxValue,
        step: p?.step,
        options: Array.isArray(p?.options) ? p.options : undefined,
        unit: p?.unit,
        category: p?.category || 'GENERAL',
        isLocked: Boolean(p?.isLocked),
        aiEditable: Boolean(p?.aiEditable ?? true),
        adminOnly: Boolean(p?.adminOnly),
        required: Boolean(p?.required),
        dependencyRule: p?.dependencyRule ? {
          dependsOnParameterId: String(p.dependencyRule.dependsOnParameterId || ''),
          condition: p.dependencyRule.condition || 'EQUALS',
          expectedValue: p.dependencyRule.expectedValue
        } : undefined,
        updatedAt: p?.updatedAt || new Date().toISOString()
      })) : []
    })) : [],
    presets: Array.isArray(raw.presets) ? raw.presets : [],
    history: Array.isArray(raw.history) ? raw.history : [],
    auditLogs: Array.isArray(raw.auditLogs) ? raw.auditLogs : [],
    validation: {
      id: String(validation.id || 'val-default'),
      strategyId: String(validation.strategyId || raw.strategyId || ''),
      isValid: validation.isValid !== undefined ? Boolean(validation.isValid) : true,
      errorCount: Number(validation.errorCount ?? 0),
      warningCount: Number(validation.warningCount ?? 0),
      errors: Array.isArray(validation.errors) ? validation.errors : [],
      warnings: Array.isArray(validation.warnings) ? validation.warnings : [],
      suggestions: Array.isArray(validation.suggestions) ? validation.suggestions : [],
      dependencyFailures: Array.isArray(validation.dependencyFailures) ? validation.dependencyFailures : [],
      missingRequired: Array.isArray(validation.missingRequired) ? validation.missingRequired : [],
      validatedAt: String(validation.validatedAt || new Date().toISOString())
    },
    riskSimulation: {
      accountCapital: Number(riskSimulation.accountCapital ?? 100000),
      riskPercentage: Number(riskSimulation.riskPercentage ?? 1),
      estimatedRiskAmount: Number(riskSimulation.estimatedRiskAmount ?? 1000),
      estimatedMarginRequired: Number(riskSimulation.estimatedMarginRequired ?? 20000),
      expectedDrawdownPercent: Number(riskSimulation.expectedDrawdownPercent ?? 2.5),
      capitalUsagePercent: Number(riskSimulation.capitalUsagePercent ?? 20),
      positionSizeContracts: Number(riskSimulation.positionSizeContracts ?? 1),
      riskRewardRatio: Number(riskSimulation.riskRewardRatio ?? 2.33),
      safetyRating: riskSimulation.safetyRating || 'SAFE'
    }
  };
}


