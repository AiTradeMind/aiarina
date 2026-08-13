import { describe, it, expect, beforeEach } from "vitest";
import { ResearchCenterService } from "../services/research-center.service.ts";
import { RESEARCH_CATEGORIES, RESEARCH_STATUSES } from "../constants/index.ts";

describe("ResearchCenterService", () => {
  let service: ResearchCenterService;

  beforeEach(() => {
    service = new ResearchCenterService();
  });

  it("should create, auto-classify, and tag research items", async () => {
    const item = await service.createResearch({
      title: "Bank Nifty Call Option Analysis",
      content: "Implied volatility for strike 48000 call options increased ahead of central bank policy decision.",
      category: RESEARCH_CATEGORIES.OPTIONS,
    });

    expect(item).toBeDefined();
    expect(item.category).toBe(RESEARCH_CATEGORIES.OPTIONS);
    expect(item.tags).toContain("options");
    expect(item.metadata.aiLabels).toContain("derivative_instrument");
  });

  it("should validate and list supported research categories", async () => {
    const categories = await service.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    const categoryNames = categories.map((c) => c.name);
    expect(categoryNames).toContain("Market");
    expect(categoryNames).toContain("Technical");
    expect(categoryNames).toContain("Fundamental");
    expect(categoryNames).toContain("Economic");
    expect(categoryNames).toContain("Corporate Actions");
  });

  it("should list supported research statuses", () => {
    const statuses = service.getStatuses();
    expect(statuses).toEqual(["DRAFT", "COLLECTING", "PROCESSING", "READY", "ARCHIVED", "FAILED"]);
  });

  it("should reject creation with missing required fields", async () => {
    await expect(
      service.createResearch({
        title: "",
        content: "",
        category: RESEARCH_CATEGORIES.MARKET,
      })
    ).rejects.toThrow();
  });

  it("should update research and re-classify content dynamically", async () => {
    const created = await service.createResearch({
      title: "Initial Market Note",
      content: "Basic market observations.",
      category: RESEARCH_CATEGORIES.MARKET,
    });

    const updated = await service.updateResearch(created.researchId, {
      title: "RSI Momentum Analysis for Tech Stocks",
      content: "Detailed candlestick chart patterns and RSI indicator analysis.",
      category: RESEARCH_CATEGORIES.TECHNICAL,
    });

    expect(updated.title).toBe("RSI Momentum Analysis for Tech Stocks");
    expect(updated.category).toBe(RESEARCH_CATEGORIES.TECHNICAL);
    expect(updated.tags).toContain("technical_analysis");
  });

  it("should delete research item successfully", async () => {
    const created = await service.createResearch({
      title: "To be deleted",
      content: "Content for deletion test.",
      category: RESEARCH_CATEGORIES.NEWS,
    });

    const deleted = await service.deleteResearch(created.researchId);
    expect(deleted).toBe(true);

    await expect(service.getResearchById(created.researchId)).rejects.toThrow("not found");
  });
});
