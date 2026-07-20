import { AgentRuntime } from '@ai-video-editor/agent-runtime';

export class WebAiService {
  private runtime = new AgentRuntime();

  public getRuntime(): AgentRuntime {
    return this.runtime;
  }
}

export const webAiService = new WebAiService();
