import { getDb } from "../../../db/client.ts";
import { ep16AccountingPeriods } from "../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { PeriodType } from "../types/index.ts";

export class PeriodRepository {
  async findAll() {
    const db = getDb();
    return await db.select().from(ep16AccountingPeriods).orderBy(desc(ep16AccountingPeriods.startDate));
  }

  async findById(id: number) {
    const db = getDb();
    const res = await db.select().from(ep16AccountingPeriods).where(eq(ep16AccountingPeriods.id, id)).limit(1);
    return res[0] || null;
  }

  async findActivePeriod() {
    const db = getDb();
    const res = await db.select().from(ep16AccountingPeriods).where(eq(ep16AccountingPeriods.status, "OPEN")).limit(1);
    return res[0] || null;
  }

  async createPeriod(data: { periodName: string; periodType: PeriodType; startDate: Date; endDate: Date; status?: "OPEN" | "CLOSED" }) {
    const db = getDb();
    const inserted = await db.insert(ep16AccountingPeriods).values({
      periodName: data.periodName,
      periodType: data.periodType,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || "OPEN",
    }).returning();
    return inserted[0];
  }

  async updateStatus(id: number, status: "OPEN" | "CLOSED", closedAt?: Date) {
    const db = getDb();
    const updated = await db.update(ep16AccountingPeriods)
      .set({
        status,
        ...(closedAt && { closedAt }),
      })
      .where(eq(ep16AccountingPeriods.id, id))
      .returning();
    return updated[0];
  }
}
