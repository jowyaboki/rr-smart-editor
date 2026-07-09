import { useAutomationStore } from '../store/automationStore';
import { AutomationQueue } from '../queue/AutomationQueue';
import { AutomationTemplate, BatchJob, DataConfig, GenerationProfile } from '@ai-video-editor/shared';
import { AutomationService } from '../services/AutomationService';

export const useAutomation = () => {
  const store = useAutomationStore();
  const queue = AutomationQueue.getInstance();

  const startBatch = async (
    name: string,
    template: AutomationTemplate,
    config: DataConfig,
    profile: GenerationProfile
  ) => {
    const job = AutomationService.createBatchJob(name, template, config, profile);
    store.addBatchJob(job);
    queue.enqueue(job, template);
    return job;
  };

  const cancelBatch = (jobId: string) => {
    queue.cancelJob(jobId);
  };

  return {
    templates: store.templates,
    presets: store.presets,
    activeJobs: store.activeBatchJobs,
    history: store.completedBatchJobs,
    batchItems: store.batchItems,
    startBatch,
    cancelBatch,
    addTemplate: store.addTemplate,
    addPreset: store.addPreset
  };
};
