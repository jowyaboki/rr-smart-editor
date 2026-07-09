import {
  AutomationTemplate,
  DataConfig,
  GenerationProfile,
  BatchJob,
  BatchItem,
  AutomationStatus
} from '@ai-video-editor/shared';
import { v4 as uuidv4 } from 'uuid';
import { JsonConnector } from '@/features/data/connectors/JsonConnector';

export const AutomationService = {
  async fetchData(config: DataConfig): Promise<any[]> {
    switch (config.type) {
      case 'json':
        const connector = new JsonConnector();
        const data = await connector.fetch({
            id: 'temp',
            name: 'temp',
            type: 'json',
            config: { url: config.url || '' }
        });
        return Array.isArray(data) ? data : [data];
      case 'static':
        return Array.isArray(config.staticData) ? config.staticData : [config.staticData];
      default:
        throw new Error(`Unsupported data source type: ${config.type}`);
    }
  },

  createBatchJob(name: string, template: AutomationTemplate, config: DataConfig, profile: GenerationProfile): BatchJob {
    return {
      id: uuidv4(),
      name,
      templateId: template.id,
      dataConfig: config,
      profile,
      status: 'idle',
      progress: {
        total: 0,
        completed: 0,
        failed: 0,
        percent: 0,
        startTime: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };
  },

  createBatchItem(batchId: string, dataRow: any): BatchItem {
    return {
      id: uuidv4(),
      batchId,
      dataRow,
      resolvedVariables: {},
      status: 'idle'
    };
  }
};
