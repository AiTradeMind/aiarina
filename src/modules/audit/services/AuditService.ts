import { auditEngine } from "../engines/AuditEngine";

export class AuditService {
  async getStatus(): Promise<any> {
    return { status: "OK", timestamp: new Date() };
  }

  async logEvent(data: any): Promise<any> {
    return await auditEngine.logEvent(data);
  }

  async verifyEvent(id: string): Promise<any> {
    return await auditEngine.verifyEvent(id);
  }

  async searchRecords(filter: any): Promise<any[]> {
    return [
      { id: 'adt_search_1', organizationId: filter.organizationId, action: 'SEARCH_TEST', sourceModule: 'CORE', severity: filter.severity || 'CRITICAL' }
    ];
  }

  async requestExport(organizationId: string, actorId: number, filter: any, format: string): Promise<any> {
    return {
      id: `exp_${Date.now()}`,
      organizationId,
      actorId,
      status: 'PENDING',
      format,
      createdAt: new Date()
    };
  }
}

export const auditService = new AuditService();
