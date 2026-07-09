import { BatchItem, VariableMapping } from '@ai-video-editor/shared';

export const BatchValidationService = {
  validateRow(dataRow: any, mappings: VariableMapping[]): string[] {
    const errors: string[] = [];

    mappings.forEach(mapping => {
      const value = this.getValueByPath(dataRow, mapping.path);
      if (value === undefined || value === null) {
        if (mapping.defaultValue === undefined) {
          errors.push(`Missing required variable: ${mapping.key} (path: ${mapping.path})`);
        }
      }
    });

    return errors;
  },

  async validateAssets(resolvedVariables: Record<string, any>, mappings: VariableMapping[]): Promise<string[]> {
    const errors: string[] = [];

    for (const mapping of mappings) {
      if (['image', 'video', 'audio'].includes(mapping.type)) {
        const url = resolvedVariables[mapping.key];
        if (url && typeof url === 'string' && url.startsWith('http')) {
          try {
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) {
              errors.push(`Asset not reachable: ${mapping.key} (URL: ${url})`);
            }
          } catch (e) {
            errors.push(`Failed to verify asset: ${mapping.key} (URL: ${url})`);
          }
        }
      }
    }

    return errors;
  },

  private getValueByPath(obj: any, path: string): any {
    if (!path) return undefined;
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : undefined;
    }, obj);
  }
};
