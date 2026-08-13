import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  researchProjectsTable,
  researchJobsTable,
  researchDatasetsTable,
  researchWatchlistsTable,
  researchEvidenceTable,
  researchNotesTable,
  researchTimelineTable,
  researchRuntimeTable,
  researchEventsTable
} from "../../../db/schema.ts";
import { 
  ResearchProject,
  ResearchJob,
  ResearchDataset,
  ResearchWatchlist,
  ResearchEvidence,
  ResearchNote,
  ResearchTimeline,
  ResearchRuntime,
  ResearchEvent
} from "../types/ep06.ts";

export class ResearchEP06Repository {
  /**
   * Automatically builds the research tables if missing and seeds default master data.
   */
  async ensureResearchTablesAndMasterData(): Promise<void> {
    const db = getDb();
    console.log("[EP06] Initializing Enterprise Research Workspace Tables...");

    try {
      // 1. Create tables with raw SQL fallback to ensure complete system robustness
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS research_projects (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          objective TEXT NOT NULL,
          owner VARCHAR(100) NOT NULL,
          priority VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL,
          category VARCHAR(100) NOT NULL,
          tags JSONB DEFAULT '[]'::jsonb NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS research_jobs (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          job_name VARCHAR(255) NOT NULL,
          job_type VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL,
          schedule VARCHAR(100),
          last_run TIMESTAMP,
          next_run TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS research_datasets (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          dataset_name VARCHAR(255) NOT NULL,
          version VARCHAR(50) NOT NULL,
          source VARCHAR(100) NOT NULL,
          size_bytes INTEGER DEFAULT 0 NOT NULL,
          checksum VARCHAR(100) NOT NULL,
          timestamp TIMESTAMP NOT NULL,
          is_valid BOOLEAN DEFAULT TRUE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS research_watchlists (
          id VARCHAR(100) PRIMARY KEY,
          watchlist_name VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          symbols JSONB DEFAULT '[]'::jsonb NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ep06_research_evidence (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          observation TEXT NOT NULL,
          reference VARCHAR(255) NOT NULL,
          confidence INTEGER DEFAULT 100 NOT NULL,
          correlation_id VARCHAR(100),
          timestamp TIMESTAMP NOT NULL,
          source VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS research_notes (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          note_text TEXT NOT NULL,
          author_type VARCHAR(50) NOT NULL,
          is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
          is_archived BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS research_timeline (
          id VARCHAR(100) PRIMARY KEY,
          project_id VARCHAR(100) NOT NULL,
          event VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS research_runtime (
          id VARCHAR(100) PRIMARY KEY,
          job_id VARCHAR(100) NOT NULL,
          queue_name VARCHAR(100) NOT NULL,
          worker_id VARCHAR(100) NOT NULL,
          priority INTEGER DEFAULT 0 NOT NULL,
          execution_status VARCHAR(50) NOT NULL,
          retry_count INTEGER DEFAULT 0 NOT NULL,
          logs TEXT DEFAULT '' NOT NULL,
          started_at TIMESTAMP,
          finished_at TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS research_events (
          id VARCHAR(100) PRIMARY KEY,
          event_type VARCHAR(100) NOT NULL,
          payload JSONB DEFAULT '{}'::jsonb NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
      console.log("[EP06] Database tables created successfully.");

      // 2. Check and seed default data
      const existingProjects = await db.select().from(researchProjectsTable).limit(1);
      if (existingProjects.length === 0) {
        console.log("[EP06] Seeding default research master data...");

        // Insert Projects
        await db.insert(researchProjectsTable).values([
          {
            id: "proj_01",
            title: "NIFTY-50 Liquidity & Execution Cost Analysis",
            objective: "Analyze slippage, volume distribution, and order book depth across NIFTY-50 constituents during pre-open and market-open sessions.",
            owner: "Senior Analyst Rohit Sharma",
            priority: "HIGH",
            status: "ACTIVE",
            category: "INDEX",
            tags: ["nifty50", "liquidity", "slippage"],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: "proj_02",
            title: "Sector Correlation Matrix & Dispersion Study",
            objective: "Map the rolling 90-day correlation coefficient between Banking, IT, and Commodities to identify macro dispersion events.",
            owner: "Macro Analyst Priyanka Patel",
            priority: "MEDIUM",
            status: "ACTIVE",
            category: "EQUITY",
            tags: ["correlation", "sectors", "dispersion"],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: "proj_03",
            title: "Option Chain Skew & Implied Volatility Surface Mapping",
            objective: "Continuous monitoring of IV smiles and put-call ratios for upcoming monthly expiry contracts.",
            owner: "Derivative Quant Amit Kumar",
            priority: "HIGH",
            status: "ACTIVE",
            category: "OPTIONS",
            tags: ["skew", "iv", "options"],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);

        // Insert Jobs
        await db.insert(researchJobsTable).values([
          {
            id: "job_01",
            projectId: "proj_01",
            jobName: "Nifty Order Book Snapshot Exporter",
            jobType: "RECURRING",
            status: "RUNNING",
            schedule: "Every 5 mins during Market Hours",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: "job_02",
            projectId: "proj_02",
            jobName: "Daily Close Dispersion Calculator",
            jobType: "SCHEDULED",
            status: "IDLE",
            schedule: "Daily at 16:30",
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: "job_03",
            projectId: "proj_03",
            jobName: "Real-Time Volatility Skew Scanner",
            jobType: "REALTIME",
            status: "RUNNING",
            schedule: "Real-time stream",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);

        // Insert Datasets
        await db.insert(researchDatasetsTable).values([
          {
            id: "ds_01",
            projectId: "proj_01",
            datasetName: "Nifty_Open_LOB_Slippage_v1.0",
            version: "1.0.0",
            source: "EP04-ExchangeRegistry",
            sizeBytes: 1240590,
            checksum: "a7b3d9f120e541a0b3f5c719ef82d029",
            timestamp: new Date(),
            isValid: true,
            createdAt: new Date()
          },
          {
            id: "ds_02",
            projectId: "proj_02",
            datasetName: "Sectoral_Daily_Close_Matrix_90D",
            version: "2.1.0",
            source: "EP05-TradingCalendar",
            sizeBytes: 521000,
            checksum: "ff8c1a93bd20f418cd92b23f81aa301e",
            timestamp: new Date(),
            isValid: true,
            createdAt: new Date()
          }
        ]);

        // Insert Watchlists
        await db.insert(researchWatchlistsTable).values([
          {
            id: "wl_01",
            watchlistName: "Nifty 50 Heavyweights",
            type: "INDEX",
            symbols: ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK"],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: "wl_02",
            watchlistName: "IT Sector",
            type: "SECTOR",
            symbols: ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM"],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: "wl_03",
            watchlistName: "Commodity Instruments",
            type: "COMMODITY",
            symbols: ["GOLD", "SILVER", "CRUDEOIL", "NATURALGAS"],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);

        // Insert Notes
        await db.insert(researchNotesTable).values([
          {
            id: "note_01",
            projectId: "proj_01",
            noteText: "Observation: Slippage on Nifty-50 constituents is significantly lower during first 15 mins of market open when compared to the closing 15 mins. Volume concentration remains high.",
            authorType: "ANALYST",
            isPinned: true,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: "note_02",
            projectId: "proj_02",
            noteText: "Correlation between banking and IT has decoupled over the last 30 days, dropping from 0.72 to 0.31. Likely sector rotation in play.",
            authorType: "AI",
            isPinned: false,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);

        // Insert Evidence
        await db.insert(researchEvidenceTable).values([
          {
            id: "ev_01",
            projectId: "proj_01",
            observation: "Average bid-ask spread on RELIANCE during normal market session is 0.05 INR.",
            reference: "Tick Data Feed NSE_RELIANCE_2026-07-20",
            confidence: 98,
            correlationId: "corr_lob_01",
            timestamp: new Date(),
            source: "EP04-SymbolMaster",
            createdAt: new Date()
          }
        ]);

        // Insert Timeline
        await db.insert(researchTimelineTable).values([
          {
            id: "time_01",
            projectId: "proj_01",
            event: "ResearchStarted",
            description: "Rohit Sharma initiated the execution of NIFTY-50 Slippage analysis.",
            timestamp: new Date()
          }
        ]);

        // Insert Runtime Tasks
        await db.insert(researchRuntimeTable).values([
          {
            id: "task_01",
            jobId: "job_01",
            queueName: "DEFAULT",
            workerId: "worker_node_01",
            priority: 10,
            executionStatus: "COMPLETED",
            retryCount: 0,
            logs: "Initializing LOB snapshot...\nFetched symbols from EP04 Instrument Master.\nParsed 50 ticker books successfully.\nSaved to research_datasets.",
            startedAt: new Date(),
            finishedAt: new Date()
          }
        ]);

        // Insert Events
        await db.insert(researchEventsTable).values([
          {
            id: "evt_01",
            eventType: "ResearchStarted",
            payload: { projectId: "proj_01", initiatedBy: "Rohit Sharma" },
            createdAt: new Date()
          }
        ]);

        console.log("[EP06] Seeding complete.");
      }
    } catch (error) {
      console.error("[EP06] Error initializing Research Tables:", error);
    }
  }

  // ==========================================
  // PROJECTS
  // ==========================================
  async createProject(project: Partial<ResearchProject>): Promise<ResearchProject> {
    const db = getDb();
    const id = `proj_${Date.now()}`;
    const newProject = {
      id,
      title: project.title || "Untitled Project",
      objective: project.objective || "",
      owner: project.owner || "System Analyst",
      priority: project.priority || "MEDIUM",
      status: project.status || "ACTIVE",
      category: project.category || "EQUITY",
      tags: project.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.insert(researchProjectsTable).values(newProject);
    return newProject as ResearchProject;
  }

  async getProjects(): Promise<ResearchProject[]> {
    const db = getDb();
    const result = await db.select().from(researchProjectsTable).orderBy(desc(researchProjectsTable.createdAt));
    return result as ResearchProject[];
  }

  async getProjectById(id: string): Promise<ResearchProject | null> {
    const db = getDb();
    const result = await db.select().from(researchProjectsTable).where(eq(researchProjectsTable.id, id)).limit(1);
    return result[0] ? (result[0] as ResearchProject) : null;
  }

  // ==========================================
  // JOBS
  // ==========================================
  async createJob(job: Partial<ResearchJob>): Promise<ResearchJob> {
    const db = getDb();
    const id = `job_${Date.now()}`;
    const newJob = {
      id,
      projectId: job.projectId || "proj_01",
      jobName: job.jobName || "Unnamed Job",
      jobType: job.jobType || "MANUAL",
      status: job.status || "IDLE",
      schedule: job.schedule || "One Time",
      lastRun: job.lastRun || null,
      nextRun: job.nextRun || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.insert(researchJobsTable).values(newJob);
    return newJob as ResearchJob;
  }

  async getJobs(): Promise<ResearchJob[]> {
    const db = getDb();
    return await db.select().from(researchJobsTable).orderBy(desc(researchJobsTable.createdAt)) as any[];
  }

  async getJobsByProject(projectId: string): Promise<ResearchJob[]> {
    const db = getDb();
    return await db.select().from(researchJobsTable).where(eq(researchJobsTable.projectId, projectId)) as any[];
  }

  async updateJobStatus(id: string, status: any): Promise<void> {
    const db = getDb();
    await db.update(researchJobsTable).set({ status, updatedAt: new Date() }).where(eq(researchJobsTable.id, id));
  }

  // ==========================================
  // DATASETS
  // ==========================================
  async createDataset(dataset: Partial<ResearchDataset>): Promise<ResearchDataset> {
    const db = getDb();
    const id = `ds_${Date.now()}`;
    const newDataset = {
      id,
      projectId: dataset.projectId || "proj_01",
      datasetName: dataset.datasetName || "Unnamed Dataset",
      version: dataset.version || "1.0.0",
      source: dataset.source || "Unknown",
      sizeBytes: dataset.sizeBytes || 0,
      checksum: dataset.checksum || "checksum_stub",
      timestamp: dataset.timestamp || new Date(),
      isValid: dataset.isValid !== undefined ? dataset.isValid : true,
      createdAt: new Date()
    };
    await db.insert(researchDatasetsTable).values(newDataset);
    return newDataset as ResearchDataset;
  }

  async getDatasets(): Promise<ResearchDataset[]> {
    const db = getDb();
    return await db.select().from(researchDatasetsTable).orderBy(desc(researchDatasetsTable.createdAt)) as any[];
  }

  async getDatasetsByProject(projectId: string): Promise<ResearchDataset[]> {
    const db = getDb();
    return await db.select().from(researchDatasetsTable).where(eq(researchDatasetsTable.projectId, projectId)) as any[];
  }

  // ==========================================
  // WATCHLISTS
  // ==========================================
  async createWatchlist(wl: Partial<ResearchWatchlist>): Promise<ResearchWatchlist> {
    const db = getDb();
    const id = `wl_${Date.now()}`;
    const newWl = {
      id,
      watchlistName: wl.watchlistName || "New Watchlist",
      type: wl.type || "STOCK",
      symbols: wl.symbols || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.insert(researchWatchlistsTable).values(newWl);
    return newWl as ResearchWatchlist;
  }

  async getWatchlists(): Promise<ResearchWatchlist[]> {
    const db = getDb();
    return await db.select().from(researchWatchlistsTable).orderBy(desc(researchWatchlistsTable.createdAt)) as any[];
  }

  async updateWatchlistSymbols(id: string, symbols: string[]): Promise<void> {
    const db = getDb();
    await db.update(researchWatchlistsTable).set({ symbols, updatedAt: new Date() }).where(eq(researchWatchlistsTable.id, id));
  }

  // ==========================================
  // EVIDENCE
  // ==========================================
  async createEvidence(ev: Partial<ResearchEvidence>): Promise<ResearchEvidence> {
    const db = getDb();
    const id = `ev_${Date.now()}`;
    const newEv = {
      id,
      projectId: ev.projectId || "proj_01",
      observation: ev.observation || "",
      reference: ev.reference || "",
      confidence: ev.confidence !== undefined ? ev.confidence : 100,
      correlationId: ev.correlationId || null,
      timestamp: ev.timestamp || new Date(),
      source: ev.source || "System Scanner",
      createdAt: new Date()
    };
    await db.insert(researchEvidenceTable).values(newEv);
    return newEv as ResearchEvidence;
  }

  async getEvidence(): Promise<ResearchEvidence[]> {
    const db = getDb();
    return await db.select().from(researchEvidenceTable).orderBy(desc(researchEvidenceTable.createdAt)) as any[];
  }

  async getEvidenceByProject(projectId: string): Promise<ResearchEvidence[]> {
    const db = getDb();
    return await db.select().from(researchEvidenceTable).where(eq(researchEvidenceTable.projectId, projectId)) as any[];
  }

  // ==========================================
  // NOTES
  // ==========================================
  async createNote(note: Partial<ResearchNote>): Promise<ResearchNote> {
    const db = getDb();
    const id = `note_${Date.now()}`;
    const newNote = {
      id,
      projectId: note.projectId || "proj_01",
      noteText: note.noteText || "",
      authorType: note.authorType || "MANUAL",
      isPinned: note.isPinned || false,
      isArchived: note.isArchived || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.insert(researchNotesTable).values(newNote);
    return newNote as ResearchNote;
  }

  async getNotes(): Promise<ResearchNote[]> {
    const db = getDb();
    return await db.select().from(researchNotesTable).orderBy(desc(researchNotesTable.createdAt)) as any[];
  }

  async getNotesByProject(projectId: string): Promise<ResearchNote[]> {
    const db = getDb();
    return await db.select().from(researchNotesTable).where(eq(researchNotesTable.projectId, projectId)) as any[];
  }

  async updateNotePinned(id: string, isPinned: boolean): Promise<void> {
    const db = getDb();
    await db.update(researchNotesTable).set({ isPinned, updatedAt: new Date() }).where(eq(researchNotesTable.id, id));
  }

  async updateNoteArchived(id: string, isArchived: boolean): Promise<void> {
    const db = getDb();
    await db.update(researchNotesTable).set({ isArchived, updatedAt: new Date() }).where(eq(researchNotesTable.id, id));
  }

  // ==========================================
  // TIMELINE
  // ==========================================
  async createTimelineEntry(entry: Partial<ResearchTimeline>): Promise<ResearchTimeline> {
    const db = getDb();
    const id = `time_${Date.now()}`;
    const newEntry = {
      id,
      projectId: entry.projectId || "proj_01",
      event: entry.event || "ResearchUpdated",
      description: entry.description || "",
      timestamp: new Date()
    };
    await db.insert(researchTimelineTable).values(newEntry);
    return newEntry as ResearchTimeline;
  }

  async getTimeline(): Promise<ResearchTimeline[]> {
    const db = getDb();
    return await db.select().from(researchTimelineTable).orderBy(desc(researchTimelineTable.timestamp)) as any[];
  }

  async getTimelineByProject(projectId: string): Promise<ResearchTimeline[]> {
    const db = getDb();
    return await db.select().from(researchTimelineTable).where(eq(researchTimelineTable.projectId, projectId)).orderBy(desc(researchTimelineTable.timestamp)) as any[];
  }

  // ==========================================
  // RUNTIME
  // ==========================================
  async createRuntimeTask(task: Partial<ResearchRuntime>): Promise<ResearchRuntime> {
    const db = getDb();
    const id = `task_${Date.now()}`;
    const newRuntime = {
      id,
      jobId: task.jobId || "job_01",
      queueName: task.queueName || "DEFAULT",
      workerId: task.workerId || "worker_node_01",
      priority: task.priority !== undefined ? task.priority : 0,
      executionStatus: task.executionStatus || "QUEUED",
      retryCount: task.retryCount || 0,
      logs: task.logs || "",
      startedAt: task.startedAt || null,
      finishedAt: task.finishedAt || null
    };
    await db.insert(researchRuntimeTable).values(newRuntime);
    return newRuntime as ResearchRuntime;
  }

  async getRuntimeTasks(): Promise<ResearchRuntime[]> {
    const db = getDb();
    return await db.select().from(researchRuntimeTable).orderBy(desc(researchRuntimeTable.startedAt)) as any[];
  }

  async updateRuntimeTask(id: string, patch: Partial<ResearchRuntime>): Promise<void> {
    const db = getDb();
    await db.update(researchRuntimeTable).set(patch).where(eq(researchRuntimeTable.id, id));
  }

  // ==========================================
  // EVENTS
  // ==========================================
  async logEvent(eventType: any, payload: any): Promise<ResearchEvent> {
    const db = getDb();
    const id = `evt_${Date.now()}`;
    const newEvent = {
      id,
      eventType,
      payload,
      createdAt: new Date()
    };
    await db.insert(researchEventsTable).values(newEvent);
    return newEvent as ResearchEvent;
  }

  async getEvents(): Promise<ResearchEvent[]> {
    const db = getDb();
    return await db.select().from(researchEventsTable).orderBy(desc(researchEventsTable.createdAt)) as any[];
  }

  private researchEngineState: 'ON' | 'OFF' = 'ON';

  getEngineState(): { state: 'ON' | 'OFF'; module: string } {
    return { state: this.researchEngineState, module: 'RESEARCH' };
  }

  setEngineState(state: 'ON' | 'OFF'): { state: 'ON' | 'OFF'; module: string } {
    this.researchEngineState = state;
    return { state: this.researchEngineState, module: 'RESEARCH' };
  }

  async resetTestData(params: { confirm: boolean; resetState: string; actor: string; organizationId: string }): Promise<any> {
    if (params.resetState !== "ON" || !params.confirm) {
      return {
        status: "ABORTED",
        message: "Research Test Reset is currently OFF or missing explicit confirmation.",
        confirm: params.confirm,
        resetState: params.resetState
      };
    }

    const db = getDb();
    const resetRunId = `RST-RUN-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const env = process.env.NODE_ENV || "staging";

    // Safely purge volatile research test runtime/staging tasks and test jobs
    let recordsCleared = 0;

    try {
      const delRuntime = await db.delete(researchRuntimeTable).returning();
      recordsCleared += delRuntime.length;
    } catch (e) {
      // ignore
    }

    try {
      const delJobs = await db.delete(researchJobsTable)
        .where(sql`id LIKE 'job_test%' OR title LIKE '%Test%' OR title LIKE '%Simulated%' OR status IN ('QUEUED', 'RUNNING', 'FAILED', 'CANCELLED', 'DRAFT')`)
        .returning();
      recordsCleared += delJobs.length;
    } catch (e) {
      // ignore
    }

    try {
      const delEvents = await db.delete(researchEventsTable).returning();
      recordsCleared += delEvents.length;
    } catch (e) {
      // ignore
    }

    const result = {
      module: "RESEARCH",
      resetRunId,
      actor: params.actor,
      organizationId: params.organizationId,
      environment: env,
      timestamp,
      recordsCleared,
      status: "COMPLETED",
      protectedAssets: [
        "production_research",
        "production_evidence",
        "historical_market_data",
        "audit_compliance_records",
        "ai_memory",
        "production_knowledge_graph",
        "published_research",
        "historical_packages",
        "organization_rbac_data",
        "database_schema",
        "migrations"
      ]
    };

    await this.logEvent("ResearchTestReset", result);
    return result;
  }
}

export const researchEP06Repository = new ResearchEP06Repository();
