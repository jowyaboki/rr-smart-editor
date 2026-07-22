import React from 'react';
import { useWorkflowDebugger } from '../hooks/useWorkflowDebugger';

export const DebuggerConsole: React.FC = () => {
  const { isDebugging, activeStepNodeId, startDebuggingSession, executeStepForward, stopDebugging } = useWorkflowDebugger();

  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Step Debugger Console</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {!isDebugging ? (
            <button
              onClick={startDebuggingSession}
              style={{ padding: '3px 8px', fontSize: '10px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
            >
              Start Debug
            </button>
          ) : (
            <>
              <button
                onClick={executeStepForward}
                style={{ padding: '3px 8px', fontSize: '10px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
              >
                Step Forward ➔
              </button>
              <button
                onClick={stopDebugging}
                style={{ padding: '3px 8px', fontSize: '10px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
              >
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ background: '#000', padding: '8px', height: '80px', overflowY: 'auto', borderRadius: '2px', border: '1px solid #222', fontSize: '10px', fontFamily: 'monospace', color: '#aaa' }}>
        {isDebugging ? (
          <div>
            <span style={{ color: '#ff9800' }}>[PAUSED]</span> Breakpoint hit at node ID: <strong style={{ color: '#fff' }}>{activeStepNodeId}</strong>.
            <div style={{ marginTop: '4px', color: '#888' }}>Click "Step Forward" to execute node and advance.</div>
          </div>
        ) : (
          <div style={{ color: '#444', textAlign: 'center', marginTop: '25px' }}>Debugger idle. Click "Start Debug" to monitor transitions.</div>
        )}
      </div>
    </div>
  );
};
export default DebuggerConsole;
