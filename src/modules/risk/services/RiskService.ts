import { riskRepository } from "../repositories/RiskRepository.ts";
import { riskEngine } from "../engines/RiskEngine.ts";
import { PreTradeValidationPayload } from "../types/index.ts";

export class RiskService {
  public async getPolicies(entityType: string, entityId: string) {
    return await riskRepository.getPolicies(entityType, entityId);
  }

  public async getMetrics(entityType: string, entityId: string) {
    return await riskRepository.getMetric(entityType, entityId);
  }

  public async getSnapshots(entityType: string, entityId: string) {
    return await riskRepository.getSnapshots(entityType, entityId);
  }

  public async validateOrder(payload: PreTradeValidationPayload) {
    return await riskEngine.validatePreTrade(payload);
  }
}

export const riskService = new RiskService();
