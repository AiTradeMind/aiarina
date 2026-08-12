import { StrategyCandidatesRepository } from "../repositories/strategy-candidates.repository.ts";
import { StrategyCandidate, CandidatesOverview, CandidateStatistics } from "../types/index.ts";
import { pino } from "pino";

const logger = pino({ name: "strategy-candidates-service" });

export class StrategyCandidatesService {
  private static instance: StrategyCandidatesService;
  private repo = StrategyCandidatesRepository.getInstance();

  public static getInstance(): StrategyCandidatesService {
    if (!StrategyCandidatesService.instance) {
      StrategyCandidatesService.instance = new StrategyCandidatesService();
    }
    return StrategyCandidatesService.instance;
  }

  async getCandidatesOverview(strategyId: string = 'STRAT-001'): Promise<CandidatesOverview> {
    const candidates = await this.repo.getCandidatesByStrategy(strategyId);
    const statistics = this.calculateStatistics(candidates);
    return {
      strategyId,
      statistics,
      candidates
    };
  }

  async validateAndIngestCandidate(candidate: StrategyCandidate): Promise<{ candidate: StrategyCandidate; isValid: boolean; validationErrors: string[] }> {
    const errors: string[] = [];

    // Validation Engine checks
    if (candidate.confidence < 60) {
      errors.push("Confidence too low (<60%)");
    }
    if (!candidate.stopLoss || candidate.stopLoss <= 0) {
      errors.push("Missing or invalid Stop Loss");
    }
    if (!candidate.targets || candidate.targets.length === 0) {
      errors.push("Missing Target price points");
    }
    if (candidate.riskReward < 1.0) {
      errors.push("Risk/Reward ratio invalid (<1.0)");
    }
    if (!candidate.strategyVersion || candidate.strategyVersion === '') {
      errors.push("Invalid or missing strategy version");
    }
    if (!candidate.aiModelId) {
      errors.push("AI permission violation: Missing AI model identifier");
    }

    const isValid = errors.length === 0;
    candidate.candidateStatus = isValid ? 'COMMITTEE_PENDING' : 'REJECTED';

    await this.repo.saveCandidate(candidate);
    for (const err of errors) {
      await this.repo.addValidation(candidate.candidateId, false, "Validation Engine Rule", err);
    }
    if (isValid) {
      await this.repo.addValidation(candidate.candidateId, true, "Validation Engine Rule", "All compliance and risk parameters verified successfully.");
    }

    return { candidate, isValid, validationErrors: errors };
  }

  async updateCandidateStatus(candidateId: string, status: string, operator: string, reason?: string): Promise<CandidatesOverview> {
    await this.repo.updateStatus(candidateId, status, operator, reason);
    const candidate = await this.repo.getCandidateById(candidateId);
    if (candidate && status === 'APPROVED') {
      // Integration hook to Ranking module
      logger.info({ candidateId }, "Candidate approved and queued for Ranking module evaluation");
    }
    return this.getCandidatesOverview(candidate?.strategyId || 'STRAT-001');
  }

  async voteOnCandidate(candidateId: string, committeeMember: string, vote: 'APPROVE' | 'REJECT' | 'ABSTAIN', comment?: string): Promise<CandidatesOverview> {
    await this.repo.addVote(candidateId, committeeMember, vote, comment);
    const candidate = await this.repo.getCandidateById(candidateId);
    return this.getCandidatesOverview(candidate?.strategyId || 'STRAT-001');
  }

  async bulkOperation(strategyId: string, operation: 'APPROVE' | 'REJECT' | 'ARCHIVE', candidateIds: string[], operator: string): Promise<CandidatesOverview> {
    for (const cid of candidateIds) {
      const targetStatus = operation === 'APPROVE' ? 'APPROVED' : operation === 'REJECT' ? 'REJECTED' : 'EXPIRED';
      await this.repo.updateStatus(cid, targetStatus, operator, `Bulk operation: ${operation}`);
    }
    return this.getCandidatesOverview(strategyId);
  }

  private calculateStatistics(candidates: StrategyCandidate[]): CandidateStatistics {
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let expiredCount = 0;
    let committeePendingCount = 0;
    let totalConf = 0;
    let totalRisk = 0;
    let totalQuality = 0;
    let totalRR = 0;

    for (const c of candidates) {
      if (c.candidateStatus === 'PENDING') pendingCount++;
      else if (c.candidateStatus === 'APPROVED') approvedCount++;
      else if (c.candidateStatus === 'REJECTED') rejectedCount++;
      else if (c.candidateStatus === 'EXPIRED') expiredCount++;
      else if (c.candidateStatus === 'COMMITTEE_PENDING') committeePendingCount++;

      totalConf += c.confidence || 0;
      totalRisk += c.riskScore || 0;
      totalQuality += c.qualityScore || 0;
      totalRR += c.riskReward || 0;
    }

    const total = candidates.length || 1;

    return {
      totalCandidates: candidates.length,
      pendingCount,
      approvedCount,
      rejectedCount,
      expiredCount,
      committeePendingCount,
      averageConfidence: Number((totalConf / total).toFixed(2)),
      averageRisk: Number((totalRisk / total).toFixed(2)),
      averageQuality: Number((totalQuality / total).toFixed(2)),
      averageRR: Number((totalRR / total).toFixed(2)),
    };
  }
}
