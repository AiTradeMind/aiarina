import { AccountingRepository } from "../repositories/accounting.repository.ts";

export class AccountingRegistry {
  private repo = new AccountingRepository();
  private static instance: AccountingRegistry;

  public static getInstance(): AccountingRegistry {
    if (!AccountingRegistry.instance) {
      AccountingRegistry.instance = new AccountingRegistry();
    }
    return AccountingRegistry.instance;
  }

  async getAccountByCode(code: string) {
    return await this.repo.findAccountByCode(code);
  }

  async registerAccount(data: { accountCode: string; accountName: string; accountType: any; description?: string }) {
    const existing = await this.repo.findAccountByCode(data.accountCode);
    if (existing) {
      return existing;
    }
    return await this.repo.createAccount(data);
  }
}
