import { BacktestingRepository } from "../repositories/index.ts";
import { VersioningService } from "../../versioning/services/index.ts";
import { RegistryService } from "../../registry/services/index.ts";
import { PaperTradingService } from "../../../paperTrading/services/index.ts";
import { 
  StrategyBacktest, StrategyBacktestRun, StrategyBacktestMetrics,
  StrategyBacktestReport, StrategyBacktestHistory
} from "../types/index.ts";

export class BacktestingService {
  private repo = new BacktestingRepository();
  private versioningService = new VersioningService();
  private registryService = new RegistryService();
  private paperService = new PaperTradingService();

  async getBacktests(strategyId: string): Promise<any[]> {
    const bts = await this.repo.getBacktests(strategyId);
    return Promise.all(bts.map(async b => {
      const runs = await this.repo.getRuns(b.id);
      return { ...b, runs };
    }));
  }

  async getRunById(runId: string): Promise<any> {
    const run = await this.repo.getRunById(runId);
    if (!run) return null;
    
    const metrics = await this.repo.getMetrics(run.id);
    const reports = await this.repo.getReports(run.id);
    return { ...run, metrics, reports };
  }

  async getHistory(strategyId: string): Promise<StrategyBacktestHistory[]> {
    return await this.repo.getHistory(strategyId);
  }

  async runBacktest(data: { strategyId: string; versionId?: string; userId: string; configuration: any }): Promise<{ success: boolean; data?: any; error?: string }> {
    const strategy = await this.registryService.getStrategyById(data.strategyId);
    if (!strategy) return { success: false, error: 'Strategy not found' };

    let versionId = data.versionId;
    if (!versionId) {
      const versions = await this.versioningService.getVersions(data.strategyId);
      if (versions.length === 0) return { success: false, error: 'No versions found' };
      versionId = versions[0].id;
    }

    const version = await this.versioningService.getVersionById(versionId!);
    if (!version) return { success: false, error: 'Version not found' };

    const backtestId = crypto.randomUUID();
    const runId = crypto.randomUUID();

    // Setup DB records
    await this.repo.createBacktest({
      id: backtestId,
      strategyId: data.strategyId,
      versionId: versionId!,
      status: 'RUNNING',
      createdTime: new Date()
    });

    await this.repo.createRun({
      id: runId,
      backtestId,
      configuration: data.configuration,
      status: 'RUNNING',
      progress: 0,
      startTime: new Date(),
      endTime: null
    });

    await this.repo.createHistory({
      id: crypto.randomUUID(),
      strategyId: data.strategyId,
      runId,
      userId: data.userId,
      notes: `Started backtest for version ${version.semanticVersion}`,
      timestamp: new Date()
    });

    // Start background simulation
    this.executeSimulation(runId, version, data.configuration, data.userId).catch(console.error);

    return { success: true, data: { backtestId, runId } };
  }

  private async executeSimulation(runId: string, version: any, config: any, userId: string) {
     const backtestOrgId = `backtest-${runId}`;
     await this.paperService.getAccount(backtestOrgId); // Initialize mock paper account

     // Simulate progress and trades
     for(let i=1; i<=5; i++) {
        await new Promise(r => setTimeout(r, 500)); // sleep 500ms
        await this.repo.updateRunProgress(runId, i * 20, 'RUNNING');
        
        try {
          const side = i % 2 === 1 ? 'BUY' : 'SELL';
          await this.paperService.createOrder(backtestOrgId, parseInt(userId) || 1, {
            ticker: config.symbol || 'RELIANCE',
            side,
            quantity: config.lotSize || 10,
            price: 150 + (i * 2 * (side === 'BUY' ? -1 : 1)),
            type: 'MARKET',
            stopLoss: 0,
            target: 0
          });
        } catch (e) {
          console.warn("Backtest simulated order failed", e);
        }
     }

     const performance = await this.paperService.getPerformance(backtestOrgId);
     const profit = parseFloat(performance.totalProfit || "0");
     const roi = parseFloat(performance.profitPercentage || "0");
     
     // Save metrics
     await this.repo.createMetrics({
        id: crypto.randomUUID(),
        runId,
        netProfit: profit,
        grossProfit: profit > 0 ? profit : 0,
        grossLoss: profit < 0 ? Math.abs(profit) : 0,
        roi: roi,
        cagr: roi / 2, // arbitrary mock formula
        winRate: profit > 0 ? 0.6 : 0.4,
        profitFactor: profit > 0 ? 1.5 : 0.8,
        sharpeRatio: profit > 0 ? 1.2 : 0.5,
        maxDrawdown: profit > 0 ? 5.2 : 12.4,
        recoveryFactor: profit > 0 ? 2.1 : 0.5,
        totalTrades: 5,
        createdTime: new Date()
     });

     // Generate report
     await this.repo.createReport({
        id: crypto.randomUUID(),
        runId,
        summary: profit > 0 ? 'Strategy performed well under simulated conditions.' : 'Strategy incurred a loss during simulation.',
        riskAnalysis: profit > 0 ? 'Risk was contained.' : 'High drawdown observed.',
        suggestions: profit > 0 ? 'Ready for paper trading.' : 'Needs optimization.',
        createdTime: new Date()
     });

     // Complete run
     await this.repo.updateRunProgress(runId, 100, 'COMPLETED');
  }

  async generateReport(data: { runId: string }): Promise<{ success: boolean; data?: any; error?: string }> {
     const reports = await this.repo.getReports(data.runId);
     if (reports.length === 0) return { success: false, error: 'Report not found' };
     return { success: true, data: reports[0] };
  }
}
