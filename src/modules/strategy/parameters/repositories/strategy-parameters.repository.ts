import { getDb } from "../../../../db/client.ts";
import { sql } from "drizzle-orm";
import { pino } from "pino";
import crypto from "crypto";
import {
  StrategyParameterItem,
  StrategyParameterGroupInfo,
  StrategyParameterHistoryRecord,
  StrategyParameterPreset,
  StrategyParameterValidationResult,
  StrategyParameterAuditRecord,
  ParameterGroup,
  ParameterCategory,
  ParameterDataType,
  ParameterDependencyRule
} from "../types/index.ts";

const logger = pino({ name: "strategy-parameters-repo" });

export class StrategyParametersRepository {
  private static instance: StrategyParametersRepository;

  public static getInstance(): StrategyParametersRepository {
    if (!StrategyParametersRepository.instance) {
      StrategyParametersRepository.instance = new StrategyParametersRepository();
    }
    return StrategyParametersRepository.instance;
  }

  public async ensureTablesExist(): Promise<void> {
    const db = getDb();
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_parameters (
          id VARCHAR(100) PRIMARY KEY,
          parameter_id VARCHAR(100) NOT NULL,
          strategy_id VARCHAR(100) NOT NULL,
          parameter_name VARCHAR(150) NOT NULL,
          display_name VARCHAR(150) NOT NULL,
          description TEXT,
          formula TEXT,
          category VARCHAR(100) NOT NULL,
          group_name VARCHAR(100) NOT NULL,
          data_type VARCHAR(50) NOT NULL,
          current_value TEXT NOT NULL,
          default_value TEXT NOT NULL,
          minimum_value TEXT,
          maximum_value TEXT,
          step TEXT,
          unit VARCHAR(50),
          required BOOLEAN DEFAULT TRUE,
          visible BOOLEAN DEFAULT TRUE,
          editable BOOLEAN DEFAULT TRUE,
          locked BOOLEAN DEFAULT FALSE,
          locked_reason TEXT,
          locked_by VARCHAR(100),
          locked_timestamp TIMESTAMP,
          ai_editable BOOLEAN DEFAULT TRUE,
          admin_editable BOOLEAN DEFAULT TRUE,
          read_only BOOLEAN DEFAULT FALSE,
          runtime_adjustable BOOLEAN DEFAULT TRUE,
          paper_trading_only BOOLEAN DEFAULT FALSE,
          production_enabled BOOLEAN DEFAULT TRUE,
          dependency_rule JSONB DEFAULT NULL,
          validation_rule TEXT,
          options JSONB DEFAULT '[]'::jsonb,
          version VARCHAR(50) DEFAULT '1.0.0',
          sha256_reference VARCHAR(100),
          modified_by VARCHAR(100) DEFAULT 'SYSTEM',
          last_modified TIMESTAMP DEFAULT NOW(),
          created_time TIMESTAMP DEFAULT NOW(),
          updated_time TIMESTAMP DEFAULT NOW()
        );

        -- Safe column migrations for strategy_parameters
        ALTER TABLE strategy_parameters ALTER COLUMN block_id DROP NOT NULL;
        ALTER TABLE strategy_parameters ALTER COLUMN key DROP NOT NULL;
        ALTER TABLE strategy_parameters ALTER COLUMN value DROP NOT NULL;
        ALTER TABLE strategy_parameters ALTER COLUMN value_type DROP NOT NULL;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS strategy_id VARCHAR(100);
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS parameter_id VARCHAR(100);
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS parameter_name VARCHAR(150);
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS display_name VARCHAR(150);
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS description TEXT;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS formula TEXT;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS category VARCHAR(100);
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS group_name VARCHAR(100);
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS data_type VARCHAR(50);
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS current_value TEXT;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS default_value TEXT;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS minimum_value TEXT;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS maximum_value TEXT;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS step TEXT;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS unit VARCHAR(50);
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS required BOOLEAN DEFAULT TRUE;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS editable BOOLEAN DEFAULT TRUE;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT FALSE;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS locked_reason TEXT;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS locked_by VARCHAR(100);
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS locked_timestamp TIMESTAMP;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS ai_editable BOOLEAN DEFAULT TRUE;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS admin_editable BOOLEAN DEFAULT TRUE;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS read_only BOOLEAN DEFAULT FALSE;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS runtime_adjustable BOOLEAN DEFAULT TRUE;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS paper_trading_only BOOLEAN DEFAULT FALSE;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS production_enabled BOOLEAN DEFAULT TRUE;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS dependency_rule JSONB DEFAULT NULL;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS validation_rule TEXT;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS version VARCHAR(50) DEFAULT '1.0.0';
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS sha256_reference VARCHAR(100);
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS modified_by VARCHAR(100) DEFAULT 'SYSTEM';
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS last_modified TIMESTAMP DEFAULT NOW();
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS created_time TIMESTAMP DEFAULT NOW();
        ALTER TABLE strategy_parameters ADD COLUMN IF NOT EXISTS updated_time TIMESTAMP DEFAULT NOW();

        CREATE TABLE IF NOT EXISTS strategy_parameter_groups (
          id VARCHAR(100) PRIMARY KEY,
          strategy_id VARCHAR(100) NOT NULL,
          group_name VARCHAR(100) NOT NULL,
          display_name VARCHAR(150) NOT NULL,
          description TEXT,
          display_order INT DEFAULT 0,
          is_collapsed BOOLEAN DEFAULT FALSE,
          created_time TIMESTAMP DEFAULT NOW(),
          updated_time TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS strategy_parameter_history (
          id VARCHAR(100) PRIMARY KEY,
          strategy_id VARCHAR(100) NOT NULL,
          preset_name VARCHAR(100),
          parameters_snapshot JSONB NOT NULL,
          version VARCHAR(50) NOT NULL,
          reason TEXT,
          created_by VARCHAR(100) NOT NULL,
          created_time TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS strategy_parameter_presets (
          id VARCHAR(100) PRIMARY KEY,
          strategy_id VARCHAR(100) NOT NULL,
          preset_name VARCHAR(100) NOT NULL,
          preset_type VARCHAR(50) DEFAULT 'CUSTOM',
          description TEXT,
          parameters_data JSONB NOT NULL,
          is_system_default BOOLEAN DEFAULT FALSE,
          is_archived BOOLEAN DEFAULT FALSE,
          created_by VARCHAR(100) DEFAULT 'SYSTEM',
          created_time TIMESTAMP DEFAULT NOW(),
          updated_time TIMESTAMP DEFAULT NOW()
        );

        ALTER TABLE strategy_parameter_presets ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

        CREATE TABLE IF NOT EXISTS strategy_parameter_validation (
          id VARCHAR(100) PRIMARY KEY,
          strategy_id VARCHAR(100) NOT NULL,
          is_valid BOOLEAN DEFAULT TRUE,
          error_count INT DEFAULT 0,
          warning_count INT DEFAULT 0,
          errors JSONB DEFAULT '[]'::jsonb,
          warnings JSONB DEFAULT '[]'::jsonb,
          suggestions JSONB DEFAULT '[]'::jsonb,
          dependency_failures JSONB DEFAULT '[]'::jsonb,
          missing_required JSONB DEFAULT '[]'::jsonb,
          validated_at TIMESTAMP DEFAULT NOW()
        );

        ALTER TABLE strategy_parameter_validation ADD COLUMN IF NOT EXISTS warning_count INT DEFAULT 0;
        ALTER TABLE strategy_parameter_validation ADD COLUMN IF NOT EXISTS suggestions JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE strategy_parameter_validation ADD COLUMN IF NOT EXISTS dependency_failures JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE strategy_parameter_validation ADD COLUMN IF NOT EXISTS missing_required JSONB DEFAULT '[]'::jsonb;

        CREATE TABLE IF NOT EXISTS strategy_parameter_audit (
          id VARCHAR(100) PRIMARY KEY,
          strategy_id VARCHAR(100) NOT NULL,
          parameter_id VARCHAR(100) NOT NULL,
          parameter_name VARCHAR(150) NOT NULL,
          old_value TEXT,
          new_value TEXT,
          user_name VARCHAR(100) NOT NULL,
          reason TEXT,
          sha256_hash VARCHAR(100),
          timestamp TIMESTAMP DEFAULT NOW()
        );

        ALTER TABLE strategy_parameter_audit ADD COLUMN IF NOT EXISTS sha256_hash VARCHAR(100);
      `);
      logger.info("Strategy parameters tables verified and synced.");
    } catch (error) {
      logger.error({ error }, "Error ensuring strategy parameters tables exist");
    }
  }

  // --- PARAMETERS CRUD ---
  public async getParametersByStrategyId(strategyId: string): Promise<StrategyParameterItem[]> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.execute(sql`
      SELECT * FROM strategy_parameters 
      WHERE strategy_id = ${strategyId} 
      ORDER BY group_name ASC, parameter_name ASC
    `);

    return (result.rows as any[]).map(row => this.mapRowToParameterItem(row));
  }

  public async getParameterByParameterId(strategyId: string, parameterId: string): Promise<StrategyParameterItem | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.execute(sql`
      SELECT * FROM strategy_parameters 
      WHERE strategy_id = ${strategyId} AND parameter_id = ${parameterId}
      LIMIT 1
    `);
    if (result.rows.length === 0) return null;
    return this.mapRowToParameterItem(result.rows[0]);
  }

  public async saveParameters(parameters: StrategyParameterItem[]): Promise<void> {
    await this.ensureTablesExist();
    const db = getDb();

    for (const param of parameters) {
      const sha256 = crypto
        .createHash("sha256")
        .update(`${param.strategyId}:${param.parameterId}:${param.currentValue}:${param.version}`)
        .digest("hex");

      const optionsJson = JSON.stringify(param.options || []);
      const depRuleJson = param.dependencyRule ? JSON.stringify(param.dependencyRule) : null;

      await db.execute(sql`
        INSERT INTO strategy_parameters (
          id, parameter_id, strategy_id, parameter_name, display_name, description, formula,
          category, group_name, data_type, current_value, default_value, minimum_value,
          maximum_value, step, unit, required, visible, editable, locked, locked_reason, locked_by, locked_timestamp,
          ai_editable, admin_editable, read_only, runtime_adjustable, paper_trading_only, production_enabled,
          dependency_rule, validation_rule, options, version, sha256_reference, modified_by,
          last_modified, updated_time
        ) VALUES (
          ${param.id}, ${param.parameterId}, ${param.strategyId}, ${param.name}, ${param.displayName}, ${param.description}, ${param.formula || null},
          ${param.category}, ${param.group}, ${param.dataType}, ${String(param.currentValue)}, ${String(param.defaultValue)},
          ${param.minValue !== undefined && param.minValue !== null ? String(param.minValue) : null},
          ${param.maxValue !== undefined && param.maxValue !== null ? String(param.maxValue) : null},
          ${param.step !== undefined && param.step !== null ? String(param.step) : null},
          ${param.unit || null}, ${param.required}, ${param.visible}, ${param.editable}, ${param.locked},
          ${param.lockedReason || null}, ${param.lockedBy || null}, ${param.lockedTimestamp ? new Date(param.lockedTimestamp) : null},
          ${param.aiEditable}, ${param.adminEditable}, ${param.readOnly ?? false}, ${param.runtimeAdjustable ?? true},
          ${param.paperTradingOnly ?? false}, ${param.productionEnabled ?? true},
          ${depRuleJson ? sql`${depRuleJson}::jsonb` : sql`NULL`}, ${param.validationRule || null}, ${optionsJson}::jsonb,
          ${param.version}, ${sha256}, ${param.modifiedBy || 'SYSTEM'}, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          current_value = EXCLUDED.current_value,
          default_value = EXCLUDED.default_value,
          minimum_value = EXCLUDED.minimum_value,
          maximum_value = EXCLUDED.maximum_value,
          step = EXCLUDED.step,
          unit = EXCLUDED.unit,
          required = EXCLUDED.required,
          visible = EXCLUDED.visible,
          editable = EXCLUDED.editable,
          locked = EXCLUDED.locked,
          locked_reason = EXCLUDED.locked_reason,
          locked_by = EXCLUDED.locked_by,
          locked_timestamp = EXCLUDED.locked_timestamp,
          ai_editable = EXCLUDED.ai_editable,
          admin_editable = EXCLUDED.admin_editable,
          read_only = EXCLUDED.read_only,
          runtime_adjustable = EXCLUDED.runtime_adjustable,
          paper_trading_only = EXCLUDED.paper_trading_only,
          production_enabled = EXCLUDED.production_enabled,
          dependency_rule = EXCLUDED.dependency_rule,
          validation_rule = EXCLUDED.validation_rule,
          options = EXCLUDED.options,
          version = EXCLUDED.version,
          sha256_reference = EXCLUDED.sha256_reference,
          modified_by = EXCLUDED.modified_by,
          last_modified = NOW(),
          updated_time = NOW();
      `);
    }
  }

  // --- GROUPS CRUD ---
  public async getGroupsByStrategyId(strategyId: string): Promise<StrategyParameterGroupInfo[]> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.execute(sql`
      SELECT * FROM strategy_parameter_groups 
      WHERE strategy_id = ${strategyId} 
      ORDER BY display_order ASC
    `);

    return (result.rows as any[]).map(row => ({
      id: row.id,
      strategyId: row.strategy_id,
      groupName: row.group_name as ParameterGroup,
      displayName: row.display_name,
      description: row.description || "",
      displayOrder: row.display_order || 0,
      isCollapsed: row.is_collapsed || false
    }));
  }

  public async saveGroups(groups: StrategyParameterGroupInfo[]): Promise<void> {
    await this.ensureTablesExist();
    const db = getDb();
    for (const group of groups) {
      await db.execute(sql`
        INSERT INTO strategy_parameter_groups (
          id, strategy_id, group_name, display_name, description, display_order, is_collapsed, updated_time
        ) VALUES (
          ${group.id}, ${group.strategyId}, ${group.groupName}, ${group.displayName}, ${group.description}, ${group.displayOrder}, ${group.isCollapsed}, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          description = EXCLUDED.description,
          display_order = EXCLUDED.display_order,
          is_collapsed = EXCLUDED.is_collapsed,
          updated_time = NOW();
      `);
    }
  }

  // --- HISTORY LOGGING ---
  public async recordHistory(record: Omit<StrategyParameterHistoryRecord, 'id' | 'createdTime'>): Promise<StrategyParameterHistoryRecord> {
    await this.ensureTablesExist();
    const db = getDb();
    const id = `hist-${crypto.randomUUID()}`;
    const snapshotJson = JSON.stringify(record.parametersSnapshot);

    await db.execute(sql`
      INSERT INTO strategy_parameter_history (
        id, strategy_id, preset_name, parameters_snapshot, version, reason, created_by, created_time
      ) VALUES (
        ${id}, ${record.strategyId}, ${record.presetName || null}, ${snapshotJson}::jsonb, ${record.version}, ${record.reason || null}, ${record.createdBy}, NOW()
      )
    `);

    return {
      id,
      strategyId: record.strategyId,
      presetName: record.presetName,
      parametersSnapshot: record.parametersSnapshot,
      version: record.version,
      reason: record.reason,
      createdBy: record.createdBy,
      createdTime: new Date().toISOString()
    };
  }

  public async getHistoryByStrategyId(strategyId: string): Promise<StrategyParameterHistoryRecord[]> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.execute(sql`
      SELECT * FROM strategy_parameter_history 
      WHERE strategy_id = ${strategyId} 
      ORDER BY created_time DESC 
      LIMIT 50
    `);

    return (result.rows as any[]).map(row => ({
      id: row.id,
      strategyId: row.strategy_id,
      presetName: row.preset_name,
      parametersSnapshot: typeof row.parameters_snapshot === 'string' ? JSON.parse(row.parameters_snapshot) : row.parameters_snapshot,
      version: row.version,
      reason: row.reason,
      createdBy: row.created_by,
      createdTime: new Date(row.created_time).toISOString()
    }));
  }

  // --- PRESETS CRUD ---
  public async getPresetsByStrategyId(strategyId: string): Promise<StrategyParameterPreset[]> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.execute(sql`
      SELECT * FROM strategy_parameter_presets 
      WHERE strategy_id = ${strategyId} AND (is_archived IS FALSE OR is_archived IS NULL)
      ORDER BY is_system_default DESC, preset_name ASC
    `);

    return (result.rows as any[]).map(row => ({
      id: row.id,
      strategyId: row.strategy_id,
      presetName: row.preset_name,
      presetType: row.preset_type || 'CUSTOM',
      description: row.description,
      parametersData: typeof row.parameters_data === 'string' ? JSON.parse(row.parameters_data) : row.parameters_data,
      isSystemDefault: row.is_system_default || false,
      isArchived: row.is_archived || false,
      createdBy: row.created_by || 'SYSTEM',
      createdTime: new Date(row.created_time).toISOString(),
      updatedTime: new Date(row.updated_time).toISOString()
    }));
  }

  public async savePreset(preset: Omit<StrategyParameterPreset, 'id' | 'createdTime' | 'updatedTime'>): Promise<StrategyParameterPreset> {
    await this.ensureTablesExist();
    const db = getDb();
    const id = `preset-${crypto.randomUUID()}`;
    const dataJson = JSON.stringify(preset.parametersData);

    await db.execute(sql`
      INSERT INTO strategy_parameter_presets (
        id, strategy_id, preset_name, preset_type, description, parameters_data, is_system_default, is_archived, created_by, created_time, updated_time
      ) VALUES (
        ${id}, ${preset.strategyId}, ${preset.presetName}, ${preset.presetType || 'CUSTOM'}, ${preset.description || null}, ${dataJson}::jsonb, ${preset.isSystemDefault || false}, ${preset.isArchived || false}, ${preset.createdBy || 'SYSTEM'}, NOW(), NOW()
      )
    `);

    return {
      id,
      ...preset,
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    };
  }

  public async updatePreset(presetId: string, updates: Partial<StrategyParameterPreset>): Promise<void> {
    await this.ensureTablesExist();
    const db = getDb();
    if (updates.presetName) {
      await db.execute(sql`UPDATE strategy_parameter_presets SET preset_name = ${updates.presetName}, updated_time = NOW() WHERE id = ${presetId}`);
    }
    if (updates.description) {
      await db.execute(sql`UPDATE strategy_parameter_presets SET description = ${updates.description}, updated_time = NOW() WHERE id = ${presetId}`);
    }
    if (updates.parametersData) {
      const dataJson = JSON.stringify(updates.parametersData);
      await db.execute(sql`UPDATE strategy_parameter_presets SET parameters_data = ${dataJson}::jsonb, updated_time = NOW() WHERE id = ${presetId}`);
    }
    if (updates.isArchived !== undefined) {
      await db.execute(sql`UPDATE strategy_parameter_presets SET is_archived = ${updates.isArchived}, updated_time = NOW() WHERE id = ${presetId}`);
    }
  }

  public async deletePreset(presetId: string): Promise<void> {
    await this.ensureTablesExist();
    const db = getDb();
    await db.execute(sql`DELETE FROM strategy_parameter_presets WHERE id = ${presetId}`);
  }

  // --- AUDIT LOGS ---
  public async recordAudit(audit: Omit<StrategyParameterAuditRecord, 'id' | 'timestamp'>): Promise<void> {
    await this.ensureTablesExist();
    const db = getDb();
    const id = `audit-${crypto.randomUUID()}`;
    const sha256 = crypto.createHash('sha256').update(`${audit.strategyId}:${audit.parameterId}:${audit.oldValue}:${audit.newValue}:${audit.userName}`).digest('hex');

    await db.execute(sql`
      INSERT INTO strategy_parameter_audit (
        id, strategy_id, parameter_id, parameter_name, old_value, new_value, user_name, reason, sha256_hash, timestamp
      ) VALUES (
        ${id}, ${audit.strategyId}, ${audit.parameterId}, ${audit.parameterName}, ${audit.oldValue !== null ? String(audit.oldValue) : null}, ${audit.newValue !== null ? String(audit.newValue) : null}, ${audit.userName}, ${audit.reason}, ${sha256}, NOW()
      )
    `);
  }

  public async getAuditLogsByStrategyId(strategyId: string): Promise<StrategyParameterAuditRecord[]> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.execute(sql`
      SELECT * FROM strategy_parameter_audit 
      WHERE strategy_id = ${strategyId} 
      ORDER BY timestamp DESC 
      LIMIT 100
    `);

    return (result.rows as any[]).map(row => ({
      id: row.id,
      strategyId: row.strategy_id,
      parameterId: row.parameter_id,
      parameterName: row.parameter_name,
      oldValue: row.old_value,
      newValue: row.new_value,
      userName: row.user_name,
      reason: row.reason || 'PARAMETER_UPDATE',
      sha256Hash: row.sha256_hash || '',
      timestamp: new Date(row.timestamp).toISOString()
    }));
  }

  // --- VALIDATION STATE ---
  public async saveValidationResult(result: StrategyParameterValidationResult): Promise<void> {
    await this.ensureTablesExist();
    const db = getDb();
    const errorsJson = JSON.stringify(result.errors || []);
    const warningsJson = JSON.stringify(result.warnings || []);
    const suggestionsJson = JSON.stringify(result.suggestions || []);
    const depFailuresJson = JSON.stringify(result.dependencyFailures || []);
    const missingReqJson = JSON.stringify(result.missingRequired || []);

    await db.execute(sql`
      INSERT INTO strategy_parameter_validation (
        id, strategy_id, is_valid, error_count, warning_count, errors, warnings, suggestions, dependency_failures, missing_required, validated_at
      ) VALUES (
        ${result.id}, ${result.strategyId}, ${result.isValid}, ${result.errorCount}, ${result.warningCount || 0},
        ${errorsJson}::jsonb, ${warningsJson}::jsonb, ${suggestionsJson}::jsonb, ${depFailuresJson}::jsonb, ${missingReqJson}::jsonb, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        is_valid = EXCLUDED.is_valid,
        error_count = EXCLUDED.error_count,
        warning_count = EXCLUDED.warning_count,
        errors = EXCLUDED.errors,
        warnings = EXCLUDED.warnings,
        suggestions = EXCLUDED.suggestions,
        dependency_failures = EXCLUDED.dependency_failures,
        missing_required = EXCLUDED.missing_required,
        validated_at = NOW();
    `);
  }

  private mapRowToParameterItem(row: any): StrategyParameterItem {
    let parsedVal = row.current_value;
    let defaultVal = row.default_value;
    if (row.data_type === 'Boolean') {
      parsedVal = row.current_value === 'true';
      defaultVal = row.default_value === 'true';
    } else if (row.data_type === 'Integer' || row.data_type === 'Decimal' || row.data_type === 'Percentage') {
      parsedVal = parseFloat(row.current_value);
      defaultVal = parseFloat(row.default_value);
    } else if (row.data_type === 'JSON') {
      try {
        parsedVal = JSON.parse(row.current_value);
        defaultVal = JSON.parse(row.default_value);
      } catch {
        // fallback
      }
    }

    let parsedOptions = [];
    if (row.options) {
      parsedOptions = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
    }

    let depRule: ParameterDependencyRule | null = null;
    if (row.dependency_rule) {
      depRule = typeof row.dependency_rule === 'string' ? JSON.parse(row.dependency_rule) : row.dependency_rule;
    }

    return {
      id: row.id,
      parameterId: row.parameter_id,
      strategyId: row.strategy_id,
      name: row.parameter_name,
      displayName: row.display_name,
      description: row.description || "",
      formula: row.formula || null,
      category: row.category as ParameterCategory,
      group: row.group_name as ParameterGroup,
      dataType: row.data_type as ParameterDataType,
      currentValue: parsedVal,
      defaultValue: defaultVal,
      minValue: row.minimum_value ? parseFloat(row.minimum_value) : null,
      maxValue: row.maximum_value ? parseFloat(row.maximum_value) : null,
      step: row.step ? parseFloat(row.step) : null,
      unit: row.unit || null,
      required: row.required ?? true,
      visible: row.visible ?? true,
      editable: row.editable ?? true,
      locked: row.locked ?? false,
      lockedReason: row.locked_reason || null,
      lockedBy: row.locked_by || null,
      lockedTimestamp: row.locked_timestamp ? new Date(row.locked_timestamp).toISOString() : null,
      aiEditable: row.ai_editable ?? true,
      adminEditable: row.admin_editable ?? true,
      readOnly: row.read_only ?? false,
      runtimeAdjustable: row.runtime_adjustable ?? true,
      paperTradingOnly: row.paper_trading_only ?? false,
      productionEnabled: row.production_enabled ?? true,
      dependencyRule: depRule,
      validationRule: row.validation_rule || null,
      options: parsedOptions,
      lastModified: row.last_modified ? new Date(row.last_modified).toISOString() : new Date().toISOString(),
      modifiedBy: row.modified_by || 'SYSTEM',
      version: row.version || '1.0.0',
      sha256Reference: row.sha256_reference || ''
    };
  }
}
