// @ts-nocheck
import { RiskProfileRepository, RiskLimitRepository, RiskEventRepository } from "../repositories/index.ts";
import { PortfolioRepository, PositionRepository } from "../../trading/repositories/index.ts";
import { RiskValidationRequest, RiskValidationResult, RiskAction, RiskEvent } from "../types/index.ts";
import { EventBusService } from "../../events/services/index.ts";

import { RiskRegistryService } from "./risk-registry.service.ts";
import { RiskCalculatorService } from "./risk-calculator.service.ts";
import { ExposureEngineService } from "./exposure-engine.service.ts";
import { LimitEngineService } from "./limit-engine.service.ts";
import { MarginValidatorService } from "./margin-validator.service.ts";
import { RiskMetadataService } from "./risk-metadata.service.ts";
import { RiskLifecycleService } from "./risk-lifecycle.service.ts";
import { RiskHealthService } from "./risk-health.service.ts";
import { RiskPipelineService } from "../pipeline/risk-pipeline.service.ts";
import { EvaluateRiskRequestDto } from "../dtos/risk.dto.ts";

export * from "./risk-registry.service.ts";
export * from "./risk-calculator.service.ts";
export * from "./exposure-engine.service.ts";
export * from "./limit-engine.service.ts";
export * from "./margin-validator.service.ts";
export * from "./risk-metadata.service.ts";
export * from "./risk-lifecycle.service.ts";
export * from "./risk-health.service.ts";
export * from "../pipeline/risk-pipeline.service.ts";

export class RiskService {
  private profileRepo = new RiskProfileRepository();
  private limitRepo = new RiskLimitRepository();
  private eventRepo = new RiskEventRepository();
  private portfolioRepo = new PortfolioRepository();
  private positionRepo = new PositionRepository();
  private eventBus = EventBusService.getInstance();

  // Phase 2.9 Sub-services
  public registry = new RiskRegistryService();
  public calculator = new RiskCalculatorService();
  public exposure = new ExposureEngineService();
  public limitEngine = new LimitEngineService();
  public marginValidator = new MarginValidatorService();
  public metadata = new RiskMetadataService();
  public lifecycle = new RiskLifecycleService();
  public health = new RiskHealthService();
  public pipeline = new RiskPipelineService();

  // Legacy & Compatibility Methods
  async getRiskProfile(organizationId: string) {
    let profile = await this.profileRepo.findByOrganizationId(organizationId);
    if (!profile) {
      profile = await this.profileRepo.create({
        organizationId,
        name: "Default Profile",
        riskLevel: "MEDIUM",
      });
    }
    return profile;
  }

  async getRiskLimits(organizationId: string) {
    let limits = await this.limitRepo.findByOrganizationId(organizationId);
    if (!limits) {
      limits = await this.limitRepo.upsert({
        organizationId,
        maxOrderValue: "100000.00",
        maxPositionSize: "500000.00",
        maxDailyLoss: "5000.00",
        maxOpenPositions: 10,
        maxOrderQuantity: "1000.0000",
      });
    }
    return limits;
  }

  async updateRiskLimits(organizationId: string, data: any) {
    return await this.limitRepo.upsert({
      organizationId,
      ...data,
    });
  }

  async getRiskEvents(organizationId: string) {
    return await this.eventRepo.findByOrganizationId(organizationId);
  }

  async validateOrder(request: RiskValidationRequest): Promise<RiskValidationResult> {
    const { organizationId, userId, orderRequest } = request;
    const limits = await this.getRiskLimits(organizationId);
    const portfolio = await this.portfolioRepo.findByOrganizationId(organizationId);

    const events: Omit<RiskEvent, 'id' | 'timestamp'>[] = [];
    let overallAction: RiskAction = 'ALLOW';
    let overallMessage = "Risk validation passed";

    const orderValue = orderRequest.quantity * (orderRequest.price || 1);

    // 1. Max Order Value
    if (limits && orderValue > parseFloat(limits.maxOrderValue)) {
      overallAction = 'BLOCK';
      overallMessage = `Order value ${orderValue} exceeds limit ${limits.maxOrderValue}`;
      events.push({
        organizationId,
        userId,
        orderId: null,
        ruleName: "MAX_ORDER_VALUE",
        action: 'BLOCK',
        message: overallMessage,
        severity: 'CRITICAL',
      });
    }

    // 2. Max Order Quantity
    if (limits && orderRequest.quantity > parseFloat(limits.maxOrderQuantity)) {
      overallAction = 'BLOCK';
      overallMessage = `Order quantity ${orderRequest.quantity} exceeds limit ${limits.maxOrderQuantity}`;
      events.push({
        organizationId,
        userId,
        orderId: null,
        ruleName: "MAX_ORDER_QUANTITY",
        action: 'BLOCK',
        message: overallMessage,
        severity: 'CRITICAL',
      });
    }

    // 3. Max Open Positions (only for new positions)
    if (portfolio && limits) {
      const positions = await this.positionRepo.findByPortfolioId(portfolio.id, organizationId);
      const existingPosition = positions.find(p => p.ticker === orderRequest.ticker);

      if (!existingPosition && positions.length >= limits.maxOpenPositions && orderRequest.side === 'BUY') {
        overallAction = 'BLOCK';
        overallMessage = `Max open positions limit ${limits.maxOpenPositions} reached`;
        events.push({
          organizationId,
          userId,
          orderId: null,
          ruleName: "MAX_OPEN_POSITIONS",
          action: 'BLOCK',
          message: overallMessage,
          severity: 'CRITICAL',
        });
      }

      // 4. Max Position Size
      if (existingPosition && orderRequest.side === 'BUY') {
        const newSize = (parseFloat(existingPosition.quantity) + orderRequest.quantity) * (orderRequest.price || parseFloat(existingPosition.averagePrice));
        if (newSize > parseFloat(limits.maxPositionSize)) {
          overallAction = 'BLOCK';
          overallMessage = `Total position size ${newSize.toFixed(2)} would exceed limit ${limits.maxPositionSize}`;
          events.push({
            organizationId,
            userId,
            orderId: null,
            ruleName: "MAX_POSITION_SIZE",
            action: 'BLOCK',
            message: overallMessage,
            severity: 'CRITICAL',
          });
        }
      }
    }

    // Record events
    for (const event of events) {
      await this.eventRepo.create(event);

      if (event.action === 'BLOCK') {
        await this.eventBus.publish({
          eventType: 'RISK_VALIDATION_FAIL',
          source: 'RISK',
          organizationId: event.organizationId,
          userId: event.userId || undefined,
          payload: { ruleName: event.ruleName, message: event.message },
          notify: {
            title: "Risk Alert",
            message: event.message,
            type: 'ERROR'
          }
        });
      }
    }

    return {
      passed: overallAction !== 'BLOCK',
      action: overallAction,
      message: overallMessage,
      events,
    };
  }

  // Phase 2.9 Unified Operations
  async evaluateDecisionRisk(dto: EvaluateRiskRequestDto) {
    return await this.pipeline.executePipeline(dto);
  }
}
