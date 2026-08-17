import React, { useState } from 'react';
import { useAIExecution } from '../hooks/useAIExecution';
import { NodeExecutionStatus } from '@ai-video-editor/ai-copilot';

export const ExecutionWorkspace: React.FC = () => {
  const {
    activeContext,
    activeGraph,
    events,
    checkpoints,
    analytics,
    isExecuting,
    pauseExecution,
    resumeExecution,
    cancelExecution,
    restoreCheckpoint,
    resolveApproval
  } = useAIExecution();

  const [activeTab, setActiveTab] = useState<'graph' | 'artifacts' | 'checkpoints' | 'logs' | 'analytics'>('graph');
  const [approverName, setApproverName] = useState('Creative Director');
  const [feedbackText, setFeedbackText] = useState('');

  const getStatusColor = (status?: NodeExecutionStatus | string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
      case 'running': return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40 animate-pulse';
      case 'waiting_for_approval': return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
      case 'failed': return 'text-rose-400 bg-rose-950/60 border-rose-500/40';
      case 'paused': return 'text-amber-300 bg-amber-950/40 border-amber-500/30';
      case 'skipped': return 'text-slate-400 bg-slate-900/40 border-slate-700/30';
      default: return 'text-slate-300 bg-slate-900/60 border-slate-700/40';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050b14] text-slate-100 font-sans border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0d1527] border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 rounded-lg border border-cyan-500/30">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-wide text-white flex items-center gap-2">
              Autonomous Creative Execution Runtime
              <span className={`text-xs px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-mono ${getStatusColor(activeContext?.status || 'pending')}`}>
                {activeContext?.status || 'IDLE'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Execution ID: <span className="font-mono text-cyan-400">{activeContext?.executionId || 'N/A'}</span> | Workflow: <span className="text-slate-300">{activeContext?.workflowId || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Runtime Control Buttons */}
        <div className="flex items-center space-x-3">
          {activeContext?.status === 'running' && (
            <button
              onClick={pauseExecution}
              className="px-4 py-2 text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-md transition-all flex items-center gap-1.5"
            >
              ⏸ Pause Runtime
            </button>
          )}

          {activeContext?.status === 'paused' && (
            <button
              onClick={() => resumeExecution()}
              className="px-4 py-2 text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-md transition-all flex items-center gap-1.5"
            >
              ▶ Resume Runtime
            </button>
          )}

          {(isExecuting || activeContext?.status === 'running' || activeContext?.status === 'paused') && (
            <button
              onClick={() => cancelExecution('User requested cancellation')}
              className="px-4 py-2 text-xs font-medium bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-md transition-all flex items-center gap-1.5"
            >
              ⏹ Cancel Execution
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Navigation Tabs */}
      <div className="flex items-center px-6 bg-[#09101f] border-b border-slate-800 space-x-1">
        {[
          { id: 'graph', label: '⚡ Node Dependency Graph' },
          { id: 'artifacts', label: '📁 Active Artifacts' },
          { id: 'checkpoints', label: '💾 Checkpoint Recovery' },
          { id: 'logs', label: '📜 Live Events Log' },
          { id: 'analytics', label: '📊 Runtime Analytics' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workspace Panel Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#050b14]">
        {activeTab === 'graph' && (
          <div className="space-y-6">
            {/* Approval Gate Alert Box if waiting */}
            {activeContext?.status === 'waiting_for_approval' && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-lg flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-amber-300 font-semibold text-sm">
                  <span>⚠️</span>
                  <span>Human Approval Required</span>
                </div>
                <p className="text-xs text-amber-200/80">
                  An active execution stage requires explicit sign-off from an authorized creative director before proceeding.
                </p>
                <div className="flex items-center space-x-3 pt-2">
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    placeholder="Approver Name"
                    className="px-3 py-1.5 bg-[#0d1527] border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Decision Feedback / Notes"
                    className="flex-1 px-3 py-1.5 bg-[#0d1527] border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => {
                      const waitingNode = Object.values(activeGraph?.nodes || {}).find(n => n.status === 'waiting_for_approval');
                      if (waitingNode) resolveApproval(waitingNode.id, true, approverName, feedbackText);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                  >
                    ✓ Approve Stage
                  </button>
                  <button
                    onClick={() => {
                      const waitingNode = Object.values(activeGraph?.nodes || {}).find(n => n.status === 'waiting_for_approval');
                      if (waitingNode) resolveApproval(waitingNode.id, false, approverName, feedbackText);
                    }}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-medium"
                  >
                    ✕ Reject Stage
                  </button>
                </div>
              </div>
            )}

            {/* Execution Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGraph && Object.values(activeGraph.nodes).map((node) => (
                <div
                  key={node.id}
                  className={`p-4 rounded-lg border bg-[#0d1527] transition-all flex flex-col justify-between space-y-3 ${
                    node.status === 'running' ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">{node.agentRole}</span>
                      <h4 className="text-sm font-semibold text-white mt-0.5">{node.name}</h4>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-mono uppercase ${getStatusColor(node.status)}`}>
                      {node.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Dependencies: {node.dependencies.length > 0 ? node.dependencies.join(', ') : 'None (Root)'}</p>
                    <p>Attempts: <span className="text-slate-200 font-mono">{node.attempts || 0}</span></p>
                    {node.error && <p className="text-rose-400 truncate">Error: {node.error}</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Node ID: {node.id}</span>
                    <span>{activeContext?.metrics.nodeDurationsMs[node.id] ? `${activeContext.metrics.nodeDurationsMs[node.id]}ms` : '-'}</span>
                  </div>
                </div>
              ))}

              {!activeGraph && (
                <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No active execution graph loaded. Start a production workflow to visualize nodes.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'artifacts' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Generated Production Artifacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeContext?.artifacts.map((art) => (
                <div key={art.id} className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded uppercase font-mono">{art.type}</span>
                    <h4 className="text-sm font-semibold text-white mt-1">{art.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{art.uri}</p>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(art.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
              {(!activeContext?.artifacts || activeContext.artifacts.length === 0) && (
                <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No artifacts generated for the current production execution.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'checkpoints' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Persistent Execution Checkpoints</h3>
            <div className="space-y-3">
              {checkpoints.map((cp) => (
                <div key={cp.checkpointId} className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-cyan-300">{cp.checkpointId}</span>
                      <span className="text-xs text-slate-400">• Stage: <strong className="text-slate-200">{cp.stageName}</strong></span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Timestamp: {new Date(cp.timestamp).toLocaleString()} | Artifacts: {cp.artifacts.length}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreCheckpoint(cp.checkpointId)}
                    className="px-3 py-1.5 text-xs bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded transition-all"
                  >
                    ↺ Rollback to Checkpoint
                  </button>
                </div>
              ))}
              {checkpoints.length === 0 && (
                <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  No checkpoints recorded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-3 font-mono text-xs">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider font-sans">Live Event Bus Telemetry</h3>
            <div className="p-4 bg-[#030712] border border-slate-800 rounded-lg max-h-[400px] overflow-y-auto space-y-2">
              {events.map((evt) => (
                <div key={evt.id} className="flex items-start space-x-3 text-slate-300 border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500 text-[10px] whitespace-nowrap">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  <span className="text-cyan-400 font-semibold">{evt.type}</span>
                  {evt.nodeId && <span className="text-amber-300">[Node: {evt.nodeId}]</span>}
                  <span className="text-slate-400 flex-1 truncate">{JSON.stringify(evt.details || {})}</span>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-slate-600 text-center py-6">Listening for execution runtime events...</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Execution Analytics & Efficiency</h3>
            {analytics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg">
                  <span className="text-xs text-slate-400">Total Duration</span>
                  <p className="text-xl font-mono font-semibold text-cyan-400 mt-1">{analytics.totalDurationMs} ms</p>
                </div>
                <div className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg">
                  <span className="text-xs text-slate-400">Scheduler Latency</span>
                  <p className="text-xl font-mono font-semibold text-cyan-400 mt-1">{analytics.schedulerLatencyMs.toFixed(2)} ms</p>
                </div>
                <div className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg">
                  <span className="text-xs text-slate-400">AI Productivity</span>
                  <p className="text-xl font-mono font-semibold text-emerald-400 mt-1">{analytics.aiProductivityScore} %</p>
                </div>
                <div className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg">
                  <span className="text-xs text-slate-400">Checkpoint Score</span>
                  <p className="text-xl font-mono font-semibold text-amber-400 mt-1">{analytics.checkpointEfficiencyScore} / 100</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                No analytics available for current run.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
