import { ProjectSpecification } from './AIGeneratorService';
import { globalAssetResolver } from './AssetResolver';

export type JobStage =
  | 'planning'
  | 'writing'
  | 'searching'
  | 'building'
  | 'captions'
  | 'finalizing'
  | 'idle';

export interface GenerationJob {
  id: string;
  prompt: string;
  stage: JobStage;
  progress: number; // 0 to 100
  cancelled: boolean;
  error?: string;
  resultProjectId?: string;
}

export class TimelineBuilderService {
  private activeJobs: Map<string, GenerationJob> = new Map();

  /**
   * Translates the structured Project Specification into editable timeline tracks and clips.
   * Utilizes existing editing commands / timeline store parameters rather than writing raw JSON.
   */
  public async buildTimelineFromSpec(
    spec: ProjectSpecification,
    addClipFn: (trackId: string, clip: any) => void
  ): Promise<string> {
    const resultProjectId = `ai-project-${Math.random().toString(36).substr(2, 5)}`;

    // Add clips sequentially based on scene narration timings & resolved assets
    for (let i = 0; i < spec.scenes.length; i++) {
      const scene = spec.scenes[i];
      if (!scene) continue;

      // Translate placeholder keywords into resolved video assets
      const videoAsset = await globalAssetResolver.resolve(scene.bRollPlaceholder, 'video', 'pexels');

      // Convert seconds into frames (assuming standard 30 FPS edit target)
      const startFrame = Math.round(scene.timing.start * 30);
      const durationFrames = Math.round(scene.timing.duration * 30);

      // Create video track clip
      addClipFn('v1', {
        name: scene.overlayText || videoAsset.name,
        type: 'video',
        start: startFrame,
        duration: durationFrames,
        mediaId: videoAsset.id,
        url: videoAsset.url
      });

      // If narration script exists, map text subtitles to track
      if (scene.narration) {
        addClipFn('v2', {
          name: `Subtitle: ${scene.narration.substring(0, 20)}...`,
          type: 'text',
          start: startFrame,
          duration: durationFrames,
          content: scene.narration
        });
      }

      // If background music exists, map sound files to track
      if (scene.musicSuggestion) {
        const musicAsset = await globalAssetResolver.resolve(scene.musicSuggestion, 'audio', 'local');
        addClipFn('a1', {
          name: `Audio: ${musicAsset.name}`,
          type: 'audio',
          start: startFrame,
          duration: durationFrames,
          url: musicAsset.url
        });
      }
    }

    return resultProjectId;
  }

  /**
   * Submits and manages asynchronous background timeline creation jobs
   */
  public createJob(prompt: string): GenerationJob {
    const id = `job-ai-${Math.random().toString(36).substr(2, 5)}`;
    const job: GenerationJob = {
      id,
      prompt,
      stage: 'planning',
      progress: 0,
      cancelled: false
    };
    this.activeJobs.set(id, job);
    return job;
  }

  public getJob(id: string): GenerationJob | undefined {
    return this.activeJobs.get(id);
  }

  public cancelJob(id: string): void {
    const job = this.activeJobs.get(id);
    if (job) {
      job.cancelled = true;
      job.stage = 'idle';
      job.progress = 0;
    }
  }

  public async runJob(
    jobId: string,
    specGeneratorFn: () => Promise<ProjectSpecification>,
    addClipFn: (trackId: string, clip: any) => void
  ): Promise<string | null> {
    const job = this.activeJobs.get(jobId);
    if (!job || job.cancelled) return null;

    try {
      // Stage 1: Planning
      job.stage = 'planning';
      job.progress = 10;
      await this.delay(600);
      if (job.cancelled) return null;

      // Stage 2: Writing Script
      job.stage = 'writing';
      job.progress = 30;
      await this.delay(600);
      if (job.cancelled) return null;

      const spec = await specGeneratorFn();

      // Stage 3: Searching Assets
      job.stage = 'searching';
      job.progress = 50;
      await this.delay(600);
      if (job.cancelled) return null;

      // Stage 4: Building Timeline
      job.stage = 'building';
      job.progress = 70;
      if (job.cancelled) return null;

      const projectId = await this.buildTimelineFromSpec(spec, addClipFn);

      // Stage 5: Generating Captions
      job.stage = 'captions';
      job.progress = 90;
      await this.delay(600);
      if (job.cancelled) return null;

      // Stage 6: Finalizing
      job.stage = 'finalizing';
      job.progress = 100;
      job.resultProjectId = projectId;

      return projectId;
    } catch (err: any) {
      job.error = err.message || 'Generation failed';
      throw err;
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const globalTimelineBuilderService = new TimelineBuilderService();
