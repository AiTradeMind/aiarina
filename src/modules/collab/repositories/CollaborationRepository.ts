import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  collabComments, 
  collabMentions, 
  collabTasks, 
  collabShares, 
  collabActivity, 
  collabPresence,
  users
} from "../../../db/schema.ts";
import { 
  CollabComment, 
  CollabMention, 
  CollabTask, 
  CollabShare, 
  CollabActivity as ICollabActivity, 
  CollabPresence as ICollabPresence 
} from "../types/index.ts";

export class CollaborationRepository {
  private static tablesChecked = false;

  public async ensureCollabTables(): Promise<void> {
    if (CollaborationRepository.tablesChecked) return;
    const db = getDb();
    try {
      // 1. Create Comments Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS collab_comments (
          id SERIAL PRIMARY KEY,
          parent_id INTEGER,
          resource_id VARCHAR(100) NOT NULL,
          resource_type VARCHAR(50) NOT NULL,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          content TEXT NOT NULL,
          is_resolved BOOLEAN DEFAULT FALSE NOT NULL,
          is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL,
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 2. Create Mentions Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS collab_mentions (
          id SERIAL PRIMARY KEY,
          comment_id INTEGER REFERENCES collab_comments(id) ON DELETE CASCADE NOT NULL,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 3. Create Tasks Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS collab_tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          due_date TIMESTAMP,
          priority VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL,
          status VARCHAR(50) DEFAULT 'TODO' NOT NULL,
          labels JSONB DEFAULT '[]'::jsonb NOT NULL,
          organization_id VARCHAR(50),
          workspace_id VARCHAR(50),
          resource_id VARCHAR(100),
          created_at TIMESTAMP DEFAULT now() NOT NULL,
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 4. Create Shares Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS collab_shares (
          id SERIAL PRIMARY KEY,
          resource_id VARCHAR(100) NOT NULL,
          resource_type VARCHAR(50) NOT NULL,
          creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          share_type VARCHAR(50) DEFAULT 'WORKSPACE' NOT NULL,
          organization_id VARCHAR(50),
          workspace_id VARCHAR(50),
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 5. Create Activity Feed Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS collab_activity (
          id SERIAL PRIMARY KEY,
          workspace_id VARCHAR(50),
          organization_id VARCHAR(50),
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          type VARCHAR(50) NOT NULL,
          details JSONB DEFAULT '{}'::jsonb NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 6. Create Presence Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS collab_presence (
          user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(50) DEFAULT 'ONLINE' NOT NULL,
          last_seen TIMESTAMP DEFAULT now() NOT NULL,
          active_workspace_id VARCHAR(50),
          is_typing BOOLEAN DEFAULT FALSE NOT NULL,
          typing_resource_id VARCHAR(100),
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      CollaborationRepository.tablesChecked = true;
    } catch (err) {
      console.error("Error building missing collaboration tables dynamically:", err);
    }
  }

  constructor() {
    this.ensureCollabTables().catch(() => {});
  }

  // --- Comments Engine ---
  async createComment(comment: Partial<CollabComment>): Promise<CollabComment> {
    await this.ensureCollabTables();
    const db = getDb();
    const payload = {
      parentId: comment.parentId || null,
      resourceId: comment.resourceId!,
      resourceType: comment.resourceType!,
      userId: comment.userId!,
      content: comment.content!,
      isResolved: comment.isResolved ?? false,
      isPinned: comment.isPinned ?? false,
    };
    const res = await db.insert(collabComments).values(payload).returning();
    return res[0] as unknown as CollabComment;
  }

  async getCommentsForResource(resourceId: string): Promise<CollabComment[]> {
    await this.ensureCollabTables();
    const db = getDb();
    const res = await db
      .select()
      .from(collabComments)
      .where(eq(collabComments.resourceId, resourceId))
      .orderBy(collabComments.createdAt);
    return res as unknown as CollabComment[];
  }

  async getComment(id: number): Promise<CollabComment | null> {
    await this.ensureCollabTables();
    const db = getDb();
    const res = await db.select().from(collabComments).where(eq(collabComments.id, id)).limit(1);
    return (res[0] as unknown as CollabComment) || null;
  }

  async updateComment(id: number, updates: Partial<CollabComment>): Promise<CollabComment | null> {
    await this.ensureCollabTables();
    const db = getDb();
    const res = await db
      .update(collabComments)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(collabComments.id, id))
      .returning();
    return (res[0] as unknown as CollabComment) || null;
  }

  // --- Mentions ---
  async addMention(commentId: number, userId: number): Promise<CollabMention> {
    await this.ensureCollabTables();
    const db = getDb();
    const res = await db.insert(collabMentions).values({ commentId, userId }).returning();
    return res[0] as unknown as CollabMention;
  }

  async getMentionsForUser(userId: number): Promise<CollabMention[]> {
    await this.ensureCollabTables();
    const db = getDb();
    const res = await db.select().from(collabMentions).where(eq(collabMentions.userId, userId));
    return res as unknown as CollabMention[];
  }

  // --- Tasks Engine ---
  async createTask(task: Partial<CollabTask>): Promise<CollabTask> {
    await this.ensureCollabTables();
    const db = getDb();
    const payload = {
      title: task.title!,
      description: task.description || null,
      assigneeId: task.assigneeId || null,
      creatorId: task.creatorId!,
      dueDate: task.dueDate || null,
      priority: task.priority || "MEDIUM",
      status: task.status || "TODO",
      labels: task.labels || [],
      organizationId: task.organizationId || null,
      workspaceId: task.workspaceId || null,
      resourceId: task.resourceId || null,
    };
    const res = await db.insert(collabTasks).values(payload).returning();
    return res[0] as unknown as CollabTask;
  }

  async getTask(id: number): Promise<CollabTask | null> {
    await this.ensureCollabTables();
    const db = getDb();
    const res = await db.select().from(collabTasks).where(eq(collabTasks.id, id)).limit(1);
    return (res[0] as unknown as CollabTask) || null;
  }

  async listTasks(filters: { workspaceId?: string; organizationId?: string }): Promise<CollabTask[]> {
    await this.ensureCollabTables();
    const db = getDb();
    const conditions = [];
    if (filters.workspaceId) conditions.push(eq(collabTasks.workspaceId, filters.workspaceId));
    if (filters.organizationId) conditions.push(eq(collabTasks.organizationId, filters.organizationId));

    let query = db.select().from(collabTasks).orderBy(desc(collabTasks.createdAt));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    const res = await query;
    return res as unknown as CollabTask[];
  }

  async updateTask(id: number, updates: Partial<CollabTask>): Promise<CollabTask | null> {
    await this.ensureCollabTables();
    const db = getDb();
    const res = await db
      .update(collabTasks)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(collabTasks.id, id))
      .returning();
    return (res[0] as unknown as CollabTask) || null;
  }

  // --- Sharing Engine ---
  async createShare(share: Partial<CollabShare>): Promise<CollabShare> {
    await this.ensureCollabTables();
    const db = getDb();
    const payload = {
      resourceId: share.resourceId!,
      resourceType: share.resourceType!,
      creatorId: share.creatorId!,
      shareType: share.shareType || "WORKSPACE",
      organizationId: share.organizationId || null,
      workspaceId: share.workspaceId || null,
      expiresAt: share.expiresAt || null,
    };
    const res = await db.insert(collabShares).values(payload).returning();
    return res[0] as unknown as CollabShare;
  }

  async getShareByResource(resourceId: string): Promise<CollabShare | null> {
    await this.ensureCollabTables();
    const db = getDb();
    const res = await db
      .select()
      .from(collabShares)
      .where(eq(collabShares.resourceId, resourceId))
      .orderBy(desc(collabShares.createdAt))
      .limit(1);
    return (res[0] as unknown as CollabShare) || null;
  }

  // --- Presence ---
  async updatePresence(presence: Partial<ICollabPresence> & { userId: number }): Promise<ICollabPresence> {
    await this.ensureCollabTables();
    const db = getDb();
    const payload = {
      userId: presence.userId,
      status: presence.status || "ONLINE",
      lastSeen: new Date(),
      activeWorkspaceId: presence.activeWorkspaceId || null,
      isTyping: presence.isTyping ?? false,
      typingResourceId: presence.typingResourceId || null,
      updatedAt: new Date(),
    };

    await db.insert(collabPresence).values(payload).onConflictDoUpdate({
      target: collabPresence.userId,
      set: {
        status: payload.status,
        lastSeen: payload.lastSeen,
        activeWorkspaceId: payload.activeWorkspaceId,
        isTyping: payload.isTyping,
        typingResourceId: payload.typingResourceId,
        updatedAt: payload.updatedAt,
      }
    });

    return payload as unknown as ICollabPresence;
  }

  async listPresence(): Promise<ICollabPresence[]> {
    await this.ensureCollabTables();
    const db = getDb();
    const res = await db.select().from(collabPresence);
    return res as unknown as ICollabPresence[];
  }

  // --- Activity Feed ---
  async logActivity(activity: Partial<ICollabActivity>): Promise<ICollabActivity> {
    await this.ensureCollabTables();
    const db = getDb();
    const payload = {
      workspaceId: activity.workspaceId || null,
      organizationId: activity.organizationId || null,
      userId: activity.userId!,
      type: activity.type!,
      details: activity.details || {},
    };
    const res = await db.insert(collabActivity).values(payload).returning();
    return res[0] as unknown as ICollabActivity;
  }

  async listActivities(filters: { workspaceId?: string; organizationId?: string; type?: string; limit?: number }): Promise<ICollabActivity[]> {
    await this.ensureCollabTables();
    const db = getDb();
    const conditions = [];
    if (filters.workspaceId) conditions.push(eq(collabActivity.workspaceId, filters.workspaceId));
    if (filters.organizationId) conditions.push(eq(collabActivity.organizationId, filters.organizationId));
    if (filters.type) conditions.push(eq(collabActivity.type, filters.type));

    let query = db.select().from(collabActivity).orderBy(desc(collabActivity.createdAt));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    const limitVal = filters.limit || 50;
    query = query.limit(limitVal) as any;

    const res = await query;
    return res as unknown as ICollabActivity[];
  }
}
export const collaborationRepository = new CollaborationRepository();
