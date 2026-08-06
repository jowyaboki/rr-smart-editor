import React from 'react';
import { useCollaboration } from '../hooks/useCollaboration';

export const CollaborativeSessionHeader: React.FC = () => {
  const { sessionId, participants, isConnected, toggleConnectionState } = useCollaboration();

  if (!sessionId) return null;

  return (
    <div style={{ padding: '8px 12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Session: {sessionId.toUpperCase()}</span>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? '#4caf50' : '#f44336' }} />
        <span style={{ fontSize: '10px', color: '#888' }}>{isConnected ? 'Online' : 'Offline Mode'}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Avatars */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {participants.map((p) => (
            <div
              key={p.id}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: p.color,
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #333',
              }}
              title={`${p.name} (${p.role})`}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>

        <button
          onClick={() => toggleConnectionState(!isConnected)}
          style={{ padding: '4px 8px', fontSize: '10px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '2px', cursor: 'pointer' }}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
};
export default CollaborativeSessionHeader;
