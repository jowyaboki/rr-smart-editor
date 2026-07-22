import { webTemplateEngine } from '../engine';

export const runTemplateInstantiation = (template: any, values: any) => {
  return webTemplateEngine.executeTemplate(template, {
    id: `inst-${Math.random().toString(36).substr(2, 9)}`,
    templateId: template.metadata.id,
    version: template.metadata.version,
    parameterValues: values,
  });
};
