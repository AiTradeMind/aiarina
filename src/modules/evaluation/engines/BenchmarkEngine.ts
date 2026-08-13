import { EvaluationResult } from "../types";

export class BenchmarkEngine {
  async compare(result: EvaluationResult): Promise<any> {
    return { benchmarked: true };
  }
}
export const benchmarkEngine = new BenchmarkEngine();
