export class PortfolioValidator {
  public validateCash(availableCash: string, requiredAmount: string): void {
    const cash = parseFloat(availableCash);
    const required = parseFloat(requiredAmount);
    
    if (cash < required) {
      throw new Error(`Insufficient funds: requires ${required}, available ${cash}`);
    }
  }

  public validateHoldings(openQuantity: string, requiredQuantity: string): void {
    const qty = parseFloat(openQuantity);
    const req = parseFloat(requiredQuantity);
    
    if (qty < req) {
      throw new Error(`Insufficient holdings: requires ${req}, available ${qty}`);
    }
  }

  public validatePortfolioStatus(status: string): void {
    if (status !== 'ACTIVE') {
      throw new Error(`Portfolio is not active, current status: ${status}`);
    }
  }
}

export const portfolioValidator = new PortfolioValidator();
