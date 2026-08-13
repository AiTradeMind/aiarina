import { tradingPipeline } from "./TradingPipeline.ts";
import { PipelineExecutionPayload } from "../types/index.ts";

export class TradingCoordinator {
  public async dispatch(payload: PipelineExecutionPayload): Promise<void> {
    // This could handle concurrency limits, queuing, etc.
    await tradingPipeline.executeFlow(payload);
  }
}

export const tradingCoordinator = new TradingCoordinator();
