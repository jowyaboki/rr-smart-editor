import React, { useState } from 'react';

export interface CreativeVariant {
  variantId: string;
  name: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  platform: string;
  durationSec: number;
}

interface CreativeVariantsPanelProps {
  variants: CreativeVariant[];
  activeVariantId: string;
  onSelectVariant: (variantId: string) => void;
  onCreateVariant: (name: string, aspectRatio: '16:9' | '9:16' | '1:1', platform: string) => void;
}

export const CreativeVariantsPanel: React.FC<CreativeVariantsPanelProps> = ({
  variants,
  activeVariantId,
  onSelectVariant,
  onCreateVariant
}) => {
  const [newVariantName, setNewVariantName] = useState('TikTok Reel Cut');
  const [newAspectRatio, setNewAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('9:16');
  const [newPlatform, setNewPlatform] = useState('TikTok');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateVariant(newVariantName, newAspectRatio, newPlatform);
    setNewVariantName('');
  };

  return (
    <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 text-slate-100 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🔀</span>
          <h4 className="text-sm font-semibold text-white">Creative Variants & Aspect Ratios</h4>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 border border-cyan-800 rounded">
          {variants.length} Variants
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {variants.map((v) => (
          <div
            key={v.variantId}
            onClick={() => onSelectVariant(v.variantId)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              activeVariantId === v.variantId
                ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                : 'bg-[#050b14] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <h5 className="text-xs font-semibold text-white">{v.name}</h5>
              <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 bg-slate-800 rounded">{v.aspectRatio}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Platform: {v.platform} | {v.durationSec}s</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} className="pt-3 border-t border-slate-800 flex items-center space-x-2 text-xs">
        <input
          type="text"
          value={newVariantName}
          onChange={(e) => setNewVariantName(e.target.value)}
          placeholder="New Variant Name..."
          className="flex-1 px-3 py-1.5 bg-[#050b14] border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-400"
          required
        />
        <select
          value={newAspectRatio}
          onChange={(e) => setNewAspectRatio(e.target.value as any)}
          className="px-2.5 py-1.5 bg-[#050b14] border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-400"
        >
          <option value="16:9">16:9 Landscape</option>
          <option value="9:16">9:16 Portrait</option>
          <option value="1:1">1:1 Square</option>
        </select>
        <button
          type="submit"
          className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium transition-all"
        >
          + Add Variant
        </button>
      </form>
    </div>
  );
};
