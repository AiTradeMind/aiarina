// @ts-nocheck
import { RiskFoundationRepository } from "../repositories/risk-foundation.repository.ts";
import { RiskEngineProfile, RiskEngineLimits } from "../types/index.ts";
import { CreateRiskProfileDto, UpdateRiskProfileDto, UpdateRiskLimitsDto } from "../dtos/risk.dto.ts";
import { RiskValidator } from "../validators/risk.validator.ts";

export class RiskRegistryService {
  constructor(private repo: RiskFoundationRepository = new RiskFoundationRepository()) {}

  async getProfile(profileId: string): Promise<RiskEngineProfile | null> {
    return await this.repo.findProfileById(profileId);
  }

  async getOrCreateDefaultProfile(targetId?: string): Promise<RiskEngineProfile> {
    if (targetId) {
      const existing = await this.repo.findProfileByTargetId(targetId);
      if (existing) return existing;
    }

    const defaultProfileId = `risk-prof-${targetId || 'default'}`;
    const existingDefault = await this.repo.findProfileById(defaultProfileId);
    if (existingDefault) return existingDefault;

    const newProfile: RiskEngineProfile = {
      profileId: defaultProfileId,
      name: `Risk Profile for ${targetId || 'Default'}`,
      riskLevel: 'MEDIUM',
      targetId: targetId || 'default',
      status: 'ACTIVE',
    };

    const created = await this.repo.createProfile(newProfile);

    // Initialize default limits
    await this.repo.saveLimits({
      profileId: created.profileId,
      maxPositionSize: 100000.0,
      maxDailyLoss: 5000.0,
      maxCapitalUtilization: 80.0,
      maxConcentrationRatio: 25.0,
      maxDrawdown: 15.0,
      minLiquidityScore: 60.0,
      requiredMarginRatio: 10.0,
    });

    return created;
  }

  async createProfile(dto: CreateRiskProfileDto): Promise<RiskEngineProfile> {
    const validation = RiskValidator.validateCreateProfile(dto);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const profileId = dto.profileId || `risk-prof-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const profile: RiskEngineProfile = {
      profileId,
      name: dto.name,
      riskLevel: dto.riskLevel || 'MEDIUM',
      targetId: dto.targetId || null,
      status: dto.status || 'ACTIVE',
    };

    const created = await this.repo.createProfile(profile);

    // Default limits
    await this.repo.saveLimits({
      profileId: created.profileId,
      maxPositionSize: 100000.0,
      maxDailyLoss: 5000.0,
      maxCapitalUtilization: 80.0,
      maxConcentrationRatio: 25.0,
      maxDrawdown: 15.0,
      minLiquidityScore: 60.0,
      requiredMarginRatio: 10.0,
    });

    return created;
  }

  async updateProfile(profileId: string, dto: UpdateRiskProfileDto): Promise<RiskEngineProfile> {
    const updated = await this.repo.updateProfile(profileId, dto);
    if (!updated) {
      throw new Error(`Risk profile not found: ${profileId}`);
    }
    return updated;
  }

  async getLimits(profileId: string): Promise<RiskEngineLimits> {
    let limits = await this.repo.findLimitsByProfileId(profileId);
    if (!limits) {
      limits = await this.repo.saveLimits({
        profileId,
        maxPositionSize: 100000.0,
        maxDailyLoss: 5000.0,
        maxCapitalUtilization: 80.0,
        maxConcentrationRatio: 25.0,
        maxDrawdown: 15.0,
        minLiquidityScore: 60.0,
        requiredMarginRatio: 10.0,
      });
    }
    return limits;
  }

  async updateLimits(profileId: string, dto: UpdateRiskLimitsDto): Promise<RiskEngineLimits> {
    const validation = RiskValidator.validateLimits(dto);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const existingLimits = await this.getLimits(profileId);
    const updatedLimits: RiskEngineLimits = {
      ...existingLimits,
      ...(dto.maxPositionSize !== undefined ? { maxPositionSize: dto.maxPositionSize } : {}),
      ...(dto.maxDailyLoss !== undefined ? { maxDailyLoss: dto.maxDailyLoss } : {}),
      ...(dto.maxCapitalUtilization !== undefined ? { maxCapitalUtilization: dto.maxCapitalUtilization } : {}),
      ...(dto.maxConcentrationRatio !== undefined ? { maxConcentrationRatio: dto.maxConcentrationRatio } : {}),
      ...(dto.maxDrawdown !== undefined ? { maxDrawdown: dto.maxDrawdown } : {}),
      ...(dto.minLiquidityScore !== undefined ? { minLiquidityScore: dto.minLiquidityScore } : {}),
      ...(dto.requiredMarginRatio !== undefined ? { requiredMarginRatio: dto.requiredMarginRatio } : {}),
    };

    return await this.repo.saveLimits(updatedLimits);
  }
}
