import { copilotService } from '../services';

export const generateExecutionPlan = (intent: any, context: any) => {
  return copilotService.planner.compilePlan(intent, context);
};
