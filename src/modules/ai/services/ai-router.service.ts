import { AIProviderRepository, AIModelRepository, AIUsageRepository, AIHealthRepository, AIRequestLogRepository } from "../repositories/index.ts";
import { AICompletionRequest, AICompletionResponse, AIModel, AIProvider } from "../types/index.ts";
import { EventBusService } from "../../events/services/index.ts";
import { GeminiAdapter } from "./gemini.adapter.ts";
import { OpenRouterAdapter } from "./openrouter.adapter.ts";
import logger from "../../../lib/logger";

export class AIRouterService {
  private providerRepo = new AIProviderRepository();
  private modelRepo = new AIModelRepository();
  private usageRepo = new AIUsageRepository();
  private healthRepo = new AIHealthRepository();
  private logRepo = new AIRequestLogRepository();
  private eventBus = EventBusService.getInstance();
  private geminiAdapter = new GeminiAdapter();
  private openRouterAdapter = new OpenRouterAdapter();

  private providerCache: AIProvider[] | null = null;
  private modelCache: Record<string, AIModel[]> = {};
  private cacheTTL = 60000; // 1 minute
  private lastCacheUpdate = 0;

  private redactPrompt(p: string): string {
    // Simple redaction for common secret patterns (keys, passwords)
    return p.replace(/(sk-|AIza)[a-zA-Z0-9_-]{20,}/g, '[REDACTED_KEY]');
  }

  async route(request: AICompletionRequest): Promise<AICompletionResponse> {
    const startTime = Date.now();
    
    // 1. Select Model and Provider
    const { model, provider } = await this.selectProvider(request);
    
    try {
      let response: AICompletionResponse;

      // 2. Call Provider Adapter
      const providerNameLower = provider.name.toLowerCase();
      if (providerNameLower === 'gemini' || providerNameLower === 'google') {
        response = await this.geminiAdapter.generate(request, model.internalName);
      } else if (providerNameLower === 'openrouter') {
        response = await this.openRouterAdapter.generate(request, model.internalName);
      } else {
        throw new Error(`Unsupported AI provider: ${provider.name}`);
      }
      
      response.modelId = model.id;
      const latency = Date.now() - startTime;

      // 3. Track Usage
      await this.usageRepo.create({
        organizationId: request.organizationId,
        userId: request.userId,
        modelId: model.id,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
      });

      // 4. Log Request
      await this.logRepo.create({
        organizationId: request.organizationId,
        userId: request.userId,
        modelId: model.id,
        requestPayload: { ...request, prompt: this.redactPrompt(request.prompt) },
        responsePayload: { text: response.text, usage: response.usage },
        latencyMs: latency,
        status: 'SUCCESS',
      });

      // 5. Update Health
      await this.healthRepo.updateStatus(provider.id, 'UP', latency);

      // 6. Publish Event
      await this.eventBus.publish({
        eventType: 'AI_RESPONSE_GENERATED',
        source: 'AI_ROUTER',
        organizationId: request.organizationId,
        userId: request.userId,
        payload: { model: model.internalName, provider: provider.name, usage: response.usage },
      });

      return response;

    } catch (error: any) {
      const latency = Date.now() - startTime;
      
      await this.logRepo.create({
        organizationId: request.organizationId,
        userId: request.userId,
        modelId: model.id,
        requestPayload: { ...request, prompt: this.redactPrompt(request.prompt) },
        responsePayload: { error: error.message },
        latencyMs: latency,
        status: 'ERROR',
      });

      await this.healthRepo.updateStatus(provider.id, 'DOWN');
      
      throw error;
    }
  }

  private async selectProvider(request: AICompletionRequest): Promise<{ model: AIModel, provider: AIProvider }> {
    const now = Date.now();
    if (!this.providerCache || now - this.lastCacheUpdate > this.cacheTTL) {
      this.providerCache = await this.providerRepo.findAll();
      this.modelCache = {};
      this.lastCacheUpdate = now;
    }

    if (request.modelId) {
      const model = await this.modelRepo.findById(request.modelId);
      if (!model) throw new Error(`Model ID ${request.modelId} not found`);
      
      const provider = this.providerCache.find(p => p.id === model.providerId);
      if (!provider) throw new Error(`Provider for model ID ${request.modelId} not found`);
      
      return { model, provider };
    }

    if (request.modelName) {
      const model = await this.modelRepo.findByName(request.modelName);
      if (!model) throw new Error(`Model ${request.modelName} not found`);
      
      const provider = this.providerCache.find(p => p.id === model.providerId);
      if (!provider) throw new Error(`Provider for model ${request.modelName} not found`);
      
      return { model, provider };
    }

    // Default routing logic: Get highest priority active provider
    const activeProvider = this.providerCache.find(p => p.isActive);
    if (!activeProvider) throw new Error("No active AI providers found");

    if (!this.modelCache[activeProvider.id]) {
      this.modelCache[activeProvider.id] = await this.modelRepo.findByProvider(activeProvider.id);
    }
    const model = this.modelCache[activeProvider.id][0];
    if (!model) throw new Error(`No models found for provider ${activeProvider.name}`);

    return { model, provider: activeProvider };
  }
}
