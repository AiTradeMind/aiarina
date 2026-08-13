import { PerformanceRepository } from "../repositories";
import { AiTestSuite, AiTestCase, AiBenchmarkRun, AiEvaluation, AiMetrics, AiPerformanceReport } from "../types";
import { randomUUID } from "crypto";
import { getDeterministicRandom } from "../../../../lib/utils.ts";

export class PerformanceService {
  private repo = new PerformanceRepository();

  async getTestSuites(): Promise<AiTestSuite[]> {
    return await this.repo.getTestSuites();
  }

  async getTestCases(suiteId: string): Promise<AiTestCase[]> {
    return await this.repo.getTestCases(suiteId);
  }

  async getBenchmarkRuns(): Promise<AiBenchmarkRun[]> {
    return await this.repo.getBenchmarkRuns();
  }

  async getEvaluations(runId: string): Promise<AiEvaluation[]> {
    return await this.repo.getEvaluations(runId);
  }

  async getMetrics(modelId: string): Promise<AiMetrics[]> {
    return await this.repo.getMetrics(modelId);
  }

  async getReports(): Promise<AiPerformanceReport[]> {
    return await this.repo.getReports();
  }

  async runBenchmark(suiteId: string, modelIds: string[]): Promise<AiBenchmarkRun> {
    const run: AiBenchmarkRun = {
      id: randomUUID(),
      suiteId,
      startTime: new Date(),
      endTime: null,
      duration: null,
      modelsTested: modelIds,
      status: 'RUNNING',
      failures: 0,
      warnings: 0,
      createdAt: new Date()
    };
    
    await this.repo.createBenchmarkRun(run);
    
    // Simulate benchmark running in background
    setTimeout(() => {
      console.log(`Finished running benchmark ${suiteId} for models ${modelIds.join(', ')}`);
    }, 5000);

    return run;
  }

  async generateReport(modelId: string): Promise<AiPerformanceReport> {
    const report: AiPerformanceReport = {
      id: randomUUID(),
      modelId,
      runId: null,
      overallScore: 85 + getDeterministicRandom(modelId, 20) * 10,
      categoryScores: {
        'Reasoning': 80 + getDeterministicRandom(modelId, 21) * 15,
        'Trading': 85 + getDeterministicRandom(modelId, 22) * 10,
        'Research': 75 + getDeterministicRandom(modelId, 23) * 20
      },
      recommendations: ["Increase context window", "Finetune on financial data"],
      strengths: ["Fast response time", "High consensus accuracy"],
      weaknesses: ["Occasional hallucination on obscure tickers"],
      improvementSuggestions: ["Implement stricter validation for small cap stocks"],
      createdAt: new Date()
    };
    
    await this.repo.createReport(report);
    return report;
  }

  async seedInitialData(): Promise<void> {
    const suites = await this.repo.getTestSuites();
    if (suites.length > 0) return;

    const suiteId1 = randomUUID();
    const suiteId2 = randomUUID();

    await this.repo.createTestSuite({
      id: suiteId1,
      name: 'Advanced Trading Logic',
      version: '1.0.0',
      category: 'TRADING',
      description: 'Tests ability to form complex trading strategies based on multi-variate inputs.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.repo.createTestSuite({
      id: suiteId2,
      name: 'Financial Entity Extraction',
      version: '2.1.0',
      category: 'RESEARCH',
      description: 'Tests capability to extract precise metrics from SEC filings.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const runId = randomUUID();
    await this.repo.createBenchmarkRun({
      id: runId,
      suiteId: suiteId1,
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(),
      duration: 3600,
      modelsTested: ['gpt-4o', 'claude-3-5-sonnet'],
      status: 'COMPLETED',
      failures: 2,
      warnings: 5,
      createdAt: new Date()
    });

    await this.repo.createReport({
       id: randomUUID(),
       modelId: 'gpt-4o',
       runId,
       overallScore: 92.5,
       categoryScores: {
          'TRADING': 95,
          'RISK': 88,
          'REASONING': 94
       },
       recommendations: ["Deploy for primary strategy generation."],
       strengths: ["Consistently high alpha correlation", "Excellent logical deduction"],
       weaknesses: ["Slightly high token cost"],
       improvementSuggestions: ["Optimize prompts to reduce token usage"],
       createdAt: new Date()
    });
  }
}
