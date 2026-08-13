import { AIRouterService } from "./ai-router.service.ts";
import { ProviderRegistryService } from "./provider-registry.service.ts";
import { AIHealthRepository, AIUsageRepository, AICostRepository } from "../repositories/index.ts";
import { AICompletionRequest, AICompletionResponse } from "../types/index.ts";

export class AIEngineService {
  private router = new AIRouterService();
  private registry = new ProviderRegistryService();
  private healthRepo = new AIHealthRepository();
  private usageRepo = new AIUsageRepository();
  private costRepo = new AICostRepository();

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    return await this.router.route(request);
  }

  async getProviders() {
    return await this.registry.getProviders();
  }

  async getModels() {
    return await this.registry.getModels();
  }

  async getHealth() {
    return await this.healthRepo.findAll();
  }

  async getUsage(organizationId: string) {
    return await this.usageRepo.getOrgUsage(organizationId);
  }

  async getCost(organizationId: string) {
    return await this.costRepo.findAll(organizationId);
  }

  async registerProvider(data: any) {
    return await this.registry.registerProvider(data);
  }

  async initialize() {
    await this.registry.initializeDefaultProviders();
  }
}
