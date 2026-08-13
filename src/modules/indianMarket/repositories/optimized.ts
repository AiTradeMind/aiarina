import { getDb } from "../../../db/client.ts";
import { indianMarketEventsTable } from "../../../db/schema.ts";
import { eq, desc, gt, and } from "drizzle-orm";

export class OptimizedIndianMarketRepository {
  /**
   * Use indexed columns for filtering.
   * Avoid SELECT * by specifying columns.
   * Use limit and cursor for pagination.
   */
  async getEventsCursorPaginated(cursorId: string | null, limitCount: number = 50) {
    const db = getDb();
    
    let query = db.select({
      id: indianMarketEventsTable.id,
      eventType: indianMarketEventsTable.eventType,
      createdAt: indianMarketEventsTable.createdAt
    })
    .from(indianMarketEventsTable)
    .where(eq(indianMarketEventsTable.eventType, "MarketOpened")) // filtering by eventType instead of status
    .orderBy(desc(indianMarketEventsTable.id))
    .limit(limitCount);
    
    if (cursorId) {
      // Use cursor for pagination
      query = db.select({
        id: indianMarketEventsTable.id,
        eventType: indianMarketEventsTable.eventType,
        createdAt: indianMarketEventsTable.createdAt
      })
      .from(indianMarketEventsTable)
      .where(and(eq(indianMarketEventsTable.eventType, "MarketOpened"), gt(indianMarketEventsTable.id, cursorId)))
      .orderBy(desc(indianMarketEventsTable.id))
      .limit(limitCount);
    }
    
    return await query;
  }
}
