import { IDigitalTwin, ValidationIssue, Validator } from '../types';

export class ValidationService {
  private validators: Validator[] = [];

  public registerValidator(validator: Validator): void {
    this.validators.push(validator);
  }

  public async validate(twin: IDigitalTwin): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const project = twin.getProjectState();
    const timeline = project.timeline || { clips: [], tracks: [] };
    const clips = timeline.clips || [];
    const workflows = twin.getWorkflows();
    const assets = twin.getAssets();
    const permissions = twin.getPermissions();

    // 1. Check for missing assets
    clips.forEach((clip: any) => {
      if (clip.assetId) {
        const found = assets.some(a => a.id === clip.assetId);
        if (!found) {
          issues.push({
            id: `val_missing_asset_${clip.id}`,
            category: 'missing_asset',
            severity: 'error',
            message: `Clip '${clip.name || clip.id}' references missing asset '${clip.assetId}'.`,
            targetId: clip.id,
          });
        }
      }
    });

    // 2. Check for broken track references
    clips.forEach((clip: any) => {
      if (clip.trackId) {
        const trackExists = (timeline.tracks || []).some((t: any) => t.id === clip.trackId);
        if (!trackExists) {
          issues.push({
            id: `val_broken_track_${clip.id}`,
            category: 'broken_reference',
            severity: 'error',
            message: `Clip '${clip.name || clip.id}' refers to invalid track '${clip.trackId}'.`,
            targetId: clip.id,
          });
        }
      }
    });

    // 3. Circular workflows detection
    workflows.forEach(wf => {
      const visited = new Set<string>();
      const recStack = new Set<string>();
      let hasCycle = false;

      const checkCycle = (stepId: string) => {
        if (recStack.has(stepId)) {
          hasCycle = true;
          return;
        }
        if (visited.has(stepId)) return;

        visited.add(stepId);
        recStack.add(stepId);

        const step = wf.steps.find(s => s.id === stepId);
        if (step && step.nextStepId) {
          checkCycle(step.nextStepId);
        }

        recStack.delete(stepId);
      };

      if (wf.steps && wf.steps.length > 0) {
        checkCycle(wf.steps[0].id);
      }

      if (hasCycle) {
        issues.push({
          id: `val_cycle_${wf.id}`,
          category: 'circular_workflow',
          severity: 'error',
          message: `Workflow '${wf.name}' contains a circular loop reference!`,
          targetId: wf.id,
        });
      }
    });

    // 4. Invalid expressions detection
    clips.forEach((clip: any) => {
      if (clip.expression) {
        const isBalanced = (clip.expression.split('(').length - 1) === (clip.expression.split(')').length - 1);
        if (!isBalanced || clip.expression.includes('__proto__') || clip.expression.includes('prototype')) {
          issues.push({
            id: `val_expr_${clip.id}`,
            category: 'invalid_expression',
            severity: 'error',
            message: `Clip '${clip.id}' contains an invalid/unsafe expression: '${clip.expression}'`,
            targetId: clip.id,
          });
        }
      }
    });

    // 5. Permission failures
    if (!permissions.includes('export_render')) {
      issues.push({
        id: 'val_permission_render',
        category: 'permission_failure',
        severity: 'warning',
        message: 'Current workspace role does not have authorization to trigger real cloud render tasks.',
      });
    }

    // 6. Plugin conflicts
    const plugins = twin.getPlugins();
    if (plugins.includes('legacy_audio') && plugins.includes('v2_audio')) {
      issues.push({
        id: 'val_plugin_conflict_audio',
        category: 'plugin_conflict',
        severity: 'error',
        message: 'Conflict: legacy_audio and v2_audio plugins are activated at the same time.',
      });
    }

    // Combine custom external validators
    for (const validator of this.validators) {
      const customIssues = await validator.validate(twin);
      issues.push(...customIssues);
    }

    return issues;
  }
}
