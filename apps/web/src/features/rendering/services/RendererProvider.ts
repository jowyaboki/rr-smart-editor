import { RenderJob, RendererProvider } from '../types';

export class LocalRendererProvider implements RendererProvider {
  async render(job: RenderJob): Promise<void> {
    console.log(`[LocalRenderer] Starting render for ${job.projectName}`);
    // This will later use @remotion/renderer (if possible in browser) or simulate
  }

  async cancel(jobId: string): Promise<void> {
    console.log(`[LocalRenderer] Cancelling job ${jobId}`);
  }
}

export class ServerRendererProvider implements RendererProvider {
  async render(job: RenderJob): Promise<void> {
    // Stub for communication with Express backend
    // fetch('/api/render', { method: 'POST', body: JSON.stringify(job) });
    console.log(`[ServerRenderer] Requested render for ${job.projectName}`);
  }

  async cancel(jobId: string): Promise<void> {
    console.log(`[ServerRenderer] Requested cancellation for ${jobId}`);
  }
}
