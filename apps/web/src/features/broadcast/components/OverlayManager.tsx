import React, { useState } from 'react';
import { useBroadcastStore } from '../store/broadcastStore';

export const OverlayManager: React.FC = () => {
  const {
    overlays,
    triggerBreakingNews,
    triggerScoreboard,
    removeOverlay,
    toggleOverlayVisibility,
  } = useBroadcastStore();

  const [newsHeadline, setNewsHeadline] = useState('');
  const [homeTeam, setHomeTeam] = useState('GOLD');
  const [awayTeam, setAwayTeam] = useState('BLUE');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      backgroundColor: '#16161a',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #27272a',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
        📺 Live Overlay & Graphics Studio
      </h3>

      {/* QUICK INJECTION MODULES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* BREAKING NEWS GENERATOR */}
        <div style={{ backgroundColor: '#1e1e24', padding: '12px', borderRadius: '6px', border: '1px solid #27272a' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fca5a5', display: 'block', marginBottom: '8px' }}>
            🚨 Breaking News Ticker
          </span>
          <input
            type="text"
            placeholder="E.g. CHAMPIONSHIP DECLARED..."
            value={newsHeadline}
            onChange={(e) => setNewsHeadline(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              backgroundColor: '#16161a',
              border: '1px solid #27272a',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => {
              if (!newsHeadline) return;
              triggerBreakingNews(newsHeadline, 'Live reporter on scene');
              setNewsHeadline('');
            }}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '6px',
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Push Breaking News Live
          </button>
        </div>

        {/* SCOREBOARD CONFIGURATOR */}
        <div style={{ backgroundColor: '#1e1e24', padding: '12px', borderRadius: '6px', border: '1px solid #27272a' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#93c5fd', display: 'block', marginBottom: '8px' }}>
            🏀 Sports Scoreboard
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <input
              type="text"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              style={{ padding: '4px 6px', backgroundColor: '#16161a', border: '1px solid #27272a', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
            />
            <input
              type="text"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              style={{ padding: '4px 6px', backgroundColor: '#16161a', border: '1px solid #27272a', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
            />
          </div>
          <button
            onClick={() => {
              triggerScoreboard(homeTeam, awayTeam, 0, 0);
            }}
            style={{
              width: '100%',
              padding: '6px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Inject Scoreboard Widget
          </button>
        </div>
      </div>

      {/* ACTIVE GRAPHICS QUEUE */}
      <div>
        <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          Active Overlays Stack ({overlays.length}):
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {overlays.map((ov) => (
            <div
              key={ov.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#1e1e24',
                padding: '10px 14px',
                borderRadius: '6px',
                borderLeft: `4px solid ${ov.isVisible ? '#22c55e' : '#a1a1aa'}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{ov.name}</span>
                  <span style={{ fontSize: '9px', backgroundColor: '#27272a', padding: '2px 6px', borderRadius: '4px', color: '#71717a' }}>
                    {ov.type}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#71717a' }}>
                  Pos: {ov.position.x}, {ov.position.y} | Opacity: {ov.opacity}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => toggleOverlayVisibility(ov.id)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: ov.isVisible ? '#22c55e20' : '#27272a',
                    color: ov.isVisible ? '#22c55e' : '#a1a1aa',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {ov.isVisible ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => removeOverlay(ov.id)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#ef444420',
                    color: '#ef4444',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
