import { FundRepository } from "../repositories/fund.repository.ts";
import { FundAccount, FundAllocation, FundTransaction, AllocationRuleTarget } from "../types/index.ts";
import { AllocateFundDTO } from "../dtos/fund.dto.ts";
import { AllocationStrategy, ALLOCATION_STRATEGIES } from "../constants/index.ts";
import { FundValidator } from "../validators/fund.validator.ts";
import logger from "../../../lib/logger.ts";

export class AllocationEngineService {
  private static instance: AllocationEngineService;
  private repository: FundRepository;

  private constructor() {
    this.repository = FundRepository.getInstance();
  }

  public static getInstance(): AllocationEngineService {
    if (!AllocationEngineService.instance) {
      AllocationEngineService.instance = new AllocationEngineService();
    }
    return AllocationEngineService.instance;
  }

  public async executeAllocation(dto: AllocateFundDTO): Promise<FundAllocation[]> {
    const sourceFund = await this.repository.getAccountById(dto.sourceFundId);
    if (!sourceFund) {
      throw new Error(`ALLOCATION_ERROR: Source fund '${dto.sourceFundId}' not found.`);
    }

    FundValidator.validateAllocate(dto, sourceFund);

    const strategy: AllocationStrategy = dto.allocationStrategy || ALLOCATION_STRATEGIES.MANUAL;
    const targets: AllocationRuleTarget[] = dto.targets || (dto.targetFundId ? [{ targetFundId: dto.targetFundId, amount: dto.amount }] : []);

    if (targets.length === 0) {
      throw new Error("ALLOCATION_ERROR: At least one target fund must be specified.");
    }

    // Calculate allocation distribution
    const distributions = this.calculateDistribution(strategy, targets, dto.amount || 0, sourceFund.availableCapital);

    // Validate total amount vs available capital
    const totalToAllocate = distributions.reduce((sum, d) => sum + d.amount, 0);
    if (totalToAllocate <= 0) {
      throw new Error("ALLOCATION_ERROR: Calculated allocation amount must be greater than zero.");
    }
    if (sourceFund.availableCapital < totalToAllocate) {
      throw new Error(
        `ALLOCATION_ERROR: Total calculated allocation (₹${totalToAllocate}) exceeds source fund available capital (₹${sourceFund.availableCapital}).`
      );
    }

    const createdAllocations: FundAllocation[] = [];

    for (const dist of distributions) {
      const targetFund = await this.repository.getAccountById(dist.targetFundId);
      if (!targetFund) {
        throw new Error(`ALLOCATION_ERROR: Target fund '${dist.targetFundId}' not found.`);
      }

      if (targetFund.status !== "ACTIVE") {
        throw new Error(`ALLOCATION_ERROR: Target fund '${dist.targetFundId}' is not ACTIVE.`);
      }

      const allocId = `ALLOC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      const allocationRecord: FundAllocation = {
        allocationId: allocId,
        sourceFundId: sourceFund.fundId,
        targetFundId: targetFund.fundId,
        amount: dist.amount,
        allocationStrategy: strategy,
        status: "ACTIVE",
        notes: dto.notes || `Allocated via ${strategy}`,
        metadata: { ...dto },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update source fund capital
      sourceFund.allocatedCapital += dist.amount;
      sourceFund.availableCapital -= dist.amount;

      // Update target fund capital
      targetFund.totalCapital += dist.amount;
      targetFund.availableCapital += dist.amount;

      await this.repository.saveAccount(sourceFund);
      await this.repository.saveAccount(targetFund);
      const savedAlloc = await this.repository.saveAllocation(allocationRecord);

      // Save audit transaction
      const tx: FundTransaction = {
        transactionId: `TX-ALLOC-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        fundId: sourceFund.fundId,
        operation: "ALLOCATE",
        amount: dist.amount,
        sourceFundId: sourceFund.fundId,
        targetFundId: targetFund.fundId,
        status: "SUCCESS",
        actorId: dto.actorId || "SYSTEM",
        metadata: { allocationId: allocId, strategy },
      };
      await this.repository.saveTransaction(tx);

      createdAllocations.push(savedAlloc);

      logger.info(
        {
          allocationId: allocId,
          sourceFundId: sourceFund.fundId,
          targetFundId: targetFund.fundId,
          amount: dist.amount,
          strategy,
        },
        "Fund Allocation Executed Successfully"
      );
    }

    return createdAllocations;
  }

  private calculateDistribution(
    strategy: AllocationStrategy,
    targets: AllocationRuleTarget[],
    totalAmount: number,
    availableCapital: number
  ): Array<{ targetFundId: string; amount: number }> {
    if (strategy === ALLOCATION_STRATEGIES.EQUAL) {
      const perTarget = totalAmount > 0 ? totalAmount / targets.length : availableCapital / targets.length;
      return targets.map((t) => ({ targetFundId: t.targetFundId, amount: perTarget }));
    }

    if (strategy === ALLOCATION_STRATEGIES.PERCENTAGE) {
      const basePool = totalAmount > 0 ? totalAmount : availableCapital;
      return targets.map((t) => {
        const pct = t.percentage !== undefined ? t.percentage : 100 / targets.length;
        const amt = (basePool * pct) / 100;
        return { targetFundId: t.targetFundId, amount: amt };
      });
    }

    if (strategy === ALLOCATION_STRATEGIES.WEIGHTED) {
      const totalWeight = targets.reduce((sum, t) => sum + (t.weight || 1), 0);
      const basePool = totalAmount > 0 ? totalAmount : availableCapital;
      return targets.map((t) => {
        const w = t.weight || 1;
        const amt = (basePool * w) / totalWeight;
        return { targetFundId: t.targetFundId, amount: amt };
      });
    }

    if (strategy === ALLOCATION_STRATEGIES.PRIORITY) {
      // Sort targets by priority ascending (1 = highest priority)
      const sorted = [...targets].sort((a, b) => (a.priority || 99) - (b.priority || 99));
      let remainingPool = totalAmount > 0 ? totalAmount : availableCapital;
      const res: Array<{ targetFundId: string; amount: number }> = [];

      for (const t of sorted) {
        const requested = t.amount || remainingPool;
        const allocated = Math.min(requested, remainingPool);
        res.push({ targetFundId: t.targetFundId, amount: allocated });
        remainingPool -= allocated;
      }
      return res;
    }

    // MANUAL or CUSTOM
    return targets.map((t) => ({
      targetFundId: t.targetFundId,
      amount: t.amount !== undefined ? t.amount : totalAmount,
    }));
  }
}
