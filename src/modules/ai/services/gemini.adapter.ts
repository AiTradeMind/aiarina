import { GoogleGenAI } from "@google/genai";
import { AICompletionRequest, AICompletionResponse } from "../types/index.ts";
import { config } from "../../../infrastructure/config/env.ts";
import logger from "../../../lib/logger";
import { PerformanceTracker } from "../../../lib/performance.ts";
import { withRetry } from "../../../lib/retry.ts";

export class GeminiAdapter {
  private client: GoogleGenAI;

  constructor() {
    const apiKey = config.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn("GEMINI_API_KEY is not set. GeminiAdapter will not function correctly.");
    }
    
    this.client = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  async generate(request: AICompletionRequest, modelName: string): Promise<AICompletionResponse> {
    const targetModel = modelName || "gemini-3.5-flash";
    
    return withRetry(async () => {
      const tracker = new PerformanceTracker("AI_GENERATION", { provider: "Gemini", model: targetModel });

      try {
        logger.info({
          type: "AI_REQUEST",
          provider: "Gemini",
          model: targetModel,
          prompt: request.prompt.substring(0, 500) + (request.prompt.length > 500 ? "..." : "")
        }, `AI Request to Gemini [${targetModel}]`);

        const response = await this.client.models.generateContent({
          model: targetModel,
          contents: request.prompt,
        });

        const responseText = response.text || "";
        const duration = tracker.finish();

        logger.info({
          type: "AI_RESPONSE",
          provider: "Gemini",
          model: targetModel,
          durationMs: duration,
          response: responseText.substring(0, 500) + (responseText.length > 500 ? "..." : "")
        }, `AI Response from Gemini [${targetModel}] in ${duration}ms`);
        
        return {
          text: responseText,
          modelId: 0, // Will be filled by router
          providerName: "Gemini",
          usage: {
            promptTokens: 0, 
            completionTokens: 0,
            totalTokens: 0,
          }
        };
      } catch (error: any) {
        logger.error({
          type: "AI_FAILURE",
          provider: "Gemini",
          model: targetModel,
          error: error.message
        }, `AI Failure from Gemini [${targetModel}]: ${error.message}`);
        tracker.finish();
        throw error;
      }
    }, { context: `Gemini[${targetModel}]` });
  }
}
