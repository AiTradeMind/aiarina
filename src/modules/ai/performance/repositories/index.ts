import { getDb } from "../../../../db/client";
import { 
  aiTestSuites, aiTestCases, aiBenchmarkRuns, aiEvaluations, aiMetrics, aiPerformanceReports 
} from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { 
  AiTestSuite, AiTestCase, AiBenchmarkRun, AiEvaluation, AiMetrics, AiPerformanceReport 
} from "../types";

export class PerformanceRepository {
  async getTestSuites(): Promise<AiTestSuite[]> {
    const db = await getDb();
    return await db.select().from(aiTestSuites) as AiTestSuite[];
  }

  async getTestCases(suiteId: string): Promise<AiTestCase[]> {
    const db = await getDb();
    return await db.select().from(aiTestCases).where(eq(aiTestCases.suiteId, suiteId)) as AiTestCase[];
  }

  async getBenchmarkRuns(): Promise<AiBenchmarkRun[]> {
    const db = await getDb();
    return await db.select().from(aiBenchmarkRuns).orderBy(desc(aiBenchmarkRuns.createdAt)) as AiBenchmarkRun[];
  }

  async getEvaluations(runId: string): Promise<AiEvaluation[]> {
    const db = await getDb();
    return await db.select().from(aiEvaluations).where(eq(aiEvaluations.runId, runId)).orderBy(desc(aiEvaluations.timestamp)) as AiEvaluation[];
  }

  async getMetrics(modelId: string): Promise<AiMetrics[]> {
    const db = await getDb();
    return await db.select().from(aiMetrics).where(eq(aiMetrics.modelId, modelId)).orderBy(desc(aiMetrics.timestamp)) as AiMetrics[];
  }

  async getReports(): Promise<AiPerformanceReport[]> {
    const db = await getDb();
    return await db.select().from(aiPerformanceReports).orderBy(desc(aiPerformanceReports.createdAt)) as AiPerformanceReport[];
  }

  async createTestSuite(suite: AiTestSuite): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiTestSuites).values(suite);
  }

  async createTestCase(testCase: AiTestCase): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiTestCases).values(testCase);
  }

  async createBenchmarkRun(run: AiBenchmarkRun): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiBenchmarkRuns).values(run);
  }

  async createEvaluation(evaluation: AiEvaluation): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiEvaluations).values(evaluation);
  }

  async createMetrics(metrics: AiMetrics): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiMetrics).values(metrics);
  }

  async createReport(report: AiPerformanceReport): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiPerformanceReports).values(report);
  }
}
