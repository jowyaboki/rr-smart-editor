import React, { useState } from 'react';
import {
  AssetItem,
  AudioProductionPlan,
  CaptionSegment,
  BrandRulesConfig,
  QualityGateCheckResult,
  ProductionCompletionEngine
} from '@ai-video-editor/ai-copilot';

export const ProductionCompletionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'CREATION' | 'ASSETS' | 'AUDIO' | 'CAPTIONS' | 'BRAND' | 'REVIEW' | 'QUALITY' | 'RENDER' | 'DELIVERY'
  >('CREATION');

  // Sample production state
  const [assets, setAssets] = useState<AssetItem[]>([
    { id: 'ast_1', type: 'video', semanticDescription: 'Cyberpunk City Intro', visualStyle: 'Neon 4K', durationSec: 5, aspectRatio: '16:9', resolution: '3840x2160', state: 'APPROVED', uri: 'https://stock.media.internal/clips/cyber_city.mp4' },
    { id: 'ast_2', type: 'audio', semanticDescription: 'Synthwave Background Music', visualStyle: 'Ambient', durationSec: 30, aspectRatio: 'N/A', resolution: 'N/A', state: 'APPROVED', uri: 'https://stock.media.internal/audio/synthwave.mp3' }
  ]);

  const [audioPlan] = useState<AudioProductionPlan>(
    ProductionCompletionEngine.buildAudioPlan('Welcome to the future of smart watches with AI powered performance.', 'Sarah (AI Voice)')
  );

  const [captions] = useState<CaptionSegment[]>(
    ProductionCompletionEngine.generateCaptions('Welcome to the future of smart watches. AI powered performance on your wrist.', 30)
  );

  const [brandRules] = useState<BrandRulesConfig>({
    brandName: 'Aura Technology',
    requiredColors: ['#00f0ff', '#ec4899', '#050b14'],
    requiredFonts: ['Inter', 'JetBrains Mono'],
    requiredCtaText: 'Discover Aura Watch Today'
  });

  const [qualityResult, setQualityResult] = useState<QualityGateCheckResult>({
    passed: true,
    checks: {
      missingAssets: false,
      timelineGaps: false,
      audioSync: true,
      captionCoverage: true,
      brandCompliance: true,
      safeAreaCompliance: true,
      renderReadiness: true,
      deliveryReadiness: true
    },
    warnings: [],
    errors: []
  });

  const [isRendering, setIsProcessing] = useState(false);
  const [deliveryUrl, setDeliveryUrl] = useState<string | null>(null);

  const handleRunQualityCheck = () => {
    const contextMock: any = {
      executionId: 'exec_demo',
      projectId: 'proj_demo',
      variables: { ctaText: 'Discover Aura Watch Today' },
      artifacts: [{ name: 'Brand Logo', uri: 'memory://logo.png' }]
    };
    const res = ProductionCompletionEngine.runProductionQualityGates(assets, captions, brandRules, contextMock);
    setQualityResult(res);
  };

  const handleGenerateFinalVideo = async () => {
    setIsProcessing(true);
    try {
      const mockCtx: any = { projectId: 'proj_aura_watch', variables: {} };
      const res = await ProductionCompletionEngine.generateFinalVideo(mockCtx, qualityResult);
      setDeliveryUrl(res.deliveryPackageUri);
      setActiveTab('DELIVERY');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050b14] text-slate-100 font-sans border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0d1527] border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 rounded-lg border border-cyan-500/30">
            <span className="text-xl">🚀</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Production Completion & Delivery Hub</h2>
            <p className="text-xs text-slate-400">One-click AI video production, quality gate validation & multi-format delivery</p>
          </div>
        </div>
        <button
          onClick={handleGenerateFinalVideo}
          disabled={isRendering}
          className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white rounded-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
        >
          {isRendering ? '⚡ Rendering Video...' : '🎬 GENERATE FINAL VIDEO'}
        </button>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center px-6 bg-[#09101f] border-b border-slate-800 space-x-1 overflow-x-auto">
        {[
          'CREATION',
          'ASSETS',
          'AUDIO',
          'CAPTIONS',
          'BRAND',
          'REVIEW',
          'QUALITY',
          'RENDER',
          'DELIVERY'
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3.5 py-3 text-xs font-medium transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Tab Panels */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#050b14]">
        {activeTab === 'CREATION' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Creation Prompt & Production Plan</h3>
            <div className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg space-y-2">
              <p className="text-white font-semibold">Prompt: <span className="text-slate-300 font-normal">Aura Smart Watch 30s product launch video</span></p>
              <p className="text-slate-400">Target Duration: <strong className="text-slate-200">30s</strong> | Quality Threshold: <strong className="text-cyan-300">85/100</strong></p>
            </div>
          </div>
        )}

        {activeTab === 'ASSETS' && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Intelligent Asset Pipeline</h3>
              <span className="font-mono text-slate-400">{assets.length} Total Assets</span>
            </div>
            <div className="space-y-2">
              {assets.map((a) => (
                <div key={a.id} className="p-3 bg-[#0d1527] border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-300 uppercase">{a.type}</span>
                    <h4 className="font-semibold text-white">{a.semanticDescription}</h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{a.uri}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-mono uppercase">
                    {a.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'AUDIO' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Voice & Audio Production Plan</h3>
            <div className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg space-y-2">
              <p><strong className="text-white">Speaker Role:</strong> {audioPlan.speakerRole}</p>
              <p><strong className="text-white">Voice Style:</strong> {audioPlan.voiceStyle}</p>
              <p><strong className="text-white">Target Loudness:</strong> <span className="font-mono text-cyan-300">{audioPlan.targetLoudnessLufs} LUFS</span></p>
              <p><strong className="text-white">Background Track:</strong> <span className="font-mono text-slate-300">{audioPlan.backgroundMusicTrack}</span></p>
            </div>
          </div>
        )}

        {activeTab === 'CAPTIONS' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Captions & Subtitle Timings</h3>
            <div className="space-y-2">
              {captions.map((c) => (
                <div key={c.id} className="p-3 bg-[#0d1527] border border-slate-800 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-mono text-[10px] text-cyan-400">{c.startTimeSec.toFixed(1)}s - {c.endTimeSec.toFixed(1)}s</span>
                    <p className="text-white font-medium mt-0.5">{c.text}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded uppercase font-mono">
                    Safe Area Valid
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'BRAND' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Brand Rules & Guidelines</h3>
            <div className="p-4 bg-[#0d1527] border border-slate-800 rounded-lg space-y-2">
              <p><strong className="text-white">Brand Name:</strong> {brandRules.brandName}</p>
              <p><strong className="text-white">Required CTA:</strong> <span className="text-cyan-300">{brandRules.requiredCtaText}</span></p>
            </div>
          </div>
        )}

        {activeTab === 'QUALITY' && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Production Quality Gate Auditor</h3>
              <button
                onClick={handleRunQualityCheck}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium transition-all"
              >
                🔍 Run Validation Audit
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(qualityResult.checks).map(([key, val]) => (
                <div key={key} className="p-3 bg-[#0d1527] border border-slate-800 rounded-lg">
                  <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <p className={`text-sm font-bold mt-1 ${val ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {val ? '✓ PASSED' : '✕ FAILED'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'DELIVERY' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Final Production Package Delivery</h3>
            {deliveryUrl ? (
              <div className="p-5 bg-[#0d1527] border border-emerald-500/40 rounded-lg space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                  <span>✅</span>
                  <span>Video Production Completed Successfully</span>
                </div>
                <p className="text-slate-300 font-mono text-xs">{deliveryUrl}</p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-lg">
                Click "GENERATE FINAL VIDEO" to initiate one-click production rendering and delivery packaging.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
