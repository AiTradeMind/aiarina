import { BacktestConfig } from "../types";

export class HistoricalReplayEngine {
  async replay(config: BacktestConfig): Promise<any[]> {
    // Logic to fetch and replay historical data
    return [];
  }
}

export const historicalReplayEngine = new HistoricalReplayEngine();
