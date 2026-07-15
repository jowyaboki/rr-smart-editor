"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentWorkflowSchema = exports.WorkflowStepSchema = exports.AgentMemorySchema = exports.AgentTaskSchema = exports.AgentSchema = exports.AgentStatusSchema = exports.AgentTypeSchema = void 0;
const zod_1 = require("zod");
// Zod validation schemas
exports.AgentTypeSchema = zod_1.z.enum([
    'project',
    'script',
    'storyboard',
    'timeline',
    'media',
    'animation',
    'caption',
    'audio',
    'rendering',
    'quality',
]);
exports.AgentStatusSchema = zod_1.z.enum(['idle', 'busy', 'error']);
exports.AgentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    type: exports.AgentTypeSchema,
    capabilities: zod_1.z.array(zod_1.z.string()),
    status: exports.AgentStatusSchema,
});
exports.AgentTaskSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    assignedAgent: exports.AgentTypeSchema,
    status: zod_1.z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
    progress: zod_1.z.number().min(0).max(100),
    logs: zod_1.z.array(zod_1.z.string()),
    output: zod_1.z.any().optional(),
    error: zod_1.z.string().optional(),
    createdAt: zod_1.z.number(),
});
exports.AgentMemorySchema = zod_1.z.object({
    projectId: zod_1.z.string(),
    context: zod_1.z.object({
        timeline: zod_1.z.any().optional(),
        assets: zod_1.z.array(zod_1.z.any()).optional(),
        conversationHistory: zod_1.z.array(zod_1.z.object({
            role: zod_1.z.enum(['user', 'assistant']),
            content: zod_1.z.string(),
        })),
    }),
    intermediateOutputs: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
});
exports.WorkflowStepSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    agentType: exports.AgentTypeSchema,
    status: zod_1.z.enum(['pending', 'running', 'completed', 'failed']),
    progress: zod_1.z.number().min(0).max(100),
});
exports.AgentWorkflowSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    status: zod_1.z.enum(['pending', 'running', 'completed', 'failed']),
    steps: zod_1.z.array(exports.WorkflowStepSchema),
    currentStepIndex: zod_1.z.number().nonnegative(),
});
//# sourceMappingURL=index.js.map