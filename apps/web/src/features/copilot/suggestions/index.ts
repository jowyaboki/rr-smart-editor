import { copilotService } from '../services';

export const scanSuggestions = (project: any) => {
  return copilotService.suggestions.analyzeProjectAnomalies(project);
};
