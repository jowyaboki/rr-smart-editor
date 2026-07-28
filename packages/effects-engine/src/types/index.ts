import { z } from 'zod';

// ==========================================
// CORE PARAMETERS & PRESETS
// ==========================================

export type EffectParameterType = 'number' | 'string' | 'boolean' | 'color' | 'curve' | 'gradient' | 'select' | 'vector2';

export const EffectParameterTypeSchema = z.enum([
  'number',
  'string',
  'boolean',
  'color',
  'curve',
  'gradient',
  'select',
  'vector2',
]);

export interface CurvePoint {
  x: number;
  y: number;
}

export const CurvePointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export interface GradientStop {
  offset: number;
  color: string;
}

export const GradientStopSchema = z.object({
  offset: z.number(),
  color: z.string(),
});

export interface EffectParameter {
  id: string;
  name: string;
  type: EffectParameterType;
  value: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  default: any;
}

export const EffectParameterSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: EffectParameterTypeSchema,
  value: z.any(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  options: z.array(z.string()).optional(),
  default: z.any(),
});

export interface EffectPreset {
  id: string;
  name: string;
  effectType: string;
  parameters: Record<string, any>;
}

export const EffectPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  effectType: z.string(),
  parameters: z.record(z.any()),
});

// ==========================================
// SHADER SYSTEM
// ==========================================

export type ShaderType = 'canvas' | 'webgl' | 'webgpu';

export interface ShaderSource {
  canvas?: (ctx: CanvasRenderingContext2D, width: number, height: number, params: Record<string, any>, context: EffectContext) => void;
  webgl?: {
    vertex: string;
    fragment: string;
    uniforms: Record<string, string>; // name -> type
  };
  webgpu?: {
    code: string;
    entryPoint: string;
  };
}

export interface Shader {
  id: string;
  name: string;
  type: ShaderType;
  source: ShaderSource;
}

// ==========================================
// EFFECT & CHAIN & CONTEXT
// ==========================================

export interface EffectContext {
  time: number; // in seconds
  frame: number;
  fps: number;
  width: number;
  height: number;
  gpuDevice?: any; // WebGPU device placeholder
  glContext?: WebGL2RenderingContext | null; // WebGL context placeholder
  quality?: 'draft' | 'preview' | 'final';
  variables?: Record<string, any>;
}

export interface Effect {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  parameters: Record<string, EffectParameter>;
  shaderId?: string;
}

export const EffectSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  enabled: z.boolean(),
  parameters: z.record(EffectParameterSchema),
  shaderId: z.string().optional(),
});

export interface EffectChain {
  id: string;
  effects: Effect[];
}

export const EffectChainSchema = z.object({
  id: z.string(),
  effects: z.array(EffectSchema),
});

export interface EffectGroup {
  id: string;
  name: string;
  enabled: boolean;
  effects: Effect[];
}

export const EffectGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  effects: z.array(EffectSchema),
});

// ==========================================
// BLENDING
// ==========================================

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft_light'
  | 'hard_light'
  | 'darken'
  | 'lighten'
  | 'difference'
  | 'exclusion'
  | 'color_dodge'
  | 'color_burn'
  | 'linear_dodge';

export const BlendModeSchema = z.enum([
  'normal',
  'multiply',
  'screen',
  'overlay',
  'soft_light',
  'hard_light',
  'darken',
  'lighten',
  'difference',
  'exclusion',
  'color_dodge',
  'color_burn',
  'linear_dodge',
]);

// ==========================================
// MASKING
// ==========================================

export type MaskType = 'alpha' | 'luma' | 'gradient' | 'shape';

export const MaskTypeSchema = z.enum(['alpha', 'luma', 'gradient', 'shape']);

export interface Mask {
  id: string;
  name: string;
  type: MaskType;
  enabled: boolean;
  inverted: boolean;
  feather: number; // in pixels
  expansion: number; // in pixels
  points?: CurvePoint[]; // For shape mask (polygon)
  gradient?: {
    start: { x: number; y: number };
    end: { x: number; y: number };
    stops: GradientStop[];
  };
  animated?: boolean;
}

export const MaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: MaskTypeSchema,
  enabled: z.boolean(),
  inverted: z.boolean(),
  feather: z.number().default(0),
  expansion: z.number().default(0),
  points: z.array(CurvePointSchema).optional(),
  gradient: z.object({
    start: z.object({ x: z.number(), y: z.number() }),
    end: z.object({ x: z.number(), y: z.number() }),
    stops: z.array(GradientStopSchema),
  }).optional(),
  animated: z.boolean().optional(),
});

// ==========================================
// COMPOSITING LAYER
// ==========================================

export interface LayerTransform {
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number; // in degrees
  anchorPoint: { x: number; y: number };
}

export const LayerTransformSchema = z.object({
  position: z.object({ x: z.number(), y: z.number() }),
  scale: z.object({ x: z.number(), y: z.number() }),
  rotation: z.number(),
  anchorPoint: z.object({ x: z.number(), y: z.number() }),
});

export interface CompositingLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number; // 0 to 1
  blendMode: BlendMode;
  masks: Mask[];
  effects: EffectChain;
  transform: LayerTransform;
  source: any; // e.g. CanvasImageSource, ImageData, solid color, video frame, webgl texture reference
}

export const CompositingLayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  visible: z.boolean(),
  opacity: z.number().min(0).max(1),
  blendMode: BlendModeSchema,
  masks: z.array(MaskSchema),
  effects: EffectChainSchema,
  transform: LayerTransformSchema,
  source: z.any(),
});
