import { z } from 'zod';

export interface TimelineViewport {
  scrollLeft: number;    // horizontal scroll in pixels
  scrollTop: number;     // vertical scroll in pixels
  width: number;         // viewport width in pixels
  height: number;        // viewport height in pixels
  pxPerFrame: number;    // horizontal zoom level (pixels per frame)
}

export const TimelineViewportSchema = z.object({
  scrollLeft: z.number().nonnegative(),
  scrollTop: z.number().nonnegative(),
  width: z.number().positive(),
  height: z.number().positive(),
  pxPerFrame: z.number().positive(),
});

export interface VisibleRegion {
  startFrame: number;
  endFrame: number;
  startTrackIdx: number;
  endTrackIdx: number;
}

export const VisibleRegionSchema = z.object({
  startFrame: z.number().nonnegative(),
  endFrame: z.number().nonnegative(),
  startTrackIdx: z.number().nonnegative(),
  endTrackIdx: z.number().nonnegative(),
});

export interface VirtualTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'overlay' | string;
  height: number;        // height in pixels
  yOffset: number;       // vertical top position in pixels
  isLocked?: boolean;
  isMuted?: boolean;
}

export const VirtualTrackSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  type: z.string(),
  height: z.number().positive(),
  yOffset: z.number().nonnegative(),
  isLocked: z.boolean().optional(),
  isMuted: z.boolean().optional(),
});

export interface VirtualClip {
  id: string;
  trackId: string;
  name: string;
  startFrame: number;
  duration: number;
  sourceDuration?: number;
  type: 'video' | 'audio' | 'image' | 'text' | 'effect' | string;
  isSelected?: boolean;
  color?: string;
  metadata?: Record<string, any>;
}

export const VirtualClipSchema = z.object({
  id: z.string().min(1),
  trackId: z.string().min(1),
  name: z.string(),
  startFrame: z.number().nonnegative(),
  duration: z.number().positive(),
  sourceDuration: z.number().positive().optional(),
  type: z.string(),
  isSelected: z.boolean().optional(),
  color: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export interface VirtualKeyframe {
  id: string;
  clipId: string;
  property: string;      // e.g. 'opacity', 'scale', 'volume'
  frame: number;         // offset frame inside the clip or absolute frame
  value: number | string;
  easing?: 'linear' | 'step' | 'bezier' | 'bounce' | string;
}

export const VirtualKeyframeSchema = z.object({
  id: z.string().min(1),
  clipId: z.string().min(1),
  property: z.string().min(1),
  frame: z.number().nonnegative(),
  value: z.union([z.number(), z.string()]),
  easing: z.string().optional(),
});

export interface TimelineMarker {
  id: string;
  name: string;
  frame: number;
  color?: string;
}

export const TimelineMarkerSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  frame: z.number().nonnegative(),
  color: z.string().optional(),
});

export interface RenderChunk {
  id: string;
  startFrame: number;
  endFrame: number;
  isDirty: boolean;
}

export const RenderChunkSchema = z.object({
  id: z.string(),
  startFrame: z.number().nonnegative(),
  endFrame: z.number().nonnegative(),
  isDirty: z.boolean(),
});

export interface TimelineCache {
  viewport: TimelineViewport;
  visibleClips: string[]; // Clip IDs currently visible and cached
  clipGeometries: Record<string, { x: number; y: number; width: number; height: number }>;
}

export const TimelineCacheSchema = z.object({
  viewport: TimelineViewportSchema,
  visibleClips: z.array(z.string()),
  clipGeometries: z.record(z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  })),
});
