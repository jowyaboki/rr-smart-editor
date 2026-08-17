import React, { useState } from 'react';
import { ProductionBrief } from '@ai-video-editor/ai-copilot';

interface CreatorBriefBuilderProps {
  initialPrompt?: string;
  onSubmitBrief: (brief: ProductionBrief) => void;
  onCancel?: () => void;
}

export const CreatorBriefBuilder: React.FC<CreatorBriefBuilderProps> = ({
  initialPrompt = '',
  onSubmitBrief,
  onCancel
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [title, setTitle] = useState('My AI Video Production');
  const [targetPlatform, setTargetPlatform] = useState<'youtube' | 'tiktok' | 'broadcast' | 'instagram'>('youtube');
  const [targetDurationSec, setTargetDurationSec] = useState(30);
  const [qualityThreshold, setQualityThreshold] = useState(85);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const brief: ProductionBrief = {
      briefId: `brief_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      prompt,
      targetPlatform,
      targetDurationSec,
      qualityThreshold
    };
    onSubmitBrief(brief);
  };

  return (
    <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6 text-slate-100 font-sans max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">✍️</span>
          <div>
            <h3 className="text-base font-semibold text-white">AI Creative Brief Builder</h3>
            <p className="text-xs text-slate-400">Define your core vision and delivery targets</p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-full">Design System 5.0</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">Production Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#050b14] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            required
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Creative Idea / Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. Create an energetic 30s product launch video for a smart watch with cyberpunk visuals..."
            className="w-full px-3.5 py-2 bg-[#050b14] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Platform</label>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-[#050b14] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="youtube">YouTube (16:9)</option>
              <option value="tiktok">TikTok (9:16)</option>
              <option value="instagram">Instagram Reels (9:16)</option>
              <option value="broadcast">Broadcast HD (16:9)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Duration (Seconds)</label>
            <input
              type="number"
              value={targetDurationSec}
              onChange={(e) => setTargetDurationSec(Number(e.target.value))}
              min={5}
              max={300}
              className="w-full px-3.5 py-2 bg-[#050b14] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-300 font-medium mb-1">
            <span>Quality Threshold Score</span>
            <span className="font-mono text-cyan-400">{qualityThreshold} / 100</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            value={qualityThreshold}
            onChange={(e) => setQualityThreshold(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-cyan-500/20"
          >
            🚀 Generate AI Production Plan
          </button>
        </div>
      </form>
    </div>
  );
};
