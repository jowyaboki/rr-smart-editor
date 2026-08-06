import React, { useState } from 'react';

export function ChromaKeyInspector() {
  const [keyColor, setKeyColor] = useState('#00ff00');
  const [tolerance, setTolerance] = useState(0.4);
  const [edgeFeather, setEdgeFeather] = useState(0);

  return (
    <div className="space-y-3 p-3 bg-[#131317] rounded border border-[#2d2d35]">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300 font-semibold">Chroma Keying</span>
        <span className="text-[10px] text-indigo-400 font-bold uppercase">Effects Engine Link</span>
      </div>

      <div className="space-y-2.5">
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Key Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={keyColor}
              onChange={(e) => setKeyColor(e.target.value)}
              className="bg-transparent border border-none w-8 h-8 rounded cursor-pointer"
            />
            <span className="text-xs text-white font-mono uppercase">{keyColor}</span>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Key Tolerance</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <span className="text-xs text-white min-w-8 text-right">{tolerance}</span>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 block mb-1">Spill Reduction / Edge Feather</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={edgeFeather}
              onChange={(e) => setEdgeFeather(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <span className="text-xs text-white min-w-8 text-right">{edgeFeather}px</span>
          </div>
        </div>
      </div>
    </div>
  );
}
