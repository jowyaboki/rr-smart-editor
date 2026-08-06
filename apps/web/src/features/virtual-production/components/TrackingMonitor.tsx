import React, { useState } from 'react';

export function TrackingMonitor() {
  const [latency, setLatency] = useState(12); // ms
  const [jitter, setJitter] = useState(1.2); // mm

  return (
    <div className="space-y-3 p-3 bg-[#131317] rounded border border-[#2d2d35]">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300 font-semibold">Sensor Alignment</span>
        <span className="text-[10px] text-green-400 font-semibold uppercase animate-pulse">
          Connected
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 bg-[#1a1a20] rounded border border-[#23232c]">
          <div className="text-[10px] text-gray-500 uppercase">Input Latency</div>
          <div className="text-sm font-bold text-white">{latency} ms</div>
        </div>
        <div className="p-2 bg-[#1a1a20] rounded border border-[#23232c]">
          <div className="text-[10px] text-gray-500 uppercase">Jitter Deviation</div>
          <div className="text-sm font-bold text-white">±{jitter} mm</div>
        </div>
      </div>

      <div className="text-[10px] text-gray-500 leading-relaxed text-center">
        Hardware Adapters Supported: Vive Tracker, OptiTrack, OpenCV Chessboard, ARKit.
      </div>
    </div>
  );
}
