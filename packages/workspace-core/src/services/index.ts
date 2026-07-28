import { Organization, Workspace, WorkspaceMember, Invitation, Quota, AuditEntry, WorkspaceRole, WorkspaceContext } from '../types';

// ==========================================
// 1. ORGANIZATION SERVICE
// ==========================================
export class OrganizationService {
  private orgs = new Map<string, Organization>();

  public createOrganization(name: string, domain?: string): Organization {
    const org: Organization = {
      id: `org-${Math.random().toString(36).substr(2, 9)}`,
      name,
      domain,
      createdAt: Date.now(),
    };
    this.orgs.set(org.id, org);
    return org;
  }

  public getOrganization(id: string): Organization | undefined {
    return this.orgs.get(id);
  }
}

// ==========================================
// 2. WORKSPACE SERVICE
// ==========================================
export class WorkspaceService {
  private workspaces = new Map<string, Workspace>();
  private members = new Map<string, WorkspaceMember>();
  private activeContext: WorkspaceContext | null = null;

  public createWorkspace(organizationId: string, name: string): Workspace {
    const ws: Workspace = {
      id: `ws-${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      name,
      createdAt: Date.now(),
    };
    this.workspaces.set(ws.id, ws);
    return ws;
  }

  public registerMember(member: WorkspaceMember): void {
    this.members.set(`${member.workspaceId}-${member.userId}`, member);
  }

  public switchActiveWorkspace(organizationId: string, workspaceId: string, userId: string): WorkspaceContext {
    const memberKey = `${workspaceId}-${userId}`;
    const member = this.members.get(memberKey);
    const role: WorkspaceRole = member ? member.role : 'viewer';

    this.activeContext = {
      organizationId,
      workspaceId,
      userId,
      role,
    };

    return this.activeContext;
  }

  public getActiveContext(): WorkspaceContext | null {
    return this.activeContext;
  }

  public scopeQuery<T extends { organizationId: string; workspaceId: string }>(
    resources: T[]
  ): T[] {
    if (!this.activeContext) return [];
    const { organizationId, workspaceId } = this.activeContext;

    return resources.filter(
      r => r.organizationId === organizationId && r.workspaceId === workspaceId
    );
  }
}

// ==========================================
// 3. PERMISSION SERVICE
// ==========================================
export class PermissionService {
  private roleHierarchies: Record<WorkspaceRole, number> = {
    owner: 6,
    administrator: 5,
    manager: 4,
    editor: 3,
    reviewer: 2,
    viewer: 1,
  };

  public isAuthorized(userRole: WorkspaceRole, requiredRole: WorkspaceRole): boolean {
    return this.roleHierarchies[userRole] >= this.roleHierarchies[requiredRole];
  }
}

// ==========================================
// 4. QUOTA SERVICE
// ==========================================
export class QuotaService {
  private quotas = new Map<string, Quota>();
  private usages = new Map<string, Record<string, number>>();

  public setWorkspaceQuota(workspaceId: string, limit: Quota): void {
    this.quotas.set(workspaceId, limit);
  }

  public recordUsageIncrement(workspaceId: string, resource: keyof Quota, incrementValue = 1): void {
    const current = this.usages.get(workspaceId) || {};
    const val = current[resource] || 0;
    current[resource] = val + incrementValue;
    this.usages.set(workspaceId, current);
  }

  public checkQuotaLimits(workspaceId: string, resource: keyof Quota): { allowed: boolean; current: number; limit: number } {
    const limit = this.quotas.get(workspaceId);
    if (!limit) {
      return { allowed: true, current: 0, limit: Infinity };
    }

    const currentMap = this.usages.get(workspaceId) || {};
    const current = currentMap[resource] || 0;
    const maxLimit = limit[resource];

    return {
      allowed: current < maxLimit,
      current,
      limit: maxLimit,
    };
  }
}

// ==========================================
// 5. AUDIT LOG SERVICE
// ==========================================
export class AuditService {
  private audits: AuditEntry[] = [];

  public logEvent(
    userId: string,
    organizationId: string,
    workspaceId: string,
    action: AuditEntry['action'],
    message: string,
    ipAddress?: string
  ): AuditEntry {
    const entry: AuditEntry = {
      id: `audit-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      userId,
      organizationId,
      workspaceId,
      action,
      message,
      ipAddress,
    };
    this.audits.push(entry);
    return entry;
  }

  public getLogsByWorkspace(workspaceId: string): AuditEntry[] {
    return this.audits.filter(a => a.workspaceId === workspaceId);
  }
}

// ==========================================
// 6. INVITATION SERVICE
// ==========================================
export class InvitationService {
  private invitations = new Map<string, Invitation>();

  public createInvitation(email: string, workspaceId: string, role: WorkspaceRole, durationDays = 7): Invitation {
    const invite: Invitation = {
      id: `invite-${Math.random().toString(36).substr(2, 9)}`,
      email,
      workspaceId,
      role,
      expiresAt: Date.now() + durationDays * 24 * 60 * 60 * 1000,
      accepted: false,
    };
    this.invitations.set(invite.id, invite);
    return invite;
  }

  public acceptInvitation(id: string): Invitation {
    const invite = this.invitations.get(id);
    if (!invite) {
      throw new Error(`Invitation with ID "${id}" does not exist.`);
    }
    if (invite.expiresAt < Date.now()) {
      throw new Error(`Invitation has expired.`);
    }

    invite.accepted = true;
    return invite;
  }
}
