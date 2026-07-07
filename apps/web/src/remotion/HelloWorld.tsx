import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const HelloWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#0a1929',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '100px',
        fontWeight: 'bold',
        opacity,
        fontFamily: 'sans-serif',
      }}
    >
      Hello Remotion
    </div>
  );
};
