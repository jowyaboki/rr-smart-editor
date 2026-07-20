import { z } from 'zod';

export type UserRole = 'owner' | 'administrator' | 'editor' | 'reviewer' | 'viewer';

export const UserRoleSchema = z.enum(['owner', 'administrator', 'editor', 'reviewer', 'viewer']);

// ==========================================
// CORE PLATFORM MODELS
// ==========================================

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  color: string;
}

export const ParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: UserRoleSchema,
  color: z.string(),
});

export interface Presence {
  participantId: string;
  currentSelection: string[]; // Selected element/clip IDs
  currentFrame: number;
  currentSceneId?: string;
  currentTimelinePosition: number; // Playhead seconds
  cursor?: { x: number; y: number }; // Cursor coords in editor
  activeTool?: string; // Razor, Selection, Slip, Slide, Ripple, Roll
  lastActive: number;
}

export const PresenceSchema = z.object({
  participantId: z.string(),
  currentSelection: z.array(z.string()),
  currentFrame: z.number(),
  currentSceneId: z.string().optional(),
  currentTimelinePosition: z.number(),
  cursor: z.object({ x: z.number(), y: z.number() }).optional(),
  activeTool: z.string().optional(),
  lastActive: z.number(),
});

export interface CollaborativeSession {
  id: string;
  projectId: string;
  participants: Participant[];
  presences: Record<string, Presence>;
}

// ==========================================
// OPERATIONS & LOCKS
// ==========================================

export interface Operation {
  id: string;
  timestamp: number;
  authorId: string;
  type: string; // e.g., 'move_clip', 'split_clip', 'change_variable'
  path: string; // Target property path
  value: any;
  oldValue?: any;
}

export const OperationSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  authorId: z.string(),
  type: z.string(),
  path: z.string(),
  value: z.any(),
  oldValue: z.any().optional(),
});

export interface OperationBatch {
  id: string;
  timestamp: number;
  authorId: string;
  operations: Operation[];
}

export interface Lock {
  id: string;
  targetId: string; // ID of clip, track, or scene being locked
  holderId: string; // Participant ID holding the lock
  type: 'soft' | 'temporary' | 'advisory';
  expiresAt: number;
}

export const LockSchema = z.object({
  id: z.string(),
  targetId: z.string(),
  holderId: z.string(),
  type: z.enum(['soft', 'temporary', 'advisory']),
  expiresAt: z.number(),
});

// ==========================================
// COMMENTS & REVIEW THREADS
// ==========================================

export interface Annotation {
  id: string;
  type: 'highlight' | 'arrow' | 'text' | 'drawing';
  color: string;
  geometry: any; // visual placement coordinate data
}

export interface Comment {
  id: string;
  timestamp: number;
  authorId: string;
  authorName: string;
  text: string;
  resolved: boolean;
  frame?: number;
  timelinePosition?: number;
  assetId?: string;
  componentId?: string;
  mentions?: string[]; // Participant IDs
}

export const CommentSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  authorId: z.string(),
  authorName: z.string(),
  text: z.string(),
  resolved: z.boolean(),
  frame: z.number().optional(),
  timelinePosition: z.number().optional(),
  assetId: z.string().optional(),
  componentId: z.string().optional(),
  mentions: z.array(z.string()).optional(),
});

export interface ReviewThread {
  id: string;
  projectId: string;
  comments: Comment[];
  annotations: Annotation[];
}
