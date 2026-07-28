import { RenderPreset, RenderJob } from '@ai-video-editor/shared';
export interface ExportFormat {
    id: string;
    name: string;
    extension: string;
    contentType: string;
}
export interface PostProcessingContext {
    jobId: string;
    outputPath: string;
    format: string;
    metadata: any;
}
export interface PostProcessingStep {
    id: string;
    name: string;
    execute: (context: PostProcessingContext) => Promise<{
        success: boolean;
        url?: string;
        logs?: string[];
        warnings?: string[];
    }>;
}
export interface RenderWorkerAdapter {
    id: string;
    name: string;
    capabilities: any;
    start(): Promise<void>;
    stop(): Promise<void>;
    assignJob(jobId: string): Promise<boolean>;
}
export interface SchedulingStrategy {
    name: string;
    selectJob(eligibleJobs: RenderJob[], workers: any[]): Promise<{
        job: RenderJob;
        workerId: string;
    } | null>;
}
declare class RenderPluginRegistry {
    private presets;
    private exportFormats;
    private postProcessingSteps;
    constructor();
    registerPreset(preset: RenderPreset): void;
    getPreset(id: string): RenderPreset | undefined;
    getAllPresets(): RenderPreset[];
    registerExportFormat(format: ExportFormat): void;
    getExportFormat(id: string): ExportFormat | undefined;
    getAllExportFormats(): ExportFormat[];
    registerPostProcessingStep(step: PostProcessingStep): void;
    getPostProcessingStep(id: string): PostProcessingStep | undefined;
    getAllPostProcessingSteps(): PostProcessingStep[];
}
export declare const renderPluginRegistry: RenderPluginRegistry;
export {};
