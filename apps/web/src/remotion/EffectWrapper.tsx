import React from 'react';
import { useCurrentFrame } from 'remotion';
import { EffectInstance } from '@ai-video-editor/shared';
import { EffectEngine } from '@/features/effects/engine/EffectEngine';

interface EffectWrapperProps {
  instances: EffectInstance[];
  children: React.ReactNode;
}

export const EffectWrapper: React.FC<EffectWrapperProps> = ({ instances, children }) => {
  const frame = useCurrentFrame();
  const styles = EffectEngine.evaluateStack(instances, frame);

  return (
    <div style={{ width: '100%', height: '100%', ...styles }}>
      {children}
    </div>
  );
};
