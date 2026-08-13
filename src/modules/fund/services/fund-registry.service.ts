import { FundRepository } from "../repositories/fund.repository.ts";
import { FundAccount, FundMetadataInfo } from "../types/index.ts";
import { CreateFundDTO } from "../dtos/fund.dto.ts";
import { FundValidator } from "../validators/fund.validator.ts";
import logger from "../../../lib/logger.ts";

export class FundRegistryService {
  private static instance: FundRegistryService;
  private repository: FundRepository;

  private constructor() {
    this.repository = FundRepository.getInstance();
  }

  public static getInstance(): FundRegistryService {
    if (!FundRegistryService.instance) {
      FundRegistryService.instance = new FundRegistryService();
    }
    return FundRegistryService.instance;
  }

  public async registerFund(dto: CreateFundDTO): Promise<FundAccount> {
    FundValidator.validateCreateFund(dto);

    const idStr = dto.fundId || `FUND-${dto.fundType}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const existing = await this.repository.getAccountById(idStr);
    if (existing) {
      throw new Error(`REGISTRATION_ERROR: Fund with ID '${idStr}' already exists.`);
    }

    const initialCapital = dto.initialCapital || 0;

    const account: FundAccount = {
      fundId: idStr,
      name: dto.name,
      fundType: dto.fundType,
      status: "ACTIVE",
      totalCapital: initialCapital,
      allocatedCapital: 0,
      reservedCapital: 0,
      availableCapital: initialCapital,
      frozenCapital: 0,
      releasedCapital: 0,
      utilizedCapital: 0,
      currency: dto.currency || "INR",
      parentFundId: dto.parentFundId || null,
      metadata: dto.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.repository.saveAccount(account);

    // Save initial metadata if provided
    const metadataInfo: FundMetadataInfo = {
      fundId: idStr,
      riskTier: dto.riskTier || "MEDIUM",
      maxAllocationLimit: dto.maxAllocationLimit || null,
      maxReservationLimit: dto.maxReservationLimit || null,
      owner: dto.owner || "SYSTEM",
      tags: [],
      customRules: {},
    };
    await this.repository.saveMetadata(metadataInfo);

    logger.info({ fundId: idStr, name: dto.name, fundType: dto.fundType }, "Fund Account successfully registered");

    return saved;
  }

  public async getFundById(fundId: string): Promise<FundAccount | null> {
    return this.repository.getAccountById(fundId);
  }

  public async getFundsByType(type: string): Promise<FundAccount[]> {
    const all = await this.repository.getAllAccounts();
    return all.filter((f) => f.fundType === type);
  }

  public async getSubFunds(parentFundId: string): Promise<FundAccount[]> {
    const all = await this.repository.getAllAccounts();
    return all.filter((f) => f.parentFundId === parentFundId);
  }

  public async getAllFunds(): Promise<FundAccount[]> {
    return this.repository.getAllAccounts();
  }
}
