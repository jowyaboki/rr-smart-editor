import React, { useEffect, useState } from 'react';
import { useMotionComposerStore } from '../store/motionComposerStore';
import { LayerTimeline } from './LayerTimeline';
import { ShapeControls } from './ShapeControls';
import { CameraControls } from './CameraControls';
import { RiggingControls } from './RiggingControls';
import { CompositionLayer } from '@ai-video-editor/motion-composer';

export const ComposerDashboard: React.FC = () => {
  const {
    activeComp,
    selectedLayerId,
    currentTime,
    isPlaying,
    initComposerStore,
    selectLayer,
    setFrame,
    addLayer,
    removeLayer,
  } = useMotionComposerStore();

  const [activeTab, setActiveTab] = useState<'shape' | 'camera' | 'rigging'>('shape');

  useEffect(() => {
    initComposerStore();
  }, [initComposerStore]);

  if (!activeComp) {
    return (
      <div style={{ padding: '24px', fontFamily: 'sans-serif', color: '#fff', background: '#121214', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Loading Motion Composer Workspace...</h3>
          <p style={{ color: '#888' }}>Initializing high-performance motion graphics canvas</p>
        </div>
      </div>
    );
  }

  const selectedLayer = activeComp.layers.find(l => l.id === selectedLayerId);

  const handleAddNewShapeLayer = () => {
    const newId = `shape_${Date.now()}`;
    const newLayer: CompositionLayer = {
      id: newId,
      name: `Shape Vector Layer ${activeComp.layers.length + 1}`,
      type: 'shape',
      transform: {
        position: [960, 540, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [50, 50],
        opacity: 1,
      },
      startFrame: 0,
      duration: 100,
      isLocked: false,
      isShy: false,
      shapeType: 'rectangle',
      shapeProperties: {
        fillColor: '#FF3366',
        strokeColor: '#FFFFFF',
        strokeWidth: 4,
        cornerRadius: 8,
      },
    };
    addLayer(newLayer);
    selectLayer(newId);
  };

  const handleAddNewCameraLayer = () => {
    const newId = `camera_${Date.now()}`;
    const newLayer: CompositionLayer = {
      id: newId,
      name: `3D Cinematics Camera ${activeComp.layers.length + 1}`,
      type: 'camera',
      transform: {
        position: [960, 540, -1000],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        anchorPoint: [0, 0],
        opacity: 1,
      },
      startFrame: 0,
      duration: 150,
      isLocked: false,
      isShy: false,
      focalLength: 50,
      aperture: 2.8,
      depthOfField: true,
      focusDistance: 1000,
    };
    addLayer(newLayer);
    selectLayer(newId);
    setActiveTab('camera');
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: '60px 1fr 240px',
      height: '100vh',
      backgroundColor: '#0f0f11',
      color: '#e2e8f0',
      fontFamily: 'Inter, system-ui, sans-serif',
      boxSizing: 'border-box',
    }}>
      {/* HEADER SECTION */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid #1e1e24',
        backgroundColor: '#141417',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 600, color: '#f8fafc', letterSpacing: '0.5px' }}>
            🔮 Motion Graphics Composer
          </h2>
          <span style={{ fontSize: '12px', background: '#22c55e20', color: '#22c55e', padding: '4px 8px', borderRadius: '4px', fontWeight: 500 }}>
            Live Composition: {activeComp.name}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleAddNewShapeLayer}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ➕ Add Vector Shape
          </button>
          <button
            onClick={handleAddNewCameraLayer}
            style={{
              padding: '8px 16px',
              backgroundColor: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🎥 Add Cinematic Camera
          </button>
        </div>
      </header>

      {/* MIDDLE SECTION - CANVAS & INSPECTOR PANELS */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        overflow: 'hidden',
      }}>
        {/* VIEWPORT & GRAPHICS STAGE */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          borderRight: '1px solid #1e1e24',
          position: 'relative',
          padding: '24px',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '800px',
            aspectRatio: '16/9',
            backgroundColor: '#000000',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid #27272a',
          }}>
            {/* Visual preview of layers on canvas */}
            {activeComp.layers.map((layer) => {
              const [x, y] = layer.transform.position;
              const [sx, sy] = layer.transform.scale;
              const rot = layer.transform.rotation[2]; // Z-Rotation

              return (
                <div
                  key={layer.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectLayer(layer.id);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${(x / 1920) * 100}%`,
                    top: `${(y / 1080) * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${sx}, ${sy})`,
                    cursor: 'pointer',
                    userSelect: 'none',
                    border: selectedLayerId === layer.id ? '2px solid #3b82f6' : '1px dashed #52525b',
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor: layer.type === 'shape' ? (layer.shapeProperties?.fillColor || '#10b981') : '#4b5563',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    transition: 'border 0.2s',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {layer.name} ({layer.type})
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '16px', color: '#71717a', fontSize: '12px', display: 'flex', gap: '24px' }}>
            <span>📺 Canvas: {activeComp.width}x{activeComp.height} @ {activeComp.fps} FPS</span>
            <span>⏱️ Playhead: Frame {currentTime} / {activeComp.durationFrames}</span>
          </div>
        </div>

        {/* CONTROLS INSPECTOR PANEL */}
        <aside style={{
          backgroundColor: '#141417',
          display: 'grid',
          gridTemplateRows: '48px 1fr',
          overflow: 'hidden',
        }}>
          {/* Tabs header */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #1e1e24',
            backgroundColor: '#121214',
          }}>
            {(['shape', 'camera', 'rigging'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  border: 'none',
                  backgroundColor: activeTab === tab ? '#1e1e24' : 'transparent',
                  color: activeTab === tab ? '#f8fafc' : '#71717a',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab ? '2px solid #3b82f6' : 'none',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content body */}
          <div style={{ padding: '20px', overflowY: 'auto' }}>
            {activeTab === 'shape' && (
              <ShapeControls />
            )}
            {activeTab === 'camera' && (
              <CameraControls />
            )}
            {activeTab === 'rigging' && (
              <RiggingControls />
            )}
          </div>
        </aside>
      </main>

      {/* FOOTER TIMELINE TRACK EDITOR */}
      <footer style={{
        borderTop: '1px solid #1e1e24',
        backgroundColor: '#121214',
        overflow: 'hidden',
      }}>
        <LayerTimeline />
      </footer>
    </div>
  );
};
