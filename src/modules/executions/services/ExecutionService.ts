import { executionEngine } from "./ExecutionEngine.ts";
import { executionRepository } from "../repositories/ExecutionRepository.ts";
import { RunExecutionPayload, IExecution, IExecutionHistory } from "../types/index.ts";

export class ExecutionService {
  public async runExecution(actorId: number, payload: RunExecutionPayload): Promise<IExecution> {
    return await executionEngine.executeOrder(actorId, payload);
  }

  public async getExecutions(organizationId: string): Promise<IExecution[]> {
    return await executionRepository.getExecutions(organizationId);
  }

  public async getExecutionById(id: string, organizationId: string): Promise<IExecution | null> {
    return await executionRepository.getExecutionById(id, organizationId);
  }

  public async getExecutionHistory(executionId: string): Promise<IExecutionHistory[]> {
    return await executionRepository.getHistory(executionId);
  }
}

export const executionService = new ExecutionService();
