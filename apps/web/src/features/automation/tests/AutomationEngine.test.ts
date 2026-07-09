import { BatchEngine } from '../engine/BatchEngine';
import { AutomationService } from '../services/AutomationService';
import { useAutomationStore } from '../store/automationStore';
import { AutomationTemplate, DataConfig, GenerationProfile } from '@ai-video-editor/shared';

export const runAutomationTests = async () => {
  console.log('🚀 Starting Automation Engine Tests...');

  const store = useAutomationStore.getState();
  const engine = BatchEngine.getInstance();

  // Mock Template
  const template: AutomationTemplate = {
    id: 'test-template',
    name: 'Test Template',
    projectId: 'test-project',
    mappings: [
      { key: 'title', path: 'name', type: 'text' },
      { key: 'count', path: 'value', type: 'number' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Test 100-item generation
  console.log('--- Test 1: 100-item generation ---');
  const largeData = Array.from({ length: 100 }, (_, i) => ({ name: `Item ${i}`, value: i }));
  const config1: DataConfig = { type: 'static', staticData: largeData };
  const profile1: GenerationProfile = {
    concurrency: 10,
    priority: 'normal',
    retryConfig: { maxRetries: 1, backoffMs: 100 },
    outputPattern: 'test_{id}'
  };

  const job1 = AutomationService.createBatchJob('Large Batch', template, config1, profile1);
  store.addBatchJob(job1);

  await engine.run(job1, template);

  const finalJob1 = useAutomationStore.getState().completedBatchJobs.find(j => j.id === job1.id);
  console.log(`Result: ${finalJob1?.status}, Completed: ${finalJob1?.progress.completed}/100`);

  // 2. Test Validation Failures
  console.log('--- Test 2: Validation Failures ---');
  const invalidData = [{ name: 'Valid' }, { value: 123 }]; // Second row missing 'name'
  const config2: DataConfig = { type: 'static', staticData: invalidData };
  const job2 = AutomationService.createBatchJob('Invalid Data Batch', template, config2, profile1);
  store.addBatchJob(job2);

  await engine.run(job2, template);

  const items2 = useAutomationStore.getState().batchItems[job2.id] || [];
  console.log(`Result: ${items2[1].status}, Error: ${items2[1].error}`);

  // 3. Test Cancellation
  console.log('--- Test 3: Cancellation ---');
  const job3 = AutomationService.createBatchJob('Cancel Batch', template, config1, profile1);
  store.addBatchJob(job3);

  const runPromise = engine.run(job3, template);
  setTimeout(() => engine.stop(job3.id), 50); // Stop mid-way
  await runPromise;

  const finalJob3 = useAutomationStore.getState().completedBatchJobs.find(j => j.id === job3.id) ||
                   useAutomationStore.getState().activeBatchJobs.find(j => j.id === job3.id);
  console.log(`Result: ${finalJob3?.status}`);

  console.log('✅ Automation Engine Tests Completed.');
};
