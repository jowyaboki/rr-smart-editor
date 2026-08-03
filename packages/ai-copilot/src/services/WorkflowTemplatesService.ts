export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  targetCategory: 'podcast' | 'talking_head' | 'tutorial' | 'marketing' | 'social_clip' | 'documentary';
  steps: Array<{ stepId: string; toolName: string; args: any }>;
}

export class WorkflowTemplatesService {
  private templates: WorkflowTemplate[] = [
    {
      id: 'podcast_flow',
      name: 'Automated Podcast Multi-cam Assembler',
      description: 'Automatically detects silence, balances audio, trims fillers, and switches angles based on speech indexing.',
      targetCategory: 'podcast',
      steps: [
        { stepId: 'step-1', toolName: 'detectSilence', args: { dbThreshold: -38 } },
        { stepId: 'step-2', toolName: 'removeFillerWords', args: { words: ['uh', 'um', 'like'] } },
        { stepId: 'step-3', toolName: 'normalizeAudio', args: { targetLufs: -16 } }
      ]
    },
    {
      id: 'talking_head_flow',
      name: 'Talking-head Zoom & Pacing Optimizer',
      description: 'Analyzes speech rate and zooms/cuts between key frames on pauses to improve conversational pacing.',
      targetCategory: 'talking_head',
      steps: [
        { stepId: 'step-1', toolName: 'splitClip', args: { splitTimeSec: 10.0 } },
        { stepId: 'step-2', toolName: 'normalizeAudio', args: { targetLufs: -14 } }
      ]
    },
    {
      id: 'tutorial_flow',
      name: 'Tutorial Zoom Transitions Compiler',
      description: 'Indexes screen captions and aggregates focus highlights dynamically.',
      targetCategory: 'tutorial',
      steps: [
        { stepId: 'step-1', toolName: 'generateTransitions', args: { transitionType: 'zoom', durationMs: 300 } }
      ]
    },
    {
      id: 'marketing_flow',
      name: 'Marketing Promotional Dynamic Clipper',
      description: 'Generates high-energy clip overlays and applies cinematic adapted music recommendations.',
      targetCategory: 'marketing',
      steps: [
        { stepId: 'step-1', toolName: 'generateTransitions', args: { transitionType: 'fade_cross', durationMs: 500 } }
      ]
    },
    {
      id: 'social_clip_flow',
      name: 'Social Clip Vertical Autocropper',
      description: 'Automates portrait cropping overlays and adds centered word-timing captions.',
      targetCategory: 'social_clip',
      steps: [
        { stepId: 'step-1', toolName: 'generateChapterMarkers', args: {} }
      ]
    },
    {
      id: 'documentary_flow',
      name: 'Cinematic Documentary Scene Arranger',
      description: 'Sifts visual concepts and orders clips chronologically based on metadata script prompts.',
      targetCategory: 'documentary',
      steps: [
        { stepId: 'step-1', toolName: 'rearrangeClips', args: { orderedClipIds: ['c1', 'c2'] } }
      ]
    }
  ];

  public listTemplates(): WorkflowTemplate[] {
    return this.templates;
  }

  public getWorkflowTemplate(id: string): WorkflowTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }
}
