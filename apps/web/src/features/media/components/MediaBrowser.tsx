import React, { useState } from 'react';
import { useMediaBrowser } from '../hooks/useMediaBrowser';
import { MetadataInspector } from './MetadataInspector';
import { MediaAsset } from '../types';

export const MediaBrowser: React.FC = () => {
  const {
    assets,
    collections,
    activeJobs,
    selectedCollectionId,
    selectedType,
    searchQuery,
    setSearchQuery,
    selectCollection,
    selectType,
    importFile,
    createCollection,
  } = useMediaBrowser();

  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // Mock upload drag & drop trigger
  const handleMockUpload = () => {
    const files = [
      { name: 'vlog_scenery.mp4', size: 1024 * 1024 * 12, path: '/local/footages/vlog_scenery.mp4' },
      { name: 'voice_voiceover.mp3', size: 1024 * 1024 * 3, path: '/local/audios/voice_voiceover.mp3' },
      { name: 'splash_logo.png', size: 1024 * 512, path: '/local/images/splash_logo.png' },
    ];
    // Random select
    const file = files[Math.floor(Math.random() * files.length)];
    importFile(file.name, file.size, file.path);
  };

  const handleAddCollection = () => {
    const name = prompt('Enter new Collection Name:');
    if (name) {
      createCollection({
        id: `col_${Date.now()}`,
        name,
      });
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#0a1929',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        maxWidth: '900px',
        margin: '20px auto',
      }}
    >
      {/* Header and Mock Upload Trigger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px' }}>Professional Media Browser</h2>
          <div style={{ fontSize: '11px', color: '#b2bac2', marginTop: '4px' }}>
            Local-first background transcoder • Automatic proxy wave extractions
          </div>
        </div>
        <button
          onClick={handleMockUpload}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          ➕ Import Media File
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1.5fr 1fr', gap: '20px' }}>
        {/* Left Side: Collections Directories */}
        <div style={{ backgroundColor: '#102031', padding: '12px', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#b2bac2' }}>COLLECTIONS</span>
            <button onClick={handleAddCollection} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>+</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {collections.map(col => (
              <button
                key={col.id}
                onClick={() => selectCollection(col.id)}
                style={{
                  textAlign: 'left',
                  padding: '6px 10px',
                  fontSize: '12px',
                  backgroundColor: selectedCollectionId === col.id ? '#3b82f6' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: selectedCollectionId === col.id ? 'bold' : 'normal',
                }}
              >
                📁 {col.name}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #1e293b', marginTop: '16px', paddingTop: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#b2bac2', display: 'block', marginBottom: '8px' }}>FILTER BY TYPE</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['video', 'audio', 'image'].map(t => (
                <button
                  key={t}
                  onClick={() => selectType(selectedType === t ? null : t)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '10px',
                    backgroundColor: selectedType === t ? '#3b82f6' : '#1e293b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '3px',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Searchable Assets Grid List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Search bar */}
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="🔍 Search indexed files, codecs, encoders..."
            style={{
              padding: '8px 12px',
              backgroundColor: '#102031',
              border: '1px solid #1e293b',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
            }}
          />

          {/* Active queue ingest status */}
          {activeJobs.length > 0 && (
            <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '6px' }}>Background Ingestion Queue</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeJobs.map(job => (
                  <div key={job.id} style={{ fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>{job.filename}</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '3px', backgroundColor: '#0a1929', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${job.progress}%`, height: '100%', backgroundColor: '#fbbf24' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assets Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '12px',
              maxHeight: '300px',
              overflowY: 'auto',
              paddingRight: '6px',
            }}
          >
            {assets.map(asset => {
              const isSelected = selectedAsset?.id === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  style={{
                    backgroundColor: '#102031',
                    borderRadius: '6px',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid #1e293b',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                    {asset.type === 'video' ? '🎬' : asset.type === 'audio' ? '🎵' : '🖼'}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={asset.filename}>
                    {asset.filename}
                  </div>
                  <div style={{ fontSize: '8px', color: '#b2bac2', marginTop: '2px' }}>
                    {(asset.size / (1024 * 1024)).toFixed(1)} MB
                  </div>
                </div>
              );
            })}

            {assets.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', opacity: 0.5, fontSize: '12px' }}>
                No assets imported yet. Click "Import Media File" above!
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Selected Asset Metadata Inspector */}
        <MetadataInspector asset={selectedAsset} />
      </div>
    </div>
  );
};
export { MetadataInspector };
