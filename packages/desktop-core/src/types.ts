import { Project } from '@ai-video-editor/shared';

// Platform Framework Abstractions (Tauri / Electron agnostic)
export interface NativeWindow {
  id: string;
  title: string;
  width: number;
  height: number;
  isFocused: boolean;
  isVisible: boolean;
}

export interface RecentProject {
  id: string;
  name: string;
  filepath: string;
  lastOpenedAt: string;
}

export interface SystemMenuItem {
  id: string;
  label: string;
  type: 'normal' | 'submenu' | 'separator' | 'checkbox';
  enabled: boolean;
  checked?: boolean;
  shortcut?: string;
  action?: () => void;
  submenu?: SystemMenuItem[];
}

export interface FileAssociation {
  extension: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface NativeDialogOptions {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'question';
  buttons: string[];
}

export interface NotificationPayload {
  title: string;
  body: string;
  silent?: boolean;
}

// Local Filesystem Watcher Models
export interface WatchFolder {
  path: string;
  recursive: boolean;
  indexedAt?: string;
}

export interface LocalAsset {
  filepath: string;
  filename: string;
  size: number;
  mimeType: string;
  indexedAt: string;
}

// Offline-first States
export interface OfflineSyncQueue {
  pendingSaves: Project[];
  pendingAssets: string[]; // local file paths to upload
  deferredTransactions: any[];
}

// GPU Diagnostics
export interface GPUDiagnostics {
  gpuEnabled: boolean;
  vendorName?: string;
  modelName?: string;
  driverVersion?: string;
  vramTotalMb?: number;
  supportsHardwareAcceleration: boolean;
  apiType?: 'cuda' | 'metal' | 'vulkan' | 'directx' | 'opengl';
}

// Local AI Adapters
export type LocalAIProviderType = 'ollama' | 'llamacpp' | 'lmstudio' | 'local_whisper' | 'local_embeddings';

export interface LocalAIConfig {
  provider: LocalAIProviderType;
  endpoint: string;
  modelName: string;
}

// Media FFmpeg & Metadata Extractors
export interface NativeMediaInfo {
  format: string;
  durationSec: number;
  bitrateKbps: number;
  width?: number;
  height?: number;
  fps?: number;
  codec: string;
  audioChannels?: number;
  metaTags: Record<string, string>; // From ExifTool / MediaInfo
}

// Auto Update
export interface UpdateManifest {
  version: string;
  releaseDate: string;
  changelog: string;
  isMandatory: boolean;
  downloadUrl: string;
}

// Dependency-injected Service Interfaces
export interface IDesktopService {
  bootstrapPlatform: () => Promise<boolean>;
  showWindow: (id: string) => Promise<void>;
  listWindows: () => Promise<NativeWindow[]>;
  getRecentProjects: () => Promise<RecentProject[]>;
  registerFileAssociation: (assoc: FileAssociation) => Promise<boolean>;
  showNotification: (payload: NotificationPayload) => Promise<void>;
}

export interface INativeMenuService {
  setApplicationMenu: (menu: SystemMenuItem[]) => Promise<void>;
  setTrayIcon: (iconPath: string, tooltip: string, menu?: SystemMenuItem[]) => Promise<void>;
}

export interface IFileSystemService {
  watchFolder: (path: string, recursive: boolean) => Promise<boolean>;
  unwatchFolder: (path: string) => Promise<boolean>;
  listWatchedFolders: () => Promise<WatchFolder[]>;
  searchLocalAssets: (query: string) => Promise<LocalAsset[]>;
  writeLocalCache: (key: string, data: string) => Promise<void>;
  readLocalCache: (key: string) => Promise<string | null>;
}

export interface IGPUService {
  detectGPU: () => Promise<GPUDiagnostics>;
  isHardwareAccelerated: () => Promise<boolean>;
}

export interface INativeAIService {
  generateTextLocal: (config: LocalAIConfig, prompt: string) => Promise<string>;
  transcribeLocal: (whisperConfig: LocalAIConfig, audioPath: string) => Promise<string>;
  generateEmbeddingsLocal: (config: LocalAIConfig, text: string) => Promise<number[]>;
}

export interface IUpdateService {
  checkForUpdates: (channel: 'stable' | 'beta' | 'nightly') => Promise<UpdateManifest | null>;
  downloadAndInstallUpdate: (manifest: UpdateManifest) => Promise<boolean>;
  rollbackUpdate: () => Promise<boolean>;
}

export interface ICrashRecoveryService {
  saveAutoRecoverState: (project: Project) => Promise<void>;
  getAutoRecoverState: (projectId: string) => Promise<Project | null>;
  clearAutoRecoverState: (projectId: string) => Promise<void>;
  enterSafeMode: () => Promise<void>;
}
