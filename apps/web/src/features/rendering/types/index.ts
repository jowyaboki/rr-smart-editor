import {
  RenderJob as SharedRenderJob,
  RenderSettings as SharedRenderSettings,
  RenderProgress as SharedRenderProgress,
  RenderStatus as SharedRenderStatus,
  RenderPreset as SharedRenderPreset
} from '@ai-video-editor/shared';

export type RenderJob = SharedRenderJob;
export type RenderSettings = SharedRenderSettings;
export type RenderProgress = SharedRenderProgress;
export type RenderStatus = SharedRenderStatus;
export type RenderPreset = SharedRenderPreset;

export interface RendererProvider {
  render(job: RenderJob): Promise<void>;
  cancel(jobId: string): Promise<void>;
}
