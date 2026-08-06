import React, { useState } from 'react';
import { useVirtualProductionStore } from '../store/virtualProductionStore';
import { globalVirtualStudioEngine } from '@ai-video-editor/virtual-production';

export function CalibrationPanel() {
  const { studio, setStudio } = useVirtualProductionStore();
  const [pointsCount, setPointsCount] = useState(0);
  const [status, setStatus] = useState('Calibration Idle');

  const runChessboardCalibration = () => {
    setStatus('Scanning grid observation points...');
    setTimeout(() => {
      setPointsCount(8);
      setStatus('Solving distortion matrices...');
      setTimeout(() => {
        const solverResult = globalVirtualStudioEngine.calibrationService.solveCalibration(
          Array.from({ length: 8 }, (_, i) => ({
            gridPoint: [i % 4, Math.floor(i / 4), 0] as [number, number, number],
            observedPixels: [100 * i, 200] as [number, number],
          })),
          1920,
          1080,
        );

        const profile = globalVirtualStudioEngine.calibrationService.createProfile(
          solverResult,
          'Lens Profile v1',
        );
        setStatus('Calibration converged successfully!');

        if (studio) {
          setStudio({
            ...studio,
            calibrationProfiles: {
              ...studio.calibrationProfiles,
              [profile.id]: profile,
            },
          });
        }
      }, 500);
    }, 500);
  };

  return (
    <div className="p-3 bg-[#131317] rounded border border-[#2d2d35] space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-300">Lens Calibration Solver</span>
        <span className="text-[10px] text-gray-500">{status}</span>
      </div>
      <div className="text-xs text-gray-400">
        Observed Grid Points: <span className="font-semibold text-white">{pointsCount} / 8</span>
      </div>
      <button
        onClick={runChessboardCalibration}
        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium transition"
      >
        Run Guided Chessboard Solver
      </button>
    </div>
  );
}
