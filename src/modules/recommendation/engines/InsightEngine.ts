export class InsightEngine {
  async generate(entityId: string): Promise<any> {
    return { entityId, insight: "Insight placeholder" };
  }
}
export const insightEngine = new InsightEngine();
