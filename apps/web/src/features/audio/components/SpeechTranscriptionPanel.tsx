import React from 'react';

export function SpeechTranscriptionPanel() {
  return (
    <div className="p-4 bg-[#131317] rounded-lg border border-[#2d2d35] space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300 font-bold uppercase">Whisper Transcription</span>
        <span className="text-[10px] text-green-400 font-semibold uppercase">Provider-Ready</span>
      </div>
      <div className="space-y-1 text-xs text-gray-400 leading-relaxed bg-[#1d1d22] p-3 rounded">
        <div>
          <span className="text-indigo-400 font-bold">[00:01.5] Speaker 1:</span> Good morning,
          welcome to the studio.
        </div>
        <div>
          <span className="text-emerald-400 font-bold">[00:03.2] Speaker 2:</span> Thank you, let's
          start the recording.
        </div>
      </div>
    </div>
  );
}
