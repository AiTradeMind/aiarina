import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../../../db/client.ts";
import { sql, eq } from "drizzle-orm";
import { collabMentions } from "../../../db/schema.ts";
import { CollaborationRepository } from "../repositories/CollaborationRepository.ts";
import { CollaborationService } from "../services/CollaborationService.ts";
import { CollaborationEngine } from "../services/CollaborationEngine.ts";
import { PermissionService } from "../../rbac/services/PermissionService.ts";

describe("Enterprise Team Collaboration & Workspace Sharing Tests", () => {
  let collabRepo: CollaborationRepository;
  let collabService: CollaborationService;
  let collabEngine: CollaborationEngine;
  let permissionService: PermissionService;

  const testUserId = 1;
  const teamMemberId = 2;
  const externalUserId = 3;

  const orgId = "org-collab-alpha";
  const crossTenantOrgId = "org-collab-beta";
  const workspaceId = "wks-collab-1";

  beforeAll(async () => {
    collabRepo = new CollaborationRepository();
    collabService = new CollaborationService();
    collabEngine = new CollaborationEngine();
    permissionService = new PermissionService();

    // Ensure database tables exist for both RBAC and Collab modules
    await collabRepo.ensureCollabTables();
    await permissionService.createPermission("workspace.read", "Read workspace", "Workspace reader");
    await permissionService.createPermission("workspace.update", "Update workspace", "Workspace updater");
    await permissionService.createPermission("research.export", "Export research", "Research exporter");

    // Assign RBAC roles & permissions
    await permissionService.createCustomRole("MEMBER", "Member", "Standard member");
    await permissionService.assignPermissionToRole("MEMBER", "workspace.read");
    await permissionService.assignPermissionToRole("MEMBER", "workspace.update");
    await permissionService.assignPermissionToRole("MEMBER", "research.export");

    await permissionService.assignRoleToUser(testUserId, "MEMBER", orgId, workspaceId);
    await permissionService.assignRoleToUser(teamMemberId, "MEMBER", orgId, workspaceId);
    
    // External user belongs to beta org, has no role/permission in alpha org
    await permissionService.assignRoleToUser(externalUserId, "MEMBER", crossTenantOrgId, "wks-collab-2");
  });

  it("should verify collaboration database tables exist", async () => {
    const db = getDb();
    const tables = [
      "collab_comments",
      "collab_mentions",
      "collab_tasks",
      "collab_shares",
      "collab_activity",
      "collab_presence"
    ];

    for (const table of tables) {
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = ${table}
        )
      `);
      expect(result[0]?.exists).toBe(true);
    }
  });

  describe("Comments & Mentions Engine", () => {
    it("should support threaded comments, pinning, resolving, and parse mentions", async () => {
      // 1. Post root comment
      const rootComment = await collabEngine.postComment(
        testUserId,
        "Welcome to the workspace! Mentioning @2 to check status.",
        "research-123",
        "RESEARCH",
        undefined,
        orgId,
        workspaceId
      );
      expect(rootComment).toBeDefined();
      expect(rootComment.content).toContain("Welcome to the workspace!");
      expect(rootComment.parentId).toBeNull();

      // 2. Reply to root comment
      const replyComment = await collabEngine.postComment(
        teamMemberId,
        "Looking into it now.",
        "research-123",
        "RESEARCH",
        rootComment.id,
        orgId,
        workspaceId
      );
      expect(replyComment).toBeDefined();
      expect(replyComment.parentId).toBe(rootComment.id);

      // 3. Verify Mentions are parsed & recorded
      const db = getDb();
      const mentions = await db.select().from(collabMentions).where(eq(collabMentions.commentId, rootComment.id));
      expect(mentions.length).toBe(1);
      expect(mentions[0].userId).toBe(teamMemberId);

      // 4. Pin/Unpin comment
      const pinned = await collabEngine.togglePinComment(rootComment.id, testUserId, orgId, workspaceId);
      expect(pinned.isPinned).toBe(true);

      const unpinned = await collabEngine.togglePinComment(rootComment.id, testUserId, orgId, workspaceId);
      expect(unpinned.isPinned).toBe(false);

      // 5. Resolve comment
      const resolved = await collabEngine.resolveComment(rootComment.id, teamMemberId, orgId, workspaceId);
      expect(resolved.isResolved).toBe(true);
    });

    it("should prevent comment creation with invalid resource types", async () => {
      await expect(
        collabEngine.postComment(testUserId, "Hello", "res-1", "INVALID_TYPE", undefined, orgId, workspaceId)
      ).rejects.toThrow("Invalid resource type");
    });
  });

  describe("Tasks Engine", () => {
    it("should allow creating, updating and listing tasks", async () => {
      const task = await collabEngine.createTask(
        testUserId,
        "Review AI Model Parameters",
        "Perform regression tests on model coefficients",
        teamMemberId,
        new Date(Date.now() + 86400000),
        "HIGH",
        "TODO",
        ["ml", "regression"],
        orgId,
        workspaceId,
        "research-123"
      );

      expect(task).toBeDefined();
      expect(task.title).toBe("Review AI Model Parameters");
      expect(task.priority).toBe("HIGH");
      expect(task.status).toBe("TODO");

      // Update task status
      const updated = await collabEngine.updateTask(task.id, teamMemberId, { status: "IN_PROGRESS" }, orgId, workspaceId);
      expect(updated.status).toBe("IN_PROGRESS");

      // List tasks in workspace
      const list = await collabEngine.listTasks(testUserId, { workspaceId, organizationId: orgId });
      expect(list.some(t => t.id === task.id)).toBe(true);
    });
  });

  describe("Sharing Engine", () => {
    it("should support sharing resources and visibility controls", async () => {
      const share = await collabEngine.shareResource(
        testUserId,
        "research-123",
        "RESEARCH",
        "WORKSPACE",
        orgId,
        workspaceId,
        new Date(Date.now() + 3600000)
      );

      expect(share).toBeDefined();
      expect(share.shareType).toBe("WORKSPACE");

      // Retrieve share details
      const retrieved = await collabEngine.getShare(testUserId, "research-123", orgId, workspaceId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.resourceId).toBe("research-123");
    });
  });

  describe("Presence & Heartbeat", () => {
    it("should register active status and typing indicators", async () => {
      const presence = await collabEngine.setPresence(
        testUserId,
        "ONLINE",
        workspaceId,
        true,
        "research-123"
      );

      expect(presence).toBeDefined();
      expect(presence.status).toBe("ONLINE");
      expect(presence.isTyping).toBe(true);
      expect(presence.typingResourceId).toBe("research-123");

      // List active presence
      const list = await collabEngine.getPresence(teamMemberId, orgId, workspaceId);
      expect(list.some(p => p.userId === testUserId)).toBe(true);
    });
  });

  describe("Activity Feed Engine", () => {
    it("should record activities and fetch feeds filtered by workspace", async () => {
      const feed = await collabEngine.getActivityFeed(testUserId, {
        workspaceId,
        organizationId: orgId
      });

      expect(feed).toBeDefined();
      expect(feed.length).toBeGreaterThanOrEqual(1);
      
      // Check if comment action got recorded in activity log
      expect(feed.some(a => a.type === "COMMENT" || a.type === "TASK")).toBe(true);
    });
  });

  describe("Tenant Isolation & RBAC Protection", () => {
    it("should block cross-tenant collaboration activities", async () => {
      // External user attempting to post comments in alpha org's workspace
      await expect(
        collabEngine.postComment(
          externalUserId,
          "Illegal cross-tenant content",
          "research-123",
          "RESEARCH",
          undefined,
          orgId,
          workspaceId
        )
      ).rejects.toThrow("Unauthorized");
    });

    it("should enforce Least Privilege access constraints on tasks and feeds", async () => {
      const randomUserId = 9999; // No roles or memberships
      await expect(
        collabEngine.listTasks(randomUserId, { workspaceId, organizationId: orgId })
      ).rejects.toThrow("Unauthorized");

      await expect(
        collabEngine.getActivityFeed(randomUserId, { workspaceId, organizationId: orgId })
      ).rejects.toThrow("Unauthorized");
    });
  });
});
