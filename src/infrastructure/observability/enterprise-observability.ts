/**
 * AI ARINA Enterprise V1.0 - Enterprise Observability & Monitoring Foundation
 * Centralized monitoring registry, health evaluation pipeline, and enterprise metrics aggregation.
 */

import { HealthService, SystemHealthReport } from '../health';
import { MetricsService } from '../metrics';
import logger from '../../lib/logger';

export enum ObservabilityComponentCategory {
  DATABASE = 'DATABASE',
  API = 'API',
  AI = 'AI',
  TRADING = 'TRADING',
  SCHEDULER = 'SCHEDULER',
  WORKER = 'WORKER',
  QUEUE = 'QUEUE',
  WEBSOCKET = 'WEBSOCKET',
  SECURITY = 'SECURITY',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
}

export interface ObservabilityCheckResult {
  componentId: string;
  category: ObservabilityComponentCategory;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  latencyMs?: number;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface EnterpriseObservabilityReport {
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: string;
  uptimeSeconds: number;
  totalComponentsChecked: number;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  healthScore: number;
  systemMetrics: Record<string, number>;
  componentResults: ObservabilityCheckResult[];
}

export class EnterpriseObservabilityRegistry {
  private healthService: HealthService;
  private metricsService: MetricsService;

  constructor() {
    this.healthService = new HealthService();
    this.metricsService = MetricsService.getInstance();
  }

  public async evaluateSystemObservability(): Promise<EnterpriseObservabilityReport> {
    const timestamp = new Date().toISOString();
    const uptimeSeconds = Math.floor(process.uptime());
    const healthReport: SystemHealthReport = await this.healthService.check();
    const metrics = this.metricsService.getAll();

    const componentResults: ObservabilityCheckResult[] = [];

    // Map health report subsystems to observability results
    const subsystems = healthReport.subsystems;
    
    componentResults.push({
      componentId: 'subsystem-database',
      category: ObservabilityComponentCategory.DATABASE,
      status: subsystems.database.status === 'UP' ? 'HEALTHY' : subsystems.database.status === 'DEGRADED' ? 'DEGRADED' : 'UNHEALTHY',
      latencyMs: subsystems.database.latencyMs,
      message: subsystems.database.error || 'Database connection healthy',
      timestamp,
      metadata: subsystems.database.details,
    });

    componentResults.push({
      componentId: 'subsystem-ai-gateway',
      category: ObservabilityComponentCategory.AI,
      status: subsystems.aiGateway.status === 'UP' ? 'HEALTHY' : subsystems.aiGateway.status === 'DEGRADED' ? 'DEGRADED' : 'UNHEALTHY',
      message: 'AI Gateway routing & fallback verified',
      timestamp,
      metadata: subsystems.aiGateway.details,
    });

    componentResults.push({
      componentId: 'subsystem-queue',
      category: ObservabilityComponentCategory.QUEUE,
      status: subsystems.queue.status === 'UP' ? 'HEALTHY' : subsystems.queue.status === 'DEGRADED' ? 'DEGRADED' : 'UNHEALTHY',
      message: 'Queue and DLQ monitoring active',
      timestamp,
      metadata: subsystems.queue.details,
    });

    componentResults.push({
      componentId: 'subsystem-providers',
      category: ObservabilityComponentCategory.INFRASTRUCTURE,
      status: subsystems.providers.status === 'UP' ? 'HEALTHY' : subsystems.providers.status === 'DEGRADED' ? 'DEGRADED' : 'UNHEALTHY',
      message: 'Broker & LLM provider factories operational',
      timestamp,
      metadata: subsystems.providers.details,
    });

    componentResults.push({
      componentId: 'subsystem-market-session',
      category: ObservabilityComponentCategory.TRADING,
      status: subsystems.marketSession.status === 'UP' ? 'HEALTHY' : 'DEGRADED',
      message: 'Market session engine active',
      timestamp,
      metadata: subsystems.marketSession.details,
    });

    componentResults.push({
      componentId: 'subsystem-system-memory',
      category: ObservabilityComponentCategory.INFRASTRUCTURE,
      status: subsystems.systemMemory.status === 'UP' ? 'HEALTHY' : 'DEGRADED',
      message: 'System memory utilization within bounds',
      timestamp,
      metadata: subsystems.systemMemory.details,
    });

    const totalComponentsChecked = componentResults.length;
    const healthyCount = componentResults.filter(c => c.status === 'HEALTHY').length;
    const degradedCount = componentResults.filter(c => c.status === 'DEGRADED').length;
    const unhealthyCount = componentResults.filter(c => c.status === 'UNHEALTHY').length;

    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' = 'HEALTHY';
    if (unhealthyCount > 0) {
      overallStatus = 'UNHEALTHY';
    } else if (degradedCount > 0) {
      overallStatus = 'DEGRADED';
    }

    const healthScore = totalComponentsChecked > 0 ? Number(((healthyCount / totalComponentsChecked) * 100).toFixed(2)) : 100.0;

    logger.info({ overallStatus, healthScore, healthyCount, degradedCount, unhealthyCount }, 'Enterprise Observability evaluation completed');

    return {
      overallStatus,
      timestamp,
      uptimeSeconds,
      totalComponentsChecked,
      healthyCount,
      degradedCount,
      unhealthyCount,
      healthScore,
      systemMetrics: metrics,
      componentResults,
    };
  }
}

export const enterpriseObservabilityRegistry = new EnterpriseObservabilityRegistry();
