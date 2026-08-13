import { FundRegistryService } from "./fund-registry.service.ts";
import { AllocationEngineService } from "./allocation-engine.service.ts";
import { ReservationEngineService } from "./reservation-engine.service.ts";
import { ReleaseEngineService } from "./release-engine.service.ts";
import { FundLifecycleService } from "./fund-lifecycle.service.ts";
import { FundHealthService } from "./fund-health.service.ts";
import { FundPipelineService } from "../pipeline/fund-pipeline.service.ts";
import { FundRepository } from "../repositories/fund.repository.ts";
import { FundValidator } from "../validators/fund.validator.ts";
import {
  CreateFundDTO,
  AllocateFundDTO,
  ReserveCapitalDTO,
  ReleaseCapitalDTO,
  FreezeFundDTO,
  UnfreezeFundDTO,
  TransferCapitalDTO,
} from "../dtos/fund.dto.ts";
import { FundAccount, FundAllocation, FundReservation, FundTransaction, PipelineExecutionResult } from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class FundService {
  private static instance: FundService;
  private registryService: FundRegistryService;
  private allocationEngine: AllocationEngineService;
  private reservationEngine: ReservationEngineService;
  private releaseEngine: ReleaseEngineService;
  private lifecycleService: FundLifecycleService;
  private healthService: FundHealthService;
  private pipelineService: FundPipelineService;
  private repository: FundRepository;

  private constructor() {
    this.registryService = FundRegistryService.getInstance();
    this.allocationEngine = AllocationEngineService.getInstance();
    this.reservationEngine = ReservationEngineService.getInstance();
    this.releaseEngine = ReleaseEngineService.getInstance();
    this.lifecycleService = FundLifecycleService.getInstance();
    this.healthService = FundHealthService.getInstance();
    this.pipelineService = FundPipelineService.getInstance();
    this.repository = FundRepository.getInstance();
  }

  public static getInstance(): FundService {
    if (!FundService.instance) {
      FundService.instance = new FundService();
    }
    return FundService.instance;
  }

  // --- Fund Operations ---

  public async createFund(dto: CreateFundDTO): Promise<PipelineExecutionResult<FundAccount>> {
    return this.pipelineService.runPipeline(
      "CREATE_FUND",
      {
        fundId: dto.fundId,
        amount: dto.initialCapital,
        actorRole: dto.owner || "SYSTEM",
      },
      async () => {
        return this.registryService.registerFund(dto);
      }
    );
  }

  public async allocateCapital(dto: AllocateFundDTO): Promise<PipelineExecutionResult<FundAllocation[]>> {
    return this.pipelineService.runPipeline(
      "ALLOCATE_CAPITAL",
      {
        sourceFundId: dto.sourceFundId,
        fundId: dto.targetFundId,
        amount: dto.amount,
        actorRole: dto.actorRole,
        actorId: dto.actorId,
        details: { notes: dto.notes, strategy: dto.allocationStrategy },
      },
      async () => {
        return this.allocationEngine.executeAllocation(dto);
      }
    );
  }

  public async reserveCapital(dto: ReserveCapitalDTO): Promise<PipelineExecutionResult<FundReservation>> {
    return this.pipelineService.runPipeline(
      "RESERVE_CAPITAL",
      {
        fundId: dto.fundId,
        amount: dto.amount,
        actorRole: dto.actorRole,
        actorId: dto.actorId,
        details: { purpose: dto.purpose },
      },
      async () => {
        return this.reservationEngine.createReservation(dto);
      }
    );
  }

  public async releaseCapital(dto: ReleaseCapitalDTO): Promise<PipelineExecutionResult<any>> {
    return this.pipelineService.runPipeline(
      "RELEASE_CAPITAL",
      {
        fundId: dto.fundId,
        amount: dto.amount,
        actorRole: dto.actorRole,
        actorId: dto.actorId,
        details: { reservationId: dto.reservationId, allocationId: dto.allocationId, reason: dto.reason },
      },
      async () => {
        return this.releaseEngine.releaseCapital(dto);
      }
    );
  }

  public async freezeFund(dto: FreezeFundDTO): Promise<PipelineExecutionResult<FundAccount>> {
    return this.pipelineService.runPipeline(
      "FREEZE_FUND",
      {
        fundId: dto.fundId,
        actorRole: dto.actorRole,
        actorId: dto.actorId,
        details: { reason: dto.reason },
      },
      async () => {
        return this.lifecycleService.freezeFund(dto.fundId, dto.reason, dto.actorId);
      }
    );
  }

  public async unfreezeFund(dto: UnfreezeFundDTO): Promise<PipelineExecutionResult<FundAccount>> {
    return this.pipelineService.runPipeline(
      "UNFREEZE_FUND",
      {
        fundId: dto.fundId,
        actorRole: dto.actorRole,
        actorId: dto.actorId,
        details: { reason: dto.reason },
      },
      async () => {
        return this.lifecycleService.unfreezeFund(dto.fundId, dto.reason, dto.actorId);
      }
    );
  }

  public async transferCapital(dto: TransferCapitalDTO): Promise<PipelineExecutionResult<FundAllocation[]>> {
    return this.pipelineService.runPipeline(
      "TRANSFER_CAPITAL",
      {
        sourceFundId: dto.sourceFundId,
        fundId: dto.targetFundId,
        amount: dto.amount,
        actorRole: dto.actorRole,
        actorId: dto.actorId,
        details: { notes: dto.notes },
      },
      async () => {
        return this.allocationEngine.executeAllocation({
          sourceFundId: dto.sourceFundId,
          targetFundId: dto.targetFundId,
          amount: dto.amount,
          notes: dto.notes || "Direct Fund Transfer",
          actorRole: dto.actorRole,
          actorId: dto.actorId,
        });
      }
    );
  }

  public async archiveFund(fundId: string, actorId: string = "SYSTEM"): Promise<PipelineExecutionResult<FundAccount>> {
    return this.pipelineService.runPipeline(
      "ARCHIVE_FUND",
      {
        fundId,
        actorId,
      },
      async () => {
        return this.lifecycleService.archiveFund(fundId, actorId);
      }
    );
  }

  // --- Read Methods ---

  public async getFundById(fundId: string): Promise<FundAccount | null> {
    return this.registryService.getFundById(fundId);
  }

  public async getAllFunds(): Promise<FundAccount[]> {
    return this.registryService.getAllFunds();
  }

  public async getAllocations(fundId?: string): Promise<FundAllocation[]> {
    return this.repository.getAllocations(fundId);
  }

  public async getReservations(fundId?: string): Promise<FundReservation[]> {
    return this.repository.getReservations(fundId);
  }

  public async getTransactions(fundId?: string, limit: number = 100): Promise<FundTransaction[]> {
    return this.repository.getTransactions(fundId, limit);
  }

  public async getHealth(): Promise<any> {
    return this.healthService.getHealth();
  }

  // --- PROHIBITION BUSINESS RULES ENFORCEMENT ---
  // Fund Manager NEVER executes trades, NEVER creates broker orders, NEVER updates market positions.

  public async executeTrade(...args: any[]): Promise<never> {
    FundValidator.validateProhibitionCall("executeTrade");
    throw new Error("PROHIBITION_ERROR: Fund Manager Foundation cannot execute trades.");
  }

  public async createBrokerOrder(...args: any[]): Promise<never> {
    FundValidator.validateProhibitionCall("createBrokerOrder");
    throw new Error("PROHIBITION_ERROR: Fund Manager Foundation cannot create broker orders.");
  }

  public async updateMarketPosition(...args: any[]): Promise<never> {
    FundValidator.validateProhibitionCall("updateMarketPosition");
    throw new Error("PROHIBITION_ERROR: Fund Manager Foundation cannot update market positions.");
  }
}
