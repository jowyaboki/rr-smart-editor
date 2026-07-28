import { IUpdateService, UpdateManifest } from '@ai-video-editor/desktop-core';

export class UpdateService implements IUpdateService {
  private updateManifest: UpdateManifest | null = null;

  constructor() {
    this.updateManifest = {
      version: '2.0.0',
      releaseDate: new Date().toISOString(),
      changelog: 'Incremental GPU decoding speeds, local Whisper transcribing, Ollama updates.',
      isMandatory: false,
      downloadUrl: 'https://cdn.updates.com/rrs-desktop-2.0.0.dmg',
    };
  }

  public async checkForUpdates(channel: 'stable' | 'beta' | 'nightly'): Promise<UpdateManifest | null> {
    if (channel === 'nightly') {
      return {
        ...this.updateManifest!,
        version: '2.0.1-nightly',
      };
    }
    return this.updateManifest;
  }

  public async downloadAndInstallUpdate(manifest: UpdateManifest): Promise<boolean> {
    return true;
  }

  public async rollbackUpdate(): Promise<boolean> {
    return true;
  }
}
