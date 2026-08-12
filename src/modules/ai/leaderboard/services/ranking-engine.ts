
import { TradingPerformanceService } from "../../performance/services/trading-performance";
import { PortfolioPerformanceService } from "../../performance/services/portfolio-performance";
import { RiskPerformanceService } from "../../performance/services/risk-performance";

export class RankingEngineService {
  private tradingPerf = new TradingPerformanceService();
  private portfolioPerf = new PortfolioPerformanceService();
  private riskPerf = new RiskPerformanceService();

  // Composite Score formula:
  // Performance (40%) + Risk (20%) + Consistency (15%) + Research (10%) + Accuracy (10%) + Efficiency (5%)
  async calculateCompositeScore(organizationId: string): Promise<number> {
    const trading = await this.tradingPerf.getStrategyPerformance(organizationId);
    const portfolio = await this.portfolioPerf.getPortfolioPerformance(organizationId);
    const risk = await this.riskPerf.getRiskPerformance(organizationId);

    // Normalizing and weighting... (Simplified for now)
    const perfScore = trading.winRate * 0.4;
    const riskScore = (100 - (risk.rejectedOrdersCount * 5)) * 0.2; // Example reduction
    const consistencyScore = trading.profitFactor * 0.15 * 10; // Normalize
    
    return perfScore + riskScore + consistencyScore;
  }
}
