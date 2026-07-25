import React from 'react';
import { useMotionComposerStore } from '../store/motionComposerStore';

export const CameraControls: React.FC = () => {
  const { activeComp, selectedLayerId } = useMotionComposerStore();

  if (!activeComp) return null;

  const selectedLayer = activeComp.layers.find(l => l.id === selectedLayerId);

  if (!selectedLayer || selectedLayer.type !== 'camera') {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: '#71717a' }}>
        <p style={{ fontSize: '13px' }}>🎥 No Camera Layer Selected</p>
        <p style={{ fontSize: '11px', marginTop: '4px' }}>Please select or create a camera layer to adjust focal lengths, apertures, focus distances, and depth of field parameters.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'sans-serif' }}>
      <div>
        <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', fontWeight: 600, color: '#f8fafc' }}>
          📹 Cinematic 3D Camera Settings
        </h3>
        <p style={{ fontSize: '11px', color: '#71717a', margin: '0 0 16px 0' }}>
          Configure lens profiles, field of view, focal depth parameters, and render apertures.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>Focal Length (mm)</label>
          <input
            type="number"
            value={selectedLayer.focalLength || 50}
            onChange={(e) => {
              selectedLayer.focalLength = parseFloat(e.target.value) || 50;
              useMotionComposerStore.setState({ activeComp: { ...activeComp, layers: [...activeComp.layers] } });
            }}
            style={{
              width: '100%',
              marginTop: '4px',
              backgroundColor: '#1e1e24',
              border: '1px solid #27272a',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '6px 8px',
              fontSize: '12px',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>Aperture (f-stop)</label>
          <input
            type="number"
            step="0.1"
            value={selectedLayer.aperture || 2.8}
            onChange={(e) => {
              selectedLayer.aperture = parseFloat(e.target.value) || 2.8;
              useMotionComposerStore.setState({ activeComp: { ...activeComp, layers: [...activeComp.layers] } });
            }}
            style={{
              width: '100%',
              marginTop: '4px',
              backgroundColor: '#1e1e24',
              border: '1px solid #27272a',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '6px 8px',
              fontSize: '12px',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>Focus Distance (px)</label>
          <input
            type="number"
            value={selectedLayer.focusDistance || 1000}
            onChange={(e) => {
              selectedLayer.focusDistance = parseFloat(e.target.value) || 1000;
              useMotionComposerStore.setState({ activeComp: { ...activeComp, layers: [...activeComp.layers] } });
            }}
            style={{
              width: '100%',
              marginTop: '4px',
              backgroundColor: '#1e1e24',
              border: '1px solid #27272a',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '6px 8px',
              fontSize: '12px',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>Depth of Field</label>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={selectedLayer.depthOfField !== false}
              onChange={(e) => {
                selectedLayer.depthOfField = e.target.checked;
                useMotionComposerStore.setState({ activeComp: { ...activeComp, layers: [...activeComp.layers] } });
              }}
              style={{
                cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: '12px', color: '#e2e8f0' }}>Enabled</span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #27272a', paddingTop: '16px' }}>
        <h4 style={{ fontSize: '12px', margin: '0 0 12px 0', fontWeight: 600, color: '#f8fafc' }}>
          📍 Camera Viewport Offset Coordinates
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#a1a1aa' }}>Camera X</label>
            <input
              type="number"
              value={selectedLayer.transform.position[0]}
              onChange={(e) => {
                selectedLayer.transform.position[0] = parseFloat(e.target.value) || 0;
                useMotionComposerStore.setState({ activeComp: { ...activeComp, layers: [...activeComp.layers] } });
              }}
              style={{
                width: '100%',
                marginTop: '4px',
                backgroundColor: '#1e1e24',
                border: '1px solid #27272a',
                borderRadius: '6px',
                color: '#f8fafc',
                padding: '6px 8px',
                fontSize: '12px',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#a1a1aa' }}>Camera Y</label>
            <input
              type="number"
              value={selectedLayer.transform.position[1]}
              onChange={(e) => {
                selectedLayer.transform.position[1] = parseFloat(e.target.value) || 0;
                useMotionComposerStore.setState({ activeComp: { ...activeComp, layers: [...activeComp.layers] } });
              }}
              style={{
                width: '100%',
                marginTop: '4px',
                backgroundColor: '#1e1e24',
                border: '1px solid #27272a',
                borderRadius: '6px',
                color: '#f8fafc',
                padding: '6px 8px',
                fontSize: '12px',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#a1a1aa' }}>Camera Z</label>
            <input
              type="number"
              value={selectedLayer.transform.position[2]}
              onChange={(e) => {
                selectedLayer.transform.position[2] = parseFloat(e.target.value) || 0;
                useMotionComposerStore.setState({ activeComp: { ...activeComp, layers: [...activeComp.layers] } });
              }}
              style={{
                width: '100%',
                marginTop: '4px',
                backgroundColor: '#1e1e24',
                border: '1px solid #27272a',
                borderRadius: '6px',
                color: '#f8fafc',
                padding: '6px 8px',
                fontSize: '12px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
