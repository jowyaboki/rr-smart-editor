import { CompositionTree } from '../types';

export const CompositionValidationService = {
  validate(tree: CompositionTree): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!tree.id) errors.push('Composition ID is missing');
    if (tree.fps <= 0) errors.push('FPS must be greater than 0');
    if (tree.durationInFrames <= 0) errors.push('Duration must be greater than 0');

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
