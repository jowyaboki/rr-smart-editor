import React from 'react';
import { Sequence, Video, Audio, Img, AbsoluteFill } from 'remotion';
import { useTimelineStore } from '@/features/timeline/store/timelineStore';
import { useTransitionStore } from '@/features/transitions/store/transitionStore';
import { useEffectStore } from '@/features/effects/store/effectStore';
import { useTextStore } from '@/features/text/store/textStore';
import { useCaptionStore } from '@/features/captions/store/captionStore';
import { useAudioStore } from '@/features/audio/store/audioStore';
import { TransitionWrapper } from './TransitionWrapper';
import { EffectWrapper } from './EffectWrapper';
import { TextLayer } from './TextLayer';
import { CaptionLayer } from './CaptionLayer';

export const CompositionBuilder: React.FC = () => {
  const tracks = useTimelineStore((state) => state.tracks);
  const { instances: transitions, presets: transPresets } = useTransitionStore();
  const { clipEffects } = useEffectStore();
  const { textObjects } = useTextStore();
  const { tracks: captionTracks } = useCaptionStore();
  const { tracks: audioTracks, masterVolume } = useAudioStore();

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Visual Content Tracks */}
      {tracks.map((track) => (
        <React.Fragment key={track.id}>
          {track.clips.map((clip) => {
            const transition = transitions.find(i => i.toClipId === clip.id || i.fromClipId === clip.id);
            const transPreset = transition ? transPresets.find(p => p.id === transition.transitionId) : null;
            const effects = clipEffects[clip.id] || [];
            const textObj = textObjects[clip.id];

            const baseContent = (
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
                {clip.type === 'text' && textObj && (
                  <TextLayer textObj={textObj} />
                )}
              </>
            );

            const contentWithEffects = (
              <EffectWrapper instances={effects}>
                {baseContent}
              </EffectWrapper>
            );

            return (
              <Sequence
                key={clip.id}
                from={clip.startFrame}
                durationInFrames={clip.durationFrames}
              >
                {transPreset ? (
                  <TransitionWrapper
                    type={transPreset.type}
                    duration={transPreset.defaultSettings.durationFrames}
                    settings={transPreset.defaultSettings}
                  >
                    {contentWithEffects}
                  </TransitionWrapper>
                ) : contentWithEffects}
              </Sequence>
            );
          })}
        </React.Fragment>
      ))}

      {/* Audio Tracks */}
      {audioTracks.map(track => (
        <React.Fragment key={track.id}>
          {track.clips.map(clip => (
            <Sequence key={clip.id} from={clip.startFrame} durationInFrames={clip.durationFrames}>
              <Audio
                src={(clip as any).url}
                volume={track.isMuted ? 0 : clip.volume * track.volume * masterVolume}
              />
            </Sequence>
          ))}
        </React.Fragment>
      ))}

      {/* Caption Overlay */}
      {captionTracks.filter(t => t.isEnabled).map(track => (
        <CaptionLayer key={track.id} track={track} />
      ))}
    </AbsoluteFill>
  );
};
