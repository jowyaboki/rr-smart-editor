import { z } from 'zod';

export type ParamType =
  | 'text'
  | 'rich_text'
  | 'number'
  | 'boolean'
  | 'color'
  | 'font'
  | 'image'
  | 'video'
  | 'audio'
  | 'date'
  | 'enum'
  | 'list'
  | 'object'
  | 'json'
  | 'expression'
  | 'variable';

export const ParamTypeSchema = z.enum([
  'text',
  'rich_text',
  'number',
  'boolean',
  'color',
  'font',
  'image',
  'video',
  'audio',
  'date',
  'enum',
  'list',
  'object',
  'json',
  'expression',
  'variable',
]);

// ==========================================
// CORE PLATFORM MODELS
// ==========================================

export interface TemplateParameter {
  id: string;
  name: string;
  type: ParamType;
  defaultValue: any;
  required: boolean;
  group?: string; // Grouping category
  options?: string[]; // For enum types
  min?: number;
  max?: number;
  step?: number;
  dependsOn?: {
    parameterId: string;
    conditionValue: any;
  };
}

export const TemplateParameterSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ParamTypeSchema,
  defaultValue: z.any(),
  required: z.boolean(),
  group: z.string().optional(),
  options: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  dependsOn: z.object({
    parameterId: z.string(),
    conditionValue: z.any(),
  }).optional(),
});

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export const TemplateSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  order: z.number(),
});

export interface TemplateSlot {
  id: string;
  name: string;
  targetPath: string; // binding selector path e.g. timeline.tracks[0].clips[1].name
  type: 'text' | 'image' | 'audio' | 'video' | 'color' | 'expression';
}

export const TemplateSlotSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetPath: z.string(),
  type: z.enum(['text', 'image', 'audio', 'video', 'color', 'expression']),
});

export interface TemplatePreset {
  id: string;
  name: string;
  category: 'default' | 'brand' | 'locale' | 'social_media';
  parameterValues: Record<string, any>;
}

export const TemplatePresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['default', 'brand', 'locale', 'social_media']),
  parameterValues: z.record(z.any()),
});

export interface TemplateMetadata {
  id: string;
  name: string;
  displayName: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  category: string;
}

export const TemplateMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  author: z.string(),
  version: z.string(),
  tags: z.array(z.string()).default([]),
  category: z.string(),
});

export interface Template {
  metadata: TemplateMetadata;
  parameters: TemplateParameter[];
  sections: TemplateSection[];
  slots: TemplateSlot[];
  presets: TemplatePreset[];
  blueprintProject: any; // timeline template blueprint
}

export interface TemplateVersion {
  templateId: string;
  version: string;
  releasedAt: number;
  changes: string[];
  manifest: any; // complete blueprint state
}

export interface TemplateInstance {
  id: string;
  templateId: string;
  version: string;
  parameterValues: Record<string, any>;
  generatedProjectId?: string;
}
