import { ForecastConfig, ForecastResult } from "../types";
import { predictionEngine } from "./PredictionEngine";
import { confidenceEngine } from "./ConfidenceEngine";
import { v4 as uuidv4 } from "uuid";

export class ForecastEngine {
  async runForecast(config: ForecastConfig): Promise<ForecastResult> {
    const prediction = predictionEngine.predict(config.params);
    const confidence = confidenceEngine.calculate(config.params);
    return {
      id: uuidv4(),
      entityId: config.entityId,
      prediction,
      confidence,
      createdAt: new Date(),
    };
  }
}
export const forecastEngine = new ForecastEngine();
