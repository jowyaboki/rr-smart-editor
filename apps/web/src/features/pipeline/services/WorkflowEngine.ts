import { WorkflowStage } from '@ai-video-editor/shared';
import { usePipelineStore } from '../store/pipelineStore';
import { ValidationEngine } from './ValidationEngine';
import { HealthService } from './HealthService';

export const WorkflowEngine = {
  async transitionTo(stage: WorkflowStage): Promise<boolean> {
    const store = usePipelineStore.getState();

    if (stage === 'validation' || stage === 'rendering') {
      const checklist = await ValidationEngine.validateProject();
      store.setChecklist(checklist);

      const health = await HealthService.calculateHealth();
      store.updateHealth(health);

      if (!checklist.isReady && stage === 'rendering') {
        return false;
      }
    }

    store.setCurrentStage(stage);
    return true;
  }
};
