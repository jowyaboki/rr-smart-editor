import { Agent, AgentType } from '@ai-video-editor/shared';

export class AgentRegistry {
  private static agents = new Map<string, Agent>();

  /**
   * Initializes standard 10 specialized agents on startup.
   */
  public static initializeStandardAgents(): void {
    this.agents.clear();

    const standardAgents: Agent[] = [
      {
        id: 'ag_project',
        name: 'Project Agent',
        type: 'project',
        capabilities: ['audit_project', 'summarize_settings'],
        status: 'idle',
      },
      {
        id: 'ag_script',
        name: 'Script Agent',
        type: 'script',
        capabilities: ['generate_script', 'outline_scenes'],
        status: 'idle',
      },
      {
        id: 'ag_storyboard',
        name: 'Storyboard Agent',
        type: 'storyboard',
        capabilities: ['generate_storyboard', 'select_templates'],
        status: 'idle',
      },
      {
        id: 'ag_timeline',
        name: 'Timeline Agent',
        type: 'timeline',
        capabilities: ['generate_clips_lane', 'snap_positions'],
        status: 'idle',
      },
      {
        id: 'ag_media',
        name: 'Media Agent',
        type: 'media',
        capabilities: ['organize_library', 'categorize_assets'],
        status: 'idle',
      },
      {
        id: 'ag_animation',
        name: 'Animation Agent',
        type: 'animation',
        capabilities: ['apply_easing_presets', 'keyframe_interpolation'],
        status: 'idle',
      },
      {
        id: 'ag_caption',
        name: 'Caption Agent',
        type: 'caption',
        capabilities: ['word_timing_refinement', 'caption_styling'],
        status: 'idle',
      },
      {
        id: 'ag_audio',
        name: 'Audio Agent',
        type: 'audio',
        capabilities: ['audio_gains_leveling', 'automation_curves'],
        status: 'idle',
      },
      {
        id: 'ag_rendering',
        name: 'Rendering Agent',
        type: 'rendering',
        capabilities: ['preflight_checks', 'validate_render_jobs'],
        status: 'idle',
      },
      {
        id: 'ag_quality',
        name: 'Quality Agent',
        type: 'quality',
        capabilities: ['detect_overlapping_clips', 'verify_readiness_score'],
        status: 'idle',
      },
    ];

    standardAgents.forEach((agent) => {
      this.agents.set(agent.id, agent);
    });
  }

  /**
   * Registers a specialized agent. Supports plugin extensions.
   */
  public static registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Retrieves an agent by its specialized type.
   */
  public static getAgentByType(type: AgentType): Agent | null {
    return Array.from(this.agents.values()).find((ag) => ag.type === type) || null;
  }

  /**
   * Returns list of all registered agents.
   */
  public static getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Updates an agent's status.
   */
  public static updateStatus(agentId: string, status: Agent['status']): void {
    const ag = this.agents.get(agentId);
    if (ag) {
      ag.status = status;
    }
  }
}
