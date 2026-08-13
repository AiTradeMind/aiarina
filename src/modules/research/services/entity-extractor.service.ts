import { ENTITY_TYPES } from "../constants/index.ts";
import { ExtractedEntity } from "../types/index.ts";

export class EntityExtractorService {
  private static entityMemoryStore: Map<string, ExtractedEntity[]> = new Map();

  public extractEntities(researchId: string, title: string, content: string): ExtractedEntity[] {
    const text = `${title} ${content}`;
    const entities: ExtractedEntity[] = [];

    // Ticker Symbol / Stock pattern (e.g., RELIANCE, TCS, INFOTEC, AAPL)
    const stockMatches = text.match(/\b[A-Z]{3,10}\b/g) || [];
    const stockKeywords = new Set(["NIFTY", "BANKNIFTY", "SENSEX", "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "TATAMOTORS"]);
    stockMatches.forEach((match: string) => {
      if (stockKeywords.has(match)) {
        entities.push({
          entityId: `ENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          researchId,
          entityType: match.includes("NIFTY") || match === "SENSEX" ? ENTITY_TYPES.INDEX : ENTITY_TYPES.STOCK,
          name: match,
          symbol: match,
        });
      }
    });

    // Exchange pattern
    if (text.includes("NSE")) {
      entities.push({
        entityId: `ENT-${Date.now()}-NSE`,
        researchId,
        entityType: ENTITY_TYPES.EXCHANGE,
        name: "National Stock Exchange of India",
        symbol: "NSE",
      });
    }
    if (text.includes("BSE")) {
      entities.push({
        entityId: `ENT-${Date.now()}-BSE`,
        researchId,
        entityType: ENTITY_TYPES.EXCHANGE,
        name: "Bombay Stock Exchange",
        symbol: "BSE",
      });
    }

    // Commodity pattern
    const lower = text.toLowerCase();
    if (lower.includes("crude oil") || lower.includes("brent") || lower.includes("wti")) {
      entities.push({
        entityId: `ENT-${Date.now()}-OIL`,
        researchId,
        entityType: ENTITY_TYPES.COMMODITY,
        name: "Crude Oil",
        symbol: "OIL",
      });
    }
    if (lower.includes("gold") || lower.includes("bullion")) {
      entities.push({
        entityId: `ENT-${Date.now()}-GOLD`,
        researchId,
        entityType: ENTITY_TYPES.COMMODITY,
        name: "Gold",
        symbol: "XAU",
      });
    }

    // Currency pattern
    if (lower.includes("usd/inr") || lower.includes("rupee") || lower.includes("dollar")) {
      entities.push({
        entityId: `ENT-${Date.now()}-INR`,
        researchId,
        entityType: ENTITY_TYPES.CURRENCY,
        name: "Indian Rupee",
        symbol: "USD/INR",
      });
    }

    // Sector & Industry pattern
    if (lower.includes("banking") || lower.includes("financials") || lower.includes("fintech")) {
      entities.push({
        entityId: `ENT-${Date.now()}-BANKING`,
        researchId,
        entityType: ENTITY_TYPES.SECTOR,
        name: "Banking & Financial Services",
      });
    }
    if (lower.includes("information technology") || lower.includes("tech") || lower.includes("software")) {
      entities.push({
        entityId: `ENT-${Date.now()}-IT`,
        researchId,
        entityType: ENTITY_TYPES.SECTOR,
        name: "Technology",
      });
    }

    // Event pattern
    if (lower.includes("earnings") || lower.includes("q3 result") || lower.includes("q4 result") || lower.includes("dividend") || lower.includes("split")) {
      entities.push({
        entityId: `ENT-${Date.now()}-EARNINGS`,
        researchId,
        entityType: ENTITY_TYPES.EVENT,
        name: "Corporate Event / Earnings Announcement",
      });
    }

    // Country pattern
    if (lower.includes("india") || lower.includes("indian market")) {
      entities.push({
        entityId: `ENT-${Date.now()}-IND`,
        researchId,
        entityType: ENTITY_TYPES.COUNTRY,
        name: "India",
        symbol: "IN",
      });
    }

    // Deduplicate entities by name + entityType
    const uniqueMap = new Map<string, ExtractedEntity>();
    entities.forEach((ent) => {
      uniqueMap.set(`${ent.entityType}:${ent.name}`, ent);
    });

    const uniqueEntities = Array.from(uniqueMap.values());
    EntityExtractorService.entityMemoryStore.set(researchId, uniqueEntities);
    return uniqueEntities;
  }

  public getEntitiesByResearchId(researchId: string): ExtractedEntity[] {
    return EntityExtractorService.entityMemoryStore.get(researchId) || [];
  }
}
