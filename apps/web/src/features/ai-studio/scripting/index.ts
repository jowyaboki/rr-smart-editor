import { Script } from '../types';

export const composeScript = (brief: any): Script => ({
  brief,
  scenes: [
    {
      id: 'sc-1',
      description: 'Intro visual graphics',
      dialogue: 'Video starting now.',
      durationSeconds: 3.0,
      visualPrompt: 'Abstract graphics',
    }
  ],
});
