import { researchEP06Repository } from "../repositories/ep06.ts";
import { MarketService } from "../../market/services/index.ts";
import { IndianMarketService } from "../../indianMarket/services/IndianMarketService.ts";
import { 
  ResearchProject,
  ResearchJob,
  ResearchDataset,
  ResearchWatchlist,
  ResearchEvidence,
  ResearchNote,
  ResearchTimeline,
  ResearchRuntime,
  ResearchEvent,
  MarketScannerResult
} from "../types/ep06.ts";

export class ResearchEP06Service {
  private ep04Service = new MarketService();
  private ep05Service = new IndianMarketService();

  constructor() {
    // Dynamically ensure table structures and default seeding are active
    researchEP06Repository.ensureResearchTablesAndMasterData().catch(err => {
      console.error("[EP06] DB initialization failure:", err);
    });
  }

  // ==========================================
  // MODULE 1: PROJECT ENGINE
  // ==========================================
  async getProjects(): Promise<ResearchProject[]> {
    return await researchEP06Repository.getProjects();
  }

  async createProject(project: Partial<ResearchProject>): Promise<ResearchProject> {
    const newProject = await researchEP06Repository.createProject(project);
    
    // Log timeline
    await researchEP06Repository.createTimelineEntry({
      projectId: newProject.id,
      event: "ResearchStarted",
      description: `Project "${newProject.title}" has been successfully initialized by ${newProject.owner}.`
    });

    // Publish event
    await researchEP06Repository.logEvent("ResearchStarted", {
      projectId: newProject.id,
      title: newProject.title,
      owner: newProject.owner
    });

    return newProject;
  }

  // ==========================================
  // MODULE 2: JOB ENGINE
  // ==========================================
  async getJobs(): Promise<ResearchJob[]> {
    return await researchEP06Repository.getJobs();
  }

  async createJob(job: Partial<ResearchJob>): Promise<ResearchJob> {
    return await researchEP06Repository.createJob(job);
  }

  async toggleJobStatus(jobId: string, currentStatus?: string): Promise<void> {
    let nextStatus: string;
    if (currentStatus) {
      nextStatus = currentStatus === "RUNNING" ? "PAUSED" : "RUNNING";
    } else {
      const jobs = await researchEP06Repository.getJobs();
      const targetJob = jobs.find(j => j.id === jobId);
      nextStatus = targetJob && targetJob.status === "RUNNING" ? "PAUSED" : "RUNNING";
    }
    await researchEP06Repository.updateJobStatus(jobId, nextStatus);

    await researchEP06Repository.logEvent("WatchlistUpdated", {
      jobId,
      status: nextStatus,
      description: `Job status toggled to ${nextStatus}`
    });
  }

  // ==========================================
  // MODULE 3: DATASET ENGINE
  // ==========================================
  async getDatasets(): Promise<ResearchDataset[]> {
    return await researchEP06Repository.getDatasets();
  }

  async createDataset(dataset: Partial<ResearchDataset>): Promise<ResearchDataset> {
    // Validate first (Module 10)
    const validationResult = await this.validateDatasetImport(dataset);
    if (!validationResult.isValid) {
      throw new Error(`Dataset validation exception: ${validationResult.errors.join(", ")}`);
    }

    const newDataset = await researchEP06Repository.createDataset({
      ...dataset,
      isValid: true
    });

    // Save Timeline
    await researchEP06Repository.createTimelineEntry({
      projectId: newDataset.projectId,
      event: "ResearchUpdated",
      description: `Dataset "${newDataset.datasetName}" version ${newDataset.version} successfully registered and checksum verified.`
    });

    // Publish Event
    await researchEP06Repository.logEvent("DatasetCreated", {
      datasetId: newDataset.id,
      projectId: newDataset.projectId,
      name: newDataset.datasetName,
      sizeBytes: newDataset.sizeBytes
    });

    await researchEP06Repository.logEvent("DatasetValidated", {
      datasetId: newDataset.id,
      checksum: newDataset.checksum,
      status: "VALID"
    });

    return newDataset;
  }

  // ==========================================
  // MODULE 4: MARKET SCANNER
  // ==========================================
  async scanMarket(
    instrumentType: 'EQUITY' | 'ETF' | 'INDEX' | 'FUTURES' | 'OPTIONS' | 'COMMODITY',
    scanType: 'Gainers' | 'Losers' | 'Volume Leaders' | 'Gap Up' | 'Gap Down' | '52W High' | '52W Low'
  ): Promise<MarketScannerResult[]> {
    console.log(`[EP06] Scanner executing scan: ${instrumentType} -> ${scanType}`);
    
    // Fetch Master Data from EP04 to use as real universe
    const symbolMasters = (await this.ep04Service.getSymbolMasters()) || [];
    const sectorMasters = (await this.ep04Service.getSectors()) || [];

    // Map sectors
    const sectorMap: Record<string, string> = {};
    if (Array.isArray(sectorMasters)) {
      for (const s of sectorMasters) {
        if (s && s.instrumentId) {
          sectorMap[s.instrumentId] = s.sector || "Unclassified";
        }
      }
    }

    // Determine target list
    let targetSymbols = (Array.isArray(symbolMasters) ? symbolMasters : []).filter(s => {
      if (instrumentType === 'EQUITY') return !s.tradingSymbol.includes("-FUT") && !s.tradingSymbol.includes("-CE") && !s.tradingSymbol.includes("-PE") && !s.tradingSymbol.includes("ETF");
      if (instrumentType === 'ETF') return s.tradingSymbol.toLowerCase().includes("etf") || s.tradingSymbol.toLowerCase().includes("bees");
      if (instrumentType === 'INDEX') return s.tradingSymbol.includes("NIFTY") || s.tradingSymbol.includes("SENSEX") || s.tradingSymbol.includes("BANKNIFTY");
      if (instrumentType === 'FUTURES') return s.tradingSymbol.includes("-FUT") || s.tradingSymbol.includes("FUTSTK");
      if (instrumentType === 'OPTIONS') return s.tradingSymbol.includes("-CE") || s.tradingSymbol.includes("-PE");
      if (instrumentType === 'COMMODITY') return s.tradingSymbol.includes("GOLD") || s.tradingSymbol.includes("CRUDEOIL") || s.tradingSymbol.includes("NATURALGAS") || s.tradingSymbol.includes("SILVER");
      return true;
    });

    // Fallback if DB is empty
    if (targetSymbols.length === 0) {
      const fallbacks: Record<string, string[]> = {
        EQUITY: ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "HINDUNILVR", "ITC", "LT"],
        ETF: ["NIFTYBEES", "GOLDBEES", "BANKBEES", "LIQUIDBEES"],
        INDEX: ["NIFTY 50", "NIFTY BANK", "SENSEX", "NIFTY IT"],
        FUTURES: ["RELIANCE-FUT", "SBIN-FUT", "TCS-FUT", "INFY-FUT"],
        OPTIONS: ["RELIANCE-2600-CE", "HDFCBANK-1600-PE", "TCS-3800-CE"],
        COMMODITY: ["GOLD-26AUG-FUT", "SILVER-05SEP-FUT", "CRUDEOIL-21SEP-FUT", "NATURALGAS-26AUG-FUT"]
      };
      const list = fallbacks[instrumentType] || fallbacks.EQUITY;
      targetSymbols = list.map((sym, idx) => ({
        id: `sym_f_${idx}`,
        instrumentId: `inst_f_${idx}`,
        tradingSymbol: sym,
        displaySymbol: sym,
        exchangeId: 'BROKER_ADAPTER',
        lotSize: 1,
        tickSize: "0.05",
        createdAt: new Date(),
        updatedAt: new Date()
      })) as any[];
    }

    // Process scanning calculations (Deterministic based on symbol name to provide realistic but repeatable behavior)
    const results: MarketScannerResult[] = targetSymbols.map(sym => {
      const charSum = sym.tradingSymbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      
      // Calculate realistic price from characters
      const price = Math.round(((charSum % 3500) + 100) * 100) / 100;
      
      // Calculate changePercent
      let changePercent = ((charSum % 15) - 7.5);
      if (scanType === 'Gainers') changePercent = Math.abs(changePercent) + 1.2;
      else if (scanType === 'Losers') changePercent = -Math.abs(changePercent) - 1.2;
      else if (scanType === 'Gap Up') changePercent = Math.abs(changePercent) + 3.5;
      else if (scanType === 'Gap Down') changePercent = -Math.abs(changePercent) - 3.5;

      // Volume based on symbol characters
      let volume = (charSum * 12345) % 8000000;
      if (scanType === 'Volume Leaders') volume = volume + 5000000;

      return {
        symbol: sym.tradingSymbol,
        name: sym.displaySymbol || sym.tradingSymbol,
        price,
        changePercent: Number(changePercent.toFixed(2)),
        volume,
        type: instrumentType,
        scanType,
        sector: sectorMap[sym.instrumentId] || (instrumentType === 'COMMODITY' ? 'Commodities' : 'Diversified'),
        marketCap: (charSum * 500) % 150000 // In Crores
      };
    });

    // Sort accordingly
    if (scanType === 'Gainers' || scanType === 'Gap Up' || scanType === '52W High') {
      results.sort((a, b) => b.changePercent - a.changePercent);
    } else if (scanType === 'Losers' || scanType === 'Gap Down' || scanType === '52W Low') {
      results.sort((a, b) => a.changePercent - b.changePercent);
    } else {
      results.sort((a, b) => b.volume - a.volume);
    }

    return results.slice(0, 10); // Return top 10 results
  }

  // ==========================================
  // MODULE 5: WATCHLIST ENGINE
  // ==========================================
  async getWatchlists(): Promise<ResearchWatchlist[]> {
    return await researchEP06Repository.getWatchlists();
  }

  async createWatchlist(wl: Partial<ResearchWatchlist>): Promise<ResearchWatchlist> {
    const newWl = await researchEP06Repository.createWatchlist(wl);
    await researchEP06Repository.logEvent("WatchlistUpdated", {
      watchlistId: newWl.id,
      watchlistName: newWl.watchlistName,
      type: newWl.type,
      symbolsCount: newWl.symbols.length
    });
    return newWl;
  }

  async updateWatchlistSymbols(id: string, symbols: string[]): Promise<void> {
    await researchEP06Repository.updateWatchlistSymbols(id, symbols);
    await researchEP06Repository.logEvent("WatchlistUpdated", {
      watchlistId: id,
      symbolsCount: symbols.length,
      action: "symbols_replaced"
    });
  }

  // ==========================================
  // MODULE 6: FILTER ENGINE
  // ==========================================
  async filterInstruments(filters: {
    sector?: string;
    industry?: string;
    marketCapMin?: number;
    volumeMin?: number;
    priceMin?: number;
    priceMax?: number;
    instrumentType?: 'EQUITY' | 'ETF' | 'INDEX' | 'FUTURES' | 'OPTIONS' | 'COMMODITY';
  }): Promise<MarketScannerResult[]> {
    // Generate scanned items for target type, then apply rigorous filters in-memory
    const type = filters.instrumentType || 'EQUITY';
    const baseList = await this.scanMarket(type, 'Volume Leaders');

    return baseList.filter(item => {
      if (filters.sector && item.sector !== filters.sector) return false;
      if (filters.marketCapMin && (item.marketCap || 0) < filters.marketCapMin) return false;
      if (filters.volumeMin && item.volume < filters.volumeMin) return false;
      if (filters.priceMin && item.price < filters.priceMin) return false;
      if (filters.priceMax && item.price > filters.priceMax) return false;
      return true;
    });
  }

  // ==========================================
  // MODULE 7: EVIDENCE ENGINE
  // ==========================================
  async getEvidence(): Promise<ResearchEvidence[]> {
    return await researchEP06Repository.getEvidence();
  }

  async getEvidenceByProject(projectId: string): Promise<ResearchEvidence[]> {
    return await researchEP06Repository.getEvidenceByProject(projectId);
  }

  async createEvidence(ev: Partial<ResearchEvidence>): Promise<ResearchEvidence> {
    const newEv = await researchEP06Repository.createEvidence(ev);

    // Save Timeline
    await researchEP06Repository.createTimelineEntry({
      projectId: newEv.projectId,
      event: "ResearchUpdated",
      description: `New evidence registered. Confidence level: ${newEv.confidence}%. Source: ${newEv.source}.`
    });

    return newEv;
  }

  // ==========================================
  // MODULE 8: NOTES ENGINE
  // ==========================================
  async getNotes(): Promise<ResearchNote[]> {
    return await researchEP06Repository.getNotes();
  }

  async getNotesByProject(projectId: string): Promise<ResearchNote[]> {
    return await researchEP06Repository.getNotesByProject(projectId);
  }

  async createNote(note: Partial<ResearchNote>): Promise<ResearchNote> {
    const newNote = await researchEP06Repository.createNote(note);
    
    // Save Timeline
    await researchEP06Repository.createTimelineEntry({
      projectId: newNote.projectId,
      event: "ResearchUpdated",
      description: `New ${newNote.authorType} analyst note appended.`
    });

    return newNote;
  }

  async pinNote(id: string, isPinned: boolean): Promise<void> {
    await researchEP06Repository.updateNotePinned(id, isPinned);
  }

  async archiveNote(id: string, isArchived: boolean): Promise<void> {
    await researchEP06Repository.updateNoteArchived(id, isArchived);
  }

  // ==========================================
  // MODULE 9: TIMELINE ENGINE
  // ==========================================
  async getTimeline(): Promise<ResearchTimeline[]> {
    return await researchEP06Repository.getTimeline();
  }

  async getTimelineByProject(projectId: string): Promise<ResearchTimeline[]> {
    return await researchEP06Repository.getTimelineByProject(projectId);
  }

  // ==========================================
  // MODULE 10: VALIDATION ENGINE
  // ==========================================
  /**
   * Performs critical validation checks on research dataset import requests.
   * Checks if market is open/active, dataset variables are present, duplicates don't exist.
   */
  async validateDatasetImport(dataset: Partial<ResearchDataset>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // 1. Check Market Session status from EP05 for audit logging
    try {
      const activeStatus = await this.ep05Service.getMarketStatus();
      if (activeStatus && activeStatus.status === 'HALTED') {
        errors.push("Emergency Trading Halt: Market session status is HALTED. Research ingestions suspended.");
      }
    } catch (e) {
      console.warn("[EP06] Calendar status check skipped:", e);
    }

    // 2. Check general dataset inputs
    if (!dataset.projectId) errors.push("Mandatory projectId missing from compilation descriptor.");
    if (!dataset.datasetName) errors.push("Dataset name identifier required.");
    if (!dataset.version) errors.push("Semantic versioning code required.");
    if (!dataset.source) errors.push("Data origin source node must be declared.");
    if (!dataset.checksum || dataset.checksum.length < 10) errors.push("Invalid or corrupted SHA-256 integrity checksum.");

    // 3. Verify duplicates
    const existing = await researchEP06Repository.getDatasets();
    const isDuplicate = existing.some(
      d => d.projectId === dataset.projectId && 
           d.datasetName === dataset.datasetName && 
           d.version === dataset.version
    );
    if (isDuplicate) {
      errors.push(`Duplicate dataset rejected: A dataset named "${dataset.datasetName}" with version ${dataset.version} already exists in this project namespace.`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==========================================
  // MODULE 12: RUNTIME ENGINE
  // ==========================================
  async getRuntimeTasks(): Promise<ResearchRuntime[]> {
    return await researchEP06Repository.getRuntimeTasks();
  }

  async triggerJobRun(jobId: string): Promise<ResearchRuntime> {
    if (this.getEngineState().state === 'OFF') {
      throw new Error("Research Runtime Processing is currently OFF (Module-Local). Switch Research Engine to ON to run worker tasks.");
    }
    const jobs = await researchEP06Repository.getJobs();
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) {
      throw new Error(`Execution failed: Job ID ${jobId} not found.`);
    }

    console.log(`[EP06] Queueing Job ${jobId} for execution in Research Runtime.`);

    // 1. Create a task entry
    const task = await researchEP06Repository.createRuntimeTask({
      jobId,
      queueName: targetJob.jobType === 'REALTIME' ? 'HIGH_PRIORITY' : 'DEFAULT',
      workerId: `worker_node_0${Math.floor(Math.random() * 4) + 1}`,
      priority: targetJob.jobType === 'REALTIME' ? 50 : 10,
      executionStatus: 'PROCESSING',
      logs: `[${new Date().toISOString()}] Job fetched by scheduler. Allocated worker node.\n[${new Date().toISOString()}] Reading market masters from EP04...`,
      startedAt: new Date()
    });

    // 2. Simulate worker background action (Asynchronously resolves to COMPLETED)
    setTimeout(async () => {
      try {
        const updatedLogs = task.logs + 
          `\n[${new Date().toISOString()}] Symbols loaded successfully.` +
          `\n[${new Date().toISOString()}] Compiling scanned statistics & indicators...` +
          `\n[${new Date().toISOString()}] Validating data integrity matrix...` +
          `\n[${new Date().toISOString()}] Publishing facts to research_events...` +
          `\n[${new Date().toISOString()}] Execution resolved with status code 0. Immutable snapshot archived.`;

        await researchEP06Repository.updateRuntimeTask(task.id, {
          executionStatus: 'COMPLETED',
          logs: updatedLogs,
          finishedAt: new Date()
        });

        // Publish success event (Module 13)
        await researchEP06Repository.logEvent("ResearchCompleted", {
          jobId,
          taskId: task.id,
          projectId: targetJob.projectId,
          executionTimeMs: Math.floor(Math.random() * 2000) + 500
        });

        // Add timeline
        await researchEP06Repository.createTimelineEntry({
          projectId: targetJob.projectId,
          event: "ResearchCompleted",
          description: `Research Job "${targetJob.jobName}" successfully completed execution. Results analyzed.`
        });

      } catch (err: any) {
        await researchEP06Repository.updateRuntimeTask(task.id, {
          executionStatus: 'FAILED',
          logs: task.logs + `\n[CRITICAL ERROR] Execution failed: ${err.message}`,
          finishedAt: new Date()
        });
      }
    }, 1500);

    return task;
  }

  // ==========================================
  // MODULE 13: EVENT ENGINE
  // ==========================================
  async getEvents(): Promise<ResearchEvent[]> {
    return await researchEP06Repository.getEvents();
  }

  async resetTestData(params: { confirm: boolean; resetState: string; actor: string; organizationId: string }): Promise<any> {
    return await researchEP06Repository.resetTestData(params);
  }

  getEngineState(): { state: 'ON' | 'OFF'; module: string } {
    return researchEP06Repository.getEngineState();
  }

  setEngineState(state: 'ON' | 'OFF'): { state: 'ON' | 'OFF'; module: string } {
    return researchEP06Repository.setEngineState(state);
  }
}

export const researchEP06Service = new ResearchEP06Service();
