import { Timeline, TimelineTrack, TimelineClip } from '@/features/timeline/types';
import { CompositionTree, AssetNode } from '../types';

export const CompositionBuilder = {
  build(timeline: Timeline | null, tracks: TimelineTrack[]): CompositionTree {
    const tree: CompositionTree = {
      id: timeline?.id || 'default-comp',
      type: 'composition',
      name: 'Main Composition',
      width: 1920,
      height: 1080,
      fps: 30,
      durationInFrames: 1800, // 1 minute default
      tracks: tracks.map((track, index) => ({
        id: track.id,
        type: 'track',
        name: track.name,
        index,
        clips: track.clips.map(clip => this.mapClipToAssetNode(clip))
      }))
    };

    return tree;
  },

  mapClipToAssetNode(clip: TimelineClip): AssetNode {
    return {
      id: clip.id,
      type: clip.type as any, // Simple mapping for now
      name: clip.label,
      assetId: clip.assetId,
      // In a real app, we would resolve the URL from the asset store here
      // But the engine should remain pure, so we'll pass the URL if available or resolve in renderer
      url: (clip as any).url,
      startFrame: clip.startFrame,
      durationInFrames: clip.durationInFrames,
      offsetFrame: clip.offsetFrame,
      transform: clip.transform,
      style: clip.style,
    };
  }
};
