import { workspaceService } from '../services';

export const addWorkspaceMember = (workspaceId: string, userId: string, role: any) => {
  workspaceService.registerMember({
    id: `m-${Math.random().toString(36).substr(2, 9)}`,
    workspaceId,
    userId,
    role,
    joinedAt: Date.now(),
  });
};
