export type TemplateVariableType = 'string' | 'number' | 'boolean' | 'color' | 'image' | 'video' | 'audio' | 'list';

export interface TemplateVariable {
  id: string;
  type: TemplateVariableType;
  label: string;
  defaultValue: any;
  validation?: Record<string, any>;
}

export interface TemplateVersion {
  id: string;
  version: string;
  createdAt: string;
  timeline: any;
}

export interface TemplateMetadata {
  name: string;
  description: string;
  category: string;
  author: string;
  tags: string[];
  version: string;
}

export interface Template {
  id: string;
  metadata: TemplateMetadata;
  variables: TemplateVariable[];
  versions: TemplateVersion[];
  currentVersionId: string;
  thumbnail: string;
  previewUrl?: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon?: string;
}
