import { useTextStore } from '../store/textStore';
import { TypographyService } from '../services/TypographyService';

export const useTypography = (clipId: string) => {
  const store = useTextStore();
  const textObj = store.textObjects[clipId];

  const createText = (content?: string) => {
    const newObj = TypographyService.createDefaultObject(content);
    store.setTextObject(clipId, newObj);
    return newObj;
  };

  return {
    textObj,
    createText,
    updateText: store.updateTextObject,
    reusableStyles: store.reusableStyles
  };
};
