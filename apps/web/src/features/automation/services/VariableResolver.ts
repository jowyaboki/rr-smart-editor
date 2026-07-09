import { VariableMapping } from '@ai-video-editor/shared';

export const VariableResolver = {
  resolve(dataRow: any, mappings: VariableMapping[]): Record<string, any> {
    const resolved: Record<string, any> = {};

    mappings.forEach(mapping => {
      let value = this.getValueByPath(dataRow, mapping.path);

      if (value === undefined || value === null) {
        value = mapping.defaultValue;
      }

      // Type-specific resolution/casting
      switch (mapping.type) {
        case 'number':
          resolved[mapping.key] = Number(value);
          break;
        case 'date':
          resolved[mapping.key] = value ? new Date(value).toISOString() : null;
          break;
        case 'color':
          resolved[mapping.key] = this.validateColor(value) ? value : '#ffffff';
          break;
        default:
          resolved[mapping.key] = value;
      }
    });

    return resolved;
  },

  private getValueByPath(obj: any, path: string): any {
    if (!path) return undefined;
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : undefined;
    }, obj);
  },

  private validateColor(color: any): boolean {
    if (typeof color !== 'string') return false;
    return /^#([A-Fa-f0-9]{3}){1,2}$/.test(color) ||
           /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/.test(color);
  }
};
