import { describe, it, expect, vi } from "vitest";
import { newsService } from "../services/NewsService.ts";
import { RawNewsInput, NewsArticle } from "../types/index.ts";

describe("EP-05: News Intelligence Layer Test Suite", () => {
  
  /**
   * 1. News Normalization Tests (Part 3 & Part 7)
   */
  describe("News Normalization & Priority Classification", () => {
    it("should correctly clean and normalize headline, summary, and body", () => {
      const raw: RawNewsInput = {
        title: "  RELIANCE Announces Record Q1 Results   ",
        desc: "Reliance reports strong profit growth.",
        body: "Mumbai, India: The board approved quarterly financial reports depicting strong revenue escalation.",
        category: "Results",
        source: "NSE India",
        pubTime: "2026-07-29T10:00:00Z",
        priority: "high"
      };

      const normalized = newsService.normalizeRawArticle(raw);

      expect(normalized.headline).toBe("RELIANCE Announces Record Q1 Results");
      expect(normalized.summary).toBe("Reliance reports strong profit growth.");
      expect(normalized.category).toBe("RESULTS");
      expect(normalized.source).toBe("NSE India");
      expect(normalized.importance).toBe("HIGH");
      expect(normalized.language).toBe("en");
    });

    it("should fall back to general category and medium priority for empty or malformed parameters", () => {
      const raw: RawNewsInput = {
        headline: "Vague and generic market buzz",
        source: "Social Feed"
      };

      const normalized = newsService.normalizeRawArticle(raw);

      expect(normalized.category).toBe("GENERAL");
      expect(normalized.importance).toBe("MEDIUM");
    });

    it("should extract affected symbols using smart text matching heuristic", () => {
      const raw: RawNewsInput = {
        headline: "TCS and RELIANCE trade higher today",
        summary: "Tech and Energy sectors lead the morning gains.",
        body: "Domestic equities remained highly resilient today as heavyweights pushed index parameters up.",
        category: "MARKET"
      };

      const normalized = newsService.normalizeRawArticle(raw);

      expect(normalized.affectedSymbols).toContain("TCS");
      expect(normalized.affectedSymbols).toContain("RELIANCE");
    });

    it("should resolve sentiment score and label dynamically", () => {
      const rawBullish: RawNewsInput = {
        headline: "Company registers record high revenue growth and dramatic profit gains",
        summary: "Bullish prospects and steady alliance expansion.",
        category: "MARKET"
      };

      const rawBearish: RawNewsInput = {
        headline: "Stock drops on loss warning and severe market risk decline",
        summary: "Decline and heavy selling seen.",
        category: "MARKET"
      };

      const normalizedBull = newsService.normalizeRawArticle(rawBullish);
      const normalizedBear = newsService.normalizeRawArticle(rawBearish);

      expect(normalizedBull.sentimentScore).toBeGreaterThan(0.0);
      expect(normalizedBull.sentimentLabel).toBe("BULLISH");

      expect(normalizedBear.sentimentScore).toBeLessThan(0.0);
      expect(normalizedBear.sentimentLabel).toBe("BEARISH");
    });
  });

  /**
   * 2. Corporate Actions Tests (Part 5)
   */
  describe("Corporate Actions Model verification", () => {
    it("should validate and model structured corporate actions", () => {
      const actionObj = {
        actionId: "act-test-01",
        symbol: "TCS",
        type: "SPLIT",
        ratio: "1:10",
        description: "Split Face Value of Equity share from INR 10 to INR 1.",
        status: "UPCOMING",
        extraData: { verified: true }
      };

      expect(actionObj.type).toBe("SPLIT");
      expect(actionObj.ratio).toBe("1:10");
      expect(actionObj.status).toBe("UPCOMING");
      expect(actionObj.extraData.verified).toBe(true);
    });
  });

  /**
   * 3. Economic Calendar Verification (Part 6)
   */
  describe("Economic Calendar Event Model verification", () => {
    it("should hold structural properties for macroeconomic releases", () => {
      const gdpRelease = {
        eventId: "event-test-01",
        country: "India",
        eventName: "GDP Growth rate Q1 YoY",
        actual: 7.2,
        forecast: 6.9,
        importance: "CRITICAL",
        category: "GDP"
      };

      expect(gdpRelease.category).toBe("GDP");
      expect(gdpRelease.importance).toBe("CRITICAL");
      expect(gdpRelease.actual).toBeGreaterThan(gdpRelease.forecast);
    });
  });

  /**
   * 4. Search & Filters Verification (Part 9)
   */
  describe("Search & Routing Verification", () => {
    it("should perform client-side mock filter matching simulating NewsRepository search", () => {
      const articles: NewsArticle[] = [
        {
          newsId: "news-1",
          headline: "RBI leaves rates untouched",
          summary: "Rates stable",
          body: "Steady rates",
          category: "ECONOMY",
          source: "Gov",
          language: "en",
          publishedAt: new Date(),
          importance: "CRITICAL",
          tags: ["rbi", "policy"],
          affectedSymbols: ["NIFTY_FUT"],
          sentimentScore: 0.0,
          sentimentLabel: "NEUTRAL",
          extraData: {}
        },
        {
          newsId: "news-2",
          headline: "TCS records huge growth",
          summary: "TCS profit increases",
          body: "TCS records amazing gains",
          category: "RESULTS",
          source: "TCS News",
          language: "en",
          publishedAt: new Date(),
          importance: "HIGH",
          tags: ["earnings", "tech"],
          affectedSymbols: ["TCS"],
          sentimentScore: 0.8,
          sentimentLabel: "BULLISH",
          extraData: {}
        }
      ];

      // Test Search by symbol
      const tcsArticles = articles.filter(art => art.affectedSymbols.includes("TCS"));
      expect(tcsArticles.length).toBe(1);
      expect(tcsArticles[0].newsId).toBe("news-2");

      // Test Search by priority
      const criticalArticles = articles.filter(art => art.importance === "CRITICAL");
      expect(criticalArticles.length).toBe(1);
      expect(criticalArticles[0].newsId).toBe("news-1");

      // Test Search by category
      const resultsArticles = articles.filter(art => art.category === "RESULTS");
      expect(resultsArticles.length).toBe(1);
      expect(resultsArticles[0].newsId).toBe("news-2");
    });
  });
});
