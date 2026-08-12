import logger from '../../../lib/logger';

export interface IncidentRecord {
  id: string;
  title: string;
  severity: 'SEV-1 (Critical)' | 'SEV-2 (High)' | 'SEV-3 (Medium)' | 'SEV-4 (Low)';
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  assignedTo: string;
  createdAt: Date;
  resolvedAt?: Date;
  rootCauseAnalysis?: string;
  timeline: { timestamp: Date; note: string }[];
}

export class IncidentManagementEngine {
  private static instance: IncidentManagementEngine;
  private incidents: Map<string, IncidentRecord> = new Map();

  private constructor() {
    this.seedIncidents();
  }

  public static getInstance(): IncidentManagementEngine {
    if (!IncidentManagementEngine.instance) {
      IncidentManagementEngine.instance = new IncidentManagementEngine();
    }
    return IncidentManagementEngine.instance;
  }

  private seedIncidents(): void {
    const id = 'inc_101';
    this.incidents.set(id, {
      id,
      title: 'Provider Latency Spike on Anthropic Gateway',
      severity: 'SEV-3 (Medium)',
      status: 'RESOLVED',
      assignedTo: 'SRE Lead',
      createdAt: new Date(Date.now() - 86400000),
      resolvedAt: new Date(Date.now() - 82800000),
      rootCauseAnalysis: 'Upstream regional congestion resolved by cloud provider automatic failover.',
      timeline: [
        { timestamp: new Date(Date.now() - 86400000), note: 'Incident detected by anomaly monitor.' },
        { timestamp: new Date(Date.now() - 82800000), note: 'Latency normalized. Incident closed.' }
      ]
    });
  }

  public getIncidents(): IncidentRecord[] {
    return Array.from(this.incidents.values());
  }

  public createIncident(title: string, severity: any, assignedTo: string): IncidentRecord {
    const id = `inc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const incident: IncidentRecord = {
      id,
      title,
      severity,
      status: 'OPEN',
      assignedTo,
      createdAt: new Date(),
      timeline: [{ timestamp: new Date(), note: `Incident created with severity ${severity}.` }]
    };
    this.incidents.set(id, incident);
    logger.error({ incidentId: id, title, severity }, 'Enterprise incident created');
    return incident;
  }

  public updateIncidentStatus(id: string, status: any, note?: string): void {
    const inc = this.incidents.get(id);
    if (!inc) throw new Error(`Incident not found: ${id}`);
    inc.status = status;
    if (status === 'RESOLVED') inc.resolvedAt = new Date();
    if (note) inc.timeline.push({ timestamp: new Date(), note });
    logger.info({ incidentId: id, status }, 'Incident status updated');
  }
}
