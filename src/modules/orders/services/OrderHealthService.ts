import { orderMetricsService } from "./OrderMetricsService.ts";

export class OrderHealthService {
  public async getHealth(organizationId: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    const metrics = await orderMetricsService.getMetrics(organizationId, today);
    
    if (!metrics) {
      return {
        status: "HEALTHY",
        throughput: 0,
        successRate: 100,
        errorRate: 0,
        cancellationRate: 0,
        modificationRate: 0,
        metrics: {}
      };
    }

    const totalOrders = metrics.total_orders || metrics.totalOrders || 0;
    
    // For our purposes, a "success" might be considered filled, 
    // but in a trading engine a validation success means it was queued successfully.
    // Let's define success rate as (total - validationFailures - rejected) / total
    
    const errors = (metrics.validation_failures || metrics.validationFailures || 0) + 
                   (metrics.rejected_orders || metrics.rejectedOrders || 0);
                   
    const errorRate = totalOrders > 0 ? (errors / totalOrders) * 100 : 0;
    const successRate = 100 - errorRate;
    
    const cancelled = metrics.cancelled_orders || metrics.cancelledOrders || 0;
    const cancellationRate = totalOrders > 0 ? (cancelled / totalOrders) * 100 : 0;
    
    const modified = metrics.modified_orders || metrics.modifiedOrders || 0;
    const modificationRate = totalOrders > 0 ? (modified / totalOrders) * 100 : 0;

    let status = "HEALTHY";
    if (errorRate > 5) status = "DEGRADED";
    if (errorRate > 15) status = "CRITICAL";

    return {
      status,
      throughput: totalOrders,
      successRate: parseFloat(successRate.toFixed(2)),
      errorRate: parseFloat(errorRate.toFixed(2)),
      cancellationRate: parseFloat(cancellationRate.toFixed(2)),
      modificationRate: parseFloat(modificationRate.toFixed(2)),
      metrics
    };
  }
}

export const orderHealthService = new OrderHealthService();
