/**
 * AI ARINA Enterprise V1.0 - Enterprise Testing Utilities & Fixtures
 * Standardized mock builders, factory functions, and test isolation helpers for Vitest.
 */

export interface MockRequestOptions {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, any>;
  params?: Record<string, string>;
  user?: any;
}

export function createMockRequest(options: MockRequestOptions = {}) {
  return {
    method: options.method || 'GET',
    url: options.url || '/api/test',
    headers: options.headers || { 'content-type': 'application/json' },
    body: options.body || {},
    query: options.query || {},
    params: options.params || {},
    user: options.user || { id: 'test-user-id', role: 'ADMIN', orgId: 'org-enterprise-01' },
    get: (headerName: string) => options.headers?.[headerName.toLowerCase()] || '',
  } as any;
}

export function createMockResponse() {
  const res: any = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader: (key: string, value: string) => {
      res.headers[key] = value;
      return res;
    },
    status: (code: number) => {
      res.statusCode = code;
      return res;
    },
    json: (data: any) => {
      res.body = data;
      return res;
    },
    send: (data: any) => {
      res.body = data;
      return res;
    },
    end: () => res,
  };
  return res;
}

export const EnterpriseTestFixtures = {
  user: {
    id: 'user-uuid-001',
    email: 'enterprise.admin@aiarina.com',
    role: 'ADMIN',
    orgId: 'org-enterprise-01',
    status: 'ACTIVE',
  },
  organization: {
    id: 'org-enterprise-01',
    name: 'AI ARINA Enterprise Global',
    tier: 'TIER_1_ENTERPRISE',
  },
  order: {
    id: 'ord-uuid-001',
    symbol: 'RELIANCE',
    quantity: 150,
    price: 2450.50,
    side: 'BUY',
    type: 'LIMIT',
    status: 'PENDING',
  },
  portfolio: {
    id: 'port-uuid-001',
    name: 'Primary Alpha Portfolio',
    cashBalance: 10000000.00,
    allocatedMargin: 3500000.00,
  },
  riskLimit: {
    id: 'risk-uuid-001',
    maxDrawdownPercent: 5.0,
    maxOrderValue: 5000000.00,
    status: 'ACTIVE',
  }
};
