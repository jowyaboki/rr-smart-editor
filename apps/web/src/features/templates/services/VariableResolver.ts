import { TemplateVariable } from '../types';

export const VariableResolver = {
  resolve(timeline: any, variables: TemplateVariable[], values: Record<string, any>): any {
    let serialized = JSON.stringify(timeline);

    variables.forEach(v => {
      const value = values[v.id] !== undefined ? values[v.id] : v.defaultValue;
      const placeholder = `{{${v.id}}}`;
      // Replace all occurrences of placeholder with value in the serialized timeline
      // This is a simple string replacement; for complex types like objects/images,
      // a more sophisticated tree traversal would be better.
      serialized = serialized.split(placeholder).join(String(value));
    });

    return JSON.parse(serialized);
  }
};
