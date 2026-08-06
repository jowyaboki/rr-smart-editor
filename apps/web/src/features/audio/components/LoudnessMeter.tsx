import React from 'react';
import { useAudioStore } from '../store/audioStore';

export function LoudnessMeter() {
  const { activeLoudnessLUFS, setLoudness } = useAudioStore();

  return (
    <div className="p-4 bg-[#131317] rounded-lg border border-[#2d2d35] space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300 font-bold uppercase">Loudness Meter</span>
        <span className="text-[10px] text-indigo-400 font-semibold uppercase">EBU R128</span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Target Standard</span>
        <span className="font-semibold text-white">Broadcast (-23.0 LUFS)</span>
      </div>

      {/* Level Bar */}
      <div className="space-y-1">
        <div className="h-4 bg-gray-800 rounded overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300"
            style={{
              width: `${Math.max(0, Math.min(100, ((activeLoudnessLUFS + 60) / 60) * 100))}%`,
            }}
          />
          <div className="absolute inset-y-0 right-1/3 border-r border-white border-opacity-40" />{' '}
          {/* -23dB mark */}
        </div>
        <div className="flex justify-between text-[8px] text-gray-500">
          <span>-60 LUFS</span>
          <span>-23 LUFS</span>
          <span>0 LUFS</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">Momentary Loudness</span>
        <span className="font-mono font-bold text-indigo-400">
          {activeLoudnessLUFS.toFixed(1)} LUFS
        </span>
      </div>
    </div>
  );
}
