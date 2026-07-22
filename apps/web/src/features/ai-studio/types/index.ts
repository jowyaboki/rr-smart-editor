export interface CreativeBrief {
  title: string;
  targetAudience: string;
  tone: string;
  style: string;
  durationSeconds: number;
}

export interface ScriptScene {
  id: string;
  description: string;
  dialogue: string;
  durationSeconds: number;
  visualPrompt: string;
}

export interface Script {
  brief: CreativeBrief;
  scenes: ScriptScene[];
}

export interface StoryboardScene {
  id: string;
  scriptSceneId: string;
  visualUrl: string;
  voiceoverUrl?: string;
  subtitle: string;
}

export interface AIProjectOutput {
  id: string;
  name: string;
  script: Script;
  storyboard: StoryboardScene[];
  timeline: any; // timeline structure
  brandConfig?: {
    palette: string[];
    fontFamily: string;
  };
}
