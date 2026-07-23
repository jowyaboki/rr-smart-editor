import { invitationService } from '../services';

export const sendEmailInvitation = (email: string, workspaceId: string, role: any) => {
  return invitationService.createInvitation(email, workspaceId, role);
};
export const acceptWorkspaceInvitation = (inviteId: string) => {
  return invitationService.acceptInvitation(inviteId);
};
