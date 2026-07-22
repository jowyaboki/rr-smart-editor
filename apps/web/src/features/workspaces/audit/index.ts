import { auditService } from '../services';

export const logWorkspaceAuditEvent = (userId: string, orgId: string, wsId: string, action: any, msg: string) => {
  return auditService.logEvent(userId, orgId, wsId, action, msg);
};
export const getWorkspaceAuditHistory = (wsId: string) => {
  return auditService.getLogsByWorkspace(wsId);
};
