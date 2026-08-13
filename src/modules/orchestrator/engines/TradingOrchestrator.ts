import { tradingCoordinator } from "./TradingCoordinator.ts";
import { PipelineExecutionPayload } from "../types/index.ts";

export class TradingOrchestrator {
  public async run(payload: PipelineExecutionPayload): Promise<void> {
    await tradingCoordinator.dispatch(payload);
  }
}

export const tradingOrchestrator = new TradingOrchestrator();
