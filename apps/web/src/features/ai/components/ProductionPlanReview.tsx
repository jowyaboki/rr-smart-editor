import React from 'react';
import { ExecutionGraph } from '@ai-video-editor/ai-copilot';

interface ProductionPlanReviewProps {
  graph: ExecutionGraph;
  onApprovePlan: () => void;
  onRejectPlan?: () => void;
  onRegeneratePlan?: () => void;
}

export const ProductionPlanReview: React.FC<ProductionPlanReviewProps> = ({
  graph,
  onApprovePlan,
  onRejectPlan,
  onRegeneratePlan
}) => {
  return (
    <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6 text-slate-100 font-sans max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📋</span>
          <div>
            <h3 className="text-base font-semibold text-white">AI Production Plan Inspector</h3>
            <p className="text-xs text-slate-400">Review planned AI agent execution stages before launching</p>
          </div>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 border border-cyan-800 rounded-full">
          {Object.keys(graph.nodes).length} Planned Agents
        </span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {Object.values(graph.nodes).map((node, index) => (
          <div key={node.id} className="p-3.5 bg-[#050b14] border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-xs">
                {index + 1}
              </span>
              <div>
                <h4 className="text-xs font-semibold text-white">{node.name}</h4>
                <p className="text-[11px] text-slate-400">Agent: <span className="text-cyan-300 font-mono">{node.agentRole}</span></p>
              </div>
            </div>
            {node.approvalGate && (
              <span className="text-[10px] px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded uppercase font-mono">
                Requires Approval
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="flex space-x-2">
          {onRegeneratePlan && (
            <button
              onClick={onRegeneratePlan}
              className="px-3.5 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
            >
              🔄 Regenerate Plan
            </button>
          )}
          {onRejectPlan && (
            <button
              onClick={onRejectPlan}
              className="px-3.5 py-2 text-xs bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 rounded-lg transition-all"
            >
              ✕ Reject
            </button>
          )}
        </div>

        <button
          onClick={onApprovePlan}
          className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          ✓ Approve & Execute Production
        </button>
      </div>
    </div>
  );
};
