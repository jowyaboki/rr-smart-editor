import React, { useRef, useEffect, useState } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import { useTimelineVirtualization } from '../hooks/useTimelineVirtualization';
import { GeometryService } from '@ai-video-editor/timeline-engine';
import { VirtualClip, VirtualTrack } from '../types';

export type TrackRenderer = (track: VirtualTrack, children: React.ReactNode) => React.ReactNode;
export type ClipRenderer = (clip: VirtualClip) => React.ReactNode;

export class TimelinePluginRegistry {
  private static trackRenderers: Record<string, TrackRenderer> = {};
  private static clipRenderers: Record<string, ClipRenderer> = {};

  public static registerTrackRenderer(type: string, renderer: TrackRenderer) {
    this.trackRenderers[type] = renderer;
  }

  public static registerClipRenderer(type: string, renderer: ClipRenderer) {
    this.clipRenderers[type] = renderer;
  }

  public static getTrackRenderer(type: string): TrackRenderer | undefined {
    return this.trackRenderers[type];
  }

  public static getClipRenderer(type: string): ClipRenderer | undefined {
    return this.clipRenderers[type];
  }
}

export const VirtualTimeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    viewport,
    visibleRegion,
    visibleClips,
    visibleMarkers,
    tracks,
    totalTracksCount,
  } = useTimelineVirtualization(100, 1);

  const {
    clips,
    selectedClipIds,
    setViewport,
    selectClips,
    startDrag,
    updateDrag,
    endDrag,
    moveClip,
    resizeClip,
  } = useTimelineStore();

  const [fps, setFps] = useState(60);
  const [scaleFactor, setScaleFactor] = useState(0.5); // pxPerFrame

  // 1. Zoom handler
  const handleZoom = (newScale: number) => {
    const scale = Math.max(0.1, Math.min(newScale, 5));
    setScaleFactor(scale);
    setViewport({ pxPerFrame: scale });
  };

  // 2. Measure scroll offsets
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setViewport({
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop,
    });
  };

  // 3. Keep track of FPS during active drag/pan animations
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let animId: number;

    const tick = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // 4. Drag & Drop interactions
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragStartFrame, setDragStartFrame] = useState(0);

  const handleMouseDown = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation();
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;

    selectClips([clipId]);

    const rect = e.currentTarget.getBoundingClientRect();
    const clickXOffset = e.clientX - rect.left;
    const clickedFrameOffset = GeometryService.xToFrame(clickXOffset, viewport.pxPerFrame);

    startDrag(clipId, clickedFrameOffset);
    setActiveDragId(clipId);
    setDragStartFrame(clip.startFrame);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!activeDragId || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - containerRect.left + viewport.scrollLeft;

    // Convert clientX back into absolute frame offset
    const currentFrame = GeometryService.xToFrame(currentX, viewport.pxPerFrame);

    // Find track boundary under mouse clientY
    const currentY = e.clientY - containerRect.top + viewport.scrollTop;

    // Simple vertical track mapping based on track coordinates
    let targetTrackId: string | undefined = undefined;
    for (const tr of tracks) {
      if (currentY >= tr.yOffset && currentY < tr.yOffset + tr.height) {
        targetTrackId = tr.id;
        break;
      }
    }

    updateDrag(currentFrame, targetTrackId);
  };

  const handleMouseUp = () => {
    if (activeDragId) {
      endDrag();
      setActiveDragId(null);
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#0a1929',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        maxWidth: '900px',
        margin: '20px auto',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top dashboard metadata */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Virtual Timeline Engine</h2>
          <div style={{ fontSize: '11px', color: '#b2bac2', marginTop: '4px' }}>
            Horizontal + Vertical virtual scroll window culling • <strong>{fps} FPS target</strong>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
          <div>Visible Clips: <strong>{visibleClips.length}</strong> / {clips.length}</div>
          <div>Visible Tracks: <strong>{tracks.length}</strong> / {totalTracksCount}</div>
        </div>
      </div>

      {/* Control sliders */}
      <div style={{ display: 'flex', gap: '20px', backgroundColor: '#102031', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Zoom:</span>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={scaleFactor}
            onChange={e => handleZoom(parseFloat(e.target.value))}
            style={{ width: '120px' }}
          />
          <span>{Math.round(scaleFactor * 100)}%</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          {/* Quick test: add 10,000 mock clips */}
          <button
            onClick={() => {
              const bulkClips: VirtualClip[] = [];
              const bulkTracks: VirtualTrack[] = [];

              for (let t = 1; t <= 100; t++) {
                bulkTracks.push({
                  id: `tr_${t}`,
                  name: `Track ${t}`,
                  type: t % 2 === 0 ? 'video' : 'audio',
                  height: 48,
                  yOffset: (t - 1) * 54,
                });

                for (let c = 1; c <= 100; c++) {
                  bulkClips.push({
                    id: `clip_${t}_${c}`,
                    trackId: `tr_${t}`,
                    name: `Clip [T${t}-C${c}]`,
                    startFrame: (c - 1) * 300 + Math.floor(Math.random() * 20),
                    duration: 200,
                    type: t % 2 === 0 ? 'video' : 'audio',
                    color: t % 2 === 0 ? '#4caf50' : '#2196f3',
                  });
                }
              }

              useTimelineStore.getState().setTracks(bulkTracks);
              useTimelineStore.getState().setClips(bulkClips);
              alert('Successfully bootstrapped 10,000 clips across 100 tracks!');
            }}
            style={{ padding: '4px 10px', fontSize: '11px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '3px', color: '#fff', cursor: 'pointer' }}
          >
            Bootstrap 10,000 Clips
          </button>
        </div>
      </div>

      {/* Main virtual container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: '280px',
          overflow: 'auto',
          backgroundColor: '#071221',
          position: 'relative',
          border: '1px solid #1e293b',
          borderRadius: '4px',
        }}
      >
        {/* Virtual track grid */}
        <div
          style={{
            width: `${120000 * scaleFactor}px`, // 120k frames virtual width
            height: `${totalTracksCount * 54}px`, // Total tracks height
            position: 'relative',
          }}
        >
          {/* Render Tracks (only visible ones culling vertical tracks) */}
          {tracks.map(track => {
            const children = (
              <>
                {/* Track label */}
                <div style={{ position: 'sticky', left: 0, width: '120px', height: '100%', backgroundColor: '#102031', borderRight: '1px solid #1e293b', zIndex: 10, fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', paddingLeft: '8px', pointerEvents: 'none' }}>
                  {track.name}
                </div>

                {/* Visible Clips inside this track */}
                {visibleClips
                  .filter(clip => clip.trackId === track.id)
                  .map(clip => {
                    const rect = GeometryService.getClipRect(clip, [track], scaleFactor);
                    const isSelected = selectedClipIds.includes(clip.id);

                    const customClipRenderer = TimelinePluginRegistry.getClipRenderer(clip.type);

                    return (
                      <div
                        key={clip.id}
                        onMouseDown={e => handleMouseDown(e, clip.id)}
                        style={{
                          position: 'absolute',
                          left: `${rect.x}px`,
                          width: `${rect.width}px`,
                          height: '42px',
                          top: '3px',
                          backgroundColor: clip.color || '#4caf50',
                          borderRadius: '4px',
                          border: isSelected ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.2)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          cursor: 'grab',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 8px',
                          boxSizing: 'border-box',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: '#0a1929',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {customClipRenderer ? customClipRenderer(clip) : clip.name}
                      </div>
                    );
                  })}
              </>
            );

            const customTrackRenderer = TimelinePluginRegistry.getTrackRenderer(track.type);

            return (
              <div
                key={track.id}
                style={{
                  position: 'absolute',
                  top: `${track.yOffset}px`,
                  width: '100%',
                  height: `${track.height}px`,
                  backgroundColor: '#0c1726',
                  borderBottom: '1px solid #1e293b',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {customTrackRenderer ? customTrackRenderer(track, children) : children}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
