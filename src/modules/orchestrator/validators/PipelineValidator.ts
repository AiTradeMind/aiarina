import { PipelineExecutionPayload } from "../types/index.ts";

export class PipelineValidator {
  public validate(payload: PipelineExecutionPayload) {
     if (!payload.organizationId || !payload.portfolioId || !payload.symbol || !payload.side || !payload.quantity || !payload.price) {
        throw new Error("Missing required payload fields for pipeline execution.");
     }
  }
}

export const pipelineValidator = new PipelineValidator();
