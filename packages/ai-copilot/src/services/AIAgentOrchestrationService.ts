import { ProjectSpecification, SceneSpecification } from './AIGeneratorService';

export interface ProductionBrief {
  creativeObjective: string;
  platform: 'youtube' | 'shorts' | 'tiktok' | 'instagram';
  duration: number; // In seconds
  brand: string;
  audience: string;
  tone: string;
  language: string;
  visualStyle: string;
}

export interface ProductionArtifact {
  id: string;
  type: 'brief' | 'script' | 'scene_plan' | 'audio_plan' | 'final_specification';
  version: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface OrchestrationAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  processTask(context: ProductionBrief, previousArtifacts: ProductionArtifact[]): Promise<ProductionArtifact>;
}

// Phase 2 Specialized Independent Agents
export class CreativeDirectorAgent implements OrchestrationAgent {
  id = 'creative-director';
  name = 'Sarah (Creative Director)';
  role = 'Compiles creative objectives, platforms, and tone constraints.';
  avatar = '👩‍🎤';

  async processTask(context: ProductionBrief, previousArtifacts: ProductionArtifact[]): Promise<ProductionArtifact> {
    return {
      id: 'art-brief',
      type: 'brief',
      version: 1,
      content: `Approved Production Brief - Objective: ${context.creativeObjective}. Brand guidelines aligned for ${context.brand}. Target: ${context.audience}.`,
      status: 'pending'
    };
  }
}

export class ScriptWriterAgent implements OrchestrationAgent {
  id = 'script-writer';
  name = 'Michael (Script Writer)';
  role = 'Drafts high-fidelity voice narration lines.';
  avatar = '🎧';

  async processTask(context: ProductionBrief, previousArtifacts: ProductionArtifact[]): Promise<ProductionArtifact> {
    return {
      id: 'art-script',
      type: 'script',
      version: 1,
      content: 'In a world driven by speed and high-precision code, one platform unifies the entire creative ecosystem. From professional timelines to real-time rendering, everything reacts instantly.',
      status: 'pending'
    };
  }
}

export class StoryboardPlannerAgent implements OrchestrationAgent {
  id = 'storyboard-planner';
  name = 'James (Storyboard Planner)';
  role = 'Assembles B-Roll visual placeholders and graphics overlays.';
  avatar = '👨‍🎨';

  async processTask(context: ProductionBrief, previousArtifacts: ProductionArtifact[]): Promise<ProductionArtifact> {
    return {
      id: 'art-scene',
      type: 'scene_plan',
      version: 1,
      content: 'Scene 1: Dark server datacenter visual with glowing lines. Scene 2: High-tech video editing software dials.',
      status: 'pending'
    };
  }
}

export class AIAgentOrchestrationService {
  private agents: Map<string, OrchestrationAgent> = new Map();
  private artifacts: ProductionArtifact[] = [];

  constructor() {
    this.registerAgent(new CreativeDirectorAgent());
    this.registerAgent(new ScriptWriterAgent());
    this.registerAgent(new StoryboardPlannerAgent());
  }

  public registerAgent(agent: OrchestrationAgent) {
    this.agents.set(agent.id, agent);
  }

  public getAgents(): OrchestrationAgent[] {
    return Array.from(this.agents.values());
  }

  public getArtifacts(): ProductionArtifact[] {
    return this.artifacts;
  }

  public clearArtifacts() {
    this.artifacts = [];
  }

  public approveArtifact(id: string) {
    const art = this.artifacts.find(a => a.id === id);
    if (art) {
      art.status = 'approved';
    }
  }

  public rejectArtifact(id: string) {
    const art = this.artifacts.find(a => a.id === id);
    if (art) {
      art.status = 'rejected';
    }
  }

  public async runOrchestrationPipeline(brief: ProductionBrief): Promise<ProductionArtifact[]> {
    this.clearArtifacts();

    // 1. Creative Director Agent compiles brief
    const director = this.agents.get('creative-director') || new CreativeDirectorAgent();
    const briefArt = await director.processTask(brief, []);
    this.artifacts.push(briefArt);

    // 2. Script Writer drafts script
    const writer = this.agents.get('script-writer') || new ScriptWriterAgent();
    const scriptArt = await writer.processTask(brief, this.artifacts);
    this.artifacts.push(scriptArt);

    // 3. Storyboard Planner plans scenes
    const planner = this.agents.get('storyboard-planner') || new StoryboardPlannerAgent();
    const sceneArt = await planner.processTask(brief, this.artifacts);
    this.artifacts.push(sceneArt);

    return this.artifacts;
  }
}

export const globalAIAgentOrchestrationService = new AIAgentOrchestrationService();
export default globalAIAgentOrchestrationService;
