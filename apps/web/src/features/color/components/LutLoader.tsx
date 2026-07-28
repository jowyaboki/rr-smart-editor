import React, { useState } from 'react';

export function LutLoader() {
  const [lutName, setLutName] = useState('Rec709 Standard Lut');

  return (
    <div className="space-y-3 p-3 bg-[#131317] rounded border border-[#2d2d35]">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300 font-bold uppercase">Creative LUTs</span>
        <span className="text-[10px] text-indigo-400 font-bold uppercase">3D Cube</span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 bg-black bg-opacity-35 p-2 rounded">
        <span className="truncate">📋 {lutName}</span>
        <button
          onClick={() => {
            setLutName('Teal and Orange Teal.cube');
            alert('Teal and Orange 3D Cube LUT applied successfully!');
          }}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          Load Custom LUT
        </button>
      </div>
    </div>
  );
}
