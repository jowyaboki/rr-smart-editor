import {
  MetadataExtractorPlugin,
  ImportProviderPlugin,
  RightsProviderPlugin,
  ArchiveProviderPlugin,
  ApprovalWorkflow,
} from '../types';

export class MediaManagementPluginRegistry {
  private extractors: Map<string, MetadataExtractorPlugin> = new Map();
  private importers: Map<string, ImportProviderPlugin> = new Map();
  private rightsProviders: Map<string, RightsProviderPlugin> = new Map();
  private archiveProviders: Map<string, ArchiveProviderPlugin> = new Map();
  private workflows: Map<string, ApprovalWorkflow> = new Map();

  public registerMetadataExtractor(plugin: MetadataExtractorPlugin): void {
    this.extractors.set(plugin.id, plugin);
  }

  public registerImportProvider(plugin: ImportProviderPlugin): void {
    this.importers.set(plugin.id, plugin);
  }

  public registerRightsProvider(plugin: RightsProviderPlugin): void {
    this.rightsProviders.set(plugin.id, plugin);
  }

  public registerArchiveProvider(plugin: ArchiveProviderPlugin): void {
    this.archiveProviders.set(plugin.id, plugin);
  }

  public registerApprovalWorkflow(workflow: ApprovalWorkflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  public getMetadataExtractor(id: string): MetadataExtractorPlugin | undefined {
    return this.extractors.get(id);
  }

  public getImportProvider(id: string): ImportProviderPlugin | undefined {
    return this.importers.get(id);
  }

  public getRightsProvider(id: string): RightsProviderPlugin | undefined {
    return this.rightsProviders.get(id);
  }

  public getArchiveProvider(id: string): ArchiveProviderPlugin | undefined {
    return this.archiveProviders.get(id);
  }

  public getApprovalWorkflow(id: string): ApprovalWorkflow | undefined {
    return this.workflows.get(id);
  }

  public listMetadataExtractors(): MetadataExtractorPlugin[] {
    return Array.from(this.extractors.values());
  }

  public listImportProviders(): ImportProviderPlugin[] {
    return Array.from(this.importers.values());
  }

  public listRightsProviders(): RightsProviderPlugin[] {
    return Array.from(this.rightsProviders.values());
  }

  public listArchiveProviders(): ArchiveProviderPlugin[] {
    return Array.from(this.archiveProviders.values());
  }

  public listApprovalWorkflows(): ApprovalWorkflow[] {
    return Array.from(this.workflows.values());
  }
}

export const globalMediaManagementPluginRegistry = new MediaManagementPluginRegistry();
