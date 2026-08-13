import {
  NewsArticle,
  RawNewsInput,
  NewsCategory,
  EventPriority,
  CorporateAction,
  CorporateActionType,
  CorporateActionStatus,
  EconomicCalendarEvent,
  EconomicCategory,
  NewsSource,
  NewsSymbolMapping,
  NewsCategoryDef,
  NewsProvider
} from "../types/index.ts";
import { newsRepo, NewsRepository } from "../repositories/NewsRepository.ts";

/**
 * ==========================================
 * 1. NEWS REGISTRY
 * ==========================================
 */
export class NewsRegistry {
  private providers = new Map<string, NewsProvider>();
  private defaultCategories: NewsCategoryDef[] = [
    { categoryId: "MARKET", name: "Market News", description: "General stock, bond, and index developments", active: true },
    { categoryId: "COMPANY", name: "Company Disclosures", description: "Specific corporate announcements and financial results", active: true },
    { categoryId: "ECONOMY", name: "Economic Indicators", description: "Macroeconomic calendar indicators and policy announcements", active: true },
    { categoryId: "POLICY", name: "Regulatory & Policy Updates", description: "Central bank and government regulatory mandates", active: true },
    { categoryId: "RESULTS", name: "Earnings Results", description: "Quarterly and annual financial statement filings", active: true },
    { categoryId: "CORPORATE_ACTIONS", name: "Corporate Actions", description: "Stock splits, dividends, bonuses, and mergers", active: true }
  ];

  constructor() {
    this.seedDefaultCategories();
  }

  private seedDefaultCategories() {
    for (const cat of this.defaultCategories) {
      newsRepo.saveCategory(cat).catch(() => {});
    }
  }

  public registerProvider(provider: NewsProvider): void {
    if (!provider.providerId || !provider.name) {
      throw new Error("Invalid news provider registration payload.");
    }
    this.providers.set(provider.providerId, provider);
  }

  public getProvider(id: string): NewsProvider | null {
    return this.providers.get(id) || null;
  }

  public getProviders(): NewsProvider[] {
    return Array.from(this.providers.values());
  }

  public getCategories(): NewsCategoryDef[] {
    return this.defaultCategories;
  }
}

/**
 * ==========================================
 * 2. NEWS HEALTH
 * ==========================================
 */
export class NewsHealth {
  private itemsProcessed = 0;
  private fetchFailures = 0;
  private lastFetchTime: Date | null = null;
  private processingSpeedsMs: number[] = [];

  public recordProcessed(count: number) {
    this.itemsProcessed += count;
  }

  public recordFailure() {
    this.fetchFailures++;
  }

  public recordFetch(time: Date) {
    this.lastFetchTime = time;
  }

  public recordProcessingSpeed(ms: number) {
    this.processingSpeedsMs.push(ms);
    if (this.processingSpeedsMs.length > 50) this.processingSpeedsMs.shift();
  }

  public getHealthReport() {
    const avgSpeed = this.processingSpeedsMs.length === 0
      ? 0
      : this.processingSpeedsMs.reduce((a, b) => a + b, 0) / this.processingSpeedsMs.length;

    return {
      status: "HEALTHY",
      uptimeSeconds: Math.floor(process.uptime()),
      metrics: {
        totalItemsProcessed: this.itemsProcessed,
        totalFetchFailures: this.fetchFailures,
        averageProcessingSpeedMs: parseFloat(avgSpeed.toFixed(2)),
        lastSuccessfulFetch: this.lastFetchTime
      },
      timestamp: new Date()
    };
  }
}

/**
 * ==========================================
 * 3. NEWS LIFECYCLE
 * ==========================================
 */
export class NewsLifecycle {
  private intervalHandle: NodeJS.Timeout | null = null;

  public start(onTick: () => Promise<void>, intervalMs = 60000) {
    console.log(`[NewsLifecycle] Starting News Ingestion Scheduler (Interval: ${intervalMs}ms)...`);
    this.intervalHandle = setInterval(() => {
      onTick().catch(err => console.error("[NewsLifecycle] Tick loop experienced an error:", err));
    }, intervalMs);
  }

  public stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      console.log("[NewsLifecycle] News Ingestion Scheduler stopped.");
    }
  }
}

/**
 * ==========================================
 * 4. NEWS SERVICE (MAIN ENGINE)
 * ==========================================
 */
export class NewsService {
  public registry = new NewsRegistry();
  public health = new NewsHealth();
  public lifecycle = new NewsLifecycle();
  private repo: NewsRepository;

  constructor() {
    this.repo = newsRepo;
    this.registerDefaultProviders();
    this.seedMockDatabaseRecords();
    this.lifecycle.start(() => this.fetchAndProcessAllProviders(), 120000); // 2 minutes
  }

  public shutdown() {
    this.lifecycle.stop();
  }

  private registerDefaultProviders() {
    // Standard market feeds provider
    this.registry.registerProvider({
      providerId: "exchange_feed",
      name: "Exchange Bulletins Feed",
      fetchLatest: async () => [
        {
          headline: "RELIANCE Announces Record Q1 Revenue Gains with Strong Retail Push",
          summary: "Reliance Industries reports substantial double digit growth in Q1 consumer retail business.",
          body: "Mumbai, July 2026: Reliance Industries Limited reported a robust 18% year-over-year increase in retail sector profits, driven by rapid digital expansions and visual footprint improvements.",
          category: "RESULTS",
          source: "Exchange Bulletin",
          publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
          importance: "HIGH",
          tags: ["Earnings", "Retail", "Growth"],
          symbols: ["RELIANCE"]
        },
        {
          headline: "TCS Enters Strategic Multi-Year Digital Transformation Alliance with UK Retailer",
          summary: "Tata Consultancy Services secures massive digital overhaul contract in European markets.",
          body: "London/Mumbai: Tata Consultancy Services (TCS) announced today a long-term enterprise modernization contract to deploy cloud automation solutions for major continental distribution networks.",
          category: "COMPANY",
          source: "Corporate Bulletin",
          publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
          importance: "MEDIUM",
          tags: ["Partnership", "Cloud", "Contract"],
          symbols: ["TCS"]
        }
      ]
    });

    this.registry.registerProvider({
      providerId: "macro_feed",
      name: "Economic Indicators Feed",
      fetchLatest: async () => [
        {
          headline: "RBI Keeps Repo Rate Unchanged at 6.50% Citing Dynamic Inflation Controls",
          summary: "The monetary policy committee votes unanimously to maintain present liquidity guidelines.",
          body: "Mumbai: The Reserve Bank of India (RBI) Governor confirmed today that the key policy rates will remain steady. This is aligned with the multi-year target to bring headline inflation down to the 4% target.",
          category: "ECONOMY",
          source: "Government Release",
          publishedAt: new Date(Date.now() - 14400000), // 4 hours ago
          importance: "CRITICAL",
          tags: ["Monetary Policy", "RBI", "Interest Rate"],
          symbols: ["NIFTY_FUT"]
        }
      ]
    });
  }

  /**
   * Part 3: News Normalization Implementation
   */
  public normalizeRawArticle(raw: RawNewsInput): NewsArticle {
    const headline = (raw.headline || raw.title || "Untitled Article").trim();
    const summary = (raw.summary || raw.desc || headline).trim().slice(0, 300);
    const body = (raw.body || raw.text || summary).trim();

    // Map Category strictly to NewsCategory enum
    let category: NewsCategory = "GENERAL";
    const rawCat = (raw.category || raw.cat || "").toUpperCase();
    if (["MARKET", "COMPANY", "ECONOMY", "POLICY", "RESULTS", "CORPORATE_ACTIONS", "GLOBAL", "SECTOR", "COMMODITY", "CURRENCY", "GENERAL"].includes(rawCat)) {
      category = rawCat as NewsCategory;
    } else if (rawCat.includes("EARN") || rawCat.includes("FINANCIAL")) {
      category = "RESULTS";
    } else if (rawCat.includes("MACRO") || rawCat.includes("RATE")) {
      category = "ECONOMY";
    }

    const source = (raw.source || raw.src || "Unknown Feed").trim();
    const language = (raw.language || raw.lang || "en").trim().toLowerCase().slice(0, 10);
    const publishedAt = raw.publishedAt || raw.pubTime || new Date();

    // Event priority mapping
    let importance: EventPriority = "MEDIUM";
    const rawImp = (raw.importance || raw.priority || "").toUpperCase();
    if (["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"].includes(rawImp)) {
      importance = rawImp as EventPriority;
    }

    // Parse Tags
    let tags: string[] = [];
    if (Array.isArray(raw.tags)) {
      tags = raw.tags.map(t => String(t).trim());
    } else if (typeof raw.tags === "string") {
      tags = raw.tags.split(",").map(t => t.trim());
    }

    // Extract Affected Symbols & map tickers
    let affectedSymbols: string[] = [];
    if (Array.isArray(raw.symbols)) {
      affectedSymbols = raw.symbols.map(s => String(s).toUpperCase().trim());
    } else if (typeof raw.symbols === "string") {
      affectedSymbols = raw.symbols.split(",").map(s => s.toUpperCase().trim());
    } else {
      // Direct text matcher heuristic
      const combinedText = `${headline} ${summary} ${body}`.toUpperCase();
      const checkSymbols = ["RELIANCE", "TCS", "NIFTY", "GOLD"];
      for (const sym of checkSymbols) {
        if (combinedText.includes(sym)) {
          affectedSymbols.push(sym);
        }
      }
    }

    // Basic heuristic sentiment calculator
    let sentimentScore = 0.0;
    const posWords = ["GROWTH", "RECORD", "PROFIT", "HIGHER", "GAIN", "ALLIANCE", "EXPANSION", "SECURES", "POSITIVE", "BULLISH"];
    const negWords = ["DROP", "FAIL", "LOSS", "LOWER", "CUT", "RISK", "DECLINE", "INFLATION", "BEARISH", "WARNING"];
    const combinedUpper = combinedTextHeuristic(headline, summary, body);

    for (const p of posWords) if (combinedUpper.includes(p)) sentimentScore += 0.25;
    for (const n of negWords) if (combinedUpper.includes(n)) sentimentScore -= 0.25;

    sentimentScore = Math.max(-1.0, Math.min(1.0, sentimentScore));
    let sentimentLabel: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
    if (sentimentScore > 0.15) sentimentLabel = "BULLISH";
    else if (sentimentScore < -0.15) sentimentLabel = "BEARISH";

    const newsId = `news-${hashCode(`${headline}-${source}-${new Date(publishedAt).getTime()}`)}`;

    return {
      newsId,
      headline,
      summary,
      body,
      category,
      source,
      language,
      publishedAt: new Date(publishedAt),
      importance,
      tags,
      affectedSymbols,
      sentimentScore,
      sentimentLabel,
      extraData: raw.meta || {}
    };
  }

  /**
   * Core driver loop to fetch, normalize, and store
   */
  public async fetchAndProcessAllProviders(): Promise<void> {
    const startMs = Date.now();
    const providers = this.registry.getProviders();
    console.log(`[NewsService] Running dynamic ingestion sweep across ${providers.length} registered feeds...`);

    let totalSaved = 0;
    for (const prov of providers) {
      try {
        const rawItems = await prov.fetchLatest();
        for (const raw of rawItems) {
          const norm = this.normalizeRawArticle(raw);
          await this.repo.saveArticle(norm);

          // Build symbol mapping entries for lookup index (Part 8)
          for (const sym of norm.affectedSymbols) {
            await this.repo.saveSymbolMapping({
              newsId: norm.newsId,
              symbol: sym,
              exchange: sym.includes("NIFTY") || sym.includes("GOLD") ? "MCX/NSE" : "NSE",
              sector: sym === "RELIANCE" ? "Energy & Retail" : sym === "TCS" ? "IT Services" : "Macro",
              company: sym,
              instrument: "EQ/FUT"
            });
          }
          totalSaved++;
        }
      } catch (err) {
        console.error(`[NewsService] Failed pulling feed from provider: ${prov.providerId}`, err);
        this.health.recordFailure();
      }
    }

    const elapsed = Date.now() - startMs;
    this.health.recordProcessed(totalSaved);
    this.health.recordFetch(new Date());
    this.health.recordProcessingSpeed(elapsed);
    console.log(`[NewsService] Sweep complete. Ingested & normalized ${totalSaved} updates in ${elapsed}ms.`);
  }

  /**
   * Part 9: High-performance multi-vector search routing
   */
  public async searchArticles(query: {
    keyword?: string;
    category?: string;
    companySymbol?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    tag?: string;
    priority?: string;
    limit?: number;
  }): Promise<NewsArticle[]> {
    return this.repo.queryArticles({
      keyword: query.keyword,
      category: query.category,
      companySymbol: query.companySymbol,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      tag: query.tag,
      priority: query.priority,
      limit: query.limit
    });
  }

  /**
   * Deterministic high-fidelity data seeder (Part 5 & Part 6)
   */
  public async seedMockDatabaseRecords(): Promise<void> {
    console.log("[NewsService] Injecting high-fidelity mock enterprise records into Postgres...");

    // 1. Corporate Actions Seeds (Part 5)
    const corporateActionsSeeds: CorporateAction[] = [
      {
        actionId: "act-div-reliance-2026",
        symbol: "RELIANCE",
        type: "DIVIDEND",
        value: 9.0,
        ratio: undefined,
        exDate: "2026-08-10T09:00:00Z",
        recordDate: "2026-08-12T09:00:00Z",
        paymentDate: "2026-09-01T09:00:00Z",
        announcementDate: "2026-07-21T09:00:00Z",
        currency: "INR",
        description: "Interim Dividend declaration of INR 9.0 per equity share for FY 2026-27.",
        status: "UPCOMING",
        extraData: { fiscalYear: "2026-2027", approvalAuthority: "Board of Directors" }
      },
      {
        actionId: "act-split-tcs-2026",
        symbol: "TCS",
        type: "SPLIT",
        value: undefined,
        ratio: "1:2",
        exDate: "2026-09-15T09:00:00Z",
        recordDate: "2026-09-17T09:00:00Z",
        paymentDate: "2026-10-05T09:00:00Z",
        announcementDate: "2026-07-25T09:00:00Z",
        currency: undefined,
        description: "Subdivision of equity shares from face value INR 10 to face value INR 5 (1:2 ratio).",
        status: "UPCOMING",
        extraData: { subDivisionApproved: true }
      },
      {
        actionId: "act-bonus-reliance-2025",
        symbol: "RELIANCE",
        type: "BONUS",
        value: undefined,
        ratio: "1:1",
        exDate: "2025-10-15T09:00:00Z",
        recordDate: "2025-10-16T09:00:00Z",
        paymentDate: "2025-11-01T09:00:00Z",
        announcementDate: "2025-09-10T09:00:00Z",
        currency: undefined,
        description: "Issuance of Bonus shares in 1:1 ratio to reward long-term equity stakeholders.",
        status: "COMPLETED",
        extraData: { issuedShares: 500000000 }
      }
    ];

    for (const act of corporateActionsSeeds) {
      await this.repo.saveCorporateAction(act);
    }

    // 2. Economic Calendar Seeds (Part 6)
    const economicCalendarSeeds: EconomicCalendarEvent[] = [
      {
        eventId: "event-in-gdp-2026-q1",
        country: "India",
        eventName: "GDP Growth Rate YoY Q1",
        actual: 7.2,
        forecast: 6.9,
        previous: 6.8,
        importance: "CRITICAL",
        timeframe: "Q1 2026",
        publishedAt: "2026-08-31T12:00:00Z",
        currency: "INR",
        category: "GDP"
      },
      {
        eventId: "event-us-cpi-2026-jul",
        country: "USA",
        eventName: "CPI Inflation MoM Jul",
        actual: undefined,
        forecast: 0.2,
        previous: 0.1,
        importance: "HIGH",
        timeframe: "Jul 2026",
        publishedAt: "2026-08-12T12:30:00Z",
        currency: "USD",
        category: "INFLATION"
      },
      {
        eventId: "event-in-cpi-2026-jun",
        country: "India",
        eventName: "CPI Headline Inflation YoY Jun",
        actual: 4.8,
        forecast: 4.6,
        previous: 4.3,
        importance: "HIGH",
        timeframe: "Jun 2026",
        publishedAt: "2026-07-12T12:00:00Z",
        currency: "INR",
        category: "INFLATION"
      }
    ];

    for (const ev of economicCalendarSeeds) {
      await this.repo.saveEconomicEvent(ev);
    }

    // 3. Pre-populate some historical news items
    const baseNews: RawNewsInput[] = [
      {
        headline: "NIFTY Crosses All-Time Landmark Resistance Point Amid Heavy Technology Buying",
        summary: "Indian equities reach new horizons powered by TCS and index heavies.",
        body: "Mumbai: The Nifty index surged beyond structural hurdles as international fund managers expanded exposure in energy and tech blocks. Strong domestic flows continue supporting the bull run.",
        category: "MARKET",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 48 * 3600 * 1000), // 2 days ago
        importance: "HIGH",
        tags: ["Nifty", "All-Time High", "Tech"],
        symbols: ["NIFTY_FUT", "TCS"]
      },
      {
        headline: "Global Gold Futures Dip Slightly as Fed Signals Steady Path Forward",
        summary: "Commodity trends stabilize in MCX and overseas markets.",
        body: "New York: Gold futures eased from intra-day resistance lines. US Treasury bond yields remained supported by the Fed comments on economic resilience and balanced labor indexes.",
        category: "COMMODITY",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 72 * 3600 * 1000), // 3 days ago
        importance: "MEDIUM",
        tags: ["Gold", "Federal Reserve", "Commodity"],
        symbols: ["GOLD_FUT"]
      }
    ];

    for (const raw of baseNews) {
      const art = this.normalizeRawArticle(raw);
      await this.repo.saveArticle(art);
    }

    // Fetch initial sweep instantly to populate system
    await this.fetchAndProcessAllProviders().catch(() => {});
  }
}

// Helper utilities to compute stable hashes and clean strings
function combinedTextHeuristic(h: string, s: string, b: string): string {
  return `${h} ${s} ${b}`.toUpperCase();
}

function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export const newsService = new NewsService();
