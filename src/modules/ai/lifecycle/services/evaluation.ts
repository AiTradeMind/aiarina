import { PaperTradeRepository } from "../../../paperTrading/repositories/index.ts";

export class EvaluationService {
  private tradeRepo = new PaperTradeRepository();

  async evaluateModel(modelId: number, organizationId: string): Promise<any> {
    const trades = await this.tradeRepo.findByOrganizationId(organizationId);
    
    if (trades.length === 0) return { accuracy: 0, confidence: 0, riskCompliance: 1.0 };

    // Simple performance calculation logic
    let wins = 0;
    for (let i = 1; i < trades.length; i++) {
      if (trades[i].executionPrice > trades[i-1].executionPrice && trades[i].side === 'BUY') wins++;
      if (trades[i].executionPrice < trades[i-1].executionPrice && trades[i].side === 'SELL') wins++;
    }

    const accuracy = (wins / trades.length) * 100;
    
    return {
      accuracy,
      confidence: 0.75, // Simplified
      riskCompliance: 1.0,
      tradesEvaluated: trades.length
    };
  }
}
