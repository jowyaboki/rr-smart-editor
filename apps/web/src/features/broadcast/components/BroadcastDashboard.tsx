import React, { useEffect } from 'react';
import { useBroadcastStore } from '../store/broadcastStore';
import { LiveSwitcher } from './LiveSwitcher';
import { OverlayManager } from './OverlayManager';
import { ReplayPanel } from './ReplayPanel';
import { StreamConfig } from './StreamConfig';
import { MonitoringPanel } from './MonitoringPanel';

export const BroadcastDashboard: React.FC = () => {
  const { initBroadcastStore } = useBroadcastStore();

  useEffect(() => {
    initBroadcastStore();
  }, [initBroadcastStore]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '50px 1fr',
        height: '100vh',
        backgroundColor: '#0c0c0e',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* GLOBAL STUDIO CONTROL TOP BAR */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          backgroundColor: '#111115',
          borderBottom: '1px solid #1f1f23',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 700,
              margin: 0,
              color: '#f8fafc',
              letterSpacing: '0.5px',
            }}
          >
            📡 Broadcast Studio Pro
          </h2>
          <span
            style={{
              fontSize: '10px',
              backgroundColor: '#3b82f620',
              color: '#3b82f6',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            v2.4 Live Production Active
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#10b981',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'inline-block',
                animation: 'pulse 1s infinite',
              }}
            />
            <strong>STUDIO CORE ONLINE</strong>
          </div>
        </div>
      </header>

      {/* DASHBOARD PANELS HUB */}
      <main
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          padding: '16px',
          gap: '16px',
          overflowY: 'auto',
        }}
      >
        {/* LEFT COLUMN - SWITCHER, FEED, OVERLAYS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <LiveSwitcher />
          <OverlayManager />
        </div>

        {/* RIGHT COLUMN - OUTPUT, REPLAY, TELEMETRY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <StreamConfig />
          <ReplayPanel />
          <MonitoringPanel />
        </div>
      </main>
    </div>
  );
};
