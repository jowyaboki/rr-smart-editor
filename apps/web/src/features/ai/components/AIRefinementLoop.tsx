import React, { useState } from 'react';

interface AIRefinementLoopProps {
  onApplyRefinement: (prompt: string) => Promise<void>;
  onUndoLastRefinement?: () => void;
}

export const AIRefinementLoop: React.FC<AIRefinementLoopProps> = ({
  onApplyRefinement,
  onUndoLastRefinement
}) => {
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementPrompt.trim()) return;

    setIsProcessing(true);
    try {
      await onApplyRefinement(refinementPrompt);
      setHistory(prev => [refinementPrompt, ...prev]);
      setRefinementPrompt('');
    } finally {
      setIsProcessing(false);
    }
  };

  const presetPrompts = [
    'Make the intro sequence faster and punchier',
    'Replace background music with ambient synthwave',
    'Enhance caption styling with cyberpunk neon glow',
    'Shorten total duration for TikTok 15s format'
  ];

  return (
    <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-slate-100 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🪄</span>
          <h4 className="text-sm font-semibold text-white">Contextual AI Refinement Loop</h4>
        </div>
        {onUndoLastRefinement && history.length > 0 && (
          <button
            onClick={onUndoLastRefinement}
            className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-all flex items-center gap-1"
          >
            ↩ Undo Refinement
          </button>
        )}
      </div>

      {/* Preset Quick Chips */}
      <div className="flex flex-wrap gap-2">
        {presetPrompts.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => setRefinementPrompt(preset)}
            className="text-[11px] px-2.5 py-1 bg-[#050b14] hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-800 rounded-full transition-all text-left"
          >
            + {preset}
          </button>
        ))}
      </div>

      <form onSubmit={handleRefine} className="flex items-center space-x-2">
        <input
          type="text"
          value={refinementPrompt}
          onChange={(e) => setRefinementPrompt(e.target.value)}
          placeholder="Ask AI to refine timeline (e.g. 'Make intro faster', 'Change captions')..."
          className="flex-1 px-3 py-2 bg-[#050b14] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
          disabled={isProcessing}
        />
        <button
          type="submit"
          disabled={isProcessing || !refinementPrompt.trim()}
          className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-md"
        >
          {isProcessing ? 'Refining...' : 'Apply Refinement'}
        </button>
      </form>

      {history.length > 0 && (
        <div className="pt-2 border-t border-slate-800/60">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Applied Refinements</span>
          <div className="mt-1 space-y-1">
            {history.map((item, idx) => (
              <div key={idx} className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                <span className="text-cyan-400">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
