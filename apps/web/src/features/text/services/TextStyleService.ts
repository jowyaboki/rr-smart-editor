import { TextStyle } from '@ai-video-editor/shared';
import { v4 as uuidv4 } from 'uuid';

export const TextStyleService = {
  clone(style: TextStyle, newName?: string): TextStyle {
    return {
      ...style,
      id: uuidv4(),
      name: newName || `${style.name} (Copy)`
    };
  }
};
