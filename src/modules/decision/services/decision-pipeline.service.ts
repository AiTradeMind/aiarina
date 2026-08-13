import {
  DECISION_PIPELINE_STAGES,
  DECISION_TYPES,
  DECISION_STATUSES,
  DecisionPipelineStageValue,
  DecisionTypeValue,
  DECISION_ERRORS,
} from "../constants/index.ts";
import {
  DecisionPipelineRunRecord,
  DecisionPipelineStageHistory,
  DecisionRecord,
  EvaluateDecisionDTO,
} from "../types/index.ts";
import { DecisionValidatorService } from "./decision-validator.service.ts";
import logger from "../../../lib/logger.ts";

export class DecisionPipelineService {
  private validator: DecisionValidatorService;
  private static pipelineRuns: Map<string, DecisionPipelineRunRecord> = new Map();

  constructor(validator?: DecisionValidatorService) {
    this.validator = validator || new DecisionValidatorService();
  }

  /**
   * Run 8-stage AI decision evaluation pipeline
   */
  public async processDecisionPipeline(
    decisionId: string,
    dto: EvaluateDecisionDTO
  ): Promise<{ runRecord: DecisionPipelineRunRecord; decisionRecord: DecisionRecord }> {
    const runId = `DPR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const startTime = Date.now();
    const stageHistory: DecisionPipelineStageHistory[] = [];

    const stages: DecisionPipelineStageValue[] = [
      DECISION_PIPELINE_STAGES.RECEIVE_CONTEXT,
      DECISION_PIPELINE_STAGES.VALIDATE_INPUTS,
      DECISION_PIPELINE_STAGES.EVALUATE_EVIDENCE,
      DECISION_PIPELINE_STAGES.CALCULATE_CONFIDENCE,
      DECISION_PIPELINE_STAGES.CALCULATE_RISK,
      DECISION_PIPELINE_STAGES.GENERATE_DECISION,
      DECISION_PIPELINE_STAGES.VALIDATE_GOVERNANCE,
      DECISION_PIPELINE_STAGES.READY,
    ];

    let currentStage: DecisionPipelineStageValue = DECISION_PIPELINE_STAGES.RECEIVE_CONTEXT;
    let failureReason: string | null = null;

    let decisionType: DecisionTypeValue = dto.userOverrideType || DECISION_TYPES.WATCH;
    let confidenceScore = 75.0;
    let confidenceLevel = this.validator.calculateConfidenceScore(0, 0, 75.0).confidenceLevel;
    let riskScore = 30.0;
    let priority = this.validator.calculatePriority(decisionType, confidenceScore, riskScore);
    let reasoningSummary = "";
    let supportingEvidence: any[] = dto.researchEvidence || [];
    let knowledgeReferences: any[] = dto.brainKnowledge || [];
    let policyReferences: any[] = [];

    try {
      for (const stage of stages) {
        currentStage = stage;
        const stageStart = Date.now();

        switch (stage) {
          case DECISION_PIPELINE_STAGES.RECEIVE_CONTEXT:
            if (!dto.contextId && !dto.brainContext && supportingEvidence.length === 0) {
              logger.info({ type: "DECISION_STAGE", stage }, "Context received or constructed from DTO");
            }
            break;

          case DECISION_PIPELINE_STAGES.VALIDATE_INPUTS:
            const validationResult = this.validator.validateInputs(dto);
            if (!validationResult.valid && !dto.userOverrideType) {
              throw new Error(`Input validation failed: ${validationResult.errors.join(", ")}`);
            }
            break;

          case DECISION_PIPELINE_STAGES.EVALUATE_EVIDENCE:
            const evidenceCount = supportingEvidence.length;
            const knowledgeCount = knowledgeReferences.length;
            reasoningSummary = `Evaluated ${evidenceCount} evidence items and ${knowledgeCount} knowledge records. Context analyzed for opportunity evaluation.`;
            break;

          case DECISION_PIPELINE_STAGES.CALCULATE_CONFIDENCE:
            const confRes = this.validator.calculateConfidenceScore(
              knowledgeReferences.length,
              supportingEvidence.length,
              75.0
            );
            confidenceScore = confRes.confidenceScore;
            confidenceLevel = confRes.confidenceLevel;
            break;

          case DECISION_PIPELINE_STAGES.CALCULATE_RISK:
            riskScore = this.validator.calculateRiskScore(decisionType, confidenceScore);
            priority = this.validator.calculatePriority(decisionType, confidenceScore, riskScore);
            break;

          case DECISION_PIPELINE_STAGES.GENERATE_DECISION:
            if (!dto.userOverrideType) {
              if (confidenceScore >= 85.0 && riskScore < 40.0) decisionType = DECISION_TYPES.BUY;
              else if (confidenceScore >= 75.0) decisionType = DECISION_TYPES.WATCH;
              else decisionType = DECISION_TYPES.HOLD;
            }
            break;

          case DECISION_PIPELINE_STAGES.VALIDATE_GOVERNANCE:
            const govRes = this.validator.validateGovernance();
            if (!govRes.allowed) {
              throw new Error(DECISION_ERRORS.GOVERNANCE_VALIDATION_FAILED);
            }
            policyReferences.push({
              policyId: govRes.policyReference,
              status: "COMPLIANT",
              checkedAt: new Date().toISOString(),
            });
            break;

          case DECISION_PIPELINE_STAGES.READY:
            break;
        }

        const durationMs = Date.now() - stageStart;
        stageHistory.push({
          stage,
          timestamp: new Date(),
          durationMs,
          status: "SUCCESS",
          details: `Stage [${stage}] completed successfully for decision ${decisionId}`,
        });
      }
    } catch (err: any) {
      failureReason = err.message || "Pipeline stage execution error";
      stageHistory.push({
        stage: currentStage,
        timestamp: new Date(),
        durationMs: 0,
        status: "FAILED",
        details: failureReason,
      });
      logger.error(
        { type: "DECISION_PIPELINE_FAILED", runId, decisionId, currentStage, error: failureReason },
        "Decision Engine pipeline execution failed"
      );
    }

    const executionTimeMs = Date.now() - startTime;
    const runRecord: DecisionPipelineRunRecord = {
      runId,
      decisionId,
      currentStage,
      executionTimeMs,
      failureReason,
      stageHistory,
      createdAt: new Date(),
    };

    DecisionPipelineService.pipelineRuns.set(runId, runRecord);

    const now = new Date();
    const decisionRecord: DecisionRecord = {
      decisionId,
      contextId: dto.contextId || (dto.brainContext as any)?.contextId || null,
      symbol: dto.symbol || "NIFTY50",
      decisionType,
      status: failureReason ? DECISION_STATUSES.REJECTED : DECISION_STATUSES.READY,
      confidence: confidenceLevel,
      confidenceScore,
      riskScore,
      priority,
      reasoningSummary,
      supportingEvidence,
      knowledgeReferences,
      policyReferences,
      metadata: {
        runId,
        operator: dto.operator || "SYSTEM",
        tradingProhibited: true,
        orderExecutionProhibited: true,
      },
      createdAt: now,
      updatedAt: now,
    };

    logger.info(
      { type: "DECISION_PIPELINE_COMPLETED", runId, decisionId, currentStage, executionTimeMs, decisionType },
      "Decision Engine Pipeline finished execution"
    );

    return { runRecord, decisionRecord };
  }

  public getPipelineRun(runId: string): DecisionPipelineRunRecord | null {
    return DecisionPipelineService.pipelineRuns.get(runId) || null;
  }
}
