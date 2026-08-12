import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../../../db/client.ts";
import { sql, eq } from "drizzle-orm";
import { eventEngine } from "../services/EventEngine.ts";
import { eventService } from "../services/EventService.ts";
import { notificationService } from "../services/NotificationService.ts";
import { eventRepository } from "../repositories/EventRepository.ts";
import { notificationRepository } from "../repositories/NotificationRepository.ts";
import { PermissionService } from "../../rbac/services/PermissionService.ts";
import { notificationController } from "../controllers/NotificationController.ts";

describe("Enterprise Event Center & Notification Engine Tests", () => {
  let permissionService: PermissionService;

  const testUserId = 1;
  const teamMemberId = 2;
  const externalUserId = 3;

  const orgId = "org-notif-alpha";
  const crossTenantOrgId = "org-notif-beta";
  const workspaceId = "wks-notif-1";

  beforeAll(async () => {
    permissionService = new PermissionService();

    // 1. Ensure notification tables are created
    await eventRepository.ensureNotificationTables();

    // 2. Setup RBAC permissions (with safety try-catch for pre-existing rows)
    try {
      await permissionService.createPermission("workspace.read", "Read workspace", "Workspace reader");
    } catch {}
    try {
      await permissionService.createPermission("workspace.update", "Update workspace", "Workspace updater");
    } catch {}

    // 3. Setup RBAC roles
    try {
      await permissionService.createCustomRole("MEMBER", "Member", "Standard member");
    } catch {}
    try {
      await permissionService.assignPermissionToRole("MEMBER", "workspace.read");
    } catch {}
    try {
      await permissionService.assignPermissionToRole("MEMBER", "workspace.update");
    } catch {}

    // 4. Assign roles to test users
    try {
      await permissionService.assignRoleToUser(testUserId, "MEMBER", orgId, workspaceId);
    } catch {}
    try {
      await permissionService.assignRoleToUser(teamMemberId, "MEMBER", orgId, workspaceId);
    } catch {}
    try {
      await permissionService.assignRoleToUser(externalUserId, "MEMBER", crossTenantOrgId, "wks-notif-2");
    } catch {}
  });

  it("should securely publish a valid event and verify persistence", async () => {
    const event = await eventEngine.publishEvent(testUserId, {
      type: "research.created",
      category: "RESEARCH",
      organizationId: orgId,
      workspaceId: workspaceId,
      data: {
        title: "New Research Report",
        message: "A new research document was submitted for review.",
        priority: "MEDIUM",
      },
    });

    expect(event).toBeDefined();
    expect(event.type).toBe("research.created");
    expect(event.category).toBe("RESEARCH");
    expect(event.organizationId).toBe(orgId);

    const saved = await eventService.getEvent(event.id);
    expect(saved).not.toBeNull();
    expect(saved!.eventId).toBe(event.eventId);
  });

  it("should prevent duplicate event insertion (deduplication)", async () => {
    const uniqueEventId = `evt_dedup_${Date.now()}`;

    // Publish first time
    const event1 = await eventEngine.publishEvent(testUserId, {
      eventId: uniqueEventId,
      type: "task.created",
      category: "COLLAB",
      organizationId: orgId,
      workspaceId: workspaceId,
      data: { title: "Deduplication Test" },
    });

    // Publish second time with identical eventId
    const event2 = await eventEngine.publishEvent(testUserId, {
      eventId: uniqueEventId,
      type: "task.created",
      category: "COLLAB",
      organizationId: orgId,
      workspaceId: workspaceId,
      data: { title: "Deduplication Test Second" },
    });

    // The returned event must be identical (no duplicate database row)
    expect(event2.id).toBe(event1.id);
  });

  it("should allow a user to register an event category subscription", async () => {
    const sub = await eventEngine.subscribe(
      teamMemberId,
      "RESEARCH",
      "LOW",
      workspaceId,
      orgId
    );

    expect(sub).toBeDefined();
    expect(sub.userId).toBe(teamMemberId);
    expect(sub.category).toBe("RESEARCH");
    expect(sub.minPriority).toBe("LOW");

    const activeSubs = await eventService.getUserSubscriptions(teamMemberId);
    expect(activeSubs.length).toBeGreaterThanOrEqual(1);
    expect(activeSubs.some(s => s.category === "RESEARCH")).toBe(true);
  });

  it("should generate and deliver a notification on matched event publish", async () => {
    // teamMemberId is subscribed to RESEARCH
    const event = await eventEngine.publishEvent(testUserId, {
      type: "research.updated",
      category: "RESEARCH",
      organizationId: orgId,
      workspaceId: workspaceId,
      data: {
        title: "Research Revision",
        message: "The primary report was updated.",
        priority: "HIGH",
      },
    });

    const notifications = await notificationService.getNotifications(teamMemberId);
    expect(notifications.length).toBeGreaterThanOrEqual(1);
    
    const matching = notifications.find(n => n.eventId === event.id);
    expect(matching).toBeDefined();
    expect(matching!.title).toBe("Research Revision");
    expect(matching!.message).toBe("The primary report was updated.");
    expect(matching!.priority).toBe("HIGH");
  });

  it("should strictly respect user preference mutes and disablement", async () => {
    // 1. Subscribe testUserId to GOVERNANCE
    await eventEngine.subscribe(
      testUserId,
      "GOVERNANCE",
      "LOW",
      workspaceId,
      orgId
    );

    // 2. Mute GOVERNANCE for testUserId in preferences
    await notificationService.updatePreferences(testUserId, {
      muteCategories: ["GOVERNANCE"],
    });

    // 3. Publish GOVERNANCE event
    const event = await eventEngine.publishEvent(testUserId, {
      type: "governance.proposal",
      category: "GOVERNANCE",
      organizationId: orgId,
      workspaceId: workspaceId,
      data: {
        title: "New Policy Draft",
        priority: "MEDIUM",
      },
    });

    // 4. Verify testUserId did NOT get notified
    const notifications = await notificationService.getNotifications(testUserId);
    const received = notifications.find(n => n.eventId === event.id);
    expect(received).toBeUndefined();
  });

  it("should prohibit cross-tenant notifications (tenant isolation)", async () => {
    // externalUserId belongs to beta org, and is subscribed to RESEARCH
    await eventEngine.subscribe(
      externalUserId,
      "RESEARCH",
      "LOW",
      "wks-notif-2",
      crossTenantOrgId
    );

    // Publish event within alpha org
    const event = await eventEngine.publishEvent(testUserId, {
      type: "research.published",
      category: "RESEARCH",
      organizationId: orgId,
      workspaceId: workspaceId,
      data: {
        title: "Confidential Alpha Research",
        priority: "CRITICAL",
      },
    });

    // Verify external user (beta org) did NOT receive the notification
    const notifications = await notificationService.getNotifications(externalUserId);
    const received = notifications.find(n => n.eventId === event.id);
    expect(received).toBeUndefined();
  });

  it("should respect user subscription minPriority level filters", async () => {
    // Subscribe user 2 to AUDIT with CRITICAL priority
    await eventEngine.subscribe(
      teamMemberId,
      "AUDIT",
      "CRITICAL",
      workspaceId,
      orgId
    );

    // Publish MEDIUM audit event
    const eventMedium = await eventEngine.publishEvent(testUserId, {
      type: "audit.access",
      category: "AUDIT",
      organizationId: orgId,
      workspaceId: workspaceId,
      data: {
        title: "Standard Audit Entry",
        priority: "MEDIUM",
      },
    });

    // Publish CRITICAL audit event
    const eventCritical = await eventEngine.publishEvent(testUserId, {
      type: "audit.breach",
      category: "AUDIT",
      organizationId: orgId,
      workspaceId: workspaceId,
      data: {
        title: "Critical Audit Alert",
        priority: "CRITICAL",
      },
    });

    const notifications = await notificationService.getNotifications(teamMemberId);
    
    // Medium event should NOT notify
    const receivedMedium = notifications.find(n => n.eventId === eventMedium.id);
    expect(receivedMedium).toBeUndefined();

    // Critical event SHOULD notify
    const receivedCritical = notifications.find(n => n.eventId === eventCritical.id);
    expect(receivedCritical).toBeDefined();
  });

  it("should securely replay historical events", async () => {
    const event = await eventEngine.publishEvent(testUserId, {
      type: "research.completed",
      category: "RESEARCH",
      organizationId: orgId,
      workspaceId: workspaceId,
      data: {
        title: "Final Replay Target Report",
        priority: "HIGH",
      },
    });

    // Manually delete the notification that was generated from dispatch to simulate clean slate
    const db = getDb();
    await db.execute(sql`DELETE FROM enterprise_notifications WHERE event_id = ${event.id}`);

    // Confirm deleted
    const preNotifications = await notificationService.getNotifications(teamMemberId);
    expect(preNotifications.find(n => n.eventId === event.id)).toBeUndefined();

    // Replay events
    await eventEngine.replayEvents([event.id], teamMemberId, orgId, workspaceId);

    // Verify notification was re-delivered
    const postNotifications = await notificationService.getNotifications(teamMemberId);
    expect(postNotifications.find(n => n.eventId === event.id)).toBeDefined();
  });

  it("should verify correct API controller action response flows", async () => {
    let statusCode: number | null = null;
    let responseData: any = null;

    const mockRes = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      }
    } as any;

    const mockReq = {
      user: { userId: testUserId, organizationId: orgId },
      body: {
        type: "research.api_test",
        category: "RESEARCH",
        organizationId: orgId,
        workspaceId: workspaceId,
        data: { title: "API Controller Test" }
      },
      headers: {}
    } as any;

    await notificationController.publishEvent(mockReq, mockRes);

    expect(statusCode).toBe(201);
    expect(responseData.success).toBe(true);
    expect(responseData.data.type).toBe("research.api_test");
  });
});
