import React, { useState } from 'react';
import { useVirtualProductionStore } from '../store/virtualProductionStore';
import { Viewport3DOverlay } from './Viewport3DOverlay';
import { CameraBookmarkBar } from './CameraBookmarkBar';
import { ChromaKeyInspector } from './ChromaKeyInspector';
import { CalibrationPanel } from './CalibrationPanel';
import { TrackingMonitor } from './TrackingMonitor';

export function StudioDashboard() {
  const {
    studio,
    viewportState,
    updateViewportState,
    selectedCameraId,
    selectCamera,
    selectedLightId,
    selectLight,
    addCamera,
    addLight,
    updateLight,
    updateEnvironment,
  } = useVirtualProductionStore();

  const [prompt, setPrompt] = useState('');

  if (!studio) {
    return (
      <div className="p-8 text-center text-gray-400">
        <h2 className="text-xl font-bold mb-4">No Virtual Studio Loaded</h2>
        <button
          onClick={() => {
            const defaultStudio = {
              id: 'studio-001',
              name: 'Studio Main',
              stage: {
                id: 'stage-1',
                name: 'Main Stage',
                dimensions: [12, 8, 4] as [number, number, number],
                gridSize: 0.5,
                originOffset: [0, 0, 0] as [number, number, number],
              },
              cameras: {
                'cam-1': {
                  id: 'cam-1',
                  name: 'A-Camera (Wide)',
                  type: 'perspective' as any,
                  transform: {
                    position: [0, 1.6, 6] as [number, number, number],
                    rotation: [0, 0, 0] as [number, number, number],
                    scale: [1, 1, 1] as [number, number, number],
                    anchorPoint: [0, 0] as [number, number],
                    opacity: 1.0,
                  },
                  projection: 'perspective' as any,
                  fov: 65,
                  focalLength: 35,
                  lensPreset: '35mm_street' as any,
                  depthOfField: {
                    enabled: false,
                    aperture: 2.8,
                    focusDistance: 5.0,
                    bladeCount: 9,
                  },
                  bookmarks: [],
                },
                'cam-2': {
                  id: 'cam-2',
                  name: 'Dolly Tracker Camera',
                  type: 'dolly' as any,
                  transform: {
                    position: [2, 1.2, 4] as [number, number, number],
                    rotation: [0, -15, 0] as [number, number, number],
                    scale: [1, 1, 1] as [number, number, number],
                    anchorPoint: [0, 0] as [number, number],
                    opacity: 1.0,
                  },
                  projection: 'perspective' as any,
                  fov: 40,
                  focalLength: 50,
                  lensPreset: '50mm_standard' as any,
                  depthOfField: { enabled: true, aperture: 1.8, focusDistance: 3.5, bladeCount: 9 },
                  bookmarks: [],
                },
              },
              cameraRigs: {},
              lightRigs: {
                'light-1': {
                  id: 'light-1',
                  name: 'Key Sun Light',
                  type: 'directional' as any,
                  transform: {
                    position: [5, 10, 5] as [number, number, number],
                    rotation: [45, 45, 0] as [number, number, number],
                    scale: [1, 1, 1] as [number, number, number],
                    anchorPoint: [0, 0] as [number, number],
                    opacity: 1.0,
                  },
                  color: '#fff9e6',
                  intensity: 1.5,
                  temperature: 5500,
                  shadows: { enabled: true, bias: 0.005, radius: 4, resolution: 2048 },
                  groupName: 'Key Group',
                },
                'light-2': {
                  id: 'light-2',
                  name: 'Fill Ambient Spot',
                  type: 'spot' as any,
                  transform: {
                    position: [-5, 6, 3] as [number, number, number],
                    rotation: [15, -45, 0] as [number, number, number],
                    scale: [1, 1, 1] as [number, number, number],
                    anchorPoint: [0, 0] as [number, number],
                    opacity: 1.0,
                  },
                  color: '#dcf0ff',
                  intensity: 0.8,
                  temperature: 7000,
                  shadows: { enabled: false, bias: 0.005, radius: 4, resolution: 1024 },
                  spotAngle: 45,
                  spotPenumbra: 0.3,
                  groupName: 'Fill Group',
                },
              },
              environments: {
                'env-1': {
                  id: 'env-1',
                  name: 'Studio Cyc Backplate',
                  type: 'hdri' as any,
                  sourceUrl: '/assets/hdr/studio_cyc.hdr',
                  proceduralParams: {},
                  exposure: 1.0,
                  blurAmount: 0.0,
                  rotationY: 0.0,
                },
              },
              trackingSources: {},
              calibrationProfiles: {},
              virtualSets: {},
              version: '1.0.0',
              metadata: {},
            };
            useVirtualProductionStore.getState().setStudio(defaultStudio);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition"
        >
          Initialize Default Studio State
        </button>
      </div>
    );
  }

  const activeEnv = Object.values(studio.environments)[0];

  return (
    <div className="flex h-screen bg-[#1a1a1e] text-white overflow-hidden">
      {/* Sidebar - Outliner & Hierarchy */}
      <div className="w-80 border-r border-[#2d2d35] bg-[#222228] flex flex-col">
        <div className="p-4 border-b border-[#2d2d35]">
          <h2 className="text-md font-bold uppercase tracking-wider text-indigo-400">
            Studio Outliner
          </h2>
        </div>

        {/* Cameras Hierarchy Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Cameras</span>
              <button
                onClick={() => {
                  const id = `cam-${Date.now()}`;
                  addCamera({
                    id,
                    name: `New Camera ${Object.keys(studio.cameras).length + 1}`,
                    type: 'perspective',
                    transform: {
                      position: [0, 1.6, 5],
                      rotation: [0, 0, 0],
                      scale: [1, 1, 1],
                      anchorPoint: [0, 0],
                      opacity: 1.0,
                    },
                    projection: 'perspective',
                    fov: 54,
                    focalLength: 35,
                    lensPreset: '35mm_street',
                    depthOfField: {
                      enabled: false,
                      aperture: 2.8,
                      focusDistance: 5.0,
                      bladeCount: 9,
                    },
                    bookmarks: [],
                  });
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                + Add Cam
              </button>
            </div>
            <ul className="space-y-1">
              {Object.values(studio.cameras).map((cam) => (
                <li
                  key={cam.id}
                  onClick={() => selectCamera(cam.id)}
                  className={`p-2 rounded cursor-pointer transition text-sm flex justify-between items-center ${
                    selectedCameraId === cam.id
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-[#2d2d35] text-gray-300'
                  }`}
                >
                  <span>🎥 {cam.name}</span>
                  <span className="text-[10px] bg-black bg-opacity-40 px-1.5 py-0.5 rounded uppercase text-gray-300">
                    {cam.type}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lights Hierarchy Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Light Rigs</span>
              <button
                onClick={() => {
                  const id = `light-${Date.now()}`;
                  addLight({
                    id,
                    name: `New Light ${Object.keys(studio.lightRigs).length + 1}`,
                    type: 'point',
                    transform: {
                      position: [0, 4, 0],
                      rotation: [0, 0, 0],
                      scale: [1, 1, 1],
                      anchorPoint: [0, 0],
                      opacity: 1.0,
                    },
                    color: '#ffffff',
                    intensity: 1.0,
                    temperature: 6500,
                    shadows: { enabled: true, bias: 0.005, radius: 4, resolution: 1024 },
                    groupName: 'default-group',
                  });
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                + Add Light
              </button>
            </div>
            <ul className="space-y-1">
              {Object.values(studio.lightRigs).map((light) => (
                <li
                  key={light.id}
                  onClick={() => selectLight(light.id)}
                  className={`p-2 rounded cursor-pointer transition text-sm flex justify-between items-center ${
                    selectedLightId === light.id
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-[#2d2d35] text-gray-300'
                  }`}
                >
                  <span>💡 {light.name}</span>
                  <span className="text-[10px] bg-black bg-opacity-40 px-1.5 py-0.5 rounded uppercase text-gray-300">
                    {light.type}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Assistance Inspector */}
          <div className="p-4 bg-[#1a1a20] rounded-lg border border-[#2d2d35] space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase block">
              AI Staging Copilot
            </span>
            <input
              type="text"
              placeholder="Suggest optimal lighting..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-[#2d2d35] border border-[#3e3e48] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-white"
            />
            <button
              onClick={() => {
                updateEnvironment({ exposure: 1.4 });
                alert('AI Staging Copilot applied environment optimization!');
              }}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded text-xs font-semibold text-white transition"
            >
              Optimize Scene Lighting
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport & Preview */}
      <div className="flex-1 flex flex-col bg-[#111115]">
        {/* Top Control Bar */}
        <div className="h-14 border-b border-[#2d2d35] bg-[#1a1a1f] flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-md font-bold tracking-wide text-white">{studio.name} Viewport</h1>
            <div className="flex bg-[#2d2d35] rounded p-0.5 text-xs">
              <button
                onClick={() => updateViewportState({ viewMode: 'perspective_3d' })}
                className={`px-3 py-1 rounded transition ${viewportState.viewMode === 'perspective_3d' ? 'bg-indigo-600 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
              >
                3D Perspective
              </button>
              <button
                onClick={() => updateViewportState({ viewMode: 'camera' })}
                className={`px-3 py-1 rounded transition ${viewportState.viewMode === 'camera' ? 'bg-indigo-600 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
              >
                Camera View
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            <label className="text-xs text-gray-400 flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={viewportState.showGrid}
                onChange={(e) => updateViewportState({ showGrid: e.target.checked })}
                className="accent-indigo-600"
              />
              <span>Grid Lines</span>
            </label>
            <label className="text-xs text-gray-400 flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={viewportState.showFrustums}
                onChange={(e) => updateViewportState({ showFrustums: e.target.checked })}
                className="accent-indigo-600"
              />
              <span>Camera Frustums</span>
            </label>
          </div>
        </div>

        {/* Dynamic Viewport Window */}
        <div className="flex-1 relative">
          <Viewport3DOverlay />
        </div>

        {/* Camera Bookmark Bar */}
        <div className="h-20 border-t border-[#2d2d35] bg-[#1a1a1f] px-6 py-3">
          <CameraBookmarkBar />
        </div>
      </div>

      {/* Right Sidebar - Properties Inspectors */}
      <div className="w-80 border-l border-[#2d2d35] bg-[#222228] flex flex-col overflow-y-auto">
        {selectedCameraId && studio.cameras[selectedCameraId] && (
          <div className="p-4 border-b border-[#2d2d35] space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase">Camera Properties</h3>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Name</label>
              <div className="text-sm font-semibold text-white">
                {studio.cameras[selectedCameraId].name}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Lens Preset</label>
              <div className="text-sm text-indigo-400 font-medium capitalize">
                {studio.cameras[selectedCameraId].lensPreset}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">FOV / Focal Length</label>
              <div className="text-xs text-white">
                {studio.cameras[selectedCameraId].fov}° /{' '}
                {studio.cameras[selectedCameraId].focalLength}mm
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Aperture Size (DOF)</label>
              <div className="text-xs text-white">
                f/{studio.cameras[selectedCameraId].depthOfField.aperture}
              </div>
            </div>
          </div>
        )}

        {selectedLightId && studio.lightRigs[selectedLightId] && (
          <div className="p-4 border-b border-[#2d2d35] space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase">Light Properties</h3>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Name</label>
              <div className="text-sm font-semibold text-white">
                {studio.lightRigs[selectedLightId].name}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Color Temperature</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  value={studio.lightRigs[selectedLightId].temperature}
                  onChange={(e) =>
                    updateLight(selectedLightId, { temperature: parseInt(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
                <span className="text-xs text-white min-w-14 text-right">
                  {studio.lightRigs[selectedLightId].temperature}K
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Light Intensity</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={studio.lightRigs[selectedLightId].intensity}
                  onChange={(e) =>
                    updateLight(selectedLightId, { intensity: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-600"
                />
                <span className="text-xs text-white min-w-10 text-right">
                  {studio.lightRigs[selectedLightId].intensity}x
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase">Environment Backplate</h3>
          {activeEnv && (
            <div className="space-y-3">
              <div className="text-xs text-gray-300">
                <span className="text-gray-500 block mb-1">Type</span>
                <span className="capitalize text-indigo-400 font-semibold">{activeEnv.type}</span>
              </div>
              <div className="text-xs text-gray-300">
                <span className="text-gray-500 block mb-1">Source file</span>
                <span className="truncate text-gray-300 block">
                  {activeEnv.sourceUrl || 'Procedural Generator'}
                </span>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">HDR Exposure</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={activeEnv.exposure}
                    onChange={(e) => updateEnvironment({ exposure: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                  <span className="text-xs text-white">{activeEnv.exposure}x</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Integration Modules: Calibration & Real-time Keying & Tracking Monitors */}
        <div className="p-4 border-t border-[#2d2d35] space-y-4 bg-[#1e1e24]">
          <h3 className="text-xs font-bold text-gray-400 uppercase">Compositing & Green Screen</h3>
          <ChromaKeyInspector />
        </div>

        <div className="p-4 border-t border-[#2d2d35] space-y-4 bg-[#1e1e24]">
          <h3 className="text-xs font-bold text-gray-400 uppercase">
            Hardware Tracking Diagnostic
          </h3>
          <TrackingMonitor />
          <CalibrationPanel />
        </div>
      </div>
    </div>
  );
}
