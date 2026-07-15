"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecoveryPolicySchema = exports.RecoverySessionSchema = exports.RecoveryCandidateSchema = exports.AutoSaveStateSchema = exports.ProjectSnapshotSchema = exports.SnapshotMetadataSchema = void 0;
const zod_1 = require("zod");
// Zod schemas for runtime validation
exports.SnapshotMetadataSchema = zod_1.z.object({
    trigger: zod_1.z.enum(['autosave', 'manual', 'render', 'close', 'crash']),
    version: zod_1.z.string(),
    hash: zod_1.z.string(),
    description: zod_1.z.string().optional(),
});
exports.ProjectSnapshotSchema = zod_1.z.object({
    id: zod_1.z.string(),
    projectId: zod_1.z.string(),
    name: zod_1.z.string().min(1),
    createdAt: zod_1.z.string(),
    timeline: zod_1.z.any(),
    assets: zod_1.z.array(zod_1.z.any()),
    scenes: zod_1.z.array(zod_1.z.any()).optional(),
    templates: zod_1.z.any().optional(),
    brandKit: zod_1.z.any().optional(),
    settings: zod_1.z.any().optional(),
    metadata: exports.SnapshotMetadataSchema,
});
exports.AutoSaveStateSchema = zod_1.z.object({
    lastSavedAt: zod_1.z.string().nullable(),
    status: zod_1.z.enum(['idle', 'saving', 'success', 'failed']),
    pendingChangesCount: zod_1.z.number().nonnegative(),
    intervalMs: zod_1.z.number().positive(),
    enabled: zod_1.z.boolean(),
});
exports.RecoveryCandidateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum([
        'unsaved_project',
        'interrupted_render',
        'incomplete_autosave',
        'corrupted_snapshot',
    ]),
    projectId: zod_1.z.string().optional(),
    source: zod_1.z.enum(['autosave', 'snapshot', 'render_state']),
    data: zod_1.z.any(),
    timestamp: zod_1.z.string(),
    reason: zod_1.z.string(),
    canRestore: zod_1.z.boolean(),
});
exports.RecoverySessionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    status: zod_1.z.enum(['active', 'discarded', 'recovered']),
    startedAt: zod_1.z.string(),
    endedAt: zod_1.z.string().optional(),
    candidates: zod_1.z.array(exports.RecoveryCandidateSchema),
});
exports.RecoveryPolicySchema = zod_1.z.object({
    autoSaveIntervalMs: zod_1.z.number().positive(),
    maxSnapshots: zod_1.z.number().nonnegative(),
    retentionDays: zod_1.z.number().nonnegative(),
    cleanupOnStartup: zod_1.z.boolean(),
    recoveryBehavior: zod_1.z.enum(['prompt', 'auto_restore_latest', 'discard']),
});
//# sourceMappingURL=index.js.map