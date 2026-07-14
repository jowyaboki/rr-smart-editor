export interface SceneMetadata {
  title: string;
  description?: string;
  color?: string;
  tags?: string[];
  status?: 'draft' | 'in-review' | 'ready';
}

export interface Scene {
  id: string;
  order: number;
  durationFrames: number;
  metadata: SceneMetadata;
  clipIds: string[];
  audioClipIds: string[];
  captionIds: string[];
  transitionId?: string; // Transition into this scene
  variables: Record<string, any>;
  thumbnailUrl?: string;
}

export interface SceneGroup {
  id: string;
  name: string;
  sceneIds: string[];
  isExpanded: boolean;
}

export interface Storyboard {
  id: string;
  projectId: string;
  scenes: Scene[];
  groups: SceneGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface SceneTemplate {
  id: string;
  name: string;
  layout: any;
  defaultMetadata: SceneMetadata;
}
