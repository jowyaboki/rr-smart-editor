import { ValidationService } from '@ai-video-editor/design-system';
import { webDesignSystemEngine } from '../engine';

export const validateWebTheme = (themeId: string) => {
  const theme = webDesignSystemEngine.getTheme(themeId);
  return ValidationService.validateTheme(theme);
};

export { ValidationService };
