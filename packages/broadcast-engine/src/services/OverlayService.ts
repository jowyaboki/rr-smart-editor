import { Overlay, OverlayType } from '../types';

export class OverlayService {
  private activeOverlays: Overlay[] = [];

  constructor(initialOverlays: Overlay[] = []) {
    this.activeOverlays = initialOverlays;
  }

  public getOverlays(): Overlay[] {
    return this.activeOverlays;
  }

  public addOverlay(overlay: Overlay): void {
    this.activeOverlays.push(overlay);
    this.sortOverlays();
  }

  public removeOverlay(id: string): void {
    this.activeOverlays = this.activeOverlays.filter((o) => o.id !== id);
  }

  public toggleVisibility(id: string): void {
    const overlay = this.activeOverlays.find((o) => o.id === id);
    if (overlay) {
      overlay.isVisible = !overlay.isVisible;
    }
  }

  public updateOverlayProperties(id: string, properties: Record<string, any>): void {
    const overlay = this.activeOverlays.find((o) => o.id === id);
    if (overlay) {
      overlay.properties = { ...overlay.properties, ...properties };
    }
  }

  public triggerBreakingNews(headline: string, details?: string): Overlay {
    const breakingNewsOverlay: Overlay = {
      id: `overlay_breaking_${Date.now()}`,
      name: 'Breaking News Ticker Banner',
      type: 'breaking_news',
      isVisible: true,
      position: { x: 50, y: 800, width: 1820, height: 180 },
      opacity: 1.0,
      zIndex: 100,
      properties: {
        headline,
        details: details || 'LIVE coverage development',
        bannerColor: '#dc2626',
        textColor: '#ffffff',
      },
    };

    this.addOverlay(breakingNewsOverlay);
    return breakingNewsOverlay;
  }

  public triggerScoreboard(
    homeTeam: string,
    awayTeam: string,
    homeScore: number = 0,
    awayScore: number = 0,
  ): Overlay {
    const scoreboardOverlay: Overlay = {
      id: `overlay_score_${Date.now()}`,
      name: 'Sports Broadcast Scoreboard',
      type: 'scoreboard',
      isVisible: true,
      position: { x: 100, y: 80, width: 600, height: 100 },
      opacity: 1.0,
      zIndex: 90,
      properties: {
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        period: '1st',
        timerSeconds: 0,
      },
    };

    this.addOverlay(scoreboardOverlay);
    return scoreboardOverlay;
  }

  private sortOverlays(): void {
    this.activeOverlays.sort((a, b) => a.zIndex - b.zIndex);
  }
}
