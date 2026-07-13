import { z } from 'zod';

export interface SnapshotMetadata {
  trigger: 'autosave' | 'manual' | 'render' | 'close' | 'crash';
  version: string;
  hash: string;
  description?: string;
}

export interface ProjectSnapshot {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  timeline: any; // timeline state (tracks, playhead, zoom, snap, etc.)
  assets: any[]; // media assets used in project
  scenes?: any[]; // optional high-level storyboard/scenes
  templates?: any; // optional template state
  brandKit?: any; // brand kit references
  settings?: any; // project settings/configurations
  metadata: SnapshotMetadata;
}

export interface AutoSaveState {
  lastSavedAt: string | null;
  status: 'idle' | 'saving' | 'success' | 'failed';
  pendingChangesCount: number;
  intervalMs: number;
  enabled: boolean;
}

export interface RecoveryCandidate {
  id: string;
  type: 'unsaved_project' | 'interrupted_render' | 'incomplete_autosave' | 'corrupted_snapshot';
  projectId?: string;
  source: 'autosave' | 'snapshot' | 'render_state';
  data: any; // data to restore, e.g., ProjectSnapshot or timeline object
  timestamp: string;
  reason: string;
  canRestore: boolean;
}

export interface RecoverySession {
  id: string;
  status: 'active' | 'discarded' | 'recovered';
  startedAt: string;
  endedAt?: string;
  candidates: RecoveryCandidate[];
}

export interface RecoveryPolicy {
  autoSaveIntervalMs: number;
  maxSnapshots: number;
  retentionDays: number;
  cleanupOnStartup: boolean;
  recoveryBehavior: 'prompt' | 'auto_restore_latest' | 'discard';
}

// Zod schemas for runtime validation
export const SnapshotMetadataSchema = z.object({
  trigger: z.enum(['autosave', 'manual', 'render', 'close', 'crash']),
  version: z.string(),
  hash: z.string(),
  description: z.string().optional(),
});

export const ProjectSnapshotSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string().min(1),
  createdAt: z.string(),
  timeline: z.any(),
  assets: z.array(z.any()),
  scenes: z.array(z.any()).optional(),
  templates: z.any().optional(),
  brandKit: z.any().optional(),
  settings: z.any().optional(),
  metadata: SnapshotMetadataSchema,
});

export const AutoSaveStateSchema = z.object({
  lastSavedAt: z.string().nullable(),
  status: z.enum(['idle', 'saving', 'success', 'failed']),
  pendingChangesCount: z.number().nonnegative(),
  intervalMs: z.number().positive(),
  enabled: z.boolean(),
});

export const RecoveryCandidateSchema = z.object({
  id: z.string(),
  type: z.enum([
    'unsaved_project',
    'interrupted_render',
    'incomplete_autosave',
    'corrupted_snapshot',
  ]),
  projectId: z.string().optional(),
  source: z.enum(['autosave', 'snapshot', 'render_state']),
  data: z.any(),
  timestamp: z.string(),
  reason: z.string(),
  canRestore: z.boolean(),
});

export const RecoverySessionSchema = z.object({
  id: z.string(),
  status: z.enum(['active', 'discarded', 'recovered']),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  candidates: z.array(RecoveryCandidateSchema),
});

export const RecoveryPolicySchema = z.object({
  autoSaveIntervalMs: z.number().positive(),
  maxSnapshots: z.number().nonnegative(),
  retentionDays: z.number().nonnegative(),
  cleanupOnStartup: z.boolean(),
  recoveryBehavior: z.enum(['prompt', 'auto_restore_latest', 'discard']),
});
