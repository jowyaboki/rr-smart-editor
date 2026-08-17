export interface SceneSpecification {
  id: string;
  narration: string;
  timing: { start: number; duration: number }; // In seconds
  transition: 'none' | 'crossfade' | 'fade-to-black' | 'whip-pan';
  overlayText?: string;
  musicSuggestion?: string;
  bRollPlaceholder: string;
  animationPreset?: string;
}

export interface ProjectSpecification {
  prompt: string;
  duration: number; // In seconds
  aspectRatio: '16:9' | '9:16' | '1:1';
  language: string;
  style: string;
  platform: 'youtube' | 'shorts' | 'tiktok' | 'instagram';
  scenes: SceneSpecification[];
}

export interface AIProvider {
  id: string;
  name: string;
  generateProjectSpec(prompt: string, duration: number, style: string): Promise<ProjectSpecification>;
}

// Concrete provider implementations supporting interchangeability
export class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI GPT-4o';

  async generateProjectSpec(prompt: string, duration: number, style: string): Promise<ProjectSpecification> {
    // Highly descriptive mock structured specifications compiled asynchronously
    return {
      prompt,
      duration,
      aspectRatio: '16:9',
      language: 'en',
      style,
      platform: 'youtube',
      scenes: [
        {
          id: 'sc-1',
          narration: 'In a world driven by speed and high-precision code, one platform unifies the entire creative ecosystem.',
          timing: { start: 0, duration: 5 },
          transition: 'crossfade',
          overlayText: 'Unify Your Creative Flow',
          musicSuggestion: 'Ambient Techno Beats',
          bRollPlaceholder: 'futuristic dark server datacenter glow lines',
          animationPreset: 'fade-in'
        },
        {
          id: 'sc-2',
          narration: 'From professional multi-track timeline editing to real-time rendering, everything reacts instantly.',
          timing: { start: 5, duration: 5 },
          transition: 'whip-pan',
          overlayText: 'Real-Time Multi-track Editing',
          musicSuggestion: 'Uplifting Synthwave',
          bRollPlaceholder: 'high-tech editing software workspace dials',
          animationPreset: 'slide-right'
        }
      ]
    };
  }
}

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini Pro';

  async generateProjectSpec(prompt: string, duration: number, style: string): Promise<ProjectSpecification> {
    return new OpenAIProvider().generateProjectSpec(prompt, duration, style);
  }
}

export class AnthropicProvider implements AIProvider {
  id = 'anthropic';
  name = 'Anthropic Claude 3.5 Sonnet';

  async generateProjectSpec(prompt: string, duration: number, style: string): Promise<ProjectSpecification> {
    return new OpenAIProvider().generateProjectSpec(prompt, duration, style);
  }
}

export class AIGeneratorService {
  private providers: Map<string, AIProvider> = new Map();
  private activeProviderId = 'openai';

  constructor() {
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new GeminiProvider());
    this.registerProvider(new AnthropicProvider());
  }

  public registerProvider(provider: AIProvider) {
    this.modulesRegister(provider);
  }

  private modulesRegister(provider: AIProvider) {
    this.providers.set(provider.id, provider);
  }

  public setActiveProvider(id: string) {
    if (this.providers.has(id)) {
      this.activeProviderId = id;
    }
  }

  public getActiveProvider(): AIProvider {
    return this.providers.get(this.activeProviderId) || new OpenAIProvider();
  }

  public async generateProject(
    prompt: string,
    duration: number,
    aspectRatio: '16:9' | '9:16' | '1:1',
    language: string,
    style: string,
    platform: 'youtube' | 'shorts' | 'tiktok' | 'instagram'
  ): Promise<ProjectSpecification> {
    const provider = this.getActiveProvider();
    const spec = await provider.generateProjectSpec(prompt, duration, style);
    return {
      ...spec,
      aspectRatio,
      language,
      platform
    };
  }
}

export const globalAIGeneratorService = new AIGeneratorService();
