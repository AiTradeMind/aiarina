export class BacktestValidator {
  validateConfig(config: any): boolean {
    return !!config.organizationId && !!config.mode && !!config.scenario;
  }
}

export const backtestValidator = new BacktestValidator();
