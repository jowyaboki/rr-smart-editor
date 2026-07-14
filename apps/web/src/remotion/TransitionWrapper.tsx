import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface TransitionWrapperProps {
  type: string;
  duration: number;
  settings: any;
  children: React.ReactNode;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({ type, duration, settings, children }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const getStyle = (): React.CSSProperties => {
    switch (type) {
      case 'fade':
      case 'crossfade':
        return { opacity: progress };
      case 'dip-to-black':
        // This usually requires a black overlay that fades out
        return { opacity: progress };
      case 'slide':
        const slideOffset = settings.direction === 'left' ? 100 : settings.direction === 'right' ? -100 : 0;
        const slideOffsetY = settings.direction === 'up' ? 100 : settings.direction === 'down' ? -100 : 0;
        return { transform: `translate(${(1 - progress) * slideOffset}%, ${(1 - progress) * slideOffsetY}%)` };
      case 'push':
        const pushOffset = settings.direction === 'left' ? 100 : -100;
        return { transform: `translateX(${(1 - progress) * pushOffset}%)` };
      case 'zoom':
      case 'scale':
        const scale = settings.direction === 'in' ? progress : 2 - progress;
        return { transform: `scale(${scale})`, opacity: progress };
      case 'blur':
        return { filter: `blur(${(1 - progress) * (settings.intensity || 10)}px)`, opacity: progress };
      case 'wipe':
      case 'linear-wipe':
        return { clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` };
      case 'circle-reveal':
        return { clipPath: `circle(${progress * 150}% at 50% 50%)` };
      default:
        return {};
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', ...getStyle(), overflow: 'hidden' }}>
      {children}
    </div>
  );
};
