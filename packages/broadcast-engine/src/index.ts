export * from './types';
export * from './services/BroadcastService';
export * from './services/SwitcherService';
export * from './services/StreamingService';
export * from './services/RecordingService';
export * from './services/ReplayService';
export * from './services/OverlayService';

import { BroadcastProject, RecordingConfig, ReplayConfig } from './types';
import { BroadcastService } from './services/BroadcastService';

export class LiveProductionEngine {
  public createBroadcastSession(
    project: BroadcastProject,
    defaultRecordingConfig: RecordingConfig,
    defaultReplayConfig: ReplayConfig
  ): BroadcastService {
    return new BroadcastService(project, defaultRecordingConfig, defaultReplayConfig);
  }
}
