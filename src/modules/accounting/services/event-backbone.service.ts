import { getDb } from "../../../db/client.ts";
import { eventRegistry, eventStore } from "../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";

export type ModuleEventType =
  | "ORDER_CREATED" | "ORDER_FILLED" | "ORDER_CANCELLED"
  | "PORTFOLIO_UPDATED" | "POSITION_CHANGED"
  | "WALLET_CREDITED" | "WALLET_DEBITED"
  | "FUND_ALLOCATED" | "FUND_RESERVED"
  | "RISK_ASSESSED" | "RISK_BREACH"
  | "ACCOUNTING_POSTED" | "ACCOUNTING_REVERSED"
  | "AUDIT_LOGGED";

export interface PublishModuleEvent {
  eventType: ModuleEventType;
  sourceModule: "ORDER" | "PORTFOLIO" | "WALLET" | "FUND" | "RISK" | "ACCOUNTING" | "AUDIT";
  payload: any;
  correlationId?: string;
}

export class EnterpriseEventBackbone {
  private static instance: EnterpriseEventBackbone;
  private subscribers: Map<string, Array<(event: any) => void | Promise<void>>> = new Map();

  public static getInstance(): EnterpriseEventBackbone {
    if (!EnterpriseEventBackbone.instance) {
      EnterpriseEventBackbone.instance = new EnterpriseEventBackbone();
    }
    return EnterpriseEventBackbone.instance;
  }

  async publish(event: PublishModuleEvent) {
    const db = getDb();
    const eventId = `EVT_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const saved = await db.insert(eventStore).values({
      eventId,
      eventType: event.eventType,
      sourceModule: event.sourceModule,
      payload: event.payload || {},
      correlationId: event.correlationId || null,
      timestamp: new Date(),
    }).returning();

    // Dispatch to subscribers
    const callbacks = this.subscribers.get(event.eventType) || [];
    for (const cb of callbacks) {
      try {
        await cb(saved[0]);
      } catch (err) {
        console.error(`[EventBackbone Error] Handler failed for ${event.eventType}:`, err);
      }
    }

    return saved[0];
  }

  subscribe(eventType: ModuleEventType, callback: (event: any) => void | Promise<void>) {
    const current = this.subscribers.get(eventType) || [];
    this.subscribers.set(eventType, [...current, callback]);
  }

  async registerSubscriber(topic: string, subscriberName: string, endpoint?: string) {
    const db = getDb();
    const inserted = await db.insert(eventRegistry).values({
      topic,
      subscriberName,
      endpoint: endpoint || null,
      status: "ACTIVE",
    }).returning();
    return inserted[0];
  }

  async getEventHistory(limit = 100) {
    const db = getDb();
    return await db.select().from(eventStore).orderBy(desc(eventStore.timestamp)).limit(limit);
  }
}

export const eventBackbone = EnterpriseEventBackbone.getInstance();
