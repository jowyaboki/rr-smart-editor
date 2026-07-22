import { webTemplateEngine } from '../engine';

export const installTemplatePackage = (template: any) => {
  webTemplateEngine.marketplace.installTemplateOffline(template);
};
export const listInstalledTemplates = () => {
  return webTemplateEngine.marketplace.listTemplates();
};
