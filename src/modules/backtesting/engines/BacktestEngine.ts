import { BacktestConfig, BacktestResult } from "../types";
import { historicalReplayEngine } from "./HistoricalReplayEngine";
import { scenarioEngine } from "./ScenarioEngine";
import { simulationEngine } from "./SimulationEngine";

export class BacktestEngine {
  async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    const historicalData = await historicalReplayEngine.replay(config);
    const scenarioData = scenarioEngine.applyScenario(historicalData, config.scenario);
    const result = simulationEngine.runSimulation(scenarioData, config);
    return {
      backtestId: config.id,
      ...result,
      grossPnl: 0,
      maxDrawdown: 0,
      winRate: 0,
      lossRate: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      tradeCount: 0
    };
  }
}

export const backtestEngine = new BacktestEngine();
