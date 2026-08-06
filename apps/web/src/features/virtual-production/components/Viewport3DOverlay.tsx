import React from 'react';
import { useVirtualProductionStore } from '../store/virtualProductionStore';

export function Viewport3DOverlay() {
  const { studio, viewportState, selectedCameraId } = useVirtualProductionStore();

  if (!studio) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-black bg-opacity-20 border border-[#2d2d35] rounded-lg">
      <div className="text-center space-y-2">
        <div className="text-sm font-semibold tracking-wider text-gray-400">
          REAL-TIME GRAPH RENDERING SIMULATOR
        </div>
        <div className="text-xs text-gray-500">
          Projection Backend:{' '}
          <span className="text-indigo-400 font-medium capitalize">{viewportState.viewMode}</span>
        </div>
        <div className="flex justify-center space-x-6 text-[11px] text-gray-400">
          <div>
            🎥 Cameras Count:{' '}
            <span className="text-white font-semibold">{Object.keys(studio.cameras).length}</span>
          </div>
          <div>
            💡 Light Sources:{' '}
            <span className="text-white font-semibold">{Object.keys(studio.lightRigs).length}</span>
          </div>
          {selectedCameraId && (
            <div className="text-indigo-300 font-medium">
              Selected Camera: {studio.cameras[selectedCameraId]?.name}
            </div>
          )}
        </div>
      </div>
      {/* Schematic Grid simulation */}
      {viewportState.showGrid && (
        <div className="absolute inset-0 border border-indigo-500 border-opacity-10 pointer-events-none grid grid-cols-12 grid-rows-6">
          {Array.from({ length: 72 }).map((_, i) => (
            <div key={i} className="border-r border-b border-[#2d2d35] border-opacity-30" />
          ))}
        </div>
      )}
    </div>
  );
}
