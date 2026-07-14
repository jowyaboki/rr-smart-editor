import { WorkflowEngine } from '../services/WorkflowEngine';
import { ValidationEngine } from '../services/ValidationEngine';
import { HealthService } from '../services/HealthService';
import { usePipelineStore } from '../store/pipelineStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useMediaStore } from '@/features/media/store/mediaStore';

export const runPipelineTests = async () => {
  console.log('🚀 Starting Pipeline Workflow Tests...');

  const timelineStore = useTimelineStore.getState();
  const mediaStore = useMediaStore.getState();
  const pipelineStore = usePipelineStore.getState();

  // 1. Test Empty Project Validation
  console.log('--- Test 1: Empty Project Validation ---');
  timelineStore.setTracks([]);
  const checklist1 = await ValidationEngine.validateProject();
  console.log(`IsReady: ${checklist1.isReady}, Errors: ${checklist1.blockingErrors.length}`);
  // Expected: IsReady: false, Errors: 1 (Timeline is empty)

  // 2. Test Health Score calculation
  console.log('--- Test 2: Health Score calculation ---');
  const health2 = await HealthService.calculateHealth();
  console.log(`Score: ${health2.score}, Tips: ${health2.tips.length}`);
  // Expected: Score < 100

  // 3. Test Workflow Stage Transition
  console.log('--- Test 3: Workflow Stage Transition ---');
  await WorkflowEngine.transitionTo('preview');
  console.log(`Current Stage: ${usePipelineStore.getState().currentStage}`);
  // Expected: preview

  console.log('✅ Pipeline Workflow Tests Completed.');
};
