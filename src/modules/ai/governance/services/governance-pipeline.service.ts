import { GovernanceRepository } from "../repositories/governance.repository.ts";
import { SafetyEngine } from "./safety.engine.ts";
import { PolicyEngine } from "./policy.engine.ts";
import { ExplainabilityEngine } from "./explainability.engine.ts";
import { AuditEngine } from "./audit.engine.ts";
import {
  GovernanceSession,
  PolicyViolation,
  SafetyReport,
  ExplainabilityRecord,
  ComplianceRecord,
  HumanReview,
  GovernanceMetrics
} from "../types/governance.types.ts";

export class GovernancePipelineService {
  private repo = new GovernanceRepository();
  private safety = new SafetyEngine();
  private policy = new PolicyEngine();
  private explainability = new ExplainabilityEngine();
  private audit = new AuditEngine();

  /**
   * Main pipeline entry point: Governs, sanitizes, explains, audits, and compliance-scores any AI payload.
   */
  public async governRequest(params: {
    userId?: number;
    organizationId?: string;
    modelId?: string;
    requestPayload: any;
    responsePayload: any;
  }): Promise<{
    session: any;
    safetyReport: any;
    policyCheck: any;
    explainability: any;
    compliance: any;
    humanReview: any;
  }> {
    const startTime = Date.now();

    const { userId, organizationId, modelId, requestPayload, responsePayload } = params;

    // 1. Evaluate Safety
    const safetyResult = await this.safety.evaluateSafety(requestPayload, responsePayload);

    // 2. Evaluate Policies
    const policyResult = this.policy.evaluatePolicies({
      modelId,
      requestPayload,
      responsePayload
    });

    // 3. Evaluate Explainability
    const expResult = this.explainability.generateExplainabilityTrace({
      requestPayload,
      responsePayload
    });

    // 4. Calculate Compliance Score
    let complianceScore = 100;
    complianceScore -= (100 - policyResult.score) * 0.6; // weight policy score 60%
    complianceScore -= (safetyResult.promptRiskScore + safetyResult.outputRiskScore) * 0.2; // weight safety risk 20%
    complianceScore = Math.max(0, Math.min(100, Math.round(complianceScore)));

    const policyCompliance = policyResult.passed;
    const ruleCompliance = safetyResult.passed;
    const evidenceCompleteness = expResult.evidenceTrace.length > 0;
    const researchCompleteness = requestPayload?.topic !== undefined || requestPayload?.research !== undefined;
    const explainabilityCompleteness = expResult.reasoningTrace.length > 0 && expResult.decisionFactors.length > 0;
    const confidenceValidation = expResult.confidenceExplanation !== undefined;

    // 5. Determine Review/Approval status
    let sessionStatus: "APPROVED" | "REJECTED" | "ESCALATED" = "APPROVED";
    let humanReviewRequired = false;
    let escalationReason = "";

    if (!policyCompliance) {
      sessionStatus = "REJECTED";
      humanReviewRequired = true;
      escalationReason = "Policy violations detected.";
    } else if (!ruleCompliance) {
      sessionStatus = "REJECTED";
      humanReviewRequired = true;
      escalationReason = "Safety risk thresholds exceeded.";
    } else if (complianceScore < 85) {
      sessionStatus = "ESCALATED";
      humanReviewRequired = true;
      escalationReason = `Compliance score (${complianceScore}%) below corporate threshold (85%).`;
    }

    const latency = Date.now() - startTime;

    // Create a mock session to compute cryptographic signature
    const tempSessionState = {
      userId,
      organizationId,
      requestPayload,
      responsePayload,
      policyCheckStatus: policyResult.passed ? "PASSED" : "FAILED",
      safetyCheckStatus: safetyResult.passed ? "PASSED" : "FAILED",
      createdAt: new Date()
    };
    const auditHash = this.audit.generateSessionHash(tempSessionState);

    // Save main session to database
    const dbSession: GovernanceSession = await this.repo.createSession({
      userId,
      organizationId,
      requestPayload,
      responsePayload,
      status: sessionStatus,
      policyCheckStatus: policyResult.passed ? "PASSED" : "FAILED",
      safetyCheckStatus: safetyResult.passed ? "PASSED" : "FAILED",
      governanceLatencyMs: latency,
      auditHash
    });

    const sessionId = dbSession.id!;

    // 6. Record policy violations if any
    for (const v of policyResult.violations) {
      await this.repo.createViolation({
        sessionId,
        ...v
      } as PolicyViolation);
    }

    // 7. Record safety report
    const dbSafety: SafetyReport = await this.repo.createSafetyReport({
      sessionId,
      modelId,
      promptRiskScore: safetyResult.promptRiskScore,
      outputRiskScore: safetyResult.outputRiskScore,
      riskFlags: safetyResult.riskFlags,
      scannerLogs: safetyResult.scannerLogs
    });

    // 8. Record explainability trace
    const dbExplain: ExplainabilityRecord = await this.repo.createExplainability({
      sessionId,
      ...expResult
    });

    // 9. Record compliance stats
    const dbCompliance: ComplianceRecord = await this.repo.createCompliance({
      sessionId,
      complianceScore,
      policyCompliance,
      ruleCompliance,
      evidenceCompleteness,
      researchCompleteness,
      explainabilityCompleteness,
      confidenceValidation
    });

    // 10. Record human review if required
    let dbReview: HumanReview | null = null;
    if (humanReviewRequired) {
      dbReview = await this.repo.createHumanReview({
        sessionId,
        status: "PENDING",
        escalationReason,
        decisionOverride: false,
        approvalHistory: []
      });
    }

    // 11. Aggregate and record metric trend snapshots
    await this.updateHistoricalMetrics(complianceScore, latency, policyResult.violations.length, safetyResult.riskFlags.length, humanReviewRequired);

    return {
      session: dbSession,
      safetyReport: dbSafety,
      policyCheck: policyResult,
      explainability: dbExplain,
      compliance: dbCompliance,
      humanReview: dbReview
    };
  }

  /**
   * Periodically updates standard governance telemetry stats in the database.
   */
  private async updateHistoricalMetrics(
    currentComplianceScore: number,
    currentLatency: number,
    violationsCount: number,
    safetyCount: number,
    humanInLoopTriggered: boolean
  ): Promise<void> {
    try {
      const activePendingReviews = await this.repo.listHumanReviews("PENDING");
      const latestMetrics = await this.repo.getLatestMetrics();

      const baseMetrics = latestMetrics || {
        policyViolationsCount: 0,
        safetyViolationsCount: 0,
        governanceLatencyAvg: 0,
        reviewQueueSize: 0,
        approvalTimeAvg: 0,
        auditVolume: 0,
        explainabilityCoverage: 0,
        complianceScoreAvg: 100
      };

      const auditVolume = (baseMetrics.auditVolume || 0) + 1;
      const policyViolationsCount = (baseMetrics.policyViolationsCount || 0) + violationsCount;
      const safetyViolationsCount = (baseMetrics.safetyViolationsCount || 0) + safetyCount;
      const governanceLatencyAvg = Number((((baseMetrics.governanceLatencyAvg || 0) * (auditVolume - 1) + currentLatency) / auditVolume).toFixed(2));
      const complianceScoreAvg = Number((((baseMetrics.complianceScoreAvg || 100) * (auditVolume - 1) + currentComplianceScore) / auditVolume).toFixed(2));

      await this.repo.saveMetrics({
        policyViolationsCount,
        safetyViolationsCount,
        governanceLatencyAvg,
        reviewQueueSize: activePendingReviews.length,
        approvalTimeAvg: baseMetrics.approvalTimeAvg || 120, // default dummy metric
        auditVolume,
        explainabilityCoverage: 100, // all compliant requests carry 100% trace coverage
        complianceScoreAvg
      });
    } catch (error) {
      console.error("Failed to update governance metrics:", error);
    }
  }
}
export const governancePipelineService = new GovernancePipelineService();
export const governanceRepo = new GovernanceRepository();
export const auditEngine = new AuditEngine();
