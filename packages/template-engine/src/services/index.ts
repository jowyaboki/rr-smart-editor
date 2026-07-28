import { Template, TemplateParameter, TemplateInstance, TemplateVersion, TemplatePreset } from '../types';

// ==========================================
// 1. VALIDATION SERVICE
// ==========================================
export class ValidationService {
  /**
   * Validates values against parameter schemas, checking required fields & boundary limits
   */
  public validateValues(
    params: TemplateParameter[],
    values: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const p of params) {
      // Check conditional visibility first
      if (p.dependsOn) {
        const triggerValue = values[p.dependsOn.parameterId];
        if (triggerValue !== p.dependsOn.conditionValue) {
          continue; // Skip check as field is conditionally disabled
        }
      }

      const val = values[p.id];

      // Required check
      if (p.required && (val === undefined || val === null || val === '')) {
        errors.push(`PARAMETER_REQUIRED: Field "${p.name}" is required.`);
        continue;
      }

      if (val !== undefined && val !== null) {
        // Range boundary checks for numbers
        if (p.type === 'number') {
          if (p.min !== undefined && val < p.min) {
            errors.push(`OUT_OF_BOUNDS: Field "${p.name}" must be at least ${p.min}.`);
          }
          if (p.max !== undefined && val > p.max) {
            errors.push(`OUT_OF_BOUNDS: Field "${p.name}" cannot exceed ${p.max}.`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// ==========================================
// 2. PARAMETER RESOLVER
// ==========================================
export class ParameterResolver {
  /**
   * Resolves and interpolates parameter values into slots paths on the blueprint timeline.
   * Returns a fully edited project clone.
   */
  public resolveBindings(
    blueprint: any,
    slots: any[],
    parameterValues: Record<string, any>
  ): any {
    // Deep clone blueprint to preserve public blueprint APIs
    const project = JSON.parse(JSON.stringify(blueprint));

    for (const slot of slots) {
      const val = parameterValues[slot.id];
      if (val === undefined) continue;

      this.setPropertyByPath(project, slot.targetPath, val);
    }

    return project;
  }

  private setPropertyByPath(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let curr = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      let key: string | number = parts[i];
      // Array bracket index parsing e.g. tracks[0]
      if (key.endsWith(']')) {
        const startBracket = key.indexOf('[');
        const arrayKey = key.slice(0, startBracket);
        const index = parseInt(key.slice(startBracket + 1, -1));
        if (!curr[arrayKey]) curr[arrayKey] = [];
        if (!curr[arrayKey][index]) curr[arrayKey][index] = {};
        curr = curr[arrayKey][index];
        continue;
      }
      if (!curr[key]) curr[key] = {};
      curr = curr[key];
    }

    const lastKey = parts[parts.length - 1];
    if (lastKey.endsWith(']')) {
      const startBracket = lastKey.indexOf('[');
      const arrayKey = lastKey.slice(0, startBracket);
      const index = parseInt(lastKey.slice(startBracket + 1, -1));
      if (!curr[arrayKey]) curr[arrayKey] = [];
      curr[arrayKey][index] = value;
    } else {
      curr[lastKey] = value;
    }
  }
}

// ==========================================
// 3. PREVIEW SERVICE
// ==========================================
export class PreviewService {
  /**
   * Generates a mock visual preview or frame payload
   */
  public generateMockPreviewFrame(
    templateId: string,
    values: Record<string, any>
  ): string {
    return `preview-frame-url-for-tpl-${templateId}-with-values-${JSON.stringify(values).slice(0, 30)}`;
  }
}

// ==========================================
// 4. MARKETPLACE SERVICE
// ==========================================
export class MarketplaceService {
  private installedTemplates = new Map<string, Template>();

  public installTemplateOffline(template: Template): void {
    this.installedTemplates.set(template.metadata.id, template);
  }

  public getTemplate(id: string): Template | undefined {
    return this.installedTemplates.get(id);
  }

  public listTemplates(): Template[] {
    return Array.from(this.installedTemplates.values());
  }

  public uninstallTemplate(id: string): boolean {
    return this.installedTemplates.delete(id);
  }
}

// ==========================================
// 5. TEMPLATE RUNTIME
// ==========================================
export class TemplateRuntime {
  private versionsLog = new Map<string, TemplateVersion[]>();

  public registerVersion(version: TemplateVersion): void {
    const list = this.versionsLog.get(version.templateId) || [];
    list.push(version);
    this.versionsLog.set(version.templateId, list);
  }

  /**
   * Performs schema structure migration from an old template version manifest to the latest v2 structure
   */
  public migrateManifest(
    templateId: string,
    legacyManifest: any,
    targetVersion: string
  ): any {
    const migrated = { ...legacyManifest };
    // Simulated migration logic
    if (targetVersion === '2.0.0') {
      migrated.version = '2.0.0';
      if (migrated.parameters) {
        migrated.parameters = migrated.parameters.map((p: any) => ({
          ...p,
          group: p.group || 'general', // Schema upgrade field
        }));
      }
    }
    return migrated;
  }
}

// ==========================================
// 6. MASTER TEMPLATE ENGINE
// ==========================================
export class TemplateEngine {
  public readonly validation = new ValidationService();
  public readonly resolver = new ParameterResolver();
  public readonly preview = new PreviewService();
  public readonly marketplace = new MarketplaceService();
  public readonly runtime = new TemplateRuntime();

  /**
   * Instantiates a template by applying parameter values onto its blueprint project
   */
  public executeTemplate(
    template: Template,
    instance: TemplateInstance
  ): any {
    // Validate inputs
    const check = this.validation.validateValues(template.parameters, instance.parameterValues);
    if (!check.valid) {
      throw new Error(`Template execution failed: ${check.errors.join(', ')}`);
    }

    // Resolve bindings
    return this.resolver.resolveBindings(
      template.blueprintProject,
      template.slots,
      instance.parameterValues
    );
  }
}
