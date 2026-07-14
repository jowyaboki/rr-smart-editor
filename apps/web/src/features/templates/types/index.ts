import { Template as SharedTemplate, TemplateCategory as SharedTemplateCategory, TemplateVariable as SharedTemplateVariable } from '@ai-video-editor/shared';

export type Template = SharedTemplate;
export type TemplateCategory = SharedTemplateCategory;
export type TemplateVariable = SharedTemplateVariable;

export interface TemplateFilter {
  search: string;
  category: string | null;
  favoriteOnly: boolean;
  sortBy: 'recent' | 'name' | 'popular';
}
