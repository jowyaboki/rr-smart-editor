import React from 'react';
import { Box, Button, Typography, Tooltip } from '@mui/material';
import {
  FolderOpen as ImportIcon,
  Timeline as EditIcon,
  GraphicEq as AudioIcon,
  ColorLens as ColorIcon,
  Psychology as AIIcon,
  RateReview as ReviewIcon,
  CloudQueue as CloudIcon,
  Memory as RenderIcon
} from '@mui/icons-material';
import { useWorkflowStore } from '../../../../apps/web/src/store/useWorkflowStore';
import { DESIGN_TOKENS } from '../theme';

const STAGES = [
  { id: 'import', label: 'Import', icon: <ImportIcon style={{ fontSize: 14 }} /> },
  { id: 'editing', label: 'Edit', icon: <EditIcon style={{ fontSize: 14 }} /> },
  { id: 'audio', label: 'Audio', icon: <AudioIcon style={{ fontSize: 14 }} /> },
  { id: 'color', label: 'Color', icon: <ColorIcon style={{ fontSize: 14 }} /> },
  { id: 'ai', label: 'AI Suite', icon: <AIIcon style={{ fontSize: 14 }} /> },
  { id: 'review', label: 'Review', icon: <ReviewIcon style={{ fontSize: 14 }} /> },
  { id: 'render', label: 'Render', icon: <RenderIcon style={{ fontSize: 14 }} /> },
  { id: 'cloud', label: 'Cloud Sync', icon: <CloudIcon style={{ fontSize: 14 }} /> },
];

export const WorkflowNavigator: React.FC = () => {
  const { workspaceMode, setWorkspaceMode } = useWorkflowStore();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#0d1527',
        border: '1px solid #1b2f54',
        borderRadius: '24px',
        p: '2px',
        gap: '2px',
      }}
    >
      {STAGES.map((stage) => {
        const active = workspaceMode === stage.id;
        return (
          <Tooltip key={stage.id} title={`Activate ${stage.label} layout presets`}>
            <Button
              size="small"
              onClick={() => setWorkspaceMode(stage.id)}
              startIcon={stage.icon}
              sx={{
                borderRadius: '16px',
                px: 1.5,
                py: 0.5,
                fontSize: '0.68rem',
                minWidth: 'unset',
                textTransform: 'none',
                bgcolor: active ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                color: active ? '#00f0ff' : '#94a3b8',
                border: active ? '1.5px solid rgba(0, 240, 255, 0.4)' : '1.5px solid transparent',
                '&:hover': {
                  bgcolor: active ? 'rgba(0, 240, 255, 0.18)' : 'rgba(255,255,255,0.03)',
                  borderColor: active ? '#00f0ff' : 'transparent',
                }
              }}
            >
              {stage.label}
            </Button>
          </Tooltip>
        );
      })}
    </Box>
  );
};
export default WorkflowNavigator;
