import React, { useEffect, useState } from 'react';
import { useMediaManagement } from '../hooks/useMediaManagement';
import {
  MediaAsset,
  AssetFolder,
  AssetCollection,
  AssetVersion,
  ApprovalRequest,
} from '@ai-video-editor/media-management';

// ==========================================
// REUSABLE PRESENTATION WIDGETS
// ==========================================

export const AssetGridItem: React.FC<{
  asset: MediaAsset;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ asset, isSelected, onSelect }) => {
  const getLifecycleColor = (state: string) => {
    switch (state) {
      case 'online':
        return '#4caf50';
      case 'nearline':
        return '#ff9800';
      case 'cold':
        return '#00bcd4';
      default:
        return '#f44336';
    }
  };

  return (
    <div
      onClick={onSelect}
      style={{
        background: isSelected ? '#2a2d32' : '#252526',
        border: isSelected ? '1px solid #2196f3' : '1px solid #333',
        borderRadius: '6px',
        padding: '10px',
        cursor: 'pointer',
        color: '#fff',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong
          style={{
            fontSize: '12px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '140px',
          }}
        >
          {asset.name}
        </strong>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 'bold',
            color: getLifecycleColor(asset.lifecycleState),
            textTransform: 'uppercase',
          }}
        >
          {asset.lifecycleState}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '4px 0' }}>
        {(asset.metadata.aiGeneratedTags || []).slice(0, 3).map((tag, idx) => (
          <span
            key={idx}
            style={{
              fontSize: '9px',
              background: '#333',
              color: '#aaa',
              padding: '2px 6px',
              borderRadius: '3px',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#888',
          borderTop: '1px solid #333',
          paddingTop: '6px',
        }}
      >
        <span>v{asset.currentVersionNumber}</span>
        <span>{asset.technicalMetadata.mimeType}</span>
      </div>
    </div>
  );
};

// ==========================================
// MAIN MAM/DAM DASHBOARD COMPONENT
// ==========================================

export const MediaManagementDashboard: React.FC = () => {
  const {
    filteredAssets,
    folders,
    collections,
    approvalRequests,
    systemLogs,
    selectedAssetId,
    selectedFolderId,
    selectedCollectionId,
    searchQuery,
    lifecycleFilter,
    rightsFilter,
    isLoading,
    initStore,
    selectAsset,
    selectFolder,
    selectCollection,
    setSearchQuery,
    setLifecycleFilter,
    setRightsFilter,
    ingestNewAsset,
    pushNewVersion,
    restoreAssetVersion,
    assignAssetLicense,
    submitAssetForApproval,
    voteOnApproval,
    migrateAssetTier,
    createFolder,
    createCollection,
    addLogMessage,
  } = useMediaManagement();

  // Local component states for modal submissions
  const [ingestName, setIngestName] = useState('New_Drone_Scene_09.mp4');
  const [newFolderName, setNewFolderName] = useState('');
  const [newCollName, setNewCollectionName] = useState('');
  const [rightsType, setRightsType] = useState('Proprietary Studio Standard');
  const [rightsOwner, setRightsOwner] = useState('Sundance Global Pictures LLC');
  const [licenseExp, setLicenseExp] = useState('2028-12-31');
  const [changelog, setChangelog] = useState('Minor visual trims and compression optimization.');

  useEffect(() => {
    initStore();
  }, [initStore]);

  const activeAsset = filteredAssets.find((a) => a.id === selectedAssetId);

  // Trigger simulated ingestion
  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestName) return;

    await ingestNewAsset(ingestName, `/uploads/raw/${ingestName}`, 1024 * 1024 * 12);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    await createFolder(newFolderName, selectedFolderId || undefined);
    setNewFolderName('');
  };

  const handleCreateCollection = async () => {
    if (!newCollName) return;
    await createCollection(newCollName, 'standard');
    setNewCollectionName('');
  };

  const handleVersionUpdate = async () => {
    if (!activeAsset) return;
    await pushNewVersion(
      activeAsset.id,
      `/uploads/raw/${activeAsset.name.replace('.mp4', '_v2.mp4')}`,
      activeAsset.technicalMetadata.size * 1.1,
      changelog,
    );
  };

  const handleRestoreVersion = async (vNumber: number) => {
    if (!activeAsset) return;
    await restoreAssetVersion(activeAsset.id, vNumber);
  };

  const handleAssignLicense = async () => {
    if (!activeAsset) return;
    await assignAssetLicense(
      activeAsset.id,
      rightsType,
      rightsOwner,
      ['US', 'EU'],
      licenseExp ? `${licenseExp}T00:00:00.000Z` : undefined,
    );
  };

  const handleSubmitApproval = async () => {
    if (!activeAsset) return;
    const versionId = `ver_${activeAsset.id}_v${activeAsset.currentVersionNumber}`;
    await submitAssetForApproval(activeAsset.id, versionId, 'Jules', ['Lead_Editor_Review']);
  };

  const handleVoteApproval = async (requestId: string, vote: 'approve' | 'reject') => {
    await voteOnApproval(
      requestId,
      'Lead_Editor_Review',
      vote,
      'Looks spectacular, fits brand palette perfectly.',
    );
  };

  const handleMigrateTier = async (tier: 'online' | 'nearline' | 'cold') => {
    if (!activeAsset) return;
    await migrateAssetTier(activeAsset.id, tier);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        height: '100vh',
        background: '#121212',
        color: '#e0e0e0',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* HEADER SECTION */}
      <div
        style={{
          background: '#1c1c1c',
          padding: '12px 20px',
          borderBottom: '1px solid #2d2d2d',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🗄️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
              ENTERPRISE MEDIA ASSET MANAGEMENT (MAM/DAM) PLATFORM
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
              Centralized cataloging, governance, storage lifecycles and metadata indexing
            </p>
          </div>
        </div>

        {/* LOGO SAFE AREA INDICATORS */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            style={{
              background: '#252526',
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #333',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                color: '#888',
                display: 'block',
                textTransform: 'uppercase',
              }}
            >
              Assets Cataloged
            </span>
            <strong style={{ color: '#4caf50', fontSize: '14px' }}>{filteredAssets.length}</strong>
          </div>
          <div
            style={{
              background: '#252526',
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #333',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                color: '#888',
                display: 'block',
                textTransform: 'uppercase',
              }}
            >
              Folders Active
            </span>
            <strong style={{ color: '#2196f3', fontSize: '14px' }}>{folders.length}</strong>
          </div>
        </div>
      </div>

      {/* THREE PANEL GRID LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 360px', overflow: 'hidden' }}>
        {/* LEFT PANEL: SIDEBAR */}
        <div
          style={{
            background: '#181818',
            borderRight: '1px solid #2d2d2d',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
          }}
        >
          {/* FOLDERS TREE */}
          <div>
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '12px',
                color: '#aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              🗂️ Asset Folders
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                onClick={() => selectFolder(null)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  background:
                    !selectedFolderId && !selectedCollectionId ? '#252526' : 'transparent',
                  color: !selectedFolderId && !selectedCollectionId ? '#fff' : '#aaa',
                }}
              >
                📁 [All Root Assets]
              </div>
              {folders.map((f) => (
                <div
                  key={f.id}
                  onClick={() => selectFolder(f.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    background: selectedFolderId === f.id ? '#252526' : 'transparent',
                    color: selectedFolderId === f.id ? '#fff' : '#aaa',
                    paddingLeft: '16px',
                  }}
                >
                  📁 {f.name}
                </div>
              ))}
            </div>

            {/* CREATE FOLDER */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New Folder"
                style={{
                  flex: 1,
                  background: '#222',
                  border: '1px solid #3d3d3d',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <button
                onClick={handleCreateFolder}
                style={{
                  background: '#2196f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* COLLECTIONS CATALOG */}
          <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px' }}>
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '12px',
                color: '#aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              ⭐ Dynamic Collections
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {collections.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectCollection(c.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    background: selectedCollectionId === c.id ? '#252526' : 'transparent',
                    color: selectedCollectionId === c.id ? '#fff' : '#aaa',
                  }}
                >
                  🌌 {c.name} ({c.assetIds.length})
                </div>
              ))}
            </div>

            {/* CREATE COLLECTION */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <input
                type="text"
                value={newCollName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="New Collection"
                style={{
                  flex: 1,
                  background: '#222',
                  border: '1px solid #3d3d3d',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <button
                onClick={handleCreateCollection}
                style={{
                  background: '#2196f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* INGEST COMPONENT PANEL */}
          <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px', marginTop: 'auto' }}>
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '12px',
                color: '#aaa',
                textTransform: 'uppercase',
              }}
            >
              📥 Batch Ingest Inbound
            </h3>
            <form
              onSubmit={handleIngestSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <input
                type="text"
                value={ingestName}
                onChange={(e) => setIngestName(e.target.value)}
                placeholder="filename.mp4"
                style={{
                  background: '#222',
                  border: '1px solid #3d3d3d',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Ingest & Index Asset
              </button>
            </form>
          </div>
        </div>

        {/* CENTER PANEL: ASSET GRID & SEARCH FILTERS */}
        <div
          style={{
            background: '#121212',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* SEARCH & FILTERS BAR */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              background: '#1a1a1a',
              padding: '10px 16px',
              borderRadius: '6px',
              border: '1px solid #2d2d2d',
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets name, tags, or metadata..."
              style={{
                flex: 1,
                background: '#252526',
                border: '1px solid #3d3d3d',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />

            <select
              value={lifecycleFilter}
              onChange={(e) => setLifecycleFilter(e.target.value as any)}
              style={{
                background: '#252526',
                border: '1px solid #3d3d3d',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '12px',
              }}
            >
              <option value="all">All Storage Tiers</option>
              <option value="online">Online</option>
              <option value="nearline">Nearline</option>
              <option value="cold">Cold Storage</option>
            </select>

            <select
              value={rightsFilter}
              onChange={(e) => setRightsFilter(e.target.value as any)}
              style={{
                background: '#252526',
                border: '1px solid #3d3d3d',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '12px',
              }}
            >
              <option value="all">All Rights Clearance</option>
              <option value="cleared">Cleared</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>

          {/* DRAG AND DROP INGEST WATCH ZONE */}
          <div
            style={{
              background: 'rgba(33, 150, 243, 0.05)',
              border: '2px dashed rgba(33, 150, 243, 0.25)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              color: '#90caf9',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            📂 Drag & Drop assets to auto-ingest or Watch folder monitor active...
          </div>

          {/* MAIN ASSETS GRID */}
          <div>
            <h2
              style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#fff',
                textTransform: 'uppercase',
              }}
            >
              Media Assets Catalog ({filteredAssets.length})
            </h2>

            {filteredAssets.length === 0 ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#666',
                  border: '1px dashed #333',
                  borderRadius: '8px',
                }}
              >
                No assets found in folder/collection. Use "Batch Ingest" to add.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px',
                }}
              >
                {filteredAssets.map((asset) => (
                  <AssetGridItem
                    key={asset.id}
                    asset={asset}
                    isSelected={selectedAssetId === asset.id}
                    onSelect={() => selectAsset(asset.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: METADATA & VERSION INSPECTOR */}
        <div
          style={{
            background: '#181818',
            borderLeft: '1px solid #2d2d2d',
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {activeAsset ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* ASSET TITLE */}
              <div
                style={{
                  background: '#252526',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <div style={{ fontSize: '10px', color: '#aaa', textTransform: 'uppercase' }}>
                  Active Asset ID
                </div>
                <code style={{ fontSize: '12px', fontWeight: 'bold' }}>{activeAsset.id}</code>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '15px', color: '#fff' }}>
                  {activeAsset.name}
                </h3>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '11px',
                    color: '#888',
                    wordBreak: 'break-all',
                  }}
                >
                  {activeAsset.url}
                </p>
              </div>

              {/* TECHNICAL METADATA (EXIF/IPTC/XMP) */}
              <div
                style={{
                  background: '#252526',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '11px',
                    color: '#2196f3',
                    textTransform: 'uppercase',
                  }}
                >
                  ⚙️ Technical & EXIF Profiling
                </h4>
                <div
                  style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                >
                  <div>
                    Mime Type:{' '}
                    <strong style={{ color: '#fff' }}>
                      {activeAsset.technicalMetadata.mimeType}
                    </strong>
                  </div>
                  <div>
                    Resolution:{' '}
                    <strong style={{ color: '#fff' }}>
                      {activeAsset.technicalMetadata.resolution
                        ? `${activeAsset.technicalMetadata.resolution.width}x${activeAsset.technicalMetadata.resolution.height}`
                        : 'N/A'}
                    </strong>
                  </div>
                  <div>
                    Camera Model:{' '}
                    <strong style={{ color: '#fff' }}>
                      {activeAsset.metadata.exif?.camera || 'N/A'}
                    </strong>
                  </div>
                  <div>
                    Rating XMP:{' '}
                    <strong style={{ color: '#fff' }}>
                      {activeAsset.metadata.xmp?.rating || 'N/A'} stars
                    </strong>
                  </div>
                </div>
              </div>

              {/* MEDIA RIGHTS & LICENSES */}
              <div
                style={{
                  background: '#252526',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '11px',
                    color: '#ff9800',
                    textTransform: 'uppercase',
                  }}
                >
                  ⚖️ Media Copyrights & Rights
                </h4>
                {activeAsset.rights ? (
                  <div
                    style={{
                      fontSize: '11px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div>
                      License:{' '}
                      <strong style={{ color: '#fff' }}>{activeAsset.rights.license.type}</strong>
                    </div>
                    <div>
                      Owner:{' '}
                      <strong style={{ color: '#fff' }}>{activeAsset.rights.license.owner}</strong>
                    </div>
                    <div>
                      Allowed:{' '}
                      <strong style={{ color: '#fff' }}>
                        {activeAsset.rights.license.allowedTerritories.join(', ')}
                      </strong>
                    </div>
                    <div>
                      Status:{' '}
                      <strong
                        style={{
                          color:
                            activeAsset.rights.approvalStatus === 'cleared' ? '#4caf50' : '#f44336',
                        }}
                      >
                        {activeAsset.rights.approvalStatus.toUpperCase()}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#888' }}>
                      No active license assigned yet.
                    </p>
                    <button
                      onClick={handleAssignLicense}
                      style={{
                        width: '100%',
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #444',
                        padding: '6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Assign Default license rights
                    </button>
                  </div>
                )}
              </div>

              {/* VERSION HISTORY */}
              <div
                style={{
                  background: '#252526',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '11px',
                    color: '#e91e63',
                    textTransform: 'uppercase',
                  }}
                >
                  ⏳ Version History ({activeAsset.versions.length})
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    maxHeight: '120px',
                    overflowY: 'auto',
                  }}
                >
                  {activeAsset.versions.map((ver) => (
                    <div
                      key={ver.id}
                      style={{
                        background: '#1a1a1b',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '11px',
                      }}
                    >
                      <div>
                        <strong>v{ver.versionNumber}</strong>
                        <span style={{ color: '#888', marginLeft: '6px' }}>by {ver.createdBy}</span>
                      </div>
                      {ver.versionNumber !== activeAsset.currentVersionNumber && (
                        <button
                          onClick={() => handleRestoreVersion(ver.versionNumber)}
                          style={{
                            background: '#333',
                            border: '1px solid #555',
                            color: '#fff',
                            fontSize: '9px',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                          }}
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #333', marginTop: '10px', paddingTop: '10px' }}>
                  <input
                    type="text"
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                    placeholder="Changelog notes..."
                    style={{
                      width: '100%',
                      background: '#1e1e1e',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      padding: '6px',
                      color: '#fff',
                      fontSize: '11px',
                      marginBottom: '6px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={handleVersionUpdate}
                    style={{
                      width: '100%',
                      background: '#2196f3',
                      color: '#fff',
                      border: 'none',
                      padding: '6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Commit New Version v{activeAsset.currentVersionNumber + 1}
                  </button>
                </div>
              </div>

              {/* STORAGE LIFECYCLE MANAGEMENT */}
              <div
                style={{
                  background: '#252526',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '11px',
                    color: '#00bcd4',
                    textTransform: 'uppercase',
                  }}
                >
                  🧊 Storage Lifecycle Transition
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  {(['online', 'nearline', 'cold'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleMigrateTier(t)}
                      style={{
                        background: activeAsset.lifecycleState === t ? '#00bcd4' : '#333',
                        border: 'none',
                        color: '#fff',
                        padding: '6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* APPROVAL WORKFLOW ACTION */}
              <div
                style={{
                  background: '#252526',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '11px',
                    color: '#9c27b0',
                    textTransform: 'uppercase',
                  }}
                >
                  👥 Brand Approval Workflows
                </h4>
                {approvalRequests.find((r) => r.assetId === activeAsset.id) ? (
                  <div style={{ fontSize: '11px' }}>
                    <div>
                      Request Status:{' '}
                      <strong style={{ color: '#ea80fc' }}>
                        {approvalRequests
                          .find((r) => r.assetId === activeAsset.id)
                          ?.currentStatus.toUpperCase()}
                      </strong>
                    </div>
                    {approvalRequests.find((r) => r.assetId === activeAsset.id)?.currentStatus ===
                      'review' && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        <button
                          onClick={() =>
                            handleVoteApproval(
                              approvalRequests.find((r) => r.assetId === activeAsset.id)!.id,
                              'approve',
                            )
                          }
                          style={{
                            flex: 1,
                            background: '#4caf50',
                            border: 'none',
                            color: '#fff',
                            padding: '4px',
                            borderRadius: '3px',
                            fontSize: '10px',
                            cursor: 'pointer',
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleVoteApproval(
                              approvalRequests.find((r) => r.assetId === activeAsset.id)!.id,
                              'reject',
                            )
                          }
                          style={{
                            flex: 1,
                            background: '#f44336',
                            border: 'none',
                            color: '#fff',
                            padding: '4px',
                            borderRadius: '3px',
                            fontSize: '10px',
                            cursor: 'pointer',
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitApproval}
                    style={{
                      width: '100%',
                      background: '#9c27b0',
                      color: '#fff',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Submit for Compliance Approval
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '40px 10px',
                textAlign: 'center',
                color: '#666',
                border: '1px dashed #333',
                borderRadius: '6px',
              }}
            >
              Select an asset from the main grid to review EXIF properties, rights, versions, and
              approve transitions.
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CONSOLE PANEL: METRICS & CONSOLE LOGS */}
      <div
        style={{
          background: '#141414',
          borderTop: '1px solid #2d2d2d',
          padding: '12px 20px',
          height: '160px',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '20px',
        }}
      >
        {/* LOGS CONSOLE */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4
            style={{
              margin: '0 0 6px 0',
              fontSize: '11px',
              color: '#aaa',
              textTransform: 'uppercase',
            }}
          >
            🖥️ System Governance Logs
          </h4>
          <div
            style={{
              flex: 1,
              background: '#090909',
              border: '1px solid #222',
              borderRadius: '4px',
              padding: '8px 12px',
              fontFamily: 'Monospace',
              fontSize: '11px',
              color: '#00e5ff',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {systemLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>

        {/* METRICS WIDGET */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h4
            style={{
              margin: '0 0 6px 0',
              fontSize: '11px',
              color: '#aaa',
              textTransform: 'uppercase',
            }}
          >
            Storage & Analytics Growth
          </h4>
          <div
            style={{
              background: '#1e1e1e',
              border: '1px solid #2d2d2d',
              borderRadius: '6px',
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: '#888' }}>Total Size</div>
              <strong style={{ fontSize: '16px', color: '#fff' }}>148.5 GB</strong>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#888' }}>Retention Rule</div>
              <strong style={{ fontSize: '14px', color: '#4caf50' }}>Active (365d)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaManagementDashboard;
