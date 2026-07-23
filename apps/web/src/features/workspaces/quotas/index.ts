import { quotaService } from '../services';

export const checkQuotaLimits = (workspaceId: string, resource: any) => {
  return quotaService.checkQuotaLimits(workspaceId, resource);
};
