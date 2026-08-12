// @ts-nocheck
import { RiskFoundationRepository } from "../repositories/risk-foundation.repository.ts";
import { RiskEngineMetadata } from "../types/index.ts";
import { UpdateRiskMetadataDto } from "../dtos/risk.dto.ts";

export class RiskMetadataService {
  constructor(private repo: RiskFoundationRepository = new RiskFoundationRepository()) {}

  async getMetadata(profileId: string): Promise<RiskEngineMetadata> {
    let metadata = await this.repo.findMetadataByProfileId(profileId);
    if (!metadata) {
      metadata = await this.repo.saveMetadata({
        profileId,
        volatilityThreshold: 30.0,
        marginCallLevel: 85.0,
        tags: ['DEFAULT'],
        customRules: {},
      });
    }
    return metadata;
  }

  async updateMetadata(profileId: string, dto: UpdateRiskMetadataDto): Promise<RiskEngineMetadata> {
    const existing = await this.getMetadata(profileId);

    const updated: RiskEngineMetadata = {
      ...existing,
      ...(dto.volatilityThreshold !== undefined ? { volatilityThreshold: dto.volatilityThreshold } : {}),
      ...(dto.marginCallLevel !== undefined ? { marginCallLevel: dto.marginCallLevel } : {}),
      ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
      ...(dto.customRules !== undefined ? { customRules: { ...existing.customRules, ...dto.customRules } } : {}),
    };

    return await this.repo.saveMetadata(updated);
  }
}
