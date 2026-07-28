import React from 'react';

export function AutomationCurveEditor() {
  return (
    <div className="p-4 bg-[#131317] rounded-lg border border-[#2d2d35] space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300 font-bold uppercase">Automation Curves</span>
        <span className="text-[10px] text-indigo-400 font-semibold uppercase">Curve Splines</span>
      </div>
      <div className="h-20 border border-dashed border-[#2d2d35] rounded bg-black bg-opacity-40 flex items-center justify-center relative">
        <div className="text-[10px] text-gray-600">Linear / Bezier Keyframe Splines Editor</div>
        <div className="absolute inset-x-4 top-1/2 border-b border-indigo-500 border-opacity-40" />
      </div>
    </div>
  );
}
