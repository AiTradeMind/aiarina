import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/auth.ts";
import { eventEngine } from "../services/EventEngine.ts";
import { eventService } from "../services/EventService.ts";
import { notificationService } from "../services/NotificationService.ts";

export class NotificationController {
  // POST /api/events/publish
  public async publishEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.user?.userId || 1;
      const { type, category, data, organizationId, workspaceId, eventId } = req.body;

      const orgId = organizationId || (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = workspaceId || (req.headers["x-workspace-id"] as string) || "wks_dev_123";

      const event = await eventEngine.publishEvent(actorId, {
        eventId,
        type,
        category,
        data,
        organizationId: orgId,
        workspaceId: wksId,
      });

      res.status(201).json({ success: true, data: event });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/events
  public async listEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orgId = (req.query.organizationId as string) || (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = (req.query.workspaceId as string) || (req.headers["x-workspace-id"] as string) || "wks_dev_123";
      const category = req.query.category as string;

      const events = await eventService.listEvents({
        organizationId: orgId,
        workspaceId: wksId,
        category,
      });

      res.status(200).json({ success: true, data: events });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/events/:id
  public async getEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const event = await eventService.getEvent(id);
      if (!event) {
        res.status(404).json({ error: "Event not found." });
        return;
      }
      res.status(200).json({ success: true, data: event });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/events/replay
  public async replayEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { eventIds, organizationId, workspaceId } = req.body;

      const orgId = organizationId || (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = workspaceId || (req.headers["x-workspace-id"] as string) || "wks_dev_123";

      if (!Array.isArray(eventIds)) {
        res.status(400).json({ error: "eventIds must be an array of numeric IDs." });
        return;
      }

      await eventEngine.replayEvents(eventIds, userId, orgId, wksId);
      res.status(200).json({ success: true, message: "Replay completed successfully." });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/events/subscribe
  public async subscribe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const { category, minPriority, workspaceId, organizationId } = req.body;

      const orgId = organizationId || (req.headers["x-organization-id"] as string) || req.user?.organizationId || "org_dev_123";
      const wksId = workspaceId || (req.headers["x-workspace-id"] as string) || "wks_dev_123";

      const sub = await eventEngine.subscribe(userId, category, minPriority, wksId, orgId);
      res.status(201).json({ success: true, data: sub });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/notifications
  public async listNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const isRead = req.query.isRead !== undefined ? req.query.isRead === "true" : undefined;
      const isArchived = req.query.isArchived !== undefined ? req.query.isArchived === "true" : undefined;

      const list = await notificationService.getNotifications(userId, { isRead, isArchived });
      res.status(200).json({ success: true, data: list });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // PATCH /api/notifications/:id/read
  public async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const id = parseInt(req.params.id, 10);

      const notif = await notificationService.markAsRead(id, userId);
      res.status(200).json({ success: true, data: notif });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // PATCH /api/notifications/:id/archive
  public async archive(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const id = parseInt(req.params.id, 10);

      const notif = await notificationService.archiveNotification(id, userId);
      res.status(200).json({ success: true, data: notif });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/notifications/preferences
  public async getPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const prefs = await notificationService.getPreferences(userId);
      res.status(200).json({ success: true, data: prefs });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // PATCH /api/notifications/preferences
  public async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 1;
      const updates = req.body;

      const prefs = await notificationService.updatePreferences(userId, updates);
      res.status(200).json({ success: true, data: prefs });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
export const notificationController = new NotificationController();
