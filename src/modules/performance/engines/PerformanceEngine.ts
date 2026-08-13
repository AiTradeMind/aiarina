import { IPerformanceMetric } from "../types/index.ts";

export class PerformanceEngine {
  public calculateMetrics(trades: any[]): Partial<IPerformanceMetric> {
    let totalTrades = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    let grossPnL = 0;
    let netPnL = 0;
    let maxDrawdown = 0;
    let peakValue = 0;
    let currentValue = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let totalHoldingTime = 0;

    for (const trade of trades) {
      if (trade.status !== 'CLOSED') continue;
      
      totalTrades++;
      const pnl = parseFloat(trade.realizedPnl || '0');
      const fees = parseFloat(trade.fees || '0');
      const net = pnl - fees;
      
      grossPnL += pnl;
      netPnL += net;
      currentValue += net;

      if (net > 0) {
        winningTrades++;
        grossProfit += net;
      } else {
        losingTrades++;
        grossLoss += Math.abs(net);
      }

      if (currentValue > peakValue) {
        peakValue = currentValue;
      }
      
      const drawdown = peakValue > 0 ? (peakValue - currentValue) / peakValue : 0;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
      
      if (trade.entryTime && trade.exitTime) {
        totalHoldingTime += (new Date(trade.exitTime).getTime() - new Date(trade.entryTime).getTime());
      }
    }

    const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
    const lossRate = totalTrades > 0 ? losingTrades / totalTrades : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 999 : 0);
    
    // Simplified Expectancy: (Win Rate * Avg Win) - (Loss Rate * Avg Loss)
    const avgWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
    const avgLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;
    const expectancy = (winRate * avgWin) - (lossRate * avgLoss);
    
    const avgHoldingTimeMs = totalTrades > 0 ? totalHoldingTime / totalTrades : 0;
    
    // Mock simple scoring algorithms
    const roi = netPnL; // Normally relative to capital, using absolute for now or we need capital data
    const riskScore = maxDrawdown * 100;
    const consistencyScore = winRate * 100;
    const capitalEfficiency = roi / (maxDrawdown || 1);

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      lossRate,
      grossPnL,
      netPnL,
      roi,
      maxDrawdown,
      profitFactor,
      expectancy,
      avgHoldingTimeMs,
      capitalEfficiency,
      riskScore,
      consistencyScore
    };
  }
}

export const performanceEngine = new PerformanceEngine();
