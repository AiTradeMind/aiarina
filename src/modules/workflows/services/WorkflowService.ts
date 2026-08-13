import { workflowRepository } from "../repositories/WorkflowRepository.ts";
import { workflowValidator } from "./WorkflowValidator.ts";
import {
  IWorkflowTemplate,
  IWorkflowInstance,
  IWorkflowHistory,
  IWorkflowMetrics,
  CreateTemplatePayload,
  StartWorkflowPayload
} from "../types/index.ts";

export class WorkflowService {
  public async createTemplate(payload: CreateTemplatePayload): Promise<IWorkflowTemplate> {
    workflowValidator.validateTemplate(payload);
    return await workflowRepository.createTemplate(payload);
  }

  public async getTemplate(id: number): Promise<IWorkflowTemplate | null> {
    return await workflowRepository.getTemplate(id);
  }

  public async listTemplates(organizationId: string): Promise<IWorkflowTemplate[]> {
    return await workflowRepository.listTemplates(organizationId);
  }

  public async getInstance(id: number): Promise<IWorkflowInstance | null> {
    return await workflowRepository.getInstance(id);
  }

  public async listInstances(
    organizationId: string,
    workspaceId?: string
  ): Promise<IWorkflowInstance[]> {
    return await workflowRepository.listInstances(organizationId, workspaceId);
  }

  public async getHistory(instanceId: number): Promise<IWorkflowHistory[]> {
    return await workflowRepository.getHistory(instanceId);
  }

  public async listHistory(organizationId: string): Promise<any[]> {
    return await workflowRepository.listHistory(organizationId);
  }

  public async getMetrics(instanceId: number): Promise<IWorkflowMetrics | null> {
    return await workflowRepository.getMetrics(instanceId);
  }
}

export const workflowService = new WorkflowService();
