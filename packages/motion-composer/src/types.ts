// Core Models for Motion Graphics Composer SDK
export type LayerType =
  | 'pre_composition'
  | 'null'
  | 'adjustment'
  | 'camera'
  | 'light'
  | 'shape'
  | 'text'
  | 'media'
  | 'guide';

export type ShapeType = 'rectangle' | 'ellipse' | 'polygon' | 'star' | 'bezier';

export interface Transform3D {
  position: [number, number, number]; // [x, y, z]
  rotation: [number, number, number]; // [rx, ry, rz]
  scale: [number, number, number];    // [sx, sy, sz]
  anchorPoint: [number, number];      // [ax, ay]
  opacity: number;                    // 0.0 to 1.0
}

export interface CompositionLayer {
  id: string;
  name: string;
  type: LayerType;
  transform: Transform3D;
  parentId?: string; // For parenting rigging
  startFrame: number;
  duration: number;
  isLocked: boolean;
  isShy: boolean;
  labelColor?: string;
  effects?: string[]; // Stacked effects IDs
  [key: string]: any; // Allow web UI components to attach dynamic UI/state attributes smoothly
}

export interface PreCompositionLayer extends CompositionLayer {
  type: 'pre_composition';
  nestedCompositionId: string;
  timeStretch: number; // stretch factor
  overrides?: Record<string, any>; // Dynamic template override properties
}

export interface ShapeStyle {
  fillColor?: string;
  fillGradient?: {
    type: 'linear' | 'radial';
    colors: Array<{ offset: number; color: string }>;
  };
  strokeColor?: string;
  strokeWidthPx?: number;
}

export interface ShapePath {
  type: ShapeType;
  points?: Array<[number, number]>; // For Bezier / Pen Tool
  width?: number; // For Rectangle
  height?: number;
  radiusX?: number; // For Ellipse
  radiusY?: number;
  pointsCount?: number; // For Polygon / Star
  innerRadius?: number; // For Star
  booleanOperation?: 'add' | 'subtract' | 'intersect' | 'exclude';
}

export interface ShapeLayer extends CompositionLayer {
  type: 'shape';
  shapes: ShapePath[];
  style: ShapeStyle;
}

export interface TextLayer extends CompositionLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
  pathId?: string; // For text on path rigging
  charAnimation?: {
    tracking?: number;
    wordSpacing?: number;
    preset?: string;
  };
}

export interface CameraLayer extends CompositionLayer {
  type: 'camera';
  projection: 'perspective' | 'orthographic';
  focalLengthMm: number;
  depthOfField: {
    enabled: boolean;
    apertureSize: number;
    focusDistance: number;
  };
  lookAtTargetId?: string; // Follow target rigging
}

export interface RiggingConstraint {
  id: string;
  type: string; // look_at | follow_path | parent_transform | ik_resolver | etc.
  sourceLayerId: string;
  targetId: string; // layerId or pathId
  weight: number; // 0.0 to 1.0 influence
}

export interface Composition {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  durationFrames: number;
  layers: CompositionLayer[];
  constraints: RiggingConstraint[];
  markers: Array<{ id: string; frame: number; label: string }>;
  version: string;
}

// Extensibility Plugin Interfaces
export interface LayerTypePlugin {
  id: string;
  name: string;
  type: LayerType;
  render: (ctx: CanvasRenderingContext2D, layer: CompositionLayer, time: number) => Promise<void>;
}

export interface ShapeGeneratorPlugin {
  id: string;
  name: string;
  generatePath: (type: ShapeType, params: any) => Promise<Array<[number, number]>>;
}
