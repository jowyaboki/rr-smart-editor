import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CaptionTrack } from '@ai-video-editor/shared';
import { CaptionEngine } from '@/features/captions/engine/CaptionEngine';
import { TextEngine } from '@/features/text/engine/TextEngine';
import { useTextStore } from '@/features/text/store/textStore';

interface CaptionLayerProps {
  track: CaptionTrack;
}

export const CaptionLayer: React.FC<CaptionLayerProps> = ({ track }) => {
  const frame = useCurrentFrame();
  const { reusableStyles } = useTextStore();

  const segment = CaptionEngine.getActiveSegment(track.transcript, frame);
  const style = reusableStyles.find(s => s.id === track.styleId) || reusableStyles[0];

  if (!segment || !style) return null;

  // Use TextEngine for styles, but position at bottom for captions
  const baseStyles = TextEngine.getStyleObject({
    id: 'temp',
    content: segment.text,
    style,
    layout: {
      width: 'auto',
      height: 'auto',
      padding: 20,
      textAlign: 'center',
      verticalAlign: 'bottom',
      wrap: true,
      overflow: 'visible'
    },
    transform: { rotation: 0, scale: 1, originX: 'center', originY: 'center' }
  });

  return (
    <AbsoluteFill style={{ ...baseStyles, bottom: 50, top: 'auto', pointerEvents: 'none' }}>
      {segment.words.map((word) => {
        const isCurrent = frame >= word.startFrame && frame <= word.endFrame;
        return (
          <span key={word.id} style={{
            color: isCurrent ? 'yellow' : 'white',
            transition: 'color 0.1s ease'
          }}>
            {word.text}{' '}
          </span>
        );
      })}
    </AbsoluteFill>
  );
};
