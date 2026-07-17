import { NleClipGroup, NleClipLink } from '../types';
import { VirtualClip } from '../../types';

export class NleGroupingService {
  private static groups: NleClipGroup[] = [];
  private static links: NleClipLink[] = [];

  /**
   * Create a grouped selection from multiple clip IDs.
   */
  public static createGroup(id: string, name: string, clipIds: string[]): void {
    this.groups.push({ id, name, clipIds });
  }

  /**
   * Create a linked audio/video link.
   */
  public static createLink(id: string, videoClipId: string, audioClipId: string): void {
    this.links.push({ id, videoClipId, audioClipId });
  }

  /**
   * Clears all groups and links.
   */
  public static clear(): void {
    this.groups = [];
    this.links = [];
  }

  /**
   * Expands a list of selected clip IDs to include all their linked or grouped clips recursively.
   */
  public static expandSelection(clipIds: string[]): string[] {
    const selected = new Set<string>(clipIds);
    let sizeBefore = 0;

    // Loop until no new clips are added to selection
    while (selected.size !== sizeBefore) {
      sizeBefore = selected.size;

      // 1. Check groups
      for (const group of this.groups) {
        const hasOverlap = group.clipIds.some(id => selected.has(id));
        if (hasOverlap) {
          for (const id of group.clipIds) {
            selected.add(id);
          }
        }
      }

      // 2. Check links (linked video/audio clips)
      for (const link of this.links) {
        if (selected.has(link.videoClipId)) {
          selected.add(link.audioClipId);
        }
        if (selected.has(link.audioClipId)) {
          selected.add(link.videoClipId);
        }
      }
    }

    return Array.from(selected);
  }

  /**
   * Shifts a list of clips together based on grouping/linking.
   */
  public static shiftClipsTogether(
    selectedClipIds: string[],
    deltaFrames: number,
    clips: VirtualClip[]
  ): VirtualClip[] {
    const expandedIds = new Set<string>(this.expandSelection(selectedClipIds));

    return clips.map(clip => {
      if (expandedIds.has(clip.id)) {
        return {
          ...clip,
          startFrame: Math.max(0, clip.startFrame + deltaFrames),
        };
      }
      return clip;
    });
  }
}
