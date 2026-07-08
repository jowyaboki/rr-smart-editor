import { RenderSettings } from '../types';

export const RenderValidationService = {
  validate(settings: RenderSettings): string[] {
    const errors: string[] = [];
    if (!settings.filename) errors.push('Filename is required');
    if (settings.width <= 0) errors.push('Width must be positive');
    if (settings.height <= 0) errors.push('Height must be positive');
    return errors;
  }
};
