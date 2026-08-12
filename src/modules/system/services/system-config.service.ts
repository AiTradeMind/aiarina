import { MetadataRepository } from "../../accounting/repositories/metadata.repository.ts";

export class SystemConfigService {
  private repo = new MetadataRepository();

  async getConfig(key: string) {
    return await this.repo.getSystemConfig(key);
  }

  async getAllConfigs() {
    return await this.repo.getAllSystemConfig();
  }

  async setConfig(key: string, category: "FINANCIAL" | "ACCOUNTING" | "FEATURE_FLAGS" | "RUNTIME", value: any, isLocked = false) {
    return await this.repo.setSystemConfig(key, category, value, isLocked);
  }

  async ensureDefaultConfigurations() {
    const defaults = [
      { key: "FINANCIAL_BASE_CURRENCY", category: "FINANCIAL" as const, value: { currency: "INR", symbol: "₹" } },
      { key: "ACCOUNTING_DOUBLE_ENTRY_STRICT", category: "ACCOUNTING" as const, value: { strict: true, allowImbalance: false } },
      { key: "FEATURE_AUTO_RECONCILIATION", category: "FEATURE_FLAGS" as const, value: { enabled: true, frequency: "DAILY" } },
      { key: "RUNTIME_AUDIT_LOG_IMMUTABLE", category: "RUNTIME" as const, value: { immutable: true } },
    ];

    for (const def of defaults) {
      const existing = await this.getConfig(def.key);
      if (!existing) {
        await this.setConfig(def.key, def.category, def.value);
      }
    }
  }
}

export const systemConfigService = new SystemConfigService();
