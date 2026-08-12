export class ComparisonEngine {
  async compare(a: any, b: any): Promise<any> {
    return { compared: true };
  }
}
export const comparisonEngine = new ComparisonEngine();
