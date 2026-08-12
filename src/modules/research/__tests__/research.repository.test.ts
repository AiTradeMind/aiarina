import { describe, it, expect, beforeEach } from "vitest";
import { ResearchItemRepository } from "../repositories/research-item.repository.ts";
import { RESEARCH_CATEGORIES, RESEARCH_STATUSES } from "../constants/index.ts";

describe("ResearchItemRepository", () => {
  let repo: ResearchItemRepository;

  beforeEach(() => {
    repo = new ResearchItemRepository();
  });

  it("should create a new research item with auto-generated researchId", async () => {
    const item = await repo.createResearchItem({
      title: "Federal Reserve Interest Rate Analysis",
      content: "The Fed announced a 25bps interest rate cut amidst declining CPI inflation.",
      category: RESEARCH_CATEGORIES.ECONOMIC,
      status: RESEARCH_STATUSES.READY,
      source: "Federal Reserve Board",
      tags: ["macro", "fed", "rates"],
    });

    expect(item).toBeDefined();
    expect(item.researchId).toMatch(/^RES-/);
    expect(item.title).toBe("Federal Reserve Interest Rate Analysis");
    expect(item.category).toBe(RESEARCH_CATEGORIES.ECONOMIC);
    expect(item.status).toBe(RESEARCH_STATUSES.READY);
    expect(item.tags).toContain("fed");
  });

  it("should retrieve a created research item by ID and researchId", async () => {
    const created = await repo.createResearchItem({
      title: "Options Volatility Skew",
      content: "Implied volatility skew on SPX index options shows put bias.",
      category: RESEARCH_CATEGORIES.OPTIONS,
      tags: ["volatility", "options"],
    });

    const byStringId = await repo.getResearchItemById(created.researchId);
    expect(byStringId).toBeDefined();
    expect(byStringId?.title).toBe("Options Volatility Skew");
  });

  it("should filter research items by category, status, tag, and keyword", async () => {
    await repo.createResearchItem({
      title: "Reliance Q3 Earnings Report",
      content: "Strong revenue growth driven by retail and digital services valuation.",
      category: RESEARCH_CATEGORIES.FUNDAMENTAL,
      status: RESEARCH_STATUSES.READY,
      tags: ["earnings", "reliance"],
    });

    await repo.createResearchItem({
      title: "Nifty 50 Technical Breakdown",
      content: "RSI indicator entering overbought zone above 22,000 level.",
      category: RESEARCH_CATEGORIES.TECHNICAL,
      status: RESEARCH_STATUSES.READY,
      tags: ["technical", "nifty"],
    });

    const categoryResult = await repo.getResearchItems({ category: RESEARCH_CATEGORIES.FUNDAMENTAL });
    expect(categoryResult.items.length).toBeGreaterThanOrEqual(1);
    expect(categoryResult.items[0].category).toBe(RESEARCH_CATEGORIES.FUNDAMENTAL);

    const keywordResult = await repo.getResearchItems({ keyword: "Nifty" });
    expect(keywordResult.items.length).toBeGreaterThanOrEqual(1);
    expect(keywordResult.items[0].title).toContain("Nifty");

    const tagResult = await repo.getResearchItems({ tag: "earnings" });
    expect(tagResult.items.length).toBeGreaterThanOrEqual(1);
  });

  it("should update a research item", async () => {
    const created = await repo.createResearchItem({
      title: "Draft Crude Oil Note",
      content: "Crude oil futures trading near $80/barrel.",
      category: RESEARCH_CATEGORIES.COMMODITY,
      status: RESEARCH_STATUSES.DRAFT,
    });

    const updated = await repo.updateResearchItem(created.researchId, {
      title: "Updated Crude Oil Market Outlook",
      status: RESEARCH_STATUSES.READY,
    });

    expect(updated.title).toBe("Updated Crude Oil Market Outlook");
    expect(updated.status).toBe(RESEARCH_STATUSES.READY);
  });

  it("should delete a research item", async () => {
    const created = await repo.createResearchItem({
      title: "Temporary Market Event",
      content: "Short lived news spike.",
      category: RESEARCH_CATEGORIES.NEWS,
    });

    const deleted = await repo.deleteResearchItem(created.researchId);
    expect(deleted).toBe(true);

    const check = await repo.getResearchItemById(created.researchId);
    expect(check).toBeNull();
  });

  it("should provide Research Center summary metrics", async () => {
    await repo.createResearchItem({
      title: "Summary Test Item",
      content: "Summary test content.",
      category: RESEARCH_CATEGORIES.MARKET,
      status: RESEARCH_STATUSES.READY,
    });

    const summary = await repo.getResearchCenterSummary();
    expect(summary).toBeDefined();
    expect(summary.totalItems).toBeGreaterThan(0);
    expect(summary.categories.length).toBeGreaterThan(0);
    expect(summary.statuses).toContain("READY");
  });
});
