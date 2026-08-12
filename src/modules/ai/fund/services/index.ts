import { FundRepository } from "../repositories/index.ts";
import { AiFund, AiAllocation, AllocationHistory, AllocationRule, AllocationSnapshot, AllocationRecommendation } from "../types/index.ts";
import { randomUUID } from "crypto";

export class FundService {
  private repo = new FundRepository();

  async getFunds(): Promise<AiFund[]> {
    return await this.repo.getFunds();
  }

  async getAllocations(): Promise<AiAllocation[]> {
    return await this.repo.getAllocations();
  }

  async getHistory(): Promise<AllocationHistory[]> {
    return await this.repo.getHistory();
  }

  async getRecommendations(): Promise<AllocationRecommendation[]> {
    return await this.repo.getRecommendations();
  }

  async getRules(): Promise<AllocationRule[]> {
    return await this.repo.getRules();
  }

  async updateRule(id: string, updates: Partial<AllocationRule>): Promise<void> {
    await this.repo.updateRule(id, updates);
  }

  async recalculateAllocations(): Promise<{ success: boolean; changes: number }> {
    console.log("Recalculating virtual capital allocations based on real performance...");
    
    const funds = await this.repo.getFunds();
    const rules = await this.repo.getRules();
    const activeRule = rules.find(r => r.active) || rules[0];

    let changes = 0;

    for (const fund of funds) {
      // Fetch real performance metrics
      // In a real system, we'd use the Performance Engine services here.
      // For this implementation, we'll use the existing funds PnL/ROI fields 
      // as proxies for the Performance Engine's output.
      
      const score = (fund.winRate * 100) * fund.roi; // Simple example formula

      if (score >= activeRule.promotionThreshold) {
        // Increase allocation
        const newAllocation = Math.min(fund.allocatedCapital * 1.1, activeRule.maximumAllocation);
        if (newAllocation !== fund.allocatedCapital) {
          await this.repo.updateFund(fund.id, { allocatedCapital: newAllocation });
          changes++;
        }
      } else if (score <= activeRule.demotionThreshold) {
        // Decrease allocation
        const newAllocation = Math.max(fund.allocatedCapital * 0.9, activeRule.minimumAllocation);
        if (newAllocation !== fund.allocatedCapital) {
          await this.repo.updateFund(fund.id, { allocatedCapital: newAllocation });
          changes++;
        }
      }
    }

    return { success: true, changes };
  }

  async seedInitialData(): Promise<void> {
    const funds = await this.repo.getFunds();
    if (funds.length > 0) return;

    await this.repo.createRule({
      id: randomUUID(),
      name: "Default Conservative Policy",
      minimumScore: 80,
      maximumDrawdown: 0.15,
      maximumAllocation: 500000,
      minimumAllocation: 10000,
      maximumExposure: 0.20,
      promotionThreshold: 90,
      demotionThreshold: 75,
      freezeThreshold: 60,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.repo.createFund({
      id: randomUUID(),
      modelId: 'gpt-4o',
      allocatedCapital: 250000,
      availableCapital: 200000,
      reservedCapital: 50000,
      usedCapital: 40000,
      currentExposure: 0.16,
      maximumExposure: 0.20,
      realizedPnl: 15400.50,
      unrealizedPnl: 2300.00,
      roi: 0.07,
      drawdown: 0.02,
      sharpe: 2.1,
      winRate: 0.68,
      riskScore: 35,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await this.repo.createFund({
      id: randomUUID(),
      modelId: 'claude-3-5-sonnet',
      allocatedCapital: 150000,
      availableCapital: 150000,
      reservedCapital: 0,
      usedCapital: 0,
      currentExposure: 0,
      maximumExposure: 0.15,
      realizedPnl: 8200.00,
      unrealizedPnl: 0,
      roi: 0.05,
      drawdown: 0.01,
      sharpe: 1.8,
      winRate: 0.65,
      riskScore: 28,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.repo.createRecommendation({
      id: randomUUID(),
      modelId: 'claude-3-5-sonnet',
      action: 'INCREASE_CAPITAL',
      suggestedAmount: 50000,
      reasoning: 'Model has maintained >90 performance score and Sharpe > 1.5 over past 30 days.',
      status: 'PENDING',
      createdAt: new Date()
    });
  }
}
