import { CollaborativeSession, Participant, Presence, Operation, Comment, Lock, UserRole, Annotation } from '../types';

// ==========================================
// 1. PRESENCE SERVICE
// ==========================================
export class PresenceService {
  private presences = new Map<string, Presence>();

  public updatePresence(participantId: string, updates: Partial<Omit<Presence, 'participantId' | 'lastActive'>>): Presence {
    const existing = this.presences.get(participantId) || {
      participantId,
      currentSelection: [],
      currentFrame: 0,
      currentTimelinePosition: 0,
      lastActive: Date.now(),
    };

    const updated: Presence = {
      ...existing,
      ...updates,
      lastActive: Date.now(),
    };

    this.presences.set(participantId, updated);
    return updated;
  }

  public getPresence(participantId: string): Presence | undefined {
    return this.presences.get(participantId);
  }

  public listPresences(): Presence[] {
    return Array.from(this.presences.values());
  }

  public removePresence(participantId: string): void {
    this.presences.delete(participantId);
  }
}

// ==========================================
// 2. SYNCHRONIZATION SERVICE
// ==========================================
export class SynchronizationService {
  private operationsLog: Operation[] = [];
  private offlineQueue: Operation[] = [];
  private isConnected = true;

  /**
   * Appends operation to sync engine.
   * If online, broadcasts immediately.
   * If offline, buffers into offline queue to flush upon connection recovery.
   */
  public handleOperation(op: Operation): { status: 'broadcasted' | 'queued' } {
    if (this.isConnected) {
      this.operationsLog.push(op);
      return { status: 'broadcasted' };
    } else {
      this.offlineQueue.push(op);
      return { status: 'queued' };
    }
  }

  public setConnectionState(online: boolean): Operation[] {
    this.isConnected = online;
    if (online && this.offlineQueue.length > 0) {
      // Reconnect and flush: replay all pending offline operations
      const flushed = [...this.offlineQueue];
      this.operationsLog.push(...flushed);
      this.offlineQueue = [];
      return flushed; // Return operations to notify transport stream
    }
    return [];
  }

  public getOperationsLog(): Operation[] {
    return [...this.operationsLog];
  }

  public getOfflineQueue(): Operation[] {
    return [...this.offlineQueue];
  }

  public loadSnapshot(snapshotOps: Operation[]): void {
    this.operationsLog = [...snapshotOps];
  }
}

// ==========================================
// 3. COMMENT SERVICE
// ==========================================
export class CommentService {
  private comments: Comment[] = [];
  private annotations = new Map<string, Annotation[]>(); // commentId -> visual Annotations

  public addComment(
    authorId: string,
    authorName: string,
    text: string,
    meta?: Partial<Pick<Comment, 'frame' | 'timelinePosition' | 'assetId' | 'componentId'>>
  ): Comment {
    // Basic mention extractor
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    const comment: Comment = {
      id: `comment-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      authorId,
      authorName,
      text,
      resolved: false,
      mentions,
      ...meta,
    };

    this.comments.push(comment);
    return comment;
  }

  public resolveComment(id: string): void {
    const comment = this.comments.find(c => c.id === id);
    if (comment) {
      comment.resolved = true;
    }
  }

  public getComments(): Comment[] {
    return [...this.comments];
  }

  public addAnnotation(commentId: string, annotation: Annotation): void {
    const current = this.annotations.get(commentId) || [];
    current.push(annotation);
    this.annotations.set(commentId, current);
  }

  public getAnnotations(commentId: string): Annotation[] {
    return this.annotations.get(commentId) || [];
  }
}

// ==========================================
// 4. PERMISSION SERVICE
// ==========================================
export class PermissionService {
  private roleHierarchies: Record<UserRole, number> = {
    owner: 5,
    administrator: 4,
    editor: 3,
    reviewer: 2,
    viewer: 1,
  };

  /**
   * Helper verifying capability access levels
   */
  public checkPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    return this.roleHierarchies[userRole] >= this.roleHierarchies[requiredRole];
  }
}

// ==========================================
// 5. HISTORY SERVICE
// ==========================================
export class HistoryService {
  private historyLogs: { timestamp: number; user: string; action: string }[] = [];
  private snapshots = new Map<string, string>(); // snapshotId -> projectGraphJSON

  public recordActivity(user: string, action: string): void {
    this.historyLogs.push({
      timestamp: Date.now(),
      user,
      action,
    });
  }

  public getActivityLogs(): { timestamp: number; user: string; action: string }[] {
    return [...this.historyLogs];
  }

  public saveSnapshot(snapshotId: string, data: string): void {
    this.snapshots.set(snapshotId, data);
  }

  public getSnapshot(snapshotId: string): string | undefined {
    return this.snapshots.get(snapshotId);
  }
}

// ==========================================
// 6. COLLABORATION SERVICE
// ==========================================
export class CollaborationService {
  public readonly presence = new PresenceService();
  public readonly sync = new SynchronizationService();
  public readonly comments = new CommentService();
  public readonly permissions = new PermissionService();
  public readonly history = new HistoryService();

  private session: CollaborativeSession | null = null;
  private locks = new Map<string, Lock>(); // targetId -> Lock

  public startSession(sessionId: string, projectId: string, initialParticipants: Participant[]): CollaborativeSession {
    this.session = {
      id: sessionId,
      projectId,
      participants: initialParticipants,
      presences: {},
    };
    return this.session;
  }

  public getSession(): CollaborativeSession | null {
    return this.session;
  }

  /**
   * Safe non-destructive Lock management (Soft, advisory, temporary locking)
   */
  public acquireLock(targetId: string, holderId: string, type: Lock['type'] = 'advisory', durationSeconds = 60): Lock | null {
    const active = this.locks.get(targetId);
    if (active && active.holderId !== holderId && active.expiresAt > Date.now()) {
      return null; // Locked by someone else!
    }

    const lock: Lock = {
      id: `lock-${Math.random().toString(36).substr(2, 9)}`,
      targetId,
      holderId,
      type,
      expiresAt: Date.now() + durationSeconds * 1000,
    };

    this.locks.set(targetId, lock);
    return lock;
  }

  public releaseLock(targetId: string, holderId: string): boolean {
    const active = this.locks.get(targetId);
    if (active && active.holderId === holderId) {
      return this.locks.delete(targetId);
    }
    return false;
  }

  public isLocked(targetId: string): boolean {
    const lock = this.locks.get(targetId);
    return !!lock && lock.expiresAt > Date.now();
  }
}
