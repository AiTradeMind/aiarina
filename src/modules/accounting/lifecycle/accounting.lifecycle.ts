import { UniversalAuditRepository } from "../repositories/audit.repository.ts";

export class AccountingLifecycle {
  private auditRepo = new UniversalAuditRepository();
  private state: "UNINITIALIZED" | "INITIALIZING" | "READY" | "CLOSING" | "MAINTENANCE" = "UNINITIALIZED";

  async initialize() {
    this.state = "INITIALIZING";
    await this.auditRepo.log({
      category: "SYSTEM",
      action: "ACCOUNTING_LIFECYCLE_INITIALIZING",
      details: { timestamp: new Date() },
    });

    this.state = "READY";
    await this.auditRepo.log({
      category: "SYSTEM",
      action: "ACCOUNTING_LIFECYCLE_READY",
      details: { state: "READY", timestamp: new Date() },
    });
    return { status: "READY", message: "Accounting Lifecycle Engine initialized." };
  }

  getState() {
    return this.state;
  }
}
