import { backtestService } from "./BacktestService";

export class BacktestCoordinator {
  async coordinateBacktest(config: any): Promise<any> {
    return await backtestService.runBacktest(config);
  }
}

export const backtestCoordinator = new BacktestCoordinator();
