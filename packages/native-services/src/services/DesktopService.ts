import { IDesktopService, NativeWindow, RecentProject, FileAssociation, NotificationPayload } from '@ai-video-editor/desktop-core';

export class DesktopService implements IDesktopService {
  private windows: NativeWindow[] = [];
  private recents: RecentProject[] = [];
  private associations: FileAssociation[] = [];

  constructor() {
    this.windows = [
      { id: 'win_main', title: 'RR Smart Editor Studio', width: 1280, height: 720, isFocused: true, isVisible: true },
      { id: 'win_inspector', title: 'Asset Telemetry Inspector', width: 400, height: 600, isFocused: false, isVisible: false }
    ];

    this.recents = [
      { id: 'proj_sundance', name: 'Sundance Smart Cut', filepath: '/user/documents/sundance_cut.rrs', lastOpenedAt: new Date().toISOString() }
    ];
  }

  public async bootstrapPlatform(): Promise<boolean> {
    return true;
  }

  public async showWindow(id: string): Promise<void> {
    const win = this.windows.find(w => w.id === id);
    if (win) {
      win.isVisible = true;
      win.isFocused = true;
    }
  }

  public async listWindows(): Promise<NativeWindow[]> {
    return this.windows;
  }

  public async getRecentProjects(): Promise<RecentProject[]> {
    return this.recents;
  }

  public async registerFileAssociation(assoc: FileAssociation): Promise<boolean> {
    this.associations.push(assoc);
    return true;
  }

  public async showNotification(payload: NotificationPayload): Promise<void> {
    // Platform agnostic notification emission
    console.log(`[DESKTOP NOTIFICATION] Title: ${payload.title} | Body: ${payload.body}`);
  }
}
