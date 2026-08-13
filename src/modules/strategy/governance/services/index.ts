import { GovernanceRepository } from "../repositories/index.ts";

export class GovernanceService {
  private repository: GovernanceRepository;

  constructor() {
    this.repository = new GovernanceRepository();
  }

  async getGovernanceList() {
    return this.repository.getGovernanceList();
  }

  async getPolicies() {
    return this.repository.getPolicies();
  }

  async getApprovals(strategyId?: string) {
    return this.repository.getApprovals(strategyId);
  }

  async getHistory(strategyId?: string) {
    return this.repository.getHistory(strategyId);
  }

  async getCompliance(strategyId?: string) {
    return this.repository.getCompliance(strategyId);
  }

  async getPermissions(strategyId?: string) {
    return this.repository.getPermissions(strategyId);
  }

  async getReviewRequests(strategyId?: string) {
    return this.repository.getReviewRequests(strategyId);
  }

  async submitForReview(strategyId: string, requestedBy: string, notes?: string) {
    return this.repository.submitForReview(strategyId, requestedBy, notes);
  }

  async approveStrategy(strategyId: string, reviewerEmail: string, comments?: string) {
    return this.repository.approveStrategy(strategyId, reviewerEmail, comments);
  }

  async rejectStrategy(strategyId: string, reviewerEmail: string, comments: string) {
    return this.repository.rejectStrategy(strategyId, reviewerEmail, comments);
  }

  async publishStrategy(strategyId: string, performedBy: string) {
    return this.repository.publishStrategy(strategyId, performedBy);
  }

  async archiveStrategy(strategyId: string, performedBy: string) {
    return this.repository.archiveStrategy(strategyId, performedBy);
  }

  async runComplianceCheck(strategyId: string) {
    return this.repository.runComplianceCheck(strategyId);
  }

  async savePermission(strategyId: string, email: string, role: string, canEdit: boolean, canRun: boolean, canApprove: boolean, grantedBy: string) {
    return this.repository.savePermission(strategyId, email, role, canEdit, canRun, canApprove, grantedBy);
  }
}
