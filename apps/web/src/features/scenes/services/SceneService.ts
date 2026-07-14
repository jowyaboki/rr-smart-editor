import { Scene, SceneMetadata } from '@ai-video-editor/shared';
import { v4 as uuidv4 } from 'uuid';

export const SceneService = {
  createScene(order: number, durationFrames: number = 150): Scene {
    return {
      id: uuidv4(),
      order,
      durationFrames,
      metadata: {
        title: `Scene ${order + 1}`,
        status: 'draft'
      },
      clipIds: [],
      audioClipIds: [],
      captionIds: [],
      variables: {}
    };
  },

  duplicateScene(scene: Scene, newOrder: number): Scene {
    return {
      ...scene,
      id: uuidv4(),
      order: newOrder,
      metadata: {
        ...scene.metadata,
        title: `${scene.metadata.title} (Copy)`
      }
    };
  }
};
