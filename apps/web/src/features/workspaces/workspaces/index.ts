import { workspaceService } from '../services';

export const createOrgWorkspace = (orgId: string, name: string) => {
  return workspaceService.createWorkspace(orgId, name);
};
export const switchActiveWorkspace = (orgId: string, workspaceId: string, userId: string) => {
  return workspaceService.switchActiveWorkspace(orgId, workspaceId, userId);
};
