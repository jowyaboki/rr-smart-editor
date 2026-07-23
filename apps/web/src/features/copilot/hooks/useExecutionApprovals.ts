import { useCopilotStore } from '../store/copilotStore';
import { copilotService } from '../services';

export function useExecutionApprovals() {
  const store = useCopilotStore();

  const approveCurrentPlan = (onExecute: () => void) => {
    if (store.approvalRequest) {
      copilotService.approvals.approve(store.approvalRequest.id);
      onExecute();
      store.setActivePlan(null);
      store.setApprovalRequest(null);
    }
  };

  const rejectCurrentPlan = () => {
    if (store.approvalRequest) {
      copilotService.approvals.reject(store.approvalRequest.id);
      store.setActivePlan(null);
      store.setApprovalRequest(null);
    }
  };

  return {
    approvalRequest: store.approvalRequest,
    activePlan: store.activePlan,
    approveCurrentPlan,
    rejectCurrentPlan,
  };
}
