import {
  TriggerType,
  WorkflowStepType,
  WorkflowContext,
} from '@ai-video-editor/shared';

export interface TriggerDefinition {
  type: string;
  name: string;
  description: string;
  pluginId?: string;
}

export interface StepTypeDefinition {
  type: string;
  name: string;
  description: string;
  pluginId?: string;
  executor: (step: any, context: WorkflowContext) => Promise<any>;
}

export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  pluginId?: string;
  handler: (args: any, context: WorkflowContext) => Promise<any>;
}

export class WorkflowRegistry {
  private static triggers = new Map<string, TriggerDefinition>();
  private static stepTypes = new Map<string, StepTypeDefinition>();
  private static actions = new Map<string, ActionDefinition>();

  /**
   * Initializes the standard triggers, step types, and editor actions.
   */
  public static initialize(): void {
    this.triggers.clear();
    this.stepTypes.clear();
    this.actions.clear();

    // 1. Register Standard Triggers
    const standardTriggers: TriggerDefinition[] = [
      { type: 'manual', name: 'Manual Trigger', description: 'Triggered manually by the user.' },
      { type: 'project_open', name: 'Project Open', description: 'Runs when a project is opened.' },
      { type: 'project_save', name: 'Project Save', description: 'Runs when a project is saved.' },
      { type: 'render_complete', name: 'Render Complete', description: 'Runs when a video render completes successfully.' },
      { type: 'asset_imported', name: 'Asset Imported', description: 'Runs when new assets are added to the library.' },
      { type: 'timeline_changed', name: 'Timeline Changed', description: 'Runs when clips or tracks are updated.' },
      { type: 'template_applied', name: 'Template Applied', description: 'Runs when a template is applied to the project.' },
      { type: 'webhook', name: 'Webhook (Future)', description: 'Runs when a webhook payload is received (Future Cloud Execution).' },
    ];
    standardTriggers.forEach((t) => this.triggers.set(t.type, t));

    // 2. Register Standard Step Types
    const standardSteps: Omit<StepTypeDefinition, 'executor'>[] = [
      { type: 'condition', name: 'Condition Branch', description: 'Evaluate a boolean expression to branch.' },
      { type: 'loop', name: 'Loop Block', description: 'Loop over collection items or run multiple times.' },
      { type: 'delay', name: 'Delay Timeout', description: 'Pause the execution for a given time duration.' },
      { type: 'transform', name: 'Transform Data', description: 'Map or format variables and outputs.' },
      { type: 'command', name: 'Execute Editor Command', description: 'Perform an editor operation.' },
      { type: 'script', name: 'Custom JavaScript Script', description: 'Safely execute custom JavaScript code.' },
      { type: 'ai_task', name: 'AI Creative Task', description: 'Interact with AI models to generate scripts, scenes, or assets.' },
      { type: 'render', name: 'Trigger Video Render', description: 'Render the active project compositions.' },
      { type: 'notification', name: 'Dispatch Notification', description: 'Display a banner, notification log, or alert.' },
    ];
    standardSteps.forEach((s) => {
      this.stepTypes.set(s.type, {
        ...s,
        executor: async (step, context) => {
          return { success: true, stepId: step.id };
        },
      });
    });

    // 3. Register Standard Editor Actions
    const standardActions: ActionDefinition[] = [
      {
        id: 'create_project',
        name: 'Create Project',
        description: 'Creates a new empty project in the database.',
        handler: async (args, context) => {
          const API_URL = context.env.VITE_API_URL || 'http://localhost:3001';
          const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: args.name || 'Untitled Project' }),
          });
          if (!res.ok) throw new Error('Create Project action failed');
          const data = await res.json();
          context.variables.lastCreatedProjectId = data.id;
          return data;
        },
      },
      {
        id: 'import_assets',
        name: 'Import Assets',
        description: 'Imports files into the media/asset library.',
        handler: async (args, context) => {
          return { importedAssets: args.assets || [], count: (args.assets || []).length };
        },
      },
      {
        id: 'create_scene',
        name: 'Create Scene',
        description: 'Creates a new storyboard scene container.',
        handler: async (args, context) => {
          return { sceneId: 'scene_' + Math.random().toString(36).substr(2, 9), title: args.title || 'Scene' };
        },
      },
      {
        id: 'insert_clip',
        name: 'Insert Timeline Clip',
        description: 'Adds a clip to the active timeline.',
        handler: async (args, context) => {
          return { clipId: 'clip_' + Math.random().toString(36).substr(2, 9), ...args };
        },
      },
      {
        id: 'apply_transition',
        name: 'Apply Transition',
        description: 'Applies a transition between clips.',
        handler: async (args, context) => {
          return { transitionId: 'transition_applied', type: args.type || 'fade' };
        },
      },
      {
        id: 'apply_effect',
        name: 'Apply Visual/Audio Effect',
        description: 'Attaches an effect filter to a clip or track.',
        handler: async (args, context) => {
          return { effectId: 'effect_applied', name: args.name || 'color_grade' };
        },
      },
      {
        id: 'generate_captions',
        name: 'Generate Script/Captions',
        description: 'Transcribes audio to populate caption track.',
        handler: async (args, context) => {
          const API_URL = context.env.VITE_API_URL || 'http://localhost:3001';
          const res = await fetch(`${API_URL}/ai/generate-script`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: args.prompt || 'Generate script' }),
          });
          if (!res.ok) throw new Error('Generate captions action failed');
          return res.json();
        },
      },
      {
        id: 'render_video',
        name: 'Render Project Video',
        description: 'Triggers rendering composition output.',
        handler: async (args, context) => {
          const API_URL = context.env.VITE_API_URL || 'http://localhost:3001';
          const pId = args.projectId || context.projectId;
          if (!pId) throw new Error('No active project specified for render');
          const res = await fetch(`${API_URL}/renders/${pId}`, {
            method: 'POST',
          });
          if (!res.ok) throw new Error('Render action failed');
          return res.json();
        },
      },
      {
        id: 'export_project',
        name: 'Export Project Configuration',
        description: 'Exports the full project details as JSON.',
        handler: async (args, context) => {
          const API_URL = context.env.VITE_API_URL || 'http://localhost:3001';
          const pId = args.projectId || context.projectId;
          if (!pId) throw new Error('No project ID specified for export');
          const res = await fetch(`${API_URL}/projects/${pId}`);
          if (!res.ok) throw new Error('Export action failed');
          return res.json();
        },
      },
    ];
    standardActions.forEach((a) => this.actions.set(a.id, a));
  }

  // --- TRIGGER REGISTRY API ---
  public static registerTrigger(pluginId: string, trigger: Omit<TriggerDefinition, 'pluginId'>): void {
    this.triggers.set(trigger.type, { ...trigger, pluginId });
  }

  public static getTrigger(type: string): TriggerDefinition | null {
    return this.triggers.get(type) || null;
  }

  public static getAllTriggers(): TriggerDefinition[] {
    return Array.from(this.triggers.values());
  }

  // --- STEP TYPE REGISTRY API ---
  public static registerStepType(pluginId: string, stepType: Omit<StepTypeDefinition, 'pluginId'>): void {
    this.stepTypes.set(stepType.type, { ...stepType, pluginId });
  }

  public static getStepType(type: string): StepTypeDefinition | null {
    return this.stepTypes.get(type) || null;
  }

  public static getAllStepTypes(): StepTypeDefinition[] {
    return Array.from(this.stepTypes.values());
  }

  // --- ACTION REGISTRY API ---
  public static registerAction(pluginId: string, action: Omit<ActionDefinition, 'pluginId'>): void {
    this.actions.set(action.id, { ...action, pluginId });
  }

  public static getAction(id: string): ActionDefinition | null {
    return this.actions.get(id) || null;
  }

  public static getAllActions(): ActionDefinition[] {
    return Array.from(this.actions.values());
  }

  /**
   * Unregister plugin extensions.
   */
  public static unregisterPluginExtensions(pluginId: string): void {
    this.triggers.forEach((val, key) => {
      if (val.pluginId === pluginId) this.triggers.delete(key);
    });

    this.stepTypes.forEach((val, key) => {
      if (val.pluginId === pluginId) this.stepTypes.delete(key);
    });

    this.actions.forEach((val, key) => {
      if (val.pluginId === pluginId) this.actions.delete(key);
    });
  }
}

// Automatically initialize registry
WorkflowRegistry.initialize();
