import React from 'react';
import { useCollaborativeCursors } from '../hooks/useCollaborativeCursors';
import { useCollaboration } from '../hooks/useCollaboration';

export const CollaborativeCursorsCanvas: React.FC = () => {
  const { participants } = useCollaboration();
  const { presences } = useCollaborativeCursors('');

  return (
    <div style={{ position: 'relative', width: '100%', height: '100px', background: '#000', border: '1px solid #222', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '40px', left: '10px', fontSize: '11px', color: '#444' }}>
        Interactive Shared Selection Space
      </div>

      {Object.entries(presences).map(([userId, presence]) => {
        const participant = participants.find(p => p.id === userId);
        const cursor = presence.cursor;
        if (!cursor) return null;

        return (
          <div
            key={userId}
            style={{
              position: 'absolute',
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              transform: 'translate(-2px, -2px)',
            }}
          >
            {/* Pointer SVG icon */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill={participant?.color || '#ff0000'}>
              <path d="M4.5 2.25l15 11.25-6.75 2.25 4.5 5.25-2.25 1.5-4.5-5.25-6 4.5V2.25z" />
            </svg>
            <span
              style={{
                marginLeft: '4px',
                padding: '1px 4px',
                background: participant?.color || '#ff0000',
                color: '#fff',
                fontSize: '8px',
                borderRadius: '2px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              {participant?.name || 'User'}
            </span>
          </div>
        );
      })}
    </div>
  );
};
export default CollaborativeCursorsCanvas;
