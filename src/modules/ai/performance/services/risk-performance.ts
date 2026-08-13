import { PaperOrderRepository, PaperPositionRepository } from "../../../paperTrading/repositories/index.ts";

export class RiskPerformanceService {
  private orderRepo = new PaperOrderRepository();
  private positionRepo = new PaperPositionRepository();

  async getRiskPerformance(organizationId: string): Promise<any> {
    const orders = await this.orderRepo.findByOrganizationId(organizationId);
    const positions = await this.positionRepo.findByOrganizationId(organizationId);
    
    const rejectedOrders = orders.filter(o => o.status === 'REJECTED');
    
    return {
      exposure: positions.reduce((acc, p) => acc + parseFloat(p.quantity) * parseFloat(p.averagePrice), 0),
      rejectedOrdersCount: rejectedOrders.length,
      positionCount: positions.length
    };
  }
}
