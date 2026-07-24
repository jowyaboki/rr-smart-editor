import React, { useState } from 'react';

interface DevToolsDashboardProps {
  initialPanel?: string;
}

export const DevToolsDashboard: React.FC<DevToolsDashboardProps> = ({ initialPanel = 'plugins' }) => {
  const [activeTab, setTab] = useState<string>(initialPanel);
  const [breakpoints, setBreakpoints] = useState<string[]>(['st_2_cycle_detect_on', 'expr_pollute_block']);
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] DevTools dashboard bootstrapped.',
    '[PLUGIN] SmartCaption loaded successfully.',
    '[EXPRESSION] Safeguard checked. Expression "this.__proto__" flagged and blocked.',
    '[RENDER] frame 45 sharded to node_beta.',
  ]);

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'plugins':
        return (
          <div>
            <h4 style={{ color: '#2196f3', margin: '0 0 10px 0' }}>🔌 Plugin Inspector</h4>
            <p style={{ fontSize: '13px', color: '#ccc' }}>Inspect active registration lifecycle states and permission scopes for mock plugins.</p>
            <div style={{ background: '#151515', padding: '12px', borderRadius: '4px', border: '1px solid #333' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#4caf50' }}>SmartCaptionPlugin (Active)</div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Permissions: [filesystem_read, ai_assistant]</div>
            </div>
          </div>
        );
      case 'workflows':
        return (
          <div>
            <h4 style={{ color: '#ff9800', margin: '0 0 10px 0' }}>⚙️ Workflow Debugger</h4>
            <p style={{ fontSize: '13px', color: '#ccc' }}>Trace automatic execution flows, pause on node errors, or inspect variables state.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {breakpoints.map((bp, i) => (
                <div key={i} style={{ fontSize: '12px', background: '#2d1e15', color: '#ff9800', padding: '6px 10px', borderRadius: '3px', borderLeft: '3px solid #ff9800' }}>
                  🛑 Breakpoint Active: {bp}
                </div>
              ))}
            </div>
          </div>
        );
      case 'agents':
        return (
          <div>
            <h4 style={{ color: '#9c27b0', margin: '0 0 10px 0' }}>🧠 AI Agent Debugger</h4>
            <p style={{ fontSize: '13px', color: '#ccc' }}>Inspect LLM system prompts, token usage, and local Ollama/Whisper endpoints.</p>
            <div style={{ background: '#252526', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
              <div>Active Model: <strong>llama3 (Ollama)</strong></div>
              <div style={{ color: '#aaa', marginTop: '4px' }}>Endpoint: http://localhost:11434</div>
            </div>
          </div>
        );
      case 'render':
        return (
          <div>
            <h4 style={{ color: '#e91e63', margin: '0 0 10px 0' }}>🖥️ Cluster Render Debugger</h4>
            <p style={{ fontSize: '13px', color: '#ccc' }}>Real-time telemetry of parallel frame chunks, GPU decodes, and node health.</p>
            <div style={{ background: '#252526', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
              <div>Throughput: <strong>144 FPS</strong></div>
              <div style={{ color: '#4caf50', marginTop: '4px' }}>GPU: NVIDIA RTX 4090 (CUDA Active)</div>
            </div>
          </div>
        );
      case 'timeline':
        return (
          <div>
            <h4 style={{ color: '#4caf50', margin: '0 0 10px 0' }}>🎞️ Timeline Debugger</h4>
            <p style={{ fontSize: '13px', color: '#ccc' }}>Inspect clip movement delta offsets, snapping coordinates, and virtual geometry caches.</p>
            <div style={{ background: '#252526', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
              <div>Grid Snapping: <strong>8 frames (Enabled)</strong></div>
            </div>
          </div>
        );
      case 'expressions':
        return (
          <div>
            <h4 style={{ color: '#00bcd4', margin: '0 0 10px 0' }}>🧪 Safe Expression Debugger</h4>
            <p style={{ fontSize: '13px', color: '#ccc' }}>Inspect parsed AST tree logs, resolve dependency graphs, and evaluate prototype pollution guards.</p>
            <div style={{ background: '#151515', padding: '10px', borderRadius: '4px', border: '1px solid #f44336', fontSize: '12px', color: '#f44336' }}>
              🚨 Prototype pollution blocked for expression payload: "this.__proto__.polluted = true"
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', borderBottom: '1px solid #333', paddingBottom: '10px', color: '#4caf50' }}>
        🛠️ RR Smart Editor Developer DevTools
      </h3>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #2d2d2d', paddingBottom: '10px', marginBottom: '16px', overflowX: 'auto' }}>
        {['plugins', 'workflows', 'agents', 'render', 'timeline', 'expressions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            style={{
              background: activeTab === tab ? '#2196f3' : '#252526',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
        {/* Active Panel View */}
        <div style={{ background: '#252526', padding: '16px', borderRadius: '6px', border: '1px solid #333' }}>
          {renderActivePanel()}
        </div>

        {/* Live log stream console */}
        <div style={{ background: '#151515', padding: '16px', borderRadius: '6px', border: '1px solid #333' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Live Log Stream</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', color: '#85e89d' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ wordBreak: 'break-all' }}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
