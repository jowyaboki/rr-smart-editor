import { PermissionType } from '@ai-video-editor/extension-sdk';

export class PermissionManager {
  private grantedPermissions = new Map<string, Set<PermissionType>>();

  /**
   * Reviews permissions requested by an extension and requests user confirmation if not pre-authorized.
   */
  public async requestPermissions(
    extensionId: string,
    requested: PermissionType[],
    onConfirm?: (extId: string, permission: PermissionType) => Promise<boolean>
  ): Promise<boolean> {
    const granted = this.grantedPermissions.get(extensionId) || new Set<PermissionType>();

    for (const perm of requested) {
      if (!granted.has(perm)) {
        if (onConfirm) {
          const approved = await onConfirm(extensionId, perm);
          if (!approved) return false; // Rejected by user!
        }
        granted.add(perm);
      }
    }

    this.grantedPermissions.set(extensionId, granted);
    return true;
  }

  public getGrantedPermissions(extensionId: string): PermissionType[] {
    const perms = this.grantedPermissions.get(extensionId);
    return perms ? Array.from(perms) : [];
  }

  public revokePermission(extensionId: string, permission: PermissionType): void {
    const perms = this.grantedPermissions.get(extensionId);
    if (perms) {
      perms.delete(permission);
    }
  }

  public clearAll(): void {
    this.grantedPermissions.clear();
  }
}
