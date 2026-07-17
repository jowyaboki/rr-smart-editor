import { NleMarker } from '../types';

export class NleMarkerService {
  private static markers: NleMarker[] = [];

  public static addMarker(marker: NleMarker): void {
    this.markers.push(marker);
  }

  public static removeMarker(id: string): void {
    this.markers = this.markers.filter(m => m.id !== id);
  }

  public static getMarkers(): NleMarker[] {
    return this.markers;
  }

  public static clear(): void {
    this.markers = [];
  }

  /**
   * Search markers based on text in name, comments, or labels.
   */
  public static searchMarkers(query: string): NleMarker[] {
    const q = query.toLowerCase();
    return this.markers.filter(m => {
      const matchName = m.name.toLowerCase().includes(q);
      const matchComment = m.comments?.toLowerCase().includes(q);
      const matchLabels = m.labels?.some(l => l.toLowerCase().includes(q));
      return matchName || matchComment || matchLabels;
    });
  }
}
