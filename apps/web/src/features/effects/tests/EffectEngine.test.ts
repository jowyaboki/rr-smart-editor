import { EffectEngine } from '../engine/EffectEngine';
import { EffectInstance } from '@ai-video-editor/shared';

export const runEffectTests = () => {
  console.log('🚀 Starting Effect Engine Tests...');

  // 1. Mock Effect Stack
  const instances: EffectInstance[] = [
    {
      id: 'inst-1',
      effectId: 'blur',
      enabled: true,
      parameterValues: { radius: 10 },
      animations: [],
      expanded: false
    },
    {
      id: 'inst-2',
      effectId: 'brightness',
      enabled: true,
      parameterValues: { level: 1.5 },
      animations: [],
      expanded: false
    }
  ];

  // 2. Evaluate Stack
  const styles = EffectEngine.evaluateStack(instances, 0);
  console.log('Evaluated Styles:', styles);
  // Expected: { filter: 'blur(10px) brightness(1.5)', opacity: 1 }

  // 3. Test Disabled Effect
  const disabledStyles = EffectEngine.evaluateStack([
    { ...instances[0], enabled: false },
    instances[1]
  ], 0);
  console.log('Disabled Effect Styles:', disabledStyles);
  // Expected: { filter: 'brightness(1.5)', opacity: 1 }

  // 4. Serialization
  const json = EffectEngine.serialize(instances);
  const deserialized = EffectEngine.deserialize(json);
  console.log('Serialization works:', deserialized.length === 2);

  console.log('✅ Effect Engine Tests Completed.');
};
