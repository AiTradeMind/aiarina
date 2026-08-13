import { getDb } from "../../../db/client.ts";
import { sql } from "drizzle-orm";
import { orderMetricsService } from "./OrderMetricsService.ts";

export class OrderAnalyticsService {
  public async getDashboard(organizationId: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    const todayMetrics = await orderMetricsService.getMetrics(organizationId, today);
    
    // We could do more complex queries here, but to maintain performance we'll just aggregate from existing tables
    const db = getDb();
    
    // Status Distribution
    const statusResult = await db.execute(sql`
      SELECT status, COUNT(*) as count 
      FROM enterprise_orders 
      WHERE organization_id = ${organizationId} 
      GROUP BY status
    `);
    
    const statusDistribution = (statusResult as any).rows || statusResult;

    // Type Distribution
    const typeResult = await db.execute(sql`
      SELECT order_type, COUNT(*) as count 
      FROM enterprise_orders 
      WHERE organization_id = ${organizationId} 
      GROUP BY order_type
    `);
    
    const typeDistribution = (typeResult as any).rows || typeResult;

    // Buy vs Sell
    const sideResult = await db.execute(sql`
      SELECT side, COUNT(*) as count 
      FROM enterprise_orders 
      WHERE organization_id = ${organizationId} 
      GROUP BY side
    `);
    
    const sideDistribution = (sideResult as any).rows || sideResult;

    // Strategy Distribution
    const strategyResult = await db.execute(sql`
      SELECT strategy_id, COUNT(*) as count 
      FROM enterprise_orders 
      WHERE organization_id = ${organizationId} AND strategy_id IS NOT NULL
      GROUP BY strategy_id
    `);
    
    const strategyDistribution = (strategyResult as any).rows || strategyResult;

    // AI Model Distribution
    const aiModelResult = await db.execute(sql`
      SELECT ai_model_id, COUNT(*) as count 
      FROM enterprise_orders 
      WHERE organization_id = ${organizationId} AND ai_model_id IS NOT NULL
      GROUP BY ai_model_id
    `);
    
    const aiModelDistribution = (aiModelResult as any).rows || aiModelResult;

    return {
      dailySummary: todayMetrics || {
        totalOrders: 0,
        createdOrders: 0,
        filledOrders: 0,
        cancelledOrders: 0,
        rejectedOrders: 0,
        expiredOrders: 0,
        modifiedOrders: 0,
        validationFailures: 0,
        duplicateRequests: 0,
        totalVolume: 0
      },
      distributions: {
        status: statusDistribution,
        type: typeDistribution,
        side: sideDistribution,
        strategy: strategyDistribution,
        aiModel: aiModelDistribution
      }
    };
  }
}

export const orderAnalyticsService = new OrderAnalyticsService();
