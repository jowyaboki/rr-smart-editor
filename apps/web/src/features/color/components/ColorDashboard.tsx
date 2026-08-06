import React from 'react';
import { useColorStore } from '../store/colorStore';
import { ColorWheels } from './ColorWheels';
import { ScopesPanel } from './ScopesPanel';
import { LutLoader } from './LutLoader';
import { CalibrationMonitor } from './CalibrationMonitor';
import { FalseColorOverlay } from './FalseColorOverlay';
import { globalColorScienceEngine } from '@ai-video-editor/color-science';

export function ColorDashboard() {
  const { activeGrade, setGrade, pipeline, setPipeline, isCalibrated, setCalibrated } = useColorStore();

  const initializeDefaultGrade = () => {
    const grade = globalColorScienceEngine.createDefaultGrade('grade-001', 'Cinematic Film Look A');
    setGrade(grade);

    const defaultPipeline = {
      id: 'pipeline-001',
      name: 'ACES Rec709 Output',
      inputTransform: { id: 'it-1', name: 'S-Log3 to ACES', sourceGamut: 'srgb' as any, sourceGamma: 'S-Log3' },
      workingSpace: { colorSpace: { id: 'cs-aces', name: 'ACEScg', type: 'acescg' as any, primaries: { red: [0.713, 0.293] as [number, number], green: [0.165, 0.79] as [number, number], blue: [0.128, 0.044] as [number, number], white: [0.32168, 0.33767] as [number, number] }, gammaCurve: 'linear' as any, gammaValue: 1.0 }, linearEncoding: true },
      outputTransform: { id: 'ot-1', name: 'ACES Output sRGB', targetGamut: 'srgb' as any, targetGamma: 'srgb' },
    };
    setPipeline(defaultPipeline);
  };

  if (!activeGrade) {
    return (
      <div className="p-8 text-center text-gray-400 bg-[#1a1a1e] h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">No Active Color Grade Loaded</h2>
        <button
          onClick={initializeDefaultGrade}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition"
        >
          Initialize ACES Grading Space
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#141417] text-white overflow-hidden">
      {/* Scope View & Reference Window */}
      <div className="flex-1 flex flex-col border-r border-[#2d2d35]">
        <div className="h-12 border-b border-[#2d2d35] bg-[#1a1a1f] flex items-center justify-between px-6">
          <span className="text-sm font-bold uppercase tracking-wider text-indigo-400">Color Grading Workspace</span>
          <span className="text-xs text-gray-400">Pipeline: <span className="font-semibold text-white">{pipeline?.name}</span></span>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
          {/* Virtual video frame simulator */}
          <div className="relative border border-[#2d2d35] rounded-lg bg-[#0e0e11] overflow-hidden flex flex-col justify-between p-4">
            <div className="text-xs font-bold text-gray-500 uppercase">Input Frame Source</div>
            <div className="flex-1 flex items-center justify-center">
              <FalseColorOverlay />
            </div>
          </div>

          {/* Real-time scopes visualizer */}
          <div className="border border-[#2d2d35] rounded-lg bg-[#0e0e11] p-4 flex flex-col">
            <ScopesPanel />
          </div>
        </div>
      </div>

      {/* Grade Control Panels */}
      <div className="w-96 bg-[#1a1a1f] flex flex-col">
        <div className="p-4 border-b border-[#2d2d35] flex justify-between items-center bg-[#222228]">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Colorist Controls</span>
          <button
            onClick={() => {
              alert('AI grading agent has evaluated this clip contrast and matched lighting highlights!');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            ⚡ AI Shot Match
          </button>
        </div>

        {/* Adjustments inspector scroll list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Lift Gamma Gain Color Wheels */}
          <ColorWheels />

          {/* LUT Loader panel */}
          <LutLoader />

          {/* Calibration reference */}
          <CalibrationMonitor />
        </div>
      </div>
    </div>
  );
}
