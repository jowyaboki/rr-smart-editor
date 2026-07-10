import React from 'react';
import { Sequence, Video, Audio, Img, AbsoluteFill } from 'remotion';
import { useTimelineStore } from '@/features/timeline/store/timelineStore';
import { useTransitionStore } from '@/features/transitions/store/transitionStore';
import { TransitionWrapper } from './TransitionWrapper';

export const CompositionBuilder: React.FC = () => {
  const tracks = useTimelineStore((state) => state.tracks);
  const { instances, presets } = useTransitionStore();

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {tracks.map((track) => (
        <React.Fragment key={track.id}>
          {track.clips.map((clip) => {
            const transition = instances.find(i => i.toClipId === clip.id || i.fromClipId === clip.id);
            const preset = transition ? presets.find(p => p.id === transition.transitionId) : null;

            const content = (
              <>
                {clip.type === 'video' && (
                  <Video
                    src={(clip as any).url}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
                {clip.type === 'audio' && (
                  <Audio src={(clip as any).url} />
                )}
                {clip.type === 'image' && (
                  <Img
                    src={(clip as any).url}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
                {clip.type === 'text' && (
                  <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ color: 'white', fontSize: 50 }}>
                      {(clip as any).content}
                    </div>
                  </AbsoluteFill>
                )}
              </>
            );

            return (
              <Sequence
                key={clip.id}
                from={clip.startFrame}
                durationInFrames={clip.durationFrames}
              >
                {preset ? (
                  <TransitionWrapper
                    type={preset.type}
                    duration={preset.defaultSettings.durationFrames}
                    settings={preset.defaultSettings}
                  >
                    {content}
                  </TransitionWrapper>
                ) : content}
              </Sequence>
            );
          })}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};
