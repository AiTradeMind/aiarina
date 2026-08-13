import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResearchOrchestratorService } from "../services/research-orchestrator.service.ts";
import { ResearchRepository } from "../repositories/research.repository.ts";
import { EnterpriseAIGatewayService } from "../services/EnterpriseAIGatewayService.ts";
import { ConsensusEngineService } from "../services/consensus-engine.service.ts";

vi.mock("../../../db/client.ts", () => {
  const mockExecute = vi.fn().mockResolvedValue({ rows: [] });
  const mockInsert = vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: 84, title: "Enterprise Research: AAPL Outlook", sessionId: 100, finalVerdict: "BUY", marketBias: "BULLISH", createdAt: new Date() }])
    })
  });
  const mockSelect = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      orderBy: vi.fn().mockResolvedValue([{ id: 100, topic: "AAPL Outlook", status: "COMPLETED", createdAt: new Date() }]),
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([{ id: 100, topic: "AAPL Outlook", status: "COMPLETED", createdAt: new Date() }]),
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

describe("AI Research & Decision Intelligence Enterprise Suite", () => {
  let orchestrator: ResearchOrchestratorService;
  let repo: ResearchRepository;
  let mockGateway: any;

  beforeEach(() => {
    vi.clearAllMocks();
    orchestrator = new ResearchOrchestratorService();
    repo = new ResearchRepository();
    mockGateway = EnterpriseAIGatewayService.getInstance();
  });

  it("should calculate composite Research Quality Score", () => {
    const mockDecision: any = {
      verdict: "BUY",
      confidenceScore: 0.95
    };
    const mockConsensus: any = {
      finalDecision: "BUY",
      confidence: 0.92,
      quality: {
        agreementPercent: 0.90
      }
    };
    const mockEvidence = [
      { type: "INDICATORS", ranking: 1, credibility: 0.95 },
      { type: "MARKET_DATA", ranking: 2, credibility: 0.92 }
    ];

    const quality = (orchestrator as any).calculateResearchQuality(mockDecision, mockConsensus, mockEvidence);
    expect(quality).toBeGreaterThan(0.5);
    expect(quality).toBeLessThanOrEqual(1.0);
  });

  it("should successfully formulate Fallback reports on JSON parsing errors", () => {
    const mockConsensus: any = {
      sessionId: 42,
      finalDecision: "BUY",
      confidence: 0.90,
      minorityOpinion: "None",
      quality: {
        agreementPercent: 0.95,
        consensusStability: 0.92,
        overallGrade: "A"
      }
    };

    const fallbackReport = (orchestrator as any).fallbackParseReport("Raw text report output", mockConsensus);
    expect(fallbackReport.executiveSummary).toBeDefined();
    expect(fallbackReport.decisionIntelligence.marketBias).toBe("BULLISH");
    expect(fallbackReport.decisionIntelligence.confidenceScore).toBe(0.90);
  });

  it("should run full end-to-end Research & Decision synthesis using multi-model consensus", async () => {
    // Spy on consensus engine debate run
    const consensusSpy = vi.spyOn((orchestrator as any).consensusEngine, "runConsensusDebate").mockResolvedValue({
      sessionId: 42,
      finalDecision: "BUY",
      confidence: 0.94,
      summary: "Consensus BUY recommendation.",
      rounds: [
        {
          roundNumber: 1,
          roundType: "OPENING",
          roundMetadata: {},
          statements: [
            {
              modelName: "gemini-3.6-flash",
              decision: "BUY",
              confidence: 0.95,
              text: "Looks bullish.",
              evidence: [
                { modelName: "gemini-3.6-flash", evidenceType: "INDICATORS", content: "RSI is oversold", confidence: 0.95 }
              ],
              success: true
            }
          ]
        }
      ],
      quality: {
        agreementPercent: 1.0,
        evidenceQuality: 0.95,
        reasoningQuality: 0.95,
        confidenceQuality: 0.94,
        reliabilityWeight: 1.0,
        consensusStability: 1.0,
        overallGrade: "A"
      },
      auditTrailHash: "0xhash"
    });

    // Mock Gateway response for synthesizer
    vi.spyOn(mockGateway, "dispatchRequest").mockResolvedValue({
      text: JSON.stringify({
        executiveSummary: "Highly professional summary regarding AAPL.",
        marketContext: "Context details",
        technicalAnalysis: "Technical details",
        fundamentalSummary: "Fundamental summary",
        newsSummary: "News details",
        macroAnalysis: "Macro details",
        evidenceRanking: [
          { title: "RSI Momentum", content: "RSI oversold", type: "INDICATORS", ranking: 1, credibility: 0.95 }
        ],
        counterArguments: "Minor dissent considerations.",
        riskAssessment: "Risk analysis matrix",
        decisionIntelligence: {
          marketBias: "BULLISH",
          bullishScore: 0.85,
          bearishScore: 0.10,
          neutralScore: 0.05,
          trendStrength: 0.90,
          riskLevel: "LOW",
          opportunityScore: 0.92,
          confidenceScore: 0.94
        }
      }),
      modelUsed: "gemini-3.1-pro-preview",
      providerUsed: "Google",
      latencyMs: 400,
      tokensUsed: { prompt: 100, completion: 200, total: 300 },
      estimatedCostUsd: 0.001,
      securityVerdict: "PASSED",
      auditHash: "0xmockaudit"
    });

    const request = {
      topic: "AAPL Outlook H2 2026",
      symbol: "AAPL",
      sector: "TECHNOLOGY",
      intent: "RESEARCH" as const,
      prompt: "Synthesize growth trajectory and AI features.",
      models: [
        { modelName: "gemini-3.6-flash", providerName: "Google" }
      ],
      maxRounds: 2,
      organizationId: "test-org-research",
      userId: 1
    };

    const result = await orchestrator.runResearch(request);

    expect(result.sessionId).toBeDefined();
    expect(result.reportId).toBeDefined();
    expect(result.topic).toBe("AAPL Outlook H2 2026");
    expect(result.symbol).toBe("AAPL");
    expect(result.decision.verdict).toBe("BUY");
    expect(result.decision.marketBias).toBe("BULLISH");
    expect(result.qualityScore).toBeGreaterThan(0.5);
    expect(result.metrics.evidenceCount).toBe(1);
    expect(result.reportMarkdown).toContain("ENTERPRISE AI RESEARCH REPORT");
  });
});
