import { orderMetricsService } from "./OrderMetricsService.ts";
import { orderAnalyticsService } from "./OrderAnalyticsService.ts";
import { orderHealthService } from "./OrderHealthService.ts";

export class OrderReportingService {
  public async generateReport(organizationId: string, type: 'daily' | 'health' | 'full' = 'full'): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    const report: any = {
      organizationId,
      generatedAt: new Date().toISOString(),
      type
    };

    if (type === 'daily' || type === 'full') {
      const metrics = await orderMetricsService.getMetrics(organizationId, today);
      report.dailyMetrics = metrics;
    }

    if (type === 'health' || type === 'full') {
      const health = await orderHealthService.getHealth(organizationId);
      report.health = health;
    }

    if (type === 'full') {
      const dashboard = await orderAnalyticsService.getDashboard(organizationId);
      report.dashboard = dashboard;
    }

    return report;
  }
}

export const orderReportingService = new OrderReportingService();
