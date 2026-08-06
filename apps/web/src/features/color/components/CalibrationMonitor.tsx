import React from 'react';
import { useColorStore } from '../store/colorStore';

export function CalibrationMonitor() {
  const { isCalibrated, setCalibrated } = useColorStore();

  return (
    <div className="space-y-3 p-3 bg-[#131317] rounded border border-[#2d2d35]">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300 font-bold uppercase">Display Calibration</span>
        <span
          className={`text-[10px] font-bold uppercase ${isCalibrated ? 'text-green-400' : 'text-yellow-500'}`}
        >
          {isCalibrated ? 'D65 Reference' : 'Uncalibrated'}
        </span>
      </div>

      <div className="text-[11px] text-gray-400 leading-relaxed">
        Verify your reference monitor gamma (bt1886) and primary chromaticity white-point
        coefficients dynamically.
      </div>

      <button
        onClick={() => setCalibrated(!isCalibrated)}
        className="w-full py-1.5 bg-[#2d2d35] hover:bg-[#3e3e48] border border-[#3e3e48] text-indigo-400 text-xs font-semibold rounded transition"
      >
        {isCalibrated ? 'Reset Reference Calibration' : 'Recalibrate to D65 Target'}
      </button>
    </div>
  );
}
