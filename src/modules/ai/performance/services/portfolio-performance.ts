import { PaperAccountRepository, PaperPositionRepository } from "../../../paperTrading/repositories/index.ts";

export class PortfolioPerformanceService {
  private accountRepo = new PaperAccountRepository();
  private positionRepo = new PaperPositionRepository();

  async getPortfolioPerformance(organizationId: string): Promise<any> {
    const account = await this.accountRepo.findByOrganizationId(organizationId);
    const positions = await this.positionRepo.findByOrganizationId(organizationId);
    
    if (!account) return { error: "Account not found" };

    const currentBalance = parseFloat(account.balance);
    const initialBalance = parseFloat(account.initialBalance);
    const netPnL = currentBalance - initialBalance;
    const roi = (netPnL / initialBalance) * 100;

    return {
      currentEquity: currentBalance,
      initialEquity: initialBalance,
      netPnL,
      roi,
      positionCount: positions.length
    };
  }
}
