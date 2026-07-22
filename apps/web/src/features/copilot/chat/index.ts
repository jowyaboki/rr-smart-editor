import { copilotService } from '../services';

export const submitCopilotPrompt = (prompt: string, context: any) => {
  return copilotService.processNaturalLanguageCommand(prompt, context);
};
