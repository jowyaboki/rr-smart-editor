import { Scene } from '@ai-video-editor/shared';
import { useTimelineStore } from '@/features/timeline/store/timelineStore';

export const SceneNavigationService = {
  jumpToScene(scene: Scene, scenes: Scene[]): void {
    let startFrame = 0;
    for (let i = 0; i < scene.order; i++) {
      startFrame += scenes[i].durationFrames;
    }
    useTimelineStore.getState().setCurrentTime(startFrame);
  }
};
