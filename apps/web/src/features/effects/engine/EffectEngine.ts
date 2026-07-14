import { EffectInstance, Effect } from '@ai-video-editor/shared';
import { ParameterResolver } from '../services/ParameterResolver';
import { EffectRegistry } from '../services/EffectRegistry';

export const EffectEngine = {
  evaluateStack(instances: EffectInstance[], frame: number): Record<string, any> {
    const filters: string[] = [];
    let opacity = 1;

    instances.filter(inst => inst.enabled).forEach(inst => {
      const effectDef = EffectRegistry.find(e => e.id === inst.effectId);
      if (!effectDef) return;

      // Resolve all parameters for the current frame
      const params: Record<string, any> = {};
      effectDef.parameters.forEach(p => {
        params[p.id] = ParameterResolver.resolve(
          inst.animations,
          p.id,
          frame,
          inst.parameterValues[p.id] ?? p.defaultValue
        );
      });

      // Map to CSS Filter strings
      switch (inst.effectId) {
        case 'opacity':
          opacity = params.value;
          break;
        case 'blur':
          filters.push(`blur(${params.radius}px)`);
          break;
        case 'brightness':
          filters.push(`brightness(${params.level})`);
          break;
        case 'contrast':
          filters.push(`contrast(${params.level})`);
          break;
        case 'saturation':
          filters.push(`saturate(${params.level})`);
          break;
        case 'grayscale':
          filters.push(`grayscale(${params.amount * 100}%)`);
          break;
        case 'sepia':
          filters.push(`sepia(${params.amount * 100}%)`);
          break;
        case 'invert':
          filters.push(`invert(${params.amount * 100}%)`);
          break;
      }
    });

    return {
      filter: filters.join(' '),
      opacity
    };
  },

  serialize(instances: EffectInstance[]): string {
    return JSON.stringify(instances);
  },

  deserialize(data: string): EffectInstance[] {
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
};
