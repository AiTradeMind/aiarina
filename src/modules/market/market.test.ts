import { describe, it, expect, beforeEach } from "vitest";
import { MarketService } from "./services/index.ts";
import { TrueDataAdapter } from "./adapters/TrueDataAdapter.ts";
import { GlobalDatafeedsAdapter } from "./adapters/GlobalDatafeedsAdapter.ts";
import { AngelOneAdapter } from "./adapters/AngelOneAdapter.ts";

describe("Enterprise Market Module & Completion Engine", () => {
  let marketService: MarketService;

  beforeEach(() => {
    marketService = new MarketService();
  });

  it("should return NOT_CONFIGURED for AngelOneAdapter when env credentials missing", async () => {
    const adapter = new AngelOneAdapter();
    const health = await adapter.healthCheck();
    expect(health.isHealthy).toBe(false);
    expect(health.status).toBe("NOT_CONFIGURED");

    const candles = await adapter.getHistoricalCandles("RELIANCE", "1D", new Date(), new Date());
    expect(candles).toEqual([]);

    await expect(adapter.getQuote("RELIANCE")).rejects.toThrow("MARKET_DATA_NOT_CONFIGURED");
  });

  it("should select AngelOneAdapter when MARKET_DATA_PROVIDER=angelone", async () => {
    process.env.MARKET_DATA_PROVIDER = "angelone";
    const res = await marketService.getMarketCandles("RELIANCE.NS", "1D");
    expect(res.status).toBe("NOT_CONFIGURED");
    expect(res.provider).toContain("Angel One");
    expect(res.candles).toEqual([]);
    expect(res.missingConfig.requiredEnvVars).toContain("ANGELONE_API_KEY");
  });

  it("should return NOT_CONFIGURED for TrueDataAdapter when env credentials missing", async () => {
    const adapter = new TrueDataAdapter();
    const health = await adapter.healthCheck();
    expect(health.isHealthy).toBe(false);
    expect(health.status).toBe("NOT_CONFIGURED");

    const candles = await adapter.getHistoricalCandles("RELIANCE", "1D", new Date(), new Date());
    expect(candles).toEqual([]);

    await expect(adapter.getQuote("RELIANCE")).rejects.toThrow("MARKET_DATA_NOT_CONFIGURED");
  });

  it("should return NOT_CONFIGURED for GlobalDatafeedsAdapter when env credentials missing", async () => {
    const adapter = new GlobalDatafeedsAdapter();
    const health = await adapter.healthCheck();
    expect(health.isHealthy).toBe(false);
    expect(health.status).toBe("NOT_CONFIGURED");

    const candles = await adapter.getHistoricalCandles("RELIANCE", "1D", new Date(), new Date());
    expect(candles).toEqual([]);

    await expect(adapter.getQuote("RELIANCE")).rejects.toThrow("MARKET_DATA_NOT_CONFIGURED");
  });

  it("should select TrueDataAdapter when MARKET_DATA_PROVIDER=truedata", async () => {
    process.env.MARKET_DATA_PROVIDER = "truedata";
    const res = await marketService.getMarketCandles("RELIANCE.NS", "1D");
    expect(res.status).toBe("NOT_CONFIGURED");
    expect(res.provider).toContain("TrueData");
    expect(res.candles).toEqual([]);
    expect(res.missingConfig.requiredEnvVars).toContain("TRUEDATA_API_KEY");
  });

  it("should select GlobalDatafeedsAdapter when MARKET_DATA_PROVIDER=globaldatafeeds", async () => {
    process.env.MARKET_DATA_PROVIDER = "globaldatafeeds";
    const res = await marketService.getMarketCandles("RELIANCE.NS", "1D");
    expect(res.status).toBe("NOT_CONFIGURED");
    expect(res.provider).toContain("Global Datafeeds");
    expect(res.candles).toEqual([]);
    expect(res.missingConfig.requiredEnvVars).toContain("GLOBALDATAFEEDS_API_KEY");
  });

  it("should retrieve exchange registries successfully", async () => {
    const exchanges = await marketService.getExchangeRegistries();
    expect(Array.isArray(exchanges)).toBe(true);
  });

  it("should retrieve market connectivities and feed status", async () => {
    const connectivities = await marketService.getMarketConnectivities();
    expect(Array.isArray(connectivities)).toBe(true);
  });

  it("should validate and synchronize market master data", async () => {
    const payload = {
      registry: [
        { id: "reg-nse", exchangeId: "NSE", exchangeCode: "NSE", exchangeName: "National Stock Exchange", timezone: "Asia/Kolkata", country: "India", currency: "INR", status: "ACTIVE" as const, version: "1.0.0", createdAt: new Date(), updatedAt: new Date() }
      ],
      instruments: [
        { id: "inst-tst", instrumentId: "TEST_STOCK", instrumentType: "EQUITY" as const, status: "ACTIVE" as const, exchangeId: "NSE", createdAt: new Date(), updatedAt: new Date() }
      ],
      symbols: [
        { id: "sym-tst", instrumentId: "TEST_STOCK", tradingSymbol: "TEST", displaySymbol: "Test Stock", exchangeSymbol: "TEST", brokerSymbol: "TEST_BRK", internalSymbol: "ARINA:TEST", createdAt: new Date(), updatedAt: new Date() }
      ],
      lotSizes: [
        { id: "lot-tst", instrumentId: "TEST_STOCK", lotSize: 1, freezeQuantity: 100, maximumQuantity: 1000, minimumQuantity: 1, createdAt: new Date(), updatedAt: new Date() }
      ],
      tickSizes: [
        { id: "tick-tst", instrumentId: "TEST_STOCK", tickSize: "0.05", pricePrecision: 2, quantityPrecision: 0, createdAt: new Date(), updatedAt: new Date() }
      ],
      expirities: [
        { id: "exp-tst", expiryDate: new Date().toISOString(), expiryType: "MONTHLY" as const, isWeekly: false, isMonthly: true, isQuarterly: false, isCommodity: false, createdAt: new Date(), updatedAt: new Date() }
      ],
      sectors: [
        { id: "sec-tst", instrumentId: "TEST_STOCK", sector: "Technology", industry: "Software", subIndustry: "Enterprise", marketCapCategory: "LARGE" as const, createdAt: new Date(), updatedAt: new Date() }
      ],
      isins: [
        { id: "isin-tst", isin: "INE999A01018", securityName: "Test Stock Ltd", exchangeMapping: "NSE", listingStatus: "LISTED" as const, createdAt: new Date(), updatedAt: new Date() }
      ],
      derivatives: []
    };

    const result = await marketService.synchronizeMarketMasterData(payload);
    expect(result.success).toBe(true);
    expect(result.rejectedCount).toBe(0);
    expect(result.checksum).toBeDefined();
  });

  it("should calculate feed quality metrics correctly", async () => {
    const metrics = await marketService.getFeedQualityMetrics();
    expect(Array.isArray(metrics)).toBe(true);
    expect(metrics.length).toBeGreaterThan(0);
    expect(metrics[0].qualityScore).toBeDefined();
  });

  it("should handle instrument state lifecycle transition", async () => {
    const instruments = await marketService.getInstrumentMasters();
    const activeInst = instruments.find(i => i.status === 'ACTIVE');
    if (activeInst) {
      const targetId = activeInst.instrumentId;
      await expect(
        marketService.transitionInstrumentState(targetId, "SUSPENDED", "Regulatory audit check", "TEST_OPERATOR")
      ).resolves.not.toThrow();

      // Transition SUSPENDED -> ACTIVE
      await marketService.transitionInstrumentState(targetId, "ACTIVE", "Audit passed", "TEST_OPERATOR");
    }
  });

  it("should support master data proposal submission and audit chain", async () => {
    const mockProposalPayload = {
      registry: [
        { id: "reg-nse", exchangeId: "NSE", exchangeCode: "NSE", exchangeName: "National Stock Exchange", timezone: "Asia/Kolkata", country: "India", currency: "INR", status: "ACTIVE" as const, version: "1.0.0", createdAt: new Date(), updatedAt: new Date() }
      ],
      instruments: [{ id: "prop-inst", instrumentId: "PROP_STOCK", instrumentType: "EQUITY" as const, status: "ACTIVE" as const, exchangeId: "NSE", createdAt: new Date(), updatedAt: new Date() }],
      symbols: [],
      lotSizes: [],
      tickSizes: [],
      expirities: [],
      sectors: [],
      isins: [],
      derivatives: []
    };

    const proposal = await marketService.submitProposal(mockProposalPayload, "UNIT_TEST_OPERATOR");
    expect(proposal.id).toBeDefined();
    expect(proposal.status).toBe("DRAFT");

    const validationRes = await marketService.validateProposal(proposal.id);
    expect(validationRes.success).toBe(true);

    await marketService.approveProposal(proposal.id, "TEST_OFFICER");

    const auditChain = await marketService.getAuditChain();
    expect(Array.isArray(auditChain)).toBe(true);
    expect(auditChain.length).toBeGreaterThan(0);
  });

  it("should trigger self-healing recovery protocol", async () => {
    const healingRes = await marketService.triggerSelfHealing("FEED_FAILURE", "AUTOMATION_AGENT");
    expect(healingRes.success).toBe(true);
    expect(healingRes.jobId).toBeDefined();
    expect(healingRes.certificateId).toBeDefined();
  });
});
