import React from 'react';

interface ReferenceBrowserProps {
  onInsert: (value: string) => void;
}

export const ReferenceBrowser: React.FC<ReferenceBrowserProps> = ({ onInsert }) => {
  const references = [
    { name: 'time', desc: 'Current time in seconds (number)' },
    { name: 'frame', desc: 'Current frame index (number)' },
    { name: 'fps', desc: 'Frames per second (number)' },
    { name: 'duration', desc: 'Total composition duration in seconds' },
    { name: 'project.name', desc: 'Active project name (string)' },
    { name: 'scene.name', desc: 'Active scene name (string)' },
    { name: 'composition.width', desc: 'Composition width in pixels' },
    { name: 'composition.height', desc: 'Composition height in pixels' },
    { name: 'layer.opacity', desc: 'Layer opacity value' },
    { name: 'layer.rotation', desc: 'Layer rotation angle in degrees' },
    { name: 'layer.scale', desc: 'Layer scale percent value' },
    { name: 'mouse', desc: 'Future mouse interactions (object)' },
  ];

  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '6px',
        padding: '12px',
        color: '#ccc',
      }}
    >
      <h3
        style={{
          margin: '0 0 10px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#fff',
          borderBottom: '1px solid #333',
          paddingBottom: '6px',
        }}
      >
        Reference Browser
      </h3>
      <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#888' }}>
        Double-click an item below to insert it at your cursor:
      </p>
      <div
        style={{
          maxHeight: '220px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {references.map((ref) => (
          <div
            key={ref.name}
            onDoubleClick={() => onInsert(ref.name)}
            style={{
              padding: '6px 8px',
              backgroundColor: '#242424',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2a2a2a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#242424';
            }}
          >
            <strong style={{ color: '#00bcd4', fontFamily: 'monospace' }}>{ref.name}</strong>
            <div style={{ color: '#888', fontSize: '11px', marginTop: '2px' }}>{ref.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
