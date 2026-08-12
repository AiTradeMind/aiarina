export type ProviderStatus = 'UP' | 'DOWN' | 'DEGRADED';
export type AIRequestStatus = 'SUCCESS' | 'ERROR';

export interface AIProvider {
  id: number;
  name: string;
  baseUrl: string | null;
  apiKey: string | null;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIModel {
  id: number;
  uuid: string; // UUID
  displayName: string;
  internalName: string;
  providerId: number | null;
  version: string;
  ownerId: number;
  description: string | null;
  purpose: string; // RESEARCH, DECISION, EXECUTION, etc.
  capabilities: string[]; // Module 2
  inputTypes: string[];
  outputTypes: string[];
  supportedMarkets: string[];
  supportedStrategies: string[];
  riskProfile: string; // CONSERVATIVE, AGGRESSIVE
  status: string; // DRAFT, TRAINING, etc.
  priority: number;
  metadata: any;
  dependencies: any;
  relationships: any;
  contextWindow: number | null;
  costPer1kPrompt: string;
  costPer1kCompletion: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIProviderHealth {
  id: number;
  providerId: number;
  status: ProviderStatus;
  latencyMs: number | null;
  lastCheck: string;
}

export interface AIUsage {
  id: number;
  organizationId: string | null;
  userId: number | null;
  modelId: number | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  timestamp: string;
}

export interface AICost {
  id: number;
  organizationId: string | null;
  amount: string;
  currency: string;
  periodStart: string;
  periodEnd: string;
}

export interface AIRequestLog {
  id: number;
  organizationId: string | null;
  userId: number | null;
  modelId: number | null;
  requestPayload: any;
  responsePayload: any;
  latencyMs: number | null;
  status: AIRequestStatus;
  createdAt: string;
}

export interface RegisterProviderRequest {
  name: string;
  baseUrl?: string;
  apiKey?: string;
  priority?: number;
  models?: {
    modelName: string;
    contextWindow?: number;
    costPer1kPrompt?: string;
    costPer1kCompletion?: string;
  }[];
}

export interface AICompletionRequest {
  organizationId: string;
  userId: number;
  prompt: string;
  intent?: string; // Added intent
  modelId?: number;
  modelName?: string;
  providerName?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AICompletionResponse {
  text: string;
  modelId: number;
  providerName: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export * from "../decision/types/index.ts";
export * from "../memory/types/index.ts";
export * from "../learning/types/index.ts";
export * from "./gateway.ts";
