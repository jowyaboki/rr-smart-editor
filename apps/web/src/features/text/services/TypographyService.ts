import { TextStyle, TextObject, TextLayout } from '@ai-video-editor/shared';
import { v4 as uuidv4 } from 'uuid';

export const TypographyService = {
  createDefaultObject(content: string = 'Double click to edit'): TextObject {
    return {
      id: uuidv4(),
      content,
      style: this.getDefaultStyle(),
      layout: this.getDefaultLayout(),
      transform: {
        rotation: 0,
        scale: 1,
        originX: 'center',
        originY: 'center'
      }
    };
  },

  getDefaultStyle(): TextStyle {
    return {
      id: uuidv4(),
      name: 'Default',
      fontFamily: 'Inter, Roboto, Arial',
      fontSize: 48,
      fontWeight: 600,
      fontStyle: 'normal',
      letterSpacing: 0,
      lineHeight: 1.2,
      color: '#ffffff',
      opacity: 1
    };
  },

  getDefaultLayout(): TextLayout {
    return {
      width: 'auto',
      height: 'auto',
      padding: 20,
      textAlign: 'center',
      verticalAlign: 'middle',
      wrap: true,
      overflow: 'visible'
    };
  }
};
