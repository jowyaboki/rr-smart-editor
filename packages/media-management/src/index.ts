import { AssetCatalogService, globalAssetCatalogService } from './services/AssetCatalogService';
import { MetadataService, globalMetadataService } from './services/MetadataService';
import { VersionService, globalVersionService } from './services/VersionService';
import { RightsService, globalRightsService } from './services/RightsService';
import { ApprovalService, globalApprovalService } from './services/ApprovalService';
import { ArchiveService, globalArchiveService } from './services/ArchiveService';
import { LifecycleService, globalLifecycleService } from './services/LifecycleService';
import { AnalyticsService, globalAnalyticsService } from './services/AnalyticsService';

export * from './types';
export * from './plugins';
export { AssetCatalogService, globalAssetCatalogService };
export { MetadataService, globalMetadataService };
export { VersionService, globalVersionService };
export { RightsService, globalRightsService };
export { ApprovalService, globalApprovalService };
export { ArchiveService, globalArchiveService };
export { LifecycleService, globalLifecycleService };
export { AnalyticsService, globalAnalyticsService };

export class MediaManagementPlatformEngine {
  public catalogService: AssetCatalogService;
  public metadataService: MetadataService;
  public versionService: VersionService;
  public rightsService: RightsService;
  public approvalService: ApprovalService;
  public archiveService: ArchiveService;
  public lifecycleService: LifecycleService;
  public analyticsService: AnalyticsService;

  constructor() {
    this.catalogService = globalAssetCatalogService;
    this.metadataService = globalMetadataService;
    this.versionService = globalVersionService;
    this.rightsService = globalRightsService;
    this.approvalService = globalApprovalService;
    this.archiveService = globalArchiveService;
    this.lifecycleService = globalLifecycleService;
    this.analyticsService = globalAnalyticsService;
  }
}

export const globalMediaManagementPlatformEngine = new MediaManagementPlatformEngine();
export default globalMediaManagementPlatformEngine;
