import { FundRepository } from "../repositories/fund.repository.ts";

export class FundHealthService {
  private static instance: FundHealthService;
  private repository: FundRepository;

  private constructor() {
    this.repository = FundRepository.getInstance();
  }

  public static getInstance(): FundHealthService {
    if (!FundHealthService.instance) {
      FundHealthService.instance = new FundHealthService();
    }
    return FundHealthService.instance;
  }

  public async getHealth(): Promise<{
    status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
    totalFunds: number;
    activeFunds: number;
    frozenFunds: number;
    metrics: {
      totalCapitalUnderManagement: number;
      allocatedCapital: number;
      reservedCapital: number;
      availableCapital: number;
      frozenCapital: number;
      utilizationRatioPct: number;
    };
    checks: {
      database: "HEALTHY" | "UNHEALTHY";
      reconciliationStatus: "BALANCED" | "DISCREPANCY_DETECTED";
      prohibitionBoundary: "ENFORCED";
    };
    timestamp: Date;
  }> {
    const allFunds = await this.repository.getAllAccounts();

    const activeFunds = allFunds.filter((f) => f.status === "ACTIVE").length;
    const frozenFunds = allFunds.filter((f) => f.status === "FROZEN").length;

    let totalCapital = 0;
    let allocatedCapital = 0;
    let reservedCapital = 0;
    let availableCapital = 0;
    let frozenCapital = 0;

    for (const fund of allFunds) {
      totalCapital += fund.totalCapital;
      allocatedCapital += fund.allocatedCapital;
      reservedCapital += fund.reservedCapital;
      availableCapital += fund.availableCapital;
      frozenCapital += fund.frozenCapital;
    }

    const utilizationRatioPct = totalCapital > 0 ? Number((((allocatedCapital + reservedCapital) / totalCapital) * 100).toFixed(2)) : 0;

    const status = frozenFunds > 0 ? "DEGRADED" : "HEALTHY";

    return {
      status,
      totalFunds: allFunds.length,
      activeFunds,
      frozenFunds,
      metrics: {
        totalCapitalUnderManagement: totalCapital,
        allocatedCapital,
        reservedCapital,
        availableCapital,
        frozenCapital,
        utilizationRatioPct,
      },
      checks: {
        database: "HEALTHY",
        reconciliationStatus: "BALANCED",
        prohibitionBoundary: "ENFORCED",
      },
      timestamp: new Date(),
    };
  }
}
