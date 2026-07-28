import { z } from 'zod';
export type AgentType = 'project' | 'script' | 'storyboard' | 'timeline' | 'media' | 'animation' | 'caption' | 'audio' | 'rendering' | 'quality';
export type AgentStatus = 'idle' | 'busy' | 'error';
export interface Agent {
    id: string;
    name: string;
    type: AgentType;
    capabilities: string[];
    status: AgentStatus;
}
export interface AgentTask {
    id: string;
    name: string;
    assignedAgent: AgentType;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    logs: string[];
    output?: any;
    error?: string;
    createdAt: number;
}
export interface AgentMemory {
    projectId: string;
    context: {
        timeline?: any;
        assets?: any[];
        conversationHistory: Array<{
            role: 'user' | 'assistant';
            content: string;
        }>;
    };
    intermediateOutputs: Record<string, any>;
}
export interface WorkflowStep {
    id: string;
    name: string;
    agentType: AgentType;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
}
export interface AgentWorkflow {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    steps: WorkflowStep[];
    currentStepIndex: number;
}
export declare const AgentTypeSchema: z.ZodEnum<{
    timeline: "timeline";
    project: "project";
    caption: "caption";
    audio: "audio";
    script: "script";
    storyboard: "storyboard";
    media: "media";
    animation: "animation";
    rendering: "rendering";
    quality: "quality";
}>;
export declare const AgentStatusSchema: z.ZodEnum<{
    idle: "idle";
    error: "error";
    busy: "busy";
}>;
export declare const AgentSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<{
        timeline: "timeline";
        project: "project";
        caption: "caption";
        audio: "audio";
        script: "script";
        storyboard: "storyboard";
        media: "media";
        animation: "animation";
        rendering: "rendering";
        quality: "quality";
    }>;
    capabilities: z.ZodArray<z.ZodString>;
    status: z.ZodEnum<{
        idle: "idle";
        error: "error";
        busy: "busy";
    }>;
}, z.core.$strip>;
export declare const AgentTaskSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    assignedAgent: z.ZodEnum<{
        timeline: "timeline";
        project: "project";
        caption: "caption";
        audio: "audio";
        script: "script";
        storyboard: "storyboard";
        media: "media";
        animation: "animation";
        rendering: "rendering";
        quality: "quality";
    }>;
    status: z.ZodEnum<{
        failed: "failed";
        pending: "pending";
        running: "running";
        completed: "completed";
        cancelled: "cancelled";
    }>;
    progress: z.ZodNumber;
    logs: z.ZodArray<z.ZodString>;
    output: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodNumber;
}, z.core.$strip>;
export declare const AgentMemorySchema: z.ZodObject<{
    projectId: z.ZodString;
    context: z.ZodObject<{
        timeline: z.ZodOptional<z.ZodAny>;
        assets: z.ZodOptional<z.ZodArray<z.ZodAny>>;
        conversationHistory: z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<{
                user: "user";
                assistant: "assistant";
            }>;
            content: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    intermediateOutputs: z.ZodRecord<z.ZodString, z.ZodAny>;
}, z.core.$strip>;
export declare const WorkflowStepSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    agentType: z.ZodEnum<{
        timeline: "timeline";
        project: "project";
        caption: "caption";
        audio: "audio";
        script: "script";
        storyboard: "storyboard";
        media: "media";
        animation: "animation";
        rendering: "rendering";
        quality: "quality";
    }>;
    status: z.ZodEnum<{
        failed: "failed";
        pending: "pending";
        running: "running";
        completed: "completed";
    }>;
    progress: z.ZodNumber;
}, z.core.$strip>;
export declare const AgentWorkflowSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    status: z.ZodEnum<{
        failed: "failed";
        pending: "pending";
        running: "running";
        completed: "completed";
    }>;
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        agentType: z.ZodEnum<{
            timeline: "timeline";
            project: "project";
            caption: "caption";
            audio: "audio";
            script: "script";
            storyboard: "storyboard";
            media: "media";
            animation: "animation";
            rendering: "rendering";
            quality: "quality";
        }>;
        status: z.ZodEnum<{
            failed: "failed";
            pending: "pending";
            running: "running";
            completed: "completed";
        }>;
        progress: z.ZodNumber;
    }, z.core.$strip>>;
    currentStepIndex: z.ZodNumber;
}, z.core.$strip>;
