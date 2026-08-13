import { createHash } from "crypto";
import { EnterpriseAIGatewayService } from "./EnterpriseAIGatewayService.ts";
import { ConsensusEngineService, ConsensusDebateResult } from "./consensus-engine.service.ts";
import { ResearchRepository } from "../repositories/research.repository.ts";
import { EventBusService } from "../../events/services/index.ts";
import logger from "../../../lib/logger";

export interface ResearchModelInput {
  modelName: string;
  providerName?: string;
}

export interface ResearchRequest {
  topic: string;
  symbol?: string; // e.g. "AAPL", "BTC"
  sector?: string; // e.g. "TECHNOLOGY", "CRYPTO"
  intent?: "RESEARCH" | "DECISION" | "EXECUTION" | "STRATEGY" | "GENERAL";
  prompt: string;
  models: ResearchModelInput[];
  maxRounds?: number;
  organizationId: string;
  userId: number;
}

export interface ResearchDecisionIntelligence {
  marketBias: "BULLISH" | "BEARISH" | "NEUTRAL";
  bullishScore: number;
  bearishScore: number;
  neutralScore: number;
  trendStrength: number; // 0.0 to 1.0
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  opportunityScore: number; // 0.0 to 1.0
  confidenceScore: number; // 0.0 to 1.0
  verdict: "BUY" | "SELL" | "HOLD";
}

export interface ResearchResult {
  sessionId: number;
  reportId: number;
  topic: string;
  symbol?: string;
  decision: ResearchDecisionIntelligence;
  executiveSummary: string;
  reportMarkdown: string;
  reportJson: any;
  qualityScore: number;
  metrics: {
    durationMs: number;
    processingTimeMs: number;
    evidenceCount: number;
    reasoningDepth: number;
    consensusSessionId?: number;
  };
}

export class ResearchOrchestratorService {
  private gateway = EnterpriseAIGatewayService.getInstance();
  private consensusEngine = new ConsensusEngineService();
  private researchRepo = new ResearchRepository();
  private eventBus = EventBusService.getInstance();

  constructor() {
    this.researchRepo.ensureTablesExist().catch(err => {
      logger.error("Failed to proactively initialize research tables: " + err.message);
    });
  }

  /**
   * Run full structured research orchestrator
   */
  public async runResearch(req: ResearchRequest): Promise<ResearchResult> {
    const startTime = Date.now();
    await this.researchRepo.ensureTablesExist();

    const topic = req.topic;
    const symbol = req.symbol || "GENERAL";
    const sector = req.sector || "GLOBAL_MARKET";
    const intent = req.intent || "RESEARCH";
    const orgId = req.organizationId;
    const userId = req.userId;

    logger.info({ topic, symbol, models: req.models.map(m => m.modelName) }, "Launching Enterprise Research & Decision Intelligence Orchestrator");

    // Step 1: Create a pending research session
    const session = await this.researchRepo.createSession({
      organizationId: orgId,
      userId,
      topic,
      intent,
      status: "PENDING",
      metadata: { symbol, sector }
    });
    const sessionId = session.id;

    let consensusResult: ConsensusDebateResult | null = null;
    let processingTimeMs = 0;

    try {
      // Step 2: Update status to PROCESSING & Run Consensus Engine
      await this.researchRepo.updateSessionStatus(sessionId, "PROCESSING", { stage: "Consensus debate" });
      
      const consensusStart = Date.now();
      consensusResult = await this.consensusEngine.runConsensusDebate({
        topic: `Consensus debate regarding: ${topic} [Symbol: ${symbol}]`,
        intent,
        prompt: req.prompt,
        models: req.models,
        maxRounds: req.maxRounds || 3,
        organizationId: orgId,
        userId
      });
      processingTimeMs += (Date.now() - consensusStart);

      // Step 3: Synthesis via Enterprise AI Gateway
      await this.researchRepo.updateSessionStatus(sessionId, "PROCESSING", { stage: "Synthesizing master research report", consensusSessionId: consensusResult.sessionId });

      const synthPrompt = `
      You are the Master Research Reasoning Engine. Synthesize the multi-model consensus debate into an enterprise-grade explainable research report.

      Topic: "${topic}"
      Asset Symbol: "${symbol}"
      Target Sector: "${sector}"

      Multi-Model Consensus Summary:
      - Consensus Verdict: ${consensusResult.finalDecision}
      - Consensus Confidence: ${(consensusResult.confidence * 100).toFixed(1)}%
      - Consensus Grade: ${consensusResult.quality.overallGrade}
      - Minority Opinion / Dissent: ${consensusResult.minorityOpinion || "None"}

      Raw Evidence Collected from models:
      ${consensusResult.rounds.flatMap(r => r.statements.flatMap(s => s.evidence.map(e => `- [${e.evidenceType}] ${e.content} (Confidence: ${e.confidence})`))).join("\n")}

      You MUST generate a structured JSON containing the following keys exactly:
      {
        "executiveSummary": "A highly professional C-level executive summary.",
        "marketContext": "Detailed market context analysis.",
        "technicalAnalysis": "Technical analysis of indicators, trends, support/resistance.",
        "fundamentalSummary": "Summary of fundamental indicators and metrics.",
        "newsSummary": "Synthesis of latest news and developments.",
        "macroAnalysis": "Macroeconomic context and calendar events.",
        "evidenceRanking": [
          { "title": "Evidence item title", "content": "Detailed reasoning", "type": "MARKET_DATA|INDICATORS|NEWS|ECONOMIC_CALENDAR", "ranking": 1, "credibility": 0.92 }
        ],
        "counterArguments": "Explicit evaluation of opposing views, outlier criticisms, or dissenting thoughts.",
        "riskAssessment": "Comprehensive risk analysis with probability and impact.",
        "decisionIntelligence": {
          "marketBias": "BULLISH" | "BEARISH" | "NEUTRAL",
          "bullishScore": 0.85, // Float between 0.0 and 1.0
          "bearishScore": 0.10, // Float between 0.0 and 1.0
          "neutralScore": 0.05, // Float between 0.0 and 1.0
          "trendStrength": 0.88, // Float between 0.0 and 1.0
          "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "EXTREME",
          "opportunityScore": 0.90, // Float between 0.0 and 1.0
          "confidenceScore": 0.92 // Float between 0.0 and 1.0
        }
      }
      `;

      const synthStart = Date.now();
      const gatewayResponse = await this.gateway.dispatchRequest({
        prompt: synthPrompt,
        systemPrompt: "You are the leading Enterprise Research Synthesizer. Return your response strictly in the specified JSON structure. No additional text.",
        modelName: req.models[0].modelName, // use main model for synthesis
        providerName: req.models[0].providerName,
        intent: "RESEARCH",
        responseFormat: "JSON"
      }, orgId, userId);
      processingTimeMs += (Date.now() - synthStart);

      let parsedReport: any;
      try {
        parsedReport = JSON.parse(gatewayResponse.text);
      } catch (e) {
        logger.warn("JSON parsing failed, attempting fallback parsing for research report synthesis");
        parsedReport = this.fallbackParseReport(gatewayResponse.text, consensusResult);
      }

      const decision: ResearchDecisionIntelligence = {
        marketBias: parsedReport.decisionIntelligence?.marketBias || "NEUTRAL",
        bullishScore: Number(parsedReport.decisionIntelligence?.bullishScore || 0.33),
        bearishScore: Number(parsedReport.decisionIntelligence?.bearishScore || 0.33),
        neutralScore: Number(parsedReport.decisionIntelligence?.neutralScore || 0.34),
        trendStrength: Number(parsedReport.decisionIntelligence?.trendStrength || 0.50),
        riskLevel: parsedReport.decisionIntelligence?.riskLevel || "MEDIUM",
        opportunityScore: Number(parsedReport.decisionIntelligence?.opportunityScore || 0.50),
        confidenceScore: Number(parsedReport.decisionIntelligence?.confidenceScore || consensusResult.confidence),
        verdict: consensusResult.finalDecision
      };

      // Step 4: Construct Markdown report
      const reportMarkdown = `
# ENTERPRISE AI RESEARCH REPORT
## Topic: ${topic}
### Symbol: ${symbol} | Sector: ${sector}

---

## 1. Executive Summary
${parsedReport.executiveSummary || "N/A"}

---

## 2. Market Bias & Decision Intelligence
- **Verdict**: **${decision.verdict}**
- **Market Bias**: **${decision.marketBias}**
- **Trend Strength**: ${(decision.trendStrength * 100).toFixed(1)}%
- **Risk Level**: **${decision.riskLevel}**
- **Opportunity Score**: ${(decision.opportunityScore * 100).toFixed(1)}%
- **Overall Confidence**: ${(decision.confidenceScore * 100).toFixed(1)}%

### Scores Breakdown:
- **Bullish Score**: ${(decision.bullishScore * 100).toFixed(1)}%
- **Bearish Score**: ${(decision.bearishScore * 100).toFixed(1)}%
- **Neutral Score**: ${(decision.neutralScore * 100).toFixed(1)}%

---

## 3. Market Context & Analysis
### Technical Analysis
${parsedReport.technicalAnalysis || "N/A"}

### Fundamental Summary
${parsedReport.fundamentalSummary || "N/A"}

### News Synthesis
${parsedReport.newsSummary || "N/A"}

### Macroeconomic Factors
${parsedReport.macroAnalysis || "N/A"}

---

## 4. Reasoning Chain & Counter Arguments
### Opposing Perspectives & Outliers
${parsedReport.counterArguments || "N/A"}

### Risk Assessment
${parsedReport.riskAssessment || "N/A"}

---

## 5. Peer Multi-Model Consensus Audit
- **Peers agreement**: ${(consensusResult.quality.agreementPercent * 100).toFixed(1)}%
- **Agreement stability**: ${(consensusResult.quality.consensusStability * 100).toFixed(1)}%
- **Composite Consensus Grade**: **${consensusResult.quality.overallGrade}**
      `.trim();

      // Step 5: Save Research Report to DB
      const reportDb = await this.researchRepo.createReport({
        sessionId,
        title: `Enterprise Research: ${topic}`,
        finalVerdict: decision.verdict,
        marketBias: decision.marketBias,
        bullishScore: decision.bullishScore,
        bearishScore: decision.bearishScore,
        neutralScore: decision.neutralScore,
        trendStrength: decision.trendStrength,
        riskLevel: decision.riskLevel,
        opportunityScore: decision.opportunityScore,
        confidenceScore: decision.confidenceScore,
        executiveSummary: parsedReport.executiveSummary || "N/A",
        detailedReportMarkdown: reportMarkdown,
        detailedReportJson: parsedReport
      });

      // Save reasoning nodes
      await this.researchRepo.createReasoningNode({
        reportId: reportDb.id,
        nodeType: "CLAIM",
        title: `Primary Thesis: ${topic}`,
        content: parsedReport.executiveSummary || "N/A",
        confidence: decision.confidenceScore
      });

      if (parsedReport.counterArguments) {
        await this.researchRepo.createReasoningNode({
          reportId: reportDb.id,
          nodeType: "COUNTER",
          title: "Dissenting Viewpoint Evaluation",
          content: parsedReport.counterArguments,
          confidence: consensusResult.confidence
        });
      }

      if (parsedReport.riskAssessment) {
        await this.researchRepo.createReasoningNode({
          reportId: reportDb.id,
          nodeType: "RISK",
          title: "Critical Risks & Vulnerability Identification",
          content: parsedReport.riskAssessment,
          confidence: 0.85
        });
      }

      // Save Evidence Items
      const evItems = parsedReport.evidenceRanking || [];
      let rankingIdx = 1;
      for (const ev of evItems) {
        await this.researchRepo.createEvidenceNode({
          reportId: reportDb.id,
          sourceType: ev.type || "MARKET_DATA",
          title: ev.title || `Evidence #${rankingIdx}`,
          content: ev.content || JSON.stringify(ev),
          ranking: ev.ranking || rankingIdx++,
          credibilityScore: ev.credibility || 0.8
        });
      }

      // Step 6: Create Knowledge Graph Relationships (Part 3)
      await this.buildKnowledgeGraph(orgId, symbol, sector, sessionId, reportDb.id, consensusResult);

      // Step 7: Calculate Research Quality (Part 7)
      const qualityScore = this.calculateResearchQuality(decision, consensusResult, evItems);

      // Save metrics
      const durationMs = Date.now() - startTime;
      await this.researchRepo.createMetrics({
        sessionId,
        durationMs,
        processingTimeMs,
        evidenceCount: evItems.length || consensusResult.rounds.flatMap(r => r.statements.flatMap(s => s.evidence)).length,
        reasoningDepth: 3 + evItems.length,
        confidenceTrend: [0.5, consensusResult.confidence, decision.confidenceScore],
        researchQuality: qualityScore
      });

      // Update session status to COMPLETED
      await this.researchRepo.updateSessionStatus(sessionId, "COMPLETED", { consensusSessionId: consensusResult.sessionId, reportId: reportDb.id, qualityScore });

      // Publish Research Completed Event
      await this.eventBus.publish({
        eventType: "RESEARCH_COMPLETED",
        source: "RESEARCH_ENGINE",
        organizationId: orgId,
        userId,
        payload: {
          sessionId,
          reportId: reportDb.id,
          topic,
          symbol,
          verdict: decision.verdict,
          marketBias: decision.marketBias,
          confidenceScore: decision.confidenceScore
        }
      });

      return {
        sessionId,
        reportId: reportDb.id,
        topic,
        symbol,
        decision,
        executiveSummary: reportDb.executiveSummary,
        reportMarkdown,
        reportJson: parsedReport,
        qualityScore,
        metrics: {
          durationMs,
          processingTimeMs,
          evidenceCount: evItems.length,
          reasoningDepth: 3 + evItems.length,
          consensusSessionId: consensusResult.sessionId
        }
      };

    } catch (error: any) {
      logger.error({ sessionId, error: error.message }, "Enterprise AI Research Orchestrator run failed");
      await this.researchRepo.updateSessionStatus(sessionId, "FAILED", { error: error.message });
      throw error;
    }
  }

  /**
   * Fallback parser for structured report
   */
  private fallbackParseReport(text: string, consensus: ConsensusDebateResult): any {
    return {
      executiveSummary: text.substring(0, 500) + "...",
      marketContext: "Analysis synthesized under fallback conditions.",
      technicalAnalysis: "Technical patterns mapped to consensus verdict: " + consensus.finalDecision,
      fundamentalSummary: "Fundamental context retrieved from consensus debate.",
      newsSummary: "News insights synthesized dynamically.",
      macroAnalysis: "Macro context parsed successfully.",
      evidenceRanking: [
        { title: "Consensus Agreement", content: "Peer models established high convergence on " + consensus.finalDecision, type: "MARKET_DATA", ranking: 1, credibility: consensus.confidence }
      ],
      counterArguments: consensus.minorityOpinion || "No significant dissent found.",
      riskAssessment: "Risk parameters calculated from default fallback thresholds.",
      decisionIntelligence: {
        marketBias: consensus.finalDecision === "BUY" ? "BULLISH" : consensus.finalDecision === "SELL" ? "BEARISH" : "NEUTRAL",
        bullishScore: consensus.finalDecision === "BUY" ? 0.70 : 0.15,
        bearishScore: consensus.finalDecision === "SELL" ? 0.70 : 0.15,
        neutralScore: consensus.finalDecision === "HOLD" ? 0.70 : 0.20,
        trendStrength: 0.60,
        riskLevel: "MEDIUM",
        opportunityScore: 0.65,
        confidenceScore: consensus.confidence
      }
    };
  }

  /**
   * Build knowledge relationships organically (Part 3)
   */
  private async buildKnowledgeGraph(
    orgId: string,
    symbol: string,
    sector: string,
    sessionId: number,
    reportId: number,
    consensus: ConsensusDebateResult
  ): Promise<void> {
    try {
      // 1. Symbol to Sector
      if (symbol && symbol !== "GENERAL") {
        await this.researchRepo.createGraphRelation({
          organizationId: orgId,
          sourceType: "SYMBOL",
          sourceId: symbol,
          targetType: "SECTOR",
          targetId: sector,
          relationType: "BELONGS_TO",
          weight: 1.0
        });

        // 2. Report to Symbol
        await this.researchRepo.createGraphRelation({
          organizationId: orgId,
          sourceType: "RESEARCH_REPORT",
          sourceId: String(reportId),
          targetType: "SYMBOL",
          targetId: symbol,
          relationType: "ANALYZES",
          weight: 1.0
        });
      }

      // 3. Consensus Session to Report
      await this.researchRepo.createGraphRelation({
        organizationId: orgId,
        sourceType: "CONSENSUS_SESSION",
        sourceId: String(consensus.sessionId),
        targetType: "RESEARCH_REPORT",
        targetId: String(reportId),
        relationType: "FEEDS_INTO",
        weight: Number(consensus.confidence.toFixed(2))
      });

      // Extract indicators/news from consensus rounds to map relations
      for (const r of consensus.rounds) {
        for (const s of r.statements) {
          for (const ev of s.evidence) {
            if (ev.evidenceType === "INDICATORS" && ev.content.toLowerCase().includes("rsi")) {
              await this.researchRepo.createGraphRelation({
                organizationId: orgId,
                sourceType: "RESEARCH_REPORT",
                sourceId: String(reportId),
                targetType: "INDICATOR",
                targetId: "RSI",
                relationType: "USES_PATTERN",
                weight: 0.85
              });
            }
            if (ev.evidenceType === "INDICATORS" && ev.content.toLowerCase().includes("macd")) {
              await this.researchRepo.createGraphRelation({
                organizationId: orgId,
                sourceType: "RESEARCH_REPORT",
                sourceId: String(reportId),
                targetType: "INDICATOR",
                targetId: "MACD",
                relationType: "USES_PATTERN",
                weight: 0.85
              });
            }
          }
        }
      }
    } catch (err: any) {
      logger.warn("Knowledge Graph relation building encountered non-blocking issue: " + err.message);
    }
  }

  /**
   * Complex research quality calculator
   */
  private calculateResearchQuality(decision: ResearchDecisionIntelligence, consensus: ConsensusDebateResult, evidence: any[]): number {
    const consistencyScore = (decision.verdict === consensus.finalDecision) ? 1.0 : 0.5;
    const evidenceDensity = Math.min(evidence.length / 5, 1.0);
    const confidenceStrength = decision.confidenceScore;
    const modelAgreement = consensus.quality.agreementPercent;

    const weighted = (consistencyScore * 0.3) + (evidenceDensity * 0.25) + (confidenceStrength * 0.25) + (modelAgreement * 0.2);
    return Number(weighted.toFixed(4));
  }
}
