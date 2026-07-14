import { SceneEngine } from '../engine/SceneEngine';
import { SceneService } from '../services/SceneService';
import { Storyboard } from '@ai-video-editor/shared';

export const runSceneTests = () => {
  console.log('🚀 Starting Scene Engine Tests...');

  const scene1 = SceneService.createScene(0, 100);
  const scene2 = SceneService.createScene(1, 200);

  const mockStoryboard: Storyboard = {
    id: 'sb-1',
    projectId: 'p-1',
    scenes: [scene1, scene2],
    groups: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Test Offset Calculation
  const offset2 = SceneEngine.calculateTimelineOffset(scene2.id, mockStoryboard);
  console.log('Offset for Scene 2:', offset2);
  if (offset2 !== 100) throw new Error('Offset calculation mismatch');

  // 2. Test Scene at Frame
  const sceneAt50 = SceneEngine.getSceneAtFrame(50, mockStoryboard);
  const sceneAt150 = SceneEngine.getSceneAtFrame(150, mockStoryboard);

  console.log('Scene at frame 50:', sceneAt50?.metadata.title);
  console.log('Scene at frame 150:', sceneAt150?.metadata.title);

  if (sceneAt50?.id !== scene1.id) throw new Error('Scene detection at frame 50 failed');
  if (sceneAt150?.id !== scene2.id) throw new Error('Scene detection at frame 150 failed');

  console.log('✅ Scene Engine Tests Completed.');
};
