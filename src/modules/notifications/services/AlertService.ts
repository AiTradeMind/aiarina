import { alertRepository, EnterpriseAlertItem } from "../repositories/AlertRepository.ts";
import { WebSocketManager } from "../../../infrastructure/websocket/index.ts";

export class AlertService {
  async getAlerts(filters?: {
    severity?: string;
    status?: string;
    sourceModule?: string;
    aiModelId?: string;
    market?: string;
    category?: string;
    exchange?: string;
    labId?: string;
  }): Promise<EnterpriseAlertItem[]> {
    return await alertRepository.listAlerts(filters);
  }

  async getAlertById(alertId: string): Promise<EnterpriseAlertItem | null> {
    return await alertRepository.findByAlertId(alertId);
  }

  async markAsRead(alertId: string): Promise<EnterpriseAlertItem> {
    const alert = await alertRepository.findByAlertId(alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found.`);
    const updated = await alertRepository.updateAlertStatus(alertId, 'READ');
    if (!updated) throw new Error(`Failed to update alert ${alertId} to READ.`);
    
    // Broadcast real-time update via WebSocket
    try {
      WebSocketManager.getInstance().emit('alert_event', { type: 'ALERT_UPDATED', data: updated });
    } catch (e) {
      // ignore WS error if offline
    }
    return updated;
  }

  async acknowledgeAlert(alertId: string): Promise<EnterpriseAlertItem> {
    const alert = await alertRepository.findByAlertId(alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found.`);
    const updated = await alertRepository.updateAlertStatus(alertId, 'ACKNOWLEDGED', { acknowledgedAt: new Date() });
    if (!updated) throw new Error(`Failed to acknowledge alert ${alertId}.`);

    try {
      WebSocketManager.getInstance().emit('alert_event', { type: 'ALERT_UPDATED', data: updated });
    } catch (e) {}
    return updated;
  }

  async resolveAlert(alertId: string): Promise<EnterpriseAlertItem> {
    const alert = await alertRepository.findByAlertId(alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found.`);
    const updated = await alertRepository.updateAlertStatus(alertId, 'RESOLVED', { resolvedAt: new Date() });
    if (!updated) throw new Error(`Failed to resolve alert ${alertId}.`);

    try {
      WebSocketManager.getInstance().emit('alert_event', { type: 'ALERT_UPDATED', data: updated });
    } catch (e) {}
    return updated;
  }

  async triggerEventAlert(eventData: {
    eventId?: string;
    alertType: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    sourceModule: string;
    sourceEntity?: string;
    aiModelId?: string;
    provider?: string;
    version?: string;
    market?: string;
    category?: string;
    exchange?: string;
    labId?: string;
    instrument?: string;
    message: string;
    metadata?: any;
  }): Promise<EnterpriseAlertItem> {
    const alert = await alertRepository.createAlert({
      alertId: `ALT-${Math.floor(10000 + Math.random() * 90000)}`,
      eventId: eventData.eventId || `EVT-${Date.now()}`,
      alertType: eventData.alertType,
      severity: eventData.severity,
      sourceModule: eventData.sourceModule,
      sourceEntity: eventData.sourceEntity,
      aiModelId: eventData.aiModelId,
      provider: eventData.provider,
      version: eventData.version,
      market: eventData.market || 'INDIAN',
      category: eventData.category || 'TRADING',
      exchange: eventData.exchange || 'NSE',
      labId: eventData.labId,
      instrument: eventData.instrument,
      message: eventData.message,
      eventTimestamp: new Date(),
      status: 'NEW',
      metadata: eventData.metadata || {}
    });

    try {
      WebSocketManager.getInstance().emit('alert_event', { type: 'ALERT_CREATED', data: alert });
    } catch (e) {}

    return alert;
  }
}

export const alertService = new AlertService();
