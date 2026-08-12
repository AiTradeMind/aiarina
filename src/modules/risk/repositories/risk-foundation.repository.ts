// @ts-nocheck
import { eq, desc } from "drizzle-orm";
import { getDb, isDatabaseConnected } from "../../../db/client.ts";
import {
  riskEngineProfiles,
  riskAssessments,
  riskEngineLimits,
  riskEngineEvents,
  riskHistory,
  riskEngineMetadata
} from "../../../db/schema.ts";
import {
  RiskEngineProfile,
  RiskAssessment,
  RiskEngineLimits,
  RiskEngineEvent,
  RiskHistoryRecord,
  RiskEngineMetadata
} from "../types/index.ts";

export class RiskFoundationRepository {
  private inMemoryProfiles: Map<string, RiskEngineProfile> = new Map();
  private inMemoryAssessments: Map<string, RiskAssessment> = new Map();
  private inMemoryLimits: Map<string, RiskEngineLimits> = new Map();
  private inMemoryEvents: RiskEngineEvent[] = [];
  private inMemoryHistory: RiskHistoryRecord[] = [];
  private inMemoryMetadata: Map<string, RiskEngineMetadata> = new Map();

  // Profile Methods
  async findProfileById(profileId: string): Promise<RiskEngineProfile | null> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const res = await db.select().from(riskEngineProfiles).where(eq(riskEngineProfiles.profileId, profileId)).limit(1);
        if (res[0]) {
          return {
            ...res[0],
            riskLevel: res[0].riskLevel as any,
            status: res[0].status as any,
            createdAt: res[0].createdAt.toISOString(),
            updatedAt: res[0].updatedAt.toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }
    return this.inMemoryProfiles.get(profileId) || null;
  }

  async findProfileByTargetId(targetId: string): Promise<RiskEngineProfile | null> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const res = await db.select().from(riskEngineProfiles).where(eq(riskEngineProfiles.targetId, targetId)).limit(1);
        if (res[0]) {
          return {
            ...res[0],
            riskLevel: res[0].riskLevel as any,
            status: res[0].status as any,
            createdAt: res[0].createdAt.toISOString(),
            updatedAt: res[0].updatedAt.toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }
    for (const profile of this.inMemoryProfiles.values()) {
      if (profile.targetId === targetId) return profile;
    }
    return null;
  }

  async createProfile(data: RiskEngineProfile): Promise<RiskEngineProfile> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const now = new Date();
        const res = await db.insert(riskEngineProfiles).values({
          profileId: data.profileId,
          name: data.name,
          riskLevel: data.riskLevel,
          targetId: data.targetId,
          status: data.status,
          createdAt: now,
          updatedAt: now,
        }).returning();
        if (res[0]) {
          return {
            ...res[0],
            riskLevel: res[0].riskLevel as any,
            status: res[0].status as any,
            createdAt: res[0].createdAt.toISOString(),
            updatedAt: res[0].updatedAt.toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }
    const profile: RiskEngineProfile = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.inMemoryProfiles.set(data.profileId, profile);
    return profile;
  }

  async updateProfile(profileId: string, updates: Partial<RiskEngineProfile>): Promise<RiskEngineProfile | null> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const res = await db.update(riskEngineProfiles)
          .set({
            ...(updates.name ? { name: updates.name } : {}),
            ...(updates.riskLevel ? { riskLevel: updates.riskLevel } : {}),
            ...(updates.status ? { status: updates.status } : {}),
            updatedAt: new Date(),
          })
          .where(eq(riskEngineProfiles.profileId, profileId))
          .returning();
        if (res[0]) {
          return {
            ...res[0],
            riskLevel: res[0].riskLevel as any,
            status: res[0].status as any,
            createdAt: res[0].createdAt.toISOString(),
            updatedAt: res[0].updatedAt.toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }
    const existing = await this.findProfileById(profileId);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.inMemoryProfiles.set(profileId, updated);
    return updated;
  }

  // Assessment Methods
  async saveAssessment(assessment: RiskAssessment): Promise<RiskAssessment> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const now = new Date();
        const res = await db.insert(riskAssessments).values({
          assessmentId: assessment.assessmentId,
          requestId: assessment.requestId,
          targetId: assessment.targetId,
          riskType: assessment.riskType,
          riskScore: assessment.riskScore,
          riskLevel: assessment.riskLevel,
          action: assessment.action,
          metrics: assessment.metrics,
          reasons: assessment.reasons,
          createdAt: now,
        }).returning();
        if (res[0]) {
          return {
            ...res[0],
            riskType: res[0].riskType as any,
            riskLevel: res[0].riskLevel as any,
            action: res[0].action as any,
            metrics: res[0].metrics as any,
            reasons: res[0].reasons as any,
            createdAt: res[0].createdAt.toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }
    const record = {
      ...assessment,
      createdAt: new Date().toISOString(),
    };
    this.inMemoryAssessments.set(assessment.assessmentId, record);
    return record;
  }

  async findAssessmentById(assessmentId: string): Promise<RiskAssessment | null> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const res = await db.select().from(riskAssessments).where(eq(riskAssessments.assessmentId, assessmentId)).limit(1);
        if (res[0]) {
          return {
            ...res[0],
            riskType: res[0].riskType as any,
            riskLevel: res[0].riskLevel as any,
            action: res[0].action as any,
            metrics: res[0].metrics as any,
            reasons: res[0].reasons as any,
            createdAt: res[0].createdAt.toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }
    return this.inMemoryAssessments.get(assessmentId) || null;
  }

  async findAssessmentsByTargetId(targetId: string, limit: number = 20): Promise<RiskAssessment[]> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const res = await db.select().from(riskAssessments).where(eq(riskAssessments.targetId, targetId)).orderBy(desc(riskAssessments.createdAt)).limit(limit);
        if (res.length > 0) {
          return res.map(r => ({
            ...r,
            riskType: r.riskType as any,
            riskLevel: r.riskLevel as any,
            action: r.action as any,
            metrics: r.metrics as any,
            reasons: r.reasons as any,
            createdAt: r.createdAt.toISOString(),
          }));
        }
      } catch {
        // Fallback
      }
    }
    const results: RiskAssessment[] = [];
    for (const a of this.inMemoryAssessments.values()) {
      if (a.targetId === targetId) results.push(a);
    }
    return results.slice(0, limit);
  }

  // Limits Methods
  async findLimitsByProfileId(profileId: string): Promise<RiskEngineLimits | null> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const res = await db.select().from(riskEngineLimits).where(eq(riskEngineLimits.profileId, profileId)).limit(1);
        if (res[0]) {
          return {
            ...res[0],
            maxPositionSize: res[0].maxPositionSize ?? 100000.0,
            maxDailyLoss: res[0].maxDailyLoss ?? 5000.0,
            maxCapitalUtilization: res[0].maxCapitalUtilization ?? 80.0,
            maxConcentrationRatio: res[0].maxConcentrationRatio ?? 25.0,
            maxDrawdown: res[0].maxDrawdown ?? 15.0,
            minLiquidityScore: res[0].minLiquidityScore ?? 60.0,
            requiredMarginRatio: res[0].requiredMarginRatio ?? 10.0,
            updatedAt: res[0].updatedAt.toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }
    return this.inMemoryLimits.get(profileId) || null;
  }

  async saveLimits(limits: RiskEngineLimits): Promise<RiskEngineLimits> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const existing = await this.findLimitsByProfileId(limits.profileId);
        if (existing) {
          const res = await db.update(riskEngineLimits)
            .set({
              maxPositionSize: limits.maxPositionSize,
              maxDailyLoss: limits.maxDailyLoss,
              maxCapitalUtilization: limits.maxCapitalUtilization,
              maxConcentrationRatio: limits.maxConcentrationRatio,
              maxDrawdown: limits.maxDrawdown,
              minLiquidityScore: limits.minLiquidityScore,
              requiredMarginRatio: limits.requiredMarginRatio,
              updatedAt: new Date(),
            })
            .where(eq(riskEngineLimits.profileId, limits.profileId))
            .returning();
          if (res[0]) {
            return {
              ...res[0],
              maxPositionSize: res[0].maxPositionSize ?? 100000.0,
              maxDailyLoss: res[0].maxDailyLoss ?? 5000.0,
              maxCapitalUtilization: res[0].maxCapitalUtilization ?? 80.0,
              maxConcentrationRatio: res[0].maxConcentrationRatio ?? 25.0,
              maxDrawdown: res[0].maxDrawdown ?? 15.0,
              minLiquidityScore: res[0].minLiquidityScore ?? 60.0,
              requiredMarginRatio: res[0].requiredMarginRatio ?? 10.0,
              updatedAt: res[0].updatedAt.toISOString(),
            };
          }
        } else {
          const res = await db.insert(riskEngineLimits).values({
            profileId: limits.profileId,
            maxPositionSize: limits.maxPositionSize,
            maxDailyLoss: limits.maxDailyLoss,
            maxCapitalUtilization: limits.maxCapitalUtilization,
            maxConcentrationRatio: limits.maxConcentrationRatio,
            maxDrawdown: limits.maxDrawdown,
            minLiquidityScore: limits.minLiquidityScore,
            requiredMarginRatio: limits.requiredMarginRatio,
            updatedAt: new Date(),
          }).returning();
          if (res[0]) {
            return {
              ...res[0],
              maxPositionSize: res[0].maxPositionSize ?? 100000.0,
              maxDailyLoss: res[0].maxDailyLoss ?? 5000.0,
              maxCapitalUtilization: res[0].maxCapitalUtilization ?? 80.0,
              maxConcentrationRatio: res[0].maxConcentrationRatio ?? 25.0,
              maxDrawdown: res[0].maxDrawdown ?? 15.0,
              minLiquidityScore: res[0].minLiquidityScore ?? 60.0,
              requiredMarginRatio: res[0].requiredMarginRatio ?? 10.0,
              updatedAt: res[0].updatedAt.toISOString(),
            };
          }
        }
      } catch {
        // Fallback
      }
    }
    const rec = { ...limits, updatedAt: new Date().toISOString() };
    this.inMemoryLimits.set(limits.profileId, rec);
    return rec;
  }

  // Events Methods
  async saveEvent(event: RiskEngineEvent): Promise<RiskEngineEvent> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const res = await db.insert(riskEngineEvents).values({
          eventId: event.eventId,
          assessmentId: event.assessmentId || null,
          eventType: event.eventType,
          riskType: event.riskType,
          riskLevel: event.riskLevel,
          details: event.details,
          timestamp: new Date(),
        }).returning();
        if (res[0]) {
          return {
            ...res[0],
            riskType: res[0].riskType as any,
            riskLevel: res[0].riskLevel as any,
            details: res[0].details as any,
            timestamp: res[0].timestamp.toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }
    const rec = { ...event, timestamp: new Date().toISOString() };
    this.inMemoryEvents.push(rec);
    return rec;
  }

  async getEvents(limit: number = 50): Promise<RiskEngineEvent[]> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const res = await db.select().from(riskEngineEvents).orderBy(desc(riskEngineEvents.timestamp)).limit(limit);
        if (res.length > 0) {
          return res.map(e => ({
            ...e,
            riskType: e.riskType as any,
            riskLevel: e.riskLevel as any,
            details: e.details as any,
            timestamp: e.timestamp.toISOString(),
          }));
        }
      } catch {
        // Fallback
      }
    }
    return this.inMemoryEvents.slice(-limit).reverse();
  }

  // History Methods
  async saveHistory(history: RiskHistoryRecord): Promise<RiskHistoryRecord> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const res = await db.insert(riskHistory).values({
          historyId: history.historyId,
          targetId: history.targetId,
          riskScore: history.riskScore,
          riskLevel: history.riskLevel,
          metrics: history.metrics,
          createdAt: new Date(),
        }).returning();
        if (res[0]) {
          return {
            ...res[0],
            riskLevel: res[0].riskLevel as any,
            metrics: res[0].metrics as any,
            createdAt: res[0].createdAt.toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }
    const rec = { ...history, createdAt: new Date().toISOString() };
    this.inMemoryHistory.push(rec);
    return rec;
  }

  async getHistoryByTarget(targetId: string, limit: number = 20): Promise<RiskHistoryRecord[]> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const res = await db.select().from(riskHistory).where(eq(riskHistory.targetId, targetId)).orderBy(desc(riskHistory.createdAt)).limit(limit);
        if (res.length > 0) {
          return res.map(h => ({
            ...h,
            riskLevel: h.riskLevel as any,
            metrics: h.metrics as any,
            createdAt: h.createdAt.toISOString(),
          }));
        }
      } catch {
        // Fallback
      }
    }
    return this.inMemoryHistory.filter(h => h.targetId === targetId).slice(-limit).reverse();
  }

  // Metadata Methods
  async findMetadataByProfileId(profileId: string): Promise<RiskEngineMetadata | null> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const res = await db.select().from(riskEngineMetadata).where(eq(riskEngineMetadata.profileId, profileId)).limit(1);
        if (res[0]) {
          return {
            ...res[0],
            volatilityThreshold: res[0].volatilityThreshold ?? 30.0,
            marginCallLevel: res[0].marginCallLevel ?? 85.0,
            tags: (res[0].tags as string[]) || [],
            customRules: (res[0].customRules as Record<string, any>) || {},
            createdAt: res[0].createdAt.toISOString(),
            updatedAt: res[0].updatedAt.toISOString(),
          };
        }
      } catch {
        // Fallback
      }
    }
    return this.inMemoryMetadata.get(profileId) || null;
  }

  async saveMetadata(metadata: RiskEngineMetadata): Promise<RiskEngineMetadata> {
    if (isDatabaseConnected()) {
      try {
        const db = getDb();
        const existing = await this.findMetadataByProfileId(metadata.profileId);
        if (existing) {
          const res = await db.update(riskEngineMetadata)
            .set({
              volatilityThreshold: metadata.volatilityThreshold,
              marginCallLevel: metadata.marginCallLevel,
              tags: metadata.tags,
              customRules: metadata.customRules,
              updatedAt: new Date(),
            })
            .where(eq(riskEngineMetadata.profileId, metadata.profileId))
            .returning();
          if (res[0]) {
            return {
              ...res[0],
              volatilityThreshold: res[0].volatilityThreshold ?? 30.0,
              marginCallLevel: res[0].marginCallLevel ?? 85.0,
              tags: (res[0].tags as string[]) || [],
              customRules: (res[0].customRules as Record<string, any>) || {},
              createdAt: res[0].createdAt.toISOString(),
              updatedAt: res[0].updatedAt.toISOString(),
            };
          }
        } else {
          const res = await db.insert(riskEngineMetadata).values({
            profileId: metadata.profileId,
            volatilityThreshold: metadata.volatilityThreshold,
            marginCallLevel: metadata.marginCallLevel,
            tags: metadata.tags,
            customRules: metadata.customRules,
            createdAt: new Date(),
            updatedAt: new Date(),
          }).returning();
          if (res[0]) {
            return {
              ...res[0],
              volatilityThreshold: res[0].volatilityThreshold ?? 30.0,
              marginCallLevel: res[0].marginCallLevel ?? 85.0,
              tags: (res[0].tags as string[]) || [],
              customRules: (res[0].customRules as Record<string, any>) || {},
              createdAt: res[0].createdAt.toISOString(),
              updatedAt: res[0].updatedAt.toISOString(),
            };
          }
        }
      } catch {
        // Fallback
      }
    }
    const rec = { ...metadata, updatedAt: new Date().toISOString() };
    this.inMemoryMetadata.set(metadata.profileId, rec);
    return rec;
  }
}

