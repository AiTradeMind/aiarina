import { PortfolioRepository } from "../repositories/portfolio.repository.ts";
import { PortfolioRegistryService } from "./portfolio-registry.service.ts";
import { PortfolioHealthReport } from "../types/index.ts";

export class PortfolioHealthService {
  private repository: PortfolioRepository;
  private registry: PortfolioRegistryService;

  constructor() {
    this.repository = new PortfolioRepository();
    this.registry = PortfolioRegistryService.getInstance();
  }

  async getHealthReport(portfolioId: string = "PF-MAIN-001"): Promise<PortfolioHealthReport> {
    const registryReady = this.registry.isSystemReady();
    let accountActive = false;
    let totalPositions = 0;

    try {
      const account = await this.repository.getAccount(portfolioId);
      accountActive = !!account && account.status === "ACTIVE";

      const positions = await this.repository.getPositions(portfolioId);
      totalPositions = positions.length;
    } catch (e) {
      accountActive = false;
    }

    const checks = {
      registryReady,
      accountActive,
      repositoryConnected: true,
    };

    const isHealthy = registryReady && accountActive;

    return {
      status: isHealthy ? "HEALTHY" : "DEGRADED",
      activePortfolios: accountActive ? 1 : 0,
      totalPositions,
      systemStance: isHealthy
        ? "PORTFOLIO OPERATIONAL - Tracking positions, holdings, PnL & exposure."
        : "PORTFOLIO DEGRADED - Account or database check pending.",
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
