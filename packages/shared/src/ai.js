"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRequestSchema = exports.AIGeneratedImageSchema = exports.AIVoiceoverSchema = exports.AISubtitleSchema = exports.AISceneSchema = exports.AIScriptSchema = void 0;
const zod_1 = require("zod");
exports.AIScriptSchema = zod_1.z.object({
    content: zod_1.z.string(),
});
exports.AISceneSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    duration: zod_1.z.number(),
});
exports.AISubtitleSchema = zod_1.z.object({
    start: zod_1.z.number(),
    end: zod_1.z.number(),
    text: zod_1.z.string(),
});
exports.AIVoiceoverSchema = zod_1.z.object({
    url: zod_1.z.string(),
    duration: zod_1.z.number().optional(),
});
exports.AIGeneratedImageSchema = zod_1.z.object({
    url: zod_1.z.string(),
});
exports.AIRequestSchema = zod_1.z.object({
    prompt: zod_1.z.string().optional(),
    text: zod_1.z.string().optional(),
    projectId: zod_1.z.string().optional(),
});
//# sourceMappingURL=ai.js.map