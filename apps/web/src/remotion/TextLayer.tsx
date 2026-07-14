import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TextObject } from '@ai-video-editor/shared';
import { TextEngine } from '@/features/text/engine/TextEngine';

interface TextLayerProps {
  textObj: TextObject;
}

export const TextLayer: React.FC<TextLayerProps> = ({ textObj }) => {
  const styles = TextEngine.getStyleObject(textObj);

  return (
    <AbsoluteFill style={{ ...styles, pointerEvents: 'none' }}>
      {textObj.content}
    </AbsoluteFill>
  );
};
