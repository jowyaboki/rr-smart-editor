import React from 'react';
import { useColorStore } from '../store/colorStore';

export function FalseColorOverlay() {
  const { scopesState, updateScopesState } = useColorStore();

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-4">
      {/* False color mapping legend */}
      <div className="flex justify-between items-center bg-black bg-opacity-70 p-2 rounded border border-[#2d2d35]">
        <span className="text-[10px] text-gray-300 font-medium">False Color Heatmap</span>
        <button
          onClick={() => updateScopesState({ falseColorOverlay: !scopesState.falseColorOverlay })}
          className={`px-2 py-0.5 rounded text-[10px] transition ${scopesState.falseColorOverlay ? 'bg-red-600 text-white font-semibold' : 'bg-[#2d2d35] hover:bg-[#3e3e48] text-gray-300'}`}
        >
          {scopesState.falseColorOverlay ? 'Disable Heatmap' : 'Enable False Color'}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <div className={`w-32 h-20 rounded border border-gray-700 bg-gradient-to-r from-purple-500 via-blue-500 to-red-500 transition duration-300 ${scopesState.falseColorOverlay ? 'opacity-90' : 'opacity-10 grayscale'}`} />
      </div>

      {scopesState.falseColorOverlay && (
        <div className="flex justify-between text-[8px] font-bold bg-black bg-opacity-80 p-1.5 rounded border border-[#2d2d35]">
          <span className="text-purple-400">0% Purple</span>
          <span className="text-blue-400">10% Blue</span>
          <span className="text-gray-400">40% Gray</span>
          <span className="text-pink-400">60% Pink</span>
          <span className="text-yellow-400">90% Yellow</span>
          <span className="text-red-500">100% Red</span>
        </div>
      )}
    </div>
  );
}
