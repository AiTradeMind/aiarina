import { OMSRepository } from "../repositories/oms.repository.ts";
import { OMSHealthReport } from "../types/index.ts";
import { OMSRegistryService } from "./oms-registry.service.ts";

export class OMSHealthService {
  private repo: OMSRepository;
  private registry: OMSRegistryService;

  constructor(repo?: OMSRepository) {
    this.repo = repo || new OMSRepository();
    this.registry = OMSRegistryService.getInstance();
  }

  async getHealthReport(): Promise<OMSHealthReport> {
    const orders = await this.repo.getOrders(1000);
    const queue = await this.repo.getExecutionQueue(500);

    const activeOrders = orders.filter((o) =>
      ["CREATED", "VALIDATED", "QUEUED", "READY", "SUBMITTED", "PARTIALLY_FILLED"].includes(o.status)
    );
    const queuedOrders = queue.filter((q) => q.status === "QUEUED" || q.status === "PROCESSING");
    const completedOrders = orders.filter((o) => o.status === "FILLED");
    const rejectedOrders = orders.filter((o) => o.status === "REJECTED" || o.status === "CANCELLED" || o.status === "EXPIRED");

    const systemReady = this.registry.isSystemReady();

    return {
      status: systemReady ? "HEALTHY" : "DEGRADED",
      activeOrdersCount: activeOrders.length,
      queuedOrdersCount: queuedOrders.length,
      completedOrdersCount: completedOrders.length,
      rejectedOrdersCount: rejectedOrders.length,
      systemStance: "OMS OPERATIONAL - BROKER DECOUPLED",
      timestamp: new Date().toISOString(),
    };
  }
}
