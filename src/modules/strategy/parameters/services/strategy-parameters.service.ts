import { StrategyParametersRepository } from "../repositories/strategy-parameters.repository.ts";
import {
  StrategyParameterItem,
  StrategyParameterGroupInfo,
  StrategyParametersOverview,
  StrategyParameterPreset,
  StrategyParameterValidationResult,
  StrategyParameterValidationError,
  StrategyParameterValidationWarning,
  StrategyParameterValidationSuggestion,
  RiskSimulationInput,
  RiskSimulationResult,
  ParameterGroup,
  ParameterCategory,
  ParameterDataType,
  ParameterDependencyRule
} from "../types/index.ts";
import { pino } from "pino";
import crypto from "crypto";

const logger = pino({ name: "strategy-parameters-service" });

export class StrategyParametersService {
  private static instance: StrategyParametersService;
  private repo: StrategyParametersRepository;

  private constructor() {
    this.repo = StrategyParametersRepository.getInstance();
  }

  public static getInstance(): StrategyParametersService {
    if (!StrategyParametersService.instance) {
      StrategyParametersService.instance = new StrategyParametersService();
    }
    return StrategyParametersService.instance;
  }

  /**
   * Main entry point to get parameters overview for a strategy.
   */
  public async getParametersOverview(strategyId: string, strategyName?: string): Promise<StrategyParametersOverview> {
    await this.repo.ensureTablesExist();

    let params = await this.repo.getParametersByStrategyId(strategyId);

    if (params.length === 0) {
      logger.info({ strategyId }, "No parameters found for strategy. Auto-seeding enterprise default parameters...");
      params = await this.seedDefaultParametersForStrategy(strategyId, strategyName || `Strategy ${strategyId}`);
      await this.seedDefaultPresetsForStrategy(strategyId);
    }

    let groups = await this.repo.getGroupsByStrategyId(strategyId);
    if (groups.length === 0) {
      groups = await this.seedDefaultGroupsForStrategy(strategyId);
    }

    const presets = await this.repo.getPresetsByStrategyId(strategyId);
    const history = await this.repo.getHistoryByStrategyId(strategyId);
    const auditLogs = await this.repo.getAuditLogsByStrategyId(strategyId);

    // Apply dependency evaluation
    params = this.evaluateDependencies(params);

    // Validate parameters
    const validation = this.validateParameters(strategyId, params);
    await this.repo.saveValidationResult(validation);

    // Perform Risk Simulation
    const riskSimulation = this.calculateRiskSimulationFromParams(params);

    // Calculate Statistics
    const statistics = {
      totalParameters: params.length,
      modifiedCount: params.filter(p => String(p.currentValue) !== String(p.defaultValue)).length,
      lockedCount: params.filter(p => p.locked).length,
      aiEditableCount: params.filter(p => p.aiEditable).length,
      adminOnlyCount: params.filter(p => p.adminEditable && !p.aiEditable).length,
      validationErrorCount: validation.errorCount
    };

    // Group parameters into accordion structure
    const groupOrderList: ParameterGroup[] = [
      'Entry Parameters',
      'Exit Parameters',
      'Risk Parameters',
      'Indicator Parameters',
      'Money Management',
      'Execution Parameters',
      'Advanced Parameters',
      'AI Permission'
    ];

    const groupedResult = groupOrderList.map(gName => {
      const gInfo = groups.find(g => g.groupName === gName);
      return {
        groupName: gName,
        displayName: gInfo?.displayName || gName,
        description: gInfo?.description || `${gName} configuration controls`,
        parameters: params.filter(p => p.group === gName)
      };
    });

    const sha256Ref = crypto
      .createHash('sha256')
      .update(JSON.stringify(params.map(p => ({ id: p.parameterId, val: p.currentValue }))))
      .digest('hex');

    return {
      strategyId,
      strategyName: strategyName || strategyId,
      version: params[0]?.version || '1.0.0',
      sha256Reference: sha256Ref,
      statistics,
      groups: groupedResult,
      presets,
      history,
      auditLogs,
      validation,
      riskSimulation
    };
  }

  /**
   * Evaluate Dependencies in Real-time
   * PART 1: Parameter Dependency Engine
   */
  public evaluateDependencies(parameters: StrategyParameterItem[]): StrategyParameterItem[] {
    const paramValueMap = new Map<string, any>();
    parameters.forEach(p => paramValueMap.set(p.parameterId, p.currentValue));

    return parameters.map(param => {
      if (!param.dependencyRule) return param;

      const rule = param.dependencyRule;
      const parentVal = paramValueMap.get(rule.dependsOnParameterId);

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
        // If dependency condition is not triggered, restore visibility/editability
        if (rule.action === 'HIDE') {
          updated.visible = true;
        } else if (rule.action === 'DISABLE' && !param.locked) {
          updated.editable = true;
        }
      }

      return updated;
    });
  }

  /**
   * Real-time Validation Dashboard
   * PART 7: Validation Dashboard
   */
  public validateParameters(strategyId: string, parameters: StrategyParameterItem[]): StrategyParameterValidationResult {
    const errors: StrategyParameterValidationError[] = [];
    const warnings: StrategyParameterValidationWarning[] = [];
    const suggestions: StrategyParameterValidationSuggestion[] = [];
    const dependencyFailures: string[] = [];
    const missingRequired: string[] = [];

    const paramMap = new Map<string, StrategyParameterItem>();
    parameters.forEach(p => paramMap.set(p.parameterId, p));

    for (const param of parameters) {
      const val = param.currentValue;

      // Required check
      if (param.required && (val === undefined || val === null || val === '')) {
        missingRequired.push(param.displayName);
        errors.push({
          parameterId: param.parameterId,
          name: param.displayName,
          error: `Parameter '${param.displayName}' is required.`,
          rule: 'REQUIRED_CHECK'
        });
        continue;
      }

      // Dependency check
      if (param.dependencyRule) {
        const parentParam = paramMap.get(param.dependencyRule.dependsOnParameterId);
        if (!parentParam) {
          dependencyFailures.push(`Missing parent parameter '${param.dependencyRule.dependsOnParameterId}' for '${param.displayName}'`);
        }
      }

      // Numeric min/max check
      if (param.dataType === 'Integer' || param.dataType === 'Decimal' || param.dataType === 'Percentage' || param.dataType === 'Currency') {
        const numVal = Number(val);
        if (isNaN(numVal)) {
          errors.push({
            parameterId: param.parameterId,
            name: param.displayName,
            error: `Parameter '${param.displayName}' must be a valid number.`,
            rule: 'TYPE_CHECK'
          });
        } else {
          if (param.minValue !== null && param.minValue !== undefined && numVal < Number(param.minValue)) {
            errors.push({
              parameterId: param.parameterId,
              name: param.displayName,
              error: `Value ${numVal} is below minimum allowed value of ${param.minValue}.`,
              rule: 'MIN_VALUE_CONSTRAINT'
            });
          }
          if (param.maxValue !== null && param.maxValue !== undefined && numVal > Number(param.maxValue)) {
            errors.push({
              parameterId: param.parameterId,
              name: param.displayName,
              error: `Value ${numVal} exceeds maximum allowed value of ${param.maxValue}.`,
              rule: 'MAX_VALUE_CONSTRAINT'
            });
          }
        }
      }

      // Specific rule checks
      if (param.parameterId === 'stop_loss_percentage') {
        const tpParam = paramMap.get('take_profit_percentage');
        if (tpParam && Number(val) >= Number(tpParam.currentValue)) {
          warnings.push({
            parameterId: param.parameterId,
            name: param.displayName,
            warning: `Stop Loss percentage (${val}%) is equal to or greater than Take Profit (${tpParam.currentValue}%). Risk-Reward ratio is <= 1.`
          });
          suggestions.push({
            parameterId: param.parameterId,
            name: param.displayName,
            suggestion: `Consider keeping Take Profit at least 2x higher than Stop Loss for favorable risk asymmetry.`
          });
        }
      }

      if (param.parameterId === 'fast_ema_period') {
        const slowParam = paramMap.get('slow_ema_period');
        if (slowParam && Number(val) >= Number(slowParam.currentValue)) {
          errors.push({
            parameterId: param.parameterId,
            name: param.displayName,
            error: `Fast EMA period (${val}) must be strictly less than Slow EMA period (${slowParam.currentValue}).`,
            rule: 'DEPENDENCY_FAST_SLOW_PERIOD'
          });
        }
      }

      if (param.parameterId === 'max_account_risk_per_trade' && Number(val) > 3.0) {
        warnings.push({
          parameterId: param.parameterId,
          name: param.displayName,
          warning: `Risk per trade is high (${val}%). Institutional limit is typically <= 2.0%.`
        });
      }
    }

    return {
      id: `val-${crypto.randomUUID()}`,
      strategyId,
      isValid: errors.length === 0,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors,
      warnings,
      suggestions,
      dependencyFailures,
      missingRequired,
      validatedAt: new Date().toISOString()
    };
  }

  /**
   * Risk Simulator Calculation
   * PART 6: Risk Simulator
   */
  public calculateRiskSimulation(input: RiskSimulationInput): RiskSimulationResult {
    const capital = input.accountCapital || 100000;
    const riskPct = input.riskPercentage || 1.0;
    const stopLossPct = input.stopLossPercentage || 1.5;
    const takeProfitPct = input.takeProfitPercentage || 3.5;
    const atrMult = input.atrMultiplier || 2.0;

    const estimatedRiskAmount = (capital * riskPct) / 100;
    const positionSizeAmount = (estimatedRiskAmount / (stopLossPct / 100));
    const estimatedMarginRequired = positionSizeAmount * 0.2; // ~20% margin assumption
    const expectedDrawdownPercent = Math.min(100, riskPct * 2.5);
    const capitalUsagePercent = Math.min(100, (positionSizeAmount / capital) * 100);
    const positionSizeContracts = Math.floor(positionSizeAmount / 1000); // 1k per contract standard
    const riskRewardRatio = stopLossPct > 0 ? parseFloat((takeProfitPct / stopLossPct).toFixed(2)) : 0;

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
  }

  private calculateRiskSimulationFromParams(params: StrategyParameterItem[]): RiskSimulationResult {
    const capitalParam = params.find(p => p.parameterId === 'fixed_capital_allocation');
    const riskParam = params.find(p => p.parameterId === 'max_account_risk_per_trade');
    const slParam = params.find(p => p.parameterId === 'stop_loss_percentage');
    const tpParam = params.find(p => p.parameterId === 'take_profit_percentage');
    const atrParam = params.find(p => p.parameterId === 'atr_multiplier');
    const sizingModel = params.find(p => p.parameterId === 'position_sizing_model');

    return this.calculateRiskSimulation({
      accountCapital: capitalParam ? Number(capitalParam.currentValue) : 100000,
      riskPercentage: riskParam ? Number(riskParam.currentValue) : 1.0,
      stopLossPercentage: slParam ? Number(slParam.currentValue) : 1.5,
      takeProfitPercentage: tpParam ? Number(tpParam.currentValue) : 3.5,
      atrMultiplier: atrParam ? Number(atrParam.currentValue) : 2.0,
      positionSizingModel: sizingModel ? String(sizingModel.currentValue) : 'RISK_PERCENTAGE'
    });
  }

  /**
   * Update Parameters with Audit Trail & History Snapshot
   * PART 9 & PART 10
   */
  public async updateParameters(
    strategyId: string,
    updates: Array<{ parameterId: string; newValue: any }>,
    userName: string = 'ADMIN_USER',
    reason: string = 'Manual Parameter Calibration'
  ): Promise<StrategyParametersOverview> {
    const existingParams = await this.repo.getParametersByStrategyId(strategyId);

    if (existingParams.length === 0) {
      throw new Error(`Strategy parameters for ID '${strategyId}' do not exist.`);
    }

    const paramMap = new Map(existingParams.map(p => [p.parameterId, { ...p }]));
    const auditEntries: Array<{ param: StrategyParameterItem; oldVal: string; newVal: string }> = [];

    for (const update of updates) {
      const param = paramMap.get(update.parameterId);
      if (!param) continue;

      if (param.locked) {
        throw new Error(`Parameter '${param.displayName}' is locked (${param.lockedReason || 'Admin Lock'}) and cannot be modified.`);
      }

      const oldValStr = String(param.currentValue);
      const newValStr = String(update.newValue);

      if (oldValStr !== newValStr) {
        param.currentValue = update.newValue;
        param.modifiedBy = userName;
        param.lastModified = new Date().toISOString();
        auditEntries.push({
          param,
          oldVal: oldValStr,
          newVal: newValStr
        });
      }
    }

    const updatedParamList = Array.from(paramMap.values());

    // Validate BEFORE saving!
    const validationResult = this.validateParameters(strategyId, updatedParamList);
    if (!validationResult.isValid) {
      const errMsgs = validationResult.errors.map(e => e.error).join(' | ');
      throw new Error(`Validation failed: ${errMsgs}`);
    }

    // Save to DB
    await this.repo.saveParameters(updatedParamList);

    // Save Audit Logs
    for (const audit of auditEntries) {
      await this.repo.recordAudit({
        strategyId,
        parameterId: audit.param.parameterId,
        parameterName: audit.param.displayName,
        oldValue: audit.oldVal,
        newValue: audit.newVal,
        userName,
        reason
      });
    }

    // Create Immutable History Record
    const snapshotData: Record<string, any> = {};
    updatedParamList.forEach(p => {
      snapshotData[p.parameterId] = p.currentValue;
    });

    const currentVer = updatedParamList[0]?.version || '1.0.0';
    const nextVerParts = currentVer.split('.').map(Number);
    const newVersion = `${nextVerParts[0] || 1}.${nextVerParts[1] || 0}.${(nextVerParts[2] || 0) + 1}`;

    await this.repo.recordHistory({
      strategyId,
      parametersSnapshot: snapshotData,
      version: newVersion,
      reason,
      createdBy: userName
    });

    return this.getParametersOverview(strategyId);
  }

  /**
   * Lock / Unlock Parameter
   * PART 4: Parameter Lock Engine
   */
  public async setParameterLock(
    strategyId: string,
    parameterId: string,
    locked: boolean,
    reason?: string,
    userName: string = 'ADMIN_USER'
  ): Promise<StrategyParametersOverview> {
    const param = await this.repo.getParameterByParameterId(strategyId, parameterId);
    if (!param) throw new Error(`Parameter '${parameterId}' not found.`);

    param.locked = locked;
    param.lockedReason = locked ? (reason || 'Admin Security Lock') : null;
    param.lockedBy = locked ? userName : null;
    param.lockedTimestamp = locked ? new Date().toISOString() : null;

    await this.repo.saveParameters([param]);

    await this.repo.recordAudit({
      strategyId,
      parameterId: param.parameterId,
      parameterName: param.displayName,
      oldValue: locked ? 'UNLOCKED' : 'LOCKED',
      newValue: locked ? 'LOCKED' : 'UNLOCKED',
      userName,
      reason: locked ? `Locked parameter: ${reason || 'Admin Lock'}` : 'Unlocked parameter'
    });

    return this.getParametersOverview(strategyId);
  }

  /**
   * Bulk Operations
   * PART 11: Bulk Operations
   */
  public async bulkPerformOperation(
    strategyId: string,
    operation: 'RESET' | 'LOCK' | 'UNLOCK' | 'ENABLE_AI' | 'DISABLE_AI' | 'CATEGORY_UPDATE',
    parameterIds: string[],
    payload?: { lockReason?: string; category?: ParameterCategory },
    userName: string = 'ADMIN_USER'
  ): Promise<StrategyParametersOverview> {
    const allParams = await this.repo.getParametersByStrategyId(strategyId);
    const targetParams = allParams.filter(p => parameterIds.includes(p.parameterId));

    if (targetParams.length === 0) {
      throw new Error('No valid parameters selected for bulk operation.');
    }

    const modifiedParams: StrategyParameterItem[] = [];

    for (const p of targetParams) {
      if (operation === 'RESET' && !p.locked) {
        p.currentValue = p.defaultValue;
        modifiedParams.push(p);
      } else if (operation === 'LOCK') {
        p.locked = true;
        p.lockedReason = payload?.lockReason || 'Bulk Security Lock';
        p.lockedBy = userName;
        p.lockedTimestamp = new Date().toISOString();
        modifiedParams.push(p);
      } else if (operation === 'UNLOCK') {
        p.locked = false;
        p.lockedReason = null;
        p.lockedBy = null;
        p.lockedTimestamp = null;
        modifiedParams.push(p);
      } else if (operation === 'ENABLE_AI') {
        p.aiEditable = true;
        modifiedParams.push(p);
      } else if (operation === 'DISABLE_AI') {
        p.aiEditable = false;
        modifiedParams.push(p);
      } else if (operation === 'CATEGORY_UPDATE' && payload?.category) {
        p.category = payload.category;
        modifiedParams.push(p);
      }
    }

    await this.repo.saveParameters(modifiedParams);

    await this.repo.recordAudit({
      strategyId,
      parameterId: 'BULK_OP',
      parameterName: `Bulk ${operation}`,
      oldValue: `${parameterIds.length} items`,
      newValue: operation,
      userName,
      reason: `Bulk operation executed on ${parameterIds.length} parameters`
    });

    return this.getParametersOverview(strategyId);
  }

  /**
   * Restore Version
   * PART 9: Parameter Versioning
   */
  public async restoreVersion(
    strategyId: string,
    versionNumber: string,
    userName: string = 'ADMIN_USER'
  ): Promise<StrategyParametersOverview> {
    const history = await this.repo.getHistoryByStrategyId(strategyId);
    const targetRecord = history.find(h => h.version === versionNumber);

    if (!targetRecord) {
      throw new Error(`Version '${versionNumber}' not found in strategy parameter history.`);
    }

    const updates = Object.entries(targetRecord.parametersSnapshot).map(([paramId, val]) => ({
      parameterId: paramId,
      newValue: val
    }));

    return this.updateParameters(
      strategyId,
      updates,
      userName,
      `Restored parameter configuration to Version ${versionNumber}`
    );
  }

  /**
   * Reset single parameter
   */
  public async resetParameter(strategyId: string, parameterId: string, userName: string = 'ADMIN_USER'): Promise<StrategyParametersOverview> {
    const param = await this.repo.getParameterByParameterId(strategyId, parameterId);
    if (!param) throw new Error(`Parameter '${parameterId}' not found.`);

    return this.updateParameters(
      strategyId,
      [{ parameterId, newValue: param.defaultValue }],
      userName,
      `Reset parameter '${param.displayName}' to default (${param.defaultValue})`
    );
  }

  /**
   * Reset group of parameters
   */
  public async resetGroup(strategyId: string, groupName: ParameterGroup, userName: string = 'ADMIN_USER'): Promise<StrategyParametersOverview> {
    const params = await this.repo.getParametersByStrategyId(strategyId);
    const groupParams = params.filter(p => p.group === groupName && !p.locked);

    const updates = groupParams.map(p => ({
      parameterId: p.parameterId,
      newValue: p.defaultValue
    }));

    return this.updateParameters(
      strategyId,
      updates,
      userName,
      `Reset group '${groupName}' to system default values`
    );
  }

  /**
   * Reset all parameters
   */
  public async resetAll(strategyId: string, userName: string = 'ADMIN_USER'): Promise<StrategyParametersOverview> {
    const params = await this.repo.getParametersByStrategyId(strategyId);
    const updates = params.filter(p => !p.locked).map(p => ({
      parameterId: p.parameterId,
      newValue: p.defaultValue
    }));

    return this.updateParameters(
      strategyId,
      updates,
      userName,
      'Reset all strategy parameters to certified system defaults'
    );
  }

  /**
   * Apply Preset
   * PART 2 & PART 8
   */
  public async applyPreset(strategyId: string, presetName: string, userName: string = 'ADMIN_USER'): Promise<StrategyParametersOverview> {
    const presets = await this.repo.getPresetsByStrategyId(strategyId);
    const preset = presets.find(p => p.presetName.toUpperCase() === presetName.toUpperCase());

    if (!preset) {
      throw new Error(`Preset '${presetName}' not found for strategy '${strategyId}'.`);
    }

    const updates = Object.entries(preset.parametersData).map(([parameterId, newValue]) => ({
      parameterId,
      newValue
    }));

    return this.updateParameters(
      strategyId,
      updates,
      userName,
      `Applied Preset Profile: ${preset.presetName}`
    );
  }

  /**
   * Create Custom Preset
   */
  public async createPreset(
    strategyId: string,
    presetName: string,
    description: string,
    parametersData?: Record<string, any>,
    userName: string = 'ADMIN_USER'
  ): Promise<StrategyParameterPreset> {
    let dataToSave = parametersData;
    if (!dataToSave) {
      const currentParams = await this.repo.getParametersByStrategyId(strategyId);
      dataToSave = {};
      currentParams.forEach(p => {
        dataToSave![p.parameterId] = p.currentValue;
      });
    }

    return this.repo.savePreset({
      strategyId,
      presetName,
      presetType: 'CUSTOM',
      description,
      parametersData: dataToSave,
      isSystemDefault: false,
      createdBy: userName
    });
  }

  public async updatePreset(presetId: string, updates: Partial<StrategyParameterPreset>): Promise<void> {
    await this.repo.updatePreset(presetId, updates);
  }

  public async duplicatePreset(presetId: string, newPresetName: string): Promise<StrategyParameterPreset> {
    const presets = await this.repo.getPresetsByStrategyId(''); // DB query
    // Find preset by ID
    const db = (this.repo as any);
    const preset = (await db.getPresetsByStrategyId('')).find((p: any) => p.id === presetId);
    if (!preset) throw new Error('Source preset not found');

    return this.repo.savePreset({
      strategyId: preset.strategyId,
      presetName: newPresetName,
      presetType: 'CUSTOM',
      description: `Copy of ${preset.presetName}`,
      parametersData: preset.parametersData,
      isSystemDefault: false,
      createdBy: 'ADMIN_USER'
    });
  }

  public async deletePreset(presetId: string): Promise<void> {
    await this.repo.deletePreset(presetId);
  }

  /**
   * Runtime Integration API
   * PART 14: Runtime receives ONLY approved parameters.
   * AI Models never receive hidden or locked values if prohibited.
   */
  public async getRuntimeApprovedParameters(strategyId: string, isAiConsumer: boolean = false): Promise<Record<string, any>> {
    const overview = await this.getParametersOverview(strategyId);
    const approved: Record<string, any> = {};

    overview.groups.forEach(group => {
      group.parameters.forEach(param => {
        if (!param.visible) return; // Hide invisible parameters
        if (isAiConsumer && (!param.aiEditable || param.locked)) return; // Exclude locked/non-AI editable for AI models

        approved[param.parameterId] = param.currentValue;
      });
    });

    return approved;
  }

  /**
   * Export Parameters as JSON
   */
  public async exportParameters(strategyId: string): Promise<string> {
    const params = await this.repo.getParametersByStrategyId(strategyId);
    const exportObject = {
      strategyId,
      exportedAt: new Date().toISOString(),
      parameterCount: params.length,
      parameters: params
    };
    return JSON.stringify(exportObject, null, 2);
  }

  /**
   * Import Parameters from JSON
   */
  public async importParameters(strategyId: string, jsonContent: string, userName: string = 'ADMIN_USER'): Promise<StrategyParametersOverview> {
    try {
      const data = JSON.parse(jsonContent);
      const importedParams: any[] = data.parameters || data;

      const updates = importedParams.map((p: any) => ({
        parameterId: p.parameterId || p.id || p.name,
        newValue: p.currentValue !== undefined ? p.currentValue : p.value
      }));

      return this.updateParameters(
        strategyId,
        updates,
        userName,
        'Imported parameters from external enterprise JSON file'
      );
    } catch (err: any) {
      throw new Error(`Failed to parse parameter JSON: ${err.message}`);
    }
  }

  // --- SEEDERS ---
  private async seedDefaultParametersForStrategy(strategyId: string, strategyName: string): Promise<StrategyParameterItem[]> {
    const defaults: Array<Omit<StrategyParameterItem, 'id' | 'strategyId' | 'lastModified' | 'sha256Reference'>> = [
      // 1. Entry Parameters
      {
        parameterId: 'entry_threshold',
        name: 'entry_threshold',
        displayName: 'Entry Signal Threshold',
        description: 'Sigma threshold multiplier required to trigger buy/sell entry signal.',
        formula: 'Signal = ZScore(Close - EMA) >= Threshold',
        category: 'Entry',
        group: 'Entry Parameters',
        dataType: 'Decimal',
        currentValue: 1.5,
        defaultValue: 1.5,
        minValue: 0.1,
        maxValue: 5.0,
        step: 0.1,
        unit: 'σ',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'signal_confirmation_candles',
        name: 'signal_confirmation_candles',
        displayName: 'Signal Confirmation Bars',
        description: 'Number of consecutive candle closes confirming entry trend direction.',
        formula: 'ConfirmCount >= ConfirmationBars',
        category: 'Confirmation',
        group: 'Entry Parameters',
        dataType: 'Integer',
        currentValue: 2,
        defaultValue: 2,
        minValue: 1,
        maxValue: 10,
        step: 1,
        unit: 'bars',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'entry_order_type',
        name: 'entry_order_type',
        displayName: 'Entry Order Execution Type',
        description: 'Market or Limit order protocol used when firing entry signals.',
        formula: 'OrderType ∈ {MARKET, LIMIT, STOP_LIMIT}',
        category: 'Execution',
        group: 'Entry Parameters',
        dataType: 'Enum',
        currentValue: 'LIMIT',
        defaultValue: 'LIMIT',
        options: ['MARKET', 'LIMIT', 'STOP_LIMIT'],
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: false,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },

      // 2. Exit Parameters
      {
        parameterId: 'take_profit_percentage',
        name: 'take_profit_percentage',
        displayName: 'Take Profit Target (%)',
        description: 'Target profit percentage relative to position average entry price.',
        formula: 'TPPrice = EntryPrice * (1 + TakeProfit% / 100)',
        category: 'Exit',
        group: 'Exit Parameters',
        dataType: 'Percentage',
        currentValue: 3.5,
        defaultValue: 3.5,
        minValue: 0.5,
        maxValue: 25.0,
        step: 0.25,
        unit: '%',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'stop_loss_percentage',
        name: 'stop_loss_percentage',
        displayName: 'Hard Stop Loss Limit (%)',
        description: 'Mandatory non-negotiable hard stop loss protection threshold.',
        formula: 'SLPrice = EntryPrice * (1 - StopLoss% / 100)',
        category: 'Risk',
        group: 'Exit Parameters',
        dataType: 'Percentage',
        currentValue: 1.5,
        defaultValue: 1.5,
        minValue: 0.25,
        maxValue: 10.0,
        step: 0.25,
        unit: '%',
        required: true,
        visible: true,
        editable: true,
        locked: true,
        lockedReason: 'Locked by Risk Governance Committee to enforce max 1.5% drawdown cap',
        lockedBy: 'RISK_ADMIN_OFFICER',
        lockedTimestamp: new Date().toISOString(),
        aiEditable: false,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: false,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'trailing_stop_enabled',
        name: 'trailing_stop_enabled',
        displayName: 'Trailing Stop Switch',
        description: 'Enable or disable dynamic trailing stop loss adjustment.',
        formula: 'TrailingActive = TrailingStopEnabled == true',
        category: 'Exit',
        group: 'Exit Parameters',
        dataType: 'Boolean',
        currentValue: true,
        defaultValue: true,
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'trailing_stop_activation',
        name: 'trailing_stop_activation',
        displayName: 'Trailing Stop Trigger (%)',
        description: 'Profit threshold percentage required to arm dynamic trailing stop.',
        formula: 'TrailArmPrice = EntryPrice * (1 + Trigger% / 100)',
        category: 'Exit',
        group: 'Exit Parameters',
        dataType: 'Percentage',
        currentValue: 2.0,
        defaultValue: 2.0,
        minValue: 0.5,
        maxValue: 15.0,
        step: 0.5,
        unit: '%',
        required: false,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        dependencyRule: {
          dependsOnParameterId: 'trailing_stop_enabled',
          expectedValue: false,
          action: 'HIDE',
          message: 'Hidden because Trailing Stop Switch is disabled'
        },
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'time_based_exit_minutes',
        name: 'time_based_exit_minutes',
        displayName: 'Time-Based Exit Horizon',
        description: 'Maximum position holding duration before force liquidation at market close.',
        formula: 'DurationMin <= ExitHorizonMinutes',
        category: 'Timing',
        group: 'Exit Parameters',
        dataType: 'Integer',
        currentValue: 240,
        defaultValue: 240,
        minValue: 15,
        maxValue: 1440,
        step: 15,
        unit: 'min',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },

      // 3. Risk Parameters
      {
        parameterId: 'max_account_risk_per_trade',
        name: 'max_account_risk_per_trade',
        displayName: 'Max Risk Per Trade (%)',
        description: 'Percentage of total portfolio NAV risked on a single order execution.',
        formula: 'MaxRiskAmt = TotalNAV * (RiskPerTrade% / 100)',
        category: 'Risk',
        group: 'Risk Parameters',
        dataType: 'Percentage',
        currentValue: 1.0,
        defaultValue: 1.0,
        minValue: 0.1,
        maxValue: 5.0,
        step: 0.1,
        unit: '% NAV',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: false,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        dependencyRule: {
          dependsOnParameterId: 'position_sizing_model',
          expectedValue: 'FIXED_AMOUNT',
          action: 'HIDE',
          message: 'Hidden because Position Sizing Model is FIXED_AMOUNT'
        },
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'max_daily_drawdown_limit',
        name: 'max_daily_drawdown_limit',
        displayName: 'Max Daily Drawdown Cap (%)',
        description: 'Circuit breaker limit halting trading if intraday loss breaches threshold.',
        formula: 'DailyLoss% <= MaxDailyDrawdownCap%',
        category: 'Risk',
        group: 'Risk Parameters',
        dataType: 'Percentage',
        currentValue: 3.0,
        defaultValue: 3.0,
        minValue: 0.5,
        maxValue: 10.0,
        step: 0.5,
        unit: '%',
        required: true,
        visible: true,
        editable: true,
        locked: true,
        lockedReason: 'Institutional Enterprise Safety Mandate',
        lockedBy: 'RISK_ADMIN_OFFICER',
        lockedTimestamp: new Date().toISOString(),
        aiEditable: false,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: false,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'max_open_positions',
        name: 'max_open_positions',
        displayName: 'Max Concurrent Open Positions',
        description: 'Maximum allowable concurrent active positions per portfolio strategy instance.',
        formula: 'ActivePosCount <= MaxOpenPositions',
        category: 'Position Size',
        group: 'Risk Parameters',
        dataType: 'Integer',
        currentValue: 3,
        defaultValue: 3,
        minValue: 1,
        maxValue: 20,
        step: 1,
        unit: 'pos',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },

      // 4. Indicator Parameters
      {
        parameterId: 'atr_enabled',
        name: 'atr_enabled',
        displayName: 'ATR Volatility Filter Switch',
        description: 'Enable or disable Average True Range volatility expansion filter.',
        formula: 'ATRActive = ATR_Enabled == true',
        category: 'Volatility',
        group: 'Indicator Parameters',
        dataType: 'Boolean',
        currentValue: true,
        defaultValue: true,
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'atr_multiplier',
        name: 'atr_multiplier',
        displayName: 'ATR Multiplier Factor',
        description: 'Multiplier applied to 14-period ATR for volatility breakout calculation.',
        formula: 'VolBand = Close +/- (ATR14 * ATRMultiplier)',
        category: 'Volatility',
        group: 'Indicator Parameters',
        dataType: 'Decimal',
        currentValue: 2.0,
        defaultValue: 2.0,
        minValue: 0.5,
        maxValue: 10.0,
        step: 0.1,
        unit: 'x',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        dependencyRule: {
          dependsOnParameterId: 'atr_enabled',
          expectedValue: false,
          action: 'HIDE',
          message: 'Hidden because ATR Volatility Filter Switch is disabled'
        },
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'fast_ema_period',
        name: 'fast_ema_period',
        displayName: 'Fast EMA Lookback Period',
        description: 'Candle lookback window for short-term Exponential Moving Average.',
        formula: 'FastEMA = EMA(Close, FastEMAPeriod)',
        category: 'Indicators',
        group: 'Indicator Parameters',
        dataType: 'Integer',
        currentValue: 20,
        defaultValue: 20,
        minValue: 3,
        maxValue: 100,
        step: 1,
        unit: 'bars',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'slow_ema_period',
        name: 'slow_ema_period',
        displayName: 'Slow EMA Lookback Period',
        description: 'Candle lookback window for medium-term Exponential Moving Average.',
        formula: 'SlowEMA = EMA(Close, SlowEMAPeriod)',
        category: 'Indicators',
        group: 'Indicator Parameters',
        dataType: 'Integer',
        currentValue: 50,
        defaultValue: 50,
        minValue: 10,
        maxValue: 300,
        step: 1,
        unit: 'bars',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'rsi_period',
        name: 'rsi_period',
        displayName: 'RSI Momentum Period',
        description: 'Relative Strength Index momentum evaluation period.',
        formula: 'RSI = 100 - (100 / (1 + RS))',
        category: 'Indicators',
        group: 'Indicator Parameters',
        dataType: 'Integer',
        currentValue: 14,
        defaultValue: 14,
        minValue: 2,
        maxValue: 50,
        step: 1,
        unit: 'bars',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },

      // 5. Money Management
      {
        parameterId: 'fixed_capital_allocation',
        name: 'fixed_capital_allocation',
        displayName: 'Capital Allocation Amount',
        description: 'Base dedicated capital assigned to this algorithm instance.',
        formula: 'AssignedNAV = FixedCapitalAmt',
        category: 'Capital Allocation',
        group: 'Money Management',
        dataType: 'Currency',
        currentValue: 100000,
        defaultValue: 100000,
        minValue: 10000,
        maxValue: 10000000,
        step: 5000,
        unit: 'INR',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: false,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'position_sizing_model',
        name: 'position_sizing_model',
        displayName: 'Position Sizing Algorithm',
        description: 'Dynamic sizing strategy governing contract/share quantity calculation.',
        formula: 'SizingAlgo ∈ {FIXED_AMOUNT, RISK_PERCENTAGE, KELLY_CRITERION, VOLATILITY_ADJUSTED}',
        category: 'Position Size',
        group: 'Money Management',
        dataType: 'Enum',
        currentValue: 'RISK_PERCENTAGE',
        defaultValue: 'RISK_PERCENTAGE',
        options: ['FIXED_AMOUNT', 'RISK_PERCENTAGE', 'KELLY_CRITERION', 'VOLATILITY_ADJUSTED'],
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },

      // 6. Execution Parameters
      {
        parameterId: 'max_allowed_slippage',
        name: 'max_allowed_slippage',
        displayName: 'Max Allowed Slippage (%)',
        description: 'Maximum tolerance for price deviation between signal and execution price.',
        formula: 'Slippage% = |ExecPrice - SignalPrice| / SignalPrice * 100',
        category: 'Execution',
        group: 'Execution Parameters',
        dataType: 'Percentage',
        currentValue: 0.1,
        defaultValue: 0.1,
        minValue: 0.01,
        maxValue: 2.0,
        step: 0.05,
        unit: '%',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'execution_urgency',
        name: 'execution_urgency',
        displayName: 'Execution Engine Urgency',
        description: 'Broker routing urgency affecting order execution speed vs spread cost.',
        formula: 'Urgency ∈ {LOW, MEDIUM, HIGH, SWIFT}',
        category: 'Broker Controls',
        group: 'Execution Parameters',
        dataType: 'Enum',
        currentValue: 'MEDIUM',
        defaultValue: 'MEDIUM',
        options: ['LOW', 'MEDIUM', 'HIGH', 'SWIFT'],
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'paper_trading_mode',
        name: 'paper_trading_mode',
        displayName: 'Paper Trading Execution Flag',
        description: 'When true, routes orders to simulated paper engine without capital risk.',
        formula: 'IsPaper = PaperTradingMode == true',
        category: 'Paper Trading',
        group: 'Execution Parameters',
        dataType: 'Boolean',
        currentValue: true,
        defaultValue: true,
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: true,
        productionEnabled: false,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },

      // 7. Advanced Parameters
      {
        parameterId: 'min_volume_threshold',
        name: 'min_volume_threshold',
        displayName: 'Minimum Volume Filter',
        description: 'Minimum 5-minute volume required to qualify trade entries.',
        formula: 'Volume5M >= MinVolumeThreshold',
        category: 'Volume',
        group: 'Advanced Parameters',
        dataType: 'Integer',
        currentValue: 50000,
        defaultValue: 50000,
        minValue: 1000,
        maxValue: 10000000,
        step: 5000,
        unit: 'vol',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: true,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'trading_session_window',
        name: 'trading_session_window',
        displayName: 'Active Trading Time Window',
        description: 'Daily operational time window during which strategy triggers trades.',
        formula: 'CurrentTime ∈ [StartTime, EndTime]',
        category: 'Timing',
        group: 'Advanced Parameters',
        dataType: 'Time',
        currentValue: '09:15-15:30',
        defaultValue: '09:15-15:30',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: false,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },

      // 8. AI Permission
      {
        parameterId: 'ai_auto_tuning_enabled',
        name: 'ai_auto_tuning_enabled',
        displayName: 'AI Model Auto-Tuning Permitted',
        description: 'Grants AI ARINA autonomous permission to calibrate non-locked parameters.',
        formula: 'AIPermitted = AIAutoTuningEnabled == true',
        category: 'Filters',
        group: 'AI Permission',
        dataType: 'Boolean',
        currentValue: true,
        defaultValue: true,
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: false,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'ai_max_param_drift_percent',
        name: 'ai_max_param_drift_percent',
        displayName: 'Max AI Parameter Drift Cap (%)',
        description: 'Maximum percentage drift permitted when AI modifies configurable values.',
        formula: '|NewValue - BaselineValue| / BaselineValue <= MaxDrift%',
        category: 'Filters',
        group: 'AI Permission',
        dataType: 'Percentage',
        currentValue: 15.0,
        defaultValue: 15.0,
        minValue: 1.0,
        maxValue: 50.0,
        step: 1.0,
        unit: '%',
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: false,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      },
      {
        parameterId: 'ai_require_admin_approval_for_changes',
        name: 'ai_require_admin_approval_for_changes',
        displayName: 'Require Admin Approval For AI Drift',
        description: 'Forces human supervisor sign-off before AI parameter recommendations apply.',
        formula: 'ApplyState = AdminApprovalRequired ? PENDING_REVIEW : AUTO_COMMITTED',
        category: 'Broker Controls',
        group: 'AI Permission',
        dataType: 'Boolean',
        currentValue: true,
        defaultValue: true,
        required: true,
        visible: true,
        editable: true,
        locked: false,
        aiEditable: false,
        adminEditable: true,
        readOnly: false,
        runtimeAdjustable: true,
        paperTradingOnly: false,
        productionEnabled: true,
        version: '1.0.0',
        modifiedBy: 'AI_ARINA_SYSTEM'
      }
    ];

    const fullItems: StrategyParameterItem[] = defaults.map(d => ({
      ...d,
      id: `param-${crypto.randomUUID()}`,
      strategyId,
      lastModified: new Date().toISOString(),
      sha256Reference: crypto.createHash('sha256').update(`${strategyId}:${d.parameterId}:${d.currentValue}`).digest('hex')
    }));

    await this.repo.saveParameters(fullItems);
    return fullItems;
  }

  private async seedDefaultGroupsForStrategy(strategyId: string): Promise<StrategyParameterGroupInfo[]> {
    const groupOrderList: Array<{ groupName: ParameterGroup; displayName: string; desc: string }> = [
      { groupName: 'Entry Parameters', displayName: 'Entry Parameters', desc: 'Trigger thresholds, signal confirmation bars, and order execution protocol.' },
      { groupName: 'Exit Parameters', displayName: 'Exit Parameters', desc: 'Take profit targets, stop loss limits, trailing triggers, and horizon exits.' },
      { groupName: 'Risk Parameters', displayName: 'Risk Parameters', desc: 'Portfolio NAV risk limits, max drawdown circuit breakers, and position count caps.' },
      { groupName: 'Indicator Parameters', displayName: 'Indicator Parameters', desc: 'EMA lookbacks, RSI momentum thresholds, and volatility window indicators.' },
      { groupName: 'Money Management', displayName: 'Money Management', desc: 'Capital allocation amounts, position sizing algorithms, and leverage controls.' },
      { groupName: 'Execution Parameters', displayName: 'Execution Parameters', desc: 'Max allowed slippage tolerances, order urgency, and paper execution flags.' },
      { groupName: 'Advanced Parameters', displayName: 'Advanced Parameters', desc: 'Minimum volume thresholds, ATR volatility filters, and operational trading windows.' },
      { groupName: 'AI Permission', displayName: 'AI Permission', desc: 'AI model auto-tuning limits, parameter drift caps, and admin approval rules.' }
    ];

    const groupInfos: StrategyParameterGroupInfo[] = groupOrderList.map((g, idx) => ({
      id: `grp-${crypto.randomUUID()}`,
      strategyId,
      groupName: g.groupName,
      displayName: g.displayName,
      description: g.desc,
      displayOrder: idx + 1,
      isCollapsed: false
    }));

    await this.repo.saveGroups(groupInfos);
    return groupInfos;
  }

  private async seedDefaultPresetsForStrategy(strategyId: string): Promise<void> {
    const presetProfiles = [
      {
        name: 'Conservative',
        type: 'CONSERVATIVE',
        desc: 'Low drawdown risk profile with tight stop loss and conservative position sizing.',
        data: {
          take_profit_percentage: 2.5,
          stop_loss_percentage: 1.0,
          max_account_risk_per_trade: 0.5,
          max_open_positions: 2,
          max_allowed_slippage: 0.05,
          atr_enabled: true,
          atr_multiplier: 1.5,
          position_sizing_model: 'RISK_PERCENTAGE'
        }
      },
      {
        name: 'Balanced',
        type: 'BALANCED',
        desc: 'Institutional balanced parameters optimizing Sharpe ratio and steady growth.',
        data: {
          take_profit_percentage: 3.5,
          stop_loss_percentage: 1.5,
          max_account_risk_per_trade: 1.0,
          max_open_positions: 3,
          max_allowed_slippage: 0.1,
          atr_enabled: true,
          atr_multiplier: 2.0,
          position_sizing_model: 'RISK_PERCENTAGE'
        }
      },
      {
        name: 'Aggressive',
        type: 'AGGRESSIVE',
        desc: 'High volatility expansion profile capturing wider momentum swings.',
        data: {
          take_profit_percentage: 6.0,
          stop_loss_percentage: 2.5,
          max_account_risk_per_trade: 2.0,
          max_open_positions: 5,
          max_allowed_slippage: 0.2,
          atr_enabled: true,
          atr_multiplier: 3.0,
          position_sizing_model: 'KELLY_CRITERION'
        }
      },
      {
        name: 'Scalping',
        type: 'SCALPING',
        desc: 'High frequency 1-minute intraday scalping preset with swift execution.',
        data: {
          entry_threshold: 0.8,
          signal_confirmation_candles: 1,
          take_profit_percentage: 1.2,
          stop_loss_percentage: 0.6,
          fast_ema_period: 9,
          slow_ema_period: 21,
          time_based_exit_minutes: 30,
          execution_urgency: 'SWIFT'
        }
      },
      {
        name: 'Swing',
        type: 'SWING',
        desc: 'Multi-day positional trend capture preset with wider stop loss and higher profit targets.',
        data: {
          take_profit_percentage: 8.0,
          stop_loss_percentage: 3.0,
          fast_ema_period: 50,
          slow_ema_period: 200,
          time_based_exit_minutes: 1440,
          position_sizing_model: 'VOLATILITY_ADJUSTED'
        }
      },
      {
        name: 'Intraday',
        type: 'INTRADAY',
        desc: 'NSE 5M/15M intraday equity & futures session profile automatically closing before 15:30.',
        data: {
          trading_session_window: '09:15-15:15',
          time_based_exit_minutes: 360,
          take_profit_percentage: 3.0,
          stop_loss_percentage: 1.2,
          trailing_stop_enabled: true,
          trailing_stop_activation: 1.5
        }
      },
      {
        name: 'Commodity',
        type: 'COMMODITY',
        desc: 'MCX Crude Oil & Gold futures volatility profile tailored for evening session momentum.',
        data: {
          trading_session_window: '09:00-23:30',
          min_volume_threshold: 100000,
          max_allowed_slippage: 0.15,
          atr_enabled: true,
          atr_multiplier: 2.5
        }
      },
      {
        name: 'ETF',
        type: 'ETF',
        desc: 'Low friction sector ETF rotation profile prioritizing tight spreads.',
        data: {
          take_profit_percentage: 4.0,
          stop_loss_percentage: 1.5,
          position_sizing_model: 'RISK_PERCENTAGE',
          fixed_capital_allocation: 250000
        }
      },
      {
        name: 'Admin Custom',
        type: 'CUSTOM',
        desc: 'Administrator customized parameters profile.',
        data: {}
      }
    ];

    for (const p of presetProfiles) {
      await this.repo.savePreset({
        strategyId,
        presetName: p.name,
        presetType: p.type,
        description: p.desc,
        parametersData: p.data,
        isSystemDefault: p.type !== 'CUSTOM',
        createdBy: 'AI_ARINA_SYSTEM'
      });
    }
  }
}
