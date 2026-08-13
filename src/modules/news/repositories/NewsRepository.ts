import { eq, and, or, sql, like, gte, lte, desc } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import {
  newsArticlesTable,
  newsSourcesTable,
  newsCategoriesTable,
  newsTagsTable,
  newsSymbolMappingTable,
  corporateActionsTable,
  economicCalendarTable,
  economicEventsTable,
  newsHistoryTable,
  newsMetadataTable
} from "../../../db/schema.ts";
import {
  NewsArticle,
  NewsSource,
  NewsCategoryDef,
  NewsTag,
  NewsSymbolMapping,
  CorporateAction,
  EconomicCalendarEvent,
  EconomicEventDef,
  NewsHistoryEntry,
  NewsMetadata
} from "../types/index.ts";

export async function ensureNewsTables(): Promise<void> {
  const db = getDb();
  console.log("[EP-05] Initializing News Intelligence Engine tables (Self-Healing)...");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS news_articles (
        id SERIAL PRIMARY KEY,
        news_id VARCHAR(100) NOT NULL UNIQUE,
        headline VARCHAR(255) NOT NULL,
        summary TEXT NOT NULL,
        body TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        source VARCHAR(100) NOT NULL,
        language VARCHAR(10) DEFAULT 'en' NOT NULL,
        published_at TIMESTAMP NOT NULL,
        importance VARCHAR(30) DEFAULT 'MEDIUM' NOT NULL,
        tags JSONB DEFAULT '[]'::jsonb NOT NULL,
        affected_symbols JSONB DEFAULT '[]'::jsonb NOT NULL,
        sentiment_score DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
        sentiment_label VARCHAR(20) DEFAULT 'NEUTRAL' NOT NULL,
        extra_data JSONB DEFAULT '{}'::jsonb NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS news_sources (
        id SERIAL PRIMARY KEY,
        source_id VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        url VARCHAR(255),
        active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS news_categories (
        id SERIAL PRIMARY KEY,
        category_id VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT TRUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS news_tags (
        id SERIAL PRIMARY KEY,
        tag VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS news_symbol_mapping (
        id SERIAL PRIMARY KEY,
        news_id VARCHAR(100) NOT NULL,
        symbol VARCHAR(100) NOT NULL,
        exchange VARCHAR(50) NOT NULL,
        sector VARCHAR(100),
        industry VARCHAR(100),
        company VARCHAR(150),
        instrument VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS corporate_actions (
        id SERIAL PRIMARY KEY,
        action_id VARCHAR(100) NOT NULL UNIQUE,
        symbol VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        value DOUBLE PRECISION,
        ratio VARCHAR(50),
        ex_date TIMESTAMP,
        record_date TIMESTAMP,
        payment_date TIMESTAMP,
        announcement_date TIMESTAMP,
        currency VARCHAR(10),
        description TEXT NOT NULL,
        status VARCHAR(30) DEFAULT 'UPCOMING' NOT NULL,
        extra_data JSONB DEFAULT '{}'::jsonb NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS economic_calendar (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(100) NOT NULL UNIQUE,
        country VARCHAR(100) NOT NULL,
        event_name VARCHAR(200) NOT NULL,
        actual DOUBLE PRECISION,
        forecast DOUBLE PRECISION,
        previous DOUBLE PRECISION,
        importance VARCHAR(30) NOT NULL,
        timeframe VARCHAR(50),
        published_at TIMESTAMP NOT NULL,
        currency VARCHAR(10),
        category VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS economic_events (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(100) NOT NULL UNIQUE,
        event_name VARCHAR(200) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        frequency VARCHAR(30),
        country VARCHAR(100) NOT NULL,
        importance VARCHAR(30) NOT NULL,
        currency VARCHAR(10)
      );

      CREATE TABLE IF NOT EXISTS news_history (
        id SERIAL PRIMARY KEY,
        news_id VARCHAR(100) NOT NULL,
        action VARCHAR(50) NOT NULL,
        performed_by VARCHAR(100) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
        details JSONB DEFAULT '{}'::jsonb NOT NULL
      );

      CREATE TABLE IF NOT EXISTS news_metadata (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value JSONB DEFAULT '{}'::jsonb NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("[EP-05] News Intelligence Engine tables initialized successfully.");
  } catch (err) {
    console.error("[EP-05] Failed to initialize news tables dynamically, error:", err);
  }
}

export class NewsRepository {
  constructor() {
    ensureNewsTables().catch(err => {
      console.error("[NewsRepository] Async self-healing failed:", err);
    });
  }

  // ==========================================
  // NEWS ARTICLES
  // ==========================================
  async getLatestArticles(limitCount = 50): Promise<NewsArticle[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(newsArticlesTable)
      .orderBy(desc(newsArticlesTable.publishedAt))
      .limit(limitCount);

    return rows.map(r => ({
      ...r,
      publishedAt: new Date(r.publishedAt),
      createdAt: new Date(r.createdAt)
    })) as NewsArticle[];
  }

  async saveArticle(art: NewsArticle): Promise<void> {
    const db = getDb();
    const rows = await db
      .select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.newsId, art.newsId))
      .limit(1);

    const values = {
      ...art,
      publishedAt: new Date(art.publishedAt)
    };

    if (rows.length > 0) {
      await db
        .update(newsArticlesTable)
        .set(values as any)
        .where(eq(newsArticlesTable.newsId, art.newsId));
    } else {
      await db.insert(newsArticlesTable).values(values as any);
    }
  }

  async getArticleById(newsId: string): Promise<NewsArticle | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.newsId, newsId))
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      ...r,
      publishedAt: new Date(r.publishedAt),
      createdAt: new Date(r.createdAt)
    } as NewsArticle;
  }

  async queryArticles(params: {
    keyword?: string;
    category?: string;
    companySymbol?: string;
    startDate?: Date;
    endDate?: Date;
    tag?: string;
    priority?: string;
    limit?: number;
  }): Promise<NewsArticle[]> {
    const db = getDb();
    const conditions = [];

    if (params.category) {
      conditions.push(eq(newsArticlesTable.category, params.category));
    }

    if (params.priority) {
      conditions.push(eq(newsArticlesTable.importance, params.priority));
    }

    if (params.startDate) {
      conditions.push(gte(newsArticlesTable.publishedAt, params.startDate));
    }

    if (params.endDate) {
      conditions.push(lte(newsArticlesTable.publishedAt, params.endDate));
    }

    if (params.keyword) {
      const match = `%${params.keyword}%`;
      conditions.push(
        or(
          like(newsArticlesTable.headline, match),
          like(newsArticlesTable.summary, match),
          like(newsArticlesTable.body, match)
        )
      );
    }

    // Filters that we need to execute post-query or via complex jsonb/mapping table queries
    // Let's execute basic conditions first to be performant
    let query = db.select().from(newsArticlesTable);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    let rows = await query.orderBy(desc(newsArticlesTable.publishedAt)).limit(params.limit || 100);

    let articles = rows.map(r => ({
      ...r,
      publishedAt: new Date(r.publishedAt),
      createdAt: new Date(r.createdAt)
    })) as NewsArticle[];

    // Symbol filtering if companySymbol provided
    if (params.companySymbol) {
      const symbUpper = params.companySymbol.toUpperCase();
      articles = articles.filter(art => {
        const affected = Array.isArray(art.affectedSymbols) ? art.affectedSymbols : [];
        return affected.map(s => s.toUpperCase()).includes(symbUpper);
      });
    }

    // Tag filtering if tag provided
    if (params.tag) {
      const tagLower = params.tag.toLowerCase();
      articles = articles.filter(art => {
        const tags = Array.isArray(art.tags) ? art.tags : [];
        return tags.map(t => t.toLowerCase()).includes(tagLower);
      });
    }

    return articles;
  }

  // ==========================================
  // CORPORATE ACTIONS
  // ==========================================
  async getCorporateActions(symbol?: string, type?: string): Promise<CorporateAction[]> {
    const db = getDb();
    const conditions = [];
    if (symbol) {
      conditions.push(eq(corporateActionsTable.symbol, symbol.toUpperCase()));
    }
    if (type) {
      conditions.push(eq(corporateActionsTable.type, type.toUpperCase()));
    }

    let query = db.select().from(corporateActionsTable);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const rows = await query.orderBy(desc(corporateActionsTable.exDate));
    return rows.map(r => ({
      ...r,
      exDate: r.exDate ? new Date(r.exDate) : undefined,
      recordDate: r.recordDate ? new Date(r.recordDate) : undefined,
      paymentDate: r.paymentDate ? new Date(r.paymentDate) : undefined,
      announcementDate: r.announcementDate ? new Date(r.announcementDate) : undefined,
      createdAt: new Date(r.createdAt)
    })) as CorporateAction[];
  }

  async saveCorporateAction(action: CorporateAction): Promise<void> {
    const db = getDb();
    const rows = await db
      .select()
      .from(corporateActionsTable)
      .where(eq(corporateActionsTable.actionId, action.actionId))
      .limit(1);

    const values = {
      ...action,
      exDate: action.exDate ? new Date(action.exDate) : null,
      recordDate: action.recordDate ? new Date(action.recordDate) : null,
      paymentDate: action.paymentDate ? new Date(action.paymentDate) : null,
      announcementDate: action.announcementDate ? new Date(action.announcementDate) : null
    };

    if (rows.length > 0) {
      await db
        .update(corporateActionsTable)
        .set(values as any)
        .where(eq(corporateActionsTable.actionId, action.actionId));
    } else {
      await db.insert(corporateActionsTable).values(values as any);
    }
  }

  // ==========================================
  // ECONOMIC CALENDAR
  // ==========================================
  async getEconomicEvents(country?: string, category?: string): Promise<EconomicCalendarEvent[]> {
    const db = getDb();
    const conditions = [];
    if (country) {
      conditions.push(eq(economicCalendarTable.country, country.toUpperCase()));
    }
    if (category) {
      conditions.push(eq(economicCalendarTable.category, category.toUpperCase()));
    }

    let query = db.select().from(economicCalendarTable);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const rows = await query.orderBy(desc(economicCalendarTable.publishedAt));
    return rows.map(r => ({
      ...r,
      publishedAt: new Date(r.publishedAt),
      createdAt: new Date(r.createdAt)
    })) as EconomicCalendarEvent[];
  }

  async getUpcomingEconomicEvents(limitCount = 20): Promise<EconomicCalendarEvent[]> {
    const db = getDb();
    const now = new Date();
    const rows = await db
      .select()
      .from(economicCalendarTable)
      .where(gte(economicCalendarTable.publishedAt, now))
      .orderBy(economicCalendarTable.publishedAt)
      .limit(limitCount);

    return rows.map(r => ({
      ...r,
      publishedAt: new Date(r.publishedAt),
      createdAt: new Date(r.createdAt)
    })) as EconomicCalendarEvent[];
  }

  async saveEconomicEvent(ev: EconomicCalendarEvent): Promise<void> {
    const db = getDb();
    const rows = await db
      .select()
      .from(economicCalendarTable)
      .where(eq(economicCalendarTable.eventId, ev.eventId))
      .limit(1);

    const values = {
      ...ev,
      publishedAt: new Date(ev.publishedAt)
    };

    if (rows.length > 0) {
      await db
        .update(economicCalendarTable)
        .set(values as any)
        .where(eq(economicCalendarTable.eventId, ev.eventId));
    } else {
      await db.insert(economicCalendarTable).values(values as any);
    }
  }

  // ==========================================
  // SYMBOL MAPPING
  // ==========================================
  async getSymbolMappings(newsId: string): Promise<NewsSymbolMapping[]> {
    const db = getDb();
    return (await db
      .select()
      .from(newsSymbolMappingTable)
      .where(eq(newsSymbolMappingTable.newsId, newsId))) as NewsSymbolMapping[];
  }

  async saveSymbolMapping(mapping: NewsSymbolMapping): Promise<void> {
    const db = getDb();
    await db.insert(newsSymbolMappingTable).values(mapping as any);
  }

  // ==========================================
  // NEWS SOURCES
  // ==========================================
  async getNewsSources(): Promise<NewsSource[]> {
    const db = getDb();
    return (await db.select().from(newsSourcesTable)) as NewsSource[];
  }

  async saveNewsSource(src: NewsSource): Promise<void> {
    const db = getDb();
    const rows = await db
      .select()
      .from(newsSourcesTable)
      .where(eq(newsSourcesTable.sourceId, src.sourceId))
      .limit(1);

    if (rows.length > 0) {
      await db
        .update(newsSourcesTable)
        .set(src as any)
        .where(eq(newsSourcesTable.sourceId, src.sourceId));
    } else {
      await db.insert(newsSourcesTable).values(src as any);
    }
  }

  // ==========================================
  // NEWS CATEGORIES
  // ==========================================
  async getCategories(): Promise<NewsCategoryDef[]> {
    const db = getDb();
    return (await db.select().from(newsCategoriesTable)) as NewsCategoryDef[];
  }

  async saveCategory(cat: NewsCategoryDef): Promise<void> {
    const db = getDb();
    const rows = await db
      .select()
      .from(newsCategoriesTable)
      .where(eq(newsCategoriesTable.categoryId, cat.categoryId))
      .limit(1);

    if (rows.length > 0) {
      await db
        .update(newsCategoriesTable)
        .set(cat as any)
        .where(eq(newsCategoriesTable.categoryId, cat.categoryId));
    } else {
      await db.insert(newsCategoriesTable).values(cat as any);
    }
  }

  // ==========================================
  // COUNTS / HEALTH
  // ==========================================
  async getCounts(): Promise<{
    articlesCount: number;
    sourcesCount: number;
    categoriesCount: number;
    actionsCount: number;
    economicEventsCount: number;
  }> {
    const db = getDb();
    try {
      const art = await db.select({ count: sql<number>`count(*)` }).from(newsArticlesTable);
      const src = await db.select({ count: sql<number>`count(*)` }).from(newsSourcesTable);
      const cat = await db.select({ count: sql<number>`count(*)` }).from(newsCategoriesTable);
      const act = await db.select({ count: sql<number>`count(*)` }).from(corporateActionsTable);
      const eco = await db.select({ count: sql<number>`count(*)` }).from(economicCalendarTable);

      return {
        articlesCount: Number(art[0]?.count || 0),
        sourcesCount: Number(src[0]?.count || 0),
        categoriesCount: Number(cat[0]?.count || 0),
        actionsCount: Number(act[0]?.count || 0),
        economicEventsCount: Number(eco[0]?.count || 0)
      };
    } catch {
      return {
        articlesCount: 0,
        sourcesCount: 0,
        categoriesCount: 0,
        actionsCount: 0,
        economicEventsCount: 0
      };
    }
  }
}

export const newsRepo = new NewsRepository();
