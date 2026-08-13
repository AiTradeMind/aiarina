import { AICompletionRequest, AICompletionResponse } from "../types/index.ts";
import { config } from "../../../infrastructure/config/env.ts";
import logger from "../../../lib/logger";
import { PerformanceTracker } from "../../../lib/performance.ts";
import { withRetry } from "../../../lib/retry.ts";

export class OpenRouterAdapter {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = config.OPENROUTER_API_KEY;
    this.baseUrl = config.OPENROUTER_BASE_URL;
    this.defaultModel = config.OPENROUTER_DEFAULT_MODEL;
    
    if (!this.apiKey) {
      logger.warn("OPENROUTER_API_KEY is not set. OpenRouterAdapter will not function correctly.");
    }
  }

  async generate(request: AICompletionRequest, modelName?: string): Promise<AICompletionResponse> {
    const targetModel = modelName || this.defaultModel;
    
    return withRetry(async () => {
      const tracker = new PerformanceTracker("AI_GENERATION", { provider: "OpenRouter", model: targetModel });

      try {
        logger.info({
          type: "AI_REQUEST",
          provider: "OpenRouter",
          model: targetModel,
          prompt: request.prompt.substring(0, 500) + (request.prompt.length > 500 ? "..." : "")
        }, `AI Request to OpenRouter [${targetModel}]`);

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
            "HTTP-Referer": config.APP_URL,
            "X-Title": "AI ARINA",
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [{ role: "user", content: request.prompt }],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          const error = new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
          (error as any).status = response.status;
          throw error;
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content || "";
        const duration = tracker.finish();

        logger.info({
          type: "AI_RESPONSE",
          provider: "OpenRouter",
          model: targetModel,
          usage: data.usage,
          durationMs: duration,
          response: responseText.substring(0, 500) + (responseText.length > 500 ? "..." : "")
        }, `AI Response from OpenRouter [${targetModel}] in ${duration}ms`);
        
        return {
          text: responseText,
          modelId: 0, // Will be filled by router
          providerName: "OpenRouter",
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0,
          }
        };
      } catch (error: any) {
        logger.error({
          type: "AI_FAILURE",
          provider: "OpenRouter",
          model: targetModel,
          error: error.message
        }, `AI Failure from OpenRouter [${targetModel}]: ${error.message}`);
        tracker.finish(); // Ensure tracker finishes even on error
        throw error;
      }
    }, { context: `OpenRouter[${targetModel}]` });
  }
}
