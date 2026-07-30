import React, { useEffect } from 'react';
import { usePlatform } from '../hooks/usePlatform';

// ==========================================
// REUSABLE SUB-WIDGET COMPONENT
// ==========================================

export const ModuleHeartbeatCard: React.FC<{
  module: any;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ module, isSelected, onSelect }) => {
  const getLifecycleColor = (state: string) => {
    switch (state) {
      case 'Running':
        return '#4caf50';
      case 'Initialized':
        return '#2196f3';
      case 'Suspended':
        return '#ff9800';
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
        padding: '12px',
        cursor: 'pointer',
        color: '#fff',
        transition: 'all 0.2s',
        marginBottom: '6px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '12px' }}>{module.name}</strong>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 'bold',
            color: getLifecycleColor(module.state),
            textTransform: 'uppercase',
          }}
        >
          ● {module.state}
        </span>
      </div>
      <div style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#aaa' }}>
        Dependencies: {module.dependencies.length > 0 ? module.dependencies.join(', ') : 'None'}
      </div>
    </div>
  );
};

// ==========================================
// MAIN KERNEL DASHBOARD COMPONENT
// ==========================================

export const PlatformDashboard: React.FC = () => {
  const {
    modules,
    services,
    healthStatus,
    timelineEvents,
    systemLogs,
    selectedModuleId,
    activePanel,
    isLoading,
    initStore,
    selectModule,
    setActivePanel,
    triggerHotRestart,
  } = usePlatform();

  useEffect(() => {
    initStore();
  }, [initStore]);

  const activeModule = modules.find((m) => m.id === selectedModuleId);

  const handleHotRestart = async () => {
    await triggerHotRestart();
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
          <span style={{ fontSize: '24px' }}>🧬</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
              UNIFIED PLATFORM KERNEL RUNTIME CONSOLE
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
              Central bootstrapping, DI discovery, topological dependency graph, and diagnostics timeline
            </p>
          </div>
        </div>

        {/* TOP STATUS GAUGES */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: '#252526', padding: '6px 12px', borderRadius: '4px', border: '1px solid #333' }}>
            <span style={{ fontSize: '10px', color: '#888', display: 'block', textTransform: 'uppercase' }}>Modules Loaded</span>
            <strong style={{ color: '#2196f3', fontSize: '14px' }}>{modules.length} Active</strong>
          </div>
          <div style={{ background: '#252526', padding: '6px 12px', borderRadius: '4px', border: '1px solid #333' }}>
            <span style={{ fontSize: '10px', color: '#888', display: 'block', textTransform: 'uppercase' }}>Heartbeat Status</span>
            <strong style={{ color: '#4caf50', fontSize: '14px' }}>HEALTHY</strong>
          </div>
        </div>
      </div>

      {/* THREE PANEL GRID LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 340px', overflow: 'hidden' }}>
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
          {/* PLATFORM MODULES HEARTBEAT */}
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🧬 Platform Modules
            </h3>
            {modules.map((m) => (
              <ModuleHeartbeatCard
                key={m.id}
                module={m}
                isSelected={selectedModuleId === m.id}
                onSelect={() => selectModule(m.id)}
              />
            ))}
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={handleHotRestart}
            style={{
              background: '#e91e63',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginTop: 'auto',
            }}
          >
            Trigger Hot Restart
          </button>

          {/* NAVIGATION */}
          <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#aaa', textTransform: 'uppercase' }}>Navigation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(['modules', 'services', 'health', 'diagnostics'] as const).map((p) => (
                <div
                  key={p}
                  onClick={() => setActivePanel(p)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textTransform: 'capitalize',
                    background: activePanel === p ? '#252526' : 'transparent',
                    color: activePanel === p ? '#fff' : '#aaa',
                  }}
                >
                  🧬 {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER PANEL: DEPENDENCY GRAPHS & TIMELINES */}
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
          {/* PANEL CONTROLS HEADER */}
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
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Active View Workspace:</span>
            <select
              value={activePanel}
              onChange={(e) => setActivePanel(e.target.value as any)}
              style={{
                background: '#252526',
                border: '1px solid #3d3d3d',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '12px',
              }}
            >
              <option value="modules">Module Graph & Lifecycles</option>
              <option value="services">DI Service Registries</option>
              <option value="health">Telemetry Health Monitor</option>
              <option value="diagnostics">Diagnostics Timelines</option>
            </select>
          </div>

          {/* ACTIVE PANEL RENDERS */}
          {activePanel === 'modules' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff', textTransform: 'uppercase' }}>
                Module Graph Topological Startup Timeline
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {modules.map((m) => (
                  <div key={m.id} style={{ background: '#1c1c1c', border: '1px solid #333', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#fff' }}>
                      <span>{m.name}</span>
                      <code style={{ fontSize: '11px', color: '#2196f3' }}>v{m.version}</code>
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>
                      <div>State: <strong style={{ color: '#4caf50' }}>{m.state}</strong></div>
                      <div>Dependencies: {m.dependencies.join(', ') || 'None'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePanel === 'services' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff', textTransform: 'uppercase' }}>
                DI Services Registries Discoverability
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {services.map((s) => (
                  <div key={s.id} style={{ background: '#1c1c1c', border: '1px solid #333', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{s.interfaceName}</div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>
                      <div>Impl Class: <code>{s.implementationClass}</code></div>
                      <div>Singleton: {s.isSingleton ? 'YES' : 'NO'} | Scope: {s.scope}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePanel === 'health' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff', textTransform: 'uppercase' }}>
                Real-time Health Monitor Telemetry
              </h2>
              {healthStatus && (
                <div style={{ background: '#1c1c1c', border: '1px solid #333', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ background: '#252526', padding: '12px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#888' }}>MEMORY HEAP</span>
                      <strong style={{ fontSize: '16px', color: '#2196f3', display: 'block', marginTop: '4px' }}>
                        {(healthStatus.memoryUsageBytes / (1024 * 1024)).toFixed(1)} MB
                      </strong>
                    </div>
                    <div style={{ background: '#252526', padding: '12px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#888' }}>ERRORS</span>
                      <strong style={{ fontSize: '16px', color: '#f44336', display: 'block', marginTop: '4px' }}>
                        {healthStatus.errorsCount}
                      </strong>
                    </div>
                    <div style={{ background: '#252526', padding: '12px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#888' }}>WARNINGS</span>
                      <strong style={{ fontSize: '16px', color: '#ff9800', display: 'block', marginTop: '4px' }}>
                        {healthStatus.warningsCount}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activePanel === 'diagnostics' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#fff', textTransform: 'uppercase' }}>
                Diagnostics Timeline Events Profiling
              </h2>
              <div style={{ background: '#1c1c1c', border: '1px solid #333', padding: '16px', borderRadius: '8px' }}>
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', padding: '8px 0', fontSize: '12px' }}>
                    <span>{evt.task}</span>
                    <strong style={{ color: '#00e5ff' }}>{evt.durationMs}ms</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: INSPECTOR */}
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
          <h3 style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#aaa', textTransform: 'uppercase' }}>Subsystem Inspector</h3>

          {activeModule ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#252526', padding: '12px', borderRadius: '6px', border: '1px solid #333' }}>
                <div style={{ fontSize: '10px', color: '#aaa' }}>Module ID</div>
                <code>{activeModule.id}</code>
                <h4 style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#fff' }}>{activeModule.name}</h4>
              </div>

              {/* SERVICE CONVERSIONS */}
              <div style={{ background: '#252526', padding: '12px', borderRadius: '6px', border: '1px solid #333' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#2196f3', textTransform: 'uppercase' }}>
                  🔑 Module Capabilities Manifests
                </h4>
                {activeModule.capabilities.length > 0 ? (
                  activeModule.capabilities.map((cap: string) => (
                    <div key={cap} style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px' }}>
                      ✓ {cap}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '11px', color: '#888' }}>No capabilities registered explicitly.</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px 10px', textAlign: 'center', color: '#666', border: '1px dashed #333', borderRadius: '6px' }}>
              Select a platform module from left sidebar keyring to inspect registered capabilities, states and DI dependencies.
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CONSOLE & LOGS */}
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
          <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>
            🛰️ Platform Kernel System Logs
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
              color: '#39ff14',
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

        {/* HEAL RATE TELEMETRY */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>
            Diagnostics Health Score Gages
          </h4>
          <div
            style={{
              background: '#1e1e1e',
              border: '1px solid #2d2d2d',
              borderRadius: '6px',
              padding: '10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>100% Core Normal</div>
            <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
              All 8 registered platform engines Running safely
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboard;
