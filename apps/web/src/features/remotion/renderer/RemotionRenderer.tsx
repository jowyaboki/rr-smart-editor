import React from 'react';
import { Sequence, Video, Audio, Img, AbsoluteFill } from 'remotion';
import { CompositionTree, AssetNode } from '../types';

interface RemotionRendererProps {
  tree: CompositionTree;
}

export const RemotionRenderer: React.FC<RemotionRendererProps> = ({ tree }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {tree.tracks.map((track) => (
        <React.Fragment key={track.id}>
          {track.clips.map((clip) => (
            <Sequence
              key={clip.id}
              from={clip.startFrame}
              durationInFrames={clip.durationInFrames}
            >
              <AssetRenderer clip={clip} />
            </Sequence>
          ))}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

const AssetRenderer: React.FC<{ clip: AssetNode }> = ({ clip }) => {
  const commonStyle: React.CSSProperties = {
    position: 'absolute',
    left: clip.transform.x,
    top: clip.transform.y,
    transform: `scale(${clip.transform.scale}) rotate(${clip.transform.rotation}deg)`,
    opacity: clip.transform.opacity,
    ...clip.style
  };

  if (!clip.url && clip.type !== 'text') {
    return (
      <AbsoluteFill style={{ ...commonStyle, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid red' }}>
         <div style={{ color: 'red' }}>Asset Missing</div>
      </AbsoluteFill>
    );
  }

  switch (clip.type) {
    case 'video':
      return <Video src={clip.url!} style={{ ...commonStyle, width: '100%', height: '100%', objectFit: 'contain' }} />;
    case 'image':
      return <Img src={clip.url!} style={{ ...commonStyle, width: '100%', height: '100%', objectFit: 'contain' }} />;
    case 'audio':
      return <Audio src={clip.url!} />;
    case 'text':
      return (
        <AbsoluteFill style={{ ...commonStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ color: 'white', fontSize: 50 }}>{(clip as any).content || 'Text'}</div>
        </AbsoluteFill>
      );
    default:
      return null;
  }
};
