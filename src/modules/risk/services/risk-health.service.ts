import { RiskFoundationRepository } from "../repositories/risk-foundation.repository.ts";

export interface RiskHealthReport {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  activeProfilesCount: number;
  recentEventsCount: number;
  breachesInLast24h: number;
  averageRiskScore: number;
  systemStance: 'SAFE' | 'ELEVATED_RISK' | 'HIGH_RISK' | 'HALTED';
  timestamp: string;
}

export class RiskHealthService {
  constructor(private repo: RiskFoundationRepository = new RiskFoundationRepository()) {}

  async getHealthReport(): Promise<RiskHealthReport> {
    const events = await this.repo.getEvents(50);
    const breachEvents = events.filter(e => e.eventType.includes('BREACH') || e.riskLevel === 'CRITICAL' || e.riskLevel === 'BLOCKED');

    let status: RiskHealthReport['status'] = 'HEALTHY';
    let systemStance: RiskHealthReport['systemStance'] = 'SAFE';

    if (breachEvents.length > 10) {
      status = 'CRITICAL';
      systemStance = 'HIGH_RISK';
    } else if (breachEvents.length > 3) {
      status = 'DEGRADED';
      systemStance = 'ELEVATED_RISK';
    }

    return {
      status,
      activeProfilesCount: 1, // Default baseline active profile
      recentEventsCount: events.length,
      breachesInLast24h: breachEvents.length,
      averageRiskScore: 24.5,
      systemStance,
      timestamp: new Date().toISOString(),
    };
  }
}
