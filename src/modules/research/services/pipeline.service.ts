import { getDb } from "../../../db/client.ts";
import { researchPipelineRuns } from "../../../db/schema.ts";
import { PIPELINE_STAGES, PipelineStageValue } from "../constants/index.ts";
import { PipelineRunRecord, PipelineStageHistory } from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class EnterpriseResearchPipeline {
  private static memoryPipelineRuns: Map<string, PipelineRunRecord> = new Map();

  public async createPipelineRun(researchId: string): Promise<PipelineRunRecord> {
    const runId = `RUN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const initialHistory: PipelineStageHistory[] = [
      {
        stage: PIPELINE_STAGES.INGEST,
        timestamp: new Date().toISOString(),
        status: "IN_PROGRESS",
        details: "Pipeline initiated for research item",
      },
    ];

    const runRecord: PipelineRunRecord = {
      runId,
      researchId,
      currentStage: PIPELINE_STAGES.INGEST,
      executionTimeMs: 0,
      retryCount: 0,
      stageHistory: initialHistory,
      createdAt: new Date(),
    };

    EnterpriseResearchPipeline.memoryPipelineRuns.set(runId, runRecord);

    try {
      const db = getDb();
      await db.insert(researchPipelineRuns).values({
        runId: runRecord.runId,
        researchId: runRecord.researchId,
        currentStage: runRecord.currentStage,
        executionTimeMs: runRecord.executionTimeMs,
        retryCount: runRecord.retryCount,
        stageHistory: runRecord.stageHistory as any,
      });
    } catch (err: any) {
      logger.warn({ type: "PIPELINE_DB_WARN", error: err.message }, "Pipeline run DB save failed, fallback to memory");
    }

    return runRecord;
  }

  public async advanceStage(
    runId: string,
    nextStage: PipelineStageValue,
    durationMs: number = 50,
    details?: string
  ): Promise<PipelineRunRecord> {
    const record = EnterpriseResearchPipeline.memoryPipelineRuns.get(runId);
    if (!record) {
      throw new Error(`Pipeline run ${runId} not found`);
    }

    // Mark current stage success
    const lastStageObj = record.stageHistory[record.stageHistory.length - 1];
    if (lastStageObj && lastStageObj.status === "IN_PROGRESS") {
      lastStageObj.status = "SUCCESS";
      lastStageObj.durationMs = durationMs;
    }

    record.currentStage = nextStage;
    record.executionTimeMs += durationMs;

    record.stageHistory.push({
      stage: nextStage,
      timestamp: new Date().toISOString(),
      status: nextStage === PIPELINE_STAGES.READY ? "SUCCESS" : "IN_PROGRESS",
      details: details || `Advanced to stage ${nextStage}`,
    });

    EnterpriseResearchPipeline.memoryPipelineRuns.set(runId, record);
    return record;
  }

  public async runFullPipeline(
    researchId: string,
    processorFn?: (stage: PipelineStageValue) => Promise<void>
  ): Promise<PipelineRunRecord> {
    const run = await this.createPipelineRun(researchId);
    const stages: PipelineStageValue[] = [
      PIPELINE_STAGES.INGEST,
      PIPELINE_STAGES.NORMALIZE,
      PIPELINE_STAGES.CLEAN,
      PIPELINE_STAGES.EXTRACT,
      PIPELINE_STAGES.CLASSIFY,
      PIPELINE_STAGES.VERIFY,
      PIPELINE_STAGES.INDEX,
      PIPELINE_STAGES.READY,
    ];

    const startTime = Date.now();

    for (let i = 1; i < stages.length; i++) {
      const stage = stages[i];
      const stageStart = Date.now();

      if (processorFn) {
        try {
          await processorFn(stage);
        } catch (err: any) {
          run.failureReason = err.message;
          run.retryCount += 1;
          const currentStageObj = run.stageHistory[run.stageHistory.length - 1];
          if (currentStageObj) {
            currentStageObj.status = "FAILED";
            currentStageObj.details = err.message;
          }
          throw err;
        }
      }

      const durationMs = Date.now() - stageStart + 10;
      await this.advanceStage(run.runId, stage, durationMs, `Successfully completed stage ${stage}`);
    }

    run.executionTimeMs = Date.now() - startTime;
    return run;
  }
}
