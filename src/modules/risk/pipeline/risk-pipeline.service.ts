import { KillSwitchService } from "../../runtime-governance/services/kill-switch.service.ts";
import { CircuitBreakerService } from "../../runtime-governance/services/circuit-breaker.service.ts";
import { RiskRegistryService } from "../services/risk-registry.service.ts";
import { ExposureEngineService } from "../services/exposure-engine.service.ts";
import { LimitEngineService } from "../services/limit-engine.service.ts";
import { MarginValidatorService } from "../services/margin-validator.service.ts";
import { RiskCalculatorService } from "../services/risk-calculator.service.ts";
import { RiskLifecycleService } from "../services/risk-lifecycle.service.ts";
import { RiskMetadataService } from "../services/risk-metadata.service.ts";
import { RiskFoundationRepository } from "../repositories/risk-foundation.repository.ts";
import {
  RiskAssessmentRequest,
  RiskPipelineResult,
  PipelineStageLog,
  RiskAssessment,
  RiskEngineEvent
} from "../types/index.ts";
import { PipelineStage, RiskDecisionAction } from "../constants/index.ts";

export class RiskPipelineService {
  private killSwitch = KillSwitchService.getInstance();
  private circuitBreaker = CircuitBreakerService.getInstance();
  private registryService = new RiskRegistryService();
  private exposureEngine = new ExposureEngineService();
  private limitEngine = new LimitEngineService();
  private marginValidator = new MarginValidatorService();
  private calculatorService = new RiskCalculatorService();
  private lifecycleService = new RiskLifecycleService();
  private metadataService = new RiskMetadataService();
  private repo = new RiskFoundationRepository();

  async executePipeline(request: RiskAssessmentRequest): Promise<RiskPipelineResult> {
    const stageLogs: PipelineStageLog[] = [];
    const reasons: string[] = [];
    const requestId = request.requestId || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const assessmentId = `risk-assess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const targetId = request.targetId;

    const logStage = (stage: PipelineStage, passed: boolean, message?: string, data?: any) => {
      stageLogs.push({
        stage,
        timestamp: new Date().toISOString(),
        passed,
        message,
        data,
      });
    };

    // Stage 1: Receive Request
    logStage('REQUEST', true, 'Risk evaluation request received', { requestId, targetId });

    // Stage 2: Validate Governance
    const killSwitchStatus = await this.killSwitch.isKillSwitchActive(targetId);
    if (killSwitchStatus.isActive) {
      const msg = `Execution rejected: Kill Switch is active (${killSwitchStatus.state?.reason || 'Halted'})`;
      reasons.push(msg);
      logStage('VALIDATE_GOVERNANCE', false, msg);

      return this.finalizePipelineResult({
        assessmentId,
        requestId,
        targetId,
        approved: false,
        action: 'REJECTED',
        riskScore: 100,
        riskLevel: 'BLOCKED',
        reasons,
        metrics: this.getEmptyMetrics(request),
        stageLogs,
      });
    }

    const cbStatus = await this.circuitBreaker.checkCircuitBreaker(targetId);
    if (cbStatus.isOpen) {
      const msg = `Execution rejected: Circuit Breaker is open`;
      reasons.push(msg);
      logStage('VALIDATE_GOVERNANCE', false, msg);

      return this.finalizePipelineResult({
        assessmentId,
        requestId,
        targetId,
        approved: false,
        action: 'REJECTED',
        riskScore: 100,
        riskLevel: 'BLOCKED',
        reasons,
        metrics: this.getEmptyMetrics(request),
        stageLogs,
      });
    }

    logStage('VALIDATE_GOVERNANCE', true, 'Governance checks passed');

    // Stage 3: Load Risk Rules
    const profile = await this.registryService.getOrCreateDefaultProfile(targetId);
    if (profile.status !== 'ACTIVE') {
      const msg = `Execution rejected: Risk profile ${profile.profileId} is ${profile.status}`;
      reasons.push(msg);
      logStage('LOAD_RISK_RULES', false, msg);

      return this.finalizePipelineResult({
        assessmentId,
        requestId,
        targetId,
        approved: false,
        action: 'REJECTED',
        riskScore: 100,
        riskLevel: 'BLOCKED',
        reasons,
        metrics: this.getEmptyMetrics(request),
        stageLogs,
      });
    }

    const limits = await this.registryService.getLimits(profile.profileId);
    const metadata = await this.metadataService.getMetadata(profile.profileId);
    logStage('LOAD_RISK_RULES', true, `Loaded profile ${profile.profileId} and limits`);

    // Stage 4: Calculate Metrics & Evaluate Exposure
    const metrics = this.calculatorService.calculateMetrics(request, limits);
    const exposureAnalysis = this.exposureEngine.analyzeExposure(metrics, limits);

    if (exposureAnalysis.warnings.length > 0) {
      reasons.push(...exposureAnalysis.warnings);
    }

    logStage('EVALUATE_EXPOSURE', !exposureAnalysis.isConcentrationBreached && !exposureAnalysis.isLeverageExcessive,
      'Exposure evaluated', { leverage: metrics.leverage, concentration: metrics.concentrationRatio });

    // Stage 5: Validate Limits
    const limitCheck = this.limitEngine.validateLimits(metrics, limits);
    if (!limitCheck.passed) {
      limitCheck.breaches.forEach(b => reasons.push(b.message));
      logStage('VALIDATE_LIMITS', false, `Limit breaches detected: ${limitCheck.breaches.length}`, { breaches: limitCheck.breaches });
    } else {
      logStage('VALIDATE_LIMITS', true, 'All risk limits satisfied');
    }

    // Stage 6: Margin Check
    const marginCheck = this.marginValidator.validateMargin(metrics, limits, metadata.marginCallLevel);
    if (!marginCheck.isValid) {
      reasons.push(marginCheck.message || 'Margin check failed');
      logStage('EVALUATE_EXPOSURE', false, marginCheck.message);
    } else if (marginCheck.marginCallTriggered) {
      reasons.push(marginCheck.message || 'Margin call warning triggered');
      logStage('EVALUATE_EXPOSURE', true, marginCheck.message);
    }

    // Stage 7: Calculate Risk Score
    const riskScore = metrics.riskScore;
    const riskLevel = this.calculatorService.determineRiskLevel(riskScore);
    logStage('CALCULATE_RISK', true, `Calculated Risk Score: ${riskScore} (${riskLevel})`);

    // Stage 8: Decision / Approve / Reject
    let approved = true;
    let action: RiskDecisionAction = 'APPROVED';

    if (riskLevel === 'BLOCKED' || riskLevel === 'CRITICAL' || !limitCheck.passed || !marginCheck.isValid) {
      approved = false;
      action = 'REJECTED';
    } else if (riskLevel === 'HIGH' || exposureAnalysis.warnings.length > 0) {
      action = 'MONITOR';
    }

    logStage('APPROVE_REJECT', approved, `Decision: ${action}`, { approved, action, riskScore, riskLevel });

    // Stage 9: Audit & Log
    logStage('AUDIT', true, 'Recording audit trail');
    logStage('READY', true, 'Risk evaluation completed');

    return await this.finalizePipelineResult({
      assessmentId,
      requestId,
      targetId,
      approved,
      action,
      riskScore,
      riskLevel,
      reasons,
      metrics,
      stageLogs,
    });
  }

  private async finalizePipelineResult(data: {
    assessmentId: string;
    requestId: string;
    targetId: string;
    approved: boolean;
    action: RiskDecisionAction;
    riskScore: number;
    riskLevel: any;
    reasons: string[];
    metrics: any;
    stageLogs: PipelineStageLog[];
  }): Promise<RiskPipelineResult> {
    const assessment: RiskAssessment = {
      assessmentId: data.assessmentId,
      requestId: data.requestId,
      targetId: data.targetId,
      riskType: 'MARKET_RISK',
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      action: data.action,
      metrics: data.metrics,
      reasons: data.reasons,
    };

    await this.lifecycleService.recordAssessment(assessment);

    // Record Event
    const event: RiskEngineEvent = {
      eventId: `risk-evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      assessmentId: data.assessmentId,
      eventType: data.approved ? 'RISK_APPROVED' : 'RISK_REJECTED',
      riskType: 'MARKET_RISK',
      riskLevel: data.riskLevel,
      details: {
        requestId: data.requestId,
        targetId: data.targetId,
        action: data.action,
        reasons: data.reasons,
      },
    };
    await this.repo.saveEvent(event);

    return {
      assessmentId: data.assessmentId,
      requestId: data.requestId,
      targetId: data.targetId,
      approved: data.approved,
      action: data.action,
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      reasons: data.reasons,
      metrics: data.metrics,
      stageLogs: data.stageLogs,
    };
  }

  private getEmptyMetrics(request: RiskAssessmentRequest) {
    return {
      riskScore: 100,
      grossExposure: request.orderValue || 0,
      netExposure: request.orderValue || 0,
      longExposure: 0,
      shortExposure: 0,
      capitalUtilization: 100,
      positionSize: request.positionSize || 0,
      dailyLoss: 0,
      maxDrawdown: 100,
      concentrationRatio: 100,
      volatilityIndex: 100,
      liquidityScore: 0,
      availableMargin: 0,
      requiredMargin: 0,
      leverage: 0,
    };
  }
}
