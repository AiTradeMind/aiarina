import { intelligenceEngine } from "../engines/IntelligenceEngine";
import { getDb } from "../../../db/client.ts";
import { aiEvaluations, aiModelActivationLogs } from "../../../db/schema.ts";

export class IntelligenceService {
  async runIntelligence(data: any): Promise<any> {
    return await intelligenceEngine.processIntelligence(data);
  }

  async resetIntelligenceData({ confirm, resetState }: { confirm: boolean; resetState: string }) {
    if (!confirm || resetState !== "ON") {
      throw new Error("Reset confirmation required. resetState must be ON.");
    }

    const db = getDb();
    let recordsCleared = 0;

    if (db) {
      try {
        const delEvals = await db.delete(aiEvaluations).returning();
        recordsCleared += delEvals.length;
      } catch (e) {
        // ignore
      }

      try {
        const delLogs = await db.delete(aiModelActivationLogs).returning();
        recordsCleared += delLogs.length;
      } catch (e) {
        // ignore
      }
    }

    const resetRunId = `RST-AIINT-${Date.now()}`;
    return {
      module: "AI_INTELLIGENCE",
      resetRunId,
      status: "COMPLETED",
      recordsCleared: recordsCleared || 0,
      timestamp: new Date().toISOString()
    };
  }
}

export const intelligenceService = new IntelligenceService();
