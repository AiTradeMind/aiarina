import { portfolioRepository } from "../repositories/PortfolioRepository.ts";
import { positionRepository } from "../repositories/PositionRepository.ts";
import { IEnterprisePortfolioSnapshot } from "../types/index.ts";

export class PortfolioSnapshotService {
  public async createSnapshot(portfolioId: string, organizationId: string): Promise<IEnterprisePortfolioSnapshot> {
    const portfolio = await portfolioRepository.getPortfolio(portfolioId, organizationId);
    if (!portfolio) throw new Error("Portfolio not found");
    
    // In a real app we'd also snapshot positions, but prompt only requires tracking portfolio snapshots
    const today = new Date().toISOString().split('T')[0];
    
    return await portfolioRepository.createSnapshot({
      portfolioId: portfolio.id,
      snapshotDate: today,
      cashBalance: portfolio.cashBalance,
      equity: portfolio.equity,
      portfolioValue: portfolio.portfolioValue
    });
  }
}

export const portfolioSnapshotService = new PortfolioSnapshotService();
