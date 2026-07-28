import { z } from 'zod';
export declare const AIScriptSchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
export declare const AISceneSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    duration: z.ZodNumber;
}, z.core.$strip>;
export declare const AISubtitleSchema: z.ZodObject<{
    start: z.ZodNumber;
    end: z.ZodNumber;
    text: z.ZodString;
}, z.core.$strip>;
export declare const AIVoiceoverSchema: z.ZodObject<{
    url: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const AIGeneratedImageSchema: z.ZodObject<{
    url: z.ZodString;
}, z.core.$strip>;
export type AIScript = z.infer<typeof AIScriptSchema>;
export type AIScene = z.infer<typeof AISceneSchema>;
export type AISubtitle = z.infer<typeof AISubtitleSchema>;
export type AIVoiceover = z.infer<typeof AIVoiceoverSchema>;
export type AIGeneratedImage = z.infer<typeof AIGeneratedImageSchema>;
export declare const AIRequestSchema: z.ZodObject<{
    prompt: z.ZodOptional<z.ZodString>;
    text: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type AIRequest = z.infer<typeof AIRequestSchema>;
export interface AIResponse<T> {
    data: T;
    error?: string;
}
