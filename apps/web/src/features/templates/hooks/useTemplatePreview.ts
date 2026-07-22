import { useTemplateStore } from '../store/templateStore';
import { generateLivePreviewFrame } from '../preview';

export function useTemplatePreview(templateId: string) {
  const store = useTemplateStore();

  const triggerLivePreviewUpdate = () => {
    const frame = generateLivePreviewFrame(templateId, store.parameterValues);
    store.setPreviewFrame(frame);
  };

  return {
    currentPreviewFrame: store.currentPreviewFrame,
    triggerLivePreviewUpdate,
  };
}
