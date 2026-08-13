import { getDb } from '../../../db/client.ts';
import { 
  ep15TradeRegistry,
  ep15TradeJournal,
  ep15TradeTimeline,
  ep15TradeReplay,
  ep15TradeEvidence,
  ep15TradePerformance,
  ep15TradeCertificate,
  ep15TradeAudit,
  ep15TradeEvents
} from '../../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export class TradeJournalService {
  async getTrades() {
    const db = getDb();
    return await db.select().from(ep15TradeRegistry).orderBy(desc(ep15TradeRegistry.createdAt)).limit(100);
  }

  async getTrade(id: number) {
    const db = getDb();
    const records = await db.select().from(ep15TradeRegistry).where(eq(ep15TradeRegistry.id, id)).limit(1);
    return records[0] || null;
  }

  async getJournal(tradeId?: number) {
    const db = getDb();
    let query = db.select().from(ep15TradeJournal);
    if (tradeId) {
        query = query.where(eq(ep15TradeJournal.tradeId, tradeId)) as any;
    }
    return await query.orderBy(desc(ep15TradeJournal.recordedAt)).limit(100);
  }

  async getTimeline(tradeId?: number) {
    const db = getDb();
    let query = db.select().from(ep15TradeTimeline);
    if (tradeId) {
        query = query.where(eq(ep15TradeTimeline.tradeId, tradeId)) as any;
    }
    return await query.orderBy(desc(ep15TradeTimeline.updatedAt)).limit(100);
  }
  
  async getReplay(tradeId?: number) {
    const db = getDb();
    let query = db.select().from(ep15TradeReplay);
    if (tradeId) {
        query = query.where(eq(ep15TradeReplay.tradeId, tradeId)) as any;
    }
    return await query.orderBy(desc(ep15TradeReplay.generatedAt)).limit(100);
  }

  async getEvidence(tradeId?: number) {
    const db = getDb();
    let query = db.select().from(ep15TradeEvidence);
    if (tradeId) {
        query = query.where(eq(ep15TradeEvidence.tradeId, tradeId)) as any;
    }
    return await query.orderBy(desc(ep15TradeEvidence.storedAt)).limit(100);
  }

  async getPerformance(tradeId?: number) {
    const db = getDb();
    let query = db.select().from(ep15TradePerformance);
    if (tradeId) {
        query = query.where(eq(ep15TradePerformance.tradeId, tradeId)) as any;
    }
    return await query.orderBy(desc(ep15TradePerformance.calculatedAt)).limit(100);
  }
}
