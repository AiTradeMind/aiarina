import { eq, and, sql, desc } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { enterpriseOrders, enterpriseOrderHistory } from "../../../db/schema.ts";
import { IOrder, IOrderHistory, CreateOrderPayload } from "../types/index.ts";
import { orderVersionRepository } from "./OrderVersionRepository.ts";
import { idempotencyRepository } from "./IdempotencyRepository.ts";
import { orderMetricsRepository } from "./OrderMetricsRepository.ts";

export class OrderRepository {
  public async ensureOrderTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_orders (
        id VARCHAR(50) PRIMARY KEY,
        client_order_id VARCHAR(100) NOT NULL,
        organization_id VARCHAR(50) NOT NULL,
        workspace_id VARCHAR(50),
        ai_model_id VARCHAR(50),
        strategy_id VARCHAR(50),
        symbol VARCHAR(50) NOT NULL,
        exchange VARCHAR(50) NOT NULL,
        side VARCHAR(10) NOT NULL,
        order_type VARCHAR(20) NOT NULL,
        quantity DECIMAL NOT NULL,
        filled_quantity DECIMAL DEFAULT 0 NOT NULL,
        price DECIMAL,
        trigger_price DECIMAL,
        status VARCHAR(20) DEFAULT 'CREATED' NOT NULL,
        version INTEGER DEFAULT 1 NOT NULL,
        correlation_id VARCHAR(100),
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE (organization_id, client_order_id)
      );

      CREATE INDEX IF NOT EXISTS idx_ent_orders_org_client_id ON enterprise_orders(organization_id, client_order_id);
      CREATE INDEX IF NOT EXISTS idx_ent_orders_symbol ON enterprise_orders(symbol);
      CREATE INDEX IF NOT EXISTS idx_ent_orders_status ON enterprise_orders(status);

      CREATE TABLE IF NOT EXISTS enterprise_order_history (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL REFERENCES enterprise_orders(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL,
        version INTEGER NOT NULL,
        details JSONB DEFAULT '{}'::jsonb,
        changed_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_ent_order_history_order_id ON enterprise_order_history(order_id);
    `);

    await orderVersionRepository.ensureVersionTable();
    await idempotencyRepository.ensureIdempotencyTable();
    await orderMetricsRepository.ensureMetricsTable();
  }

  public async getOrderById(id: string, organizationId: string): Promise<IOrder | null> {
    const db = getDb();
    const result = await db.select()
      .from(enterpriseOrders)
      .where(and(eq(enterpriseOrders.id, id), eq(enterpriseOrders.organizationId, organizationId)))
      .limit(1);
    
    return (result[0] as unknown as IOrder) || null;
  }

  public async getOrderByClientId(clientOrderId: string, organizationId: string): Promise<IOrder | null> {
    const db = getDb();
    const result = await db.select()
      .from(enterpriseOrders)
      .where(and(eq(enterpriseOrders.clientOrderId, clientOrderId), eq(enterpriseOrders.organizationId, organizationId)))
      .limit(1);
    
    return (result[0] as unknown as IOrder) || null;
  }

  public async createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
    const db = getDb();
    const result = await db.insert(enterpriseOrders).values(orderData as any).returning();
    return result[0] as unknown as IOrder;
  }

  public async updateOrder(id: string, updates: Partial<IOrder>): Promise<IOrder | null> {
    const db = getDb();
    const result = await db.update(enterpriseOrders)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(enterpriseOrders.id, id))
      .returning();
    return (result[0] as unknown as IOrder) || null;
  }

  public async addHistory(historyData: Partial<IOrderHistory>): Promise<IOrderHistory> {
    const db = getDb();
    const result = await db.insert(enterpriseOrderHistory).values(historyData as any).returning();
    return result[0] as unknown as IOrderHistory;
  }

  public async getHistory(orderId: string): Promise<IOrderHistory[]> {
    const db = getDb();
    const result = await db.select()
      .from(enterpriseOrderHistory)
      .where(eq(enterpriseOrderHistory.orderId, orderId))
      .orderBy(desc(enterpriseOrderHistory.version));
    return result as unknown as IOrderHistory[];
  }

  public async getOrders(organizationId: string, limit: number = 50, offset: number = 0): Promise<IOrder[]> {
    const db = getDb();
    const result = await db.select()
      .from(enterpriseOrders)
      .where(eq(enterpriseOrders.organizationId, organizationId))
      .orderBy(desc(enterpriseOrders.createdAt))
      .limit(limit)
      .offset(offset);
    return result as unknown as IOrder[];
  }
}

export const orderRepository = new OrderRepository();
