import { portfolioRepository } from "../repositories/PortfolioRepository.ts";
import { portfolioValidator } from "../validators/PortfolioValidator.ts";
import { IEnterprisePortfolio } from "../types/index.ts";

export class PortfolioEngine {
  public async debitCash(portfolio: IEnterprisePortfolio, amount: string): Promise<IEnterprisePortfolio> {
    portfolioValidator.validateCash(portfolio.availableCash, amount);
    
    const newCash = parseFloat(portfolio.cashBalance) - parseFloat(amount);
    const newAvailable = parseFloat(portfolio.availableCash) - parseFloat(amount);
    
    return await portfolioRepository.updatePortfolio(portfolio.id, portfolio.organizationId, {
      cashBalance: newCash.toString(),
      availableCash: newAvailable.toString()
    });
  }

  public async creditCash(portfolio: IEnterprisePortfolio, amount: string): Promise<IEnterprisePortfolio> {
    const newCash = parseFloat(portfolio.cashBalance) + parseFloat(amount);
    const newAvailable = parseFloat(portfolio.availableCash) + parseFloat(amount);
    
    return await portfolioRepository.updatePortfolio(portfolio.id, portfolio.organizationId, {
      cashBalance: newCash.toString(),
      availableCash: newAvailable.toString()
    });
  }

  public async recalculateEquity(portfolioId: string, organizationId: string, totalMarketValue: string): Promise<IEnterprisePortfolio> {
    const portfolio = await portfolioRepository.getPortfolio(portfolioId, organizationId);
    if (!portfolio) throw new Error("Portfolio not found");
    
    const equity = parseFloat(portfolio.cashBalance) + parseFloat(totalMarketValue);
    
    return await portfolioRepository.updatePortfolio(portfolioId, organizationId, {
      portfolioValue: equity.toString(),
      equity: equity.toString()
    });
  }
}

export const portfolioEngine = new PortfolioEngine();
