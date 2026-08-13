export type ProviderStatus = 'UP' | 'DOWN' | 'DEGRADED';
export type SecurityVerdict = 'PASSED' | 'REDACTED' | 'BLOCKED';

export interface ProviderConfig {
  id: number;
  name: string;
  baseUrl: string | null;
  apiKey: string | null;
  isActive: boolean;
  priority: number;
  capabilities: string[];
  version: string;
  region: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ModelMetadata {
  id: number;
  providerId: number;
  internalName: string;
  displayName: string;
  contextWindow: number;
  costPer1kPrompt: number;
  costPer1kCompletion: number;
  capabilities: string[];
  isActive: boolean;
  priority: number;
}

export interface GatewayRequest {
  prompt: string;
  systemPrompt?: string;
  context?: string;
  attachments?: string[]; // list of URLs, b64 payloads, or descriptive tags
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  responseFormat?: 'TEXT' | 'JSON' | 'STRUCTURED';
  structuredSchema?: any; // JSON Schema for structured outputs
  streaming?: boolean;
  modelName?: string; // specific model requested
  providerName?: string; // specific provider requested
  intent?: 'RESEARCH' | 'DECISION' | 'EXECUTION' | 'STRATEGY' | 'GENERAL';
  optimizationPolicy?: 'SPEED' | 'COST' | 'QUALITY' | 'REASONING' | 'BALANCED';
}

export interface GatewayResponse {
  text: string;
  modelUsed: string;
  providerUsed: string;
  latencyMs: number;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  estimatedCostUsd: number;
  securityVerdict: SecurityVerdict;
  auditHash: string;
}

export interface AICircuitBreakerState {
  providerName: string;
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

export interface RateLimitState {
  requestsThisMinute: number;
  requestsToday: number;
  tokensThisMinute: number;
  activeConcurrency: number;
  lastResetTime: number;
}

export interface GatewayMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalCostUsd: number;
  averageLatencyMs: number;
  failoverEventsCount: number;
  circuitBreakerTripsCount: number;
  metricsByProvider: Record<string, {
    totalRequests: number;
    failedRequests: number;
    averageLatencyMs: number;
    tokensUsed: number;
    costUsd: number;
  }>;
  metricsByModel: Record<string, {
    totalRequests: number;
    averageLatencyMs: number;
    tokensUsed: number;
    costUsd: number;
  }>;
}

export interface ProviderHealthRecord {
  providerId: number;
  providerName: string;
  status: ProviderStatus;
  latencyMs: number | null;
  lastCheck: string;
  circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failuresCount: number;
}
