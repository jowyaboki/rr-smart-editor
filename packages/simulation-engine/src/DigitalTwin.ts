import { Project, Workflow, WorkflowVariable } from '@ai-video-editor/shared';
import { IDigitalTwin, SimulationEvent, SimulationType } from './types';

export class DigitalTwin implements IDigitalTwin {
  public id: string;
  public originalProjectId: string;
  public state: {
    project: Project;
    workflows: Workflow[];
    variables: WorkflowVariable[];
    assets: any[];
    plugins: string[];
    permissions: string[];
  };
  public history: SimulationEvent[] = [];
  public replayPointer = -1;

  // Track initial state for easy full reset
  private initialStateJson: string;

  constructor(
    id: string,
    project: Project,
    workflows: Workflow[] = [],
    variables: WorkflowVariable[] = [],
    assets: any[] = [],
    plugins: string[] = [],
    permissions: string[] = []
  ) {
    this.id = id;
    this.originalProjectId = project.id;

    // Deep clone everything to ensure isolation
    this.state = {
      project: JSON.parse(JSON.stringify(project)),
      workflows: JSON.parse(JSON.stringify(workflows)),
      variables: JSON.parse(JSON.stringify(variables)),
      assets: JSON.parse(JSON.stringify(assets)),
      plugins: JSON.parse(JSON.stringify(plugins)),
      permissions: JSON.parse(JSON.stringify(permissions)),
    };

    // Save for full resets
    this.initialStateJson = JSON.stringify(this.state);
  }

  public getProjectState(): Project {
    return this.state.project;
  }

  public getWorkflows(): Workflow[] {
    return this.state.workflows;
  }

  public getVariables(): WorkflowVariable[] {
    return this.state.variables;
  }

  public getAssets(): any[] {
    return this.state.assets;
  }

  public getPlugins(): string[] {
    return this.state.plugins;
  }

  public getPermissions(): string[] {
    return this.state.permissions;
  }

  /**
   * Executes a simulated operation against the cloned project state
   */
  public async executeOperation(type: SimulationType, payload: any): Promise<SimulationEvent> {
    const beforeState = JSON.parse(JSON.stringify(this.state));
    let description = '';
    const metadata: Record<string, any> = { ...payload };

    switch (type) {
      case 'timeline_edit': {
        const { action, clipId, startFrame, duration, trackId } = payload;
        const timeline = this.state.project.timeline || { tracks: [], clips: [] };
        if (!this.state.project.timeline) {
          this.state.project.timeline = timeline;
        }

        if (action === 'move') {
          description = `Moved clip '${clipId}' to frame ${startFrame}`;
          const clip = timeline.clips?.find((c: any) => c.id === clipId);
          if (clip) {
            clip.startFrame = startFrame;
            if (trackId) clip.trackId = trackId;
          }
        } else if (action === 'resize') {
          description = `Resized clip '${clipId}' to duration ${duration}`;
          const clip = timeline.clips?.find((c: any) => c.id === clipId);
          if (clip) {
            clip.duration = duration;
          }
        } else if (action === 'add') {
          description = `Added new clip '${payload.clip?.name || clipId}'`;
          timeline.clips = timeline.clips || [];
          timeline.clips.push(payload.clip);
        } else if (action === 'split') {
          description = `Split clip '${clipId}' at frame ${payload.splitFrame}`;
          const clipIdx = timeline.clips?.findIndex((c: any) => c.id === clipId);
          if (clipIdx !== undefined && clipIdx !== -1) {
            const clip = timeline.clips[clipIdx];
            const left = { ...clip, id: `${clipId}_split_L`, duration: payload.splitFrame - clip.startFrame };
            const right = { ...clip, id: `${clipId}_split_R`, startFrame: payload.splitFrame, duration: clip.duration - (payload.splitFrame - clip.startFrame) };
            timeline.clips.splice(clipIdx, 1, left, right);
          }
        } else {
          description = `Modified timeline`;
        }
        break;
      }

      case 'ai_operation': {
        const { operation, targetClipId } = payload;
        const timeline = this.state.project.timeline || { tracks: [], clips: [] };
        if (!this.state.project.timeline) {
          this.state.project.timeline = timeline;
        }

        if (operation === 'auto_caption') {
          description = `Generated AI captions for timeline`;
          // Append automatic subtitle clips
          const newTrack = { id: 'track_captions_ai', name: 'Captions AI', type: 'text' };
          timeline.tracks = timeline.tracks || [];
          timeline.tracks.push(newTrack);
          timeline.clips = timeline.clips || [];
          timeline.clips.push({
            id: 'clip_caption_ai_1',
            trackId: 'track_captions_ai',
            name: 'Generated Subtitle',
            startFrame: 0,
            duration: 100,
            type: 'text',
            text: 'AI generated speech-to-text',
          });
        } else if (operation === 'montage') {
          description = `Generated AI montage`;
          timeline.clips = timeline.clips || [];
          timeline.clips.push({
            id: 'clip_montage_ai_1',
            trackId: 'track_video_1',
            name: 'AI Smart Cut',
            startFrame: 150,
            duration: 90,
            type: 'video',
          });
        } else {
          description = `Executed AI Creative Studio task: ${operation}`;
        }
        break;
      }

      case 'workflow_execution': {
        const { workflowId, status, currentStepId } = payload;
        description = `Executed workflow '${workflowId}' step '${currentStepId}'`;
        const wf = this.state.workflows.find(w => w.id === workflowId);
        if (wf) {
          metadata.workflowName = wf.name;
        }
        break;
      }

      case 'rendering': {
        description = `Simulated export render for preset '${payload.preset || 'mp4'}'`;
        break;
      }

      case 'publishing': {
        description = `Simulated publication to platform '${payload.platform || 'youtube'}'`;
        break;
      }

      case 'asset_replacement': {
        const { oldAssetId, newAssetId } = payload;
        description = `Replaced asset '${oldAssetId}' with '${newAssetId}'`;
        const timeline = this.state.project.timeline || { tracks: [], clips: [] };
        if (timeline.clips) {
          timeline.clips.forEach((clip: any) => {
            if (clip.assetId === oldAssetId) {
              clip.assetId = newAssetId;
            }
          });
        }
        break;
      }

      case 'plugin_execution': {
        description = `Executed simulated plugin hook: ${payload.hookName}`;
        break;
      }

      case 'variable_update': {
        const { name, value } = payload;
        description = `Updated workflow variable '${name}' to '${value}'`;
        const variable = this.state.variables.find(v => v.name === name);
        if (variable) {
          variable.value = value;
        } else {
          this.state.variables.push({
            name,
            type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
            value,
            scope: 'project',
          });
        }
        break;
      }

      case 'expression_evaluation': {
        const { expression, targetField, targetClipId } = payload;
        description = `Evaluated expression '${expression}' for clip '${targetClipId}' field '${targetField}'`;
        const timeline = this.state.project.timeline || { tracks: [], clips: [] };
        const clip = timeline.clips?.find((c: any) => c.id === targetClipId);
        if (clip) {
          clip[targetField] = 120; // Simulated expression result
        }
        break;
      }

      default:
        description = `Executed generic operation: ${type}`;
        break;
    }

    const event: SimulationEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      type,
      description,
      metadata,
      stateDelta: {
        before: beforeState,
        after: JSON.parse(JSON.stringify(this.state)),
      },
    };

    // Push to history and update replay pointer to pointing to the end
    this.history.push(event);
    this.replayPointer = this.history.length - 1;

    return event;
  }

  /**
   * Travel to a specific step in recorded simulation history (0-based index)
   */
  public replayToStep(stepIndex: number): void {
    if (stepIndex < -1 || stepIndex >= this.history.length) {
      throw new Error(`Invalid replay step index: ${stepIndex}`);
    }

    // Reset to initial state
    this.state = JSON.parse(this.initialStateJson);

    // Apply state updates up to the specified step
    for (let i = 0; i <= stepIndex; i++) {
      const event = this.history[i];
      this.state = JSON.parse(JSON.stringify(event.stateDelta?.after));
    }

    this.replayPointer = stepIndex;
  }

  /**
   * Rollbacks the last executed step
   */
  public rollbackStep(): SimulationEvent | null {
    if (this.history.length === 0) {
      return null;
    }

    const rolledEvent = this.history.pop()!;
    this.replayPointer = this.history.length - 1;

    if (this.history.length === 0) {
      // Revert completely to initial state
      this.state = JSON.parse(this.initialStateJson);
    } else {
      const lastEvent = this.history[this.history.length - 1];
      this.state = JSON.parse(JSON.stringify(lastEvent.stateDelta?.after));
    }

    return rolledEvent;
  }

  /**
   * Deep clones this entire DigitalTwin, including state and historical log
   */
  public clone(): IDigitalTwin {
    const twinClone = new DigitalTwin(
      `${this.id}_clone_${Math.random().toString(36).substr(2, 5)}`,
      this.state.project,
      this.state.workflows,
      this.state.variables,
      this.state.assets,
      this.state.plugins,
      this.state.permissions
    );

    twinClone.history = JSON.parse(JSON.stringify(this.history));
    twinClone.replayPointer = this.replayPointer;
    twinClone.initialStateJson = this.initialStateJson;
    twinClone.state = JSON.parse(JSON.stringify(this.state));

    return twinClone;
  }
}
