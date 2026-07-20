import { z } from 'zod';
import { ExtensionManifest } from '@ai-video-editor/extension-sdk';

export type LifecycleEvent =
  | 'install'
  | 'enable'
  | 'disable'
  | 'update'
  | 'rollback'
  | 'uninstall'
  | 'repair';

export interface LocalPackage {
  manifest: ExtensionManifest;
  archivePath?: string;
  folderPath?: string;
  installedAt: number;
  status: 'installed' | 'broken' | 'active';
}

export interface DependencyNode {
  id: string;
  version: string;
  dependencies: Record<string, string>;
}

// Online metrics ready designs
export interface OnlineExtensionMeta {
  id: string;
  downloads: number;
  rating: number;
  reviews: { author: string; stars: number; comment: string }[];
  verifiedPublisher: boolean;
  publisherName: string;
  autoUpdateEnabled: boolean;
}
