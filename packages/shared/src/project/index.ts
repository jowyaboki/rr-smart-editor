export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  backgroundColor: string;
  thumbnail?: string;
  favorite: boolean;
  tags: string[];
  timeline: any; // Kept for backward compatibility and future expansion
}

export interface ProjectSettings {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  backgroundColor: string;
}

export interface ProjectMetadata {
  name: string;
  description?: string;
  favorite: boolean;
  tags: string[];
}
