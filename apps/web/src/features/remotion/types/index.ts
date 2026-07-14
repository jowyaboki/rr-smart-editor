import {
  CompositionTree as SharedCompositionTree,
  NodeType as SharedNodeType,
  AssetNode as SharedAssetNode
} from '@ai-video-editor/shared';

export type CompositionTree = SharedCompositionTree;
export type NodeType = SharedNodeType;
export type AssetNode = SharedAssetNode;

export interface AssetResolution {
  url: string;
  type: NodeType;
  isResolved: boolean;
}
