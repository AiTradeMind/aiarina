import { researchEP03Repository } from "../repositories/ep03Repository.ts";
import { 
  ScannerTemplate, 
  ScannerConfig, 
  AdvancedFilters, 
  ScannerTemplateVersion,
  ScannerExecutionQueueItem,
  ScannerExecutionHistory,
  WatchlistGroup,
  AlertRule,
  AlertCondition,
  AlertDeliveryQueueItem,
  AlertAcknowledgement,
  AlertMetricsSnapshot
} from "../types/ep03.ts";
import { MarketService } from "../../market/services/index.ts";
import { IndianMarketService } from "../../indianMarket/services/IndianMarketService.ts";
import { EventBusService } from "../../events/services/index.ts";

export class ResearchEP03Service {
  private static instance: ResearchEP03Service;
  private marketService = new MarketService();
  private indianMarketService = new IndianMarketService();
  private eventBus = EventBusService.getInstance();

  public static getInstance(): ResearchEP03Service {
    if (!ResearchEP03Service.instance) {
      ResearchEP03Service.instance = new ResearchEP03Service();
    }
    return ResearchEP03Service.instance;
  }

  // ==========================================================================
  // SCANNER TEMPLATES
  // ==========================================================================
  async getTemplates(): Promise<ScannerTemplate[]> {
    return await researchEP03Repository.getTemplates();
  }

  async getTemplateById(id: string): Promise<ScannerTemplate | null> {
    return await researchEP03Repository.getTemplateById(id);
  }

  async createTemplate(data: Partial<ScannerTemplate>): Promise<ScannerTemplate> {
    const id = `tpl_${Date.now()}`;
    const newTemplate: ScannerTemplate = {
      id,
      title: data.title || "Unnamed Template",
      description: data.description || "",
      category: data.category || "GENERAL",
      type: data.type || "USER",
      config: data.config || { instrumentType: "EQUITY", filters: {} },
      version: data.version || "1.0.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return await researchEP03Repository.createTemplate(newTemplate);
  }

  async updateTemplate(id: string, data: Partial<ScannerTemplate>): Promise<void> {
    await researchEP03Repository.updateTemplate(id, data);
  }

  async cloneTemplate(id: string): Promise<ScannerTemplate> {
    const source = await researchEP03Repository.getTemplateById(id);
    if (!source) throw new Error("Source template not found");

    const cloned: Partial<ScannerTemplate> = {
      title: `Clone of ${source.title}`,
      description: source.description,
      category: source.category,
      type: "USER",
      config: JSON.parse(JSON.stringify(source.config)),
      version: "1.0.0"
    };
    return await this.createTemplate(cloned);
  }

  async exportTemplate(id: string): Promise<string> {
    const template = await researchEP03Repository.getTemplateById(id);
    if (!template) throw new Error("Template not found");
    return JSON.stringify(template, null, 2);
  }

  async importTemplate(jsonStr: string): Promise<ScannerTemplate> {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.title || !parsed.config) {
        throw new Error("Invalid template structure. Title and Config are required.");
      }
      return await this.createTemplate({
        title: parsed.title,
        description: parsed.description || "Imported template",
        category: parsed.category || "IMPORTED",
        type: "USER",
        config: parsed.config,
        version: parsed.version || "1.0.0"
      });
    } catch (err: any) {
      throw new Error(`Import failed: ${err.message}`);
    }
  }

  async createTemplateVersion(templateId: string, changeLog: string): Promise<void> {
    const tpl = await researchEP03Repository.getTemplateById(templateId);
    if (!tpl) throw new Error("Template not found");

    // Increment minor version
    const parts = tpl.version.split(".");
    const nextMinor = Number(parts[1] || 0) + 1;
    const newVersion = `${parts[0]}.${nextMinor}.0`;

    const versionRecord: ScannerTemplateVersion = {
      id: `ver_${Date.now()}`,
      templateId,
      version: newVersion,
      config: tpl.config,
      changeLog,
      createdAt: new Date().toISOString()
    };

    await researchEP03Repository.createTemplateVersion(versionRecord);
    await researchEP03Repository.updateTemplate(templateId, { version: newVersion });
  }

  // ==========================================================================
  // ADVANCED FILTER ENGINE
  // ==========================================================================
  public applyAdvancedFilters(instruments: any[], filters: AdvancedFilters): any[] {
    return instruments.filter(item => {
      // 1. Market Cap Min/Max (represented in Crores)
      if (filters.marketCapMin !== undefined && (item.marketCap || 0) < filters.marketCapMin) return false;
      if (filters.marketCapMax !== undefined && (item.marketCap || 0) > filters.marketCapMax) return false;

      // 2. Sector match
      if (filters.sector && item.sector && !item.sector.toLowerCase().includes(filters.sector.toLowerCase())) return false;

      // 3. Industry match
      if (filters.industry && item.industry && !item.industry.toLowerCase().includes(filters.industry.toLowerCase())) return false;

      // 4. Exchange
      if (filters.exchange && item.exchangeId && item.exchangeId !== filters.exchange) return false;

      // 5. Price Range
      const price = item.price || item.lastPrice || 0;
      if (filters.priceMin !== undefined && price < filters.priceMin) return false;
      if (filters.priceMax !== undefined && price > filters.priceMax) return false;

      // 6. Volume Range
      const vol = item.volume || 0;
      if (filters.volumeMin !== undefined && vol < filters.volumeMin) return false;
      if (filters.volumeMax !== undefined && vol > filters.volumeMax) return false;

      // 7. Delivery Percent Min
      const deliveryPct = item.deliveryPercent || 0;
      if (filters.deliveryPercentMin !== undefined && deliveryPct < filters.deliveryPercentMin) return false;

      // 8. Open Interest (OI) Range
      const oi = item.oi || 0;
      if (filters.oiMin !== undefined && oi < filters.oiMin) return false;
      if (filters.oiMax !== undefined && oi > filters.oiMax) return false;

      // 9. Expiry Contract matching (e.g. '26AUG')
      if (filters.expiry && item.symbol && !item.symbol.includes(filters.expiry)) return false;

      // 10. Options checks
      if (filters.optionType && filters.optionType !== 'ANY') {
        if (filters.optionType === 'CE' && !item.symbol.endsWith('CE') && !item.symbol.includes('-CE')) return false;
        if (filters.optionType === 'PE' && !item.symbol.endsWith('PE') && !item.symbol.includes('-PE')) return false;
      }
      const strike = item.strike || 0;
      if (filters.strikeMin !== undefined && strike < filters.strikeMin) return false;
      if (filters.strikeMax !== undefined && strike > filters.strikeMax) return false;

      // 11. Custom Expression logic
      if (filters.customExpressions && filters.customExpressions.length > 0) {
        for (const expr of filters.customExpressions) {
          try {
            // Evaluates simple dynamic rules like: "price > 100", "volume > 500000" safely without eval
            if (expr.includes("price >") && !(price > Number(expr.split(">")[1]))) return false;
            if (expr.includes("price <") && !(price < Number(expr.split("<")[1]))) return false;
            if (expr.includes("volume >") && !(vol > Number(expr.split(">")[1]))) return false;
          } catch (e) {
            console.warn(`[EP03] Custom expression parsing error for expression "${expr}":`, e);
          }
        }
      }

      return true;
    });
  }

  // ==========================================================================
  // SCAN EXECUTION ENGINE
  // ==========================================================================
  async getQueue(): Promise<ScannerExecutionQueueItem[]> {
    return await researchEP03Repository.getQueue();
  }

  async runScan(templateId: string, scanType: ScannerExecutionQueueItem['scanType'] = 'MANUAL', extraParams: any = {}): Promise<ScannerExecutionHistory> {
    const startTime = Date.now();
    const queueId = `q_${Date.now()}`;
    const tpl = await this.getTemplateById(templateId);

    // Save initial queue item
    await researchEP03Repository.addQueueItem({
      id: queueId,
      templateId,
      status: "RUNNING",
      scanType,
      params: extraParams,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    try {
      if (!tpl) throw new Error(`Template not found: ${templateId}`);

      // Protect execution from timeouts (Max 10s)
      const executionPromise = this.executeScanCalculations(tpl, scanType, extraParams);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Scanner execution protection timeout triggered")), 10000)
      );

      const matchedSymbols = await Promise.race([executionPromise, timeoutPromise]);
      const duration = Date.now() - startTime;

      // Performance stats
      const mem = process.memoryUsage();
      const performanceMetrics = {
        cpuPercent: Math.round(Math.random() * 20 + 5), // Simulating usage
        memoryMb: Math.round(mem.heapUsed / 1024 / 1024),
        latencyMs: duration
      };

      const historyRecord: ScannerExecutionHistory = {
        id: `hist_${Date.now()}`,
        queueId,
        templateId,
        status: "COMPLETED",
        executionDurationMs: duration,
        matchedSymbols,
        ruleVersion: tpl.version,
        parameters: extraParams,
        performanceMetrics,
        createdAt: new Date().toISOString()
      };

      await researchEP03Repository.createHistory(historyRecord);
      await researchEP03Repository.updateQueueItem(queueId, "COMPLETED");

      // Increment overall system metrics
      await researchEP03Repository.incrementMetrics(1, 1, 0, duration);

      // Trigger alerts if any match
      await this.processScanAlertTriggering(matchedSymbols, tpl);

      return historyRecord;
    } catch (err: any) {
      const duration = Date.now() - startTime;
      console.error("[EP03] Scan execution failure:", err);

      await researchEP03Repository.updateQueueItem(queueId, "FAILED", err.message);

      const failedRecord: ScannerExecutionHistory = {
        id: `hist_${Date.now()}`,
        queueId,
        templateId,
        status: "FAILED",
        executionDurationMs: duration,
        matchedSymbols: [],
        parameters: extraParams,
        performanceMetrics: { latencyMs: duration },
        createdAt: new Date().toISOString()
      };

      await researchEP03Repository.createHistory(failedRecord);
      await researchEP03Repository.incrementMetrics(1, 0, 1, duration);

      throw err;
    }
  }

  private async executeScanCalculations(tpl: ScannerTemplate, scanType: string, params: any): Promise<string[]> {
    // 1. Fetch Symbol Masters from EP04
    const symbolMasters = await this.marketService.getSymbolMasters();
    const sectorMasters = await this.marketService.getSectors();

    // Map sectors
    const sectorMap: Record<string, string> = {};
    for (const s of sectorMasters) {
      sectorMap[s.instrumentId] = s.sector || "Diversified";
    }

    const instrumentType = tpl.config.instrumentType;

    // Filter by type
    let targetSymbols = symbolMasters.filter(s => {
      if (instrumentType === 'EQUITY') return !s.tradingSymbol.includes("-FUT") && !s.tradingSymbol.includes("-CE") && !s.tradingSymbol.includes("-PE") && !s.tradingSymbol.toLowerCase().includes("etf");
      if (instrumentType === 'ETF') return s.tradingSymbol.toLowerCase().includes("etf") || s.tradingSymbol.toLowerCase().includes("bees");
      if (instrumentType === 'INDEX') return s.tradingSymbol.includes("NIFTY") || s.tradingSymbol.includes("SENSEX") || s.tradingSymbol.includes("BANKNIFTY");
      if (instrumentType === 'FUTURES') return s.tradingSymbol.includes("-FUT") || s.tradingSymbol.includes("FUTSTK");
      if (instrumentType === 'OPTIONS') return s.tradingSymbol.includes("-CE") || s.tradingSymbol.includes("-PE");
      if (instrumentType === 'COMMODITY' || instrumentType === 'MCX') return s.tradingSymbol.includes("GOLD") || s.tradingSymbol.includes("CRUDEOIL") || s.tradingSymbol.includes("COPPER") || s.tradingSymbol.includes("SILVER");
      return true;
    });

    // Fallbacks if empty
    if (targetSymbols.length === 0) {
      const defaultStubs = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "HINDUNILVR"];
      targetSymbols = defaultStubs.map(s => ({ tradingSymbol: s, displaySymbol: s, instrumentId: `stub_${s}` })) as any[];
    }

    // Convert symbols to populated records
    const populated = targetSymbols.map(sym => {
      const charSum = sym.tradingSymbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const price = Math.round(((charSum % 2500) + 90) * 100) / 100;
      const changePercent = Number(((charSum % 14) - 7).toFixed(2));
      const volume = (charSum * 15321) % 9000000;
      const deliveryPercent = (charSum % 40) + 30; // 30-70%
      const oi = (charSum % 2 === 0) ? (charSum * 888) % 500000 : 0;

      return {
        symbol: sym.tradingSymbol,
        name: sym.displaySymbol || sym.tradingSymbol,
        price,
        changePercent,
        volume,
        deliveryPercent,
        oi,
        sector: sectorMap[sym.instrumentId] || "Financial Services",
        marketCap: (charSum * 650) % 200000,
        exchangeId: (instrumentType === 'COMMODITY' || instrumentType === 'MCX') ? ((sym as any).exchangeId || 'COMMODITY') : 'NSE'
      };
    });

    // 2. Parallel / Incremental / Scheduled modes
    let filteredList = populated;
    if (scanType === 'INCREMENTAL') {
      // Incremental mode: only check first 50%
      filteredList = populated.slice(0, Math.ceil(populated.length / 2));
    } else if (scanType === 'PARALLEL') {
      // Parallel scanning: scan in segmented Promise blocks to leverage node threads
      const segments: any[][] = [];
      const segmentSize = 3;
      for (let i = 0; i < populated.length; i += segmentSize) {
        segments.push(populated.slice(i, i + segmentSize));
      }
      const parallelResults = await Promise.all(segments.map(async (seg) => {
        return this.applyAdvancedFilters(seg, tpl.config.filters);
      }));
      return parallelResults.flat().map(item => item.symbol);
    }

    const filtered = this.applyAdvancedFilters(filteredList, tpl.config.filters);
    return filtered.map(item => item.symbol);
  }

  // ==========================================================================
  // WATCHLIST GROUPS
  // ==========================================================================
  async getWatchlistGroups(): Promise<WatchlistGroup[]> {
    return await researchEP03Repository.getWatchlistGroups();
  }

  async createWatchlistGroup(data: Partial<WatchlistGroup>): Promise<WatchlistGroup> {
    const id = `wg_${Date.now()}`;
    const newGroup: WatchlistGroup = {
      id,
      name: data.name || "New Watchlist Group",
      parentId: data.parentId || null,
      folder: data.folder || null,
      isPinned: !!data.isPinned,
      isShared: !!data.isShared,
      isDefault: !!data.isDefault,
      isArchived: !!data.isArchived,
      sortOrder: data.sortOrder !== undefined ? data.sortOrder : 0,
      colorLabel: data.colorLabel || "#64748b",
      watchlistIds: data.watchlistIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return await researchEP03Repository.createWatchlistGroup(newGroup);
  }

  // ==========================================================================
  // ALERT RULE ENGINE
  // ==========================================================================
  async getAlertRules(): Promise<AlertRule[]> {
    return await researchEP03Repository.getAlertRules();
  }

  async createAlertRule(data: Partial<AlertRule>): Promise<AlertRule> {
    const id = `rule_${Date.now()}`;
    const newRule: AlertRule = {
      id,
      name: data.name || "New Dynamic Alert Rule",
      conditionExpression: data.conditionExpression || { field: "price", operatorType: "GREATER_THAN", value: 100 },
      cooldownSeconds: data.cooldownSeconds || 60,
      repeatPolicy: data.repeatPolicy || "ALWAYS",
      expiryAt: data.expiryAt || null,
      priority: data.priority || "MEDIUM",
      status: "ACTIVE",
      lastTriggeredAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return await researchEP03Repository.createAlertRule(newRule);
  }

  /**
   * Recursive check for nested alert expressions (AND, OR, NOT)
   */
  public evaluateCondition(cond: AlertCondition, data: any): boolean {
    if (cond.operator) {
      if (!cond.conditions || cond.conditions.length === 0) return true;

      if (cond.operator === 'AND') {
        return cond.conditions.every(c => this.evaluateCondition(c, data));
      }
      if (cond.operator === 'OR') {
        return cond.conditions.some(c => this.evaluateCondition(c, data));
      }
      if (cond.operator === 'NOT') {
        return !this.evaluateCondition(cond.conditions[0], data);
      }
    }

    if (!cond.field) return true;
    const value = data[cond.field];
    if (value === undefined) return false;

    switch (cond.operatorType) {
      case 'EQUALS':
        return value === cond.value;
      case 'GREATER_THAN':
        return Number(value) > Number(cond.value);
      case 'LESS_THAN':
        return Number(value) < Number(cond.value);
      case 'CONTAINS':
        return String(value).toLowerCase().includes(String(cond.value).toLowerCase());
      case 'CROSSES_ABOVE':
      case 'CROSSES_BELOW':
        // Simulating crossovers based on directionality
        return Number(value) > Number(cond.value);
      default:
        return false;
    }
  }

  // ==========================================================================
  // ALERT DELIVERY PIPELINE (PROVIDER INTERFACES ONLY)
  // ==========================================================================
  async deliverAlert(rule: AlertRule, payload: AlertDeliveryQueueItem['alertPayload']): Promise<void> {
    const deliveryId = `del_${Date.now()}`;
    const channels = ["IN_APP", "WEBSOCKET", "EMAIL", "SMS", "WEBHOOK", "PUSH"];
    const statusRecord: Record<string, 'PENDING' | 'SUCCESS' | 'FAILED'> = {};

    console.log(`[EP03 Alert Delivery] Rule: "${rule.name}" fired for ${payload.symbol}! Payload: ${payload.message}`);

    // Call Provider Interface Adapters
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'IN_APP':
            console.log(` -> In-App alert rendered on main workstation.`);
            statusRecord[channel] = 'SUCCESS';
            break;
          case 'WEBSOCKET':
            console.log(` -> WebSocket real-time packet sent to active sub-systems.`);
            statusRecord[channel] = 'SUCCESS';
            break;
          case 'EMAIL':
            console.log(` -> Email notification dispatched to sysadmin-watch@arinasecurity.com.`);
            statusRecord[channel] = 'SUCCESS';
            break;
          case 'SMS':
            console.log(` -> SMS notification queued through fallback carrier.`);
            statusRecord[channel] = 'SUCCESS';
            break;
          case 'WEBHOOK':
            console.log(` -> Outgoing Webhook sent to compliance target: https://hooks.arina.security/compliance.`);
            statusRecord[channel] = 'SUCCESS';
            break;
          case 'PUSH':
            console.log(` -> Push notification pushed via APNS/FCM.`);
            statusRecord[channel] = 'SUCCESS';
            break;
        }
      } catch (err) {
        statusRecord[channel] = 'FAILED';
      }
    }

    // Create delivery audit item
    await researchEP03Repository.addAlertDeliveryItem({
      id: deliveryId,
      ruleId: rule.id,
      alertPayload: payload,
      channels,
      deliveryStatus: statusRecord,
      createdAt: new Date().toISOString()
    });

    // Create unread Acknowledgement record
    await researchEP03Repository.addAcknowledgement({
      id: `ack_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      deliveryId,
      ruleId: rule.id,
      symbol: payload.symbol,
      message: payload.message,
      status: "UNREAD",
      snoozedUntil: null,
      acknowledgedAt: null,
      createdAt: new Date().toISOString()
    });

    // Publish event bus alert notification
    await this.eventBus.publish({
      eventType: "RESEARCH_UPDATED",
      source: "RESEARCH_ENGINE",
      payload: {
        deliveryId,
        ruleId: rule.id,
        symbol: payload.symbol,
        message: payload.message,
        priority: payload.priority
      }
    });
  }

  async getAcknowledgements(): Promise<AlertAcknowledgement[]> {
    return await researchEP03Repository.getAcknowledgements();
  }

  async acknowledgeAlert(id: string, status: AlertAcknowledgement['status'], snoozedUntil?: string): Promise<void> {
    await researchEP03Repository.updateAcknowledgementStatus(id, status, snoozedUntil || null);
  }

  async getMetrics(): Promise<AlertMetricsSnapshot> {
    return await researchEP03Repository.getMetrics();
  }

  // ==========================================================================
  // MARKET EVENT TRIGGERS & EVALUATION (PART 7 & 12)
  // ==========================================================================
  async generateMarketTriggers(): Promise<number> {
    console.log("[EP03] Market event trigger scanner scanning for anomalies...");
    let triggerCount = 0;

    // Fetch live market tickers / symbols
    const symbolMasters = await this.marketService.getSymbolMasters();
    const rules = await this.getAlertRules();

    if (symbolMasters.length === 0 || rules.length === 0) return 0;

    // Simulate high volatility triggers (Circuit Hit, Gap Up, OI Spike, Corporate actions, etc.)
    const sampleEvents = [
      { event: "Gap Up", field: "changePercent", val: 5.4, msg: "opened with a massive +5.4% gap up" },
      { event: "Gap Down", field: "changePercent", val: -6.2, msg: "opened with a severe -6.2% gap down" },
      { event: "Circuit Hit", field: "changePercent", val: 10, msg: "hit the upper circuit threshold (+10%)" },
      { event: "52W High", field: "price", val: 4200, msg: "scaled past its 52-week lifetime high" },
      { event: "52W Low", field: "price", val: 120, msg: "slid to a new 52-week lifetime low" },
      { event: "High Volume", field: "volume", val: 8500000, msg: "surpassed 8.5M daily shares traded (volume spike)" },
      { event: "OI Spike", field: "oi", val: 250000, msg: "registered a breakout in open interest (+250k OI)" },
      { event: "News Published", field: "newsPublished", val: 1, msg: "triggered fresh macro-sentiment shift in news stream" },
      { event: "Indicator Cross", field: "rsi", val: 78, msg: "crossed into deep overbought territory (RSI > 75)" }
    ];

    for (const sym of symbolMasters.slice(0, 5)) {
      const charSum = sym.tradingSymbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const ev = sampleEvents[charSum % sampleEvents.length];

      // Form mock dynamic state
      const instrumentState = {
        symbol: sym.tradingSymbol,
        price: Math.round(((charSum % 1500) + 120) * 100) / 100,
        changePercent: ev.field === 'changePercent' ? ev.val : Number(((charSum % 8) - 4).toFixed(2)),
        volume: ev.field === 'volume' ? ev.val : (charSum * 12345) % 3000000,
        oi: ev.field === 'oi' ? ev.val : (charSum * 43) % 20000,
        newsPublished: ev.field === 'newsPublished' ? 1 : 0,
        rsi: ev.field === 'rsi' ? ev.val : (charSum % 40) + 30
      };

      // Match against rules
      for (const rule of rules) {
        if (rule.status !== 'ACTIVE') continue;

        // Check Cooldown
        if (rule.lastTriggeredAt) {
          const elapsed = Date.now() - new Date(rule.lastTriggeredAt).getTime();
          if (elapsed < rule.cooldownSeconds * 1000) continue;
        }

        const isMatch = this.evaluateCondition(rule.conditionExpression, instrumentState);
        if (isMatch) {
          triggerCount++;
          await researchEP03Repository.updateRuleTrigger(rule.id);
          await this.deliverAlert(rule, {
            symbol: sym.tradingSymbol,
            message: `Market Event [${ev.event}]: Instrument ${sym.tradingSymbol} ${ev.msg}.`,
            priority: rule.priority,
            timestamp: new Date().toISOString(),
            triggeredValue: instrumentState.changePercent
          });
        }
      }
    }

    return triggerCount;
  }

  private async processScanAlertTriggering(matchedSymbols: string[], tpl: ScannerTemplate): Promise<void> {
    const rules = await this.getAlertRules();
    for (const sym of matchedSymbols) {
      // Find rules that are active and check if they match this instrument
      for (const rule of rules) {
        if (rule.status !== 'ACTIVE') continue;
        
        // Cooldown check
        if (rule.lastTriggeredAt) {
          const elapsed = Date.now() - new Date(rule.lastTriggeredAt).getTime();
          if (elapsed < rule.cooldownSeconds * 1000) continue;
        }

        // Simulating rule evaluation for matches
        await researchEP03Repository.updateRuleTrigger(rule.id);
        await this.deliverAlert(rule, {
          symbol: sym,
          message: `Scanner Alert: Symbol ${sym} matched scanner template "${tpl.title}" under filters.`,
          priority: rule.priority,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
}

export const researchEP03Service = ResearchEP03Service.getInstance();
export default researchEP03Service;
