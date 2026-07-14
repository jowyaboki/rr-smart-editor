export type EffectCategory = 'color' | 'filter' | 'transform' | 'style';

export type ParameterType = 'number' | 'color' | 'boolean' | 'string' | 'select';

export interface EffectParameter {
  id: string;
  name: string;
  type: ParameterType;
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: any }[];
}

export interface Keyframe {
  frame: number;
  value: any;
  easing?: string;
}

export interface EffectAnimation {
  parameterId: string;
  keyframes: Keyframe[];
}

export interface Effect {
  id: string;
  name: string;
  category: EffectCategory;
  parameters: EffectParameter[];
  isStackable: boolean;
}

export interface EffectInstance {
  id: string;
  effectId: string;
  enabled: boolean;
  parameterValues: Record<string, any>;
  animations: EffectAnimation[];
  expanded?: boolean;
}

export interface EffectPreset {
  id: string;
  name: string;
  effects: Partial<EffectInstance>[];
}
