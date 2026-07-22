import { webTemplateEngine } from '../engine';

export const templateRuntimeService = {
  instantiate: (tpl: any, values: any) => webTemplateEngine.executeTemplate(tpl, {
    id: `inst-${Date.now()}`,
    templateId: tpl.metadata.id,
    version: tpl.metadata.version,
    parameterValues: values,
  }),
  install: (tpl: any) => webTemplateEngine.marketplace.installTemplateOffline(tpl),
  list: () => webTemplateEngine.marketplace.listTemplates(),
};
