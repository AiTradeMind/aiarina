import { getDb } from "../../../db/client.ts";
import { researchSourceRegistry } from "../../../db/schema.ts";
import { eq } from "drizzle-orm";
import { RESEARCH_SOURCE_TYPES } from "../constants/index.ts";
import { ResearchSourceRecord } from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class ResearchSourceRegistry {
  private static memoryRegistry: Map<string, ResearchSourceRecord> = new Map();

  static {
    // Populate default system sources
    const defaultSources: Omit<ResearchSourceRecord, "createdAt">[] = [
      {
        sourceId: "SRC-NSE-001",
        sourceName: "National Stock Exchange of India (NSE)",
        sourceType: RESEARCH_SOURCE_TYPES.NSE,
        priority: 1,
        reliabilityScore: 99.5,
        trustLevel: "VERY_HIGH",
        status: "ACTIVE",
        metadata: { exchange: "NSE", country: "IN", realTime: true },
      },
      {
        sourceId: "SRC-BSE-001",
        sourceName: "Bombay Stock Exchange (BSE)",
        sourceType: RESEARCH_SOURCE_TYPES.BSE,
        priority: 1,
        reliabilityScore: 99.0,
        trustLevel: "VERY_HIGH",
        status: "ACTIVE",
        metadata: { exchange: "BSE", country: "IN", realTime: true },
      },
      {
        sourceId: "SRC-COMMODITY-001",
        sourceName: "Commodity Market Feeds (Broker Supported)",
        sourceType: RESEARCH_SOURCE_TYPES.COMMODITY,
        priority: 1,
        reliabilityScore: 98.5,
        trustLevel: "VERY_HIGH",
        status: "ACTIVE",
        metadata: { assetClass: "COMMODITY", market: "COMMODITIES" },
      },
      {
        sourceId: "SRC-TV-001",
        sourceName: "TradingView Technical Charting Feed",
        sourceType: RESEARCH_SOURCE_TYPES.TRADINGVIEW,
        priority: 2,
        reliabilityScore: 92.0,
        trustLevel: "HIGH",
        status: "ACTIVE",
        metadata: { provider: "TradingView", indicators: ["RSI", "MACD", "EMA"] },
      },
      {
        sourceId: "SRC-NEWS-001",
        sourceName: "Institutional Financial News Wire",
        sourceType: RESEARCH_SOURCE_TYPES.NEWS,
        priority: 2,
        reliabilityScore: 88.0,
        trustLevel: "HIGH",
        status: "ACTIVE",
        metadata: { category: "Financial News", sentimentEnabled: true },
      },
      {
        sourceId: "SRC-ECON-001",
        sourceName: "Global Economic Calendar",
        sourceType: RESEARCH_SOURCE_TYPES.ECONOMIC_CALENDAR,
        priority: 1,
        reliabilityScore: 95.0,
        trustLevel: "VERY_HIGH",
        status: "ACTIVE",
        metadata: { events: ["CPI", "GDP", "Interest Rate Decisions"] },
      },
      {
        sourceId: "SRC-FILING-001",
        sourceName: "Corporate Filing Repository",
        sourceType: RESEARCH_SOURCE_TYPES.CORPORATE_FILING,
        priority: 1,
        reliabilityScore: 99.0,
        trustLevel: "VERY_HIGH",
        status: "ACTIVE",
        metadata: { docTypes: ["Annual Report", "Quarterly Financials", "Shareholding"] },
      },
      {
        sourceId: "SRC-MANUAL-001",
        sourceName: "Manual Analyst Entry",
        sourceType: RESEARCH_SOURCE_TYPES.MANUAL,
        priority: 3,
        reliabilityScore: 80.0,
        trustLevel: "MEDIUM",
        status: "ACTIVE",
        metadata: { source: "Internal Analyst" },
      },
      {
        sourceId: "SRC-CSV-001",
        sourceName: "CSV Dataset Import",
        sourceType: RESEARCH_SOURCE_TYPES.CSV,
        priority: 3,
        reliabilityScore: 85.0,
        trustLevel: "MEDIUM",
        status: "ACTIVE",
        metadata: { format: "CSV" },
      },
      {
        sourceId: "SRC-PDF-001",
        sourceName: "PDF Research Report Extractor",
        sourceType: RESEARCH_SOURCE_TYPES.PDF,
        priority: 2,
        reliabilityScore: 87.0,
        trustLevel: "HIGH",
        status: "ACTIVE",
        metadata: { parser: "PDFTextOCR" },
      },
      {
        sourceId: "SRC-REST-001",
        sourceName: "REST API Endpoint Ingestion",
        sourceType: RESEARCH_SOURCE_TYPES.REST_API,
        priority: 2,
        reliabilityScore: 90.0,
        trustLevel: "HIGH",
        status: "ACTIVE",
        metadata: { protocol: "HTTP/REST" },
      },
      {
        sourceId: "SRC-AI-001",
        sourceName: "AI Generated Insights Engine",
        sourceType: RESEARCH_SOURCE_TYPES.AI_GENERATED,
        priority: 2,
        reliabilityScore: 85.0,
        trustLevel: "MEDIUM",
        status: "ACTIVE",
        metadata: { model: "Gemini Pro / Flash" },
      },
      {
        sourceId: "SRC-CUSTOM-001",
        sourceName: "Custom Data Source Hook",
        sourceType: RESEARCH_SOURCE_TYPES.CUSTOM,
        priority: 3,
        reliabilityScore: 75.0,
        trustLevel: "MEDIUM",
        status: "ACTIVE",
        metadata: { extensible: true },
      },
    ];

    defaultSources.forEach((src) => {
      ResearchSourceRegistry.memoryRegistry.set(src.sourceId, {
        ...src,
        createdAt: new Date(),
      });
    });
  }

  public async registerSource(
    source: Omit<ResearchSourceRecord, "sourceId" | "createdAt"> & { sourceId?: string }
  ): Promise<ResearchSourceRecord> {
    const sourceId = source.sourceId || `SRC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record: ResearchSourceRecord = {
      sourceId,
      sourceName: source.sourceName,
      sourceType: source.sourceType,
      priority: source.priority ?? 2,
      reliabilityScore: source.reliabilityScore ?? 80,
      trustLevel: source.trustLevel ?? "HIGH",
      status: source.status ?? "ACTIVE",
      metadata: source.metadata ?? {},
      createdAt: new Date(),
    };

    ResearchSourceRegistry.memoryRegistry.set(sourceId, record);

    try {
      const db = getDb();
      await db.insert(researchSourceRegistry).values({
        sourceId: record.sourceId,
        sourceName: record.sourceName,
        sourceType: record.sourceType,
        priority: record.priority,
        reliabilityScore: String(record.reliabilityScore),
        trustLevel: record.trustLevel,
        status: record.status,
        metadata: record.metadata,
      });
    } catch (err: any) {
      logger.warn({ type: "SOURCE_REGISTRY_WARN", error: err.message }, "Failed DB insert for research source, using memory registry");
    }

    return record;
  }

  public async getSourceById(sourceId: string): Promise<ResearchSourceRecord | null> {
    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(researchSourceRegistry)
        .where(eq(researchSourceRegistry.sourceId, sourceId))
        .limit(1);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          sourceId: r.sourceId,
          sourceName: r.sourceName,
          sourceType: r.sourceType,
          priority: r.priority,
          reliabilityScore: Number(r.reliabilityScore),
          trustLevel: r.trustLevel,
          status: r.status,
          metadata: (r.metadata as Record<string, any>) || {},
          createdAt: r.createdAt,
        };
      }
    } catch (err: any) {
      logger.warn({ type: "SOURCE_REGISTRY_WARN", error: err.message }, "Memory fallback for getSourceById");
    }
    return ResearchSourceRegistry.memoryRegistry.get(sourceId) || null;
  }

  public async getAllSources(): Promise<ResearchSourceRecord[]> {
    try {
      const db = getDb();
      const rows = await db.select().from(researchSourceRegistry);
      if (rows.length > 0) {
        return rows.map((r) => ({
          sourceId: r.sourceId,
          sourceName: r.sourceName,
          sourceType: r.sourceType,
          priority: r.priority,
          reliabilityScore: Number(r.reliabilityScore),
          trustLevel: r.trustLevel,
          status: r.status,
          metadata: (r.metadata as Record<string, any>) || {},
          createdAt: r.createdAt,
        }));
      }
    } catch (err: any) {
      logger.warn({ type: "SOURCE_REGISTRY_WARN", error: err.message }, "Memory fallback for getAllSources");
    }
    return Array.from(ResearchSourceRegistry.memoryRegistry.values());
  }
}
