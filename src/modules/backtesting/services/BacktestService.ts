import { backtestRepository } from "../repositories/BacktestRepository";
import { backtestEngine } from "../engines/BacktestEngine";
import { BacktestConfig, BacktestResult } from "../types";
import { v4 as uuidv4 } from "uuid";

export class BacktestService {
  async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    await backtestRepository.ensureTables();
    const result = await backtestEngine.runBacktest(config);
    await backtestRepository.insertResult({ id: uuidv4(), backtestId: config.id, results: result });
    return result;
  }
}

export const backtestService = new BacktestService();
