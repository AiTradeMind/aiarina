import { describe, it, expect } from 'vitest';
import { EnterpriseGatewayService } from '../services/gateway.service';
import { EnterpriseGatewayValidator } from '../validators/gateway.validator';
import { EnterpriseGatewayEngine } from '../engines/gateway.engine';

describe('Phase 10B Enterprise API Gateway Unit & Integration Suite', () => {
  it('01. Route Registry & Route Discovery', async () => {
    const routes = EnterpriseGatewayService.getRoutes();
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
    const opRoute = routes.find(r => r.routeId === 'GW-RTE-101');
    expect(opRoute).toBeDefined();
    expect(opRoute?.targetModule).toBe('EP20_OPERATIONS_HUB');
  });

  it('02. Gateway Request Validation', () => {
    const validResult = EnterpriseGatewayValidator.validateVerifyRequest({
      path: '/api/v1/operations/summary',
      method: 'GET',
      version: 'v1'
    });
    expect(validResult.valid).toBe(true);
    expect(validResult.errors.length).toBe(0);

    const invalidResult = EnterpriseGatewayValidator.validateVerifyRequest({
      path: 123,
      method: 'INVALID_VERB'
    });
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  it('03. Gateway Health Check Engine', async () => {
    const health = await EnterpriseGatewayService.getGatewayHealth();
    expect(health).toBeDefined();
    expect(health.gatewayStatus).toBe('HEALTHY');
    expect(health.services.length).toBeGreaterThan(0);
  });

  it('04. Gateway Metrics', async () => {
    const metrics = await EnterpriseGatewayService.getMetrics();
    expect(metrics).toBeDefined();
  });

  it('05. API Version Management', () => {
    const versions = EnterpriseGatewayService.getVersions();
    expect(versions).toBeDefined();
    expect(Array.isArray(versions)).toBe(true);
    const v1 = versions.find(v => v.version === 'v1');
    expect(v1).toBeDefined();
    expect(v1?.compatibilityStatus).toBe('SUPPORTED');
  });

  it('06. Gateway Policies', async () => {
    const policies = await EnterpriseGatewayService.getPolicies();
    expect(policies).toBeDefined();
    expect(Array.isArray(policies)).toBe(true);
    expect(policies.length).toBeGreaterThan(0);
  });

  it('07. Request & Response Pipeline Dispatcher', async () => {
    const response = await EnterpriseGatewayEngine.executePipeline({
      path: '/api/v1/operations/status',
      method: 'GET',
      version: 'v1',
      consumerId: 'CONS-ALGO-01'
    });

    expect(response.statusCode).toBe(200);
    expect(response.success).toBe(true);
    expect(response.metadata.correlationId).toBeDefined();
    expect(response.metadata.requestId).toBeDefined();
    expect(response.metadata.targetModule).toBe('EP20_OPERATIONS_HUB');
    expect(response.metadata.executionTimeMs).toBeGreaterThanOrEqual(0);
  });
});
