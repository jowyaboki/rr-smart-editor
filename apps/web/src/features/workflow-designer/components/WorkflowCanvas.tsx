import React, { useState } from 'react';
import { useWorkflowDesigner } from '../hooks/useWorkflowDesigner';
import { useWorkflowDebugger } from '../hooks/useWorkflowDebugger';
import { Box, Typography, Button, Divider, Chip } from '@mui/material';
import { PlayArrow as PlayIcon, Stop as StopIcon, Speed as DiagnosticIcon } from '@mui/icons-material';

export const WorkflowCanvas: React.FC = () => {
  const { nodes, edges, updateNodePosition } = useWorkflowDesigner();
  const { activeStepNodeId, breakpoints, executionSteps } = useWorkflowDebugger();
  const [zoom, setZoom] = useState(1);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '280px',
        bgcolor: '#050b14',
        border: '1px solid #1b2f54',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 10px rgba(0,240,255,0.1)'
      }}
    >
      {/* Infinite dotted canvas snapping grids background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.15,
          backgroundImage: 'radial-gradient(#00f0ff 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          pointerEvents: 'none'
        }}
      />

      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#00f0ff', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
          Visual Blueprints Automation Canvas
        </Typography>
        <Chip label="Grid Snap: ON" size="small" sx={{ height: 14, fontSize: '0.55rem', bgcolor: '#12203d', color: '#00f0ff' }} />
      </Box>

      {/* Floating Canvas Zoom and Pan controls */}
      <Box sx={{ position: 'absolute', bottom: 10, right: 10, zIndex: 10, display: 'flex', gap: 1 }}>
        <Button size="small" variant="outlined" onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} sx={{ fontSize: '0.65rem', py: 0.25, minWidth: 'unset', px: 1 }}>-</Button>
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>{Math.round(zoom * 100)}%</Typography>
        <Button size="small" variant="outlined" onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} sx={{ fontSize: '0.65rem', py: 0.25, minWidth: 'unset', px: 1 }}>+</Button>
      </Box>

      {/* Exposing Blueprint Nodes with active status borders */}
      <Box sx={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: '100%', height: '100%' }}>
        {nodes.map((node) => {
          const isActive = activeStepNodeId === node.id;
          const hasBp = breakpoints.includes(node.id);
          const step = executionSteps[node.id];

          const nodeColor = isActive
            ? '#00f0ff' // Blue active highlight
            : step?.status === 'completed'
            ? '#10b981' // Success
            : step?.status === 'failed'
            ? '#ef4444' // Error
            : '#1b2f54'; // Default border

          const shadow = isActive ? '0 0 12px rgba(0, 240, 255, 0.4)' : 'none';

          return (
            <Box
              key={node.id}
              sx={{
                position: 'absolute',
                left: node.position.x,
                top: node.position.y,
                width: 140,
                p: 1,
                bgcolor: '#0d1527',
                border: `1.5px solid ${nodeColor}`,
                borderRadius: '6px',
                boxShadow: shadow,
                cursor: 'move',
                zIndex: isActive ? 5 : 2,
                transition: 'all 0.15s ease'
              }}
            >
              {/* Compatible ports indicators */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00f0ff', ml: -1.2 }} />
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', fontSize: '0.68rem' }}>
                  {node.name}
                </Typography>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ec4899', mr: -1.2 }} />
              </Box>

              <Divider sx={{ borderColor: '#1b2f54', my: 0.5 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.55rem', textTransform: 'uppercase' }}>
                  {node.type}
                </Typography>
                {step?.status && (
                  <Chip
                    label={step.status}
                    size="small"
                    sx={{
                      height: 12,
                      fontSize: '0.5rem',
                      bgcolor: step.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(0,240,255,0.1)',
                      color: step.status === 'completed' ? '#10b981' : '#00f0ff',
                      fontWeight: 'bold'
                    }}
                  />
                )}
              </Box>
            </Box>
          );
        })}

        {/* Multi selection SVG links connectors vector drawing */}
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          {edges.map((edge) => {
            const source = nodes.find(n => n.id === edge.sourceNodeId);
            const target = nodes.find(n => n.id === edge.targetNodeId);
            if (!source || !target) return null;

            return (
              <path
                key={edge.id}
                d={`M ${source.position.x + 140} ${source.position.y + 15} C ${source.position.x + 200} ${source.position.y + 15}, ${target.position.x - 60} ${target.position.y + 15}, ${target.position.x} ${target.position.y + 15}`}
                stroke="#00f0ff"
                strokeWidth="1.5"
                fill="transparent"
                strokeDasharray="4 4"
                style={{ animation: 'dash 10s linear infinite' }}
              />
            );
          })}
        </svg>
      </Box>
    </Box>
  );
};
export default WorkflowCanvas;
