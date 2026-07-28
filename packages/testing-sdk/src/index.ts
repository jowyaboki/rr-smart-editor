// Testing SDK Abstractions for Third-Party Developers
export class MockProject {
  public id = 'mock_project_sdk';
  public name = 'SDK Mock Project';
  public timeline = {
    tracks: [{ id: 'mock_track_1', type: 'video' }],
    clips: [{ id: 'mock_clip_1', trackId: 'mock_track_1', startFrame: 0, duration: 150, type: 'video' }],
  };
}

export class MockTimeline {
  public project = new MockProject();

  public moveClip(clipId: string, startFrame: number): void {
    const clip = this.project.timeline.clips.find(c => c.id === clipId);
    if (clip) {
      clip.startFrame = startFrame;
    }
  }

  public getClips() {
    return this.project.timeline.clips;
  }
}

export class MockRendering {
  public async renderJob(jobId: string): Promise<{ success: boolean; progress: number }> {
    return { success: true, progress: 100 };
  }
}

export class MockEditor {
  public activeProject = new MockProject();
  public timeline = new MockTimeline();
  public rendering = new MockRendering();
}

export class PluginTestHarness {
  public editor = new MockEditor();
  private isActivated = false;

  public async loadPlugin(pluginInstance: any): Promise<boolean> {
    if (pluginInstance && typeof pluginInstance.register === 'function') {
      await pluginInstance.register(this.editor);
      this.isActivated = true;
      return true;
    }
    return false;
  }

  public isPluginActivated(): boolean {
    return this.isActivated;
  }
}
