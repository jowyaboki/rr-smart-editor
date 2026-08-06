import React from 'react';
import { useMotionComposerStore } from '../store/motionComposerStore';

export const ShapeControls: React.FC = () => {
  const { activeComp, selectedLayerId, addLayer } = useMotionComposerStore();

  if (!activeComp) return null;

  const selectedLayer = activeComp.layers.find(l => l.id === selectedLayerId);

  if (!selectedLayer || selectedLayer.type !== 'shape') {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: '#71717a' }}>
        <p style={{ fontSize: '13px' }}>⚠️ No Shape Layer Selected</p>
        <p style={{ fontSize: '11px', marginTop: '4px' }}>Please select or create a shape layer to adjust vector properties, borders, and rounded corners.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'sans-serif' }}>
      <div>
        <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', fontWeight: 600, color: '#f8fafc' }}>
          📐 Vector Shape Layer Settings
        </h3>
        <p style={{ fontSize: '11px', color: '#71717a', margin: '0 0 16px 0' }}>
          Adjust geometric attributes, canvas coordinates, fill gradients, and canvas anchor overrides.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>Shape Type</label>
          <select
            value={selectedLayer.shapeType || 'rectangle'}
            onChange={(e) => {
              selectedLayer.shapeType = e.target.value as any;
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
          >
            <option value="rectangle">Rectangle</option>
            <option value="ellipse">Ellipse</option>
            <option value="polygon">Polygon</option>
            <option value="path">Custom Path Bezier</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>Fill Color</label>
          <input
            type="color"
            value={selectedLayer.shapeProperties?.fillColor || '#FF3366'}
            onChange={(e) => {
              selectedLayer.shapeProperties = {
                ...selectedLayer.shapeProperties,
                fillColor: e.target.value,
              };
              useMotionComposerStore.setState({ activeComp: { ...activeComp, layers: [...activeComp.layers] } });
            }}
            style={{
              width: '100%',
              height: '32px',
              marginTop: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>Stroke Color</label>
          <input
            type="color"
            value={selectedLayer.shapeProperties?.strokeColor || '#FFFFFF'}
            onChange={(e) => {
              selectedLayer.shapeProperties = {
                ...selectedLayer.shapeProperties,
                strokeColor: e.target.value,
              };
              useMotionComposerStore.setState({ activeComp: { ...activeComp, layers: [...activeComp.layers] } });
            }}
            style={{
              width: '100%',
              height: '32px',
              marginTop: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>Stroke Width</label>
          <input
            type="number"
            value={selectedLayer.shapeProperties?.strokeWidth || 4}
            onChange={(e) => {
              selectedLayer.shapeProperties = {
                ...selectedLayer.shapeProperties,
                strokeWidth: parseFloat(e.target.value) || 0,
              };
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

      <div>
        <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>Corner Radius</label>
        <input
          type="range"
          min="0"
          max="100"
          value={selectedLayer.shapeProperties?.cornerRadius || 8}
          onChange={(e) => {
            selectedLayer.shapeProperties = {
              ...selectedLayer.shapeProperties,
              cornerRadius: parseInt(e.target.value) || 0,
            };
            useMotionComposerStore.setState({ activeComp: { ...activeComp, layers: [...activeComp.layers] } });
          }}
          style={{
            width: '100%',
            marginTop: '8px',
            cursor: 'pointer',
          }}
        />
      </div>

      <div style={{ borderTop: '1px solid #27272a', paddingTop: '16px' }}>
        <h4 style={{ fontSize: '12px', margin: '0 0 12px 0', fontWeight: 600, color: '#f8fafc' }}>
          📍 3D Spatial Transforms
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>Position X</label>
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
            <label style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>Position Y</label>
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
        </div>
      </div>
    </div>
  );
};
