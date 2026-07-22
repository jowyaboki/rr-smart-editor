import { z } from 'zod';

export type EditingIntentType =
  | 'timeline_edit'
  | 'scene_edit'
  | 'asset_replace'
  | 'caption_edit'
  | 'transition_update'
  | 'color_grade'
  | 'audio_mix'
  | 'publish';

export const EditingIntentTypeSchema = z.enum([
  'timeline_edit',
  'scene_edit',
  'asset_replace',
  'caption_edit',
  'transition_update',
  'color_grade',
  'audio_mix',
  'publish',
]);

// ==========================================
// CORE PLATFORM MODELS
// ==========================================

export interface EditingIntent {
  type: EditingIntentType;
  confidence: number; // 0 to 1
  parameters: Record<string, any>;
}

export const EditingIntentSchema = z.object({
  type: EditingIntentTypeSchema,
  confidence: z.number().min(0).max(1),
  parameters: z.record(z.any()),
});

export interface CopilotCommand {
  id: string;
  prompt: string;
  intent: EditingIntent;
}

export interface SuggestedChange {
  id: string;
  type: 'unused_asset' | 'silent_gap' | 'inconsistent_brand' | 'subtitle_overlap' | 'slow_pacing';
  description: string;
  affectedElementId: string;
  parameters: Record<string, any>;
}

export const SuggestedChangeSchema = z.object({
  id: z.string(),
  type: z.enum(['unused_asset', 'silent_gap', 'inconsistent_brand', 'subtitle_overlap', 'slow_pacing']),
  description: z.string(),
  affectedElementId: z.string(),
  parameters: z.record(z.any()),
});

export interface ChangePreview {
  affectedSceneIds: string[];
  timelineModificationsDescription: string;
  estimatedRenderImpactMs: number;
  undoCheckpointId: string;
}

export interface ExecutionPlan {
  id: string;
  steps: { id: string; description: string; action: string; arguments: any }[];
  preview: ChangePreview;
}

export interface ApprovalRequest {
  id: string;
  planId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: number;
}

export interface ConversationHistory {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: number;
}

export interface CopilotSession {
  id: string;
  projectId: string;
  history: ConversationHistory[];
  activePlan: ExecutionPlan | null;
}
