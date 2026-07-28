import { ManifestSchema, ValidationResult, DevKitValidator } from '../types';

export class ValidationService {
  private validators: DevKitValidator[] = [];

  public registerValidator(validator: DevKitValidator): void {
    this.validators.push(validator);
  }

  /**
   * Scans plugin manifest files and validates compatibility, schemas, permission scopes, and dependencies
   */
  public async validateManifest(manifest: ManifestSchema): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];

    // 1. Basic manifest schema fields check
    if (!manifest.id || !manifest.name || !manifest.version) {
      errors.push({ field: 'id/name/version', message: 'Core identity fields cannot be empty.', severity: 'error' });
    }

    // 2. Strict permission verification
    const allowedPermissions = ['filesystem_read', 'filesystem_write', 'ai_assistant', 'distributed_render', 'clipboard'];
    manifest.permissions.forEach(perm => {
      if (!allowedPermissions.includes(perm)) {
        errors.push({ field: 'permissions', message: `Requested unauthorized/unsafe permission scope: '${perm}'`, severity: 'error' });
      }
    });

    // 3. Dependency structure matches check
    Object.keys(manifest.dependencies).forEach(dep => {
      const ver = manifest.dependencies[dep];
      if (!ver || ver === '') {
        errors.push({ field: `dependencies.${dep}`, message: 'Dependency version cannot be blank.', severity: 'error' });
      }
    });

    // 4. Backward compatibility check
    if (parseFloat(manifest.compatibility.minEditorVersion) > 1.0) {
      errors.push({ field: 'compatibility', message: 'Plugin requires a newer editor version than current release.', severity: 'warning' });
    }

    // Run pluggable custom validators
    for (const val of this.validators) {
      const customRes = await val.validate(manifest);
      errors.push(...customRes.errors);
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
    };
  }
}
