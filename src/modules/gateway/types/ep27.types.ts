export type AuthType = 'JWT' | 'API_KEY' | 'BEARER_TOKEN' | 'INTERNAL_SERVICE_TOKEN' | 'OAUTH2';
export type RouteStatus = 'ACTIVE' | 'DEPRECATED' | 'MAINTENANCE' | 'DISABLED';
export type WebhookStatus = 'DELIVERED' | 'FAILED' | 'PENDING' | 'RETRYING';

export interface GatewayRouteItem {
  routeId: string;
  path: string;
  targetModule: string;
  targetEndpoint: string;
  version: 'v1' | 'v2';
  authRequired: boolean;
  allowedMethods: string[];
  rateLimitPerMin: number;
  status: RouteStatus;
  createdAt: string;
}

export interface GatewayVersionItem {
  versionId: string;
  version: 'v1' | 'v2';
  releaseDate: string;
  deprecationDate?: string;
  activeRoutesCount: number;
  compatibilityStatus: 'CURRENT' | 'SUPPORTED' | 'DEPRECATED';
}

export interface GatewayApiKeyItem {
  keyId: string;
  keyPrefix: string;
  ownerName: string;
  organization: string;
  assignedRole: string;
  rateLimitTier: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  issuedAt: string;
  lastUsedAt?: string;
}

export interface GatewayRateLimitRule {
  ruleId: string;
  scope: 'GLOBAL' | 'PER_USER' | 'PER_API_KEY' | 'PER_ORGANIZATION';
  requestsPerMinute: number;
  burstCapacity: number;
  currentUsagePercent: number;
  status: 'ENFORCED' | 'MONITORING';
}

export interface WebhookEndpointItem {
  webhookId: string;
  name: string;
  direction: 'INCOMING' | 'OUTGOING';
  targetUrl: string;
  eventSubscriptions: string[];
  signatureVerified: boolean;
  deliverySuccessRate: number;
  status: WebhookStatus;
  lastTriggeredAt?: string;
}

export interface ExternalConnectorItem {
  connectorId: string;
  connectorName: string;
  category: 'LLM_PROVIDER' | 'MARKET_DATA' | 'BROKER' | 'PAYMENT' | 'INTERNAL_SERVICE';
  endpointUrl: string;
  authMethod: AuthType;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  avgLatencyMs: number;
}

export interface GatewayAnalyticsOverview {
  totalRequestsToday: number;
  avgLatencyMs: number;
  success2xxCount: number;
  client4xxCount: number;
  server5xxCount: number;
  activeRoutesCount: number;
  registeredConnectorsCount: number;
  rateLimitBlocksCount: number;
  gatewayHealthScore: number;
}

export interface GatewayAuditItem {
  auditId: string;
  eventType: 'AUTH_SUCCESS' | 'AUTH_FAILED' | 'AUTHORIZATION_DENIED' | 'RATE_LIMIT_EXCEEDED' | 'ROUTE_DISPATCH' | 'WEBHOOK_DELIVERED' | 'POLICY_CHANGE';
  clientIp: string;
  operatorOrApiKey: string;
  details: string;
  timestamp: string;
}

export interface GatewayQaReport {
  totalModulesTested: number;
  passCount: number;
  failCount: number;
  modules: Array<{
    moduleId: string;
    moduleName: string;
    status: 'PASSED' | 'FAILED';
    details: string;
  }>;
  readOnlyIntegrationConfirmed: boolean;
  nonExecutionConfirmed: boolean;
  buildStatus: string;
}
