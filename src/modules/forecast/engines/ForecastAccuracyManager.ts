export class ForecastAccuracyManager {
  async trackAccuracy(forecastId: string, accuracyData: any): Promise<void> {
    // Repository call to save accuracy
  }
}
export const forecastAccuracyManager = new ForecastAccuracyManager();
