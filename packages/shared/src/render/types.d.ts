import { z } from 'zod';
export type RenderPriority = 'low' | 'normal' | 'high' | 'critical';
export declare const RenderPrioritySchema: z.ZodEnum<{
    low: "low";
    high: "high";
    normal: "normal";
    critical: "critical";
}>;
export type RenderStatus = 'queued' | 'rendering' | 'completed' | 'failed' | 'paused' | 'cancelled';
export declare const RenderStatusSchema: z.ZodEnum<{
    failed: "failed";
    completed: "completed";
    cancelled: "cancelled";
    rendering: "rendering";
    paused: "paused";
    queued: "queued";
}>;
export type RenderPipelineStage = 'validate' | 'prepare' | 'build_composition' | 'render' | 'encode' | 'generate_thumbnail' | 'cleanup' | 'completed' | 'failed';
export declare const RenderPipelineStageSchema: z.ZodEnum<{
    render: "render";
    failed: "failed";
    completed: "completed";
    validate: "validate";
    prepare: "prepare";
    build_composition: "build_composition";
    encode: "encode";
    generate_thumbnail: "generate_thumbnail";
    cleanup: "cleanup";
}>;
export interface RenderTelemetry {
    cpuUsage: number;
    memoryUsage: number;
    fps: number;
    etaSeconds: number;
    queueLatencyMs: number;
    workerUtilization: number;
    activeConnections: number;
    throughput: number;
}
export declare const RenderTelemetrySchema: z.ZodObject<{
    cpuUsage: z.ZodNumber;
    memoryUsage: z.ZodNumber;
    fps: z.ZodNumber;
    etaSeconds: z.ZodNumber;
    queueLatencyMs: z.ZodNumber;
    workerUtilization: z.ZodNumber;
    activeConnections: z.ZodNumber;
    throughput: z.ZodNumber;
}, z.core.$strip>;
export interface WorkerCapability {
    maxConcurrentJobs: number;
    supportedFormats: string[];
    supportedCodecs: string[];
    gpuAcceleration: boolean;
    maxResolution: {
        width: number;
        height: number;
    };
}
export declare const WorkerCapabilitySchema: z.ZodObject<{
    maxConcurrentJobs: z.ZodDefault<z.ZodNumber>;
    supportedFormats: z.ZodArray<z.ZodString>;
    supportedCodecs: z.ZodArray<z.ZodString>;
    gpuAcceleration: z.ZodBoolean;
    maxResolution: z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export interface RenderWorker {
    id: string;
    name: string;
    status: 'idle' | 'busy' | 'offline';
    capabilities: WorkerCapability;
    lastHeartbeat: string;
    currentJobId?: string;
    systemInfo?: {
        cpuUsage: number;
        memoryUsage: number;
        platform: string;
        arch: string;
    };
}
export declare const RenderWorkerSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    status: z.ZodEnum<{
        idle: "idle";
        busy: "busy";
        offline: "offline";
    }>;
    capabilities: z.ZodObject<{
        maxConcurrentJobs: z.ZodDefault<z.ZodNumber>;
        supportedFormats: z.ZodArray<z.ZodString>;
        supportedCodecs: z.ZodArray<z.ZodString>;
        gpuAcceleration: z.ZodBoolean;
        maxResolution: z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strip>;
    }, z.core.$strip>;
    lastHeartbeat: z.ZodString;
    currentJobId: z.ZodOptional<z.ZodString>;
    systemInfo: z.ZodOptional<z.ZodObject<{
        cpuUsage: z.ZodNumber;
        memoryUsage: z.ZodNumber;
        platform: z.ZodString;
        arch: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export interface RenderPreset {
    id: string;
    name: string;
    description: string;
    format: string;
    codec: string;
    resolution: {
        width: number;
        height: number;
    };
    fps: number;
    audioOnly: boolean;
    settings?: any;
}
export declare const RenderPresetSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    format: z.ZodString;
    codec: z.ZodString;
    resolution: z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, z.core.$strip>;
    fps: z.ZodNumber;
    audioOnly: z.ZodBoolean;
    settings: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export interface RenderMetrics {
    durationMs: number;
    fps: number;
    cpuUsage: number;
    memoryUsage: number;
    frameCount: number;
    renderTimePerFrameMs: number;
}
export declare const RenderMetricsSchema: z.ZodObject<{
    durationMs: z.ZodNumber;
    fps: z.ZodNumber;
    cpuUsage: z.ZodNumber;
    memoryUsage: z.ZodNumber;
    frameCount: z.ZodNumber;
    renderTimePerFrameMs: z.ZodNumber;
}, z.core.$strip>;
export interface RenderArtifact {
    id: string;
    jobId: string;
    url: string;
    format: string;
    size: number;
    metadata: {
        previewUrl?: string;
        duration?: number;
        resolution?: {
            width: number;
            height: number;
        };
        codec?: string;
        settings?: any;
    };
    createdAt: string;
}
export declare const RenderArtifactSchema: z.ZodObject<{
    id: z.ZodString;
    jobId: z.ZodString;
    url: z.ZodString;
    format: z.ZodString;
    size: z.ZodNumber;
    metadata: z.ZodObject<{
        previewUrl: z.ZodOptional<z.ZodString>;
        duration: z.ZodOptional<z.ZodNumber>;
        resolution: z.ZodOptional<z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strip>>;
        codec: z.ZodOptional<z.ZodString>;
        settings: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export interface RenderJob {
    id: string;
    projectId: string;
    timeline: any;
    priority: RenderPriority;
    status: RenderStatus;
    progress: number;
    error?: string;
    createdAt: string;
    updatedAt: string;
    startedAt?: string;
    completedAt?: string;
    workerId?: string;
    preset: string | RenderPreset;
    settings: {
        format: string;
        codec: string;
        resolution: {
            width: number;
            height: number;
        };
        fps: number;
        range?: [number, number];
    };
    dependencies: string[];
    metrics?: RenderMetrics;
    telemetry?: RenderTelemetry;
    artifacts?: RenderArtifact[];
    logs: string[];
    warnings: string[];
    stage: RenderPipelineStage;
}
export declare const RenderJobSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    timeline: z.ZodAny;
    priority: z.ZodEnum<{
        low: "low";
        high: "high";
        normal: "normal";
        critical: "critical";
    }>;
    status: z.ZodEnum<{
        failed: "failed";
        completed: "completed";
        cancelled: "cancelled";
        rendering: "rendering";
        paused: "paused";
        queued: "queued";
    }>;
    progress: z.ZodNumber;
    error: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    workerId: z.ZodOptional<z.ZodString>;
    preset: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        format: z.ZodString;
        codec: z.ZodString;
        resolution: z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strip>;
        fps: z.ZodNumber;
        audioOnly: z.ZodBoolean;
        settings: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>]>;
    settings: z.ZodObject<{
        format: z.ZodString;
        codec: z.ZodString;
        resolution: z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strip>;
        fps: z.ZodNumber;
        range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    }, z.core.$strip>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString>>;
    metrics: z.ZodOptional<z.ZodObject<{
        durationMs: z.ZodNumber;
        fps: z.ZodNumber;
        cpuUsage: z.ZodNumber;
        memoryUsage: z.ZodNumber;
        frameCount: z.ZodNumber;
        renderTimePerFrameMs: z.ZodNumber;
    }, z.core.$strip>>;
    telemetry: z.ZodOptional<z.ZodObject<{
        cpuUsage: z.ZodNumber;
        memoryUsage: z.ZodNumber;
        fps: z.ZodNumber;
        etaSeconds: z.ZodNumber;
        queueLatencyMs: z.ZodNumber;
        workerUtilization: z.ZodNumber;
        activeConnections: z.ZodNumber;
        throughput: z.ZodNumber;
    }, z.core.$strip>>;
    artifacts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        jobId: z.ZodString;
        url: z.ZodString;
        format: z.ZodString;
        size: z.ZodNumber;
        metadata: z.ZodObject<{
            previewUrl: z.ZodOptional<z.ZodString>;
            duration: z.ZodOptional<z.ZodNumber>;
            resolution: z.ZodOptional<z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, z.core.$strip>>;
            codec: z.ZodOptional<z.ZodString>;
            settings: z.ZodOptional<z.ZodAny>;
        }, z.core.$strip>;
        createdAt: z.ZodString;
    }, z.core.$strip>>>;
    logs: z.ZodDefault<z.ZodArray<z.ZodString>>;
    warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
    stage: z.ZodDefault<z.ZodEnum<{
        render: "render";
        failed: "failed";
        completed: "completed";
        validate: "validate";
        prepare: "prepare";
        build_composition: "build_composition";
        encode: "encode";
        generate_thumbnail: "generate_thumbnail";
        cleanup: "cleanup";
    }>>;
}, z.core.$strip>;
export interface RenderQueue {
    id: string;
    status: 'running' | 'paused';
    jobs: RenderJob[];
}
export declare const RenderQueueSchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<{
        running: "running";
        paused: "paused";
    }>;
    jobs: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        timeline: z.ZodAny;
        priority: z.ZodEnum<{
            low: "low";
            high: "high";
            normal: "normal";
            critical: "critical";
        }>;
        status: z.ZodEnum<{
            failed: "failed";
            completed: "completed";
            cancelled: "cancelled";
            rendering: "rendering";
            paused: "paused";
            queued: "queued";
        }>;
        progress: z.ZodNumber;
        error: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        startedAt: z.ZodOptional<z.ZodString>;
        completedAt: z.ZodOptional<z.ZodString>;
        workerId: z.ZodOptional<z.ZodString>;
        preset: z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
            format: z.ZodString;
            codec: z.ZodString;
            resolution: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, z.core.$strip>;
            fps: z.ZodNumber;
            audioOnly: z.ZodBoolean;
            settings: z.ZodOptional<z.ZodAny>;
        }, z.core.$strip>]>;
        settings: z.ZodObject<{
            format: z.ZodString;
            codec: z.ZodString;
            resolution: z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, z.core.$strip>;
            fps: z.ZodNumber;
            range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        }, z.core.$strip>;
        dependencies: z.ZodDefault<z.ZodArray<z.ZodString>>;
        metrics: z.ZodOptional<z.ZodObject<{
            durationMs: z.ZodNumber;
            fps: z.ZodNumber;
            cpuUsage: z.ZodNumber;
            memoryUsage: z.ZodNumber;
            frameCount: z.ZodNumber;
            renderTimePerFrameMs: z.ZodNumber;
        }, z.core.$strip>>;
        telemetry: z.ZodOptional<z.ZodObject<{
            cpuUsage: z.ZodNumber;
            memoryUsage: z.ZodNumber;
            fps: z.ZodNumber;
            etaSeconds: z.ZodNumber;
            queueLatencyMs: z.ZodNumber;
            workerUtilization: z.ZodNumber;
            activeConnections: z.ZodNumber;
            throughput: z.ZodNumber;
        }, z.core.$strip>>;
        artifacts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            jobId: z.ZodString;
            url: z.ZodString;
            format: z.ZodString;
            size: z.ZodNumber;
            metadata: z.ZodObject<{
                previewUrl: z.ZodOptional<z.ZodString>;
                duration: z.ZodOptional<z.ZodNumber>;
                resolution: z.ZodOptional<z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, z.core.$strip>>;
                codec: z.ZodOptional<z.ZodString>;
                settings: z.ZodOptional<z.ZodAny>;
            }, z.core.$strip>;
            createdAt: z.ZodString;
        }, z.core.$strip>>>;
        logs: z.ZodDefault<z.ZodArray<z.ZodString>>;
        warnings: z.ZodDefault<z.ZodArray<z.ZodString>>;
        stage: z.ZodDefault<z.ZodEnum<{
            render: "render";
            failed: "failed";
            completed: "completed";
            validate: "validate";
            prepare: "prepare";
            build_composition: "build_composition";
            encode: "encode";
            generate_thumbnail: "generate_thumbnail";
            cleanup: "cleanup";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
