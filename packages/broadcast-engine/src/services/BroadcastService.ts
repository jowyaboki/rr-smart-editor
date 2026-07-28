import { BroadcastProject, LiveScene, RecordingConfig, ReplayConfig } from '../types';
import { SwitcherService } from './SwitcherService';
import { StreamingService } from './StreamingService';
import { RecordingService } from './RecordingService';
import { ReplayService } from './ReplayService';
import { OverlayService } from './OverlayService';

export class BroadcastService {
  private project: BroadcastProject;
  public switcher: SwitcherService;
  public streaming: StreamingService;
  public recording: RecordingService;
  public replay: ReplayService;
  public overlays: OverlayService;

  constructor(
    project: BroadcastProject,
    defaultRecordingConfig: RecordingConfig,
    defaultReplayConfig: ReplayConfig,
  ) {
    this.project = project;

    const initialScenes =
      project.sceneCollections.find((c) => c.id === project.activeSceneCollectionId)?.scenes || [];

    this.switcher = new SwitcherService(initialScenes);
    this.streaming = new StreamingService(project.streamingDestinations);
    this.recording = new RecordingService(defaultRecordingConfig);
    this.replay = new ReplayService(defaultReplayConfig);
    this.overlays = new OverlayService();
  }

  public getProject(): BroadcastProject {
    return this.project;
  }

  public getActiveScenes(): LiveScene[] {
    return (
      this.project.sceneCollections.find((c) => c.id === this.project.activeSceneCollectionId)
        ?.scenes || []
    );
  }

  public async shutdownBroadcast(): Promise<void> {
    await this.streaming.stopAll();
    if (this.recording.getSession()?.status === 'recording') {
      await this.recording.stopRecording();
    }
    this.replay.stopReplayBuffer();
  }
}
