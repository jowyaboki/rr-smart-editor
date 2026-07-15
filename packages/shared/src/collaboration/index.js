"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnotationSchema = exports.ReviewThreadSchema = exports.MentionSchema = exports.CommentSchema = exports.ReactionSchema = exports.AttachmentSchema = exports.ReviewerSchema = exports.ReviewStatusSchema = void 0;
const zod_1 = require("zod");
// Zod validation schemas
exports.ReviewStatusSchema = zod_1.z.enum([
    'draft',
    'needs_review',
    'changes_requested',
    'approved',
    'archived',
]);
exports.ReviewerSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    role: zod_1.z.string(),
});
exports.AttachmentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    url: zod_1.z.string(),
    sizeBytes: zod_1.z.number().nonnegative(),
});
exports.ReactionSchema = zod_1.z.object({
    emoji: zod_1.z.string(),
    authorId: zod_1.z.string(),
    createdAt: zod_1.z.string(),
});
exports.CommentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    threadId: zod_1.z.string(),
    authorId: zod_1.z.string(),
    authorName: zod_1.z.string(),
    content: zod_1.z.string(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string().optional(),
    reactions: zod_1.z.array(exports.ReactionSchema).optional(),
    attachments: zod_1.z.array(exports.AttachmentSchema).optional(),
});
exports.MentionSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    username: zod_1.z.string(),
    role: zod_1.z.string().optional(),
});
exports.ReviewThreadSchema = zod_1.z.object({
    id: zod_1.z.string(),
    projectId: zod_1.z.string(),
    targetType: zod_1.z.enum([
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
    targetId: zod_1.z.string(),
    status: exports.ReviewStatusSchema,
    title: zod_1.z.string(),
    comments: zod_1.z.array(exports.CommentSchema),
    createdAt: zod_1.z.string(),
    resolved: zod_1.z.boolean(),
    resolvedAt: zod_1.z.string().optional(),
    resolvedBy: zod_1.z.string().optional(),
});
exports.AnnotationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    projectId: zod_1.z.string(),
    type: zod_1.z.enum(['marker', 'frame', 'region', 'text']),
    timeStart: zod_1.z.number().nonnegative(),
    timeEnd: zod_1.z.number().nonnegative().optional(),
    label: zod_1.z.string(),
    color: zod_1.z.string(),
    priority: zod_1.z.enum(['low', 'medium', 'high']),
    authorId: zod_1.z.string(),
    createdAt: zod_1.z.string(),
});
//# sourceMappingURL=index.js.map