import { getDb } from "../../../db/client.ts";
import { auditEvents, administrationLogs, eventLog } from "../../../db/schema.ts";
import logger from "../../../lib/logger.ts";

export interface AuditLogOptions {
  organizationId?: string;
  userId?: number;
  action: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  entityId?: string;
}

/**
 * Service for capturing immutable audit trails and system events.
 * Implements Stage 12.6 enterprise observability requirements.
 */
export class AuditService {
  /**
   * Logs a security or business critical event to the persistent audit trail.
   */
  async logAuditEvent(options: AuditLogOptions) {
    try {
      const db = getDb();
      await db.insert(auditEvents).values({
        organizationId: options.organizationId,
        userId: options.userId,
        action: options.action,
        status: options.status,
        details: options.details,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
      });

      // Also log to application logs for real-time monitoring
      logger.info({
        type: "AUDIT_EVENT",
        ...options
      }, `Audit: ${options.action} - ${options.status}`);
    } catch (error) {
      logger.error({ error, options }, "Failed to persist audit event");
    }
  }

  /**
   * Logs high-level business events to the event bus log.
   */
  async logBusinessEvent(type: string, source: string, options: Partial<AuditLogOptions> & { payload?: any }) {
    try {
      const db = getDb();
      await db.insert(eventLog).values({
        eventType: type,
        source: source,
        organizationId: options.organizationId,
        userId: options.userId,
        entityId: options.entityId,
        payload: options.payload,
      });

      logger.info({
        type: "BUSINESS_EVENT",
        eventType: type,
        source,
        ...options
      }, `Business Event: ${type} from ${source}`);
    } catch (error) {
      logger.error({ error, type, source }, "Failed to persist business event");
    }
  }

  /**
   * Logs administrative actions and system alerts.
   */
  async logAdminAction(action: string, severity: 'info' | 'warning' | 'critical', actorId?: number) {
    try {
      const db = getDb();
      await db.insert(administrationLogs).values({
        action,
        severity,
        actorId,
      });

      const logMethod = severity === 'critical' ? 'error' : severity === 'warning' ? 'warn' : 'info';
      logger[logMethod]({
        type: "ADMIN_ACTION",
        action,
        severity,
        actorId
      }, `Admin Action: ${action} (${severity})`);
    } catch (error) {
      logger.error({ error, action }, "Failed to persist admin action");
    }
  }
}

export const auditService = new AuditService();
