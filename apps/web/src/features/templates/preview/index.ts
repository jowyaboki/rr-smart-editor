import { webTemplateEngine } from '../engine';

export const generateLivePreviewFrame = (templateId: string, values: any) => {
  return webTemplateEngine.preview.generateMockPreviewFrame(templateId, values);
};
