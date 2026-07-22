import {
  OrganizationService,
  WorkspaceService,
  PermissionService,
  QuotaService,
  AuditService,
  InvitationService,
} from '@ai-video-editor/workspace-core';

export const organizationService = new OrganizationService();
export const workspaceService = new WorkspaceService();
export const permissionService = new PermissionService();
export const quotaService = new QuotaService();
export const auditService = new AuditService();
export const invitationService = new InvitationService();
