import crypto from "crypto";
import { BuilderRepository } from "../repositories/index.ts";
import { RegistryService } from "../../registry/services/index.ts";
import { StrategyService } from "../../services/strategy.service.ts";
import { 
  StrategyBuilder, StrategyBlock, StrategyConnection,
  StrategyLayout, StrategyParameter, StrategyValidation,
  StrategyBuilderHistory
} from "../types/index.ts";

export interface CreateStrategyPayload {
  name: string;
  category: string;
  rules?: string[];
  tags?: string[] | string;
  description?: string;
  riskLevel?: string;
  marketType?: string;
  instrumentType?: string;
  timeframe?: string;
  owner?: string;
  createdBy?: string;
}

export interface UpdateStrategyPayload {
  name?: string;
  category?: string;
  rules?: string[];
  tags?: string[] | string;
  description?: string;
  riskLevel?: string;
  marketType?: string;
  instrumentType?: string;
  timeframe?: string;
  status?: string;
  approvalStatus?: string;
  updatedBy?: string;
}

export class BuilderService {
  private repo = new BuilderRepository();
  private registryService = new RegistryService();

  // --- SHA-256 Helper ---
  public computeSha256(data: Partial<StrategyBuilder>): string {
    const payloadStr = JSON.stringify({
      name: data.name || "",
      category: data.category || "",
      rules: data.rules || [],
      timeframe: data.timeframe || "",
      riskLevel: data.riskLevel || "",
      marketType: data.marketType || "",
      instrumentType: data.instrumentType || "",
      status: data.status || "",
      version: data.version || "1.0.0"
    });
    return crypto.createHash("sha256").update(payloadStr).digest("hex");
  }

  // --- Version Increment Helper ---
  public bumpVersion(currentVersion = "1.0.0", targetStatus?: string): string {
    const parts = currentVersion.split(".").map(p => parseInt(p, 10) || 0);
    let major = parts[0] || 1;
    let minor = parts[1] || 0;
    let patch = parts[2] || 0;

    if (targetStatus === "PUBLISHED") {
      major += 1;
      minor = 0;
      patch = 0;
    } else if (targetStatus === "APPROVED" || targetStatus === "VALIDATED") {
      minor += 1;
      patch = 0;
    } else {
      patch += 1;
    }

    return `${major}.${minor}.${patch}`;
  }

  // --- Tag Normalization Helper ---
  public normalizeTags(tagsInput?: string[] | string): string[] {
    if (!tagsInput) return [];
    let list: string[] = [];
    if (typeof tagsInput === "string") {
      list = tagsInput.split(",").map(t => t.trim());
    } else if (Array.isArray(tagsInput)) {
      list = tagsInput.map(t => String(t).trim());
    }
    const cleanList = list
      .map(t => t.toUpperCase())
      .filter(t => t.length > 0);
    return Array.from(new Set(cleanList));
  }

  // --- Rule Validation Helper ---
  public validateRules(rules?: string[]): { isValid: boolean; errors: string[]; normalizedRules: string[] } {
    const errors: string[] = [];
    if (!rules || !Array.isArray(rules) || rules.length === 0) {
      errors.push("At least one strategy rule is required.");
      return { isValid: false, errors, normalizedRules: [] };
    }

    if (rules.length > 50) {
      errors.push("Maximum rule count exceeded (Limit: 50 rules per strategy).");
    }

    const normalizedRules: string[] = [];
    const seenRules = new Set<string>();

    for (let i = 0; i < rules.length; i++) {
      const rule = String(rules[i] || "").trim();
      if (!rule) {
        errors.push(`Rule at index ${i + 1} cannot be blank.`);
        continue;
      }
      const ruleLower = rule.toLowerCase();
      if (seenRules.has(ruleLower)) {
        errors.push(`Duplicate rule rejected: "${rule}".`);
        continue;
      }
      seenRules.add(ruleLower);
      normalizedRules.push(rule);
    }

    if (normalizedRules.length === 0) {
      errors.push("Strategy rules list contains no valid, non-blank rules.");
    }

    return {
      isValid: errors.length === 0,
      errors,
      normalizedRules
    };
  }

  // --- Strategy Name & Category Validation Helper ---
  public async validateStrategyPayload(
    payload: { name?: string; category?: string; tags?: string[] | string },
    isUpdate = false,
    existingId?: string
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!isUpdate || payload.name !== undefined) {
      const name = (payload.name || "").trim();
      if (!name) {
        errors.push("Strategy Name is required.");
      } else if (name.length < 3 || name.length > 100) {
        errors.push("Strategy Name must be between 3 and 100 characters.");
      } else if (/[<>{};]/g.test(name)) {
        errors.push("Strategy Name contains invalid script/SQL characters (<, >, {, }, ;).");
      } else {
        const reservedWords = ["CON", "PRN", "AUX", "NUL", "NULL", "SELECT", "DELETE", "DROP", "INSERT", "UPDATE", "ALTER", "TRUNCATE", "TABLE", "SYSTEM", "ROOT", "ADMIN"];
        if (reservedWords.includes(name.toUpperCase())) {
          errors.push(`"${name}" is a system reserved keyword and cannot be used as a Strategy Name.`);
        } else {
          const isDuplicate = await this.repo.checkDuplicate(name, existingId);
          if (isDuplicate) {
            errors.push(`Strategy with name "${name}" already exists.`);
          }
        }
      }
    }

    if (!isUpdate || payload.category !== undefined) {
      const category = (payload.category || "").trim();
      if (!category) {
        errors.push("Strategy Category is required.");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // --- Enterprise Core Business Methods ---

  async createStrategy(payload: CreateStrategyPayload): Promise<{ success: boolean; data?: StrategyBuilder; message: string; errors: string[] }> {
    // 1. Payload validation
    const payloadVal = await this.validateStrategyPayload(payload, false);
    if (!payloadVal.isValid) {
      return { success: false, message: "Validation failed", errors: payloadVal.errors };
    }

    // 2. Rules validation
    const defaultRules = payload.rules || ["RSI between 30 and 70", "Price above 50 SMA"];
    const ruleVal = this.validateRules(defaultRules);
    if (!ruleVal.isValid) {
      return { success: false, message: "Rule validation failed", errors: ruleVal.errors };
    }

    // 3. Normalization & Metadata Generation
    const cleanTags = this.normalizeTags(payload.tags);
    const strategyId = `STRAT-${Date.now().toString(36).toUpperCase()}`;
    const builderId = crypto.randomUUID();
    const createdBy = payload.createdBy || payload.owner || "ENTERPRISE_STRATEGY_BUILDER";

    const baseObj = {
      name: payload.name.trim(),
      category: payload.category.trim(),
      rules: ruleVal.normalizedRules,
      timeframe: payload.timeframe || "15M",
      riskLevel: payload.riskLevel || "MEDIUM",
      marketType: payload.marketType || "EQUITY",
      instrumentType: payload.instrumentType || "SPOT",
      status: "DRAFT",
      version: "1.0.0"
    };

    const sha256Ref = this.computeSha256(baseObj as any);

    const newStrategy: StrategyBuilder = {
      id: builderId,
      strategyId,
      name: payload.name.trim(),
      category: payload.category.trim(),
      tags: cleanTags,
      description: payload.description ? payload.description.trim() : `Strategy definition for ${payload.name.trim()}`,
      riskLevel: payload.riskLevel || "MEDIUM",
      marketType: payload.marketType || "EQUITY",
      instrumentType: payload.instrumentType || "SPOT",
      timeframe: payload.timeframe || "15M",
      status: "DRAFT",
      version: "1.0.0",
      approvalStatus: "PENDING",
      sha256Reference: sha256Ref,
      rules: ruleVal.normalizedRules,
      createdBy,
      updatedBy: createdBy,
      createdTime: new Date(),
      updatedTime: new Date()
    };

    // 4. Persistence via Repository
    const created = await this.repo.createStrategy(newStrategy);

    // Initial audit history
    await this.repo.createHistory({
      id: crypto.randomUUID(),
      builderId: builderId,
      snapshot: { name: created.name, category: created.category, rules: created.rules, tags: created.tags, sha256: sha256Ref },
      userId: createdBy,
      reason: "Initial Enterprise Strategy Creation",
      createdTime: new Date()
    });

    // Sync to global strategy workspace registry
    try {
      await StrategyService.getInstance().createStrategy(created.name, created.category, createdBy, cleanTags);
    } catch (e) {
      // Ignore sync error if registry already exists
    }

    return {
      success: true,
      message: "Strategy successfully created and persisted",
      data: created,
      errors: []
    };
  }

  async updateStrategy(id: string, payload: UpdateStrategyPayload): Promise<{ success: boolean; data?: StrategyBuilder; message: string; errors: string[] }> {
    const existing = await this.repo.findStrategyById(id);
    if (!existing) {
      return { success: false, message: "Strategy not found", errors: ["Strategy with specified ID does not exist."] };
    }

    const payloadVal = await this.validateStrategyPayload(payload, true, id);
    if (!payloadVal.isValid) {
      return { success: false, message: "Validation failed", errors: payloadVal.errors };
    }

    let updatedRules = existing.rules || [];
    if (payload.rules !== undefined) {
      const ruleVal = this.validateRules(payload.rules);
      if (!ruleVal.isValid) {
        return { success: false, message: "Rule validation failed", errors: ruleVal.errors };
      }
      updatedRules = ruleVal.normalizedRules;
    }

    const targetStatus = payload.status || existing.status;
    const newVersion = this.bumpVersion(existing.version || "1.0.0", payload.status);

    const updateData: Partial<StrategyBuilder> = {};
    if (payload.name !== undefined) updateData.name = payload.name.trim();
    if (payload.category !== undefined) updateData.category = payload.category.trim();
    if (payload.tags !== undefined) updateData.tags = this.normalizeTags(payload.tags);
    if (payload.description !== undefined) updateData.description = payload.description.trim();
    if (payload.riskLevel !== undefined) updateData.riskLevel = payload.riskLevel;
    if (payload.marketType !== undefined) updateData.marketType = payload.marketType;
    if (payload.instrumentType !== undefined) updateData.instrumentType = payload.instrumentType;
    if (payload.timeframe !== undefined) updateData.timeframe = payload.timeframe;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.approvalStatus !== undefined) updateData.approvalStatus = payload.approvalStatus;
    if (payload.updatedBy !== undefined) updateData.updatedBy = payload.updatedBy;
    
    updateData.rules = updatedRules;
    updateData.version = newVersion;
    updateData.updatedTime = new Date();

    const mergedForSha = { ...existing, ...updateData };
    updateData.sha256Reference = this.computeSha256(mergedForSha);

    const updated = await this.repo.updateStrategy(id, updateData);

    await this.repo.createHistory({
      id: crypto.randomUUID(),
      builderId: id,
      snapshot: updateData,
      userId: payload.updatedBy || "SYSTEM",
      reason: `Update Enterprise Strategy (${payload.status || 'EDIT'}) - v${newVersion}`,
      createdTime: new Date()
    });

    return {
      success: true,
      message: "Strategy successfully updated",
      data: updated || undefined,
      errors: []
    };
  }

  async deleteStrategy(id: string): Promise<{ success: boolean; message: string; errors: string[] }> {
    const existing = await this.repo.findStrategyById(id);
    if (!existing) {
      return { success: false, message: "Strategy not found", errors: ["Strategy with specified ID does not exist."] };
    }

    await this.repo.deleteStrategy(id);
    return { success: true, message: "Strategy deleted successfully", errors: [] };
  }

  async cloneStrategy(id: string, customName?: string, createdBy = "ENTERPRISE_STRATEGY_BUILDER"): Promise<{ success: boolean; data?: StrategyBuilder; message: string; errors: string[] }> {
    const existing = await this.repo.findStrategyById(id);
    if (!existing) {
      return { success: false, message: "Strategy not found", errors: ["Strategy with specified ID does not exist."] };
    }

    let cloneName = customName ? customName.trim() : `${existing.name} (Copy)`;
    let counter = 1;
    while (await this.repo.checkDuplicate(cloneName)) {
      counter++;
      cloneName = `${existing.name} (Copy ${counter})`;
    }

    return await this.createStrategy({
      name: cloneName,
      category: existing.category || "Trend Following",
      rules: existing.rules || [],
      tags: existing.tags || [],
      description: `Cloned copy of strategy: ${existing.name}. ${existing.description || ''}`,
      riskLevel: existing.riskLevel || "MEDIUM",
      marketType: existing.marketType || "EQUITY",
      instrumentType: existing.instrumentType || "SPOT",
      timeframe: existing.timeframe || "15M",
      createdBy
    });
  }

  async bulkOperation(action: string, ids: string[], updatedBy = "ENTERPRISE_STRATEGY_BUILDER"): Promise<{ success: boolean; affectedCount: number; message: string; errors: string[] }> {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return { success: false, affectedCount: 0, message: "No strategy IDs specified for bulk operation.", errors: ["Empty selection."] };
    }

    let affectedCount = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        if (action === "DELETE") {
          const res = await this.deleteStrategy(id);
          if (res.success) affectedCount++;
          else errors.push(`Failed to delete ID ${id}`);
        } else if (action === "ARCHIVE") {
          const res = await this.updateStrategy(id, { status: "ARCHIVED", updatedBy });
          if (res.success) affectedCount++;
          else errors.push(`Failed to archive ID ${id}`);
        } else if (action === "RESTORE") {
          const res = await this.updateStrategy(id, { status: "DRAFT", updatedBy });
          if (res.success) affectedCount++;
          else errors.push(`Failed to restore ID ${id}`);
        } else if (action === "PUBLISH") {
          const res = await this.updateStrategy(id, { status: "PUBLISHED", approvalStatus: "APPROVED", updatedBy });
          if (res.success) affectedCount++;
          else errors.push(`Failed to publish ID ${id}`);
        } else if (action === "VALIDATE") {
          const res = await this.updateStrategy(id, { status: "VALIDATED", updatedBy });
          if (res.success) affectedCount++;
          else errors.push(`Failed to validate ID ${id}`);
        }
      } catch (err: any) {
        errors.push(`Error processing ID ${id}: ${err.message || String(err)}`);
      }
    }

    return {
      success: errors.length === 0,
      affectedCount,
      message: `Bulk ${action} executed for ${affectedCount} items.`,
      errors
    };
  }

  async getHistoryTimeline(id: string): Promise<{ success: boolean; data: StrategyBuilderHistory[]; message: string; errors: string[] }> {
    const history = await this.repo.getHistory(id);
    return { success: true, message: "Strategy history timeline retrieved successfully", data: history, errors: [] };
  }

  async findStrategyById(id: string): Promise<{ success: boolean; data?: StrategyBuilder | null; message: string; errors: string[] }> {
    const strategy = await this.repo.findStrategyById(id);
    if (!strategy) {
      return { success: false, message: "Strategy not found", data: null, errors: ["Strategy not found."] };
    }
    return { success: true, message: "Strategy retrieved successfully", data: strategy, errors: [] };
  }

  async listStrategies(): Promise<{ success: boolean; data: StrategyBuilder[]; message: string; errors: string[] }> {
    const list = await this.repo.listStrategies();
    return { success: true, message: "Strategies listed successfully", data: list, errors: [] };
  }

  async saveRules(id: string, rules: string[]): Promise<{ success: boolean; message: string; errors: string[] }> {
    const existing = await this.repo.findStrategyById(id);
    if (!existing) {
      return { success: false, message: "Strategy not found", errors: ["Strategy not found."] };
    }

    const ruleVal = this.validateRules(rules);
    if (!ruleVal.isValid) {
      return { success: false, message: "Rule validation failed", errors: ruleVal.errors };
    }

    return await this.updateStrategy(id, { rules: ruleVal.normalizedRules });
  }

  async loadRules(id: string): Promise<{ success: boolean; data: string[]; message: string; errors: string[] }> {
    const rules = await this.repo.loadRules(id);
    return { success: true, message: "Rules loaded successfully", data: rules, errors: [] };
  }

  // --- Visual Graph Builder Helpers ---

  async getBuilders(): Promise<StrategyBuilder[]> {
    return await this.repo.listStrategies();
  }

  async getBuilderByStrategyId(strategyId: string): Promise<any> {
    const builder = await this.repo.getBuilderByStrategyId(strategyId);
    if (!builder) return null;
    return this.getBuilderById(builder.id);
  }

  async getBuilderById(id: string): Promise<any> {
    const builder = await this.repo.findStrategyById(id);
    if (!builder) return null;

    const [blocks, connections, layouts, validation, history] = await Promise.all([
      this.repo.getBlocks(id),
      this.repo.getConnections(id),
      this.repo.getLayouts(id),
      this.repo.getValidation(id),
      this.repo.getHistory(id)
    ]);

    const blocksWithParams = await Promise.all(blocks.map(async b => {
      const parameters = await this.repo.getParametersByBlockId(b.id);
      return { ...b, parameters };
    }));

    return {
      ...builder,
      blocks: blocksWithParams,
      connections,
      layouts,
      validation,
      history
    };
  }

  async saveBuilderContent(builderId: string, data: { blocks: any[]; connections: any[]; layouts: any[]; userId?: string }): Promise<{ success: boolean; error?: string }> {
    const builder = await this.repo.findStrategyById(builderId);
    if (!builder) return { success: false, error: 'Builder not found' };

    const validationResult = this.validateBuilderData(data.blocks, data.connections);

    await this.repo.createHistory({
      id: crypto.randomUUID(),
      builderId,
      snapshot: data,
      userId: data.userId || 'USER',
      reason: 'Manual Save Graph Layout',
      createdTime: new Date()
    });

    await this.repo.clearBuilderData(builderId);

    for (const b of data.blocks || []) {
      await this.repo.createBlock({
        id: b.id,
        builderId,
        blockType: b.blockType,
        name: b.name,
        description: b.description || null,
        createdTime: new Date()
      });
      if (b.parameters) {
        for (const p of b.parameters) {
          await this.repo.createParameter({
             id: crypto.randomUUID(),
             blockId: b.id,
             key: p.key,
             value: p.value,
             valueType: p.valueType,
             createdTime: new Date()
          });
        }
      }
    }

    for (const c of data.connections || []) {
      await this.repo.createConnection({
        id: c.id || crypto.randomUUID(),
        builderId,
        sourceBlockId: c.sourceBlockId,
        targetBlockId: c.targetBlockId,
        sourcePort: c.sourcePort || null,
        targetPort: c.targetPort || null,
        createdTime: new Date()
      });
    }

    for (const l of data.layouts || []) {
      await this.repo.createLayout({
        id: l.id || crypto.randomUUID(),
        builderId,
        blockId: l.blockId,
        positionX: l.positionX,
        positionY: l.positionY,
        width: l.width || null,
        height: l.height || null,
        isCollapsed: l.isCollapsed || false,
        createdTime: new Date()
      });
    }

    await this.repo.createValidation({
      id: crypto.randomUUID(),
      builderId,
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      validatedTime: new Date()
    });

    await this.repo.updateStrategy(builderId, { updatedTime: new Date() });

    return { success: true };
  }

  validateBuilderData(blocks: any[], connections: any[]): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!blocks || blocks.length === 0) {
      errors.push('Strategy contains no blocks.');
      return { isValid: false, errors, warnings };
    }

    const hasEntry = blocks.some(b => b.blockType === 'Entry Block' || b.blockType === 'Signal Block');
    const hasExit = blocks.some(b => b.blockType === 'Exit Block' || b.blockType === 'Action Block');

    if (!hasEntry) errors.push('Strategy is missing an Entry or Signal block.');
    if (!hasExit) errors.push('Strategy is missing an Exit or Action block.');

    const connectedBlockIds = new Set<string>();
    (connections || []).forEach(c => {
      connectedBlockIds.add(c.sourceBlockId);
      connectedBlockIds.add(c.targetBlockId);
    });

    blocks.forEach(b => {
      if (!connectedBlockIds.has(b.id)) {
         warnings.push(`Block '${b.name}' is disconnected.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async validateBuilder(builderId: string): Promise<{ success: boolean; data?: any; error?: string }> {
     const builder = await this.getBuilderById(builderId);
     if (!builder) return { success: false, error: 'Builder not found' };

     const res = this.validateBuilderData(builder.blocks, builder.connections);
     await this.repo.createValidation({
        id: crypto.randomUUID(),
        builderId,
        isValid: res.isValid,
        errors: res.errors,
        warnings: res.warnings,
        validatedTime: new Date()
     });

     return { success: true, data: res };
  }

  async seedInitialData(): Promise<void> {
    const existingList = await this.repo.listStrategies();
    if (existingList.length === 0) {
      await this.createStrategy({
        name: "Volume Momentum Index Crossover",
        category: "Momentum",
        rules: ["RSI between 30 and 70", "Price above 50 SMA"],
        tags: ["INTRADAY", "NIFTY50"],
        description: "Standard volume momentum crossover strategy template",
        createdBy: "SYSTEM"
      });
      await this.createStrategy({
        name: "Mean Reversion Bollinger Scalper",
        category: "Mean Reversion",
        rules: ["Bollinger Band Lower Touch", "RSI < 30"],
        tags: ["SCALPING", "LIQUID"],
        description: "Intraday mean reversion strategy using Bollinger Bands",
        createdBy: "SYSTEM"
      });
    }
  }
}

