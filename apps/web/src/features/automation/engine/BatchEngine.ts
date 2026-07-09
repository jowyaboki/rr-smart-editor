import {
  BatchJob,
  BatchItem,
  AutomationTemplate,
  GenerationProfile,
  VariableMapping
} from '@ai-video-editor/shared';
import { VariableResolver } from '../services/VariableResolver';
import { BatchValidationService } from '../services/BatchValidationService';
import { AutomationService } from '../services/AutomationService';
import { useAutomationStore } from '../store/automationStore';
import { useProjectStore } from '@/features/projects/store/projectStore';
import { useRenderingStore } from '@/features/rendering/store/renderingStore';

export class BatchEngine {
  private static instance: BatchEngine;
  private runningBatches: Set<string> = new Set();

  private constructor() {}

  static getInstance(): BatchEngine {
    if (!BatchEngine.instance) {
      BatchEngine.instance = new BatchEngine();
    }
    return BatchEngine.instance;
  }

  async run(batchJob: BatchJob, template: AutomationTemplate): Promise<void> {
    if (this.runningBatches.has(batchJob.id)) return;
    this.runningBatches.add(batchJob.id);

    const store = useAutomationStore.getState();
    store.updateBatchJob(batchJob.id, { status: 'processing', startedAt: new Date().toISOString() });

    try {
      // 1. Load Data
      const data = await AutomationService.fetchData(batchJob.dataConfig);

      // 2. Initialize Items
      const items = data.map(row => AutomationService.createBatchItem(batchJob.id, row));
      store.setBatchItems(batchJob.id, items);
      store.updateBatchJob(batchJob.id, {
        progress: { ...batchJob.progress, total: items.length }
      });

      // 3. Process Items with Concurrency
      const concurrency = batchJob.profile.concurrency || 1;
      const chunks = this.chunkArray(items, concurrency);

      for (const chunk of chunks) {
        if (!this.runningBatches.has(batchJob.id)) break; // Cancelled

        await Promise.all(chunk.map(item => this.processItem(item, template, batchJob.profile)));

        // Update Overall Progress
        const currentItems = useAutomationStore.getState().batchItems[batchJob.id] || [];
        const completed = currentItems.filter(i => i.status === 'completed').length;
        const failed = currentItems.filter(i => i.status === 'failed').length;

        store.updateBatchJob(batchJob.id, {
          progress: {
            ...batchJob.progress,
            total: items.length,
            completed,
            failed,
            percent: Math.round(((completed + failed) / items.length) * 100)
          }
        });
      }

      store.updateBatchJob(batchJob.id, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
    } catch (error: any) {
      store.updateBatchJob(batchJob.id, {
        status: 'failed',
        progress: { ...batchJob.progress, currentItem: error.message }
      });
    } finally {
      this.runningBatches.delete(batchJob.id);
    }
  }

  private async processItem(item: BatchItem, template: AutomationTemplate, profile: GenerationProfile): Promise<void> {
    const store = useAutomationStore.getState();
    store.updateBatchItem(item.batchId, item.id, { status: 'processing' });

    try {
      // 1. Variable Resolution
      const resolved = VariableResolver.resolve(item.dataRow, template.mappings);

      // 2. Validation
      const dataErrors = BatchValidationService.validateRow(item.dataRow, template.mappings);
      if (dataErrors.length > 0) throw new Error(dataErrors.join(', '));

      const assetErrors = await BatchValidationService.validateAssets(resolved, template.mappings);
      if (assetErrors.length > 0) throw new Error(assetErrors.join(', '));

      // 3. Project Generation (Replicate template project with variables)
      const projectStore = useProjectStore.getState();
      const baseProject = projectStore.projects.find(p => p.id === template.projectId);
      if (!baseProject) throw new Error('Template project not found');

      const generatedProject = {
        ...baseProject,
        id: `gen_${item.id}`,
        name: `${baseProject.name} - ${item.id}`,
        // Here we would apply resolved variables to the timeline/clips
        // This requires deeper integration with the timeline engine
      };

      // 4. Trigger Render
      const renderingStore = useRenderingStore.getState();
      // Mock render job creation
      const renderJobId = `render_${item.id}`;

      store.updateBatchItem(item.batchId, item.id, {
        status: 'completed',
        resolvedVariables: resolved,
        projectId: generatedProject.id,
        renderJobId
      });
    } catch (error: any) {
      store.updateBatchItem(item.batchId, item.id, {
        status: 'failed',
        error: error.message
      });
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  stop(batchId: string): void {
    this.runningBatches.delete(batchId);
    useAutomationStore.getState().updateBatchJob(batchId, { status: 'cancelled' });
  }
}
