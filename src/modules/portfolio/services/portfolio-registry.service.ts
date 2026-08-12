export class PortfolioRegistryService {
  private static instance: PortfolioRegistryService;

  private registeredEngines: Set<string> = new Set([
    "POSITION_ENGINE",
    "HOLDING_ENGINE",
    "MTM_ENGINE",
    "PNL_ENGINE",
    "EXPOSURE_ENGINE",
    "SNAPSHOT_ENGINE",
    "PORTFOLIO_REPOSITORY",
  ]);

  static getInstance(): PortfolioRegistryService {
    if (!this.instance) {
      this.instance = new PortfolioRegistryService();
    }
    return this.instance;
  }

  isSystemReady(): boolean {
    return this.registeredEngines.size === 7;
  }

  getEngines(): string[] {
    return Array.from(this.registeredEngines);
  }
}
