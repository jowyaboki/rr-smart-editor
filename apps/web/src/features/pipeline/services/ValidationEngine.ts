import {
  ExportChecklist,
  TimelineClip,
  MediaAsset
} from '@ai-video-editor/shared';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useMediaStore } from '@/features/media/store/mediaStore';

export const ValidationEngine = {
  async validateProject(): Promise<ExportChecklist> {
    const { tracks } = useTimelineStore.getState();
    const { assets } = useMediaStore.getState();

    const readyItems: string[] = [];
    const warnings: string[] = [];
    const blockingErrors: string[] = [];

    const clips = tracks.flatMap(t => t.clips);

    // 1. Check for missing media
    clips.forEach(clip => {
      const asset = assets.find(a => a.id === clip.assetId);
      if (!asset) {
        blockingErrors.push(`Missing media asset for clip: ${clip.id}`);
      } else {
        readyItems.push(`Asset linked: ${asset.name}`);
      }
    });

    // 2. Check for overlaps
    tracks.forEach(track => {
      const sortedClips = [...track.clips].sort((a, b) => a.startFrame - b.startFrame);
      for (let i = 0; i < sortedClips.length - 1; i++) {
        if (sortedClips[i].startFrame + sortedClips[i].durationFrames > sortedClips[i+1].startFrame) {
          warnings.push(`Clip overlap detected on ${track.name}`);
        }
      }
    });

    // 3. Check duration
    if (clips.length === 0) {
      blockingErrors.push('Timeline is empty');
    }

    return {
      readyItems,
      warnings,
      blockingErrors,
      isReady: blockingErrors.length === 0
    };
  }
};
