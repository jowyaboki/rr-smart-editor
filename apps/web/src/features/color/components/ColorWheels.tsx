import React from 'react';
import { useColorStore } from '../store/colorStore';

export function ColorWheels() {
  const {
    activeGrade,
    selectedWheel,
    selectWheel,
    updateGradeLift,
    updateGradeGamma,
    updateGradeGain,
    updateGradeOffset,
    updateGradeCreative,
  } = useColorStore();

  if (!activeGrade) return null;

  const handleSliderChange = (val: number, channel: number) => {
    const currentWheel = selectedWheel;
    let rgb = [...activeGrade[currentWheel].rgb] as [number, number, number];
    rgb[channel] = val;

    if (currentWheel === 'lift') updateGradeLift(rgb);
    if (currentWheel === 'gamma') updateGradeGamma(rgb);
    if (currentWheel === 'gain') updateGradeGain(rgb);
    if (currentWheel === 'offset') updateGradeOffset(rgb);
  };

  const activeValues = activeGrade[selectedWheel].rgb;

  return (
    <div className="space-y-4 p-3 bg-[#131317] rounded border border-[#2d2d35]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-300 font-bold uppercase">Primary Wheels</span>
        <div className="flex bg-[#2d2d35] rounded p-0.5 text-[10px]">
          {['lift', 'gamma', 'gain', 'offset'].map((wheel: any) => (
            <button
              key={wheel}
              onClick={() => selectWheel(wheel)}
              className={`px-2 py-0.5 rounded transition capitalize ${selectedWheel === wheel ? 'bg-indigo-600 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
            >
              {wheel}
            </button>
          ))}
        </div>
      </div>

      {/* Schematic RGB multipliers */}
      <div className="space-y-2">
        {['Red', 'Green', 'Blue'].map((color, idx) => (
          <div key={color}>
            <label className="text-[10px] text-gray-500 block mb-0.5">{color} Channel</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min={selectedWheel === 'lift' ? '-0.5' : '0'}
                max={selectedWheel === 'lift' ? '0.5' : '3'}
                step="0.05"
                value={activeValues[idx]}
                onChange={(e) => handleSliderChange(parseFloat(e.target.value), idx)}
                className="w-full accent-indigo-600"
              />
              <span className="text-[10px] font-mono text-white min-w-8 text-right">
                {activeValues[idx].toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Saturation, Contrast, Pivot sliders */}
      <div className="border-t border-[#2d2d35] pt-3 grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] text-gray-500 block mb-0.5">Saturation</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={activeGrade.saturation}
            onChange={(e) => updateGradeCreative({ saturation: parseFloat(e.target.value) })}
            className="w-full accent-indigo-600"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 block mb-0.5">Contrast</label>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={activeGrade.contrast}
            onChange={(e) => updateGradeCreative({ contrast: parseFloat(e.target.value) })}
            className="w-full accent-indigo-600"
          />
        </div>
      </div>
    </div>
  );
}
