import { StoryboardScene } from '../types';

export const designStoryboard = (script: any): StoryboardScene[] => {
  return script.scenes.map((s: any, idx: number) => ({
    id: `sb-${s.id}`,
    scriptSceneId: s.id,
    visualUrl: `https://images.example.com/sc-${idx + 1}.png`,
    subtitle: s.dialogue,
  }));
};
