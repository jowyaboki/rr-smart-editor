import { TransitionEngine } from '../engine/TransitionEngine';
import { TransitionService } from '../services/TransitionService';
import { useTransitionStore } from '../store/transitionStore';

export const runTransitionTests = () => {
  console.log('🚀 Starting Transition Engine Tests...');

  const preset = {
    id: 'test-fade',
    name: 'Fade',
    type: 'fade' as const,
    defaultSettings: { durationFrames: 30 }
  };

  useTransitionStore.getState().setPresets([preset]);

  // 1. Create Instance
  const instance = TransitionService.createFromPreset(preset, 'track-1', 100);
  console.log(`Transition created at frame ${instance.atFrame}`);

  // 2. Evaluate Progress
  const progressStart = TransitionEngine.evaluate(instance, 100);
  const progressMid = TransitionEngine.evaluate(instance, 115);
  const progressEnd = TransitionEngine.evaluate(instance, 130);

  console.log(`Progress: start=${progressStart}, mid=${progressMid}, end=${progressEnd}`);

  // 3. Build Props
  const props = TransitionEngine.buildAnimationProps(instance);
  console.log('Animation props built:', props.type, props.duration);

  console.log('✅ Transition Engine Tests Completed.');
};
