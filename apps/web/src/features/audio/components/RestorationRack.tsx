import React, { useState } from 'react';

export function RestorationRack() {
  const [denoise, setDenoise] = useState(40);

  return (
    <div className="p-4 bg-[#131317] rounded-lg border border-[#2d2d35] space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300 font-bold uppercase">Restoration Rack</span>
        <span className="text-[10px] text-indigo-400 font-semibold uppercase">AI Enhancement</span>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-[10px] text-gray-500 block mb-1">
            AI Voice De-Noise Threshold
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="100"
              value={denoise}
              onChange={(e) => setDenoise(parseInt(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <span className="text-xs text-white min-w-8 text-right">{denoise}%</span>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 bg-black bg-opacity-35 p-2 rounded">
          <span>Automatic Silence Trimmer</span>
          <button
            onClick={() => {
              alert(
                'Analyzed timeline and extracted 3 gaps of dead air silences non-destructively!',
              );
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Trim Silence
          </button>
        </div>
      </div>
    </div>
  );
}
