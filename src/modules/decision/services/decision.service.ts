import { DecisionRepository } from "../repositories/decision.repository.ts";
import { DecisionValidatorService } from "./decision-validator.service.ts";
import { DecisionPipelineService } from "./decision-pipeline.service.ts";
import {
  DECISION_STATUSES,
  DECISION_ERRORS,
  DECISION_EVENT_TYPES,
  DecisionStatusValue,
} from "../constants/index.ts";
import {
  DecisionRecord,
  EvaluateDecisionDTO,
  QueryDecisionDTO,
  DecisionHealthStatus,
  DecisionSummary,
  DecisionHistoryRecord,
} from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class DecisionService {
  private repo: DecisionRepository;
  public validator: DecisionValidatorService;
  public pipelineService: DecisionPipelineService;

  constructor(
    repo?: DecisionRepository,
    validator?: DecisionValidatorService,
    pipelineService?: DecisionPipelineService
  ) {
    this.repo = repo || new DecisionRepository();
    this.validator = validator || new DecisionValidatorService();
    this.pipelineService = pipelineService || new DecisionPipelineService(this.validator);
  }

  /**
   * Evaluate opportunity & generate standardized AI decision
   */
  public async evaluateDecision(dto: EvaluateDecisionDTO): Promise<DecisionRecord> {
    const decisionId = `DEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    logger.info(
      { type: DECISION_EVENT_TYPES.DECISION_STARTED, decisionId, symbol: dto.symbol },
      "Decision evaluation started in AI Decision Engine Foundation"
    );

    // 1. Process 8-Stage Pipeline
    const { runRecord, decisionRecord } = await this.pipelineService.processDecisionPipeline(
      decisionId,
      dto
    );

    // 2. Save Decision Record
    const saved = await this.repo.saveDecision(decisionRecord);

    // 3. Save Context Snapshot
    if (dto.brainContext || dto.contextId) {
      await this.repo.saveContextSnapshot(
        decisionId,
        dto.brainContext || { contextId: dto.contextId },
        dto.contextId
      );
    }

    // 4. Log Decision Generated or Validation Failed
    if (saved.status === DECISION_STATUSES.READY) {
      logger.info(
        {
          type: DECISION_EVENT_TYPES.DECISION_GENERATED,
          decisionId,
          decisionType: saved.decisionType,
          confidence: saved.confidence,
          riskScore: saved.riskScore,
        },
        "Standardized AI Decision successfully generated"
      );
    } else {
      logger.warn(
        { type: DECISION_EVENT_TYPES.VALIDATION_FAILED, decisionId, failureReason: runRecord.failureReason },
        "Decision evaluation completed with validation/rejection status"
      );
    }

    return saved;
  }

  /**
   * Get decision by ID
   */
  public async getDecisionById(decisionId: string): Promise<DecisionRecord | null> {
    return await this.repo.getDecisionById(decisionId);
  }

  /**
   * Query decisions with filters
   */
  public async queryDecisions(query: QueryDecisionDTO = {}): Promise<DecisionRecord[]> {
    return await this.repo.queryDecisions(query);
  }

  /**
   * Get status history
   */
  public async getHistory(decisionId?: string): Promise<DecisionHistoryRecord[]> {
    return await this.repo.getHistory(decisionId);
  }

  /**
   * Update decision status
   */
  public async updateStatus(
    decisionId: string,
    newStatus: DecisionStatusValue,
    changedBy: string = "SYSTEM",
    reason?: string
  ): Promise<DecisionRecord | null> {
    const record = await this.repo.updateDecisionStatus(decisionId, newStatus, changedBy, reason);
    if (record) {
      if (newStatus === DECISION_STATUSES.APPROVED) {
        logger.info({ type: DECISION_EVENT_TYPES.DECISION_APPROVED, decisionId, changedBy }, "Decision approved");
      } else if (newStatus === DECISION_STATUSES.REJECTED) {
        logger.info({ type: DECISION_EVENT_TYPES.DECISION_REJECTED, decisionId, changedBy, reason }, "Decision rejected");
      }
    }
    return record;
  }

  /**
   * Approve a decision
   */
  public async approveDecision(decisionId: string, changedBy: string = "SYSTEM"): Promise<DecisionRecord | null> {
    return await this.updateStatus(decisionId, DECISION_STATUSES.APPROVED, changedBy, "Governance approval granted");
  }

  /**
   * Reject a decision
   */
  public async rejectDecision(decisionId: string, changedBy: string = "SYSTEM", reason: string = "Governance rejection"): Promise<DecisionRecord | null> {
    return await this.updateStatus(decisionId, DECISION_STATUSES.REJECTED, changedBy, reason);
  }

  /**
   * Get Health status of Decision Engine Foundation
   */
  public async getHealth(): Promise<DecisionHealthStatus> {
    const counts = await this.repo.countAll();
    const govCheck = this.validator.validateGovernance();

    return {
      status: govCheck.allowed ? "HEALTHY" : "DEGRADED",
      totalDecisionsCount: counts.totalCount,
      activeEvaluationsCount: counts.evaluatingCount,
      approvedCount: counts.approvedCount,
      rejectedCount: counts.rejectedCount,
      pipelineHealth: "HEALTHY",
      checkTimestamp: new Date(),
      details: {
        databaseConnected: true,
        constitutionPolicyCompliant: govCheck.allowed,
        brainIntegrationActive: true,
      },
    };
  }

  /**
   * Get Summary of decisions
   */
  public async getSummary(): Promise<DecisionSummary> {
    const decisions = await this.queryDecisions({ limit: 500 });
    const typeDist: Record<string, number> = {};
    const statusDist: Record<string, number> = {};
    const confDist: Record<string, number> = {};

    let totalConfScore = 0;
    let totalRiskScore = 0;

    for (const d of decisions) {
      typeDist[d.decisionType] = (typeDist[d.decisionType] || 0) + 1;
      statusDist[d.status] = (statusDist[d.status] || 0) + 1;
      confDist[d.confidence] = (confDist[d.confidence] || 0) + 1;
      totalConfScore += d.confidenceScore;
      totalRiskScore += d.riskScore;
    }

    const count = decisions.length || 1;
    return {
      totalDecisions: decisions.length,
      typeDistribution: typeDist,
      statusDistribution: statusDist,
      confidenceDistribution: confDist,
      averageConfidenceScore: Math.round((totalConfScore / count) * 100) / 100,
      averageRiskScore: Math.round((totalRiskScore / count) * 100) / 100,
      lastUpdated: new Date(),
    };
  }

  // ==========================================
  // Business Rules Enforcement (Prohibitions)
  // ==========================================

  public placeOrder(): never {
    throw new Error(DECISION_ERRORS.EXECUTION_PROHIBITED);
  }

  public createBrokerOrder(): never {
    throw new Error(DECISION_ERRORS.EXECUTION_PROHIBITED);
  }

  public executeTrade(): never {
    throw new Error(DECISION_ERRORS.EXECUTION_PROHIBITED);
  }

  public updatePortfolio(): never {
    throw new Error(DECISION_ERRORS.EXECUTION_PROHIBITED);
  }

  public allocateFunds(): never {
    throw new Error(DECISION_ERRORS.EXECUTION_PROHIBITED);
  }
}
