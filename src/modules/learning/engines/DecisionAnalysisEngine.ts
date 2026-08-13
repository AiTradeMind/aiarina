export class DecisionAnalysisEngine {
  public analyzeTradeDecision(trade: any): {
    decision: string;
    reason: string;
    confidence: number;
    marketContext: Record<string, any>;
    indicatorsUsed: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    result: 'SUCCESS' | 'FAILURE';
    pnl: number;
    learningOutcome: string;
  } {
    const pnl = parseFloat(trade.realizedPnl || '0');
    const result = pnl >= 0 ? 'SUCCESS' : 'FAILURE';
    const confidence = trade.confidence || 0.85;
    const riskLevel = trade.riskLevel || (Math.abs(pnl) > 500 ? 'HIGH' : 'MEDIUM');

    let learningOutcome = '';
    if (result === 'SUCCESS') {
      learningOutcome = `Strategy setup executed successfully with positive return of ${pnl}. Market condition aligned with prediction.`;
    } else {
      learningOutcome = `Trade resulted in loss of ${pnl}. Potential market volatility mismatch or premature entry.`;
    }

    return {
      decision: trade.action || 'BUY',
      reason: trade.reason || 'Momentum and indicator convergence',
      confidence,
      marketContext: trade.marketContext || { volatility: 'NORMAL', trend: 'BULLISH' },
      indicatorsUsed: trade.indicatorsUsed || ['RSI', 'MACD', 'EMA'],
      riskLevel,
      result,
      pnl,
      learningOutcome
    };
  }
}

export const decisionAnalysisEngine = new DecisionAnalysisEngine();
