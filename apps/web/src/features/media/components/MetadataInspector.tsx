import React from 'react';
import { MediaAsset } from '../types';

interface MetadataInspectorProps {
  asset: MediaAsset | null;
}

export const MetadataInspector: React.FC<MetadataInspectorProps> = ({ asset }) => {
  if (!asset) {
    return (
      <div style={{ backgroundColor: '#102031', padding: '16px', borderRadius: '6px', fontSize: '12px', opacity: 0.5 }}>
        Select a media asset to inspect detailed metadata properties.
      </div>
    );
  }

  const meta = asset.metadata;

  return (
    <div style={{ backgroundColor: '#102031', padding: '16px', borderRadius: '6px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ margin: 0, fontSize: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>Asset Inspector</h3>

      <div>
        <div style={{ fontWeight: 'bold', color: '#b2bac2', marginBottom: '2px' }}>Filename</div>
        <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>{asset.filename}</div>
      </div>

      <div>
        <div style={{ fontWeight: 'bold', color: '#b2bac2', marginBottom: '2px' }}>Filepath</div>
        <div style={{ wordBreak: 'break-all', opacity: 0.8 }}>{asset.filepath}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <span style={{ fontWeight: 'bold', color: '#b2bac2' }}>Format:</span>{' '}
          <span style={{ textTransform: 'uppercase' }}>{asset.type}</span>
        </div>
        <div>
          <span style={{ fontWeight: 'bold', color: '#b2bac2' }}>Codec:</span>{' '}
          <span>{meta.codec || 'N/A'}</span>
        </div>
        {meta.resolution && (
          <div>
            <span style={{ fontWeight: 'bold', color: '#b2bac2' }}>Resolution:</span>{' '}
            <span>{meta.resolution.width}x{meta.resolution.height}</span>
          </div>
        )}
        {meta.duration !== undefined && (
          <div>
            <span style={{ fontWeight: 'bold', color: '#b2bac2' }}>Duration:</span>{' '}
            <span>{meta.duration.toFixed(1)}s</span>
          </div>
        )}
        {meta.fps && (
          <div>
            <span style={{ fontWeight: 'bold', color: '#b2bac2' }}>FPS:</span>{' '}
            <span>{meta.fps}</span>
          </div>
        )}
        {meta.bitrate && (
          <div>
            <span style={{ fontWeight: 'bold', color: '#b2bac2' }}>Bitrate:</span>{' '}
            <span>{meta.bitrate} kbps</span>
          </div>
        )}
      </div>

      {/* Proxy status */}
      <div>
        <div style={{ fontWeight: 'bold', color: '#b2bac2', marginBottom: '4px' }}>Proxy Status</div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ padding: '2px 6px', backgroundColor: asset.proxy?.low?.status === 'completed' ? '#10b981' : '#ef5350', borderRadius: '3px', fontWeight: 'bold', fontSize: '9px' }}>
            LOW {asset.proxy?.low?.status === 'completed' ? 'READY' : 'PENDING'}
          </span>
          <span style={{ fontSize: '10px', opacity: 0.7 }}>
            {asset.proxy?.low ? `${(asset.proxy.low.size / (1024 * 1024)).toFixed(1)} MB` : ''}
          </span>
        </div>
      </div>

      {/* Embedded creator metadata headers */}
      {meta.embeddedMetadata && (
        <div>
          <div style={{ fontWeight: 'bold', color: '#b2bac2', marginBottom: '4px' }}>Embedded Metadata</div>
          <pre style={{ margin: 0, padding: '6px', backgroundColor: '#0a1929', borderRadius: '4px', fontSize: '10px', overflowX: 'auto' }}>
            {JSON.stringify(meta.embeddedMetadata, null, 2)}
          </pre>
        </div>
      )}

      {/* Precomputed Audio Waveformpeaks */}
      {asset.waveform && (
        <div>
          <div style={{ fontWeight: 'bold', color: '#b2bac2', marginBottom: '6px' }}>Waveform peak amplitudes</div>
          <div style={{ display: 'flex', gap: '1px', height: '36px', alignItems: 'flex-end', backgroundColor: '#0a1929', padding: '4px', borderRadius: '4px' }}>
            {asset.waveform.peaks.slice(0, 50).map((peak, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: `${peak * 100}%`,
                  backgroundColor: '#3b82f6',
                  borderRadius: '1px',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default MetadataInspector;
