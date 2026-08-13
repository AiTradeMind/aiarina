import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConsensusEngineService } from "../services/consensus-engine.service.ts";
import { AIConsensusRepository } from "../repositories/consensus.repository.ts";
import { EnterpriseAIGatewayService } from "../services/EnterpriseAIGatewayService.ts";

vi.mock("../../../db/client.ts", () => {
  const mockExecute = vi.fn().mockResolvedValue({ rows: [] });
  const mockInsert = vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: 42, topic: "BTC Trend", finalDecision: "BUY", confidence: 0.9, summary: "Consensus BUY", createdAt: new Date() }])
    })
  });
  const mockSelect = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      orderBy: vi.fn().mockResolvedValue([{ id: 42, topic: "BTC Trend", finalDecision: "BUY", confidence: 0.9, summary: "Consensus BUY", createdAt: new Date() }]),
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([{ id: 42, topic: "BTC Trend", finalDecision: "BUY", confidence: 0.9, summary: "Consensus BUY", createdAt: new Date() }]),
        orderBy: vi.fn().mockResolvedValue([{ id: 1, roundNumber: 1, roundType: "OPENING", sessionId: 42 }])
      })
    })
  });
  const mockUpdate = vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(true)
    })
  });

  return {
    getDb: () => ({
      execute: mockExecute,
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
    }),
    isDatabaseConnected: () => true
  };
});

describe("AI Consensus & Debate Engine Enterprise Suite", () => {
  let service: ConsensusEngineService;
  let repo: AIConsensusRepository;
  let mockGateway: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ConsensusEngineService();
    repo = new AIConsensusRepository();
    mockGateway = EnterpriseAIGatewayService.getInstance();
  });

  it("should parse decisions and confidence values with absolute accuracy from model text outputs", () => {
    // Test decision parsing
    expect((service as any).parseDecision("The model recommends a BUY option.")).toBe("BUY");
    expect((service as any).parseDecision("We must SELL the assets.")).toBe("SELL");
    expect((service as any).parseDecision("Uncertain market conditions suggest HOLD.")).toBe("HOLD");

    // Test confidence parsing (percentages and decimals)
    expect((service as any).parseConfidence("We are 92% confident.")).toBe(0.92);
    expect((service as any).parseConfidence("Confidence level is 0.85.")).toBe(0.85);
    expect((service as any).parseConfidence("Default fallback scenario.")).toBe(0.82);
  });

  it("should extract and classify evidence categories from statements", () => {
    const text = `
    Analysis points:
    - RSI indicates oversold at 25 (Indicators)
    - Price resistance is strong at $105.4 (Market Data)
    - CPI rates next Thursday (Economic Calendar)
    - Q2 Earnings beat expectations by 12% (Corporate Actions)
    `;

    const evidenceList = (service as any).parseAndExtractEvidence(text, 1, "gemini-1.5-flash");
    
    const types = evidenceList.map((e: any) => e.evidenceType);
    expect(types).toContain("INDICATORS");
    expect(types).toContain("MARKET_DATA");
    expect(types).toContain("ECONOMIC_CALENDAR");
    expect(types).toContain("CORPORATE_ACTIONS");
  });

  it("should calculate Consensus Quality Grade composite metric", () => {
    const roundsMock: any[] = [
      {
        roundNumber: 1,
        agreementPercent: 0.90,
        statements: [
          { modelName: "M1", decision: "BUY", confidence: 0.95, text: "Buy!", evidence: [1, 2], success: true },
          { modelName: "M2", decision: "BUY", confidence: 0.90, text: "Buy!", evidence: [1], success: true }
        ]
      }
    ];

    const quality = (service as any).calculateConsensusQuality(roundsMock, "BUY");
    expect(quality.agreementPercent).toBe(0.90);
    expect(quality.overallGrade).toBeDefined();
    expect(["A", "B", "C", "D", "F"]).toContain(quality.overallGrade);
  });

  it("should execute Multi-Round Consensus Debate and track model convergence", async () => {
    // Mock the Gateway response
    vi.spyOn(mockGateway, "dispatchRequest").mockResolvedValue({
      text: "I recommend a strong BUY decision with 95% confidence based on RSI index at 24.",
      modelUsed: "gemini-1.5-flash",
      providerUsed: "Google",
      latencyMs: 150,
      tokensUsed: { prompt: 50, completion: 50, total: 100 },
      estimatedCostUsd: 0.0001,
      securityVerdict: "PASSED",
      auditHash: "0xmockaudit"
    });

    const request = {
      topic: "BTC Spot Trend Analysis",
      intent: "DECISION" as const,
      prompt: "Assess visual charts and MACD histograms.",
      models: [
        { modelName: "gemini-1.5-flash", providerName: "Google" },
        { modelName: "gemini-1.5-pro", providerName: "Google" }
      ],
      maxRounds: 2,
      organizationId: "test-org-consensus",
      userId: 1
    };

    const debateResult = await service.runConsensusDebate(request);

    expect(debateResult.sessionId).toBe(42);
    expect(debateResult.finalDecision).toBe("BUY");
    expect(debateResult.confidence).toBe(0.95);
    expect(debateResult.rounds.length).toBeLessThanOrEqual(2);
    expect(debateResult.quality.overallGrade).toBeDefined();
    expect(debateResult.auditTrailHash).toBeDefined();
  });
});
