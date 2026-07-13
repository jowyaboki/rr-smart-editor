import React from 'react';
import { Sequence, Video, Audio, Img, AbsoluteFill } from 'remotion';
import { useTimelineStore } from '../store/useTimelineStore';

export const CompositionBuilder: React.FC = () => {
  const tracks = useTimelineStore((state) => state.tracks);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {tracks.map((track) => (
        <React.Fragment key={track.id}>
          {track.clips.map((clip) => (
            <Sequence key={clip.id} from={clip.start} durationInFrames={clip.duration}>
              {clip.type === 'video' && clip.url && (
                <Video
                  src={clip.url}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
              {clip.type === 'audio' && clip.url && (
                <Audio
                  src={clip.url}
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                />
              )}
              {clip.type === 'image' && clip.url && (
                <Img
                  src={clip.url}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onResize={undefined}
                  onResizeCapture={undefined}
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                />
              )}
              {clip.type === 'text' && (
                <AbsoluteFill
                  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <div style={{ color: 'white', fontSize: 50, ...(clip.style as any) }}>
                    {clip.content}
                  </div>
                </AbsoluteFill>
              )}
            </Sequence>
          ))}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};
