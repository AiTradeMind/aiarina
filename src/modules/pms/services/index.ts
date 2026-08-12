import { getDb } from '../../../db/client.ts';
import { 
  pmsPortfolios,
  pmsPositions,
  pmsHoldings,
  pmsSnapshots,
  pmsExposure,
  pmsPerformance,
  pmsEvents,
  pmsAudit
} from '../../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';

export class PMSService {
  async getPortfolios() {
    const db = getDb();
    const list = await db.select().from(pmsPortfolios).orderBy(desc(pmsPortfolios.createdAt)).limit(100);
    return list;
  }

  async getPortfolio(id: number) {
    const db = getDb();
    const record = await db.select().from(pmsPortfolios).where(eq(pmsPortfolios.id, id)).limit(1);
    return record[0];
  }

  async getPositions(portfolioId?: number) {
    const db = getDb();
    let query = db.select().from(pmsPositions);
    if (portfolioId) {
        query = query.where(eq(pmsPositions.portfolioId, portfolioId)) as any;
    }
    return await query.orderBy(desc(pmsPositions.updatedAt)).limit(100);
  }

  async getHoldings(portfolioId?: number) {
    const db = getDb();
    let query = db.select().from(pmsHoldings);
    if (portfolioId) {
        query = query.where(eq(pmsHoldings.portfolioId, portfolioId)) as any;
    }
    return await query.orderBy(desc(pmsHoldings.updatedAt)).limit(100);
  }

  async getExposure(portfolioId?: number) {
    const db = getDb();
    let query = db.select().from(pmsExposure);
    if (portfolioId) {
        query = query.where(eq(pmsExposure.portfolioId, portfolioId)) as any;
    }
    return await query.orderBy(desc(pmsExposure.updatedAt)).limit(100);
  }

  async getPerformance(portfolioId?: number) {
    const db = getDb();
    let query = db.select().from(pmsPerformance);
    if (portfolioId) {
        query = query.where(eq(pmsPerformance.portfolioId, portfolioId)) as any;
    }
    return await query.orderBy(desc(pmsPerformance.updatedAt)).limit(100);
  }

  async getPnL(portfolioId?: number) {
    const db = getDb();
    // Simplified: we just return the portfolio record which has PnL
    let query = db.select({
        id: pmsPortfolios.id,
        realizedPnl: pmsPortfolios.realizedPnl,
        unrealizedPnl: pmsPortfolios.unrealizedPnl
    }).from(pmsPortfolios);
    
    if (portfolioId) {
        query = query.where(eq(pmsPortfolios.id, portfolioId)) as any;
    }
    return await query.limit(100);
  }
}
