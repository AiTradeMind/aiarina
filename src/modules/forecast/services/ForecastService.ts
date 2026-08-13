import { forecastRepository } from "../repositories/ForecastRepository";
import { forecastEngine } from "../engines/ForecastEngine";
import { ForecastConfig, ForecastResult } from "../types";

export class ForecastService {
  async runForecast(config: ForecastConfig): Promise<ForecastResult> {
    await forecastRepository.ensureTables();
    return await forecastEngine.runForecast(config);
  }
}
export const forecastService = new ForecastService();
