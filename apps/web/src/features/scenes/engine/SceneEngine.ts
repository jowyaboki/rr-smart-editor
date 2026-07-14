import { Scene, Storyboard } from '@ai-video-editor/shared';
import { useTimelineStore } from '@/features/timeline/store/timelineStore';

export const SceneEngine = {
  calculateTimelineOffset(sceneId: string, storyboard: Storyboard): number {
    let offset = 0;
    for (const scene of storyboard.scenes) {
      if (scene.id === sceneId) break;
      offset += scene.durationFrames;
    }
    return offset;
  },

  syncSceneDurationToTimeline(sceneId: string, newDuration: number): void {
    // When a scene's duration is manually edited, it may impact the
    // positions of all subsequent scenes and their clips.
  },

  getSceneAtFrame(frame: number, storyboard: Storyboard): Scene | null {
    let currentFrame = 0;
    for (const scene of storyboard.scenes) {
      if (frame >= currentFrame && frame < currentFrame + scene.durationFrames) {
        return scene;
      }
      currentFrame += scene.durationFrames;
    }
    return null;
  }
};
