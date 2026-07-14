export type NodeType = 'composition' | 'sequence' | 'track' | 'asset' | 'text' | 'shape' | 'audio' | 'video' | 'image' | 'animation';

export interface BaseNode {
  id: string;
  type: NodeType;
  name: string;
}

export interface AssetNode extends BaseNode {
  assetId?: string;
  url?: string;
  durationInFrames: number;
  startFrame: number;
  offsetFrame: number;
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
  };
  style: Record<string, any>;
}

export interface TextNode extends AssetNode {
  content: string;
}

export interface SequenceNode extends BaseNode {
  from: number;
  durationInFrames: number;
  children: NodeType[];
}

export interface TrackNode extends BaseNode {
  index: number;
  clips: AssetNode[];
}

export interface CompositionNode extends BaseNode {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  tracks: TrackNode[];
}

export type CompositionTree = CompositionNode;
