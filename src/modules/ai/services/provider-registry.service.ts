import { AIProviderRepository, AIModelRepository } from "../repositories/index.ts";
import { RegisterProviderRequest, AIProvider, AIModel } from "../types/index.ts";

export class ProviderRegistryService {
  private providerRepo = new AIProviderRepository();
  private modelRepo = new AIModelRepository();

  async registerProvider(request: RegisterProviderRequest): Promise<AIProvider> {
    let provider = await this.providerRepo.findByName(request.name);
    
    if (!provider) {
      provider = await this.providerRepo.create({
        name: request.name,
        baseUrl: request.baseUrl || null,
        apiKey: request.apiKey || null,
        priority: request.priority || 1,
      });
    }

    if (request.models) {
      for (const modelData of request.models) {
        const existingModel = await this.modelRepo.findByName(modelData.modelName);
        if (!existingModel) {
          await this.modelRepo.create({
            providerId: provider.id,
            modelName: modelData.modelName,
            contextWindow: modelData.contextWindow || null,
            costPer1kPrompt: modelData.costPer1kPrompt || "0.00",
            costPer1kCompletion: modelData.costPer1kCompletion || "0.00",
          });
        }
      }
    }

    return provider;
  }

  async getProviders(): Promise<AIProvider[]> {
    return await this.providerRepo.findAll();
  }

  async getModels(): Promise<AIModel[]> {
    return await this.modelRepo.findAll();
  }

  async initializeDefaultProviders() {
    const defaultProviders = [
      {
        name: 'OpenAI',
        models: [
          { modelName: 'gpt-4o', contextWindow: 128000, costPer1kPrompt: '0.005', costPer1kCompletion: '0.015' },
          { modelName: 'gpt-4-turbo', contextWindow: 128000, costPer1kPrompt: '0.01', costPer1kCompletion: '0.03' },
          { modelName: 'gpt-3.5-turbo', contextWindow: 16385, costPer1kPrompt: '0.0005', costPer1kCompletion: '0.0015' }
        ]
      },
      {
        name: 'Anthropic',
        models: [
          { modelName: 'claude-3-5-sonnet-20240620', contextWindow: 200000, costPer1kPrompt: '0.003', costPer1kCompletion: '0.015' },
          { modelName: 'claude-3-opus-20240229', contextWindow: 200000, costPer1kPrompt: '0.015', costPer1kCompletion: '0.075' }
        ]
      },
      {
        name: 'Google',
        models: [
          { modelName: 'gemini-1.5-pro', contextWindow: 1000000, costPer1kPrompt: '0.0035', costPer1kCompletion: '0.0105' },
          { modelName: 'gemini-1.5-flash', contextWindow: 1000000, costPer1kPrompt: '0.00035', costPer1kCompletion: '0.00105' }
        ]
      },
      {
        name: 'OpenRouter',
        models: [
          { modelName: 'meta-llama/llama-3-8b-instruct', contextWindow: 8192, costPer1kPrompt: '0.00005', costPer1kCompletion: '0.0001' },
          { modelName: 'meta-llama/llama-3-70b-instruct', contextWindow: 8192, costPer1kPrompt: '0.0003', costPer1kCompletion: '0.0006' },
          { modelName: 'mistralai/mistral-7b-instruct', contextWindow: 32768, costPer1kPrompt: '0.00005', costPer1kCompletion: '0.0001' }
        ]
      },
      { name: 'DeepSeek', models: [{ modelName: 'deepseek-chat' }] },
      { name: 'Meta', models: [{ modelName: 'llama-3-70b' }, { modelName: 'llama-3-8b' }] },
      { name: 'xAI', models: [{ modelName: 'grok-1' }] },
      { name: 'Sarvam AI', models: [{ modelName: 'sarvam-1' }] },
      { name: 'Microsoft', models: [{ modelName: 'phi-3-mini' }] },
      { name: 'Amazon', models: [{ modelName: 'titan-text-express' }] },
      { name: 'NVIDIA', models: [{ modelName: 'nemotron-3-8b' }] },
      { name: 'Perplexity', models: [{ modelName: 'llama-3-sonar-large-32k-online' }] }
    ];

    for (const p of defaultProviders) {
      await this.registerProvider(p);
    }
  }
}
