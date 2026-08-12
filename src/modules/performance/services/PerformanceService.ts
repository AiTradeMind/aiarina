import { performanceRepository } from "../repositories/PerformanceRepository.ts";
import { performanceEngine } from "../engines/PerformanceEngine.ts";
import { randomUUID } from "crypto";

export class PerformanceService {
  public async getMetrics(organizationId: string, entityType: string, entityId?: string) {
    if (entityId) {
      return await performanceRepository.getMetric(organizationId, entityType, entityId);
    }
    return await performanceRepository.getMetrics(organizationId, entityType);
  }

  public async getHistory(organizationId: string, entityType: string, entityId: string) {
    return await performanceRepository.getHistory(organizationId, entityType, entityId);
  }
  
  public async computeAndSaveMetrics(organizationId: string, entityType: string, entityId: string, trades: any[]) {
     const computed = performanceEngine.calculateMetrics(trades);
     const existing = await performanceRepository.getMetric(organizationId, entityType, entityId);
     
     const metric = {
        id: existing?.id || `pm_${randomUUID().replace(/-/g, '').substring(0, 12)}`,
        organizationId,
        entityType: entityType as any,
        entityId,
        ...computed,
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date()
     };
     
     await performanceRepository.upsertMetric(metric as any);
     return metric;
  }
}

export const performanceService = new PerformanceService();
