import React, { useEffect, useState } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { Box, Typography, Button, Divider, Chip, List, ListItem, ListItemText, Tooltip, LinearProgress, Grid } from '@mui/material';
import {
  Speed as SpeedIcon,
  CloudQueue as CloudIcon,
  BugReport as DebugIcon,
  Psychology as AIIcon,
  Verified as HealthIcon,
  Timeline as TimelineIcon,
  CheckCircle as SuccessIcon,
  Leaderboard as StatsIcon
} from '@mui/icons-material';

export const ProductionGraph: React.FC = () => {
  const { selectedContext, setSelectedContext } = useWorkflowStore();
  const [activeTab, setActiveTab] = useState<'cockpit' | 'scene' | 'assets' | 'impact'>('cockpit');

  const sceneNodes = [
    { id: 'sc-1', name: 'Intro Shot Layer', type: 'Scene Layer', status: 'active' },
    { id: 'sc-2', name: 'Gaussian Blur Mask', type: 'Effect Layer', status: 'active', dependsOn: ['sc-1'] },
    { id: 'sc-3', name: 'Voiceover Overdub', type: 'Audio track', status: 'idle' },
  ];

  const assetNodes = [
    { id: 'as-1', name: 'FuturisticCoffeePromo.mp4', type: 'Video asset', status: 'synced' },
    { id: 'as-2', name: 'BrandWatermarkLogo.png', type: 'Image asset', status: 'synced' },
    { id: 'as-3', name: 'BackgroundVibeMusic.wav', type: 'Audio asset', status: 'warning' },
  ];

  const subsystems = [
    { name: 'Timeline', status: 'Optimal', load: 12 },
    { name: 'Playback', status: 'Optimal (60 FPS)', load: 8 },
    { name: 'Rendering', status: 'Active (12 shards)', load: 78 },
    { name: 'AI Suite', status: 'Optimal (0.4s response)', load: 24 },
    { name: 'Color grading', status: 'Optimal (Scopes OK)', load: 5 },
    { name: 'Audio Mix', status: 'Optimal', load: 15 },
    { name: 'Cloud Sync', status: 'Optimal (Synced)', load: 45 },
  ];

  const handleSelectNode = (node: any) => {
    setSelectedContext({
      type: node.type.includes('Video') || node.type.includes('Scene') ? 'Video Clip' : 'Audio Clip',
      id: node.id,
      name: node.name
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Tab Switchers */}
      <Box sx={{ display: 'flex', borderBottom: '1px solid #1b2f54', pb: 0.5 }}>
        <Button
          size="small"
          onClick={() => setActiveTab('cockpit')}
          sx={{
            fontSize: '0.68rem',
            color: activeTab === 'cockpit' ? '#00f0ff' : '#94a3b8',
            borderBottom: activeTab === 'cockpit' ? '1.5px solid #00f0ff' : 'none'
          }}
        >
          Mission Cockpit
        </Button>
        <Button
          size="small"
          onClick={() => setActiveTab('scene')}
          sx={{
            fontSize: '0.68rem',
            color: activeTab === 'scene' ? '#00f0ff' : '#94a3b8',
            borderBottom: activeTab === 'scene' ? '1.5px solid #00f0ff' : 'none'
          }}
        >
          Scene Graph
        </Button>
        <Button
          size="small"
          onClick={() => setActiveTab('assets')}
          sx={{
            fontSize: '0.68rem',
            color: activeTab === 'assets' ? '#00f0ff' : '#94a3b8',
            borderBottom: activeTab === 'assets' ? '1.5px solid #00f0ff' : 'none'
          }}
        >
          Asset dependencies
        </Button>
        <Button
          size="small"
          onClick={() => setActiveTab('impact')}
          sx={{
            fontSize: '0.68rem',
            color: activeTab === 'impact' ? '#00f0ff' : '#94a3b8',
            borderBottom: activeTab === 'impact' ? '1.5px solid #00f0ff' : 'none'
          }}
        >
          Impact analysis
        </Button>
      </Box>

      {/* Dynamic Graph Views rendering */}
      {activeTab === 'cockpit' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* 1. Digital Twin Cockpit Header */}
          <Box sx={{ p: 1.5, border: '2px solid #00f0ff', borderRadius: '8px', bgcolor: 'rgba(0, 240, 255, 0.05)', boxShadow: '0 0 10px rgba(0, 240, 255, 0.15)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HealthIcon sx={{ color: '#00f0ff', fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                  Mission Control Center
                </Typography>
              </Box>
              <Chip label="ONLINE" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: '#10b981', color: '#050b14', fontWeight: 'bold' }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', lineHeight: 1.3 }}>
              Timeline Engine: <Typography component="span" variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>Optimal</Typography> | Playback: <Typography component="span" variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>60 FPS (WebGL OK)</Typography><br />
              Render Workers: <Typography component="span" variant="caption" sx={{ color: '#00f0ff', fontWeight: 'bold' }}>12 active shards</Typography> | Compute: <Typography component="span" variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold' }}>$14.20 / Hr</Typography>
            </Typography>
          </Box>

          {/* 2. Subsystem health maps */}
          <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
              Subsystem Telemetry Loads
            </Typography>
            {subsystems.map((sub, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                  <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.68rem', fontWeight: 'bold' }}>{sub.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.58rem' }}>{sub.status}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={sub.load} sx={{ height: 3, borderRadius: 1, bgcolor: '#050b14', color: '#00f0ff' }} />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {activeTab === 'scene' && (
        <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.65rem' }}>
              Composition Scenes Hierarchy
            </Typography>
            <Chip label="Virtual VP" size="small" sx={{ height: 14, fontSize: '0.55rem', bgcolor: 'rgba(236,72,153,0.15)', color: '#ec4899' }} />
          </Box>
          <List sx={{ p: 0 }}>
            {sceneNodes.map(node => (
              <ListItem
                key={node.id}
                dense
                onClick={() => handleSelectNode(node)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedContext?.id === node.id ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.01)',
                  mb: 1,
                  borderRadius: '4px',
                  border: selectedContext?.id === node.id ? '1px solid #00f0ff' : '1px solid #1b2f54',
                  '&:hover': { borderColor: '#00f0ff' }
                }}
              >
                <ListItemText
                  primary={node.name}
                  secondary={node.type}
                  primaryTypographyProps={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#ffffff' }}
                  secondaryTypographyProps={{ fontSize: '0.62rem', color: '#94a3b8' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {activeTab === 'assets' && (
        <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
            Media & sequence dependencies
          </Typography>
          <List sx={{ p: 0 }}>
            {assetNodes.map(node => (
              <ListItem
                key={node.id}
                dense
                onClick={() => handleSelectNode(node)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedContext?.id === node.id ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.01)',
                  mb: 1,
                  borderRadius: '4px',
                  border: selectedContext?.id === node.id ? '1px solid #00f0ff' : '1px solid #1b2f54',
                  '&:hover': { borderColor: '#00f0ff' }
                }}
              >
                <ListItemText
                  primary={node.name}
                  secondary={`${node.type} • Status: ${node.status.toUpperCase()}`}
                  primaryTypographyProps={{ fontSize: '0.72rem', fontWeight: 'bold', color: node.status === 'warning' ? '#f59e0b' : '#ffffff' }}
                  secondaryTypographyProps={{ fontSize: '0.62rem', color: '#94a3b8' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {activeTab === 'impact' && (
        <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem', mb: 1.5, display: 'block' }}>
            Upstream & Downstream Impact
          </Typography>
          {selectedContext ? (
            <Box>
              <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 'bold', display: 'block', mb: 1, fontSize: '0.72rem' }}>
                Selected context: {selectedContext.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', lineHeight: 1.4 }}>
                Upstream Consumers: <Typography component="span" variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold' }}>Composition Viewport</Typography><br />
                Downstream Dependencies: <Typography component="span" variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold' }}>Active CDL Grading curves</Typography><br />
                SLA Render Affected: <Typography component="span" variant="caption" sx={{ color: '#ef4444', fontWeight: 'bold' }}>1 Active Render queue shard</Typography>
              </Typography>
            </Box>
          ) : (
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', textAlign: 'center', py: 2 }}>
              Select a node to evaluate upstream impact bounds.
            </Typography>
          )}
        </Box>
      )}

      {/* Integrated Live Graph Debug validation */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DebugIcon sx={{ color: '#00f0ff', fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.65rem' }}>
            Digital Twin Graph Debugger
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.62rem', lineHeight: 1.3 }}>
          Broken reference links: <Typography component="span" variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>0 links</Typography> | Circular dependency loops: <Typography component="span" variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>None</Typography><br />
          Unused resource assets: <Typography component="span" variant="caption" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>2 files detected</Typography>
        </Typography>
      </Box>
    </Box>
  );
};
export default ProductionGraph;
