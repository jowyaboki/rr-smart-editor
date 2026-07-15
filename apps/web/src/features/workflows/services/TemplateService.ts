import { Workflow, WorkflowTemplate } from '@ai-video-editor/shared';
import { defaultTemplates } from '../templates/defaultTemplates';

export class TemplateService {
  private static templates = new Map<string, WorkflowTemplate>();

  /**
   * Initializes the template library with built-in templates.
   */
  public static initialize(): void {
    this.templates.clear();
    defaultTemplates.forEach((tpl) => {
      this.templates.set(tpl.id, tpl);
    });
  }

  /**
   * Registers a new custom template.
   */
  public static registerTemplate(template: WorkflowTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Retrieves a template by its ID.
   */
  public static getTemplate(id: string): WorkflowTemplate | null {
    return this.templates.get(id) || null;
  }

  /**
   * Lists all available workflow templates.
   */
  public static getAllTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Instantiates a workflow from a template.
   */
  public static instantiateTemplate(templateId: string, customName?: string): Workflow {
    const tpl = this.getTemplate(templateId);
    if (!tpl) {
      throw new Error(`Template with ID "${templateId}" not found.`);
    }

    return {
      ...JSON.parse(JSON.stringify(tpl.workflow)),
      id: 'wf_' + Math.random().toString(36).substr(2, 9),
      name: customName || `My ${tpl.workflow.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Exports a workflow configuration to a JSON string.
   */
  public static exportWorkflowToJson(workflow: Workflow): string {
    return JSON.stringify(workflow, null, 2);
  }

  /**
   * Imports a workflow configuration from a JSON string.
   */
  public static importWorkflowFromJson(jsonString: string): Workflow {
    const parsed = JSON.parse(jsonString);

    const importedWf: Workflow = {
      ...parsed,
      id: parsed.id || 'wf_' + Math.random().toString(36).substr(2, 9),
      name: parsed.name || 'Imported Workflow',
      steps: parsed.steps || [],
      variables: parsed.variables || [],
      trigger: parsed.trigger || { type: 'manual' },
      createdAt: parsed.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return importedWf;
  }

  /**
   * Unregisters plugin contributed templates.
   */
  public static unregisterPluginTemplates(pluginId: string): void {
    // For plugin cleanup
  }
}

// Auto-initialize templates
TemplateService.initialize();
