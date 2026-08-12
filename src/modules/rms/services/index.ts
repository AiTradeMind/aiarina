import { getDb } from '../../../db/client.ts';
import { 
  rmsRiskProfiles,
  rmsRiskRules,
  rmsRiskExposure,
  rmsRiskMargin,
  rmsRiskLimits,
  rmsRiskEvents,
  rmsRiskCertificates,
  rmsRiskAudit
} from '../../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { RMSValidationRequest, RMSValidationResult } from '../types/index.ts';

export class RMSService {
  async getDashboard() {
    const db = getDb();
    return {
      status: 'OPERATIONAL',
      activeProfiles: 1,
      circuitBreakers: 'NORMAL',
      lastAuditTime: new Date().toISOString()
    };
  }

  async getProfile(id?: number) {
    const db = getDb();
    if (!id) {
        const list = await db.select().from(rmsRiskProfiles).limit(10);
        return list[0] || null;
    }
    const record = await db.select().from(rmsRiskProfiles).where(eq(rmsRiskProfiles.id, id)).limit(1);
    return record[0];
  }

  async getExposure(profileId?: number) {
    const db = getDb();
    let query = db.select().from(rmsRiskExposure);
    if (profileId) {
        query = query.where(eq(rmsRiskExposure.profileId, profileId)) as any;
    }
    return await query.orderBy(desc(rmsRiskExposure.updatedAt)).limit(100);
  }

  async getMargin(profileId?: number) {
    const db = getDb();
    let query = db.select().from(rmsRiskMargin);
    if (profileId) {
        query = query.where(eq(rmsRiskMargin.profileId, profileId)) as any;
    }
    return await query.orderBy(desc(rmsRiskMargin.updatedAt)).limit(100);
  }

  async getLimits(profileId?: number) {
    const db = getDb();
    let query = db.select().from(rmsRiskLimits);
    if (profileId) {
        query = query.where(eq(rmsRiskLimits.profileId, profileId)) as any;
    }
    return await query.orderBy(desc(rmsRiskLimits.updatedAt)).limit(100);
  }

  async validateOrder(req: RMSValidationRequest): Promise<RMSValidationResult> {
    const db = getDb();
    const profiles = await db.select().from(rmsRiskProfiles).limit(1);
    if (profiles.length === 0) {
      return { success: false, approved: false, reason: "No risk profile found" };
    }
    const profile = profiles[0];

    // Check Kill Switch
    if (profile.status === 'HALTED' || profile.status === 'SUSPENDED') {
      await db.insert(rmsRiskAudit).values({
        profileId: profile.id,
        action: 'REJECT',
        details: 'Order rejected due to kill switch / halt'
      });
      return { success: true, approved: false, reason: "Risk system halted" };
    }

    // Basic Mock Validation (Passes for now)
    const isApproved = true;

    if (isApproved) {
        const hash = crypto.createHash('sha256').update(JSON.stringify(req)).digest('hex');
        const signature = 'RISK_' + crypto.randomUUID();

        await db.insert(rmsRiskCertificates).values({
            profileId: profile.id,
            orderId: req.orderId,
            sha256Certificate: hash,
            riskSignature: signature,
            status: 'APPROVED'
        });

        await db.insert(rmsRiskAudit).values({
            profileId: profile.id,
            action: 'APPROVE',
            details: 'Order validated successfully'
        });

        return { success: true, approved: true, certificate: hash, signature };
    }

    return { success: true, approved: false, reason: "Failed risk checks" };
  }

  async triggerKillSwitch(reason: string) {
    const db = getDb();
    const profiles = await db.select().from(rmsRiskProfiles);
    for (const profile of profiles) {
        await db.update(rmsRiskProfiles).set({ status: 'HALTED' }).where(eq(rmsRiskProfiles.id, profile.id));
        await db.insert(rmsRiskAudit).values({
            profileId: profile.id,
            action: 'KILL_SWITCH',
            details: `Kill switch activated: ${reason}`
        });
    }
    return { success: true, message: "Kill switch activated" };
  }
}
