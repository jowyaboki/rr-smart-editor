import { useCopilotStore } from '../store/copilotStore';
import { copilotService } from '../services';

export function useProactiveSuggestions() {
  const store = useCopilotStore();

  const scanSuggestionsForProject = (projectContext: any) => {
    const list = copilotService.suggestions.analyzeProjectAnomalies(projectContext);
    store.setSuggestions(list);
    return list;
  };

  return {
    suggestions: store.suggestions,
    scanSuggestionsForProject,
    removeSuggestion: store.removeSuggestion,
  };
}
