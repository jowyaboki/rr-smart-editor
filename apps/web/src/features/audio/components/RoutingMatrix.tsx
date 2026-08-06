import React from 'react';
import { useAudioStore } from '../store/audioStore';

export function RoutingMatrix() {
  const { project } = useAudioStore();

  if (!project) return null;

  return (
    <div className="p-4 bg-[#131317] rounded-lg border border-[#2d2d35] space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300 font-bold uppercase">Routing Matrix</span>
        <span className="text-[10px] text-indigo-400 font-semibold uppercase">Bus Sends</span>
      </div>
      <div className="space-y-2 text-xs">
        {Object.values(project.tracks).map((t) => (
          <div
            key={t.id}
            className="flex justify-between items-center p-2 rounded bg-black bg-opacity-35"
          >
            <span className="font-semibold text-gray-300">🔊 {t.name}</span>
            <span className="text-gray-400">
              ➡️ Sends to:{' '}
              <span className="text-indigo-400 font-bold uppercase">{t.targetBusId}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
