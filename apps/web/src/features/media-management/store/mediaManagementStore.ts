import { create } from 'zustand';
import {
  globalMediaManagementPlatformEngine,
  MediaAsset,
  AssetFolder,
  AssetCollection,
  ApprovalRequest,
} from '@ai-video-editor/media-management';

interface MediaManagementState {
  assets: MediaAsset[];
  folders: AssetFolder[];
  collections: AssetCollection[];
  approvalRequests: ApprovalRequest[];
  systemLogs: string[];

  // Selection & UI Filters
  selectedAssetId: string | null;
  selectedFolderId: string | null;
  selectedCollectionId: string | null;
  searchQuery: string;
  lifecycleFilter: 'all' | 'online' | 'nearline' | 'cold';
  rightsFilter: 'all' | 'cleared' | 'pending' | 'expired' | 'restricted';
  isLoading: boolean;

  // Actions
  initStore: () => void;
  loadAssets: () => void;
  loadFolders: () => void;
  loadCollections: () => void;
  loadApprovalRequests: () => void;
  selectAsset: (id: string | null) => void;
  selectFolder: (id: string | null) => void;
  selectCollection: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setLifecycleFilter: (filter: 'all' | 'online' | 'nearline' | 'cold') => void;
  setRightsFilter: (filter: 'all' | 'cleared' | 'pending' | 'expired' | 'restricted') => void;

  // Delegation Actions
  ingestNewAsset: (name: string, url: string, size?: number, mimeType?: string) => Promise<MediaAsset>;
  pushNewVersion: (assetId: string, url: string, size?: number, changelog?: string) => Promise<void>;
  restoreAssetVersion: (assetId: string, versionNumber: number) => Promise<void>;
  assignAssetLicense: (assetId: string, type: string, owner: string, territories: string[], expDate?: string) => Promise<void>;
  submitAssetForApproval: (assetId: string, versionId: string, requestedBy: string, approvers: string[]) => Promise<void>;
  voteOnApproval: (requestId: string, approver: string, vote: 'approve' | 'reject', comment?: string) => Promise<void>;
  migrateAssetTier: (assetId: string, tier: 'online' | 'nearline' | 'cold') => Promise<void>;
  createFolder: (name: string, parentId?: string) => Promise<void>;
  createCollection: (name: string, type: 'standard' | 'smart', criteria?: any) => Promise<void>;
  addLogMessage: (msg: string) => void;
}

export const useMediaManagementStore = create<MediaManagementState>((set, get) => {
  return {
    assets: [],
    folders: [],
    collections: [],
    approvalRequests: [],
    systemLogs: [],

    selectedAssetId: null,
    selectedFolderId: null,
    selectedCollectionId: null,
    searchQuery: '',
    lifecycleFilter: 'all',
    rightsFilter: 'all',
    isLoading: false,

    initStore: () => {
      get().loadFolders();
      get().loadCollections();
      get().loadAssets();
      get().loadApprovalRequests();
      set({
        systemLogs: [
          `[${new Date().toISOString()}] [System: MAM/DAM] Enterprise platform initialized.`,
          `[${new Date().toISOString()}] [System: MAM/DAM] Registered 3 default folder templates.`,
          `[${new Date().toISOString()}] [System: MAM/DAM] Subscribed to Media Pipeline live imports watcher.`,
        ],
      });
    },

    loadAssets: () => {
      const list = globalMediaManagementPlatformEngine.catalogService.listAssets();
      set({ assets: list });
    },

    loadFolders: () => {
      const list = globalMediaManagementPlatformEngine.catalogService.listFolders();
      set({ folders: list });
    },

    loadCollections: () => {
      const list = globalMediaManagementPlatformEngine.catalogService.listCollections();
      set({ collections: list });
    },

    loadApprovalRequests: () => {
      const list = globalMediaManagementPlatformEngine.approvalService.listApprovalRequests();
      set({ approvalRequests: list });
    },

    selectAsset: (id) => {
      set({ selectedAssetId: id });
    },

    selectFolder: (id) => {
      set({ selectedFolderId: id, selectedCollectionId: null });
    },

    selectCollection: (id) => {
      set({ selectedCollectionId: id, selectedFolderId: null });
    },

    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    setLifecycleFilter: (filter) => {
      set({ lifecycleFilter: filter });
    },

    setRightsFilter: (filter) => {
      set({ rightsFilter: filter });
    },

    // Delegation actions (no business logic in Zustand store)
    ingestNewAsset: async (name, url, size, mimeType) => {
      set({ isLoading: true });
      try {
        const tech = await globalMediaManagementPlatformEngine.metadataService.extractTechnicalMetadata(
          url,
          size || 1024 * 100,
          mimeType || 'video/mp4'
        );

        const activeFolderId = get().selectedFolderId;
        const folder = activeFolderId ? globalMediaManagementPlatformEngine.catalogService.getFolder(activeFolderId) : undefined;
        const metadata = await globalMediaManagementPlatformEngine.metadataService.compileMetadataProfile(url, folder);

        const assetId = `asset_${Math.random().toString(36).substr(2, 9)}`;

        const asset: MediaAsset = {
          id: assetId,
          name,
          url,
          folderId: activeFolderId || undefined,
          checksum: `chk_${Math.random().toString(36).substr(2, 9)}`,
          technicalMetadata: tech,
          metadata,
          currentVersionNumber: 1,
          versions: [
            {
              id: `ver_${assetId}_v1`,
              assetId,
              versionNumber: 1,
              url,
              size: size || 1024 * 100,
              checksum: `chk_${Math.random().toString(36).substr(2, 9)}`,
              createdBy: 'Admin',
              createdAt: new Date().toISOString(),
            },
          ],
          lifecycleState: 'online',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        globalMediaManagementPlatformEngine.catalogService.registerAsset(asset);
        get().loadAssets();

        const logMsg = `[${new Date().toISOString()}] [Event: IngestAsset] Cataloged asset '${name}' into folder '${activeFolderId || 'root'}'.`;
        set({
          systemLogs: [...get().systemLogs, logMsg],
          selectedAssetId: assetId,
        });

        return asset;
      } finally {
        set({ isLoading: false });
      }
    },

    pushNewVersion: async (assetId, url, size, changelog) => {
      const asset = globalMediaManagementPlatformEngine.catalogService.getAsset(assetId);
      if (!asset) return;

      globalMediaManagementPlatformEngine.versionService.createNewVersion(
        asset,
        url,
        size || 1024 * 100,
        `chk_${Math.random().toString(36).substr(2, 9)}`,
        'Admin',
        changelog
      );

      get().loadAssets();
      const logMsg = `[${new Date().toISOString()}] [Event: NewVersion] Pushed v${asset.currentVersionNumber} for asset '${asset.name}'.`;
      set({ systemLogs: [...get().systemLogs, logMsg] });
    },

    restoreAssetVersion: async (assetId, versionNumber) => {
      const asset = globalMediaManagementPlatformEngine.catalogService.getAsset(assetId);
      if (!asset) return;

      globalMediaManagementPlatformEngine.versionService.restoreVersion(asset, versionNumber);
      get().loadAssets();

      const logMsg = `[${new Date().toISOString()}] [Event: VersionRestore] Restored v${versionNumber} on asset '${asset.name}'.`;
      set({ systemLogs: [...get().systemLogs, logMsg] });
    },

    assignAssetLicense: async (assetId, type, owner, territories, expDate) => {
      const asset = globalMediaManagementPlatformEngine.catalogService.getAsset(assetId);
      if (!asset) return;

      globalMediaManagementPlatformEngine.rightsService.assignLicense(asset, {
        id: `lic_${Math.random().toString(36).substr(2, 9)}`,
        type,
        owner,
        allowedTerritories: territories,
        expirationDate: expDate,
      });

      get().loadAssets();
      const logMsg = `[${new Date().toISOString()}] [Event: LicenseAssign] License '${type}' assigned to asset '${asset.name}'.`;
      set({ systemLogs: [...get().systemLogs, logMsg] });
    },

    submitAssetForApproval: async (assetId, versionId, requestedBy, approvers) => {
      const asset = globalMediaManagementPlatformEngine.catalogService.getAsset(assetId);
      if (!asset) return;

      globalMediaManagementPlatformEngine.approvalService.submitForApproval(
        asset,
        versionId,
        requestedBy,
        approvers
      );

      get().loadApprovalRequests();
      const logMsg = `[${new Date().toISOString()}] [Event: ApprovalSubmit] Submitted version '${versionId}' for asset '${asset.name}' to review pipeline.`;
      set({ systemLogs: [...get().systemLogs, logMsg] });
    },

    voteOnApproval: async (requestId, approver, vote, comment) => {
      globalMediaManagementPlatformEngine.approvalService.recordReviewVote(
        requestId,
        approver,
        vote,
        comment
      );

      get().loadApprovalRequests();
      const logMsg = `[${new Date().toISOString()}] [Event: ApprovalVote] Approver '${approver}' voted '${vote}' on request '${requestId}'.`;
      set({ systemLogs: [...get().systemLogs, logMsg] });
    },

    migrateAssetTier: async (assetId, tier) => {
      const asset = globalMediaManagementPlatformEngine.catalogService.getAsset(assetId);
      if (!asset) return;

      await globalMediaManagementPlatformEngine.archiveService.migrateStorageTier(asset, tier);
      get().loadAssets();

      const logMsg = `[${new Date().toISOString()}] [Event: LifecycleMigration] Storage tier for asset '${asset.name}' transitioned to '${tier}'.`;
      set({ systemLogs: [...get().systemLogs, logMsg] });
    },

    createFolder: async (name, parentId) => {
      const folder: AssetFolder = {
        id: `folder_${Math.random().toString(36).substr(2, 9)}`,
        name,
        parentId,
        createdAt: new Date().toISOString(),
      };
      globalMediaManagementPlatformEngine.catalogService.registerFolder(folder);
      get().loadFolders();

      const logMsg = `[${new Date().toISOString()}] [Event: FolderCreate] Created folder '${name}'.`;
      set({ systemLogs: [...get().systemLogs, logMsg] });
    },

    createCollection: async (name, type, criteria) => {
      const col: AssetCollection = {
        id: `coll_${Math.random().toString(36).substr(2, 9)}`,
        name,
        assetIds: [],
        type,
        smartCriteria: criteria,
        createdAt: new Date().toISOString(),
      };
      globalMediaManagementPlatformEngine.catalogService.registerCollection(col);
      get().loadCollections();

      const logMsg = `[${new Date().toISOString()}] [Event: CollectionCreate] Created ${type} collection '${name}'.`;
      set({ systemLogs: [...get().systemLogs, logMsg] });
    },

    addLogMessage: (msg) => {
      set({ systemLogs: [...get().systemLogs, `[${new Date().toISOString()}] ${msg}`] });
    },
  };
});

export default useMediaManagementStore;
