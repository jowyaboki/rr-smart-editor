import { z } from 'zod';

export type ReviewStatus = 'draft' | 'needs_review' | 'changes_requested' | 'approved' | 'archived';

export interface Reviewer {
  id: string;
  name: string;
  role: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
}

export interface Reaction {
  emoji: string;
  authorId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  reactions?: Reaction[];
  attachments?: Attachment[];
}

export interface Mention {
  userId: string;
  username: string;
  role?: string;
}

export interface ReviewThread {
  id: string;
  projectId: string;
  targetType:
    | 'project'
    | 'scene'
    | 'clip'
    | 'transition'
    | 'effect'
    | 'text'
    | 'caption'
    | 'audio'
    | 'render'
    | 'template';
  targetId: string;
  status: ReviewStatus;
  title: string;
  comments: Comment[];
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface Annotation {
  id: string;
  projectId: string;
  type: 'marker' | 'frame' | 'region' | 'text';
  timeStart: number; // in frames
  timeEnd?: number; // in frames
  label: string;
  color: string;
  priority: 'low' | 'medium' | 'high';
  authorId: string;
  createdAt: string;
}

// Zod validation schemas
export const ReviewStatusSchema = z.enum([
  'draft',
  'needs_review',
  'changes_requested',
  'approved',
  'archived',
]);

export const ReviewerSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
});

export const AttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  sizeBytes: z.number().nonnegative(),
});

export const ReactionSchema = z.object({
  emoji: z.string(),
  authorId: z.string(),
  createdAt: z.string(),
});

export const CommentSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  reactions: z.array(ReactionSchema).optional(),
  attachments: z.array(AttachmentSchema).optional(),
});

export const MentionSchema = z.object({
  userId: z.string(),
  username: z.string(),
  role: z.string().optional(),
});

export const ReviewThreadSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  targetType: z.enum([
    'project',
    'scene',
    'clip',
    'transition',
    'effect',
    'text',
    'caption',
    'audio',
    'render',
    'template',
  ]),
  targetId: z.string(),
  status: ReviewStatusSchema,
  title: z.string(),
  comments: z.array(CommentSchema),
  createdAt: z.string(),
  resolved: z.boolean(),
  resolvedAt: z.string().optional(),
  resolvedBy: z.string().optional(),
});

export const AnnotationSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: z.enum(['marker', 'frame', 'region', 'text']),
  timeStart: z.number().nonnegative(),
  timeEnd: z.number().nonnegative().optional(),
  label: z.string(),
  color: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  authorId: z.string(),
  createdAt: z.string(),
});
