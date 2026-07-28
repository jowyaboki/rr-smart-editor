import React, { useEffect } from 'react';
import { useCompositorStore } from '../store/compositorStore';
import { LiveCanvas } from './LiveCanvas';
import { NodeInspector } from './NodeInspector';
import { SplitPreview } from './SplitPreview';
import { PerformanceOverlay } from './PerformanceOverlay';
import { Node } from '@ai-video-editor/node-compositor';

export const NodeDashboard: React.FC = () => {
  const {
    graph,
    viewMode,
    isExecuting,
    initCompositorStore,
    runExecution,
    optimizeGraph,
    setViewMode,
    addNode,
  } = useCompositorStore();

  useEffect(() => {
    initCompositorStore();
  }, [initCompositorStore]);

  const handleAddNewBlurNode = () => {
    const newId = `node_blur_${Date.now()}`;
    const newNode: Node = {
      id: newId,
      name: `Gaussian Blur Filter ${graph.nodes.length}`,
      category: 'blur',
      type: 'gaussian_blur',
      position: { x: 100, y: 300 },
      inputs: [
        { id: `p_in_${newId}`, name: 'input', direction: 'input', type: 'image' },
        { id: `p_rad_${newId}`, name: 'radius', direction: 'input', type: 'number', value: 15 },
      ],
      outputs: [{ id: `p_out_${newId}`, name: 'image', direction: 'output', type: 'image' }],
      properties: { radius: 15 },
    };
    addNode(newNode);
  };

  const handleAddNewAiNode = () => {
    const newId = `node_ai_${Date.now()}`;
    const newNode: Node = {
      id: newId,
      name: 'AI Face-Blur Redaction',
      category: 'ai',
      type: 'ai_face_blur',
      position: { x: 100, y: 350 },
      inputs: [{ id: `p_in_${newId}`, name: 'input', direction: 'input', type: 'image' }],
      outputs: [{ id: `p_out_${newId}`, name: 'image', direction: 'output', type: 'image' }],
      properties: { sensitivity: 0.8 },
    };
    addNode(newNode);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '50px 1fr',
        height: '100vh',
        backgroundColor: '#0c0c0e',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, sans-serif',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* HEADER CONTROLLER */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          backgroundColor: '#111115',
          borderBottom: '1px solid #1f1f23',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 700,
              margin: 0,
              color: '#f8fafc',
              letterSpacing: '0.5px',
            }}
          >
            ⚗️ Procedural Node Compositor
          </h2>
          <span
            style={{
              fontSize: '10px',
              backgroundColor: '#8b5cf620',
              color: '#8b5cf6',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            Active: {graph.name}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleAddNewBlurNode}
            style={{
              padding: '6px 12px',
              backgroundColor: '#1e1e24',
              color: '#e2e8f0',
              border: '1px solid #27272a',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ➕ Blur Filter
          </button>
          <button
            onClick={handleAddNewAiNode}
            style={{
              padding: '6px 12px',
              backgroundColor: '#1e1e24',
              color: '#e2e8f0',
              border: '1px solid #27272a',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🤖 AI Face Redactor
          </button>
          <button
            onClick={optimizeGraph}
            style={{
              padding: '6px 12px',
              backgroundColor: '#10b98120',
              color: '#10b981',
              border: '1px solid #10b98140',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🚀 Fold & Fuse Graph
          </button>
          <button
            onClick={runExecution}
            disabled={isExecuting}
            style={{
              padding: '6px 14px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isExecuting ? 'Rendering...' : 'Execute DAG'}
          </button>
        </div>
      </header>

      {/* 3-PANE LAYOUT */}
      <main
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          padding: '16px',
          gap: '16px',
          overflow: 'hidden',
        }}
      >
        {/* LEFT CANVAS WORKSPACE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['preview', 'split', 'diff', 'heatmap'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: viewMode === mode ? '#1e1e24' : 'transparent',
                  color: viewMode === mode ? '#fff' : '#a1a1aa',
                  border: viewMode === mode ? '1px solid #27272a' : '1px solid transparent',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {mode} View
              </button>
            ))}
          </div>
          <LiveCanvas />
        </div>

        {/* RIGHT PROPERTY INSPECTORS & PREVIEWS */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          <SplitPreview />
          <PerformanceOverlay />
          <div
            style={{
              backgroundColor: '#141417',
              border: '1px solid #27272a',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <NodeInspector />
          </div>
        </div>
      </main>
    </div>
  );
};
