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

  const [viewMode, setViewMode] = useState<'creator' | 'advanced'>('creator');
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

  const completedCount = activeGraph ? Object.values(activeGraph.nodes).filter(n => n.status === 'completed').length : 0;
  const totalNodes = activeGraph ? Object.keys(activeGraph.nodes).length : 1;
  const progressPercent = Math.round((completedCount / totalNodes) * 100);

  return (
    <div className="flex flex-col h-full bg-[#050b14] text-slate-100 font-sans border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0d1527] border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 rounded-lg border border-cyan-500/30">
            <span className="text-xl">🎬</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-wide text-white flex items-center gap-2">
              AI Creative Execution Studio
              <span className={`text-xs px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-mono ${getStatusColor(activeContext?.status || 'pending')}`}>
                {activeContext?.status || 'IDLE'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Execution ID: <span className="font-mono text-cyan-400">{activeContext?.executionId || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* View Switcher & Runtime Controls */}
        <div className="flex items-center space-x-3">
          <div className="bg-[#050b14] p-1 border border-slate-800 rounded-lg flex space-x-1 text-xs">
            <button
              onClick={() => setViewMode('creator')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                viewMode === 'creator' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎨 Creator View
            </button>
            <button
              onClick={() => setViewMode('advanced')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                viewMode === 'advanced' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚙️ Technical View
            </button>
          </div>

          {activeContext?.status === 'running' && (
            <button
              onClick={pauseExecution}
              className="px-3.5 py-1.5 text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-md transition-all flex items-center gap-1.5"
            >
              ⏸ Pause
            </button>
          )}

          {activeContext?.status === 'paused' && (
            <button
              onClick={() => resumeExecution()}
              className="px-3.5 py-1.5 text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-md transition-all flex items-center gap-1.5"
            >
              ▶ Resume
            </button>
          )}

          {(isExecuting || activeContext?.status === 'running' || activeContext?.status === 'paused') && (
            <button
              onClick={() => cancelExecution('User requested cancellation')}
              className="px-3.5 py-1.5 text-xs font-medium bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-md transition-all flex items-center gap-1.5"
            >
              ⏹ Cancel
            </button>
          )}
        </div>
      </div>

      {/* Creator Progress Bar Summary */}
      {viewMode === 'creator' && (
        <div className="px-6 py-3 bg-[#09101f] border-b border-slate-800 flex items-center space-x-4">
          <span className="text-xs font-medium text-slate-300">Production Completion</span>
          <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-semibold text-cyan-400">{progressPercent}%</span>
        </div>
      )}

      {/* Technical Navigation Tabs (in advanced mode) */}
      {viewMode === 'advanced' && (
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
      )}

      {/* Workspace Panel Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#050b14]">
        {/* Creator View Mode */}
        {viewMode === 'creator' && (
          <div className="space-y-6">
            {/* Approval Gate Alert Box */}
            {activeContext?.status === 'waiting_for_approval' && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-lg flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-amber-300 font-semibold text-sm">
                  <span>⚠️</span>
                  <span>Creative Sign-off Needed</span>
                </div>
                <p className="text-xs text-amber-200/80">
                  Please review the generated script, storyboard, and timeline spec before launching final packaging.
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
                    placeholder="Approval Feedback / Notes"
                    className="flex-1 px-3 py-1.5 bg-[#0d1527] border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => {
                      const waitingNode = Object.values(activeGraph?.nodes || {}).find(n => n.status === 'waiting_for_approval');
                      if (waitingNode) resolveApproval(waitingNode.id, true, approverName, feedbackText);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                  >
                    ✓ Approve Production
                  </button>
                  <button
                    onClick={() => {
                      const waitingNode = Object.values(activeGraph?.nodes || {}).find(n => n.status === 'waiting_for_approval');
                      if (waitingNode) resolveApproval(waitingNode.id, false, approverName, feedbackText);
                    }}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-medium"
                  >
                    ✕ Request Revision
                  </button>
                </div>
              </div>
            )}

            {/* Stage Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGraph && Object.values(activeGraph.nodes).map((node) => (
                <div
                  key={node.id}
                  className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-white">{node.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-mono ${getStatusColor(node.status)}`}>
                      {node.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Assigned Agent: <span className="text-cyan-300 font-mono">{node.agentRole}</span></p>
                </div>
              ))}
            </div>

            {/* Generated Artifacts Summary */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Generated Production Assets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeContext?.artifacts.map((art) => (
                  <div key={art.id} className="p-3 bg-[#0d1527] border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-cyan-300 uppercase font-mono">{art.type}</span>
                      <h5 className="font-semibold text-white">{art.name}</h5>
                    </div>
                    <span className="text-slate-500">{new Date(art.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Technical View Mode (All Advanced Panels) */}
        {viewMode === 'advanced' && activeTab === 'graph' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeGraph && Object.values(activeGraph.nodes).map((node) => (
                <div key={node.id} className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg space-y-2">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">{node.agentRole}</span>
                  <h4 className="text-sm font-semibold text-white">{node.name}</h4>
                  <p className="text-xs text-slate-400">Status: <span className="font-mono text-slate-200">{node.status}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'advanced' && activeTab === 'artifacts' && (
          <div className="space-y-3 text-xs">
            {activeContext?.artifacts.map(a => (
              <div key={a.id} className="p-3 bg-[#0d1527] border border-slate-800 rounded-lg flex justify-between">
                <span>{a.name} ({a.type})</span>
                <span className="font-mono text-cyan-300">{a.uri}</span>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'advanced' && activeTab === 'checkpoints' && (
          <div className="space-y-3 text-xs">
            {checkpoints.map(cp => (
              <div key={cp.checkpointId} className="p-3 bg-[#0d1527] border border-slate-800 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-mono text-cyan-300">{cp.checkpointId}</p>
                  <p className="text-slate-400">Stage: {cp.stageName}</p>
                </div>
                <button
                  onClick={() => restoreCheckpoint(cp.checkpointId)}
                  className="px-3 py-1 bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 rounded"
                >
                  ↺ Rollback
                </button>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'advanced' && activeTab === 'logs' && (
          <div className="p-4 bg-[#030712] border border-slate-800 rounded-lg font-mono text-xs space-y-1 max-h-[350px] overflow-y-auto">
            {events.map(e => (
              <div key={e.id} className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-cyan-400">{e.type}</span>
                <span className="text-slate-500">{new Date(e.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'advanced' && activeTab === 'analytics' && (
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg">
              <span className="text-slate-400">Total Duration</span>
              <p className="text-lg font-bold text-cyan-400">{analytics?.totalDurationMs || 0} ms</p>
            </div>
            <div className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg">
              <span className="text-slate-400">AI Productivity</span>
              <p className="text-lg font-bold text-emerald-400">{analytics?.aiProductivityScore || 100} %</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
