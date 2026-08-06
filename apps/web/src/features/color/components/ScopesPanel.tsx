import React from 'react';
import { useColorStore } from '../store/colorStore';

export function ScopesPanel() {
  const { scopesState, updateScopesState } = useColorStore();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase">Video Scopes</span>
        <div className="flex bg-[#2d2d35] rounded p-0.5 text-[10px]">
          {['rgb_parade', 'vectorscope', 'histogram', 'false_color'].map((scope: any) => (
            <button
              key={scope}
              onClick={() => updateScopesState({ activeScope: scope })}
              className={`px-2 py-0.5 rounded transition capitalize ${scopesState.activeScope === scope ? 'bg-indigo-600 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
            >
              {scope.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Schematic scope drawings on canvas */}
      <div className="flex-1 border border-[#2d2d35] rounded bg-black bg-opacity-40 flex items-center justify-center p-4 relative">
        <div className="text-center space-y-1 z-10">
          <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            {scopesState.activeScope.replace('_', ' ')} Monitor
          </div>
          <div className="text-[10px] text-gray-600">
            Real-time sub-sample: <span className="text-indigo-400">1/{scopesState.subSampleRate} pixels</span>
          </div>
        </div>

        {/* Schematic Vectorscope Ring */}
        {scopesState.activeScope === 'vectorscope' && (
          <div className="absolute w-32 h-32 rounded-full border border-indigo-500 border-opacity-10 flex items-center justify-center">
            <div className="text-[8px] absolute top-1 text-red-500 font-bold">R</div>
            <div className="text-[8px] absolute right-1 text-blue-500 font-bold">B</div>
            <div className="text-[8px] absolute bottom-1 text-green-500 font-bold">G</div>
            <div className="text-[8px] absolute left-1 text-yellow-500 font-bold">Y</div>
            <div className="w-16 h-16 rounded-full border border-indigo-500 border-opacity-5" />
          </div>
        )}

        {/* Schematic Histogram Grid */}
        {scopesState.activeScope === 'histogram' && (
          <div className="absolute inset-x-4 bottom-4 h-16 flex items-end space-x-1 opacity-20">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-indigo-500"
                style={{ height: `${Math.sin(i * 0.3) * 100}%` }}
              />
            ))}
          </div>
        )}

        {/* Schematic RGB Parade */}
        {scopesState.activeScope === 'rgb_parade' && (
          <div className="absolute inset-0 flex p-3 space-x-3 opacity-25">
            <div className="flex-1 border-r border-[#2d2d35] flex items-end justify-center pb-2 text-[8px] text-red-500 font-bold">R</div>
            <div className="flex-1 border-r border-[#2d2d35] flex items-end justify-center pb-2 text-[8px] text-green-500 font-bold">G</div>
            <div className="flex-1 flex items-end justify-center pb-2 text-[8px] text-blue-500 font-bold">B</div>
          </div>
        )}
      </div>
    </div>
  );
}
