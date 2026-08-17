import { EnterpriseQuota, ExecutionContextSnapshot } from './types';

export class EnterpriseOrchestrator {
  private quotas = new Map<string, EnterpriseQuota>();
  private activeExecutions = new Map<string, Set<string>>(); // orgId -> Set of executionIds

  registerQuota(quota: EnterpriseQuota): void {
    this.quotas.set(quota.organizationId, quota);
  }

  canExecute(organizationId: string): { allowed: boolean; reason?: string } {
    const quota = this.quotas.get(organizationId);
    if (!quota) {
      return { allowed: true }; // Default open if no explicit enterprise limits
    }

    const activeSet = this.activeExecutions.get(organizationId) || new Set();
    if (activeSet.size >= quota.maxConcurrentExecutions) {
      return {
        allowed: false,
        reason: `Organization '${organizationId}' exceeded max concurrent executions limit (${quota.maxConcurrentExecutions})`
      };
    }

    if (quota.currentCostUsd >= quota.costBudgetUsd) {
      return {
        allowed: false,
        reason: `Organization '${organizationId}' reached cost budget limit ($${quota.costBudgetUsd})`
      };
    }

    return { allowed: true };
  }

  trackExecutionStart(organizationId: string, executionId: string): void {
    let activeSet = this.activeExecutions.get(organizationId);
    if (!activeSet) {
      activeSet = new Set();
      this.activeExecutions.set(organizationId, activeSet);
    }
    activeSet.add(executionId);
  }

  trackExecutionEnd(organizationId: string, executionId: string, estimatedCostUsd = 0): void {
    const activeSet = this.activeExecutions.get(organizationId);
    if (activeSet) {
      activeSet.delete(executionId);
    }

    const quota = this.quotas.get(organizationId);
    if (quota) {
      quota.currentCostUsd += estimatedCostUsd;
    }
  }

  getActiveExecutionCount(organizationId: string): number {
    return this.activeExecutions.get(organizationId)?.size || 0;
  }
}
