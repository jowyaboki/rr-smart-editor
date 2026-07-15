"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowTemplateSchema = exports.WorkflowExecutionSchema = exports.WorkflowContextSchema = exports.WorkflowResultSchema = exports.WorkflowSchema = exports.WorkflowStepSchema = exports.WorkflowTriggerSchema = exports.WorkflowVariableSchema = exports.ExecutionStatusSchema = exports.VariableScopeSchema = exports.TriggerTypeSchema = exports.WorkflowStepTypeSchema = void 0;
const zod_1 = require("zod");
// Zod schemas
exports.WorkflowStepTypeSchema = zod_1.z.enum([
    'condition',
    'loop',
    'delay',
    'transform',
    'command',
    'script',
    'ai_task',
    'render',
    'notification',
]);
exports.TriggerTypeSchema = zod_1.z.enum([
    'manual',
    'project_open',
    'project_save',
    'render_complete',
    'asset_imported',
    'timeline_changed',
    'template_applied',
    'webhook',
]);
exports.VariableScopeSchema = zod_1.z.enum([
    'project',
    'scene',
    'template',
    'environment',
    'execution',
]);
exports.ExecutionStatusSchema = zod_1.z.enum([
    'idle',
    'running',
    'paused',
    'completed',
    'failed',
    'cancelled',
]);
exports.WorkflowVariableSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    type: zod_1.z.enum(['string', 'number', 'boolean', 'json']),
    value: zod_1.z.any(),
    scope: exports.VariableScopeSchema,
});
exports.WorkflowTriggerSchema = zod_1.z.object({
    type: exports.TriggerTypeSchema,
    config: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.WorkflowStepSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    type: exports.WorkflowStepTypeSchema,
    config: zod_1.z.record(zod_1.z.any()),
    nextStepId: zod_1.z.string().optional(),
    collapsed: zod_1.z.boolean().optional(),
});
exports.WorkflowSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    trigger: exports.WorkflowTriggerSchema,
    steps: zod_1.z.array(exports.WorkflowStepSchema),
    variables: zod_1.z.array(exports.WorkflowVariableSchema),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.WorkflowResultSchema = zod_1.z.object({
    stepId: zod_1.z.string(),
    status: zod_1.z.enum(['success', 'failed']),
    output: zod_1.z.any().optional(),
    error: zod_1.z.string().optional(),
    timestamp: zod_1.z.string(),
});
exports.WorkflowContextSchema = zod_1.z.object({
    variables: zod_1.z.record(zod_1.z.any()),
    projectId: zod_1.z.string().optional(),
    sceneId: zod_1.z.string().optional(),
    templateId: zod_1.z.string().optional(),
    env: zod_1.z.record(zod_1.z.string()),
});
exports.WorkflowExecutionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    workflowId: zod_1.z.string(),
    status: exports.ExecutionStatusSchema,
    currentStepId: zod_1.z.string().optional(),
    context: exports.WorkflowContextSchema,
    history: zod_1.z.array(exports.WorkflowResultSchema),
    progress: zod_1.z.number().min(0).max(100),
    startedAt: zod_1.z.string(),
    endedAt: zod_1.z.string().optional(),
});
exports.WorkflowTemplateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    workflow: exports.WorkflowSchema.omit({ id: true }),
    category: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map