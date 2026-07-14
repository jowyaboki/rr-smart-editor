import { ReviewThread, ReviewStatus } from '@ai-video-editor/shared';

export class ReviewService {
  /**
   * Updates a thread's status.
   */
  public static updateStatus(thread: ReviewThread, status: ReviewStatus): void {
    thread.status = status;
  }

  /**
   * Resolves a review thread.
   */
  public static resolveThread(thread: ReviewThread, resolverName: string): void {
    thread.resolved = true;
    thread.resolvedAt = new Date().toISOString();
    thread.resolvedBy = resolverName;
    thread.status = 'archived';
  }

  /**
   * Reopens a resolved thread.
   */
  public static reopenThread(thread: ReviewThread): void {
    thread.resolved = false;
    thread.resolvedAt = undefined;
    thread.resolvedBy = undefined;
    thread.status = 'needs_review';
  }
}
