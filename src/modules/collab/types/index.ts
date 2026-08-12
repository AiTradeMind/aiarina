export interface CollabComment {
  id: number;
  parentId: number | null;
  resourceId: string;
  resourceType: string; // 'RESEARCH' | 'REPORT' | 'STRATEGY' | 'KNOWLEDGE' | 'SESSION'
  userId: number;
  content: string;
  isResolved: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollabMention {
  id: number;
  commentId: number;
  userId: number;
  createdAt: Date;
}

export interface CollabTask {
  id: number;
  title: string;
  description: string | null;
  assigneeId: number | null;
  creatorId: number;
  dueDate: Date | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  labels: string[];
  organizationId: string | null;
  workspaceId: string | null;
  resourceId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollabShare {
  id: number;
  resourceId: string;
  resourceType: string;
  creatorId: number;
  shareType: 'INTERNAL_LINK' | 'WORKSPACE' | 'ORGANIZATION' | 'PUBLIC_READ';
  organizationId: string | null;
  workspaceId: string | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface CollabActivity {
  id: number;
  workspaceId: string | null;
  organizationId: string | null;
  userId: number;
  type: 'COMMENT' | 'TASK' | 'SHARE' | 'PRESENCE' | 'MEMBER';
  details: Record<string, any>;
  createdAt: Date;
}

export interface CollabPresence {
  userId: number;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  lastSeen: Date;
  activeWorkspaceId: string | null;
  isTyping: boolean;
  typingResourceId: string | null;
  updatedAt: Date;
}

export interface ShareResourceRequest {
  resourceId: string;
  resourceType: string;
  shareType: 'INTERNAL_LINK' | 'WORKSPACE' | 'ORGANIZATION' | 'PUBLIC_READ';
  organizationId?: string | null;
  workspaceId?: string | null;
  expiresAt?: string | null;
}
