import { Project as SharedProject } from '@ai-video-editor/shared';

export type Project = SharedProject;

export interface ProjectSort {
  field: 'name' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface ProjectFilters {
  search: string;
  favoriteOnly: boolean;
  tags: string[];
}
