import React from 'react';
import { useAudioStore } from '../store/audioStore';
import { globalAudioEngine2 } from '@ai-video-editor/audio-engine';
import { RoutingMatrix } from './RoutingMatrix';
import { AutomationCurveEditor } from './AutomationCurveEditor';
import { LoudnessMeter } from './LoudnessMeter';
import { SpeechTranscriptionPanel } from './SpeechTranscriptionPanel';
import { RestorationRack } from './RestorationRack';

export function AudioMixerPanel() {
  const { project, setProject, updateTrackFader, updateTrackPan, toggleTrackMute, toggleTrackSolo, mixerState, updateMixerState } = useAudioStore();

  const handleInit = () => {
    const defaultProject = globalAudioEngine2.createProject('proj-audio', 'Commercial Dub Master');

    // Add dialogue track
    const defaultMixer = { id: 'mixer-1', faderGainDb: 0.0, pan: 0.0, solo: false, mute: false, monitor: true, channelLayout: 'stereo' as any };
    defaultProject.tracks['track-dialogue'] = {
      id: 'track-dialogue',
      name: 'Dialogue Track',
      type: 'audio',
      mixer: defaultMixer,
      effectChain: { id: 'chain-1', effects: [] },
      clips: [],
      targetBusId: 'master',
      sendGains: {},
    };

    // Add music track
    defaultProject.tracks['track-music'] = {
      id: 'track-music',
      name: 'Music Bed',
      type: 'audio',
      mixer: { ...defaultMixer, id: 'mixer-2', faderGainDb: -12.0 },
      effectChain: { id: 'chain-2', effects: [] },
      clips: [],
      targetBusId: 'master',
      sendGains: {},
    };

    setProject(defaultProject);
  };

  if (!project) {
    return (
      <div className="p-8 text-center text-gray-400 bg-[#16161a] h-screen flex flex-col justify-center items-center">
        <h2 className="text-xl font-bold mb-4">No Audio Routing Matrix Loaded</h2>
        <button
          onClick={handleInit}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition"
        >
          Initialize Mixer Session
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#141418] text-white">
      {/* Dialogue and tracks panels */}
      <div className="flex-1 flex flex-col border-r border-[#2d2d35]">
        <div className="h-14 bg-[#1e1e24] border-b border-[#2d2d35] flex items-center justify-between px-6">
          <h2 className="text-md font-bold uppercase tracking-wider text-indigo-400">Audio Mixer Console</h2>
          <div className="text-xs text-gray-400">Project: <span className="text-white font-semibold">{project.name}</span></div>
        </div>

        {/* Dynamic Fader Strips */}
        <div className="flex-1 flex p-6 space-x-6 overflow-x-auto items-stretch bg-[#111115]">
          {Object.values(project.tracks).map((track) => (
            <div
              key={track.id}
              onClick={() => updateMixerState({ selectedTrackId: track.id })}
              className={`w-36 bg-[#1a1a20] rounded-lg border p-4 flex flex-col justify-between cursor-pointer transition ${
                mixerState.selectedTrackId === track.id ? 'border-indigo-600' : 'border-[#2d2d35] hover:border-gray-700'
              }`}
            >
              {/* Pan Pot */}
              <div className="text-center space-y-1">
                <span className="text-[10px] text-gray-500 uppercase block font-semibold">Pan</span>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.1"
                  value={track.mixer.pan}
                  onChange={(e) => updateTrackPan(track.id, parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 rounded-lg bg-gray-700"
                />
                <span className="text-[9px] font-mono text-gray-400 block">{track.mixer.pan > 0 ? `R ${track.mixer.pan.toFixed(1)}` : track.mixer.pan < 0 ? `L ${Math.abs(track.mixer.pan).toFixed(1)}` : 'Center'}</span>
              </div>

              {/* Fader Slider */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase">dB</span>
                <input
                  type="range"
                  min="-60"
                  max="12"
                  step="0.5"
                  value={track.mixer.faderGainDb}
                  onChange={(e) => updateTrackFader(track.id, parseFloat(e.target.value))}
                  style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' } as any}
                  className="h-44 accent-indigo-500"
                />
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {track.mixer.faderGainDb > 0 ? `+${track.mixer.faderGainDb.toFixed(1)}` : `${track.mixer.faderGainDb.toFixed(1)}`}
                </span>
              </div>

              {/* Mute and Solo */}
              <div className="space-y-2 text-center">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTrackMute(track.id); }}
                    className={`flex-1 py-1 rounded text-xs font-bold transition ${track.mixer.mute ? 'bg-red-600 text-white' : 'bg-[#2d2d35] text-gray-400 hover:text-white'}`}
                  >
                    M
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTrackSolo(track.id); }}
                    className={`flex-1 py-1 rounded text-xs font-bold transition ${track.mixer.solo ? 'bg-yellow-500 text-black' : 'bg-[#2d2d35] text-gray-400 hover:text-white'}`}
                  >
                    S
                  </button>
                </div>
                <div className="truncate text-xs font-semibold text-gray-300">{track.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side Control Rack */}
      <div className="w-80 bg-[#1a1a1f] flex flex-col overflow-y-auto p-4 space-y-6">
        <LoudnessMeter />
        <RoutingMatrix />
        <AutomationCurveEditor />
        <RestorationRack />
        <SpeechTranscriptionPanel />
      </div>
    </div>
  );
}
