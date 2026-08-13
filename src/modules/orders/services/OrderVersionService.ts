import { orderVersionRepository } from "../repositories/OrderVersionRepository.ts";
import { IOrder, IOrderVersion } from "../types/index.ts";

export class OrderVersionService {
  public async createVersion(
    order: IOrder,
    changeReason: string | null = null,
    actorId: number | null = null,
    previousVersionId: number | null = null
  ): Promise<IOrderVersion> {
    return await orderVersionRepository.saveVersion({
      orderId: order.id,
      versionNumber: order.version,
      previousVersionId,
      changeReason,
      changedBy: actorId,
      changedAt: new Date(),
      orderSnapshot: order,
    });
  }

  public async getOrderVersions(orderId: string): Promise<IOrderVersion[]> {
    return await orderVersionRepository.getVersions(orderId);
  }
}

export const orderVersionService = new OrderVersionService();
