// @ts-nocheck
import { RiskFoundationRepository } from "../repositories/risk-foundation.repository.ts";
import { RiskAssessment, RiskHistoryRecord } from "../types/index.ts";

export class RiskLifecycleService {
  constructor(private repo: RiskFoundationRepository = new RiskFoundationRepository()) {}

  async recordAssessment(assessment: RiskAssessment): Promise<RiskAssessment> {
    const saved = await this.repo.saveAssessment(assessment);

    // Also write to audit risk history
    const historyRecord: RiskHistoryRecord = {
      historyId: `risk-hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      targetId: assessment.targetId,
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel,
      metrics: assessment.metrics,
    };
    await this.repo.saveHistory(historyRecord);

    return saved;
  }

  async getAssessment(assessmentId: string): Promise<RiskAssessment | null> {
    return await this.repo.findAssessmentById(assessmentId);
  }

  async getTargetHistory(targetId: string, limit = 20): Promise<RiskHistoryRecord[]> {
    return await this.repo.getHistoryByTarget(targetId, limit);
  }

  async getRecentAssessments(targetId: string, limit = 20): Promise<RiskAssessment[]> {
    return await this.repo.findAssessmentsByTargetId(targetId, limit);
  }
}
