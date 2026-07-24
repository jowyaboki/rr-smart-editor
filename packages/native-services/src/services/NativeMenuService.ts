import { INativeMenuService, SystemMenuItem } from '@ai-video-editor/desktop-core';

export class NativeMenuService implements INativeMenuService {
  private activeMenu: SystemMenuItem[] = [];
  private trayIcon = '';
  private trayTooltip = '';

  public async setApplicationMenu(menu: SystemMenuItem[]): Promise<void> {
    this.activeMenu = menu;
  }

  public async setTrayIcon(iconPath: string, tooltip: string, menu?: SystemMenuItem[]): Promise<void> {
    this.trayIcon = iconPath;
    this.trayTooltip = tooltip;
  }

  public getActiveMenu(): SystemMenuItem[] {
    return this.activeMenu;
  }

  public getTrayDetails(): { iconPath: string; tooltip: string } {
    return {
      iconPath: this.trayIcon,
      tooltip: this.trayTooltip,
    };
  }
}
