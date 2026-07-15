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
    timeline: any;
    assets: any[];
    scenes?: any[];
    templates?: any;
    brandKit?: any;
    settings?: any;
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
    data: any;
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
export declare const SnapshotMetadataSchema: z.ZodObject<{
    trigger: z.ZodEnum<{
        autosave: "autosave";
        manual: "manual";
        render: "render";
        close: "close";
        crash: "crash";
    }>;
    version: z.ZodString;
    hash: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ProjectSnapshotSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    name: z.ZodString;
    createdAt: z.ZodString;
    timeline: z.ZodAny;
    assets: z.ZodArray<z.ZodAny>;
    scenes: z.ZodOptional<z.ZodArray<z.ZodAny>>;
    templates: z.ZodOptional<z.ZodAny>;
    brandKit: z.ZodOptional<z.ZodAny>;
    settings: z.ZodOptional<z.ZodAny>;
    metadata: z.ZodObject<{
        trigger: z.ZodEnum<{
            autosave: "autosave";
            manual: "manual";
            render: "render";
            close: "close";
            crash: "crash";
        }>;
        version: z.ZodString;
        hash: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const AutoSaveStateSchema: z.ZodObject<{
    lastSavedAt: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<{
        idle: "idle";
        saving: "saving";
        success: "success";
        failed: "failed";
    }>;
    pendingChangesCount: z.ZodNumber;
    intervalMs: z.ZodNumber;
    enabled: z.ZodBoolean;
}, z.core.$strip>;
export declare const RecoveryCandidateSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<{
        unsaved_project: "unsaved_project";
        interrupted_render: "interrupted_render";
        incomplete_autosave: "incomplete_autosave";
        corrupted_snapshot: "corrupted_snapshot";
    }>;
    projectId: z.ZodOptional<z.ZodString>;
    source: z.ZodEnum<{
        autosave: "autosave";
        snapshot: "snapshot";
        render_state: "render_state";
    }>;
    data: z.ZodAny;
    timestamp: z.ZodString;
    reason: z.ZodString;
    canRestore: z.ZodBoolean;
}, z.core.$strip>;
export declare const RecoverySessionSchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<{
        active: "active";
        discarded: "discarded";
        recovered: "recovered";
    }>;
    startedAt: z.ZodString;
    endedAt: z.ZodOptional<z.ZodString>;
    candidates: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<{
            unsaved_project: "unsaved_project";
            interrupted_render: "interrupted_render";
            incomplete_autosave: "incomplete_autosave";
            corrupted_snapshot: "corrupted_snapshot";
        }>;
        projectId: z.ZodOptional<z.ZodString>;
        source: z.ZodEnum<{
            autosave: "autosave";
            snapshot: "snapshot";
            render_state: "render_state";
        }>;
        data: z.ZodAny;
        timestamp: z.ZodString;
        reason: z.ZodString;
        canRestore: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const RecoveryPolicySchema: z.ZodObject<{
    autoSaveIntervalMs: z.ZodNumber;
    maxSnapshots: z.ZodNumber;
    retentionDays: z.ZodNumber;
    cleanupOnStartup: z.ZodBoolean;
    recoveryBehavior: z.ZodEnum<{
        prompt: "prompt";
        auto_restore_latest: "auto_restore_latest";
        discard: "discard";
    }>;
}, z.core.$strip>;
