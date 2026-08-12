export class MetricVersionManager {
  async trackVersion(metricName: string, versionData: any): Promise<void> {
    // Repository call to save version
  }
}
export const metricVersionManager = new MetricVersionManager();
