import { Comment, ReviewThread, Reaction, Attachment } from '@ai-video-editor/shared';

export class CommentService {
  /**
   * Helper to create a new thread with an initial comment.
   */
  public static createThread(params: {
    projectId: string;
    targetType: ReviewThread['targetType'];
    targetId: string;
    title: string;
    authorId: string;
    authorName: string;
    content: string;
  }): ReviewThread {
    const threadId = `thread_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    const commentId = `comment_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    const now = new Date().toISOString();

    const initialComment: Comment = {
      id: commentId,
      threadId,
      authorId: params.authorId,
      authorName: params.authorName,
      content: params.content,
      createdAt: now,
      reactions: [],
      attachments: [],
    };

    return {
      id: threadId,
      projectId: params.projectId,
      targetType: params.targetType,
      targetId: params.targetId,
      status: 'needs_review',
      title: params.title,
      comments: [initialComment],
      createdAt: now,
      resolved: false,
    };
  }

  /**
   * Adds a reply comment to an existing thread.
   */
  public static addReply(params: {
    thread: ReviewThread;
    authorId: string;
    authorName: string;
    content: string;
  }): Comment {
    const commentId = `comment_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    const now = new Date().toISOString();

    const reply: Comment = {
      id: commentId,
      threadId: params.thread.id,
      authorId: params.authorId,
      authorName: params.authorName,
      content: params.content,
      createdAt: now,
      reactions: [],
      attachments: [],
    };

    params.thread.comments.push(reply);
    return reply;
  }

  /**
   * Adds a reaction (emoji) to a comment.
   */
  public static addReaction(comment: Comment, emoji: string, authorId: string): void {
    if (!comment.reactions) {
      comment.reactions = [];
    }

    // Avoid duplicates of same emoji by same author
    const exists = comment.reactions.some((r) => r.emoji === emoji && r.authorId === authorId);
    if (!exists) {
      comment.reactions.push({
        emoji,
        authorId,
        createdAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Removes a reaction from a comment.
   */
  public static removeReaction(comment: Comment, emoji: string, authorId: string): void {
    if (!comment.reactions) return;
    comment.reactions = comment.reactions.filter(
      (r) => !(r.emoji === emoji && r.authorId === authorId),
    );
  }
}
