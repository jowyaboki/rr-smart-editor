import { TextObject } from '@ai-video-editor/shared';

export const TextLayoutService = {
  calculateBounds(textObj: TextObject): { width: number; height: number } {
    // In a real browser environment, we'd use Canvas or a hidden DOM element
    // to measure the text. For now, we return a mock or estimated size.
    const charWidth = textObj.style.fontSize * 0.6;
    const estimatedWidth = textObj.content.length * charWidth;

    return {
      width: textObj.layout.width === 'auto' ? estimatedWidth : textObj.layout.width,
      height: textObj.layout.height === 'auto' ? textObj.style.fontSize * 1.2 : textObj.layout.height
    };
  }
};
