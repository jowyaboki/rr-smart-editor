import { useAIStudioStore } from '../store/aiStudioStore';
import { aiStudioService } from '../services';

export function useAIStudio() {
  const store = useAIStudioStore();

  const generateProjectFromPrompt = async (prompt: string, brandConfig?: any) => {
    if (!prompt.trim()) return;

    store.setGenerating(true);
    store.setProgress(10, 'Intent Analysis');

    try {
      // Simulate progress across sequential pipelines
      setTimeout(() => store.setProgress(30, 'Script Generation'), 400);
      setTimeout(() => store.setProgress(55, 'Storyboard Planning'), 800);
      setTimeout(() => store.setProgress(75, 'Media Retrieval & Subtitles'), 1200);
      setTimeout(() => store.setProgress(90, 'Timeline Construction'), 1600);

      // Perform final orchestration
      const project = await aiStudioService.orchestrate(prompt, brandConfig);

      // Audit review warnings
      const audit = aiStudioService.runQualityReview(
        project.storyboard,
        project.timeline.tracks[0].clips,
        project.brandConfig
      );

      setTimeout(() => {
        store.setProject(project);
        store.setWarnings(audit.warnings);
        store.setProgress(100, 'Review Completed');
        store.setGenerating(false);
      }, 2000);

    } catch (e: any) {
      console.error(e);
      store.setProgress(0, 'Failed');
      store.setGenerating(false);
    }
  };

  return {
    project: store.currentProject,
    progress: store.pipelineProgress,
    stage: store.pipelineStage,
    isGenerating: store.isGenerating,
    warnings: store.warnings,
    generateProjectFromPrompt,
    clearStudio: store.clear,
  };
}
