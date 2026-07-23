import { copilotService } from '../services';

export const getPreviewHighlights = (preview: any) => {
  return copilotService.preview.generateChangeVisualHighlights(preview);
};
