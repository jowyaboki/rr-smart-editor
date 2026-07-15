import { z } from 'zod';
export type WorkflowStepType = 'condition' | 'loop' | 'delay' | 'transform' | 'command' | 'script' | 'ai_task' | 'render' | 'notification';
export type TriggerType = 'manual' | 'project_open' | 'project_save' | 'render_complete' | 'asset_imported' | 'timeline_changed' | 'template_applied' | 'webhook';
export type VariableScope = 'project' | 'scene' | 'template' | 'environment' | 'execution';
export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export interface WorkflowVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    value: any;
    scope: VariableScope;
}
export interface WorkflowTrigger {
    type: TriggerType;
    config?: Record<string, any>;
}
export interface WorkflowStep {
    id: string;
    name: string;
    type: WorkflowStepType;
    config: Record<string, any>;
    nextStepId?: string;
    collapsed?: boolean;
}
export interface Workflow {
    id: string;
    name: string;
    trigger: WorkflowTrigger;
    steps: WorkflowStep[];
    variables: WorkflowVariable[];
    createdAt: string;
    updatedAt: string;
}
export interface WorkflowResult {
    stepId: string;
    status: 'success' | 'failed';
    output?: any;
    error?: string;
    timestamp: string;
}
export interface WorkflowContext {
    variables: Record<string, any>;
    projectId?: string;
    sceneId?: string;
    templateId?: string;
    env: Record<string, string>;
}
export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: ExecutionStatus;
    currentStepId?: string;
    context: WorkflowContext;
    history: WorkflowResult[];
    progress: number;
    startedAt: string;
    endedAt?: string;
}
export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    workflow: Omit<Workflow, 'id'>;
    category?: string;
}
export declare const WorkflowStepTypeSchema: z.ZodEnum<{
    render: "render";
    transform: "transform";
    script: "script";
    condition: "condition";
    loop: "loop";
    delay: "delay";
    command: "command";
    ai_task: "ai_task";
    notification: "notification";
}>;
export declare const TriggerTypeSchema: z.ZodEnum<{
    manual: "manual";
    project_open: "project_open";
    project_save: "project_save";
    render_complete: "render_complete";
    asset_imported: "asset_imported";
    timeline_changed: "timeline_changed";
    template_applied: "template_applied";
    webhook: "webhook";
}>;
export declare const VariableScopeSchema: z.ZodEnum<{
    environment: "environment";
    project: "project";
    scene: "scene";
    template: "template";
    execution: "execution";
}>;
export declare const ExecutionStatusSchema: z.ZodEnum<{
    idle: "idle";
    failed: "failed";
    running: "running";
    completed: "completed";
    cancelled: "cancelled";
    paused: "paused";
}>;
export declare const WorkflowVariableSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<{
        string: "string";
        number: "number";
        boolean: "boolean";
        json: "json";
    }>;
    value: z.ZodAny;
    scope: z.ZodEnum<{
        environment: "environment";
        project: "project";
        scene: "scene";
        template: "template";
        execution: "execution";
    }>;
}, z.core.$strip>;
export declare const WorkflowTriggerSchema: z.ZodObject<{
    type: z.ZodEnum<{
        manual: "manual";
        project_open: "project_open";
        project_save: "project_save";
        render_complete: "render_complete";
        asset_imported: "asset_imported";
        timeline_changed: "timeline_changed";
        template_applied: "template_applied";
        webhook: "webhook";
    }>;
    config: z.ZodOptional<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
}, z.core.$strip>;
export declare const WorkflowStepSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<{
        render: "render";
        transform: "transform";
        script: "script";
        condition: "condition";
        loop: "loop";
        delay: "delay";
        command: "command";
        ai_task: "ai_task";
        notification: "notification";
    }>;
    config: z.ZodRecord<z.ZodAny, z.core.SomeType>;
    nextStepId: z.ZodOptional<z.ZodString>;
    collapsed: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const WorkflowSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    trigger: z.ZodObject<{
        type: z.ZodEnum<{
            manual: "manual";
            project_open: "project_open";
            project_save: "project_save";
            render_complete: "render_complete";
            asset_imported: "asset_imported";
            timeline_changed: "timeline_changed";
            template_applied: "template_applied";
            webhook: "webhook";
        }>;
        config: z.ZodOptional<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
    }, z.core.$strip>;
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<{
            render: "render";
            transform: "transform";
            script: "script";
            condition: "condition";
            loop: "loop";
            delay: "delay";
            command: "command";
            ai_task: "ai_task";
            notification: "notification";
        }>;
        config: z.ZodRecord<z.ZodAny, z.core.SomeType>;
        nextStepId: z.ZodOptional<z.ZodString>;
        collapsed: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    variables: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<{
            string: "string";
            number: "number";
            boolean: "boolean";
            json: "json";
        }>;
        value: z.ZodAny;
        scope: z.ZodEnum<{
            environment: "environment";
            project: "project";
            scene: "scene";
            template: "template";
            execution: "execution";
        }>;
    }, z.core.$strip>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const WorkflowResultSchema: z.ZodObject<{
    stepId: z.ZodString;
    status: z.ZodEnum<{
        success: "success";
        failed: "failed";
    }>;
    output: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
}, z.core.$strip>;
export declare const WorkflowContextSchema: z.ZodObject<{
    variables: z.ZodRecord<z.ZodAny, z.core.SomeType>;
    projectId: z.ZodOptional<z.ZodString>;
    sceneId: z.ZodOptional<z.ZodString>;
    templateId: z.ZodOptional<z.ZodString>;
    env: z.ZodRecord<z.ZodString, z.core.SomeType>;
}, z.core.$strip>;
export declare const WorkflowExecutionSchema: z.ZodObject<{
    id: z.ZodString;
    workflowId: z.ZodString;
    status: z.ZodEnum<{
        idle: "idle";
        failed: "failed";
        running: "running";
        completed: "completed";
        cancelled: "cancelled";
        paused: "paused";
    }>;
    currentStepId: z.ZodOptional<z.ZodString>;
    context: z.ZodObject<{
        variables: z.ZodRecord<z.ZodAny, z.core.SomeType>;
        projectId: z.ZodOptional<z.ZodString>;
        sceneId: z.ZodOptional<z.ZodString>;
        templateId: z.ZodOptional<z.ZodString>;
        env: z.ZodRecord<z.ZodString, z.core.SomeType>;
    }, z.core.$strip>;
    history: z.ZodArray<z.ZodObject<{
        stepId: z.ZodString;
        status: z.ZodEnum<{
            success: "success";
            failed: "failed";
        }>;
        output: z.ZodOptional<z.ZodAny>;
        error: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodString;
    }, z.core.$strip>>;
    progress: z.ZodNumber;
    startedAt: z.ZodString;
    endedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const WorkflowTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    workflow: z.ZodObject<{
        trigger: z.ZodObject<{
            type: z.ZodEnum<{
                manual: "manual";
                project_open: "project_open";
                project_save: "project_save";
                render_complete: "render_complete";
                asset_imported: "asset_imported";
                timeline_changed: "timeline_changed";
                template_applied: "template_applied";
                webhook: "webhook";
            }>;
            config: z.ZodOptional<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
        }, z.core.$strip>;
        name: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        steps: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodEnum<{
                render: "render";
                transform: "transform";
                script: "script";
                condition: "condition";
                loop: "loop";
                delay: "delay";
                command: "command";
                ai_task: "ai_task";
                notification: "notification";
            }>;
            config: z.ZodRecord<z.ZodAny, z.core.SomeType>;
            nextStepId: z.ZodOptional<z.ZodString>;
            collapsed: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>>;
        variables: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                json: "json";
            }>;
            value: z.ZodAny;
            scope: z.ZodEnum<{
                environment: "environment";
                project: "project";
                scene: "scene";
                template: "template";
                execution: "execution";
            }>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    category: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
