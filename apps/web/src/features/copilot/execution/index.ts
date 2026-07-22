import { copilotService } from '../services';

export const runPlanExecution = async (plan: any, onApprove: () => void) => {
  copilotService.approvals.approve(plan.id);
  onApprove();
};
export const rejectPlanExecution = (plan: any) => {
  copilotService.approvals.reject(plan.id);
};
