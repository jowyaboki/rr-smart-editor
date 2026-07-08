import { RenderJob, RenderResult, RendererProvider } from '../types';
import { LocalRendererProvider } from '../services/RendererProvider';

export class RenderEngine {
  private provider: RendererProvider;

  constructor() {
    // Default to local for now, could be driven by config
    this.provider = new LocalRendererProvider();
  }

  async startRender(job: RenderJob): Promise<void> {
    // 1. Validate Job Settings
    // 2. Resolve Assets
    // 3. Trigger Provider
    return this.provider.render(job);
  }

  async cancelRender(jobId: string): Promise<void> {
    return this.provider.cancel(jobId);
  }
}
