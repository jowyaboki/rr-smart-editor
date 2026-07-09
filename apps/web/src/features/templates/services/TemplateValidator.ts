import { Template } from '../types';

export const TemplateValidator = {
  validate(template: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!template.id) errors.push('Template ID is missing');
    if (!template.metadata?.name) errors.push('Template name is missing');
    if (!template.versions || template.versions.length === 0) errors.push('Template must have at least one version');

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
